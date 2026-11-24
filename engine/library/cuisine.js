// Library set : cuisine de campagne en fête (Pourkoipa original). Carreaux, fenêtre, cuisinière avec four, plan de travail, évier, frigo, poubelle,
// guirlande « Bon anniversaire », ballons, grande table à nappe à carreaux, arche vers un petit salon (fauteuil, lampe, livre).
// Pièce : x de -7 à 7, mur du fond z = -4.2 (arche vers le salon x 2.8..4.8), mur avant z = 8, plafond 3.3. Caméra côté +z (yaw ~0). DECK = 0.
// SPOTS : oven (devant le four), dish (plan de travail à droite du four, où pose le plat), bin, table (centre), sink, arch, salon.
// state(S, f) :
//   S.oven  : porte du four (0 fermée .. 1 grande ouverte)
//   S.cake  : { at: 'oven' | 'counter' | 'table' | 'none', c: 0 (bien levé, dôme) .. 1 (effondré, creux), eaten: 0..1 (part mangée) }
//   S.win   : luminosité de la fenêtre (0 nuit .. 1 jour)     S.lid : couvercle de la poubelle (0 fermé .. 1 ouvert)
//   S.ing   : ingrédients sur le plan de travail (0/1 : saladier, oeufs, farine)
import { propKit } from './props.js';
export const DECK = 0;
export const SPOTS = { oven: [-4.2, 0, -2.5], dish: [-2.0, 0.95, -3.85], bin: [0.6, 0, -3.2], table: [3.6, 0, -0.7], sink: [-0.5, 0, -3.5], arch: [3.8, 0, -3.6], salon: [3.8, 0, -6.4] };

export function buildCuisine(ctx, { seed = 2412 } = {}) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const lerpC = (m, a, b, t) => m.color.set(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t)));
  // ---------- textures ----------
  const tileT = cv(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#e8d6b4' : '#c2663c'; g.fillRect(i * 64, j * 64, 64, 64); }
    g.strokeStyle = 'rgba(70,40,30,0.6)'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
    for (let k = 0; k < 300; k++) { g.fillStyle = 'rgba(90,50,30,0.12)'; g.fillRect(r() * w, r() * h, 3, 3); } });
  const wallT = cv(256, 256, (g, w, h) => { g.fillStyle = '#f4d98a'; g.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${220 + r() * 30 | 0},${180 + r() * 40 | 0},${90 + r() * 40 | 0},0.22)`; g.fillRect(r() * w, r() * h, 3 + r() * 7, 3 + r() * 7); } });
  const clothT = cv(256, 256, (g, w, h) => { g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(214,60,50,0.78)'; for (let i = 0; i < 4; i++) { g.fillRect(i * 64, 0, 32, h); g.fillRect(0, i * 64, w, 32); } });
  const garT = cv(1024, 128, (g, w, h) => { g.strokeStyle = '#271925'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 8); g.lineTo(w, 8); g.stroke();
    const txt = 'BON ANNIVERSAIRE ', cols = ['#e8483a', '#ffd23a', '#3f9ad8', '#7cc043', '#ff8fb8', '#c86bff'], n = 17, step = w / n;
    for (let i = 0; i < n; i++) { const x = i * step; g.fillStyle = cols[i % cols.length]; g.strokeStyle = '#271925'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 4, 8); g.lineTo(x + step - 4, 8); g.lineTo(x + step / 2, 118); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#271925'; g.font = '800 46px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(txt[i] === ' ' ? '♥' : txt[i], x + step / 2, 62); } });
  const mFloor = toon({ map: P.tex(tileT, 7, 4) }), mWall = toon({ map: P.tex(wallT, 5, 1.2) });
  const mWood = M('#b07a46'), mWoodD = M('#7a5130'), mCab = M('#6fb4a8'), mCabD = M('#4f9488'), mTop = M('#c9905a'), mWhite = M('#f6f1e6'), mIron = M('#2f3440'), mCream = M('#efe3c8');
  // ---------- pièce ----------
  const fl = add(new THREE.PlaneGeometry(14, 13), mFloor, 0, 0.004, 1.5, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  const WZ = -4.2, WH = 3.3, T = { cast: false };
  add(box(9.6, WH, 0.3), mWall, -2.2, WH / 2, WZ, world, T); add(box(2.0, WH, 0.3), mWall, 6.0, WH / 2, WZ, world, T); add(box(2.4, WH - 2.4, 0.3), mWall, 3.8, 2.4 + (WH - 2.4) / 2, WZ, world, T);
  add(box(0.3, WH, 13), mWall, -7, WH / 2, 1.5, world, T); add(box(0.3, WH, 13), mWall, 7, WH / 2, 1.5, world, T); add(box(14, WH, 0.3), mWall, 0, WH / 2, 8, world, T);
  const ce = add(new THREE.PlaneGeometry(14, 13), M('#f6ecd2'), 0, WH, 1.5, world, T); ce.rotation.x = Math.PI / 2;
  for (const bx of [-4, 0, 4]) add(box(0.3, 0.25, 13), mWoodD, bx, WH - 0.12, 1.5, world, T);        // poutres
  add(box(9.6, 1.0, 0.1), M('#8fc9b6'), -2.2, 0.5, WZ + 0.2, world, T); add(box(2.0, 1.0, 0.1), M('#8fc9b6'), 6.0, 0.5, WZ + 0.2, world, T); add(box(9.6, 0.07, 0.14), mWhite, -2.2, 1.0, WZ + 0.2, world, T);   // lambris
  // ---------- salon derrière l'arche ----------
  const sf = add(new THREE.PlaneGeometry(6, 5), M('#b88a5c'), 3.8, 0.004, -6.7, world, T); sf.rotation.x = -Math.PI / 2; add(box(6, WH, 0.2), M('#e8c8a0'), 3.8, WH / 2, -9.2, world, T); add(box(0.2, WH, 5), M('#e8c8a0'), 0.8, WH / 2, -6.7, world, T); add(box(0.2, WH, 5), M('#e8c8a0'), 6.8, WH / 2, -6.7, world, T);
  add(new THREE.PlaneGeometry(3.2, 2.2), M('#a8465a'), 3.8, 0.012, -6.6, world, T).rotation.x = -Math.PI / 2;                                // tapis
  { const g = new THREE.Group(); g.position.set(3.8, 0, -5.9); g.rotation.y = 0; world.add(g); add(box(1.1, 0.5, 0.9), M('#3f9ad8'), 0, 0.3, 0, g); add(box(1.1, 0.8, 0.22), M('#3f9ad8'), 0, 0.8, -0.34, g); for (const sx of [-0.5, 0.5]) add(box(0.2, 0.62, 0.9), M('#2f7ab8'), sx, 0.5, 0, g); }   // fauteuil
  { const g = new THREE.Group(); g.position.set(2.1, 0, -8.6); world.add(g); add(box(0.9, 1.9, 0.35), mWoodD, 0, 0.95, 0, g); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) add(box(0.14, 0.3, 0.1), M(['#d23a32', '#3f9ad8', '#ffd23a', '#7cc043', '#c86bff'][(i + j * 2) % 5]), -0.33 + j * 0.165, 0.35 + i * 0.4, 0.2, g, T); }  // bibliothèque
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), mIron, 6.2, 0.75, -8.4, world, T); add(new THREE.ConeGeometry(0.28, 0.3, 10), BASIC('#ffd68a'), 6.2, 1.6, -8.4, world, T);   // lampadaire
  // ---------- fenêtre (au-dessus de l'évier) ----------
  const WIN = [-0.5, 1.9, WZ + 0.2], winM = BASIC('#bfe4ff');
  add(box(1.7, 1.3, 0.05), winM, WIN[0], WIN[1], WIN[2], world, T);
  for (const [dx, dy, w, h] of [[0, 0, 1.9, 0.1], [0, 0.65, 1.9, 0.12], [0, -0.65, 1.9, 0.12], [-0.85, 0, 0.12, 1.3], [0.85, 0, 0.12, 1.3], [0, 0, 0.07, 1.3]]) add(box(w, h, 0.1), mWhite, WIN[0] + dx, WIN[1] + dy, WIN[2] + 0.05, world, T);
  add(box(2.1, 0.07, 0.25), mWhite, WIN[0], 1.22, WIN[2] + 0.12, world, T); for (const sx of [-1, 1]) add(box(0.3, 1.5, 0.05), M('#e8483a'), WIN[0] + sx * 1.05, WIN[1], WIN[2] + 0.08, world, T);   // rideaux
  // ---------- meubles bas : tout le long du mur du fond (sauf four et arche) ----------
  const base = (x0, x1, col = mCab) => { const w = x1 - x0, cx = (x0 + x1) / 2; add(box(w, 0.9, 0.7), col, cx, 0.45, -3.85, world); add(box(w + 0.05, 0.06, 0.78), mTop, cx, 0.93, -3.82, world);
    const n = Math.max(1, Math.round(w / 0.8)); for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * w / n; add(box(w / n - 0.08, 0.72, 0.04), mCabD, x, 0.45, -3.47, world, T); add(new THREE.SphereGeometry(0.035, 6, 5), M('#f0c24a'), x + w / n * 0.3, 0.62, -3.43, world, T); } };
  base(-5.9, -4.8); base(-3.6, 1.5); base(5.0, 6.9);
  add(box(1.0, 1.9, 0.75), mWhite, -6.4, 0.95, -3.8, world); add(box(0.04, 0.5, 0.05), mIron, -5.95, 1.3, -3.4, world, T); add(box(0.9, 0.04, 0.02), mIron, -6.4, 1.15, -3.42, world, T); add(box(0.2, 0.2, 0.02), M('#ff8fb8'), -6.55, 1.5, -3.42, world, T); add(box(0.2, 0.25, 0.02), M('#ffd23a'), -6.2, 1.55, -3.42, world, T);   // frigo + aimants
  // évier
  add(box(0.9, 0.06, 0.55), M('#aab6c4'), SPOTS.sink[0], 0.97, -3.8, world, T); add(box(0.7, 0.04, 0.4), M('#6a7a8a'), SPOTS.sink[0], 0.99, -3.8, world, T); add(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), M('#c9ced6'), SPOTS.sink[0], 1.15, -4.0, world, T); add(box(0.04, 0.04, 0.2), M('#c9ced6'), SPOTS.sink[0], 1.32, -3.92, world, T);
  // ---------- cuisinière + four ----------
  const OV = { x: -4.2, w: 1.2 };
  add(box(OV.w, 0.1, 0.7), mIron, OV.x, 0.05, -3.85, world, T);                                                                              // plinthe
  add(box(0.1, 0.9, 0.7), mCream, OV.x - OV.w / 2 + 0.05, 0.45, -3.85, world); add(box(0.1, 0.9, 0.7), mCream, OV.x + OV.w / 2 - 0.05, 0.45, -3.85, world);
  add(box(OV.w, 0.14, 0.7), mCream, OV.x, 0.83, -3.85, world); add(box(OV.w, 0.1, 0.7), mCream, OV.x, 0.14, -3.85, world); add(box(OV.w + 0.04, 0.05, 0.78), mIron, OV.x, 0.93, -3.82, world);
  for (const px of [-0.3, 0.3]) for (const pz of [-0.12, 0.12]) add(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 12), M('#1a1a22'), OV.x + px, 0.965, -3.85 + pz, world, T);   // plaques
  const cavM = BASIC('#3a1c10'); cavM.side = THREE.BackSide; const cav = add(box(OV.w - 0.2, 0.62, 0.6), cavM, OV.x, 0.48, -3.9, world, T); const glow = add(box(OV.w - 0.26, 0.5, 0.02), BASIC('#ff9a3a'), OV.x, 0.48, -4.18, world, T);
  add(box(OV.w - 0.22, 0.03, 0.55), mIron, OV.x, 0.4, -3.9, world, T);                                                                           // la grille
  for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), M('#e8483a'), OV.x - 0.3 + i * 0.3, 0.8, -3.49, world, T).rotation.x = Math.PI / 2;   // boutons
  const door = new THREE.Group(); door.position.set(OV.x, 0.17, -3.5); world.add(door);
  add(box(OV.w - 0.18, 0.62, 0.06), mCream, 0, 0.31, 0.03, door); add(box(OV.w - 0.4, 0.36, 0.02), BASIC('#5a2a18'), 0, 0.34, 0.07, door, T); add(box(OV.w - 0.3, 0.05, 0.08), mIron, 0, 0.6, 0.09, door, T);
  // ---------- le gâteau (3D) : plat bleu, couronne dorée, centre qui se creuse ----------
  const cakeG = new THREE.Group(); cakeG.scale.setScalar(0.75); world.add(cakeG);
  add(new THREE.CylinderGeometry(0.4, 0.36, 0.06, 20), M('#4a86c8'), 0, 0.03, 0, cakeG, T);
  const cakeM = M('#e3a14a'); cakeM.side = THREE.DoubleSide; let cakeMesh = null, cakeKey = '';
  const hole = add(new THREE.CircleGeometry(0.16, 16), M('#f8dc92'), 0, 0.12, 0, cakeG, T); hole.rotation.x = -Math.PI / 2;
  const cakeShape = (c) => { const key = c.toFixed(2); if (key === cakeKey) return; cakeKey = key; if (cakeMesh) { cakeG.remove(cakeMesh); cakeMesh.geometry.dispose(); }
    const yR = 0.26 - 0.03 * c, yC = 0.44 - 0.28 * c, pts = [[0.001, 0.06], [0.31, 0.06], [0.32, 0.14], [0.3, yR]];
    for (const rr of [0.25, 0.2, 0.15, 0.1, 0.05, 0.001]) { const u = 1 - Math.pow(rr / 0.3, 2); pts.push([rr, yR + (yC - yR) * u]); }
    cakeMesh = add(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 22), cakeM, 0, 0, 0, cakeG); hole.position.y = yC + 0.004; hole.visible = c > 0.35; };
  const crumbs = []; for (let i = 0; i < 12; i++) crumbs.push(add(new THREE.IcosahedronGeometry(0.012, 0), M('#d98e38'), (r() - 0.5) * 0.5, 0.068, (r() - 0.5) * 0.5, cakeG, T));
  // ---------- ingrédients (flash-back) ----------
  const ing = new THREE.Group(); ing.position.set(-0.7, 0.96, -3.8); world.add(ing);
  add(new THREE.CylinderGeometry(0.28, 0.2, 0.22, 14), M('#e8483a'), 0, 0.11, 0, ing); add(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 14), M('#f6e7b4'), 0, 0.22, 0, ing, T);
  for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(0.06, 8, 6), M('#f8efe0'), 0.5 + i * 0.12, 0.06, 0.1, ing, T).scale.set(1, 1.3, 1); add(box(0.2, 0.3, 0.12), M('#f3ead2'), -0.55, 0.15, 0, ing, T);
  // ---------- étagères, bocaux, guirlande, ballons ----------
  const shelfY = 2.1; add(box(3.4, 0.05, 0.3), mWoodD, -1.9, shelfY, WZ + 0.3, world, T);
  ['#e8483a', '#f0c24a', '#7cc043', '#3f9ad8', '#ff8fb8', '#c86bff', '#ff9a3a'].forEach((c, i) => add(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 10), M(c), -3.3 + i * 0.45, shelfY + 0.16, WZ + 0.3, world, T));
  for (let i = 0; i < 4; i++) { add(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), mIron, 0.6 + i * 0.5, 2.9, WZ + 0.2, world, T); add(new THREE.CylinderGeometry(0.16, 0.12, 0.28, 10), M('#c8643a'), 0.6 + i * 0.5, 2.62, WZ + 0.22, world, T); }   // casseroles
  const gar = add(new THREE.PlaneGeometry(8.8, 1.0), new THREE.MeshBasicMaterial({ map: P.tex(garT), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, fog: false }), -1.5, 2.85, WZ + 0.35, world, T);
  const balls = []; [[1.9, '#e8483a'], [2.4, '#ffd23a'], [4.7, '#3f9ad8'], [5.2, '#ff8fb8'], [-6.2, '#7cc043'], [6.4, '#c86bff'], [0.5, '#ff9a3a']].forEach(([x, c], i) => { const g = new THREE.Group(); g.position.set(x, 2.2 + (i % 3) * 0.2, i % 2 ? -2.6 : -1.8); world.add(g);
    add(new THREE.SphereGeometry(0.28, 12, 10), M(c), 0, 0.3, 0, g, T).scale.set(1, 1.2, 1); add(new THREE.CylinderGeometry(0.004, 0.004, 1.8, 3), BASIC('#555555'), 0, -0.6, 0, g, T); balls.push(g); });
  // ---------- table de fête : nappe à carreaux, assiettes, verres, chaises ----------
  const TB = SPOTS.table; add(box(3.4, 0.08, 1.2), toon({ map: P.tex(clothT, 3, 1) }), TB[0], 0.78, TB[2], world);
  add(box(3.5, 0.3, 0.04), toon({ map: P.tex(clothT, 3, 0.3) }), TB[0], 0.62, TB[2] + 0.62, world, T);
  for (const sx of [-1.55, 1.55]) for (const sz of [-0.5, 0.5]) add(box(0.1, 0.74, 0.1), mWoodD, TB[0] + sx, 0.37, TB[2] + sz, world, T);
  for (let i = 0; i < 6; i++) { const x = TB[0] - 1.3 + i * 0.52, z = TB[2] + (i % 2 ? 0.28 : -0.28); add(new THREE.CylinderGeometry(0.17, 0.15, 0.025, 14), M('#fbfbf6'), x, 0.83, z, world, T); add(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 8), M('#cfe6ee'), x + 0.2, 0.88, z - 0.1, world, T); }
  add(new THREE.CylinderGeometry(0.06, 0.07, 0.34, 8), M('#2f7a4a'), TB[0] + 0.4, 1.0, TB[2], world, T); add(new THREE.CylinderGeometry(0.2, 0.15, 0.1, 12), M('#e8483a'), TB[0] - 0.4, 0.88, TB[2], world, T);
  for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.06, 6, 5), M(['#e8483a', '#f2b52a', '#7cc043'][i % 3]), TB[0] - 0.4 + (i % 3 - 1) * 0.07, 0.96, TB[2] + (i % 2 - 0.5) * 0.08, world, T);   // pommes dans le saladier
  const chair = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g); add(box(0.5, 0.06, 0.5), mWood, 0, 0.5, 0, g, T); add(box(0.5, 0.55, 0.05), mWood, 0, 0.8, -0.23, g, T); for (const [sx, sz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) add(box(0.05, 0.5, 0.05), mWoodD, sx, 0.25, sz, g, T); };
  for (const x of [-0.8, 0.8]) chair(TB[0] + x, TB[2] - 1.15, 0); chair(TB[0] + 2.1, TB[2], -Math.PI / 2);
  // ---------- poubelle à pédale ----------
  const bn = new THREE.Group(); bn.position.set(SPOTS.bin[0], 0, SPOTS.bin[2]); world.add(bn);
  add(new THREE.CylinderGeometry(0.26, 0.22, 0.7, 14), M('#9aa6b4'), 0, 0.35, 0, bn); const lid = new THREE.Group(); lid.position.set(0, 0.7, -0.24); bn.add(lid); add(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 14), M('#6a7a8a'), 0, 0.02, 0.24, lid, T); add(new THREE.SphereGeometry(0.05, 6, 5), M('#2c3038'), 0, 0.07, 0.24, lid, T);
  // ---------- habillage : plantes, tapis, panier, affiches ----------
  K.pot(6.4, -2.6, {}); K.pot(-6.4, 3.0, {}); K.pot(-6.3, -1.4, {});
  add(new THREE.PlaneGeometry(2.4, 1.0), M('#3f9ad8'), -3.0, 0.013, -1.8, world, T).rotation.x = -Math.PI / 2; add(new THREE.PlaneGeometry(1.6, 0.7), M('#ffd23a'), -3.0, 0.015, -1.8, world, T).rotation.x = -Math.PI / 2;   // tapis devant le four
  for (const [x, y, w, h, c1, c2] of [[-6.85, 2.0, 0.9, 1.1, '#f0a830', '#d23a32'], [6.85, 2.2, 0.8, 1.0, '#3f9ad8', '#fff2c0']]) { const c = cv(128, 160, (g, W, H) => { g.fillStyle = c1; g.fillRect(0, 0, W, H); g.fillStyle = c2; g.beginPath(); g.arc(64, 62, 34, 0, 7); g.fill(); g.fillRect(20, 112, 88, 12); });
    const pl = add(new THREE.PlaneGeometry(w, h), toon({ map: P.tex(c) }), x, y, 1.5, world, T); pl.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; }
  K.crate(-6.2, 6.0, { s: 0.6 }); K.sack(-5.4, 6.3, {});
  const clouds = [];
  function state(S, f) {
    door.rotation.x = (S.oven ?? 0) * 1.5; glow.visible = (S.oven ?? 0) > 0.05;
    lerpC(winM, '#2c3a7a', '#bfe4ff', S.win ?? 1);
    const ck = S.cake || { at: 'none', c: 1, eaten: 0 }, at = ck.at, c = Math.max(0, Math.min(1, ck.c ?? 1)), ea = ck.eaten ?? 0;
    cakeG.visible = at !== 'none';
    if (at === 'oven') cakeG.position.set(OV.x, 0.43, -3.9); else if (at === 'counter') cakeG.position.set(SPOTS.dish[0], SPOTS.dish[1], SPOTS.dish[2] + 0.1); else if (at === 'table') cakeG.position.set(SPOTS.table[0], 0.82, SPOTS.table[2]);
    cakeShape(c); cakeMesh.scale.set(1 - 0.65 * ea, 1, 1 - 0.65 * ea); cakeMesh.visible = ea < 0.97; hole.scale.setScalar(1 - 0.65 * ea); hole.visible = hole.visible && ea < 0.97;
    crumbs.forEach((m, i) => { m.visible = ea > 0.6; });
    ing.visible = !!S.ing; lid.rotation.x = -(S.lid ?? 0) * 1.7;
    balls.forEach((g, i) => { g.rotation.z = Math.sin(f * 0.04 + i * 2) * 0.05; });
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
