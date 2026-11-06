#!/usr/bin/env python3
"""Review sheets for rendered Reel inserts.

    python3 scripts/insert_sheet.py <outDir>

Finds every *.mp4 under outDir (with its poster .jpg beside it) and writes:

    <outDir>/_review/contact.jpg        every poster frame in a grid, labelled
    <outDir>/_review/strips/<name>.jpg  per insert: 4 frames (start, 1/3, 2/3, end)
    <outDir>/_review/strips.jpg         all the strips stacked, one row per insert

The red lines on the strips mark the Reels safe zones (top 220, bottom 420,
right 120), so type in the wrong place shows at a glance.
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
THUMB = (270, 480)  # quarter size
SAFE = {"top": 220, "bottom": 420, "right": 120}


def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def duration(mp4):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0",
         "-show_entries", "stream=nb_read_packets,r_frame_rate", "-of", "json", str(mp4)],
        capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    return int(s["nb_read_packets"])


def frame_at(mp4, n):
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(mp4), "-vf", f"select=eq(n\\,{n})", "-vframes", "1",
         "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True, check=True).stdout
    from io import BytesIO
    return Image.open(BytesIO(out)).convert("RGB")


def guides(im):
    d = ImageDraw.Draw(im)
    sx, sy = im.width / W, im.height / H
    red = (227, 71, 45)
    d.line([(0, SAFE["top"] * sy), (im.width, SAFE["top"] * sy)], fill=red, width=1)
    d.line([(0, (H - SAFE["bottom"]) * sy), (im.width, (H - SAFE["bottom"]) * sy)], fill=red, width=1)
    d.line([((W - SAFE["right"]) * sx, 0), ((W - SAFE["right"]) * sx, im.height)], fill=red, width=1)
    return im


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    root = Path(sys.argv[1])
    mp4s = sorted(p for p in root.rglob("*.mp4") if "_review" not in p.parts and not p.name.startswith("."))
    if not mp4s:
        print(f"No .mp4 files under {root}")
        sys.exit(1)
    review = root / "_review"
    (review / "strips").mkdir(parents=True, exist_ok=True)
    label_font = font(18)
    names = [str(p.relative_to(root).with_suffix("")) for p in mp4s]

    # Contact sheet of posters.
    cols = min(6, len(mp4s))
    rows = (len(mp4s) + cols - 1) // cols
    pad, lab = 16, 52
    sheet = Image.new("RGB", (cols * (THUMB[0] + pad) + pad, rows * (THUMB[1] + pad + lab) + pad), (40, 38, 34))
    d = ImageDraw.Draw(sheet)
    for i, (mp4, name) in enumerate(zip(mp4s, names)):
        poster = next((p for p in (mp4.with_suffix(".jpg"), mp4.with_suffix(".png")) if p.exists()), None)
        im = Image.open(poster).convert("RGB") if poster else frame_at(mp4, duration(mp4) - 4)
        im = im.resize(THUMB, Image.LANCZOS)
        x = pad + (i % cols) * (THUMB[0] + pad)
        y = pad + (i // cols) * (THUMB[1] + pad + lab)
        sheet.paste(im, (x, y))
        size = mp4.stat().st_size / 1024
        short = name if len(name) <= 26 else "…" + name[-25:]
        d.text((x, y + THUMB[1] + 5), short, fill=(235, 230, 220), font=label_font)
        d.text((x, y + THUMB[1] + 27), f"{size:.0f} KB", fill=(170, 165, 155), font=label_font)
    sheet.save(review / "contact.jpg", quality=88)

    # Strips: 4 frames each.
    strips = []
    for mp4, name in zip(mp4s, names):
        n = duration(mp4)
        picks = [1, n // 3, (2 * n) // 3, n - 1]
        strip = Image.new("RGB", (4 * (THUMB[0] + pad) + pad, THUMB[1] + 2 * pad + lab), (40, 38, 34))
        sd = ImageDraw.Draw(strip)
        sd.text((pad, 6), f"{name}   {n} frames   {mp4.stat().st_size / 1024:.0f} KB", fill=(235, 230, 220), font=label_font)
        for k, f in enumerate(picks):
            im = guides(frame_at(mp4, f).resize(THUMB, Image.LANCZOS))
            strip.paste(im, (pad + k * (THUMB[0] + pad), lab + pad))
            sd.text((pad + k * (THUMB[0] + pad) + 4, lab + pad + THUMB[1] - 22), f"f{f}", fill=(21, 19, 15), font=label_font)
        out = review / "strips" / (name.replace("/", "__") + ".jpg")
        strip.save(out, quality=88)
        strips.append(strip)
    tall = Image.new("RGB", (strips[0].width, sum(s.height for s in strips)), (40, 38, 34))
    y = 0
    for s in strips:
        tall.paste(s, (0, y))
        y += s.height
    tall.save(review / "strips.jpg", quality=85)
    print(f"{review / 'contact.jpg'}\n{review / 'strips.jpg'}\n{review / 'strips'}/ ({len(strips)} strips)")


if __name__ == "__main__":
    main()
