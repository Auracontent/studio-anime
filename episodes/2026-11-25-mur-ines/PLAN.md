# PLAN.md — « Le mur d'Inès » (fiction du quotidien, format Vie quotidienne)
Héroïne : **Inès** (16 ans, casque moutarde, salopette turquoise). Secondaires : **Paco** (casque rouge, stout, `smug`), **Victor** le chef (casque blanc, moustache, `deadpan`). Figurants : 2 ouvriers.
Fiction inventée, jamais présentée comme vraie. Émotion : patience et fierté face à la moquerie. Série : aucune.
Accroche 0-2 s : gros plan sur le mur de briques de Paco qui monte, briques qui volent, lumière chaude `dore`, caméra qui glisse ; Paco rit en réaction. La fin revient au même cadrage (mur, brique).
Voix : 60 s (1800 images), non modifiée (`phrases.json` : whisper). Décor neuf : `engine/library/chantier.js` (murs en briques instanciées qui montent, penchent, s'écroulent). Nouveautés casting : accessoires `brick`, `level`, `keys`, `watch`, `glove`.
Lumière : `dore` -> `jour` -> `soir` (la moquerie) -> `nuit` / `tempete` -> `matin` -> `dore`.

| images | phrase | ce qu'on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-109 | Tout le chantier riait de son mur, parce qu'Inès posait chaque brique à la main, | mur de Paco qui monte, briques lancées, ouvriers qui rient, Inès pose une brique | glissement le long du mur | dore->jour | poussière | briques |
| 110-144 | une par une. | gros plan : la brique posée, brique floue au premier plan | gros plan | jour | | clac |
| 145-222 | Elle a seize ans, et c'est sa première semaine. | Inès petite et gênée, ouvrier qui rit | plan à deux, contre-plongée | jour | | |
| 223-309 | Victor soupire en regardant sa montre. | Victor montre à la main, soupir | contre-plongée, dutch | jour | souffle | soupir |
| 310-375 | Le mur de Paco monte à toute vitesse. | le mur grandit, Paco court avec des briques | crane | jour | poussière | briques |
| 376-469 | Il tape, il plaisante, il ne vérifie rien. | Paco frappe à la truelle, le mur penche | dutch | jour | | coups |
| 470-528 | tend un fil, | Inès tend le fil de maçon | follow | jour | | |
| 529-586 | pose un niveau, | niveau flou au premier plan, brique de travers | gros plan | jour | | |
| 587-640 | et recommence si une brique penche d'un doigt. | la brique se retire et se repose droite | plan moyen | jour | | |
| 641-697 | Le soir, Paco a fini trois mètres. | deux murs : 3 m contre 1 m | large | soir | | |
| 698-758 | Inès, un seul. Tout le monde se moque d'elle. | Inès seule, les autres rient | plan à deux | soir | | rires |
| 759-810 | Elle a les mains en sang, | gant taché de sang | gros plan | soir | | |
| 811-864 | mais elle ne change rien. | elle reprend une brique, contre-plongée | contre-plongée | soir | | |
| 865-897 | Puis, la nuit, | le chantier la nuit | `rise`, crane | nuit | | |
| 898-987 | le vent se lève, et la pluie tombe en rafales. | bâche qui claque, pluie | panoramique | nuit->tempete | pluie, vent, éclair | vent |
| 988-1029 | Le mur de Paco tremble. | le mur tremble | shake | tempete | pluie | |
| 1030-1134 | Une brique glisse, puis dix, puis tout s'écroule dans la boue. | brique qui glisse, puis le mur s'effondre (Climax) | shake fort | tempete | gerbes de boue, éclairs | thud, tonnerre |
| 1135-1273 | Sauf que celui d'Inès reste debout, droit comme un fil, sous la tempête. | seul mur debout, fil tendu | travelling bas | tempete | pluie, éclair | sting |
| 1274-1341 | Au matin, Victor pose la main dessus. | les ruines, Victor pose la main | crane | matin | rayon | |
| 1342-1431 | Il ne dit rien. Il lui tend les clés du chantier. | Victor silencieux, clés ; Inès bouleversée | contre-plongée, plan à deux | matin->dore | | ting |
| 1432-1518 | Paco ramasse ses briques, ... il demande : | Paco ramasse les briques, va vers Inès | follow | dore | | |
| 1519-1557 | « Montre-moi comment tu fais. » | Inès sourit, montre le niveau | plan à deux | dore | | |
| 1558-1709 | Ce que tu fais lentement et bien… | ils posent des briques ensemble, le mur monte | crane, large | dore | rayon | |
| 1710-1799 | Alors, ne te presse pas : pose ta brique. | Inès vers la caméra, puis brique en gros plan (reboucle) | contre-plongée, retour au cadrage 0 | dore | | |
