"""Synthesises the score from src/timeline.json, the file the picture reads.

Every sound is generated in code, so there are no samples, loops or music
licences to clear, and the seed is fixed, so a timeline always renders the same
file. Each hit lands on its event's frame, and the finished mix is written
`soundDelayMs` (20 ms) behind the picture: light arrives before sound in life,
and a cut a hair ahead of its note reads as on it.

    python3 -m pip install -r scripts/requirements.txt
    npm run score          # writes public/audio/score.wav, -14 LUFS (needs ffmpeg)

Write your own cue in `score()`: place sounds at EV["event"] for named events
and at beat(n) for the grid in between.
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
BEAT = TIMELINE["framesPerBeat"] / FPS  # seconds per beat
RNG = np.random.default_rng(7)


def beat(n: float) -> float:
    """The time of beat n in seconds. Beats count from 1; 2.5 is the and-of-2."""
    return (TIMELINE["firstBeat"] + (n - 1) * TIMELINE["framesPerBeat"]) / FPS


def beat_frame(n: float) -> int:
    """The frame beat n lands on, rounded half up like Math.round in timeline.ts."""
    return math.floor(TIMELINE["firstBeat"] + (n - 1) * TIMELINE["framesPerBeat"] + 0.5)


# Each event's time in seconds, on the frame the picture puts it.
EV = {name: beat_frame(n) / FPS for name, n in TIMELINE["events"].items()}


def note(name: str) -> float:
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6,
             "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((12 * (octave + 1) + names[pitch] - 69) / 12)


# ---------------------------------------------------------------- mix buses

class Bus:
    def __init__(self) -> None:
        self.dry = np.zeros((2, N))
        self.verb = np.zeros((2, N))

    def add(self, x: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0, send: float = 0.0) -> None:
        start = int(round(at * SR))
        if start >= N:
            return
        x = x[: N - start] * gain
        ramp = min(len(x), 24)  # half a millisecond, so no hit starts with a step
        x[:ramp] *= np.linspace(0, 1, ramp)
        left, right = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        seg = slice(start, start + len(x))
        self.dry[0, seg] += x * left
        self.dry[1, seg] += x * right
        if send:
            self.verb[0, seg] += x * left * send
            self.verb[1, seg] += x * right * send


music, drums, sfx = Bus(), Bus(), Bus()


# ---------------------------------------------------------------- building blocks

def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def noise(seconds: float) -> np.ndarray:
    return RNG.standard_normal(int(seconds * SR))


def bandpass(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def highpass(x: np.ndarray, f: float, order: int = 2) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def lowpass(x: np.ndarray, f: float, order: int = 2) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def fade(x: np.ndarray, attack: float = 0.002, release: float = 0.01) -> np.ndarray:
    a, r = max(1, int(attack * SR)), max(1, int(release * SR))
    x = x.copy()
    x[:a] *= np.linspace(0, 1, a)
    x[-r:] *= np.linspace(1, 0, r)
    return x


# ---------------------------------------------------------------- instruments

def marimba(f0: float, length: float = 1.2, bright: float = 1.0) -> np.ndarray:
    """Modal bar: tuned partials at roughly 1 : 4 : 10, plus a soft mallet."""
    t = t_axis(length)
    tau = 0.42 * (440 / f0) ** 0.35
    out = np.sin(2 * np.pi * f0 * t) * np.exp(-t / tau)
    out += 0.32 * bright * np.sin(2 * np.pi * f0 * 3.99 * t) * np.exp(-t / (tau * 0.22))
    out += 0.09 * bright * np.sin(2 * np.pi * f0 * 10.6 * t) * np.exp(-t / (tau * 0.07))
    out += 0.12 * np.sin(2 * np.pi * f0 * 2 * t) * np.exp(-t / (tau * 0.5))
    mallet = lowpass(noise(0.006), 3500) * np.exp(-t_axis(0.006) / 0.0015)
    out[: len(mallet)] += 0.25 * mallet
    return fade(out, 0.0008, 0.05)


def epiano(f0: float, length: float = 1.6, velocity: float = 1.0) -> np.ndarray:
    """Two-operator FM, the classic tine-piano recipe."""
    t = t_axis(length)
    index = (0.6 + 2.2 * velocity) * np.exp(-t / 0.25) + 0.15
    out = np.sin(2 * np.pi * f0 * t + index * np.sin(2 * np.pi * f0 * t))
    out += 0.25 * np.sin(2 * np.pi * f0 * 14 * t) * np.exp(-t / 0.012)  # tine ping
    return fade(out * np.exp(-t / (0.9 * (261 / f0) ** 0.25)), 0.002, 0.08)


def bell(f0: float, length: float = 2.6) -> np.ndarray:
    t = t_axis(length)
    index = 3.2 * np.exp(-t / 0.5) + 0.4
    out = np.sin(2 * np.pi * f0 * t + index * np.sin(2 * np.pi * f0 * 1.4 * t))
    out += 0.35 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / 0.35)
    out += 0.2 * np.sin(2 * np.pi * f0 * 5.4 * t) * np.exp(-t / 0.15)
    return fade(out * np.exp(-t / 1.1), 0.001, 0.2)


def bass(f0: float, length: float = 0.42, open_: float = 1.0) -> np.ndarray:
    """Round synth bass: a saw through a closing low-pass, over a sine sub."""
    t = t_axis(length)
    saw = signal.sawtooth(2 * np.pi * f0 * t)
    coef = 1 - np.exp(-2 * np.pi * (280 + 1600 * open_ * np.exp(-t / 0.05)) / SR)
    y, acc = np.zeros_like(saw), 0.0
    for i in range(len(saw)):  # a one-pole filter whose cutoff moves
        acc += coef[i] * (saw[i] - acc)
        y[i] = acc
    out = (0.55 * y + 0.8 * np.sin(2 * np.pi * f0 * t)) * np.exp(-t / 0.28)
    return fade(np.tanh(1.4 * out), 0.003, 0.04)


def kick(power: float = 1.0) -> np.ndarray:
    t = t_axis(0.5)
    phase = 2 * np.pi * np.cumsum(46 + 110 * np.exp(-t / 0.035)) / SR
    out = np.sin(phase) * np.exp(-t / (0.22 * power))
    click = highpass(noise(0.004), 2000) * np.exp(-t_axis(0.004) / 0.0008)
    out[: len(click)] += 0.35 * click
    return np.tanh(1.6 * out)


def clap() -> np.ndarray:
    n = noise(0.3)
    env = np.zeros_like(n)
    for k, offset in enumerate([0.0, 0.009, 0.017, 0.026]):
        s = int(offset * SR)
        tau = 0.006 if k < 3 else 0.09
        env[s:] += np.exp(-np.arange(len(n) - s) / (tau * SR)) * (0.8 if k < 3 else 1.0)
    return bandpass(n * env, 900, 2600) * 1.4


def hat(open_: bool = False) -> np.ndarray:
    n = highpass(noise(0.25 if open_ else 0.06), 7500, 4)
    return n * np.exp(-np.arange(len(n)) / ((0.07 if open_ else 0.012) * SR))


def sweep(length: float, f_from: float, f_to: float, rise: bool = True) -> np.ndarray:
    """A band of noise gliding between two centre frequencies: whooshes and risers."""
    n = noise(length)
    hop, out, zi = 256, np.zeros_like(n), None
    for i, c in enumerate(np.geomspace(f_from, f_to, len(n) // hop + 1)):
        seg = n[i * hop:(i + 1) * hop]
        if len(seg) == 0:
            break
        sos = signal.butter(2, [c * 0.7, min(c * 1.4, SR / 2 - 100)], btype="band", fs=SR, output="sos")
        zi = np.zeros((sos.shape[0], 2)) if zi is None else zi
        out[i * hop:i * hop + len(seg)], zi = signal.sosfilt(sos, seg, zi=zi)
    shape = np.linspace(0, 1, len(n))
    return fade(out * (shape ** 2.2 if rise else (1 - shape) ** 1.5), 0.01, 0.01)


def sub_drop(f0: float = 55, length: float = 1.0) -> np.ndarray:
    t = t_axis(length)
    return np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.6 * np.exp(-t / 0.05))) / SR) * np.exp(-t / 0.35)


# ---------------------------------------------------------------- the cue

def score() -> list[float]:
    """Places every sound, and returns the kick times for the sidechain."""
    E = EV
    # A riser into the first beat, as the title comes up from below.
    sfx.add(sweep(E["title"], 300, 4200), 0.0, 0.12, pan=-0.2, send=0.2)

    # Beat 1: the title lands.
    drums.add(kick(0.9), E["title"], 0.6)
    music.add(marimba(note("C5")), E["title"], 0.4, pan=-0.2, send=0.25)
    music.add(bass(note("F2")), E["title"], 0.32)

    # Beat 2: the emphasis whips in from the right.
    sfx.add(sweep(0.13, 900, 5200), E["emphasis"] - 0.13, 0.1, pan=0.4, send=0.15)
    drums.add(clap(), E["emphasis"], 0.3, pan=0.1, send=0.3)
    music.add(marimba(note("F5")), E["emphasis"], 0.38, pan=0.2, send=0.25)
    drums.add(kick(0.7), beat(2.5), 0.25)

    # Beat 3: the rule wipes in.
    sfx.add(sweep(0.1, 1500, 7000), E["rule"] - 0.1, 0.07, pan=-0.3)
    music.add(marimba(note("A5")), E["rule"], 0.3, pan=-0.1, send=0.3)
    music.add(bass(note("D2")), E["rule"], 0.28)

    # Beat 4: the logomark fades up on a bell.
    music.add(bell(note("C6")), E["mark"], 0.14, pan=0.35, send=0.5)
    music.add(bass(note("Bb1")), E["mark"], 0.28)

    # Beat 5: the hit, then a bar of groove.
    drums.add(clap(), E["hit"], 0.34, send=0.35)
    sfx.add(sub_drop(52, 0.8), E["hit"], 0.4)
    for n in ["F3", "A3", "C4", "E4", "G4"]:
        music.add(epiano(note(n), 1.4), E["hit"], 0.12, pan=RNG.uniform(-0.3, 0.3), send=0.35)
    kicks = [E["title"], E["hit"], beat(7), beat(9)]
    for at in kicks[1:]:
        drums.add(kick(1.0), at, 0.62)
    drums.add(kick(0.6), beat(6.5), 0.3)
    drums.add(clap(), beat(8), 0.3, pan=0.05, send=0.35)
    for i in range(8):  # eighths, swung a touch
        drums.add(lowpass(hat(open_=(i == 3)), 13000), beat(5 + i * 0.5) + (0.018 if i % 2 else 0.0),
                  0.08 if i % 2 else 0.11, pan=0.3)
    for n, b in [("F2", 5), ("F3", 5.5), ("A2", 6), ("C3", 6.5), ("Bb2", 7), ("D3", 7.5), ("C3", 8), ("E3", 8.5)]:
        music.add(bass(note(n), 0.36, 0.9 if b % 1 == 0 else 0.6), beat(b), 0.3)

    # Beat 9: home. F major, and let it ring out.
    music.add(bass(note("F1"), 1.0, 0.5), beat(9), 0.38)
    for i, n in enumerate(["F4", "A4", "C5", "F5", "A5"]):
        music.add(marimba(note(n), 1.2), beat(9) + i * 0.028, 0.2, pan=-0.3 + 0.15 * i, send=0.4)
    return kicks


# ---------------------------------------------------------------- mixdown

def reverb_ir(seconds: float = 1.6) -> np.ndarray:
    t = t_axis(seconds)
    ir = np.zeros((2, len(t)))
    for ch in range(2):
        n = lowpass(RNG.standard_normal(len(t)) * np.exp(-t / (seconds / 6.9)), 6500)
        n[: int(0.012 * SR)] = 0  # pre-delay
        ir[ch] = n
    for at, gain in [(0.013, 0.6), (0.021, 0.45), (0.034, 0.35), (0.047, 0.25)]:
        ir[0, int(at * SR)] += gain
        ir[1, int((at + 0.004) * SR)] += gain
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


def sidechain(x: np.ndarray, kicks: list[float], depth: float = 0.45) -> np.ndarray:
    gain = np.ones(N)
    for at in kicks:
        s = int(at * SR)
        k = np.arange(N - s) / SR
        gain[s:] *= 1 - depth * np.exp(-k / 0.09) * (1 - np.exp(-k / 0.004))
    return x * gain


def compress(x: np.ndarray, threshold_db: float = -16, ratio: float = 2.5) -> np.ndarray:
    level = np.sqrt(signal.sosfilt(signal.butter(1, 12, fs=SR, output="sos"), np.mean(x ** 2, axis=0)) + 1e-12)
    over = np.maximum(0, 20 * np.log10(level) - threshold_db)
    return x * 10 ** (-(over - over / ratio) / 20)


def main() -> None:
    kicks = score()
    ir = reverb_ir()
    wet = np.zeros((2, N))
    for bus in (music, drums, sfx):
        for ch in range(2):
            wet[ch] += signal.fftconvolve(bus.verb[ch], ir[ch])[:N]
    mix = sidechain(music.dry, kicks) + drums.dry + sfx.dry + 0.5 * sidechain(wet, kicks, 0.3)
    mix = compress(highpass(mix, 28))

    # The picture leads: the whole mix starts soundDelayMs late.
    delay = int(round(TIMELINE["soundDelayMs"] / 1000 * SR))
    mix = np.concatenate([np.zeros((2, delay)), mix[:, : N - delay]], axis=1)
    # The last 0.35 s fades, so the end (and any loop point) is silent.
    tail = int(0.35 * SR)
    mix[:, -tail:] *= np.linspace(1, 0, tail) ** 1.5
    mix = np.tanh(1.1 * mix / np.max(np.abs(mix))) * 0.9

    OUT.parent.mkdir(parents=True, exist_ok=True)
    raw = OUT.with_suffix(".raw.wav")
    wavfile.write(raw, SR, (mix.T * 32767).astype(np.int16))

    # Loudness for Instagram: -14 LUFS integrated, true peak under -1 dBTP.
    # Two passes, so the gain change is linear and the dynamics stay intact.
    target = "I=-14:TP=-1.2:LRA=11"
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(raw), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"],
        check=True, capture_output=True, text=True,
    ).stderr
    m = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    measured = (f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
                f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
         "-af", f"loudnorm={target}:{measured}:linear=true", "-ar", str(SR), "-c:a", "pcm_s16le", str(OUT)],
        check=True,
    )
    raw.unlink()
    print(f"Wrote {OUT.relative_to(ROOT)} ({DURATION:.2f}s at {SR} Hz, {TIMELINE['soundDelayMs']} ms behind picture)")


if __name__ == "__main__":
    sys.exit(main())
