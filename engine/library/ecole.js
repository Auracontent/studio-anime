// Library set: cour d'école et immeuble voisin (bitume avec marelle, école en briques + préau, immeuble avec balcon et porte-fenêtre, grille, arbres, vélos).
// Sol DECK = 0. Les caméras regardent depuis +z vers -z. Mur du fond z = -8 : l'école à gauche (x -22..-3), l'immeuble à droite (x -2..16).
// Balcon de Malo : sol à y = 3.28, centre (4, 3.28, -7.35), garde-corps en z = -6.85. Porte de l'immeuble : x = 9.5 (marches jusqu'à z = -6.6).
// buildEcole(ctx, { seed }) retourne { DECK, K, clouds, bikes, state(S, f), onLight }.
// state(S, f) : S.win (0 vitre de jour .. 1 fenêtre allumée), S.bikes = [{ x, z, rot, flat, bent, roll, y, ry, vis }, ...] (4 vélos : Zoé jaune, trois élèves).
import { propKit } from './props.js';
import { makeBike } from './route.js';
export const DECK = 0;
export const SPOTS = { cour: [0, 0, 0], balcon: [4, 3.28, -7.35], porte: [9.5, 0, -6.4], marelle: [-5, 0, -1.5], ecole: [-8, 0, -7.8] };
export const BIKE_COLS = ['#f2c230', '#4a9a4a', '#e8782a', '#7a3aa8'];

export function buildEcole(ctx, { seed = 2312 } = {}) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), K = propKit(ctx, { seed });
  const M = (c) => toon({ color: c });
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  // ---------- textures ----------
  const meadowT = cv(512, 512, (g, w, h) => { g.fillStyle = '#8db04a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${90 + r() * 70 | 0},${140 + r() * 60 | 0},${50 + r() * 30 | 0},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); } });
  const asphaltT = cv(512, 512, (g, w, h) => { g.fillStyle = '#8c8a94'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1800; k++) { const v = 110 + r() * 60 | 0; g.fillStyle = `rgba(${v},${v - 4},${v + 8},0.55)`; g.fillRect(r() * w, r() * h, 2 + r() * 4, 2 + r() * 4); }
    g.strokeStyle = 'rgba(60,56,70,0.16)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(r() * w, 0); g.lineTo(r() * w, h); g.stroke(); } });
  const brickT = (base, hue) => cv(256, 256, (g, w, h) => { g.fillStyle = '#e0d2bc'; g.fillRect(0, 0, w, h); const bw = 64, bh = 32;
    for (let j = 0; j < 8; j++) for (let i = -1; i < 5; i++) { const x = i * bw + (j % 2 ? bw / 2 : 0), y = j * bh; g.fillStyle = `hsl(${hue + r() * 8},${base + r() * 14}%,${42 + r() * 12}%)`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6); } });
  const plasterT = cv(256, 256, (g, w, h) => { g.fillStyle = '#ecd9b2'; g.fillRect(0, 0, w, h); for (let k = 0; k < 350; k++) { g.fillStyle = `rgba(${210 + r() * 30 | 0},${190 + r() * 30 | 0},${150 + r() * 30 | 0},0.3)`; g.fillRect(r() * w, r() * h, 3 + r() * 8, 3 + r() * 8); } });
  // ---------- sol : prairie + cour en bitume + marelle + traits blancs ----------
  const ground = add(new THREE.PlaneGeometry(3000, 3000), toon({ map: P.tex(meadowT, 300, 300) }), 0, -0.03, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  const plane = (x, z, w, d, m, y = 0.012) => { const p = add(new THREE.PlaneGeometry(w, d), m, x, y, z, world, { cast: false }); p.rotation.x = -Math.PI / 2; return p; };
  plane(-3, -1, 44, 20, toon({ map: P.tex(asphaltT, 11, 5) }), 0.01);
  const white = M('#f4f1e8'), yellow = M('#f2c230');
  // marelle (hopscotch) à gauche, avec numéros
  { const sq = [[0, 0], [0, 1], [-0.5, 2], [0.5, 2], [0, 3], [0, 4], [-0.5, 5], [0.5, 5], [0, 6]];
    sq.forEach(([dx, dz], i) => { const bx = -5 + dx * 1.05, bz = 2.5 - dz * 1.05; plane(bx, bz, 1.0, 1.0, white, 0.016); plane(bx, bz, 0.86, 0.86, toon({ map: P.tex(cv(64, 64, (g) => { g.fillStyle = '#8c8a94'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#f2c230'; g.font = '800 40px Montserrat, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), 32, 36); })) }), 0.02); }); }
  // traits blancs de terrain + grands cercles jaunes
  plane(6, -2, 0.1, 14, white, 0.016); plane(12, 3.5, 12, 0.1, white, 0.016); plane(12, -4.5, 12, 0.1, white, 0.016);
  for (const [x, z] of [[11, -1]]) { const c = add(new THREE.RingGeometry(1.3, 1.4, 40), yellow, x, 0.018, z, world, { cast: false }); c.rotation.x = -Math.PI / 2; }
  // ---------- école en briques, porte rouge, enseigne, fenêtres ----------
  const mBrick = toon({ map: P.tex(brickT(55, 12), 7, 2.4) }), mPlaster = toon({ map: P.tex(plasterT, 5, 3) });
  add(tbox(19, 5.6, 4, 3), mBrick, -12.5, 2.8, -10, world); add(box(19.6, 0.4, 4.6), M('#6e6a76'), -12.5, 5.8, -10, world);
  add(box(2.0, 2.6, 0.2), M('#c8312c'), -8, 1.3, -7.95, world, { cast: false }); add(box(2.4, 0.22, 0.5), M('#5a3a2a'), -8, 2.7, -7.8, world);
  for (let i = 0; i < 3; i++) add(box(2.6 - i * 0.2, 0.14, 0.4), M('#d8cdb8'), -8, 0.07 + i * 0.14, -7.7 + i * 0.1, world);
  { const sg = cv(512, 128, (g, w, h) => { g.fillStyle = '#1f4a8a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f7f1e0'; g.font = '800 82px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ÉCOLE', 256, 70); });
    add(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshBasicMaterial({ map: P.tex(sg) }), -8, 3.4, -7.74, world, { cast: false }); }
  for (let row = 0; row < 2; row++) for (const x of [-20, -17.5, -15, -12.5, -10.5, -5.5]) {
    if (row === 0 && x === -10.5) continue; add(box(1.5, 1.3, 0.12), M('#46557a'), x, 1.4 + row * 2.4, -7.96, world, { cast: false }); add(box(1.62, 0.1, 0.2), M('#e8e0d0'), x, 0.72 + row * 2.4, -7.9, world, { cast: false }); add(box(0.08, 1.3, 0.16), M('#e8e0d0'), x, 1.4 + row * 2.4, -7.9, world, { cast: false }); }
  // préau : toit sur poteaux, banc dessous
  add(box(8.4, 0.25, 3.6), M('#a8482e'), -19, 3.4, -6.2, world); for (const x of [-22.8, -19, -15.2]) add(box(0.22, 3.3, 0.22), M('#6a4a32'), x, 1.65, -4.5, world);
  K.bench(-19, -6.4, 0, { color: '#3f6f4a' });
  // ---------- immeuble : façade crème, grille de fenêtres, balcon éclairé, porte d'entrée ----------
  add(tbox(18, 10, 6, 3), mPlaster, 7, 5, -11, world); add(box(18.6, 0.5, 6.6), M('#8a4a3a'), 7, 10.2, -11, world);
  const winM = toon({ color: '#9ec3dc' }), litM = BASIC('#ffd890'), litH = [];
  for (let row = 0; row < 3; row++) for (const x of [-0.6, 1.5, 6.7, 9.0, 12.2, 14.4]) {
    const lit = (row * 7 + (x * 3 | 0)) % 5 === 0, g = add(box(1.2, 1.5, 0.1), lit ? litM : winM, x, 5.6 + row * 1.6 + (row === 0 ? 0.4 : 0), -7.97, world, { cast: false });
    add(box(1.34, 0.1, 0.2), M('#e8e0d0'), x, 4.8 + row * 1.6 + (row === 0 ? 0.4 : 0), -7.9, world, { cast: false }); }
  // porte-fenêtre de Malo (x = 4) : verre qui s'éclaire (S.win), cadre, rideau
  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.3), new THREE.MeshBasicMaterial({ color: '#9ec3dc', fog: false })); doorGlass.position.set(4, 4.45, -7.96); world.add(doorGlass);
  add(box(1.5, 0.12, 0.2), M('#e8e0d0'), 4, 5.66, -7.9, world, { cast: false }); for (const sx of [-0.7, 0.7]) add(box(0.1, 2.4, 0.2), M('#e8e0d0'), 4 + sx, 4.45, -7.9, world, { cast: false }); add(box(0.06, 2.3, 0.2), M('#e8e0d0'), 4, 4.45, -7.9, world, { cast: false });
  add(box(2.6, 0.16, 1.3), M('#c8c0b4'), 4, 3.2, -7.35, world);                                    // dalle du balcon
  for (let i = 0; i <= 8; i++) add(box(0.04, 0.95, 0.04), M('#2f3440'), 2.8 + i * 0.3, 3.8, -6.78, world, { cast: false });
  add(box(2.5, 0.07, 0.07), M('#2f3440'), 4, 4.3, -6.78, world); add(box(0.07, 1.05, 1.3), M('#2f3440'), 2.75, 3.75, -7.4, world); add(box(0.07, 1.05, 1.3), M('#2f3440'), 5.25, 3.75, -7.4, world);
  K.pot(5.0, -7.2); { const p = K.pot(2.9, -7.2); p.position.y = 3.28; } { const p = K.pot(5.0, -7.2); p.position.y = 3.28; }
  add(box(2.0, 2.6, 0.14), M('#5a3a2a'), 9.5, 1.3, -7.95, world, { cast: false }); add(box(2.8, 0.16, 1.4), M('#8a4a3a'), 9.5, 2.9, -7.3, world);
  for (const sx of [-1.3, 1.3]) add(box(0.12, 2.9, 0.12), M('#8a4a3a'), 9.5 + sx, 1.45, -6.65, world);
  for (let i = 0; i < 2; i++) add(box(2.6, 0.14, 0.5), M('#d8cdb8'), 9.5, 0.07 + i * 0.14, -7.5 + i * 0.3, world);
  // ---------- grille, arbres, mobilier : jamais de fond vide ----------
  K.fence(-24, 9, 18, 9, { color: '#3a4a5a' }); K.fence(-24, -8, -24, 9, { color: '#3a4a5a' }); K.fence(18, -8, 18, 9, { color: '#3a4a5a' });
  for (const [x, z, s] of [[-23, -6.5, 1.3], [-21, 5, 1.1], [-26, -1, 1.4], [-27, 6, 1.2], [17, 6, 1.3], [20, -2, 1.4], [21, 5, 1.2], [-30, -6, 1.5], [24, -7, 1.4]]) K.tree(x, z, { s });
  for (const x of [-18, -12, -7, -1, 5, 11, 15]) K.bush(x + r(), 8.2, {});
  K.bench(-12, -6.7, 0, { color: '#c0392b' }); K.bench(14, -6.6, 0, {}); K.bench(-8.5, 7.8, Math.PI, { color: '#3f6f4a' });
  K.lamp(-3, -6.8); K.lamp(12.5, -6.6); K.lamp(-16, 7.9);
  for (const [x, z] of [[-6.5, -6.9], [-4.6, -6.9], [7.6, -6.9], [2, -6.9]]) K.crate(x, z, { s: 0.55 });
  K.barrel(-1.6, -6.9); K.barrel(13.2, -6.9); K.sack(-2.6, -6.8); K.sign(16, -6.8, 'ÉCOLE', 0.3);
  for (const [x, z] of [[-9.2, -5.8], [-9.8, -5.5], [-10.4, -5.9]]) K.bush(x, z, { s: 0.5 });
  K.pot(-6.3, -7.0); K.pot(-9.7, -7.0); K.pot(8.1, -7.0); K.pot(10.9, -7.0);
  K.verge(-24, 18, 8.4, 14, { density: 2.2 }); K.verge(-24, -22, -8, 9, { density: 2 }); K.verge(18, 24, -8, 9, { density: 2 }); K.verge(-22, 16, -10, -8.2, { density: 1.2 });
  // maisons lointaines derrière la grille (pour les plans de profil)
  const house = (x, z, w = 6, h = 3.8, col = '#e8d9b8', roof = '#b9553a') => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    add(tbox(w, h, 5, 3), toon({ color: col }), 0, h / 2, 0, g); const sh = new THREE.Shape(); sh.moveTo(-2.9, 0); sh.lineTo(2.9, 0); sh.lineTo(0, 2.2); sh.closePath();
    const rm = add(new THREE.ExtrudeGeometry(sh, { depth: w + 0.8, bevelEnabled: false }), toon({ color: roof }), -(w + 0.8) / 2, h, 0, g); rm.rotation.y = Math.PI / 2;
    add(box(0.9, 1.9, 0.12), M('#5a3a24'), -w * 0.2, 0.95, 2.52, g); for (const wx of [w * 0.15, w * 0.35]) add(box(0.8, 0.9, 0.12), M('#46557a'), wx, 2.2, 2.52, g, { cast: false });
    add(new THREE.CylinderGeometry(0.3, 0.38, 1.2, 6), M('#9a8a7a'), w * 0.25, h + 2.1, -1, g); return g; };
  for (const [x, z, c] of [[-38, -2, '#e8d9b8'], [-40, 9, '#efe3c4'], [-36, 16, '#e0c9a0'], [30, 0, '#d9d0c0'], [32, 10, '#e8d9b8'], [-30, 20, '#efe3c4'], [0, 44, '#e0c9a0'], [24, 40, '#e8d9b8']]) house(x, z, 5.5 + r() * 2, 3.6, c, ['#b9553a', '#a8482e', '#8a5a3a'][Math.floor(r() * 3)]);
  // portique à vélos (râtelier) + vélos garés
  add(box(3.4, 0.06, 0.06), M('#6a707a'), -14.5, 0.5, -3.6, world); for (let i = 0; i < 6; i++) add(box(0.05, 0.5, 0.05), M('#6a707a'), -15.9 + i * 0.56, 0.25, -3.6, world);
  // ---------- vélos ----------
  const bikes = BIKE_COLS.map((c) => { const b = makeBike(ctx, c); b.g.scale.setScalar(0.88); return b; });
  // ---------- nuages ----------
  const clouds = [];
  { const rr = P.rng(91); for (let i = 0; i < 9; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  const cWin0 = new THREE.Color('#9ec3dc'), cWin1 = new THREE.Color('#ffd890');
  const state = (S) => {
    doorGlass.material.color.copy(cWin0).lerp(cWin1, Math.max(0, Math.min(1, S.win ?? 0)));
    const B = S.bikes || [];
    bikes.forEach((b, i) => { const o = B[i]; if (o && o.vis !== false) b.set(o.x, o.z, o); else b.set(0, 0, { vis: false }); });
  };
  return { DECK, K, clouds, bikes, state, onLight: () => {} };
}
