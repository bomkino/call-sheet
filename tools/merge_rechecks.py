#!/usr/bin/env python3
"""Fold a round of rechecks into data/rechecks.json.

    python3 tools/merge_rechecks.py results/*.json            # check and merge
    python3 tools/merge_rechecks.py --dry-run results/*.json  # check only

Each input is a JSON array of rechecks in the shape docs/RECHECKING.md asks
for: id, checked_on, status, url, evidence, dates, note, and optionally an
"enrich" object with what the official page says about the fee.  Every
result is validated before anything is written; one bad result stops the
merge.  A newer recheck of a call replaces the older one.

Python standard library only.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "tools"))
from export_public_data import ROLE_LABELS, money  # noqa: E402

STATUSES = {"confirmed", "changed", "closed", "unreachable"}
# Costs that come after selection, not the price of applying.
AFTER_SELECTION = re.compile(r"(?i)select|participa|accredit|badge|tuition|attend|registration fee|if accepted|if chosen|deposit")


def problems(result: dict[str, Any], known: set[str]) -> list[str]:
    out = []
    if result.get("id") not in known:
        out.append("unknown id")
    if result.get("status") not in STATUSES:
        out.append(f"status {result.get('status')!r}")
    try:
        dt.date.fromisoformat(str(result.get("checked_on")))
    except ValueError:
        out.append("checked_on is not a date")
    if not str(result.get("url") or "").startswith("https://") and result.get("status") != "unreachable":
        out.append("no https url")
    if result.get("status") in ("confirmed", "changed", "closed") and not (result.get("evidence") or "").strip():
        out.append("no evidence")
    if result.get("status") == "changed" and not result.get("dates"):
        out.append("changed without dates")
    for d in result.get("dates") or []:
        try:
            dt.date.fromisoformat(str(d.get("date")))
        except ValueError:
            out.append(f"bad date {d.get('date')!r}")
        if d.get("role") not in ROLE_LABELS:
            out.append(f"bad role {d.get('role')!r}")
        if d.get("time") and not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", d["time"]):
            out.append(f"bad time {d['time']!r}")
        if d.get("timezone"):
            try:
                ZoneInfo(d["timezone"])
            except (ZoneInfoNotFoundError, ValueError):
                out.append(f"bad zone {d['timezone']!r}")
    if not (result.get("note") or "").strip():
        out.append("no note")
    return out


def fee_from(enrich: dict[str, Any] | None) -> dict[str, Any] | None:
    """The fee the official page states, in the export's item shape; None when it says nothing."""
    fee = (enrich or {}).get("fee") or {}
    state = {"free": "free", "paid": "priced", "unknown": "unknown"}.get(fee.get("state"))
    if not state:
        return None
    items = []
    for item in fee.get("items") or []:
        amount = str(item.get("amount") or "").strip()
        m = re.fullmatch(r"([A-Z]{3})\s*([\d,.]+)", amount)
        shown = money(m.group(2), m.group(1)) if m else (amount or None)
        label = (item.get("label") or "").strip() or None
        items.append({
            "stage": "selected" if AFTER_SELECTION.search(label or "") else "application",
            "label": label,
            "amount": shown,
            "state": "free_or_explicit_zero" if state == "free" and not shown else "priced" if shown else "unknown_or_conditional",
            "note": (item.get("note") or "").strip() or None,
        })
    if state == "unknown":
        # Silent on the entry fee; a cost for selected projects is still worth keeping.
        items = [i for i in items if i["stage"] == "selected" and i["amount"]]
    if state == "free" and not any(i["stage"] == "application" for i in items):
        items.append({"stage": "application", "label": "Entry fee", "amount": None, "state": "free_or_explicit_zero", "note": None})
    if state == "priced" and not any(i["stage"] == "application" and i["amount"] for i in items):
        state = "unknown"  # "paid" with no application amount we can show isn't a fee yet
    return {"state": state, "items": items, "evidence": (fee.get("evidence") or "").strip()}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("results", nargs="+", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    path = REPO / "data/rechecks.json"
    store = json.loads(path.read_text(encoding="utf-8"))
    known = {e["id"] for e in json.loads((REPO / "data/overlay.json").read_text(encoding="utf-8"))["entries"]}

    incoming, fee_only, bad = [], [], []
    for file in args.results:
        for result in json.loads(file.read_text(encoding="utf-8")):
            if "status" not in result:
                # Fee details for a call whose dates were rechecked earlier.
                if result.get("id") not in known:
                    bad.append(f"{file.name}: {result.get('id')}: unknown id")
                fee_only.append(result)
                continue
            issues = problems(result, known)
            if issues:
                bad.append(f"{file.name}: {result.get('id')}: {', '.join(issues)}")
            incoming.append(result)
    if bad:
        print("\n".join(bad), file=sys.stderr)
        return 1

    by_id = {r["id"]: i for i, r in enumerate(store["rechecks"])}
    replaced = added = 0
    for result in incoming:
        entry = {k: result.get(k) for k in ("id", "checked_on", "status", "url", "evidence", "dates", "note")}
        entry["dates"] = [{k: d.get(k) for k in ("date", "role", "label", "time", "timezone")} for d in entry["dates"] or []]
        fee = fee_from(result.get("enrich"))
        if fee:
            entry["fee"] = fee
        if result["id"] in by_id:
            prior = store["rechecks"][by_id[result["id"]]]
            if prior["checked_on"] > entry["checked_on"]:
                continue
            if "fee" not in entry and "fee" in prior:
                entry["fee"] = prior["fee"]
            store["rechecks"][by_id[result["id"]]] = entry
            replaced += 1
        else:
            by_id[result["id"]] = len(store["rechecks"])
            store["rechecks"].append(entry)
            added += 1
    fees = 0
    for result in fee_only:
        fee = fee_from(result.get("enrich"))
        if fee and result["id"] in by_id:
            store["rechecks"][by_id[result["id"]]]["fee"] = fee
            fees += 1
    print(json.dumps({"checked": len(incoming), "added": added, "replaced": replaced, "fees_added": fees, "dry_run": args.dry_run}))
    if not args.dry_run:
        path.write_text(json.dumps(store, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
