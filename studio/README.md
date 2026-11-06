# Studio

Call Sheet's video and motion work: two Remotion 4.0.532 projects, both started from pitch.dog's starter kit ([bomkino/remotion-starter-kit](https://github.com/bomkino/remotion-starter-kit)), with type from `@pitchdog/type-system` v3.0.0. The design rules are in [CLAUDE.md](CLAUDE.md) and the docs it lists.

| Project | What it is | Read |
| --- | --- | --- |
| [`motion/`](motion) | The brand's motion pieces (`src/cs`: Sheet, Loop, DogEar, Paper), the 2s and 5s stings in five sizes, and the Reel inserts system (`src/inserts`, specs in `inserts/specs/`) | [NOTES.md](motion/NOTES.md), [SPEC.md](motion/src/inserts/SPEC.md) |
| [`explainer/`](explainer) | The one-minute explainer in four sizes, its captures of the live site (`capture/`, `public/ui/`) and its score | [SCRIPT.md](explainer/SCRIPT.md) |

Each project's `README.md` is the kit's own guide to its tools.

## Setup

Needs Node 20+, Python 3 with pip, and ffmpeg. From the repo root:

```sh
bash studio/setup.sh
```

For both projects it runs `npm ci`, fetches Remotion's headless Chrome, runs `pip install -r scripts/requirements.txt`, and writes the scores git doesn't keep. Run it again any time: finished steps are skipped (`npm ci` reruns only when `package-lock.json` changes). It takes about a minute on a fresh clone.

Besides npm, PyPI and github.com, it downloads the type system from `codeload.github.com` and Chrome from `www.remotion.dev` and `remotion.media`.

## Generated, not in git

`public/audio/*.wav` in both projects. The scripts remake them byte for byte from the timelines; `setup.sh` writes them when they're missing. Remake them after a timeline changes:

| File | Command (in the project) |
| --- | --- |
| `motion/public/audio/sting-5s.wav`, `sting-2s.wav` | `python3 scripts/make_sting_score.py` (`render_stings.py` runs it too) |
| `explainer/public/audio/score.wav` | `python3 scripts/make_score.py` |
| `explainer/public/audio/music.wav`, `foley.wav` (stems for a voiceover mix) | `python3 scripts/make_score.py --stems` |

The textures are in git and their scripts remake them identically: `motion/public/paper/` (`scripts/make_paper.py`), `explainer/public/tex/` (`scripts/make_textures.py`). So are the site captures in `explainer/public/ui/`; to recapture them, see "Re-rendering" in SCRIPT.md (it needs the site build, pitch.dog's shared assets and Playwright).

## Main commands

Run these inside the project folder.

| Job | Command |
| --- | --- |
| Preview in Remotion Studio | `npm run dev` |
| Lint and type-check | `npm run lint` |
| **motion** | |
| Stings: every size, film-printed, with contact sheets | `python3 scripts/render_stings.py` |
| One sting at one size | `python3 scripts/render_stings.py 5s 1080x1920` |
| Stings without the film print | `python3 scripts/render_stings.py --clean` |
| Reel inserts, a series | `node scripts/render_inserts.mjs inserts/specs/foryou [outDir]` |
| One insert | `node scripts/render_inserts.mjs --one inserts/specs/foryou/11-2-timezone-premiere.json [out.mp4]` |
| Insert review sheets | `python3 scripts/insert_sheet.py out/inserts/foryou` |
| Sting score | `python3 scripts/make_sting_score.py` |
| Logo and loop paths from `../../brand` | `python3 scripts/make_marks.py` |
| Contact sheet of any video | `python3 scripts/contact.py video.mp4 0,30,60 sheet.png` |
| Loudness and sync of the masters | `python3 scripts/measure_finals.py` |
| **explainer** | |
| All four masters with contact sheets | `scripts/render_final.sh` (or name sizes: `scripts/render_final.sh 1080x1920`) |
| Stills and a sheet of them | `scripts/stills.sh 1080x1920 52,190,428,1808` |
| A short range | `npx remotion render Explainer-1080x1920 out/range.mp4 --frames=1440-1530` |
| Score | `python3 scripts/make_score.py` |
| Score report (spectrogram, scenes marked) | `python3 scripts/audio_report.py` |
| Strip of frames from a video | `python3 scripts/strip.py video.mp4 strip.png "0,4,8;130,136"` |
| Voiceover mix | `scripts/mix_vo.sh path/to/vo.wav` |
| **both** | |
| Film-print pass | Render PNG frames (`npx remotion render <Comp> out/frames/<Comp> --sequence --image-format=png`), then `python3 scripts/print_film.py out/frames/<Comp> out/<name>.mp4 --look <dark\|paper> --audio public/audio/<score>.wav`. Motion adds the `sheet` look, which `render_stings.py` uses; the explainer's masters carry their grain in the picture and skip the print |

## Where the outputs go

Everything lands in each project's `out/`, which git ignores:

- `motion/out/final/`: sting masters `callsheet-sting-<2s|5s>-<WxH>.mp4` and their `-contact.png`.
- `motion/out/inserts/<series>/`: inserts (`.mp4` plus a `.jpg` poster) and `_review/` sheets. Pass an `outDir`, such as the launch kit's `video/reel-inserts/<series>`, to render straight there.
- `explainer/out/final/`: `callsheet-explainer-<WxH>.mp4`, their `-sheet.png`, and `-vo.mp4` after a voiceover mix.
- `explainer/out/stills/`: stills and their sheets.

Commit the source, never the renders.
