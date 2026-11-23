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

## Règle n°1 : on comprend l'histoire sans le son
La plupart des gens regardent un Short **sans le son** et décident de rester en 1 à 2 secondes. Chaque épisode doit donc passer ce test :
si on coupe le son, on comprend quand même de quoi on parle, ce qui pose problème et comment ça se résout.
- **Accroche visuelle de 0 à 2 s.** L'objet clé, le danger ou l'action la plus étonnante est à l'écran dès la première image
  (le phare dans la tempête, le train qui déraille, le pont qui s'effondre). Jamais deux personnages qui sourient devant un mur pour ouvrir.
- **Une phrase = une action visible.** Pour chaque phrase du script, décide ce qu'on VOIT se passer, pas seulement qui est à l'écran :
  « trop lourd » -> deux ouvriers soulèvent un bloc énorme, tremblent (`tremble`) et tombent (`fallOver`) ;
  « la lumière partait dans tous les sens » -> on voit les rayons faibles se perdre et un bateau qui ne voit rien ;
  « découper la lentille » -> on voit la découpe se faire. Un schéma dans une bulle ne remplace jamais l'action : il la complète.
- **Montrer l'enjeu.** S'il y a un danger (naufrage, incendie, faillite, bataille), on le voit : nuit, tempête, rochers, flammes, foule.
- **Un héros qu'on suit.** Un personnage principal reconnaissable du début à la fin (même tenue, même couleur), plus au maximum
  deux personnages secondaires. Les autres sont des figurants en arrière-plan. 6 personnages différents = on ne sait plus qui est qui.
- **L'objet clé en vedette.** L'objet dont parle l'histoire (lentille, rail, taxi, corde...) a au moins un plan rapproché où il remplit le cadre,
  et il change d'état sous nos yeux (il apparaît, se casse, se transforme, s'allume).
- **La fin reboucle.** La dernière phrase et la dernière image renvoient à la première (même lieu ou même objet), pour donner envie de revoir.

## Le style Pourkoipa (mesuré sur la référence, à respecter)
- **Personnages GRANDS dans le cadre.** C'est la règle la plus visible. Cadre tes plans avec `frameOn()` / `frameTwo()` de `engine/motion.js` :
  - gros plan maison : `headW` 0.28-0.34 (défaut 0.30) : la tête fait ~30 % de la largeur, les pieds touchent presque le bas ;
  - plan à deux : `frameTwo(a, b)` (tête ~26 %, personnages à 0,8-1 m l'un de l'autre) ;
  - plan large (≤ 0.10) seulement pour établir un lieu ou montrer une action d'ensemble, jamais plus de 20 % de la durée.
  Au moins 60 % des images de la vidéo doivent montrer un personnage à l'échelle gros plan ou plan à deux.
- **Nouveau casting à chaque épisode, un héros par épisode.** Le style est fixe, les personnages changent : chaque histoire a ses propres personnages,
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
- **Les personnages agissent, ensemble.** Dans la plupart des plans : le héros et 1 ou 2 autres, à 0,8-1 m les uns des autres
  (ils peuvent se chevaucher en profondeur), qui se regardent, réagissent **et font quelque chose** : porter, pousser, courir, sauter,
  tomber, se protéger (poses et actions plus bas). Un plan où tout le monde est debout les bras le long du corps est un plan raté. Les objets de l'histoire sont **tenus en main**
  (`holdL` / `holdR` : `bill`, `paper`, `letter`, `ticket`, `mug`, `flag`, `coin`, `tool`) au lieu de flotter à côté ;
  une carte flottante (compteur, carte, thermomètre) reste possible pour un chiffre clé, pas pour un objet qu'un personnage manipule.
- **Costumes colorés et contrastés.** Chaque personnage a une couleur principale vive et différente de ses voisins
  (rouge, jaune moutarde, turquoise, violet, orange, vert pomme...) ; garde les couleurs ternes pour les uniformes imposés par l'histoire,
  et même là varie les accessoires (écharpe, brassard, casquette).
- **Rendu** : le moteur ajoute une occlusion ambiante douce (coins, pied des murs, contact au sol) et teinte les ombres (violet par défaut).
  Réglables par ambiance dans `LIGHTS` : `ao` (0.7), `aoR` (1.35), `shadowTint` ('#5d4a7a', ou brun chaud '#6a4a3a' pour un coucher de soleil), `shadowAmt` (0.22).
- **Lumière : une ambiance par acte.** Le plein jour chaud reste la base (soleil haut, ocres, saturation ~1.15, luminosité moyenne ~110/255),
  mais la lumière **raconte** : elle change quand l'histoire change (calme -> problème -> solution). Utilise `engine/moods.js` :
  `jour`, `matin`, `dore` (la récompense), `soir`, `nuit` (bleu lumineux, jamais noir), `tempete`, `lampe` (intérieur, feu), `froid`,
  et `blendMood(a, b, t)` pour passer de l'une à l'autre. Dès que l'histoire parle de danger, de nuit, de mer, de feu, d'hiver, montre-le.
- **Caméra** : toujours en mouvement, glissements continus et assez rapides, **pas de coupe sèche** : pour changer de lieu ou d'époque,
  la caméra voyage avec `transition()` (panoramique éclair `whip`, montée au ciel `rise`, plongée `drop`, élan vers l'avant `push`) ;
  le flash blanc de 6 images reste possible pour un choc ou un saut dans le temps, pas comme transition par défaut.
  Les plans au ras du sol et les travellings le long d'un objet marchent très bien. Quand quelque chose bouge, **la caméra le suit**
  (`follow`, `track`), tourne autour d'un lieu pour le révéler (`orbit`) et tremble sur les chocs (`shake`). Varie l'échelle :
  au moins un plan large spectaculaire (le lieu, le danger) et au moins un gros plan sur l'objet clé.
- **Durée** : celle de la voix, **40 à 50 s** (110 à 130 mots). Au-delà, le pourcentage de vidéo regardé chute. 1080x1920, 30 i/s.
- **Son** : musique à **−12 dB** sous la voix et bruitages ≤ −8 dB (toujours via `tools/mix.py`, réglables avec `MUSIC_DB` / `SFX_DB`) :
  la voix doit rester claire sur un haut-parleur de téléphone. Sting sur le pivot (« Sauf que… »), bruitage sur chaque action visible
  (chute, choc, vague, tonnerre, porte), final à ~−14 LUFS.
- **Sous-titres** : 1-2 mots, Montserrat gras blanc contour prune, centrés à 70 % de la hauteur, chiffres et mots-clés en jaune (`tools/subs.py`).

## Effets, ambiances, caméra et actions (moteur)
Démo de tout ce qui suit : `episodes/_demo-fx/web/story.js` (tempête au phare, course de nuit suivie par la caméra, forge, chute,
reliés par des transitions `whip`, `rise`, `push`, avec signes automatiques et bruitages automatiques).
Planche : `node tools/render.mjs episodes/_demo-fx /tmp/demo "30,44,70,125,200,225,312,350"`.
- **Effets 3D** (`engine/fx3d.js`) : exporte `envAt(f)` dans `story.js`, qui renvoie pour l'image `f` :
  `rain` (0-1), `snow`, `motes` (poussière dans la lumière), `wind: [x, z]`, `sea: { amp, col, deep, foam }` (vagues animées :
  0.15 calme, 0.6 agitée, 1.1 tempête ; cache l'eau plate du décor), `lightning: [images des éclairs]`,
  `sparks`, `embers`, `smoke`, `spray` (gerbe d'eau, d'éclats), `beams` (faisceau de phare, phares de voiture, rayon de soleil).
  `waveHeight(x, z, f, amp)` fait flotter un bateau ou un tonneau sur la même mer. Tout est déterministe (pas de `Math.random`).
- **Ambiances** (`engine/moods.js`) : `lightFor` peut renvoyer `mood('nuit')`, `mood('jour', { el: 40 })` ou `blendMood('soir', 'tempete', t)`.
- **Caméra** (`engine/motion.js`) : `follow(posAt, f, { headW, yaw, lag, lead })` suit un personnage qui marche, court, tombe ;
  `track(posAt, f, offset)` accompagne un objet (bateau, charrette, train) ; `orbit(centre, f, f0, { r, h, speed })` révèle un lieu ;
  `shake(cam, f, f0, amp, durée)` pour un choc, un éclair, une explosion.
- **Actions** (`engine/motion.js`, à fusionner dans l'objet acteur) : `hop` (saut avec écrasement et étirement : `dy`, `sx`, `sy`),
  `fallOver` (chute avec rebond : `roll`), `run` (course : `step` pour les jambes avec `run: true`, `bob`, `tilt`), `tremble`, `rock`
  (tangage d'un bateau), `popIn`. L'acteur accepte maintenant `dx`, `dy`, `sx`, `sy`, `roll` ; l'ombre au sol suit (rétrécit en l'air, s'allonge à terre).
- **Transitions** (`engine/motion.js`) : `transition(type, camA, camB, f, f0, n)` avec `type` = `'whip'`, `'rise'`, `'drop'` ou `'push'`,
  `camA` = la caméra de fin du plan qui part (figée à `f0`), `camB` = celle du début du plan qui arrive (à `f0 + n`), n = 10 à 14 images.
  Place la limite entre les deux plans au milieu de la transition : le changement de lieu est caché par la vitesse et le flou de mouvement
  (la caméra peut porter `mblur: [dx, dy]` en pixels ou `zoomBlur` 0-1 n'importe quand, pour tout mouvement très rapide).
- **Signes de dessin animé automatiques** (`engine/marks.js`) : le moteur ajoute seul un « ! » sur `shock`, un « ? » sur `squint`,
  des gouttes de sueur sur `nervous` / `pained`, une veine de colère sur `stern` / `stubborn`, des étoiles qui tournent sur `dazed`
  ou un personnage tombé, et des lignes de vitesse derrière un personnage qui court. Forcer un signe : `mark: 'bang' | 'question' | 'sweat' |
  'anger' | 'stars' | 'speed' | 'heart' | 'note'` dans l'acteur ; en retirer : `marks: false` ; tout couper pour un épisode : `export const MARKS = false`.
- **Poses d'action** (`engine/roman.js`) : en plus de `point`, `up`, `reach`, `lift`, `wave`... : `carry` (porter devant soi),
  `push` (pousser), `head` (mains sur la tête, panique), `flail` (bras qui moulinent, avec `wv` qui avance), et `run: true` pour de grandes foulées.

## Structure du dépôt
```
engine/            moteur three.js (main.js piloté par l'épisode, motion.js = caméra + actions, paint.js, roman.js = casting,
                   fx3d.js = effets 3D, moods.js = ambiances, marks.js = signes de dessin animé)
engine/library/    décors réutilisables : paris.js (rue + faux Paris), rails.js (voie dans les ocres + chantier d'hiver)
episodes/<slug>/   un épisode : voice.wav, script.txt, words.json, phrases.json, audio.py, web/world.js, web/story.js
inbox/<slug>/      dépôt de l'utilisateur : voice.wav (ou .mp3) + script.txt (+ sujet.txt facultatif)
tools/             setup.sh, timing.py, render.mjs, sheet.py, synth.py, mix.py, subs.py, finish.sh, tts.py, qa.py (contrôle qualité),
                   events.mjs + autosfx.py (bruitages automatiques)
episodes/_demo-fx/ démonstration des effets, ambiances, caméras et actions (pas un épisode publié)
brand/             logo, bannière, filigrane (make_brand.py)
example/soldier/   l'exemple d'origine du kit (ancien format, à lire pour la méthode)
```
Les fichiers générés (`engine/lib/`, `engine/toonbase.js`, `engine/toon.js`, images, wav de mixage, mp4) ne sont pas versionnés.

## Fabriquer un épisode (ce que fait le workflow `video.yml`)
1. `bash tools/setup.sh` (une fois).
2. Créer `episodes/<slug>/` à partir de `inbox/<slug>/` : copier la voix en `voice.wav` (convertir avec ffmpeg si besoin) et `script.txt`.
3. Timing : `python3 tools/timing.py episodes/<slug>/voice.wav episodes/<slug>/script.txt --out episodes/<slug>`
   (faster-whisper s'il est installé, sinon alignement sur les silences). Vérifier `phrases.json`. TOTAL = round(durée × 30).
   **`phrases.json` doit dire `"source": "whisper"`.** L'alignement sur les silences (`silence-align`) décale les sous-titres
   dès que la voix marque des pauses : dans ce cas, n'écris pas l'épisode, mets le message de timing.py dans
   `episodes/<slug>/PROBLEME.md`, commite et arrête-toi (pas de vidéo vaut mieux qu'une vidéo désynchronisée).
4. Décor : réutiliser une bibliothèque de `engine/library/` si elle convient, sinon en écrire une nouvelle dans le même style
   (`export function buildXxx(ctx)` qui retourne `{ DECK, clouds, state(S, f), onLight }`). `web/world.js` l'importe depuis `'../library/xxx.js'`.
   **Habillage obligatoire** avec le kit d'objets `engine/library/props.js` (`const K = propKit(ctx, { seed })` dans `web/world.js`) :
   pour CHAQUE plan avec des personnages, place 8 à 15 objets **dans le champ, derrière eux** avec `K.backdrop(position, yaw du plan, { kinds, n })`
   ou à la main (`tree`, `poplar`, `bush`, `rock`, `bench`, `lamp`, `crate`, `barrel`, `sack`, `fence`, `stall`, `sign`, `pot`, `cafe`),
   et couvre les sols nus avec `K.verge(...)` (herbes, fleurs, cailloux). Jamais de sol vide ni de fond vide derrière un personnage.
   Choisis des objets qui racontent le lieu et l'époque (étal de marché, panneau avec un nom de ville, tonneaux, café...).
5. **Plan de tournage d'abord** : écris `episodes/<slug>/PLAN.md`, un tableau avec une ligne par phrase :
   `images | phrase | ce qu'on VOIT se passer (action) | caméra | ambiance | effet 3D | bruitage`. Relis-le avec la règle n°1
   (accroche visuelle à 0-2 s, une action visible par phrase, enjeu montré, un héros, objet clé en gros plan, fin qui reboucle)
   avant d'écrire le code. `PLAN.md` est commité avec l'épisode.
6. `web/story.js` : exporte `TOTAL, DECK, SHOTS, shotAt, lightFor, camAt, dofAt, worldAt, setupCast, actorsAt, fxAt` (+ `envAt` pour les effets 3D)
   (modèle : `episodes/2026-11-19-rails-chauffes/web/story.js`). Imports depuis `'../motion.js'`. Un plan par phrase, cadres avec `frameOn`.
   Les tenues se déclarent dans `setupCast(T)` (`T.OUTFITS.<id> = { tunic, skin, cap, hair, moustache, apron, stout... }`).
7. **Contrôle images fixes (obligatoire)** : `CHROME=/usr/bin/google-chrome node tools/render.mjs episodes/<slug> /tmp/stills "<milieu de chaque plan>"`
   puis `python3 tools/sheet.py /tmp/stills episodes/<slug>/stills.jpg 8`. Lire la planche avec Read et corriger :
   caméra dans un décor, personnage coupé au bord, personnage trop petit, image sombre, train ou objet attendu invisible,
   et **le test sans le son** : en lisant seulement la planche, dans l'ordre, comprend-on l'histoire ? L'action de chaque phrase se voit-elle ?
   Recommencer jusqu'à ce que la planche soit propre. La planche `stills.jpg` est commitée.
8. `audio.py` (musique + bruitages qui comptent pour l'histoire : sting du pivot, son d'un objet précis ; modèle dans l'épisode des rails ;
   `from synth import *`, `music, sfx = init(DUR)`). **Les bruitages de mouvement sont automatiques** : `tools/events.mjs` lit story.js
   (changements de plan, transitions, mouvements de caméra rapides, chocs, apparitions, sauts, atterrissages, chutes, pas de course, « ! »,
   éclairs, gerbes, étincelles, fumée, pluie, mer, vent, feu) et `tools/autosfx.py` pose le son correspondant (synth.py : `pop`, `boing`,
   `thud`, `bonk`, `swish`, `gasp`, `step_tap`, `thunder`, `crackle`, `rain_loop`, `sea_loop`, `wind_loop`...), sauf là où audio.py en a déjà mis un.
   Désactiver : `"autoSfx": false` dans meta.json.
   Tester : `python3 tools/run_audio.py episodes/<slug> && node tools/events.mjs episodes/<slug> && python3 tools/autosfx.py episodes/<slug>
   && (cd episodes/<slug> && python3 ../../tools/mix.py voice.wav music.wav sfx.wav)`.
9. Écrire `episodes/<slug>/meta.json` : `{ "slug", "total": <images>, "title": "<titre court>", "youtube_title", "description", "hashtags", "tiktok" }`
   (titre ≤ 45 caractères, un seul mot en majuscules, description courte + « Pourkoipa ? 🤔 », hashtags #pourkoipa + 5-7 pertinents + #shorts).
10. Commiter l'épisode. **Le rendu complet et la finition ne sont pas faits par toi** : les jobs `render` (en parallèle) et `finish` du workflow s'en chargent.
    La finition lance `tools/qa.py`, qui écrit `out/QA.md` (durée, mots, ouverture, plan, effets, musique, images figées, images sombres).

## Deux formats : « Histoire vraie » et « Vie quotidienne »
La chaîne alterne deux formats. **Jamais deux fois de suite le même** : regarde le format du dernier script (`NOTES.md`, ligne « Format : »).
- **Histoire vraie** (le format historique) : un fait réel et surprenant, vérifié, daté, sourcé (voir « Diversité des sujets »).
- **Vie quotidienne** (nouveau) : une petite histoire **inventée** de la vie de tous les jours, qui touche une émotion que tout le monde connaît
  (la honte, la fierté, la jalousie, l'injustice, la gentillesse qu'on ne voit pas, l'amitié, le regret, la persévérance) et qui finit
  sur une leçon qui **parle au spectateur** (« toi »). Lieux de tous les jours : école, bureau, chantier, cuisine, marché, bus, café, famille.
  - Structure : 1) une situation qu'on reconnaît tout de suite, avec un enjeu (« Tout le monde se moquait de lui parce que… ») ;
    2) deux ou trois moments qui montent ; 3) le retournement (« Sauf que… ») ; 4) la leçon en une phrase, tournée vers toi,
    qui renvoie à la première image.
  - **Deux ou trois personnages, pas plus**, avec des prénoms simples et des rôles clairs (le nouveau, la cheffe, le grand frère...).
  - **C'est une fiction : ne jamais la présenter comme vraie.** Pas de date, pas de lieu réel précis, pas de « histoire vraie »,
    pas de faux chiffres ni de fausse étude. Pas de personne réelle. Pas de sujets graves traités à la légère (maladie, deuil, violence,
    harcèlement grave, suicide) : on reste sur des émotions du quotidien, avec de la bienveillance.
  - Le titre parle au spectateur et promet une émotion ou une leçon (« Il a aidé tout le monde… sauf lui-même »), sans reprendre
    les titres ni les histoires d'autres chaînes (règle 100 % original : on prend l'idée d'une émotion, jamais une histoire existante).
  - Tout le reste ne change pas : règle n°1 (on comprend sans le son), 110-130 mots, une action visible par phrase, fin qui reboucle.
    Les émotions se jouent à l'image : expressions franches, signes automatiques (sueur, « ! », cœur), lumière qui passe du gris (`froid`, `soir`)
    au chaud (`dore`) au moment du retournement.
- Les « Histoire vraie » peuvent elles aussi **parler au spectateur** : la dernière phrase relie le fait à sa vie
  (« La prochaine fois qu'on te dit que c'est impossible… »).

## Idées et scripts (workflow `idees.yml`)
- Formule du script : accroche paradoxale dès la 1re phrase, 2-3 détails qui montent, pivot « Sauf que… » / « En fait… », chute ironique au dernier mot,
  qui renvoie à la première phrase (boucle).
  **110 à 130 mots** (la voix Riko lit ~2,6 mots/s : 120 mots ≈ 46 s ; au-delà de 50 s, la vidéo est trop longue), phrases de 8-15 mots,
  nombres écrits en lettres, aucun texte qui décrit ce qu'on voit déjà.
- **La 1re phrase ne commence jamais par une date ni par du contexte** (« En 1823… », « Au XIXe siècle… ») : la surprise d'abord,
  la date ensuite. Ex. : « Ce phare voit plus loin… parce qu'on lui a enlevé du verre. C'était en 1823. »
- Écris des phrases **qu'on peut montrer** : un verbe d'action concret par phrase (porter, couler, exploser, couper, courir), pas des idées abstraites.
- Sujets qui marchent : un fait vrai qui a l'air faux, avec une cause physique qu'on peut montrer, un lieu français reconnaissable si possible.
- Écrire `inbox/<slug>/script.txt` (texte à lire seul) et `inbox/<slug>/NOTES.md` (ligne « Format : Histoire vraie » ou « Format : Vie quotidienne », sources pour une histoire vraie, conseils d'enregistrement : voix Riko de Google AI Studio,
  et un **plan visuel** : pour chaque phrase, l'action qu'on verra, l'ambiance et l'effet ; l'image d'accroche des 2 premières secondes ; le héros).

## Retouches (workflow `claude.yml`, quand on te mentionne avec @claude)
- Modifie l'épisode concerné (story.js, audio.py, décor), refais le contrôle images fixes, commite et pousse,
  puis relance le rendu sans refaire la réalisation : `gh workflow run video.yml -f slug=<slug>` (l'épisode existe déjà : le workflow refait seulement le rendu).
- Réponds dans l'issue avec ce que tu as changé et le lien vers les Actions.

## Diversité des sujets (à vérifier avant de choisir)
- Cette section s'applique au format **Histoire vraie**. Pour **Vie quotidienne**, varie l'émotion, le lieu (école, bureau, famille...)
  et les personnages d'un épisode à l'autre.
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
