# PLAN.md — « La lumière du bureau » (fiction du quotidien, format Vie quotidienne)
Héros : **Karim** (pull moutarde, peau mate, barbe courte). Secondaire : **Léa**, la cheffe (violet). Figurants : Sam (turquoise, lunettes) et Jo (orange, moustache).
Fiction inventée, jamais présentée comme vraie. Émotion : la gentillesse qu'on ne voit pas, la reconnaissance qui arrive trop tard.
Accroche 0-2 s : gros plan sur l'interrupteur géant dans un bureau bleu nuit, Karim (mug en main) tend le bras ; clac, les néons s'allument rangée par rangée.
Fin = même plan (Léa devant le même interrupteur, même bureau qui s'allume) : la dernière image renvoie à la première.
Voix : 39,4 s (1181 images), non modifiée. Décor neuf : `engine/library/bureau.js` (open space + chambre). Nouveaux accessoires : arrosoir (`can`), mug froid (`mugCold`).

| images | phrase | ce qu'on VOIT se passer | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-95 | Tous les matins, avant tout le monde, quelqu'un allume les lumières du bureau. | Karim, mug en main, tend le bras vers l'interrupteur (bleu glacé) ; clac, les 4 rangées de néons s'allument, fenêtres et écrans aussi ; recul vers le plan large | gros plan interrupteur -> recul spectaculaire | `nuit` -> `jour` | étincelles au clac, rayon de soleil, poussière | clac + néons (auto) |
| 96-135 | C'est Karim. | Karim marche, sourit, mug en main ; carte « Karim » | `follow` gros plan | `jour` | poussière | pop |
| 136-163 | Il lance la cafetière, | Karim appuie sur le bouton, le café coule dans la verseuse (niveau qui monte), vapeur | plan à deux, objet clé | `jour` | vapeur, gouttes | pop, glouglou |
| 164-205 | arrose la plante | Karim verse l'arrosoir sur la plante (3 jets d'eau) | plan à deux | `jour` | gerbes d'eau | auto |
| 206-255 | et débloque l'imprimante. | Karim tape l'imprimante coincée (secousse, étincelles, éclair « bam »), elle repart et sort des feuilles | plan à deux, tremblement caméra | `jour` | étincelles | bonk, imprimante |
| 256-294 | Personne ne dit merci. | Sam et Jo passent devant Karim, mug en main, sans le regarder ; Karim fait coucou (« Salut ! ») puis baisse le bras, `pained` | plan à trois | `jour` | poussière | pop |
| 295-330 | Pire, on se moque de lui, | Sam et Jo se retournent, rient et le montrent du doigt ; Karim goutte de sueur | même plan, léger choc | `jour` | poussière | rires (auto) |
| 331-378 | parce qu'il arrive trop tôt. | l'horloge murale (6 h pile) au-dessus des moqueurs ; carte « 6 h » ; Karim gêné | plan serré horloge + trois personnages | `jour` | poussière | pop |
| 379-430 | Un lundi, Karim est malade. Il ne vient pas. | Karim au lit, mouchoirs partout, frissonne, éternue (carte « LUNDI », « ATCHOUM ! ») | `drop` vers la chambre, gros plan | `froid` | poussière | atchoum |
| 431-465 | (la chaise vide) | `rise` : chaise jaune vide qui balance, mug de Karim froid sur son bureau, puis panoramique sur la porte qui reste fermée | travelling bas -> panoramique | `froid`/`nuit`, néons éteints | vapeur très faible | silence, grincement |
| 466-536 | Le bureau reste sombre et glacé. | plan large spectaculaire de l'open space éteint ; Sam et Jo entrent en grelottant, buée | plan large -> recul -> plan à deux | `froid`+`nuit` | buée, poussière | vent |
| 537-569 | Le café est froid, | cafetière éteinte, Sam avec un mug froid, grelotte (« Brrr… ») | plan à deux sur la cafetière | `froid` | buée | pop |
| 570-595 | la plante penche, | la plante se fane sous nos yeux (feuilles qui tombent, jaunissent), Jo se prend la joue | plan bas gros plan plante | `froid` | poussière | craquement |
| 596-650 | l'imprimante grince. | imprimante secouée, voyant rouge clignote, boules de papier froissé s'accumulent ; Sam panique | gros plan imprimante, secousses | `froid` | étincelles rouges, fumée | grincement |
| 651-711 | Sauf que Léa, la cheffe, comprend. | `whip` sur Léa, bras croisés, qui regarde le bureau sombre ; sur « comprend » : `shock`, « ! », secousse caméra | gros plan Léa | `froid` | poussière | **sting** sur « Sauf que » |
| 712-756 | Elle repense à cette lumière, | Léa, main sur la joue, regard perdu, esquisse un sourire ; la lumière se réchauffe | gros plan | `froid` -> `matin` | poussière | piano |
| 757-824 | allumée chaque matin, depuis des années. | `push` : flash-back, Karim allume trois fois de suite l'interrupteur (3 jours), les néons s'allument à chaque fois | gros plan interrupteur, push-in | `matin` | étincelles, rayon | clac x3 |
| 825-896 | Le lendemain, elle arrive à six heures, | `whip` : Léa franchit la porte dans la nuit bleue, mug en main, carte « 6 h » | `follow` | `nuit` | poussière | pas, porte |
| 897-935 | allume les lumières | Léa à l'interrupteur : clac, rangées de néons, la pièce passe au doré, recul vers le plan large | gros plan -> recul | `nuit` -> `dore` | étincelles, rayon | clac |
| 936-990 | et pose un café sur son bureau. | gros plan : Léa pose le mug fumant sur le bureau de Karim, à côté de la chaise jaune | plan rapproché objet clé | `dore` | vapeur | tintement |
| 991-1035 | Ce que tu fais en silence, | `whip` : Karim arrive, voit les lumières et le mug : `shock` puis `grin`, cœur | `follow` | `dore` | vapeur | pop |
| 1036-1093 | on ne le voit qu'une fois que tu t'arrêtes. | Karim (mug, cœur) et Léa (pouce levé) ; Sam et Jo gênés derrière | plan à deux, orbite lente | `dore` | étincelles dorées | piano |
| 1094-1180 | Alors, aujourd'hui, allume une lumière pour quelqu'un. | `push` : nouveau matin bleu, Léa devant le même interrupteur ; clac, tout s'éclaire ; pouce levé vers nous | même cadre que l'accroche | `nuit` -> `jour` | étincelles, rayon | clac |

Contrôle règle n°1 : accroche visuelle dès la 1re image, une action visible par phrase, enjeu montré (bureau glacé, plante qui meurt, imprimante en panne), un héros suivi (Karim), objets clés en gros plan (interrupteur, cafetière, plante, imprimante, mug), fin qui reboucle.
