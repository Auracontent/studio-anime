# PLAN.md — « Zoé et le vélo » (fiction du quotidien, format Vie quotidienne)
Héroïne : **Zoé** (pull rouge, nattes, peau brune). Secondaire : **Malo**, le grand frère (sweat turquoise, casquette, grand et maigre). Figurants : 3 élèves (jaune, vert pomme, orange) puis une foule.
Fiction inventée, jamais présentée comme vraie. Émotion : la persévérance face à la moquerie, la honte qui devient fierté.
Accroche 0-2 s : gros plan de Zoé sur son vélo, la roue avant vrille, elle est projetée (`fallOver`, étoiles), un élève jaune rit derrière. Fin = même plan, Zoé tombe doucement, se relève, remonte et repart.
Voix : 44,4 s (1331 images), non modifiée (`phrases.json` : whisper). Décor neuf : `engine/library/ecole.js` (cour, école en briques, préau, immeuble, balcon, marelle). Nouveautés moteur : coiffure `braids` (nattes), roue tordue `bent` (route.js).
Tout le monde roule vers la gauche (-x). Lumière : `jour` -> `soir` (le travail en silence) -> `nuit` bleue (la fenêtre) -> `dore` (Malo) -> `jour` (fierté).

| images | phrase | ce qu'on VOIT se passer | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-64 | Zoé tombe de son vélo, encore une fois, | Zoé roule en zigzag, la roue vrille, elle vole et s'écrase (étoiles), le vélo se cabre ; un élève rit | `follow` gros plan, `shake` au choc | `jour` | poussière | thud, boing |
| 65-114 | devant toute l'école. | Les 3 élèves passent à vélo en riant autour de Zoé à terre | `crane` du gros plan au très large (l'école, l'immeuble) | `jour` | poussière | rires |
| 115-157 | Les autres roulent déjà. Ils rient, | L'élève jaune roule en riant, Zoé à terre derrière | `follow` plan à deux | `jour` | — | swish |
| 158-214 | et elle serre les poings. | Zoé se relève, poing levé, veine de colère ; les autres passent derrière | contre-plongée, feuille floue au premier plan | `jour` | — | — |
| 215-265 | Alors, chaque soir, quand la cour est vide, | Cour vide au soleil couchant ; Zoé pousse son vélo cabossé | `rise` puis `crane` du ciel vers elle | `soir` | poussière | pas |
| 266-297 | elle recommence. | Elle saute en selle, `determined`, pédale | `follow` contre-plongée | `soir` | poussière | pop |
| 298-325 | Une chute. | Elle roule, tombe (étoiles) ; carte « 1 » | `follow`, `shake` | `soir` | gravillons | thud |
| 326-360 | Deux chutes. | Elle se relève, remonte, retombe ; carte « 2 » | `follow` | `soir` | gravillons | thud |
| 361-394 | Dix chutes, | Trois chutes d'affilée ; compteur qui monte jusqu'à « 10 » | `follow` incliné (`dutch`) | `soir` | gravillons, fumée | thud x3 |
| 395-426 | le genou rouge, | Zoé assise grimace ; carte du genou écorché + pansement | gros plan | `soir` | — | pop |
| 427-472 | la roue tordue. | Gros plan de la roue voilée que Zoé redresse ; clé floue au premier plan | travelling bas sur la roue | `soir` | étincelles | clac |
| 473-522 | Son grand frère Malo la regarde par la fenêtre. | Très large : l'immeuble, la fenêtre s'allume ; Malo sur le balcon, Zoé retombe en bas | `rise` puis `crane` du large vers Malo | `soir` -> `nuit` bleue | poussière | sting léger |
| 523-549 | Lui aussi, | Malo, bras croisés, `pained` | gros plan, léger recul | `nuit` | — | — |
| 550-579 | il riait. | Retour en arrière, plein jour : Malo `smug` puis `laugh` avec deux élèves, Zoé à terre au fond | `push` puis contre-plongée | `jour` | — | rires |
| 580-613 | Sauf que ce soir-là, | Malo sur le balcon : `pained` -> `determined` | `whip` puis gros plan en contre-plongée | `nuit` | — | **sting** |
| 614-648 | il descend. | La porte s'ouvre, Malo sprinte dans la cour | `whip`, `follow` | `nuit` -> `dore` | rayon de soleil | pas rapides |
| 649-735 | Il tient la selle et court derrière elle. | Zoé pédale, Malo court derrière en tenant la selle ; puis plan large des deux silhouettes | `follow` puis plan large | `dore` | rayon, poussière | pas |
| 736-780 | Il lâche. | Malo lève les mains, `grin`, cœur ; le vélo s'éloigne seul | gros plan Malo -> `track` du vélo | `dore` | rayon | ting |
| 781-832 | Zoé roule seule, | Zoé file, droite, lignes de vitesse | `follow` latéral | `dore` | vent, rayon | swish |
| 833-870 | toute droite, | Le vélo arrive de face, droit | `follow` de face, contre-plongée | `dore` | vent | swish |
| 871-916 | le vent dans le visage, | Gros plan : elle rit, nattes au vent | `follow` gros plan | `dore` | vent, poussière | vent |
| 917-946 | sans s'en rendre compte. | Malo, minuscule au loin, bras en l'air et cœur ; Zoé continue | plan large qui glisse | `dore` | vent | ting |
| 947-996 | Le lendemain, | La cour en plein jour, toute l'école alignée, bouches ouvertes | `whip` puis `crane` | `jour` | — | foule |
| 997-1044 | toute l'école la regarde passer. | Zoé passe, sonnette « Dring ! », la foule suit des yeux | `follow` | `jour` | — | sonnette |
| 1045-1093 | Plus personne ne rit. | Les trois moqueurs passent de `laugh` à `shock` / `pained` | plan fixe qui monte (contre-plongée) | `jour` | — | gasp |
| 1094-1137 | Tu sais ce que ça prouve ? | Zoé `proud`, regard vers nous ; feuille floue | contre-plongée | `jour` | — | — |
| 1138-1195 | On ne tombe pas parce qu'on est nul. | Zoé poing levé, Malo pouce levé, tous deux rient | plan à deux | `jour` | — | — |
| 1196-1249 | On tombe pour apprendre. | Zoé tourne en rond autour de Malo qui applaudit | survol latéral | `jour` -> `dore` | rayon | piano |
| 1250-1330 | Alors, la prochaine fois que tu tombes, relève-toi une fois de plus. | `push` : même cadre que l'accroche ; elle tombe, se relève, remonte et repart exactement comme au début | `follow`, `shake` au choc | `jour` | gravillons | thud, pop |

Contrôle règle n°1 : accroche visuelle dès la 1re image, une action par phrase, enjeu montré (chutes, moqueries, foule), un héros suivi (Zoé), objet clé en gros plan (vélo, roue, selle, genou), fin qui reboucle. La mascotte entre à gauche : Zoé reste à droite du cadre pendant ces 1,6 s.
