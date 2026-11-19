// World for this episode: the shared Paris set from the library, unchanged.
import { buildParis } from '../library/paris.js';
export async function buildWorld(ctx) { return buildParis(ctx); }
