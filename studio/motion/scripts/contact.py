"""Pull frames from a render and lay them out as a labelled contact sheet.

    python3 scripts/contact.py out/final/x.mp4 0,30,60,149 out/final/x-contact.png [--width 360] [--cols 6]
    python3 scripts/contact.py out/x.mp4 12,40 out/stills/ --stills     # full-size PNGs only
"""
import argparse
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def grab(video: Path, frames: list[int], into: Path) -> list[Path]:
    expr = "+".join(f"eq(n\\,{f})" for f in frames)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-vf", f"select='{expr}'",
                    "-vsync", "0", str(into / "f_%03d.png")], check=True)
    return sorted(into.glob("f_*.png"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("frames")
    ap.add_argument("out", type=Path)
    ap.add_argument("--width", type=int, default=360)
    ap.add_argument("--cols", type=int, default=6)
    ap.add_argument("--stills", action="store_true")
    ap.add_argument("--fps", type=float, default=30)
    a = ap.parse_args()
    frames = [int(x) for x in a.frames.split(",")]
    with tempfile.TemporaryDirectory() as tmp:
        paths = grab(a.video, frames, Path(tmp))
        if a.stills:
            a.out.mkdir(parents=True, exist_ok=True)
            for f, p in zip(frames, paths):
                Image.open(p).save(a.out / f"{a.video.stem}-f{f:03d}.png")
            print("wrote", len(paths), "stills to", a.out)
            return
        imgs = [Image.open(p).convert("RGB") for p in paths]
        w = a.width
        h = round(imgs[0].height * w / imgs[0].width)
        cols = min(a.cols, len(imgs))
        rows = (len(imgs) + cols - 1) // cols
        label = 34
        gap = 12
        sheet = Image.new("RGB", (cols * w + (cols + 1) * gap, rows * (h + label) + (rows + 1) * gap), (28, 26, 22))
        d = ImageDraw.Draw(sheet)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 20)
        except OSError:
            font = ImageFont.load_default()
        for i, (f, im) in enumerate(zip(frames, imgs)):
            r, c = divmod(i, cols)
            x = gap + c * (w + gap)
            y = gap + r * (h + label + gap)
            sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + label))
            d.text((x + 2, y + 6), f"f{f}  {f / a.fps:.2f}s", fill=(236, 230, 218), font=font)
        a.out.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(a.out)
        print("wrote", a.out, sheet.size)


if __name__ == "__main__":
    main()
