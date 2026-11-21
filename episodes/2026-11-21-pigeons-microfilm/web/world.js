// World for « Les pigeons du siège » : Paris enneigé, camp prussien, ballon, mansarde, atelier du photographe, bureau de dépouillement (library/paris1870.js).
import { buildParis1870, IX } from '../library/paris1870.js';
import { propKit } from '../library/props.js';
export async function buildWorld(ctx) {
  const F = buildParis1870(ctx);
  const K = propKit(ctx, { seed: 1870 });
  const { THREE, add, world, toon } = ctx;
  // neige : bosses blanches sur le sol (derrière chaque poste de tournage, dehors)
  const snowM = toon({ color: '#f6f9fd' }), snowS = toon({ color: '#dbe6f3' });
  const rr = ctx.P.rng(77);
  const lump = (x, z, s) => { const m = add(new THREE.IcosahedronGeometry(s, 1), rr() > 0.4 ? snowM : snowS, x, s * 0.02, z, world); m.scale.set(1.9, 0.28, 1.2); m.rotation.y = rr() * 3; };
  for (let x = -6; x < 100; x += 2.2) for (const z of [-6.2, -4.4, -3.2]) lump(x + rr() * 2, z + rr() * 0.8, 0.3 + rr() * 0.35);
  // habillage de la rue : arbres nus, lampadaires, bancs, caisses, tonneaux sous la neige
  const SNOW_TREE = '#e4ecf6';
  for (const x of [50, 76]) { K.tree(x, -5.2 - rr() * 1.4, { s: 0.8 + rr() * 0.3, leaf: SNOW_TREE }); }
  for (const x of [0, 12, 21, 30, 40.5, 54, 64, 72]) K.lamp(x + 1, -2.6);
  for (const x of [6.5, 18.5, 47, 60]) K.bench(x, -1.6 + rr() * 0.4, 0, { color: '#6b4a32' });
  for (const x of [1.8, 10.6, 19.4, 27.6, 36, 51.5, 69]) { K.crate(x, -1.8 - rr() * 0.6, { s: 0.6 }); K.barrel(x + 0.8, -2.3); K.sack(x - 0.7, -1.6); }
  for (const x of [8, 26, 41, 56]) K.stall(x, -4.5, 0, { awning: ['#8a3a3a', '#efe6cf'] });
  K.sign(3.2, -2.2, 'RUE DU PAIN', 0.2); K.sign(31, -2.2, 'PLACE', -0.2); K.sign(IX - 9.6, -4.3, 'PHOTOGRAPHIE', 0);
  // intérieurs : caisses, sacs, pots
  for (const x of [-32.2, -17, -12.2, 0.8, 3.8, 8, 30.4]) { K.crate(IX + x, -4.0 + rr() * 0.4, { s: 0.55 }); K.sack(IX + x + 0.7, -3.8); K.pot(IX + x - 0.7, -4.1, {}); }
  return F;
}
