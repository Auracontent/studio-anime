// Monde des « boutons piétons » : carrefour new-yorkais, rangée de poteaux, campus au soleil, poteau ouvert en coupe (library/carrefour.js).
import { buildCarrefour } from '../library/carrefour.js';
export async function buildWorld(ctx) { return buildCarrefour(ctx, { seed: 2004 }); }
