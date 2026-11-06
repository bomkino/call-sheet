#!/usr/bin/env bash
# Renders the four masters into out/final/, each with a contact sheet of its key
# frames taken from the finished video, then checks loudness, peak and format.
#
#   scripts/render_final.sh                 all four sizes
#   scripts/render_final.sh 1080x1920       just the ones you name
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/final
sizes=("$@")
[[ ${#sizes[@]} -gt 0 ]] || sizes=(1920x1080 1080x1920 1080x1080 1440x1080)
# A settled frame from each scene: the question, the opening, the four problems,
# the five fixes, pitch.dog, the call to action and the end card.
key="52,190,292,428;546,666,784,920;1022,1124,1226,1350;1447,1566,1652,1808"
for size in "${sizes[@]}"; do
  out="out/final/callsheet-explainer-$size.mp4"
  echo "== $size"
  npx remotion render "Explainer-$size" "$out" \
    --codec=h264 --crf=16 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709 \
    --audio-codec=aac --audio-bitrate=320k --log=error
  w=${size%x*}; h=${size#*x}
  tw=$(( w > h ? 380 : 230 ))
  python3 scripts/strip.py "$out" "out/final/callsheet-explainer-$size-sheet.png" "$key" "$tw" >/dev/null
  ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,bit_rate -show_entries format=duration -of compact=p=0:nk=0 "$out"
  ffmpeg -hide_banner -i "$out" -vn -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "^\s+(I|Peak):"
done
