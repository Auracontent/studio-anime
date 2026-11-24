// Library set: laboratoire de bactériologie à Londres, 1928 (briques crème, soubassement vert bouteille, plancher sombre, grande fenêtre,
// longue paillasse avec boîtes de Petri, microscope, étagères de flacons, cuves de cuivre) + une salle d'hôpital claire (x = WX).
// DECK = 0. Labo : x -12..12, mur du fond z = -3.5, mur avant z = 11, plafond 4.2. Hôpital : x = WX ± 12.
// state(S, f) : S.mold (0-1 moisissure), S.clear (0-1 cercle vide), S.lid (0 fermé, 1 ouvert), S.dishes (0-1 boîtes posées), S.dust (0-1 poussière sur la paillasse), S.glow.
export const DECK = 0;
export const WX = 60;
export const BY = 1.0, BZ = -2.7;                       // dessus de la paillasse, z de la paillasse
export const HERO = [0, BY, -2.3];                      // la boîte de Petri vedette (centre)
export const DISH_R = 0.3;
export const DISHES = [[-3.4, -2.55], [-2.3, -2.9], [-1.2, -2.5], [-0.65, -2.95], [1.2, -2.6], [2.3, -2.95], [3.4, -2.5]];
export const SPOTS = { bench: [0, 0, -1.5], cuves: [8, 0, -1.2], ward: [WX, 0, -0.5] };

export function buildLabo(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1928), M = (c) => toon({ color: c });
  const brickT = cv(256, 256, (g, w, h) => { g.fillStyle = '#e8d9b6'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#e2d0a8', '#ecdfbf', '#dfcca2'][(x + y * 2) % 3]; g.fillRect(x * 64 + (y % 2) * 32 + 2, y * 32 + 2, 60, 28); } for (let k = 0; k < 200; k++) { g.fillStyle = 'rgba(120,90,50,0.10)'; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); } });
  const floorT = cv(512, 512, (g, w, h) => { for (let i = 0; i < 10; i++) { g.fillStyle = ['#7a5436', '#86603e', '#6f4a2f', '#7d583a'][i % 4]; g.fillRect(i * 51, 0, 52, h); g.fillStyle = 'rgba(30,16,10,0.7)'; g.fillRect(i * 51, 0, 3, h); } for (let k = 0; k < 160; k++) { g.fillStyle = 'rgba(30,16,10,0.2)'; g.fillRect(r() * w, r() * h, 2, 8 + r() * 36); } });
  const tileT = cv(256, 256, (g, w, h) => { g.fillStyle = '#f2f0e8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9cfc8'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } });
  const wardWall = cv(256, 256, (g, w, h) => { g.fillStyle = '#dff0ea'; g.fillRect(0, 0, w, h); for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(${190 + r() * 40 | 0},${225 + r() * 20 | 0},${215 + r() * 25 | 0},0.3)`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); } });
  const mBrick = toon({ map: P.tex(brickT, 10, 1.6) }), mFloor = toon({ map: P.tex(floorT, 8, 6) }), mTile = toon({ map: P.tex(tileT, 14, 10) }), mWardWall = toon({ map: P.tex(wardWall, 6, 1.4) });
  const mDado = M('#2f6a52'), mWood = M('#8a5a34'), mWoodD = M('#5e3a22'), mTop = M('#2e3a38'), mIron = M('#2f3440'), mBrass = M('#d8a840'), mCream = M('#efe6cf'), mGlass = M('#cfe8ee'), mCopper = M('#c9783a'), mCopperD = M('#9a5428'), mWhite = M('#f4f2ec');
  const X = (x) => x;
  // ---------- labo : pièce ----------
  const fl = add(new THREE.PlaneGeometry(26, 15), mFloor, 0, 0.004, 4, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  add(tbox(26, 4.2, 0.4, 3), mBrick, 0, 2.1, -3.7, world); add(tbox(26, 4.2, 0.4, 3), mBrick, 0, 2.1, 11.2, world); add(tbox(0.4, 4.2, 15, 3), mBrick, -13.2, 2.1, 4, world); add(tbox(0.4, 4.2, 15, 3), mBrick, 13.2, 2.1, 4, world);
  const ce = add(new THREE.PlaneGeometry(26, 15), M('#e9dcc0'), 0, 4.2, 4, world, { cast: false }); ce.rotation.x = Math.PI / 2;
  add(box(26, 1.1, 0.14), mDado, 0, 0.55, -3.46, world); add(box(26, 0.08, 0.2), mCream, 0, 1.12, -3.42, world);
  add(box(0.14, 1.1, 15), mDado, -12.94, 0.55, 4, world); add(box(0.14, 1.1, 15), mDado, 12.94, 0.55, 4, world);
  // grande fenêtre (lumière du jour d'été) au fond, à droite de la paillasse
  { const wx = 6.2, wy = 2.5; add(box(3.2, 2.4, 0.1), new THREE.MeshBasicMaterial({ color: '#fff4cf' }), wx, wy, -3.4, world, { cast: false });
    for (const [dx, dy, w, h] of [[0, 1.2, 3.4, 0.14], [0, -1.2, 3.4, 0.16], [-1.6, 0, 0.14, 2.6], [1.6, 0, 0.14, 2.6], [0, 0, 0.08, 2.4], [0, 0, 3.2, 0.08]]) add(box(w, h, 0.16), mWoodD, wx + dx, wy + dy, -3.34, world, { cast: false }); }
  // porte à gauche (fond) avec plaque
  add(box(1.5, 2.7, 0.14), mWood, -9.2, 1.35, -3.38, world); add(box(1.7, 0.16, 0.2), mWoodD, -9.2, 2.78, -3.36, world); add(new THREE.SphereGeometry(0.07, 8, 6), mBrass, -8.6, 1.2, -3.28, world);
  { const c = cv(512, 160, (g, w, h) => { g.fillStyle = '#1f2a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8a840'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#ffe9a8'; g.font = '800 62px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LABORATOIRE', w / 2, h / 2 + 3); });
    add(new THREE.PlaneGeometry(2.4, 0.75), toon({ map: P.tex(c) }), -9.2, 3.5, -3.26, world, { cast: false }); add(box(2.56, 0.9, 0.06), mWoodD, -9.2, 3.5, -3.32, world); }
  // ---------- paillasse ----------
  add(box(11, 0.1, 1.2), mTop, 0, BY - 0.05, BZ, world); add(box(10.8, 0.9, 1.05), mWoodD, 0, 0.45, BZ, world);
  for (const dx of [-3.6, -1.2, 1.2, 3.6]) add(box(0.04, 0.8, 1.07), mIron, dx, 0.45, BZ, world);
  // étagères de flacons au-dessus
  const bottle = (x, y, z, col, h = 0.3) => { add(new THREE.CylinderGeometry(0.07, 0.08, h, 8), M(col), x, y + h / 2, z, world); add(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), mGlass, x, y + h + 0.04, z, world); };
  for (const [sx, sw] of [[-4.2, 3.8], [0.6, 3.6]]) for (let k = 0; k < 2; k++) { const y = 1.75 + k * 0.8; add(box(sw, 0.06, 0.34), mWood, sx, y, -3.2, world);
    const cols = ['#e8a0c0', '#8fd36a', '#ffd23f', '#c86bff', '#7fc4f0', '#e87a3a']; for (let i = 0; i < 10; i++) bottle(sx - sw / 2 + 0.3 + i * (sw - 0.6) / 9, y + 0.03, -3.2, cols[(i + k * 2) % 6], 0.2 + r() * 0.15); }
  // microscope sur la paillasse (à gauche)
  { const g = new THREE.Group(); g.position.set(-4.7, BY, BZ + 0.05); g.rotation.y = 0.5; world.add(g); add(box(0.34, 0.05, 0.28), mIron, 0, 0.025, 0, g); add(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), mBrass, 0.1, 0.27, 0, g);
    const t = add(new THREE.CylinderGeometry(0.05, 0.05, 0.38, 8), mBrass, -0.02, 0.36, 0, g); t.rotation.z = 0.5; add(box(0.22, 0.02, 0.18), mIron, -0.02, 0.2, 0, g); }
  // flacons et éprouvettes à droite, bec Bunsen
  for (const [x, z, c, s] of [[4.6, BZ + 0.1, '#e8a0c0', 1], [5.0, BZ - 0.12, '#8fd36a', 0.8], [5.5, BZ + 0.15, '#ffd23f', 1.1], [6.0, BZ, '#7fc4f0', 0.9], [-5.6, BZ + 0.2, '#c86bff', 0.9]]) { add(new THREE.SphereGeometry(0.15 * s, 10, 8), M(c), x, BY + 0.15 * s, z, world); add(new THREE.CylinderGeometry(0.04 * s, 0.04 * s, 0.2 * s, 8), mGlass, x, BY + 0.3 * s + 0.08, z, world); }
  add(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8), mIron, 3.9, BY + 0.15, BZ + 0.2, world); const flame = add(new THREE.ConeGeometry(0.04, 0.12, 6), new THREE.MeshBasicMaterial({ color: '#8fc8ff' }), 3.9, BY + 0.36, BZ + 0.2, world, { cast: false });
  // ---------- boîtes de Petri ----------
  const bacT = (mold, clear) => cv(512, 512, (g, w, h) => {
    const c = w / 2, R = 244; g.fillStyle = '#e7cf86'; g.beginPath(); g.arc(c, c, R, 0, 7); g.fill();
    const mx = c + 38, my = c - 22, cr = clear * 175, mr = 6 + mold * 52, rr = P.rng(77);
    g.save(); g.beginPath(); g.arc(c, c, R - 6, 0, 7); g.clip();
    for (let k = 0; k < 1300; k++) { const a = rr() * 6.283, d = Math.sqrt(rr()) * (R - 14), x = c + Math.cos(a) * d, y = c + Math.sin(a) * d; if (mold > 0 && Math.hypot(x - mx, y - my) < mr + cr) continue;
      g.fillStyle = ['#e0a820', '#d89a18', '#f0bf30', '#c98a14'][k % 4]; g.beginPath(); g.arc(x, y, 5 + rr() * 8, 0, 7); g.fill(); }
    if (mold > 0) { g.fillStyle = '#f6e9b0'; g.beginPath(); g.arc(mx, my, mr + cr, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(160,120,40,0.45)'; g.stroke();
      g.fillStyle = '#e9f2e0'; g.beginPath(); g.arc(mx, my, mr + 7, 0, 7); g.fill(); g.fillStyle = '#58b09a'; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
      g.fillStyle = '#2f8a7a'; g.beginPath(); g.arc(mx + 4, my + 3, mr * 0.62, 0, 7); g.fill(); g.fillStyle = '#9ad8c0'; g.beginPath(); g.arc(mx - mr * 0.25, my - mr * 0.25, mr * 0.25, 0, 7); g.fill(); }
    g.restore(); g.lineWidth = 8; g.strokeStyle = '#a8b8b6'; g.beginPath(); g.arc(c, c, R, 0, 7); g.stroke(); });
  const glassM = M('#d7eef0'), lidM = M('#e6f6f8');
  const makeDish = (x, z, tex, ry = 0) => { const g = new THREE.Group(); g.position.set(x, BY, z); g.rotation.y = ry; world.add(g);
    add(new THREE.CylinderGeometry(DISH_R, DISH_R, 0.07, 28), glassM, 0, 0.035, 0, g);
    const face = add(new THREE.CircleGeometry(DISH_R * 0.94, 32), toon({ map: tex }), 0, 0.074, 0, g, { cast: false }); face.rotation.x = -Math.PI / 2;
    const lid = new THREE.Group(); g.add(lid); add(new THREE.CylinderGeometry(DISH_R * 1.03, DISH_R * 1.03, 0.045, 28), lidM, 0, 0.1, 0, lid); return { g, lid, face }; };
  const staticTex = P.tex(bacT(0, 0));
  const dishes = DISHES.map(([x, z], i) => makeDish(x, z, staticTex, i));
  const heroTex = new THREE.CanvasTexture(bacT(0, 0)); heroTex.colorSpace = THREE.SRGBColorSpace; const hero = makeDish(HERO[0], HERO[2], heroTex, 0);
  let lastKey = '';
  // ---------- cuves de cuivre à droite (les chercheurs plus tard) ----------
  for (const [x, z, h] of [[7.2, -1.9, 1.7], [8.9, -2.0, 2.0], [10.6, -1.9, 1.5]]) { add(new THREE.CylinderGeometry(0.62, 0.62, h, 18), mCopper, x, h / 2 + 0.3, z, world); add(new THREE.CylinderGeometry(0.66, 0.66, 0.1, 18), mCopperD, x, 0.34, z, world); add(new THREE.CylinderGeometry(0.66, 0.66, 0.1, 18), mCopperD, x, h + 0.25, z, world);
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), mIron, x, h + 0.5, z, world); for (const dx of [-0.45, 0.45]) add(box(0.1, 0.35, 0.1), mIron, x + dx, 0.17, z, world); }
  add(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 8), mCopperD, 9.0, 2.7, -2.6, world).rotation.z = Math.PI / 2;
  // ---------- lampes + caisses + tabourets ----------
  const glowM = new THREE.MeshBasicMaterial({ color: '#ffe3a0', fog: false }), lamps = [];
  for (const x of [-8, -2, 4, 10]) { add(box(0.04, 0.8, 0.04), mIron, x, 3.85, 0.4, world); lamps.push(add(new THREE.SphereGeometry(0.2, 10, 8), glowM, x, 3.4, 0.4, world, { cast: false })); add(new THREE.ConeGeometry(0.36, 0.26, 10), mIron, x, 3.66, 0.4, world); }
  for (const x of [-6, -7.2]) { add(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12), mWoodD, x, 0.7, -1.4, world); add(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), mIron, x, 0.35, -1.4, world); }
  const crate = (x, z, s = 1, y = 0) => add(box(0.7 * s, 0.5 * s, 0.7 * s), mWood, x, y + 0.25 * s, z, world);
  crate(-11.5, -2.6); crate(-11.5, -2.6, 0.8, 0.5); crate(-10.6, -2.8, 0.7); crate(12, -2.6); crate(11.2, -2.9, 0.7);
  // table d'appoint à gauche avec livres, plantes derrière, armoire
  add(box(1.6, 1.6, 0.5), mWoodD, -12.1, 0.8, 1.5, world).rotation.y = 0; for (let i = 0; i < 4; i++) add(box(1.5, 0.04, 0.46), mWood, -12.1, 0.3 + i * 0.4, 1.5, world);
  add(new THREE.CylinderGeometry(0.22, 0.17, 0.35, 10), M('#c8643a'), 12.2, 0.18, 1.2, world); for (let i = 0; i < 5; i++) { const lf = add(new THREE.IcosahedronGeometry(0.24, 0), M(['#4f8a38', '#6fae45'][i % 2]), 12.2 + (r() - 0.5) * 0.3, 0.6 + r() * 0.4, 1.2 + (r() - 0.5) * 0.3, world); lf.scale.y = 1.4; }
  // ---------- hôpital : salle claire, lits, fenêtres, rideaux ----------
  const wfl = add(new THREE.PlaneGeometry(26, 15), mTile, WX, 0.004, 4, world, { cast: false }); wfl.rotation.x = -Math.PI / 2;
  add(tbox(26, 4.4, 0.4, 3), mWardWall, WX, 2.2, -3.7, world); add(tbox(26, 4.4, 0.4, 3), mWardWall, WX, 2.2, 11.2, world); add(tbox(0.4, 4.4, 15, 3), mWardWall, WX - 13.2, 2.2, 4, world); add(tbox(0.4, 4.4, 15, 3), mWardWall, WX + 13.2, 2.2, 4, world);
  const wce = add(new THREE.PlaneGeometry(26, 15), M('#f6f2e8'), WX, 4.4, 4, world, { cast: false }); wce.rotation.x = Math.PI / 2;
  add(box(26, 0.9, 0.14), M('#7fc4b0'), WX, 0.45, -3.46, world);
  for (const dx of [-7, 0, 7]) { add(box(2.4, 1.9, 0.1), new THREE.MeshBasicMaterial({ color: '#fff7dc' }), WX + dx, 2.5, -3.42, world, { cast: false }); for (const [a, b, w, h] of [[0, 0.95, 2.6, 0.12], [0, -0.95, 2.6, 0.14], [-1.2, 0, 0.12, 2.0], [1.2, 0, 0.12, 2.0], [0, 0, 0.07, 1.9]]) add(box(w, h, 0.14), mWhite, WX + dx + a, 2.5 + b, -3.36, world, { cast: false });
    for (const s of [-1, 1]) add(box(0.7, 2.1, 0.08), M('#8fc8e8'), WX + dx + s * 1.45, 2.4, -3.3, world, { cast: false }); }
  const bed = (x, z) => { add(box(1.0, 0.1, 2.1), mIron, x, 0.5, z, world); add(box(0.96, 0.2, 2.0), mWhite, x, 0.66, z, world); add(box(0.9, 0.12, 0.42), M('#fffdf6'), x, 0.82, z - 0.7, world); add(box(1.0, 0.7, 0.06), mIron, x, 0.85, z - 1.05, world); for (const sx of [-0.45, 0.45]) add(box(0.05, 0.5, 0.05), mIron, x + sx, 0.25, z + 0.95, world); add(box(0.96, 0.08, 1.2), M('#8fc8e8'), x, 0.78, z + 0.15, world); };
  for (const dx of [-10, -7, -4, -1.7, 1.7, 4, 7, 10]) bed(WX + dx, -2.2);
  for (const dx of [-11, 11]) { add(box(0.9, 1.7, 0.5), M('#cfd8d6'), WX + dx, 0.85, -3.0, world); }
  const wlamps = [];
  for (const x of [-6, 0, 6]) { add(box(0.04, 0.7, 0.04), mIron, WX + x, 4.0, 0.4, world); wlamps.push(add(new THREE.SphereGeometry(0.22, 10, 8), glowM, WX + x, 3.6, 0.4, world, { cast: false })); }
  const clouds = [];
  function state(S, f) {
    const gl = S.glow ?? 1; lamps.forEach((m, i) => m.scale.setScalar(0.92 + 0.08 * gl * Math.sin(f * 0.3 + i))); wlamps.forEach((m, i) => m.scale.setScalar(0.94 + 0.06 * Math.sin(f * 0.25 + i)));
    flame.scale.y = 0.8 + 0.3 * Math.sin(f * 1.3); flame.visible = !(S.noFlame);
    const mold = Math.round((S.mold ?? 0) * 40) / 40, clear = Math.round((S.clear ?? 0) * 40) / 40, key = mold + '_' + clear;
    if (key !== lastKey) { lastKey = key; const c = bacT(mold, clear); heroTex.image = c; heroTex.needsUpdate = true; }
    const lid = S.lid ?? 0; hero.lid.position.set(lid * 0.78, lid * 0.005, lid * 0.22); hero.lid.rotation.z = -lid * 0.05;
    DISHES.forEach((d, i) => { const k = S.dishes ?? 1, v = Math.max(0, Math.min(1, k * 7 - i)); dishes[i].g.visible = v > 0.01; dishes[i].g.scale.setScalar(0.4 + 0.6 * Math.min(1, v * 1.2)); dishes[i].lid.position.set((i % 2 ? 0.5 : -0.5) * (S.lidsOff ?? 1), 0.012 * (S.lidsOff ?? 1), 0.25 * (S.lidsOff ?? 1)); dishes[i].lid.rotation.z = (i % 2 ? -1 : 1) * 0.14 * (S.lidsOff ?? 1); });
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
