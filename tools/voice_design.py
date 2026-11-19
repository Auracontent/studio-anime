#!/usr/bin/env python3
"""Crée la voix de la chaîne avec le Voice design de Gemini (une seule fois) et l'enregistre dans brand/voice.json.
usage : GEMINI_API_KEY=... python3 tools/voice_design.py [brand/voice_prompt.txt]
Écrit brand/voice.json ({id, model, ...}) et brand/voice_sample.wav (aperçu). tts.py utilise ensuite cette voix par défaut.
Voix originale décrite par des traits (âge, timbre, ton) : on ne copie pas la voix d'une personne réelle."""
import base64, json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY manquant")
p = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "brand", "voice_prompt.txt")
desc = open(p, encoding="utf-8").read().strip()
model = os.environ.get("TTS_MODEL", "gemini-3.8-flash-tts")
body = {"store": True, "voice": {"model": model, "type": "prompted", "display_name": "Pourkoipa narrateur",
                                  "gender": os.environ.get("VOICE_GENDER", "male"), "language_code": "fr-FR",
                                  "prompted": {"input": desc}}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/voices", data=json.dumps(body).encode(),
                             headers={"Content-Type": "application/json", "x-goog-api-key": key})
try:
    with urllib.request.urlopen(req, timeout=300) as r: res = json.load(r)
except urllib.error.HTTPError as e:
    sys.exit(f"erreur {e.code} : {e.read().decode()[:800]}")
vid = res.get("id") or res.get("name", "").split("/")[-1]
json.dump({"id": vid, "model": model, "language_code": "fr-FR", "description": desc}, open(os.path.join(ROOT, "brand", "voice.json"), "w"), ensure_ascii=False, indent=1)
sa = res.get("sample_audio") or res.get("sampleAudio") or {}
if sa.get("data"):
    raw = base64.b64decode(sa["data"]); out = os.path.join(ROOT, "brand", "voice_sample.wav")
    if raw[:4] == b"RIFF": open(out, "wb").write(raw)
    else:
        import wave
        with wave.open(out, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(raw)
    print("aperçu :", out)
print("voix créée :", vid)
