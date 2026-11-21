// Library set: Paris sous la neige, hiver 1870-1871 (siège de Paris).
// Extérieur (sol DECK = 0 à y = 0, neige) : toits/terrasse enneigés, immeubles à mansarde en rangées (derrière : z = -9 ; devant : z = +17),
//   dôme doré au loin (z = -70), camp prussien à l'ouest (x = -25..-75 : tentes, canons, feux), boîte aux lettres, ballon à gaz (state.balloon).
//   Postes de caméra : x = 0..80, regards vers -z (yaw 0) ou -x (yaw 90, vers le camp).
// Intérieurs à x = IX (3000), trois pièces côte à côte (mur du fond z = -5) :
//   mansarde de la famille (x = IX-28 : table, lampe, pile de lettres state.pile), atelier du photographe (x = IX-6 : appareil à soufflet,
//   plaques, lanterne), bureau de dépouillement (x = IX+18 : écran blanc au mur, lanterne magique, bureaux, fenêtre où se pose le pigeon).
// state(S, f) : balloon {x,y,z,s} | null, pile 0..1, lantern 0..1 (la lanterne s'allume), flash 0..1 (flash de l'appareil).
export const DECK = 0, IX = 3000;
export const SPOTS = { mailbox: [24, 0, 0], square: [44, 0, 0], camp: [-40, 0, 0], mansarde: [IX - 28, 0, 0], atelier: [IX - 6, 0, 0], bureau: [IX + 18, 0, 0] };

export function buildParis1870(ctx) {
  const { THREE, P, scene, world, add, box, toon, T } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1870);
  const M = (c) => toon({ color: c });
  const INK = '#271925';
  // ---------- textures ----------
  const snowC = cv(512, 512, (g, w, h) => { g.fillStyle = '#e9f0f8'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 420; k++) { g.fillStyle = `rgba(${150 + r() * 40 | 0},${170 + r() * 40 | 0},${210 + r() * 30 | 0},${0.1 + r() * 0.16})`; g.beginPath(); g.ellipse(r() * w, r() * h, 8 + r() * 36, 3 + r() * 10, 0, 0, 6.283); g.fill(); }
    for (let k = 0; k < 260; k++) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 14, 2 + r() * 5, 0, 0, 6.283); g.fill(); } });
  const facadeC = (tone, lit) => cv(128, 128, (g, w, h) => { g.fillStyle = tone; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,100,80,0.28)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 3, w, 3);
    g.fillStyle = '#7d8aa6'; g.fillRect(14, 12, 18, 88); g.fillRect(96, 12, 18, 88);            // volets
    g.fillStyle = lit ? '#ffd98a' : '#3d4a6c'; g.fillRect(34, 14, 60, 84);                      // vitre
    g.strokeStyle = '#f4efe4'; g.lineWidth = 5; g.strokeRect(34, 14, 60, 84); g.beginPath(); g.moveTo(64, 14); g.lineTo(64, 98); g.moveTo(34, 52); g.lineTo(94, 52); g.stroke();
    g.fillStyle = '#2a2430'; g.fillRect(24, 98, 80, 7); });                                     // balcon en fer
  const roofC = cv(256, 128, (g, w, h) => { g.fillStyle = '#dfe8f2'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(70,84,110,0.55)'; for (let y = 10; y < h; y += 20) g.fillRect(0, y, w, 4); for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 24, 3 + r() * 5, 0, 0, 6.283); g.fill(); } });
  const plankC = cv(256, 256, (g, w, h) => { g.fillStyle = '#a9794a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = `rgba(${60 + r() * 30 | 0},40,20,0.3)`; g.fillRect(0, y, w, 3); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(80,50,26,0.18)'; g.fillRect(r() * w, y + 6 + r() * 20, 20 + r() * 50, 2); } g.fillStyle = 'rgba(40,28,20,0.35)'; g.fillRect((y * 7) % w, y, 3, 32); } });
  const paperC = (col, lines) => cv(256, 256, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); if (lines) for (let y = 40; y < h; y += 22) { g.fillStyle = 'rgba(90,70,60,0.12)'; g.fillRect(0, y, w, 2); } for (let k = 0; k < 160; k++) { g.fillStyle = 'rgba(120,90,60,0.05)'; g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 20, 6 + r() * 20, 0, 0, 6.283); g.fill(); } });
  const stripeC = cv(256, 128, (g, w, h) => { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#f6eed8' : '#cf3a30'; g.fillRect(i * (w / 12), 0, w / 12 + 1, h); } g.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = 0; i < 12; i++) g.fillRect(i * (w / 12), 0, 2, h); });
  const mSnow = toon({ map: P.tex(snowC, 140, 140) }), mFloor = toon({ map: P.tex(plankC, 8, 3) });
  const mWhite = M('#f4f8fc'), mWood = M('#8a5d38'), mWood2 = M('#5a3b22'), mIron = M('#2f3440'), mBrick = M('#a8523c'), mBrass = M('#d9a845'), mCream = M('#efe6cf');
  const mRoof = toon({ map: P.tex(roofC, 1, 1) });
  const facades = {}; const facadeM = (tone, lit, nx, ny) => { const key = tone + lit + nx + ny; return facades[key] || (facades[key] = toon({ map: P.tex(facadeC(tone, lit), nx, ny) })); };
  // ---------- sol : neige à perte de vue ----------
  const ground = add(new THREE.PlaneGeometry(900, 900), mSnow, 20, -0.02, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  // ---------- immeubles à mansarde ----------
  const TONES = ['#efe2c6', '#e6d3b0', '#f2e9d6', '#dccdb0', '#e9d8bb'];
  function building(x, z, w, floors, d, ry = 0, o = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    const h = floors * 3, tone = o.tone || TONES[Math.floor(r() * TONES.length)], nx = Math.max(1, Math.round(w / 3.2));
    const body = add(box(w, h, d), facadeM(tone, r() > 0.78, nx, floors), 0, h / 2, 0, g);
    // la façade vitrée est la face +z ; les autres faces reprennent la même texture (peu visible)
    const rf = add(new THREE.CylinderGeometry(0.5 * 1.414 * 0.62, 0.5 * 1.414, 3.6, 4, 1), mRoof, 0, h + 1.8, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w, 1, d);
    add(box(w * 0.64, 0.5, d * 0.62), mWhite, 0, h + 3.7, 0, g);
    for (let i = 0; i < 3; i++) { const cx = (r() - 0.5) * w * 0.5, cz = (r() - 0.5) * d * 0.4; add(box(0.9, 2.6, 0.9), mBrick, cx, h + 3.4, cz, g); add(box(1.05, 0.3, 1.05), mWhite, cx, h + 4.8, cz, g); }
    for (let i = 0; i < Math.floor(w / 4.5); i++) { const dx = -w / 2 + 2.2 + i * 4.5; add(box(1.5, 1.3, 0.8), M('#c9c0b0'), dx, h + 1.3, d * 0.16, g); add(box(1.1, 0.8, 0.1), M('#3d4a6c'), dx, h + 1.3, d * 0.16 + 0.42, g); add(box(1.7, 0.35, 1.0), mWhite, dx, h + 2.1, d * 0.16, g); }
    add(box(w + 0.3, 0.35, d + 0.3), mWhite, 0, h + 0.1, 0, g);                                                  // neige sur la corniche
    return g;
  }
  const row = (z, x0, x1, ry, seed, hmin = 4, hmax = 6) => { const rr = P.rng(seed); let x = x0; while (x < x1) { const w = 7 + rr() * 6; building(x + w / 2, z, w, hmin + Math.floor(rr() * (hmax - hmin + 1)), 9, ry); x += w; } };
  row(-14, -14, 90, 0, 11);                  // fond : façades vers +z
  row(21, -14, 90, Math.PI, 12);             // devant : façades vers -z
  row(-52, -30, 120, 0, 13, 6, 8);           // second plan lointain
  building(95, 4, 9, 5, 26, -Math.PI / 2);   // bout de la rue côté est
  // dôme doré (Invalides) au loin
  { const g = new THREE.Group(); g.position.set(34, 0, -78); world.add(g); add(box(28, 12, 20), facadeM('#e6d8bc', false, 8, 4), 0, 6, 0, g); add(new THREE.CylinderGeometry(6, 6.5, 10, 20), M('#e8dcc2'), 0, 17, 0, g);
    add(new THREE.SphereGeometry(6.2, 20, 10, 0, 6.283, 0, 1.45), M('#e0b440'), 0, 22, 0, g); add(new THREE.ConeGeometry(0.5, 7, 6), mBrass, 0, 31.5, 0, g); add(new THREE.CylinderGeometry(7, 7, 0.5, 20), mWhite, 0, 12.2, 0, g); }
  // ---------- camp prussien (à l'ouest) ----------
  const tentM = [M('#d8d2bc'), M('#c9c2a8')];
  for (let i = 0; i < 26; i++) { const x = -12 - r() * 48, z = -12 + r() * 34, s = 1.3 + r() * 0.8, t = add(new THREE.ConeGeometry(1.6 * s, 2.2 * s, 5), tentM[i % 2], x, 1.1 * s, z, world); t.rotation.y = r() * 3; add(box(0.12, 0.5, 0.12), mWood2, x, 2.4 * s, z, world); }
  for (let i = 0; i < 6; i++) { const x = -10 - i * 7 - r() * 3, z = -6 + r() * 12, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = 1.3 + r() * 0.4; world.add(g);
    add(box(1.6, 0.5, 0.7), mWood2, 0, 0.55, 0, g); const bar = add(new THREE.CylinderGeometry(0.2, 0.26, 2.4, 10), mIron, 0.5, 0.95, 0, g); bar.rotation.z = Math.PI / 2 - 0.25;
    for (const s of [-1, 1]) { const wl = add(new THREE.TorusGeometry(0.45, 0.09, 6, 14), mWood, -0.2, 0.45, s * 0.42, g); void wl; } }
  for (let i = 0; i < 9; i++) { const x = -11 - r() * 50, z = -12 + r() * 28; add(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffa43a' }), x, 0.3, z, world, { cast: false }); }
  // ---------- boîte aux lettres vide, sous la neige ----------
  { const g = new THREE.Group(); g.position.set(SPOTS.mailbox[0] + 1.4, 0, 0.3); world.add(g); add(box(0.2, 1.4, 0.2), mIron, 0, 0.7, 0, g);
    add(box(0.8, 0.95, 0.55), M('#d9a020'), 0, 1.75, 0, g); add(new THREE.CylinderGeometry(0.27, 0.27, 0.8, 12, 1, false, 0, Math.PI), M('#d9a020'), 0, 2.22, 0, g).rotation.z = Math.PI / 2;
    add(box(0.5, 0.07, 0.04), mIron, 0, 1.95, 0.29, g); add(box(0.9, 0.16, 0.65), mWhite, 0, 2.45, 0, g); add(box(0.7, 0.04, 0.04), M('#f4efe4'), 0, 1.5, 0.29, g); }
  // ---------- ballon à gaz ----------
  const balloon = new THREE.Group(); scene.add(balloon); balloon.visible = false;
  { const sp = add(new THREE.SphereGeometry(3.2, 24, 16), toon({ map: P.tex(stripeC, 1, 1) }), 0, 4.6, 0, balloon); sp.scale.set(1, 1.1, 1);
    add(new THREE.ConeGeometry(1.1, 1.4, 14), M('#cf3a30'), 0, 0.9, 0, balloon).rotation.x = Math.PI;
    for (const [sx, sz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) { const rp = add(new THREE.CylinderGeometry(0.03, 0.03, 3.4, 4), mIron, sx * 0.85, 1.3, sz * 0.85, balloon); rp.rotation.set(sz * 0.32, 0, -sx * 0.32); }
    add(box(1.7, 0.9, 1.7), mWood, 0, -0.55, 0, balloon);
    for (const [cx, cz] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) { add(box(0.55, 0.5, 0.55), M('#b08a5a'), cx, 0.1, cz, balloon); }
    for (let i = 0; i < 4; i++) { const sd = add(box(0.16, 0.2, 0.05), M('#c8c8d0'), -0.6 + i * 0.4, -0.3, 0.9, balloon); void sd; } }
  // ---------- pièces intérieures ----------
  const X = (x) => IX + x;
  function room(x0, x1, wall, o = {}) {
    const wI = x1 - x0, cx = (x0 + x1) / 2, fl = add(new THREE.PlaneGeometry(wI, 24), mFloor, X(cx), 0.005, 6, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(box(wI, 6, 0.4), M(wall), X(cx), 3, -5.2, world);
    add(box(wI, 1.15, 0.5), o.wain ? M(o.wain) : mWood2, X(cx), 0.58, -4.95, world); add(box(wI, 0.12, 0.6), mCream, X(cx), 1.2, -4.95, world);
    add(box(0.4, 6, 24), M(o.side || wall), X(x0), 3, 6, world); add(box(0.4, 6, 24), M(o.side || wall), X(x1), 3, 6, world);
  }
  const winMat = new THREE.MeshBasicMaterial({ color: '#cfe0f0', fog: false });
  function windowAt(x, y, w, h, z = -4.95) { add(box(w, h, 0.1), winMat, X(x), y, z, world, { cast: false }); add(box(w + 0.3, 0.18, 0.3), mCream, X(x), y - h / 2 - 0.1, z + 0.1, world); add(box(w + 0.3, 0.18, 0.2), mCream, X(x), y + h / 2 + 0.1, z + 0.05, world); add(box(0.1, h, 0.14), mWood2, X(x), y, z + 0.05, world); add(box(w, 0.1, 0.14), mWood2, X(x), y, z + 0.05, world); add(box(w * 0.9, 0.12, 0.3), mWhite, X(x), y - h / 2 + 0.02, z + 0.12, world); }
  const table = (x, z, w = 2.6, d = 1.3, h = 1.0, col = M('#b98a56')) => { add(box(w, 0.1, d), col, X(x), h, z, world); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.12, h, 0.12), mWood2, X(x + sx * (w / 2 - 0.12)), h / 2, z + sz * (d / 2 - 0.12), world); };
  const lampG = (x, y, z) => { add(new THREE.CylinderGeometry(0.1, 0.14, 0.18, 8), mBrass, X(x), y, z, world); const gl = add(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd77a' }), X(x), y + 0.22, z, world, { cast: false }); add(new THREE.ConeGeometry(0.28, 0.2, 10, 1, true), M('#2f5a3a'), X(x), y + 0.45, z, world); return gl; };
  // --- mansarde (x -34 .. -14) ---
  room(-34, -14, '#d9c29a', { wain: '#6b4a32' }); windowAt(-30, 3.2, 2.2, 2.6); windowAt(-18, 3.2, 1.6, 2.4);
  table(-25.7, -1.2, 3.4, 1.5); lampG(-27.1, 1.1, -1.5);
  const pileG = new THREE.Group(); pileG.position.set(X(-24.9), 1.05, -1.2); world.add(pileG); const pile = [];
  for (let i = 0; i < 14; i++) { const pg = add(box(0.62, 0.05, 0.86), M(i % 2 ? '#f8f2e2' : '#efe6d0'), (r() - 0.5) * 0.07, 0.03 + i * 0.052, (r() - 0.5) * 0.07, pileG); pg.rotation.y = (r() - 0.5) * 0.18; pile.push(pg); }
  { const stv = new THREE.Group(); stv.position.set(X(-15.5), 0, -3.6); world.add(stv); add(box(1.1, 1.6, 1.0), mIron, 0, 0.8, 0, stv); add(new THREE.CylinderGeometry(0.14, 0.14, 4, 8), mIron, 0, 3.6, -0.2, stv); add(new THREE.SphereGeometry(0.14, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff8a2a' }), 0, 0.8, 0.52, stv, { cast: false }); }
  { const bd = new THREE.Group(); bd.position.set(X(-32.2), 0, -2.5); world.add(bd); add(box(1.8, 0.5, 3.4), mWood2, 0, 0.35, 0, bd); add(box(1.7, 0.3, 3.2), M('#c85a5a'), 0, 0.7, 0, bd); add(box(1.7, 0.4, 0.8), mWhite, 0, 0.95, -1.2, bd); }
  for (const [x, z] of [[-22.6, -0.4], [-29.5, 0.2]]) { const g = new THREE.Group(); g.position.set(X(x), 0, z); world.add(g); add(box(0.55, 0.06, 0.55), mWood2, 0, 0.5, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.06, 0.5, 0.06), mWood2, sx * 0.24, 0.25, sz * 0.24, g); add(box(0.55, 0.7, 0.06), mWood2, 0, 0.9, -0.26, g); }
  // --- atelier (x -14 .. +6) ---
  room(-14, 6, '#8a6a4a', { wain: '#4a3326', side: '#6a4e36' }); windowAt(-8, 3.4, 3.6, 3.0); windowAt(1, 3.4, 2.2, 2.8);
  { const tp = new THREE.Group(); tp.position.set(X(-3.5), 0, -0.4); tp.rotation.y = 0.35; world.add(tp);                      // appareil à soufflet sur trépied
    for (const a of [0, 2.1, 4.2]) { const lg = add(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 6), mWood2, Math.sin(a) * 0.3, 0.75, Math.cos(a) * 0.3, tp); lg.rotation.set(Math.cos(a) * 0.18, 0, -Math.sin(a) * 0.18); }
    add(box(0.5, 0.45, 0.4), mWood, 0, 1.62, -0.25, tp); const bel = add(new THREE.CylinderGeometry(0.17, 0.27, 0.6, 4, 1, true), M('#2a2430'), 0, 1.62, 0.2, tp); bel.rotation.set(Math.PI / 2, Math.PI / 4, 0);
    add(new THREE.CylinderGeometry(0.15, 0.17, 0.26, 12), mBrass, 0, 1.62, 0.6, tp).rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 12), M('#9fd6e6'), 0, 1.62, 0.74, tp).rotation.x = Math.PI / 2; add(box(0.62, 0.56, 0.05), mIron, 0, 1.62, -0.48, tp); }
  const flashG = add(new THREE.SphereGeometry(0.5, 12, 8), new THREE.MeshBasicMaterial({ color: '#fffbe0', transparent: true, opacity: 0.9, fog: false }), X(-2.7), 2.0, 1.2, world, { cast: false }); flashG.visible = false;
  table(0.2, -2.6, 3.0, 1.3, 1.0); lampG(1.2, 1.1, -2.6);
  for (let i = 0; i < 5; i++) add(box(0.45, 0.04, 0.4), M('#9fb8c8'), X(-0.8 + (i % 2) * 0.08), 1.08 + i * 0.05, -2.6 + (i % 3) * 0.03, world);
  for (const [x, y] of [[-12.6, 0], [4.8, 0]]) { const g = new THREE.Group(); g.position.set(X(x), 0, -4.4); world.add(g); add(box(1.4, 3.4, 0.6), mWood2, 0, 1.7, 0, g); for (let k = 0; k < 4; k++) { add(box(1.3, 0.06, 0.62), mWood, 0, 0.35 + k * 0.85, 0, g); for (let j = 0; j < 3; j++) add(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), M(['#5a8aa8', '#a8785a', '#7ba85a'][(j + k) % 3]), -0.4 + j * 0.4, 0.55 + k * 0.85, 0.1, g); } void y; }
  // --- bureau de dépouillement (x +6 .. +32) ---
  room(6, 32, '#e5dcc8', { wain: '#4a5a6a', side: '#cfc6b0' });
  add(box(7.2, 4.0, 0.12), new THREE.MeshBasicMaterial({ color: '#aeb6c4', fog: false }), X(19), 3.0, -4.9, world, { cast: false }); for (const [w, h, y] of [[7.5, 0.2, 5.1], [7.5, 0.2, 0.9]]) add(box(w, h, 0.2), mWood2, X(19), y, -4.85, world); for (const sx of [-1, 1]) add(box(0.2, 4.2, 0.2), mWood2, X(19 + sx * 3.7), 3, -4.85, world);
  windowAt(10, 3.2, 2.4, 2.8);
  const lantern = new THREE.Group(); lantern.position.set(X(19), 0, 3.2); world.add(lantern);                                  // lanterne magique (face à l'écran)
  table(19, 3.2, 1.5, 1.0, 1.0);
  add(box(0.8, 0.55, 0.55), M('#2a3a4a'), X(19), 1.4, 3.2, world); add(new THREE.CylinderGeometry(0.13, 0.17, 0.6, 12), mBrass, X(19), 1.4, 2.8, world).rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 10), mIron, X(19), 1.95, 3.25, world);
  const lampGlow = add(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff6c0' }), X(19), 1.4, 3.2, world, { cast: false });
  for (const [x, z] of [[11, 0.6], [22.2, -0.1], [14.5, 2.2]]) { table(x, z, 2.3, 1.1, 1.0); lampG(x - 0.7, 1.05, z - 0.1); for (let i = 0; i < 3; i++) add(box(0.5, 0.03, 0.7), M('#f8f2e2'), X(x + 0.5), 1.07 + i * 0.03, z, world); add(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6), M('#2f3a5a'), X(x + 0.2), 1.15, z - 0.2, world); }
  for (const [x, z] of [[11.8, 1.9], [24.4, 1.2]]) { const g = new THREE.Group(); g.position.set(X(x), 0, z); world.add(g); add(box(0.55, 0.06, 0.55), mWood2, 0, 0.5, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.06, 0.5, 0.06), mWood2, sx * 0.24, 0.25, sz * 0.24, g); }
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(X(29.5), 0, -3.6 + i * 1.0); world.add(g); add(box(1.0, 2.2, 0.8), mWood2, 0, 1.1, 0, g); for (let k = 0; k < 3; k++) add(box(0.9, 0.05, 0.82), mWood, 0, 0.4 + k * 0.7, 0, g); }
  // ---------- ciel : nuages ----------
  const clouds = [];
  { const rr = P.rng(71); for (let i = 0; i < 12; i++) { const c = cv(600, 400, () => {}); const pen = new T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 3);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false, color: '#d8dee8' }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 130 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  void INK;
  function state(S, f) {
    const b = S.balloon; balloon.visible = !!b; if (b) { balloon.position.set(b.x, b.y, b.z); balloon.scale.setScalar(b.s ?? 1); balloon.rotation.y = 0.3 + Math.sin(f * 0.03) * 0.1; balloon.rotation.z = Math.sin(f * 0.05) * 0.03; }
    const pl = S.pile ?? 0; pile.forEach((m, i) => { m.visible = i < Math.ceil(pl * pile.length - 0.001); });
    lampGlow.material.color.set(S.lantern ? '#fffbe0' : '#6a5a40');
    flashG.visible = (S.flash ?? 0) > 0.02; flashG.material.opacity = S.flash ?? 0; flashG.scale.setScalar(0.6 + 1.6 * (S.flash ?? 0));
  }
  return { DECK, SPOTS, clouds, state, ground, building, row };
}
