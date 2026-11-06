"""Paper tooth and film grain for the explainer, made in code (fixed seed).

    python3 scripts/make_textures.py     writes public/tex/tooth.png and grain-0..7.png

The tooth is a tileable sheet of fibres and soft mottling, multiplied over the
paper. The grain frames are tileable mid-grey noise, overlaid lightly and
swapped every frame.
"""
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "public/tex"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(11)


def periodic_noise(n: int, lo: float, hi: float) -> np.ndarray:
    """Band-limited noise that tiles, by filtering white noise in frequency."""
    f = np.fft.fftfreq(n)
    fx, fy = np.meshgrid(f, f)
    r = np.sqrt(fx ** 2 + fy ** 2)
    band = np.exp(-((r / hi) ** 2)) * (1 - np.exp(-((r / max(lo, 1e-6)) ** 2)))
    x = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((n, n))) * band))
    return (x - x.mean()) / (x.std() + 1e-9)


N = 1024
mottle = periodic_noise(N, 0.002, 0.02)        # soft clouds in the pulp
tooth = periodic_noise(N, 0.08, 0.5)           # the fine surface
img = 1.0 - 0.006 * mottle - 0.016 * tooth

# Fibres: short, faint, slightly curved strokes, wrapped so the tile repeats.
fib = np.zeros((N, N))
for _ in range(520):
    x, y = rng.uniform(0, N, 2)
    a = rng.uniform(0, np.pi)
    length = rng.uniform(4, 16)
    bend = rng.normal(0, 0.008)
    dark = rng.uniform(0.008, 0.028) * (1 if rng.random() < 0.75 else -0.8)
    for t in np.linspace(0, length, int(length * 2)):
        ang = a + bend * t
        px, py = int(x + np.cos(ang) * t) % N, int(y + np.sin(ang) * t) % N
        fib[py, px] += dark
img -= fib
img = np.clip(img, 0.86, 1.0)
Image.fromarray((img * 255).astype(np.uint8), "L").save(OUT / "tooth.png", optimize=True)

# Grain: eight frames, mid-grey, a touch of clumping so it reads as film rather than pixels.
G = 512
for i in range(8):
    g = 0.7 * periodic_noise(G, 0.15, 0.9) + 0.3 * periodic_noise(G, 0.05, 0.3)
    g = np.clip(128 + 34 * g, 0, 255).astype(np.uint8)
    Image.fromarray(g, "L").save(OUT / f"grain-{i}.png", optimize=True)
print("textures written to", OUT)
