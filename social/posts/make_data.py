"""Write the data the post templates read: loops.js, art.js, free.js and places.js.

    pip install fonttools brotli uharfbuzz
    python3 social/posts/make_data.py --fonts ../pitchdog-type-system/assets/fonts

Run it after each monthly update, check the picks in FREE_PICKS and PLACES below are still
open, then re-render. The loops and stamps only change if the drawing code does.
"""
from __future__ import annotations

import argparse
import datetime as dt
import functools
import io
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(REPO / "brand/tools"))
sys.path.insert(0, str(REPO / "tools"))
import build_site  # noqa: E402
import make_brand as mb  # noqa: E402
import make_weekly as weekly  # noqa: E402  (the owner's lead-time rule: effective deadline and minimum days)

# Marker loops for circling things in layouts, drawn by the same hand as the logo.
LOOPS = {
    "wide": dict(rx=100, ry=42, width=6.4, seed=3, tilt=-4, start=-95, turn=430, spiral=.13, flick=.16),
    "round": dict(rx=60, ry=50, width=5.6, seed=5, tilt=-8, start=-85, turn=425, spiral=.12, flick=.18),
    "long": dict(rx=170, ry=40, width=6.4, seed=1, tilt=-2, start=-80, turn=420, spiral=.10, flick=.14),
    "word": dict(rx=110, ry=60, width=7.2, seed=1, tilt=-3),
}
# Rubber stamps, in PD Eyebrow at 720 and width 92: (key, lines, size).
STAMPS = (("free", ["FREE TO ENTER"], 64), ("notpub", ["NOT", "PUBLISHED"], 70), ("checked", ["CHECKED", "17 OCT 2026"], 48))
# The free carousel (free-02 to free-05) and the zero single: free-to-enter opportunities, picked by hand.
# Each must still be free to enter and leave the owner's minimum lead time plus FREE_MARGIN days from
# FREE_DAY, the day the free carousel goes out, so a post that slips a few days is still fair. The script
# stops if one no longer fits. All are open to filmmakers in the US, UK, Canada or Australia except
# FICG DocuLab (Ibero-American directors), kept from the first list. On 19 October only these eight
# passed; twelve didn't exist.
FREE_DAY = dt.date(2026, 10, 21)
FREE_MARGIN = 3
FREE_PICKS = [
    "ficg-doculab-19", "series-mania-co-pro-pitching-sessions", "sofia-meetings-features", "sofia-meetings-tv-series",
    "sundance-native-lab-fellowship-2027", "cfa-x-imgn-grant-2026", "tribeca-at-and-t-untold-stories-2027",
    "the-whickers-film-and-tv-funding-award",
]
# The "Based in…?" posts (retired 19 October: the weekly series does their job): only the countries pitch.dog's clients work from, with three calls each
# that are open countrywide (no city, state or identity limit), soonest first.
PLACES = {
    "US": ["film-independent-x-humana-foundation-shorts", "roy-w-dean-fall-grant-2026", "wave-grant-2027"],
    "GB": ["cph-forum", "series-mania-writers-campus", "uk-global-screen-fund-documentary-animation-tv"],
    "CA": ["torinofilmlab-scriptlab", "cmf-slate-development-pilot-track-record", "bell-fund-production-major-production-funder"],
    "AU": ["aidc-the-factory", "screen-australia-x-actf-kids-ip-incubator", "screen-australia-narrative-content-production-december"],
}


def eyebrow_instances() -> None:
    """PD Eyebrow needs its width axis set as well as its weight."""
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer

    @functools.lru_cache(None)
    def instance(file, wght, ital):
        font = TTFont(mb.FONTS / file)
        axes = {a.axisTag for a in font["fvar"].axes}
        loc = {"wght": wght}
        if "ital" in axes:
            loc["ital"] = ital
        if "wdth" in axes:
            loc["wdth"] = 92
        static = instancer.instantiateVariableFont(font, loc)
        static.flavor = None
        buf = io.BytesIO()
        static.save(buf)
        return TTFont(io.BytesIO(buf.getvalue())), buf.getvalue()

    mb._instance = instance


def stamp(lines: list[str], size: int) -> dict:
    drawn, y = [], 0
    for line in lines:
        drawn.append(mb.letters(line, size, file="pd-eyebrow-site.woff2", wght=720, tracking=.06, y=y))
        y += size * 1.12
    width = max(b[2] - b[0] for _, b in drawn)
    inner = "".join(f'<path transform="translate({(width - (b[2] - b[0])) / 2 - b[0]:.1f} 0)" d="{d}"/>' for d, b in drawn)
    return {"w": width, "top": min(b[1] for _, b in drawn), "bot": max(b[3] for _, b in drawn), "pad": size * .55, "inner": inner}


def write(name: str, var: str, value) -> None:
    (HERE / name).write_text(f"window.{var} = " + json.dumps(value, ensure_ascii=False) + ";\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fonts", type=Path, default=REPO.parent / "pitchdog-type-system/assets/fonts")
    args = parser.parse_args()
    mb.FONTS = args.fonts

    loops = {}
    for name, spec in LOOPS.items():
        kw = dict(spec)
        rx, ry, width = kw.pop("rx"), kw.pop("ry"), kw.pop("width")
        d, box, pen = mb.loop(0, 0, rx, ry, width, pen=True, **kw)
        loops[name] = {"d": d, "box": [round(v, 2) for v in box], "pen": pen}
    write("loops.js", "LOOPS", loops)

    eyebrow_instances()
    write("art.js", "ART", {key: stamp(lines, size) for key, lines, size in STAMPS})

    payload = json.loads((REPO / "data/calls.json").read_text(encoding="utf-8"))
    calls = payload["calls"]
    as_of = max([payload["research_as_of"], *[c["recheck"]["checked_on"] for c in calls if c.get("recheck")]])
    by_slug = {c["slug"]: c for c in calls}
    free = []
    for slug in FREE_PICKS:
        c = by_slug[slug]
        eff, _, _ = weekly.effective(c)
        need, why = weekly.need(c)
        lead = (eff - FREE_DAY).days
        assert c["fee"]["state"] == "free" and c["state"] in ("open_or_published", "announced_not_open"), f"free: {slug} is no longer free to enter and open"
        assert lead >= need + FREE_MARGIN, f"free: {slug} leaves {lead} days from {FREE_DAY}, needs {need} ({why}) plus {FREE_MARGIN}"
        free.append(c)
    free.sort(key=lambda c: (c["closes"], c["title"]))
    write("free.js", "FREE", [{"closes": c["closes"], "opens": c["opens"] if c["state"] == "announced_not_open" else None, "title": c["title"], "get": c["get"], "who": c["who"],
                               "country": c.get("organiser_country"), "slug": c["slug"]} for c in free])

    places = {}
    for code, slugs in PLACES.items():
        yes = [c for c in calls if not build_site.closed_at(c, as_of) and build_site.place_match(c["where"], code) == "yes"]
        soon = []
        for slug in slugs:
            c = by_slug[slug]
            assert c in yes and not c["where"].get("subnational") and not c["where"].get("identity"), f"{code}: {slug} no longer fits"
            soon.append({"local": c["where"]["scope"] != "worldwide", "closes": c["closes"], "title": c["title"], "get": c["get"]})
        places[code] = {"yes": len(yes), "soon": sorted(soon, key=lambda s: s["closes"]), "name": build_site.COUNTRY_NAMES[code]}
    write("places.js", "PLACES", places)
    print(json.dumps({"as_of": as_of, "free": len(free), "places": {k: v["yes"] for k, v in places.items()}}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
