"""Measures every master in out/final: loudness, true peak, sync, format.

    python3 scripts/measure_finals.py        # prints a Markdown table
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = []
for f in sorted((ROOT / "out/final").glob("callsheet-sting-*.mp4")):
    variant = "5s" if "-5s-" in f.name else "2s"
    r128 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(f), "-af", "ebur128=peak=true", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    summary = r128[r128.rindex("Summary:"):]
    I = re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1)
    tp = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary).group(1)
    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                                       "stream=codec_name,width,height,pix_fmt,r_frame_rate,bit_rate,sample_rate:format=duration,bit_rate",
                                       "-of", "json", str(f)], capture_output=True, text=True).stdout)
    v = next(s for s in probe["streams"] if s["codec_name"] == "h264")
    a = next(s for s in probe["streams"] if s["codec_name"] == "aac")
    sync = subprocess.run(["python3", str(ROOT / "scripts/sync_check.py"), str(f), variant], capture_output=True, text=True).stdout
    m = re.search(r"first row.*offset\s+([+-][\d.]+) ms", sync) or re.search(r"bell.*offset\s+([+-][\d.]+) ms", sync)
    first = m.group(1) if m else "?"
    bell = re.search(r"bell \(F6 partial\).*offset\s+([+-][\d.]+) ms", sync)
    rows.append((f.name, f"{v['width']}x{v['height']}", f"{float(probe['format']['duration']):.2f}", I, tp,
                 first if variant == "5s" else "n/a", bell.group(1) if bell else "?",
                 f"{int(probe['format']['bit_rate']) / 1e6:.0f}", f"{v['pix_fmt']}, AAC {int(a['bit_rate']) // 1000}k"))
print("| File | Size | Seconds | Integrated (LUFS) | True peak (dBTP) | First key vs picture (ms) | Bell vs picture (ms) | Mbps | Format |")
print("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
for r in rows:
    print("| " + " | ".join(r) + " |")
