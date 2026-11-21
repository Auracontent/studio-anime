// World for "Le canari de la mine" : galerie de mine boisée + bouche de mine en plein jour (library/mine.js), un seul décor continu.
import { buildMine, MX } from '../library/mine.js';
import { propKit } from '../library/props.js';
export async function buildWorld(ctx) {
  const F = buildMine(ctx);
  const K = propKit(ctx, { seed: 1986 });
  // habillage derrière chaque poste de tournage (galerie : caisses, tonneaux, sacs, cailloux ; dehors : arbres, buissons)
  const stations = [[0, 0.3, 0], [-5, 0.3, 0], [-21, 0.3, 0], [-9, 0.3, 0], [8, 0.3, 0], [14, 0.3, 0], [22, 0.3, 0]];
  for (const [x, z, yaw] of stations) for (const y of [-30, 0, 30]) K.backdrop([x, 0, z], y, { kinds: ['crate', 'barrel', 'sack', 'rock'], n: 3, near: 2.2, far: 3.1, spread: 0.3, avoid: (px, pz) => pz < -3.1 || pz > 8.6 });
  for (const [x, z] of [[MX + 6, 1], [MX + 8, 0.6], [MX + 10, 1]]) for (const y of [-40, 0, 40]) K.backdrop([x, 0, z], y, { kinds: ['bush', 'bush', 'rock', 'crate', 'barrel'], n: 3, near: 3, far: 8, spread: 0.5, avoid: (px, pz) => pz > 8.2 || px < MX + 1 });
  return F;
}
