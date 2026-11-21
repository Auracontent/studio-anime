#!/usr/bin/env bash
# Installe tout ce qu'il faut pour travailler sur le studio Pourkoipa (studio-anime), sur n'importe quelle machine :
#   - un PC Linux (Ubuntu/Debian), un Mac (Homebrew), Windows via WSL, un service Onyxia, un conteneur...
# Usage :
#   - depuis le dépôt cloné :   bash init.sh
#   - sans le dépôt :           curl -fsSL https://raw.githubusercontent.com/Auracontent/studio-anime/main/init.sh | bash
#   - Onyxia :                  URL "raw" ci-dessus dans l'onglet Init du service
# Réglages facultatifs : STUDIO_DIR (où cloner), STUDIO_REPO_URL (un fork), SKIP_CLAUDE=1 (ne pas installer Claude Code).
set -euo pipefail

REPO_URL="${STUDIO_REPO_URL:-https://github.com/Auracontent/studio-anime.git}"
say() { printf '%s\n' "$*"; }

# ---------- 0. Où est le dépôt ? ----------
# lancé depuis le dépôt -> on reste là ; sinon STUDIO_DIR, sinon le dossier de travail Onyxia, sinon ./studio-anime
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2> /dev/null && pwd || pwd)"
if [ -n "${STUDIO_DIR:-}" ]; then REPO_DIR="$STUDIO_DIR"
elif [ -f "$HERE/tools/setup.sh" ] && [ -d "$HERE/engine" ]; then REPO_DIR="$HERE"
elif [ -d /home/onyxia/work ]; then REPO_DIR=/home/onyxia/work/studio-anime
else REPO_DIR="$PWD/studio-anime"; fi

# ---------- 1. Quel système ? ----------
OS="$(uname -s)"; PM=none; SUDO=""
if [ "$OS" = Darwin ]; then
    command -v brew &> /dev/null && PM=brew || { say "❌ Installe d'abord Homebrew : https://brew.sh"; exit 1; }
elif command -v apt-get &> /dev/null; then PM=apt
elif command -v dnf &> /dev/null; then PM=dnf
fi
if [ "$PM" != brew ] && [ "$(id -u)" -ne 0 ]; then
    if command -v sudo &> /dev/null; then SUDO=sudo; else say "⚠️  Pas de sudo : les paquets système ne seront pas installés (installe-les à la main, liste plus bas)."; PM=none; fi
fi
say "🖥️  Système : $OS · gestionnaire : $PM · dépôt : $REPO_DIR"

install_pkgs() {   # ffmpeg, polices, git, python, curl
    case "$PM" in
        apt)  $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg fonts-dejavu-core fontconfig git python3 python3-pip curl ca-certificates ;;
        dnf)  $SUDO dnf install -y -q ffmpeg dejavu-sans-fonts fontconfig git python3 python3-pip curl ;;
        brew) brew install ffmpeg git python curl ;;
        none) say "   À installer : ffmpeg, git, python3 + pip, curl, une police (DejaVu)." ;;
    esac
}
node_ok() { command -v node &> /dev/null && [ "$(node -p 'const v=process.versions.node.split(".").map(Number);v[0]*1e6+v[1]*1e3+v[2]')" -ge 22006000 ]; }
install_node() {   # le moteur et tools/events.mjs ont besoin de Node >= 22.6
    node_ok && return
    say "🟩 Installation de Node 22..."
    case "$PM" in
        apt)  curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO -E bash - && $SUDO apt-get install -y -qq nodejs ;;
        dnf)  curl -fsSL https://rpm.nodesource.com/setup_22.x | $SUDO bash - && $SUDO dnf install -y -q nodejs ;;
        brew) brew install node@22 && brew link --overwrite --force node@22 ;;
        none) say "❌ Installe Node 22 ou plus (https://nodejs.org ou nvm), puis relance."; exit 1 ;;
    esac
    node_ok || { say "❌ Node 22.6+ introuvable après installation."; exit 1; }
}
pip_install() { python3 -m pip install --quiet "$@" 2> /dev/null || python3 -m pip install --quiet --break-system-packages "$@" 2> /dev/null || python3 -m pip install --quiet --user "$@"; }

# ---------- 2. Paquets système + Node ----------
install_pkgs
install_node

# ---------- 3. Le dépôt ----------
if [ ! -f "$REPO_DIR/tools/setup.sh" ]; then
    say "⬇️  Clonage de $REPO_URL"
    git clone "$REPO_URL" "$REPO_DIR"
fi
cd "$REPO_DIR"

# ---------- 4. Navigateur pour le rendu ----------
npm install --no-audit --no-fund > /dev/null
CH="${CHROME:-}"
[ -z "$CH" ] && for c in google-chrome google-chrome-stable chromium chromium-browser "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
    command -v "$c" &> /dev/null && { CH="$(command -v "$c")"; break; }; [ -x "$c" ] && { CH="$c"; break; }; done
if [ -n "$CH" ]; then say "🌐 Navigateur trouvé : $CH  (à passer au rendu : CHROME=\"$CH\")"
else
    say "🌐 Installation de Chromium (Playwright)..."
    if [ "$PM" = apt ] || [ "$PM" = dnf ]; then npx playwright install --with-deps chromium || npx playwright install chromium; else npx playwright install chromium; fi
fi

# ---------- 5. Le studio ----------
bash tools/setup.sh
python3 -c "import faster_whisper" 2> /dev/null || pip_install faster-whisper || say "⚠️  faster-whisper non installé : timing.py s'alignera sur les silences"

# ---------- 6. Claude Code (facultatif) ----------
if [ "${SKIP_CLAUDE:-0}" != 1 ]; then
    if ! command -v claude &> /dev/null; then
        say "🤖 Installation du CLI Claude Code..."
        npm install -g @anthropic-ai/claude-code 2> /dev/null || $SUDO npm install -g @anthropic-ai/claude-code || say "⚠️  Claude Code non installé (npm install -g @anthropic-ai/claude-code)"
    fi
    command -v code-server &> /dev/null && code-server --install-extension anthropic.claude-code --force > /dev/null && say "🧩 Extension VS Code Claude Code installée"
fi

# ---------- 7. Secrets (Vault, variables d'environnement ou fichier .env non versionné) ----------
[ -f .env ] && { set -a; . ./.env; set +a; }
for var in GEMINI_API_KEY HF_TOKEN YOUTUBE_API_KEY ZERNIO_API_KEY; do
    [ -z "${!var:-}" ] && say "ℹ️  $var absent (facultatif pour le rendu local ; à mettre dans .env ou Vault)"
done
say "   GEMINI_API_KEY : voix automatique · HF_TOKEN : dépôt des vidéos · YOUTUBE_API_KEY : tendances · ZERNIO_API_KEY : publication"
say "✅ Studio prêt dans $REPO_DIR — test : node tools/render.mjs episodes/<un épisode> /tmp/stills \"0,100\""
