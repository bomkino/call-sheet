"""Draws a sting's score against its picture events, to check sync and balance.

    python3 scripts/audio_check.py 5s out/check/audio-5s.png [--audio path.wav]

Top: the waveform envelope (RMS, 5 ms). Bottom: a log-frequency spectrogram.
Dashed lines are the timeline's events, where the picture changes; the sound
should start about 20 ms after each one.
"""
import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent

ap = argparse.ArgumentParser()
ap.add_argument("variant")
ap.add_argument("out", type=Path)
ap.add_argument("--audio", type=Path)
a = ap.parse_args()
tl = json.loads((ROOT / f"src/cs/timeline-{a.variant}.json").read_text())
sr, x = wavfile.read(a.audio or ROOT / f"public/audio/sting-{a.variant}.wav")
x = x.astype(float) / 32768
mono = x.mean(axis=1) if x.ndim > 1 else x
fps = tl["fps"]
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 7), sharex=True, gridspec_kw={"height_ratios": [1, 2]})
hop = int(0.005 * sr)
rms = np.sqrt(np.convolve(mono ** 2, np.ones(hop) / hop, "same"))
t = np.arange(len(mono)) / sr
ax1.plot(t, 20 * np.log10(rms + 1e-6), lw=0.6, color="#15130F")
ax1.set_ylim(-60, 0)
ax1.set_ylabel("dBFS rms")
f, tt, S = signal.spectrogram(mono, sr, nperseg=2048, noverlap=2048 - 256)
ax2.pcolormesh(tt, f, 10 * np.log10(S + 1e-12), shading="auto", cmap="magma", vmin=-110, vmax=-30)
ax2.set_yscale("symlog", linthresh=200)
ax2.set_ylim(40, 16000)
ax2.set_xlabel("seconds")
for name, v in tl["frames"].items():
    for fr in (v if isinstance(v, list) else [v]):
        if name in ("urlRate",):
            continue
        for ax in (ax1, ax2):
            ax.axvline(fr / fps, color="#E3472D" if name != "rows" else "#A8C8EA", lw=0.8, ls="--", alpha=0.8)
        ax1.text(fr / fps, -2, name if name != "rows" else "", fontsize=7, rotation=90, va="top")
for b in range(0, int(tl["durationInFrames"] / tl["framesPerBeat"]) + 1):
    ax1.axvline((tl["firstBeat"] + b * tl["framesPerBeat"]) / fps, color="#999", lw=0.4)
a.out.parent.mkdir(parents=True, exist_ok=True)
plt.tight_layout()
plt.savefig(a.out, dpi=90)
print("wrote", a.out)
