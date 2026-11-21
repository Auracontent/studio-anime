#!/usr/bin/env python3
"""Retire le « grésillement » de fin des voix générées par Google (Gemini TTS, Google AI Studio).
Ces fichiers portent, collées après la voix, les métadonnées de provenance (C2PA / SynthID : « Created by Google Generative AI »).
Lues comme du son, elles donnent ~0,2 s de bruit fort et aigu à la toute fin de la vidéo. On les remplace par du silence :
la durée et le calage de la voix ne changent pas (aucun échantillon déplacé).
usage : python3 tools/voicefix.py fichier.wav [...]     (corrige sur place ; sans effet sur une voix propre)
Utilisé aussi par mix.py (sur la voix chargée) et tts.py (à la création).
Python standard uniquement (pas de numpy) : il tourne aussi dans les étapes du workflow qui n'installent rien."""
import sys, wave, math
from array import array

MARKERS = (b'c2pa', b'jumb', b'Generative AI', b'trainedAlgorithmicMedia', b'SynthID')

def has_marker(raw_bytes):
    return any(m in raw_bytes[-65536:] for m in MARKERS)

def tail_start(x, sr, scale=1.0, max_tail=0.5):
    """x: sequence of samples (int16 values with scale=32767, or floats). Index where a short loud block glued after
    the end of speech starts (silence >= 0.12 s before it, block <= max_tail s), else None. Looks at the last 1.5 s only."""
    n = max(1, int(0.01 * sr)); look = min(len(x) // n, int(1.5 / 0.01)); base = len(x) - look * n
    if look < 30: return None
    env = []
    for b in range(look):
        seg = x[base + b * n: base + (b + 1) * n]
        env.append(20 * math.log10(math.sqrt(sum((float(v) / scale) ** 2 for v in seg) / n) + 1e-9))
    k = look; i = k - 1; lim = k - int(max_tail / 0.01)
    while i > lim and (env[i] > -35 or env[i] < -150): i -= 1   # walk back through the loud tail (it contains runs of zero bytes)
    if i == k - 1 or i <= lim: return None
    gap, j = 0, i
    while j > 0 and env[j] < -45: gap += 1; j -= 1               # the silence just before it
    if gap < 12: return None                                     # no real gap: it is speech, keep it
    return base + (i + 1) * n

def clean(x, sr, raw_bytes, scale=1.0):
    """Silence the metadata tail of x in place-free fashion. x: numpy array or array('h'). Acts only when raw_bytes
    (the file or PCM bytes) carry Google's provenance markers. Returns (signal, seconds silenced)."""
    if not has_marker(raw_bytes): return x, 0.0
    s = tail_start(x, sr, scale)
    if s is None: return x, 0.0
    y = x.copy() if hasattr(x, 'copy') else array(x.typecode, x)
    f = min(int(0.005 * sr), s)
    for i in range(s - f, s): y[i] = type(y[i])(y[i] * (s - i) / f) if f else y[i]
    for i in range(s, len(y)): y[i] = 0
    return y, (len(x) - s) / sr

def clean_pcm(pcm, sr):
    """PCM 16-bit mono bytes in, cleaned bytes out (same length)."""
    pcm = pcm[: len(pcm) // 2 * 2]; a = array('h'); a.frombytes(pcm)
    if sys.byteorder == 'big': a.byteswap()
    y, cut = clean(a, sr, pcm, 32767)
    if sys.byteorder == 'big': y.byteswap()
    return y.tobytes(), cut

def fix_file(p):
    with wave.open(p) as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes(); b = w.readframes(n)
    if sw != 2 or ch != 1: print(f'{p} : format non géré ({ch} canaux, {8 * sw} bits), ignoré'); return 0.0
    out, cut = clean_pcm(b, sr)
    if cut:
        with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(out)
    print(f'{p} : ' + (f'{cut:.2f} s de bruit de fin remplacées par du silence' if cut else 'propre')); return cut

if __name__ == '__main__':
    for p in sys.argv[1:]: fix_file(p)
