# PROBLEME : voix inutilisable, épisode non réalisé

**Épisode :** `2026-11-22-boeuf-galton` — aucune vidéo n'a été produite (pas de PLAN.md, pas de story.js, pas de planche).

## 1. La voix lit la consigne de style à voix haute (bloquant)
`inbox/2026-11-22-boeuf-galton/voice.wav` (57,9 s) ne commence pas par le script. Une transcription Whisper (modèle `small`)
donne, pour les ~10 premières secondes :

> « Narrateur français, dynamique et complice, comme un ami qui raconte une anecdote incroyable, rythme vif, sourire dans la voix,
> petite pause avant les révélations, [...] et jamais professeurale. Lies exactement ce texte. » puis seulement : « Personne n'a trouvé le poids de ce bœuf… »

Le TTS a prononcé la consigne de jeu (`brand/style.txt` / style par défaut de `tools/tts.py`) au lieu de la suivre.
La règle « ne jamais modifier ni recaler la voix » interdit de couper ce début : l'épisode ne peut pas être réalisé avec ce fichier.
La voix est aussi trop longue : 57,9 s au lieu de 40-50 s, dont ~10 s de consigne. Sans elle, ~47 s : la durée serait bonne.

**À faire :** régénérer la voix (`tools/tts.py inbox/2026-11-22-boeuf-galton/script.txt inbox/2026-11-22-boeuf-galton/voice.wav`),
avec une consigne de style qui n'est pas lue (par exemple un champ `systemInstruction` à part, ou une consigne plus courte
qui ne se termine pas par « Lis exactement ce texte : »), puis relancer le workflow. Écouter les 3 premières secondes avant de relancer.

## 2. Le timing a échoué sur la voix (corrigeable, mais sans objet tant que 1. n'est pas réglé)
`tools/timing.py` retombe sur `silence-align` (`phrases.json` ne dit pas `"source": "whisper"`) :
`faster-whisper` 1.2.1 plante dans `decode_audio` avec `open() got an unexpected keyword argument 'metadata_errors'`
(PyAV trop ancien : `av.open(..., metadata_errors=...)` demande PyAV >= 14).
Avec le préfixe de ~10 s en plus, l'alignement sur les silences décale toutes les phrases (« Personne n'a trouvé… » placé à 0,3 s au lieu de ~10 s).

**À faire :** `pip install -U av` dans le job (ou passer à `timing.py` un tableau audio décodé par ffmpeg à la place du chemin).

## 3. Détails à corriger au passage dans le script (non bloquants)
- Le TTS a lu « mille cent quatre-vingt-dix-huit livres » comme **1 188** (« 1.188 livres ») : à vérifier à la réécoute de la nouvelle voix,
  le chiffre exact est 1 198 lb.
- `NOTES.md` annonce `engine/library/foire.js` : ce décor n'existe pas encore, il faudra l'écrire (foire anglaise, enclos, balance, tente).
