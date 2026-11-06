# Remotion starter kit

pitch.dog's starting point for short videos in [Remotion](https://www.remotion.dev), taken from what the Pointing Paws outro proved out. You get:

- **A beat grid** in one file that drives both the picture and a score written in code, so every hit lands on its frame.
- **Instagram's three sizes**, 1080×1920, 1080×1440 and 1920×1080, each laid out from its own safe area.
- **Motion blur that keeps colours true**, unlike Remotion's stock blur.
- **A film-print finish** (halation, grain, flicker, a soft CRT beam), printed in code from a clean render.
- **Sound 20 ms behind the picture**, because a cut a hair ahead of its note reads as on it.
- **Research** on Remotion craft for social video, in [`RESEARCH.md`](RESEARCH.md): what's new in Remotion, beat sync, motion mechanics and Instagram delivery.

It ships with a five-second example end card, `EndCard`, that uses all of it. Every part is optional: use what serves the piece and skip the rest.

## Get going

You need Node 20 or newer, Python 3, and ffmpeg on your path.

```sh
npm install
python3 -m pip install -r scripts/requirements.txt   # numpy, scipy, pillow

npm run dev            # Remotion Studio
npm run score          # rebuild public/audio/score.wav from the timeline
npm run render         # clean masters: out/EndCard-1080x1920.mp4 and the other two sizes
npm run render:cine    # printed to film: out/EndCard-<size>-cine.mp4
```

`npm run render -- 1080x1440` renders one size, and `npm run render:cine -- --look paper` uses the film look for bright grounds. On a four-core machine a clean render takes about 40 seconds a size, and the film print about four minutes more.

## Make your own piece

Start each new piece in its own repo, from a fresh copy of the kit.

1. **Set the beat and name the moments** in [`src/timeline.json`](src/timeline.json).
2. **Build the scene** in its own file and register it in [`src/Root.tsx`](src/Root.tsx) as `<Scene>-<size>`, one composition per size. [`src/example/EndCard.tsx`](src/example/EndCard.tsx) shows the wiring: times from `T.<event>`, layout from `size.safe`, the blur and the score. Its look is only a demo, so don't carry it over.
3. **Write the cue** in `score()` in [`scripts/make_score.py`](scripts/make_score.py), then `npm run score`.
4. **Render** with `npm run render -- <Scene>`, or `npm run render:cine -- <Scene>`.

## How it fits together

### The beat grid

```json
{
  "fps": 30,
  "framesPerBeat": 14,
  "firstBeat": 8,
  "durationInFrames": 150,
  "soundDelayMs": 20,
  "events": {
    "title": 1,
    "emphasis": 2,
    "rule": 3,
    "mark": 4,
    "hit": 5,
    "end": 6
  }
}
```

14 frames a beat at 30 fps is 128.6 BPM, and beat 1 falls on frame 8. Events are in beats: `2.5` is the and-of-2. [`src/timeline.ts`](src/timeline.ts) turns them into frames (`T.title` is frame 8) and the score script rounds them the same way, so a sound starts on its picture's frame. Keep an `end` event: it marks where the card comes to rest, and the film print settles from there.

### Three sizes

| Size      | Safe area (top, right, bottom, left) | From the type system                         |
| --------- | ------------------------------------ | -------------------------------------------- |
| 1080×1920 | 250, 80, 320, 80                     | the story canvas                             |
| 1080×1440 | 92, 80, 96, 80                       | borrowed from the 4:5 feed portrait          |
| 1920×1080 | 90, 90, 90, 90                       | borrowed from YouTube's 1920×1080 end screen |

The pitch.dog type system (v3.0.0) has no 3:4 or 16:9 social canvas, so those two borrow the nearest governed safe areas. The sizes live in [`src/sizes.json`](src/sizes.json), which the render script reads too. A phone shows a 16:9 frame about 390 px wide, so only the big type roles (display, headline, quote, metric) stay legible there.

### Motion blur

[`<MotionBlur>`](src/lib/MotionBlur.tsx) renders sub-frame samples of its children across a 200° shutter and averages them in a half-float canvas. Remotion's stock `HtmlInCanvasMotionBlur` averages in 8-bit, which turns the brand pink #f7a3d3 into #ffc4ff at 64 samples. Chrome also rounds canvas alpha to steps of 1/255, so plain 1/N weights miss: 48 samples came out about 6% dark and 96 about 13% bright. The kit gives each sample a whole number of steps that add up exactly. Measured on a grey test card, 8 to 48 samples land exactly, and 64 to 128 within 2 levels out of 255.

What to know when you use it:

- Inside `<MotionBlur>`, read the frame with `useCurrentFrame()`, not from a prop. Each sample sees its own moment between frames.
- Keep every curve continuous. A value that jumps at a frame splits into two ghosts across the samples. `hit()` in [`src/lib/motion.ts`](src/lib/motion.ts) ramps up over the half frame before a hit for this reason.
- Keep backgrounds and soft gradients outside the blur, where averaging would band them, and keep the logo outside too, so it stays clean.
- Don't put a scale on an element that holds other transformed elements. In `EndCard` that made Chrome drop the text's anti-aliasing in the samples, even at a scale of 1.00001. Give each element its own transform instead, as `EndCard` now does.
- 48 samples keeps fast type smooth. Drop to 1 once nothing moves, which renders much faster.
- Studio previews in your own browser, which needs Chrome 149 or newer with `chrome://flags/#canvas-draw-element` on to show the blur. Without it the preview plays unblurred. Renders always blur.

### The score

[`scripts/make_score.py`](scripts/make_score.py) synthesises every sound: marimba, FM keys and bells, drums, bass, whooshes and risers, with convolution reverb, a sidechain and a compressor. There are no samples or loops to license, and the seed is fixed. It writes `public/audio/score.wav` at -14 LUFS with true peak under -1.2 dBTP, and starts the whole mix `soundDelayMs` late. If you swap in your own track, delay it by 20 ms too (`ffmpeg -i in.wav -af adelay=20:all=1 out.wav`).

### The film print

`npm run render:cine` renders each size as a clean PNG sequence (the negative), then [`scripts/print_film.py`](scripts/print_film.py) prints it frame by frame, in the order light travels:

1. **Lens.** The focus finds its subject, the corners go soft, red and blue bend apart toward the edges, and light falls off into the corners.
2. **Stock.** Halation around bright type, exposure flicker that steps on the beat, dust and the odd hair, and a fade at the end of the reel.
3. **Print.** A gentle S-curve with warm blacks that never reach zero, and grain grown from a model of dye clouds, fresh every frame.
4. **Monitor.** A soft electron beam with a 6 px line pitch, and the faceplate's faint glow.

The `dark` look is for type on a dark ground and keeps its grain quiet, because boiling blacks read as video noise on a phone. `paper` is for bright grounds. Print single frames to check a look with `python3 scripts/print_film.py out/frames/EndCard-1080x1920 --stills 8,64`. The masters are big on purpose: upload them as they are, because Instagram re-encodes everything and a small file loses its grain first.

### Brand

- **Type.** The [pitch.dog type system](https://github.com/bomkino/pitchdog-type-system) is pinned at v3.0.0 and loaded in [`src/brand/fonts.ts`](src/brand/fonts.ts). Set type with its social roles (`data-pd-social="display"`) on a `data-pd-canvas` root, and add any new face you use to `fonts.ts` so renders wait for it. The governed Head italic (`data-pd-emphasis="head-italic"`) needs `--pd-wght` set inside the social roles, as `EndCard` shows.
- **Colours.** [`src/brand/brand.ts`](src/brand/brand.ts) holds the colours sampled from pitch.dog's social card. The logo only ever uses its official pink #d24599, black or white.
- **Logo.** The square logomark ([`src/brand/Logomark.tsx`](src/brand/Logomark.tsx)) sits alone in the top-right corner of the safe area at 95% opacity, and stays clean: it only ever fades. It's 136 px: the brand kit says 112, which the team found too small in the Pointing Paws outro.

## Rights

- The pitch.dog logomark is © pitch.dog and not open-licensed.
- The type system is installed from its own repository, not copied here. Only its font files carry a CC0 dedication; the rest of it is all rights reserved.
- The score and every sound in it are original to this kit.
- Remotion is free for individuals, non-profits and for-profit companies of up to three employees; bigger companies need a company licence. See [remotion.dev/license](https://www.remotion.dev/license).
