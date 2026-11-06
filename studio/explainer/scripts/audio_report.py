"""Draws a spectrogram (log frequency) and a short-term level strip of a mix,
with the scene starts marked, so a mix can be checked by eye.

    python3 scripts/audio_report.py [public/audio/score.wav] [out/audio/report.png]
"""
import json
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import signal
from scipy.io import wavfile

src = sys.argv[1] if len(sys.argv) > 1 else "public/audio/score.wav"
dst = sys.argv[2] if len(sys.argv) > 2 else "out/audio/report.png"
sr, x = wavfile.read(src)
x = x.astype(np.float64)
x /= np.max(np.abs(x)) + 1e-12
m = x.mean(axis=1) if x.ndim == 2 else x
t = json.load(open("src/timeline.json"))
bf = lambda b: int(np.floor(t["firstBeat"] + (b - 1) * t["framesPerBeat"] + 0.5))
dur = len(m) / sr

f, tt, S = signal.spectrogram(m, sr, nperseg=4096, noverlap=4096 - 480)
S = 10 * np.log10(S + 1e-14)
W, H = 1800, 520
fmin, fmax = 40, 14000
ys = np.geomspace(fmax, fmin, H)
cols = np.linspace(0, S.shape[1] - 1, W).astype(int)
rows = np.searchsorted(f, ys).clip(0, len(f) - 1)
img = S[np.ix_(rows, cols)]
top = np.percentile(img, 99.7)
img = np.clip((img - (top - 70)) / 70, 0, 1)
rgb = np.stack([img ** 0.8 * 255, img ** 1.6 * 230, img ** 3 * 160], axis=-1).astype(np.uint8)
spec = Image.fromarray(rgb)
d = ImageDraw.Draw(spec)
for hz in (60, 100, 200, 500, 1000, 2000, 5000, 10000):
    y = int(np.argmin(np.abs(ys - hz)))
    d.line([(0, y), (12, y)], fill=(255, 255, 255))
    d.text((14, y - 6), f"{hz}", fill=(255, 255, 255))

win, hop = int(0.4 * sr), int(0.05 * sr)
rms = [20 * np.log10(np.sqrt(np.mean(m[i:i + win] ** 2)) + 1e-9) for i in range(0, len(m) - win, hop)]
lv = Image.new("RGB", (W, 200), (250, 248, 242))
dl = ImageDraw.Draw(lv)
for i, v in enumerate(rms):
    xx = int(i * hop / sr / dur * W)
    dl.line([(xx, 200), (xx, int(200 - (v + 50) / 50 * 200))], fill=(120, 110, 100))
out = Image.new("RGB", (W, H + 200), (0, 0, 0))
out.paste(spec, (0, 0))
out.paste(lv, (0, H))
do = ImageDraw.Draw(out)
for k in [e for e in t["events"] if e in ("q", "o", "p1", "p2", "p3", "p4", "f1", "f2", "f3", "f4", "f5a", "f5b", "f5c", "pd", "cta", "end")]:
    xx = int(bf(t["events"][k]) / t["fps"] / dur * W)
    do.line([(xx, 0), (xx, H + 200)], fill=(227, 71, 45))
    do.text((xx + 3, H + 4), k, fill=(20, 20, 20))
out.save(dst)
print("wrote", dst)
