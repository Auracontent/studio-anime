# PLAN.md — « Le gâteau de Malo » (fiction du quotidien, format Vie quotidienne)
Héros : **Malo** (11 ans, pull moutarde, tablier turquoise). Secondaires : **Odile**, la grand-mère (violet, lunettes, chignon), **Jade**, la cousine (rouge, couettes). Figurants : tonton, tata, un ami.
Fiction inventée, jamais présentée comme vraie. Émotion : la honte qui devient fierté, la bienveillance. Série : aucune.
Accroche 0-2 s : gros plan sur le gâteau doré qui s'affaisse en direct, vapeur, caméra qui bouge (`crane` easeOut), Jade qui rit à gauche, Malo en `shock` à droite. Fin = même cadrage (la caméra y revient), gâteau effondré, tout le monde sourit.
Voix : 38,2 s (1145 images), non modifiée (`phrases.json` : whisper). Décor neuf : `engine/library/cuisine.js`. Nouveautés casting : chignon `bun`, plats `plat` / `platOk` / `platVide`, `fork`.
Lumière : `dore` (accroche) -> `matin` (le souvenir) -> `froid` (la honte) -> `dore` (le retournement).

| images | phrase | ce qu'on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-57 | Tout le monde se moquait de son gâteau, | le gâteau s'affaisse sur le plan de travail, Jade rit, Malo les mains sur la tête | `crane` gros plan | dore | vapeur | pouf |
| 58-125 | parce qu'il s'était effondré au milieu. | la caméra recule : invités qui rient, Malo gêné | `crane` | dore->matin | vapeur | rires |
| 126-157 | Malo, onze ans, | Malo montre sa recette, grand sourire | gros plan, contre-plongée | matin | | whip |
| 158-229 | voulait surprendre sa grand-mère pour son anniversaire. | Malo prépare, farine ; mamie lit au loin dans le salon ; il court au four | plan large diagonal puis `follow` | matin | farine | pop |
| 230-263 | Mais en ouvrant le four, | la porte s'ouvre, le gâteau haut dans le four | gros plan four | matin | vapeur | porte |
| 264-309 | le gâteau s'est affaissé. | le gâteau retombe, Malo `shock` « ! », étoiles | insert + contre-plongée, `shake` | lampe | miettes | thud |
| 310-395 | Sa cousine Jade a éclaté de rire, puis tous les autres. | Jade pointe et rit, les invités suivent, Malo tient le plat, sueur | plan à deux, recul | froid | | rires |
| 396-472 | Malo, rouge de honte, a voulu jeter le plat. | Malo traverse la cuisine avec le plat vers la poubelle, le couvercle s'ouvre | `follow`, dutch 4 | froid | | pas |
| 473-560 | Sauf que sa grand-mère lui a pris le plat des mains. | Odile arrive et prend le plat ; Malo lâche | `whip`, plan à deux | froid->dore | rayon | sting |
| 561-633 | Elle a goûté une part, puis elle a fermé les yeux. | gros plan Odile, fourchette, bouchée, yeux fermés | contre-plongée | dore | poussière | |
| 634-762 | « Mon premier gâteau s'est effondré aussi. Celui-ci est délicieux. » | Odile montre le plat, Malo passe de `shock` au sourire | plan à deux, fourchette floue | dore | rayon | ting |
| 763-871 | Jade en a repris deux fois, et plus personne ne riait. | autour de la table, le gâteau se mange, tous sourient | `whip` puis plan large table | dore | | |
| 872-978 | Il ne restait plus une miette, et Malo souriait enfin. | plat vide en gros plan, puis `crane` : cuisine pleine de monde qui rit | insert puis `crane` | dore | | pop |
| 979-1060 | La prochaine fois que ton gâteau s'effondre, ne le jette pas. | Malo regarde le spectateur et montre le plat | `push`, contre-plongée | dore | | |
| 1061-1144 | Un gâteau effondré peut être le meilleur de la table. | retour au gâteau effondré, Jade et Malo sourient | retour au cadrage de l'image 0 | dore | vapeur | |
