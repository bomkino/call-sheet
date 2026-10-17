# Rechecking calls

Call Sheet is only as good as its dates. A recheck goes back to each call's official page, writes down what it says, and backs every date with a quote. Do one at least once a month, and before any push that points people at the list. The list page says how old the last check is once it's more than three weeks old.

## 1. Pick the calls

Recheck every call that isn't closed, plus any whose last recheck was `unreachable`. Group calls that share an official page, so each page is read once:

```sh
python3 - <<'EOF'
import json, collections
calls = json.load(open("data/calls.json"))["calls"]
groups = collections.defaultdict(list)
for c in calls:
    if c["state"] != "closed_or_historical":
        groups[c["official_url"]].append({k: c.get(k) for k in ("id", "title", "organiser", "state", "opens", "closes", "dates", "caution", "official_url")})
json.dump([{"official_url": u, "calls": v} for u, v in groups.items()], open("/tmp/recheck-batch.json", "w"), indent=1, ensure_ascii=False)
EOF
```

Split the batch into chunks of about twenty calls for whoever, or whichever agent, does the reading.

## 2. Read each official page

For every call, the reader:

1. Opens the official page. If it fails, they try the other sources on the call page, then search the organiser's own site for this programme's current page. A FilmFreeway, Submittable or SmartyGrants page counts when the organiser runs it. Listing sites and blogs never count as evidence.
2. Writes down the current round:
   - opening date;
   - deadline, or deadlines when there are several rounds;
   - early and regular fee-tier deadlines;
   - prerequisite steps;
   - notification dates;
   - the cut-off time and time zone, when the page gives them.
3. Picks a status:
   - `confirmed`: the page agrees with our dates. A confirmed recheck may still add a time or zone, or a notification date the page states.
   - `changed`: the page gives other dates or a newer round. List the whole round's dates; they replace ours.
   - `closed`: the round has closed and no new one is announced with dates.
   - `unreachable`: no official page for the programme would load.
4. Notes what the page says about the entry fee. "Free" counts only when the page says so in words.

Each result is one JSON object:

```json
{
  "id": "opp:atlas:current:f03",
  "checked_on": "2026-10-17",
  "status": "confirmed",
  "url": "https://the page actually read",
  "evidence": "\"verbatim quotes from that page\"",
  "dates": [{"date": "2026-10-22", "role": "application_submission_deadline", "label": "Deadline, 5pm AEDT", "time": "17:00", "timezone": "Australia/Sydney"}],
  "note": "One plain sentence for the call page: Deadline confirmed on Screen Australia's portal: 5pm AEDT, 22 October.",
  "enrich": {"fee": {"state": "free | paid | unknown", "items": [{"label": "Regular fee", "amount": "USD 45", "note": null}], "evidence": "\"quote\""}}
}
```

Rules for each field:
- **Roles:** `opening`, `application_submission_deadline`, `application_fee_tier_cutoff` (an early or regular deadline when a later one exists), `prerequisite`, `selection`, `payment`, `event_or_context`.
- **Times:** `HH:MM`.
- **Zones:** IANA names such as `Europe/Paris`. Use one only when the page names it or names the city.
- **"Before 13 November":** the last safe day is the 12th; say so in the label.
- **Amounts:** stay in the organiser's currency. Write the ISO code, then the number.

## 3. Merge, export, build

```sh
python3 tools/merge_rechecks.py --dry-run results/*.json   # validates every result first
python3 tools/merge_rechecks.py results/*.json
python3 tools/export_public_data.py --foundation ../pitchdog-cloudflare-sites/apps/call-sheet/foundation
python3 tools/build_site.py
python3 -m unittest discover -s tools -p 'test*.py'
```

The merge stops on the first invalid result and names it. A newer recheck of a call replaces the older one.

Fees work like this:
- A fee read off the official page replaces the research packs' fee.
- A page that says nothing about fees doesn't erase a fee the packs found elsewhere.

Read the `data/calls.json` diff before you commit: every changed date should match a quote in `data/rechecks.json`.

## 4. Turn the page

Each monthly update is a new set of pages. In `data/edition.json`, add the month to `pages` with the next colour and the day it goes out, and move `next` along:

```json
"pages": [
  {"colour": "White", "published": "2026-10-17", "note": "The first issue."},
  {"colour": "Blue", "published": "2026-11-14", "note": "12 new calls; 9 dates changed."}
],
"next": {"colour": "Pink", "due": "2026-12"}
```

The order is the WGA's for script revisions: white, blue, pink, yellow, green, goldenrod, buff, salmon, cherry. A new quarter's research starts a new edition (`edition` goes up by one, `covers` moves on) and goes back to white.

The colours live in `brand/palette.json`; `brand/editions/` has the symbol in each.

Then release as the README describes. Visitors who come back see a **New** tag on every call they haven't seen, and calendar subscribers get the changed dates on their own.
