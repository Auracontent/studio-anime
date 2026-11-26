// Library set : chambre d'enfant la nuit, table de couture sous la lampe (Pourkoipa original). Parquet, papier peint à étoiles, fenêtre (nuit -> aube -> jour),
// affiche « Fête de l'école », horloge murale, lit avec peluche, table avec le COSTUME DE SOLEIL en 3D (disque + 8 rayons), aiguille 3D à fil jaune,
// bobines, pelote à épingles, ciseaux, lampe de bureau, bibliothèque, commode, tapis, chutes de tissu par terre.
// Pièce : x de -5 à 5, mur du fond z = -3.5, murs latéraux et mur avant z = 7 ; pas de plafond (les grues peuvent survoler). Caméra côté +z (yaw ~0).
// SPOTS : table (centre de la table), cloth (le costume sur la table), bed, lamp, clock, poster, floorRay (où tombe un rayon).
// state(S, f) :
//   S.crook  : 0..1 les rayons du costume sont de travers (0 droits)    S.fallen : 0..1 un rayon se détache et tombe par terre (1 = au sol)
//   S.tear   : 0..1 la déchirure du tissu s'ouvre                       S.stitch : 0..1 des points de couture apparaissent autour du disque
//   S.sew    : 0..1 le costume est fini (rayons presque droits, points partout)   S.nd : [x, y, z] position de l'aiguille ou null (cachée)
//   S.win    : 0 nuit, 0.5 aube orange, 1 plein jour (fenêtre)        S.clock : heure (0..12) de l'horloge murale
//   S.lamp   : 0..1 luminosité de la lampe de bureau                   S.cloth : 0/1 montre le costume sur la table (0 = tissu replié)
import { propKit } from './props.js';
export const DECK = 0;
export const SPOTS = { table: [-1.5, 0.93, -2.7], cloth: [-1.0, 0.98, -2.7], bed: [2.9, 0, -2.3], lamp: [-2.35, 0.93, -3.0], clock: [1.0, 2.7, -3.42], poster: [3.0, 2.4, -3.42], floorRay: [-0.2, 0.02, -1.5], spool: [-1.9, 1.05, -3.0] };
const RAYS = 8;

export function buildChambre(ctx, { seed = 2611 } = {}) {
  const { THREE, P, world, add, box, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const T = { cast: false };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerpC = (m, a, b, t) => m.color.set(a).lerp(new THREE.Color(b), clamp(t));
  const hash = (i, k) => { const x = Math.sin((i + 1) * 12.9898 * (k + 1) + seed) * 43758.5453; return x - Math.floor(x); };
  // ---------- textures ----------
  const floorT = cv(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) { g.fillStyle = ['#c8924e', '#b9823f', '#cf9a58', '#c08a48'][i]; g.fillRect(0, i * 64, w, 64); g.strokeStyle = 'rgba(70,40,20,0.7)'; g.lineWidth = 4; g.strokeRect(0, i * 64, w, 64);
    for (let k = 0; k < 30; k++) { g.fillStyle = 'rgba(100,60,30,0.15)'; g.fillRect(r() * w, i * 64 + r() * 60, 20 + r() * 40, 2); } for (const bx of [60 + i * 50, 190 - i * 30]) { g.beginPath(); g.moveTo(bx % w, i * 64); g.lineTo(bx % w, i * 64 + 64); g.stroke(); } } });
  const wallT = cv(256, 256, (g, w, h) => { g.fillStyle = '#8fb6e8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.22)'; for (let i = 0; i < 6; i++) g.fillRect(i * 43, 0, 20, h);
    for (let k = 0; k < 9; k++) { const x = 20 + (k % 3) * 85 + (k > 5 ? 20 : 0), y = 30 + Math.floor(k / 3) * 80; g.fillStyle = '#ffe27a'; g.beginPath(); for (let a = 0; a < 10; a++) { const rr = a % 2 ? 6 : 14, an = a * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.closePath(); g.fill(); } });
  const rugT = cv(256, 256, (g, w, h) => { g.fillStyle = '#e8483a'; g.fillRect(0, 0, w, h); for (const [rr, c] of [[120, '#f6e7b4'], [92, '#3f9ad8'], [64, '#f6e7b4'], [36, '#ffd23a']]) { g.fillStyle = c; g.beginPath(); g.arc(128, 128, rr, 0, 7); g.fill(); } });
  const posterT = cv(256, 360, (g, w, h) => { g.fillStyle = '#ffe9a8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#271925'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#ff8a1e'; g.beginPath(); g.arc(128, 130, 52, 0, 7); g.fill(); g.strokeStyle = '#ff8a1e'; g.lineWidth = 14; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; g.beginPath(); g.moveTo(128 + Math.cos(a) * 66, 130 + Math.sin(a) * 66); g.lineTo(128 + Math.cos(a) * 94, 130 + Math.sin(a) * 94); g.stroke(); }
    g.fillStyle = '#271925'; g.textAlign = 'center'; g.font = '900 34px Montserrat, Arial, sans-serif'; g.fillText('FÊTE', 128, 262); g.fillText("DE L'ÉCOLE", 128, 302); g.font = '800 24px Montserrat, Arial, sans-serif'; g.fillStyle = '#d23a32'; g.fillText('DEMAIN !', 128, 340); });
  const patT = cv(256, 256, (g, w, h) => { g.fillStyle = '#fff4cc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a8aa8'; g.lineWidth = 2; for (let i = 0; i < 256; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
    g.strokeStyle = '#271925'; g.lineWidth = 6; g.setLineDash([14, 8]); g.beginPath(); g.arc(128, 150, 54, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(128 + Math.cos(a) * 62, 150 + Math.sin(a) * 62); g.lineTo(128 + Math.cos(a) * 112, 150 + Math.sin(a) * 112); g.stroke(); } });
  const mWall = toon({ map: P.tex(wallT, 6, 1.5) }), mFloor = toon({ map: P.tex(floorT, 5, 5) });
  const mWood = M('#b07a46'), mWoodD = M('#7a5130'), mWhite = M('#f6f1e6'), mIron = M('#2f3440'), mCream = M('#efe3c8');
  // ---------- pièce ----------
  const fl = add(new THREE.PlaneGeometry(10.4, 10.9), mFloor, 0, 0.004, 1.95, world, T); fl.rotation.x = -Math.PI / 2;
  const WZ = -3.5, WH = 3.3;
  add(box(10.4, WH, 0.3), mWall, 0, WH / 2, WZ - 0.15, world, T); add(box(0.3, WH, 10.9), mWall, -5.15, WH / 2, 1.95, world, T); add(box(0.3, WH, 10.9), mWall, 5.15, WH / 2, 1.95, world, T); add(box(10.4, WH, 0.3), mWall, 0, WH / 2, 7.15, world, T);
  add(box(10.4, 0.16, 0.1), mWhite, 0, 0.08, WZ + 0.05, world, T); add(box(10.4, 0.1, 0.1), mWoodD, 0, 1.0, WZ + 0.05, world, T);   // plinthe + lambris
  // ---------- fenêtre (nuit / aube / jour) ----------
  const WIN = [-3.7, 1.9, WZ + 0.06], winM = BASIC('#1c2766'), disc = BASIC('#eef2ff');
  add(box(1.9, 1.5, 0.05), winM, WIN[0], WIN[1], WIN[2], world, T);
  const dsc = add(new THREE.CircleGeometry(0.2, 18), disc, WIN[0] + 0.3, WIN[1] + 0.3, WIN[2] + 0.04, world, T);
  for (let i = 0; i < 8; i++) add(new THREE.CircleGeometry(0.025, 5), BASIC('#ffffff'), WIN[0] - 0.8 + hash(i, 1) * 1.6, WIN[1] - 0.6 + hash(i, 2) * 1.2, WIN[2] + 0.035, world, T);
  for (const [dx, dy, w, h] of [[0, 0.78, 2.1, 0.12], [0, -0.78, 2.1, 0.12], [-0.98, 0, 0.12, 1.6], [0.98, 0, 0.12, 1.6], [0, 0, 0.08, 1.5], [0, 0, 1.9, 0.08]]) add(box(w, h, 0.1), mWhite, WIN[0] + dx, WIN[1] + dy, WIN[2] + 0.06, world, T);
  add(box(2.3, 0.07, 0.3), mWhite, WIN[0], 1.1, WIN[2] + 0.14, world, T); for (const sx of [-1, 1]) add(box(0.35, 1.8, 0.06), M('#ffb15a'), WIN[0] + sx * 1.2, WIN[1], WIN[2] + 0.1, world, T);
  // ---------- affiche, patron de soleil épinglé, horloge ----------
  add(new THREE.PlaneGeometry(0.9, 1.26), toon({ map: P.tex(posterT) }), SPOTS.poster[0], SPOTS.poster[1], SPOTS.poster[2], world, T);
  add(new THREE.PlaneGeometry(0.95, 0.95), toon({ map: P.tex(patT) }), -1.4, 2.35, WZ + 0.04, world, T);
  for (const [dx, dy] of [[-0.44, 0.44], [0.44, 0.44], [-0.44, -0.44], [0.44, -0.44]]) add(new THREE.SphereGeometry(0.03, 6, 5), M('#d23a32'), -1.4 + dx, 2.35 + dy, WZ + 0.07, world, T);
  const clockG = new THREE.Group(); clockG.position.set(...SPOTS.clock); world.add(clockG);
  add(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24), M('#f6f1e6'), 0, 0, 0, clockG, T).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.34, 0.035, 8, 24), M('#d23a32'), 0, 0, 0.03, clockG, T);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; add(box(0.02, i % 3 ? 0.04 : 0.07, 0.01), mIron, Math.sin(a) * 0.27, Math.cos(a) * 0.27, 0.05, clockG, T).rotation.z = -a; }
  const hHand = new THREE.Group(), mHand = new THREE.Group(); clockG.add(hHand, mHand); add(box(0.035, 0.18, 0.02), mIron, 0, 0.09, 0.06, hHand, T); add(box(0.025, 0.27, 0.02), mIron, 0, 0.135, 0.07, mHand, T);
  // ---------- lit + peluche ----------
  const B = SPOTS.bed; add(box(2.6, 0.3, 1.5), mWoodD, B[0], 0.15, B[2]); add(box(0.12, 1.1, 1.5), mWoodD, B[0] + 1.3, 0.55, B[2]); add(box(0.12, 0.7, 1.5), mWoodD, B[0] - 1.3, 0.35, B[2]);
  add(box(2.4, 0.3, 1.36), M('#f3ead2'), B[0], 0.45, B[2], world); add(new THREE.CylinderGeometry(0.28, 0.28, 1.0, 12), M('#ffffff'), B[0] + 1.0, 0.72, B[2], world).rotation.x = Math.PI / 2;     // matelas + oreiller
  const blanket = add(box(1.5, 0.12, 1.5), M('#e8483a'), B[0] - 0.4, 0.66, B[2] + 0.04, world); for (let i = 0; i < 4; i++) add(box(0.1, 0.13, 1.52), M('#ffd23a'), B[0] - 1.0 + i * 0.4, 0.66, B[2] + 0.04, world, T);   // couverture à rayures
  const ted = new THREE.Group(); ted.position.set(B[0] + 0.1, 0.7, B[2] + 0.72); ted.scale.setScalar(0.85); world.add(ted);
  add(new THREE.SphereGeometry(0.2, 12, 10), M('#b0743c'), 0, 0.2, 0, ted).scale.set(1, 1.15, 0.9); add(new THREE.SphereGeometry(0.15, 12, 10), M('#b0743c'), 0, 0.5, 0, ted);
  for (const sx of [-1, 1]) { add(new THREE.SphereGeometry(0.06, 8, 6), M('#b0743c'), sx * 0.11, 0.62, 0, ted); add(new THREE.SphereGeometry(0.07, 8, 6), M('#b0743c'), sx * 0.2, 0.28, 0.08, ted); }
  add(new THREE.SphereGeometry(0.05, 8, 6), M('#e8c89a'), 0, 0.47, 0.13, ted); add(new THREE.SphereGeometry(0.018, 6, 5), M('#271925'), -0.05, 0.54, 0.13, ted); add(new THREE.SphereGeometry(0.018, 6, 5), M('#271925'), 0.05, 0.54, 0.13, ted); add(new THREE.SphereGeometry(0.022, 6, 5), M('#271925'), 0, 0.5, 0.15, ted);
  // ---------- table de couture ----------
  const TB = SPOTS.table; add(box(2.6, 0.08, 1.2), M('#d8a868'), TB[0], TB[1] - 0.04, TB[2]); for (const sx of [-1.2, 1.2]) for (const sz of [-0.5, 0.5]) add(box(0.1, 0.9, 0.1), mWoodD, TB[0] + sx, 0.45, TB[2] + sz, world, T);
  add(box(2.5, 0.2, 0.04), M('#c8643a'), TB[0], 0.8, TB[2] + 0.6, world, T);
  // le costume de soleil : disque + 8 rayons plats, posés sur la table
  const CL = SPOTS.cloth, cloth = new THREE.Group(); cloth.position.set(CL[0], CL[1], CL[2]); cloth.scale.setScalar(0.55); world.add(cloth);
  const mDisc = M('#ffb81c'), mRay = [M('#ffd52e'), M('#ffc01c')];
  add(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 24), mDisc, 0, 0.015, 0, cloth);
  const rayGeo = (() => { const s = new THREE.Shape(); s.moveTo(-0.15, 0); s.lineTo(0.15, 0); s.lineTo(0, 0.6); s.closePath(); return new THREE.ShapeGeometry(s); })();
  const rayMat = mRay.map((m) => { const c = m.clone(); c.side = THREE.DoubleSide; return c; });
  const pivots = []; for (let i = 0; i < RAYS; i++) { const pv = new THREE.Group(); cloth.add(pv); const m = new THREE.Mesh(rayGeo, rayMat[i % 2]); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.02, -0.3); m.receiveShadow = true; pv.add(m); pivots.push({ pv, m }); }
  const tear = add(box(0.025, 0.012, 0.8), BASIC('#2a1a14'), 0.1, 0.04, 0.05, cloth, T); tear.rotation.y = 0.5; tear.scale.set(0, 1, 1);
  const stitchM = BASIC('#3a2a22'), stitches = []; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, s = add(box(0.05, 0.012, 0.016), stitchM, Math.cos(a) * 0.33, 0.034, Math.sin(a) * 0.33, cloth, T); s.rotation.y = -a + Math.PI / 2; stitches.push(s); }
  // aiguille 3D + fil
  const nd = new THREE.Group(); world.add(nd); add(new THREE.CylinderGeometry(0.008, 0.004, 0.55, 6), BASIC('#e4e8ee'), 0, 0, 0, nd, T); add(new THREE.SphereGeometry(0.014, 6, 5), BASIC('#e4e8ee'), 0, 0.28, 0, nd, T);
  const thread = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 1), BASIC('#ffd52e')); world.add(thread); thread.castShadow = false;
  const thread2 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 1), BASIC('#ffd52e')); world.add(thread2); thread2.castShadow = false;
  // bobines, pelote, ciseaux, mètre
  [['#ffd52e', -1.9, -3.0], ['#e8483a', -1.7, -2.97], ['#3f9ad8', -1.55, -3.05]].forEach(([c, x, z], i) => { add(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 10), mWoodD, x, 0.945, z, world, T); add(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 10), M(c), x, 0.995, z, world, T); add(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 10), mWoodD, x, 1.05, z, world, T); });
  add(new THREE.SphereGeometry(0.1, 10, 8), M('#d23a32'), -2.5, 0.99, -2.35, world, T).scale.set(1.2, 0.7, 1.2); for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.014, 5, 4), M(['#fff', '#ffd23a', '#3f9ad8'][i % 3]), -2.5 + (hash(i, 3) - 0.5) * 0.12, 1.05, -2.35 + (hash(i, 4) - 0.5) * 0.12, world, T);
  for (const s of [-1, 1]) add(box(0.025, 0.012, 0.22), M('#c9ced6'), -2.0 + s * 0.012, 0.975, -2.2, world, T).rotation.y = s * 0.12;
  add(box(0.04, 0.016, 0.5), M('#ffe27a'), -1.5, 0.97, -2.2, world, T).rotation.y = 0.2;
  // lampe de bureau (bulbe émissif + halo)
  const LP = SPOTS.lamp; add(new THREE.CylinderGeometry(0.14, 0.17, 0.04, 12), mIron, LP[0], LP[1] + 0.02, LP[2], world, T); add(new THREE.CylinderGeometry(0.018, 0.018, 0.7, 6), mIron, LP[0], LP[1] + 0.38, LP[2], world, T);
  add(new THREE.CylinderGeometry(0.05, 0.22, 0.26, 12, 1, true), new THREE.MeshToonMaterial({ color: '#e8483a', side: THREE.DoubleSide }), LP[0] - 0.3, LP[1] + 0.78, LP[2] + 0.12, world, T).rotation.z = 0.5; const arm = add(box(0.02, 0.02, 0.4), mIron, LP[0] - 0.15, LP[1] + 0.72, LP[2] + 0.06, world, T); arm.rotation.y = 0.3; arm.rotation.z = 0;
  const bulbM = BASIC('#fff0b0'); add(new THREE.SphereGeometry(0.06, 8, 6), bulbM, LP[0] - 0.3, LP[1] + 0.66, LP[2] + 0.12, world, T);
  const halo = add(new THREE.CircleGeometry(0.55, 20), new THREE.MeshBasicMaterial({ color: '#ffd68a', transparent: true, opacity: 0.18, fog: false, depthWrite: false }), LP[0] - 0.3, LP[1] + 0.66, LP[2] + 0.2, world, T); halo.userData.billboard = true;
  const pool = add(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: '#ffd68a', transparent: true, opacity: 0.16, fog: false, depthWrite: false }), TB[0] + 0.5, TB[1] + 0.012, TB[2] + 0.1, world, T); pool.rotation.x = -Math.PI / 2;
  // ---------- meubles : bibliothèque, commode, tapis, coffre à jouets, cartable ----------
  { const g = new THREE.Group(); g.position.set(4.5, 0, -3.0); world.add(g); add(box(0.9, 2.0, 0.4), mWoodD, 0, 1.0, 0, g); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) add(box(0.13, 0.32, 0.1), M(['#d23a32', '#3f9ad8', '#ffd23a', '#7cc043', '#c86bff'][(i * 2 + j) % 5]), -0.33 + j * 0.165, 0.3 + i * 0.45, 0.2, g, T); }
  { const g = new THREE.Group(); g.position.set(-4.4, 0, -3.0); world.add(g); add(box(1.2, 1.0, 0.6), mWood, 0, 0.5, 0, g); for (let i = 0; i < 3; i++) { add(box(1.05, 0.26, 0.04), mWoodD, 0, 0.2 + i * 0.3, 0.31, g, T); add(new THREE.SphereGeometry(0.035, 6, 5), M('#f0c24a'), 0, 0.2 + i * 0.3, 0.35, g, T); } add(box(0.4, 0.3, 0.3), M('#3f9ad8'), -0.3, 1.15, 0, g, T); add(new THREE.SphereGeometry(0.12, 8, 6), M('#e8483a'), 0.3, 1.12, 0, g, T); }
  const rug = add(new THREE.CircleGeometry(1.6, 28), toon({ map: P.tex(rugT) }), 0.4, 0.013, 0.2, world, T); rug.rotation.x = -Math.PI / 2;
  add(box(0.9, 0.5, 0.5), M('#3f9ad8'), 3.9, 0.25, 0.8, world, T); add(box(0.92, 0.1, 0.52), M('#f0c24a'), 3.9, 0.52, 0.8, world, T);
  { const g = new THREE.Group(); g.position.set(-4.1, 0, 0.0); g.rotation.y = 0.5; world.add(g); add(box(0.5, 0.4, 0.18), M('#e8483a'), 0, 0.25, 0, g, T); add(box(0.4, 0.2, 0.05), M('#c0392b'), 0, 0.28, 0.1, g, T); }
  // chutes de tissu jaune par terre + pelote
  for (let i = 0; i < 10; i++) { const m = add(new THREE.PlaneGeometry(0.15 + hash(i, 5) * 0.2, 0.1 + hash(i, 6) * 0.12), M(i % 3 ? '#ffd52e' : '#ffb81c'), -2.8 + hash(i, 7) * 2.6, 0.016, -1.9 + hash(i, 8) * 2.2, world, T); m.rotation.x = -Math.PI / 2; m.rotation.z = hash(i, 9) * 6; }
  add(new THREE.SphereGeometry(0.14, 10, 8), M('#e8483a'), -3.3, 0.14, -0.8, world, T); K.pot(4.5, 4.5, {}); K.pot(-4.5, 4.8, {});
  const fallenRay = new THREE.Mesh(rayGeo, rayMat[1]); fallenRay.rotation.x = -Math.PI / 2; fallenRay.position.set(...SPOTS.floorRay); fallenRay.rotation.z = 0.7; world.add(fallenRay); fallenRay.visible = false;
  const clouds = [];
  const v3 = (a) => new THREE.Vector3(...a);
  function state(S, f) {
    const crook = clamp(S.crook ?? 0) * (1 - 0.88 * clamp(S.sew ?? 0)), win = S.win ?? 0;
    cloth.visible = (S.cloth ?? 1) > 0;
    pivots.forEach(({ pv, m }, i) => { const a = (i / RAYS) * Math.PI * 2; pv.rotation.y = a + (hash(i, 11) - 0.5) * 0.7 * crook; m.rotation.x = -Math.PI / 2 + (hash(i, 12) - 0.3) * 0.45 * crook; m.scale.y = 1 - 0.22 * hash(i, 13) * crook; pv.visible = !((S.fallen ?? 0) > 0 && i === 2); });
    { const t = clamp(S.fallen ?? 0), e = t * t; fallenRay.visible = t > 0; fallenRay.position.set(-0.75 + (SPOTS.floorRay[0] + 0.75) * t, 1.05 * (1 - e) + 0.02, -2.8 + (SPOTS.floorRay[2] + 2.8) * t); fallenRay.rotation.set(-Math.PI / 2 + 1.4 * (1 - t) * Math.sin(t * 5), 0, 0.7 + 3 * (1 - t)); fallenRay.rotation.order = 'YXZ'; }
    tear.scale.x = clamp(S.tear ?? 0) * 1.6; tear.visible = (S.tear ?? 0) > 0.02;
    const sc = Math.round(clamp(Math.max(S.stitch ?? 0, S.sew ?? 0)) * 28); stitches.forEach((s, i) => { s.visible = i < sc; });
    if (S.nd) { nd.visible = true; nd.position.set(...S.nd); nd.rotation.set(0, 0, S.ndTilt ?? 0.25);
      const eye = v3(S.nd).add(new THREE.Vector3(0, 0.28, 0)), sp = v3(SPOTS.spool), mid = eye.clone().add(sp).multiplyScalar(0.5); thread.visible = true; thread.position.copy(mid); thread.scale.z = eye.distanceTo(sp); thread.lookAt(sp);
      const low = eye.clone().add(new THREE.Vector3(0.12 + 0.05 * Math.sin(f * 0.3), -0.55, 0.05)), m2 = eye.clone().add(low).multiplyScalar(0.5); thread2.visible = true; thread2.position.copy(m2); thread2.scale.z = eye.distanceTo(low); thread2.lookAt(low);
    } else { nd.visible = false; thread.visible = false; thread2.visible = false; }
    // fenêtre : nuit bleue + lune -> aube orange + soleil bas -> jour bleu clair
    if (win < 0.5) { lerpC(winM, '#1c2766', '#ff9a50', win * 2); lerpC(disc, '#eef2ff', '#fff0b0', win * 2); } else { lerpC(winM, '#ff9a50', '#bfe4ff', (win - 0.5) * 2); lerpC(disc, '#fff0b0', '#fff6c8', (win - 0.5) * 2); }
    dsc.position.y = WIN[1] + (win < 0.5 ? 0.4 - 0.95 * clamp(win * 2) : -0.55 + 0.95 * clamp((win - 0.5) * 2));
    const hr = S.clock ?? 9.5; hHand.rotation.z = -(hr / 12) * Math.PI * 2; mHand.rotation.z = -(hr % 1) * Math.PI * 2;
    const lm = clamp(S.lamp ?? 1); bulbM.color.set('#fff0b0').multiplyScalar(0.5 + 0.5 * lm); halo.material.opacity = 0.18 * lm; pool.material.opacity = 0.16 * lm;
    ted.rotation.z = Math.sin(f * 0.04) * 0.02;
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
