# Plan de tournage : « Les bombes mongoles : le dessin faux, la bombe vraie » (59,4 s, 1782 images)

Héros : **Suenaga** (armure rouge-orangé, kabuto). Secondaires (2) : le **peintre** du XVIIIe (kimono violet, chignon) et la **plongeuse** (combinaison turquoise, hôte de la 2e moitié ;
un 2e plongeur orange et un Mongol vert en figurants). Objet clé : la **bombe en céramique** (boule brune à bande dorée et col) et le **rouleau** avec son explosion peinte.
Décors neufs : `engine/library/kamakura.js` (plage de Hakata + salle du rouleau), `engine/library/fondmarin.js` (fond marin, épave, labo aux rayons X).
Costumes neufs (`engine/roman.js`) : `kabuto`, `chonmage`, `divehood`, `mongol`, armure laquée (`armorCols`), objets tenus `brush` et `bomb`.
Sans le son : on voit un peintre ajouter une explosion sur un rouleau, un samouraï qui commande l'image, des plongeurs qui trouvent des boules dans une épave,
l'écran qui montre poudre + éclats de fer dedans, puis un Mongol qui lance la boule : explosion. La fin revient au rouleau (même cadre que l'accroche) avec la vraie bombe devant.

| images | phrase | ce qu'on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-162 | Le plus célèbre dessin d'une bombe… ajouté après coup. | gros plan du rouleau : l'explosion se peint sous nos yeux au pinceau (elle grossit) ; la caméra recule sur le peintre | recul + orbite, gros plan -> plan moyen | `dore` | étincelles rouges, poussière | pinceau, pop |
| 163-230 | Vers 1293, | Suenaga fier devant le rouleau (sans explosion), carte « 1293 » ; retour dans le temps | `whip` d'entrée, glissement | `matin` | poussière | whoosh, ting |
| 231-370 | le samouraï Suenaga fait peindre ses exploits… | il montre du doigt, le scribe peint la bataille (chevaux, navire mongol) | plan à deux, glissement | `matin` | poussière | pinceau |
| 371-428 | Mais l'explosion, elle, | saut en avant dans le temps : le peintre du XVIIIe seul peint l'explosion | `whip` inverse | `matin` -> `soir` | étincelles | whoosh, pop |
| 429-511 | …rajoutée plus de quatre siècles plus tard. | gros plan sur l'explosion fraîche, carte « +400 ans », il rit | gros plan -> plan moyen | `soir` | étincelles | ting |
| 512-584 | Alors, | Suenaga réapparaît (`popIn`), réfléchit (spirale), le peintre transpire | plan à deux | `soir` | poussière | pop |
| 585-731 | ces bombes existaient-elles vraiment ? | « ? » automatique, bras en l'air, haussement d'épaules | plan à deux | `soir` | poussière | — |
| 732-772 | Sauf que… en 2011, | la plongeuse sur le bateau, pouce levé, saute à l'eau, gerbe | `drop` d'entrée, plan serré | `jour` | mer calme, gerbe | sting, boing, splash |
| 773-863 | des plongeurs fouillent le fond de la mer, | deux plongeurs balaient le sable au fond, poissons | `drop`, plan à deux | bleu clair sous l'eau | particules, faisceau | bulles, eau |
| 864-948 | à Takashima. | la plage au panneau « TAKASHIMA », bateau de plongée, pins | `rise`, plan large (seul plan large) | `jour` | mer | vagues |
| 949-1016 | Sous un mètre de sable dort un navire mongol, | elle dégage le sable de l'épave (le monticule fond), carte « 1 m » | `drop`, plan moyen | sous l'eau | nuage de sable | grattement |
| 1017-1071 | coulé en 1281. | on tourne autour de l'épave, carte « 1281 » | orbite | sous l'eau | particules | thud |
| 1072-1116 | Dedans, | la caméra entre dans la cale | travelling avant | sous l'eau | particules | whoosh |
| 1117-1255 | des boules de céramique, tassées entre les pierres et les briques. | GROS PLAN des boules entre pierres et briques ; elle en prend une, `shock` (« ! ») | gros plan -> plan moyen | sous l'eau | particules | ting, gasp |
| 1256-1326 | Les rayons X les ouvrent sans les casser : | labo : l'écran se révèle de haut en bas, la boule en transparence | `whip`, plan large -> moyen | lumière du labo | — | bip, balayage |
| 1327-1390 | de la poudre noire, | gros plan sur l'écran, anneau sur « POUDRE » | travelling vers l'écran | labo | — | ting |
| 1391-1457 | et des éclats de fer. | gros plan, anneau jaune sur « FER », elle rit | travelling | labo | — | ting |
| 1458-1562 | Les Mongols lançaient bien du tonnerre sur les samouraïs. | flash-back : le Mongol lance la bombe, explosion, Suenaga projeté (`fallOver`) | `whip`, plan à deux + `shake` | `tempete` | pluie, éclair, gerbe, fumée, étincelles | lancer, explosion, tonnerre |
| 1563-1662 | Le dessin était faux… mais la bombe, | retour au rouleau : le peintre rit, la vraie bombe apparaît sur son socle (`back`) | `rise`, plan à deux | `dore` | poussière | pop, ting |
| 1663-1781 | elle, était bien réelle. | gros plan sur la bombe devant l'explosion peinte, recul jusqu'au cadre de l'accroche (la boucle) | gros plan -> cadre du plan 1 | `dore` | poussière | sting final |
