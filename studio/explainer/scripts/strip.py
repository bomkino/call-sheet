"""Pulls frames out of a video and lays them out in rows, for checking motion.

    python3 scripts/strip.py video.mp4 out.png "0,4,8,12;130,136,140,144" [thumb_width]
Rows are separated by ';'.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

video, out, spec = sys.argv[1], sys.argv[2], sys.argv[3]
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 260
rows = [[int(f) for f in r.split(",")] for r in spec.split(";")]
frames = sorted({f for r in rows for f in r})
tmp = Path(tempfile.mkdtemp())
sel = "+".join(f"eq(n\\,{f})" for f in frames)
subprocess.run(["ffmpeg", "-loglevel", "error", "-i", video, "-vf", f"select='{sel}'", "-vsync", "0", str(tmp / "f%04d.png")], check=True)
files = sorted(tmp.glob("f*.png"))
got = dict(zip(frames, files))
first = Image.open(files[0])
w, h = first.size
th = int(h * tw / w)
cols = max(len(r) for r in rows)
sheet = Image.new("RGB", (cols * (tw + 6) + 6, len(rows) * (th + 22) + 6), (40, 38, 34))
d = ImageDraw.Draw(sheet)
for ri, r in enumerate(rows):
    for ci, f in enumerate(r):
        x, y = 6 + ci * (tw + 6), 6 + ri * (th + 22)
        sheet.paste(Image.open(got[f]).convert("RGB").resize((tw, th), Image.LANCZOS), (x, y + 18))
        d.text((x, y + 2), f"f{f}  {f / 30:.2f}s", fill=(240, 236, 228))
sheet.save(out)
print(out, sheet.size)
