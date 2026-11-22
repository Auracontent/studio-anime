// Library set: Japon médiéval. Deux lieux dans la même scène.
//  - Plage de Hakata (origine) : sable, mur de pierre de 1276, pins, tentures de camp (maku), bannières, bateaux, mer, ponton. DECK = 0.
//    Les caméras regardent depuis +z vers -z (le mur) ou depuis -z vers +z (la mer et le navire mongol, yaw ~180).
//  - Salle du rouleau (x = IX = 3000) : atelier de peintre à tatamis, parois shoji, poutres, lanternes. Rouleau sur chevalet au centre.
// state(S, f) : boom 0..1 (l'explosion peinte sur le rouleau), ballOn 0..1 (la vraie bombe sur son socle), flame 0..1 (lanternes).
export const DECK = 0, IX = 3000;
export const SPOTS = { beach: [0, 0, 0], sea: [0, -0.4, 30], jetty: [2, 0, 8], scroll: [IX - 0.1, 1.6, -0.9], boom: [IX + 0.4, 1.55, -0.86], ball: [IX + 0.0, 0.95, 0.05] };
export const BOAT = [3.5, 0, 10];       // le bateau de plongée amarré

/** étoile d'explosion peinte (forme plate) */
const starShape = (THREE, n, ro, ri, seed = 1) => {
  const s = new THREE.Shape(); const k = (i) => 0.78 + 0.35 * Math.abs(Math.sin(i * 12.9898 + seed * 4.1));
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = (i % 2 ? ri : ro * k(i)); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  s.closePath(); return s;
};

export function buildKamakura(ctx) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const r = P.rng(1281);
  const M = (c) => toon({ color: c });
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const INK = '#271925';
  // ---------- textures ----------
  const sandC = cv(512, 512, (g, w, h) => { g.fillStyle = '#e6cf9c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${170 + r() * 60 | 0},${140 + r() * 50 | 0},${90 + r() * 40 | 0},0.35)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 24; k++) { g.strokeStyle = 'rgba(190,150,90,0.4)'; g.lineWidth = 3; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y - 14, w * 0.6, y + 14, w, y); g.stroke(); } });
  const seaC = cv(512, 512, (g, w, h) => { g.fillStyle = '#3b9fb6'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 240; k++) { g.strokeStyle = `rgba(220,255,255,${0.25 + r() * 0.3})`; g.lineWidth = 2 + r() * 3; const x = r() * w, y = r() * h, l = 14 + r() * 30; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); } });
  const tatamiC = cv(512, 512, (g, w, h) => { g.fillStyle = '#c9c07a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 6) { g.fillStyle = `rgba(${120 + r() * 40 | 0},${130 + r() * 30 | 0},60,0.18)`; g.fillRect(0, y, w, 3); }
    g.fillStyle = '#2f3a24'; g.fillRect(0, 0, w, 8); g.fillRect(0, h / 2 - 4, w, 8); g.fillRect(0, 0, 8, h); g.fillRect(w / 2 - 4, 0, 8, h / 2); g.fillRect(w - 8, 0, 8, h); g.fillRect(w / 4 * 3 - 4, h / 2, 8, h / 2); });
  const shojiC = cv(512, 512, (g, w, h) => { g.fillStyle = '#f4ecd2'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 160; k++) { g.fillStyle = `rgba(210,190,140,${0.1 + r() * 0.1})`; g.fillRect(r() * w, r() * h, 6 + r() * 20, 2); }
    g.fillStyle = '#4a3020'; for (let i = 0; i <= 4; i++) { g.fillRect(i * (w - 10) / 4, 0, 10, h); g.fillRect(0, i * (h - 10) / 4, w, 10); } });
  const woodC = cv(256, 256, (g, w, h) => { g.fillStyle = '#6a4630'; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(40,24,14,${0.15 + r() * 0.2})`; g.lineWidth = 1 + r() * 2; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 8, h * 0.3, x - 8, h * 0.6, x + 3, h); g.stroke(); } });
  const stripeC = cv(256, 128, (g, w, h) => { g.fillStyle = '#f2ecdc'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f2a44'; for (let i = 0; i < 4; i++) g.fillRect(i * 64 + 8, 0, 24, h); });
  // the scroll painting (ink and light colour wash): hills, mist, pines, horsemen, arrows, a Mongol ship
  const scrollC = cv(1024, 640, (g, w, h) => {
    g.fillStyle = '#f1e3bd'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(200,170,110,${0.06 + r() * 0.08})`; g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 30, 3 + r() * 8, r() * 3, 0, 6.283); g.fill(); }
    g.fillStyle = 'rgba(120,160,170,0.55)'; g.beginPath(); g.moveTo(0, 360); for (let x = 0; x <= w; x += 64) g.lineTo(x, 340 + Math.sin(x * 0.02) * 12); g.lineTo(w, 470); g.lineTo(0, 470); g.fill();    // sea wash
    g.strokeStyle = INK; g.lineWidth = 6; g.lineJoin = 'round'; g.lineCap = 'round';
    g.fillStyle = 'rgba(90,110,100,0.5)'; g.beginPath(); g.moveTo(0, 340); g.lineTo(160, 190); g.lineTo(300, 300); g.lineTo(430, 170); g.lineTo(600, 330); g.lineTo(600, 340); g.fill(); g.stroke();     // hills
    g.fillStyle = 'rgba(255,255,255,0.7)'; for (const x of [120, 460, 800]) { g.beginPath(); g.ellipse(x, 360, 120, 18, 0, 0, 6.283); g.fill(); }
    // mongol ship (left), sail with stripes
    g.fillStyle = '#7a5130'; g.beginPath(); g.moveTo(40, 400); g.lineTo(250, 400); g.lineTo(220, 440); g.lineTo(70, 440); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(145, 400); g.lineTo(145, 250); g.stroke();
    g.fillStyle = '#d8c9a0'; g.beginPath(); g.moveTo(150, 260); g.lineTo(235, 280); g.lineTo(225, 380); g.lineTo(150, 390); g.closePath(); g.fill(); g.stroke();
    // samurai horsemen (right)
    const horse = (x, y, s, col) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#6a4a38'; g.beginPath(); g.ellipse(0, 0, 60, 30, 0, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.moveTo(45, -10); g.lineTo(75, -55); g.lineTo(95, -45); g.lineTo(60, 5); g.fill(); g.stroke();
      for (const lx of [-40, -20, 25, 45]) { g.beginPath(); g.moveTo(lx, 20); g.lineTo(lx + (lx > 0 ? 8 : -8), 75); g.stroke(); }
      g.fillStyle = col; g.fillRect(-18, -75, 36, 50); g.strokeRect(-18, -75, 36, 50); g.fillStyle = '#f0c8a0'; g.beginPath(); g.arc(0, -92, 17, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#2a2a36'; g.beginPath(); g.arc(0, -98, 18, Math.PI, 0); g.fill(); g.stroke(); g.restore(); };
    horse(700, 500, 1.4, '#c8402a'); horse(900, 520, 1.2, '#2a5aa0'); horse(540, 540, 1.1, '#d8a020');
    g.lineWidth = 3; for (let i = 0; i < 14; i++) { const x = 260 + i * 18, y = 120 + (i % 5) * 18; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 70, y + 30); g.stroke(); }    // arrows
    g.lineWidth = 6; for (const x of [850, 960]) { g.fillStyle = '#2f5a3a'; g.beginPath(); g.moveTo(x, 330); g.lineTo(x - 40, 400); g.lineTo(x + 40, 400); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x, 400); g.lineTo(x, 440); g.stroke(); }
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24);
  });
  const mSand = toon({ map: P.tex(sandC, 40, 40) }), mSea = toon({ map: P.tex(seaC, 300, 300) }), mTatami = toon({ map: P.tex(tatamiC, 10, 5) });
  const mShoji = toon({ map: P.tex(shojiC, 1, 1) }), mWood = toon({ map: P.tex(woodC, 1, 1) }), mStone = toon({ map: P.tex(P.stone(7, 36, 8, 62), 8, 1) });
  const mCream = M('#efe6cf'), mDark = M('#2f3440'), mRed = M('#b8322f'), mGold = M('#d9a845'), mWood2 = M('#5a3b22');
  const mPaper = new THREE.MeshBasicMaterial({ color: '#fff0c0', fog: false });
  // ---------- beach (origin) ----------
  const water = add(new THREE.PlaneGeometry(4000, 4000), mSea, 0, -0.4, 0, world, { cast: false }); water.rotation.x = -Math.PI / 2;
  const sand = add(new THREE.PlaneGeometry(300, 80), mSand, 0, 0, -35, world, { cast: false }); sand.rotation.x = -Math.PI / 2;      // z -75 .. 5
  { const wet = add(new THREE.PlaneGeometry(300, 1.4), M('#c9b07a'), 0, 0.01, 4.3, world, { cast: false }); wet.rotation.x = -Math.PI / 2; }
  // stone wall of 1276 (genkō bōrui) behind the camp
  add(tbox(120, 2.6, 1.4, 2), mStone, 0, 1.3, -9, world); add(box(120, 0.25, 1.8), M('#8a8070'), 0, 2.7, -9, world);
  for (let i = -12; i <= 12; i++) add(box(0.9, 0.5, 1.9), M('#7a7060'), i * 4.6, 3.0, -9, world);
  // pines on the dunes behind the wall
  const pine = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.2 * s, 0.34 * s, 3.4 * s, 7), M('#5a3b26'), 0, 1.7 * s, 0, g);
    for (let i = 0; i < 4; i++) { const c = add(new THREE.ConeGeometry((1.7 - i * 0.3) * s, 1.5 * s, 8), M(i % 2 ? '#2f5a3a' : '#3b6e44'), 0, (3.3 + i * 0.95) * s, 0, g); c.rotation.y = r() * 3; } return g; };
  for (let i = 0; i < 26; i++) pine(-60 + r() * 120, -13 - r() * 24, 1.2 + r() * 1.4);
  // camp: striped maku curtains between posts, banners
  const maku = (x0, x1, z, h = 1.9) => { const n = Math.round(Math.abs(x1 - x0) / 2.4), w = Math.abs(x1 - x0) / n;
    for (let i = 0; i <= n; i++) add(new THREE.CylinderGeometry(0.07, 0.07, h + 0.8, 6), mWood2, x0 + i * w, (h + 0.8) / 2, z, world);
    for (let i = 0; i < n; i++) { const pl = add(new THREE.PlaneGeometry(w * 0.98, h), toon({ map: P.tex(stripeC, 1.5, 1), side: THREE.DoubleSide }), x0 + (i + 0.5) * w, h / 2 + 0.55, z + Math.sin(i * 1.7) * 0.12, world, { cast: false }); pl.rotation.y = Math.sin(i * 2.3) * 0.08; } };
  maku(-14, 14, -4.2);
  const banner = (x, z, col, h = 4.6) => { add(new THREE.CylinderGeometry(0.06, 0.07, h, 6), mWood2, x, h / 2, z, world); add(box(0.8, 3.2, 0.04), M(col), x + 0.45, h - 1.8, z, world); add(box(0.8, 0.12, 0.05), mWood2, x + 0.45, h - 0.2, z, world); add(box(0.8, 0.1, 0.05), mGold, x + 0.45, h - 3.35, z, world); };
  banner(-7, -3.2, '#b8322f'); banner(-3, -3.4, '#f2ecdc'); banner(5, -3.3, '#b8322f'); banner(9, -3.1, '#1f2a44'); banner(-11, -3, '#e0a020');
  { const sg = cv(1024, 256, (g, w, h) => { g.fillStyle = '#f3ead2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3b2a20'; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18); g.fillStyle = '#3b2a20'; g.font = '800 128px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TAKASHIMA', w / 2, h / 2 + 8, w - 70); });
    add(box(0.16, 2.6, 0.16), mWood2, -3.3, 1.3, 3.2, world); add(box(0.16, 2.6, 0.16), mWood2, -0.7, 1.3, 3.2, world); add(box(3.2, 0.9, 0.1), mWood2, -2.0, 2.2, 3.18, world); add(new THREE.PlaneGeometry(3.0, 0.75), toon({ map: P.tex(sg, 1, 1) }), -2.0, 2.2, 3.25, world, { cast: false }); }
  // sea: moored dive boat (deck at y = 0.35), Mongol ship far out, jetty and little wooden boats
  const bt = new THREE.Group(); bt.position.set(...BOAT); world.add(bt);
  add(box(5.6, 0.7, 2.6), M('#e8e2d2'), 0, 0.0, 0, bt); add(box(5.8, 0.12, 2.8), M('#2a6aa8'), 0, 0.38, 0, bt); add(box(1.4, 1.4, 1.2), M('#e8e2d2'), -1.9, 1.1, -0.3, bt); add(box(1.5, 0.12, 1.3), M('#c8312c'), -1.9, 1.85, -0.3, bt);
  for (const x of [-0.5, 0.5, 1.5]) add(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 10), M('#2f6fa8'), x, 0.85, -0.95, bt);        // air tanks
  const ship = new THREE.Group(); ship.position.set(14, -0.25, 34); ship.rotation.y = 0.5; world.add(ship);
  add(box(12, 1.6, 3.4), M('#7a5130'), 0, 0.4, 0, ship); add(box(13, 0.3, 3.8), M('#5a3b22'), 0, 1.3, 0, ship); add(box(2.2, 2.2, 3), M('#8a6038'), -4.6, 2.2, 0, ship); add(box(0.2, 8, 0.2), mWood2, 0.5, 5.4, 0, ship);
  { const sl = add(new THREE.PlaneGeometry(5.4, 6.2), toon({ map: P.tex(stripeC, 3, 3), side: THREE.DoubleSide, color: '#e8d8a8' }), 0.5, 5.8, 0, ship); sl.rotation.y = Math.PI / 2; }
  const ship2 = ship.clone(); ship2.position.set(-30, -0.25, 52); ship2.rotation.y = -0.3; ship2.scale.setScalar(1.2); world.add(ship2);
  add(box(8, 0.25, 1.7), mWood2, 3, 0.1, 6.3, world); for (let i = 0; i < 5; i++) add(box(0.22, 1.5, 0.22), mWood2, -0.2 + i * 1.6, -0.5, 5.5, world);
  { const b = new THREE.Group(); b.position.set(-9, -0.2, 9); b.rotation.y = 0.5; world.add(b); add(box(4, 0.6, 1.4), M('#8a5d38'), 0, 0.2, 0, b); add(box(4.2, 0.1, 1.6), mCream, 0, 0.52, 0, b); }
  // ---------- scroll room (x = IX) ----------
  const X = (x) => IX + x;
  const fl = add(new THREE.PlaneGeometry(40, 20), mTatami, X(0), 0.005, 0, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  add(tbox(40, 4.4, 0.4, 3), mShoji, X(0), 2.2, -4.6, world); add(tbox(0.4, 4.4, 20, 3), mShoji, X(-10), 2.2, 0, world); add(tbox(0.4, 4.4, 20, 3), mShoji, X(10), 2.2, 0, world);
  add(box(40, 0.3, 0.6), mWood2, X(0), 4.3, -4.5, world); add(box(40, 0.25, 0.5), mWood2, X(0), 0.12, -4.45, world); add(box(40, 0.3, 0.5), mWood2, X(0), 3.2, -4.45, world);
  for (let i = -8; i <= 8; i++) add(box(0.28, 4.4, 0.4), mWood2, X(i * 2.5), 2.2, -4.35, world);                         // pillars
  const ceil = add(new THREE.PlaneGeometry(40, 20), toon({ map: P.tex(woodC, 12, 6) }), X(0), 4.6, 0, world, { cast: false }); ceil.rotation.x = Math.PI / 2;
  for (let i = -6; i <= 6; i++) add(box(0.3, 0.4, 20), mWood2, X(i * 3), 4.3, 0, world, { cast: false });
  // andon lanterns (paper lamps), cushions, low tables, scroll racks, alcove with vase, folding screen
  const lamp = (x, z) => { add(box(0.5, 0.06, 0.5), mWood2, X(x), 0.03, z, world); add(box(0.4, 0.8, 0.4), mPaper, X(x), 0.5, z, world, { cast: false }); add(box(0.5, 0.08, 0.5), mWood2, X(x), 0.95, z, world); };
  for (const [x, z] of [[-5, -2.6], [4.5, -2.8], [-2.6, 1.6], [8, -1], [-8, 0.5], [2.8, 2.2], [6.4, 1.8]]) lamp(x, z);
  const cush = (x, z, c) => { const m = add(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 14), M(c), X(x), 0.06, z, world); m.rotation.y = r(); };
  for (const [x, z, c] of [[-3, 1.4, '#a8322f'], [-3.9, 2, '#2a5aa0'], [3.6, 1.5, '#e0a020'], [5, 2.2, '#3f7a5a'], [-6.5, 1.2, '#a8322f'], [7.2, 1.0, '#2a5aa0']]) cush(x, z, c);
  const lowTable = (x, z) => { add(box(1.4, 0.07, 0.8), M('#3a2418'), X(x), 0.42, z, world); for (const sx of [-0.6, 0.6]) for (const sz of [-0.3, 0.3]) add(box(0.07, 0.4, 0.07), mWood2, X(x + sx), 0.2, z + sz, world); };
  lowTable(-6, -1.5); lowTable(7, -2);
  const rack = (x) => { add(box(1.2, 1.9, 0.5), mWood2, X(x), 0.95, -4.0, world); for (let k = 0; k < 4; k++) { add(box(1.1, 0.05, 0.5), M('#8a5d38'), X(x), 0.3 + k * 0.5, -4.0, world); for (let j = 0; j < 3; j++) { const sc = add(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), M(['#e8dcc0', '#d9c9a0', '#c8402a'][j]), X(x - 0.35 + j * 0.35), 0.45 + k * 0.5, -4.0, world); sc.rotation.z = Math.PI / 2; } } };
  rack(-8.2); rack(8.4); rack(-1.8 - 4); 
  { add(box(2.4, 0.18, 1.3), mWood2, X(-4.5 + 12), 0.09, -3.7, world); add(new THREE.CylinderGeometry(0.2, 0.15, 0.7, 10), M('#2a5aa0'), X(7.5), 0.55, -3.7, world); for (let i = 0; i < 5; i++) { const br = add(new THREE.CylinderGeometry(0.02, 0.02, 0.9 + r() * 0.5, 4), M('#5a3b22'), X(7.4 + (r() - 0.5) * 0.3), 1.4, -3.7, world); br.rotation.z = (i - 2) * 0.25; } }
  for (let i = 0; i < 4; i++) { const pn = add(new THREE.PlaneGeometry(1.0, 1.7), toon({ color: ['#c8402a', '#2a5aa0', '#e0a020', '#3f7a5a'][i], side: THREE.DoubleSide }), X(-8.2 + i * 1.0), 0.9, -3.0 - (i % 2) * 0.25, world, { cast: false }); pn.rotation.y = (i % 2 ? 0.4 : -0.4); }
  // the scroll on its stand: two posts, top bar, the painted sheet, rolled ends
  const SC = SPOTS.scroll;
  add(box(0.12, 2.5, 0.12), mWood2, SC[0] - 1.45, 1.25, SC[2] - 0.05, world); add(box(0.12, 2.5, 0.12), mWood2, SC[0] + 1.45, 1.25, SC[2] - 0.05, world); add(box(3.2, 0.1, 0.1), mWood2, SC[0], 2.45, SC[2] - 0.05, world); add(box(3.2, 0.1, 0.12), mWood2, SC[0], 0.8, SC[2] - 0.02, world);
  add(box(2.8, 1.7, 0.05), toon({ map: P.tex(scrollC, 1, 1) }), SC[0], SC[1] + 0.02, SC[2], world, { cast: false });
  for (const sy of [SC[1] - 0.9, SC[1] + 0.9]) { const ro = add(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 10), mGold, SC[0], sy, SC[2] + 0.02, world); ro.rotation.z = Math.PI / 2; }
  // the painted explosion on the scroll (grows with state.boom)
  const boomG = new THREE.Group(); boomG.position.set(...SPOTS.boom); world.add(boomG);
  { const m1 = new THREE.Mesh(new THREE.ShapeGeometry(starShape(THREE, 11, 0.62, 0.3, 1)), new THREE.MeshBasicMaterial({ color: INK })); m1.scale.setScalar(1.08); m1.position.z = 0.0; m1.userData.ndSkip = true; boomG.add(m1);
    const m2 = new THREE.Mesh(new THREE.ShapeGeometry(starShape(THREE, 11, 0.6, 0.28, 1)), new THREE.MeshBasicMaterial({ color: '#ff6a1a' })); m2.position.z = 0.004; m2.userData.ndSkip = true; boomG.add(m2);
    const m3 = new THREE.Mesh(new THREE.ShapeGeometry(starShape(THREE, 9, 0.38, 0.17, 3)), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); m3.position.z = 0.008; m3.userData.ndSkip = true; boomG.add(m3);
    const m4 = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), new THREE.MeshBasicMaterial({ color: '#fff6c0' })); m4.position.z = 0.012; m4.userData.ndSkip = true; boomG.add(m4); }
  // the real bomb on a little stand, in front of the scroll (grows with state.ballOn): glazed ceramic sphere, band, neck, studs
  const ballG = new THREE.Group(); ballG.position.set(...SPOTS.ball); world.add(ballG);
  { add(new THREE.CylinderGeometry(0.1, 0.16, 0.64, 10), mWood2, 0, -0.63, 0, ballG); add(new THREE.CylinderGeometry(0.34, 0.2, 0.1, 12), mWood2, 0, -0.34, 0, ballG); add(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12), mRed, 0, -0.3, 0, ballG);
    add(new THREE.SphereGeometry(0.3, 18, 14), M('#7a4a2e'), 0, 0, 0, ballG); add(new THREE.TorusGeometry(0.3, 0.035, 6, 24), M('#c9a060'), 0, 0.02, 0, ballG).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 10), M('#5a3a24'), 0, 0.33, 0, ballG); add(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5), M('#e8d8a0'), 0, 0.5, 0, ballG);
    for (let i = 0; i < 12; i++) { const a = i * 0.9, b = Math.acos(1 - ((i + 0.5) / 12) * 1.7); const s = add(new THREE.SphereGeometry(0.035, 6, 5), M('#c9a060'), Math.sin(b) * Math.cos(a) * 0.3, Math.cos(b) * 0.3, Math.sin(b) * Math.sin(a) * 0.3, ballG); } }
  // dress the beach and the room (a few props everywhere, never empty)
  const flames = [];
  // clouds for the beach skies
  const clouds = [];
  { const rr = P.rng(93); for (let i = 0; i < 10; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 120 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  function state(S, f) {
    const b = Math.max(0, Math.min(1, S.boom ?? 1)); boomG.visible = b > 0.01; boomG.scale.setScalar(Math.max(0.01, b)); boomG.rotation.z = (1 - b) * 0.6;
    const k = Math.max(0, Math.min(1, S.ballOn ?? 0)); ballG.visible = k > 0.01; ballG.scale.setScalar(Math.max(0.01, k));
    bt.position.y = S.boatY ?? -0.25; bt.rotation.z = S.boatRoll ?? 0;
  }
  return { DECK, SPOTS, clouds, state, water, boat: bt };
}
