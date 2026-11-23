// Monde de « Le palais du facteur Cheval » : village de la Drôme + palais qui se construit (library/village.js).
import { buildVillage } from '../library/village.js';
export async function buildWorld(ctx) { return buildVillage(ctx, { seed: 1879 }); }
