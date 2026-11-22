# Plan de tournage : Le pendule de Foucault (Panthéon, 1851) : 1373 images (45,8 s)
Héros : Léon Foucault (redingote bordeaux, haut-de-forme). Secondaires : son assistant (turquoise), un ouvrier (orange). Public = figurants.
Objet clé : la boule de laiton et sa pointe, qui trace dans le sable. Décor : `engine/library/pantheon.js` (nef, coupole, colonnes). Boucle : la fin rejoue le gros plan de la boule de l'accroche.

| images | phrase | on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-127 | Ce boulet qui se balance… prouve que la Terre tourne. | gros plan de la boule qui balance, pointe au ras du sable ; Foucault et son assistant bouche bée ; carte « LA TERRE ? » | `track` sur la boule puis plan à deux | dore | motes, beams | swish auto, pop |
| 128-210 | Paris, mille huit cent cinquante et un. | plan large de la nef sous la coupole, public autour, carte « PARIS 1851 » | `orbit`, transition `rise` | dore | motes, beams | pop |
| 211-306 | Foucault accroche une boule de vingt-huit kilos… | deux porteurs tremblent sous la boule (`carry`, `tremble`), carte « 28 kg », la boule s'accroche | `follow`, `whip` | dore | poussière à l'accroche | pas, thud |
| 307-386 | …au bout d'un fil de soixante-sept mètres. | la caméra monte le long du fil jusqu'à la coupole, carte « 67 m » | montée, `push` | dore | beams | pop |
| 387-435 | Il la lance doucement. | Foucault tire la boule de côté puis la lâche | cadre Foucault puis `track` boule, `drop` | dore | | whoosh |
| 436-549 | Une pointe, sous la boule, trace un trait dans le sable. | la pointe gratte le sable, le trait s'allonge | `track` sur la pointe, `whip` | dore | | auto |
| 550-645 | Le public attend. Les minutes passent. | public qui s'impatiente, montre, horloge qui tourne | plan à deux puis plan serré | dore | | clics d'horloge |
| 646-723 | Et le trait change de direction. | deux traits qui divergent dans le sable ; le public sursaute (« ! ») | gros plan sable puis plan à deux, `shake` | dore -> soir | étincelles | sting, gasp |
| 724-780 | Personne n'a touché la boule. | Foucault lève les deux mains, la boule passe derrière lui | gros plan Foucault | soir | | |
| 781-824 | Elle balance toujours dans le même sens. | double flèche fixe, Foucault et l'assistant montrent la boule | plan large bas | soir | | pop |
| 825-909 | C'est le sol qui tourne. | vue du dessus : le plateau gradué tourne sous la boule fixe, carte « LE SOL ! » | `rise`, montée | soir -> nuit | | ting |
| 910-1006 | Chaque heure, le trait dévie de onze degrés. | éventail de traits, horloge, « 11°/h », Foucault montre | gros plan sable puis Foucault, `drop` | nuit | | pop |
| 1007-1095 | En trente-deux heures, le tour est complet. | le plateau fait un tour complet, rosace complète, « 32 h » puis ✓ | vue du dessus, `push` | nuit | étincelles | clics, ting |
| 1096-1229 | Les Parisiens, bouche bée, sentent la Terre tourner… | public qui vacille, bras en l'air, saute de joie | plan à deux, `whip`, `shake` | nuit -> dore | confettis | boing |
| 1230-1372 | Alors, ce boulet… c'est toi qui bouges. | Foucault et l'assistant sourient, la caméra revient sur la boule (même image que l'accroche), « C'EST TOI ! » | `push`, `track` | dore | motes, beams | sting |

Casting : redingote et haut-de-forme existent déjà dans `engine/roman.js` (`coat`, `tophat`) : aucun ajout nécessaire.
