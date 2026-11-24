// Monde des « Rats de Hanoï » (1902) : rue coloniale, étal de la prime, faubourg aux cages, égout en coupe (library/hanoi.js).
import { buildHanoi } from '../library/hanoi.js';
export async function buildWorld(ctx) { return buildHanoi(ctx, { seed: 1902 }); }
