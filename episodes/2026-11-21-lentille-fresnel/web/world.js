// World for "La lentille de Fresnel": rocher du phare (exterieur, origine) + atelier / salle de lanterne (x = 3000), one scene.
import { buildPhare, IX } from '../library/phare.js';
import { propKit } from '../library/props.js';
export async function buildWorld(ctx) {
  const F = buildPhare(ctx);
  const K = propKit(ctx, { seed: 1823 });
  // ---- exterieur : rocher, herbes, caisses et barils de gardien, panneau, cordages ----
  K.verge(-14, 14, -6, 11, { density: 3, avoid: (x, z) => Math.hypot(x, z + 10) < 7.5 });
  for (const at of [[0, 0, 0.5], [1, 0, 0.5]]) for (const yaw of [-25, 0, 20]) K.backdrop(at, yaw, { kinds: ['rock', 'rock', 'barrel', 'crate'], n: 3, near: 3, far: 7, spread: 0.45 });
  for (const at of [[2.4, 0, 8], [3.4, 0, 8]]) K.backdrop(at, 185, { kinds: ['rock', 'rock', 'barrel'], n: 3, near: 3, far: 7, spread: 0.5, avoid: (x, z) => Math.hypot(x / 1.2, z + 4) > 15 });
  K.barrel(-3, -2.5); K.barrel(-3.7, -3); K.crate(-4.5, -2, { fruit: '#e8442e' }); K.sack(4.5, -3); K.sack(5, -3.5); K.sign(-2, -3.5, 'PHARE', 0.15, {}); K.fence(-8, -1, 8, -1, { color: '#f0e9d8' });
  K.lamp(5.5, 1, { h: 3 }); K.bush(8, -1); K.bush(-8, -1.5); K.bush(10, 2, { flowers: true });
  // ---- interieur : caisses, barils d'huile, sacs, pots le long des murs ----
  const X = (x) => IX + x;
  for (const x of [-17, -12, -1, 7, 10, 14, 19, 22, 26]) { K.barrel(X(x), -4.6 - (x % 3) * 0.1); if (x % 2) K.crate(X(x + 1), -4.7, { s: 0.7 }); else K.sack(X(x + 0.8), -4.5); }
  K.pot(X(-0.2), -4.9, { y: 0 }); K.pot(X(2), -4.8); K.crate(X(-6), -2.1, { s: 0.6 }); K.barrel(X(8), -1.2); K.crate(X(15.5), -0.5, { s: 0.55 }); K.sack(X(9.5), 0.4); K.sack(X(-10.6), 0.7);
  for (const a of [[-8, 0, 0.3], [-3, 0, 0.3], [3, 0, 0.3], [11, 0, 0.3]]) K.backdrop([X(a[0]), 0, a[2]], 0, { kinds: ['crate', 'barrel', 'sack', 'pot'], n: 4, near: 3.4, far: 4.8, spread: 0.6 });
  return { DECK: 0, clouds: F.clouds, state: (S, f) => F.state(S, f), onLight: () => {} };
}
