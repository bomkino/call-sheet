#!/usr/bin/env python3
"""Export Call Sheet's public dataset from the private Open Call Foundation.

    python3 tools/export_public_data.py --foundation PATH/TO/foundation

Reads the foundation's built data/ tables, this repository's hand-reviewed
data/overlay.json and dated data/rechecks.json, and writes data/calls.json:
one plain record per route, holding only what the public page shows.  The
foundation itself (source packs, research workbooks, scenario matrices)
never leaves the private repository.

Python standard library only.  The output is deterministic for a given input.
"""
from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[1]
SCHEMA_VERSION = "1.0.0"

# Submission platforms and aggregators: useful for applying, never "the official page".
PORTAL_HOSTS = ("filmfreeway.com", "festhome.com", "shortfilmdepot.com", "withoutabox.com")

ROLE_ORDER = ("opening", "prerequisite", "application_fee_tier_cutoff", "application_submission_deadline", "selection", "payment", "event_or_context")
ROLE_LABELS = {
    "opening": "Opens",
    "prerequisite": "Do first",
    "application_fee_tier_cutoff": "Fee tier ends",
    "application_submission_deadline": "Closes",
    "selection": "Selection news",
    "payment": "Payment due",
    "event_or_context": "Event",
}
RIGHTS_LABELS = {
    "rights": "Rights",
    "rights_mode": None,
    "attendance": "Attendance",
    "travel": "Travel",
    "contract_note": "Contract",
    "economic_obligations": "Money terms",
    "premiere": "Premiere",
    "credit": "Credit",
    "licence": "Licence",
    "license": "Licence",
    "exclusivity": "Exclusivity",
    "promotion": "Promotion",
    "reporting": "Reporting",
    "delivery": "Delivery",
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def as_list(value: Any) -> list[Any]:
    if value in (None, ""):
        return []
    return value if isinstance(value, list) else [value]


def clean(text: Any) -> str | None:
    if text in (None, "", [], {}):
        return None
    value = re.sub(r"\s+", " ", str(text)).strip()
    return value or None


def human(text: Any) -> str | None:
    """Plain text only: machine tokens such as unknown_not_zero are not notes."""
    value = clean(text)
    if not value or re.fullmatch(r"[a-z0-9_]+", value):
        return None
    return value


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text.replace("&", " and ").replace("×", " x ")).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", text)[:80].strip("-") or "call"


def host(url: str) -> str:
    match = re.match(r"https?://([^/]+)", url or "")
    return (match.group(1).lower().removeprefix("www.") if match else "")


def money(amount: Any, currency: Any) -> str | None:
    if amount in (None, "", False):
        return None
    try:
        value = float(str(amount).replace(",", ""))
    except ValueError:
        return clean(amount)
    shown = f"{value:,.0f}" if value == int(value) else f"{value:,.2f}"
    symbols = {"USD": "$", "EUR": "€", "GBP": "£"}
    cur = str(currency or "").upper()
    if cur in symbols:
        return f"{symbols[cur]}{shown}"
    return f"{cur} {shown}".strip()


def rights_lines(rows: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Turn route-level rights summaries (often JSON strings) into labelled lines."""
    lines: list[dict[str, str]] = []
    seen: set[str] = set()

    def add(label: str, text: Any) -> None:
        text = clean(text)
        if not text or text.lower() in {"unknown", "not_recorded", "review_terms", "none"} or text in seen:
            return
        seen.add(text)
        lines.append({"label": label, "text": text})

    for row in rows:
        summary = row.get("summary")
        parsed = None
        if isinstance(summary, str) and summary.strip().startswith("{"):
            try:
                parsed = json.loads(summary)
            except json.JSONDecodeError:
                parsed = None
        if isinstance(parsed, dict):
            for block in parsed.values():
                if not isinstance(block, dict):
                    continue
                for key, value in block.items():
                    label = RIGHTS_LABELS.get(key, key.replace("_", " ").capitalize())
                    if label and isinstance(value, (str, int, float)):
                        add(label, value)
        else:
            add(clean(row.get("trigger")) and str(row.get("trigger")).replace("_", " ").capitalize() or "Terms", summary)
    return lines[:8]


def fee_summary(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Application fees first; selected-participant charges kept separate."""
    items = []
    has_components = any(not str(r.get("id", "")).endswith(":canonical") for r in rows)
    for row in rows:
        if has_components and str(row.get("id", "")).endswith(":canonical"):
            continue  # an opportunity-level summary; the component rows say it better
        stage = str(row.get("stage") or "").strip()
        raw = row.get("raw") if isinstance(row.get("raw"), dict) else {}
        described = " ".join(str(x or "") for x in (stage, row.get("unit"), raw.get("kind"), raw.get("component"), raw.get("category")))
        # Entry fees only.  Deposits, accreditation, tuition, penalties and
        # production-triggered contributions are real costs, but not the price
        # of applying, so they sit with the costs for selected participants.
        selected = bool(re.search(r"select|participa|accredit|registration|hotel|attend|deposit|tuition|housing|penalt|contingen|production|withdraw|travel", described, re.I))
        label_parts = [clean(raw.get("category")), clean(raw.get("kind") or raw.get("component"))]
        unit = str(row.get("unit") or "")
        if unit.lower() not in {"per_project", "per_application", "unknown", "per project", "standard", ""}:
            label_parts.append(clean(unit))
        if stage.lower() not in {"application", "selected", ""} and not any(stage == x for x in label_parts):
            label_parts.append(clean(stage))
        label = " · ".join(dict.fromkeys(x for x in label_parts if x)) or None
        if label and raw.get("date") and re.match(r"^\d{4}-\d{2}-\d{2}$", str(raw["date"])):
            label = f"{label} (until {raw['date']})"
        item = {
            "stage": "selected" if selected else "application",
            "label": label,
            "amount": money(row.get("amount"), row.get("currency")),
            "state": row.get("normalized_state") or "unknown_or_conditional",
            "note": human(row.get("condition")),
        }
        if item["amount"] is None and item["state"] == "unknown_or_conditional" and not item["note"]:
            continue
        items.append(item)
    application = [i for i in items if i["stage"] == "application"]
    priced = [i for i in application if i["state"] == "priced"]
    free = [i for i in application if i["state"] == "free_or_explicit_zero"]
    if priced:
        state = "priced"
    elif free and not any(i["state"] == "unknown_or_conditional" for i in application):
        state = "free"
    else:
        state = "unknown"
    key = lambda i: (i["stage"], i["label"] or "", i["amount"] or "", i["note"] or "")
    unique = {key(i): i for i in items}
    if state == "priced":
        values = sorted({i["amount"] for i in priced if i["amount"]}, key=lambda a: float(re.sub(r"[^0-9.]", "", a) or 0))
        prefixes = {re.match(r"^[^0-9]*", v).group(0) for v in values}
        if len(values) == 1:
            summary = values[0]
        elif len(prefixes) == 1:
            summary = f"{values[0]}–{values[-1][len(prefixes.pop()):]}"
        else:
            summary = "Varies, see the fees"
    elif state == "free":
        summary = "Free to enter"
    else:
        summary = "Not published"
    return {"state": state, "summary": summary, "items": [unique[k] for k in sorted(unique)][:8]}


def amount_lines(rows: list[dict[str, Any]]) -> list[dict[str, str]]:
    lines, seen = [], set()
    for row in rows:
        label = clean(row.get("label") or row.get("unit_label"))
        value = money(row.get("amount"), row.get("currency"))
        if value and row.get("amount_min") not in (None, ""):
            value = f"{money(row.get('amount_min'), row.get('currency'))}–{value}"
        note = clean(row.get("condition") or row.get("summary"))
        if not (value or note):
            continue
        key = (label, value, note)
        if key in seen:
            continue
        seen.add(key)
        lines.append({"label": label or ("Amount" if value else "Note"), "value": value, "note": note if note != value else None})
    return lines[:6]


def date_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out, seen = [], set()
    for row in rows:
        date = row.get("date")
        if not date or not re.match(r"^\d{4}-\d{2}-\d{2}$", str(date)):
            continue
        role = row.get("event_role") or "event_or_context"
        raw = row.get("raw") if isinstance(row.get("raw"), dict) else {}
        label = clean(row.get("label") or raw.get("label") or row.get("kind") or row.get("milestone_type") or raw.get("kind"))
        if label and re.fullmatch(r"[a-z_]+", label):
            label = None  # machine labels such as final_deadline add nothing to the role
        time = clean(row.get("time") or row.get("time_local") or raw.get("local_time") or raw.get("time"))
        tz = clean(row.get("timezone") or row.get("timezone_text") or raw.get("timezone"))
        time_note = None
        if time and not re.match(r"^\d{1,2}[:.]\d{2}", time):
            time_note, time = time, None
        if label and re.fullmatch(r"(?i)(final( application)?|application (closes|deadline|opening)(; not a deadline)?|deadline|call opens|applications open|submission deadline|.* — deadline)", label):
            label = None
        key = (date, role)
        if key in seen:
            prior = next(d for d in out if (d["date"], d["role"]) == key)
            for field, value in (("label", label), ("time", time), ("timezone", tz), ("time_note", time_note)):
                prior[field] = prior[field] or value
            continue
        seen.add(key)
        out.append({"date": date, "role": role, "role_label": ROLE_LABELS[role], "label": label, "time": time, "timezone": tz, "time_note": time_note})
    return sorted(out, key=lambda d: (d["date"], ROLE_ORDER.index(d["role"])))


def materials(o: dict[str, Any], rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """What to prepare.  Structured contracts stay item by item; the packs'
    free-text materials note is kept whole (the foundation split it on ';')."""
    out = []
    for row in rows:
        if row.get("source_file") == "opportunity.raw#materials":
            continue
        raw = row.get("raw") if isinstance(row.get("raw"), dict) else {}
        item = clean(str(row.get("item") or "").replace("_", " "))
        if not item:
            continue
        limit = clean(raw.get("limit") or row.get("max_length"))
        unit = clean(raw.get("unit") or row.get("unit"))
        out.append({
            "item": item[0].upper() + item[1:],
            "limit": f"up to {int(limit):,} {unit}".strip() if limit and limit.isdigit() else limit,
            "optional": str(row.get("requirement") or raw.get("requirement")).lower() == "optional",
            "note": human(raw.get("note")),
        })
    text = human((o.get("raw") or {}).get("materials"))
    if text and not out:
        out.append({"item": text[0].upper() + text[1:], "limit": None, "optional": False, "note": None})
    return out[:12]


def window(dates: list[dict[str, Any]], as_of: str) -> tuple[str | None, str | None]:
    deadlines = sorted({d["date"] for d in dates if d["role"] == "application_submission_deadline"}) or sorted({d["date"] for d in dates if d["role"] == "application_fee_tier_cutoff"})
    upcoming = [d for d in deadlines if d >= as_of]
    closes = upcoming[0] if upcoming else (deadlines[-1] if deadlines else None)
    opens = max((d["date"] for d in dates if d["role"] == "opening" and (closes is None or d["date"] <= closes)), default=None)
    return opens, closes


def merge_twins(calls: list[dict[str, Any]], crosswalk: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """One public record per programme.

    The crosswalk names six programmes that both the funding packs and the
    festival/industry packs describe (Sundance fellowships, Untold Stories…).
    The funding-pack record wins; the twin fills what it lacks (a fuller fee
    schedule, a title that names the organiser) and is then dropped.
    """
    by_id = {c["id"]: c for c in calls}
    dropped: dict[str, str] = {}
    for link in crosswalk:
        if "same_entity" not in (link.get("related_relations") or [link.get("relation")]):
            continue
        keep, twin = by_id.get(link.get("from_id")), by_id.get(link.get("to_id"))
        if not keep or not twin or keep["pack"] != "funding":
            continue
        if " — " in twin["title"] and " — " not in keep["title"]:
            keep["title"] = twin["title"]
        for field in ("fee", "dates", "money", "bring", "terms", "check_yourself"):
            mine, theirs = keep[field], twin[field]
            size = lambda v: len(v.get("items", [])) if isinstance(v, dict) else len(v)
            if size(theirs) > size(mine):
                keep[field] = theirs
        for key in ("portal_url",):
            keep[key] = keep.get(key) or twin.get(key)
        known = {x["url"] for x in keep["sources"]}
        keep["sources"] = (keep["sources"] + [x for x in twin["sources"] if x["url"] not in known])[:6]
        keep["merged_ids"] = sorted(set(keep.get("merged_ids", [])) | {twin["id"]})
        dropped[twin["id"]] = keep["id"]
    out = [c for c in calls if c["id"] not in dropped]
    for c in out:
        c["related"] = sorted({dropped.get(r, r) for r in c["related"]} - {c["id"]})
    return out


def assign_slugs(calls: list[dict[str, Any]]) -> None:
    """URL slugs from the final titles; related links become slugs too."""
    taken: set[str] = set()
    for c in sorted(calls, key=lambda x: x["id"]):
        base = slugify(c["title"])
        slug = base if base not in taken else f"{base}-{c['id'].split(':')[-1].replace('_', '-')}"
        taken.add(slug)
        c["slug"] = slug
    by_id = {c["id"]: c["slug"] for c in calls}
    for c in calls:
        c["related"] = sorted(by_id[r] for r in c["related"] if r in by_id)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--foundation", type=Path, required=True, help="path to the built foundation package (with data/)")
    parser.add_argument("--out", type=Path, default=REPO / "data/calls.json")
    args = parser.parse_args(argv)
    data = args.foundation / "data"
    if not (data / "opportunities.json").exists():
        parser.error(f"{data}/opportunities.json not found; run the foundation build first")

    opps = load(data / "opportunities.json")
    tables = {name: load(data / f"{name}.json") for name in ("deadlines", "milestones", "amounts", "fees", "materials", "rules", "rights_obligations")}
    sources = {s["id"]: s for s in load(data / "sources.json")}
    crosswalk = load(data / "crosswalk.json").get("links", [])
    overlay = {e["id"]: e for e in load(REPO / "data/overlay.json")["entries"]}
    rechecks_path = REPO / "data/rechecks.json"
    rechecks = {r["id"]: r for r in (load(rechecks_path)["rechecks"] if rechecks_path.exists() else [])}
    manifest = load(args.foundation / "manifest.json")

    missing = sorted(set(o["id"] for o in opps) - set(overlay))
    if missing:
        raise SystemExit(f"overlay has no entry for {len(missing)} routes, e.g. {missing[:3]}")

    by_opp: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for name, rows in tables.items():
        for row in rows:
            by_opp.setdefault(str(row.get("opportunity_id")), {}).setdefault(name, []).append(row)

    families: dict[tuple[str, str, str], list[str]] = {}
    for o in opps:
        family = (o.get("raw") or {}).get("family_id")
        if family:
            families.setdefault((o["region"], o["source_kind"], str(family)), []).append(o["id"])

    calls = []
    for o in sorted(opps, key=lambda x: x["id"]):
        oid = o["id"]
        child = by_opp.get(oid, {})
        ov = overlay[oid]
        as_of = o.get("research_as_of") or "2026-10-16"
        dates = date_rows(child.get("deadlines", []) + child.get("milestones", []))
        recheck = rechecks.get(oid)
        if recheck and recheck.get("dates"):
            # A dated official-page recheck replaces the pack's dates outright.
            dates = sorted(
                ({"date": d["date"], "role": d["role"], "role_label": ROLE_LABELS[d["role"]], "label": d.get("label"), "time": d.get("time"), "timezone": d.get("timezone"), "time_note": d.get("time_note")} for d in recheck["dates"]),
                key=lambda d: (d["date"], ROLE_ORDER.index(d["role"])),
            )
        opens, closes = window(dates, as_of)
        urls = [u for u in as_list(o.get("source_urls")) if isinstance(u, str) and u.startswith("http")]
        official = next((u for u in urls if not any(h in host(u) for h in PORTAL_HOSTS)), urls[0] if urls else None)
        if recheck and recheck.get("url"):
            official = recheck["url"]
        portal = next((u for u in urls if any(h in host(u) for h in PORTAL_HOSTS)), None)
        source_list = []
        for sid in as_list(o.get("source_ids")):
            s = sources.get(sid)
            if s and s.get("url") and s["url"] not in {x["url"] for x in source_list}:
                source_list.append({"title": clean(s.get("title")) or host(s["url"]), "url": s["url"], "checked_on": s.get("checked_on") or s.get("attempted_on"), "note": clean(s.get("review_note") or s.get("inspection"))})
        for u in urls:
            if u not in {x["url"] for x in source_list}:
                source_list.append({"title": host(u), "url": u, "checked_on": as_of, "note": None})
        issues = []
        for issue in (o.get("evidence") or {}).get("native_issues", []):
            q = clean(issue.get("question"))
            if q:
                issues.append({"question": q, "meanwhile": clean(issue.get("interim_action"))})
        questions = []
        for rule in child.get("rules", []):
            q = clean(rule.get("question") or rule.get("requirement"))
            if q and q not in questions and q.endswith("?"):
                questions.append(q)
        related = set()
        for link in crosswalk:
            if link.get("from_id") == oid:
                related.add(link.get("to_id"))
            elif link.get("to_id") == oid:
                related.add(link.get("from_id"))
        family = (o.get("raw") or {}).get("family_id")
        if family:
            related.update(families.get((o["region"], o["source_kind"], str(family)), []))
        related.discard(oid)
        state = o.get("application_state") or "unknown"
        if recheck and recheck.get("state"):
            state = recheck["state"]
        calls.append({
            "id": oid,
            "title": clean(o["title"]),
            "organiser": clean(o.get("provider")),
            "organiser_country": clean(o.get("provider_country")),
            "kinds": ov["kinds"],
            "formats": ov["formats"],
            "stages": ov["stages"],
            "where": ov["where"],
            "who": ov["who_line"],
            "get": ov["get_line"],
            "caution": ov.get("caution"),
            "state": state,
            "opens": opens,
            "closes": closes,
            "dates": dates,
            "money": amount_lines(child.get("amounts", [])),
            "fee": fee_summary(child.get("fees", [])),
            "bring": materials(o, child.get("materials", [])),
            "check_yourself": questions[:10],
            "open_questions": issues[:6],
            "terms": rights_lines(child.get("rights_obligations", [])),
            "official_url": official,
            "portal_url": portal if portal != official else None,
            "sources": source_list[:6],
            "checked_on": as_of,
            "recheck": {k: recheck[k] for k in ("checked_on", "status", "note", "url") if recheck.get(k)} if recheck else None,
            "pack": "funding" if o["source_kind"] == "current" else "festivals_and_industry",
            "related": sorted(r for r in related if r),
        })

    calls = merge_twins(calls, crosswalk)
    assign_slugs(calls)
    out = {
        "schema_version": SCHEMA_VERSION,
        "about": "Call Sheet by pitch.dog: film and TV grants, labs, markets and festivals. Research snapshot, not legal advice; the official page always wins.",
        "research_as_of": max(c["checked_on"] for c in calls),
        "foundation_schema": manifest.get("schema_version"),
        "foundation_archives": [{"package_path": a["package_path"], "sha256": a["sha256"]} for a in manifest.get("archives", [])],
        "count": len(calls),
        "calls": calls,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"written": str(args.out), "calls": len(calls), "bytes": args.out.stat().st_size}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
