# Studio Pourkoipa 🎬

Animated Shorts factory for the **[@Pourkoipa](https://www.youtube.com/@Pourkoipa)** channel: true, surprising stories in French, featuring 2D bean-headed characters inside a painted 3D world. Drop in a voice track, **Claude directs the video** (shot list, set, camera, sound, subtitles), and GitHub Actions renders it. Grab the MP4 from **Releases**.

## Usage (from phone or computer)

**Option A: you already have your voice track**
1. On GitHub: `Add file` → `Upload files`, inside an `inbox/<date>-<topic>/` folder (e.g., `inbox/2026-11-20-tour-eiffel/`).
2. Upload `voice.wav` (or `.mp3`) **and** `script.txt` (the exact spoken text).
3. Commit → the **Vidéo** workflow starts automatically (Actions tab, ~30–45 min).
4. The video lands in **Releases**, complete with title, description, hashtags, and TikTok caption ready to copy.

**Option B: you want an idea + a script** (your upcoming topics: `sujets.md` list, used by the cron job)
1. Actions → **Idée + script** → `Run workflow`. Leave the topic blank (Claude picks the most viral one) or enter one.
2. Claude fact-checks the story and opens an **issue** with the script.
3. Record it with the Riko voice (Google AI Studio), drop `voice.wav` into the indicated `inbox/` folder → Option A, step 3.
   (Or check `voix_auto` for an automatic Gemini TTS voice: the video pipeline starts right away.)

**Tweaks**: in an issue, write `@claude shot 3 is too dark, and zoom in closer on the chef` → Claude fixes it and reruns the render.

## Channel Voice (Gemini Voice Design)
An **original** voice generated from a prompt (`brand/voice_prompt.txt`: a 30-year-old Frenchman, warm, conspiratorial, fast-paced delivery).
1. Add the `GEMINI_API_KEY` secret (Google AI Studio key).
2. Actions → **Voix de la chaîne** → `Run workflow`. It creates the voice, then commits `brand/voice.json` and two previews (`brand/voice_sample.wav`, `brand/voice_test.wav`) that you can listen to on GitHub.
3. Not convinced? Edit `brand/voice_prompt.txt` and run it again. After that, `voix_auto` (Idée + script workflow) and `tools/tts.py` use this voice.

## Setup (one time only)
1. Install the Claude GitHub App on the organization: <https://github.com/apps/claude> → `Install` → `Auracontent` → this repository.
2. Create the token: on your machine, run `claude setup-token` (Claude Code), then go to Settings → Secrets and variables → Actions → `New repository secret`: **`CLAUDE_CODE_OAUTH_TOKEN`**.
3. Optional (automatic voice): secret **`GEMINI_API_KEY`** (Google AI Studio key).
3 ter. Trends: secret **`YOUTUBE_API_KEY`** (Google Cloud Console → enable *YouTube Data API v3* → Credentials → API Key).
   Before each idea, `tools/trends.py` ranks the most-viewed videos from channels listed in `tendances.json`; Claude uses this to pick a **topic** that performs well, then writes its own story based on web research.
3 bis. Hugging Face repository: secret **`HF_TOKEN`** (*Write* token from huggingface.co/settings/tokens). Every finished video is uploaded to the private dataset **`soradata/studio-anime`** (created on first upload), one folder per video: `<slug>/` containing the mp4, `meta.json`, `cover.jpg`, and `qa_sheet.jpg`. To use another dataset, set the repository variable `HF_DATASET`.
4. Settings → Actions → General → Workflow permissions: **Read and write**.

## How It's Built
| Step | Where | Who |
|---|---|---|
| Word timing (faster-whisper in French, aligned to the script) | `tools/timing.py` | Actions |
| Shot list, set, framing, casting, sound effects, still-frame review | `episodes/<slug>/` | **Claude** (`CLAUDE.md` = director's guide) |
| Headless Three.js rendering, 8 slices in parallel | `tools/render.mjs` | Actions (matrix) |
| Synthesized music + sound effects, locked mix (−6 dB below voice), subtitles, −14 LUFS, QA check | `tools/finish.sh` | Actions |

- `engine/`: rendering engine (inked 2D cards inside a 3D world, ink pass, depth of field, color grading), `motion.js` (cameras, `frameOn` = close-up framing scaled to the reference).
- `engine/library/`: reusable sets (`paris.js`, `rails.js`).
- `episodes/`: already produced episodes (`2026-11-19-faux-paris`, `2026-11-19-rails-chauffes`).
- `brand/`: channel logo, banner, and watermark.
- `SKILL.md` + `example/soldier/`: methodology and example from the original kit.

Locally: `bash tools/setup.sh`, then `CHROME=/usr/bin/google-chrome node tools/render.mjs episodes/<slug> frames 0-<N-1>` and `bash tools/finish.sh episodes/<slug> frames "Title"`.

Based on the cartoon-short-kit and [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (MIT: Pen / heads / faces library, fetched by `setup.sh`).
Fonts: Montserrat and Luckiest Guy (SIL OFL / Apache 2.0).
