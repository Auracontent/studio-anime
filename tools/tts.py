#!/usr/bin/env python3
"""Voix off avec Gemini TTS (optionnel : sinon dépose ta propre voice.wav).
usage : GEMINI_API_KEY=... python3 tools/tts.py inbox/<slug>/script.txt inbox/<slug>/voice.wav [--voice <nom ou voice_...>] [--model gemini-3.8-flash-tts]
Voix par défaut : la voix de la chaîne (brand/voice.json, créée par tools/voice_design.py), sinon la voix prédéfinie Charon.
La consigne de jeu (ton, rythme) se met dans episodes/<slug>/style.txt si présent ; sinon un narrateur français dynamique."""
import base64, json, os, re, sys, urllib.request, wave

args = sys.argv[1:]
if len(args) < 2: sys.exit(__doc__)
src, dst = args[0], args[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
brand = os.path.join(ROOT, "brand", "voice.json")
BV = json.load(open(brand)) if os.path.exists(brand) else {}
default_voice = BV.get("id", "Charon")
voice = args[args.index("--voice") + 1] if "--voice" in args else os.environ.get("TTS_VOICE", default_voice)
model = args[args.index("--model") + 1] if "--model" in args else os.environ.get("TTS_MODEL", BV.get("model", "gemini-3.8-flash-tts"))
key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY manquant")
text = open(src, encoding="utf-8").read().strip()
style_p = os.path.join(os.path.dirname(src), "style.txt")
if not os.path.exists(style_p): style_p = os.path.join(ROOT, "brand", "style.txt")   # consigne de jeu de la chaîne
style = open(style_p, encoding="utf-8").read().strip() if os.path.exists(style_p) else (
    "Narrateur français dynamique et complice, comme un ami qui raconte une anecdote incroyable. "
    "Rythme vif, sourire dans la voix, enchaîne les phrases sans temps mort, aucune longue pause (une seule micro-pause juste avant la grande révélation).")
# Old style files ended with "Lis exactement ce texte :", which glued the note to the text: the model sometimes read the note aloud.
style = re.sub(r"\s*(lis|lire|dis|read)[^.:\n]*(texte|text)\s*:?\s*$", "", style, flags=re.I).strip()
# Gemini TTS: notes and transcript in separate, labelled sections; only the transcript is spoken.
prompt = ("Lis à voix haute UNIQUEMENT le texte de la section TRANSCRIPTION, mot pour mot, en français. "
          "Ne prononce jamais les notes de jeu ni les titres de section.\n\n"
          f"### NOTES DE JEU (à appliquer, pas à lire)\n{style}\n\n### TRANSCRIPTION\n{text}\n")
body = {"contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
                             "speechConfig": {"voiceConfig": {"voice": voice} if voice.startswith(("voice_", "voicekey_"))
                                          else {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                             data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try:
    with urllib.request.urlopen(req, timeout=300) as r: res = json.load(r)
except urllib.error.HTTPError as e:
    sys.exit(f"erreur {e.code} : {e.read().decode()[:800]}")
pcm = base64.b64decode(res["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voicefix import clean_pcm   # the API appends provenance metadata (C2PA/SynthID) after the audio: it would play as end noise
pcm, cut = clean_pcm(pcm, 24000)    # standard library only: this step runs on a bare runner (no numpy)
if cut: print(f"{cut:.2f} s de métadonnées en fin de fichier remplacées par du silence")
with wave.open(dst, "wb") as w:  # PCM 16 bits mono 24 kHz
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(f"{dst} : {len(pcm) / 48000:.2f} s, voix {voice}, modèle {model}")
