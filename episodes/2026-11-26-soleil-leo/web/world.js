// Monde de « Léo et le costume de soleil » (fiction du quotidien) : la chambre de Léo (library/chambre.js) + la salle des fêtes de l'école (library/scene.js, construite en x = 100).
import { buildChambre } from '../library/chambre.js';
import { buildScene } from '../library/scene.js';
export async function buildWorld(ctx) {
  const A = buildChambre(ctx, { seed: 2611 }), B = buildScene(ctx, { seed: 2612 });
  return { DECK: 0, SPOTS: { ...A.SPOTS, hall: B.SPOTS }, clouds: [], state: (S, f) => { A.state(S, f); B.state(S, f); }, onLight: () => {} };
}
