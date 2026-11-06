"""Measures where sounds start in a rendered MP4 against the picture events.

    python3 scripts/sync_check.py out/final/x.mp4 5s

For each event it finds the first sharp rise in the audio's envelope near the
event's frame and prints the offset, sound minus picture. The target is +20 ms
(sound a hair behind picture).
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
video, variant = sys.argv[1], sys.argv[2]
tl = json.loads((ROOT / f"src/cs/timeline-{variant}.json").read_text())
sr = 48000
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", video, "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
                     check=True, capture_output=True).stdout
x = np.frombuffer(raw, np.float32)
# a fast envelope of the high band, where every attack shows
from scipy import signal
hp = signal.sosfilt(signal.butter(2, 1500, "high", fs=sr, output="sos"), x)
env = np.sqrt(np.convolve(hp ** 2, np.ones(48) / 48, "same"))
F = tl["frames"]
checks = {"first row": F.get("rows", [None])[0], "loop start (marker)": F.get("loopStart"),
          "ear lands": F.get("earEnd"), "url first key": F.get("url"), "margin bell": F.get("ding")}
for name, fr in checks.items():
    if fr is None:
        continue
    t = fr / tl["fps"]
    a, b = int((t - 0.06) * sr), int((t + 0.12) * sr)
    seg = env[max(0, a):b]
    base = np.median(env[max(0, a - 2400):max(1, a)]) if a > 2400 else 1e-5
    rise = np.diff(seg)
    i = int(np.argmax(rise > (seg.max() - base) * 0.08)) if seg.max() > base * 2 else -1
    onset = (max(0, a) + i) / sr if i >= 0 else float("nan")
    print(f"{name:22s} picture {t*1000:7.1f} ms   sound {onset*1000:7.1f} ms   offset {1000*(onset-t):+6.1f} ms")

# Signature checks: each of these sounds owns a band nothing else uses at that moment.
def band_onset(lo, hi, t, before=0.25, after=0.15, frac=0.3):
    y = signal.sosfilt(signal.butter(4, [lo, hi], "band", fs=sr, output="sos"), x)
    e = np.sqrt(np.convolve(y ** 2, np.ones(96) / 96, "same"))
    a, b = int((t - before) * sr), int((t + after) * sr)
    seg = e[a:b]
    floor, peak = np.percentile(seg[: int(0.15 * sr)], 50), seg.max()
    i = int(np.argmax(seg > floor + (peak - floor) * frac))
    return (a + i) / sr

fps = tl["fps"]
if "ding" in F:
    t = F["ding"] / fps
    on = band_onset(1360, 1440, t)
    print(f"{'bell (F6 partial)':22s} picture {t*1000:7.1f} ms   sound {on*1000:7.1f} ms   offset {1000*(on-t):+6.1f} ms")
