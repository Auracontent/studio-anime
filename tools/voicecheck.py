#!/usr/bin/env python3
"""Vérifie qu'une voix dit bien le script, et rien d'autre (Whisper).
usage : python3 tools/voicecheck.py voice.wav script.txt      -> code 0 si bonne, 3 si à refaire, 2 si Whisper absent
Attrape surtout le défaut des voix Gemini qui lisent la consigne de jeu à voix haute (« Narrateur français dynamique… ») :
- le début de la voix doit être le début du script ;
- la voix ne doit pas contenir beaucoup de mots absents du script.
Les écarts de chiffres (« 1 188 » au lieu de « 1 198 ») sont signalés mais ne bloquent pas."""
import sys, re, unicodedata, subprocess, difflib

def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', w)
def words(t): return [x for x in (norm(w) for w in re.split(r"[\s'’-]+", t)) if x]

def load16k(path):
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)

def transcribe(path, lang='fr', model='small'):
    from faster_whisper import WhisperModel
    m = WhisperModel(model, compute_type='int8')
    segs, _ = m.transcribe(load16k(path), language=lang, vad_filter=False)
    return ' '.join(s.text for s in segs)

def check(voice, script_text):
    try: heard = transcribe(voice)
    except Exception as e: print(f'Whisper indisponible ({e}) : voix non vérifiée'); return 2, ''
    H, S = words(heard), words(script_text)
    head_ok = difflib.SequenceMatcher(None, H[:8], S[:5], autojunk=False).find_longest_match(0, min(8, len(H)), 0, min(5, len(S))).size >= 3 \
              and H[:1] and H[0] in S[:3]
    sm = difflib.SequenceMatcher(None, H, S, autojunk=False)
    extra = sum((i2 - i1) - (j2 - j1) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag in ('delete', 'replace') and (i2 - i1) > (j2 - j1))
    lead = next((b.a for b in sm.get_matching_blocks() if b.size >= 3), 0)       # words heard before the script really starts
    leak = any(k in H[:40] for k in ('narrateur', 'consigne', 'exactement', 'professoral', 'professorale', 'dynamique'))
    print(f'entendu ({len(H)} mots) : « {heard.strip()[:160]}… »')
    print(f'script : {len(S)} mots · mots en trop : {extra} · mots avant le début du script : {lead}')
    bad = leak or lead > 3 or extra > max(8, 0.12 * len(S)) or not head_ok
    if bad: print('VOIX A REFAIRE : ' + ('elle lit la consigne de jeu' if leak or lead > 3 else 'elle ne suit pas le script'))
    else: print('voix OK')
    return (3 if bad else 0), heard

if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    code, heard = check(sys.argv[1], open(sys.argv[2], encoding='utf-8').read())
    if '--json' in sys.argv:   # result kept next to the voice; qa.py blocks publishing if the voice was bad
        import json
        json.dump({'ok': code == 0, 'checked': code != 2, 'summary': 'voix OK' if code == 0 else ('non vérifiée' if code == 2 else 'ne suit pas le script'),
                   'heard_start': heard[:200]}, open(sys.argv[sys.argv.index('--json') + 1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sys.exit(code)
