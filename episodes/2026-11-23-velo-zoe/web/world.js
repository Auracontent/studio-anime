// Monde de « Zoé et le vélo » (fiction du quotidien) : cour d'école + immeuble voisin (library/ecole.js).
import { buildEcole } from '../library/ecole.js';
export async function buildWorld(ctx) { return buildEcole(ctx, { seed: 2312 }); }
