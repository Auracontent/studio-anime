// Library set: laboratoire de physique médicale, Nancy, 1891 (murs bleu-vert, soubassement en bois, parquet miel, grande fenêtre,
// longue paillasse avec balance à plateaux, tour d'atelier, étagères de boules rouges et bleues, plaque « NANCY 1891 »).
// DECK = 0. Pièce : x de -14 à 14, mur du fond z = -3.4, mur avant z = 9.5, plafond 4.4. Caméra côté +z (yaw ~0).
// state(S, f) : S.beam (angle du fléau, rad), S.lathe (angle de la roue du tour), S.glow (0..1 lampes).
import { propKit } from './props.js';
export const DECK = 0;
export const BX = 9, BZ = -1.7, BY = 1.0, PIV = 1.95, BL = 0.78;   // balance : x, z, dessus de la paillasse, pivot du fléau, demi-fléau
export const SPOTS = { P0: [0, 0, 0.3], P1: [4, 0, 0.3], P2: [-4, 0, 0.3], atelier: [-9, 0, 0.3], balance: [BX, 0, BZ] };

export function buildLabo(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1891), M = (c) => toon({ color: c }), K = propKit(ctx, { seed: 1891 });
  const floorT = cv(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#c99a62', '#d6a96f', '#bf9159', '#cfa266'][i % 4]; g.fillRect(i * 64, 0, 64, h); g.fillStyle = 'rgba(60,34,20,0.7)'; g.fillRect(i * 64, 0, 3, h); }
    for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(60,34,20,0.7)'; g.fillRect(r() * w, Math.floor(r() * 4) * 128, 64, 3); } for (let k = 0; k < 160; k++) { g.fillStyle = 'rgba(90,56,30,0.18)'; g.fillRect(r() * w, r() * h, 2, 6 + r() * 30); } });
  const wallT = cv(256, 256, (g, w, h) => { g.fillStyle = '#6fa8a4'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x, 0, 32, h); } for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(${90 + r() * 40 | 0},${150 + r() * 40 | 0},${150 + r() * 40 | 0},0.25)`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); } });
  const woodT = cv(128, 256, (g, w, h) => { g.fillStyle = '#8a5a34'; g.fillRect(0, 0, w, h); for (let k = 0; k < 16; k++) { g.strokeStyle = `rgba(50,28,16,${0.3 + r() * 0.4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * w; g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 8, h); g.stroke(); } });
  const mFloor = toon({ map: P.tex(floorT, 7, 5) }), mWall = toon({ map: P.tex(wallT, 8, 1.6) }), mWood = toon({ map: P.tex(woodT) }), mWoodD = M('#5e3a22'), mWain = M('#7a4a2c');
  const mBrass = M('#d8a840'), mIron = M('#2f3440'), mCream = M('#efe6cf'), mGlass = M('#cfe8ee'), mTop = M('#b88a58');
  const red = M('#e23d32'), blue = M('#2f7fd8');
  // ---------- pièce ----------
  const fl = add(new THREE.PlaneGeometry(28, 13), mFloor, 0, 0.004, 3.05, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  add(tbox(28, 4.4, 0.4, 3), mWall, 0, 2.2, -3.6, world); add(tbox(28, 4.4, 0.4, 3), mWall, 0, 2.2, 9.7, world); add(tbox(0.4, 4.4, 13, 3), mWall, -14.2, 2.2, 3.05, world); add(tbox(0.4, 4.4, 13, 3), mWall, 14.2, 2.2, 3.05, world);
  const ce = add(new THREE.PlaneGeometry(28, 13), M('#e9dcc0'), 0, 4.4, 3.05, world, { cast: false }); ce.rotation.x = Math.PI / 2;
  add(box(28, 1.1, 0.16), mWain, 0, 0.55, -3.34, world); add(box(28, 0.1, 0.22), mWoodD, 0, 1.12, -3.3, world); add(box(28, 0.14, 0.2), mWoodD, 0, 4.3, -3.3, world);
  for (const x of [-12, -6.5, -1.5, 4, 11.5]) add(box(0.3, 4.3, 0.2), mWoodD, x, 2.15, -3.3, world);
  // ---------- porte + plaque NANCY 1891 ----------
  add(box(1.5, 2.7, 0.14), mWood, -5.2, 1.35, -3.3, world); add(box(1.7, 0.16, 0.2), mWoodD, -5.2, 2.78, -3.3, world); add(new THREE.SphereGeometry(0.07, 8, 6), mBrass, -4.6, 1.2, -3.2, world);
  { const c = cv(512, 160, (g, w, h) => { g.fillStyle = '#2a2230'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8a840'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#ffd86a'; g.font = '800 86px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NANCY 1891', w / 2, h / 2 + 4); });
    add(new THREE.PlaneGeometry(2.6, 0.81), toon({ map: P.tex(c) }), -5.2, 3.55, -3.18, world, { cast: false }); add(box(2.76, 0.95, 0.06), mWoodD, -5.2, 3.55, -3.24, world); }
  // ---------- grande fenêtre (lumière du jour) ----------
  add(box(2.6, 2.2, 0.1), mGlass, 2.0, 2.45, -3.26, world, { cast: false });
  for (const [dx, dy, w, h] of [[0, 0, 2.8, 0.12], [0, 1.1, 2.8, 0.14], [0, -1.1, 2.8, 0.14], [-1.3, 0, 0.14, 2.4], [1.3, 0, 0.14, 2.4], [0, 0, 0.1, 2.3]]) add(box(w, h, 0.16), mWoodD, 2.0 + dx, 2.45 + dy, -3.2, world, { cast: false });
  // ---------- étagères de boules (rouges grosses / bleues petites) sur le mur du fond ----------
  const shelf = (x, rows = 3) => { add(box(2.6, 2.6, 0.5), mWoodD, x, 1.5 + 0.4, -3.05, world);
    for (let i = 0; i < rows; i++) { const y = 0.8 + i * 0.85; add(box(2.5, 0.07, 0.46), mWood, x, y, -3.0, world);
      for (let j = 0; j < 4; j++) { const big = (i + j) % 2 === 0, rr = big ? 0.17 : 0.09; add(new THREE.SphereGeometry(rr, 12, 8), big ? red : blue, x - 0.95 + j * 0.64 + (r() - 0.5) * 0.05, y + 0.04 + rr, -2.98, world); } } };
  shelf(-9.3); shelf(-1.7); shelf(6.5); shelf(12.2, 2);
  // ---------- paillasse longue (la balance dessus) ----------
  add(box(7.6, 0.12, 1.2), mTop, BX - 0.6, BY - 0.06, BZ, world); add(box(7.4, 0.9, 1.0), mWoodD, BX - 0.6, 0.45, BZ, world);
  for (const dx of [-3, 0, 3]) add(box(0.04, 0.8, 1.02), mIron, BX - 0.6 + dx, 0.45, BZ, world);
  // fioles et éprouvettes sur la paillasse
  const flask = (x, z, col, s = 1) => { add(new THREE.SphereGeometry(0.17 * s, 10, 8), M(col), x, BY + 0.17 * s, z, world); add(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.22 * s, 8), mGlass, x, BY + 0.36 * s, z, world); };
  flask(BX - 3.2, BZ + 0.1, '#e8a0c0'); flask(BX - 2.7, BZ - 0.1, '#8fd36a', 0.8); flask(BX - 2.2, BZ + 0.2, '#ffd23f', 1.1); flask(BX + 2.4, BZ, '#c86bff'); flask(BX + 2.9, BZ + 0.15, '#7fc4f0', 0.9);
  add(box(0.5, 0.06, 0.35), mCream, BX + 1.7, BY + 0.03, BZ + 0.25, world); add(box(0.4, 0.04, 0.3), mBrass, BX - 1.6, BY + 0.02, BZ - 0.2, world);   // registre + poids en laiton
  // ---------- balance à plateaux (objet vedette) ----------
  const bal = new THREE.Group(); bal.position.set(BX, BY, BZ); world.add(bal);
  add(new THREE.CylinderGeometry(0.34, 0.4, 0.1, 16), mBrass, 0, 0.05, 0, bal); add(new THREE.CylinderGeometry(0.05, 0.09, PIV - BY - 0.1, 10), mBrass, 0, (PIV - BY) / 2, 0, bal);
  const pivY = PIV - BY; add(new THREE.SphereGeometry(0.1, 12, 8), mBrass, 0, pivY, 0, bal);
  // échelle fixe derrière le pointeur (le zéro au milieu)
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 20, 1, false, 0, Math.PI), mCream, 0, pivY - 0.55, 0.02, bal).rotation.x = Math.PI / 2;
  add(box(0.03, 0.12, 0.02), M('#2a2230'), 0, pivY - 0.5, 0.06, bal);
  const beam = new THREE.Group(); beam.position.set(0, pivY, 0.04); bal.add(beam);
  add(box(BL * 2, 0.07, 0.09), mBrass, 0, 0, 0, beam); add(new THREE.ConeGeometry(0.03, 0.55, 6), M('#c8312c'), 0, -0.27, 0.02, beam).rotation.x = Math.PI;
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.06, 8, 6), mBrass, s * BL, 0, 0, beam);
  const pans = [-1, 1].map((s) => { const g = new THREE.Group(); bal.add(g); const ps = [];
    for (const a of [-0.2, 0.2]) { const l = add(box(0.012, 0.62, 0.012), mIron, 0, 0.3, a * 0.8, g); l.rotation.x = -a * 0.2; l.rotation.z = 0; }
    add(new THREE.CylinderGeometry(0.34, 0.2, 0.07, 18), mBrass, 0, 0, 0, g);
    const ball = add(new THREE.SphereGeometry(s < 0 ? 0.2 : 0.1, 16, 12), s < 0 ? red : blue, 0, 0.04 + (s < 0 ? 0.2 : 0.1), 0, g); return { g, s, ball }; });
  // ---------- tour d'atelier à gauche (le médecin fabrique les boules) ----------
  const LX = -11.6, LZ = -1.8;
  add(box(3.6, 0.14, 1.3), mTop, LX, 0.95, LZ, world); add(box(3.3, 0.9, 1.1), mWoodD, LX, 0.45, LZ, world);
  add(box(1.4, 0.4, 0.5), mIron, LX - 0.5, 1.22, LZ, world); add(box(0.25, 0.3, 0.3), mIron, LX + 0.6, 1.2, LZ, world);
  add(new THREE.SphereGeometry(0.19, 14, 10), red, LX - 0.5, 1.58, LZ + 0.05, world); add(new THREE.SphereGeometry(0.1, 12, 8), blue, LX + 1.2, 1.1, LZ + 0.3, world); add(new THREE.SphereGeometry(0.19, 14, 10), red, LX + 1.45, 1.2, LZ + 0.35, world);
  const wheelG = new THREE.Group(); wheelG.position.set(LX - 1.2, 1.7, LZ + 0.6); world.add(wheelG);
  add(new THREE.TorusGeometry(0.5, 0.06, 8, 24), mIron, 0, 0, 0, wheelG); for (let i = 0; i < 6; i++) add(box(1.0, 0.04, 0.04), mIron, 0, 0, 0, wheelG).rotation.z = i * Math.PI / 6;
  add(box(0.1, 1.5, 0.1), mWoodD, LX - 1.2, 0.85, LZ + 0.6, world);
  // copeaux au sol
  for (let i = 0; i < 18; i++) { const c = add(box(0.14, 0.02, 0.06), M(i % 2 ? '#e8c890' : '#c9a066'), LX - 1.5 + r() * 3.5, 0.03, LZ + 0.7 + r() * 1.2, world, { cast: false }); c.rotation.y = r() * 6; }
  // ---------- tableau noir et globe ----------
  { const c = cv(512, 320, (g, w, h) => { g.fillStyle = '#2d3b36'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(60, 230); g.lineTo(200, 230); g.moveTo(130, 230); g.lineTo(130, 120); g.moveTo(270, 120); g.lineTo(450, 120); g.moveTo(270, 200); g.lineTo(450, 200); g.moveTo(300, 120); g.lineTo(300, 200); g.stroke(); });
    add(new THREE.PlaneGeometry(2.4, 1.5), toon({ map: P.tex(c) }), -13.1, 2.5, 1.0, world, { cast: false }).rotation.y = Math.PI / 2; add(box(0.08, 1.7, 2.6), mWoodD, -13.2, 2.5, 1.0, world); }
  // ---------- lampes à gaz suspendues ----------
  const glowM = new THREE.MeshBasicMaterial({ color: '#ffe3a0', fog: false }), lamps = [];
  for (const x of [-10, -4, 2, 8]) { add(box(0.04, 1.0, 0.04), mIron, x, 3.9, 0.6, world); lamps.push(add(new THREE.SphereGeometry(0.2, 10, 8), glowM, x, 3.35, 0.6, world, { cast: false })); add(new THREE.ConeGeometry(0.36, 0.26, 10), mIron, x, 3.62, 0.6, world); }
  // ---------- habillage : caisses, tonneaux, bancs, pots, panneaux ----------
  K.sign(-7.7, -2.7, 'POIDS', 0, {}); K.barrel(-13, -2.8); K.barrel(-12.4, -2.9); K.crate(-3.4, -2.8, { s: 0.7 }); K.crate(-3.4, -2.8 + 0, { s: 0.5, y: 0.7 }); K.crate(5.0, -2.8, { s: 0.65 }); K.sack(12.9, -2.6); K.sack(13.4, -2.2); K.pot(0.1, -2.9); K.pot(-6.6, -2.9);
  K.bench(-6.7, 6.6, Math.PI, { color: '#7a4a2c' }); K.bench(7.5, 6.8, Math.PI, { color: '#7a4a2c' });
  for (const x of [-9, -4.5, 0, 4.5, 9]) for (const yaw of [-28, 0, 28]) K.backdrop([x, 0, 0.3], yaw, { kinds: ['crate', 'barrel', 'sack', 'pot'], n: 2, near: 2.2, far: 3.2, spread: 0.35, avoid: (px, pz) => pz < -3.0 || pz > 9 || px < -13.5 || px > 13.5 });
  const clouds = [];
  function state(S, f) {
    const gl = S.glow ?? 1; lamps.forEach((m, i) => m.scale.setScalar(0.92 + 0.08 * gl * Math.sin(f * 0.3 + i)));
    const a = S.beam ?? 0; beam.rotation.z = a;
    for (const p of pans) { const ex = p.s * BL * Math.cos(a), ey = p.s * BL * Math.sin(a); p.g.position.set(ex, pivY + ey - 0.62, 0.04); }
    wheelG.rotation.z = S.lathe ?? 0;
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
