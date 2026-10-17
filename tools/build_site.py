#!/usr/bin/env python3
"""Build Call Sheet for pitch.dog from data/calls.json.

    python3 tools/build_site.py                 # writes dist-pitchdog/
    python3 tools/build_site.py --out PATH

The output is a static folder meant for pitch.dog/call-sheet/: the list page,
one page per call, hashed assets, the public dataset and BUILD.json.  Every
page is complete without JavaScript; the script adds filtering, countdowns
and the saved sheet.  Python standard library only, deterministic output.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import shutil
import subprocess
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[1]
SITE = REPO / "site"
BASE = "/call-sheet/"
ORIGIN = "https://pitch.dog"
TYPE_CSS = "/assets/type/dist/pitchdog-system-v13.1.1.min.css"

KIND_LABELS = {
    "grant": "Grant",
    "other_finance": "Other finance",
    "lab": "Lab or fellowship",
    "market": "Market or pitch",
    "festival": "Festival",
    "competition": "Competition",
}
KIND_FILTERS = (("grant", "Grants"), ("other_finance", "Loans and commissions"), ("lab", "Labs and fellowships"), ("market", "Markets and pitches"), ("festival", "Festivals"), ("competition", "Competitions"))
FORMAT_LABELS = {
    "fiction_feature": "Fiction feature",
    "documentary": "Documentary",
    "short": "Short",
    "series": "Series",
    "animation": "Animation",
    "immersive": "Immersive",
    "other": "Other formats",
    "any": "Any format",
}
STAGE_LABELS = {
    "writing": "Writing",
    "development": "Development",
    "production": "Production",
    "post": "Post",
    "finished": "Finished film",
    "any": "Any stage",
}
TEST_SENTENCES = {
    "residence": "The test is where you live.",
    "nationality": "The test is your citizenship.",
    "company": "The test is where your company is registered.",
    "production": "The test is where the film is made or the money is spent.",
    "mixed": "More than one test applies, such as where you live and where your company is.",
    "unknown": "",
}
# Names for the places the overlay uses; tests fail if a new code appears without one.
COUNTRY_NAMES = {
    "AT": "Austria", "AU": "Australia", "CA": "Canada", "CH": "Switzerland", "CL": "Chile", "CO": "Colombia",
    "DE": "Germany", "DZ": "Algeria", "EG": "Egypt", "FI": "Finland", "FR": "France", "GB": "the UK", "IN": "India",
    "JO": "Jordan", "LB": "Lebanon", "MA": "Morocco", "MX": "Mexico", "NP": "Nepal", "NZ": "New Zealand", "PE": "Peru",
    "PR": "Puerto Rico", "PS": "Palestine", "PY": "Paraguay", "SG": "Singapore", "TN": "Tunisia", "US": "the US", "UY": "Uruguay",
}
REGION_NAMES = {
    "EU": "the EU", "EUROPE": "Europe", "NORDIC": "the Nordic countries", "LATAM": "Latin America",
    "CENTRAL_AMERICA": "Central America", "CARIBBEAN": "the Caribbean", "IBERO_AMERICA": "Ibero-America",
    "AFRICA": "Africa", "MENA": "the Middle East and North Africa", "ASIA": "Asia", "SOUTH_ASIA": "South Asia",
    "SOUTHEAST_ASIA": "Southeast Asia", "PACIFIC": "the Pacific",
}
MONTHS = ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")


def h(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def day(iso: str | None, with_year: bool = True, weekday: bool = False) -> str:
    if not iso:
        return ""
    d = dt.date.fromisoformat(iso)
    text = f"{d.day} {MONTHS[d.month - 1][:3]}" + (f" {d.year}" if with_year else "")
    return (d.strftime("%a ") + text) if weekday else text


def long_day(iso: str) -> str:
    d = dt.date.fromisoformat(iso)
    return f"{d.strftime('%A')} {d.day} {MONTHS[d.month - 1]} {d.year}"


def asset(name: str, out: Path) -> str:
    """Copy site/<name> to assets/ under a content-hashed file name."""
    source = SITE / name
    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:10]
    stem, ext = name.rsplit(".", 1)
    target = out / "assets" / f"{stem}.{digest}.{ext}"
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    return f"{BASE}assets/{target.name}"


def icon(name: str, cls: str = "cs-icon") -> str:
    return f'<svg class="{cls}" aria-hidden="true" viewBox="0 0 24 24"><use href="#cs-{name}"></use></svg>'


def ph(name: str) -> str:
    return f'<svg class="ph-icon" aria-hidden="true" viewBox="0 0 256 256"><use href="/assets/phosphor-sprite.svg#ph-{name}"></use></svg>'


SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<symbol id="cs-bookmark" viewBox="0 0 24 24"><path d="M6.5 3.75h11a.75.75 0 0 1 .75.75v15.6l-6.25-4.2-6.25 4.2V4.5a.75.75 0 0 1 .75-.75Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="cs-bookmark-fill" viewBox="0 0 24 24"><path d="M6.5 3.75h11a.75.75 0 0 1 .75.75v15.6l-6.25-4.2-6.25 4.2V4.5a.75.75 0 0 1 .75-.75Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="cs-calendar" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3.75" y="5" width="16.5" height="15.25" rx="1"/><path d="M3.75 9.75h16.5M8 3v4M16 3v4"/></g></symbol>
<symbol id="cs-printer" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 8V3.75h10V8M7 16.5H4.75a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h14.5a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H17"/><path d="M7 13.5h10v6.75H7z"/></g></symbol>
<symbol id="cs-link" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1 1"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1-1"/></g></symbol>
<symbol id="cs-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="cs-flag" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4.5c4.5-2.5 8.5 2.5 14 0v9c-5.5 2.5-9.5-2.5-14 0"/></g></symbol>
<symbol id="cs-mail" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3.25" y="5.25" width="17.5" height="13.5" rx="1"/><path d="m3.75 6 8.25 6.75L20.25 6"/></g></symbol>
<symbol id="cs-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="cs-sliders" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></g></symbol>
</svg>"""


def nav() -> str:
    items = [
        ("/blog/", "Blog", "Practical reading on pitches"),
        ("/dictionaries/", "Dictionary", "Pitch words, plainly explained"),
        ("/email-my-deck/", "Email My Deck", "Make a deck small enough to send"),
        ("/call-sheet/", "Call Sheet", "Grants, labs and festivals by deadline"),
    ]
    menu = "".join(f'<a href="{href}"{" aria-current=\"page\"" if href == BASE else ""}><strong>{name}</strong><span>{note}</span></a>' for href, name, note in items)
    mobile = "".join(f'<a href="{href}"{" aria-current=\"page\"" if href == BASE else ""}>{name}</a>' for href, name, _ in items)
    return f"""<header class="header">
    <nav class="nav" aria-label="Primary">
      <a class="brand" href="/" aria-label="pitch.dog home"><img src="/assets/pitchdog-logomark.svg" width="32" height="32" alt=""><span>pitch.dog</span></a>
      <div class="nav-links">
        <a href="/work/">Work</a>
        <details class="pd-nav-more" data-hide-below="601"><summary>Free stuff{ph("caret-down")}</summary><div class="pd-nav-more-menu">{menu}</div></details>
        <a href="/#pricing">Pricing</a>
        <button class="theme-control" id="theme-button" type="button" aria-label="Theme: Auto. Activate to switch to Light.">{ph("circle-half").replace('class="ph-icon"', 'class="ph-icon" id="theme-icon"')}<span id="theme-label">Auto</span></button>
        <a class="primary" href="/#book">Book a call</a>
      </div>
      <button class="mobile-menu-toggle" id="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><svg class="ph-icon menu-open-icon" aria-hidden="true" viewBox="0 0 256 256"><use href="/assets/phosphor-sprite.svg#ph-list"></use></svg><svg class="ph-icon menu-close-icon" aria-hidden="true" viewBox="0 0 256 256"><use href="/assets/phosphor-sprite.svg#ph-x"></use></svg></button>
    </nav>
  </header>
  <div class="mobile-menu" id="mobile-menu" aria-hidden="true" inert>
    <button class="mobile-menu-backdrop" type="button" data-mobile-menu-close aria-label="Close menu"></button>
    <nav class="mobile-menu-panel" aria-label="Mobile navigation">
      <p class="eyebrow">Where to?</p>
      <a href="/"><span>01</span>Home {ph("arrow-right")}</a>
      <a href="/work/"><span>02</span>Work {ph("arrow-right")}</a>
      <a href="/#pricing"><span>03</span>Pricing {ph("arrow-right")}</a>
      <a href="/#book"><span>04</span>Book a call {ph("arrow-right")}</a>
      <a href="mailto:hello@pitch.dog"><span>05</span>Email us {ph("arrow-up-right")}</a>
      <div class="pd-mobile-more"><p class="eyebrow">Free stuff</p>{mobile}</div>
      <div class="mobile-menu-note">Pitch decks · Treatments · Show bibles · Pitch sites<br>Working worldwide.</div>
    </nav>
  </div>"""


FOOTER = """<footer class="footer">
    <div class="footer-inner">
      <span>Made with care. Usually with Spotty, Luna, and Juno nearby.</span>
      <span>Call Sheet is free · <a href="https://github.com/bomkino/call-sheet">Source</a> · <a href="/">Home</a> · <a href="mailto:hello@pitch.dog">hello@pitch.dog</a></span>
    </div>
  </footer>
  <a class="pd-whatsapp-fab" href="https://wa.me/message/NR6Z7K3HBOVPJ1" target="_blank" rel="noopener noreferrer" aria-label="Chat with pitch.dog on WhatsApp (opens in a new tab)" title="Chat on WhatsApp"><svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"/></svg></a>"""


SOCIAL_ALT = "Call Sheet by pitch.dog: a printed call sheet listing three calls, soonest first, beside the words Grants, labs, markets and festivals, sorted by when they close."
SOCIAL = {"src": ""}
AS_OF = {"date": ""}


def page(*, title: str, description: str, path: str, body: str, css: str, js: str, social_title: str, robots: str = "index, follow, max-image-preview:large", jsonld: dict | None = None) -> str:
    canonical = ORIGIN + path
    ld = f'\n  <script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False, separators=(",", ":"))}</script>' if jsonld else ""
    return f"""<!doctype html>
<html lang="en" data-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" id="theme-color" content="#f6f5f8">
  <meta name="description" content="{h(description)}">
  <meta name="robots" content="{h(robots)}">
  <link rel="canonical" href="{h(canonical)}">
  <link rel="icon" id="theme-favicon" href="/assets/favicon-light.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="stylesheet" href="{TYPE_CSS}">
  <link rel="stylesheet" href="/assets/pitchdog-design-system.css?v=20260903">
  <link rel="stylesheet" href="/assets/site-contact.css?v=6538223cb868">
  <link rel="stylesheet" href="/assets/site-nav.css?v=b1964e6fe161">
  <link rel="stylesheet" href="{css}">
  <script src="/assets/pitchdog-design-system.js" defer></script>
  <script src="/assets/site-nav.js?v=a9c7b2eb02ac" defer></script>
  <script src="/assets/site-analytics.js?v=cd8760ab6615" data-analytics-replay="off" defer></script>
  <script type="module" src="{js}"></script>
  <meta property="og:site_name" content="pitch.dog">
  <meta property="og:title" content="{h(social_title)}">
  <meta property="og:description" content="{h(description)}">
  <meta property="og:url" content="{h(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="{ORIGIN}{SOCIAL['src']}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{h(SOCIAL_ALT)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{h(social_title)}">
  <meta name="twitter:description" content="{h(description)}">
  <meta name="twitter:image" content="{ORIGIN}{SOCIAL['src']}">
  <meta name="twitter:image:alt" content="{h(SOCIAL_ALT)}">
  <title>{h(title)}</title>{ld}
</head>
<body class="cs" data-as-of="{AS_OF['date']}">
  {SPRITE}
  <a class="skip" href="#main">Skip to content</a>
  {nav()}
  {body}
  {FOOTER}
</body>
</html>
"""


# ---------------------------------------------------------------- list page


def kinds_text(call: dict) -> str:
    return KIND_LABELS.get(call["kinds"][0], "") if call["kinds"] else ""


def tag_line(call: dict) -> str:
    parts = [kinds_text(call)]
    fmts = [FORMAT_LABELS[f] for f in call["formats"] if f in FORMAT_LABELS and f != "any"]
    parts.extend(fmts[:3])
    stages = [STAGE_LABELS[s] for s in call["stages"] if s in STAGE_LABELS and s != "any"]
    if stages:
        parts.append(" to ".join([stages[0], stages[-1]]) if len(stages) > 2 else " and ".join(stages))
    return " · ".join(p for p in parts if p)


def bucket(call: dict, as_of: str) -> tuple[str, str]:
    """(sort key, heading) for the no-JavaScript grouping.  The script regroups by the visitor's date."""
    closes = call.get("closes")
    if call["state"] == "closed_or_historical" or (closes and closes < as_of):
        return ("9", "Closed for this round")
    if not closes:
        return ("8", "No fixed date yet")
    days = (dt.date.fromisoformat(closes) - dt.date.fromisoformat(as_of)).days
    if days <= 7:
        return ("0", "Closes this week")
    d = dt.date.fromisoformat(closes)
    return (f"1{closes[:7]}", MONTHS[d.month - 1] + ("" if d.year == dt.date.fromisoformat(as_of).year else f" {d.year}"))


def where_chip(call: dict) -> str:
    w = call["where"]
    if w["scope"] == "worldwide" and not w.get("excludes"):
        return "Open worldwide"
    if w["scope"] == "unclear":
        return "Check who can apply"
    return ""


def rounds(call: dict) -> list[str]:
    """Every closing date the call has, so the page can move to the next round once one passes.
    Fee tiers (early, regular, late) are one round whose last tier is the cut-off."""
    deadlines = sorted({d["date"] for d in call["dates"] if d["role"] == "application_submission_deadline"})
    if not deadlines:
        deadlines = sorted({d["date"] for d in call["dates"] if d["role"] == "application_fee_tier_cutoff"})[-1:]
    return deadlines


def deadline_on(call: dict, iso: str | None) -> dict:
    return next((d for d in call["dates"] if d["date"] == iso and d["role"] in ("application_submission_deadline", "application_fee_tier_cutoff")), {}) if iso else {}


def org_line(call: dict) -> str:
    """Organiser and country, without repeating an organiser the title already names."""
    org = call.get("organiser") or ""
    norm = lambda t: "".join(ch for ch in t.lower() if ch.isalnum())
    if org and norm(call["title"]).startswith(norm(org)):
        org = ""
    return " · ".join(x for x in (org, call.get("organiser_country")) if x)


def call_row(call: dict, as_of: str) -> str:
    closes = call.get("closes")
    data = {
        "data-id": call["id"],
        "data-slug": call["slug"],
        "data-title": call["title"],
        "data-closes": closes or "",
        "data-opens": call.get("opens") or "",
        "data-state": call["state"],
        "data-kinds": " ".join(call["kinds"]),
        "data-formats": " ".join(call["formats"]),
        "data-stages": " ".join(call["stages"]),
        "data-rounds": " ".join(rounds(call)),
        "data-tiers": " ".join(sorted({d["date"] for d in call["dates"] if d["role"] == "application_fee_tier_cutoff"})),
        "data-time": deadline_on(call, closes).get("time") or "",
        "data-tz": deadline_on(call, closes).get("timezone") or "",
        "data-official": call.get("official_url") or "",
        "data-fee": call["fee"]["state"],
        "data-where": json.dumps({k: call["where"].get(k) for k in ("scope", "countries", "regions", "excludes", "confidence", "subnational")}, separators=(",", ":")),
        "data-search": " ".join(x for x in (call["title"], call.get("organiser"), call.get("organiser_country"), call["who"], call["get"], tag_line(call)) if x).lower(),
    }
    attrs = " ".join(f'{k}="{h(v)}"' for k, v in data.items())
    if closes:
        d = dt.date.fromisoformat(closes)
        when = f'<time class="cs-date" datetime="{closes}"><span class="cs-day">{d.day}</span><span class="cs-month">{MONTHS[d.month - 1][:3]}{"" if d.year == dt.date.fromisoformat(as_of).year else " " + str(d.year)}</span></time><span class="cs-left" data-left></span>'
    else:
        when = f'<span class="cs-date cs-date--none"><span class="cs-day">—</span><span class="cs-month">{"Rolling" if call["state"] == "watch_or_rolling" else "TBC"}</span></span><span class="cs-left" data-left></span>'
    chip = where_chip(call)
    return f"""<li class="cs-call" {attrs}>
        <div class="cs-when">{when}</div>
        <div class="cs-main">
          <h4 class="cs-title" data-pd-type="title.functional"><a href="{BASE}{h(call['slug'])}/">{h(call['title'])}</a></h4>
          <p class="cs-org" data-pd-type="body.small">{h(org_line(call))}</p>
          <p class="cs-tags" data-pd-type="metadata">{h(tag_line(call))}</p>
          <p class="cs-badges"><span class="cs-badge" data-badge-state hidden></span><span class="cs-badge cs-badge--tier" data-badge-tier hidden></span>{f'<span class="cs-badge cs-badge--checked" title="{h(call["recheck"].get("note") or "")}">Rechecked {h(day(call["recheck"]["checked_on"], with_year=False))}</span>' if call.get("recheck") else ''}{f'<span class="cs-badge cs-badge--place" data-badge-place>{h(chip)}</span>' if chip else '<span class="cs-badge cs-badge--place" data-badge-place hidden></span>'}</p>
        </div>
        <dl class="cs-facts">
          <div><dt data-pd-type="metadata">Who can apply</dt><dd data-pd-type="body.small">{h(call['who'])}</dd></div>
          <div><dt data-pd-type="metadata">You get</dt><dd data-pd-type="body.small">{h(call['get'])}</dd></div>
          <div class="cs-fact-fee"><dt data-pd-type="metadata">Entry fee</dt><dd data-pd-type="body.small" class="cs-fee cs-fee--{h(call['fee']['state'])}">{h(call['fee']['summary'])}</dd></div>
        </dl>
        <button class="cs-save" type="button" data-save="{h(call['slug'])}" aria-pressed="false" aria-label="Save {h(call['title'])} to my call sheet">{icon('bookmark', 'cs-icon cs-save-off')}{icon('bookmark-fill', 'cs-icon cs-save-on')}<span class="cs-save-text">Save</span></button>
      </li>"""


def chips(name: str, legend: str, options: list[tuple[str, str]], hint: str = "") -> str:
    boxes = "".join(f'<label class="cs-chip"><input type="checkbox" name="{name}" value="{h(v)}"><span>{h(t)}</span></label>' for v, t in options)
    return f'<fieldset class="cs-facet" data-facet="{name}"><legend data-pd-type="metadata">{h(legend)}</legend><div class="cs-chip-row">{boxes}</div>{f"<p class=\"cs-hint\" data-pd-type=\"body.small\">{h(hint)}</p>" if hint else ""}</fieldset>'


def recheck_paragraph(calls: list[dict]) -> str:
    rechecked = [c for c in calls if c.get("recheck")]
    if not rechecked:
        return ""
    when = max(c["recheck"]["checked_on"] for c in rechecked)
    changed = sum(1 for c in rechecked if c["recheck"]["status"] == "changed")
    moved = f" {changed} needed correcting and now follow the official page." if changed else ""
    return f'<p data-pd-type="body.reading">On {h(day(when))} we went back to the official page of every call closing in the next five weeks. {len(rechecked)} carry a <strong>Rechecked</strong> mark.{h(moved)} A few pages wouldn’t let us in; those keep their earlier date and no mark.</p>'


def list_page(calls: list[dict], as_of: str, css: str, js: str) -> str:
    live = [c for c in calls if c.get("closes") and c["closes"] >= as_of and c["state"] != "closed_or_historical"]
    week = [c for c in live if (dt.date.fromisoformat(c["closes"]) - dt.date.fromisoformat(as_of)).days <= 7]
    open_now = [c for c in live if c["state"] == "open_or_published" and (not c.get("opens") or c["opens"] <= as_of)]
    countries = {c["organiser_country"] for c in calls if c.get("organiser_country")}
    next_close = min((c["closes"] for c in live), default=None)
    groups: dict[tuple[str, str], list[dict]] = {}
    for call in sorted(calls, key=lambda c: (c.get("closes") or "9999", c["title"])):
        groups.setdefault(bucket(call, as_of), []).append(call)
    group_html = []
    for (key, heading), members in sorted(groups.items()):
        rows = "\n      ".join(call_row(c, as_of) for c in members)
        closed = key == "9"
        inner = f'<ol class="cs-list">\n      {rows}\n    </ol>'
        if closed:
            group_html.append(f'<details class="cs-group cs-group--closed" data-group="closed"><summary><h3 class="cs-group-title" data-pd-type="title.card">{h(heading)}</h3><span class="cs-group-count" data-pd-type="metadata">{len(members)}</span></summary>{inner}</details>')
        else:
            group_html.append(f'<section class="cs-group" data-group="{h(key)}"><header class="cs-group-head"><h3 class="cs-group-title" data-pd-type="title.card">{h(heading)}</h3><span class="cs-group-count" data-pd-type="metadata">{len(members)}</span></header>{inner}</section>')
    format_options = [(k, v) for k, v in FORMAT_LABELS.items() if k not in ("any", "other")]
    stage_options = [(k, v) for k, v in STAGE_LABELS.items() if k != "any"]
    body = f"""<main id="main">
    <section class="stage cs-stage" aria-labelledby="page-title">
      <div class="cs-stage-inner">
        <p class="hero-locator"><span class="hero-locator-mark" aria-hidden="true"></span><span>Free tool</span><a class="badge badge--beta" href="#faq">Beta</a><span class="hero-locator-rule" aria-hidden="true"></span><span class="hero-locator-dot" aria-hidden="true">·</span><span>Checked {h(day(as_of))}<span data-age="{h(as_of)}"></span></span></p>
        <h1 id="page-title" data-pd-type="display.hero">Call Sheet.</h1>
        <p class="cs-lede" data-pd-type="lead.hero">Film and TV grants, labs, markets and festivals, sorted by when they close. Who can apply, what you get, what it costs and what to bring.</p>
        <dl class="cs-board" aria-label="Today on the call sheet">
          <div><dt data-pd-type="metadata">Open now</dt><dd data-pd-type="metric" data-board="open">{len(open_now)}</dd></div>
          <div><dt data-pd-type="metadata">Closing in 7 days</dt><dd data-pd-type="metric" data-board="week">{len(week)}</dd></div>
          <div><dt data-pd-type="metadata">Next deadline</dt><dd data-pd-type="metric" data-board="next">{h(day(next_close, with_year=False)) if next_close else '—'}</dd></div>
          <div><dt data-pd-type="metadata">Organiser countries</dt><dd data-pd-type="metric">{len(countries)}</dd></div>
        </dl>
        <div class="button-row cs-stage-actions"><a class="button button--brand button--large" href="#find">Find your calls <span aria-hidden="true">↓</span></a><a class="button button--ghost button--large" href="#how">How we check</a></div>
      </div>
    </section>

    <section class="cs-promises" aria-label="The short version">
      <ul class="promises">
        <li><strong data-pd-type="label">Free, for real.</strong><span data-pd-type="body.small">No account, no paywall, no email gate.</span></li>
        <li><strong data-pd-type="label">Dated, every one.</strong><span data-pd-type="body.small">Each call says when we last checked it.</span></li>
        <li><strong data-pd-type="label">Honest about gaps.</strong><span data-pd-type="body.small">An unpublished fee stays unpublished. We never guess zero.</span></li>
      </ul>
    </section>

    <section class="cs-finder" id="find" aria-labelledby="find-title">
      <div class="cs-finder-inner">
        <div class="cs-finder-head">
          <p class="eyebrow" data-pd-type="metadata">Find your calls</p>
          <h2 id="find-title" data-pd-type="heading.subsection">What are you making?</h2>
        </div>
        <form class="cs-filters" id="cs-filters" role="search" aria-label="Filter the calls" data-requires-js>
          <div class="cs-filter-top">
            <div class="cs-field cs-field--search">
              <label for="cs-q" data-pd-type="metadata">Search</label>
              <div class="cs-input-wrap">{ph("magnifying-glass")}<input id="cs-q" name="q" type="search" autocomplete="off" spellcheck="false" placeholder="Try documentary, Kenya or Sundance"></div>
            </div>
            <div class="cs-field cs-field--place">
              <label for="cs-from" data-pd-type="metadata">Where are you based?</label>
              <div class="cs-input-wrap">{ph("map-pin")}<select id="cs-from" name="from"><option value="">Anywhere: show everything</option></select></div>
              <p class="cs-hint" data-pd-type="body.small">We hide calls that clearly rule you out, and flag the ones to check.</p>
            </div>
          </div>
          {chips("format", "Making", format_options)}
          {chips("stage", "Where it’s at", stage_options)}
          {chips("kind", "Looking for", list(KIND_FILTERS))}
          <fieldset class="cs-facet cs-facet--toggles" data-facet="only"><legend data-pd-type="metadata">Only show</legend><div class="cs-chip-row">
            <label class="cs-chip"><input type="checkbox" name="only" value="open"><span>Open now</span></label>
            <label class="cs-chip"><input type="checkbox" name="only" value="free"><span>Free to enter</span></label>
            <label class="cs-chip"><input type="checkbox" name="only" value="saved"><span>My saved calls</span></label>
          </div></fieldset>
        </form>
        <noscript><p class="cs-noscript" data-pd-type="body.default">Filters need JavaScript. Every call is listed below, soonest first.</p></noscript>
      </div>
    </section>

    <section class="cs-results" id="calls" aria-labelledby="calls-title">
      <div class="cs-results-head">
        <h2 id="calls-title" class="cs-count" data-pd-type="title.functional"><span data-count>{len(calls)}</span> calls, soonest first</h2>
        <p class="cs-count-note" data-pd-type="body.small" data-count-note aria-live="polite"></p>
        <button class="button button--small" type="button" data-clear hidden>Clear filters</button>
        <div class="cs-colheads" aria-hidden="true"><span data-pd-type="metadata">Closes</span><span data-pd-type="metadata">Call</span><span data-pd-type="metadata">Who can apply</span><span data-pd-type="metadata">You get</span><span data-pd-type="metadata">Entry fee</span><span></span></div>
      </div>
      <div class="cs-groups" id="cs-groups">
    {chr(10).join(group_html)}
      </div>
      <div class="cs-empty" data-empty hidden>
        <p data-pd-type="title.card">Nothing fits all of that.</p>
        <p data-pd-type="body.default">Loosen a filter, or <a href="mailto:hello@pitch.dog?subject=A%20call%20for%20Call%20Sheet">tell us about a call we’re missing</a>.</p>
      </div>
      <p class="cs-excluded" data-excluded hidden></p>
    </section>

    <section class="section section--split cs-how" id="how" aria-labelledby="how-title">
      <div class="section-head">
        <p class="eyebrow" data-pd-type="metadata">How we check</p>
        <h2 id="how-title" data-pd-type="heading.section">Where every line comes from.</h2>
      </div>
      <div class="section-body">
        <p data-pd-type="lead.section">Every call started on the organiser’s own pages: the call, the guidelines, the FAQ, and the form where we could reach it. In mid-October 2026 we read them for dates, money, fees, who can apply and what to send, and wrote down what we couldn’t find as carefully as what we could.</p>
        <p data-pd-type="body.reading">Then we kept the rough edges. A fee nobody has published says <strong>Not published</strong>, not free. When two official pages disagree on a date, the call page says so. When a rule is unclear, the call stays on your list with a flag instead of quietly disappearing.</p>
        {recheck_paragraph(calls)}
        <p data-pd-type="body.reading">Calls change between rounds, and the official page always wins. Use this to decide what to check next, then check it there.</p>
      </div>
    </section>

    <section class="section cs-principles" aria-labelledby="principles-title">
      <div class="section-head section-head--wide">
        <p class="eyebrow" data-pd-type="metadata">The whole deal</p>
        <h2 id="principles-title" data-pd-type="heading.section">Free. Dated. Unranked. Private.</h2>
      </div>
      <ul class="cs-cards">
        <li class="cs-card cs-card--powder"><p class="eyebrow" data-pd-type="metadata">Free</p><h3 data-pd-type="title.card">No price, no account.</h3><p data-pd-type="body.default">Nothing here costs money, and nothing on the list paid to be on it.</p></li>
        <li class="cs-card cs-card--mint"><p class="eyebrow" data-pd-type="metadata">Dated</p><h3 data-pd-type="title.card">Every date says what it is.</h3><p data-pd-type="body.default">Opening, deadline, fee change, selection or event, never one dressed up as another. Each call shows the day we last checked it.</p></li>
        <li class="cs-card cs-card--lilac"><p class="eyebrow" data-pd-type="metadata">Unranked</p><h3 data-pd-type="title.card">No prestige score, no odds.</h3><p data-pd-type="body.default">The closing date sets the order. You set the priorities.</p></li>
        <li class="cs-card cs-card--blush"><p class="eyebrow" data-pd-type="metadata">Private</p><h3 data-pd-type="title.card">Your searches stay with you.</h3><p data-pd-type="body.default">Filters live in the page address, saved calls in this browser. Neither reaches us.</p></li>
      </ul>
    </section>

    <section class="section section--split" id="faq" aria-labelledby="faq-title">
      <div class="section-head">
        <p class="eyebrow" data-pd-type="metadata">Questions</p>
        <h2 id="faq-title" data-pd-type="heading.section">Before you ask.</h2>
      </div>
      <div class="faq">
        <details><summary data-pd-type="title.functional">Is it really free?</summary><p data-pd-type="body.default">Yes. No price, no account and no email gate. Finding the next call shouldn’t take a week of open tabs, and we’d rather you spent that week on the application.</p></details>
        <details><summary data-pd-type="title.functional">How current is it?</summary><p data-pd-type="body.default">Every call shows the day it was last checked: mid-October 2026 for most, later where we’ve rechecked the official page. Dates and terms change between rounds, so treat this as the map and the official page as the ground.</p></details>
        <details><summary data-pd-type="title.functional">Does a match mean I’m eligible?</summary><p data-pd-type="body.default">No. It means nothing we found rules you out. Eligibility lives in the details: where you live versus your passport, you versus your company, how much of the budget is already raised. Each call page lists what to check before you apply.</p></details>
        <details><summary data-pd-type="title.functional">Why isn’t my festival or fund here?</summary><p data-pd-type="body.default">This is a curated set of {len(calls)} calls, not a census. If one belongs here, send the link to <a href="mailto:hello@pitch.dog?subject=A%20call%20for%20Call%20Sheet">hello@pitch.dog</a> and we’ll take a look.</p></details>
        <details><summary data-pd-type="title.functional">Do you rank the calls?</summary><p data-pd-type="body.default">No. There’s no prestige score and no guess at your odds. Calls are sorted by closing date, because the deadline is the one thing that won’t wait.</p></details>
        <details><summary data-pd-type="title.functional">What happens to what I type?</summary><p data-pd-type="body.default">Nothing leaves your browser. Filters are kept in the page address, so you can bookmark or share a search. Saved calls stay in this browser until you clear them. Like every pitch.dog page, this one counts visits, without your searches or saved calls.</p></details>
        <details><summary data-pd-type="title.functional">I found a mistake.</summary><p data-pd-type="body.default">Thank you. Every call page has a button that starts an email to us with the call already named. Tell us what changed and where you saw it.</p></details>
        <details><summary data-pd-type="title.functional">Can I use the data?</summary><p data-pd-type="body.default">You can read all of it at <a href="{BASE}data/calls.json">calls.json</a>. If you’d like to reuse it somewhere, ask us first: we haven’t picked a licence yet.</p></details>
      </div>
    </section>

    <section class="brand-block" id="pitchdog" aria-labelledby="brand-title">
      <div class="brand-glow" aria-hidden="true"></div>
      <div class="brand-inner">
        <div class="brand-copy">
          <p class="brand-eyebrow" data-pd-type="metadata">Made by pitch.dog</p>
          <h2 id="brand-title" data-pd-type="display.chapter">Found the call? <em data-pd-emphasis="head-italic">Now the pitch.</em></h2>
          <span class="brand-rule" aria-hidden="true"></span>
          <p data-pd-type="lead.section">Most of these calls ask for a deck, a treatment or a pitch. Making those is our day job: pitch decks, director’s treatments and show bibles for film and TV, for twelve years. If yours could use a sharper story or a better look before it goes in, show us.</p>
          <div class="button-row">
            <a class="button button--brand button--large" href="/work/">See our work <span aria-hidden="true">→</span></a>
            <a class="button button--ghost button--large" href="/#book">Book a call</a>
            <a class="button button--ghost button--large" href="mailto:hello@pitch.dog">Email us</a>
          </div>
          <p class="brand-note" data-pd-type="body.small">No pressure, no strings. The list stays free either way.</p>
        </div>
        <div class="brand-side">
          <a class="brand-mark" href="/" aria-label="pitch.dog home"><img src="/assets/pitchdog-logomark.svg" width="220" height="220" alt=""></a>
          <p class="brand-tagline" data-pd-type="title.card">Your pitch’s <em data-pd-emphasis="head-italic">best friend.</em></p>
        </div>
        <dl class="brand-facts">
          <div><dt data-pd-type="metadata">Decks designed</dt><dd data-pd-type="metric">220+</dd></div>
          <div><dt data-pd-type="metadata">Years at it</dt><dd data-pd-type="metric">12</dd></div>
          <div><dt data-pd-type="metadata">Countries</dt><dd data-pd-type="metric">20+</dd></div>
          <div><dt data-pd-type="metadata">Very good girls</dt><dd data-pd-type="metric">3</dd></div>
        </dl>
      </div>
    </section>
  </main>

  {sheet_ui()}"""
    jsonld = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Call Sheet",
        "url": ORIGIN + BASE,
        "applicationCategory": "ReferenceApplication",
        "operatingSystem": "Any modern web browser",
        "isAccessibleForFree": True,
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        "description": "A free list of film and TV grants, labs, markets and festivals, sorted by closing date, with who can apply, what you get, fees and what to bring.",
        "image": ORIGIN + SOCIAL["src"],
        "codeRepository": "https://github.com/bomkino/call-sheet",
        "creator": {"@id": ORIGIN + "/#organization"},
    }
    return page(
        title="Call Sheet — film and TV grants, labs and festivals by deadline, free · pitch.dog",
        description=f"A free, dated list of {len(calls)} film and TV grants, labs, markets and festivals, sorted by when they close: who can apply, what you get, what it costs and what to bring.",
        path=BASE,
        body=body,
        css=css,
        js=js,
        social_title="Call Sheet — free, by pitch.dog",
        jsonld=jsonld,
    )


def sheet_ui() -> str:
    return f"""<div class="cs-sheetbar" data-sheetbar hidden>
    <button class="cs-sheetbar-button" type="button" data-open-sheet>{icon('bookmark-fill')}<span><strong data-sheet-count>0 calls</strong><span data-sheet-next></span></span><span class="cs-sheetbar-open" data-pd-type="metadata">My call sheet</span></button>
  </div>
  <dialog class="cs-sheet" id="cs-sheet" aria-labelledby="cs-sheet-title">
    <div class="cs-sheet-inner">
      <header class="cs-sheet-head">
        <div><p class="eyebrow" data-pd-type="metadata">Saved in this browser only</p><h2 id="cs-sheet-title" data-pd-type="heading.subsection">My call sheet.</h2></div>
        <button class="cs-icon-button" type="button" data-close-sheet aria-label="Close my call sheet">{icon('close')}</button>
      </header>
      <p class="cs-sheet-intro" data-pd-type="body.small">Your shortlist, soonest first. It stays on this device; we never see it.</p>
      <ol class="cs-sheet-list" data-sheet-list></ol>
      <p class="cs-sheet-empty" data-sheet-empty data-pd-type="body.default">Nothing saved yet. Tap <strong>Save</strong> on any call to start your sheet.</p>
      <footer class="cs-sheet-actions">
        <button class="button button--brand" type="button" data-sheet-ics>{icon('calendar')}Add deadlines to calendar</button>
        <button class="button" type="button" data-sheet-print>{icon('printer')}Print</button>
        <button class="button" type="button" data-sheet-share>{icon('link')}Copy share link</button>
        <button class="button button--ghost cs-sheet-clear" type="button" data-sheet-clear>Clear</button>
      </footer>
      <p class="cs-sheet-status" data-sheet-status role="status" data-pd-type="body.small"></p>
    </div>
  </dialog>
  <div class="cs-print" data-print aria-hidden="true"></div>"""


# ---------------------------------------------------------------- call pages


def join_names(names: list[str]) -> str:
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


def where_detail(call: dict) -> str:
    w = call["where"]
    if w["scope"] == "worldwide":
        excluded = [COUNTRY_NAMES.get(c, c) for c in w.get("excludes", [])]
        parts = ["Open to applicants anywhere" + (f", except {join_names(excluded)}" if excluded else "") + "."]
    elif w["scope"] == "listed":
        places = [COUNTRY_NAMES.get(c, c) for c in w.get("countries", [])] + [REGION_NAMES.get(r, r) for r in w.get("regions", [])]
        place = join_names(places) + (f" ({w['subnational']})" if w.get("subnational") else "")
        parts = [f"Limited to {place}."]
    else:
        parts = ["Our notes don’t say where applicants must be based. Check the official rules."]
    parts.append(TEST_SENTENCES.get(w.get("test") or "unknown", ""))
    if w.get("identity"):
        parts.append(f"Also limited to {w['identity'][0].lower() + w['identity'][1:]}.")
    if w.get("confidence") == "partial":
        parts.append("The source only partly spells this out, so read the official rules.")
    return h(" ".join(p for p in parts if p))


def readable_dates(text: str | None) -> str | None:
    """'until 2026-11-06' reads as 'until 6 Nov'."""
    if not text:
        return text
    import re
    return re.sub(r"\b(\d{4}-\d{2}-\d{2})\b", lambda m: day(m.group(1), with_year=False), text)


FRIENDLY_ZONES = {
    "America/Los_Angeles": "Pacific Time (US)",
    "America/Denver": "Mountain Time (US)",
    "America/Chicago": "Central Time (US)",
    "America/New_York": "Eastern Time (US)",
    "America/Toronto": "Eastern Time (Toronto)",
    "Europe/London": "UK time",
    "Europe/Paris": "Central European Time",
    "Europe/Berlin": "Central European Time",
    "Europe/Helsinki": "Finnish time",
    "Australia/Sydney": "Sydney time",
    "Pacific/Auckland": "New Zealand time",
}


def tz_label(tz: str | None) -> str | None:
    if not tz:
        return None
    if tz in FRIENDLY_ZONES:
        return FRIENDLY_ZONES[tz]
    if tz.startswith("Etc/"):
        return tz[4:]
    if "/" in tz:
        return tz.rsplit("/", 1)[1].replace("_", " ") + " time"
    return tz


def dates_block(call: dict) -> str:
    if not call["dates"]:
        return '<p data-pd-type="body.default">No dates published in our notes yet. Watch the official page for the next round.</p>'
    rows = []
    for d in call["dates"]:
        when = h(long_day(d["date"]))
        clock = " ".join(x for x in (d.get("time"), tz_label(d.get("timezone"))) if x)
        rows.append(f"""<li class="cs-timeline-item cs-role--{h(d['role'])}" data-date="{h(d['date'])}">
            <span class="cs-timeline-role" data-pd-type="metadata">{h(d['role_label'])}</span>
            <span class="cs-timeline-date" data-pd-type="title.functional"><time datetime="{h(d['date'])}">{when}</time></span>
            <span class="cs-timeline-note" data-pd-type="body.small">{h(' · '.join(x for x in (d.get('label'), clock, d.get('time_note')) if x))}</span>
          </li>""")
    return f'<ol class="cs-timeline">{"".join(rows)}</ol>'


def fees_block(call: dict) -> str:
    fee = call["fee"]
    if not fee["items"]:
        if fee.get("checked_on"):
            return f'<p data-pd-type="body.default">The official page didn’t state an entry fee when we read it on {h(day(fee["checked_on"]))}. That isn’t the same as free: check the form before you count on it.</p>'
        return '<p data-pd-type="body.default">No entry fee is published in our notes. That isn’t the same as free: check the form before you count on it.</p>'
    def rows(stage: str) -> str:
        items = [i for i in fee["items"] if i["stage"] == stage]
        return "".join(f'<tr><th scope="row" data-pd-type="body.small">{h(readable_dates(i["label"]) or ("Entry fee" if stage == "application" else "Cost"))}</th><td data-pd-type="data">{h(i["amount"] or ("Free" if i["state"] == "free_or_explicit_zero" else "Not published"))}</td><td data-pd-type="body.small">{h(i["note"] or "")}</td></tr>' for i in items)
    out = []
    app = rows("application")
    if app:
        out.append(f'<h3 class="cs-subhead" data-pd-type="metadata">To apply</h3><table class="cs-table"><tbody>{app}</tbody></table>')
    sel = rows("selected")
    if sel:
        out.append(f'<h3 class="cs-subhead" data-pd-type="metadata">If you’re selected, or later</h3><table class="cs-table"><tbody>{sel}</tbody></table>')
    if fee.get("checked_on"):
        out.append(f'<p class="cs-fineprint" data-pd-type="body.small">From the official page, {h(day(fee["checked_on"]))}.</p>')
    return "".join(out)


def money_block(call: dict) -> str:
    norm = lambda x: "".join(ch for ch in (x or "").lower() if ch.isalnum())
    get = norm(call["get"])
    lines = [m for m in call["money"] if m.get("value") or (m.get("note") and norm(m["note"])[:40] not in get and get[:40] not in norm(m["note"]))]
    items = "".join(f'<tr><th scope="row" data-pd-type="body.small">{h("Details" if m["label"] == "Note" else m["label"])}</th><td data-pd-type="data">{h(m["value"] or "")}</td><td data-pd-type="body.small">{h(m["note"] or "")}</td></tr>' for m in lines)
    table = f'<table class="cs-table"><tbody>{items}</tbody></table>' if items else ""
    return f'<p data-pd-type="lead.section" class="cs-get">{h(call["get"])}</p>{table}<p class="cs-fineprint" data-pd-type="body.small">Amounts stay in the currency the organiser uses. Caps, totals and alternatives are listed as published; don’t add them up.</p>'


def bring_block(call: dict) -> str:
    if not call["bring"]:
        return '<p data-pd-type="body.default">The materials list isn’t in our notes. The application form will have it.</p>'
    items = "".join(f'<li><span data-pd-type="body.default">{("<strong>" + h(b["item"]) + "</strong>") if len(b["item"]) <= 60 else h(b["item"])}{(" · " + h(b["limit"])) if b.get("limit") else ""}{" <em>(optional)</em>" if b.get("optional") else ""}</span>{f"<span class=\"cs-bring-note\" data-pd-type=\"body.small\">{h(b['note'])}</span>" if b.get("note") else ""}</li>' for b in call["bring"])
    return f'<ul class="cs-bring">{items}</ul>'


def checks_block(call: dict) -> str:
    qs = list(call["check_yourself"])
    if not qs:
        return ""
    items = "".join(f'<li><span class="cs-check-q" data-pd-type="body.default">{h(q)}</span><span class="cs-check-a" role="group" aria-label="Your answer"><label><input type="radio" name="q{i}" value="yes"><span>Yes</span></label><label><input type="radio" name="q{i}" value="no"><span>No</span></label><label><input type="radio" name="q{i}" value="unsure"><span>Not sure</span></label></span></li>' for i, q in enumerate(qs))
    return f"""<div class="cs-selfcheck" data-selfcheck>
          <h3 class="cs-subhead" data-pd-type="metadata">Check yourself</h3>
          <p data-pd-type="body.small">Questions from the published rules. Your answers stay on this page and vanish when you leave.</p>
          <ol class="cs-checklist">{items}</ol>
          <p class="cs-selfcheck-result" data-selfcheck-result role="status" data-pd-type="body.default"></p>
        </div>"""


def block(key: str, title: str, content: str) -> str:
    return f'<section class="cs-block cs-block--{key}" aria-labelledby="{key}-title"><h2 id="{key}-title" data-pd-type="title.card">{h(title)}</h2><div class="cs-block-body">{content}</div></section>'


def call_page(call: dict, by_slug: dict[str, dict], as_of: str, css: str, js: str) -> str:
    kind = kinds_text(call)
    closes = call.get("closes")
    path = f"{BASE}{call['slug']}/"
    deadline = deadline_on(call, closes)
    clock = " ".join(x for x in (deadline.get("time"), tz_label(deadline.get("timezone")), deadline.get("time_note")) if x)
    later_rounds = sorted({d["date"] for d in call["dates"] if d["role"] == "application_submission_deadline" and closes and d["date"] > closes})
    status = f"""<div class="cs-countdown" data-countdown data-closes="{h(closes or '')}" data-opens="{h(call.get('opens') or '')}" data-state="{h(call['state'])}" data-rounds="{h(' '.join(rounds(call)))}" data-time="{h(deadline.get('time') or '')}" data-tz="{h(deadline.get('timezone') or '')}">
          <p class="cs-countdown-big" data-pd-type="heading.subsection" data-countdown-text>{h(('Closes ' + day(closes)) if closes else ('Rolling, or no fixed date' if call['state'] == 'watch_or_rolling' else 'Dates to come'))}</p>
          <p class="cs-countdown-when" data-pd-type="body.default" data-countdown-when>{h(long_day(closes) + (', ' + clock if clock else '')) if closes else 'Watch the official page for the next round.'}{h('. Next round: ' + ', '.join(day(d) for d in later_rounds[:2])) if later_rounds else ''}</p>
          <p class="cs-countdown-local" data-pd-type="body.small" data-local hidden></p>
          {f'<p class="cs-recheck" data-pd-type="body.small">{icon("check")}<span>Rechecked on the <a href="{h(call["recheck"].get("url") or call.get("official_url") or "")}" rel="noopener">official page</a>, {h(day(call["recheck"]["checked_on"]))}. {h(call["recheck"].get("note") or "")}</span></p>' if call.get("recheck") else ''}
        </div>"""
    caution_items = ([f'<li data-pd-type="body.default">{h(call["caution"])}</li>'] if call.get("caution") else []) + [f'<li data-pd-type="body.default">{h(q["question"])}{f" <span class=\"cs-meanwhile\">Meanwhile: {h(q['meanwhile'])}</span>" if q.get("meanwhile") else ""}</li>' for q in call["open_questions"]]
    caution = f'<aside class="note cs-before" aria-labelledby="before-title"><div><h2 id="before-title" data-pd-type="title.functional">Before you apply</h2><ul>{"".join(caution_items)}</ul></div></aside>' if caution_items else ""
    terms = "".join(f'<tr><th scope="row" data-pd-type="body.small">{h(t["label"])}</th><td data-pd-type="body.small">{h(t["text"])}</td></tr>' for t in call["terms"])
    sources = "".join(f'<li><a href="{h(s["url"])}" rel="noopener" data-pd-type="body.default">{h(s["title"])} {ph("arrow-up-right")}</a><span data-pd-type="body.small">{h(("Checked " + day(s["checked_on"])) if s.get("checked_on") else "")}{h(". " + s["note"]) if s.get("note") else ""}</span></li>' for s in call["sources"])
    related = [by_slug[r] for r in call["related"] if r in by_slug]
    related_html = "".join(f'<li><a href="{BASE}{h(r["slug"])}/" data-pd-type="title.functional">{h(r["title"])}</a><span data-pd-type="body.small">{h(("Closes " + day(r["closes"])) if r.get("closes") else "No fixed date")}</span></li>' for r in related)
    recheck = call.get("recheck")
    checked = f"Checked {day(call['checked_on'])}" + (f" · rechecked {day(recheck['checked_on'])}" if recheck else "")
    mail_subject = f"Call Sheet correction: {call['title']}"
    mail_body = f"Call: {call['title']}\nPage: {ORIGIN}{path}\n\nWhat's changed, and where did you see it?\n"
    from urllib.parse import quote
    mailto = f"mailto:hello@pitch.dog?subject={quote(mail_subject)}&body={quote(mail_body)}"
    facts = [
        ("Who can apply", call["who"]),
        ("You get", call["get"]),
        ("Entry fee", call["fee"]["summary"]),
        ("Making", ", ".join(FORMAT_LABELS[f] for f in call["formats"] if f in FORMAT_LABELS) or "Not stated in our notes"),
        ("Stage", ", ".join(STAGE_LABELS[s] for s in call["stages"] if s in STAGE_LABELS) or "Not stated in our notes"),
        ("Type", ", ".join(KIND_LABELS[k] for k in call["kinds"] if k in KIND_LABELS)),
    ]
    facts_html = "".join(f'<div><dt data-pd-type="metadata">{h(k)}</dt><dd data-pd-type="body.default">{h(v)}</dd></div>' for k, v in facts)
    portal = f'<a class="button button--large" href="{h(call["portal_url"])}" rel="noopener">Submission portal {ph("arrow-up-right")}</a>' if call.get("portal_url") else ""
    body = f"""<main id="main" class="cs-callpage" data-call="{h(call['slug'])}" data-title="{h(call['title'])}" data-closes="{h(closes or '')}" data-official="{h(call.get('official_url') or '')}">
    <article class="cs-article" aria-labelledby="call-title">
      <nav class="cs-crumbs" aria-label="Breadcrumb"><a href="{BASE}" data-back>{ph("arrow-left")}<span>All calls</span></a></nav>
      <header class="cs-callhead">
        <p class="hero-locator cs-locator"><span class="hero-locator-mark" aria-hidden="true"></span><span>{h(kind)}</span>{f'<span aria-hidden="true">·</span><span>{h(call["organiser_country"])}</span>' if call.get("organiser_country") else ''}<span class="hero-locator-rule" aria-hidden="true"></span><span class="hero-locator-dot" aria-hidden="true">·</span><span>{h(checked)}<span data-age="{h((recheck or {}).get('checked_on') or call['checked_on'])}"></span></span></p>
        <h1 id="call-title" data-pd-type="heading.section">{h(call['title'])}</h1>
        <p class="cs-callorg" data-pd-type="lead.section">{h(call.get('organiser') or '')}</p>
        {status}
        <div class="button-row cs-callactions">
          {f'<a class="button button--brand button--large" href="{h(call["official_url"])}" rel="noopener">Official page {ph("arrow-up-right")}</a>' if call.get("official_url") else ''}
          {portal}
          <button class="button button--large cs-save cs-save--big" type="button" data-save="{h(call['slug'])}" aria-pressed="false">{icon('bookmark', 'cs-icon cs-save-off')}{icon('bookmark-fill', 'cs-icon cs-save-on')}<span class="cs-save-text">Save</span></button>
          {f'<button class="button button--large" type="button" data-ics>{icon("calendar")}Add to calendar</button>' if closes else ''}
        </div>
      </header>

      <dl class="cs-sheetgrid">{facts_html}</dl>

      {caution}

      {block("dates", "Dates", dates_block(call))}
      {block("who", "Who can apply", f'<p data-pd-type="lead.section">{h(call["who"])}</p><p class="cs-where" data-pd-type="body.default">{where_detail(call)}</p>{checks_block(call)}')}
      {block("get", "What you get", money_block(call))}
      {block("cost", "What it costs", fees_block(call))}
      {block("bring", "What to bring", bring_block(call))}
      {block("terms", "Terms to read first", f'<table class="cs-table cs-table--two"><tbody>{terms}</tbody></table><p class="cs-fineprint" data-pd-type="body.small">Our notes, not legal advice. Read the contract before you accept a place or grant any rights.</p>') if terms else ''}
      {block("sources", "Where this comes from", f'<ul class="cs-sourcelist">{sources}</ul><div class="cs-report"><p data-pd-type="body.default">Spotted something out of date?</p><a class="button button--small" href="{h(mailto)}">{icon("mail")}Tell us</a></div>')}
      {block("related", "Related calls", f'<ul class="cs-related">{related_html}</ul>') if related_html else ''}
      <p class="cs-disclaimer" data-pd-type="body.small">A research snapshot, not legal advice or a promise that the call is open. The official page always wins.</p>
    </article>
  </main>

  {sheet_ui()}"""
    noindex = call["state"] == "closed_or_historical"
    jsonld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "WebPage", "@id": ORIGIN + path, "url": ORIGIN + path, "name": call["title"], "isPartOf": {"@id": ORIGIN + BASE}, "dateModified": (recheck or {}).get("checked_on") or call["checked_on"]},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Call Sheet", "item": ORIGIN + BASE},
                {"@type": "ListItem", "position": 2, "name": call["title"], "item": ORIGIN + path},
            ]},
        ],
    }
    description = f"{call['title']}: {call['who']}. {call['get']}." + (f" Closes {day(closes)}." if closes else "") + " Dates, fees and what to bring, on Call Sheet by pitch.dog."
    return page(
        title=f"{call['title']} — {('closes ' + day(closes)) if closes else 'Call Sheet'} · pitch.dog",
        description=description[:300],
        path=path,
        body=body,
        css=css,
        js=js,
        social_title=f"{call['title']} · Call Sheet",
        robots="noindex, follow" if noindex else "index, follow, max-image-preview:large",
        jsonld=jsonld,
    )


def git_commit() -> dict[str, Any]:
    try:
        sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=REPO, capture_output=True, text=True, check=True).stdout.strip()
        dirty = bool(subprocess.run(["git", "status", "--porcelain"], cwd=REPO, capture_output=True, text=True, check=True).stdout.strip())
    except (OSError, subprocess.CalledProcessError):
        sha, dirty = None, None
    return {"commit": sha, "dirty": dirty}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=REPO / "dist-pitchdog")
    args = parser.parse_args(argv)
    payload = json.loads((REPO / "data/calls.json").read_text(encoding="utf-8"))
    calls = payload["calls"]
    rechecks = [c["recheck"]["checked_on"] for c in calls if c.get("recheck")]
    as_of = max([payload["research_as_of"], *rechecks])

    AS_OF["date"] = as_of
    out = args.out
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    css = asset("call-sheet.css", out)
    js = asset("call-sheet.js", out)
    SOCIAL["src"] = asset("social/call-sheet-social-card.png", out)
    (out / "index.html").write_text(list_page(calls, as_of, css, js), encoding="utf-8")
    by_slug = {c["slug"]: c for c in calls}
    for call in calls:
        target = out / call["slug"] / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(call_page(call, by_slug, as_of, css, js), encoding="utf-8")
    urls = [(BASE, as_of)] + [(f"{BASE}{c['slug']}/", (c.get("recheck") or {}).get("checked_on") or c["checked_on"]) for c in calls if c["state"] != "closed_or_historical"]
    sitemap = "".join(f"<url><loc>{ORIGIN}{h(u)}</loc><lastmod>{d}</lastmod></url>" for u, d in urls)
    (out / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sitemap}</urlset>\n', encoding="utf-8")
    (out / "data").mkdir()
    shutil.copyfile(REPO / "data/calls.json", out / "data/calls.json")
    build = {"name": "Call Sheet", "source": "https://github.com/bomkino/call-sheet", **git_commit(), "data_as_of": as_of, "calls": len(calls), "built_with": "python3 tools/build_site.py"}
    (out / "BUILD.json").write_text(json.dumps(build, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"out": str(out), "pages": len(calls) + 1, "as_of": as_of}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
