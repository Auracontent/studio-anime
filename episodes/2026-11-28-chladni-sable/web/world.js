// World pour « Cet archet dessine dans le sable » : six lieux (library/chladni.js) : cabinet de Chladni, salon doré, Académie, université, chambre, pont.
import { buildChladni } from '../library/chladni.js';
export async function buildWorld(ctx) {
  const A = buildChladni(ctx);
  return { DECK: 0, clouds: [], state: (S, f) => A.state(S, f), onLight: () => {} };
}
