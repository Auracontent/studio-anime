# PLAN.md — « Le bouton piéton qui ne fait rien » (format Histoire vraie, série La science qu'on peut voir)
Héroïne : **Inès**, femme pressée en manteau rouge vif, écharpe jaune. Secondaires : **Léon** (gilet moutarde, casquette grise, qui n'appuie jamais) et **Marc** (technicien, gilet orange, casque jaune). Figurants : piétons colorés, un second ouvrier, taxis jaunes sans inscription, et une chercheuse anonyme en blouse (jamais nommée à l'image).
Voix : 122,1 s (3664 images), non modifiée (`phrases.json` : whisper). Décor neuf : `engine/library/carrefour.js` (avenue new-yorkaise, passage rayé, poteaux à bouton, bonhomme rouge/vert, feux, taxis simulés qui s'arrêtent quand le bonhomme est vert, campus au soleil à x = 300, poteau ouvert en coupe à x = 5000 avec fil débranché et horloge). Nouveautés moteur : casque de chantier `hardhat`, accessoires tenus `button`, `notebook`, `wire`.
Accroche 0-2 s : gros plan, le bouton métallique (carte `fgCard`) remplit le bas du cadre et est martelé (il s'écrase, la caméra tremble à chaque appui), Inès en `nervous` juste derrière, taxis jaunes qui filent, lumière chaude. Fin = même cadrage : la caméra revient seule sur Inès qui appuie une dernière fois (boucle).
Lumière : `jour` -> `dore` (elle croit avoir gagné) -> `jour` (Sauf que) -> `matin` (les chiffres de 2004) -> `jour` (campus) -> `dore` (le bouton change quelque chose en toi) -> `nuit` (les boutons qui marchent) -> `dore` -> `jour`.

| images | phrase | ce qu'on VOIT se passer | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-147 | Ce bouton que tu écrases… ne fait peut-être rien du tout. | Le bouton (gros plan flou) est martelé, Inès nerveuse derrière, taxis qui filent | orbite lente + `shake` à chaque appui, contre-plongée | jour | poussière | clics répétés |
| 148-239 | Imagine un carrefour de New York, en pleine heure de pointe. | Survol de l'avenue : taxis, foule sur les trottoirs, carte « NEW YORK », vapeur orange et blanc | `crane` du très large au plan moyen | jour | vapeur | pop |
| 240-301 | Une femme pressée arrive devant le feu. | Inès arrive en courant (bras qui moulinent) jusqu'au poteau, Léon attend calmement | `follow` en contre-plongée (après `whip`) | jour | — | pas de course auto |
| 302-342 | Elle appuie sur le bouton. | Elle appuie, le bouton flou s'écrase, le bonhomme rouge derrière | gros plan contre-plongée | jour | — | clic |
| 343-429 | Une fois, deux fois, trois fois. | Trois appuis : cartes « 1 », « 2 », « 3 » qui popent, la caméra se rapproche et penche (`dutch`), la sueur monte | `shake` à chaque appui, push-in | jour | — | clic + pop x3 |
| 430-467 | Elle tape du pied. | Elle trépigne (petits sauts), Léon impassible à côté | contre-plongée très basse | jour | — | pas |
| 468-526 | Puis le bonhomme passe au vert. | Gros plan sur le signal : le bonhomme rouge devient vert, les voitures freinent ; Inès lève le poing et saute | caméra qui monte du signal vers elle | jour -> dore | — | ting |
| 527-617 | Elle traverse, persuadée d'avoir gagné. | Elle traverse le passage, poing levé, fière ; Léon traverse sans avoir touché au bouton ; piétons de fond ; voitures arrêtées | `follow` (après `push`) | dore | — | pas |
| 618-682 | Sauf qu'elle n'a rien gagné du tout. | De l'autre côté, Inès se fige, `shock` puis `squint` (« ? ») et hausse les épaules, vue de dos au feu | plan penché `dutch` (sting) | jour | — | sting + gasp |
| 683-757 | Le feu allait passer au vert de toute façon. | Une carte-minuteur (secteurs rouge / vert, aiguille qui tourne) flotte au-dessus du passage ; le feu repasse au vert tout seul et Léon traverse sans appuyer | `crane` après `rise` | jour | — | pop, ting |
| 758-845 | Pour comprendre, il faut regarder ce que la ville a fait de ses boutons. | Poteau ouvert en coupe : Marc le technicien réfléchit (`chin`), un fil débranché pend dans le vide devant le bouton ; horloge au mur | `crane` du large vers le poteau (après `drop`) | jour clair | — | — |
| 846-885 | À New York, | Travelling le long de l'avenue : une rangée de poteaux identiques, chacun avec son bouton ; Marc porte un bouton | `whip` puis travelling | jour | — | swish |
| 886-959 | des milliers de boutons ont été posés pour que les piétons commandent eux-mêmes le feu. | Marc visse un bouton (étincelle verte), son collègue Jo en visse un autre ; des dizaines de poteaux en enfilade | plan à deux | jour | étincelles vertes | clics, tings |
| 960-1012 | (suite) commandent eux-mêmes le feu. | Une piétonne appuie, le bonhomme passe au vert aussitôt, les voitures s'arrêtent | plan à deux | jour | — | clic + ting |
| 1013-1057 | Au début, ils marchaient vraiment. | Un piéton appuie : coche verte, le bonhomme est vert tout de suite | plan moyen, bouton flou | jour | — | clic, ting, pop |
| 1058-1114 | Puis sont arrivés les cycles minutés. | Poteau en coupe : la grande horloge s'emballe, Marc la montre du doigt | push sur l'horloge puis `orbit` | jour clair | — | tic-tac |
| 1115-1159 | Le feu change à heure fixe, | Vue haute : le feu passe au vert tout seul, la foule traverse sans toucher à rien | `crane` (après `whip`) | jour | — | ting |
| 1160-1212 | que quelqu'un appuie ou non. | Un piéton appuie, un autre non : les deux attendent, le feu passe au vert pour les deux en même temps | plan à deux | jour | — | clic, ting |
| 1213-1255 | Alors, que fait la ville ? | Marc, la main sur le menton, regarde le bouton (`squint`, « ? ») | push-in | jour clair | — | — |
| 1256-1327 | Elle les débranche. Un par un. | Marc arrache le fil du bouton : étincelle, croix rouge, le fil pend | gros plan sur la borne + `shake` | jour clair | étincelles | snap + crépitement |
| 1328-1379 | Mais elle ne les enlève pas. | Marc remet son outil sur l'épaule et s'en va, le poteau et son bouton restent | plan à deux | jour clair | — | pas |
| 1380-1401 | Pourquoi ? | Marc hausse les épaules (`shrug`), Inès (retournée) l'observe méfiante, plan penché | `whip`, contre-plongée `dutch` | jour | — | — |
| 1402-1446 | Parce qu'arracher un bouton, | Marc et Jo tirent le poteau de toutes leurs forces (`push`, ils tremblent), poussière du trottoir | plan à deux (après `drop`) | jour | gerbe de poussière | thud |
| 1447-1477 | reboucher le trou, | Marc rebouche à la pelle, terre qui vole | plan moyen | jour | gerbes de terre | thuds |
| 1478-1519 | remettre la rue en état, | Jo porte une dalle, Marc montre l'endroit du doigt | plan à deux | jour | — | — |
| 1520-1556 | tout cela coûtait cher, | Marc compte des liasses de billets, mine sévère ; carte « $ » qui danse | contre-plongée | jour | — | ting |
| 1557-1631 | multiplié par des milliers de carrefours. | Le plan recule très haut : toute l'avenue et ses poteaux alignés à perte de vue | `crane` qui recule (après `rise`) | jour | — | — |
| 1632-1705 | Alors on les a laissés là, bien en place, | Travelling au ras du trottoir devant les poteaux, boutons flous au premier plan, piétons qui passent | travelling latéral (après `whip`) | jour | — | — |
| 1706-1775 | avec leur petite plaque métallique. | Macro sur la plaque du bouton qui brille, un doigt vient l'effleurer | travelling serré (après `push`) | jour | — | clic |
| 1776-1826 | Résultat : en deux mille quatre, | Marc tient un rapport (`paper`), carte « 2004 », Inès (revenue) l'écoute méfiante | plan à deux (après `whip`) | matin | — | pop |
| 1827-1878 | sur trois mille deux cent cinquante boutons, | Une énorme carte « 3 250 » devant l'avenue vue de haut | `crane` qui monte (après `push`) | matin | — | pop |
| 1879-1956 | moins de sept cent cinquante fonctionnaient encore. | Le compteur descend jusqu'à « < 750 » (rouge, qui tremble) | `crane` vers le sol (après `rise`) | matin | — | pops, ting + thud |
| 1957-2033 | Tous les autres attendaient dans la rue qu'on les presse pour rien. | Trois piétons appuient chacun sur un bouton, de plus en plus agacés (`pained`), rien ne se passe | travelling (après `whip`) | matin -> jour | — | clics |
| 2034-2094 | Et ce n'est pas le plus étonnant. | Nouveau lieu : survol d'un campus au soleil, palmiers, passage piéton ; carte « ISRAËL » ; la chercheuse derrière la barrière | `crane` (après `whip`) | jour | — | ting |
| 2095-2182 | Tu penses sûrement qu'une fois qu'on sait ça, on arrête d'appuyer. | Inès, main au menton (`chin`), hésite devant le bouton du campus | contre-plongée (après `drop`) | jour | — | — |
| 2183-2219 | Pas du tout. | Inès écrase le bouton, saute, poing levé | push-in + `shake` | jour | — | sting + clic + boing |
| 2220-2289 | Une chercheuse, Tal Oron-Gilad, de l'université Ben-Gourion, en Israël, | La chercheuse (blouse, lunettes, carnet) fière derrière la barrière, très grande en contre-plongée | contre-plongée (après `push`) | jour | — | — |
| 2290-2354 | (suite) en Israël, | Le plan recule : le campus entier, carte « BEN-GOURION » | `crane` qui recule (après `rise`) | jour | — | pop |
| 2355-2427 | a observé des piétons à des passages protégés. | La chercheuse note dans son carnet pendant qu'un passant et Inès appuient ou non | deux plans larges (après `whip`) | jour | — | — |
| 2428-2463 | Son constat : | Elle se retourne et montre son carnet à la caméra (`show`) | gros plan (après `push`) | jour | — | — |
| 2464-2529 | ceux qui appuient sur le bouton attendent plus souvent le feu vert… | Deux étudiants appuient et attendent sagement, coche verte | plan à deux (après `whip`) | jour | — | ting |
| 2530-2609 | (suite) avant de traverser. | Un autre n'appuie pas, avance sur la chaussée et sursaute (croix rouge) | plan à deux | jour | — | gasp, bonk |
| 2610-2664 | Le bouton ne change rien au feu. | Inès appuie, le feu reste rouge | plan moyen (après `push`) | jour | — | clic |
| 2665-2741 | Mais il change quelque chose en toi. | Gros plan : Inès passe de la sueur au sourire, un cœur apparaît ; lumière dorée | contre-plongée douce | dore | — | ting |
| 2742-2827 | Les psychologues appellent cela l'illusion de contrôle. | Inès fière appuie ; une bulle avec un levier branché sur rien ; carte « ILLUSION / DE CONTRÔLE » | plan moyen | dore -> jour | — | pop, ting |
| 2828-2877 | Quand on a le sentiment d'agir, | Inès appuie, sereine (note de musique) | plan moyen | jour | — | clic |
| 2878-2959 | l'attente devient plus facile à supporter. | Inès attend en souriant ; à côté un passant sans bouton s'impatiente (tremble, sueur) | plan à deux | jour | — | — |
| 2960-3065 | Attention pourtant : ne va pas croire que tous les boutons mentent. | Triangle d'avertissement « ! », Inès sérieuse pointe du doigt, Léon impassible | contre-plongée penchée (après `whip`) | jour | — | pop, gasp |
| 3066-3105 | Beaucoup marchent vraiment, | Retour au carrefour : une piétonne appuie, le vert arrive vite | plan moyen (après `whip`) | jour | — | clic, ting |
| 3106-3133 | surtout la nuit, | La nuit tombe d'un coup sur le carrefour désert, une piétonne attend | travelling (après `whip`) | nuit | phares | — |
| 3134-3229 | ou aux carrefours qui ne passent au vert que si quelqu'un le demande. | Léon arrive, appuie ; les voitures roulaient, leur feu passe au rouge, elles s'arrêtent, le bonhomme passe au vert | plan moyen qui tourne | nuit | faisceaux de phares | clic, ting |
| 3230-3325 | Là, appuyer sert à quelque chose. | Léon, pouce levé, fier, coche verte, la lumière redevient chaude | contre-plongée (après `push`) | nuit -> dore | — | ting |
| 3326-3413 | Alors la prochaine fois que tu es planté devant un feu rouge, | Inès plante son regard dans la caméra, sûre d'elle | contre-plongée (après `whip`) | dore | — | — |
| 3414-3443 | le doigt sur le bouton, | Gros plan : le doigt d'Inès sur le bouton flou | push-in | dore | — | clic |
| 3444-3525 | souviens-toi de cette femme pressée. | Inès te fait un clin d'œil et un signe de la main | contre-plongée | dore | — | ting |
| 3526-3591 | Le bouton n'a peut-être rien fait du tout. | Macro du bouton, puis le signal qui passe au vert tout seul, voitures arrêtées | `whip`, retour au cadre d'ouverture | dore -> jour | — | ting |
| 3592-3663 | Mais toi, tu as attendu. | Inès attend, apaisée, puis appuie une dernière fois (boucle sur la 1re image) | retour automatique au cadrage de l'image 0 | jour | — | clic + ting |
