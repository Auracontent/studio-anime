// Library set: cabinet de physique de Léon Foucault, Paris 1855 (parquet de chêne, murs ocre, lambris acajou, hautes fenêtres,
// étagères d'instruments en laiton, pendule suspendu au plafond) + les instruments de l'expérience :
//   - deux tubes verticaux (cuivre à gauche x = -0.4, plastique à droite x = +0.4) sur la table centrale, avec un aimant dans chacun ;
//   - l'électroaimant de Foucault : disque de cuivre entre deux pôles, avec manivelle (à x = 6) ;
//   - une plaque de cuivre sur son support (à x = -4.2).
// Sol DECK = 0. Pièce : x de -14 à 14, mur du fond z = -4, mur avant z = 9.7, plafond 4.4. Caméra côté +z (yaw ~0).
// state(S, f) : S.cu = { y, ghost } (aimant du tube de cuivre : hauteur du centre, aimant fantôme 0..1), S.pl = { y, vis } (tube plastique),
//   S.pend (angle du pendule, rad), S.crank (angle manivelle), S.discA (angle du disque), S.hot (0..1 le disque chauffe), S.eddy (0..1 les boucles de courant).
import { propKit } from './props.js';
export const DECK = 0;
export const TUBE_X = { cu: -0.4, pl: 0.4 }, TUBE_BASE = 0.98, TUBE_H = 1.6, TUBE_TOP = TUBE_BASE + TUBE_H, MAG_H = 0.16;
export const DISC = { x: 6, y: 1.75, r: 0.42 };
export const PEND = { x: -7.4, z: -0.6, pivY: 4.3, L: 3.0 };
export const SPOTS = { tubes: [0, 0, 1.4], disc: [6, 0, 1.4], plate: [-4.2, 0, 1.4], pend: [-7.4, 0, 1.8] };

export function buildCabinet(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1855), M = (c) => toon({ color: c }), K = propKit(ctx, { seed: 1855 });
  const floorT = cv(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#d9a96c', '#e2b57a', '#cf9d62', '#dcae73'][i % 4]; g.fillRect(i * 64, 0, 64, h); g.fillStyle = 'rgba(70,40,20,0.65)'; g.fillRect(i * 64, 0, 3, h); }
    for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(70,40,20,0.65)'; g.fillRect(r() * w, Math.floor(r() * 4) * 128, 64, 3); } for (let k = 0; k < 160; k++) { g.fillStyle = 'rgba(100,60,30,0.16)'; g.fillRect(r() * w, r() * h, 2, 6 + r() * 30); } });
  const wallT = cv(256, 256, (g, w, h) => { g.fillStyle = '#d6a77a'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(255,230,190,0.18)'; g.fillRect(x, 0, 32, h); } for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(${170 + r() * 40 | 0},${120 + r() * 30 | 0},${80 + r() * 30 | 0},0.22)`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); } });
  const woodT = cv(128, 256, (g, w, h) => { g.fillStyle = '#8a4a32'; g.fillRect(0, 0, w, h); for (let k = 0; k < 16; k++) { g.strokeStyle = `rgba(50,24,16,${0.3 + r() * 0.4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * w; g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 8, h); g.stroke(); } });
  const mFloor = toon({ map: P.tex(floorT, 7, 5) }), mWall = toon({ map: P.tex(wallT, 8, 1.6) }), mWood = toon({ map: P.tex(woodT) }), mWoodD = M('#5a2e22'), mWain = M('#7a3a2a');
  const mBrass = M('#e0b040'), mIron = M('#2f3440'), mCream = M('#efe6cf'), mGlass = M('#e8f6ff'), mTop = M('#c08a5a'), mSteel = M('#c9d0d8');
  const CU = toon({ color: '#d27a3e' }), CU2 = toon({ color: '#b8622e', side: THREE.DoubleSide });
  const PL = toon({ color: '#9fdcee', side: THREE.DoubleSide }), PLC = M('#7fc4dc');
  // ---------- pièce ----------
  const fl = add(new THREE.PlaneGeometry(28, 14), mFloor, 0, 0.004, 2.85, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  add(tbox(28, 4.4, 0.4, 3), mWall, 0, 2.2, -4.2, world); add(tbox(28, 4.4, 0.4, 3), mWall, 0, 2.2, 9.9, world); add(tbox(0.4, 4.4, 14, 3), mWall, -14.2, 2.2, 2.85, world); add(tbox(0.4, 4.4, 14, 3), mWall, 14.2, 2.2, 2.85, world);
  const ce = add(new THREE.PlaneGeometry(28, 14), M('#f0e2c4'), 0, 4.4, 2.85, world, { cast: false }); ce.rotation.x = Math.PI / 2;
  add(box(28, 1.1, 0.16), mWain, 0, 0.55, -3.94, world); add(box(28, 0.1, 0.22), mWoodD, 0, 1.12, -3.9, world); add(box(28, 0.16, 0.22), mWoodD, 0, 4.3, -3.9, world);
  for (const x of [-12.5, -8, -3.4, 3.4, 8, 12.5]) add(box(0.3, 4.3, 0.2), mWoodD, x, 2.15, -3.9, world);
  // ---------- hautes fenêtres (lumière chaude) ----------
  for (const wx of [-5.6, 0, 5.6]) { add(box(2.0, 2.7, 0.1), mGlass, wx, 2.75, -3.84, world, { cast: false });
    for (const [dx, dy, w, h] of [[0, 0, 2.2, 0.1], [0, 0.9, 2.2, 0.1], [0, -0.9, 2.2, 0.1], [-1.0, 0, 0.12, 2.9], [1.0, 0, 0.12, 2.9], [0, 0, 0.08, 2.8]]) add(box(w, h, 0.14), mWoodD, wx + dx, 2.75 + dy, -3.8, world, { cast: false });
    add(box(2.5, 0.12, 0.3), mWoodD, wx, 1.35, -3.7, world); add(box(0.5, 2.9, 0.16), M('#8a2a32'), wx - 1.3, 2.7, -3.75, world); add(box(0.5, 2.9, 0.16), M('#8a2a32'), wx + 1.3, 2.7, -3.75, world); }
  // ---------- étagères d'instruments (fond) ----------
  const shelf = (x, rows = 3) => { add(box(2.4, 2.4, 0.5), mWoodD, x, 1.2 + 0.1, -3.55, world);
    for (let i = 0; i < rows; i++) { const y = 0.5 + i * 0.75; add(box(2.3, 0.06, 0.46), mWood, x, y, -3.5, world);
      for (let j = 0; j < 4; j++) { const k = (i * 3 + j) % 4, px = x - 0.85 + j * 0.57 + (r() - 0.5) * 0.05, pz = -3.46;
        if (k === 0) add(new THREE.SphereGeometry(0.17, 12, 8), mBrass, px, y + 0.2, pz, world);
        else if (k === 1) add(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 10), M(['#e8a0c0', '#8fd36a', '#7fc4f0'][j % 3]), px, y + 0.2, pz, world);
        else if (k === 2) { add(box(0.34, 0.26, 0.26), mIron, px, y + 0.16, pz, world); add(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10), mBrass, px, y + 0.33, pz, world); }
        else { add(new THREE.TorusGeometry(0.15, 0.03, 6, 14), CU, px, y + 0.2, pz, world); } } } };
  shelf(-11); shelf(-9.4, 2); shelf(9.4); shelf(11.2, 2);
  // ---------- table centrale : les deux tubes ----------
  add(box(3.6, 0.1, 1.1), mTop, 0, 0.88, 0, world); add(box(3.4, 0.14, 0.95), mWoodD, 0, 0.78, 0, world);
  for (const sx of [-1.65, 1.65]) for (const sz of [-0.45, 0.45]) add(box(0.12, 0.8, 0.12), mWoodD, sx, 0.4, sz, world);
  const tubeMesh = (x, mat, mRim) => { const g = new THREE.Group(); g.position.set(x, TUBE_BASE, 0); world.add(g);
    add(new THREE.CylinderGeometry(0.11, 0.11, TUBE_H, 24, 1, true, 0.55, Math.PI * 2 - 1.1), mat, 0, TUBE_H / 2, 0, g);          // fente ouverte vers +z : on voit l'aimant
    for (const y of [0.01, TUBE_H]) add(new THREE.TorusGeometry(0.115, 0.014, 6, 24), mRim, 0, y, 0, g).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 20), mWoodD, 0, -0.04, 0, g);
    add(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 16), M('#8a5a3a'), 0, 0.02, 0, g);   // coussin d'arrivée
    for (let i = 1; i < 7; i++) add(new THREE.TorusGeometry(0.113, 0.006, 5, 24), M('#2a1e22'), 0, i * TUBE_H / 7, 0, g, { cast: false }).rotation.x = Math.PI / 2;   // graduations : on voit défiler
    return g; };
  tubeMesh(TUBE_X.cu, CU2, mBrass); tubeMesh(TUBE_X.pl, PL, PLC);
  const magnet = (x, glow) => { const g = new THREE.Group(); world.add(g);
    add(new THREE.CylinderGeometry(0.068, 0.068, MAG_H / 2, 16), glow ? new THREE.MeshBasicMaterial({ color: '#c7a6ff' }) : M('#e23d32'), 0, MAG_H / 4, 0, g);
    add(new THREE.CylinderGeometry(0.068, 0.068, MAG_H / 2, 16), glow ? new THREE.MeshBasicMaterial({ color: '#8f6aff' }) : mSteel, 0, -MAG_H / 4, 0, g);
    add(new THREE.TorusGeometry(0.069, 0.007, 5, 16), mIron, 0, 0, 0, g, { cast: false }).rotation.x = Math.PI / 2; g.position.x = x; return g; };
  const mCu = magnet(TUBE_X.cu), mPl = magnet(TUBE_X.pl), mGhost = magnet(TUBE_X.cu, true);
  mCu.children.forEach((m) => { m.castShadow = false; });
  // ---------- l'électroaimant de Foucault : disque entre deux pôles ----------
  const DX = DISC.x, DY = DISC.y;
  add(box(3.0, 0.1, 1.1), mTop, DX, 0.88, 0, world); add(box(2.8, 0.14, 0.95), mWoodD, DX, 0.78, 0, world);
  for (const sx of [-1.35, 1.35]) for (const sz of [-0.45, 0.45]) add(box(0.12, 0.8, 0.12), mWoodD, DX + sx, 0.4, sz, world);
  add(box(1.4, 0.08, 1.0), mIron, DX, 0.97, 0, world); add(box(0.12, DY - 0.97, 0.12), mIron, DX, (DY + 0.97) / 2, -0.07, world);
  const discMat = toon({ color: '#d98040', emissive: new THREE.Color(0, 0, 0) });
  const discG = new THREE.Group(); discG.position.set(DX, DY, 0); world.add(discG);
  add(new THREE.CylinderGeometry(DISC.r, DISC.r, 0.025, 40), discMat, 0, 0, 0, discG).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(DISC.r, 0.014, 6, 40), M('#a04a22'), 0, 0, 0, discG, { cast: false });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; add(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), M('#6a3216'), Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0, discG, { cast: false }).rotation.x = Math.PI / 2; }
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 14), mBrass, 0, 0, 0.02, discG).rotation.x = Math.PI / 2;
  // pôles + bobines + culasse (en C, à droite du disque)
  const PX = DX + 0.2;
  for (const s of [-1, 1]) { const pole = add(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 14), mSteel, PX, DY, s * 0.29, world); pole.rotation.x = Math.PI / 2;
    const coil = add(new THREE.CylinderGeometry(0.15, 0.15, 0.32, 18), M('#c0402a'), PX, DY, s * 0.38, world); coil.rotation.x = Math.PI / 2;
    for (let k = 0; k < 4; k++) add(new THREE.TorusGeometry(0.15, 0.012, 5, 18), M('#7a2418'), PX, DY, s * (0.25 + k * 0.08), world, { cast: false }); }
  add(box(0.16, 0.34, 1.4), mIron, DX + 0.58, DY, 0, world); add(box(0.4, 0.34, 0.12), mIron, DX + 0.38, DY, -0.64, world); add(box(0.4, 0.34, 0.12), mIron, DX + 0.38, DY, 0.64, world);
  // manivelle (devant le disque)
  const crank = new THREE.Group(); crank.position.set(DX, DY, 0.075); world.add(crank);
  add(box(0.34, 0.05, 0.04), mIron, -0.14, 0, 0, crank); add(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 8), M('#8a4a22'), -0.3, 0, 0.07, crank).rotation.x = Math.PI / 2;
  // boucles de courants de Foucault (visibles seulement à l'étape « petits courants »)
  const eddy = new THREE.Group(); eddy.position.set(PX, DY, 0.05); world.add(eddy);
  const ringM = [new THREE.MeshBasicMaterial({ color: '#fff06a' }), new THREE.MeshBasicMaterial({ color: '#7fe8ff' }), new THREE.MeshBasicMaterial({ color: '#ffb0ff' })];
  const rings = [0.11, 0.17, 0.23].map((rr, i) => add(new THREE.TorusGeometry(rr, 0.011, 6, 36), ringM[i], 0, 0, 0, eddy, { cast: false }));
  eddy.visible = false;
  // ---------- plaque de cuivre sur son support ----------
  add(box(0.8, 0.07, 0.5), mWoodD, -4.2, 0.95, 0, world); add(box(0.1, 0.5, 0.1), mWoodD, -4.2, 0.7, 0, world);
  add(box(0.7, 0.6, 0.03), CU, -4.2, 1.35, 0, world); add(box(0.74, 0.04, 0.08), mWoodD, -4.2, 1.03, 0, world);
  add(box(1.0, 0.1, 0.8), mTop, -4.2, 0.55, 0, world); for (const sx of [-0.4, 0.4]) add(box(0.08, 0.5, 0.08), mWoodD, -4.2 + sx, 0.25, 0, world);
  // ---------- pendule de Foucault, accroché au plafond (au fond à gauche) ----------
  const pend = new THREE.Group(); pend.position.set(PEND.x, PEND.pivY, PEND.z); world.add(pend);
  add(new THREE.CylinderGeometry(0.012, 0.012, PEND.L, 6), mIron, 0, -PEND.L / 2, 0, pend, { cast: false });
  add(new THREE.SphereGeometry(0.2, 18, 14), mBrass, 0, -PEND.L - 0.2, 0, pend); add(new THREE.ConeGeometry(0.05, 0.22, 8), mIron, 0, -PEND.L - 0.5, 0, pend).rotation.x = Math.PI;
  add(box(0.5, 0.1, 0.5), mIron, PEND.x, 4.35, PEND.z, world);
  // ---------- tableau noir, globe, établi, lampes ----------
  { const c = cv(512, 320, (g, w, h) => { g.fillStyle = '#2d3b36'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(150, 150, 70, 0, 6.28); g.moveTo(80, 150); g.lineTo(220, 150); g.moveTo(150, 80); g.lineTo(150, 220); g.moveTo(300, 100); g.lineTo(440, 100); g.moveTo(300, 160); g.lineTo(420, 160); g.moveTo(300, 220); g.lineTo(380, 220); g.stroke(); });
    add(new THREE.PlaneGeometry(2.4, 1.5), toon({ map: P.tex(c) }), -13.9, 2.5, 3.6, world, { cast: false }).rotation.y = Math.PI / 2; add(box(0.08, 1.7, 2.6), mWoodD, -14.0, 2.5, 3.6, world); }
  add(new THREE.CylinderGeometry(0.06, 0.1, 0.9, 10), mBrass, 12.2, 0.55, 3.2, world); add(new THREE.SphereGeometry(0.42, 18, 14), M('#6fa8d8'), 12.2, 1.35, 3.2, world);
  const glowM = new THREE.MeshBasicMaterial({ color: '#ffe3a0', fog: false });
  for (const x of [-9, -3, 3, 9]) { add(box(0.04, 0.9, 0.04), mIron, x, 3.95, 1.2, world); add(new THREE.SphereGeometry(0.2, 10, 8), glowM, x, 3.4, 1.2, world, { cast: false }); add(new THREE.ConeGeometry(0.36, 0.26, 10), mIron, x, 3.68, 1.2, world); }
  // ---------- habillage ----------
  K.crate(-12.8, -2.9, { s: 0.8 }); K.crate(-12.8, -2.9, { s: 0.55, y: 0.8 }); K.barrel(-13, -1.6); K.barrel(13, -3.0); K.sack(12.9, -2.2); K.pot(-6.3, -3.4); K.pot(7.4, -3.4); K.pot(2.4, -3.4);
  for (const x of [-10, -5, 0, 5, 10]) for (const yaw of [-30, 0, 30]) K.backdrop([x, 0, 0.5], yaw, { kinds: ['crate', 'barrel', 'sack', 'pot'], n: 2, near: 2.2, far: 3.4, spread: 0.35, avoid: (px, pz) => pz < -3.4 || pz > 9 || px < -13.5 || px > 13.5 || (Math.abs(pz) < 1.3 && px > -1.8 && px < 1.8) || (Math.abs(px - 6) < 2 && Math.abs(pz) < 1.3) });
  const clouds = [];
  const col = new THREE.Color();
  function state(S, f) {
    const cu = S.cu || { y: TUBE_TOP - 0.4, ghost: 0 }, pl = S.pl || { y: TUBE_BASE + 0.1, vis: 1 };
    mCu.position.y = cu.y; mCu.position.z = cu.dz || 0; mCu.rotation.z = cu.rot || 0; mPl.position.y = pl.y; mPl.scale.setScalar(pl.k ?? 1); mPl.visible = pl.vis !== 0;
    const gh = cu.ghost ?? 0; mGhost.visible = gh > 0.02; mGhost.position.y = cu.y - 0.19 - 0.02 * Math.sin(f * 0.5); mGhost.scale.set(1, gh, 1); mGhost.rotation.z = Math.PI;
    pend.rotation.z = S.pend ?? 0.2 * Math.sin(f * 0.07);
    discG.rotation.z = -(S.discA ?? 0); crank.rotation.z = -(S.crank ?? 0);
    const h = S.hot ?? 0; discMat.emissive.setRGB(0.95 * h, 0.35 * h, 0.04 * h);
    const e = S.eddy ?? 0; eddy.visible = e > 0.02; rings.forEach((m, i) => { m.scale.setScalar((0.6 + 0.4 * e) * (1 + 0.06 * Math.sin(f * 0.4 + i * 2))); m.rotation.z = f * 0.1 * (i % 2 ? -1 : 1); });
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
