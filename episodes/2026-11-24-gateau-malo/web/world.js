// Monde de « Le gâteau de Malo » (fiction du quotidien) : cuisine de campagne en fête + petit salon (library/cuisine.js).
import { buildCuisine } from '../library/cuisine.js';
export async function buildWorld(ctx) { return buildCuisine(ctx, { seed: 2412 }); }
