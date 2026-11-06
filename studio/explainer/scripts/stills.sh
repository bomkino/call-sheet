#!/usr/bin/env bash
# Renders stills of one size at the frames given, then a contact sheet of them.
#   scripts/stills.sh 1080x1920 60,120,200   ->  out/stills/<size>/f-<frame>.png, out/stills/<size>-sheet.png
set -e
size=$1; frames=$2
dir=out/stills/$size
rm -rf "$dir"; mkdir -p "$dir"
npx remotion render "Explainer-$size" "$dir" --sequence --image-format=png --frames="$frames" --log=error >/dev/null
python3 - "$dir" "$size" <<'PY'
import sys, glob, re
from PIL import Image, ImageDraw
d, size = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(f"{d}/*.png"), key=lambda f: int(re.findall(r"(\d+)\.png$", f)[0]))
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
tw = 480 if w >= h else 300
th = int(h * tw / w)
cols = 4 if w >= h else 6
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 10) + 10, rows * (th + 34) + 10), (40, 38, 34))
dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = 10 + (i % cols) * (tw + 10), 10 + (i // cols) * (th + 34)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 24))
    dr.text((x, y + 4), "f" + re.findall(r"(\d+)\.png$", f)[0], fill=(240, 236, 228))
sheet.save(f"out/stills/{size}-sheet.png")
print("sheet", sheet.size, len(ims))
PY
