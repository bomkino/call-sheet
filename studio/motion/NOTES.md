# Call Sheet brand stings: notes

Two stings for Call Sheet (pitch.dog/call-sheet). Each works as an intro or an outro, and each comes in five sizes. Everything, picture and sound, is made in code from the brand's own drawing code and the pitch.dog type system.

## The idea: "Circle the one"

You print the list, read it with a red pen, and circle the call that's yours. Here that is the whole film.

**5 seconds.** A printed call sheet: a ruled form on warm paper, with typewriter labels in the corners of the boxes (CLOSES, THE CALL · WHAT YOU GET, EDITION 1 · WHITE PAGES). The date column says CLOSES, the word the site and the posts use. Nine real calls type in on the beat, soonest first. The camera drifts down the list like a slow dolly and settles. A red marker loops one date: 3 Nov, the Sundance Merata Mita Fellowship 2027. The page leans in on it.

Then comes a match cut. The loop stays exactly where it is, and everything around it changes: the date inside it becomes "Call", and the page becomes the logo. The thing you circled turns out to be Call Sheet. The top corner of the frame (the frame is the page) folds down into the brand's red dog-ear, a saved page. Under it shows November's blue page, the next edition. The line rises in, the sign-off types, and the typewriter's margin bell rings at the end of the line.

**2 seconds.** Just the ending. The wordmark is on the page, the marker loops "Call", and the corner folds down on beat 3 with the margin bell. "pitch.dog/call-sheet" types in, and the frame holds for 0.6 s. The first frame is the wordmark alone, so it reads instantly as an intro.

The last ~2.5 s of the 5s and the whole 2s end the same way: loop, fold, bell, the same chord. That makes them one family.

### Why this one

I mocked three ideas before committing (the `Explore` compositions; render them into `out/explore/`):

1. **Circle the one, match cut** (chosen). It is a single physical story: a real list, a real gesture, and the logo arriving because of that gesture. The loop is the carrier across the cut, and it is the brand's own fixed-seed hand, so the shapes match exactly. It also shows proof (real calls, real deadlines) before the logo.
2. **Revision riffle** (`ExploreRiffle`). Coloured revision pages flip over the top like a clipboard pad, with the same loop in the same place on each, landing on the logo. It was pretty, but it read as a colour slideshow: the dates had no context and there was no human act. Its best part, the revision colour, survives as the blue page under the dog-ear.
3. **Macro pull-back** (`ExploreMacro`). It starts on the wet nib a few millimetres across and pulls back to the logo as the loop runs round. It was showy, but the opening frames are giant cropped letters that don't read, and it wasn't calm.

### Brand change applied

As the coordinator asked, "Know your call time." is gone everywhere. The later note, that a line on the 5s should pay off the pain rather than be a slogan, is already met: the line *is* the payoff (find them before they close), the circled deadline stays the hero, and the film ends on pitch.dog/call-sheet. The end card carries **"Find film and TV grants, labs and festivals before they close."** It is set on two lines with a fixed break: "Find film and TV grants, labs / and festivals before they close.". "pitch.dog/call-sheet" is the sign-off. The 2s carries no line, because 11 words can't be read in 2 seconds. It ends on the logo and the sign-off.

## Beat map

120 BPM, 15 frames a beat at 30 fps, beat 1 on frame 0, so either sting can cut in on a downbeat. The frames live in `src/cs/timeline-5s.json` and `src/cs/timeline-2s.json`. The picture and the score both read those files.

### 5s (150 frames)

| Beat | Frames | Seconds | Picture | Sound |
| --- | --- | --- | --- | --- |
| 1 | 0 | 0.00 | Cut in on the ruled form; labels type; 20 Oct strikes | F maj9 on felt piano, upright bass F; the first typewriter strike |
| 1–3 | 0–30 | 0.00–1.00 | Nine calls land on sixteenths (0, 4, 8, 11, 15, 19, 23, 26, 30), soonest first; the camera drifts down the list | Typewriter as the rhythm section: a heavy strike as each date lands, lighter keys as its words type; a G–A–C line on felt piano |
| 3.2 | 33 | 1.10 | The list is done | The line-space ratchet, then a breath of room air (silence before the hit) |
| 4 | 45–63 | 1.50–2.10 | The marker loops **3 Nov** | Felt-tip friction that follows the nib's real speed round the loop; D min9; a celesta runs D–F–A–C–E with the pen |
| 5 | 60–65 | 2.00–2.17 | The camera settles on the circled date | B♭ maj9; air gathers |
| 5.3–6 | 65–75 | 2.17–2.50 | The page leans in on the loop, gathering speed | |
| **6** | **75** | **2.50** | **Match cut**: the loop holds, and "3 Nov" becomes the logo. The logo page carries the push on and lets it go | Home: F major, a felt drum far away, upright F |
| 6–7 | 76–90 | 2.53–3.00 | The corner folds into the red dog-ear and lands on beat 7; November's blue underneath | Fibres crackle, air under the flap, the landing tap, a thumbnail down the crease; a high A on the landing |
| 6.7–7 | 86, 90 | 2.87, 3.00 | The line rises in, a line at a time | |
| 7.7–8.9 | 100–119 | 3.33–3.97 | "pitch.dog/call-sheet" types, one key a frame | Typewriter keys |
| **9** | **120** | **4.00** | At rest | **The margin bell** (F6) and a soft F major bloom |
| 9–10 | 120–149 | 4.00–5.00 | Held for 1.0 s; the grain keeps it alive | It rings out to silence on the last frame |

### 2s (60 frames)

| Beat | Frames | Seconds | Picture | Sound |
| --- | --- | --- | --- | --- |
| 1 | 0 | 0.00 | The wordmark on the page; the camera settles in (4.5%) | B♭ maj9, upright B♭ |
| 1.1–2.3 | 2–20 | 0.07–0.67 | The marker loops **Call** | Marker friction plus the celesta run |
| 2.1–3 | 17–30 | 0.57–1.00 | The corner folds and lands on beat 3 | Paper fold |
| **3** | **30** | **1.00** | The fold lands | **Margin bell**, F major (home), felt drum |
| 3.1–3.7 | 31–41 | 1.03–1.37 | "pitch.dog/call-sheet" types (two keys a frame) | Light keys under the bell |
| | 41–59 | 1.37–2.00 | Held for 0.63 s | Ring out to silence |

## Score and foley

All of it is synthesised in `scripts/make_sting_score.py`. There are no samples or loops, so there is nothing to license, and the seeds are fixed. The palette is a desk, not a studio.

- **Felt piano.** An upright with felt over the hammers: stretched partials, a two-stage decay, a soft hammer thock, two strings a hair apart.
- **Upright bass**, plucked, with a quick finger bloom and a slight sag in pitch.
- **Celesta.** It traces the marker's loop; each note is timed to where the nib is.
- **Margin bell.** A small cup bell tuned to F6. It is the sonic signature, the last note of both stings: the end of the line, time's up.
- **Felt drum.** A far-off felt beater on the cut and the landing, felt more than heard.
- **Typewriter.** Each key is the slug hitting the platen, a resonant tock, the body's thunk and the type bar falling back, varied every strike. The line-space ratchet is three teeth.
- **Marker on paper.** Friction noise whose level follows the nib's actual speed, computed from the pen's centre line and the picture's own pen easing. The paper's tooth gives it stick-slip, and a faint squeak comes in when the nib runs fast.
- **Paper fold.** Fibres crackling as the corner bends, air moving under the flap, the landing tap, and a thumbnail along the crease.
- **Room.** A floor of quiet air, so the silences are a room and not a void.

Harmony is F major. The 5s goes I – vi – IV – I (the cut is the plagal "home"); the 2s goes IV – I, so both resolve the same way.

**Sync.** Every sound starts on the frame its picture event lands, and the whole mix sits 20 ms behind the picture. The masters are encoded without B-frames or MP4 edit lists, so no player can shift the audio. The AAC encoder's 1024 priming samples (21.3 ms) stand in for the score's 20 ms lead. Measured on the masters, the first sound lands about 21 ms after its frame.

**Loudness.** Mixed to -14 LUFS integrated with true peak under -1 dBTP (two-pass linear loudnorm). Measured on every final file (`python3 scripts/measure_finals.py`):

| File | Size | Seconds | Integrated (LUFS) | True peak (dBTP) | First key vs picture (ms) | Bell vs picture (ms) | Mbps | Format |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| callsheet-sting-2s-1080x1080.mp4 | 1080x1080 | 2.02 | -14.0 | -2.9 | n/a | +31.7 | 20 | yuv420p, AAC 327k |
| callsheet-sting-2s-1080x1920.mp4 | 1080x1920 | 2.02 | -14.0 | -2.9 | n/a | +31.7 | 35 | yuv420p, AAC 327k |
| callsheet-sting-2s-1440x1080.mp4 | 1440x1080 | 2.02 | -14.0 | -2.9 | n/a | +31.7 | 27 | yuv420p, AAC 327k |
| callsheet-sting-2s-1920x1080.mp4 | 1920x1080 | 2.02 | -14.0 | -2.9 | n/a | +31.7 | 34 | yuv420p, AAC 327k |
| callsheet-sting-2s-2576x1080.mp4 | 2576x1080 | 2.02 | -14.0 | -2.9 | n/a | +31.7 | 46 | yuv420p, AAC 327k |
| callsheet-sting-5s-1080x1080.mp4 | 1080x1080 | 5.02 | -14.0 | -1.6 | +21.0 | +31.2 | 22 | yuv420p, AAC 327k |
| callsheet-sting-5s-1080x1920.mp4 | 1080x1920 | 5.02 | -14.0 | -1.6 | +21.0 | +31.2 | 38 | yuv420p, AAC 327k |
| callsheet-sting-5s-1440x1080.mp4 | 1440x1080 | 5.02 | -14.0 | -1.6 | +21.0 | +31.2 | 28 | yuv420p, AAC 327k |
| callsheet-sting-5s-1920x1080.mp4 | 1920x1080 | 5.02 | -14.0 | -1.6 | +21.0 | +31.2 | 36 | yuv420p, AAC 327k |
| callsheet-sting-5s-2576x1080.mp4 | 2576x1080 | 5.02 | -14.0 | -1.6 | +21.0 | +31.2 | 47 | yuv420p, AAC 327k |

The bell column includes about 10 ms of the detector's own smoothing. The first-key column is the clean read: +21.0 ms, as designed.

## Look

- **The frame is the page.** Warm paper (#F3EFE6) with a tileable paper tooth (`public/paper/tooth.png`, from `scripts/make_paper.py`), laid over everything with soft-light, so ink sinks into it too. Warm window light falls off from the top left by a few percent.
- **The marker loop** is the brand's own outline, drawn on with the centre-line mask technique from `brand/web/logo.svg`. Where the overshoot crosses the start, a darker patch marks where the ink went down twice. The edge is roughened a hair by the paper.
- **The dog-ear** is a real 3D fold of the frame's top-right corner along a 45° crease. The paper side shows as it lifts, then the brand's red flap with its soft tip lands, with a contact shadow. Under it is the blue revision page.
- **Film print.** A gentle `sheet` look added to the kit's `scripts/print_film.py`: a short focus-find on the first 5 frames, slight corner softness, a little halation, quiet grain and very rare dust. There is no CRT beam (wrong for paperwork) and no fade at the end of the reel, because an intro or outro can't dip to black.
- **No motion blur.** Nothing moves fast enough to need it. The camera is a slow dolly, and the cut is a cut.

### Type

Type follows the pitch.dog type system **v3.0.0**, as pinned in `package.json` and resolved in the lockfile to commit `54207202fbb557758ad7851941d8944e722c4af6`. It is set through its social roles on a `data-pd-canvas` root; no size or weight is set by hand.

- **Logo.** The brand's PD Head 820 outlines, from `brand/tools/make_brand.py` (`src/marks.json`). It is checked byte-for-byte against `brand/web/logo.svg` when the paths are generated.
- **Dates on the sheet.** `headline` (PD Head) on 9:16, 1:1 and 4:3; `display` on 16:9 and scope, where the table has to fill a wide frame without a big push-in.
- **Call names.** `label` (PD Body).
- **Typewriter labels and what each call gives.** `metadata` (PD Eyebrow).
- **The line.** `subhead` (PD Body Alt) on 9:16, 1:1 and 4:3. On 16:9 and scope it is `headline` (PD Head), because the type system's landscape guidance says only the big roles survive a phone showing the frame about 390 px wide.
- **The sign-off, pitch.dog/call-sheet.** It is the call to action, so it is set to read on a phone, and it sits as far below the line as the line sits below the logo. The 2s takes a step bigger where a role allows, without ever setting the URL wider than the logo.

| Size | 5s sign-off | 2s sign-off |
| --- | --- | --- |
| 1080×1920 | `headline`, 667 px wide (2.4x the old `label`) | `headline` (`display` would be 915 px, wider than the logo) |
| 1080×1080 | `headline`, 586 px (2.3x) | `headline` (`display` would be wider than the logo) |
| 1440×1080 | `subhead`, 375 px (1.5x) | `headline`, 586 px (2.3x) |
| 1920×1080 | `headline`, 586 px (1.56x the old `subhead`) | `display`, 735 px (1.96x) |
| 2576×1080 | `headline`, 586 px (1.56x) | `display`, 735 px (1.96x) |

Gap: the type system has no governed 4:3 (1440×1080) or scope (2576×1080) canvas. Those sizes use the `landscape` canvas attribute; their type sizes come from the roles' own container units, and their safe areas are borrowed (90 px, and 120 px at the sides for scope). They are recorded in `src/sizes.json`.

### The adapts

Each size is laid out for its own frame (`src/cs/layout.ts`), not cropped.

| Size | Sheet | End card |
| --- | --- | --- |
| 1080×1920 | Two columns (date \| name over what it gives), 180 px rows | Logo centred, the line and sign-off hanging from the C |
| 1080×1080 | Two columns, 152 px rows | The same, tighter |
| 1440×1080 | Two columns, 140 px rows | The same |
| 1920×1080 | Two columns, centred on the page, display-size dates, so the whole table stays in frame through the cut | Centred stack, the line in PD Head |
| 2576×1080 | Three ruled columns (closes \| the call \| what you get) across the scope frame | Side by side: the logo left, the line and sign-off beside it |

On every size the camera works out its own path, so the circled date lands exactly on the logo's loop at the cut.

## Files

`out/final/`:

| File | What it is |
| --- | --- |
| `callsheet-sting-5s-1080x1920.mp4` | The 5s, 9:16 (Reels, Stories) |
| `callsheet-sting-5s-1080x1080.mp4` | The 5s, 1:1 |
| `callsheet-sting-5s-1440x1080.mp4` | The 5s, 4:3 |
| `callsheet-sting-5s-1920x1080.mp4` | The 5s, 16:9 (YouTube) |
| `callsheet-sting-5s-2576x1080.mp4` | The 5s, 2.39:1 scope |
| `callsheet-sting-2s-<size>.mp4` | The 2s at the same five sizes |
| `*-contact.png` | Key frames of each, labelled with frame and time |

The masters are H.264 High, yuv420p, BT.709, 30 fps (exactly 150 or 60 frames), AAC-LC 320 kbps at 48 kHz, 20–47 Mbps. They are big on purpose, because a re-encode strips grain first. The container reports 5.02 s and 2.02 s: the extra 21 ms is the AAC priming, which these files carry instead of an edit list. For Meta's API (25 Mbps cap), the 9:16, 16:9 and scope masters need a copy made with `-b:v 20M -maxrate 25M -bufsize 50M -bf 0 -use_editlist 0`.

Source:

| Path | What it does |
| --- | --- |
| `src/cs/Sting.tsx` | The scene: the sheet shot, the match cut, the end shot, the camera |
| `src/cs/Sheet.tsx`, `calls.ts` | The printed call sheet and its nine real calls |
| `src/cs/Loop.tsx`, `Logo.tsx`, `marks.ts` | The marker loop's draw-on, and the logo |
| `src/cs/DogEar.tsx`, `Paper.tsx` | The fold, the paper tooth and the light |
| `src/cs/layout.ts` | Every size's layout |
| `src/cs/timeline-*.json` | Every event's frame, shared with the score |
| `src/cs/Explore.tsx` | The two rejected ideas, kept for the record |
| `scripts/make_marks.py` | Logo and loop paths from the brand's own code, plus the pen samples and the double-ink patch |
| `scripts/make_paper.py` | The paper tooth |
| `scripts/make_sting_score.py` | The score and foley |
| `scripts/render_stings.py` | Masters and contact sheets |
| `scripts/print_film.py` | The kit's film print, plus the `sheet` look, `--timeline` and `--sync-safe` |
| `scripts/contact.py`, `sync_check.py`, `audio_check.py`, `measure_finals.py` | Contact sheets, sync measurement, a spectrogram against the events, and the loudness and sync table for every master |

## Re-render

```sh
../setup.sh                           # once: npm ci and the Python requirements for both projects
python3 scripts/make_sting_score.py   # public/audio/sting-*.wav, which git doesn't keep; the Studio needs them

python3 scripts/make_marks.py         # only if the brand's drawing changes (reads ../../brand)
python3 scripts/make_paper.py         # only to change the paper
python3 scripts/render_stings.py      # score, then every master and contact sheet into out/final/
python3 scripts/render_stings.py 5s 1920x1080   # one sting at one size
python3 scripts/render_stings.py --clean        # plain Remotion masters, without the film print

npx remotion studio                   # preview: Sting5s-<size>, Sting2s-<size>
python3 scripts/sync_check.py out/final/callsheet-sting-5s-1080x1920.mp4 5s
python3 scripts/audio_check.py 5s out/check/audio-5s.png
```

A 5s master takes about 6 minutes on four cores, mostly the film print, and all ten take about an hour.

## Before you post

- **The dates go stale.** The calls are true as of 17 Oct 2026, and the circled one closes 3 Nov 2026. After that, swap the rows in `src/cs/calls.ts` (keep them soonest first; `CIRCLED` picks the row) and re-render. The 2s has no dates and never goes stale.
- **The edition goes stale too.** The sheet says "EDITION 1 · WHITE PAGES" and the dog-ear shows November's blue underneath. When the blue pages ship, change the label in `Sheet.tsx` and the colour under the fold (`Underneath` in `DogEar.tsx`) to the next revision colour.
- **The sound was checked by measurement, not by ear.** It was checked with spectrograms against the picture events, onset timing and loudness. Give it one listen on a phone and on headphones, especially the felt piano and the marker friction, which are the most synthetic-prone parts.
- On 9:16, Instagram's top-right camera icon may overlap the dog-ear. It is decoration and sits outside the type safe area.
- The open-call counts in the briefs disagree (125 against 126 "open now"), so no counts are shown.
