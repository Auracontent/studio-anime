// World pour « L'aimant dans le tube de cuivre » : le cabinet de Foucault, Paris 1855 (library/cabinet.js)
// + les freins magnétiques d'aujourd'hui, loin dans la scène (library/freins.js : montagnes russes et train).
import { buildCabinet } from '../library/cabinet.js';
import { buildFreins } from '../library/freins.js';
export async function buildWorld(ctx) {
  const A = buildCabinet(ctx), B = buildFreins(ctx);
  return { DECK: 0, clouds: [], state: (S, f) => { A.state(S, f); B.state(S, f); }, onLight: () => {} };
}
