#!/usr/bin/env bash
# Drops a recorded voiceover into the finished masters.
#
#   scripts/mix_vo.sh path/to/vo.wav
#
# vo.wav: one take, any sample rate, mono or stereo, starting at 0:00 of the
# film (pad the head with silence so each line lands on its cue in SCRIPT.md).
# It needs the stems, so run `python3 scripts/make_score.py --stems` first.
#
# The music ducks about 8 dB under the voice and comes back up between lines;
# the foley stays where it is; the voice, like the rest of the sound, plays
# 20 ms behind the picture. The result is re-measured to -14 LUFS and a true
# peak under -1 dBTP, then muxed into new copies of the four masters:
# out/final/callsheet-explainer-<size>-vo.mp4. The originals are untouched.
set -euo pipefail
vo=${1:?usage: scripts/mix_vo.sh vo.wav}
cd "$(dirname "$0")/.."
music=public/audio/music.wav
foley=public/audio/foley.wav
[[ -f $music && -f $foley ]] || { echo "Run: python3 scripts/make_score.py --stems" >&2; exit 1; }
mkdir -p out/vo
graph="[2:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay=20|20,highpass=f=80,acompressor=threshold=0.1:ratio=3:attack=5:release=120,volume=1.6,asplit[vo][key];\
[0:a][key]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400:makeup=1[bed];\
[bed][1:a][vo]amix=inputs=3:normalize=0:duration=first"
ffmpeg -y -loglevel error -i "$music" -i "$foley" -i "$vo" -filter_complex "$graph" -c:a pcm_s24le out/vo/raw.wav
# Two-pass loudness, so the gain change is linear.
stats=$(ffmpeg -hide_banner -i out/vo/raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i out/vo/raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" -ar 48000 -c:a pcm_s24le out/vo/mix.wav
for size in 1920x1080 1080x1920 1080x1080 1440x1080; do
  ffmpeg -y -loglevel error -i "out/final/callsheet-explainer-$size.mp4" -i out/vo/mix.wav -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 320k -shortest "out/final/callsheet-explainer-$size-vo.mp4"
done
ffmpeg -hide_banner -i out/vo/mix.wav -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "^\s+(I|Peak):"
echo "Wrote out/final/callsheet-explainer-<size>-vo.mp4"
