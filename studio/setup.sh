#!/usr/bin/env bash
# Sets up both Remotion projects in studio/ on a fresh clone. Safe to run again:
# each step is skipped when it's already done.
#
#   studio/setup.sh            (from the repo root, or from anywhere)
#
# For each of studio/motion and studio/explainer:
#   1. npm ci, skipped while node_modules matches package-lock.json;
#   2. Remotion's headless Chrome (npx remotion browser ensure);
#   3. the Python requirements (pip install -r scripts/requirements.txt);
#   4. the generated score in public/audio/, when it's missing (git doesn't keep it).
# Needs Node 20+, Python 3 with pip, and ffmpeg on the PATH.
set -euo pipefail
cd "$(dirname "$0")"
studio=$(pwd)

say() { printf '\n== %s\n' "$*"; }

for tool in node npm python3 ffmpeg ffprobe; do
  command -v "$tool" >/dev/null || { echo "setup.sh: $tool isn't on the PATH" >&2; exit 1; }
done

# pip refuses to touch an "externally managed" system Python (PEP 668) unless told.
pip_flags=()
if [[ -z ${VIRTUAL_ENV:-} ]] && python3 -c 'import sys, sysconfig, pathlib; sys.exit(0 if (pathlib.Path(sysconfig.get_path("stdlib")) / "EXTERNALLY-MANAGED").exists() else 1)'; then
  pip_flags=(--break-system-packages)
fi

for project in motion explainer; do
  cd "$studio/$project"

  say "$project: Node dependencies"
  lock=$(sha256sum package-lock.json | cut -d' ' -f1)
  if [[ -f node_modules/.setup-lock && $(cat node_modules/.setup-lock) == "$lock" ]]; then
    echo "up to date"
  else
    npm ci --no-audit --no-fund
    echo "$lock" > node_modules/.setup-lock
  fi

  say "$project: Remotion's headless Chrome"
  npx --no-install remotion browser ensure

  say "$project: Python requirements"
  python3 -m pip install --quiet --disable-pip-version-check "${pip_flags[@]}" -r scripts/requirements.txt
  echo "installed"
done

say "motion: the stings' score"
cd "$studio/motion"
if [[ -f public/audio/sting-5s.wav && -f public/audio/sting-2s.wav ]]; then
  echo "already there (python3 scripts/make_sting_score.py remakes it)"
else
  python3 scripts/make_sting_score.py
fi

say "explainer: the score"
cd "$studio/explainer"
if [[ -f public/audio/score.wav ]]; then
  echo "already there (python3 scripts/make_score.py remakes it)"
else
  python3 scripts/make_score.py
fi

say "Done"
