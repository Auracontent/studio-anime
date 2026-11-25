// Monde de « Le micro-ondes de Percy Spencer » (1945) : labo radar (library/radar.js, x = 0) + cuisine moderne (library/cuisine.js, décalée de KX en x)
// avec un micro-ondes sur le plan de travail (assiette qui tourne derrière la vitre : S.turn).
import { buildRadar } from '../library/radar.js';
import { buildCuisine } from '../library/cuisine.js';
export const KX = 60;
export async function buildWorld(ctx) {
  const { THREE, P, world, add, box, toon } = ctx;
  const L = buildRadar(ctx, { seed: 1945 });
  const kg = new THREE.Group(); kg.position.set(KX, 0, 0); world.add(kg);
  const Ck = buildCuisine({ ...ctx, world: kg }, { seed: 2412 });
  const M = (c) => toon({ color: c });
  const [dx, dy, dz] = Ck.SPOTS.dish;
  const mw = new THREE.Group(); mw.position.set(dx, dy, dz + 0.12); kg.add(mw);
  add(box(0.78, 0.46, 0.5), M('#e8e6e0'), 0, 0.23, 0, mw); add(box(0.52, 0.34, 0.04), M('#2a2f38'), -0.1, 0.24, 0.26, mw, { cast: false });
  const glowM = new THREE.MeshBasicMaterial({ color: '#3a3a30', fog: false }); add(box(0.46, 0.28, 0.03), glowM, -0.1, 0.24, 0.275, mw, { cast: false });
  add(box(0.14, 0.34, 0.04), M('#9aa2ac'), 0.28, 0.24, 0.26, mw, { cast: false });
  for (const k of [0, 1]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), M('#2a2f38'), 0.28, 0.3 - k * 0.12, 0.29, mw, { cast: false }).rotation.x = Math.PI / 2;
  const plate = new THREE.Group(); plate.position.set(-0.1, 0.1, 0.0); mw.add(plate);
  add(new THREE.CylinderGeometry(0.17, 0.17, 0.015, 18), M('#f6f1e6'), 0, 0, 0, plate, { cast: false });
  add(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#e3a14a'), 0.04, 0.01, 0, plate, { cast: false });
  add(new THREE.SphereGeometry(0.03, 8, 6), M('#6a3a1e'), -0.06, 0.03, 0.04, plate, { cast: false });
  const state = (S, f) => { L.state(S, f); Ck.state(S, f); plate.rotation.y = (S.turn ?? 0); glowM.color.set((S.mwOn ?? 0) > 0.5 ? '#ffd070' : '#2a2a28'); };
  return { DECK: 0, clouds: L.clouds, state, onLight: () => {}, KX, SPOTS: L.SPOTS, KSPOTS: Ck.SPOTS };
}
