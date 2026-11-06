# Formats and delivery

## Sizes

Lay every size out for its own frame; don't crop one master into the others.

| Frame | Size | Use |
| --- | --- | --- |
| 9:16 | 1080×1920 | Reels, Stories, TikTok, Shorts |
| 4:5 | 1080×1350 | Feed video (Instagram, Facebook, LinkedIn) |
| 1:1 | 1080×1080 | Feed, X |
| 4:3 | 1440×1080 | LinkedIn, decks |
| 16:9 | 1920×1080 | YouTube, the website, presentations |
| 2.39:1 | 2576×1080 | Cinema-style title cards (the stings have one) |

Both projects keep their frame list in `src/sizes.json`. Add a size there, then lay it out on purpose.

## Safe zones

| Frame | Keep text out of |
| --- | --- |
| 9:16 (Reels, TikTok) | The top 220 px; the bottom 420 px (captions and buttons); the right 120 px (the like/comment/share column). The explainer keeps everything that matters between 250 and 1600 px down |
| 4:5 and 1:1 feed | A 60 px margin all round; nothing important in the bottom 120 px where the caption overlays on some apps |
| 16:9 | Title-safe at 5% |

The inserts renderer refuses copy that crosses a safe zone. Match that elsewhere.

## Encoding

| Piece | Spec |
| --- | --- |
| Masters with sound | H.264 High, yuv420p, BT.709 tagged, 30 fps, AAC 320k, -14 LUFS integrated, true peak under -1 dBTP, audio 20 ms behind picture, no B-frames and no edit lists for exact sync, `+faststart` |
| Silent inserts | H.264, CRF 23, yuv420p, `+faststart`, no audio track; about 1 MB or less for 4 s; a JPG still of the last frame beside each |
| For Meta uploads | Masters can run at 20–47 Mbps; make a ≤ 25 Mbps copy for Meta (the command is in `motion/NOTES.md`) |

## Lengths

| Piece | Length |
| --- | --- |
| Stings | 2 s and 5 s. End every Reel on one |
| Reel inserts | 2.5–5 s |
| Reels | 15–40 s, hook in the first 1.5 s |
| Explainer | about 60 s |
| YouTube Shorts | under 60 s |

## Before you call it done

1. Render a contact sheet (`scripts/contact.py`, `scripts/insert_sheet.py`) and look at every frame you made, at phone size.
2. Look at strips across every cut.
3. Check the sound against the picture at every cut (`scripts/sync_check.py`, `audio_check.py`, `measure_finals.py`).
4. Run `ffprobe` on the outputs to confirm the size, frame rate, length and that the audio does (or doesn't) exist.
5. Re-read the facts against `../data/calls.json` and the date of posting.
