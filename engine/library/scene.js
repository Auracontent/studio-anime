// Library set : salle des fêtes d'une école (Pourkoipa original). Parquet, murs crème, grande scène avec rideau rouge, fond de ciel peint, bannière
// « FÊTE DE L'ÉCOLE », guirlandes de fanions, rangées de chaises (instances), projecteurs, porte au fond, tables de goûter.
// La salle est construite à `at` (par défaut x = 100) pour cohabiter avec la chambre : toutes les positions des SPOTS sont absolues.
// Scène : bord avant z = at.z - 4.5, dessus à y = 0.8, profondeur jusqu'à z = at.z - 9 ; chaises de z = at.z - 3.3 à at.z + 1.4.
// Caméra côté public (+z) pour voir la scène ; côté scène (yaw 180) pour voir la salle.
// SPOTS : stageC (centre devant de la scène, sur le plancher de scène), stageL / stageR, aisle (allée centrale), back (fond de la salle), door, crowd (centre du public).
// state(S, f) :
//   S.curtain : 0 rideau fermé .. 1 grand ouvert      S.spot : 0..1 intensité des projecteurs (faisceau au sol)    S.sway : phase des guirlandes
import { propKit } from './props.js';
export const DECK = 0;
export const AT = [100, 0, 0];
export const SPOTS = { stageC: [AT[0], 0.8, AT[2] - 5.7], stageL: [AT[0] - 2.6, 0.8, AT[2] - 6.0], stageR: [AT[0] + 2.6, 0.8, AT[2] - 6.0], aisle: [AT[0], 0, AT[2] - 0.5], back: [AT[0] + 3.2, 0, AT[2] + 5.4], door: [AT[0], 0, AT[2] + 7], crowd: [AT[0], 0, AT[2] + 0.4], wings: [AT[0] - 5.2, 0.8, AT[2] - 6.4] };

export function buildScene(ctx, { seed = 2612, at = AT } = {}) {
  const { THREE, P, add, box, toon } = ctx;
  const W = new THREE.Group(); W.position.set(at[0], 0, at[2]); ctx.world.add(W);
  const world = W, kctx = { ...ctx, world: W };
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(kctx, { seed });
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const T = { cast: false }, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  // ---------- textures ----------
  const floorT = cv(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) { g.fillStyle = ['#c99a58', '#bd8c4a', '#d0a060', '#c4924f'][i]; g.fillRect(0, i * 64, w, 64); g.strokeStyle = 'rgba(70,40,20,0.65)'; g.lineWidth = 4; g.strokeRect(0, i * 64, w, 64); } });
  const wallT = cv(256, 256, (g, w, h) => { g.fillStyle = '#f6e6c0'; g.fillRect(0, 0, w, h); for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(${220 + r() * 30 | 0},${190 + r() * 40 | 0},${130 + r() * 40 | 0},0.18)`; g.fillRect(r() * w, r() * h, 4 + r() * 8, 4 + r() * 8); } });
  const curT = cv(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#b5262a' : '#d23a32'; g.fillRect(i * 32, 0, 32, h); } g.fillStyle = 'rgba(40,10,20,0.25)'; for (let i = 0; i < 8; i++) g.fillRect(i * 32 + 24, 0, 8, h); });
  const skyT = cv(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5aa8ee'); gr.addColorStop(1, '#bfe6ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; for (const [x, y] of [[80, 60], [260, 40], [400, 90]]) { for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + k * 24, y + (k % 2) * 8, 22, 0, 7); g.fill(); } }
    g.fillStyle = '#7cc043'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, 180 + Math.sin(x * 0.02) * 20); g.lineTo(w, h); g.fill(); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(256, 110, 40, 0, 7); g.fill(); });
  const banT = cv(1024, 160, (g, w, h) => { g.fillStyle = '#3f9ad8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#271925'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#fff'; g.font = '900 88px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 10; g.strokeStyle = '#271925'; g.strokeText("FÊTE DE L'ÉCOLE", w / 2, h / 2 + 4); g.fillText("FÊTE DE L'ÉCOLE", w / 2, h / 2 + 4); });
  const flagT = cv(1024, 96, (g, w, h) => { g.strokeStyle = '#271925'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 6); g.lineTo(w, 6); g.stroke(); const cols = ['#e8483a', '#ffd23a', '#3f9ad8', '#7cc043', '#ff8fb8', '#c86bff'], n = 20, st = w / n;
    for (let i = 0; i < n; i++) { g.fillStyle = cols[i % 6]; g.beginPath(); g.moveTo(i * st + 3, 6); g.lineTo((i + 1) * st - 3, 6); g.lineTo(i * st + st / 2, 86); g.closePath(); g.fill(); g.stroke(); } });
  const mFloor = toon({ map: P.tex(floorT, 8, 8) }), mWall = toon({ map: P.tex(wallT, 6, 1.5) }), mWood = M('#b07a46'), mWoodD = M('#7a5130'), mWhite = M('#f6f1e6'), mIron = M('#2f3440');
  // ---------- salle : x de -8 à 8, z de -9 (fond de scène) à 7 (porte) ----------
  const fl = add(new THREE.PlaneGeometry(16.4, 16.4), mFloor, 0, 0.004, -1, world, T); fl.rotation.x = -Math.PI / 2;
  const WH = 4.2; add(box(16.8, WH, 0.3), mWall, 0, WH / 2, -9.15, world, T); add(box(0.3, WH, 16.4), mWall, -8.15, WH / 2, -1, world, T); add(box(0.3, WH, 16.4), mWall, 8.15, WH / 2, -1, world, T);
  // (pas de mur du fond côté porte : les caméras filment le public depuis l'arrière)
  for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) { add(box(1.2, 1.6, 0.06), BASIC('#bfe4ff'), sx * 8.0, 2.2, -4 + i * 5, world, T).rotation.y = Math.PI / 2; add(box(1.35, 1.75, 0.04), mWhite, sx * 8.0, 2.2, -4 + i * 5, world, T).rotation.y = Math.PI / 2; }   // fenêtres latérales
  // ---------- scène ----------
  add(box(11, 0.8, 4.5), mWood, 0, 0.4, -6.75, world); add(box(11.1, 0.1, 0.12), M('#8a5a30'), 0, 0.8, -4.5, world, T);
  for (let i = 0; i < 5; i++) add(box(0.04, 0.02, 4.4), M('#9a6a3e'), -4 + i * 2, 0.81, -6.75, world, T);
  for (let i = 0; i < 3; i++) add(box(1.0, 0.4, 0.04), M('#8a5a30'), -3.5 + i * 3.5, 0.4, -4.47, world, T);
  const back = add(new THREE.PlaneGeometry(10.4, 4.0), toon({ map: P.tex(skyT) }), 0, 2.8, -8.9, world, T);
  const curtains = []; for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 2.6, 0, -4.6); world.add(g); add(box(5.4, 3.6, 0.16), toon({ map: P.tex(curT, 3, 1) }), sx * 0, 2.6, 0, g); curtains.push({ g, sx }); }
  add(box(11.4, 0.7, 0.3), M('#8f1d22'), 0, 4.0, -4.55, world, T); for (let i = 0; i < 9; i++) add(box(0.9, 0.5, 0.2), M('#b5262a'), -4.8 + i * 1.2, 3.55, -4.45, world, T);   // lambrequin
  add(new THREE.PlaneGeometry(6.6, 1.03), toon({ map: P.tex(banT) }), 0, 4.0, -4.38, world, T);
  for (const sx of [-1, 1]) { add(box(0.12, 4.2, 0.12), mWoodD, sx * 5.6, 2.1, -4.5, world, T); add(box(1.2, 3.6, 0.3), M('#8f1d22'), sx * 5.0, 1.8, -8.2, world, T); }
  // ---------- projecteurs + faisceaux ----------
  const beamM = []; for (const x of [-3, 0, 3]) { add(new THREE.CylinderGeometry(0.14, 0.2, 0.4, 10), mIron, x, 4.0, -2.8, world, T).rotation.x = 0.5; const bm = new THREE.MeshBasicMaterial({ color: '#fff0b8', transparent: true, opacity: 0.1, fog: false, depthWrite: false, side: THREE.DoubleSide }); beamM.push(bm);
    const b = add(new THREE.CylinderGeometry(0.12, 1.1, 5.4, 14, 1, true), bm, x, 2.4, -4.9, world, T); b.rotation.x = -0.45; }
  // ---------- chaises (instances) ----------
  const rows = 7, cols = 12, N = rows * cols * 2, seatG = new THREE.BoxGeometry(0.5, 0.06, 0.5), backG = new THREE.BoxGeometry(0.5, 0.45, 0.05), legG = new THREE.BoxGeometry(0.05, 0.46, 0.05);
  const seats = new THREE.InstancedMesh(seatG, toon({ color: '#ffffff' }), N), backs = new THREE.InstancedMesh(backG, toon({ color: '#ffffff' }), N), legs = new THREE.InstancedMesh(legG, mIron, N * 2);
  const m4 = new THREE.Matrix4(), CC = ['#3f9ad8', '#e8a020', '#7cc043', '#d23a32'].map((c) => new THREE.Color(c)); let n = 0, nl = 0;
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const side = j < cols / 2 ? -1 : 1, jj = j % (cols / 2), x = side * (1.1 + jj * 0.62), z = -3.3 + i * 0.75; if (j < 0) continue;
    m4.makeTranslation(x, 0.48, z); seats.setMatrixAt(n, m4); seats.setColorAt(n, CC[(i + j) % 4]); m4.makeTranslation(x, 0.74, z + 0.22); backs.setMatrixAt(n, m4); backs.setColorAt(n, CC[(i + j) % 4]);
    m4.makeTranslation(x - 0.2, 0.23, z - 0.2); legs.setMatrixAt(nl++, m4); m4.makeTranslation(x + 0.2, 0.23, z + 0.2); legs.setMatrixAt(nl++, m4); n++; }
  seats.count = backs.count = n; legs.count = nl; for (const im of [seats, backs, legs]) { im.castShadow = false; im.receiveShadow = true; world.add(im); }
  // ---------- guirlandes, tables de goûter, habillage ----------
  const flagM = new THREE.MeshBasicMaterial({ map: P.tex(flagT), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, fog: false });
  const gars = []; for (const [x, y, z, ry, w] of [[0, 3.75, -2.2, 0, 15], [0, 3.75, 3.0, 0, 15], [-7.9, 3.3, -1, Math.PI / 2, 14], [7.9, 3.3, -1, Math.PI / 2, 14]]) gars.push(add(new THREE.PlaneGeometry(w, 0.7), flagM, x, y, z, world, T)), gars[gars.length - 1].rotation.y = ry;
  for (const [x, z] of [[-6.4, 3.2], [6.4, 3.2]]) { add(box(2.2, 0.08, 0.9), M('#fbf6ea'), x, 0.85, z, world); add(box(2.3, 0.7, 0.04), M('#d23a32'), x, 0.5, z + 0.45, world, T); for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.12, 0.1, 0.12, 10), M(['#ffd23a', '#e8483a', '#7cc043', '#3f9ad8'][i]), x - 0.7 + i * 0.45, 0.95, z, world, T); }
  for (let i = 0; i < 8; i++) { const bx = -7.2 + (i % 4) * 0.35 + (i > 3 ? 14 : 0), bz = 4.6 + (i % 2) * 0.5; add(new THREE.SphereGeometry(0.3, 10, 8), M(['#e8483a', '#ffd23a', '#3f9ad8', '#ff8fb8'][i % 4]), bx, 2.6 + (i % 3) * 0.25, bz, world, T).scale.set(1, 1.2, 1); }
  K.pot(-7.2, 6.2, {}); K.pot(7.2, 6.2, {}); K.crate(-7.2, 2.0, { s: 0.6 }); K.crate(7.2, 1.0, { s: 0.55 });
  const rg = add(new THREE.PlaneGeometry(1.2, 11), M('#e8483a'), 0, 0.012, 0.5, world, T); rg.rotation.x = -Math.PI / 2;
  const clouds = [];
  function state(S, f) {
    const c = clamp(S.curtain ?? 0); curtains.forEach(({ g, sx }) => { g.position.x = sx * (2.6 + 3.6 * c); g.scale.x = 1 - 0.5 * c; });
    const sp = clamp(S.spot ?? 1); beamM.forEach((m, i) => { m.opacity = 0.11 * sp * (0.85 + 0.15 * Math.sin(f * 0.07 + i)); });
    gars.forEach((g, i) => { g.rotation.z = Math.sin((S.sway ?? f * 0.06) + i) * 0.01; });
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
