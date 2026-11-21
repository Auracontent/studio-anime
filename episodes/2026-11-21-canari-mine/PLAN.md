# Plan de tournage : « Le canari de la mine » (45,76 s, 1373 images, 30 i/s)
Héros : le mineur gallois moustachu (veste orange, casque jaune à lampe). Secondaires : le mineur turquoise, Haldane (blouse blanche, barbe rousse). Figurants : un rouge, un violet.
Objet clé : la cage du canari (gros plan à l'accroche et aux phrases 8-9), qui change d'état : perché -> vacille -> tombe -> dort -> reçoit l'oxygène -> se réveille.
Test sans le son : l'oiseau tombe -> le gaz rampe, un mineur s'endort -> explosion -> Haldane a une idée -> l'oiseau respire plus vite et tombe -> les mineurs fuient -> la bouteille d'oxygène se fixe à la cage -> l'oiseau se réveille -> ils sortent au soleil -> « 1986 » -> la boucle.

| images | phrase | ce qu'on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-124 | Ce petit canari descendait dans la mine pour s'évanouir avant tout le monde. | ACCROCHE : gros plan sur la cage, le canari vacille, tombe du perchoir, yeux en spirale ; le héros crie « ! » | `frameOn` yaw -18 -> -10, cage en premier plan | lampe | brume verte au sol, poussière | ting, chute (bonk) |
| 125-245 | Au fond des galeries, un gaz invisible se glissait entre les mineurs. | trois mineurs piochent, des nappes vertes rampent au sol entre eux | `frameTwo` qui glisse de -12 à +14 (whip depuis l'accroche) | lampe | smoke vert x6 | souffle doux, swish |
| 246-370 | Le monoxyde de carbone endormait les hommes sans qu'ils sentent rien. | le mineur turquoise bâille, s'affaisse (`snore`), le héros le retient, choqué | `frameTwo` yaw -22 -> 8 (push) | lampe | gaz vert | ronflement |
| 371-416 | Après une explosion, | souffle orange dans la galerie, flash, éclats, un mineur est projeté (`fallOver`), les autres se protègent (`head`) | plan large le long de la galerie (headW 0,10), `shake` | lampe + flash | sparks, spray, smoke noir, embers | boom, grondement, éboulement |
| 417-535 | un savant écossais, John Haldane, a eu une idée simple. | Haldane (barbe rousse) devant les gravats, lève le doigt, ampoule ; le héros le regarde | `frameTwo` yaw -26 -> 4 | lampe | embers, poussière | ting (idée) |
| 536-655 | Un oiseau respire très vite, alors le poison l'atteint bien avant nous. | le héros tient la cage : respiration rapide du canari (courbe orange) vs lente de l'homme (courbe turquoise) ; le gaz arrive à la cage, le canari vacille | `frameOn` yaw 4 -> -10, cage au premier plan | lampe | gaz vert qui avance | tic-tic rapide |
| 656-702 | Quand le canari vacillait, | gros plan : le canari tangue, tombe, yeux en spirale ; le héros « ! » | `frameOn` yaw -10, push | lampe | gaz | bonk |
| 703-800 | les mineurs lâchaient leurs pioches et couraient vers la sortie. | 4 mineurs jettent leurs pioches (cartes qui tombent) et courent vers la lumière du fond, le héros emporte la cage | `follow` du héros (headW 0,17) | lampe | poussière de course, lignes de vitesse auto | sting, pioches, pas |
| 801-890 | Sauf que… le plus étonnant, c'est la suite. | PIVOT : le héros s'arrête, sourit à la caméra, cage au bras ; le canari dort | `frameOn` yaw -24, coup de caméra | lampe | - | sting |
| 891-1010 | Ils ont inventé une minuscule cage avec une bouteille d'oxygène. | GROS PLAN OBJET : la cage remplit le cadre, la bouteille « O₂ » glisse et se fixe par un tuyau ; Z-Z du canari endormi | caméra serrée sur la cage (d 3,7) puis recule sur les 2 mineurs | lampe | - | clic, grincement, choc |
| 1011-1125 | Un tour de valve, et le canari se réveille, prêt à repartir. | la molette rouge tourne, jet blanc d'oxygène, le canari se redresse, bat des ailes, chante ; les mineurs sautent de joie | caméra sur la cage (d 3,5 -> 3,2) | lampe -> doré | smoke blanc (jet) | clics, pssht, ting, chant |
| 1126-1229 | Cette sentinelle a travaillé en Angleterre | les mineurs sortent de la galerie vers la lumière dorée, le canari en tête | `frameOn` yaw -30 -> -10, travelling | doré | poussière | pas |
| 1230-1300 | jusqu'en mille neuf cent quatre-vingt-six. | plan large spectaculaire : bouche de mine, chevalement, collines ; carte « 1986 » | grue lente vers le chevalement | doré | - | ting |
| 1301-1372 | Le premier à tomber dans la mine était toujours le premier qu'on sauvait. | BOUCLE : même cadrage que l'accroche, canari réveillé et chantant dans la cage, héros souriant | `frameOn` yaw -18 -> -10 | doré | note | chant |

Transitions (caméra qui voyage, pas de coupe) : `whip`, `push`, `rise`, `drop` de 10 images entre tous les plans.
