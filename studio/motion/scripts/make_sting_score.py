"""Synthesises the Call Sheet stings' score and foley from the picture's timelines.

    python3 scripts/make_sting_score.py            # both: public/audio/sting-5s.wav, sting-2s.wav
    python3 scripts/make_sting_score.py 5s

Everything is made here in code: no samples, loops or licences. The seed is
fixed, so a timeline always gives the same file. Each sound starts on the frame
its picture event lands (src/cs/timeline-<variant>.json, the files the scene
reads), and the finished mix is written `soundDelayMs` (20 ms) behind the
picture.

The palette is a desk, not a studio: a felt piano and an upright bass, a
celesta that traces the marker's loop, and a typewriter whose margin bell is
the last note. The foley is a manual typewriter, a felt-tip marker on paper
(its friction follows the nib's real speed round the loop), and a corner of
paper folding down. 120 BPM, F major: I - vi - IV - I in the 5s, IV - I in
the 2s, so the two end the same way.
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
SR = 48_000
MARKS = json.loads((ROOT / "src/marks.json").read_text())


# ---------------------------------------------------------------- helpers

def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def note(name: str) -> float:
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6,
             "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((12 * (octave + 1) + names[pitch] - 69) / 12)


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


def cubic_bezier(x1, y1, x2, y2):
    """CSS cubic-bezier easing, as Remotion's Easing.bezier."""
    def bez(t, a, b):
        return 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3

    def ease(x):
        lo, hi = 0.0, 1.0
        for _ in range(60):
            mid = (lo + hi) / 2
            if bez(mid, x1, x2) < x:
                lo = mid
            else:
                hi = mid
        return bez((lo + hi) / 2, y1, y2)
    return ease


PEN = cubic_bezier(0.42, 0.0, 0.78, 0.88)  # the picture's pen easing in Sting.tsx


class Mix:
    def __init__(self, seconds: float, seed: int) -> None:
        self.n = int(round(seconds * SR))
        self.rng = np.random.default_rng(seed)
        self.buses = {k: (np.zeros((2, self.n)), np.zeros((2, self.n))) for k in ("music", "foley", "bell")}

    def noise(self, seconds: float) -> np.ndarray:
        return self.rng.standard_normal(int(seconds * SR))

    def add(self, bus: str, x: np.ndarray, at: float, gain=1.0, pan=0.0, send=0.0) -> None:
        start = int(round(at * SR))
        if start >= self.n or len(x) == 0:
            return
        if start < 0:
            x, start = x[-start:], 0
        x = x[: self.n - start] * gain
        ramp = min(len(x), 24)
        x[:ramp] *= np.linspace(0, 1, ramp)
        left, right = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        dry, wet = self.buses[bus]
        seg = slice(start, start + len(x))
        dry[0, seg] += x * left
        dry[1, seg] += x * right
        if send:
            wet[0, seg] += x * left * send
            wet[1, seg] += x * right * send


# ---------------------------------------------------------------- instruments

def felt_piano(m: Mix, f0: float, length=2.6, vel=0.7) -> np.ndarray:
    """An upright with felt over the hammers: soft, close, a little wooden.

    Stretched partials with a two-stage decay (the prompt sound, then the
    aftersound), the felt rolling off the top, a hammer thock and two strings
    a hair apart so the note breathes."""
    t = t_axis(length)
    out = np.zeros_like(t)
    B = 0.00035
    bright = 900 + 2600 * vel
    for detune in (-0.0006, 0.0006):
        for n in range(1, 16):
            fn = n * f0 * math.sqrt(1 + B * n * n) * (1 + detune)
            if fn > 12000:
                break
            amp = (1 / n ** 1.15) * math.exp(-fn / bright) * (0.55 + 0.45 * vel)
            slow = 2.6 * (220 / f0) ** 0.45 / (1 + 0.45 * (n - 1))
            fast = 0.22 / (1 + 0.2 * (n - 1))
            env = 0.62 * np.exp(-t / fast) + 0.38 * np.exp(-t / slow)
            out += amp * np.sin(2 * np.pi * fn * t + m.rng.uniform(0, 2 * np.pi)) * env
    thock = lowpass(m.noise(0.03), 900) * np.exp(-t_axis(0.03) / 0.006)
    out[: len(thock)] += 0.18 * vel * thock
    return fade(out * 0.5, 0.004, 0.25)


def upright(m: Mix, f0: float, length=1.1, vel=0.8) -> np.ndarray:  # noqa: E501
    """Upright bass, plucked: round, a quick bloom of finger, a soft sag in pitch."""
    t = t_axis(length)
    glide = 1 + 0.012 * np.exp(-t / 0.03)
    phase = 2 * np.pi * np.cumsum(f0 * glide) / SR
    out = np.zeros_like(t)
    for n in range(1, 9):
        out += (1 / n ** 1.5) * np.sin(n * phase) * np.exp(-t / (0.55 / (1 + 0.8 * (n - 1))))
    finger = lowpass(m.noise(0.025), 420) * np.exp(-t_axis(0.025) / 0.007)
    out[: len(finger)] += 0.35 * finger
    return fade(np.tanh(1.2 * out * vel) * 0.55, 0.003, 0.08)


def celesta(m: Mix, f0: float, length=1.6) -> np.ndarray:
    t = t_axis(length)
    out = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.75)
    out += 0.22 * np.sin(2 * np.pi * f0 * 4.0 * t) * np.exp(-t / 0.11)
    out += 0.07 * np.sin(2 * np.pi * f0 * 9.8 * t) * np.exp(-t / 0.035)
    out += 0.12 * np.sin(2 * np.pi * f0 * 2.0 * t) * np.exp(-t / 0.3)
    click = highpass(m.noise(0.004), 3000) * np.exp(-t_axis(0.004) / 0.0007)
    out[: len(click)] += 0.12 * click
    return fade(out, 0.0015, 0.2)


def margin_bell(m: Mix, f0: float, length=2.2) -> np.ndarray:
    """The typewriter's margin bell: a small cup bell, struck once."""
    t = t_axis(length)
    out = np.zeros_like(t)
    for ratio, amp, tau in [(1.0, 1.0, 1.25), (2.41, 0.42, 0.55), (4.53, 0.2, 0.22), (5.97, 0.1, 0.12), (1.003, 0.5, 1.1)]:
        out += amp * np.sin(2 * np.pi * f0 * ratio * t + m.rng.uniform(0, 6)) * np.exp(-t / tau)
    strike = bandpass(m.noise(0.006), 2500, 9000) * np.exp(-t_axis(0.006) / 0.001)
    out[: len(strike)] += 0.4 * strike
    return fade(out * 0.6, 0.0008, 0.3)


def air(m: Mix, length: float, lo=250, hi=2400) -> np.ndarray:
    """A breath of room tone that swells into a moment: no whoosh, just air."""
    n = bandpass(m.noise(length), lo, hi)
    shape = np.linspace(0, 1, len(n)) ** 2.4
    return fade(n * shape, 0.05, 0.02)


def soft_kick(m: Mix, power=0.6) -> np.ndarray:
    """A felt beater on a big drum, far away: felt more than heard."""
    t = t_axis(0.6)
    phase = 2 * np.pi * np.cumsum(48 + 40 * np.exp(-t / 0.04)) / SR
    out = np.sin(phase) * np.exp(-t / 0.28) * power
    out[: int(0.012 * SR)] += 0.08 * lowpass(m.noise(0.012), 600)
    return fade(out, 0.004, 0.1)


# ---------------------------------------------------------------- foley

def type_strike(m: Mix, heavy=1.0) -> np.ndarray:
    """One key of a manual typewriter: the slug on the platen, the body's
    thunk, the type bar falling back."""
    r = m.rng
    t = t_axis(0.16)
    slug = highpass(m.noise(0.003), 2200) * np.exp(-t_axis(0.003) / 0.0006)
    tock_f = r.uniform(1500, 2300)
    tock = bandpass(m.noise(0.05), tock_f * 0.8, tock_f * 1.25) * np.exp(-t_axis(0.05) / 0.009)
    body_f = r.uniform(140, 210)
    body = np.sin(2 * np.pi * body_f * t_axis(0.09)) * np.exp(-t_axis(0.09) / 0.022)
    body += 0.6 * lowpass(m.noise(0.09), 500) * np.exp(-t_axis(0.09) / 0.015)
    out = np.zeros_like(t)
    out[: len(slug)] += 1.2 * slug
    out[: len(tock)] += 0.9 * tock
    out[: len(body)] += 0.55 * heavy * body
    back = int(r.uniform(0.035, 0.05) * SR)
    rattle = bandpass(m.noise(0.02), 1200, 4500) * np.exp(-t_axis(0.02) / 0.004)
    out[back: back + len(rattle)] += 0.18 * rattle
    return fade(out * (0.6 + 0.4 * heavy) * r.uniform(0.85, 1.0), 0.0003, 0.02)


def ratchet(m: Mix) -> np.ndarray:
    """The line-space lever: three teeth of the platen ratchet."""
    out = np.zeros(int(0.12 * SR))
    for k, at in enumerate([0.0, 0.028, 0.055]):
        c = bandpass(m.noise(0.012), 1800, 6000) * np.exp(-t_axis(0.012) / 0.0018)
        s = int(at * SR)
        out[s: s + len(c)] += c * (1 - 0.15 * k)
    return fade(out, 0.0003, 0.01)


def marker(m: Mix, speeds: np.ndarray, rate: float) -> np.ndarray:
    """A felt tip dragged round a loop. Friction rises with the nib's speed;
    the paper's tooth roughens it; a faint squeak comes in when it's fast."""
    length = len(speeds) / rate + 0.08
    n = int(length * SR)
    tt = np.arange(n) / SR
    v = np.interp(tt, (np.arange(len(speeds)) + 0.5) / rate, speeds, right=0.0)
    v = v / (v.max() + 1e-9)
    # pen-down and lift-off
    v *= np.clip(tt / 0.012, 0, 1)
    rough = 1 + 0.9 * bandpass(m.noise(length), 40, 160) / 0.12
    rough = np.clip(rough, 0.05, 2.4)
    hiss = bandpass(m.noise(length), 1800, 5200) * 0.7 + bandpass(m.noise(length), 600, 1800) * 0.55
    hiss = lowpass(hiss, 6500)
    fric = hiss * rough * v ** 1.3
    squeak_f = 1050 + 650 * v + 40 * lowpass(m.noise(length), 8) / 0.05
    squeak = np.sin(2 * np.pi * np.cumsum(squeak_f) / SR)
    gate = np.clip((v - 0.55) / 0.3, 0, 1) * np.clip(0.5 + lowpass(m.noise(length), 14) / 0.08, 0, 1)
    out = fric + 0.09 * squeak * gate
    tap = lowpass(m.noise(0.01), 2500) * np.exp(-t_axis(0.01) / 0.002)
    out[: len(tap)] += 0.5 * tap
    return fade(out, 0.002, 0.03)


def fold_corner(m: Mix, dur: float) -> np.ndarray:
    """A page corner lifted, turned and pressed: fibres crackle as it bends,
    air moves under it, it lands, and a thumbnail runs down the crease."""
    n = int((dur + 0.45) * SR)
    out = np.zeros(n)
    tt = np.arange(n) / SR
    # crackle while it bends: sparse fibre snaps, densest at the start
    for _ in range(46):
        at = abs(m.rng.normal(0.0, dur * 0.35))
        if at > dur:
            continue
        c = bandpass(m.noise(0.006), 2500, 9000) * np.exp(-t_axis(0.006) / m.rng.uniform(0.0008, 0.002))
        s = int(at * SR)
        out[s: s + len(c)] += c * m.rng.uniform(0.15, 0.6) * (1 - at / dur) ** 0.5
    # the air under the moving flap
    w = bandpass(m.noise(dur), 300, 1800)
    env = np.sin(np.pi * np.linspace(0, 1, len(w))) ** 1.5
    out[: len(w)] += 0.55 * w * env
    # it lands
    s = int(dur * SR)
    thud = lowpass(m.noise(0.05), 900) * np.exp(-t_axis(0.05) / 0.01)
    out[s: s + len(thud)] += 0.9 * thud
    # the crease: a thumbnail along the fold
    z = bandpass(m.noise(0.16), 1500, 5500) * (1 + 0.8 * np.sin(2 * np.pi * 95 * t_axis(0.16)))
    zenv = np.sin(np.pi * np.linspace(0, 1, len(z))) * np.linspace(1, 0.5, len(z))
    s2 = int((dur + 0.07) * SR)
    out[s2: s2 + len(z)] += 0.35 * z * zenv
    return fade(out, 0.004, 0.05)


# ---------------------------------------------------------------- picture-led timing

OVERSAMPLE = 4


def nib_speeds(ring: dict, frames: int, fps: float, oversample=OVERSAMPLE) -> np.ndarray:
    """The nib's speed per sub-frame, from the pen's centre line and the
    picture's pen easing, so the friction follows the drawing exactly."""
    pts = np.array(ring["samples"])
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
    seg /= seg[-1]
    k = frames * oversample
    prog = np.array([PEN(i / k) for i in range(k + 1)])
    x = np.interp(prog, seg, pts[:, 0])
    y = np.interp(prog, seg, pts[:, 1])
    v = np.hypot(np.diff(x), np.diff(y)) * fps * oversample
    return v


def chord(m: Mix, names, at, gain, spread=0.018, vel=0.6, length=2.8, send=0.35, pan=(-0.25, 0.25)):
    for i, nm in enumerate(names):
        p = pan[0] + (pan[1] - pan[0]) * (i / max(1, len(names) - 1))
        m.add("music", felt_piano(m, note(nm), length, vel), at + i * spread, gain, pan=p, send=send)


def typed_clicks(m: Mix, text: str, start_frame: float, rate: float, fps: float, gain: float):
    """A click for each character typed() reveals, on the frame it appears."""
    seen: dict[int, int] = {}
    for i, ch in enumerate(text):
        f = start_frame + math.ceil(i / rate - 1e-9)
        within = seen.get(f, 0)  # a second key in the same frame strikes a hair later
        seen[f] = within + 1
        at = f / fps + 0.014 * within
        if ch == " ":
            continue
        m.add("foley", type_strike(m, 0.35), at, gain * m.rng.uniform(0.7, 1.0), pan=0.15 + 0.004 * i, send=0.12)


# ---------------------------------------------------------------- the cues

def cue_5s(m: Mix, F: dict, fps: float) -> None:
    fr = lambda f: f / fps
    # Beat 1: the empty form; the list starts typing. F major 9.
    m.add("music", upright(m, note("F2"), 1.6), 0.0, 0.42, send=0.1)
    chord(m, ["A3", "E4", "G4", "C5"], 0.0, 0.16, vel=0.5)
    # The typewriter is the rhythm section: a heavy strike as each date lands,
    # lighter keys as its words type.
    for i, f in enumerate(F["rows"]):
        m.add("foley", type_strike(m, 1.0), fr(f), 0.42, pan=-0.12 + 0.03 * i, send=0.12)
        for j, dt in enumerate((1.4, 2.2, 3.0)):
            if f + dt < F["rows"][-1] + 4:
                m.add("foley", type_strike(m, 0.3), fr(f + dt), 0.2 * (1 - 0.18 * j), pan=0.1, send=0.1)
    # a three-note line rising over the typing
    for nm, b in [("G4", 2.0), ("A4", 2.5), ("C5", 3.0)]:
        m.add("music", felt_piano(m, note(nm), 1.8, 0.55), (b - 1) * 0.5, 0.15, pan=0.2, send=0.4)
    # Typing done: the line-space lever, then a breath.
    m.add("foley", ratchet(m), fr(F["rows"][-1] + 3), 0.3, pan=0.2, send=0.1)
    m.add("foley", air(m, 0.42, 300, 2600), fr(F["loopStart"]) - 0.42, 0.05, send=0.2)

    # Beat 4: the marker loops the date. D minor 9; the celesta runs round
    # with the nib.
    a, b = F["loopStart"], F["loopEnd"]
    m.add("foley", marker(m, nib_speeds(MARKS["logo"]["ring"], b - a, fps), fps * OVERSAMPLE), fr(a), 0.26, pan=-0.2, send=0.14)
    m.add("music", upright(m, note("D2"), 1.3), fr(a), 0.4, send=0.1)
    chord(m, ["F3", "C4", "E4", "A4"], fr(a), 0.12, vel=0.45)
    for k, nm in enumerate(["D5", "F5", "A5", "C6", "E6"]):
        p = PEN_INV(k / 4.6)
        m.add("music", celesta(m, note(nm)), fr(a + p * (b - a)), 0.085, pan=-0.3 + 0.15 * k, send=0.5)
    # Beat 5: B-flat major 9 under the held circle; air gathers into the cut.
    m.add("music", upright(m, note("Bb1"), 1.2), fr(60), 0.4, send=0.1)
    chord(m, ["D4", "F4", "A4", "C5"], fr(60), 0.11, vel=0.4)
    m.add("foley", air(m, 0.36, 400, 3600), fr(F["cut"]) - 0.36, 0.07, send=0.25)

    # Beat 6: the cut. Home, on the logo: F major, a felt drum under it.
    c = fr(F["cut"])
    m.add("music", soft_kick(m, 0.9), c, 0.55)
    m.add("music", upright(m, note("F2"), 2.4, 0.9), c, 0.4, send=0.1)
    chord(m, ["F3", "C4", "E4", "A4", "C5"], c, 0.16, vel=0.6, length=3.5, send=0.45)
    # The corner folds down and lands on beat 7.
    e0, e1 = F["earStart"], F["earEnd"]
    m.add("foley", fold_corner(m, (e1 - e0) / fps), fr(e0), 0.5, pan=0.45, send=0.15)
    m.add("music", felt_piano(m, note("A5"), 2.0, 0.4), fr(e1), 0.09, pan=0.35, send=0.5)
    m.add("music", felt_piano(m, note("G5"), 2.0, 0.35), fr(e1 + 7.5), 0.07, pan=0.3, send=0.5)

    # Beat 8: the sign-off types; at the end of the line the margin bell.
    typed_clicks(m, "pitch.dog/call-sheet", F["url"], F["urlRate"], fps, 0.24)
    d = fr(F["ding"])
    m.add("bell", margin_bell(m, note("F6")), d, 0.2, pan=0.25, send=0.4)
    m.add("music", upright(m, note("F2"), 1.6, 0.6), d, 0.24, send=0.1)
    chord(m, ["C4", "F4", "A4", "E5", "G5"], d, 0.13, spread=0.03, vel=0.45, length=2.6, send=0.55)


def cue_2s(m: Mix, F: dict, fps: float) -> None:
    fr = lambda f: f / fps
    # Beat 1: B-flat major 9, the logo on the page; the marker goes round.
    m.add("music", upright(m, note("Bb1"), 1.2), 0.0, 0.4, send=0.1)
    chord(m, ["D4", "F4", "A4", "C5"], 0.0, 0.13, vel=0.5)
    a, b = F["loopStart"], F["loopEnd"]
    m.add("foley", marker(m, nib_speeds(MARKS["logo"]["ring"], b - a, fps), fps * OVERSAMPLE), fr(a), 0.26, pan=-0.2, send=0.14)
    for k, nm in enumerate(["D5", "F5", "A5", "C6", "E6"]):
        p = PEN_INV(k / 4.6)
        m.add("music", celesta(m, note(nm)), fr(a + p * (b - a)), 0.085, pan=-0.3 + 0.15 * k, send=0.5)
    # The corner folds and lands on beat 3: home, and the margin bell.
    e0, e1 = F["earStart"], F["earEnd"]
    m.add("foley", fold_corner(m, (e1 - e0) / fps), fr(e0), 0.5, pan=0.45, send=0.15)
    d = fr(F["ding"])
    m.add("music", soft_kick(m, 0.8), d, 0.5)
    m.add("music", upright(m, note("F2"), 1.6, 0.85), d, 0.4, send=0.1)
    chord(m, ["F3", "C4", "E4", "A4", "C5"], d, 0.15, vel=0.55, length=2.4, send=0.45)
    m.add("bell", margin_bell(m, note("F6")), d, 0.2, pan=0.25, send=0.4)
    typed_clicks(m, "pitch.dog/call-sheet", F["url"], F["urlRate"], fps, 0.16)


def PEN_INV(p: float) -> float:
    """The time (0..1) at which the pen has covered fraction p of the loop."""
    lo, hi = 0.0, 1.0
    for _ in range(50):
        mid = (lo + hi) / 2
        if PEN(mid) < p:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


# ---------------------------------------------------------------- mixdown

def reverb_ir(m: Mix, seconds=1.4, bright=5200) -> np.ndarray:
    t = t_axis(seconds)
    ir = np.zeros((2, len(t)))
    for ch in range(2):
        nz = lowpass(m.rng.standard_normal(len(t)) * np.exp(-t / (seconds / 6.9)), bright)
        nz[: int(0.010 * SR)] = 0
        ir[ch] = nz
    for at, g in [(0.011, 0.5), (0.019, 0.38), (0.031, 0.3), (0.043, 0.2)]:
        ir[0, int(at * SR)] += g
        ir[1, int((at + 0.003) * SR)] += g
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


def compress(x, threshold_db=-18, ratio=2.0):
    level = np.sqrt(signal.sosfilt(signal.butter(1, 10, fs=SR, output="sos"), np.mean(x ** 2, axis=0)) + 1e-12)
    over = np.maximum(0, 20 * np.log10(level) - threshold_db)
    return x * 10 ** (-(over - over / ratio) / 20)


def render(variant: str) -> dict:
    tl = json.loads((ROOT / f"src/cs/timeline-{variant}.json").read_text())
    fps = tl["fps"]
    seconds = tl["durationInFrames"] / fps
    m = Mix(seconds, seed=7 if variant == "5s" else 11)
    (cue_5s if variant == "5s" else cue_2s)(m, tl["frames"], fps)

    ir = reverb_ir(m)
    out = np.zeros((2, m.n))
    levels = {"music": 1.0, "foley": 1.0, "bell": 1.0}
    for name, (dry, wet) in m.buses.items():
        verb = np.stack([signal.fftconvolve(wet[ch], ir[ch])[: m.n] for ch in range(2)])
        out += levels[name] * (dry + 0.55 * verb)
    # A floor of room, so the silences are a room and not a void.
    room = np.stack([lowpass(highpass(m.noise(seconds + 0.01)[: m.n], 120), 1600) for _ in range(2)]) * 0.0016
    out += room
    out = compress(highpass(out, 32))

    delay = int(round(tl["soundDelayMs"] / 1000 * SR))
    out = np.concatenate([np.zeros((2, delay)), out[:, : m.n - delay]], axis=1)
    tail = int(0.3 * SR)
    out[:, -tail:] *= np.linspace(1, 0, tail) ** 1.6
    out = np.tanh(1.05 * out / np.max(np.abs(out))) * 0.9

    dest = ROOT / f"public/audio/sting-{variant}.wav"
    dest.parent.mkdir(parents=True, exist_ok=True)
    raw = dest.with_suffix(".raw.wav")
    wavfile.write(raw, SR, (out.T * 32767).astype(np.int16))
    target = "I=-14:TP=-1.5:LRA=11"
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"],
                           check=True, capture_output=True, text=True).stderr
    j = json.loads(probe[probe.rindex("{"): probe.rindex("}") + 1])
    measured = (f"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
                f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", f"loudnorm={target}:{measured}:linear=true",
                    "-ar", str(SR), "-c:a", "pcm_s16le", str(dest)], check=True)
    raw.unlink()
    return {"variant": variant, "file": str(dest.relative_to(ROOT)), "seconds": seconds, "input_i": j["input_i"], "input_tp": j["input_tp"]}


def main() -> None:
    variants = sys.argv[1:] or ["5s", "2s"]
    for v in variants:
        print(json.dumps(render(v)))


if __name__ == "__main__":
    main()
