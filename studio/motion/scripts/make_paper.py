"""Writes the paper's tooth as tileable textures in public/paper/.

    python3 scripts/make_paper.py

tooth.png       1024 px, mid-grey centred: fine grain, fibres and formation
                (the cloudy way pulp settles). The picture lays it over the
                page with soft-light, so it lifts and sinks paper and ink alike.
All noise is shaped in the frequency domain, so every texture tiles without a
seam, and the seed is fixed.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/paper"
RNG = np.random.default_rng(11)


def shaped(n, sigma_x, sigma_y=None):
    """Periodic Gaussian-filtered noise, unit variance."""
    sigma_y = sigma_x if sigma_y is None else sigma_y
    f = np.fft.fftfreq(n)
    fx, fy = np.meshgrid(f, f)
    h = np.exp(-2 * (np.pi ** 2) * ((fx * sigma_x) ** 2 + (fy * sigma_y) ** 2))
    x = np.real(np.fft.ifft2(np.fft.fft2(RNG.standard_normal((n, n))) * h))
    return (x - x.mean()) / x.std()


def fibres(n, count, length, width, sign):
    img = np.zeros((n, n))
    yy, xx = np.mgrid[0:n, 0:n]
    for _ in range(count):
        x0, y0 = RNG.uniform(0, n, 2)
        ang = RNG.uniform(0, np.pi)
        curve = RNG.normal(0, 0.012)
        L = RNG.uniform(*length)
        steps = int(L)
        a = ang
        x, y = x0, y0
        strength = RNG.uniform(0.4, 1.0)
        for s in range(steps):
            a += curve
            x += np.cos(a)
            y += np.sin(a)
            ix, iy = int(x) % n, int(y) % n
            img[iy, ix] += strength * sign
    # soften to fibre width
    f = np.fft.fftfreq(n)
    fx, fy = np.meshgrid(f, f)
    h = np.exp(-2 * (np.pi ** 2) * ((fx * width) ** 2 + (fy * width) ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(img) * h))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    n = 1024
    formation = 0.55 * shaped(n, 14) + 0.45 * shaped(n, 38, 30)
    tooth = shaped(n, 0.7)
    grit = shaped(n, 2.2)
    fib = fibres(n, 900, (18, 70), 0.7, 1.0) + fibres(n, 700, (14, 50), 0.6, -1.0)
    fib = fib / (np.abs(fib).max() + 1e-9)
    # Soft-light around 0.5: these amounts are deliberately small. Paper should
    # feel like paper at phone size, not like a texture.
    t = 0.5 + 0.030 * formation + 0.034 * tooth + 0.016 * grit + 0.20 * fib
    t = np.clip(t, 0, 1)
    Image.fromarray((t * 255).round().astype(np.uint8), "L").save(OUT / "tooth.png", optimize=True)
    print("wrote", OUT / "tooth.png", "mean", round(float(t.mean()), 3), "min", round(float(t.min()), 3), "max", round(float(t.max()), 3))


if __name__ == "__main__":
    main()
