#!/usr/bin/env bash
# Finition d'un épisode : musique + bruitages, mixage verrouillé, sous-titres, encodage, contrôle qualité.
#   bash tools/finish.sh episodes/<slug> <dossier_images> ["Titre du fichier"]
# Sortie : episodes/<slug>/out/<Titre>.mp4 + out/qa_sheet.jpg
set -e
TOOLS="$(cd "$(dirname "$0")" && pwd)"; EP="$(cd "${1:?episodes/<slug>}" && pwd)"; FR="$(cd "${2:?dossier des images}" && pwd)"
T="${3:-$(basename "$EP")}"; mkdir -p "$EP/out"
# ASCII file name (no accents/spaces): safer for URLs, Hugging Face and publishing scripts
SAFE=$(python3 -c "import sys,unicodedata,re;t=unicodedata.normalize('NFKD',sys.argv[1]).encode('ascii','ignore').decode();print(re.sub(r'[^A-Za-z0-9]+','-',t).strip('-') or 'video')" "$T")
F="$EP/out/$SAFE.mp4"
# cover without subtitles: middle raw frame
N=$(ls "$FR" | grep -c '^f[0-9]*\.jpg$'); MID=$(printf "f%04d.jpg" $((N / 2)))
[ -f "$FR/$MID" ] && ffmpeg -v error -y -i "$FR/$MID" -q:v 2 "$EP/out/cover.jpg" || true
python3 "$TOOLS/run_audio.py" "$EP"                                     # audio.py -> music.wav + sfx.wav
if [ "${AUTOSFX:-1}" != "0" ]; then                                    # bruitages automatiques : un son pour chaque chose qui bouge
  node "$TOOLS/events.mjs" "$EP" && python3 "$TOOLS/autosfx.py" "$EP" || echo "bruitages automatiques : échec, on garde ceux de audio.py"
fi
( cd "$EP" && python3 "$TOOLS/mix.py" voice.wav music.wav sfx.wav )     # -> mix_raw.wav (musique -12 dB, bruitages <= -8 dB : MUSIC_DB / SFX_DB pour changer)
# un seul gain linéaire jusqu'à -14 LUFS, puis un limiteur de crête (pas de compression)
L=$(ffmpeg -nostats -i "$EP/mix_raw.wav" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-14-($L),2))")
ffmpeg -v error -y -i "$EP/mix_raw.wav" -af "volume=${G}dB,alimiter=limit=0.89:level=disabled" -ar 48000 "$EP/mix.wav"
# sous-titres mot par mot (désactiver avec NOSUBS=1)
VF="format=yuv420p"
if [ -z "$NOSUBS" ]; then python3 "$TOOLS/subs.py" "$EP/words.json" "$EP/subs.ass"; VF="ass=$EP/subs.ass,format=yuv420p"; fi
ffmpeg -v error -y -framerate 30 -i "$FR/f%04d.jpg" -i "$EP/mix.wav" -map 0:v:0 -map 1:a:0 -vf "$VF" \
  -c:v libx264 -preset slow -crf 17 -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
ffprobe -v error -show_entries format=duration -show_entries stream=width,height -of compact "$F"
echo "--- QA (vide = aucune image noire ou figée)"
ffmpeg -i "$F" -vf "freezedetect=n=0.001:d=1.5,blackdetect=d=0.3" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -nostats -i "$F" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
ffmpeg -v error -y -i "$F" -vf "fps=1/3,scale=180:-1,tile=10x2" -frames:v 1 "$EP/out/qa_sheet.jpg"
echo "--- Contrôle qualité (out/QA.md)"
python3 "$TOOLS/qa.py" "$EP" "$F" || true
echo "$F"
