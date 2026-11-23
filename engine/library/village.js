// Library set: village de la Drôme (Hauterives), fin XIXe : route de terre, maisons crépies à toit de tuiles, champs, arbres
// + le « palais idéal » en pierre qui se construit sous nos yeux (tours, grottes, géants) + brouette, tas de cailloux, panneaux.
// DECK = 0. La route court le long de x à z = -3 (caméras côté +z, yaw ~0). Le palais est au centre (x = 0, façade à z = -11.6).
// state(S, f) :
//   S.pal     : avancement du palais 0..1 (socle, corps, tours, grottes, géants, décor) : chaque élément pousse avec un rebond
//   S.stone   : { vis, x, y, z, rx, ry, rz, glow }  la pierre étrange (glow 0..1 pour l'éclat)
//   S.barrow  : { vis, x, z, ry, n }                 la brouette (n cailloux dedans, 0..4)
//   S.pile    : 0..1  tas de cailloux au pied du chantier (x = -3.4, z = -6.2)
//   S.road    : x au-delà duquel les cailloux de la route ont été ramassés (null = tous visibles)
//   S.signA   : 0/1 panneau « Hauterives 1879 »         S.signB : 0/1 panneau « Monument historique 1969 »
//   S.win     : fenêtres allumées 0..1 (nuit)           S.plaque: 0..1 plaque posée sur le palais
import { propKit } from './props.js';
export const DECK = 0;
export const SPOTS = { road: [0, 0, -3], palace: [0, 0, -13], pile: [-3.4, 0, -6.2], signA: [-2.6, 0, -4.7], signB: [5.2, 0, -8.8] };
export const PAL_Z = -13;
const eob = (t) => { t = Math.max(0, Math.min(1, t)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

export function buildVillage(ctx, { seed = 1879 } = {}) {
  const { THREE, P, scene, world, add, box, tbox, toon, M: MT } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  const lerpC = (m, a, b, t) => m.color.set(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t)));
  // ---------- textures ----------
  const meadow = cv(512, 512, (g, w, h) => { g.fillStyle = '#8db04a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${90 + r() * 70 | 0},${140 + r() * 60 | 0},${50 + r() * 30 | 0},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); } });
  const road = cv(512, 128, (g, w, h) => { g.fillStyle = '#c9a877'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${118 + r() * 50 | 0},${76 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 50; k++) { g.fillStyle = 'rgba(110,84,56,0.55)'; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 3, 0, 6.283); g.fill(); } });
  const rocaille = cv(512, 512, (g, w, h) => { g.fillStyle = '#b9a285'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 120; k++) { const x = r() * w, y = r() * h, rw = 22 + r() * 50, rh = 16 + r() * 30, v = 150 + r() * 60 | 0; g.fillStyle = `rgb(${v + 14},${v - 4},${v - 30})`; g.strokeStyle = 'rgba(74,52,44,0.75)'; g.lineWidth = 3.2;
      g.beginPath(); g.ellipse(x, y, rw, rh, r() * 3, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,240,210,0.16)'; g.beginPath(); g.ellipse(x - rw * 0.25, y - rh * 0.3, rw * 0.4, rh * 0.25, 0, 0, 6.283); g.fill(); } });
  const mRoc = toon({ map: P.tex(rocaille, 2, 1) }), mRoc2 = M('#a8906f'), mRoc3 = M('#cdb592'), mDark = M('#2a1f22');
  const mMeadow = toon({ map: P.tex(meadow, 220, 220) }), mRoad = toon({ map: P.tex(road, 22, 1) });
  const mPlaster = [MT.plaster, MT.plaster2], mRoof = MT.roof, mWood = M('#7a5434'), mDoor = M('#5a3a24');
  // ---------- sol ----------
  const ground = add(new THREE.PlaneGeometry(3000, 3000), mMeadow, 0, -0.02, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  const rd = add(new THREE.PlaneGeometry(120, 5.2), mRoad, 0, 0.01, -3, world, { cast: false }); rd.rotation.x = -Math.PI / 2;
  const yard = add(new THREE.PlaneGeometry(26, 9), mRoad, 0, 0.011, -8.4, world, { cast: false }); yard.rotation.x = -Math.PI / 2;
  // ---------- maisons ----------
  const winMs = [];
  const house = (x, z, w = 6, d = 5, h = 3.4, ry = 0, tone = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    add(tbox(w, h, d, 3), mPlaster[tone % 2], 0, h / 2, 0, g); add(tbox(w + 0.3, 0.4, d + 0.3, 2), mRoc, 0, 0.2, 0, g);
    const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.5, 0); sh.lineTo(d / 2 + 0.5, 0); sh.lineTo(0, 2.3); sh.closePath();
    const rm = add(new THREE.ExtrudeGeometry(sh, { depth: w + 1.0, bevelEnabled: false }), mRoof, 0, h, 0, g); rm.rotation.y = Math.PI / 2; rm.position.set(-(w + 1.0) / 2, h, 0);
    add(box(0.9, 1.9, 0.12), mDoor, -w * 0.22, 0.95, d / 2 + 0.04, g);
    const wm = new THREE.MeshBasicMaterial({ color: '#46557a', fog: false }); winMs.push(wm);
    for (const wx of [w * 0.12, w * 0.34]) { add(box(0.8, 1.0, 0.1), wm, wx, 1.9, d / 2 + 0.04, g, { cast: false }); add(box(0.98, 0.12, 0.16), mWood, wx, 1.35, d / 2 + 0.06, g, { cast: false }); }
    add(new THREE.CylinderGeometry(0.3, 0.38, 1.2, 6), mRoc, w * 0.3, h + 2.4, -0.4, g);
    return g; };
  [[-34, -10, 7, 5, 3.4, 0.1], [-25, -12, 6, 5, 3.8, -0.1, 1], [-17, -10.5, 6.5, 5, 3.2, 0.15], [-27, -3, 5, 4, 3, 0.3, 1]].forEach(([x, z, w, d, h, ry, t]) => house(x, z, w, d, h, ry, t || 0));
  [[15, -10, 6, 5, 3.4, -0.1, 1], [23, -11.5, 7, 5, 3.6, 0.1], [32, -9.5, 6, 5, 3.3, -0.2, 1], [40, -12, 6, 5, 3.4, 0.1]].forEach(([x, z, w, d, h, ry, t]) => house(x, z, w, d, h, ry, t || 0));
  [[-40, -24, 7, 5, 3.6], [-26, -26, 6, 5, 3.4], [-12, -27, 7, 5, 3.8], [12, -27, 6, 5, 3.4], [27, -26, 7, 5, 3.6], [42, -25, 6, 5, 3.4]].forEach(([x, z, w, d, h], i) => house(x, z, w, d, h, 0.1 * (i % 3 - 1), i));
  // ---------- le palais (éléments qui poussent) ----------
  const PZ = PAL_Z, parts = [];
  const part = (t0, t1, build) => { const g = new THREE.Group(); g.position.set(0, 0, PZ); world.add(g); build(g); g.visible = false; parts.push({ g, t0, t1 }); return g; };
  const lump = (g, rad, mat, x, y, z, sy = 0.8) => { const m = add(new THREE.DodecahedronGeometry(rad, 0), mat, x, y, z, g); m.scale.set(1.15, sy, 1); m.rotation.set(r() * 3, r() * 3, r() * 3); return m; };
  const crust = (g, n, x0, x1, y0, y1, z, rad = 0.28) => { for (let i = 0; i < n; i++) lump(g, rad * (0.6 + r() * 0.8), r() > 0.5 ? mRoc2 : mRoc3, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), z + r() * 0.2); };
  part(0.0, 0.16, (g) => { add(tbox(15, 1.4, 3.4, 2), mRoc, 0, 0.7, 0, g); crust(g, 14, -7, 7, 1.2, 1.6, 1.7); });
  part(0.12, 0.32, (g) => { add(tbox(12, 3.8, 2.6, 2), mRoc, 0, 3.3, -0.2, g); crust(g, 24, -5.8, 5.8, 1.6, 5.0, 1.15);
    for (let i = -4; i <= 4; i++) add(tbox(0.9, 0.7, 0.9, 1), mRoc3, i * 1.4, 5.55, 1.0, g); });
  part(0.22, 0.42, (g) => { for (const s of [-1, 1]) { const x = s * 6.4; add(new THREE.CylinderGeometry(1.15, 1.4, 6.4, 10), mRoc, x, 3.2, 0.3, g); add(new THREE.CylinderGeometry(1.5, 1.2, 0.6, 10), mRoc3, x, 6.5, 0.3, g);
      add(new THREE.ConeGeometry(1.2, 2.2, 8), M(s < 0 ? '#c9743a' : '#7aa0a8'), x, 8.0, 0.3, g); crust(g, 10, x - 1.1, x + 1.1, 1.0, 6.0, 1.2); } });
  part(0.34, 0.56, (g) => { for (const s of [-1, 1]) { const x = s * 2.6; add(box(2.2, 2.4, 0.5), mDark, x, 1.3, 1.6, g); const ar = add(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 14, 1, false, 0, Math.PI), mDark, x, 2.5, 1.6, g); ar.rotation.set(Math.PI / 2, 0, Math.PI / 2);
      for (let i = 0; i < 6; i++) { const st = add(new THREE.ConeGeometry(0.1 + r() * 0.07, 0.5 + r() * 0.4, 5), mRoc3, x - 0.8 + i * 0.32, 3.4, 1.6, g); st.rotation.x = Math.PI; }
      for (let i = 0; i < 9; i++) lump(g, 0.3 + r() * 0.15, mRoc2, x - 1.4 + i * 0.35, 3.0 + Math.sin(i) * 0.15, 1.75, 0.7); } });
  part(0.52, 0.78, (g) => { add(new THREE.CylinderGeometry(1.5, 1.8, 9.2, 10), mRoc, 0, 4.6, -0.6, g); add(new THREE.CylinderGeometry(1.9, 1.5, 0.7, 10), mRoc3, 0, 9.3, -0.6, g);
    add(new THREE.SphereGeometry(1.45, 12, 8, 0, 6.283, 0, 1.57), M('#d8a23a'), 0, 9.65, -0.6, g); add(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 5), mDark, 0, 11.6, -0.6, g); crust(g, 16, -1.4, 1.4, 1.6, 8.8, 0.8); });
  part(0.6, 0.9, (g) => { for (const [x, s] of [[-4.2, 1], [0, 1.15], [4.2, 1]]) { const k = s; add(new THREE.CylinderGeometry(0.62 * k, 0.8 * k, 2.4 * k, 8), mRoc3, x, 1.2 * k + 1.2, 2.3, g);
      add(new THREE.SphereGeometry(0.55 * k, 10, 8), mRoc3, x, 3.9 * k, 2.3, g); add(new THREE.CylinderGeometry(0.2 * k, 0.28 * k, 1.0 * k, 6), mRoc3, x, 3.3 * k, 2.3, g);
      for (const sx of [-1, 1]) { const arm = add(new THREE.CylinderGeometry(0.17 * k, 0.2 * k, 1.9 * k, 6), mRoc2, x + sx * 0.95 * k, 2.6 * k, 2.3, g); arm.rotation.z = sx * 0.22; }
      add(new THREE.ConeGeometry(0.5 * k, 0.6 * k, 8), mRoc2, x, 4.6 * k, 2.3, g); add(new THREE.SphereGeometry(0.07, 5, 4), mDark, x - 0.2 * k, 3.95 * k, 2.82, g); add(new THREE.SphereGeometry(0.07, 5, 4), mDark, x + 0.2 * k, 3.95 * k, 2.82, g); } });
  part(0.82, 1.0, (g) => { crust(g, 40, -7, 7, 0.4, 6.0, 1.9, 0.25); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const px = s * (7.6 + i * 0.7), pm = add(new THREE.CylinderGeometry(0.08, 0.12, 2.2, 5), M('#6b4a32'), px, 1.1, 1.2 + i * 0.5, g); pm.rotation.z = s * 0.1;
      for (let k = 0; k < 5; k++) { const lf = add(new THREE.ConeGeometry(0.12, 1.1, 4), M('#4f8a38'), px + Math.cos(k * 1.26) * 0.5, 2.3, 1.2 + i * 0.5 + Math.sin(k * 1.26) * 0.5, g); lf.rotation.set(Math.sin(k * 1.26) * 1.2, 0, -Math.cos(k * 1.26) * 1.2); } } });
  // ---------- la pierre étrange ----------
  const stoneM = toon({ color: '#d9b27a' }), glowM = new THREE.MeshBasicMaterial({ color: '#fff0b8', fog: false, transparent: true, opacity: 0, depthWrite: false });
  const stone = new THREE.Group(); world.add(stone);
  { const m = add(new THREE.DodecahedronGeometry(0.34, 0), stoneM, 0, 0.2, 0, stone); m.scale.set(1.25, 0.8, 0.9); add(new THREE.ConeGeometry(0.1, 0.34, 5), M('#b88a52'), 0.18, 0.45, 0, stone);
    const hl = add(new THREE.SphereGeometry(0.52, 10, 8), glowM, 0, 0.22, 0, stone, { cast: false }); hl.userData.ndSkip = true; }
  // ---------- cailloux de la route ----------
  const roadStones = []; for (let i = 0; i < 24; i++) { const x = -14 + i * 1.2 + r() * 0.5, z = -2.2 - r() * 1.6, s = 0.12 + r() * 0.12; const m = add(new THREE.DodecahedronGeometry(s, 0), r() > 0.4 ? mRoc3 : mRoc2, x, s * 0.5, z, world); m.scale.set(1.3, 0.7, 1); m.rotation.y = r() * 3; roadStones.push(m); }
  // ---------- tas de cailloux (chantier) ----------
  const pile = []; for (let i = 0; i < 22; i++) { const a = r() * 6.283, rr = r() * 0.9, s = 0.14 + r() * 0.16; const m = add(new THREE.DodecahedronGeometry(s, 0), r() > 0.5 ? mRoc3 : mRoc2, -3.4 + Math.cos(a) * rr, s * 0.5 + (1 - rr) * 0.25, -6.2 + Math.sin(a) * rr * 0.7, world); m.rotation.y = r() * 3; pile.push(m); }
  // ---------- brouette ----------
  const barrow = new THREE.Group(); world.add(barrow);
  { add(box(0.9, 0.12, 0.62), mWood, 0.1, 0.5, 0, barrow); for (const sz of [-1, 1]) { add(box(0.9, 0.3, 0.05), mWood, 0.1, 0.62, sz * 0.31, barrow); add(box(1.2, 0.05, 0.06), mWood, -0.5, 0.55, sz * 0.26, barrow); }
    add(box(0.05, 0.3, 0.62), mWood, -0.35, 0.62, 0, barrow); add(box(0.05, 0.3, 0.62), mWood, 0.55, 0.62, 0, barrow);
    const wh = add(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 12), M('#3a2f2a'), 0.78, 0.28, 0, barrow); wh.rotation.x = Math.PI / 2; for (const sx of [-1, 1]) add(box(0.05, 0.4, 0.05), mWood, 0.6, 0.35, sx * 0.2, barrow);
    for (let i = 0; i < 4; i++) { const m = add(new THREE.DodecahedronGeometry(0.17, 0), i % 2 ? mRoc3 : mRoc2, -0.05 + (i % 2) * 0.35, 0.7 + (i > 1 ? 0.14 : 0), (i % 3 - 1) * 0.12, barrow); m.userData.n = i; } }
  // ---------- panneaux ----------
  const board = (lines, w, h, x, z, ry, bg, fg) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    const c = cv(768, 288, (c2, W, H) => { c2.fillStyle = bg; c2.fillRect(0, 0, W, H); c2.strokeStyle = '#3b2a20'; c2.lineWidth = 16; c2.strokeRect(8, 8, W - 16, H - 16); c2.textAlign = 'center'; c2.textBaseline = 'middle';
      lines.forEach(([t, sz, col], i) => { c2.fillStyle = col || fg; c2.font = `800 ${sz}px Montserrat, Arial, sans-serif`; c2.fillText(t, W / 2, H * (lines.length === 1 ? 0.5 : 0.3 + i * 0.4)); }); });
    for (const sx of [-1, 1]) add(box(0.12, 2.1, 0.12), mWood, sx * (w / 2 - 0.15), 1.05, 0, g);
    add(box(w + 0.1, h + 0.1, 0.1), mWood, 0, 2.2, -0.02, g); add(new THREE.PlaneGeometry(w, h), toon({ map: P.tex(c) }), 0, 2.2, 0.05, g, { cast: false }); return g; };
  const signA = board([['HAUTERIVES', 100], ['1879', 116, '#c8312c']], 2.2, 0.83, -2.6, -4.7, 0.06, '#f3ead2', '#3b2a20');
  const signB = board([['MONUMENT', 92], ['HISTORIQUE · 1969', 66, '#ffd23a']], 2.6, 0.98, 5.2, -8.8, -0.12, '#2f56a8', '#ffffff');
  const plaque = add(box(2.0, 1.1, 0.12), M('#e8b83a'), 2.6, 4.6, PAL_Z + 1.5, world); plaque.visible = false;
  // ---------- habillage : arbres, haies, cailloux, tonneaux (les caméras regardent vers -z) ----------
  const avoid = (x, z) => (Math.abs(x + 2.6) < 1.4 && Math.abs(z + 4.7) < 1.2) || (Math.abs(x - 5.2) < 1.6 && Math.abs(z + 8.8) < 1.2) || (Math.abs(x + 3.4) < 1.3 && Math.abs(z + 6.2) < 1.3) || (Math.abs(x) < 8.5 && z < -9.3) || (Math.abs(x) < 7.5 && z > -9.4 && z < -1.5);
  K.scatter(['bush', 'bush', 'rock', 'crate', 'barrel', 'sack', 'bush'], { x0: -36, x1: 36, z0: -9.2, z1: -5.5, n: 46, avoid });
  K.scatter(['tree', 'poplar', 'tree'], { x0: -38, x1: 38, z0: -17, z1: -11.5, n: 26, avoid: (x) => Math.abs(x) < 9 });
  K.scatter(['poplar', 'tree'], { x0: -50, x1: 50, z0: -40, z1: -20, n: 26 });
  K.fence(-30, -5.4, -12, -5.4); K.fence(12, -5.4, 34, -5.4);
  K.verge(-36, 36, -9.4, -5, { density: 2.5 }); K.verge(-36, 36, 0.5, 4, { density: 1.2 }); K.verge(-30, 30, -20, -10, { density: 1.2 });
  K.lamp(-8.5, -4.6, { h: 3.4 }); K.lamp(9, -4.6, { h: 3.4 });
  // collines + nuages
  for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = 300 + r() * 220; add(new THREE.SphereGeometry(70 + r() * 50, 18, 10), toon({ color: i % 2 ? '#9db860' : '#7fa456' }), Math.cos(a) * d, -26, Math.sin(a) * d - 120, world, { cast: false }); }
  const clouds = [];
  { const rr = P.rng(91); for (let i = 0; i < 12; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  function state(S, f) {
    const pal = S.pal ?? 0;
    for (const p of parts) { const k = (pal - p.t0) / (p.t1 - p.t0); p.g.visible = k > 0.001; const e = eob(k); p.g.scale.set(1, Math.max(0.001, e), 1); }
    const st = S.stone || {}; stone.visible = !!st.vis; stone.position.set(st.x ?? 0, st.y ?? 0, st.z ?? 0); stone.rotation.set(st.rx ?? 0, st.ry ?? 0, st.rz ?? 0); glowM.opacity = 0.32 * (st.glow ?? 0);
    const b = S.barrow || {}; barrow.visible = !!b.vis; barrow.position.set(b.x ?? 0, 0, b.z ?? 0); barrow.rotation.y = b.ry ?? 0; barrow.children.forEach((c) => { if (c.userData.n !== undefined) c.visible = c.userData.n < (b.n ?? 0); });
    const pl = S.pile ?? 0; pile.forEach((m, i) => { m.visible = i < pl * pile.length; });
    roadStones.forEach((m) => { m.visible = S.road == null ? true : m.position.x > S.road; });
    signA.visible = !!S.signA; signB.visible = !!S.signB; plaque.visible = (S.plaque ?? 0) > 0;
    const w = S.win ?? 0; for (const m of winMs) lerpC(m, '#46557a', '#ffd070', w);
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
