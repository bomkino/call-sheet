# Call Sheet explainer

A one-minute film (1:00.4) that explains Call Sheet from start to finish. It asks one question, names five real problems that filmmakers have when looking for funding, then fixes them one at a time, on paper, with a red pen. It works with no voiceover: the words on screen carry it. Four masters, each laid out for its own frame:

| File | Size | For |
| --- | --- | --- |
| `out/final/callsheet-explainer-1920x1080.mp4` | 16:9 | YouTube |
| `out/final/callsheet-explainer-1080x1920.mp4` | 9:16 | Reels and Stories. Everything that matters sits between 250 and 1600 px down and clear of the buttons on the right. |
| `out/final/callsheet-explainer-1080x1080.mp4` | 1:1 | Feed |
| `out/final/callsheet-explainer-1440x1080.mp4` | 4:3 | Feed, LinkedIn, decks |

Each master has a contact sheet beside it (`-sheet.png`), with one settled frame from every scene. All four are H.264, yuv420p, BT.709, 30 fps, AAC 320k, mixed to -14 LUFS with true peak under -1 dBTP, and the sound runs 20 ms behind the picture. The first cut (v1, 58 seconds) is kept in `out/v1/`.

## The idea

It opens on a plain question: *Are you looking for funding for your film?* Then the moment everyone who has applied for funding knows: the perfect opportunity, found the day after it closed. The film runs fast through the four reasons it keeps happening, each named plainly and numbered like the boxes on a call sheet: grants are scattered and every fund has its own rules, the fine print rules you out after hours of reading, time zones are confusing, and fees are hidden. Then it turns: *We put 180+ film and TV funding opportunities on one free list.* Each fix that follows comes back to its numbered problem, and the marker ticks it off.

The world is paper. Each idea is a new page laid over the last, the real site prints onto slips of white paper, and a red marker does what a hand does on a printed list: it circles the one that matters, ticks what's done and folds the corner of what you've saved. There is only ever one red mark at a time: when the hand makes the next mark on a page, the last one dries to the label's grey. The question is the piano's first phrase, left open; the problems run in D minor over a ticking clock; on "one free list" the music turns to F major and the band comes in. When the film reaches monthly updates, the page that slides in is blue, like a script's revised pages, and the music lifts a step. The camera never shows a browser, a cursor or a phone.

## The facts on screen

Everything is real, from Call Sheet's data as of 17 October 2026 and the live site as built on 20 October 2026 (commit 563e460, the build that says "opportunities" and "My shortlist"), and checked against `data/calls.json` (`../../data/calls.json` from this project):

- 186 opportunities are listed, so "180+" is true. Their official pages sit on 99 different websites (distinct hosts of `official_url`); the web addresses on the slips in scene 3 are real ones from the data.
- 157 are live (open, announced or rolling). 100 of those don't publish an entry fee (`fee.state` is "unknown"), which is what "some funds don't publish entry fees" stands on; the four in the scene 6 table are real ones.
- TorinoFilmLab FeatureLab closes Thursday 5 November 2026 at 16:00 Paris time, which is 02:00 on Friday 6 November in Sydney. The site's own page for it, opened with a Sydney clock, says exactly that.
- The finder's counts are the site's own, read off its button after each choice: See 157 opportunities; Based in: United States, See 73 opportunities (the ones that take people based there, plus the ones the site flags as unclear, which it keeps); then Documentary, See 31 opportunities.
- Fees as the site shows them: Sundance Merata Mita Fellowship, free to enter; Roy W. Dean Fall Grant, $38–48; TorinoFilmLab FeatureLab, not published.
- The calendar reminders are the exact texts in the site's .ics file: "A week to go: Roy W. Dean Fall Grant 2026" and "Closes tomorrow: Roy W. Dean Fall Grant 2026".
- The "Welcome back" note and the New tag are the site's own, shown to a returning visitor: "Welcome back. 4 opportunities are new since you were last here, on 10 Oct."
- The saved-list bar reads "3 saved", as the site now has it.

Two things are illustrations, and look like it: the opening listing ("The perfect fund", for "People making exactly your film", giving "Exactly the amount you need") is a real row from the site with its words replaced as a joke; and the guidelines in scene 4 are greyed-out lines with one plain sentence, "Open only to applicants under 30.", not any organiser's document.

Captures come from `capture/capture.mjs` (mobile layout at 3x, fixed clock; the viewer is in New York, or Sydney for the time-zone page, both in pitch.dog's client markets). The site's rows now carry a local-time line under the date ("05:59 your time", "No time given"); the captures keep it, except on the joke card, which keeps its first look. The closing list in scene 15 is built from the opportunities the finder shows that viewer, as captured, not typed in.

## Storyboard

Times are from the start of the film. The beat grid is 17 frames a beat (106 BPM) in `src/timeline.json`; every move and every sound hangs off it. The opening question is one bar (four beats) and everything after it sits one bar later than in v1. Labels are typed in PD Eyebrow; ✓ is the marker's tick.

| # | Time | On screen | Picture | Sound |
| --- | --- | --- | --- | --- |
| 1 | 0:00 to 0:02.5 | FINDING FUNDING / **Are you looking for funding for your film?** | Plain paper; the label types itself and the question rises in. | Typewriter keys for the label; the felt piano's first phrase, left open on a C7 so it asks. |
| 2 | 0:02.5 to 0:07.1 | **Found the perfect opportunity** … **the day after it closed?** | A new page; a listing slides up: 16 Oct, "The perfect fund", free to enter. The marker circles it (0:03.4). At 0:04.8 it turns to CLOSED YESTERDAY and sags at an angle. | The tune answers, climbing; marker on paper. Three typewriter keys and the carriage bell on "closed"; the harmony sighs. |
| 3 | 0:07.1 to 0:10.5 | 1 · GRANTS ARE SCATTERED / **Raising money for your film is confusing.** / Each fund has its own rules. | Paper slips with real organisers' web addresses pile up, one after another. | The music drops into D minor; a muted piano pulse and a wooden tick, like a clock. Each slip lands with a tap. |
| 4 | 0:10.5 to 0:15.0 | 2 · THE FINE PRINT / **You spend hours scanning through rules** / **only to find out you're too old for this one.** | A printout of guidelines flips through eight pages; page 9 of 14 lands (0:11.6) with the second line, and its one legible line, "Open only to applicants under 30.", is circled (0:12.0). | Eight quick page flicks; marker. |
| 5 | 0:15.0 to 0:19.0 | 3 · TIME ZONES ARE CONFUSING / **16:00 in Paris is 02:00 the next day in Sydney.** | Two ruled boxes: CLOSES, PARIS 16:00, Thursday 5 November; MEANWHILE, IN SYDNEY 02:00, Friday 6 November. The marker circles 02:00. | A kick joins the clock. |
| 6 | 0:19.0 to 0:22.9 | 4 · HIDDEN FEES / **Some funds don't publish entry fees.** / And "not published" doesn't mean free. | A ruled table, OPPORTUNITY and ENTRY FEE: Finnish Film Foundation, Screen Australia, CNC, TorinoFilmLab, each Not published. | A typewriter key for each row; the harmony leans toward home. |
| 7 | 0:22.9 to 0:26.9 | 1 · GRANTS ARE SCATTERED ✓ / **We put 180+ film and TV funding opportunities on one free list.** / Soonest deadline first. | The turn. A clean page, the label ticked, and a list ruled by date under CLOSES and OPPORTUNITY: 20 Oct Finnish Film Foundation development support, 22 Oct Screen Australia First Nations Development, 31 Oct Roy W. Dean Fall Grant, 2 Nov CNC documentary innovation: writing. | F major. The band comes in: soft kick, brushes, shaker, upright bass. A chime with each tick, a step higher every time. |
| 8 | 0:26.9 to 0:31.4 | 2 · THE FINE PRINT ✓ / **Say where you're based.** / Opportunities that rule you out aren't displayed. | The real finder. Based in: United States (0:28.0), and the button drops from See 157 opportunities to 73; Documentary (0:28.9), 31. The tick dries to grey and the marker circles "See 31 opportunities" (0:29.7). | A click and a marimba note for each choice. |
| 9 | 0:31.4 to 0:34.8 | 3 · TIME ZONES ARE CONFUSING ✓ / **Every deadline, in your own time.** | TorinoFilmLab FeatureLab's page, read from Sydney: "Thursday 5 November 2026, 16:00 Central European Time. That's Friday 6 November, 02:00 where you are (Sydney time)." The tick dries and the marker circles 02:00. | Marker. |
| 10 | 0:34.8 to 0:38.2 | 4 · HIDDEN FEES ✓ / **The fee, as published.** / Or a plain "Not published". | Strips cut from three real rows: Free to enter, $38–48, Not published. The tick dries and the marker circles "Not published". | Marker. |
| 11 | 0:38.2 to 0:41.6 | FOUND IT THE DAY AFTER IT CLOSED / **Save the ones that fit.** / No account. They stay in your browser. | Roy W. Dean, CPH:FORUM and Doc Edge Pitch fall into a stack; each corner folds into a red dog-ear as its Save button fills, and the last one's red dries to grey as the next folds. The site's bar slides up: 3 saved. | A paper fold, a click and a rising marimba note for each. |
| 12 | 0:41.6 to 0:45.6 | FOUND IT THE DAY AFTER IT CLOSED ✓ / **Easily save every deadline** / **in your calendar.** / With a nudge a week before, and the day before. | My shortlist's buttons (Add deadlines to calendar, Print, Copy share link); the first one presses. A calendar lands with the two real reminders, 31 inks in as the deadline (0:44.3), and the marker ticks the label. | Two small bells for the reminders; the last chime. |
| 13 | 0:45.6 to 0:49.0 | NEXT: BLUE PAGES, NOVEMBER / **Updated every month.** / New opportunities get a New tag. | A blue page slides over the white one. On it, Doc Edge Pitch with its red NEW badge, and the site's note: "Welcome back. 4 opportunities are new since you were last here, on 10 Oct." | The music lifts a whole step, to G. |
| 14 | 0:49.0 to 0:53.0 | FROM PITCH.DOG, WHO MADE THIS / **Applying for one?** / We make the decks that go with it. / The list stays free either way. | Plain paper and the words. The page's corner folds down into a red dog-ear, and the blue page shows underneath. | The band steps back: piano and pad. A paper fold. |
| 15 | 0:53.0 to 0:55.8 | **Find the one that's yours.** | Four from the finder's US documentary results, under CLOSES and OPPORTUNITY: 31 Oct Roy W. Dean Fall Grant 2026, 1 Nov Big Sky Pitch 2027, 3 Nov CPH:FORUM, 20 Dec Doc Edge Pitch. The marker circles 20 Dec, the one the film has followed. | A lift toward home. |
| 16 | 0:55.8 to 1:00.4 | Logo / **Find film and TV grants, labs and festivals before they close.** / **pitch.dog/call-sheet** | "Call Sheet" arrives printed; its loop draws itself round "Call" (0:56.2); the line rises (0:56.9), then the address (0:57.6). Holds to the end. | Home in G, a bell as the loop closes, and it rings out. |

## Voiceover (optional), for Manali

The film doesn't need it. If Manali records it, these lines sit inside their scenes with room to breathe. Read them warm and plain, like telling a friend about something that would have saved them a bad week. The times are when each line starts. About 130 words.

| Start | Line |
| --- | --- |
| 0:00.4 | Looking for funding for your film? |
| 0:02.8 | Ever found the perfect one… |
| 0:04.9 | …the day after it closed? |
| 0:07.3 | Every fund has its own rules. |
| 0:10.8 | And the fine print says you're too old for this one. |
| 0:15.3 | Four in the afternoon in Paris is two in the morning in Sydney. |
| 0:19.2 | Some funds don't publish a fee. That doesn't mean free. |
| 0:23.2 | Call Sheet puts over a hundred and eighty on one free list. |
| 0:27.2 | Say where you're based, and the ones that rule you out disappear. |
| 0:31.7 | Every deadline, in your own time. |
| 0:35.1 | Every fee, as published. |
| 0:38.5 | Save the ones that fit. No account. |
| 0:41.9 | Every deadline in your calendar, with a nudge before it. |
| 0:45.9 | Updated every month. |
| 0:49.3 | Applying for one? pitch.dog makes the decks that go with it. |
| 0:53.2 | Find the one that's yours. |
| 0:56.1 | Call Sheet. At pitch dot dog, slash call sheet. |

Say "pitch dot dog". The lines name Call Sheet and pitch.dog instead of saying "we", because Manali is the narrator, not the studio.

### Dropping the VO in

1. Record one take against the film (or edit the lines into one file) so each line starts at its time above, with silence before the first. WAV, any sample rate.
2. `python3 scripts/make_score.py --stems` writes the music bed and the foley as separate files beside `score.wav`.
3. `scripts/mix_vo.sh path/to/vo.wav` ducks the music about 8 dB under the voice (it comes back between lines), leaves the foley alone, delays the voice 20 ms like the rest of the sound, re-measures the mix to -14 LUFS with true peak under -1 dBTP, and writes `out/final/callsheet-explainer-<size>-vo.mp4` for all four sizes. The picture isn't re-encoded and the masters stay as they are.

In another editor: put the VO on its own track 20 ms late, sidechain the music to it (about 8 dB of reduction, 20 ms attack, 400 ms release), leave the foley, and master to -14 LUFS, -1 dBTP.

## YouTube

**Title**

Call Sheet: find film and TV grants, labs and festivals before they close

**Description**

Found it the day after it closed?

Film and TV calls are spread across 99 websites, each with its own rules. The line that rules you out is on page 9. The deadline is in someone else's time zone. And 100 of the 157 open calls don't say what they cost.

So we put them on one free list. Call Sheet has 186 grants, labs, markets and festivals, soonest deadline first, each checked against the organiser's own page in October 2026. No account, no sign-up.
https://pitch.dog/call-sheet/

- Say where you're based, and the calls that rule you out step aside. Who can apply is always on the first line.
- Every deadline is shown in your own time zone.
- Every fee is shown as the organiser publishes it, or as a plain "Not published". It only says free when the official page does.
- Save the ones that fit (they stay in your browser), and put every deadline in your calendar, with a reminder a week before and the day before. Or print your sheet, or send someone the link.
- It's updated every month, and new calls get a New tag. Subscribe to a calendar feed and the dates keep themselves up to date.

It's a research snapshot, not legal advice. The official page always wins, so check it before you apply.

Chapters
0:00 Why good opportunities slip past
0:23 One free list
0:38 Never the day after
0:49 Find the one that's yours

Applying for one? pitch.dog makes pitch decks, lookbooks, treatments and series bibles for film and TV. Send us the call and your logline and we'll tell you what we'd put in the deck: hello@pitch.dog. The list stays free either way.

The code is open source (0BSD): https://github.com/bomkino/call-sheet
The data is public domain (CC0): https://pitch.dog/call-sheet/data/calls.json

**Tags**

film grants, film funding, TV funding, documentary funding, screenwriting labs, film labs, film festivals, pitch forums, film markets, film fellowships, grant deadlines, film deadlines, call for entries, independent film, filmmaking, documentary, screenwriting, Call Sheet, pitch.dog

## Instagram caption

Found it the day after it closed?

186 film and TV calls live on 99 different websites. The rule that rules you out is on page 9. The deadline is in someone else's time zone. And 100 of the 157 open calls don't say what they cost.

So we put them on one free list. Call Sheet sorts grants, labs, markets and festivals by deadline, puts who can apply first, shows every deadline in your own time, and says "Not published" when a fee isn't. Save the ones that fit, put the deadlines in your calendar, and come back next month for new pages.

Comment SHEET and we'll send you the link, or save this for your next deadline.

Applying for one? Send us the call and your logline, and we'll tell you what we'd put in the deck. The list stays free either way.

pitch.dog/call-sheet · @pitch.dog [confirm handle]

#filmgrants #filmfunding #documentary #screenwriting #filmmaking #filmfestivals #independentfilm

## Re-rendering

You need Node 20+, Python 3 with numpy, scipy and pillow, and ffmpeg. `../setup.sh` installs the Node and Python dependencies.

```sh
../setup.sh                              # once: npm ci and the Python requirements for both projects

# 1. Only to recapture the real UI (public/ui/ is in git). Build the site, then serve the
#    build at /call-sheet/ with pitch.dog's shared /assets/ (the type system's fonts) beside
#    it, or the captures fall back to system fonts. The assets come from a checkout of
#    bomkino/pitchdog-cloudflare-sites. Needs Playwright with Chromium
#    (npm i -g playwright && npx playwright install chromium). Default base http://127.0.0.1:8788
python3 ../../tools/build_site.py --out out/site/call-sheet
ln -sfn path/to/pitchdog-cloudflare-sites/apps/main-site/assets out/site/assets
(cd out/site && python3 -m http.server 8788 --bind 127.0.0.1) &
node capture/capture.mjs

# 2. The score (public/audio/ isn't in git: run this before the Studio or a render),
#    and, only if they change, the paper and grain and the logo paths from the brand files
python3 scripts/make_score.py            # add --stems for the VO mix
python3 scripts/make_textures.py         # public/tex/, already in git
python3 scripts/extract_logo.py          # reads ../../brand
python3 scripts/audio_report.py          # spectrogram and level, scenes marked: out/audio/report.png

# 3. Look at stills before a full render
scripts/stills.sh 1080x1920 52,190,292,428,546,666,784,920,1022,1124,1226,1350,1447,1566,1652,1808

# 4. The four masters, their contact sheets, and a loudness and format check (about 9 minutes a size)
scripts/render_final.sh
```

`npm run dev` opens Remotion Studio. The compositions are `Explainer-1920x1080`, `Explainer-1080x1920`, `Explainer-1080x1080` and `Explainer-1440x1080`. To move a moment, change its beat in `src/timeline.json`, then run `make_score.py` again so its sound moves with it.

Where things live:
- `src/explainer/Explainer.tsx`: the sixteen scenes and how each frame shape lays them out.
- `src/explainer/kit.tsx`: paper, slips, the dog-ear fold, the marker loop and tick (and `dried`, which keeps one red mark at a time), typed labels, words, cut-out captures.
- `src/explainer/loop.ts`: the loop from `brand/tools/make_brand.py`, ported line for line (same seeds, same shape; checked against `brand/web/ring.svg`).
- `src/explainer/layout.ts`: the regions and type roles for each frame shape.
- `src/explainer/hosts.json`: the 99 organiser websites, from the data.
- `scripts/make_score.py`: every note and every sound, on the same grid.

Type comes only from the pitch.dog type system (v3.0.0, the kit's pin). The words a viewer has to read use its social roles, sized by the frame; the 16:9 cut sets its supporting lines in the headline role, because a phone shows that frame about 390 px wide. The two long main lines (the fine print, and the 180+ list) and the calendar line take the headline role outside 16:9, so they keep to their region. Paper art (the calendar, the guidelines, the website slips) uses the web roles and is scaled with the paper. The logo and the line under it are the brand's own artwork, from `brand/web/logo.svg` and `brand/logo/call-sheet-logo-tagline.svg`.

## To confirm before posting

- The Instagram handle (`@pitch.dog [confirm handle]`).
- The figures are as of 17 October 2026 (data) and 20 October 2026 (site build and captures). If the data has moved by the time this goes out, recapture, change the numbers in `Explainer.tsx` and re-render.
- The YouTube description and the Instagram caption above are still the v1 wording ("calls", "99 websites", "100 of the 157 open calls", "Found it the day after it closed?"). The figures in them are still true; the owner may want them to say "opportunities" like the site and the film.
