// Library set: Hanoï colonial, 1902 : rue pavée bordée de façades jaunes à volets verts et toits de tuiles, palmiers, lampadaires,
// étal de la « prime » (table + pile de queues de rats qui grossit), faubourg avec cabanes en paille et cages (élevages de rats),
// + une vue en coupe (coupe.js) très loin à x = 5000 : la rue en haut, l'égout en dessous, grouillant.
// DECK = 0. Les caméras regardent depuis +z vers -z. La rue court le long de x (pavé z -5..4), façades en z = -10.
// Étal de la prime : table centrée en (6.7, 0, -2.4). Faubourg : cabanes autour de x = -30, z = -4. Coupe : CX = 5000.
// state(S, f) : S.tails (0..1, hauteur du tas de queues), S.poster (0/1 l'affiche « PRIME » sur l'étal).
import { propKit } from './props.js';
import { buildCoupe } from './coupe.js';
export const DECK = 0;
export const CX = 5000;
export const SPOTS = { rue: [0, 0, 0], etal: [6.7, 0, -2.4], faubourg: [-30, 0, -3], egout: [CX, -6, 5] };

export function buildHanoi(ctx, { seed = 1902 } = {}) {
  const { THREE, P, scene, world, add, box, tbox, toon, M: MT } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  // ---------- textures ----------
  const cobbleT = cv(512, 512, (g, w, h) => { g.fillStyle = '#9c9084'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 12; j++) for (let i = -1; i < 12; i++) { const x = i * 46 + (j % 2 ? 23 : 0), y = j * 44, v = 128 + r() * 50 | 0; g.fillStyle = `rgb(${v + 14},${v + 4},${v - 14})`; g.strokeStyle = 'rgba(60,48,44,0.7)'; g.lineWidth = 3;
      g.beginPath(); g.roundRect(x + 2, y + 2, 42, 40, 9); g.fill(); g.stroke(); } });
  const dryT = cv(512, 512, (g, w, h) => { g.fillStyle = '#b8b068'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${150 + r() * 50 | 0},${70 + r() * 40 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); } });
  const walkT = cv(256, 256, (g, w, h) => { g.fillStyle = '#d6c4a0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,70,50,0.5)'; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } });
  const plane = (x, z, w, d, m, y = 0.01) => { const p = add(new THREE.PlaneGeometry(w, d), m, x, y, z, world, { cast: false }); p.rotation.x = -Math.PI / 2; return p; };
  plane(0, 0, 3000, 3000, toon({ map: P.tex(dryT, 300, 300) }), -0.03);
  plane(8, -0.3, 150, 9.4, toon({ map: P.tex(cobbleT, 90, 6) }), 0.01);
  plane(8, -7.5, 150, 5, toon({ map: P.tex(walkT, 60, 3) }), 0.02);
  // ---------- façades coloniales ----------
  const mRoof = MT.roof, mShut = M('#4a8a5a'), mGlass = M('#2a3a58'), mWhite = M('#f4efe2'), mIron = M('#2f3440'), mDoor = M('#6a3a22');
  const WALL = ['#eac55f', '#f0dcae', '#e6a96a', '#c8d6a0', '#efd49a', '#d9b27a'];
  const facade = (x, z, w, h, ci, o = {}) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = o.ry || 0; world.add(g); const d = o.d ?? 6;
    add(tbox(w, h, d, 3), M(WALL[ci % WALL.length]), 0, h / 2, 0, g); add(box(w + 0.3, 0.3, d + 0.4), mWhite, 0, h + 0.1, 0, g); add(box(w + 0.2, 0.35, d + 0.3), M('#c9b48a'), 0, 0.17, 0, g);
    const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.7, 0); sh.lineTo(d / 2 + 0.7, 0); sh.lineTo(0, 1.9); sh.closePath();
    const rm = add(new THREE.ExtrudeGeometry(sh, { depth: w + 0.9, bevelEnabled: false }), mRoof, 0, h, 0, g); rm.rotation.y = Math.PI / 2; rm.position.set(-(w + 0.9) / 2, h + 0.2, 0);
    const nx = Math.max(2, Math.round(w / 2.4)), floors = h > 5 ? 2 : 1;
    for (let fl = 0; fl < floors; fl++) for (let i = 0; i < nx; i++) { const wx = -w / 2 + (i + 0.5) * (w / nx), wy = 1.9 + fl * 2.9, zf = d / 2 + 0.03;
      if (fl === 0 && i === Math.floor(nx / 2)) { add(box(1.2, 2.3, 0.14), mDoor, wx, 1.3, zf, g); add(box(1.5, 0.2, 0.2), mWhite, wx, 2.5, zf + 0.04, g); continue; }
      add(box(0.9, 1.5, 0.1), mGlass, wx, wy, zf, g, { cast: false });
      for (const s of [-1, 1]) add(box(0.46, 1.5, 0.12), mShut, wx + s * 0.7, wy, zf + 0.02, g, { cast: false });
      add(box(1.1, 0.1, 0.1), mWhite, wx, wy + 0.85, zf + 0.04, g, { cast: false });
      if (fl === 1 && o.balcony !== false) { add(box(2.0, 0.12, 0.7), mWhite, wx, wy - 0.85, zf + 0.3, g, { cast: false }); add(box(2.0, 0.5, 0.05), mIron, wx, wy - 0.55, zf + 0.62, g, { cast: false }); } }
    return g; };
  let xx = -26; for (let i = 0; xx < 48; i++) { const w = 6 + (i % 3) * 1.4, h = i % 2 ? 7.4 : 5.2; facade(xx + w / 2, -10 - (i % 3) * 0.3, w, h, i, { ry: ((i % 3) - 1) * 0.015 }); xx += w + 0.25; }
  xx = -30; for (let i = 0; xx < 50; i++) { const w = 7 + (i % 2) * 1.5; facade(xx + w / 2, -19, w, 5.5 + (i % 3), i + 2, { balcony: false }); xx += w + 0.5; }
  // ---------- palmiers, arbres, lampadaires ----------
  const palm = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r() * 6; world.add(g); const tr = add(new THREE.CylinderGeometry(0.14 * s, 0.22 * s, 4.6 * s, 7), M('#8a6a44'), 0, 2.3 * s, 0, g); tr.rotation.z = 0.08;
    for (let k = 0; k < 8; k++) { const a = k * 0.785, lf = add(new THREE.ConeGeometry(0.28 * s, 2.4 * s, 4), M(k % 2 ? '#4f9a3c' : '#62ae48'), Math.cos(a) * 0.9 * s, 4.55 * s, Math.sin(a) * 0.9 * s, g);
      lf.rotation.set(Math.sin(a) * 1.3, 0, -Math.cos(a) * 1.3); lf.scale.set(1, 1, 0.35); } return g; };
  for (const [x, z] of [[-14, -6.4], [-2, -6.5], [14, -6.4], [26, -6.5], [38, -6.4], [4, -14], [22, -15], [-18, -15]]) { if (r() > 0.4) K.tree(x, z, { s: 1.15 }); else palm(x, z, 1.1); }
  for (const x of [-8, 0, 12, 20, 30]) K.lamp(x, -5.4, { h: 3.6 });
  // ---------- étal de la prime (table + pile de queues + affiche) ----------
  const wood = M('#9a6a3e'), wood2 = M('#7a5130');
  const stall = new THREE.Group(); stall.position.set(6.7, 0, -2.4); world.add(stall);
  add(box(2.8, 0.1, 1.2), wood, 0, 0.95, 0, stall); for (const sx of [-1.3, 1.3]) for (const sz of [-0.5, 0.5]) add(box(0.1, 0.95, 0.1), wood2, sx, 0.47, sz, stall);
  add(box(2.8, 0.55, 0.06), wood2, 0, 0.62, 0.58, stall);
  for (const sx of [-1.35, 1.35]) add(box(0.08, 2.9, 0.08), wood2, sx, 1.45, -0.55, stall);
  add(box(2.9, 0.12, 0.12), wood2, 0, 2.9, -0.55, stall);
  const posterC = cv(512, 256, (g, w, h) => { g.fillStyle = '#f3ead2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3b2a20'; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#c8312c'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 92px Montserrat, Arial, sans-serif'; g.fillText('PRIME', w / 2, 82); g.fillStyle = '#3b2a20'; g.font = '800 54px Montserrat, Arial, sans-serif'; g.fillText('1 CENTIME', w / 2, 158); g.fillText('PAR QUEUE', w / 2, 212); });
  const poster = new THREE.Group(); stall.add(poster); add(new THREE.PlaneGeometry(1.6, 0.8), toon({ map: P.tex(posterC) }), 0, 2.15, -0.45, poster, { cast: false });
  add(box(1.7, 0.9, 0.04), wood2, 0, 2.15, -0.5, poster, { cast: false });
  const tailM = M('#b79a98'), tailD = M('#8a7576'), tails = [], NT = 260;
  for (let i = 0; i < NT; i++) { const R = 1.15, rho = Math.sqrt(r()) * R, a = r() * 6.283, hy = 1.0 + (1 - rho / R) * 0.62 * Math.min(1, 0.6 + i / NT * 0.5);
    const t = add(new THREE.CylinderGeometry(0.014, 0.03, 0.36, 4), i % 3 ? tailM : tailD, Math.cos(a) * rho, hy + (r() - 0.5) * 0.06, Math.sin(a) * rho * 0.45, stall, { cast: false });
    t.rotation.set(r() * 3, r() * 3, r() * 3); t.userData.rank = i; tails.push(t); }
  // ---------- faubourg : cabanes de paille, cages, rizière ----------
  plane(-34, -6, 40, 20, M('#8fb85a'), 0.012);
  const hut = (x, z, ry = 0, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    add(box(2.6 * s, 1.7 * s, 2.2 * s), M('#c9a870'), 0, 0.85 * s, 0, g); const rf = add(new THREE.ConeGeometry(2.3 * s, 1.5 * s, 4), M('#b89050'), 0, 2.4 * s, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.9);
    add(box(0.7 * s, 1.1 * s, 0.1), M('#5a3a24'), 0, 0.55 * s, 1.12 * s, g); return g; };
  hut(-36, -7.5, 0.2); hut(-30, -9, -0.15, 1.15); hut(-24, -7.8, 0.1, 0.95);
  const cage = (x, z, ry = 0, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g); const bw = 1.1 * s;
    add(box(bw, 0.06, 0.8 * s), wood2, 0, 0.35 * s, 0, g); add(box(bw, 0.06, 0.8 * s), wood2, 0, 0.95 * s, 0, g);
    for (let i = 0; i <= 6; i++) add(box(0.03, 0.6 * s, 0.03), wood, -bw / 2 + i * bw / 6, 0.65 * s, 0.4 * s, g, { cast: false });
    for (const sx of [-bw / 2, bw / 2]) add(box(0.06, 0.7 * s, 0.06), wood2, sx, 0.65 * s, -0.38 * s, g, { cast: false }); add(box(bw, 0.5 * s, 0.04), wood, 0, 0.65 * s, -0.4 * s, g, { cast: false });
    for (const sx of [-bw / 2, bw / 2]) for (const sz of [-0.38, 0.38]) add(box(0.06, 0.35 * s, 0.06), wood2, sx, 0.17 * s, sz * s, g, { cast: false }); return g; };
  [[-34.5, -4.6], [-33, -4.4], [-31.2, -5.0], [-28.6, -4.6], [-26.9, -5.1], [-24.8, -4.5], [-35.6, -5.4]].forEach(([x, z], i) => { cage(x, z, (i % 3 - 1) * 0.15); });
  cage(-34.5, -4.6).position.y = 1.0; cage(-31.2, -5.0).position.y = 1.0; cage(-26.9, -5.1).position.y = 1.0;
  for (const [x, z] of [[-40, -3], [-22, -12], [-38, -14], [-28, -16], [-44, -9]]) palm(x, z, 1.15);
  K.scatter(['bush', 'sack', 'barrel', 'crate', 'rock'], { x0: -40, x1: -20, z0: -11, z1: -2, n: 22, avoid: (x, z) => z < -6.5 && x > -38 && x < -22 && false });
  K.verge(-42, -18, -12, -2, { density: 2.2 });
  // ---------- habillage de la rue ----------
  K.scatter(['crate', 'barrel', 'sack', 'bush', 'pot'], { x0: -22, x1: 46, z0: -9, z1: -7.2, n: 38 });
  K.scatter(['bench', 'cafe', 'stall'], { x0: -20, x1: 44, z0: -8.2, z1: -7.4, n: 7, opts: {} });
  K.verge(-22, 46, -6.5, -5.2, { density: 1.6 });
  K.sign(-5.5, -6.0, 'HANOÏ', 0.05, { bg: '#f3ead2' });
  // ---------- vue en coupe : l'égout sous la rue (très loin, x = 5000) ----------
  const C = buildCoupe(ctx, { at: [CX, 0, 0], w: 36, d: 14, top: 'cobble', seed: 4,
    layers: [{ h: 0.7, col: '#a89a88', dots: '#7a6e60' }, { h: 1.5, col: '#c9a574', dots: '#a07a4a' }, { h: 2.6, col: '#b08658', dots: '#7a5a38' }, { h: 3.2, col: '#8a6a50', dots: '#5a4030' }, { h: 4, col: '#6a5a50', dots: '#4a3e38' }],
    rooms: [{ x0: -15, x1: 15, y0: -6.0, y1: -2.6, depth: 6, wall: '#a09484', floor: '#5f574e', ceil: '#867a6a', light: '#ffd27a' }],
    pipes: [{ pts: [[-17, -1.4], [-6, -1.5], [3, -1.3], [17, -1.5]], r: 0.3, col: '#8a8f96' }] });
  { const g = new THREE.Group(); g.position.set(CX, 0, 0); world.add(g);
    // arches de briques de l'égout + grille d'évacuation
    add(box(30, 0.35, 0.3), M('#7a5a46'), 0, -2.75, 6.9, g, { cast: false });
    // fond de l'égout : briques, rigole d'eau sale, tuyau, lampes suspendues
    const brickC = cv(256, 128, (c, w, h) => { c.fillStyle = '#8a7a6a'; c.fillRect(0, 0, w, h); for (let j = 0; j < 4; j++) for (let i = -1; i < 5; i++) { const x = i * 64 + (j % 2 ? 32 : 0), v = 120 + r() * 50 | 0; c.fillStyle = `rgb(${v + 30},${v - 4},${v - 24})`; c.strokeStyle = 'rgba(50,34,30,0.8)'; c.lineWidth = 3; c.fillRect(x + 2, j * 32 + 2, 60, 28); c.strokeRect(x + 2, j * 32 + 2, 60, 28); } });
    const bw = add(new THREE.PlaneGeometry(30, 3.2), toon({ map: P.tex(brickC, 40, 4) }), 0, -4.3, 1.2, g, { cast: false });
    const ch = add(new THREE.PlaneGeometry(30, 1.0), M('#4d6a6a'), 0, -5.88, 4.2, g, { cast: false }); ch.rotation.x = -Math.PI / 2;
    const pipe = add(new THREE.CylinderGeometry(0.22, 0.22, 30, 10), M('#7a8088'), 0, -2.95, 1.5, g, { cast: false }); pipe.rotation.z = Math.PI / 2;
    for (const x of [-9.5, 6.8, 11.5]) { add(box(1.7, 2.3, 0.1), M('#14121c'), x, -4.75, 1.25, g, { cast: false }); add(box(2.0, 0.25, 0.14), M('#6a5a4a'), x, -3.55, 1.27, g, { cast: false }); }
    for (const x of [-10, -2, 6, 13]) { add(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), M('#2f3440'), x, -3.0, 3.2, g, { cast: false }); add(new THREE.SphereGeometry(0.16, 8, 6), K.lampMat, x, -3.35, 3.2, g, { cast: false }); }
    // façades et décor de la rue au-dessus
    [[-11, 7, 5.8, 0], [-3.6, 6, 7, 2], [4.4, 7.2, 5.6, 4], [12, 6.4, 7.4, 1]].forEach(([x, w, h, ci]) => { const f = facade(CX + x, -4.2, w, h, ci, { d: 5 }); });
    for (const x of [-15, -6, 8, 15]) K.lamp(CX + x, -1.6, { h: 3.4 });
    K.tree(CX - 14, -2.2, { s: 1.1 }); K.tree(CX + 14.5, -2.4, { s: 1.0 }); K.barrel(CX - 8, -1.8); K.crate(CX + 9.5, -1.6); K.sack(CX - 1, -1.8); }
  // ---------- ciel ----------
  const clouds = [];
  { const rr = P.rng(91); for (let i = 0; i < 12; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  function state(S) {
    const k = S.tails ?? 0; for (const t of tails) t.visible = t.userData.rank < k * NT;
    poster.visible = (S.poster ?? 1) > 0;
  }
  return { DECK, K, C, clouds, state, onLight: () => {} };
}
