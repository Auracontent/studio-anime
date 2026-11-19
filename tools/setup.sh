#!/usr/bin/env bash
# Prépare le studio (en local ou dans GitHub Actions) :  bash tools/setup.sh
# Besoin : node >= 22.6, python3, ffmpeg, git, un Chrome/Chromium (CHROME=/usr/bin/google-chrome, ou Playwright).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
# 1. three.js r160 (build module) -> engine/lib/three.module.js
if [ ! -f engine/lib/three.module.js ]; then
  mkdir -p engine/lib
  ( cd /tmp && rm -rf _three && mkdir _three && cd _three && npm pack three@0.160.0 >/dev/null 2>&1 && tar xzf three-0.160.0.tgz && cp package/build/three.module.js "$ROOT/engine/lib/" ) \
  || ( cd /tmp && rm -rf _t3 && git clone -q --depth 1 --filter=blob:none --sparse --branch r160 https://github.com/mrdoob/three.js _t3 && cd _t3 && git sparse-checkout set build && cp build/three.module.js "$ROOT/engine/lib/" )
fi
# 2. Bibliothèque Pen / têtes / visages de mromidev/claude-animated-shorts (MIT), types retirés -> engine/toonbase.js
if [ ! -f engine/toonbase.js ]; then
  rm -rf /tmp/_cas && git clone -q --depth 1 https://github.com/mromidev/claude-animated-shorts /tmp/_cas
  node -e "const m=require('node:module'),fs=require('fs');fs.writeFileSync('engine/toonbase.js',m.stripTypeScriptTypes(fs.readFileSync('/tmp/_cas/templates/bridge/toon.ts','utf8'),{mode:'transform'}))" 2>/dev/null
fi
# 3. toon.js = toonbase + casting (à relancer après toute modification de engine/roman.js)
cat engine/toonbase.js engine/roman.js > engine/toon.js
# 4. Playwright (pilote du navigateur) + dépendances Python
[ -d node_modules/playwright ] || npm install --no-audit --no-fund >/dev/null
python3 -c "import numpy, PIL" 2>/dev/null || pip install --quiet numpy pillow 2>/dev/null || pip install --quiet --break-system-packages numpy pillow
# 5. Polices des sous-titres et du branding
mkdir -p "$HOME/.fonts" && cp assets/fonts/*.ttf "$HOME/.fonts/" && (fc-cache -f >/dev/null 2>&1 || true)
echo "studio prêt"
