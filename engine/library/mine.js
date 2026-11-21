// Library set: une mine de charbon (galerie boisée + bouche de mine à la lumière du jour), Grande-Bretagne, vers 1900.
// DECK = 0. La galerie court le long de x (de -42 à MX = 30), mur du fond à z = -3.4, caméra côté +z (yaw ~0), mur avant à z = +9.
// Plafond à y = 3.8 (ne projette pas d'ombre : la lampe éclaire le sol). À x = MX la galerie s'ouvre sur l'extérieur :
// herbe, route de terre, chevalement (tour à molette), terril, collines, ciel. Aucun changement de lieu : on marche de l'ombre à la lumière.
// Rails le long de x à z = -1.9 / -1.2, wagonnet de charbon, éboulis à x ≈ -22 (zone de l'explosion), lampes suspendues tous les 8 m.
// state(S, f): lampGlow 0..1 (lampes suspendues), cageBottle (non utilisé ici : la cage est une carte d'acteur)
import { propKit } from './props.js';
export const DECK = 0, MX = 30, X0 = -42;
export const SPOTS = { hook: [0, 0, 0.3], gaz: [-6, 0, 0.3], eboulis: [-22, 0, 0.3], mouth: [MX, 0, 0.3], outside: [MX + 9, 0, 0.6] };

export function buildMine(ctx) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1896);
  const M = (c) => toon({ color: c });
  const K = propKit(ctx, { seed: 1896 });
  // ---------- textures ----------
  const rockT = cv(512, 512, (g, w, h) => { g.fillStyle = '#5a4a44'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, rw = 30 + r() * 70, rh = 20 + r() * 40, v = 70 + r() * 50 | 0; g.fillStyle = `rgb(${v + 14},${v},${v - 8})`; g.strokeStyle = 'rgba(30,18,24,0.7)'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(x, y, rw, rh, r() * 3, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,230,200,0.10)'; g.beginPath(); g.ellipse(x - rw * 0.25, y - rh * 0.3, rw * 0.4, rh * 0.25, 0, 0, 6.283); g.fill(); }
    for (let k = 0; k < 50; k++) { g.fillStyle = 'rgba(20,16,20,0.7)'; g.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3); } });
  const coalT = cv(512, 512, (g, w, h) => { g.fillStyle = '#4a3c3a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1300; k++) { const x = r() * w, y = r() * h, rr = 3 + r() * 8, v = 36 + r() * 60 | 0; g.fillStyle = `rgb(${v + 12},${v + 4},${v + 6})`; g.strokeStyle = 'rgba(14,10,14,0.8)'; g.lineWidth = 1.6;
      g.beginPath(); g.ellipse(x, y, rr, rr * (0.55 + r() * 0.4), r() * 3, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.ellipse(x - rr * 0.3, y - rr * 0.3, rr * 0.3, rr * 0.15, 0, 0, 6.283); g.fill(); } });
  const grassT = cv(256, 256, (g, w, h) => { g.fillStyle = '#6fae45'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${60 + r() * 50 | 0},${120 + r() * 60 | 0},${40 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); } });
  const dirtT = cv(256, 256, (g, w, h) => { g.fillStyle = '#a07a52'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${130 + r() * 50 | 0},${96 + r() * 40 | 0},${60 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); } });
  const woodT = cv(128, 256, (g, w, h) => { g.fillStyle = '#8a5e38'; g.fillRect(0, 0, w, h); for (let k = 0; k < 18; k++) { g.strokeStyle = `rgba(50,30,20,${0.3 + r() * 0.4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * w; g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 10, h); g.stroke(); } });
  const mRock = toon({ map: P.tex(rockT, 14, 1.6) }), mRockC = toon({ map: P.tex(rockT, 4, 4) }), mCoal = toon({ map: P.tex(coalT, 40, 10) }), mGrass = toon({ map: P.tex(grassT, 90, 90) }), mDirt = toon({ map: P.tex(dirtT, 20, 6) });
  const mWood = toon({ map: P.tex(woodT) }), mWoodD = M('#5e3e26'), mIron = M('#3a3f4a'), mRail = M('#9aa0a6'), mCoalB = M('#2b2428'), mBrick = M('#b4573c'), mStone = M('#a8a094'), mCream = M('#efe6cf');
  // ---------- floor, walls, ceiling ----------
  const L = MX - X0, cxm = (MX + X0) / 2;
  const fl = add(new THREE.PlaneGeometry(L, 12.4), mCoal, cxm, 0.004, 2.8, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  add(tbox(L, 4.2, 0.5, 3), mRock, cxm, 2.1, -3.65, world); add(tbox(L, 4.2, 0.5, 3), mRock, cxm, 2.1, 9.2, world); add(tbox(0.5, 4.2, 12.4, 3), mRock, X0 - 0.25, 2.1, 2.8, world);
  const ce = add(new THREE.PlaneGeometry(L, 12.4), mRockC, cxm, 3.85, 2.8, world, { cast: false }); ce.rotation.x = Math.PI / 2;
  // bumps of rock on the walls (relief) + coal seam stripes
  for (let i = 0; i < 46; i++) { const x = X0 + 1 + r() * (L - 2), s = 0.5 + r() * 0.9; const b = add(new THREE.DodecahedronGeometry(s, 0), r() > 0.5 ? mRockC : mCoalB, x, 0.5 + r() * 3, -3.35, world); b.scale.set(1.3, 0.8, 0.5); b.rotation.set(r() * 3, r() * 3, r() * 3); }
  for (let x = X0 + 2; x < MX - 1; x += 7) add(box(3 + r() * 3, 0.16, 0.12), mCoalB, x, 1.4 + r() * 1.2, -3.35, world, { cast: false });
  // ---------- timber frames (every 3 m): posts + cap beam against the back wall; cross beams under the roof ----------
  for (let x = X0 + 3; x < MX - 0.5; x += 3) {
    add(box(0.32, 3.6, 0.32), mWood, x, 1.8, -3.0, world); add(box(0.9, 0.3, 0.4), mWoodD, x, 3.55, -3.0, world);
    add(box(0.3, 0.3, 12.2), mWood, x, 3.6, 2.8, world, { cast: false });
  }
  add(box(L, 0.26, 0.3), mWoodD, cxm, 3.3, -3.0, world);
  // ---------- rails + ties + coal cart ----------
  const ties = new THREE.InstancedMesh(box(0.2, 0.1, 1.3), mWoodD, Math.floor(L / 0.9)), m4 = new THREE.Matrix4();
  for (let i = 0; i < ties.count; i++) { m4.makeTranslation(X0 + 0.5 + i * 0.9, 0.06, -1.55); ties.setMatrixAt(i, m4); } ties.castShadow = true; ties.receiveShadow = true; world.add(ties);
  for (const z of [-2.0, -1.1]) add(box(L, 0.08, 0.07), mRail, cxm, 0.14, z, world);
  const cart = (x, full = true) => { const g = new THREE.Group(); g.position.set(x, 0, -1.55); world.add(g); add(box(1.7, 0.7, 1.0), mIron, 0, 0.65, 0, g);
    add(box(1.78, 0.1, 1.08), M('#6a7280'), 0, 1.02, 0, g); for (const sx of [-0.6, 0.6]) for (const sz of [-0.5, 0.5]) { const w = add(new THREE.CylinderGeometry(0.19, 0.19, 0.1, 12), M('#222'), sx, 0.2, sz * 1.1, g); w.rotation.x = Math.PI / 2; }
    if (full) for (let i = 0; i < 9; i++) { const c = add(new THREE.DodecahedronGeometry(0.2 + r() * 0.12, 0), mCoalB, (r() - 0.5) * 1.2, 1.1 + r() * 0.12, (r() - 0.5) * 0.6, g); c.rotation.set(r() * 3, r() * 3, r() * 3); } return g; };
  cart(8); cart(-30); cart(22.6, true);
  // coal piles + pickaxes + sacks + lamps along the back wall
  for (const x of [-34, -27, -14, -5, 4, 14, 19, 26]) { const c = add(new THREE.ConeGeometry(0.9 + r() * 0.5, 0.9 + r() * 0.5, 7), mCoalB, x, 0.4, -2.8 + r() * 0.3, world); c.rotation.y = r() * 3; }
  for (const x of [-36, -9, 2, 11]) { const pk = new THREE.Group(); pk.position.set(x, 0, -2.5); pk.rotation.y = r() * 2; world.add(pk); const h = add(box(0.07, 1.3, 0.07), mWood, 0, 0.65, 0, pk); h.rotation.z = 0.3; add(box(0.6, 0.1, 0.1), mIron, 0.2, 1.3, 0, pk); }
  // hanging lamps: bright glass + warm glow disc
  const glowM = new THREE.MeshBasicMaterial({ color: '#ffd68a', fog: false }), lamps = [];
  for (let x = X0 + 6; x < MX - 2; x += 8) { const g = new THREE.Group(); g.position.set(x, 0, -2.8); world.add(g); add(box(0.04, 0.8, 0.04), mIron, 0, 3.35, 0, g); add(box(0.3, 0.1, 0.3), mIron, 0, 2.9, 0, g);
    const bulb = add(new THREE.CylinderGeometry(0.15, 0.15, 0.32, 8), glowM, 0, 2.7, 0, g, { cast: false }); lamps.push(bulb); add(new THREE.ConeGeometry(0.25, 0.2, 8), mIron, 0, 2.98, 0, g); }
  // far end of the gallery (dark): bumps + a black tunnel mouth so the depth reads
  add(box(5, 3.2, 0.3), mCoalB, X0 + 3, 1.6, -3.2, world, { cast: false });
  // ---------- rubble zone (explosion): fallen blocks, broken beams ----------
  for (let i = 0; i < 24; i++) { const x = -26 + r() * 10, z = -2.8 + r() * 2.2, s = 0.2 + r() * 0.5; const b = add(new THREE.DodecahedronGeometry(s, 0), r() > 0.35 ? mRockC : mCoalB, x, s * 0.4, z, world); b.scale.y = 0.7; b.rotation.set(r() * 3, r() * 3, r() * 3); }
  for (let i = 0; i < 5; i++) { const b = add(box(0.26, 0.26, 2.2 + r()), mWood, -25 + i * 2.2, 0.35 + r() * 0.5, -2.4 + r() * 1.6, world); b.rotation.set(r() * 0.5, r() * 3, r() * 0.7); }
  // ---------- gallery dressing: crates, barrels, sacks, props placed behind each station ----------
  for (let i = 0; i < 22; i++) { const x = X0 + 3 + r() * (L - 8), k = ['crate', 'barrel', 'sack', 'crate'][i % 4]; K[k](x, -2.7 + r() * 0.4, { s: k === 'crate' ? 0.55 + r() * 0.3 : undefined }); }
  // ---------- exterior ----------
  const ext = add(new THREE.PlaneGeometry(700, 700), mGrass, MX + 350, -0.01, 0, world, { cast: false }); ext.rotation.x = -Math.PI / 2;
  const road = add(new THREE.PlaneGeometry(90, 6), mDirt, MX + 45, 0.01, 1.2, world, { cast: false }); road.rotation.x = -Math.PI / 2;
  const hill = (x, z, s, c) => { const h = add(new THREE.SphereGeometry(s, 20, 12, 0, 6.283, 0, 1.4), M(c), x, -s * 0.35, z, world, { cast: false }); h.scale.y = 0.5; };
  hill(MX + 60, -70, 60, '#6fae45'); hill(MX + 140, -60, 90, '#5e9e3e'); hill(MX + 20, -110, 80, '#79b24c'); hill(MX + 110, 70, 70, '#6fae45'); hill(MX + 240, 20, 120, '#5b9a42');
  // mine mouth: stone frame around the gallery end, timber lintel, black interior seen from outside is not needed (camera comes from inside)
  for (const z of [-3.6, 9.2]) add(tbox(2.4, 5.2, 1.4, 3), mStone, MX + 1.0, 2.6, z, world);
  add(tbox(2.6, 1.3, 13, 3), mStone, MX + 1.0, 4.55, 2.8, world); add(box(2.4, 0.36, 12.8), mWoodD, MX + 0.2, 3.9, 2.8, world);
  // hillside above the mouth (green hill over the gallery roof)
  { const h = add(new THREE.SphereGeometry(16, 20, 12, 0, 6.283, 0, 1.2), M('#6fae45'), MX - 6, 0, 2.8, world, { cast: false }); h.scale.set(1.6, 0.34, 0.9); h.position.y = 3.6; }
  // headframe (chevalement): two A-legs, top wheels, engine house, chimney
  const hf = new THREE.Group(); hf.position.set(MX + 22, 0, -9); world.add(hf);
  for (const s of [-1, 1]) { const leg = add(box(0.4, 13, 0.4), mWoodD, s * 2.4, 6.2, 0, hf); leg.rotation.z = -s * 0.2; add(box(0.3, 13, 0.3), mWoodD, s * 2.4, 6.2, 2.6, hf).rotation.z = -s * 0.2; }
  for (const y of [3, 6, 9]) add(box(5.6 - y * 0.25, 0.22, 0.25), mWood, 0, y, 0, hf);
  const wheel = add(new THREE.TorusGeometry(1.4, 0.16, 8, 24), mIron, 0, 12.6, 1.3, hf); for (let i = 0; i < 6; i++) { const sp = add(box(2.6, 0.1, 0.1), mIron, 0, 12.6, 1.3, hf); sp.rotation.z = i * Math.PI / 6; }
  add(box(5, 3, 4), mBrick, 8, 1.5, 0, hf); add(box(5.4, 0.5, 4.4), M('#4a3a44'), 8, 3.2, 0, hf); add(new THREE.CylinderGeometry(0.5, 0.7, 11, 10), mBrick, 11, 5.5, -1, hf);
  // terril (slag heap) + sky-line props
  const ter = add(new THREE.ConeGeometry(14, 12, 14), M('#5e5560'), MX + 55, 6, -45, world); ter.scale.set(1.3, 1, 1);
  for (const [x, z] of [[MX + 6, -6], [MX + 14, -7], [MX + 30, -5], [MX + 36, -8], [MX + 18, -9], [MX + 40, -6], [MX + 12, 12], [MX + 26, 13]]) K.tree(x, z, { s: 1.1 + r() * 0.5 });
  K.verge(MX + 1, MX + 60, -14, 14, { density: 2.2, avoid: (x, z) => z > -1.5 && z < 4.2 });
  for (const [x, z] of [[MX + 4, -2.2], [MX + 5, 8.5], [MX + 12, 7.5], [MX + 25, 7.6]]) K.bush(x, z, { flowers: true });
  K.sign(MX + 4.2, -3.2, 'MINE', -0.25, {}); K.barrel(MX + 3.2, -2.6); K.crate(MX + 4.6, -2.9, { s: 0.7 }); K.crate(MX + 8, -3.2, { s: 0.6 }); K.fence(MX + 6, 8.5, MX + 40, 8.5, { color: '#8a6a4a' }); K.lamp(MX + 4.4, 6.6, { h: 3 });
  for (const [x, z] of [[MX + 12, -4.5], [MX + 17, 8], [MX + 10, 8.6]]) K.rock(x, z, { s: 0.5 });
  // ---------- clouds (same recipe as the lighthouse set) ----------
  const clouds = [];
  { const rr = P.rng(94); for (let i = 0; i < 14; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = Math.PI * (0.2 + 0.6 * rr()), d = 650 + rr() * 250; m.position.set(MX + Math.sin(a) * d, 120 + rr() * 140, -Math.cos(a) * d * 0.9); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  function state(S, f) { const g = S.lampGlow ?? 1; lamps.forEach((m, i) => { m.scale.setScalar(0.9 + 0.1 * g * Math.sin(f * 0.3 + i)); }); wheel.rotation.z = f * 0.03; }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
