# Call Sheet, the brand

On a film set, the call sheet tells everyone where to be and when. The call time is the one number nobody misses. Our Call Sheet does the same job for grants, labs, markets and festivals: the deadline is your call time.

The identity comes from three things everyone who has made a film has done:

- **Circle the one that's yours.** You print the list, read it with a red pen, and circle the call that fits. The loop is drawn in code from a fixed seed, so it is the same hand every time, and it never closes perfectly.
- **Fold the corner.** A dog-ear marks the page you'll come back to. It is the Save button made paper, and a small wink at pitch.dog.
- **Change the colour of the pages.** When a shooting script changes, the new pages come out in the next colour: white, blue, pink, yellow, green, goldenrod, buff, salmon, cherry. Call Sheet comes out the same way. Each edition starts on white, and each monthly update takes the next colour, so a returning visitor can see at a glance that something changed.

The line is **Know your call time.**

## The marks

| File | Use it for |
| --- | --- |
| `logo/call-sheet-logo.svg` | The logo. "Call Sheet" with Call circled. Use it wherever there's room. |
| `logo/call-sheet-logo-reverse.svg` | The logo on ink or a dark photo. |
| `logo/call-sheet-logo-tagline.svg` | With "Know your call time." for covers, end cards and posters. |
| `logo/call-sheet-logo-endorsed.svg` | With "by pitch.dog", where people won't know who made it. |
| `logo/call-sheet-wordmark.svg` | Without the loop, when the loop would sit on something busy or the logo is under 120 px wide. |
| `logo/call-sheet-symbol.svg` | The symbol: the circled Cs on a dog-eared sheet. Favicons, app icons and stickers. |
| `logo/call-sheet-stamp.svg` | The circled Cs without the sheet, for a round crop or a watermark. |
| `logo/call-sheet-lockup-horizontal.svg`, `-stacked.svg` | The symbol with the plain wordmark, for headers and title cards. |
| `logo/*-mono-ink.svg`, `*-mono-paper.svg` | One colour, for print, embossing and anything that can't take red. |
| `editions/call-sheet-symbol-<colour>.svg` | The symbol on each revision colour, for the month's posts and the masthead. |
| `avatar/call-sheet-avatar-ink.png`, `-paper.png` | Profile pictures, 1080 × 1080, safe in a circle crop. |
| `icons/` | Favicons and touch icons. |
| `web/` | The versions the site inlines: letters in `currentColor`, and a loop that draws itself. |

**Clear space.** Keep the height of the C clear on every side of the logo. The loop counts as part of the logo.

**Minimum size.** The logo with its loop: 120 px wide on screen, 30 mm in print. Below that, use the wordmark. The symbol holds up at 16 px.

**Don't** redraw the loop by hand, close it, recolour it outside the palette, or put it around anything except Call or Cs in a logo. In layouts the loop is free to circle a date, a number or a word, which is the whole point. Don't stretch, outline, shadow or rotate the logo, and don't set "Call Sheet" in another typeface and call it the logo.

## Colour

| Name | Hex | Job |
| --- | --- | --- |
| Paper | `#F3EFE6` | The page. Warm photocopy white; the ground for almost everything. |
| Ink | `#15130F` | Type, the sheet in the symbol, the primary button. |
| Marker | `#E3472D` | The loop and the dog-ear. Never small text on paper. |
| Marker text | `#C2381F` | Red words on paper (4.9:1). |
| Toner | `#66625A` | Labels, dates, captions. |

Revision colours, one per monthly update, in this order: White `#FBF9F3`, Blue `#A8C8EA`, Pink `#F3B5C8`, Yellow `#F4DF77`, Green `#B5D9A2`, Goldenrod `#E6B640`, Buff `#E9D5AE`, Salmon `#F3A58A`, Cherry `#CF3B52`. They're paper, not paint: use them as grounds and page edges, never for text. All of them sit in `palette.json`.

Red is for the hand: the loop, the dog-ear, a tick. If something is red and wasn't drawn with a pen, it probably shouldn't be red.

## Type

All type comes from the [pitch.dog type system](https://github.com/bomkino/pitchdog-type-system), through its roles. Don't set sizes or weights by hand.

- **PD Head**, heavy and soft, for the logo, display lines and big numbers. Its italic carries the line, "Know your call time."
- **PD Eyebrow**, the typewriter, for labels written the way a call sheet labels its boxes: CALL TIME, LOCATION, WHAT TO BRING, EDITION 1 · WHITE PAGES.
- **PD Body** for everything you read.

The logo letters are PD Head at weight 820, outlined. `tools/make_brand.py` draws every SVG here from the type system's font files, so a change to the drawing happens in code, not by hand.

## Layout

Lay things out like production paperwork: ruled boxes, labels in the corner, one big number or date that matters, and lots of paper. Then let the hand in: one loop, one dog-ear, maybe a tick. Paper grain and a little warmth are welcome. Gradients, glows and stock photos aren't.

## Voice

Plain, warm, specific, a little funny, and honest about gaps. Say what a call gives, who can apply and when it closes, in that order. "Not published" is not "free". Never "every grant in the world"; say how many, and when we checked.

## Making the files

```sh
pip install fonttools brotli uharfbuzz
python3 brand/tools/make_brand.py --fonts ../pitchdog-type-system/assets/fonts
node brand/tools/export_png.mjs   # needs Playwright's Chromium
```

## Rights

The Call Sheet name, logo, symbol and the drawings in this folder are pitch.dog's marks and aren't covered by the repository's open licences, so nobody can pass off another list as ours. The palette, this guide and the code that draws the marks are open, like everything else here (see LICENSE and LICENSE-DATA).
