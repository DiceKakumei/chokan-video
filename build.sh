#!/bin/sh
# Modular build: one clip (video + audio) per screen change, joined at the end.  FILM=<name> sh build.sh   (LIB = the Lemo-Opuscar library)
#   - clips/ is a cache: a clip whose content key is unchanged is not rendered again (see clips.py).
#   - ONLY="sheet1,sheet2" sh build.sh   forces those clips to be rendered again (their cached files are deleted first).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}
FILM=${FILM:-film}
export LIB
[ -n "$PY" ] || { PY="$LIB/.venv/bin/python"; [ -x "$PY" ] || PY="$LIB/.venv/Scripts/python.exe"; }
cd "$LIB"
"$PY" "$HERE/news.py"
"$PY" "$HERE/make_fonts.py" "$HERE"
"$PY" core/tts/tts_zh.py "$HERE/lines.json" "$HERE/voices"
"$PY" "$HERE/plan.py"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/clips.py"
if [ -n "$ONLY" ]; then for n in $(echo "$ONLY" | tr ',' ' '); do rm -f "$HERE"/clips/*_"$n".*; done; "$PY" "$HERE/clips.py"; fi
node "$HERE/render_clips.mjs" "$HERE" --workers ${WORKERS:-1}
"$PY" "$HERE/mix_clips.py"
"$PY" "$HERE/assemble.py"
"$PY" core/render/srt.py "$HERE/out/subs.json" "$HERE/$FILM.srt"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$FILM.mp4" 24 ${GRAIN:-0}
"$PY" "$HERE/prune.py"
