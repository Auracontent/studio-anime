// Demo world for the 2026-11 "attitude" update: the village set (characters, poses, crowd) + a cutaway diorama far away
// (street on top, ground layers, a bank vault and a tunnel dug under it), to show the whole space with one camera move.
import { buildVillage } from '../library/village.js';
import { buildCoupe } from '../library/coupe.js';
import { propKit } from '../library/props.js';
export const CX = 5000;
export async function buildWorld(ctx) {
  const V = buildVillage(ctx, { seed: 1879 });
  const C = buildCoupe(ctx, { at: [CX, 0, 0], w: 36, d: 14, top: 'road', seed: 3,
    rooms: [{ x0: 3, x1: 13, y0: -7.6, y1: -3.2, depth: 7, wall: '#c9b08a', floor: '#7a5a3e', light: '#ffd27a' },   // the vault
            { x0: -15, x1: -4, y0: -5.0, y1: -3.6, depth: 3, wall: '#9a8a7a', floor: '#6a5a4a' }],                    // the tunnel the thieves dig
    pipes: [{ pts: [[-17, -1.2], [-8, -1.4], [0, -1.1], [17, -1.3]], r: 0.35, col: '#c9c4bb' }] });
  // the street on top of the cut: buildings and dressing (same kit as everywhere)
  const K = propKit({ ...ctx }, { seed: 9 });
  const { THREE, world, add, box, toon } = ctx, M = (c) => toon({ color: c });
  const bank = new THREE.Group(); bank.position.set(CX + 8, 0, -3); world.add(bank);
  add(box(10, 6, 6), M('#efe6d6'), 0, 3, 0, bank); add(box(10.6, 0.6, 6.6), M('#c9b08a'), 0, 6.2, 0, bank);
  for (const x of [-3, 0, 3]) add(box(1.4, 2.4, 0.2), M('#3a4a6a'), x, 3.2, 3.05, bank);
  const shop = new THREE.Group(); shop.position.set(CX - 9, 0, -3.5); world.add(shop);
  add(box(8, 4.5, 5), M('#e8a76a'), 0, 2.25, 0, shop); add(box(8.4, 0.5, 5.4), M('#a8503a'), 0, 4.7, 0, shop);
  for (const x of [-15, -2, 3, 16]) K.lamp(CX + x, 3.5, { h: 3.2 });
  K.tree(CX - 16, -2); K.tree(CX + 16, -1.5); K.bench(CX - 3, -1.8, 0); K.barrel(CX - 5, 2.5); K.crate(CX + 2, 3);
  return { DECK: 0, clouds: V.clouds, state: (S, f) => V.state(S, f), onLight: V.onLight || (() => {}), C };
}
