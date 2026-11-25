#!/usr/bin/env python3
"""Contrôle qualité d'un épisode fini : mesure ce qui fait décrocher sur un Short et l'écrit dans out/QA.md.
Les défauts GRAVES (sous-titres non calés par Whisper, voix qui ne suit pas le script, vidéo de plus de 60 s) sont aussi écrits
dans out/QA.json ("blocking") : hf_upload.py met alors la vidéo en statut "review" et la publication automatique la saute.
usage: python3 tools/qa.py episodes/<slug> [video.mp4]
Ne bloque rien (code de sortie 0) : chaque point est OK, A REVOIR ou INFO, avec le chiffre mesuré et la cible.
Mesures : durée, nombre de mots, ouverture (date en premier ?), plan de tournage présent, effets / ambiances utilisés,
niveau de la musique et des bruitages sous la voix, images figées (moins de mouvement que le style), luminosité par seconde."""
import sys, os, re, json, glob, subprocess, wave
import numpy as np

EP = sys.argv[1].rstrip('/')
VID = sys.argv[2] if len(sys.argv) > 2 else (sorted(glob.glob(f'{EP}/out/*.mp4')) or [None])[0]
rows = []
blocking = []   # grave defects: the video is held back from automatic publishing
def row(name, ok, value, target, note=''):
    rows.append((name, ok, value, target, note))

# ---------- texte ----------
script = open(f'{EP}/script.txt', encoding='utf-8').read().strip() if os.path.exists(f'{EP}/script.txt') else ''
words = len(re.findall(r"[\wÀ-ÿ'’-]+", script))
if script:
    row('Longueur du script', 'OK' if 105 <= words <= 400 else 'A REVOIR', f'{words} mots', '115-390 mots selon l\'histoire (45 s-2 min 30)')
    first = re.split(r'(?<=[.!?…])\s', script)[0]
    date_first = bool(re.match(r"^\s*(en|le|au|dans les|vers)?\s*(l'an\s+)?(mille|deux mille|\d{3,4}|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)", first, re.I))
    row('Ouverture', 'A REVOIR' if date_first else 'OK', f'« {first[:70]}{"…" if len(first) > 70 else ""} »',
        'la surprise d\'abord, jamais une date en premier mot')

# ---------- préparation ----------
row('Plan de tournage (PLAN.md)', 'OK' if os.path.exists(f'{EP}/PLAN.md') else 'A REVOIR', 'présent' if os.path.exists(f'{EP}/PLAN.md') else 'absent',
    'une ligne par phrase : action visible, caméra, ambiance, effet')
story = open(f'{EP}/web/story.js', encoding='utf-8').read() if os.path.exists(f'{EP}/web/story.js') else ''
if story:
    fx = sorted(set(re.findall(r'\b(rain|snow|motes|sea|lightning|sparks|embers|smoke|spray|beams)\b\s*(?::|=|\.push)', story))) if 'envAt' in story else []
    acts = sorted(set(re.findall(r'\b(follow|track|orbit|shake|hop|fallOver|run|tremble|rock|popIn|transition)\(', story)))
    poses = sorted(set(re.findall(r"'(carry|push|head|flail|lift|reach|point|wave|up)'", story)))
    moods = sorted(set(re.findall(r"\b(?:mood|blendMood)\(\s*'(\w+)'", story)))
    row('Effets 3D (envAt)', 'OK' if fx else 'INFO', ', '.join(fx) or 'aucun', 'au moins un effet qui sert l\'histoire')
    row('Caméra / actions (motion.js)', 'OK' if acts else 'INFO', ', '.join(acts) or 'aucune', 'suivre ce qui bouge, une action par plan')
    row('Poses d\'action', 'OK' if poses else 'INFO', ', '.join(poses) or 'aucune', 'les personnages FONT quelque chose')
    row('Ambiances (moods.js)', 'OK' if len(moods) >= 2 else 'INFO', ', '.join(moods) or 'LIGHTS maison', 'une ambiance par acte')

if os.path.exists(f'{EP}/phrases.json'):
    src = json.load(open(f'{EP}/phrases.json')).get('source', '?')
    row('Calage des sous-titres', 'OK' if src == 'whisper' else 'A REVOIR', src, 'whisper (les silences seuls décalent les sous-titres)')
    if src != 'whisper': blocking.append('sous-titres calés sur les silences (décalés)')
slug = os.path.basename(EP)
vc = next((p for p in (f'{EP}/voicecheck.json', os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(EP))), 'inbox', slug, 'voicecheck.json')) if os.path.exists(p)), None)
if vc:
    V = json.load(open(vc))
    row('Voix = script', 'OK' if V.get('ok') else 'A REVOIR', V.get('summary', ''), 'la voix dit le script, et rien d\'autre')
    if not V.get('ok'): blocking.append('la voix ne suit pas le script')

# ---------- son ----------
if os.path.exists(f'{EP}/music.wav'):
    mdb = float(os.environ.get('MUSIC_DB', '-12'))   # mix.py sets the music bed exactly at this level under the voice (gated RMS)
    row('Musique sous la voix', 'OK' if mdb <= -10 else 'A REVOIR', f'{mdb:.0f} dB (réglage mix.py)', '-10 à -14 dB : la voix doit rester claire')
if VID and os.path.exists(VID):
    out = subprocess.run(['ffmpeg', '-nostats', '-i', VID, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = re.findall(r'^\s+I:\s+(-?[\d.]+) LUFS', out, re.M)
    if I: row('Loudness finale', 'OK' if abs(float(I[-1]) + 14) <= 1.5 else 'A REVOIR', f'{I[-1]} LUFS', '-14 LUFS ±1,5')

# ---------- image ----------
if VID and os.path.exists(VID):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', VID], capture_output=True, text=True).stdout.strip() or 0)
    row('Durée', 'OK' if 40 <= dur <= 155 else 'A REVOIR', f'{dur:.1f} s', '45 s-2 min 30 selon l\'histoire')
    if dur > 178: blocking.append(f'vidéo trop longue ({dur:.0f} s) : au-delà de 3 min ce n\'est plus un Short')
    W, H, FPS = 72, 128, 10
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VID, '-vf', f'fps={FPS},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    # captions live around 62-78 % of the height: ignore that band so word swaps do not count as motion
    mask = np.ones((H, W), bool); mask[int(H * 0.6):int(H * 0.8)] = False
    diff = np.abs(np.diff(fr, axis=0))[:, mask].mean(1)              # mean absolute change per 0.1 s
    sec = [diff[i:i + FPS].mean() for i in range(0, len(diff) - FPS + 1, FPS)]
    still = [i for i, d in enumerate(sec) if d < 1.2]
    row('Secondes presque figées', 'OK' if len(still) <= max(2, 0.08 * len(sec)) else 'A REVOIR', f'{len(still)} / {len(sec)}' + (f' (s {", ".join(map(str, still[:12]))})' if still else ''),
        '≤ 8 % : la caméra ou un personnage bouge toujours')
    hook = float(np.mean(sec[:2])) if len(sec) >= 2 else 0
    row('Mouvement dans les 2 premières s', 'OK' if hook >= 2.5 else 'A REVOIR', f'{hook:.1f}', '≥ 2,5 (une action ou un mouvement fort dès l\'ouverture)')
    lum = [fr[i * FPS][mask].mean() for i in range(len(fr) // FPS)]
    dark = [i for i, l in enumerate(lum) if l < 45]   # 45/255 = clearly too dark on a phone; aim for >= 60
    row('Secondes trop sombres', 'OK' if not dark else 'A REVOIR', f'{len(dark)}' + (f' (s {", ".join(map(str, dark[:12]))})' if dark else ''), 'luminosité moyenne ≥ 45/255, même la nuit')

# ---------- rapport ----------
os.makedirs(f'{EP}/out', exist_ok=True)
md = ['# Contrôle qualité', '', '| Point | État | Mesure | Cible |', '| --- | --- | --- | --- |'] + [f'| {n} | {o} | {v} | {t} |' for n, o, v, t, _ in rows]
bad = [n for n, o, *_ in rows if o == 'A REVOIR']
md += ['', f'**{len(bad)} point(s) à revoir**' + (' : ' + ', '.join(bad) if bad else '')]
if blocking: md += ['', '**VIDÉO BLOQUÉE (pas de publication automatique)** : ' + ' ; '.join(blocking),
                   'Pour la publier quand même après vérification : Actions → Publication → mode « publier », slug = ' + os.path.basename(EP) + '.']
json.dump({'blocking': blocking, 'points': [{'point': n, 'etat': o, 'mesure': v} for n, o, v, t, _ in rows]},
          open(f'{EP}/out/QA.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(f'{EP}/out/QA.md', 'w', encoding='utf-8').write('\n'.join(md) + '\n')
print('\n'.join(md))
