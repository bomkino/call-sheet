# call-sheet

**Call Sheet** is pitch.dog's free list of film and TV grants, labs, markets and festivals, sorted by when they close: who can apply, what you get, what it costs and what to bring. It lives at https://pitch.dog/call-sheet/.

This repository holds the tool: the public dataset, the page generator, the stylesheet and the script. The research behind it (the Open Call Foundation and its six source packs) stays private in `bomkino/pitchdog-cloudflare-sites` under `apps/call-sheet/foundation/`.

## How it fits together

```
private foundation ──export_public_data.py──▶ data/calls.json ──build_site.py──▶ dist-pitchdog/ ──copy──▶ pitch.dog/call-sheet/
      (research)        + data/overlay.json        (public)                        (static site)
                        + data/rechecks.json
```

- `data/overlay.json`: the hand-reviewed public layer, one entry per route: who can apply and from where, a plain "who" and "you get" line, format, stage, type and the one thing to check first. Written from the source packs' own wording; `unclear` means the packs don't say.
- `data/rechecks.json`: dated rechecks against official pages, each date backed by a quote. A recheck's dates replace the pack's dates for that call, and a fee read off the official page replaces the pack's fee. [docs/RECHECKING.md](docs/RECHECKING.md) says how to run one; `tools/merge_rechecks.py` validates and folds them in.
- `data/calls.json`: the public dataset the site is built from, and the file published at `/call-sheet/data/calls.json`. Generated; edit the overlay, the rechecks or the foundation instead.
- `data/edition.json`: which edition this is, the window it covers, and each monthly set of pages with its revision colour (white, blue, pink and on, in the order shooting scripts use). The masthead, the editions strip and the FAQ read it.
- `brand/`: the Call Sheet identity. Logo, symbol, edition marks, palette and the code that draws them; [brand/README.md](brand/README.md) is the guide.
- `site/`: `call-sheet.css` and `call-sheet.js`. No framework and no dependencies.
- `tools/build_site.py`: renders the list page and one page per call into `dist-pitchdog/`, with hashed assets, calendar feeds (`feeds/*.ics`, every upcoming deadline and one per format) and `BUILD.json`.

Every page works without JavaScript. The script adds:
- filters and place matching;
- live countdowns that move to a call's next round once one closes;
- deadlines shown in the visitor's own time zone;
- a notice when the snapshot is old;
- "My call sheet", which is saved in the visitor's browser only, and flags a saved call whose deadline the organiser moved;
- a **New** tag on calls added since the visitor's last visit, with a filter for just those;
- a what-to-bring checklist on each call page that remembers its ticks.

All of that stays in the browser. Nothing a visitor types or saves reaches us.

## Commands

Python 3.12 or newer, standard library only.

```sh
# Rebuild the public dataset (needs the private foundation, already built)
python3 tools/export_public_data.py --foundation ../pitchdog-cloudflare-sites/apps/call-sheet/foundation

# Build the site and run the checks (CI runs the same on every pull request)
python3 tools/build_site.py
python3 -m unittest discover -s tools -p 'test*.py'
```

## Releasing to pitch.dog

1. Commit here and note the commit.
2. In `bomkino/pitchdog-cloudflare-sites`, replace `apps/main-site/call-sheet/` with a clean build of that commit (`BUILD.json` names it; `dirty` must be `false`).
3. Run that repository's website checks and open a pull request. The preview link appears on it; merging puts it live.

## Editorial rules

- Unknown is never zero, free or eligible. A fee nobody published says *Not published*.
- Dates say what they are: opening, deadline, fee tier, prerequisite, selection, payment or event.
- Amounts stay in the organiser's currency and are never added up.
- No prestige score, no odds. The closing date sets the order.
- The official page always wins. Each call shows when it was last checked.
- Corrections go to hello@pitch.dog; every call page has a button that starts the email.

## Licence

As open as we can make it:

- **Code** (`tools/`, `site/`, `brand/tools/`): [BSD Zero Clause](LICENSE) (0BSD). Use, copy, change and ship it, with no conditions.
- **Data and writing**: `data/`, the published `calls.json`, the text of the pages and these docs are dedicated to the public domain under [CC0 1.0](LICENSE-DATA). No permission or credit needed.

Two things aren't ours to give away. Text quoted from organisers' pages, which backs each date in `data/rechecks.json`, stays theirs. Organisers' names, and the Call Sheet and pitch.dog names and logos (the drawings in `brand/`), are trademarks, which no licence grants.

The private research foundation behind the data stays private and isn't covered.
