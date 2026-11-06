"""Writes src/marks.json: the Call Sheet logo and marker loops as SVG paths.

Everything comes from the brand's own drawing code, imported read-only from
the repo's brand/tools/make_brand.py (../../brand from here), so the letters are PD Head 820
outlines and the loop is the brand's fixed-seed hand. On top of that this adds
two things the motion needs:

  * the pen's centre line (pathLength 1) for the draw-on mask, as the brand's
    web/logo.svg does, plus samples of it so the picture knows where the nib is;
  * the patch where the loop's overshoot crosses its own start, where a real
    marker lays ink twice and reads darker.

    python3 scripts/make_marks.py [--brand ../../brand] [--fonts node_modules/@pitchdog/type-system/assets/fonts]

The fonts default to the pinned type system that `npm ci` installs.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import math
import random
import sys
from pathlib import Path

from shapely.geometry import Polygon
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent


def load_brand(brand: Path, fonts: Path):
    spec = importlib.util.spec_from_file_location("make_brand", brand / "tools/make_brand.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # defines functions only; main() is not called
    mod.FONTS = fonts.resolve()
    return mod


def loop_geom(cx, cy, rx, ry, width, *, seed=1, start=-80, turn=425, tilt=-4, spiral=.12, wobble=.04, flick=.18, n=150):
    """The same maths as make_brand.loop(), returning the centre line and both edges."""
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, math.tau) for _ in range(3)]
    tl = math.radians(tilt)
    centre = []
    for i in range(n + 1):
        t = i / n
        a = math.radians(start - turn * t)
        k = 1 + wobble * (.6 * math.sin(2 * a + ph[0]) + .4 * math.sin(3 * a + ph[1])) - spiral * (t - .5)
        if t > .86:
            k += flick * ((t - .86) / .14) ** 2
        px, py = rx * k * math.cos(a), ry * k * math.sin(a)
        centre.append((cx + px * math.cos(tl) - py * math.sin(tl), cy + px * math.sin(tl) + py * math.cos(tl)))
    left, right = [], []
    for i, p in enumerate(centre):
        t = i / n
        q0, q1 = centre[max(i - 1, 0)], centre[min(i + 1, n)]
        dx, dy = q1[0] - q0[0], q1[1] - q0[1]
        length = math.hypot(dx, dy) or 1
        w = width * (.86 + .14 * math.sin(math.pi * t + ph[2]) ** 2)
        if t < .04:
            w *= .55 + .45 * math.sin(t / .04 * math.pi / 2)
        if t > .84:
            w *= .25 + .75 * math.cos((t - .84) / .16 * math.pi / 2)
        left.append((p[0] - dy / length * w / 2, p[1] + dx / length * w / 2))
        right.append((p[0] + dy / length * w / 2, p[1] - dx / length * w / 2))
    return centre, left, right


def ribbon(left, right, i0, i1):
    pts = left[i0:i1 + 1] + right[i0:i1 + 1][::-1]
    return Polygon(pts).buffer(0)


def poly_d(geom) -> str:
    parts = []
    geoms = getattr(geom, "geoms", [geom])
    for g in geoms:
        if g.is_empty:
            continue
        xs = list(g.exterior.coords)
        parts.append("M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in xs[:-1]) + "Z")
    return "".join(parts)


def pen_samples(centre, count=241):
    """Nib positions at even arc-length fractions of the centre line (pathLength 1)."""
    seg = [math.dist(centre[i], centre[i + 1]) for i in range(len(centre) - 1)]
    total = sum(seg)
    out, acc, i = [], 0.0, 0
    for k in range(count):
        target = total * k / (count - 1)
        while i < len(seg) - 1 and acc + seg[i] < target:
            acc += seg[i]
            i += 1
        f = 0 if seg[i] == 0 else (target - acc) / seg[i]
        f = min(max(f, 0), 1)
        a, b = centre[i], centre[i + 1]
        out.append([round(a[0] + (b[0] - a[0]) * f, 2), round(a[1] + (b[1] - a[1]) * f, 2)])
    return out, total


def ring(mb, cx, cy, rx, ry, width, mask_width, **kw):
    d, box, pen = mb.loop(cx, cy, rx, ry, width, pen=True, **kw)
    n = kw.get("n", 150)
    centre, left, right = loop_geom(cx, cy, rx, ry, width, **kw)
    # Where the overshoot crosses the start, the ink goes down twice.
    first = ribbon(left, right, 0, int(n * .22))
    last = ribbon(left, right, int(n * .74), n)
    overlap = first.intersection(last)
    samples, length = pen_samples(centre)
    return {
        "d": d, "pen": pen, "box": [round(v, 2) for v in box], "overlap": poly_d(overlap),
        "samples": samples, "length": round(length, 2), "maskWidth": mask_width,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--brand", type=Path, default=ROOT.parent.parent / "brand")
    p.add_argument("--fonts", type=Path, default=ROOT / "node_modules/@pitchdog/type-system/assets/fonts")
    a = p.parse_args()
    mb = load_brand(a.brand, a.fonts)

    # The logo exactly as brand/web/logo.svg draws it, with Call and Sheet apart.
    call_d, call = mb.letters("Call", 100)
    sheet_d, sheet_box = mb.letters("Sheet", 100, x=call[2] + 36)
    logo_ring = ring(mb, (call[0] + call[2]) / 2 - 1, (call[1] + call[3]) / 2 + 3.5, 110, 60, 7.2, 13, seed=1, tilt=-3)
    # Sanity: our outline matches the brand file byte for byte.
    web = (a.brand / "web/logo.svg").read_text()
    assert logo_ring["d"] in web and logo_ring["pen"] in web, "logo ring drifted from brand/web/logo.svg"
    box = mb.union(call, sheet_box, logo_ring["box"])

    # A looser loop for circling things on the sheet: the same hand, another day.
    date_ring = ring(mb, 0, 0, 100, 52, 6.6, 12.5, seed=3, tilt=-4, start=-95, turn=430, spiral=.13, flick=.16)

    out = {
        "logo": {
            "call": call_d, "sheet": sheet_d, "callBox": [round(v, 2) for v in call],
            "sheetBox": [round(v, 2) for v in sheet_box], "ring": logo_ring,
            "box": [round(v, 2) for v in box],
        },
        "dateRing": date_ring,
    }
    dest = ROOT / "src/marks.json"
    dest.write_text(json.dumps(out))
    print(json.dumps({"wrote": str(dest.relative_to(ROOT)), "logoBox": out["logo"]["box"], "callBox": out["logo"]["callBox"],
                      "ringBox": logo_ring["box"], "dateRingBox": date_ring["box"],
                      "overlapLogo": len(logo_ring["overlap"]), "overlapDate": len(date_ring["overlap"])}))


if __name__ == "__main__":
    sys.exit(main())
