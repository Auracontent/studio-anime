#!/usr/bin/env python3
"""Voix off avec Gemini TTS (optionnel : sinon dépose ta propre voice.wav).
usage : GEMINI_API_KEY=... python3 tools/tts.py episodes/<slug>/script.txt episodes/<slug>/voice.wav [--voice Charon] [--model gemini-2.5-pro-preview-tts]
La consigne de jeu (ton, rythme) se met dans episodes/<slug>/style.txt si présent ; sinon un narrateur français dynamique."""
import base64, json, os, sys, urllib.request, wave

args = sys.argv[1:]
if len(args) < 2: sys.exit(__doc__)
src, dst = args[0], args[1]
voice = args[args.index("--voice") + 1] if "--voice" in args else os.environ.get("TTS_VOICE", "Charon")
model = args[args.index("--model") + 1] if "--model" in args else os.environ.get("TTS_MODEL", "gemini-2.5-pro-preview-tts")
key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY manquant")
text = open(src, encoding="utf-8").read().strip()
style_p = os.path.join(os.path.dirname(src), "style.txt")
style = open(style_p, encoding="utf-8").read().strip() if os.path.exists(style_p) else (
    "Narrateur français dynamique et complice, comme un ami qui raconte une anecdote incroyable. "
    "Rythme vif, sourire dans la voix, petites pauses avant les révélations. Lis exactement ce texte :")
body = {"contents": [{"parts": [{"text": f"{style}\n\n{text}"}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
                             "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                             data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
with urllib.request.urlopen(req, timeout=300) as r: res = json.load(r)
pcm = base64.b64decode(res["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
with wave.open(dst, "wb") as w:  # PCM 16 bits mono 24 kHz
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(f"{dst} : {len(pcm) / 48000:.2f} s, voix {voice}, modèle {model}")
