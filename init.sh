#!/usr/bin/env bash
# Script d'initialisation d'un service Onyxia pour le studio Pourkoipa (studio-anime).
# Usage :
#   - à la main :    bash init.sh
#   - automatique :  URL "raw" GitHub de ce fichier dans l'onglet Init du service Onyxia
# Ensuite : bash tools/setup.sh est déjà fait ; rendre une planche de test :
#   node tools/render.mjs episodes/_demo-fx /tmp/demo "30,125,225,312"   (si la démo est présente)
set -euo pipefail

REPO_URL="${STUDIO_REPO_URL:-https://github.com/Auracontent/studio-anime.git}"
REPO_DIR="${STUDIO_DIR:-/home/onyxia/work/studio-anime}"
PACKAGES="ffmpeg fonts-dejavu-core fontconfig git python3 python3-pip curl ca-certificates"

# 1. Récupérer le dépôt si besoin
if [ ! -d "$REPO_DIR/.git" ]; then
    git clone "$REPO_URL" "$REPO_DIR"
fi
cd "$REPO_DIR"

# 2. Paquets système
echo "📦 Installation : $PACKAGES"
sudo apt-get update -qq
# shellcheck disable=SC2086
sudo apt-get install -y -qq $PACKAGES

# 3. Node >= 22.6 (le moteur et tools/events.mjs en ont besoin)
need_node=true
if command -v node &> /dev/null; then
    v=$(node -p 'process.versions.node.split(".").map(Number).reduce((a,b,i)=>a+b*[1e6,1e3,1][i],0)')
    [ "$v" -ge 22006000 ] && need_node=false
fi
if $need_node; then
    echo "🟩 Installation de Node 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
fi

# 4. Navigateur pour le rendu : Chrome installé (CHROME=...) ou Chromium de Playwright
npm install --no-audit --no-fund > /dev/null
if [ -z "${CHROME:-}" ] && ! command -v google-chrome &> /dev/null; then
    echo "🌐 Installation de Chromium (Playwright)..."
    npx playwright install --with-deps chromium
fi

# 5. Studio : three.js, bibliothèque de personnages, toon.js, numpy/pillow, polices des sous-titres
bash tools/setup.sh
python3 -c "import faster_whisper" 2> /dev/null || pip install --quiet faster-whisper 2> /dev/null \
    || pip install --quiet --break-system-packages faster-whisper || echo "⚠️  faster-whisper non installé : timing.py s'alignera sur les silences"

# 6. Claude Code (CLI + extension VS Code Server)
if ! command -v claude &> /dev/null; then
    echo "🤖 Installation du CLI Claude Code..."
    sudo npm install -g @anthropic-ai/claude-code
fi
if command -v code-server &> /dev/null; then
    echo "🧩 Installation de l'extension VS Code Claude Code..."
    code-server --install-extension anthropic.claude-code --force
fi

# 7. Vérification des secrets (injectés par Vault ou lus depuis .env)
[ -f .env ] && { set -a; . ./.env; set +a; }
for var in GEMINI_API_KEY HF_TOKEN YOUTUBE_API_KEY ZERNIO_API_KEY; do
    if [ -z "${!var:-}" ]; then
        echo "⚠️  $var absent (ajoute-le dans Vault ou .env)"
    fi
done
echo "   GEMINI_API_KEY : voix automatique (tools/tts.py) · HF_TOKEN : dépôt des vidéos · YOUTUBE_API_KEY : tendances · ZERNIO_API_KEY : publication"

echo "✅ Studio prêt dans $REPO_DIR"
