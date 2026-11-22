// World for "Les bombes mongoles": plage de Hakata + salle du rouleau (kamakura.js), fond marin + épave + labo (fondmarin.js).
import { buildKamakura } from '../library/kamakura.js';
import { buildFondmarin } from '../library/fondmarin.js';
import { propKit } from '../library/props.js';
export async function buildWorld(ctx) {
  const A = buildKamakura(ctx), B = buildFondmarin(ctx), K = propKit(ctx, { seed: 1281 });
  A.water.visible = false;                       // la mer animée de fx3d remplace l'eau plate
  // ---- plage : rochers, tonneaux, caisses, sacs, filets le long du camp et du rivage ----
  for (const x of [-9, -5.5, -2, 6, 9.5, 12]) { K.rock(x, 3.6 + (x % 3) * 0.2, { s: 0.5 + (x % 2) * 0.3 }); }
  K.barrel(-4, 1.8); K.barrel(-4.7, 2.2); K.crate(-5.4, 1.6, { s: 0.7 }); K.sack(4.6, 2.2); K.sack(5.2, 1.8); K.crate(5.9, 2.4, { s: 0.6 }); K.barrel(7.5, 1.4); K.barrel(-8, 1.2); K.crate(8.8, 2.0, { s: 0.8 }); K.sack(-1.8, 3.4);
  for (const x of [-2, 0, 2]) K.backdrop([x, 0, 2.3], 175, { kinds: ['rock', 'barrel', 'crate', 'sack'], n: 3, near: 1.3, far: 2.6, spread: 0.5 });
  for (const at of [[0, 0, 0.5], [-4, 0, 0.5], [4, 0, 0.5]]) K.backdrop(at, 0, { kinds: ['rock', 'barrel', 'crate', 'sack'], n: 3, near: 2.5, far: 3.8, spread: 0.5 });
  // ---- salle du rouleau : pots, caisses, tonneaux de saké, sacs le long des murs ----
  const X = (x) => 3000 + x;
  for (const x of [-9, -7, -5.5, 5.5, 9]) { K.barrel(X(x), -3.2 - (x % 2) * 0.2); }
  for (const x of [-6.2, -3.4, 3.6, 6.4]) K.pot(X(x), -3.7, { y: 0 });
  K.crate(X(-9), -2.2, { s: 0.7 }); K.crate(X(9), -1.4, { s: 0.6 }); K.sack(X(-7), -1.4); K.sack(X(8.6), -2.3); K.sack(X(-4.5), -3.5);
  for (const x of [-2, 0, 2]) K.backdrop([X(x), 0, 0.3], 0, { kinds: ['crate', 'barrel', 'sack', 'pot'], n: 3, near: 3.2, far: 4.2, spread: 0.5 });
  return { DECK: 0, clouds: A.clouds, state: (S, f) => { A.state(S, f); B.state(S, f); }, onLight: () => {} };
}
