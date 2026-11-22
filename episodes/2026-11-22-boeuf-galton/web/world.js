// Monde de "Le bœuf de Galton" (1906) : foire agricole de Plymouth, jour d'automne.
// Zones le long de x : table du concours TX = -16, enclos du bœuf OXX = 0, balance BX = 14.4. Caméras depuis +z vers -z.
import { buildFoire, makeOx, makeBalance } from '../library/foire.js';
export const TX = -16, OXX = 0, BX = 14.4;
export async function buildWorld(ctx) {
  const { THREE, P, world, add, box, toon } = ctx;
  const F = buildFoire(ctx, { cxs: [0] }), K = F.K;
  const ox = makeOx(ctx), bal = makeBalance(ctx, BX, 0);
  const M = (c) => toon({ color: c });
  // ---- sols : paille dans l'enclos, sciure à la table, sciure à la balance ----
  F.pad(OXX, -1.5, 15, 10); F.pad(TX, -1, 11, 8); F.pad(BX, -0.5, 13, 8);
  // ---- enclos : barrières derrière et sur les côtés (devant : ouvert pour la caméra) ----
  K.fence(-7.5, -6, 7.5, -6, { color: '#c9b48a' }); K.fence(-7.5, -6, -7.5, 1.5, { color: '#c9b48a' }); K.fence(7.5, -6, 7.5, 1.5, { color: '#c9b48a' });
  F.banner(OXX, 5.6, -10, 'CONCOURS DE BŒUFS', 10, 1.6);
  F.hay(-6, -8.6, 3); F.hay(2.5, -8.6, 3);
  F.tent(-9, -12, 9, 6, '#c8312c', '#f4ecd8'); F.tent(9, -12, 9, 6, '#2f56a8', '#f4ecd8');
  F.bunting(-11, 4.6, -7.5, 11, 4.6, -7.5, 26);
  // ---- poste du concours (table de Galton) ----
  F.tent(TX, -8, 9, 6, '#e8b830', '#f4ecd8'); F.banner(TX, 4.7, -11.5, 'ESTIMEZ LE POIDS', 8, 1.4);
  F.bunting(TX - 6, 3.8, -5, TX + 6, 3.8, -5, 20);
  const cloth = add(box(3.9, 0.82, 1.3), M('#f4ecd8'), TX, 0.41, -0.45, world); add(box(3.95, 0.14, 1.34), M('#c8312c'), TX, 0.72, -0.45, world, { cast: false });
  add(box(4.1, 0.1, 1.5), M('#8a5a34'), TX, 0.87, -0.45, world);
  // tickets sur la table : tas (pile) et rangée (row), pièce du milieu (mid) qui se soulève
  const tm = new THREE.MeshBasicMaterial({ color: '#fbf6e6' }), tmG = new THREE.MeshBasicMaterial({ color: '#ffd23a' });
  const rr = P.rng(1906);
  const pile = [], row = [], fly = [];
  for (let i = 0; i < 70; i++) { const a = rr() * 6.283, d = Math.sqrt(rr()) * 0.62; const m = add(new THREE.BoxGeometry(0.34, 0.014, 0.24), tm, 0, 0, 0, world, { cast: false }); m.userData.p = [TX - 0.5 + Math.cos(a) * d * 1.1, 0.99 + Math.floor(i / 9) * 0.03, -0.5 + Math.sin(a) * d * 0.6, a]; pile.push(m); }
  for (let i = 0; i < 41; i++) { const m = add(new THREE.BoxGeometry(0.3, 0.014, 0.22), i === 20 ? tmG : tm, 0, 0, 0, world, { cast: false }); m.userData.p = [TX - 2.0 + i * 0.1, 0.95, 0.02, 0]; row.push(m); }
  for (let i = 0; i < 8; i++) fly.push(add(new THREE.BoxGeometry(0.2, 0.014, 0.14), tm, 0, -50, 0, world, { cast: false }));
  // urne à bulletins
  const urn = new THREE.Group(); world.add(urn);
  add(box(0.62, 0.7, 0.62), M('#6a4426'), 0, 0.35, 0, urn); add(box(0.66, 0.08, 0.66), M('#c8a050'), 0, 0.72, 0, urn); add(box(0.4, 0.02, 0.06), M('#1c1214'), 0, 0.77, 0, urn, { cast: false }); add(box(0.5, 0.2, 0.02), M('#f4ecd8'), 0, 0.38, 0.32, urn, { cast: false });
  // ---- balance : tente et caisses autour ----
  F.tent(BX + 8, -9, 8, 6, '#3f8a3a', '#f4ecd8'); F.hay(BX - 6, -7.5, 3); F.bunting(BX - 7, 4.2, -5.5, BX + 7, 4.2, -5.5, 18); K.fence(BX - 8, -5, BX + 8, -5, { color: '#c9b48a' });
  // ---- habillage obligatoire : 8 à 15 objets derrière chaque plan, sols couverts ----
  const KS = ['bush', 'bush', 'crate', 'barrel', 'sack', 'rock', 'stall', 'tree'];
  for (const at of [[OXX, 0, -1.4], [OXX + 2, 0, 0], [OXX - 2, 0, 0], [TX, 0, -1.7], [TX - 1, 0, 0.5], [BX, 0, 0.5], [BX - 1.5, 0, 0.9]])
    for (const yaw of [-28, 0, 24, 45]) K.backdrop(at, yaw, { kinds: KS, n: 5, near: 2.8, far: 8, spread: 0.5, avoid: (x, z) => (Math.abs(x - OXX) < 8 && z > -6.3) || (Math.abs(x - TX) < 3.5 && z > -2 && z < 0.8) });
  const lv = ['#d98a2e', '#c8501e', '#e0b030', '#8fae3a'];
  for (let i = 0; i < 34; i++) K.tree(-52 + i * 3.4 + (i % 3), -22 - (i % 4) * 3, { s: 1.3 + (i % 3) * 0.3, leaf: lv[i % 4] });
  for (const x of [-22, -9, 9, 22]) K.tree(x, -16, { s: 1.6, leaf: lv[Math.abs(x) % 4] });
  K.verge(-28, 28, -22, -4, { density: 2 });
  K.barrel(-3.6, -4.4); K.barrel(3.8, -4.8); K.crate(5.2, -3.8, { fruit: '#e8442e' }); K.sack(-5, -3.5); K.sack(-5.5, -4); K.bench(-8, -3, 0.2, { color: '#7a5130' });
  K.stall(-24, -6, 0, { awning: ['#c8312c', '#fff'] }); K.stall(24, -6, 0, { awning: ['#2f56a8', '#fff'] }); K.stall(-4, -10, 0, { awning: ['#e8b830', '#fff'] });
  K.sign(-8.8, -1.8, 'BŒUFS', 0.2); K.sign(TX + 3.8, 0.8, 'ESTIMATIONS', -0.2); K.sign(BX - 6.5, 0.6, 'PESÉE', 0.2);
  K.lamp(-11, -3); K.lamp(8.5, -3);
  // ---- état par image ----
  const state = (S) => {
    const o = S.ox || { vis: false }; ox.set(o.x ?? 0, o.z ?? 0, o);
    bal.setDial(S.dial ?? 0);
    const np = Math.round(S.pile ?? 0), nr = Math.round(S.row ?? 0), mid = S.mid ?? 0;
    pile.forEach((m, i) => { m.visible = i < np; const p = m.userData.p; m.position.set(p[0], p[1], p[2]); m.rotation.set(-0.9, p[3], 0); });
    row.forEach((m, i) => { m.visible = i < nr; const p = m.userData.p; m.position.set(p[0], p[1] + (i === 20 ? 0.55 * mid : 0), p[2] + (i === 20 ? 0.25 * mid : 0)); m.rotation.set(-0.9 - (i === 20 ? 0.3 * mid : 0), 0, (i % 3 - 1) * 0.04); m.scale.setScalar(i === 20 ? 1 + 0.9 * mid : 1); });
    const u = S.urn || { x: TX + 0.6, y: 0.92, z: -0.4, rz: 0, ry: 0 }; urn.position.set(u.x, u.y, u.z); urn.rotation.set(0, u.ry || 0, u.rz || 0);
    fly.forEach((m, i) => { const t = (S.tix || [])[i]; if (t) { m.position.set(t[0], t[1], t[2]); m.rotation.set(t[4] || 0, t[3] || 0, 0); } else m.position.set(0, -50, 0); });
  };
  return { DECK: 0, clouds: F.clouds, state, onLight: () => {} };
}
