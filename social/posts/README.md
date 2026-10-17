# Call Sheet social posts

The designed posts for Call Sheet's launch and its monthly updates, as one HTML template. Every post is live text set in the pitch.dog type system, so a number or a date is a one-line change, not a redraw.

- `posts.html` holds every post and every size. Open `posts.html?id=day&size=1080x1350` to see one. Add `&flat=1` for the version that goes to Figma.
- `make_data.py` writes the four data files the template reads. It takes the free-to-enter calls and the country counts from `data/calls.json`, and the marker loops and rubber stamps from `brand/tools/make_brand.py`.
  - `loops.js`: marker loops.
  - `art.js`: the stamp outlines.
  - `free.js`: the free-to-enter calls.
  - `places.js`: the "Based in…?" counts and picks.
- `render.mjs` renders PNGs for posting, and with `--pdf`, flat vector PDFs for Figma. It also writes `report.json`, listing anything that spills out of a safe area.
- `serve.py` serves the repository, with the type system mounted at `/type/`.

## Make them

```sh
pip install fonttools brotli uharfbuzz
python3 social/posts/make_data.py --fonts ../pitchdog-type-system/assets/fonts
python3 social/posts/serve.py ../pitchdog-type-system &
cd /tmp/posts && node path/to/call-sheet/social/posts/render.mjs [id or prefix] [--pdf]
```

`render.mjs` needs Playwright. Point `PLAYWRIGHT_MODULE` at its `index.mjs` if it isn't installed next to the script. Files land in `./out`, or in `$OUT`.

## The sets

| Set | Posts | Sizes |
| --- | --- | --- |
| Lead with these: the problem | `day`, `websites`, `page9` | 4:5, 1:1, 9:16 |
| Carousel: why good projects miss good funds | `why-01` to `why-07` | 4:5, 1:1 |
| Based in…? | `place-us`, `place-gb`, `place-ca`, `place-au` | 4:5, 9:16 |
| Singles | `launch`, `tabs`, `zero`, `clock`, `circle`, `unknown`, `monthly`, `open`, `board`, `pitch`, `dm` | 4:5, 1:1, 9:16 (and link-preview sizes for some) |
| Carousels | `how-01`–`07`, `free-01`–`06`, `read-01`–`07` | 4:5, 1:1 |
| YouTube thumbnails | `thumb-a`, `thumb-b` (use for the explainer), `thumb-c` | 1280×720 |

The "Based in…?" posts cover only the countries pitch.dog's clients work from. Each links to its own list on the site, such as pitch.dog/call-sheet/us, and that page shows exactly the calls the number counts. `PLACES` in `make_data.py` names the three calls each post shows. They're picked by hand, must be open countrywide (no city, state or identity limit), and the script stops if one no longer fits.

## Each month

1. Update the data, rebuild the site, then run `make_data.py`.
2. Check the dated posts: `board`, the `free` carousel, `zero`, `clock` and the `place` posts. Swap any featured call that has closed.
3. Render, look at every PNG, and read `report.json`.
4. For Figma, render with `--pdf`, convert each PDF with `pdftocairo -svg`, and import the SVGs. They arrive as vectors at 75% scale (PDF points), so scale each frame back up to its pixel size.

**Figma and blend modes.** Figma imports soft masks as solid black. So the flat version blends nothing: no `mix-blend-mode`, no paper grain. Keep it that way when you add a post. If an import turns black, look for a blend mode or a group opacity over an image.

## Rights

The template and scripts are 0BSD and the words are CC0, like the rest of the repository. The Call Sheet marks they draw on (`brand/`) are pitch.dog's and aren't covered. The `pitch` post shows three slides from decks pitch.dog designed. It loads them from pitch.dog, and they aren't part of this repository or its licences.
