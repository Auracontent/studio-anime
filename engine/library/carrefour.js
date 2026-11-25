// Library set: CARREFOUR new-yorkais (Pourkoipa original) : avenue large, passage piéton rayé, poteaux à bouton, bonhomme rouge / vert,
// feux, taxis jaunes sans inscription, tours de briques avec réservoirs d'eau sur les toits, cheminées de vapeur orange et blanc.
// + 3 zones lointaines : campus au soleil (x = 300), poteau ouvert en coupe (x = 5000), et la rangée de poteaux le long de l'avenue.
// DECK = 0. Les caméras regardent depuis +z vers -z. L'avenue court le long de x (asphalte z -5.5..5.5), trottoir proche z 5.5..12, lointain z -12..-5.5.
// Passage piéton : barres en x -3.85..3.85. Poteaux à bouton (face à +z) : P1 (-4.9, 0, 6.2) et P2 (4.9, 0, 6.2). Signaux piétons lointains (-4.9, 0, -6.2), (4.9, 0, -6.2).
// Campus : CAMPUS = [300, 0, 0] (route z -4..4, passage x -3..3, poteau (296, 0, 5.2), barrière z -6.6). Coupe du poteau : CX = 5000 (sol y = 0, poteau ouvert au centre).
// state(S, f) : S.walk (0 = bonhomme rouge, 1 = vert), S.cars [{ x, z, dir, i }] (jusqu'à 10 voitures, i >= 6 = voitures ordinaires), S.carGreen (0/1 : feu voitures vert),
//   S.clock (images : aiguilles de l'horloge de la coupe), S.gap (0 = fil pendant et débranché, 1 = fil branché), S.led (0/1 voyant du boîtier).
import { propKit } from './props.js';
export const DECK = 0;
export const CX = 5000;
export const CAMPUS = [300, 0, 0];
export const SPOTS = { carrefour: [0, 0, 0], p1: [-4.9, 0, 6.2], p2: [4.9, 0, 6.2], campus: CAMPUS, coupe: [CX, 0, 0] };

export function buildCarrefour(ctx, { seed = 2004 } = {}) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  const BM = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const INK = '#271925';
  // ---------- textures ----------
  const asphaltT = cv(256, 256, (g, w, h) => { g.fillStyle = '#5b5f68'; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { const v = 70 + r() * 50 | 0; g.fillStyle = `rgba(${v},${v + 2},${v + 8},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2, r() * 3, 0, 7); g.fill(); } });
  const slabT = cv(256, 256, (g, w, h) => { g.fillStyle = '#c9c4ba'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,74,70,0.55)'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(120,112,104,${0.15 + r() * 0.2})`; g.beginPath(); g.ellipse(r() * w, r() * h, 1 + r() * 4, 1 + r() * 2, 0, 0, 7); g.fill(); } });
  const sandT = cv(256, 256, (g, w, h) => { g.fillStyle = '#dcc08a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(${170 + r() * 50 | 0},${140 + r() * 40 | 0},${90 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 6, 1 + r() * 3, r() * 3, 0, 7); g.fill(); } });
  const lawnT = cv(256, 256, (g, w, h) => { g.fillStyle = '#86b84e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${90 + r() * 40 | 0},${150 + r() * 50 | 0},${50 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 5, 1 + r() * 2, r() * 3, 0, 7); g.fill(); } });
  // façades : briques + fenêtres (quelques-unes allumées)
  const facadeT = (wall, brick, glass, lit) => cv(256, 256, (g, w, h) => { g.fillStyle = wall; g.fillRect(0, 0, w, h); g.strokeStyle = brick; g.lineWidth = 2;
    for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) { g.strokeRect(i * 32 + (j % 2 ? 16 : 0), j * 16, 32, 16); }
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = i * 64 + 14, y = j * 64 + 12, on = r() < lit; g.fillStyle = INK; g.fillRect(x - 3, y - 3, 42, 50); g.fillStyle = on ? '#ffe39a' : glass; g.fillRect(x, y, 36, 44); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x, y, 36, 8); g.fillStyle = '#e9e2d4'; g.fillRect(x - 5, y + 44, 46, 6); } });
  const FAC = [facadeT('#b5533e', '#8f3a2c', '#33466a', 0.12), facadeT('#c9a77c', '#a0825a', '#3a4c70', 0.1), facadeT('#9a8a7e', '#7a6c62', '#2f4264', 0.1), facadeT('#d8b48a', '#b08c66', '#364a6e', 0.14), facadeT('#8e4a3c', '#6c3328', '#2c3e60', 0.1)];
  const plane = (x, z, w, d, m, y = 0.01) => { const p = add(new THREE.PlaneGeometry(w, d), m, x, y, z, world, { cast: false }); p.rotation.x = -Math.PI / 2; return p; };
  const steel = M('#aab2bc'), steelD = M('#6c7580'), dark = M('#1c2028'), white = M('#f4f1ea'), glassM = M('#2a3a58');
  // ---------- sol : avenue, trottoirs, carrefours ----------
  plane(0, 0, 3000, 3000, M('#8d8a82'), -0.05);
  plane(20, 0, 220, 11, toon({ map: P.tex(asphaltT, 60, 3) }), 0.01);
  for (const x0 of [-21, 29]) plane(x0, 0, 10, 140, toon({ map: P.tex(asphaltT, 3, 40) }), 0.012);
  for (const s of [-1, 1]) { plane(20, s * 8.75, 220, 6.5, toon({ map: P.tex(slabT, 70, 2) }), 0.03); add(box(220, 0.14, 0.3), M('#b9b4aa'), 20, 0.07, s * 5.55, world, { cast: false }); }
  // passage piéton + lignes de l'avenue
  for (let i = 0; i < 8; i++) add(box(0.6, 0.03, 10.4), M('#f4f1ea'), -3.85 + i * 1.1, 0.03, 0, world, { cast: false });
  for (const s of [-1, 1]) add(box(0.5, 0.03, 4.8), M('#f4f1ea'), s * 5.4, 0.03, 2.6 * (s < 0 ? -1 : 1) * 0 + 2.6, world, { cast: false });
  for (let x = -70; x < 120; x += 6) { if (Math.abs(x) < 8) continue; add(box(2.4, 0.03, 0.18), M('#ffd23a'), x, 0.03, 0.0, world, { cast: false }); }
  // ---------- tours ----------
  const tower = (x, z, w, h, d, ci, o = {}) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    const m = toon({ map: P.tex(FAC[ci % FAC.length], w / 7, h / 7) }); add(box(w, h, d), m, 0, h / 2, 0, g);
    add(box(w + 0.4, 0.5, d + 0.4), M('#d8d0c0'), 0, h + 0.25, 0, g); add(box(w + 0.2, 0.9, d + 0.2), M('#8a8278'), 0, 0.45, 0, g);
    if (o.tank) { add(new THREE.CylinderGeometry(1.5, 1.5, 2.4, 10), M('#8a5a3a'), w * 0.2, h + 1.7, 0, g); add(new THREE.ConeGeometry(1.7, 1.0, 10), M('#6a4a34'), w * 0.2, h + 3.4, 0, g);
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(box(0.16, 1.2, 0.16), IR, w * 0.2 + dx * 1.1, h + 0.9, dz * 1.1, g); }
    if (o.awning) { for (let i = 0; i < 6; i++) { const st = add(box(w / 6, 0.06, 1.6), M(i % 2 ? '#ffffff' : o.awning), -w / 2 + (i + 0.5) * w / 6, 3.0, d / 2 + 0.8, g, { cast: false }); st.rotation.x = 0.25; } }
    return g; };
  const IR = M('#2f3440');
  let ci = 0;
  for (const [x0, x1] of [[-90, -27], [-15, 23], [35, 125]]) { let x = x0; while (x < x1) { const w = 7 + Math.floor(r() * 4) * 1.6, h = 12 + Math.floor(r() * 14), d = 9 + r() * 4; if (x + w > x1) break;
    tower(x + w / 2, -12 - d / 2, w, h, d, ci++, { tank: r() < 0.28, awning: h < 17 && r() < 0.5 ? ['#c8312c', '#1f6aa8', '#2f8a4a'][ci % 3] : null }); x += w + 0.3; } }
  for (const [x0, x1] of [[-90, -27], [-15, 23], [35, 125]]) { let x = x0; while (x < x1) { const w = 9 + Math.floor(r() * 3) * 2, h = 26 + Math.floor(r() * 30); if (x + w > x1) break; tower(x + w / 2, -34, w, h, 12, ci++, { tank: r() < 0.2 }); x += w + 1.5; } }
  for (const [x0, x1] of [[-90, -27], [-15, 23], [35, 125]]) { let x = x0; while (x < x1) { const w = 8 + Math.floor(r() * 3) * 1.6, h = 10 + Math.floor(r() * 10); if (x + w > x1) break; tower(x + w / 2, 70, w * 1.6, h * 2.2, 14, ci++, { tank: false }); x += w + 0.4; } }
  // ---------- poteaux à bouton (face à +z) et signaux piétons ----------
  const walkTex = (green) => cv(128, 160, (g, w, h) => { g.fillStyle = '#14161c'; g.fillRect(0, 0, w, h); const col = green ? '#52e07a' : '#ff4a3a'; g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.arc(64, 36, 15, 0, 7); g.fill(); g.lineWidth = 17;
    if (green) { g.beginPath(); g.moveTo(66, 58); g.lineTo(62, 100); g.moveTo(64, 66); g.lineTo(88, 92); g.moveTo(62, 100); g.lineTo(84, 142); g.moveTo(62, 100); g.lineTo(40, 140); g.moveTo(64, 66); g.lineTo(40, 86); g.stroke(); }
    else { g.beginPath(); g.moveTo(64, 58); g.lineTo(64, 104); g.moveTo(64, 62); g.lineTo(38, 92); g.moveTo(64, 62); g.lineTo(90, 92); g.moveTo(64, 104); g.lineTo(46, 144); g.moveTo(64, 104); g.lineTo(82, 144); g.stroke(); } });
  const signals = [];
  const signalPole = (x, z, ry = 0, o = {}) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    add(new THREE.CylinderGeometry(0.1, 0.13, 3.3, 10), steel, 0, 1.65, 0, g); add(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 10), steelD, 0, 0.15, 0, g);
    if (o.head) { add(box(0.62, 0.76, 0.26), dark, 0, 2.9, 0.18, g); const mk = (gr) => { const m = add(new THREE.PlaneGeometry(0.5, 0.62), new THREE.MeshBasicMaterial({ map: P.tex(walkTex(gr)), fog: false }), 0, 2.9, 0.32, g, { cast: false }); return m; };
      const red = mk(false), grn = mk(true); signals.push({ red, grn }); }
    if (o.button) { add(box(0.2, 0.3, 0.07), steelD, 0, 1.15, 0.13, g); const b = add(new THREE.CylinderGeometry(0.058, 0.058, 0.05, 14), M('#eef0f2'), 0, 1.1, 0.19, g, { cast: false }); b.rotation.x = Math.PI / 2; g.userData.button = b;
      add(box(0.13, 0.08, 0.02), M('#ffd23a'), 0, 1.28, 0.175, g, { cast: false }); }
    return g; };
  signalPole(-4.9, 6.2, 0, { button: true }); signalPole(4.9, 6.2, 0, { button: true });
  signalPole(-4.9, -6.2, 0, { head: true }); signalPole(4.9, -6.2, 0, { head: true });
  // rangée de poteaux à bouton le long des deux trottoirs (le montage « des milliers de boutons »)
  for (let x = -60; x <= 112; x += 11) { if (Math.abs(x) < 13) continue; signalPole(x, 6.2, 0, { button: true }); signalPole(x + 5, -6.2, Math.PI, { button: true }); }
  // feux de circulation sur mâts
  const carLamps = [];
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 7.2, 0, -6.4); world.add(g); add(new THREE.CylinderGeometry(0.12, 0.15, 5.4, 10), IR, 0, 2.7, 0, g); add(box(0.12, 0.12, 5.0), IR, 0, 5.3, 2.4, g);
    add(box(0.5, 1.3, 0.4), dark, 0, 4.7, 4.5, g, { cast: false }); const lamps = ['#ff3a2a', '#ffc02a', '#38e070'].map((c, i) => { const m = add(new THREE.SphereGeometry(0.15, 10, 8), BM(c), 0, 5.1 - i * 0.4, 4.72, g, { cast: false }); return m; }); carLamps.push(lamps); }
  // ---------- taxis & voitures ----------
  const cars = [];
  const carBuild = (i) => { const g = new THREE.Group(); world.add(g); const taxi = i < 6, col = taxi ? '#f7c52b' : ['#f4f1ea', '#2f6ab8', '#c8312c', '#3a8a5a'][i % 4]; const body = M(col);
    add(box(3.9, 0.7, 1.7), body, 0, 0.62, 0, g); add(box(2.1, 0.62, 1.55), glassM, -0.25, 1.28, 0, g); add(box(2.2, 0.1, 1.62), body, -0.25, 1.62, 0, g);
    for (const sx of [-1.3, 1.25]) for (const sz of [-0.82, 0.82]) { const w = add(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 12), dark, sx, 0.34, sz, g, { cast: false }); w.rotation.x = Math.PI / 2; }
    add(box(3.92, 0.12, 1.72), M(taxi ? '#271925' : '#8a8f98'), 0, 0.5, 0, g, { cast: false }); add(box(0.12, 0.18, 1.2), BM('#fff2c0'), 1.96, 0.7, 0, g, { cast: false }); add(box(0.1, 0.18, 1.2), BM('#d8362a'), -1.96, 0.7, 0, g, { cast: false });
    if (taxi) add(box(0.55, 0.2, 0.28), M('#fffbe8'), -0.3, 1.76, 0, g, { cast: false });
    g.visible = false; cars.push(g); return g; };
  for (let i = 0; i < 10; i++) carBuild(i);
  // ---------- décor de rue ----------
  const hydrant = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.16, 0.18, 0.7, 10), M('#d8322e'), 0, 0.35, 0, g); add(new THREE.SphereGeometry(0.17, 10, 8), M('#d8322e'), 0, 0.72, 0, g); add(box(0.4, 0.1, 0.1), M('#d8322e'), 0, 0.5, 0, g); };
  const steamStack = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.34 - i * 0.02, 0.42 - i * 0.02, 0.5, 12), M(i % 2 ? '#ffffff' : '#ff7a22'), 0, 0.25 + i * 0.5, 0, g); add(new THREE.ConeGeometry(0.34, 0.5, 12), M('#ff7a22'), 0, 2.25, 0, g); };
  const trash = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 10), M('#3a6a52'), 0, 0.4, 0, g); add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 10), IR, 0, 0.83, 0, g); };
  hydrant(-7.4, 6.6); hydrant(24, -6.8); steamStack(8.8, -7.4); steamStack(-12, 7.6); trash(-6.2, 6.4); trash(6.4, 6.4); trash(-8.2, -6.6);
  for (const x of [-30, -12, 12, 30, 44, 60, 80, 100, -45, -60]) K.tree(x, 12.8, { s: 0.9, leaf: '#6fae45' });
  for (const x of [-34, -10, 14, 40, 66, 90, -52]) K.tree(x, -10.4, { s: 0.85 });
  for (const x of [-16, 10, 38, 70, 104, -40]) K.lamp(x, 6.4, { h: 4.6 });
  K.stall(10.5, 7.8, 0, { awning: ['#d23a32', '#ffffff'], fruits: ['#e8442e', '#f2b52a', '#c43a2a'] }); K.stall(-14, 7.8, 0.15, { awning: ['#1f6aa8', '#ffffff'] });
  K.bench(-8.8, 9.4, Math.PI, {}); K.bench(8.8, 9.4, Math.PI, { color: '#7a4a2e' }); K.cafe(-3, -8.8, {}); K.cafe(3, -8.8, { chair: '#1f6aa8' });
  K.sign(-5.6, 7.0, 'AVENUE', 0.05, { bg: '#2f6a4a', fg: '#ffffff' });
  K.scatter(['crate', 'barrel', 'sack', 'pot', 'bush'], { x0: -40, x1: 80, z0: 9.6, z1: 11.6, n: 36, avoid: (x) => Math.abs(x) < 10 || (x > 14 && x < 72) });
  K.scatter(['crate', 'barrel', 'pot', 'bush'], { x0: -40, x1: 80, z0: -11.4, z1: -9.6, n: 30, avoid: (x) => Math.abs(x) < 4 });
  K.verge(-60, 120, 10.6, 11.9, { density: 1.2, flowers: false });
  // ---------- campus au soleil (x = 300) ----------
  { const [cx] = CAMPUS;
    plane(cx, 0, 220, 160, toon({ map: P.tex(sandT, 60, 40) }), 0.0);
    plane(cx, -22, 160, 28, toon({ map: P.tex(lawnT, 40, 8) }), 0.02);
    plane(cx, 0, 160, 8, toon({ map: P.tex(asphaltT, 40, 2) }), 0.03);
    for (const s of [-1, 1]) { plane(cx, s * 6.4, 160, 4.8, toon({ map: P.tex(slabT, 50, 1.4) }), 0.04); add(box(160, 0.14, 0.3), M('#b9b4aa'), cx, 0.07, s * 4.05, world, { cast: false }); }
    for (let i = 0; i < 6; i++) add(box(0.6, 0.03, 8), M('#f4f1ea'), cx - 2.75 + i * 1.1, 0.05, 0, world, { cast: false });
    signalPole(cx - 4.2, 5.2, 0, { button: true }); signalPole(cx + 4.2, 5.2, 0, { button: true }); signalPole(cx - 4.2, -5.2, Math.PI, { button: true });
    K.fence(cx - 14, -6.6, cx + 14, -6.6, { color: '#2f3440' });
    const campusB = (x, z, w, h, d) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(box(w, h, d), M('#f1ece0'), 0, h / 2, 0, g); add(box(w + 0.4, 0.3, d + 0.4), M('#c9c2b2'), 0, h + 0.15, 0, g);
      add(box(w - 1.2, h * 0.5, 0.1), glassM, 0, h * 0.55, d / 2 + 0.03, g, { cast: false }); for (let i = 1; i < 6; i++) add(box(0.08, h * 0.5, 0.14), M('#dcd5c4'), -w / 2 + 0.6 + i * (w - 1.2) / 6, h * 0.55, d / 2 + 0.06, g, { cast: false }); add(box(w, 0.35, 1.8), M('#ffb042'), 0, h * 0.86, d / 2 + 0.9, g, { cast: false }); };
    campusB(cx - 26, -30, 22, 7, 10); campusB(cx + 4, -34, 26, 9, 10); campusB(cx + 36, -29, 20, 6.5, 10); campusB(cx - 56, -36, 20, 8, 10);
    for (const x of [-34, -20, -8, 8, 20, 34, 48, -48]) K.tree(cx + x, -16 + (x % 3), { s: 1.0, leaf: '#8aa05a' });
    for (let i = 0; i < 9; i++) { const x = cx - 40 + i * 10, g = new THREE.Group(); g.position.set(x, 0, 9 + (i % 3)); world.add(g); add(new THREE.CylinderGeometry(0.14, 0.2, 4.4, 7), M('#8a6a44'), 0, 2.2, 0, g);
      for (let k = 0; k < 8; k++) { const a = k * 0.785, lf = add(new THREE.ConeGeometry(0.3, 2.6, 4), M(k % 2 ? '#4f9a3c' : '#62ae48'), Math.cos(a) * 0.9, 4.45, Math.sin(a) * 0.9, g); lf.rotation.set(Math.sin(a) * 1.3, 0, -Math.cos(a) * 1.3); lf.scale.set(1, 1, 0.35); } }
    K.bench(cx - 8, 8.6, Math.PI, {}); K.bench(cx + 9, 8.8, Math.PI, { color: '#7a4a2e' }); K.sign(cx - 7.2, 5.9, 'CAMPUS', 0.05, { bg: '#f3ead2' });
    K.scatter(['bush', 'rock', 'pot', 'sack'], { x0: cx - 50, x1: cx + 50, z0: 8, z1: 14, n: 30 }); K.scatter(['bush', 'rock', 'bench'], { x0: cx - 50, x1: cx + 50, z0: -14, z1: -8, n: 22 });
    K.verge(cx - 60, cx + 60, 7.4, 14, { density: 1.3 });
    for (let i = 0; i < 6; i++) { const m = add(new THREE.ConeGeometry(30 + i * 8, 14 + (i % 3) * 8, 6), M(['#d8b078', '#caa46a', '#e0bd86'][i % 3]), cx - 160 + i * 64, 6, -90 - (i % 2) * 20, world, { cast: false }); m.scale.set(1.6, 1, 1); } }
  // ---------- poteau ouvert, vue en coupe (x = 5000) ----------
  let clockHands = null, gapA = null, gapB = null, gapC = null, ledM = null, sparkM = null;
  { const g = new THREE.Group(); g.position.set(CX, 0, 0); world.add(g);
    add(box(40, 1.4, 8), M('#7a736b'), 0, -0.7, -1.5, g, { cast: false });
    add(box(46, 24, 0.4), toon({ map: P.tex(cv(256, 256, (c, w, h) => { c.fillStyle = '#41506e'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 2; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, h); c.moveTo(0, i * 32); c.lineTo(w, i * 32); c.stroke(); } }), 12, 6) }), 0, 11, -5.2, g, { cast: false });
    // le poteau : 3 parois de tôle + fond sombre, face avant ouverte
    add(box(2.8, 8.2, 0.2), dark, 0, 4.1, -0.5, g, { cast: false }); add(box(0.25, 8.2, 1.4), steel, -1.4, 4.1, 0.1, g); add(box(0.25, 8.2, 1.4), steel, 1.4, 4.1, 0.1, g);
    add(box(3.1, 0.3, 1.5), steelD, 0, 8.3, 0.1, g); add(box(3.1, 0.3, 1.5), steelD, 0, 0.15, 0.1, g);
    // le bouton, côté gauche : vu de l'intérieur, ses deux bornes
    add(box(0.6, 1.2, 1.0), steelD, -1.85, 5.6, 0.1, g); const bb = add(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 16), M('#eef0f2'), -2.3, 5.6, 0.1, g); bb.rotation.z = Math.PI / 2;
    for (const dy of [-0.25, 0.25]) add(box(0.3, 0.12, 0.12), M('#d8a840'), -1.15, 5.6 + dy, 0.55, g, { cast: false });
    // fil du bouton : il pend et s'arrête dans le vide (cuivre nu au bout)
    const seg = (pts, col, rad, parent) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), m = add(new THREE.CylinderGeometry(rad, rad, len, 6), M(col), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.58, parent, { cast: false }); m.rotation.z = -Math.atan2(b[0] - a[0], b[1] - a[1]); out.push(m); } return out; };
    gapA = new THREE.Group(); g.add(gapA); seg([[-1.15, 5.35], [-0.9, 4.8], [-0.75, 4.3], [-0.6, 3.8]], '#1a1d24', 0.07, gapA); add(new THREE.SphereGeometry(0.09, 8, 6), M('#e08a3a'), -0.6, 3.75, 0.58, gapA, { cast: false });
    gapB = new THREE.Group(); g.add(gapB); seg([[0.4, 1.9], [0.45, 2.2], [0.0, 2.5], [-0.5, 2.7]], '#1a1d24', 0.07, gapB); add(new THREE.SphereGeometry(0.09, 8, 6), M('#e08a3a'), -0.5, 2.68, 0.58, gapB, { cast: false });
    gapC = new THREE.Group(); g.add(gapC); seg([[-0.6, 3.75], [-0.5, 2.68]], '#1a1d24', 0.07, gapC);
    sparkM = add(new THREE.SphereGeometry(0.22, 8, 6), BM('#fff08a'), -0.55, 3.2, 0.7, g, { cast: false }); sparkM.visible = false;
    // boîtier de commande en bas : voyant, fils qui partent vers le feu
    add(box(1.9, 1.5, 0.7), M('#5a6270'), 0.2, 1.1, 0.0, g); ledM = add(new THREE.SphereGeometry(0.1, 8, 6), BM('#38e070'), 0.2 + 0.55, 1.65, 0.38, g, { cast: false });
    for (let i = 0; i < 3; i++) add(box(0.07, 3.4, 0.07), M(['#2a6ad8', '#d8322e', '#f2c230'][i]), 0.9 + i * 0.12, 3.6, 0.35, g, { cast: false });
    // horloge murale (cycle minuté) : cadran + aiguilles
    const cl = new THREE.Group(); cl.position.set(5.3, 5.8, -4.9); g.add(cl);
    add(new THREE.CircleGeometry(1.5, 32), toon({ map: P.tex(cv(256, 256, (c, w, h) => { c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(128, 128, 124, 0, 7); c.fill(); c.lineWidth = 12; c.strokeStyle = INK; c.stroke(); c.lineWidth = 8; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); c.lineTo(128 + Math.sin(a) * 116, 128 - Math.cos(a) * 116); c.stroke(); } })) }), 0, 0, 0, cl, { cast: false });
    const hand = (len, w, col) => { const h = new THREE.Group(); cl.add(h); add(box(w, len, 0.06), M(col), 0, len / 2, 0.06, h, { cast: false }); return h; };
    clockHands = { m: hand(1.15, 0.1, INK), h: hand(0.75, 0.14, INK), s: hand(1.25, 0.04, '#d8322e') };
    cl.position.z = -4.9; add(box(0.2, 1.6, 0.1), steelD, 5.3, 3.7, -4.95, g, { cast: false });
    // dalle de sol + herbe sur les bords
    K.scatter(['rock'], { x0: CX - 18, x1: CX - 10, z0: -3, z1: 1, n: 3 }); }
  // ---------- ciel ----------
  const clouds = [];
  { const rr = P.rng(91); for (let i = 0; i < 12; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  function state(S, f) {
    for (const s of signals) { s.red.visible = !S.walk; s.grn.visible = !!S.walk; }
    for (const L of carLamps) { L[0].visible = !S.carGreen; L[2].visible = !!S.carGreen; L[1].visible = false; }
    cars.forEach((c, i) => { const t = (S.cars || [])[i]; c.visible = !!t; if (!t) return; c.position.set(t.x, 0, t.z); c.rotation.y = t.dir > 0 ? 0 : Math.PI; });
    const T = (S.clock || 0) / 30; clockHands.s.rotation.z = -T * 6.2832 / 6; clockHands.m.rotation.z = -T * 6.2832 / 72; clockHands.h.rotation.z = -T * 6.2832 / 864;
    gapC.visible = !!S.gap; if (sparkM) sparkM.visible = !!S.spark; if (ledM) ledM.visible = (S.led ?? 1) > 0;
  }
  return { DECK, K, clouds, state, onLight: () => {} };
}
