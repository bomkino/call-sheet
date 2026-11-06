# Remotion craft for social video

Research from 3 Oct 2026, copied from [the original doc](https://claude.ai/code/artifact/79f64e52-9777-4f28-880f-ad66fe72afec).

**All of it is optional.** It's technique, never a style to copy: use what serves the piece and skip the rest. It was written against the Pointing Paws outro in bomkino/pointing-paws, so "the repo" and "the outro" below mean that code. This kit already has the colour-true motion blur and the 20 ms picture lead.

Scope: the techniques for cinematic, beat-synced motion in Remotion for short social video, checked against what Pointing Paws already does. It covers how to do things, not what they should look like.

## Do next

The first three protect finished work, two on its way through Instagram and one in the blur. The rest are tooling and motion mechanics.

| Change                                                                                                       | Why                                                                                                                                                                                                          | Where it lands                                                                          | Effort    |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------- |
| Encode a post copy inside Meta's spec: `-use_editlist 0 -bf 0`, VBR up to 25 Mbps, AAC at 128 kbps           | The API caps uploads at 25 Mbps and bans edit lists, and the prints run near 70 Mbps. Edit lists are MP4 timing offsets some players skip; skipped, they turn the 20 ms picture lead into a 25 ms sound lead | `print_film.py` and any plain Remotion cut you post: a second encode beside each master | Small     |
| Add a preview encode near Instagram's bitrate and judge grain on it                                          | Low bitrates wipe fine grain or make it pulse                                                                                                                                                                | `print_film.py` looks                                                                   | Small     |
| Swap the outro's motion blur for the starter kit's                                                           | Chrome rounds canvas alpha to 1/255 steps, so equal weights ran about 6% dark at the outro's 48 samples; the kit's weights sum exactly                                                                       | `src/outro/MotionBlur.tsx`, then re-render                                              | Tiny      |
| Install Remotion's agent skills                                                                              | Claude gets current rules and docs; the docs MCP server is deprecated                                                                                                                                        | Repo, via `npx skills add remotion-dev/skills`                                          | Tiny      |
| Write new scenes with `interpolate()` inline: easing arrays, `posterize`, `Easing.spring({allowTail: true})` | Stepped timing, overlapping springs and Studio timing edits, one option each                                                                                                                                 | New scenes and `motion.ts`                                                              | Per scene |
| When cutting to licensed music, grid it with Beat This!                                                      | Its per-beat times keep hits locked where a fixed frame count per beat drifts                                                                                                                                | A new script that writes `timeline.json`                                                | Medium    |

Also switch `remotion.config.ts` from JPEG frames (quality 80 by default) to PNG for the plain cuts, so frames aren't compressed twice. Keep the 20 ms picture lead, the loudness pass and the 709 conversion as they are; the sources back all three.

## Remotion now

Pointing Paws is on the current release: 4.0.532 (1 Oct 2026) is npm's latest, and 5.0 is announced but not out.

- **`interpolate()` now does what `motion.ts` hand-rolls.** Per-segment easing arrays (4.0.462) match `track()`. `posterize: n` (4.0.470) samples an animation every n frames, which is animating on twos in one option. `output: 'perceptual-scale'` (4.0.490) makes a scale move read evenly, since visible area grows with scale squared. ([interpolate](https://www.remotion.dev/docs/interpolate))
- **Studio edits timing in place (4.0.475).** Dragging keyframes and easing curves writes back to source, as long as `interpolate()` sits inline in `style` and moves `translate`, `rotate` or `scale` rather than a `transform` string. That lets a person nudge a hit without touching code. ([interactivity](https://www.remotion.dev/docs/studio/interactivity))
- **`@remotion/effects` (4.0.464)** adds over 70 GPU effects (noise, LUT, light leak, vignette, glow) to images, video and `<HtmlInCanvas>`. The docs don't state a bit depth, so the Python print stays the reference finish. ([effects](https://www.remotion.dev/docs/effects))
- **Beat checks are one command.** `npx remotion render PointingPawsOutro --frames=8,22,36` (4.0.502) writes v1's first three taps as stills. ([render CLI](https://www.remotion.dev/docs/cli/render))
- **Licence: free at three people.** The free tier covers "an organization or team of individuals with up to 3 people". A fourth person operating Remotion, freelancers included, triggers $25 a month per person who writes Remotion code, by hand or with agents. Remotion 5.0, announced but not out, will also want a licence key in renders. ([licence FAQ](https://www.remotion.dev/docs/license/faq), [terms](https://www.remotion.dev/docs/terms), [5.0 migration](https://www.remotion.dev/docs/5-0-migration))

## Beat sync

The repo's method is what the evidence supports: a JSON beat grid drives picture and score, and the picture lands slightly first. Remotion has no beat tools of its own, only audio-reactive ones.

- **For licensed or trending tracks, use Beat This!** (ISMIR 2024). It finds beats and downbeats, and its code and weights are MIT: `pip install beat-this`, then `File2Beats(checkpoint_path="final0", dbn=False)`. madmom's models are non-commercial, Essentia is AGPL, librosa has no downbeats, and All-In-One was last updated in 2023. ([Beat This!](https://github.com/CPJKU/beat_this), [All-In-One](https://github.com/mir-aidj/all-in-one))
- **Place hits from each beat's own time.** Convert every time Beat This! returns with `frame = floor(t × fps)`, which keeps hits on or just before the beat. Stepping a fixed frame count drifts: at 128 BPM and 30 fps, 14 frames instead of 14.0625 is 4 frames off after 30 seconds. For new synthesised scores, 12 or 16 frames a beat keeps sixteenth notes on whole frames; at 14 they alternate 3 and 4.
- **Keep the picture first; people forgive late sound.** ITU-R BT.1359 puts the detection threshold at 45 ms with sound early but 125 ms with sound late. EBU R37 allows sound 40 ms early and 60 ms late end to end. The 20 ms picture lead sits on the forgiving side. ([BT.1359-1](https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1359-1-199811-I!!PDF-E.pdf), [EBU R37](https://tech.ebu.ch/docs/r/r037.pdf))
- **Watch file-level offsets.** Remotion's own MP4s played audio 42.67 ms late until 4.0.531 fixed it with an audio edit list, so don't pin below that. Round-trip one post: download it and step through a hit against its click. ([issue #11704](https://github.com/remotion-dev/remotion/issues/11704))

## Motion mechanics

Each of these is one Remotion option or package; the spring numbers were measured on the repo's own configs.

- **Check settle time against the beat.** `measureSpring()` returns how many frames a spring config takes to settle. Every `springAt()` call in the repo sets its own config, so the `motion.ts` default never renders. The outro's tap springs (damping ratios 0.26 to 0.53) settle in 13 to 27 frames and the slapstick cut's (0.20 to 0.39) in 18 to 32, so most are still ringing when the next 14-frame beat lands. A ratio of 0.8 settles in 9 to 12 frames, inside one beat. (Measured with Remotion 4.0.532.)
- **Overlap springs across segments.** `Easing.spring({allowTail: true})` (4.0.483) lets a segment's spring keep settling after the next segment starts, added on top of it. `durationRestThreshold` sets how much carries over: on a 100 px move, the default left under 0.5 px, while 0.1 arrived about 8 px short and rang on through the next segment. ([Easing](https://www.remotion.dev/docs/easing); measured with Remotion 4.0.532)
- **Keep stepped layers out of the blur.** `posterize` floors the frame to a multiple of n, so blur samples that straddle a step get two different values. Under the repo's sub-frame blur, a stepped layer would show two copies at every step, the same ghosting already found at tap frames, so render it outside `<MotionBlur>`. (Inferred from the `interpolate()` source.)
- **Shake that scales with impact.** Eiserloh (GDC 2016): each hit adds to a 0-to-1 trauma level that decays linearly, shake is trauma squared or cubed, and smooth Perlin noise drives each axis from its own seed. In Remotion that's `noise2D()` from `@remotion/noise`. ([Eiserloh slides](http://www.mathforgameprogrammers.com/gdc2016/GDC2016_Eiserloh_Squirrel_JuicingYourCameras.pdf), [noise2D](https://www.remotion.dev/docs/noise/noise-2d))

## Blur and film finish

The repo's finish is ahead of anything Remotion ships; the open question is how much grain survives Instagram's re-encode.

- **Keep a half-float blur, in the starter kit's version.** Remotion's blur components still lose colour: `<HtmlInCanvasMotionBlur>` adds samples into an 8-bit canvas at `globalAlpha = 1/samples`, and the docs call `<CameraMotionBlur>` "destructive to colors". Building this kit also showed that Chrome rounds canvas alpha to 1/255 steps, so equal weights drift in brightness; the kit's `MotionBlur` uses weights that sum exactly. ([source](https://github.com/remotion-dev/remotion/blob/main/packages/motion-blur/src/HtmlInCanvasMotionBlur.tsx), [camera blur](https://www.remotion.dev/docs/motion-blur/camera-motion-blur))
- **Fine grain is what a re-encode strips.** At low bitrates grain "is often completely removed or it manifests pulsing because of temporal quantizer variation", the AV1 film-grain paper found. Nothing public says Meta synthesises grain for Reels. ([Norkin 2018](https://norkin.org/pdf/DCC_2018_AV1_film_grain.pdf), [Meta on AV1](https://engineering.fb.com/2023/02/21/video-engineering/av1-codec-facebook-instagram-reels/))
- **Judge the print at delivery bitrate.** Inferred from the point above: add a preview encode near Instagram's (VP9, 1080x1920, about 1.3 Mbps) and tune grain on that, not on the 70 Mbps master.
- **spektrafilm** (formerly agx-emulsion) is an open, physically based film simulator: spectral sensitivities, couplers, stochastic grain, halation, enlarger and print. It exports `.cube` LUTs that `print_film.py` or ffmpeg `lut3d` can apply if a piece ever wants a specific stock's colour. Code is GPLv3; LUTs allow commercial use but not resale. ([spektrafilm](https://github.com/andreavolpato/spektrafilm))

## Type in motion

Type moves cleanly in Remotion when it travels by transform.

- **Stop subpixel shimmer on slow moves.** Chrome snaps text to whole pixels, so slow drifts step. Remotion's fix is `transform: 'perspective(100px)'` plus `willChange: 'transform'`, applied only while rendering. ([subpixel rendering](https://www.remotion.dev/docs/troubleshooting/subpixel-rendering))
- **Captions for full episodes.** `transcribe()` from `@remotion/install-whisper-cpp` with `tokenLevelTimestamps: true` returns word timings from a 16 kHz WAV. `createTikTokStyleCaptions()` then pages them, and `combineTokensWithinMilliseconds` sets how many words share a page. ([transcribe](https://www.remotion.dev/docs/install-whisper-cpp/transcribe), [captions](https://www.remotion.dev/docs/captions/create-tiktok-style-captions))

## Sizes and Instagram delivery

Instagram re-encodes everything and saves its better encodes for Reels that draw views, so check work on a low-bitrate copy and post a file inside Meta's written spec.

| Format            | Upload    | Notes                                                                                           |
| ----------------- | --------- | ----------------------------------------------------------------------------------------------- |
| Reels, 9:16       | 1080x1920 | Meta's ad guidance keeps 14% top, 35% bottom and 6% each side clear: 269, 672 and 65 px         |
| Profile grid, 3:4 | 1080x1440 | Grid tiles have been 3:4 since Jan 2025, so a 9:16 Reel loses about 240 px top and bottom there |
| Landscape, 16:9   | 1920x1080 | Reels accept 1.91:1 to 9:16; the API caps width at 1920 px                                      |

The pitch.dog type system keeps 320 px clear at the bottom of 9:16, against Meta's 672 for ads. For organic posts, check against Remotion's [Social Safe Zones](https://www.remotion.dev/elements/overlays/social-safe-zones/) element, which overlays the real Reels UI in Studio. ([Ads guide](https://www.facebook.com/business/ads-guide/update/video/instagram-reels), [Instagram help](https://www.facebook.com/help/instagram/1038071743007909), [PetaPixel on the grid](https://petapixel.com/2025/01/23/instagram-swaps-square-profile-grids-for-rectangles/))

- **Post a copy inside the spec.** Meta's API wants H.264 or HEVC, closed GOP, 4:2:0, 23 to 60 fps, VBR up to 25 Mbps, 300 MB, AAC at 128 kbps and 48 kHz, moov first and no edit lists. The repo's prints run near 70 Mbps, so keep them as masters. ([Graph API](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/))
- **Edit lists can move the beat.** They are MP4 timing offsets, and ffmpeg writes one per track by default. Measured for this brief (ffmpeg 6.1.1, x264 slow, AAC): a player that skips them plays the sound 45 ms early. `-use_editlist 0` alone measured 45 ms early in every player; adding `-bf 0` measured 0.0 ms either way. The worst case, a 25 ms sound lead, is under BT.1359's 45 ms detection threshold, so this is insurance, not a visible fix.
- **Better encodes wait for views.** Meta runs software H.264, VP9 or AV1 only once a Reel's projected watch time crosses a threshold; its hardware pass at upload keeps measurements, not video. Mosseri: "We bias to higher quality ... for creators who drive more views." One download of a Reel topped out at 1080x1920 VP9, about 1.3 Mbps. ([Meta on AV1](https://engineering.fb.com/2023/02/21/video-engineering/av1-codec-facebook-instagram-reels/), [TechCrunch](https://techcrunch.com/2024/10/27/instagram-is-lowering-video-quality-for-unpopular-videos), [instaloader issue](https://github.com/instaloader/instaloader/issues/2416))
- **Colour: BT.709 for Instagram, sRGB tags for review copies.** Meta's SDR target is BT.709, and `print_film.py` already converts with a 709 matrix and tags it. Safari and QuickTime show 709-tagged files lighter (gamma about 1.96) than Chrome, so tag browser review copies `-color_trc iec61966-2-1`, as the ASWF recommends. ([Meta HDR](https://engineering.fb.com/2023/07/17/video-engineering/hdr-video-reels-meta/), [ASWF](https://academysoftwarefoundation.github.io/EncodingGuidelines/WebColorPreservation.html), [Apple TN2257](https://developer.apple.com/library/archive/technotes/tn2257/_index.html))
- **Loudness stands.** Instagram normalises on the phone from xHE-AAC loudness metadata and publishes no LUFS target, so the repo's -14 LUFS pass needs no change. ([Meta on xHE-AAC](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/))

## AI agents with Remotion

Remotion now ships its own agent skills, which hold the rules that keep agent-written video deterministic.

- **Install Remotion's skills in the repo.** `npx skills add remotion-dev/skills` adds 12 skills, among them `/remotion-best-practices`, `/remotion-markup`, `/remotion-render` and `/remotion-docs`. They carry Remotion's rules for agents: drive motion from `useCurrentFrame()`, never CSS animation, and use `random(seed)`, never `Math.random()`. The hosted docs MCP server is deprecated in favour of `/remotion-docs`. ([skills](https://www.remotion.dev/docs/ai/skills), [markup skill](https://github.com/remotion-dev/skills/blob/main/skills/remotion-markup/SKILL.md), [MCP](https://www.remotion.dev/docs/ai/mcp))

## Sources and open questions

Every linked page was opened for this brief on 3 Oct 2026, and each source sits beside its claim above. Lines marked inferred are reasoning from those sources; measured lines come from tests run here with ffmpeg 6.1.1 and Remotion 4.0.532.

- Open: does Instagram's ingest honour or ignore MP4 edit lists, and does it keep colour tags? A downloaded test post would answer both.
- Open: do organic Reels ever get AV1 grain synthesis or a delivery rung above 1080x1920? Nothing public says so.
- Open: what bit depth do `@remotion/effects` work in? The docs don't say.
