# Le bœuf de Galton : la foule devine mieux que chacun
Titre proposé : « La FOULE a deviné le poids du bœuf » (YouTube Shorts / TikTok)

## Sources
- Francis Galton, « Vox Populi », Nature, 7 mars 1907, p. 450-451 : concours au West of England Fat Stock and Poultry Exhibition, Plymouth ; 787 estimations exploitables ; médiane 1207 lb ; poids du bœuf préparé 1198 lb (écart ~0,8 %). Galton y écrit que le résultat est plus favorable au jugement démocratique qu'attendu.
- Kenneth Wallis, « Revisiting Francis Galton's Forecasting Competition », Statistical Science, 2014 (moyenne ~1196 lb ; brouillon de Galton avec 1208 : petite incohérence, on garde les chiffres publiés dans Nature).
- Prudence : « près de huit cents » (800 billets vendus, 787 lisibles) ; « sûr que la foule va se tromper » = Galton était sceptique envers le jugement collectif ; le « chiffre du milieu » est la médiane. Galton est mort en 1911 (pas de personne vivante). Pas de claim « aucun individu n'était plus proche » (non vérifié).

## Diversité
Psychologie / statistique, 1906, **universel** (Angleterre ; angle français possible plus tard : Condorcet). Après trois histoires françaises d'affilée (coffre Humbert = arnaque, tour 1904 = sport, champagne = nourriture), on passe à l'universel. Catégorie jamais traitée en tant que telle (la corde Ringelmann est proche mais sur l'effort de groupe, et date de 1913 : ici c'est l'estimation) ; ton surprenant puis doux, plein jour d'automne en extérieur (foire de campagne), pas d'intérieur ni de mer. Tendances : famille « psychologie / probabilités contre-intuitives » (inspirée par « Why Humans Can't Pick Random Numbers », « Why the Second Draw Always Wins ») ; histoire, époque et angle différents.

## Héros et accroche
Héros : Francis Galton, savant moustachu aux favoris, redingote grise, chapeau haut-de-forme, lunettes. Secondaires : un boucher (tablier rouge, stout) et une fermière (robe turquoise). Figurants : visiteurs de la foire avec billets.
Accroche 0-2 s : gros plan sur l'énorme bœuf de concours qui remplit le cadre, ruban de prix, pendant que la foule tend des billets vers lui ; carte « ? kg ».
Décor neuf : `engine/library/foire.js` (champ de foire anglaise, enclos en bois, tente, bannière « Fat Stock Show », balance géante, tables) avec props.

## Plan visuel
| phrase | action visible | ambiance / effet |
|---|---|---|
| 1. « Personne… la foule, si » | le bœuf en gros plan, la foule compacte lève ses billets, carte « ? » qui se change en « ✓ » | jour ; motes |
| 2. « près de huit cents… billet » | le boucher et la fermière écrivent un chiffre sur un billet (`holdR: paper`) et le glissent dans une urne ; file de visiteurs | jour ; popIn des billets |
| 3. « bouchers, fermiers, gens… » | trois visages : le boucher confiant (`grin`), la fermière, un citadin qui tâte le bœuf du bout du doigt (`nervous`) | jour |
| 4. « Galton ramasse… se tromper » | Galton vide l'urne sur sa table, ricane, bras croisés (`stubborn`), pile de billets qui monte | matin ; motes |
| 5. « Sauf que… chiffre du milieu » | Galton aligne les billets en rang sur une grande table, pose le billet du milieu, `shock` ; carte « 1207 » ; sting | blendMood jour -> dore |
| 6. « bœuf préparé… 1198 » | la balance géante : le bœuf préparé est pesé, l'aiguille s'arrête à « 1198 », Galton et le boucher côte à côte (`shock`/`laugh`) | dore ; spray de poussière |
| 7. « erreurs s'annulaient » | schéma vivant : billets trop hauts (flèches vers le haut) et trop bas (flèches vers le bas) qui se rejoignent au milieu sur la balance | dore |
| 8. « mil neuf cent six… ils l'avaient » | plan large de la foule qui applaudit autour du bœuf, Galton salue ; retour sur le bœuf et son ruban (boucle) | dore ; confettis |
