// World for "Le coffre-fort vide": salon doré + tribunal + rue de Madrid (engine/library/salon1900.js), habillés avec le kit d'objets.
import { buildSalon1900 } from '../library/salon1900.js';
import { propKit } from '../library/props.js';
export async function buildWorld(ctx) {
  const A = buildSalon1900(ctx), K = propKit(ctx, { seed: 1902 }), TX = A.TX, MX = A.MX;
  // ---- salon : pots, sacs d'écus, caisses, guéridons le long des murs et derrière chaque plan ----
  for (const x of [-10.2, -3.4, 3.6, 10.4]) K.pot(x, -4.3, { y: 0 });
  for (const [x, z] of [[-1.6, -2.6], [-2.1, -2.2], [1.9, -2.5], [2.4, -2.2], [-2.8, -2.0]]) K.sack(x, z);
  K.crate(-5.2, -3.6, { s: 0.7 }); K.crate(5.6, -3.7, { s: 0.7 }); K.crate(-6.0, -3.4, { s: 0.5 }); K.sack(5.0, -3.2); K.sack(-4.6, -3.2); K.pot(-8, 0.4); K.pot(8.4, 0.6);
  for (const x of [-5, 5]) K.backdrop([x, 0, 2.5], 0, { kinds: ['sack', 'crate'], n: 3, near: 3, far: 5.5, spread: 0.3, avoid: (X, Z) => Math.abs(X) < 3.6 || Z > -1.5 });
  // ---- tribunal ----
  for (const x of [-10.5, -6.5, 6.5, 10.5]) K.pot(TX + x, -4.2);
  K.sack(TX + 3.5, -2.4); K.crate(TX + 4.4, -2.6, { s: 0.6 }); K.crate(TX - 4.2, -2.6, { s: 0.6 }); K.sack(TX - 3.4, -2.2); K.pot(TX + 8, -1); K.pot(TX - 8, -1);
  for (const x of [-4, 0, 4]) K.backdrop([TX + x, 0, 1.5], 0, { kinds: ['sack', 'crate'], n: 2, near: 3.5, far: 5, spread: 0.3, avoid: (X, Z) => Math.abs(X - TX) < 3.5 || Z > -1.5 });
  // ---- rue de Madrid ----
  K.sign(MX - 1.2, -5.5, 'MADRID', 0); K.sign(MX + 7.5, -6.5, 'CALLE', 0);
  for (const x of [-9, -3.4, 6, 11]) K.lamp(MX + x, -6.2);
  for (const x of [-7, 8.5]) K.cafe(MX + x, -4.6);
  K.barrel(MX - 5, -4.9); K.barrel(MX + 9.4, -4.4); K.crate(MX - 6.2, -4.6, { s: 0.7 }); K.crate(MX + 5.2, -4.8, { s: 0.7 }); K.stall(MX - 10, -5.5, 0, { awning: ['#d23a32', '#fff'] }); K.stall(MX + 13, -5.5, 0, { awning: ['#e8a030', '#fff'] });
  for (const x of [-4, 0, 4]) K.backdrop([MX + x, 0, 1.5], 0, { kinds: ['barrel', 'crate', 'sack', 'pot'], n: 3, near: 3.5, far: 6, spread: 0.4 });
  return { DECK: 0, clouds: A.clouds, state: A.state, onLight: () => {} };
}
