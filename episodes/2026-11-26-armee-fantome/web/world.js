// World pour « L'armée fantôme » : campagne 1944-45 (library/campagne.js) + props d'habillage (library/props.js).
import { buildCampagne, ZONE } from '../library/campagne.js';
import { propKit } from '../library/props.js';
export async function buildWorld(ctx) {
  const A = buildCampagne(ctx), K = propKit(ctx, { seed: 1944 });
  const Z = ZONE;
  // habillage : 8 à 15 objets derrière chaque lieu où les personnages jouent
  K.backdrop([Z.camp, 0, 1.2], 0, { kinds: ['bush', 'crate', 'barrel', 'sack', 'rock', 'bush'], n: 14, near: 3, far: 11 });
  K.backdrop([Z.camp, 0, 1.2], -30, { kinds: ['bush', 'crate', 'sack', 'barrel'], n: 8, near: 3, far: 9 });
  K.backdrop([Z.pump, 0, 0.5], 25, { kinds: ['crate', 'barrel', 'sack', 'bush', 'rock'], n: 12, near: 3, far: 10 });
  K.backdrop([Z.fake, 0, 1.2], 0, { kinds: ['bush', 'rock', 'bush', 'sack', 'crate'], n: 12, near: 4, far: 12 });
  K.backdrop([Z.road, 0, 4.5], 20, { kinds: ['bush', 'rock', 'bush', 'sack'], n: 10, near: 3, far: 11 });
  K.backdrop([Z.radio, 0, -2.5], 0, { kinds: ['crate', 'sack', 'barrel', 'bush'], n: 10, near: 3, far: 8 });
  K.backdrop([Z.village, 0, 2], 12, { kinds: ['pot', 'barrel', 'crate', 'sack', 'bush'], n: 10, near: 4, far: 9 });
  K.backdrop([Z.rhin, 0, 15], 0, { kinds: ['bush', 'rock', 'sack', 'crate'], n: 12, near: 3, far: 10 });
  K.backdrop([Z.rhin + 35, 6, -90], 0, { kinds: ['bush', 'rock', 'sack'], n: 8, near: 3, far: 8 });
  K.verge(Z.camp - 14, Z.camp + 14, -10, 6, { density: 2.5 }); K.verge(Z.pump - 12, Z.pump + 12, -10, 6, { density: 2.5 }); K.verge(Z.fake - 20, Z.fake + 20, -4, 8, { density: 2 });
  K.verge(Z.road - 40, Z.road + 40, 3, 12, { density: 1.5 }); K.verge(Z.radio - 12, Z.radio + 12, -8, 2, { density: 2.5 }); K.verge(Z.rhin - 30, Z.rhin + 30, 2, 30, { density: 1.5 });
  return { DECK: 0, clouds: A.clouds, state: (S, f) => { A.state(S, f); }, onLight: () => {}, lib: A };
}
