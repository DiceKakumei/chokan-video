#!/bin/sh
# Modular build: one clip (video + audio) per screen change, joined at the end.  sh build.sh   (LIB = the Lemo-Opuscar library)
#   - clips/ is a cache: a clip whose content key is unchanged is not rendered again (see clips.py).
#   - ONLY="ch5_tier,ch5_fence" sh build.sh   forces those clips to be rendered again (their cached files are deleted first).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -n "$PY" ] || { PY="$LIB/.venv/bin/python"; [ -x "$PY" ] || PY="$LIB/.venv/Scripts/python.exe"; }
cd "$LIB"
"$PY" "$HERE/news.py"                                                 # issue.json -> lines.json + sheets.json
"$PY" "$HERE/make_fonts.py" "$HERE"                                    # subset fonts for the characters used today
"$PY" core/tts/tts_zh.py "$HERE/lines.json" "$HERE/voices"          # narration (edge-tts, online; cached per line)
"$PY" "$HERE/plan.py"                                                # sheet spans + narration times -> story.json
node core/render/events.mjs "$HERE"                                  # sound-effect events -> events.json
"$PY" "$HERE/clips.py"                                               # clip list + content keys -> clips.json
if [ -n "$ONLY" ]; then for n in $(echo "$ONLY" | tr ',' ' '); do rm -f "$HERE"/clips/*_"$n".*; done; "$PY" "$HERE/clips.py"; fi
node "$HERE/render_clips.mjs" "$HERE" --workers ${WORKERS:-1}        # only the missing video clips
"$PY" "$HERE/mix_clips.py"                                           # only the missing audio clips
"$PY" "$HERE/assemble.py"                                            # join: out/video.mp4, out/mix.wav, out/subs.json
"$PY" core/render/srt.py "$HERE/out/subs.json" "$HERE/chokan.srt"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/chokan.mp4" 24 0
"$PY" "$HERE/prune.py"                                               # drop cached clips that are no longer part of the film
