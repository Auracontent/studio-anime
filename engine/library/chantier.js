// Library set : chantier de construction en plein air (Pourkoipa original). Sol de terre battue, deux murs de briques côte à côte
// (briques en instances : elles apparaissent une par une, penchent, glissent et s'écroulent), fil de maçon, échafaudage, bâche qui claque,
// bétonnière, brouette, palette de briques, cabane de chantier, bâtiment en béton et grue au loin.
// Les caméras regardent depuis +z vers -z. Murs : Paco à gauche (x = -2.0), Inès à droite (x = 1.2), faces avant à z ≈ -2.9.
// SPOTS : pacoWall, inesWall (centre de la base), pallet, mixer, barrow, hut, scaffold.
// state(S, f) :
//   S.pacoRows / S.inesRows : hauteur des murs en rangées de 10 cm (0..31), fractionnaire = brique par brique
//   S.lean   : 0..1 le mur de Paco penche et ses briques sont posées de travers        S.trem : 0..1 le mur tremble
//   S.fall   : 0..1 l'écroulement du mur de Paco (la 1re brique glisse à 0, tout est par terre à 1)
//   S.picked : 0..1 part des briques tombées qu'on ramasse   S.crook : 1 = une brique d'Inès penche ; S.redo 0..1 = elle la retire et la repose
//   S.line   : 0..1 le fil de maçon se tend sur le mur d'Inès         S.toss : 1 = des briques volent de la palette vers le mur de Paco
//   S.wet    : 0 (sec) .. 1 (boue)   S.tarp : 0..1 force du vent sur la bâche   S.lamp : 0/1 lampe de chantier allumée
import { propKit } from './props.js';
export const DECK = 0;
export const SPOTS = { pacoWall: [-2.0, 0, -3.0], inesWall: [1.2, 0, -3.0], pallet: [-4.3, 0, -1.7], mixer: [-5.6, 0, -2.6], barrow: [3.9, 0, -2.0], hut: [-8.5, 0, -6.0], scaffold: [5.4, 0, -4.2] };
export const ROWS = 31, COLS = 10;

export function buildChantier(ctx, { seed = 2511 } = {}) {
  const { THREE, P, world, add, box, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const T = { cast: false };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const lerpC = (m, a, b, t) => m.color.set(a).lerp(new THREE.Color(b), clamp(t));
  // ---------- sol : terre battue, traces de roues, cailloux ----------
  const dirtT = cv(512, 512, (g, w, h) => { g.fillStyle = '#c9a272'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1100; k++) { g.fillStyle = `rgba(${150 + r() * 70 | 0},${110 + r() * 60 | 0},${70 + r() * 40 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 10, 1 + r() * 5, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 90; k++) { g.fillStyle = 'rgba(90,70,50,0.55)'; g.beginPath(); g.arc(r() * w, r() * h, 1.5 + r() * 3, 0, 6.283); g.fill(); }
    for (const y of [0.25, 0.7]) { g.strokeStyle = 'rgba(120,86,56,0.4)'; g.lineWidth = 9; g.beginPath(); g.moveTo(0, y * h); g.lineTo(w, y * h + 6); g.stroke(); } });
  const mGround = toon({ map: P.tex(dirtT, 160, 160) });
  const ground = add(new THREE.PlaneGeometry(600, 600), mGround, 0, -0.01, -60, world, T); ground.rotation.x = -Math.PI / 2;
  const mud = add(new THREE.PlaneGeometry(9, 4.2), M('#4a3626'), -2.0, 0.012, -1.6, world, T); mud.rotation.x = -Math.PI / 2;
  const pud = []; for (const [x, z, w, h] of [[0.5, -0.3, 1.8, 0.9], [3.4, 0.2, 1.4, 0.8], [-3.6, 0.6, 1.6, 0.7], [1.2, 1.4, 1.2, 0.6]]) { const p = add(new THREE.CircleGeometry(1, 16), BASIC('#6d7f9a'), x, 0.018, z, world, T); p.rotation.x = -Math.PI / 2; p.scale.set(w, h, 1); pud.push(p); }
  // ---------- briques (instances) ----------
  const BR = new THREE.BoxGeometry(0.23, 0.088, 0.2);
  const mBrick = toon({ color: '#ffffff' });
  const BCOL = ['#c8573a', '#b84a30', '#d46a44', '#a8452e', '#cc5e3c'].map((c) => new THREE.Color(c));
  const NB = ROWS * COLS;
  const pr = P.rng(seed + 7);
  const jit = []; for (let i = 0; i < NB; i++) jit.push([pr() - 0.5, pr() - 0.5, pr() - 0.5, pr(), pr(), pr()]);   // x, y(depth), rot, rand, rand, rand
  // ordre d'écroulement : 1 brique qui glisse, 10 qui suivent, le reste de haut en bas
  const LEAD = 28 * COLS + 7;
  const FALL = jit.map((j, i) => { const row = Math.floor(i / COLS); return 0.45 + 0.22 * (1 - row / ROWS) + 0.08 * j[3]; });
  const tenSet = []; for (let i = 27 * COLS; i < ROWS * COLS && tenSet.length < 10; i++) { if (i !== LEAD && (i % COLS) >= 1 && (i % COLS) <= 8 && jit[i][3] > 0.35) tenSet.push(i); }
  tenSet.forEach((i, k) => { FALL[i] = 0.28 + 0.16 * (k / 9); }); FALL[LEAD] = 0;
  const mkWall = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    const im = new THREE.InstancedMesh(BR, mBrick, NB); im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true;
    for (let i = 0; i < NB; i++) im.setColorAt(i, BCOL[Math.floor(jit[i][4] * 5) % 5]);
    g.add(im);
    const core = add(box(2.55, 0.1, 0.1), M('#cdbfa6'), 0, 0.05, -0.05, g, T);
    return { g, im, core };
  };
  const PW = mkWall(SPOTS.pacoWall[0], SPOTS.pacoWall[2]), IW = mkWall(SPOTS.inesWall[0], SPOTS.inesWall[2]);
  const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), eu = new THREE.Euler(), ps = new THREE.Vector3(), sc = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const put = (im, i, x, y, z, rx, ry, rz) => { eu.set(rx, ry, rz); qt.setFromEuler(eu); ps.set(x, y, z); sc.set(1, 1, 1); m4.compose(ps, qt, sc); im.setMatrixAt(i, m4); };
  const bx = (i) => { const row = Math.floor(i / COLS), c = i % COLS; return (c - 4.5) * 0.25 + (row % 2 ? 0.125 : 0); };
  function wallPaco(S, f) {
    const rows = S.pacoRows ?? 0, lean = S.lean ?? 0, trem = S.trem ?? 0, fall = S.fall ?? 0, picked = S.picked ?? 0, n = Math.floor(rows * COLS);
    for (let i = 0; i < NB; i++) {
      const j = jit[i], row = Math.floor(i / COLS), h = row * 0.1 + 0.044;
      let x = bx(i) + j[0] * 0.07 + lean * 0.06 * h * h * (0.6 + 0.4 * j[3]), y = h + (j[1] * 0.012), z = j[1] * 0.1, rz = j[2] * 0.12 - lean * Math.atan(0.12 * h) * 0.8, ry = j[0] * 0.2, rx = 0;
      let vis = i < n && (S.fall ?? 0) <= 0 ? true : i < n;
      if (fall > 0 || (S.slide ?? 0) > 0) {
        const c = fall, d = FALL[i], t = Math.max(0, c - d) * 3.47;
        if (t > 0 && i < n) {
          const yg = 0.05 + (i % 4) * 0.025, tl = Math.sqrt(Math.max(0, 2 * (y - yg) / 9.8)), tt = Math.min(t, tl);
          const vx = (j[0] * 1.6) + 0.5 * lean, vz = 0.5 + 1.6 * j[4] + (i === LEAD ? 0.8 : 0);
          x += vx * tt * (i === LEAD ? 0.5 : 1); z += vz * tt; y = Math.max(yg, y - 0.5 * 9.8 * t * t);
          const spin = tt * (2 + 4 * j[5]) * (j[2] > 0 ? 1 : -1), land = t >= tl;
          rx = land ? (j[5] - 0.5) * 0.6 : spin * 0.7; rz = land ? rz + (j[3] - 0.5) * 1.6 : rz + spin; ry = land ? (j[1]) * 3 : ry + spin * 0.4;
          if (land) { y = yg; z += 0.25 * j[4]; }
        } else if (i < n && trem > 0) { x += Math.sin(f * 1.9 + row * 0.6 + j[3] * 6) * 0.012 * trem * (0.3 + row / ROWS); rz += Math.sin(f * 1.3 + i) * 0.01 * trem; }
        if (i === LEAD && c <= 0.02 && (S.slide ?? 0) > 0) { z += 0.05 * (S.slide); }
      } else if (trem > 0 && i < n) { x += Math.sin(f * 1.9 + row * 0.6 + j[3] * 6) * 0.012 * trem * (0.3 + row / ROWS); rz += Math.sin(f * 1.3 + i) * 0.01 * trem; }
      // brique qui glisse avant l'écroulement (S.slide 0..1) : sort du mur et descend un peu
      if (i === LEAD && (S.slide ?? 0) > 0 && fall <= 0) { z += 0.12 * S.slide; y -= 0.03 * S.slide; rz += 0.14 * S.slide; }
      if (picked > 0 && jit[i][5] < picked) vis = false;
      if (vis && i < n) put(PW.im, i, x, y, z, rx, ry, rz); else PW.im.setMatrixAt(i, ZERO);
    }
    PW.im.instanceMatrix.needsUpdate = true;
    PW.core.visible = fall <= 0 && !(S.slide > 0) && rows > 0; PW.core.scale.y = Math.max(0.01, rows * 0.1 / 0.1 * 0.96); PW.core.position.y = rows * 0.05; PW.core.position.x = lean * 0.06 * Math.pow(rows * 0.1, 2) * 0.5;
  }
  const RB = 3 * COLS + 4;   // brique « qui penche d'un doigt » : rangée 3 (la 4e) tant que le mur est assez haut
  function wallInes(S, f) {
    const rows = S.inesRows ?? 0, n = Math.floor(rows * COLS), redo = S.redo ?? 0, crookRow = S.crookRow ?? 6, ri = crookRow * COLS + 8;
    for (let i = 0; i < NB; i++) {
      const j = jit[i], row = Math.floor(i / COLS), h = row * 0.1 + 0.044;
      let x = bx(i) + j[0] * 0.006, y = h, z = j[1] * 0.006, rz = j[2] * 0.01, ry = 0;
      if (i === ri && (S.crook ?? 0) > 0) { const k = smooth((redo - 0.5) / 0.4), lift = Math.sin(Math.PI * clamp((redo - 0.15) / 0.7)); rz = 0.2 * (1 - k); y += 0.012 * (1 - k) + 0.22 * lift; z += 0.1 * lift; x += 0.02 * (1 - k); }
      if (i < n) put(IW.im, i, x, y, z, 0, ry, rz); else IW.im.setMatrixAt(i, ZERO);
    }
    IW.im.instanceMatrix.needsUpdate = true; IW.core.scale.y = Math.max(0.01, rows * 0.96); IW.core.position.y = rows * 0.05; IW.core.visible = rows > 0;
  }
  // briques lancées vers le mur de Paco (arcs répétés)
  const tossed = []; for (let k = 0; k < 5; k++) tossed.push(add(BR, M(['#c8573a', '#d46a44', '#b84a30', '#cc5e3c', '#a8452e'][k]), 0, -5, 0, world));
  // fil de maçon tendu sur le mur d'Inès + deux piquets
  const IX = SPOTS.inesWall[0], IZ = SPOTS.inesWall[2];
  const stakeM = M('#e8c040'), lineM = BASIC('#ff5a3a');
  const stA = add(box(0.05, 1.6, 0.05), stakeM, IX - 1.45, 0.8, IZ + 0.18, world, T), stB = add(box(0.05, 1.6, 0.05), stakeM, IX + 1.45, 0.8, IZ + 0.18, world, T);
  const line = add(box(2.9, 0.014, 0.014), lineM, IX, 0.5, IZ + 0.18, world, T);
  // ---------- palette de briques, seau, truelle ----------
  { const [px, , pz] = SPOTS.pallet; add(box(1.3, 0.12, 1.0), M('#9a6a3e'), px, 0.06, pz, world);
    for (let k = 0; k < 6; k++) for (let i = 0; i < 5; i++) for (let l = 0; l < 2; l++) add(box(0.24, 0.085, 0.11), M(['#c8573a', '#b84a30', '#d46a44'][(k + i + l) % 3]), px - 0.52 + i * 0.26, 0.17 + k * 0.09, pz - 0.2 + l * 0.4 + (k % 2 ? 0.02 : 0), world, T); }
  { const g = new THREE.Group(); g.position.set(-0.4, 0, -2.2); world.add(g); add(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 10), M('#3f78c8'), 0, 0.17, 0, g); add(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 10), M('#bdb5a6'), 0, 0.33, 0, g, T); }
  // ---------- bétonnière ----------
  { const [mx, , mz] = SPOTS.mixer, g = new THREE.Group(); g.position.set(mx, 0, mz); g.rotation.y = 0.5; world.add(g);
    add(box(1.2, 0.12, 0.8), M('#e8c040'), 0, 0.5, 0, g); for (const sx of [-0.5, 0.5]) add(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 12), M('#2a2e36'), sx, 0.28, 0.45, g, T).rotation.x = Math.PI / 2;
    for (const sx of [-0.5, 0.5]) add(box(0.1, 0.4, 0.1), M('#e8c040'), sx, 0.3, -0.3, g, T);
    const dr = add(new THREE.CylinderGeometry(0.5, 0.35, 0.9, 14), M('#e8483a'), 0, 1.05, 0, g); dr.rotation.z = 0.5; add(new THREE.ConeGeometry(0.5, 0.45, 14), M('#c8382e'), 0.2, 1.46, 0, g).rotation.z = 0.5;
    add(new THREE.CylinderGeometry(0.46, 0.46, 0.05, 14), M('#8a8a92'), -0.18, 0.63, 0, g, T).rotation.z = 0.5; }
  // ---------- brouette ----------
  { const [wx, , wz] = SPOTS.barrow, g = new THREE.Group(); g.position.set(wx, 0, wz); g.rotation.y = -0.6; world.add(g);
    add(box(0.8, 0.28, 0.55), M('#3f9ad8'), 0, 0.5, 0, g); add(box(0.7, 0.05, 0.45), M('#9a6a3e'), 0, 0.68, 0, g, T); add(new THREE.CylinderGeometry(0.21, 0.21, 0.08, 12), M('#2a2e36'), 0.5, 0.21, 0, g, T).rotation.x = Math.PI / 2;
    for (const sz of [-0.22, 0.22]) { add(box(1.0, 0.04, 0.04), M('#9a6a3e'), -0.6, 0.55, sz, g, T); add(box(0.04, 0.5, 0.04), M('#6a4a2a'), -0.3, 0.25, sz, g, T); } }
  // ---------- échafaudage + bâche ----------
  const [sx0, , sz0] = SPOTS.scaffold;
  for (const dx of [-1.8, -0.6, 0.6, 1.8]) for (const dz of [0, -1.0]) add(new THREE.CylinderGeometry(0.035, 0.035, 3.4, 6), M('#8d949e'), sx0 + dx, 1.7, sz0 + dz, world, T);
  for (const y of [0.8, 1.7, 2.6]) for (const dz of [0, -1.0]) add(box(3.7, 0.05, 0.05), M('#8d949e'), sx0, y, sz0 + dz, world, T);
  for (const dx of [-1.8, -0.6, 0.6, 1.8]) for (const y of [1.7, 2.6]) add(box(0.05, 0.05, 1.0), M('#8d949e'), sx0 + dx, y, sz0 - 0.5, world, T);
  add(box(3.7, 0.06, 1.0), M('#b98a50'), sx0, 1.7, sz0 - 0.5, world, T);
  const tarpGeo = new THREE.PlaneGeometry(3.5, 2.2, 14, 9), tarp = add(tarpGeo, toon({ color: '#3f78c8', side: THREE.DoubleSide }), sx0, 2.65, sz0 + 0.08, world, T);
  const tarpBase = Array.from(tarpGeo.attributes.position.array);
  // ---------- cabane, bâtiment, grue ----------
  { const [hx, , hz] = SPOTS.hut, g = new THREE.Group(); g.position.set(hx, 0, hz); g.rotation.y = 0.2; world.add(g);
    add(box(4.2, 2.5, 2.4), M('#e8c040'), 0, 1.4, 0, g); add(box(4.4, 0.15, 2.6), M('#8a8a92'), 0, 2.7, 0, g); add(box(0.9, 1.8, 0.1), M('#7a5130'), -1.2, 1.0, 1.25, g, T);
    add(box(1.2, 0.8, 0.08), BASIC('#bfe4ff'), 0.9, 1.7, 1.22, g, T); add(box(1.4, 0.1, 0.12), M('#f6f1e6'), 0.9, 1.25, 1.24, g, T); add(box(0.5, 0.35, 0.05), M('#d23a32'), 1.6, 0.5, 1.22, g, T); }
  { const g = new THREE.Group(); g.position.set(-14, 0, -18); world.add(g); const C = M('#a8a8a0'), C2 = M('#8e8e88');
    for (const x of [-4, 0, 4]) for (const z of [-1.5, 1.5]) add(box(0.5, 9, 0.5), C, x, 4.5, z, g);
    for (const y of [3, 6, 9]) add(box(9.4, 0.3, 4.6), C2, 0, y, 0, g); add(box(9.4, 0.12, 0.12), M('#e8c040'), 0, 9.9, 2.4, g, T); }
  { const g = new THREE.Group(); g.position.set(15, 0, -22); world.add(g); const Y = M('#e8b020');
    add(box(0.9, 22, 0.9), Y, 0, 11, 0, g); add(box(20, 0.7, 0.7), Y, -4, 22.5, 0, g); add(box(3.2, 2.4, 2.4), M('#7a808a'), 4.5, 21, 0, g); add(box(2.2, 2.0, 2.0), Y, 0.5, 20.5, 1.1, g); add(box(0.05, 8, 0.05), M('#2a2e36'), -10, 18.5, 0, g, T); add(box(1.6, 1.0, 1.0), M('#8a8a92'), -10, 14.4, 0, g, T); }
  // ---------- panneau, barrières, cônes, tas de sable, planches ----------
  K.sign(-6.6, -0.9, 'CHANTIER', 0.25, { bg: '#ffd23a', fg: '#271925' }); K.sign(7.4, -1.2, 'DANGER', -0.3, { bg: '#e8483a', fg: '#f6f1e6' });
  for (const [x, z] of [[-6.4, -0.6], [5.9, -0.4], [-0.9, 1.7], [3.1, 1.6]]) { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(box(0.4, 0.04, 0.4), M('#2a2e36'), 0, 0.02, 0, g, T); add(new THREE.ConeGeometry(0.17, 0.55, 8), M('#ff7a1e'), 0, 0.3, 0, g, T); add(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 8), M('#f6f1e6'), 0, 0.33, 0, g, T); }
  { const g = new THREE.Group(); g.position.set(7.0, 0, -2.2); world.add(g); const s = add(new THREE.ConeGeometry(1.5, 1.2, 10), M('#d8bf8a'), 0, 0.6, 0, g); s.scale.set(1, 1, 0.8); }
  K.crate(-7.2, -2.0, { s: 0.6 }); K.barrel(-7.4, -0.4); K.barrel(7.8, 0.2); K.sack(-6.8, -3.4, {}); K.sack(7.2, -3.0, {});
  { const g = new THREE.Group(); g.position.set(-5.2, 0.4, -4.4); g.rotation.set(0.45, 0.2, 0); world.add(g); for (let i = 0; i < 4; i++) add(box(0.22, 2.6, 0.04), M('#b98a50'), i * 0.24, 1.3, 0, g, T); }
  // lampe de chantier (s'allume la nuit)
  const lampG = new THREE.Group(); lampG.position.set(3.4, 0, -3.5); world.add(lampG); add(box(0.5, 0.05, 0.5), M('#2a2e36'), 0, 0.03, 0, lampG, T); add(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), M('#2a2e36'), 0, 1.2, 0, lampG, T);
  const lampBulb = add(box(0.46, 0.3, 0.2), BASIC('#fff0b8'), 0.1, 2.5, 0.12, lampG, T);
  // ---------- horizon : clôture de chantier, collines, arbres ----------
  for (let x = -24; x <= 24; x += 2.6) add(box(2.2, 1.15, 0.08), M(['#f0ece2', '#d8c8a0'][Math.abs((x + 24) / 2.6 | 0) % 2]), x, 0.58, -9.5, world, T);
  for (const [x, z, s, c] of [[-60, -110, 40, '#7a9a4a'], [10, -130, 55, '#8aa65a'], [70, -105, 38, '#6f8f44'], [-110, -80, 30, '#86a252']]) { const h = add(new THREE.SphereGeometry(s, 16, 10), M(c), x, -s * 0.55, z, world, T); h.scale.set(1.8, 0.8, 1); }
  for (const x of [-30, -22, -10, 6, 20, 32, 44]) K.tree(x + r() * 4, -16 - r() * 10, { s: 1.4 });
  for (const x of [-12, 3, 16, 28, -26]) K.bush(x, -12.5);
  K.verge(-12, 12, -9, 2.5, { density: 0.8, flowers: false }); K.verge(-12, 12, 2.5, 8, { density: 0.5 });
  for (const [x, z] of [[-1.4, -0.6], [-2.8, 0.4], [4.8, -0.2]]) K.rock(x, z, { s: 0.2 });
  const clouds = [];
  function state(S, f) {
    const wet = S.wet ?? 0;
    lerpC(mGround, '#ffffff', '#7a7a8c', wet); mud.visible = wet > 0.15 || (S.fall ?? 0) > 0.05; mud.material.color.set('#4a3626').lerp(new THREE.Color('#2e2a2a'), wet * 0.5);
    pud.forEach((p, i) => { p.visible = wet > 0.3 + i * 0.12; p.scale.x = (1.2 + i * 0.3) * clamp(wet * 1.2); });
    wallPaco(S, f); wallInes(S, f);
    // briques lancées
    tossed.forEach((b, k) => {
      if (!S.toss) { b.visible = false; return; }
      const per = 20, ph = ((f + k * 4) % per) / per, id = Math.floor((f + k * 4) / per), top = (S.pacoRows ?? 8) * 0.1 + 0.2, tx = SPOTS.pacoWall[0] + ((id * 3 + k * 7) % 9 - 4) * 0.25;
      const a = [SPOTS.pallet[0] + 0.3, 1.0, SPOTS.pallet[2] + 0.2], b2 = [tx, top, SPOTS.pacoWall[2] + 0.5];
      b.visible = true; b.position.set(a[0] + (b2[0] - a[0]) * ph, a[1] + (b2[1] - a[1]) * ph + Math.sin(Math.PI * ph) * 0.9, a[2] + (b2[2] - a[2]) * ph); b.rotation.set(ph * 6, k, ph * 9);
    });
    // fil de maçon
    const ln = S.line ?? 0, ly = ((S.inesRows ?? 0) + 1) * 0.1 + 0.02; line.visible = ln > 0.02; stA.visible = stB.visible = ln > 0.02; line.scale.x = Math.max(0.01, ln); line.position.set(IX - 1.45 + 1.45 * ln, ly, IZ + 0.18);
    // bâche
    const w = S.tarp ?? 0, pa = tarpGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x0 = tarpBase[i * 3], y0 = tarpBase[i * 3 + 1], hang = (1.1 - y0) / 2.2; pa.setZ(i, Math.sin(f * 0.55 + x0 * 2.2 + y0) * 0.5 * w * hang + Math.sin(f * 1.7 + x0 * 5) * 0.12 * w * hang); pa.setX(i, x0 + Math.sin(f * 0.8 + y0 * 3) * 0.25 * w * hang); }
    pa.needsUpdate = true;
    lampBulb.visible = !!S.lamp; K.lampMat.visible = true;
  }
  return { DECK, SPOTS, clouds, state, K, onLight: () => {} };
}
