"""The Call Sheet explainer's score and foley, synthesised from src/timeline.json.

    python3 scripts/make_score.py     writes public/audio/score.wav (-14 LUFS, true peak under -1 dBTP)
    python3 scripts/make_score.py --stems   also writes music.wav and foley.wav beside it, for a VO mix

Everything is generated here: a felt piano, an upright-ish bass, brushes and a
shaker, a soft pad, and the foley: typewriter keys and bell, a marker on paper,
paper sliding, folding and landing, clicks and ticks. No samples, no licences,
fixed seed. Each sound sits on the frame its picture uses (the cue list at the
bottom mirrors the timings in src/explainer/), and the whole mix is written
`soundDelayMs` behind the picture.
"""

from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
TIMELINE = json.loads((ROOT / "src/timeline.json").read_text())
OUT = ROOT / "public/audio/score.wav"

SR = 48_000
FPS = TIMELINE["fps"]
DURATION = TIMELINE["durationInFrames"] / FPS
N = int(round(DURATION * SR))
RNG = np.random.default_rng(17)
RATE = TIMELINE["typeFramesPerChar"]


def beat_frame(n: float) -> int:
    """The frame beat n lands on, rounded like Math.round in src/timeline.ts."""
    return math.floor(TIMELINE["firstBeat"] + (n - 1) * TIMELINE["framesPerBeat"] + 0.5)


def B(n: float) -> float:
    """Beat n in seconds, on its frame."""
    return beat_frame(n) / FPS


def F(frame: float) -> float:
    return frame / FPS


T = {name: beat_frame(n) for name, n in TIMELINE["events"].items()}  # frames, as the picture has them


def note(name: str) -> float:
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6,
             "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((12 * (octave + 1) + names[pitch] - 69) / 12)


# ---------------------------------------------------------------- buses

class Bus:
    def __init__(self) -> None:
        self.dry = np.zeros((2, N))
        self.verb = np.zeros((2, N))

    def add(self, x: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0, send: float = 0.0) -> None:
        start = int(round(at * SR))
        if start >= N or len(x) == 0:
            return
        if start < 0:
            x, start = x[-start:], 0
        x = x[: N - start] * gain
        ramp = min(len(x), 24)
        x[:ramp] *= np.linspace(0, 1, ramp)
        left, right = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        seg = slice(start, start + len(x))
        self.dry[0, seg] += x * left
        self.dry[1, seg] += x * right
        if send:
            self.verb[0, seg] += x * left * send
            self.verb[1, seg] += x * right * send


music, drums, foley = Bus(), Bus(), Bus()


# ---------------------------------------------------------------- blocks

def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def noise(seconds: float) -> np.ndarray:
    return RNG.standard_normal(int(seconds * SR))


def bandpass(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, min(hi, SR / 2 - 200)], btype="band", fs=SR, output="sos"), x)


def highpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def lowpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, min(f, SR / 2 - 200), btype="low", fs=SR, output="sos"), x)


def fade(x, attack=0.002, release=0.01):
    a, r = max(1, int(attack * SR)), max(1, int(release * SR))
    x = x.copy()
    x[:a] *= np.linspace(0, 1, a)
    x[-r:] *= np.linspace(1, 0, r)
    return x


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


# ---------------------------------------------------------------- instruments

def piano(f0: float, length: float = 2.6, vel: float = 0.6) -> np.ndarray:
    """A felt piano: slightly stretched partials, two strings a hair apart, a soft hammer, a closed lid."""
    t = t_axis(length)
    out = np.zeros_like(t)
    inharm = 0.00032
    for n in range(1, 14):
        fn = n * f0 * math.sqrt(1 + inharm * n * n)
        if fn > 9000:
            break
        amp = n ** -1.45 * (0.35 + 0.65 * vel) ** (0.7 * (n - 1))
        tf = 0.32 * (262 / f0) ** 0.3 / (1 + 0.4 * (n - 1))
        ts = 2.4 * (262 / f0) ** 0.45 / (1 + 0.3 * (n - 1))
        env = 0.6 * np.exp(-t / tf) + 0.4 * np.exp(-t / ts)
        out += amp * env * (np.sin(2 * np.pi * fn * t) + 0.7 * np.sin(2 * np.pi * fn * 1.0007 * t + 0.4))
    hammer = lowpass(noise(0.03), 1400) * np.exp(-t_axis(0.03) / 0.005)
    out[: len(hammer)] += 0.5 * vel * hammer
    out = lowpass(out, 1800 + 3200 * vel)
    return fade(out * (0.35 + 0.65 * vel), 0.004, 0.25)


def marimba(f0: float, length: float = 1.1, bright: float = 0.8) -> np.ndarray:
    t = t_axis(length)
    tau = 0.42 * (440 / f0) ** 0.35
    out = np.sin(2 * np.pi * f0 * t) * np.exp(-t / tau)
    out += 0.28 * bright * np.sin(2 * np.pi * f0 * 3.99 * t) * np.exp(-t / (tau * 0.22))
    out += 0.08 * bright * np.sin(2 * np.pi * f0 * 10.6 * t) * np.exp(-t / (tau * 0.07))
    mallet = lowpass(noise(0.006), 3000) * np.exp(-t_axis(0.006) / 0.0015)
    out[: len(mallet)] += 0.2 * mallet
    return fade(out, 0.0008, 0.05)


def bell(f0: float, length: float = 2.4) -> np.ndarray:
    t = t_axis(length)
    index = 2.2 * np.exp(-t / 0.4) + 0.3
    out = np.sin(2 * np.pi * f0 * t + index * np.sin(2 * np.pi * f0 * 1.4 * t))
    out += 0.3 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / 0.3)
    return fade(out * np.exp(-t / 0.9), 0.001, 0.2)


def upright(f0: float, length: float = 0.9, vel: float = 0.8) -> np.ndarray:
    """A round, plucked bass: a sine with a little second and third, a thumb thump, a tiny pitch sag."""
    t = t_axis(length)
    bend = 1 + 0.012 * np.exp(-t / 0.025)
    ph = 2 * np.pi * np.cumsum(f0 * bend) / SR
    env = np.exp(-t / 0.42) * (1 - np.exp(-t / 0.003))
    out = np.sin(ph) + 0.4 * np.sin(2 * ph) * np.exp(-t / 0.18) + 0.16 * np.sin(3 * ph) * np.exp(-t / 0.08)
    thump = lowpass(noise(0.03), 260) * np.exp(-t_axis(0.03) / 0.007)
    out[: len(thump)] += 0.4 * thump
    return fade(np.tanh(1.3 * out * env) * vel, 0.002, 0.08)


def pad(freqs: list[float], length: float, attack: float = 0.8, release: float = 1.4) -> np.ndarray:
    """A soft, breathing chord: detuned sines with a few harmonics, slow in and out."""
    t = t_axis(length)
    out = np.zeros_like(t)
    for f in freqs:
        for d in (-1.0, 0.0, 1.1):
            vib = 1 + 0.0018 * np.sin(2 * np.pi * (4.6 + 0.3 * d) * t + RNG.uniform(0, 6.28))
            ph = 2 * np.pi * np.cumsum(f * (1 + d * 0.0024) * vib) / SR
            out += np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.07 * np.sin(3 * ph)
    env = np.minimum(1, t / attack) * np.minimum(1, (length - t) / release).clip(0, 1)
    return lowpass(out * env, 1900) / (3 * len(freqs))


def kick(power: float = 0.8) -> np.ndarray:
    t = t_axis(0.45)
    phase = 2 * np.pi * np.cumsum(62 + 90 * np.exp(-t / 0.028)) / SR
    out = np.sin(phase) * np.exp(-t / (0.2 * power))
    return highpass(lowpass(np.tanh(1.4 * out), 1400), 40)


def brush(length: float = 0.32) -> np.ndarray:
    """A brush on a snare: a swish of filtered noise and a little drum body."""
    t = t_axis(length)
    n = bandpass(noise(length), 900, 7000) * (np.exp(-t / 0.085) * (1 - np.exp(-t / 0.004)))
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.04)
    return 0.8 * n + 0.25 * body


def shaker(accent: float = 1.0) -> np.ndarray:
    t = t_axis(0.11)
    env = (1 - np.exp(-t / 0.012)) * np.exp(-t / 0.035)
    return highpass(noise(0.11), 4200, 3) * env * accent


def swell(length: float) -> np.ndarray:
    """A soft cymbal-ish swell of filtered noise, for the page that changes colour."""
    t = t_axis(length)
    return highpass(noise(length), 3500) * (t / length) ** 2.4 * np.exp(-np.maximum(0, t - length * 0.92) / 0.05)


# ---------------------------------------------------------------- foley

def type_key(v: float = 1.0) -> np.ndarray:
    """One typewriter key: the type bar's click, the platen's knock and a little metal."""
    t = t_axis(0.09)
    click = bandpass(noise(0.09), 1800, 6500) * np.exp(-t / 0.005)
    knock = bandpass(noise(0.09), 180, 700) * np.exp(-t / 0.018)
    ring = np.sin(2 * np.pi * RNG.uniform(2900, 3400) * t) * np.exp(-t / 0.012)
    return (0.9 * click + 0.7 * knock + 0.12 * ring) * v * RNG.uniform(0.75, 1.0)


def type_bell() -> np.ndarray:
    t = t_axis(1.6)
    f = 2280
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55)
    out += 0.45 * np.sin(2 * np.pi * f * 2.71 * t) * np.exp(-t / 0.22)
    out += 0.25 * np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-t / 0.3)
    strike = highpass(noise(0.01), 3000) * np.exp(-t_axis(0.01) / 0.002)
    out[: len(strike)] += 0.3 * strike
    return fade(out, 0.0005, 0.1)


def marker(dur: float, squeak: float = 0.35) -> np.ndarray:
    """A felt tip on paper: rough filtered noise that follows the pen's speed, with a faint squeak."""
    n = int(dur * SR)
    t = np.arange(n) / n
    speed = np.sin(np.pi * np.clip(t * 1.05, 0, 1)) ** 0.7 * (0.75 + 0.25 * np.sin(2 * np.pi * 2.2 * t))
    rough = 1 + 0.6 * lowpass(RNG.standard_normal(n), 60)
    hiss = bandpass(RNG.standard_normal(n), 700, 4200) * speed * rough
    f_sq = 1550 + 500 * speed
    sq = np.sin(2 * np.pi * np.cumsum(f_sq) / SR) * speed ** 2 * (0.5 + 0.5 * lowpass(RNG.standard_normal(n), 20))
    out = norm(hiss) + squeak * sq * 0.5
    return fade(out, 0.004, 0.02)


def paper_slide(dur: float) -> np.ndarray:
    """A sheet sliding across paper: a soft rising hush with paper grain in it, cut where it lands."""
    n = int(dur * SR)
    t = np.arange(n) / n
    grain = 1 + 0.5 * lowpass(RNG.standard_normal(n), 120)
    out = bandpass(RNG.standard_normal(n), 350, 5200) * grain * (t ** 1.6) * (1 - np.exp(-(1 - t) * 40))
    return fade(norm(out), 0.02, 0.006)


def paper_land() -> np.ndarray:
    t = t_axis(0.12)
    thump = lowpass(noise(0.12), 240) * np.exp(-t / 0.03)
    flap = bandpass(noise(0.12), 900, 3500) * np.exp(-t / 0.012)
    return 0.9 * norm(thump) + 0.35 * norm(flap)


def fold(dur: float) -> np.ndarray:
    """A page corner folding: crackles of fibre, a crease, a soft press."""
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(int(dur * 120)):
        at = int(RNG.beta(2, 2.2) * (n - 600))
        k = bandpass(RNG.standard_normal(400), 1500, 7000) * np.exp(-np.arange(400) / RNG.uniform(30, 90))
        out[at:at + 400] += k * RNG.uniform(0.3, 1.0)
    t = np.arange(n) / n
    out += 0.6 * bandpass(RNG.standard_normal(n), 400, 2500) * np.sin(np.pi * t) ** 2
    press = lowpass(RNG.standard_normal(int(0.05 * SR)), 300) * np.exp(-np.arange(int(0.05 * SR)) / (0.012 * SR))
    out[-len(press):] += 0.8 * press
    return fade(norm(out), 0.003, 0.01)


def click(v: float = 1.0) -> np.ndarray:
    t = t_axis(0.05)
    out = bandpass(noise(0.05), 1500, 5000) * np.exp(-t / 0.004) + 0.5 * np.sin(2 * np.pi * 260 * t) * np.exp(-t / 0.012)
    return out * v


def pen_tick() -> np.ndarray:
    """Two quick strokes of the marker: the short one down, the long one up."""
    a, b = marker(0.07, 0.2), marker(0.16, 0.4)
    gap = np.zeros(int(0.025 * SR))
    return np.concatenate([a * 0.8, gap, b])


# ---------------------------------------------------------------- the cue

def chord(names: str) -> list[float]:
    return [note(x) for x in names.split()]


def comp(at: float, names: str, vel: float = 0.42, spread: float = 0.012, gain: float = 0.16) -> None:
    for i, f in enumerate(chord(names)):
        music.add(piano(f, 2.4, vel), at + i * spread, gain, pan=-0.25 + 0.5 * i / max(1, len(names.split()) - 1), send=0.35)


def melody(notes: list[tuple[float, str, float]], gain: float = 0.27, pan: float = 0.15, vel: float = 0.55) -> None:
    for b, n, length in notes:
        music.add(piano(note(n), max(1.2, length * 0.6 + 0.8), vel), B(b), gain, pan=pan, send=0.4)


def wood(v: float = 1.0) -> np.ndarray:
    """A soft wooden tick, like a clock: a short resonant knock."""
    t = t_axis(0.08)
    return (np.sin(2 * np.pi * 1250 * t) * np.exp(-t / 0.012) + 0.4 * bandpass(noise(0.08), 1500, 4000) * np.exp(-t / 0.004)) * v


def score() -> list[float]:
    kicks: list[float] = []

    # ---- the question (beats 1-4): are you looking for funding? The piano's first phrase,
    # left open on a C7 so it asks.
    music.add(pad(chord("F3 A3 C4"), B(3) - B(1) + 0.9, 0.5, 0.5), B(1) - 0.25, 0.09, send=0.3)
    music.add(pad(chord("F3 Bb3 D4"), B(4) - B(3) + 0.5, 0.3, 0.4), B(3), 0.08, send=0.3)
    music.add(pad(chord("E3 G3 Bb3 C4"), B(5) - B(4) + 0.3, 0.3, 0.5), B(4), 0.08, send=0.3)
    comp(B(1), "F2 C3 A3", 0.36)
    comp(B(3), "Bb1 F2 D3", 0.32)
    comp(B(4), "C2 G2 Bb2 E3", 0.34)
    melody([(1, "C5", 1), (1.5, "F5", 0.5), (2, "E5", 0.5), (2.5, "F5", 0.5), (3, "A5", 1), (4, "G5", 1)], vel=0.5)

    # ---- the perfect opportunity (beats 5-12): the answer climbs, home in F... then the sigh, closed.
    music.add(pad(chord("F3 A3 C4 E4"), B(9) - B(5) + 0.2, 0.3, 0.6), B(5) - 0.1, 0.10, send=0.3)
    comp(B(5), "F2 C3 A3", 0.4)
    melody([(5, "F5", 0.5), (5.5, "A5", 0.5), (6, "C6", 1), (7, "Bb5", 0.5), (7.5, "A5", 0.5), (8, "F5", 0.5), (8.5, "G5", 0.5)])
    comp(B(9), "Db2 Ab2 F3 C4", 0.38)
    music.add(pad(chord("Db3 F3 Ab3 C4"), 1.5, 0.15, 0.7), B(9), 0.09, send=0.3)
    melody([(9.5, "Ab4", 0.5), (10, "G4", 1)], gain=0.2, vel=0.45)
    comp(B(11), "Bb1 F2 D3 A3", 0.34)
    comp(B(12), "A1 E2 C#3 G3", 0.36)

    # ---- the problems (beats 13-40): D minor, a clock that won't stop ticking.
    probs = {13: "Dm", 15: "Dm/C", 17: "Bbmaj7", 19: "Gm7", 21: "Dm", 23: "Bb", 25: "C", 27: "Dm", 29: "Gm7",
             31: "Bb", 33: "A7sus", 34: "Dm", 36: "Bbmaj7", 38: "Gm7", 39.5: "C7sus"}
    pv = {"Dm": ("D2", "F3 A3 D4"), "Dm/C": ("C2", "F3 A3 D4"), "Bbmaj7": ("Bb1", "F3 A3 D4"), "Gm7": ("G1", "F3 Bb3 D4"),
          "Bb": ("Bb1", "F3 Bb3 D4"), "C": ("C2", "E3 G3 C4"), "A7sus": ("A1", "G3 D4 E4"), "C7sus": ("C2", "F3 Bb3 C4")}
    keys = sorted(probs)
    for i, b in enumerate(keys):
        end = keys[i + 1] if i + 1 < len(keys) else 41
        root, upper = pv[probs[b]]
        music.add(upright(note(root), 1.0, 0.7), B(b), 0.2)
        comp(B(b), upper, 0.3, 0.02, 0.09)
        music.add(pad(chord(upper), F(beat_frame(end)) - B(b) + 0.4, 0.25, 0.5), B(b), 0.05, send=0.3)
    # The pulse: a muted D on every eighth, a wooden tick on the off-beats, a kick from the fine print on.
    b = 13.0
    while b < 40.75:
        music.add(piano(note("D3"), 0.5, 0.25) * np.exp(-t_axis(0.5) / 0.12)[: int(0.5 * SR)], B(b), 0.07, pan=-0.2)
        if b % 1:
            drums.add(wood(0.8 if b < 27 else 1.0), B(b), 0.05, pan=0.3, send=0.15)
        if b >= 19 and (b - 1) % 4 == 0:
            drums.add(kick(0.6), B(b), 0.2)
            kicks.append(B(b))
        if b >= 27 and (b - 1) % 2 == 1:
            drums.add(brush(), B(b), 0.12, pan=0.1, send=0.2)
        b += 0.5
    melody([(21, "A4", 1), (22, "F4", 1), (23, "D5", 1.5), (25, "C5", 1), (26, "E4", 1)], gain=0.16, vel=0.38, pan=0.2)
    drums.add(swell(B(41) - B(39.5)), B(39.5), 0.06, send=0.3)

    # ---- the turn, and the fixes (beats 41-80): F major, the band comes in.
    prog = {41: "F", 45: "Am7", 49: "Dm7", 53: "Bbmaj7", 57: "F", 61: "Am7", 65: "Gm7", 69: "C7sus",
            73: "F", 77: "Am7", 79: "D7sus"}
    voicing = {"F": ("F2", "F3 A3 C4 E4"), "Am7": ("A1", "G3 C4 E4"), "Dm7": ("D2", "F3 A3 C4"),
               "Bbmaj7": ("Bb1", "F3 A3 D4"), "Gm7": ("G1", "F3 Bb3 D4"), "C7sus": ("C2", "F3 Bb3 C4"),
               "D7sus": ("D2", "G3 C4 E4")}
    comp(B(41), "F1 C3 A3 E4 G4", 0.55, 0.02, 0.17)
    bars = sorted(prog)
    for i, b in enumerate(bars):
        end = bars[i + 1] if i + 1 < len(bars) else 81
        root, upper = voicing[prog[b]]
        r = note(root)
        for off, f, v in [(0, r, 0.95), (2, r * 1.5 if prog[b] != "Bbmaj7" else r * 2, 0.75), (3.5, r * 2, 0.45)]:
            if b + off < end:
                music.add(upright(f, 0.8, v), B(b + off), 0.22)
        for off in (0.5, 2.5):
            if b + off < end:
                comp(B(b + off), upper, 0.34, 0.008, 0.11)
        music.add(pad(chord(upper), F(beat_frame(end)) - B(b) + 0.4, 0.3, 0.5), B(b), 0.05, send=0.3)

    def groove(b0: float, b1: float) -> None:
        b = b0
        while b < b1 - 1e-6:
            pos = (b - 1) % 4
            if pos in (0, 2):
                drums.add(kick(0.7), B(b), 0.26)
                kicks.append(B(b))
            if pos in (1, 3):
                drums.add(brush(), B(b), 0.2, pan=0.1, send=0.25)
            drums.add(shaker(1.0 if (b * 2) % 2 == 0 else 0.6), B(b) + (0.018 if (b * 2) % 2 else 0), 0.07, pan=0.35)
            b += 0.5

    groove(41, 80.5)
    melody([(42.5, "A4", 0.5), (43, "C5", 0.5), (43.5, "F5", 1), (44.5, "E5", 0.5), (45, "C5", 1),
            (46.5, "E5", 0.5), (47, "G5", 1)], gain=0.2, vel=0.42, pan=0.2)
    melody([(74.5, "C5", 0.5), (75, "E5", 0.5), (75.5, "A5", 1.5), (77.5, "F5", 0.5), (78, "A5", 0.5), (78.5, "C6", 1)],
           gain=0.17, vel=0.4, pan=-0.2)
    # Each problem ticked off gets a chime, a step higher every time.
    for key, n in (("f1Tick", "F5"), ("f2Tick", "G5"), ("f3Tick", "A5"), ("f4Tick", "C6"), ("f5bTick", "D6")):
        music.add(marimba(note(n)), F(T[key] + 5), 0.16, pan=-0.3, send=0.35)
        music.add(bell(note(n) * 2), F(T[key] + 5), 0.025, pan=-0.3, send=0.5)
    for at, n in ((T["f2Place"], "C5"), (T["f2Doc"], "E5")):
        music.add(marimba(note(n)), F(at), 0.18, pan=0.2, send=0.3)
    for at, n in ((T["f5aFold1"], "A4"), (T["f5aFold2"], "C5"), (T["f5aFold3"], "F5")):
        music.add(marimba(note(n)), F(at + 6), 0.15, pan=-0.2, send=0.3)
    music.add(bell(note("G5")), F(T["f5bWeek"]), 0.06, pan=0.25, send=0.5)
    music.add(bell(note("A5")), F(T["f5bDay"]), 0.06, pan=0.3, send=0.5)

    # ---- new pages (beats 81-86): up a whole step, to G.
    drums.add(swell(B(81) - B(80.25)), B(80.25), 0.09, send=0.3)
    comp(B(81), "G1 D3 B3 F#4 A4", 0.55, 0.018, 0.17)
    music.add(pad(chord("G3 B3 D4 F#4 A4"), B(85) - B(81) + 0.5, 0.2, 0.6), B(81), 0.1, send=0.4)
    comp(B(85), "E2 B2 G3 D4", 0.45)
    music.add(pad(chord("G3 B3 D4 E4"), B(87) - B(85) + 0.6, 0.3, 0.8), B(85), 0.09, send=0.4)
    melody([(82, "B4", 0.5), (82.5, "D5", 0.5), (83, "F#5", 1), (84, "E5", 1), (85, "D5", 1), (86, "B4", 1)], gain=0.19, vel=0.5)
    for b, n in ((81, "G1"), (83, "D2"), (85, "E2")):
        music.add(upright(note(n), 0.9, 0.85), B(b), 0.22)
    groove(81, 86.5)
    drums.add(kick(0.9), B(81), 0.32)
    kicks.append(B(81))

    # ---- pitch.dog (beats 87-93): the band steps back; piano and pad.
    for b, c, bass_n, length in ((87, "E3 G3 B3 D4", "C2", 2), (89, "D3 F#3 A3 C#4", "B1", 2), (91, "C3 E3 G3 B3", "A1", 2), (93, "C3 D3 G3 A3", "D2", 1)):
        comp(B(b), c, 0.32, 0.03, 0.12)
        music.add(upright(note(bass_n), 1.4, 0.6), B(b), 0.16)
        music.add(pad(chord(c), B(b + length) - B(b) + 0.6, 0.4, 0.7), B(b), 0.08, send=0.4)
    melody([(88, "G4", 1), (89, "F#4", 0.5), (89.5, "E4", 0.5), (90, "D4", 1), (91.5, "E4", 0.5), (92, "G4", 1)], gain=0.17, vel=0.42, pan=-0.1)

    # ---- find the one that's yours (beats 94-98): a lift toward home.
    for b, c, bass_n in ((94, "E3 G3 B3 D4", "E2"), (96, "E3 G3 B3 C4", "C2"), (98, "D3 F#3 A3 C4", "D2")):
        comp(B(b), c, 0.38, 0.02, 0.13)
        music.add(upright(note(bass_n), 1.2, 0.7), B(b), 0.18)
        music.add(pad(chord(c), 1.6, 0.3, 0.6), B(b), 0.08, send=0.4)
    melody([(94.5, "B4", 0.5), (95, "D5", 1), (96.5, "E5", 0.5), (97, "G5", 1), (98, "F#5", 1)], gain=0.18, vel=0.45)

    # ---- the end card (beat 99 on): home in G, the loop, a bell, and let it ring.
    comp(B(99), "G1 D2 B2 F#3 A3 D4", 0.5, 0.03, 0.16)
    music.add(pad(chord("G3 B3 D4 F#4 A4"), DURATION - B(99), 0.5, 2.0), B(99), 0.11, send=0.5)
    melody([(101, "D5", 0.5), (101.5, "F#5", 0.5), (102, "A5", 2), (104, "G5", 3)], gain=0.17, vel=0.45)
    music.add(bell(note("D6")), F(T["endLoop"] + 19), 0.07, pan=0.2, send=0.6)
    drums.add(kick(0.7), B(99), 0.2)
    return kicks


def foley_cues() -> None:
    """Every sound the picture makes, on its frame. Offsets mirror src/explainer/Explainer.tsx."""
    fx = foley

    def slide_in(land: int, dur_frames: int = 12, gain: float = 0.06) -> None:
        fx.add(paper_slide(F(dur_frames)), F(land - dur_frames), gain, pan=0.1, send=0.1)
        fx.add(paper_land(), F(land), gain * 1.6, send=0.05)

    def sheet(land: int, gain: float = 0.07) -> None:
        fx.add(paper_slide(F(16)), F(land - 16), gain, pan=-0.05, send=0.15)
        fx.add(paper_land(), F(land), gain * 1.4, send=0.08)

    def typed(at: int, text: str, gain: float = 0.075) -> None:
        for i, ch in enumerate(text):
            if ch not in " ·":
                fx.add(type_key(), F(at + i * RATE), gain, pan=-0.2 + 0.4 * i / max(1, len(text)))

    def loop_drawn(at: int, dur: int = 16, gain: float = 0.12) -> None:
        fx.add(marker(F(dur) + 0.04), F(at), gain, pan=0.15, send=0.08)

    def ticked(at: int) -> None:
        fx.add(pen_tick(), F(at), 0.12, pan=-0.25)

    for key, lab in TIMELINE["labels"].items():
        typed(beat_frame(lab["at"]), lab["text"])

    # the question is typed (its label, above); then the perfect opportunity's page and slip
    sheet(T["o"])
    slide_in(T["o"] + 2, 8, 0.07)
    loop_drawn(T["oLoop"])
    for i in range(3):
        fx.add(type_key(), F(T["oClosed"] - 6 + i * 2), 0.06)
    fx.add(type_bell(), F(T["oClosed"]), 0.06, pan=0.3, send=0.25)
    fx.add(paper_slide(F(16)), F(T["oDroop"]), 0.03)

    # 1. grants are scattered: slips land one after another (each lands 5 frames after it starts).
    sheet(T["p1"])
    for i in range(46):
        fx.add(paper_land(), F(T["p1Tabs"] + i * 1.05 + 5), 0.035 + 0.01 * RNG.random(), pan=RNG.uniform(-0.5, 0.5))
    # 2. the fine print: eight quick flips, then page 9, the page that matters
    sheet(T["p2"])
    for i in range(8):
        fx.add(paper_slide(F(5)), F(T["p2Flip"] + i * 3 - 5), 0.05, pan=0.3)
    slide_in(T["p2Nine"], 5, 0.08)
    loop_drawn(T["p2Loop"])
    # 3. time zones
    sheet(T["p3"])
    fx.add(type_key(1.3), F(T["p3"] + 4), 0.09)
    fx.add(type_key(1.3), F(T["p3Box2"]), 0.09)
    loop_drawn(T["p3Loop"])
    # 4. hidden fees: four rows of "Not published", typed
    sheet(T["p4"])
    for i in range(4):
        fx.add(type_key(1.2), F(T["p4Rows"] + i * 6), 0.09)
        fx.add(type_key(0.8), F(T["p4Rows"] + i * 6 + 2), 0.06)

    # the fixes
    sheet(T["f1"])
    ticked(T["f1Tick"])
    for i in range(4):
        fx.add(type_key(1.2), F(T["f1Rows"] + i * 8), 0.1)
    sheet(T["f2"])
    slide_in(T["f2"] + 2)
    ticked(T["f2Tick"])
    for key in ("f2Place", "f2Doc"):
        fx.add(click(), F(T[key] - 1), 0.12, pan=0.1)
    loop_drawn(T["f2Loop"])
    sheet(T["f3"])
    slide_in(T["f3"] + 2)
    ticked(T["f3Tick"])
    loop_drawn(T["f3Loop"])
    sheet(T["f4"])
    slide_in(T["f4"] + 2)
    ticked(T["f4Tick"])
    loop_drawn(T["f4Loop"])
    sheet(T["f5a"])
    for d in (1, 4, 7):
        slide_in(T["f5a"] + d, 12, 0.05)
    for key in ("f5aFold1", "f5aFold2", "f5aFold3"):
        fx.add(fold(F(11)), F(T[key]), 0.09, pan=0.25, send=0.05)
        fx.add(click(0.7), F(T[key] + 5), 0.08, pan=0.25)
    fx.add(paper_slide(F(10)), F(T["f5aBar"] - 10), 0.04)
    fx.add(click(0.6), F(T["f5aBar"]), 0.06)
    sheet(T["f5b"])
    slide_in(T["f5b"] + 1)
    fx.add(click(1.1), F(T["f5bPress"]), 0.14)
    slide_in(T["f5bCal"], 12, 0.09)
    fx.add(click(0.5), F(T["f5bLoop"]), 0.07, pan=0.2)  # the deadline inks in, calendar-style
    ticked(T["f5bTick"])
    sheet(T["f5c"], 0.06)
    slide_in(T["f5c"] + 2)
    slide_in(T["f5cNew"])

    # pitch.dog, the call to action, the end card
    sheet(T["pd"])
    fx.add(fold(F(12)), F(T["pdEar"]), 0.08, pan=0.4, send=0.1)
    sheet(T["cta"])
    loop_drawn(T["ctaLoop"])
    sheet(T["end"])
    loop_drawn(T["endLoop"], 20, 0.13)


# ---------------------------------------------------------------- mixdown

def reverb_ir(seconds: float = 1.8) -> np.ndarray:
    t = t_axis(seconds)
    ir = np.zeros((2, len(t)))
    for ch in range(2):
        n = lowpass(RNG.standard_normal(len(t)) * np.exp(-t / (seconds / 6.9)), 5200)
        n[: int(0.014 * SR)] = 0
        ir[ch] = n
    for at, gain in [(0.011, 0.5), (0.019, 0.4), (0.031, 0.3), (0.043, 0.2)]:
        ir[0, int(at * SR)] += gain
        ir[1, int((at + 0.004) * SR)] += gain
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


def sidechain(x: np.ndarray, kicks: list[float], depth: float = 0.14) -> np.ndarray:
    gain = np.ones(N)
    for at in kicks:
        s = int(at * SR)
        k = np.arange(N - s) / SR
        gain[s:] *= 1 - depth * np.exp(-k / 0.12) * (1 - np.exp(-k / 0.005))
    return x * gain


def compress(x: np.ndarray, threshold_db: float = -18, ratio: float = 2.0) -> np.ndarray:
    level = np.sqrt(signal.sosfilt(signal.butter(1, 10, fs=SR, output="sos"), np.mean(x ** 2, axis=0)) + 1e-12)
    over = np.maximum(0, 20 * np.log10(level) - threshold_db)
    return x * 10 ** (-(over - over / ratio) / 20)


def loudnorm(raw: Path, out: Path, target: str = "I=-14:TP=-1.5:LRA=11") -> dict:
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"],
                           check=True, capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    measured = (f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
                f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", f"loudnorm={target}:{measured}:linear=true",
                    "-ar", str(SR), "-c:a", "pcm_s24le", str(out)], check=True)
    return m


def main() -> None:
    kicks = score()
    foley_cues()
    ir = reverb_ir()

    def wet(bus: Bus) -> np.ndarray:
        return np.stack([signal.fftconvolve(bus.verb[ch], ir[ch])[:N] for ch in range(2)])

    music_mix = sidechain(music.dry + 0.55 * wet(music), kicks)
    drum_mix = drums.dry + 0.4 * wet(drums)
    foley_mix = foley.dry + 0.35 * wet(foley)
    bed = compress(highpass(music_mix + drum_mix, 45))
    foley_mix = 2.5 * highpass(foley_mix, 60)
    mix = bed + foley_mix

    delay = int(round(TIMELINE["soundDelayMs"] / 1000 * SR))
    shift = lambda x: np.concatenate([np.zeros((2, delay)), x[:, : N - delay]], axis=1)  # noqa: E731
    mix, bed, foley_mix = shift(mix), shift(bed), shift(foley_mix)
    tail = int(0.6 * SR)
    for x in (mix, bed, foley_mix):
        x[:, -tail:] *= np.linspace(1, 0, tail) ** 1.5
    peak = np.max(np.abs(mix))
    soft = lambda x: np.tanh(1.05 * x / peak) * 0.85  # noqa: E731

    OUT.parent.mkdir(parents=True, exist_ok=True)
    raw = OUT.with_suffix(".raw.wav")
    wavfile.write(raw, SR, soft(mix).T.astype(np.float32))
    m = loudnorm(raw, OUT)
    raw.unlink()
    if "--stems" in sys.argv:
        # The bed (music and drums) and the foley, at the gain the full mix got, so they
        # sum back to score.wav (less its gentle limiting). scripts/mix_vo.sh uses them.
        gain = 1.05 / peak * 0.85 * 10 ** ((-14 - float(m["input_i"])) / 20)
        for name, x in (("music", bed), ("foley", foley_mix)):
            wavfile.write(OUT.with_name(f"{name}.wav"), SR, (x * gain).T.astype(np.float32))
    print(f"Wrote {OUT.relative_to(ROOT)} ({DURATION:.2f}s, {TIMELINE['soundDelayMs']} ms behind picture); input was {m['input_i']} LUFS")


if __name__ == "__main__":
    sys.exit(main())
