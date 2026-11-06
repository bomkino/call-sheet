---
name: call-sheet-video
description: Make Call Sheet video and motion assets (Reels, stings, explainers, inserts, monthly edition films, ads, website loops, callouts) in Call Sheet's paper-and-red-pen house look, with Remotion, from the studio/ folder. Use for any Call Sheet video, animation, motion graphic, Reel, sting, title card or video callout, and when refining or re-rendering existing ones.
---

# Call Sheet video

Everything lives in `studio/`. Start with `studio/CLAUDE.md`, then read `studio/DESIGN.md`, `studio/COPY.md`, `studio/FORMATS.md` and `studio/LOG.md` in full before designing anything, and look at the stills in `studio/reference/`.

## Set up

Run `bash studio/setup.sh` once per fresh machine from the repo root. It installs both Remotion projects and the Python tools. Chromium for rendering is already on cloud machines.

## Choose where to build

| The piece | Build it in |
| --- | --- |
| Short pieces: stings, inserts, callouts, edition films, loops | `studio/motion` |
| Long-form, or anything showing the site | `studio/explainer` |
| A one-off Reel insert | Write a spec in `studio/motion/inserts/specs/<series>/` and render it with `scripts/render_inserts.mjs` |

## The loop for every piece

Follow `studio/CLAUDE.md`, "How to make a piece":
1. Write the brief in one line.
2. Take the facts from `data/calls.json`.
3. Make three stills of three ideas, and pick one.
4. Build on a beat grid.
5. Score in code.
6. Render every frame size.
7. Review the contact sheets at phone size, then fix.
8. Deliver to the owner, commit the source and log the piece in `studio/LOG.md`.

## Hard rules

- One red mark at a time.
- Nothing overlaps.
- Keep out of the safe zones.
- Facts must be true on the posting day.
- Say "opportunities", never "calls".
- No web address in social posts.
- Manali is they/them.
- Use only the type system's roles.
