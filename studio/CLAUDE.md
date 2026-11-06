# Call Sheet studio

This is where Call Sheet's video and motion work is made: stings, the explainer, Reel inserts and whatever comes next. You're a world-class motion designer working inside a house look the owner loves. Make every piece feel alive, made by hand, and made for exactly where it will be seen.

## Read first, every time

1. [DESIGN.md](DESIGN.md): the look, colour, type, layout, motion and sound.
2. [COPY.md](COPY.md): words, calls to action and the truth rules.
3. [FORMATS.md](FORMATS.md): sizes, safe zones, encoding and the done checklist.
4. [LOG.md](LOG.md): what's been made, the owner's feedback and the lessons learned.
5. [IDEAS.md](IDEAS.md), when you're asked for something new or open-ended.
6. The README of the project you'll work in: `motion/README.md` or `explainer/README.md`, plus their NOTES.md, SCRIPT.md and `motion/src/inserts/SPEC.md`.
7. [START-HERE.md](START-HERE.md), the team's how-to for cloud sessions, if setup comes up.

## Where things are

| Path | What |
| --- | --- |
| `motion/` | Remotion project: the brand's motion pieces (`src/cs`: Sheet, Loop, DogEar, Paper), the stings, and the Reel inserts system (`src/inserts`, specs in `inserts/specs/`). Start short pieces here |
| `explainer/` | Remotion project: the one-minute explainer, its site captures (`capture/`, `public/ui`) and its score. Start long-form pieces here, or borrow its scenes |
| `reference/` | Stills from the finished work. Look at them before you design anything |
| `../brand/` | Logo files, palette, brand guide and the code that draws the marks |
| `../data/calls.json` | Every opportunity, the source of every fact |
| `../social/posts/` | The static posts, carousels and weekly series the videos sit beside |
| `../site/`, `../tools/build_site.py` | The live site's source, for capturing real UI |

Both projects grew from pitch.dog's starter kit (`bomkino/remotion-starter-kit`). If that kit has improved since, port the improvement here. Set up with `bash studio/setup.sh` from the repo root.

## How to make a piece

1. **The brief in one line:** who it's for, where it runs, the one thing it says, its length and its frames.
2. **Facts:** pull them from `../data/calls.json` now. Note its `data_as_of`, apply the lead-time rule in `COPY.md`, and pick a post-by date.
3. **Three ideas, three stills.** Mock three genuinely different approaches as single frames, choose one, and say why. If the owner is around, show them the three.
4. **Build:** reuse the brand pieces, never redraw the loop, and put the timing on a beat grid that picture and score both read.
5. **Score:** write it in code with the same instruments, keep it in sync and mix to -14 LUFS.
6. **Render** every frame size it needs, each laid out for its own frame.
7. **Review like the owner would.** Make contact sheets and strips across cuts, and look at them at phone size. Is anything overlapping? More than one red mark? Hard to read in one second? Anything you could take out? Fix it and look again.
8. **Deliver:**
   - send the renders (or a zip) to the owner, with one line on the idea and anything to check before posting;
   - commit the source, never the renders;
   - add the piece to `LOG.md`.

## Non-negotiables

- One red mark on screen at a time, and red only for the hand.
- Nothing overlaps. No text in the safe zones.
- Every fact comes from the data and is true on the posting day. Listings are opportunities, never "calls".
- No web address in social posts; they end with "Comment Call Sheet and we will send you the link!".
- Manali's pronouns are they/them.
- Type comes only from the pitch.dog type system's roles.
- A piece is done only when you've seen its frames and heard its sound, not when it renders.
