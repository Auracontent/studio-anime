# PLAN.md — « Le palais du facteur Cheval » (Histoire vraie, Hauterives 1879-1912, classé en 1969)
Héros : **Ferdinand Cheval** (facteur : uniforme bleu, képi, sacoche, grosse moustache). Secondaires : un **voisin** (veste rouge, casquette) et une **voisine** (jaune, écharpe rouge).
Figurants : visiteurs de 1969, ministre (costume gris, lunettes, sans nom à l'écran), enfant (final). Voix : 52,8 s (1585 images), non modifiée (whisper).
Accroche 0-2 s : le palais de pierre fini, énorme, derrière le facteur qui marche (le « teaser » de la fin) ; puis zoom sur la pierre qui brille, et il trébuche dessus.
Fin = retour à la route : un enfant regarde la pierre qui brille dans un rayon de soleil (même objet que l'accroche).
Décor neuf : `engine/library/village.js` (village + palais qui pousse élément par élément). Nouveau casting : képi/sacoche (`strap`), objets en main `stone`, `lantern`.

| images | phrase | ce qu'on VOIT | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-186 | Ce facteur a bâti un palais entier… avec la pierre qui l'a fait trébucher. | palais fini derrière le facteur qui marche ; grue vers le plan large ; swoop sur la pierre qui brille ; il bute dessus, chute, étoiles, la pierre vole | follow -> grue -> gros plan pierre -> gros plan héros | `jour` + rayon | motes, rayon, étincelles | bonk (auto) |
| 187-257 | Un matin de mille huit cent soixante-dix-neuf, | panneau « Hauterives 1879 », le facteur marche sur la route de terre, sacoche | `whip` puis plan serré | `matin` | motes | pas |
| 258-357 | Ferdinand Cheval bute sur une pierre étrange pendant sa tournée. | carte « Ferdinand Cheval », il bute (`fallOver`), la pierre vole et brille dans un rayon | follow -> gros plan pierre | `matin` | rayon, étincelles | bonk |
| 358-399 | Il la ramasse. | gros plan : la pierre dans sa main, regard plein d'étincelles | plan rapproché | `matin` | éclat | **sting** |
| 400-466 | Le lendemain, il en cherche d'autres. | `whip` ; il marche, tête baissée, et ramasse les cailloux de la route un à un | follow | `jour` | motes | pas |
| 467-559 | Bientôt, ses poches sont pleines de cailloux. | tas de cailloux qui grossit, les deux mains pleines, la brouette arrive pleine | plan moyen | `jour` | poussière | pop |
| 560-656 | Les voisins rigolent : le facteur est devenu fou. | voisin et voisine pleurent de rire, le voisin se tape la tempe, carte « FOU ! » ; le facteur têtu | plan à trois, léger choc | `jour` | — | rires |
| 657-743 | Lui continue, nuit après nuit, | `drop` ; nuit, il pousse sa brouette pleine, lampe à pétrole en main | follow | `nuit` -> `lampe` | rayon de lampe | pas, grillons |
| 744-771 | seul, | plan large : tout le village dort, une seule petite lumière | grue arrière | `nuit` | motes | vent |
| 772-795 | une lampe à la main. | gros plan sur lui et la lampe | push | `lampe` | rayon | pop |
| 796-855 | Il empile, | il pose des pierres l'une sur l'autre : le socle du palais apparaît | plan rapproché | `lampe` | poussière | thud |
| 856-887 | il colle, | il étale le mortier à la truelle, le corps du palais monte | plan rapproché | `lampe` | — | pop |
| 888-934 | il sculpte des tours, | il tape au ciseau : étincelles, les tours poussent | gros plan + chocs | `lampe` -> `matin` | étincelles | bonk |
| 935-991 | des grottes et des géants de pierre. | `orbit` : les grottes et les 3 géants poussent un à un | orbit | `matin` | motes | pop x3 |
| 992-1070 | Trente-trois ans plus tard, | carte « 33 ANS », les saisons défilent (été, soir, neige), il vieillit : moustache blanche | plan serré, léger push | `jour`->`soir`->`froid` | neige, feuilles | cloche |
| 1071-1136 | le palais est enfin terminé. | grue vers le ciel, palais complet dans la lumière dorée, il lève les bras et saute | rise | `dore` | étincelles dorées | tintement |
| 1137-1208 | Aucun architecte, aucun plan, | cartes « ARCHITECTE » et « PLAN » barrées de rouge, il tient une feuille vide | plan rapproché | `dore` | — | pop x2 |
| 1209-1285 | juste un facteur têtu. | gros plan : il sourit, poings sur les hanches, devant son palais | push | `dore` | éclat | **sting** |
| 1286-1333 | En mille neuf cent soixante-neuf, | `whip` ; foule de visiteurs devant le palais et le panneau « Monument historique 1969 » | plan large -> plan moyen | `jour` | motes | foule |
| 1334-1384 | le ministre … le classe monument historique. | le ministre (carte « LE MINISTRE »), il signe/tamponne le décret : « CLASSÉ ! » | gros plan | `jour` | éclat | tampon |
| 1385-1452 | (suite) | la plaque s'accroche sur le palais, la foule applaudit et saute | plan moyen -> grue | `dore` | étincelles | applaudissements |
| 1453-1519 | Alors la prochaine fois qu'on rit de ton rêve… | `whip` ; un enfant montre son dessin, deux adultes rient | plan à trois | `jour` | — | rires |
| 1520-1585 | regarde bien la pierre qui te fait trébucher. | l'enfant baisse les yeux : la pierre brille ; `shock` puis sourire ; push sur la pierre (= image d'accroche) | push -> gros plan pierre | `jour` | rayon, étincelles | sting |
