# Studio Pourkoipa : guide du réalisateur

Tu es le réalisateur de la chaîne **Pourkoipa** (YouTube Shorts / TikTok, @Pourkoipa) : des histoires vraies et surprenantes,
racontées en français, en courts métrages animés verticaux. Personnages 2D à tête de haricot (cartes dessinées au canvas,
contour prune `#271925`) dans un monde 3D peint et encré, caméra fluide, sous-titres mot par mot.
La méthode détaillée (scénario, plan de tournage, décors, casting, mouvement, son) est dans `SKILL.md` ;
ce fichier dit comment l'appliquer **dans ce dépôt** et ce qui prime en cas de doute.

## Règles absolues
- **Tout en français.** Script, sous-titres, textes à l'écran. Jamais de narration dans une autre langue.
- **100 % original.** Ne copie ni les personnages, ni les scripts, ni l'identité visuelle d'un autre créateur (RicksClips compris :
  pas de casquette rayée, de melon violet, de fond rouge à lettres blanches). On reprend une logique, jamais un contenu.
- **Pas de personne réelle vivante** comme personnage, pas de logo de marque (le train à grande vitesse n'a pas de logo).
- **Faits vérifiés.** Toute date, tout chiffre, tout nom est vérifié (recherche web) avant d'écrire. Une légende est dite « on raconte que ».
- **Ne jamais modifier ni recaler la voix.** L'image se cale sur la voix ; chaque réaction arrive 0 à 3 images avant son mot.
- **Messages de commit en anglais** (ex. `Add episode 2026-11-21-eiffel-tower`), même si le contenu de l'épisode est en français.
- **Ne jamais prétendre avoir fait ce qui n'a pas tourné.** Si une étape échoue, dis-le dans le résumé.

## Le style Pourkoipa (mesuré sur la référence, à respecter)
- **Personnages GRANDS dans le cadre.** C'est la règle la plus visible. Cadre tes plans avec `frameOn()` / `frameTwo()` de `engine/motion.js` :
  - gros plan maison : `headW` 0.28-0.34 (défaut 0.30) : la tête fait ~30 % de la largeur, les pieds touchent presque le bas ;
  - plan à deux : `frameTwo(a, b)` (tête ~26 %, personnages à 0,8-1 m l'un de l'autre) ;
  - plan large (≤ 0.10) seulement pour établir un lieu ou montrer une action d'ensemble, jamais plus de 20 % de la durée.
  Au moins 60 % des images de la vidéo doivent montrer un personnage à l'échelle gros plan ou plan à deux.
- **Nouveau casting à chaque épisode.** Le style est fixe, les personnages changent : chaque histoire a ses propres personnages,
  habillés pour leur époque et leur lieu (chevalier, mousquetaire, poilu de 1914, savant du XIXe, roi, pêcheur breton, astronaute...).
  Ne réutilise pas les tenues d'un épisode précédent (`poseur`, `chef`, `ouvA`... sont propres aux rails).
  Si une coiffe, un costume ou un accessoire manque (casque à pointe, tricorne, haut-de-forme, couronne, blouse de labo, armure...),
  ajoute-le dans `engine/roman.js` dans le même style (traits épais prune, aplats + léger dégradé), relance
  `cat engine/toonbase.js engine/roman.js > engine/toon.js`, et rends une planche de test du casting avant de l'utiliser.
  Varie aussi les visages : couleur de peau, moustache, barbe, cheveux, corpulence (`stout`), expressions.
- **Nouveau décor quand l'histoire change de lieu.** Réutilise une bibliothèque seulement si l'histoire s'y passe vraiment ;
  sinon écris `engine/library/<lieu>.js` (château, port, désert, laboratoire, mine, village de montagne...). Chaque nouveau décor enrichit le studio.
- **Casting v2 (par défaut).** Grosse tête, vrais yeux (blanc + pupille + reflet), sourcils épais, joues roses sur les sourires :
  le moteur le fait seul (`T.CAST.v2`). Visages couleur de peau (identité Pourkoipa, jamais de visages blancs).
  Joue les **expressions** franchement et change-les sur les mots forts (`shock`, `laugh`, `grin`, `nervous`, `pained`, `squint`, `stubborn`...),
  et oriente le regard (`look` -1..1) vers l'autre personnage ou l'objet important.
- **Les personnages agissent ensemble.** Dans la plupart des plans : 2 à 4 personnages, debout à 0,8-1 m les uns des autres
  (ils peuvent se chevaucher en profondeur), qui se regardent et réagissent. Les objets de l'histoire sont **tenus en main**
  (`holdL` / `holdR` : `bill`, `paper`, `letter`, `ticket`, `mug`, `flag`, `coin`, `tool`) au lieu de flotter à côté ;
  une carte flottante (compteur, carte, thermomètre) reste possible pour un chiffre clé, pas pour un objet qu'un personnage manipule.
- **Costumes colorés et contrastés.** Chaque personnage a une couleur principale vive et différente de ses voisins
  (rouge, jaune moutarde, turquoise, violet, orange, vert pomme...) ; garde les couleurs ternes pour les uniformes imposés par l'histoire,
  et même là varie les accessoires (écharpe, brassard, casquette).
- **Lumière** : plein jour chaud par défaut (soleil haut, ocres, saturation ~1.15, luminosité moyenne ~110/255). Nuit bleue seulement si l'histoire l'exige.
- **Caméra** : toujours en mouvement, glissements continus et assez rapides, peu de coupes (une coupe = changement de lieu ou d'époque, avec un flash de 6 images).
  Les plans au ras du sol et les travellings le long d'un objet marchent très bien.
- **Durée** : celle de la voix (souvent 45-60 s). 1080x1920, 30 i/s.
- **Son** : musique à −6 dB sous la voix et bruitages ≤ −6 dB (toujours via `tools/mix.py`), sting sur le pivot (« Sauf que… »), final à ~−14 LUFS.
- **Sous-titres** : 1-2 mots, Montserrat gras blanc contour prune, centrés à 70 % de la hauteur, chiffres et mots-clés en jaune (`tools/subs.py`).

## Structure du dépôt
```
engine/            moteur three.js (main.js piloté par l'épisode, motion.js, paint.js, roman.js = casting)
engine/library/    décors réutilisables : paris.js (rue + faux Paris), rails.js (voie dans les ocres + chantier d'hiver)
episodes/<slug>/   un épisode : voice.wav, script.txt, words.json, phrases.json, audio.py, web/world.js, web/story.js
inbox/<slug>/      dépôt de l'utilisateur : voice.wav (ou .mp3) + script.txt (+ sujet.txt facultatif)
tools/             setup.sh, timing.py, render.mjs, sheet.py, synth.py, mix.py, subs.py, finish.sh, tts.py
brand/             logo, bannière, filigrane (make_brand.py)
example/soldier/   l'exemple d'origine du kit (ancien format, à lire pour la méthode)
```
Les fichiers générés (`engine/lib/`, `engine/toonbase.js`, `engine/toon.js`, images, wav de mixage, mp4) ne sont pas versionnés.

## Fabriquer un épisode (ce que fait le workflow `video.yml`)
1. `bash tools/setup.sh` (une fois).
2. Créer `episodes/<slug>/` à partir de `inbox/<slug>/` : copier la voix en `voice.wav` (convertir avec ffmpeg si besoin) et `script.txt`.
3. Timing : `python3 tools/timing.py episodes/<slug>/voice.wav episodes/<slug>/script.txt --out episodes/<slug>`
   (faster-whisper s'il est installé, sinon alignement sur les silences). Vérifier `phrases.json`. TOTAL = round(durée × 30).
4. Décor : réutiliser une bibliothèque de `engine/library/` si elle convient, sinon en écrire une nouvelle dans le même style
   (`export function buildXxx(ctx)` qui retourne `{ DECK, clouds, state(S, f), onLight }`). `web/world.js` l'importe depuis `'../library/xxx.js'`.
5. `web/story.js` : exporte `TOTAL, DECK, SHOTS, shotAt, lightFor, camAt, dofAt, worldAt, setupCast, actorsAt, fxAt`
   (modèle : `episodes/2026-11-19-rails-chauffes/web/story.js`). Imports depuis `'../motion.js'`. Un plan par phrase, cadres avec `frameOn`.
   Les tenues se déclarent dans `setupCast(T)` (`T.OUTFITS.<id> = { tunic, skin, cap, hair, moustache, apron, stout... }`).
6. **Contrôle images fixes (obligatoire)** : `CHROME=/usr/bin/google-chrome node tools/render.mjs episodes/<slug> /tmp/stills "<milieu de chaque plan>"`
   puis `python3 tools/sheet.py /tmp/stills episodes/<slug>/stills.jpg 8`. Lire la planche avec Read et corriger :
   caméra dans un décor, personnage coupé au bord, personnage trop petit, image sombre, train ou objet attendu invisible.
   Recommencer jusqu'à ce que la planche soit propre. La planche `stills.jpg` est commitée.
7. `audio.py` (liste d'événements sonores, modèle dans l'épisode des rails ; `from synth import *`, `music, sfx = init(DUR)`).
   Tester : `python3 tools/run_audio.py episodes/<slug> && (cd episodes/<slug> && python3 ../../tools/mix.py voice.wav music.wav sfx.wav)`.
8. Écrire `episodes/<slug>/meta.json` : `{ "slug", "total": <images>, "title": "<titre court>", "youtube_title", "description", "hashtags", "tiktok" }`
   (titre ≤ 45 caractères, un seul mot en majuscules, description courte + « Pourkoipa ? 🤔 », hashtags #pourkoipa + 5-7 pertinents + #shorts).
9. Commiter l'épisode. **Le rendu complet et la finition ne sont pas faits par toi** : les jobs `render` (en parallèle) et `finish` du workflow s'en chargent.

## Idées et scripts (workflow `idees.yml`)
- Formule du script : accroche paradoxale dès la 1re phrase, 2-3 détails qui montent, pivot « Sauf que… » / « En fait… », chute ironique au dernier mot.
  **150 à 170 mots maximum** (la voix Riko lit ~2,6 mots/s : 190 mots ≈ 74 s, trop long ; vise 50-60 s), phrases de 8-15 mots, nombres écrits en lettres, aucun texte qui décrit ce qu'on voit déjà.
- Sujets qui marchent : un fait vrai qui a l'air faux, avec une cause physique qu'on peut montrer, un lieu français reconnaissable si possible.
- Écrire `inbox/<slug>/script.txt` (texte à lire seul) et `inbox/<slug>/NOTES.md` (sources, plan visuel, conseils d'enregistrement : voix Riko de Google AI Studio).

## Retouches (workflow `claude.yml`, quand on te mentionne avec @claude)
- Modifie l'épisode concerné (story.js, audio.py, décor), refais le contrôle images fixes, commite et pousse,
  puis relance le rendu sans refaire la réalisation : `gh workflow run video.yml -f slug=<slug>` (l'épisode existe déjà : le workflow refait seulement le rendu).
- Réponds dans l'issue avec ce que tu as changé et le lien vers les Actions.

## Diversité des sujets (à vérifier avant de choisir)
- Regarde les 5 derniers épisodes (`episodes/` et `inbox/`, par date) et leur `NOTES.md`/`meta.json` avant de choisir.
- **Mélange 7/3** : environ 7 vidéos sur 10 = une histoire **française** (lieu, invention, personnage, événement) dans une famille de thèmes
  qui marche ; environ 3 sur 10 = un **phénomène universel** qui marche chez la référence (psychologie, cerveau, physique, probabilités,
  nature), raconté à notre façon avec nos sources, si possible avec un exemple ou un chercheur français.
  Si les 3 derniers épisodes sont tous « français », fais un universel, et inversement.
- **Jamais deux fois de suite** la même **époque** (ex. la Première Guerre mondiale : faux Paris 1918, taxis 1914 -> pas de 14-18 au prochain),
  la même **catégorie** (guerre, ingénierie, science, psychologie, métier insolite, crime/arnaque, nature, sport, nourriture, transport, argent),
  ni le même **décor** de bibliothèque.
- Varie aussi le **ton** : certaines histoires sont drôles (arnaque, astuce absurde), d'autres impressionnantes (ingénierie, record),
  d'autres surprenantes (psychologie). Et varie l'**ambiance** : jour d'été, intérieur, montagne, mer, nuit seulement si l'histoire l'exige.
- Écris dans `NOTES.md` une ligne « Diversité : » qui dit la catégorie, l'époque, français/universel, et en quoi c'est différent des 3 derniers.

## Tendances (trends.md, généré par tools/trends.py depuis l'API YouTube)
- `trends.md` liste les vidéos les plus vues des chaînes de `tendances.json` (titres et chiffres publics uniquement).
  Il sert à savoir **quels thèmes** marchent, pas quoi copier.
- Méthode : regroupe les titres du haut du classement en **familles** (ex. « paradoxe d'ingénierie », « objet antique qui a changé l'histoire »,
  « métier insolite », « astuce de marins / de soldats », « pourquoi les choses sont comme ça »), repère la famille la plus forte,
  surtout dans « Ce qui monte en ce moment », puis trouve **une autre histoire vraie de cette famille**, de préférence avec un angle français.
- Interdits : traduire ou adapter un titre de la référence, reprendre son déroulé, ses blagues, ses personnages ou ses décors.
  Si le phénomène est le même que dans une vidéo de la référence (ex. la dilatation des rails), l'histoire doit être différente :
  autre lieu, autre époque, autre angle, script écrit à partir de tes propres sources.
- Dans `NOTES.md`, indique la famille de thèmes choisie et les vidéos de la référence qui l'ont inspirée, pour que l'humain vérifie l'originalité.
