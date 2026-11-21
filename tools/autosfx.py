#!/usr/bin/env python3
"""Bruitages automatiques : ajoute à sfx.wav un son pour chaque chose qui bouge à l'image (events.json, écrit par tools/events.mjs).
usage: python3 tools/autosfx.py episodes/<slug>        (après run_audio.py, avant mix.py ; finish.sh le fait)
- Un son ponctuel n'est ajouté que si l'épisode n'a pas déjà un bruitage à cet endroit (± 0,12 s) : audio.py garde la main.
- Les ambiances (pluie, mer, vent, feu) sont posées sous tout le passage concerné.
- Désactiver pour un épisode : "autoSfx": false dans meta.json, ou AUTOSFX=0.
À lancer juste après run_audio.py (qui réécrit sfx.wav) ; la piste d'origine est copiée dans sfx_manual.wav."""
import os, sys, json, wave, shutil
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S

EP = sys.argv[1].rstrip('/')
meta = json.load(open(f'{EP}/meta.json')) if os.path.exists(f'{EP}/meta.json') else {}
if os.environ.get('AUTOSFX') == '0' or meta.get('autoSfx') is False:
    print('bruitages automatiques désactivés'); sys.exit(0)
if not os.path.exists(f'{EP}/events.json'):
    print('pas de events.json (lancer node tools/events.mjs) : rien ajouté'); sys.exit(0)
E_ = json.load(open(f'{EP}/events.json'))
SR = S.SR

def read(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32767
        if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
        return x, w.getframerate()
src = f'{EP}/sfx.wav'                      # always the fresh output of audio.py (run_audio.py just before)
if os.path.exists(src):
    man, sr = read(src); assert sr == SR, 'sfx.wav doit être en 48 kHz (synth.py)'
    shutil.copy(src, f'{EP}/sfx_manual.wav')
else:
    man = np.zeros(int(E_['total'] / 30 * SR) + SR, np.float32)
N = max(len(man), int(E_['total'] / 30 * SR))
man = np.pad(man, (0, N - len(man)))
# where the episode already has a sound (10 ms envelope), so the automatic layer does not double it
win = int(0.01 * SR); envm = np.sqrt((np.pad(man, (0, (-len(man)) % win)).reshape(-1, win) ** 2).mean(1))
busy_th = max(envm.max() * 0.04, 1e-4)
def busy(t): i = int(t * 100); return envm[max(0, i - 15): i + 30].max(initial=0) > busy_th   # a hand-placed sound starting just before or within 0.3 s

auto = np.zeros(N, np.float32)
ONE = {  # type -> (sound, gain)
    'whoosh': (lambda: S.whoosh(0.45), 0.35), 'swish': (S.swish, 0.55), 'flash': (lambda: S.whoosh(0.5), 0.45), 'impact': (S.thud, 0.6),
    'pop': (S.pop, 0.4), 'jump': (S.boing, 0.5), 'land': (S.thud, 0.55), 'fall': (S.bonk, 0.7), 'surprise': (S.gasp, 0.35),
    'step': (S.step_tap, 0.25), 'thunder': (S.thunder, 0.9), 'splash': (lambda: S.splash(1.0), 0.6), 'sparks': (lambda: S.crackle(1.4), 0.4), 'puff': (lambda: S.whoosh(0.35), 0.3),
}
added, skipped = {}, 0
for e in E_['events']:
    snd = ONE.get(e['type'])
    if not snd: continue
    t = e['t']
    if e['type'] not in ('thunder', 'step') and busy(t): skipped += 1; continue
    S.place(auto, snd[0](), max(0, t - (0.06 if e['type'] in ('whoosh', 'swish', 'flash') else 0)), snd[1] * (0.6 + 0.4 * e['k']))
    added[e['type']] = added.get(e['type'], 0) + 1
LOOP = {'rain': (S.rain_loop, 0.5), 'sea': (None, 0.55), 'wind': (None, 0.45), 'fire': (lambda d: S.crackle(d), 0.25)}
for L in E_['loops']:
    d = L['t1'] - L['t0']
    if d < 0.3 or L['type'] not in LOOP: continue
    fn, g = LOOP[L['type']]
    x = S.sea_loop(d, L['k']) if L['type'] == 'sea' else S.wind_loop(d, L['k']) if L['type'] == 'wind' else fn(d)
    S.place(auto, x, L['t0'], g); added[L['type']] = added.get(L['type'], 0) + 1
# auto layer sits a little under the hand-placed sounds; final level is set by mix.py anyway
pk_m, pk_a = np.abs(man).max(), np.abs(auto).max()
if pk_m > 1e-4 and pk_a > 1e-4: auto *= 0.8 * pk_m / pk_a
out = man + auto
m = max(np.abs(out).max(), 1e-6); pcm = (np.clip(out / m * 0.9, -1, 1) * 32767).astype(np.int16)
with wave.open(f'{EP}/sfx.wav', 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('bruitages automatiques ajoutés :', json.dumps(added, ensure_ascii=False), f'| {skipped} déjà couverts par audio.py')
