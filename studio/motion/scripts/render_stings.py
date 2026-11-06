"""Renders the Call Sheet stings' masters, every size, printed to film.

    python3 scripts/render_stings.py                     # both stings, every size
    python3 scripts/render_stings.py 5s 1080x1920        # just these
    python3 scripts/render_stings.py --clean             # skip the print: plain Remotion masters

For each one: the score (scripts/make_sting_score.py), the negative as PNG
frames, the gentle `sheet` print (scripts/print_film.py) with the score laid
in 20 ms behind the picture, and a contact sheet of the key frames. Masters
are H.264 yuv420p with AAC 320k, encoded without B-frames or MP4 edit lists
so every player keeps the picture lead.

Writes out/final/callsheet-sting-<2s|5s>-<WxH>.mp4 and -contact.png.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIZES = [s["id"] for s in json.loads((ROOT / "src/sizes.json").read_text())]
KEYS = {
    "5s": [0, 12, 30, 50, 63, 74, 75, 84, 92, 104, 120, 149],
    "2s": [0, 6, 12, 18, 22, 26, 30, 36, 59],
}


def run(*cmd):
    subprocess.run(cmd, check=True, cwd=ROOT)


def main():
    args = sys.argv[1:]
    clean = "--clean" in args
    variants = [a for a in args if a in KEYS] or ["5s", "2s"]
    sizes = [a for a in args if a in SIZES] or SIZES
    run("python3", "scripts/make_sting_score.py", *variants)
    final = ROOT / "out/final"
    final.mkdir(parents=True, exist_ok=True)
    for v in variants:
        for size in sizes:
            comp = f"Sting{v}-{size}"
            out = final / f"callsheet-sting-{v}-{size}.mp4"
            props = json.dumps({"variant": v, "audio": not clean or True})
            if clean:
                run("npx", "remotion", "render", comp, str(out), f"--props={props}", "--codec=h264", "--crf=16",
                    "--x264-preset=slow", "--pixel-format=yuv420p", "--color-space=bt709",
                    "--audio-codec=aac", "--audio-bitrate=320k")
            else:
                frames = ROOT / "out/frames" / comp
                shutil.rmtree(frames, ignore_errors=True)
                run("npx", "remotion", "render", comp, str(frames), "--sequence", "--image-format=png",
                    "--props=" + json.dumps({"variant": v, "audio": False}))
                run("python3", "scripts/print_film.py", str(frames.relative_to(ROOT)), str(out.relative_to(ROOT)),
                    "--look", "sheet", "--timeline", f"src/cs/timeline-{v}.json",
                    "--audio", f"public/audio/sting-{v}.wav", "--sync-safe")
                shutil.rmtree(frames, ignore_errors=True)
            run("python3", "scripts/contact.py", str(out), ",".join(map(str, KEYS[v])),
                str(out.with_name(out.stem + "-contact.png")), "--width", "360" if size == "1080x1920" else "480",
                "--cols", "6" if size == "1080x1920" else "4")
            print("done", out.relative_to(ROOT), flush=True)


if __name__ == "__main__":
    main()
