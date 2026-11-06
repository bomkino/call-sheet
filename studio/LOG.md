# Studio log

What's been made, what the owner said about it, and what we learned. Read it before you start; add to it when you finish. Put the newest entry at the top of "Made so far".

## The owner's taste, in their words

- "Achingly beautiful." "Go all out." The work should feel like posters, with soul and attention to detail, not templates.
- Then, about a busy round: **"busy and ugly, overlapping and weird."** The fix that won was calm: one big line, one simple object, lots of air, nothing touching, and one red mark.
- "Tailor them to the reel." Every piece is made for its own context: it echoes the hook, the props and the moment it cuts in on. No template with the text swapped.
- "Too AI-y." Machine-sounding copy or internal process talk ("bot checks", "N pages wouldn't let us in") doesn't belong in front of people. Say it plainly or leave it out.

## Made so far

| When | Piece | Where | Notes |
| --- | --- | --- | --- |
| 20 Oct 2026 | **Explainer v2**, 1:00.4, at 16:9, 9:16, 1:1 and 4:3 | `explainer/` | New opening card ("Are you looking for funding for your film?"); problems renamed (grants are scattered, the fine print, time zones are confusing, hidden fees); each fix ticks its problem. Re-captured from the live site so it says "opportunities". Introduced the dried-mark rule: the previous red mark dries to grey when the next is drawn |
| 19 Oct 2026 | **71 Reel inserts** for 45 Reels | `motion/src/inserts`, specs in `motion/inserts/specs/` | One scene system with motifs, hook echoes and custom scenes. The first round was too small and loops crossed text. The fix: a 44 px reading floor, loops reserving their own space, and copy that refuses to render if it doesn't fit. Bug found: count-up dropped decimals ($1.2m → $12m); the renderer now verifies the final number |
| 17 Oct 2026 | **Explainer v1**, 58 s | `explainer/` | The paper world, the red pen, D minor → F major. The owner later rewrote the copy to be plainer (v2) |
| Oct 2026 | **Stings**, 2 s and 5 s, five sizes | `motion/src/cs` | "Circle the one": a printed list, the loop on a date, a match cut into the logo, the corner folding over the next edition's colour, the margin bell. Three concepts were mocked; the physical story won over a colour slideshow and a showy macro shot |

## Lessons

- **Mock before you build.** Three quick stills of three different ideas, then pick. It saved the stings.
- **Calm survives review; clever often doesn't.** Fewer elements every time.
- **Make the renderer enforce the rules** (fit, safe zones, type floors, one-line loops, exact amounts), so the next piece can't break them.
- **Facts drift.** Counts and deadlines change monthly. Read them from the data at build time and keep a post-by date.
- **Look at every frame, at phone size, before saying it's done.** Then check the sound at every cut.
