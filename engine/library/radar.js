// Library set : laboratoire de radar, États-Unis, 1945 (Pourkoipa original). Murs vert-gris, lino à damier, grande baie, établi avec le magnétron
// (cylindre de laiton, bobine lumineuse, cornet d'ondes), baie d'électronique à tubes et oscilloscope, antenne radar sur socle, tableau de plans,
// calendrier à effeuiller, et le premier four géant (1,8 m, tuyaux d'eau, étiquette de prix). Pièce : x de -9 à 9, mur du fond z = -4, mur avant z = 9, plafond 3.8.
// DECK = 0. Caméra côté +z (yaw ~0). Personnages à z ≈ -2.4.
// state(S, f) : S.mag (0 éteint .. 1 en marche : bobine, ondes, voyants), S.dish (angle de l'antenne), S.big (0 caché .. 1 le four géant),
//   S.bigDoor (0..1 porte), S.bigGlow (0..1), S.cal (0..1 : feuilles arrachées du calendrier), S.tube (clignotement des tubes).
import { propKit } from './props.js';
export const DECK = 0;
export const SPOTS = { bench: [0.2, 1.0, -3.2], rack: [-4.4, 0, -3.1], dish: [5.2, 0, -2.9], big: [3.2, 0, -2.6], cal: [-6.0, 1.8, -3.85], mag: [0.2, 1.22, -3.2] };

export function buildRadar(ctx, { seed = 1945 } = {}) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const T = { cast: false };
  // ---------- textures ----------
  const floorT = cv(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#d9c9a0' : '#8c9a78'; g.fillRect(i * 64, j * 64, 64, 64); }
    g.strokeStyle = 'rgba(40,50,40,0.5)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
    for (let k = 0; k < 200; k++) { g.fillStyle = 'rgba(60,60,40,0.1)'; g.fillRect(r() * w, r() * h, 3, 3); } });
  const wallT = cv(256, 256, (g, w, h) => { g.fillStyle = '#9fb59a'; g.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${130 + r() * 40 | 0},${160 + r() * 40 | 0},${130 + r() * 40 | 0},0.22)`; g.fillRect(r() * w, r() * h, 3 + r() * 7, 3 + r() * 7); } });
  const mFloor = toon({ map: P.tex(floorT, 8, 5) }), mWall = toon({ map: P.tex(wallT, 5, 1.2) });
  const mWood = M('#a8723e'), mWoodD = M('#6a4426'), mIron = M('#2f3440'), mGrey = M('#8a949c'), mGreyL = M('#b8c2c8'), mBrass = M('#d8a840'), mCream = M('#efe6cf'), mGlass = M('#bfe4ee');
  // ---------- pièce ----------
  const fl = add(new THREE.PlaneGeometry(18, 13), mFloor, 0, 0.004, 2.5, world, T); fl.rotation.x = -Math.PI / 2;
  const WZ = -4, WH = 3.8;
  add(box(18, WH, 0.3), mWall, 0, WH / 2, WZ, world, T); add(box(0.3, WH, 13), mWall, -9, WH / 2, 2.5, world, T); add(box(0.3, WH, 13), mWall, 9, WH / 2, 2.5, world, T); add(box(18, WH, 0.3), mWall, 0, WH / 2, 9, world, T);
  const ce = add(new THREE.PlaneGeometry(18, 13), M('#e9e2cc'), 0, WH, 2.5, world, T); ce.rotation.x = Math.PI / 2;
  add(box(18, 0.9, 0.1), M('#5f7a6a'), 0, 0.45, WZ + 0.2, world, T); add(box(18, 0.07, 0.14), mCream, 0, 0.92, WZ + 0.2, world, T);
  for (const bx of [-6, -2, 2, 6]) add(box(0.3, 0.25, 13), mWoodD, bx, WH - 0.12, 2.5, world, T);
  for (const x of [-6, -1.5, 3, 7.5]) { add(box(1.6, 0.1, 0.3), M('#d8d2b8'), x, WH - 0.35, 0.5, world, T); add(box(1.2, 0.04, 0.2), BASIC('#fff4cc'), x, WH - 0.42, 0.5, world, T); }   // néons au plafond
  // ---------- baie vitrée (jour chaud) ----------
  const winM = BASIC('#bfe4ff'); add(box(3.2, 1.9, 0.08), winM, -1.8, 2.3, WZ + 0.16, world, T);
  for (const [dx, dy, w, h] of [[0, 0, 3.4, 0.12], [0, 0.95, 3.4, 0.14], [0, -0.95, 3.4, 0.14], [-1.6, 0, 0.14, 1.9], [1.6, 0, 0.14, 1.9], [0, 0, 0.1, 1.9], [-0.8, 0, 0.08, 1.9], [0.8, 0, 0.08, 1.9]]) add(box(w, h, 0.14), mWoodD, -1.8 + dx, 2.3 + dy, WZ + 0.22, world, T);
  // ---------- plaque « RADAR 1945 » + tableau de plans bleus ----------
  { const c = cv(512, 160, (g, w, h) => { g.fillStyle = '#271925'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8a840'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#ffd86a'; g.font = '800 80px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RADAR 1945', w / 2, h / 2 + 4); });
    add(new THREE.PlaneGeometry(2.4, 0.75), toon({ map: P.tex(c) }), 2.3, 3.2, WZ + 0.2, world, T); add(box(2.56, 0.9, 0.06), mWoodD, 2.3, 3.2, WZ + 0.17, world, T); }
  { const c = cv(256, 192, (g, w, h) => { g.fillStyle = '#2f6fb8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8f2ff'; g.lineWidth = 3; g.strokeRect(70, 60, 110, 70); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(190, 70 + i * 16); g.bezierCurveTo(210, 55 + i * 16, 225, 85 + i * 16, 245, 70 + i * 16); g.stroke(); } g.beginPath(); g.moveTo(20, 30); g.lineTo(240, 30); g.moveTo(20, 160); g.lineTo(110, 160); g.stroke(); });
    add(new THREE.PlaneGeometry(1.9, 1.4), toon({ map: P.tex(c) }), 6.2, 2.1, WZ + 0.2, world, T); add(box(2.0, 1.5, 0.05), mWoodD, 6.2, 2.1, WZ + 0.16, world, T); }
  // ---------- établi + magnétron ----------
  const BX = SPOTS.bench[0], BY = 1.0, BZ = SPOTS.bench[2];
  add(box(4.4, 0.12, 1.1), M('#c9905a'), BX, BY - 0.06, BZ, world); add(box(4.2, 0.9, 0.9), mWoodD, BX, 0.45, BZ, world); for (const dx of [-1.4, 0, 1.4]) add(box(0.04, 0.8, 0.92), mIron, BX + dx, 0.45, BZ, world);
  const magG = new THREE.Group(); magG.position.set(BX, BY, BZ + 0.05); world.add(magG);
  add(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 18), mIron, 0, 0.05, 0, magG);
  add(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 18), mBrass, 0, 0.28, 0, magG);
  for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(0.29, 0.29, 0.025, 18), M('#b88a28'), 0, 0.14 + i * 0.06, 0, magG);
  const coilM = new THREE.MeshBasicMaterial({ color: '#ff7a2a', fog: false }); const coil = add(new THREE.TorusGeometry(0.24, 0.035, 8, 22), coilM, 0, 0.5, 0, magG, T); coil.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), mGreyL, 0, 0.55, 0, magG);
  const horn = add(new THREE.ConeGeometry(0.2, 0.5, 4, 1, true), mGrey, 0.5, 0.36, 0, magG); horn.rotation.z = -Math.PI / 2; horn.rotation.x = Math.PI / 4;
  add(box(0.3, 0.16, 0.2), mGrey, 0.32, 0.36, 0, magG);
  const rings = []; for (let i = 0; i < 5; i++) { const rg = add(new THREE.TorusGeometry(0.2, 0.012, 6, 28), new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: 0.8, fog: false }), 0.8, 0.36, 0, magG, T); rg.rotation.y = Math.PI / 2; rings.push(rg); }
  const lampM = BASIC('#7a2a1a'); add(new THREE.SphereGeometry(0.06, 8, 6), lampM, -0.2, 1.4 - 1.0 + 0.1, 0.4, magG, T);
  // matériel sur l'établi : fioles, câbles, pinces, carnet
  add(box(0.5, 0.06, 0.35), mCream, BX - 1.6, BY + 0.03, BZ + 0.05, world); add(box(0.4, 0.04, 0.3), mBrass, BX + 1.5, BY + 0.02, BZ + 0.05, world);
  add(box(0.6, 0.25, 0.4), mGrey, BX - 1.0, BY + 0.125, BZ - 0.05, world); add(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8), mGlass, BX - 1.1, BY + 0.33, BZ - 0.05, world);
  add(new THREE.TorusGeometry(0.16, 0.025, 6, 16), M('#e08a3a'), BX + 1.1, BY + 0.03, BZ + 0.15, world, T).rotation.x = Math.PI / 2;
  // ---------- baie d'électronique à tubes + oscilloscope ----------
  const RX = SPOTS.rack[0], RZ = SPOTS.rack[2], tubeMs = [];
  add(box(1.5, 2.5, 0.8), M('#5c6a74'), RX, 1.25, RZ, world); add(box(1.38, 0.9, 0.04), mIron, RX, 1.85, RZ + 0.42, world);
  { const c = cv(128, 128, (g, w, h) => { g.fillStyle = '#0c2a14'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,255,120,0.25)'; g.lineWidth = 1; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); }
      g.strokeStyle = '#6dff8a'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x < w; x += 4) { const y = h / 2 + Math.sin(x * 0.18) * 18 * Math.exp(-((x - 70) ** 2) / 1800); g[x ? 'lineTo' : 'moveTo'](x, y); } g.stroke(); });
    add(new THREE.CircleGeometry(0.34, 20), new THREE.MeshBasicMaterial({ map: P.tex(c), fog: false }), RX + 0.4, 1.5, RZ + 0.44, world, T); add(new THREE.TorusGeometry(0.35, 0.04, 6, 20), mIron, RX + 0.4, 1.5, RZ + 0.44, world, T); }
  for (let i = 0; i < 6; i++) { const m = BASIC('#ffb84a'); tubeMs.push(m); const tx = RX - 0.5 + (i % 3) * 0.25, ty = i < 3 ? 2.0 : 1.4; add(new THREE.CylinderGeometry(0.07, 0.07, 0.34, 10), mGlass, tx - 0.1, ty, RZ + 0.46, world, T); add(new THREE.SphereGeometry(0.07, 8, 6), mGlass, tx - 0.1, ty + 0.17, RZ + 0.46, world, T); add(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8), m, tx - 0.1, ty, RZ + 0.46, world, T); }
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), mCream, RX - 0.5 + i * 0.28, 0.75, RZ + 0.43, world, T).rotation.x = Math.PI / 2;
  const lamps = []; for (let i = 0; i < 4; i++) { const m = BASIC(['#c8312c', '#3fc83a', '#ffd23a', '#3f9ad8'][i]); lamps.push(m); add(new THREE.SphereGeometry(0.045, 8, 6), m, RX - 0.5 + i * 0.28, 0.5, RZ + 0.43, world, T); }
  add(box(0.5, 0.06, 0.4), M('#2f3440'), RX + 1.2, 0.8, RZ + 0.1, world); add(box(0.04, 0.8, 0.04), mIron, RX + 1.2, 0.4, RZ + 0.1, world);
  // ---------- antenne radar sur socle (tourne) ----------
  const DX = SPOTS.dish[0], DZ = SPOTS.dish[2];
  add(new THREE.CylinderGeometry(0.4, 0.5, 0.5, 14), mIron, DX, 0.25, DZ, world); add(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 10), mGrey, DX, 1.0, DZ, world);
  const dish = new THREE.Group(); dish.position.set(DX, 1.7, DZ); world.add(dish);
  const bowl = add(new THREE.SphereGeometry(0.85, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.6), mGreyL, 0, 0, 0.1, dish); bowl.rotation.x = Math.PI / 2.0;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), mIron, 0, 0, 0.6, dish).rotation.x = Math.PI / 2; add(new THREE.SphereGeometry(0.07, 8, 6), M('#c8312c'), 0, 0, 0.9, dish);
  // ---------- calendrier à effeuiller (arrache une feuille à chaque coup) ----------
  const CX = SPOTS.cal[0], CY = SPOTS.cal[1], CZ = SPOTS.cal[2];
  add(box(1.1, 1.5, 0.06), M('#c8312c'), CX, CY, CZ, world, T);
  const NP = 14, pages = [];
  for (let i = 0; i < NP; i++) { const c = cv(128, 160, (g, w, h) => { g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, 36); g.fillStyle = '#271925'; g.font = '800 70px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(String(1945 + Math.round(i * 20 / (NP - 1))), w / 2, 112); });    const pg = new THREE.Group(); pg.position.set(CX, CY + 0.7, CZ + 0.04 + i * 0.002); world.add(pg); const m = add(new THREE.PlaneGeometry(0.98, 1.3), toon({ map: P.tex(c) }), 0, -0.68, 0, pg, T); pages.push(pg); }
  // ---------- étagères, caisses, tableau noir ----------
  const shelf = (x) => { add(box(2.4, 2.4, 0.5), mWoodD, x, 1.3, -3.7, world); for (let i = 0; i < 3; i++) { const y = 0.5 + i * 0.8; add(box(2.3, 0.07, 0.46), mWood, x, y, -3.65, world);
    for (let j = 0; j < 4; j++) add(box(0.4, 0.25 + r() * 0.2, 0.3), M(['#c9905a', '#7a8a9a', '#d8c070', '#5f7a6a'][(i + j) % 4]), x - 0.85 + j * 0.55, y + 0.2, -3.62, world, T); } };
  shelf(-8.0); shelf(7.7);
  K.crate(-8.0, -2.4, { s: 0.7 }); K.crate(-8.0, -1.5, { s: 0.55 }); K.crate(8.2, -2.0, { s: 0.7 }); K.barrel(8.3, -0.9, {}); K.pot(-6.2, -3.3, {}); K.lamp(-8.2, 1.0, { h: 2.6 });
  add(new THREE.PlaneGeometry(3.0, 1.0), M('#3a4a44'), 0, 0.014, 2.5, world, T).rotation.x = -Math.PI / 2;   // tapis
  // ---------- le premier four géant (1,8 m) ----------
  const bigG = new THREE.Group(); bigG.position.set(SPOTS.big[0], 0, SPOTS.big[2]); world.add(bigG);
  add(box(1.3, 0.25, 1.0), mIron, 0, 0.2, 0, bigG); for (const sx of [-0.5, 0.5]) add(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), mIron, sx, 0.06, 0.4, bigG).rotation.z = Math.PI / 2;
  add(box(1.2, 1.7, 0.9), M('#7a9a8a'), 0, 1.2, 0, bigG);
  add(box(1.0, 0.1, 0.8), M('#5a7a6a'), 0, 2.1, 0, bigG);
  const bigDoor = new THREE.Group(); bigDoor.position.set(-0.45, 1.25, 0.46); bigG.add(bigDoor);
  add(box(0.9, 1.1, 0.06), mGreyL, 0.45, 0, 0, bigDoor); const bigWinM = new THREE.MeshBasicMaterial({ color: '#2a3a44', fog: false }); add(box(0.62, 0.62, 0.04), bigWinM, 0.45, 0.05, 0.04, bigDoor, T); add(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), mIron, 0.82, -0.1, 0.08, bigDoor);
  for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), mCream, -0.35 + i * 0.35, 1.9, 0.47, bigG, T).rotation.x = Math.PI / 2;
  for (const px of [-0.55, 0.55]) { add(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), M('#b87333'), px, 2.6, -0.3, bigG); add(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), M('#b87333'), px, 2.9, -0.1, bigG).rotation.x = Math.PI / 2; }
  { const c = cv(256, 160, (g, w, h) => { g.fillStyle = '#fff4cc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#271925'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#c8312c'; g.font = '800 62px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('5 000 $', w / 2, h / 2); });
    add(new THREE.PlaneGeometry(0.62, 0.38), toon({ map: P.tex(c) }), 0.25, 1.92, 0.49, bigG, T); }
  bigG.visible = false;
  const clouds = [];
  function state(S, f) {
    const mag = S.mag ?? 0, pulse = 0.5 + 0.5 * Math.sin(f * 0.5);
    coilM.color.set(mag > 0.05 ? (pulse > 0.5 ? '#ffd23a' : '#ff6a1a') : '#5a2a1a'); lampM.color.set(mag > 0.05 ? '#ff3a2a' : '#4a1a12');
    rings.forEach((rg, i) => { const t = ((f * 0.03 + i / rings.length) % 1); rg.visible = mag > 0.05; rg.position.x = 0.55 + t * 2.4; rg.scale.setScalar(0.6 + t * 1.6); rg.material.opacity = 0.85 * (1 - t) * mag; });
    dish.rotation.y = S.dish ?? f * 0.03;
    bigG.position.x = SPOTS.big[0] + (S.bigX ?? 0); bigG.visible = (S.big ?? 0) > 0.02; bigG.scale.setScalar(Math.max(0.01, S.big ?? 0)); bigDoor.rotation.y = -(S.bigDoor ?? 0) * 1.6; bigWinM.color.set((S.bigGlow ?? 0) > 0.05 ? '#ffb040' : '#2a3a44');
    pages.forEach((pg, i) => { const k = Math.max(0, Math.min(1, (S.cal ?? 0) * (NP + 1) - i)); pg.rotation.x = -k * 2.9; pg.position.y = CY + 0.7 + k * 0.12; pg.visible = k < 0.98; });
    tubeMs.forEach((m, i) => m.color.set(mag > 0.05 && Math.sin(f * 0.37 + i * 1.7) > -0.2 ? '#ffd24a' : '#a8641e'));
    lamps.forEach((m, i) => { const on = mag > 0.05 ? Math.sin(f * 0.21 + i * 2.1) > -0.5 : i === 1; m.color.set(['#c8312c', '#3fc83a', '#ffd23a', '#3f9ad8'][i]).multiplyScalar(on ? 1 : 0.3); });
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
