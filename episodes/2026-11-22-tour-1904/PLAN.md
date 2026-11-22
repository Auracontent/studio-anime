# PLAN.md — « Le Tour gagné en arrivant cinquième » (1904)
Héros : **Henri** (maillot jaune moutarde, casquette bleue, visage jeune), toujours sur son vélo jaune aux pneus crevés. Secondaires : un favori moustachu rouge, un commissaire vert. Figurants : supporters, trois autres favoris.
Accroche 0-2 s : gros plan d'Henri qui pédale, roues à plat, étincelles, clous sur la route. Fin = même plan, même route (la dernière image est la première).
Voix : 51,3 s (1538 images), non modifiée.

| images | phrase | ce qu'on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-146 | Il a gagné le Tour… cinquième | Henri pédale sur deux roues à plat, étincelles aux jantes, carte « 5e » qui claque sur « cinquième » | `follow` gros plan, yaw 24 | jour | étincelles, poussière | auto (pop de la carte) |
| 147-205 | C'était en 1904 | peloton de 6 coureurs sur la route, carte « 1904 » | `track` plan large (≤ 20 %) | jour | poussière | auto |
| 206-272 | Henri avait dix-neuf ans | gros plan sur le jeune visage qui sourit en roulant, carte « 19 ans » | `follow` | jour | poussière | pop |
| 273-338 | … deux pneus crevés | plan rapproché des deux roues aplaties, jantes qui raclent, puis visage crispé | `track` bas, fondu vers `follow` | jour | étincelles x2 | auto |
| 339-466 | Cette année-là, clous et verre | gros plan des clous et tessons sur la route, Henri passe dessus ; le favori rouge crève (gerbe), tombe, étoiles | `whip`, caméra basse puis `follow` favori, `shake` | jour | spray, étincelles | éclatement (auto), chute |
| 467-601 | supporters, bâtons | Henri freine devant la foule barrant la route, bâtons qui tapent, Henri se protège la tête (`head`) | `whip`, plan à deux, `shake` x2 | jour | poussière du freinage | auto |
| 602-708 | commissaires tirent en l'air | le commissaire lève le pistolet, flash, `shake` fort, les supporters s'enfuient en courant | plan à deux, `shake` | jour | fumée, étincelles | coup de feu (audio.py) |
| 709-790 | favoris sautent dans un train | deux favoris nerveux se glissent dans le wagon, le cheminot regarde ailleurs, fumée de locomotive | `whip`, plan à deux | soir | fumée | train, sifflet |
| 791-932 | … ou dans une voiture | la voiture arrive, le favori y saute (`hop`), ils filent en riant dans la poussière | `whip`, plan à deux puis suivi de la voiture | soir | poussière | moteur |
| 933-1070 | Sauf que quelqu'un a regardé | le juge à lunettes lève les yeux du registre, « ! » | `rise` (montée au ciel), gros plan, kick | soir -> lampe | poussière lumineuse | sting |
| 1071-1140 | Quatre mois plus tard | le juge épluche le dossier, le calendrier tourne JUIL -> DÉC 1904 | plan serré, glissement | lampe | — | tic-tac |
| 1141-1236 | quatre premiers disqualifiés | quatre favoris l'un après l'autre : tampon « DISQUALIFIÉ », chute (`fallOver`), étoiles | plan à deux, pan de gauche à droite, `shake` x4 | lampe | gerbes | tampons |
| 1237-1332 | de la cinquième à la première | Henri tient le papier, `shock`, la carte « 5e » devient « 1er » avec un éclat | plan à deux, `shake` | lampe -> doré | gerbe | ting |
| 1333-1402 | sans avoir levé les bras | Henri franchit la ligne, mains sur le guidon, bras baissés ; le favori derrière lève les bras | `whip`, `follow` | doré | confettis | foule |
| 1403-1477 | plus jeune vainqueur | Henri sur l'estrade, drapeau, « 19 ans », confettis, petit saut | `orbit` | doré | confettis | pop |
| 1478-1537 | celui qui est arrivé cinquième | retour sur la route, mêmes roues à plat, « 5e » ; dernière image = première | `push`, même cadre que l'accroche | doré -> jour | étincelles | sting final |
