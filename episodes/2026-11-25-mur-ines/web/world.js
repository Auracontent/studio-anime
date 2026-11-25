// Monde de « Le mur d'Inès » (fiction du quotidien) : chantier en plein air (library/chantier.js).
import { buildChantier } from '../library/chantier.js';
export async function buildWorld(ctx) { return buildChantier(ctx, { seed: 2511 }); }
