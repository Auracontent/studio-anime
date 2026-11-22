// Library set: Paris 1900, affaire Humbert. Trois lieux dans la même scène.
//  - Salon doré (origine) : parquet, boiseries crème et or, fenêtres à rideaux, lustres, portrait de « l'Américain », tapis rouge.
//    Gros COFFRE-FORT au centre du mur du fond (x = 0, z = -3.2) : sceaux de cire, porte à gonds (state.door 0..1), brique + penny dedans.
//    Les caméras regardent depuis +z vers -z (yaw 0). Mur du fond z = -5, murs latéraux x = ±13, pas de plafond (le ciel reste fermé par les murs).
//  - Tribunal (x = TX = 3000) : estrade du juge, table, drapeau, bancs, boiseries sombres. Mur du fond z = -5.
//  - Rue de Madrid (x = MX = 6000) : pavés, façades colorées, lampadaire, panneau « MADRID », fiacre.
// state(S, f) : door 0..1 (porte du coffre), seals 0|1 (sceaux de cire), debts 0..1 (pile de factures), chand 0..1 (lustres allumés).
export const DECK = 0, TX = 3000, MX = 6000;
export const SPOTS = { safe: [0, 0, -3.2], salon: [0, 0, 0], tribunal: [TX, 0, 0], madrid: [MX, 0, 0], debts: [-3.4, 0, -2.2] };

export function buildSalon1900(ctx) {
  const { THREE, P, scene, world, add, box, toon, T } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1902);
  const M = (c) => toon({ color: c });
  const INK = '#271925';
  const glow = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  // ---------- textures ----------
  const parquetC = cv(256, 256, (g, w, h) => { g.fillStyle = '#b07a46'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) { const o = (y / 32) % 2 ? 32 : 0; g.fillStyle = `rgb(${150 + r() * 40 | 0},${96 + r() * 30 | 0},${52 + r() * 20 | 0})`; g.fillRect(x + o, y, 62, 30); g.fillStyle = 'rgba(60,34,18,0.35)'; g.fillRect(x + o + 62, y, 2, 32); g.fillRect(x + o, y + 30, 64, 2); } });
  const panelC = cv(256, 256, (g, w, h) => { g.fillStyle = '#f2e6cb'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d9a845'; g.lineWidth = 6; g.strokeRect(22, 22, w - 44, h - 44); g.strokeStyle = 'rgba(150,110,60,0.5)'; g.lineWidth = 3; g.strokeRect(40, 40, w - 80, h - 80);
    g.fillStyle = '#d9a845'; for (const [x, y] of [[w / 2, 22], [w / 2, h - 22]]) { g.beginPath(); g.arc(x, y, 12, 0, 6.283); g.fill(); } for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(160,120,70,0.06)'; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 20, 6 + r() * 10, 0, 0, 6.283); g.fill(); } });
  const darkC = cv(256, 256, (g, w, h) => { g.fillStyle = '#5a3a26'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f1d12'; g.lineWidth = 5; g.strokeRect(18, 18, w - 36, h - 36); g.strokeStyle = 'rgba(210,160,100,0.35)'; g.lineWidth = 3; g.strokeRect(34, 34, w - 68, h - 68); for (let k = 0; k < 70; k++) { g.fillStyle = 'rgba(40,24,14,0.12)'; g.fillRect(r() * w, r() * h, 30 + r() * 60, 2); } });
  const carpetC = cv(256, 256, (g, w, h) => { g.fillStyle = '#9c2a38'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c24a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 3; g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = '#e8c24a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(w * (i + 0.5) / 4, h * (j + 0.5) / 4 - 14); g.lineTo(w * (i + 0.5) / 4 + 10, h * (j + 0.5) / 4); g.lineTo(w * (i + 0.5) / 4, h * (j + 0.5) / 4 + 14); g.lineTo(w * (i + 0.5) / 4 - 10, h * (j + 0.5) / 4); g.fill(); } });
  const cobbleC = cv(256, 256, (g, w, h) => { g.fillStyle = '#b8a890'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 40) { const o = (y / 32) % 2 ? 20 : 0; g.fillStyle = `rgb(${160 + r() * 40 | 0},${146 + r() * 34 | 0},${120 + r() * 30 | 0})`; g.beginPath(); g.roundRect(x + o + 2, y + 2, 36, 28, 8); g.fill(); } });
  const frontC = (tone, lit) => cv(128, 128, (g, w, h) => { g.fillStyle = tone; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(90,60,40,0.25)'; g.fillRect(0, 0, w, 6);
    g.fillStyle = '#2f6a58'; g.fillRect(12, 14, 20, 84); g.fillRect(96, 14, 20, 84); g.fillStyle = lit ? '#ffd98a' : '#3a4a6a'; g.fillRect(34, 16, 60, 80);
    g.strokeStyle = '#f4efe4'; g.lineWidth = 4; g.strokeRect(34, 16, 60, 80); g.beginPath(); g.moveTo(64, 16); g.lineTo(64, 96); g.stroke(); g.fillStyle = '#2a2430'; g.fillRect(24, 98, 80, 7); });
  const portraitC = cv(256, 320, (g, w, h) => { g.fillStyle = '#3a2a3c'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f1a26'; g.beginPath(); g.ellipse(128, 300, 100, 80, 0, 0, 6.283); g.fill();
    g.fillStyle = '#f4efe4'; g.fillRect(100, 210, 56, 40); g.fillStyle = '#e8b890'; g.beginPath(); g.ellipse(128, 140, 56, 68, 0, 0, 6.283); g.fill();
    g.fillStyle = '#d8d8d8'; g.beginPath(); g.ellipse(128, 200, 50, 44, 0, 0, 3.14); g.fill(); g.beginPath(); g.ellipse(128, 86, 62, 30, 0, 3.14, 6.283); g.fill();
    g.fillStyle = '#271925'; g.beginPath(); g.arc(108, 130, 6, 0, 6.283); g.arc(148, 130, 6, 0, 6.283); g.fill(); g.fillRect(96, 114, 24, 5); g.fillRect(136, 114, 24, 5);
    g.fillStyle = '#2f56a8'; g.fillRect(70, 262, 116, 8); g.fillStyle = '#d23a32'; g.fillRect(70, 270, 116, 8); });
  const mCream = M('#efe6cf'), mGold = M('#d9a845'), mWood = M('#8a5d38'), mWood2 = M('#5a3b22'), mIron = M('#2f3440'), mRed = M('#a8302f'), mWhite = M('#f4f1ea');
  const panelM = toon({ map: P.tex(panelC, 1, 1) });
  // ================= SALON =================
  const fl = add(new THREE.PlaneGeometry(40, 30), toon({ map: P.tex(parquetC, 14, 11) }), 0, 0.005, 3, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  const cp = add(new THREE.PlaneGeometry(7, 14), toon({ map: P.tex(carpetC, 2, 4) }), 0, 0.012, 1.5, world, { cast: false }); cp.rotation.x = -Math.PI / 2;
  const WALLH = 9;
  for (let i = 0; i < 9; i++) add(box(3.2, WALLH, 0.4), panelM, -12.8 + i * 3.2, WALLH / 2, -5.2, world);           // mur du fond en panneaux dorés
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) add(box(0.4, WALLH, 3.2), panelM, sx * 13.2, WALLH / 2, -3.2 + i * 3.2, world);
  add(box(27, 0.5, 0.6), mGold, 0, 1.0, -4.9, world); add(box(27, 0.35, 0.5), mGold, 0, 6.9, -4.9, world); add(box(27, 1.0, 0.5), mWhite, 0, 8.6, -4.9, world);
  const winM = glow('#dcecf8');
  for (const x of [-8.4, 8.4]) { add(box(2.4, 4.4, 0.12), winM, x, 3.9, -4.95, world, { cast: false }); add(box(2.8, 0.22, 0.34), mGold, x, 6.2, -4.85, world); add(box(2.8, 0.22, 0.34), mWhite, x, 1.6, -4.85, world);
    for (const s of [-1, 1]) { add(box(0.8, 4.8, 0.3), mRed, x + s * 1.5, 4.0, -4.7, world); add(box(0.16, 4.8, 0.34), mGold, x + s * 1.1, 4.0, -4.68, world); }
    add(box(0.08, 4.4, 0.14), mWhite, x, 3.9, -4.88, world); add(box(2.4, 0.08, 0.14), mWhite, x, 3.9, -4.88, world); }
  { const g = new THREE.Group(); g.position.set(-4.4, 4.3, -4.9); world.add(g); add(box(2.0, 2.6, 0.14), mGold, 0, 0, 0, g); add(box(1.7, 2.3, 0.1), toon({ map: P.tex(portraitC, 1, 1) }), 0, 0, 0.08, g); }   // le millionnaire américain
  { const g = new THREE.Group(); g.position.set(4.4, 4.3, -4.9); world.add(g); add(box(2.0, 2.6, 0.14), mGold, 0, 0, 0, g); add(box(1.7, 2.3, 0.1), M('#6a8aa8'), 0, 0, 0.08, g); add(box(1.2, 0.8, 0.12), M('#8fb078'), 0, -0.6, 0.12, g); add(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 12), M('#f6d98a'), 0.3, 0.5, 0.14, g).rotation.x = Math.PI / 2; }
  // lustres
  const bulbs = [];
  for (const [cx, cz] of [[-3, 0.5], [3.5, 1.5], [0, -2.2]]) { const g = new THREE.Group(); g.position.set(cx, 6.6, cz); world.add(g);
    add(new THREE.CylinderGeometry(0.03, 0.03, 4, 5), mGold, 0, 2, 0, g); add(new THREE.TorusGeometry(0.9, 0.07, 6, 18), mGold, 0, 0, 0, g).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.55, 0.06, 6, 14), mGold, 0, 0.3, 0, g).rotation.x = Math.PI / 2;
    add(new THREE.SphereGeometry(0.2, 8, 6), mGold, 0, -0.25, 0, g);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283, b = add(new THREE.SphereGeometry(0.13, 8, 6), glow('#ffe9a0'), Math.cos(a) * 0.9, 0.2, Math.sin(a) * 0.9, g, { cast: false }); bulbs.push(b); } }
  // mobilier : colonnes, canapés, guéridons, plantes, tapis, banc de banquiers
  for (const x of [-6.2, 6.2]) { add(box(0.9, 7, 0.9), mCream, x, 3.5, -4.5, world); add(box(1.2, 0.35, 1.2), mGold, x, 7.0, -4.5, world); add(box(1.2, 0.35, 1.2), mGold, x, 0.18, -4.5, world); }
  const sofa = (x, z, ry, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g); add(box(2.4, 0.5, 1.0), M(col), 0, 0.5, 0, g); add(box(2.4, 0.9, 0.3), M(col), 0, 1.0, -0.4, g); for (const s of [-1, 1]) add(box(0.3, 0.8, 1.0), M(col), s * 1.15, 0.6, 0, g); for (const s of [-1, 1]) add(box(0.14, 0.3, 0.14), mGold, s * 1.0, 0.15, 0.4, g); return g; };
  sofa(-9, -3.4, 0.2, '#2f6a8a'); sofa(9.5, -3.2, -0.2, '#2f6a58'); sofa(-11.5, 0.5, Math.PI / 2 - 0.1, '#7a3a6a'); sofa(11.8, 0.5, -Math.PI / 2, '#7a3a6a');
  const table = (x, z, col = '#b98a56') => { add(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 14), M(col), x, 0.95, z, world); add(new THREE.CylinderGeometry(0.08, 0.2, 0.95, 8), mGold, x, 0.48, z, world); add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), mGold, x, 0.03, z, world); };
  table(-7, -1.2); table(7.2, -1.0); table(-10.5, -2.6); table(10.8, -2.4);
  for (const [x, z] of [[-7, -1.2], [7.2, -1.0]]) { add(new THREE.CylinderGeometry(0.12, 0.08, 0.3, 8), M('#e8e2d6'), x, 1.14, z, world); add(new THREE.SphereGeometry(0.17, 8, 6), M('#e0455a'), x, 1.38, z, world); }
  const plant = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.4 * s, 0.3 * s, 0.7 * s, 10), M('#b0562f'), 0, 0.35 * s, 0, g); for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283, lf = add(new THREE.ConeGeometry(0.18 * s, 1.6 * s, 5), M(i % 2 ? '#4f8a38' : '#6fae45'), Math.cos(a) * 0.3 * s, 1.4 * s, Math.sin(a) * 0.3 * s, g); lf.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); } };
  plant(-12, -4, 1.2); plant(12, -4, 1.2); plant(-5, -4.2, 0.9); plant(5.2, -4.2, 0.9); plant(-12.2, 4, 1); plant(12.2, 4.5, 1);
  for (const [x, z] of [[-2.6, -4.6], [2.6, -4.6], [-9.8, -4.6], [9.8, -4.6]]) { add(box(0.7, 1.6, 0.5), mWood2, x, 0.8, z, world); add(box(0.5, 0.5, 0.1), M('#d9a845'), x, 1.3, z + 0.28, world); }
  // pile de factures (grossit sur « les dettes grossissent »)
  const debtG = new THREE.Group(); debtG.position.set(SPOTS.debts[0], 0, SPOTS.debts[2]); world.add(debtG); const debts = [];
  for (let i = 0; i < 26; i++) { const pg = add(box(0.9, 0.12, 0.65), M(i % 3 ? '#f8f2e2' : '#e9dcc0'), (r() - 0.5) * 0.18, 0.08 + i * 0.12, (r() - 0.5) * 0.18, debtG); pg.rotation.y = (r() - 0.5) * 0.5; debts.push(pg); if (i % 5 === 4) add(box(0.95, 0.04, 0.12), mRed, 0, 0.16 + i * 0.12, 0.2, debtG).rotation.y = 0; }
  // ---------- LE COFFRE-FORT ----------
  const SW = 2.3, SH = 2.8, SD = 1.7, WT = 0.28, SX = SPOTS.safe[0], SZ = SPOTS.safe[2];
  const safe = new THREE.Group(); safe.position.set(SX, 0, SZ); world.add(safe);
  const mSafe = M('#2f4a40'), mSafe2 = M('#3b5e50'), mIn = new THREE.MeshBasicMaterial({ color: '#3c6454' }), mIn2 = new THREE.MeshBasicMaterial({ color: '#2c5042' });
  add(box(SW, WT, SD), mSafe, 0, WT / 2, 0, safe); add(box(SW, WT, SD), mSafe, 0, SH - WT / 2, 0, safe);
  add(box(WT, SH, SD), mSafe, -SW / 2 + WT / 2, SH / 2, 0, safe); add(box(WT, SH, SD), mSafe, SW / 2 - WT / 2, SH / 2, 0, safe); add(box(SW, SH, WT), mSafe, 0, SH / 2, -SD / 2 + WT / 2, safe);
  add(box(SW + 0.2, 0.18, SD + 0.1), mGold, 0, SH + 0.05, 0, safe); add(box(SW + 0.2, 0.2, SD + 0.1), mGold, 0, 0.1, 0, safe);                            // corniche et socle dorés
  for (const s of [-1, 1]) add(box(0.14, SH, 0.1), mGold, s * (SW / 2 + 0.02), SH / 2, SD / 2 - 0.02, safe);
  add(box(SW - 0.5, 0.06, SD - 0.4), mIn2, 0, WT + 0.02, 0, safe, { cast: false });
  add(box(SW - WT * 2, SH - WT * 2, 0.04), mIn, 0, SH / 2, -SD / 2 + WT + 0.02, safe, { cast: false });
  for (const s2 of [-1, 1]) add(box(0.04, SH - WT * 2, SD - WT), mIn2, s2 * (SW / 2 - WT - 0.02), SH / 2, -WT / 2, safe, { cast: false });
  add(box(SW - WT * 2, 0.04, SD - WT), mIn2, 0, SH - WT - 0.02, -WT / 2, safe, { cast: false });                                                            // fond de l'intérieur
  add(box(SW - WT * 2, 0.1, SD - WT), mIn, 0, 1.5, -0.1, safe, { cast: false });                                                                                      // étagère
  const brick = new THREE.Group(); brick.position.set(-0.45, 1.55 + 0.17, 0.1); brick.rotation.y = 0.35; safe.add(brick);                                 // LA brique
  add(box(0.7, 0.34, 0.36), M('#c0553a'), 0, 0, 0, brick); for (const y of [-0.06, 0.08]) add(box(0.71, 0.02, 0.37), M('#8a3a28'), 0, y, 0, brick, { cast: false }); add(box(0.02, 0.34, 0.37), M('#8a3a28'), 0.1, 0, 0, brick, { cast: false });
  const penny = add(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 28), new THREE.MeshBasicMaterial({ color: '#f0a050' }), 0.5, 1.9, 0.0, safe); penny.rotation.x = Math.PI / 2 - 0.3;
  add(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), new THREE.MeshBasicMaterial({ color: '#c8782e' }), 0.5, 1.9, 0.0, safe).rotation.x = Math.PI / 2 - 0.3; add(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 20), new THREE.MeshBasicMaterial({ color: '#f4b868' }), 0.5, 1.9, 0.0, safe).rotation.x = Math.PI / 2 - 0.3;
  const hinge = new THREE.Group(); hinge.position.set(-SW / 2 + 0.05, 0, SD / 2 - WT / 2 + 0.04); safe.add(hinge);
  add(box(SW - 0.1, SH - 0.2, 0.28), mSafe2, (SW - 0.1) / 2, SH / 2, 0, hinge);
  add(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 22), mGold, SW * 0.5 - 0.05, SH * 0.58, 0.18, hinge).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 22), mIron, SW * 0.5 - 0.05, SH * 0.58, 0.2, hinge).rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283, sp = add(box(0.07, 0.62, 0.06), mGold, SW * 0.5 - 0.05 + Math.sin(a) * 0.0, SH * 0.58, 0.28, hinge); sp.rotation.z = a; }
  add(box(0.5, 0.18, 0.14), mGold, SW - 0.5, SH * 0.3, 0.2, hinge); add(box(SW - 0.5, 0.06, 0.04), mGold, (SW - 0.1) / 2, SH * 0.88, 0.16, hinge); add(box(SW - 0.5, 0.06, 0.04), mGold, (SW - 0.1) / 2, SH * 0.12, 0.16, hinge);
  for (let i = 0; i < 4; i++) for (const sy of [0.88, 0.12]) add(new THREE.SphereGeometry(0.05, 6, 5), mGold, 0.25 + i * 0.6, SH * sy, 0.2, hinge, { cast: false });
  const seals = new THREE.Group(); seals.position.set(SW / 2 - 0.02, 0, SD / 2 + 0.2); safe.add(seals);                                                  // sceaux de cire sur la fente
  for (const y of [0.55, 1.4, 2.25]) { add(box(0.36, 0.1, 0.05), mWhite, 0, y, 0, seals); const sl = add(new THREE.SphereGeometry(0.2, 12, 8), mRed, 0, y, 0.04, seals); sl.scale.set(1, 1, 0.45); add(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), M('#7a1d24'), 0, y, 0.12, seals).rotation.x = Math.PI / 2; }
  // ================= TRIBUNAL =================
  const X = (x) => TX + x;
  const fl2 = add(new THREE.PlaneGeometry(36, 26), toon({ map: P.tex(parquetC, 12, 9) }), X(0), 0.005, 4, world, { cast: false }); fl2.rotation.x = -Math.PI / 2;
  const darkM = toon({ map: P.tex(darkC, 1, 1) });
  for (let i = 0; i < 9; i++) add(box(3.2, WALLH, 0.4), darkM, X(-12.8 + i * 3.2), WALLH / 2, -5.2, world);
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) add(box(0.4, WALLH, 3.2), darkM, X(sx * 13.2), WALLH / 2, -3.2 + i * 3.2, world);
  add(box(27, 0.5, 0.5), mGold, X(0), 6.8, -4.9, world);
  add(box(8, 0.5, 3), mWood2, X(0), 0.25, -3.2, world); add(box(8, 0.2, 3.2), mWood, X(0), 0.55, -3.2, world);                                       // estrade
  add(box(5.4, 0.9, 1.0), mWood, X(0), 1.1, -3.0, world); add(box(5.6, 0.14, 1.2), mWood2, X(0), 1.6, -3.0, world); add(box(5.2, 0.12, 0.06), mGold, X(0), 1.2, -2.46, world);   // pupitre du juge
  add(box(0.8, 0.12, 0.6), mWood2, X(-1.6), 1.72, -3.0, world); add(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8), mWood, X(-1.6), 1.9, -3.0, world).rotation.z = Math.PI / 2;   // maillet
  add(new THREE.CylinderGeometry(0.05, 0.05, 6, 6), mGold, X(-4.5), 3.5, -4.5, world); add(box(1.8, 1.2, 0.05), M('#2f56a8'), X(-5.4), 5.8, -4.5, world); add(box(1.8, 0.4, 0.05), M('#f4f1ea'), X(-5.4), 5.0, -4.5, world); add(box(1.8, 0.4, 0.05), M('#d23a32'), X(-5.4), 4.6, -4.5, world);
  { const g = add(new THREE.CylinderGeometry(1.0, 1.0, 0.1, 24), mGold, X(0), 5.2, -4.95, world); g.rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 24), M('#f4f1ea'), X(0), 5.2, -4.93, world).rotation.x = Math.PI / 2; add(box(0.18, 1.1, 0.12), mIron, X(0), 5.2, -4.9, world); add(box(1.0, 0.12, 0.12), mIron, X(0), 5.5, -4.9, world); }   // balance de la justice
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { add(box(3.6, 0.1, 0.8), mWood, X(s * 5.5), 0.55, 1.6 + i * 1.3, world); add(box(3.6, 0.8, 0.1), mWood, X(s * 5.5), 1.0, 2.0 + i * 1.3, world); for (const k of [-1, 1]) add(box(0.1, 0.55, 0.7), mWood2, X(s * 5.5 + k * 1.7), 0.27, 1.6 + i * 1.3, world); }
  // ================= RUE DE MADRID =================
  const Y = (x) => MX + x;
  const gr = add(new THREE.PlaneGeometry(80, 60), toon({ map: P.tex(cobbleC, 22, 16) }), Y(0), 0.005, 0, world, { cast: false }); gr.rotation.x = -Math.PI / 2;
  const TONES = ['#e8c07a', '#d98a5a', '#e6d3a0', '#c9604a', '#7fb0b8', '#f0d890'], fm = {};
  const fmat = (tone, lit, nx, ny) => { const k = tone + lit + nx + ny; return fm[k] || (fm[k] = toon({ map: P.tex(frontC(tone, lit), nx, ny) })); };
  const bld = (x, z, w, fl, ry = 0) => { const g = new THREE.Group(); g.position.set(Y(x), 0, z); g.rotation.y = ry; world.add(g); const h = fl * 3; add(box(w, h, 7), fmat(TONES[Math.floor(r() * TONES.length)], r() > 0.7, Math.max(1, Math.round(w / 3.2)), fl), 0, h / 2, 0, g);
    add(box(w + 0.6, 0.5, 7.6), mWhite, 0, h + 0.1, 0, g); add(box(w, 0.9, 6), M('#b0562f'), 0, h + 0.7, 0, g); return g; };
  { let x = -30; while (x < 34) { const w = 6 + r() * 5; bld(x + w / 2, -10, w, 3 + Math.floor(r() * 3)); x += w; } }
  { let x = -30; while (x < 34) { const w = 6 + r() * 5; bld(x + w / 2, 15, w, 3 + Math.floor(r() * 2), Math.PI); x += w; } }
  { const g = new THREE.Group(); g.position.set(Y(3.4), 0, -3.2); world.add(g);                                                                        // le fiacre des gendarmes
    add(box(2.4, 1.2, 1.3), M('#1f2a3a'), 0, 1.1, 0, g); add(box(2.6, 0.15, 1.5), M('#b8322f'), 0, 1.8, 0, g); for (const s of [-1, 1]) { add(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 14), mWood, s * 0.9, 0.55, 0.7, g).rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 14), mWood, s * 0.9, 0.55, -0.7, g).rotation.x = Math.PI / 2; } }
  // ---------- ciel : nuages ----------
  const clouds = [];
  { const rr = P.rng(1900); for (let i = 0; i < 10; i++) { const c = cv(600, 400, () => {}); const pen = new T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 5);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false, color: '#f0e8dc' }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 130 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  void INK;
  function state(S, f) {
    hinge.rotation.y = -(S.door ?? 0) * 2.05; seals.visible = (S.seals ?? 1) > 0.5 && (S.door ?? 0) < 0.02;
    const dd = S.debts ?? 0; debts.forEach((m, i) => { m.visible = i < Math.ceil(dd * debts.length - 0.001); });
    const on = (S.chand ?? 1) > 0.5; bulbs.forEach((b) => b.material.color.set(on ? '#ffe9a0' : '#8a7a50'));
  }
  return { DECK, SPOTS, clouds, state, TX, MX };
}
