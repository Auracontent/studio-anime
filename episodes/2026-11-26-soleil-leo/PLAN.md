# PLAN.md — « Léo et le costume de soleil » (fiction du quotidien, format Vie quotidienne)
Héros : **Léo** (12 ans, pull turquoise, `determined` puis `pained`, `nervous`, enfin `grin`). Secondaire : **Lila** (6 ans, petite sœur, pyjama rose puis costume de soleil jaune à 10 rayons). Figurants : le public (enfants, parents).
Fiction inventée, jamais présentée comme vraie. Émotion : oser faire même maladroit (peur du ridicule -> fierté). Série : aucune.
Accroche 0-2 s : gros plan chaud sur le costume jaune, l'aiguille et le fil jaune qui piquent et tirent le tissu (mouvement dès l'image 0, caméra qui glisse) ; la fin revient au même cadrage (aiguille + fil sur le costume, la caméra boucle sur l'image 0).
Voix : 55,2 s (1656 images), non modifiée (`phrases.json` : whisper). Décors neufs : `engine/library/chambre.js` (chambre, table de couture, costume 3D, aiguille 3D, horloge, fenêtre nuit -> aube) et `engine/library/scene.js` (salle des fêtes : scène, rideau, fond de ciel peint, bannière, guirlandes, chaises en instances, projecteurs).
Nouveautés casting (`engine/roman.js`) : `sun` (costume de soleil : rayons, `sunDroop`, `sunWave`), accessoires `needle`, `ray`, `plaster`.
Lumière : `lampe` chaude -> `nuit` (Lila dort) -> `lampe` -> `matin` (aube) -> `jour` (salle) -> `froid` (poings) -> `dore` (la danse) -> `lampe` (boucle).

| images | phrase | ce qu'on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-78 | Léo a une nuit pour coudre un costume de soleil. | costume jaune plein cadre, aiguille qui pique, fil jaune qui tire | glissement au-dessus du tissu | lampe | poussière | piqûres |
| 79-123 | Il ne sait pas coudre. | Léo `nervous`, bras ouverts (`shrug`), sueur | plan moyen, contre-plongée | lampe | | |
| 124-224 | Demain, sa petite sœur Lila joue le soleil à la fête de l'école. | Lila endormie, peluche, affiche « Fête de l'école » | whip puis panoramique lit -> affiche | lampe | | |
| 225-248 | Il pique l'aiguille, | aiguille qui descend dans le tissu, aiguille floue au 1er plan | gros plan | lampe | | pique |
| 249-293 | et il se pique le doigt. | Léo `shock` (« ! »), saute, doigt en bouche | plan serré, dutch | lampe | | gasp |
| 294-311 | Il tire le fil, | Léo tire à deux mains vers le costume | plan à deux | lampe | | |
| 312-347 | et le tissu se déchire. | déchirure qui s'ouvre sur le tissu, Léo recule | gros plan, shake | lampe | fumée | déchirure |
| 348-386 | À minuit, | horloge sur minuit, nuit à la fenêtre | rise, gros plan horloge | lampe | | tic-tac |
| 387-435 | les rayons jaunes sont tout de travers, | rayons qui se tordent un par un | glissement au-dessus de la table, roll | lampe | | |
| 436-496 | et l'un d'eux tombe par terre. | un rayon se détache, tombe, rebondit sur le parquet | suit la chute | lampe | poussière | thud |
| 497-549 | Léo veut tout abandonner. | Léo `pained`, mains sur la tête | contre-plongée, dutch | lampe | | |
| 550-594 | Mais sur le lit, | la caméra file vers le lit | whip | nuit | | |
| 595-658 | Lila dort, sa peluche serrée contre elle. | Lila `snore`, peluche à côté d'elle | glissement lent | nuit | | |
| 659-699 | Alors il reprend l'aiguille, | Léo revient, `determined`, aiguille en main | whip, contre-plongée | lampe | | |
| 700-751 | un point après l'autre, | points de couture qui s'ajoutent, rayons qui se redressent, horloge qui tourne | gros plan | lampe -> matin | rayon de soleil | piqûres |
| 752-773 | jusqu'au lever du jour. | fenêtre : le ciel passe du bleu à l'orange, le soleil se lève | panoramique vers la fenêtre | matin | rayon | |
| 774-810 | Sur la scène, | salle des fêtes, rideau rouge qui s'ouvre | rise puis travelling avant | jour | projecteurs | rideau |
| 811-848 | Lila entre. | Lila entre en trottinant, rayons de travers | suit Lila | jour | | pas |
| 849-885 | Le costume penche, | Lila `nervous`, tremble, costume penché | contre-plongée, dutch | jour | | |
| 886-903 | un rayon pend, | rayon qui pend au gros plan | travelling | jour | | |
| 904-959 | et les enfants rigolent. | public qui rit et montre du doigt | sur la salle, depuis la scène | jour | | rires |
| 960-987 | Au fond de la salle, | Léo seul au fond, chaises devant lui | whip, plan large -> serré | froid | | |
| 988-1037 | Léo serre les poings. | Léo `pained`, poings serrés, tremble | contre-plongée, dutch | froid | | |
| 1038-1122 | Sauf que Lila lève les bras et tourne sur elle-même. | Lila bras en l'air, saute et tourne | push, contre-plongée | dore | faisceaux, étincelles | sting |
| 1123-1157 | Tous les rayons ondulent, | costume plein cadre, rayons qui ondulent | gros plan | dore | étincelles | |
| 1158-1219 | comme un vrai soleil qui danse. | Lila danse, la caméra tourne et recule | crane autour de la scène | dore | faisceaux | |
| 1220-1268 | La salle applaudit debout. | public debout, bras en l'air (Climax) | whip, vers la salle depuis la scène | dore | étincelles | applaudissements |
| 1269-1344 | Lila crie : « C'est mon grand frère qui l'a cousu ! » | Lila rit et montre Léo du doigt | contre-plongée | dore | | |
| 1345-1406 | Léo rougit et sourit, | Léo `grin`, joues roses, le public applaudit derrière | push | dore | | |
| 1407-1466 | le doigt couvert de pansements. | Léo montre ses doigts à pansements, pansement flou au 1er plan | gros plan | dore | | ting |
| 1467-1582 | Ce qu'on fait de travers pour quelqu'un vaut mieux… | retour à la chambre, costume fini sur la table, Léo fier | crane du large au plan serré | dore -> lampe | | |
| 1583-1629 | La prochaine fois que tu hésites, | Léo montre le spectateur du doigt, aiguille floue | contre-plongée | lampe | | |
| 1630-1655 | prends l'aiguille. | Léo tend l'aiguille, la caméra plonge sur l'aiguille + fil : boucle sur l'image 0 | push puis retour au cadrage 0 | lampe | | piqûre |
