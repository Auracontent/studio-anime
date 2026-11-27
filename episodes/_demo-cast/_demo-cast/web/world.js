// Demo world for the cast library: the village set, nothing else (characters are the subject).
import { buildVillage } from '../library/village.js';
export async function buildWorld(ctx) {
  const V = buildVillage(ctx, { seed: 1879 });
  return { DECK: 0, clouds: V.clouds, state: (S, f) => V.state(S, f), onLight: V.onLight || (() => {}) };
}
