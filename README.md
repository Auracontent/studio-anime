# Studio Pourkoipa 🎬

Usine à Shorts animés pour la chaîne **[@Pourkoipa](https://www.youtube.com/@Pourkoipa)** : histoires vraies et surprenantes,
en français, avec des personnages 2D à tête de haricot dans un monde 3D peint. Tu déposes une voix, **Claude réalise la vidéo**
(plan de tournage, décor, caméra, son, sous-titres) et GitHub Actions la rend. Tu récupères le MP4 dans **Releases**.

## Utilisation (depuis le téléphone ou l'ordinateur)

**Option A : tu as déjà ta voix**
1. Sur GitHub : `Add file` → `Upload files`, dans un dossier `inbox/<date>-<sujet>/` (ex. `inbox/2026-11-20-tour-eiffel/`).
2. Dépose `voice.wav` (ou `.mp3`) **et** `script.txt` (le texte exact lu).
3. Commit → le workflow **Vidéo** démarre seul (onglet Actions, ~30-45 min).
4. La vidéo arrive dans **Releases**, avec le titre, la description, les hashtags et la légende TikTok prêts à copier.

**Option B : tu veux une idée + un script**
1. Actions → **Idée + script** → `Run workflow`. Laisse le sujet vide (Claude choisit le plus viral) ou écris-en un.
2. Claude vérifie les faits et ouvre une **issue** avec le script.
3. Enregistre-le avec la voix Riko (Google AI Studio), dépose `voice.wav` dans le dossier `inbox/` indiqué → option A, étape 3.
   (Ou coche `voix_auto` pour une voix Gemini TTS automatique : la vidéo se lance directement.)

**Retouches** : dans une issue, écris `@claude le plan 3 est trop sombre, et zoome plus sur le chef` → Claude corrige et relance le rendu.

## La voix de la chaîne (Gemini Voice design)
Une voix **originale** créée à partir d'une description (`brand/voice_prompt.txt` : un Français de 30 ans, chaleureux, complice, débit rapide).
1. Ajoute le secret `GEMINI_API_KEY` (clé Google AI Studio).
2. Actions → **Voix de la chaîne** → `Run workflow`. Il crée la voix, puis commite `brand/voice.json` et deux aperçus
   (`brand/voice_sample.wav`, `brand/voice_test.wav`) que tu peux écouter sur GitHub.
3. Pas convaincu ? Modifie `brand/voice_prompt.txt` et relance. Ensuite `voix_auto` (workflow Idée + script) et `tools/tts.py` utilisent cette voix.

## Mise en place (une seule fois)
1. Installer l'app GitHub de Claude sur l'organisation : <https://github.com/apps/claude> → `Install` → `Auracontent` → ce dépôt.
2. Créer le jeton : sur ton ordinateur, `claude setup-token` (Claude Code), puis Settings → Secrets and variables → Actions →
   `New repository secret` : **`CLAUDE_CODE_OAUTH_TOKEN`**.
3. Facultatif (voix automatique) : secret **`GEMINI_API_KEY`** (clé de Google AI Studio).
4. Settings → Actions → General → Workflow permissions : **Read and write**.

## Comment c'est fait
| Étape | Où | Qui |
|---|---|---|
| Timing des mots (faster-whisper en français, recalé sur le script) | `tools/timing.py` | Actions |
| Plan de tournage, décor, cadrages, casting, bruitages, contrôle images fixes | `episodes/<slug>/` | **Claude** (`CLAUDE.md` = guide du réalisateur) |
| Rendu three.js headless, 8 tranches en parallèle | `tools/render.mjs` | Actions (matrice) |
| Musique + bruitages synthétisés, mixage verrouillé (−6 dB sous la voix), sous-titres, −14 LUFS, contrôle qualité | `tools/finish.sh` | Actions |

- `engine/` : moteur (cartes 2D encrées dans un monde 3D, passe d'encre, flou de profondeur, étalonnage), `motion.js` (caméras, `frameOn` = cadrage gros plan à l'échelle de la référence).
- `engine/library/` : décors réutilisables (`paris.js`, `rails.js`).
- `episodes/` : les épisodes déjà réalisés (`2026-11-19-faux-paris`, `2026-11-19-rails-chauffes`).
- `brand/` : logo, bannière, filigrane de la chaîne.
- `SKILL.md` + `example/soldier/` : la méthode et l'exemple du kit d'origine.

En local : `bash tools/setup.sh`, puis `CHROME=/usr/bin/google-chrome node tools/render.mjs episodes/<slug> frames 0-<N-1>`
et `bash tools/finish.sh episodes/<slug> frames "Titre"`.

Basé sur le kit cartoon-short-kit et sur [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (MIT : bibliothèque Pen / têtes / visages, récupérée par `setup.sh`).
Polices : Montserrat et Luckiest Guy (SIL OFL / Apache 2.0).
