# Reel inserts: the spec

One JSON file makes one insert: a 1080×1920, 30 fps, silent clip of 2.5–5 s that the editor cuts in between Manali's shots. The file is the props of the Remotion composition `Insert` (`src/inserts/Insert.tsx`); its length comes from the spec.

**Status.** Schema version 1 is READY (`src/inserts/READY`). Motifs, the hook echo (`kicker`, `hook`), `inFrom`/`outTo`, per-scene `ground` and custom scenes are all in version 1 and READY too (`src/inserts/READY2`). From here on the schema only grows: new fields are optional, and every spec that validates today keeps validating.

- Specs: `inserts/specs/<series>/<reel-number>-<n>-<slug>.json` (series `orig`, `trial`, `foryou`).
- Worked examples: `inserts/specs/_examples/`.
- Render: `node scripts/render_inserts.mjs inserts/specs/<series> [outDir]`, into `out/inserts/<series>/` unless you name another folder, such as the launch kit's `video/reel-inserts/<series>` (see **Render** below).

## The rules the system already keeps

You can't break these from a spec; the renderer enforces them.

- **Safe zones.** All text sits in the column x 80–960, y 220–1500 (top 220, bottom 420 and right 120 stay clear). Every scene is one flex column, so the motif, labels and the object stack with air between and **nothing overlaps**.
- **Fit and scale.** Each scene is laid out, then scaled up as far as it will go (up to 1.75×) while it still fits 97% of the safe height and nothing runs off its line, and centred in the safe area (a hair above the middle). Less copy means bigger type. Motifs stay 220 px on screen at any scale.
- **Phone minimums.** At the chosen scale, every piece of reading text must be at least **44 px** on screen and every typewriter label at least **34 px** (so a scene with labels needs a scale of about 1.22 or more). If the copy is too long for that, the render **fails** with `Insert scene N (type) doesn't fit: …` naming the text. Shorten it; never squeeze it.
- **Loops.** A loop goes round words that sit on **one line**. If the looped words would wrap, the render fails with "the looped words … must fit on one line; loop fewer words". The loop reserves its own room above and below, so it never touches the lines next to it (in a `line` scene that adds leading round the looped line). In checklists it starts after the tick box.
- **Line limits.** Opportunity names in a `list` or a `deadline` column take at most 2 lines, checklist items at most 3; the scale steps down to keep them there, and the render fails ("wraps to N lines") if even the smallest legible scale can't.
- **Compounds stay whole.** A hyphen or en dash between letters or digits ("2-min", "15–20-page") never breaks across lines; the renderer joins them, so write them normally.
- **One red mark.** Each scene has at most one red element: the marker loop, or red ticks, never both. The stamp, motifs and grounds are never red-on-paper.
- **Clean ends.** Frame 0 is the ground with things just arriving; the last ~0.6 s holds still (unless you set `outTo`).
- **Copy checks.** Validation fails on a URL (`http`, `www.`, `.com`, `.dog`…) and on the word "call"/"calls" outside "Call Sheet". Say "opportunities".

What it can't check: **truth**. Every fact must come from the Reel's script, and the script must agree with the repo's `data/calls.json` (`../../data/calls.json` from this project). If they disagree, the data wins; put the mismatch in `note`.

## Top level

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `scenes` | array, 1–3 | required | The scenes, in order. Their `seconds` must add up to **2.5–5**. |
| `ground` | ground | `"paper"` | The page colour. Each scene can override it. |
| `align` | `"left"` \| `"center"` | `"left"` | Layout. Each scene can override it. |
| `inFrom` | dir | `"none"` | The first scene rides in from this side, to match the camera move or gesture before the cut. |
| `outTo` | dir | `"none"` | The last scene leaves to this side over the final 9 frames, to match the move after the cut. `"none"` holds. |
| `reel` | string | – | Free text: which Reel this is for. Not shown. |
| `note` | string | – | Free text: sources, mismatches. Not shown. |

Keys starting with `_` are ignored (use them for comments). Any other unknown key fails validation, so typos are caught.

- **ground**: `paper` #F3EFE6, `white` #FBF9F3, `blue` #A8C8EA, `pink` #F3B5C8, `yellow` #F4DF77, `green` #B5D9A2, `goldenrod` #E6B640, `buff` #E9D5AE, `salmon` #F3A58A, `cherry` #CF3B52 (cherry is loud and red-adjacent: use it rarely, never with a `line` loop).
- **dir**: `none`, `up` (from/to the top), `down` (from/to the bottom), `left`, `right`.

## Fields every scene takes

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | string | required | `card`, `amount`, `deadline`, `timezone`, `forwho`, `list`, `catch`, `send`, `line`, `custom`. |
| `seconds` | number 1.2–5 | per type (below) | Set it whenever there's more than one scene. |
| `ground` | ground | the spec's | A different ground per scene; with a new ground the scene arrives as a new page. |
| `align` | `left` \| `center` | the spec's | |
| `entry` | `"rise"` \| `"type"` \| `"slide"` | `type` for `line` and `deadline`, else `rise` | `rise`: blocks lift in on a stagger. `type`: words type on, typewriter-style. `slide`: the paper slides up from below the frame, with a little turn. |
| `transition` | `"cut"` \| `"page"` | `page` if the ground changes, else `cut` | Scenes 2–3 only. `page`: the new page slides over the last, from `inFrom` (default from below). |
| `inFrom` | dir | first scene: the spec's `inFrom`; later pages: `down` | For a `page` it's the side the page comes from; for a `cut` the content rides in from that side. |
| `kicker` | string ≤ 34 | – | A typewriter label at the top, in the Reel's words: e.g. `"Doc Edge Pitch · closes Fri 13 Nov"`. |
| `hook` | string ≤ 40 | – | **The hook echo**: the Reel's own hook as a headline above the object (≤ 22 characters sets it big, longer sets it as a subhead). On `forwho` and `send` it replaces the headline. |
| `motif` | motif | – | A small object from the Reel's story (below). |
| `markAt` | number 0.2–4.5 | about 40% in | Seconds into the scene when the loop draws (or the stamp lands). Put it on the beat that matters in the Reel's audio. |

Default `seconds`: card 4, amount 3.5, deadline 3.5, timezone 4.5, forwho 4.5, list 4.5, catch 3.5, send 4, line 3, custom 3.5.

### Motifs

`"motif": "kettle"` or `"motif": { "kind": "clock", "value": "2:59", "place": "above", "tint": "yellow" }`.

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `kind` | string | required | One of the kinds below. |
| `value` | string ≤ 12 | – | Used by some kinds (below); ignored by the rest. |
| `place` | `"above"` \| `"below"` | `"above"` | Above or below the copy, in the column, so it never overlaps text. |
| `tint` | ground | blue (yellow on a blue ground) | The motif's one accent colour. |

It is 230 px square, drawn flat in ink and paper with one revision-colour accent, never red, with one quiet idle move.

| `kind` | What it is | `value` |
| --- | --- | --- |
| `clock` | Alarm clock; second hand ticks, bells give a small ring | the time its hands show: `"4pm"`, `"16:00"`, `"2:59"` |
| `kettle` | Kettle with steam | – |
| `mug` | Mug with steam | – |
| `calendar` | Calendar page | `"30 Nov"` shows that date, otherwise a month grid |
| `envelope` | Envelope, the letter lifts out | – |
| `sticky` | Sticky note, slight sway | short note text, ≤ 8 characters reads best |
| `clapper` | Clapperboard; it claps once | – |
| `filmstrip` | Film strip, drifting | – |
| `receipt` | Receipt | a total, e.g. `"€35"` |
| `tag` | Price tag on a string, swinging | a price, ≤ 6 characters, e.g. `"€3,000"` |
| `tabs` | Browser window; tabs open one by one | the number of tabs, 2–12 (default 7) |
| `magnifier` | Magnifier over a page | – |
| `pinned` | A saved page: the brand's dog-ear folds down. **Not a pushpin**: the owner ruled out pins and tape | – |
| `piles` | Three document piles, stacking up | – |
| `laptop` | Laptop with a scrolling list | – |
| `passport` | Passport | – |

A motif takes ~270 px of height. On a busy scene (a 5-row list, a 4-item checklist with a hook) it may not fit; the render tells you.

## Scene types

Limits are characters (emoji and accented letters count as one). Dates are always `"D Mon"`: `"3 Nov"`, `"30 Nov"`.

### `card`: an opportunity's Call Sheet entry on paper

A slip with the name, then WHO IT'S FOR, YOU GET and CLOSES, typewriter-labelled; the loop circles one field.

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `name` | string | 40 | required |
| `for` | string | 56 | required. Who can apply, as the data says it. |
| `gets` | string | 40 (24 if looped) | required |
| `closes` | string | 14 | required. As the script shows it: `"30 Nov"`, `"30 Nov, 4pm"`. |
| `loop` | `"closes"` \| `"gets"` \| `"name"` \| `"none"` | | default `"closes"`. `name` needs a name of ≤ 24. |

```json
{ "type": "card", "name": "TorinoFilmLab ComedyLab", "for": "Writers anywhere developing a comedy feature", "gets": "Three residential modules", "closes": "30 Nov" }
```

### `amount`: a big amount

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `amount` | string | 9 | required: `"$4,500"`, `"€250,000"`, `"NZD 250"`. Put "up to" in `label`. |
| `label` | string | 24 | typewriter label above, e.g. `"Up to"`, `"One grant"`. |
| `name` | string | 40 | required: the opportunity. |
| `line` | string | 56 | one plain line about what it is. |
| `reveal` | `"count"` \| `"type"` | | default `count` (counts up, keeping currency and commas) when the amount has digits. |
| `loop` | boolean | | default `true`: the loop circles the amount. |

```json
{ "type": "amount", "label": "Up to", "amount": "€250,000", "name": "Finnish Film Foundation development" }
```

### `deadline`: a date, circled

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `date` | `"D Mon"` | | required |
| `style` | `"calendar"` \| `"column"` | | default `calendar` (a page with the month band and one big day). `column`: the sheet's CLOSES column with the opportunity beside it. |
| `label` | string | 20 | default `"Closes"`. |
| `weekday` | string | 3 | calendar only, e.g. `"Mon"`. |
| `note` | string | 24 | the small line under it, big enough to read: `"4pm Paris"`, `"Post by 9 Nov"`. |
| `name` | string | 40 | the opportunity (shown in the column row, or under the calendar). |
| `loop` | boolean | | default `true`. |

```json
{ "type": "deadline", "date": "30 Nov", "note": "4pm Paris" }
```

### `timezone`: one closing time, 3–6 cities

Rows arrive one by one; the loop lands on the chosen city and the others dim a little.

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `label` | string | 36 | typewriter label above, e.g. `"Closes Fri 13 Nov"`. |
| `cities` | array of 3–6 `{ city, time, day? }` | city 12, time 8, day 10 | `{ "city": "Los Angeles", "time": "2:59am", "day": "Fri 13 Nov" }` |
| `loop` | integer | | which city (0 = first). Default 0. |

```json
{ "type": "timezone", "label": "Closes 30 Nov", "cities": [ { "city": "Paris", "time": "4pm" }, { "city": "London", "time": "3pm" }, { "city": "New York", "time": "10am" } ], "loop": 2 }
```

### `forwho`: "This one's for you if…"

A headline over a ruled checklist; each item ticks in.

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `headline` | string | 28 | default `"This one's for you if…"`. `hook` replaces it. |
| `items` | 2–4 strings | 34 each | required |
| `mark` | `"loop"` \| `"ticks"` | | default `loop`: ink ticks, and the red loop on one item. `ticks`: red ticks and no loop (then `loop` is not allowed). |
| `loop` | integer | | which item the loop takes (0 = first). Default the last. |
| `name` | string | 40 | a small line under the list naming the opportunity. |

```json
{ "type": "forwho", "items": ["You write TV in the US", "You've never been staffed"], "loop": 1 }
```

### `list`: 2–5 opportunities on the printed sheet

Soonest first (validated). Each row: date | name, with an optional what-you-get line.

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `label` | string | 30 | default `"Closes · soonest first"`. |
| `items` | 2–5 `{ closes, name, gets? }` | closes `"D Mon"`, name 34, gets 30 | required |
| `loop` | integer | | which row (0 = first). Default 0. |

```json
{ "type": "list", "items": [ { "closes": "13 Nov", "name": "Doc Edge Pitch" }, { "closes": "30 Nov", "name": "TorinoFilmLab ComedyLab" } ], "loop": 1 }
```

### `catch`: the honest catch

A slip with the catch in big type, a quiet ink stamp landing on the beat, an optional note.

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `label` | string | 18 | the stamp. Default `"The catch"`. E.g. `"Entry fee"`, `"If selected"`, `"US only"`. |
| `text` | string | 56 | required |
| `note` | string | 40 | e.g. `"Plus VAT if due"`. |
| `name` | string | 40 | the opportunity, as a label under a rule. |

```json
{ "type": "catch", "label": "Entry fee", "text": "Not published. That isn't free." }
```

### `send`: what to send

Same as `forwho`, on a slip, with the headline `"What to send"` and **red ticks** by default. 2–5 items of ≤ 30. `mark: "loop"` gives ink ticks and a loop on `loop`.

```json
{ "type": "send", "items": ["A logline", "A 5-minute teaser", "A budget in euros"] }
```

### `line`: one big statement

On a revision-colour ground (set `ground`). ≤ 32 characters sets it in the display role, up to 64 in the headline role; `\n` forces a break (3 lines max).

| Field | Type | Limit | Notes |
| --- | --- | --- | --- |
| `text` | string | 64 | required |
| `loop` | string | 16 | words inside `text` to circle (must appear exactly once, no line break). |
| `sub` | string | 48 | a smaller line under it. |

```json
{ "type": "line", "ground": "yellow", "text": "Not published\nisn't free.", "loop": "isn't free" }
```

### `custom`: the escape hatch

When a Reel's idea needs something the types above can't do, add **one file** `src/inserts/custom/<series>-<nn>.tsx` (e.g. `trial-07.tsx`, lower case, digits and hyphens) with a default-exported React component. It is registered by its file name automatically; don't edit any other file.

```json
{ "type": "custom", "name": "trial-07", "seconds": 3, "props": { "anything": "your component reads" } }
```

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | required: the file name without `.tsx`. Validation fails if the file doesn't exist. |
| `props` | object | passed to your component as `props`. Validate what you read. |

All common fields work (`kicker`, `hook`, `motif`, `ground`, `entry`, `inFrom`, `markAt`…). Start from `src/inserts/custom/example-00.tsx`. The component gets `{ scene, props }`; read the frame with `useScene()` (`f` is the frame inside the scene, `dur` its length), and build from `kit.tsx` so it stays in the family:

- `<Column>`: the safe-zone column with the fit check. **Always lay out inside it.**
- `<Block i={n}>`: arrives as block n on the scene's stagger; `blockAt(c, n)` is that frame.
- `<Slip>`: the paper object. `<Label>`: typewriter label. `<Rule>`. `<Tx>`: text that types when `entry` is `type`.
- `<Circled at={frame} id="x" maxLeft?={px}>`: the marker loop round words on one line (`maxLeft` keeps it clear of something on the left, like a tick box). `<CheckBox>` / `<Tick red>`. `<Stamp>`. `<CountUp>`.
- `<KickerHook i={n}>` and `<MotifSlot place="above" i={0}>` to honour `kicker`, `hook` and `motif`.
- Type only through roles: `data-pd-social="display" | "headline" | "subhead" | "metric" | "metadata"` (`body` and `label` are too small to pass the phone minimum at most scales). Rows with a `<CheckBox>` use `alignItems: "first baseline"`. Colours from `kit.tsx` (`ink`, `labelInk`, `marker`). One red mark at most.

Run `npm run lint` after adding one.

## Worked examples

In `inserts/specs/_examples/`:

- `foryou-11-doc-edge-timezone.json`: a timezone scene with a clock motif set to 2:59, the loop on Los Angeles.
- `foryou-10-cfa-amount-deadline.json`: `$4,500` counting up, centred on yellow, riding in from the right; then a page turn to a blue calendar page, 31 Dec circled.
- `trial-comedylab-card-catch.json`: a typed-on card on green, the loop on the closing time; then a salmon page with the catch, a price-tag motif and a stamp, leaving to the left.

## Render

```sh
# every spec in a folder (subfolders kept; folders starting with "_" skipped)
# into out/inserts/foryou/ (or name the folder: ... inserts/specs/foryou path/to/launch-kit/video/reel-inserts/foryou)
node scripts/render_inserts.mjs inserts/specs/foryou --concurrency 2
# again, even if up to date
node scripts/render_inserts.mjs inserts/specs/foryou --force
# one spec, into out/inserts/11-1-forwho-doc-anywhere.mp4 (or name the .mp4)
node scripts/render_inserts.mjs --one inserts/specs/foryou/11-1-forwho-doc-anywhere.json
# review sheets: _review/contact.jpg (posters) and _review/strips/*.jpg (4 frames each, safe zones in red)
python3 scripts/insert_sheet.py out/inserts/foryou
```

All specs are validated before anything renders; one bad spec stops the run with every problem listed. Each output is `<name>.mp4` (H.264, CRF 23, yuv420p, BT.709, faststart, silent) and `<name>.jpg` (the poster, near the end, JPEG q90; an older `<name>.png` poster is deleted). The script prints each size and flags anything over ~1 MB per 4 s. Outputs newer than their spec and the insert source are skipped. Preview a spec in the Studio (`npm run dev`, composition `Insert`) by pasting it into the `spec` prop.
