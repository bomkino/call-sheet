# Call Sheet motion: the house look

Read this before you make any picture or sound for Call Sheet. It describes the look the stings, the explainer and the 71 Reel inserts share. The stills in `reference/` show it.

This is a language, not a template. Bring your own idea to every piece, and make it feel alive. But a viewer should know it's Call Sheet before they read a word.

## The one-line version

**A printed call sheet on a desk, read by someone with a red pen.** Warm paper, ruled boxes, typewriter labels, one big date or number, and a hand that circles the one that matters. Calm, with lots of air. One idea at a time.

## The world

Everything happens on paper. There is no browser, cursor, phone frame, UI chrome, gradient, glow, stock photo, 3D or particle effect.

- **Pages** are the stage. A new idea arrives as a new page sliding over the last, or a slip of paper landing on the page. Pages have weight: they ease in, settle and cast a soft, short shadow.
- **The site** appears as if printed. Rows and cards are captured from the real site and printed onto slips of white paper. Never show it as a screen.
- **The red pen** is the only hand.
  - It **circles** the one thing that matters: a date, an amount, a city, a word. The loop is the brand's own, drawn from a fixed seed (`motion/src/cs/Loop.tsx`, `explainer/src/explainer/loop.ts`). Never draw a new one by hand.
  - It **ticks** what's done.
  - It **folds a corner** into a red dog-ear to save a page.
- **Revision pages** carry time. Film scripts change colour when they're revised: white, blue, pink, yellow, green, goldenrod, buff, salmon, cherry. Call Sheet does the same, one colour a month. A blue page sliding over a white one means "next month" or "updated" without a word.

## Colour

| Name | Hex | Job |
| --- | --- | --- |
| Paper | `#F3EFE6` | The ground for almost everything |
| Ink | `#15130F` | Type, rules and dark grounds |
| Marker | `#E3472D` | The loop, the tick and the dog-ear. Never small text |
| Marker text | `#C2381F` | Red words on paper, when you truly need them |
| Toner | `#66625A` | Labels, dates, captions, and a mark that has dried |
| Revisions | White `#FBF9F3`, Blue `#A8C8EA`, Pink `#F3B5C8`, Yellow `#F4DF77`, Green `#B5D9A2`, Goldenrod `#E6B640`, Buff `#E9D5AE`, Salmon `#F3A58A`, Cherry `#CF3B52` | Grounds and page edges. Never text. Cherry is loud: use it rarely, and never behind a loop |

The source is `../brand/palette.json`.

**One red mark on screen at a time.** When the hand makes the next mark, the previous one dries to toner grey. This is the rule people notice most when it's broken.

## Type

Every word comes from the pitch.dog type system, through its roles: `@pitchdog/type-system`, pinned at v3.0.0 in both projects. Never set font sizes or weights by hand.

- **PD Head**: big lines, numbers, dates and the logo. Heavy and soft.
- **PD Eyebrow**: the typewriter. Labels in caps, written the way a call sheet labels its boxes: CLOSES, WHO CAN APPLY, YOU GET, ENTRY FEE, WHAT TO SEND. Labels often type on, one key a frame.
- **PD Body**: anything you read.

**Phone first.** Every line must read on a phone in one second. The inserts system enforces a floor of 44 px for reading text and 34 px for labels at 1080 wide; keep to it everywhere. Headlines are set at one size and never vary line by line. Avoid widows. Never break a compound like "2-min" at the hyphen.

## Layout

Lay it out like production paperwork, then leave room:

- ruled boxes, with a label in the corner of each;
- one hero per frame (a date, an amount, a city), set big;
- a type zone and an object zone that never touch;
- lots of paper.

The owner's rules, earned the hard way:

- **Nothing overlaps.** Text never sits on a drawing, and drawings never cross text, margins or the footer. The loop is the only exception, around the one word it circles, and even the loop must clear the lines above and below it.
- **One object per frame**, drawn simply: a clock, a calendar page, a price tag, a passport, a film strip. No tape, pins, stickers, coffee rings, stamps or decorative micro-text.
- **At most about five elements in a frame**: label, line, sub, object, footer.
- **Calm beats clever.** When in doubt, take something out.

The owner called an early round "busy and ugly, overlapping and weird", and the calm version is what won. `LOG.md` has the history.

## Motion

Human and physical. The camera never moves for its own sake.

- **Eases:** pages and slips ease in and settle with a little weight and a tiny overshoot at most. Nothing bounces, spins or flies in from nowhere.
- **Type:** labels type on. Big lines rise or slide up a short distance with motion blur, or type on when the beat calls for it.
- **The loop draws on the beat that matters**, at the speed of a real hand: about 0.6 s, fast in the middle and slow at the ends. The nib's speed drives the friction sound.
- **Cuts land on the beat.** A new page slides over the old one, or a hard cut on a downbeat. A match cut on the loop is the signature move: the loop stays exactly where it is while everything around it changes, as in the stings.
- **Holds:** hold the last frame long enough to read it twice, then release. Inserts ease in and hold still on their last frame, so an editor can cut out anywhere.
- **Finish:** the paper's tooth and a little grain keep stills alive. The film-print pass (`render:cine`, with halation, grain and gate weave) is optional. Use it for hero pieces and never on top of small type.

## Sound

Everything is synthesised in code (`scripts/make_score.py`, `make_sting_score.py`), with fixed seeds and no samples to license. The palette is a desk, not a studio.

- **Instruments:** felt piano, upright bass, celesta tracing the pen, brushes and a soft kick when the band comes in, marimba clicks for choices.
- **The margin bell (F6)** is the sonic signature. It sounds at the end of a line, on the last note, when time's up.
- **Foley:** typewriter keys and the carriage ratchet, marker friction that follows the nib, paper landing, a corner folding, page flicks, a clock tick.
- **Harmony tells the story.** Problems sit in D minor over a ticking clock. The turn to the fix goes to F major, where the band comes in. "Updated" lifts a whole step. Both stings resolve to F major.

Picture and sound rules:

- **Sync:** every sound starts on the frame of its picture event, and the whole mix sits 20 ms behind the picture.
- **Loudness:** -14 LUFS integrated, true peak under -1 dBTP.
- **Silent pieces:** inserts that sit under a Reel's own audio have no sound at all.

## Signature moments to reuse (and vary)

| Moment | Where it's done well |
| --- | --- |
| The perfect opportunity that turns to CLOSED YESTERDAY and sags | Explainer, scene 1 |
| Web-address slips piling up, "scattered" | Explainer, scene 2 |
| A guidelines stack flipping to page 9, one line legible and circled | Explainer, scene 3 |
| Paris 16:00 → Sydney 02:00, the loop on 02:00 | Explainer, scene 4; Reel inserts (timezone) |
| The list ruled by date, soonest first, the loop on one | The 5s sting; explainer, scene 6 |
| A blue page sliding over the white one | Explainer, scene 12; under the stings' dog-ear |
| The loop match-cutting into the logo, the corner folding, the bell | The 5s and 2s stings |
| "This one's for you if…", ticked off | Reel inserts (forwho) |
| An amount counting up and being circled | Reel inserts (amount) |

## Avoid

- Screens, cursors, browser frames, phone mockups.
- More than one red mark at a time; red used for anything except the hand.
- Text on drawings; drawings crossing text; anything inside the Reels UI zones (see `FORMATS.md`).
- Tape, pins, stickers, stamps, textures beyond the paper, gradients, glows, lens flares, shake, whip-pans.
- Generic motion-graphics tropes: kinetic-type salad, bouncing icons, counters spinning for no reason.
- Busy frames. If you have to squint, take things out.
