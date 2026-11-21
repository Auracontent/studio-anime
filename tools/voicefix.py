#!/usr/bin/env python3
"""Retire le « grésillement » de fin des voix générées par Google (Gemini TTS, Google AI Studio).
Ces fichiers portent, collées après la voix, les métadonnées de provenance (C2PA / SynthID : « Created by Google Generative AI »).
Lues comme du son, elles donnent ~0,2 s de bruit fort et aigu à la toute fin de la vidéo. On les remplace par du silence :
la durée et le calage de la voix ne changent pas (aucun échantillon déplacé).
usage : python3 tools/voicefix.py fichier.wav [...]     (corrige sur place ; sans effet sur une voix propre)
Utilisé aussi par mix.py (sur la voix chargée) et tts.py (à la création)."""
import sys, wave
import numpy as np

MARKERS = (b'c2pa', b'jumb', b'Generative AI', b'trainedAlgorithmicMedia', b'SynthID')

def tail_start(x, sr, max_tail=0.5):
    """Index where a loud burst glued after the end of speech starts (silence >= 0.12 s, then a loud block until the end), else None."""
    n = max(1, int(0.01 * sr)); k = len(x) // n
    if k < 30: return None
    env = 20 * np.log10(np.sqrt((x[len(x) - k * n:].reshape(k, n) ** 2).mean(1)) + 1e-9)
    i = k - 1; lim = k - int(max_tail / 0.01)
    while i > lim and (env[i] > -35 or env[i] < -150): i -= 1   # walk back through the loud tail (it contains runs of zero bytes)
    if i == k - 1 or i <= lim: return None
    gap = 0; j = i
    while j > 0 and env[j] < -45: gap += 1; j -= 1         # the silence just before it
    if gap < 12: return None                                # no real gap: it is speech, keep it
    return len(x) - k * n + (i + 1) * n

def has_marker(raw_bytes):
    return any(m in raw_bytes[-65536:] for m in MARKERS)

def clean(x, sr, raw_bytes):
    """Zero the metadata tail of a float or int16 signal. Acts only when the file carries Google's provenance markers
    (raw_bytes = the file or PCM bytes) AND ends with a short loud block after a silence, so real speech is never touched.
    Returns (signal, seconds silenced)."""
    if not has_marker(raw_bytes): return x, 0.0
    s = tail_start(x.astype(np.float32) / (32767 if x.dtype == np.int16 else 1), sr)
    if s is None: return x, 0.0
    y = x.copy(); y[s:] = 0
    f = min(int(0.005 * sr), s); y[s - f:s] = (y[s - f:s] * np.linspace(1, 0, f)).astype(y.dtype)
    return y, (len(x) - s) / sr

def fix_file(p):
    with wave.open(p) as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes(); b = w.readframes(n)
    if sw != 2: print(f'{p} : {8 * sw} bits, ignoré'); return 0.0
    x = np.frombuffer(b, np.int16).reshape(-1, ch)
    mono = x.mean(1).astype(np.int16)
    _, cut = clean(mono, sr, b)
    if cut:
        s = len(mono) - int(round(cut * sr)); x = x.copy(); x[s:] = 0
        with wave.open(p, 'wb') as w: w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr); w.writeframes(x.tobytes())
    print(f'{p} : ' + (f'{cut:.2f} s de bruit de fin remplacées par du silence' if cut else 'propre')); return cut

if __name__ == '__main__':
    for p in sys.argv[1:]: fix_file(p)
