# PLAN.md — « Le bœuf de Galton » (1906)
Héros : **Francis Galton** (redingote vert-de-gris, haut-de-forme brun, lunettes, moustache claire), toujours le même. Secondaires : le **boucher** (tablier blanc, tunique rouge, stout) et la **fermière** (robe turquoise, bonnet). Figurants : un citadin violet et 4 visiteurs de la foire.
Objet clé : **le bœuf de concours** (3D, rosette de prix) + le **billet** (3D sur la table) + la **balance à cadran**.
Accroche 0-2 s : gros plan sur la tête du bœuf, Galton plisse les yeux devant lui, la foule brandit ses billets, carte « ? lb ». Fin = même plan, mêmes personnages (la dernière image est la première).
Voix : 42,0 s (1260 images), non modifiée. Décor neuf : `engine/library/foire.js` (foire anglaise, bœuf, balance).

| images | phrase | ce qu'on VOIT se passer | caméra | ambiance | effet 3D | bruitage |
|---|---|---|---|---|---|---|
| 0-142 | Personne n'a trouvé le poids de ce bœuf. Mais la foule entière, si. | Gros plan du bœuf (rosette), Galton plisse les yeux, la foule lève ses billets ; carte « ? lb » qui devient « ✓ » sur « si » | `frameTwo` serré qui recule, yaw -18 | jour | poussière (motes), confettis sur « si » | pop cartes |
| 143-179 | Dans une foire anglaise, | plan large (≤ 15 %) : enclos, tentes, bannière, balance au loin | `orbit` haut | jour | motes | auto |
| 180-278 | près de huit cents visiteurs écrivent leur estimation sur un billet. | boucher et fermière écrivent (`holdR: paper`) et lancent leur billet dans l'urne, file de visiteurs ; carte « ≈ 800 » | `frameTwo` à la table, glisse | jour | billets en vol (3D) | pop |
| 279-404 | des bouchers, des fermiers, et des gens qui n'ont jamais touché un bœuf | trois visages tour à tour : boucher sûr de lui, fermière, citadin qui tâte le bœuf du bout du doigt (`nervous`), le bœuf souffle | glissement de caméra sur 3 `frameOn` | jour | motes | souffle (pop) |
| 405-512 | Un savant, Francis Galton, ramasse les billets. | Galton soulève l'urne, la renverse : le tas de billets monte sur la table | `frameOn` Galton, push-in | matin | billets | pop, froissement |
| 513-587 | Il est sûr que la foule va se tromper lourdement. | Galton bras croisés, ricane (`laugh`), tas de billets devant lui, carte « ✗ » | `frameOn` serré, kick | matin | — | rire |
| 588-677 | Sauf que… il calcule le chiffre du milieu : | Galton aligne les billets en rang sur la table (rang qui s'allonge), `squint` | `whip`-lent bas le long de la table puis `push` | matin → doré | `shake` au sting | sting |
| 678-741 | mille deux cent sept livres. | le billet du milieu se soulève et brille, Galton le brandit (`shock`) ; carte « 1207 lb » | `frameOn` gros plan | doré | confettis | ting |
| 742-870 | Le bœuf, une fois préparé, pèse mille cent quatre-vingt-dix-huit livres. | `whip` vers la balance : le boucher mène le bœuf sur la plateforme, choc (`shake`, poussière), l'aiguille s'affole puis se pose sur 1198 ; carte « 1198 lb » | `track` du bœuf, puis tilt vers le cadran | doré | poussière, `spray` | thud, ting |
| 871-930 | Moins d'un pour cent d'écart. | Galton (« 1207 ») et le boucher (« 1198 ») côte à côte devant le cadran, `shock` / `laugh` ; carte « < 1 % » | `frameTwo` | doré | confettis | pop |
| 931-968 | Chaque billet se trompait, | citadin et fermière brandissent leur billet : chacun est faux (cartes « ✗ 900 », « ✗ 1500 ») | `frameTwo` | doré | — | pop x2 |
| 969-1045 | mais les erreurs trop fortes et trop faibles s'annulaient. | deux cartes, « + » rouge (trop haut) et « − » bleue (trop bas), glissent l'une vers l'autre au-dessus de Galton et s'annulent en « ✓ » ; figurants bras en haut / bras en bas | `frameOn` large | doré | étincelles à la fusion | ting |
| 1046-1120 | C'était en mil neuf cent six. | `rise` : plan large de la foule autour du bœuf, carte « 1906 » | `orbit` haut | doré | motes | whoosh |
| 1121-1186 | Aucun visiteur n'avait la réponse, | boucher et citadin se grattent la tête, billets froissés, `squint` | `frameTwo` | doré | — | — |
| 1187-1259 | mais tous ensemble, ils l'avaient. | toute la foule lève les billets, Galton salue de son chapeau, confettis ; `push` final vers le bœuf, même cadre que l'accroche | `orbit` puis `push` | doré → jour | confettis | foule, sting final |
