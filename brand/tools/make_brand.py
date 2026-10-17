#!/usr/bin/env python3
"""Draw the Call Sheet logo files.

    python3 brand/tools/make_brand.py [--fonts ../pitchdog-type-system/assets/fonts]

Writes every SVG under brand/logo/ and brand/editions/.  The letters are
outlines of PD Head from the pitch.dog type system (its font files are CC0),
and the red loop is drawn in code: a marker circle with a fixed seed, so it
comes out the same hand every time.

Needs fonttools and uharfbuzz (pip install fonttools brotli uharfbuzz).
PNG exports come from brand/tools/export_png.mjs.
"""
from __future__ import annotations

import argparse
import functools
import io
import json
import math
import random
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

BRAND = Path(__file__).resolve().parents[1]
PALETTE = json.loads((BRAND / "palette.json").read_text(encoding="utf-8"))
PAPER, INK, RED = PALETTE["paper"]["hex"], PALETTE["ink"]["hex"], PALETTE["marker"]["hex"]
FONTS: Path


# ------------------------------------------------------------------ letters

@functools.lru_cache(None)
def _instance(file: str, wght: float, ital: int) -> tuple[TTFont, bytes]:
    font = TTFont(FONTS / file)
    loc = {"wght": wght}
    if "ital" in {a.axisTag for a in font["fvar"].axes}:
        loc["ital"] = ital
    static = instancer.instantiateVariableFont(font, loc)
    static.flavor = None  # HarfBuzz reads sfnt, not WOFF2
    buf = io.BytesIO()
    static.save(buf)
    return TTFont(io.BytesIO(buf.getvalue())), buf.getvalue()


def letters(text: str, size: float, *, file="pd-head.woff2", wght=820.0, ital=0, tracking=-0.02, x=0.0, y=0.0):
    """Shape text and return (path data, bounds) with the baseline at y; y runs down."""
    tt, data = _instance(file, wght, ital)
    upem = tt["head"].unitsPerEm
    font = hb.Font(hb.Face(data))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    glyphs, order = tt.getGlyphSet(), tt.getGlyphOrder()
    pen = SVGPathPen(glyphs, lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    box = BoundsPen(glyphs)
    s, cursor = size / upem, 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        move = (s, 0, 0, -s, x + (cursor + pos.x_offset) * s, y - pos.y_offset * s)
        glyphs[order[info.codepoint]].draw(TransformPen(pen, move))
        glyphs[order[info.codepoint]].draw(TransformPen(box, move))
        cursor += pos.x_advance + tracking * upem
    return pen.getCommands(), list(box.bounds)


# ---------------------------------------------------------------- the loop

def _smooth_open(points: list[tuple[float, float]]) -> str:
    """Open Catmull-Rom spline through the points: the pen's path, for drawing the loop on."""
    n = len(points)
    out = [f"M{points[0][0]:.2f} {points[0][1]:.2f}"]
    for i in range(n - 1):
        p0, p1, p2 = points[max(i - 1, 0)], points[i], points[i + 1]
        p3 = points[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out.append(f"C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}")
    return "".join(out)


def _smooth(points: list[tuple[float, float]]) -> str:
    """Closed Catmull-Rom spline through the points, as cubic Béziers."""
    n = len(points)
    out = [f"M{points[0][0]:.2f} {points[0][1]:.2f}"]
    for i in range(n):
        p0, p1, p2, p3 = points[i - 1], points[i], points[(i + 1) % n], points[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out.append(f"C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}")
    return "".join(out) + "Z"


def loop(cx, cy, rx, ry, width, *, pen=False, seed=1, start=-80, turn=425, tilt=-4, spiral=.12, wobble=.04, flick=.18, n=150):
    """A marker circle drawn counter-clockwise from about eleven o'clock.

    It overshoots its start by a sixth of a turn, drifts inward as it goes and
    flicks out where the pen lifts.  Returns (path data, bounds).
    """
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

    def cap(i, sign):
        q0, q1 = centre[max(i - 1, 0)], centre[min(i + 1, n)]
        dx, dy = q1[0] - q0[0], q1[1] - q0[1]
        length = math.hypot(dx, dy) or 1
        w = math.dist(left[i], right[i]) / 2 * .9
        return centre[i][0] + sign * dx / length * w, centre[i][1] + sign * dy / length * w

    pts = left + [cap(n, 1)] + right[::-1] + [cap(0, -1)]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    if pen:
        return _smooth(pts), [min(xs), min(ys), max(xs), max(ys)], _smooth_open(centre)
    return _smooth(pts), [min(xs), min(ys), max(xs), max(ys)]


# ------------------------------------------------------------------ pieces

def union(*boxes):
    return [min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)]


def svg(body: str, box, pad, title: str) -> str:
    x, y = box[0] - pad, box[1] - pad
    w, h = box[2] - box[0] + 2 * pad, box[3] - box[1] + 2 * pad
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.1f} {y:.1f} {w:.1f} {h:.1f}" '
            f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def wordmark(size=100.0, x=0.0, y=0.0):
    """'Call Sheet' with 'Call' circled.  Returns (letters d, loop d, letter bounds, loop bounds)."""
    call_d, call = letters("Call", size, x=x, y=y)
    # A wider word space than the font's, so the loop has room before the S.
    sheet_d, sheet = letters("Sheet", size, x=call[2] + size * .36, y=y)
    ring, ring_box = loop((call[0] + call[2]) / 2 - size * .01, (call[1] + call[3]) / 2 + size * .035,
                          size * 1.1, size * .6, size * .072, seed=1, tilt=-3)
    return call_d + sheet_d, ring, union(call, sheet), ring_box


def tile(s=100.0, r=18.0, ear=24.0):
    """A rounded square with its top-right corner folded down: (sheet, flap)."""
    sheet = f"M{r} 0H{s - ear}L{s} {ear}V{s - r}Q{s} {s} {s - r} {s}H{r}Q0 {s} 0 {s - r}V{r}Q0 0 {r} 0Z"
    flap = f"M{s - ear} 0L{s} {ear}H{s - ear * .84}Q{s - ear} {ear} {s - ear} {ear * .84}Z"
    return sheet, flap


def stamp(cx=48.0, cy=55.0, scale=1.0):
    """The circled 'Cs' that sits on the tile.  Returns (letters d, loop d, bounds)."""
    d, box = letters("Cs", 51 * scale, wght=860, tracking=-.03)
    dx, dy = cx - (box[0] + box[2]) / 2, cy - (box[1] + box[3]) / 2
    d, box = letters("Cs", 51 * scale, wght=860, tracking=-.03, x=dx, y=dy)
    ring, ring_box = loop(cx, cy + 1 * scale, 41 * scale, 26 * scale, 4.8 * scale, seed=1, tilt=-6, wobble=.045)
    return d, ring, union(box, ring_box)


def symbol(sheet_fill, letter_fill, flap_fill, ring_fill, size=100.0):
    s = size / 100
    sheet, flap = tile()
    d, ring, _ = stamp()
    return (f'<g transform="scale({s:g})"><path d="{sheet}" fill="{sheet_fill}"/><path d="{flap}" fill="{flap_fill}"/>'
            f'<path d="{d}" fill="{letter_fill}"/><path d="{ring}" fill="{ring_fill}"/></g>')


# ------------------------------------------------------------------- write

def main() -> None:
    global FONTS
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--fonts", type=Path, default=BRAND.parents[1] / "pitchdog-type-system/assets/fonts")
    FONTS = p.parse_args().fonts.resolve()
    logo, editions = BRAND / "logo", BRAND / "editions"
    logo.mkdir(exist_ok=True)
    editions.mkdir(exist_ok=True)
    files: dict[Path, str] = {}

    schemes = {"": (INK, RED), "-reverse": (PAPER, RED), "-mono-ink": (INK, INK), "-mono-paper": (PAPER, PAPER)}

    # The logo: the wordmark with Call circled.
    d, ring, box, ring_box = wordmark(100)
    for suffix, (ink, red) in schemes.items():
        files[logo / f"call-sheet-logo{suffix}.svg"] = svg(f'<path d="{d}" fill="{ink}"/><path d="{ring}" fill="{red}"/>', union(box, ring_box), 8, "Call Sheet")
        files[logo / f"call-sheet-wordmark{suffix}.svg"] = svg(f'<path d="{d}" fill="{ink}"/>', box, 6, "Call Sheet")

    # With the line.  The tagline is PD Head italic, a third of the wordmark.
    tag, tag_box = letters("Know your call time.", 34, wght=520, ital=1, tracking=-.01, y=box[3] + 64)
    tag_box_x = box[0] + 6
    tag, tag_box = letters("Know your call time.", 34, wght=520, ital=1, tracking=-.01, x=tag_box_x, y=box[3] + 64)
    for suffix, (ink, red) in list(schemes.items())[:2]:
        files[logo / f"call-sheet-logo-tagline{suffix}.svg"] = svg(
            f'<path d="{d}" fill="{ink}"/><path d="{ring}" fill="{red}"/><path d="{tag}" fill="{ink}"/>', union(box, ring_box, tag_box), 8, "Call Sheet. Know your call time.")

    # Endorsed: by pitch.dog, in PD Body Alt, under the end of the wordmark.
    by, by_box = letters("by pitch.dog", 26, file="pd-body-alt-roman.woff2", wght=500, tracking=0)
    by, by_box = letters("by pitch.dog", 26, file="pd-body-alt-roman.woff2", wght=500, tracking=0, x=box[2] - (by_box[2] - by_box[0]) - 2, y=box[3] + 40)
    for suffix, (ink, red) in list(schemes.items())[:2]:
        files[logo / f"call-sheet-logo-endorsed{suffix}.svg"] = svg(
            f'<path d="{d}" fill="{ink}"/><path d="{ring}" fill="{red}"/><path d="{by}" fill="{ink}"/>', union(box, ring_box, by_box), 8, "Call Sheet by pitch.dog")

    # The symbol: the circled Cs on a dog-eared sheet.
    sym = {"": (INK, PAPER, RED, RED), "-paper": (PAPER, INK, RED, RED), "-mono-ink": (INK, PAPER, PAPER, PAPER), "-mono-paper": (PAPER, INK, INK, INK)}
    for suffix, fills in sym.items():
        files[logo / f"call-sheet-symbol{suffix}.svg"] = svg(symbol(*fills), [0, 0, 100, 100], 0, "Call Sheet")
    sd, sring, sbox = stamp()
    for suffix, (ink, red) in schemes.items():
        files[logo / f"call-sheet-stamp{suffix}.svg"] = svg(f'<path d="{sd}" fill="{ink}"/><path d="{sring}" fill="{red}"/>', sbox, 2, "Call Sheet")

    # Lockups: the symbol beside, or above, the plain wordmark.
    plain, pbox = letters("Call Sheet", 100)
    gap, side = 34, pbox[3] - pbox[1] + 30  # the tile stands a little taller than the letters
    for suffix, (sheet_fill, letter_fill, flap_fill, ring_fill) in {"": sym[""], "-reverse": (PAPER, INK, RED, RED)}.items():
        ink = INK if suffix == "" else PAPER
        top = pbox[1] - 15
        word, wbox = letters("Call Sheet", 100, x=side + gap - pbox[0], y=0)
        body = f'<g transform="translate(0 {top:.2f})">{symbol(sheet_fill, letter_fill, flap_fill, ring_fill, side)}</g><path d="{word}" fill="{ink}"/>'
        files[logo / f"call-sheet-lockup-horizontal{suffix}.svg"] = svg(body, union([0, top, side, top + side], wbox), 8, "Call Sheet")
        width = pbox[2] - pbox[0]
        big = width * .42
        word, wbox = letters("Call Sheet", 100, x=-pbox[0], y=big + 40 + (pbox[3] - pbox[1]))
        body = f'<g transform="translate({(width - big) / 2:.2f} 0)">{symbol(sheet_fill, letter_fill, flap_fill, ring_fill, big)}</g><path d="{word}" fill="{ink}"/>'
        files[logo / f"call-sheet-lockup-stacked{suffix}.svg"] = svg(body, union([0, 0, width, big], wbox), 8, "Call Sheet")

    # Editions: each monthly update takes the next script-revision colour.
    for rev in PALETTE["revisions"]:
        fills = (rev["hex"], INK, RED if rev["name"] != "Cherry" else INK, RED if rev["name"] != "Cherry" else INK)
        files[editions / f"call-sheet-symbol-{rev['name'].lower()}.svg"] = svg(symbol(*fills), [0, 0, 100, 100], 0, f"Call Sheet, {rev['name'].lower()} pages")

    # For the web page: letters in currentColor, and the loop drawn on by a mask
    # that follows the pen.  The page's CSS sets --cs-marker and runs .cs-pen.
    web = BRAND / "web"
    web.mkdir(exist_ok=True)
    call_d, call = letters("Call", 100)
    sheet_d, sheet_box = letters("Sheet", 100, x=call[2] + 36)
    ring, ring_box, pen = loop((call[0] + call[2]) / 2 - 1, (call[1] + call[3]) / 2 + 3.5, 110, 60, 7.2, pen=True, seed=1, tilt=-3)
    box = union(call, sheet_box, ring_box)
    files[web / "logo.svg"] = svg(
        f'<defs><mask id="cs-logo-pen"><path class="cs-pen" d="{pen}" pathLength="1" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/></mask></defs>'
        f'<path d="{call_d}{sheet_d}" fill="currentColor"/><path d="{ring}" fill="var(--cs-marker, {RED})" mask="url(#cs-logo-pen)"/>', box, 8, "Call Sheet")
    ring, ring_box, pen = loop(0, 0, 100, 44, 6.4, pen=True, seed=3, tilt=-4, start=-95, turn=430, spiral=.13, flick=.16)
    files[web / "ring.svg"] = svg(
        f'<defs><mask id="cs-ring-pen"><path class="cs-pen" d="{pen}" pathLength="1" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/></mask></defs>'
        f'<path d="{ring}" fill="var(--cs-marker, {RED})" mask="url(#cs-ring-pen)"/>', ring_box, 4, "")
    files[web / "favicon.svg"] = files[logo / "call-sheet-symbol.svg"]

    for path, text in files.items():
        path.write_text(text, encoding="utf-8")
    print(json.dumps({"written": len(files)}))


if __name__ == "__main__":
    main()
