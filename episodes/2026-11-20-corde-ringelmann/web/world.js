// World for this episode: cour de ferme 1900 (ferme.js) + laboratoire 1974 (labo.js, x = 2000), one scene.
import { buildFerme } from '../library/ferme.js';
import { buildLabo } from '../library/labo.js';
import { propKit } from '../library/props.js';
export async function buildWorld(ctx) {
  const F = buildFerme(ctx), L = buildLabo(ctx);
  const K = propKit(ctx, { seed: 1913 });
  // Dressing around the pulling line (z = 0): camera yaws used in story.js are between -30 and 60 degrees, so the wedge behind is z < 0 and x around the actors.
  const farmAt = [[1, 0, 0], [3, 0, 0], [5, 0, 0], [8, 0, 0]];
  for (const a of farmAt) for (const yaw of [-20, 15, 40]) K.backdrop(a, yaw, { kinds: ['bush', 'bush', 'crate', 'barrel', 'sack', 'rock'], n: 4, near: 2.2, far: 8, spread: 0.5 });
  K.verge(-14, 22, -8, 14, { density: 4, avoid: (x, z) => z > -9 && z < 10 && x > -17 && x < 17 });
  K.verge(-60, 60, -40, -10, { density: 1 });
  K.verge(-25, -17, -14, 17, { density: 3 });
  // a couple of farm props near the line
  K.crate(-3, -2.2, { fruit: '#e8442e' }); K.barrel(-3.8, -3); K.sack(9.5, -2); K.sack(10, -2.6); K.bench(12, -4, 0.2, { color: '#7a5130' }); K.pot(-2.4, -4.5);
  K.sign(-5.2, -1.5, 'FERME', 0.3, {}); K.fence(-3, -8, 14, -8);
  return { DECK: 0, clouds: F.clouds, state: (S, f) => { F.state(S); L.state(S); }, onLight: () => {} };
}
