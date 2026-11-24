// Channel art (banner) is shot in the sunny village set: the road, the fields, Facteur Cheval's palace behind.
import { buildVillage } from '../library/village.js';
export async function buildWorld(ctx) { return buildVillage(ctx, { seed: 1879 }); }
