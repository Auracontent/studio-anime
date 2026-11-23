// Monde de « La lumière du bureau » (fiction du quotidien) : open space (library/bureau.js) + chambre de Karim (x = 400).
import { buildBureau } from '../library/bureau.js';
export async function buildWorld(ctx) { return buildBureau(ctx, { seed: 2311 }); }
