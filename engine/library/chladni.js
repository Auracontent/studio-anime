// Library set « Chladni » (début XIXe) : six lieux alignés sur x (40 m d'écart, caméras côté +z, regardant -z) :
//   cab    (x = 0)   cabinet de Chladni : table, plaque de métal sur pied, sable, archet, hautes fenêtres dorées
//   salon  (x = 40)  salon doré de l'Empire : tapis rouge, colonnes, lustre, petite table avec la plaque
//   acad   (x = 80)  salle de l'Académie : dallage, colonnes, table verte, sacs de pièces, tableaux de calculs
//   rue    (x = 120) façade de l'université, grande porte fermée, marches, réverbère, soir
//   chambre(x = 160) chambre de Sophie : lit, étagère de livres, bureau, bougie
//   pont   (x = 200) pont métallique au grand air (ingénieurs) qui vibre
// state(S, f) : S.sand = { a, b, t, hop } (motif de départ 0-2 ou 3 = sable éparpillé, motif d'arrivée, mélange 0..1, agitation 0..1),
//   S.bow = { u, on } (position de l'archet le long du bord, contact), S.flame (0..1), S.deck (vibration du pont), S.coins (0..1 pièces visibles).
import { propKit } from './props.js';
export const DECK = 0;
export const ZX = { cab: 0, salon: 40, acad: 80, rue: 120, chambre: 160, pont: 200 };
export const PLATE = { y: 1.42, z: 0.15, tilt: 0.95, size: 1.0 };   // plaque inclinée vers la caméra, centre à (ZX.cab, y, z)

export function buildChladni(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const M = (c) => toon({ color: c }), K = propKit(ctx, { seed: 1809 }), r = P.rng(1809);
  const mWoodD = M('#5a2e22'), mWood = M('#8a4a32'), mBrass = M('#e0b040'), mIron = M('#2f3440'), mGold = M('#e8b838'), mStone = M('#d8cdb8'), mStoneD = M('#b0a48c');
  const glowM = new THREE.MeshBasicMaterial({ color: '#ffe3a0', fog: false });
  const checker = (c1, c2, n = 8) => cv(512, 512, (g, w, h) => { const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? c1 : c2; g.fillRect(i * s, j * s, s, s); } g.strokeStyle = 'rgba(40,30,30,0.35)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } });
  const parquet = (cols) => cv(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(i * 64, 0, 64, h); g.fillStyle = 'rgba(60,34,18,0.65)'; g.fillRect(i * 64, 0, 3, h); }
    for (let k = 0; k < 36; k++) { g.fillStyle = 'rgba(60,34,18,0.65)'; g.fillRect(r() * w, Math.floor(r() * 4) * 128, 64, 3); } for (let k = 0; k < 140; k++) { g.fillStyle = 'rgba(100,60,30,0.16)'; g.fillRect(r() * w, r() * h, 2, 6 + r() * 30); } });
  const wallTex = (base, hi) => cv(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = hi; g.fillRect(x, 0, 32, h); } for (let k = 0; k < 260; k++) { g.fillStyle = 'rgba(120,80,50,0.12)'; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); } });

  // ---------- pièce générique : sol, 3 murs, plafond ----------
  function room(cx, { floor, wall, ceil = '#f0e2c4', W = 24, h = 4.4, tint = '#7a3a2a' }) {
    const fl = add(new THREE.PlaneGeometry(W, 14), toon({ map: P.tex(floor, W / 4, 3.5) }), cx, 0.004, 2.85, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const wm = toon({ map: P.tex(wall, W / 3, 1.6) });
    add(tbox(W, h, 0.4, 3), wm, cx, h / 2, -4.2, world); add(tbox(W, h, 0.4, 3), wm, cx, h / 2, 9.9, world);
    add(tbox(0.4, h, 14, 3), wm, cx - W / 2, h / 2, 2.85, world); add(tbox(0.4, h, 14, 3), wm, cx + W / 2, h / 2, 2.85, world);
    const ce = add(new THREE.PlaneGeometry(W, 14), M(ceil), cx, h, 2.85, world, { cast: false }); ce.rotation.x = Math.PI / 2;
    add(box(W, 1.0, 0.16), M(tint), cx, 0.5, -3.94, world); add(box(W, 0.1, 0.22), mWoodD, cx, 1.04, -3.9, world); add(box(W, 0.16, 0.22), mWoodD, cx, h - 0.1, -3.9, world);
  }
  const window_ = (x, y, z = -3.84, w = 2.0, hh = 2.7, curt = '#8a2a32') => { add(box(w, hh, 0.1), glowM, x, y, z, world, { cast: false });
    for (const [dx, dy, ww, hhh] of [[0, 0, w + 0.2, 0.1], [0, hh * 0.33, w + 0.2, 0.1], [0, -hh * 0.33, w + 0.2, 0.1], [-w / 2, 0, 0.12, hh + 0.2], [w / 2, 0, 0.12, hh + 0.2], [0, 0, 0.08, hh]]) add(box(ww, hhh, 0.14), mWoodD, x + dx, y + dy, z + 0.04, world, { cast: false });
    if (curt) for (const s of [-1, 1]) add(box(0.5, hh + 0.2, 0.16), M(curt), x + s * (w / 2 + 0.3), y, z + 0.1, world); };
  const column = (x, z, h = 4.3, col = mStone) => { add(new THREE.CylinderGeometry(0.34, 0.38, h, 14), col, x, h / 2, z, world); add(box(0.9, 0.2, 0.9), mStoneD, x, 0.1, z, world); add(box(0.9, 0.22, 0.9), mStoneD, x, h - 0.1, z, world); };
  const chandelier = (x, y, z) => { add(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 5), mIron, x, y + 0.6, z, world, { cast: false }); add(new THREE.TorusGeometry(0.5, 0.04, 6, 20), mGold, x, y, z, world, { cast: false }).rotation.x = Math.PI / 2;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; add(new THREE.SphereGeometry(0.07, 8, 6), glowM, x + Math.cos(a) * 0.5, y + 0.1, z + Math.sin(a) * 0.5, world, { cast: false }); } };

  // ---------- la plaque de Chladni : sable dessiné sur un canvas partagé ----------
  const NG = 2400, CS = 1024;
  // trois figures (distance à la ligne nodale, coordonnées centrées -1..1) : étoile à 8 branches, carrés + diagonales, fleur à 12 branches
  const lineD = (X, Y, a) => Math.abs(X * Math.sin(a) - Y * Math.cos(a));
  const U = [(X, Y) => Math.min(Math.abs(Math.hypot(X, Y) - 0.62), ...[0, 1, 2, 3].map((k) => lineD(X, Y, (k * Math.PI) / 4))),
    (X, Y) => { const m = Math.max(Math.abs(X), Math.abs(Y)); return Math.min(Math.abs(m - 0.3), Math.abs(m - 0.72), lineD(X, Y, Math.PI / 4), lineD(X, Y, -Math.PI / 4)); },
    (X, Y) => { const rr = Math.hypot(X, Y); return Math.min(Math.abs(rr - 0.3), Math.abs(rr - 0.78), ...[0, 1, 2, 3, 4, 5].map((k) => lineD(X, Y, (k * Math.PI) / 6))); }];
  const grains = Array.from({ length: NG }, () => ({ p: [], ph: r() * 6.28 }));
  for (const gr of grains) { for (let k = 0; k < 3; k++) { let x, y, n = 0; do { x = r(); y = r(); n++; } while (U[k]((x - 0.5) * 2, (y - 0.5) * 2) > 0.022 && n < 6000); gr.p.push([x, y]); } gr.p.push([r(), r()]); }
  const sandC = document.createElement('canvas'); sandC.width = sandC.height = CS; const sg = sandC.getContext('2d');
  const sandT = P.tex(sandC, 1, 1); let lastKey = '';
  const drawSand = (s, f) => {
    const key = [s.a, s.b, Math.round(s.t * 100), Math.round(s.hop * 100), s.n ?? NG, f].join(); if (key === lastKey) return; lastKey = key;
    sg.fillStyle = '#5f7ab0'; sg.fillRect(0, 0, CS, CS); sg.fillStyle = '#7e98c8'; sg.fillRect(0, 0, CS, 14); sg.fillRect(0, CS - 14, CS, 14); sg.fillRect(0, 0, 14, CS); sg.fillRect(CS - 14, 0, 14, CS);
    for (let i = 0; i < 40; i++) { sg.fillStyle = 'rgba(255,255,255,0.05)'; sg.fillRect(((i * 197) % CS), ((i * 113) % CS), 180, 5); }
    const t = s.t * s.t * (3 - 2 * s.t), n = Math.min(NG, s.n ?? NG), hop = s.hop;
    for (let i = 0; i < n; i++) { const gr = grains[i], A = gr.p[s.a], B = gr.p[s.b];
      let x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t;
      if (hop > 0) { const j = 0.05 * hop; x += j * Math.sin(f * 0.9 + gr.ph * 3); y += j * Math.cos(f * 1.1 + gr.ph * 5); }
      x = Math.min(0.985, Math.max(0.015, x)); y = Math.min(0.985, Math.max(0.015, y));
      const lift = hop > 0 ? 6 * hop * Math.max(0, Math.sin(f * 0.7 + gr.ph * 7)) : 0;
      sg.fillStyle = lift > 1.2 ? '#ffffff' : i % 3 ? '#ffe39a' : '#f3c864'; const rr = 6.2 + lift; sg.fillRect(x * CS - rr / 2, y * CS - rr / 2 - lift, rr, rr); }
    sandT.needsUpdate = true; };
  drawSand({ a: 3, b: 3, t: 0, hop: 0 }, 0);
  const plateMat = toon({ map: sandT });
  const makePlate = (x, y, z, size, tilt, stand = true) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.x = tilt; world.add(g);
    add(box(size, 0.03, size), M('#8da0b8'), 0, 0, 0, g);
    const top = add(new THREE.PlaneGeometry(size, size), plateMat, 0, 0.0165, 0, g, { cast: false }); top.rotation.x = -Math.PI / 2; top.rotation.z = 0;
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12), mBrass, 0, -0.04, 0, g);   // vis de serrage au centre
    if (stand) { const st = new THREE.Group(); st.position.set(x, 0, z - 0.05); world.add(st);
      add(new THREE.CylinderGeometry(0.05, 0.07, y - 0.1, 10), mWoodD, 0, (y - 0.1) / 2, 0, st); add(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 16), mWoodD, 0, 0.04, 0, st); }
    return g; };

  // ---------- 1. cabinet de Chladni ----------
  const cx0 = ZX.cab;
  room(cx0, { floor: parquet(['#d9a96c', '#e2b57a', '#cf9d62', '#dcae73']), wall: wallTex('#d6a77a', 'rgba(255,230,190,0.18)') });
  for (const wx of [-5.6, 0, 5.6]) window_(cx0 + wx, 2.75, -3.84, 2.0, 2.7);
  const shelf = (x, rows = 3) => { add(box(2.4, 2.4, 0.5), mWoodD, x, 1.3, -3.55, world);
    for (let i = 0; i < rows; i++) { const y = 0.5 + i * 0.75; add(box(2.3, 0.06, 0.46), mWood, x, y, -3.5, world);
      for (let j = 0; j < 4; j++) { const k = (i * 3 + j) % 4, px = x - 0.85 + j * 0.57, pz = -3.46;
        if (k === 0) add(new THREE.SphereGeometry(0.17, 12, 8), mBrass, px, y + 0.2, pz, world);
        else if (k === 1) add(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 10), M(['#e8a0c0', '#8fd36a', '#7fc4f0'][j % 3]), px, y + 0.2, pz, world);
        else if (k === 2) add(box(0.34, 0.26, 0.26), mIron, px, y + 0.16, pz, world);
        else add(new THREE.TorusGeometry(0.15, 0.03, 6, 14), M('#d27a3e'), px, y + 0.2, pz, world); } } };
  shelf(cx0 - 10.5); shelf(cx0 - 8, 2); shelf(cx0 + 8.5); shelf(cx0 + 10.8, 2);
  // table + plaque
  add(box(2.6, 0.1, 1.3), M('#c08a5a'), cx0, 0.88, 0, world); add(box(2.4, 0.14, 1.15), mWoodD, cx0, 0.78, 0, world);
  for (const sx of [-1.15, 1.15]) for (const sz of [-0.5, 0.5]) add(box(0.12, 0.8, 0.12), mWoodD, cx0 + sx, 0.4, sz, world);
  const plateCab = makePlate(cx0, PLATE.y, PLATE.z, PLATE.size, PLATE.tilt);
  // archet : bâton de bois + mèche de crin, glisse le long du bord droit de la plaque
  const bow = new THREE.Group(); world.add(bow);
  add(new THREE.CylinderGeometry(0.014, 0.014, 0.8, 6), M('#7a4a2a'), 0, 0.4, 0, bow); add(box(0.04, 0.05, 0.05), M('#2a1a12'), 0, 0.02, 0, bow);
  add(box(0.012, 0.74, 0.03), M('#f6efd8'), 0.06, 0.4, 0, bow, { cast: false }); add(box(0.04, 0.04, 0.04), mBrass, 0, 0.78, 0, bow);
  // petits objets de cabinet
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 10), M('#e8f0f8'), cx0 - 0.95, 1.05, 0.2, world);   // pot de sable
  add(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10), M('#f3c864'), cx0 - 0.95, 1.18, 0.2, world);
  add(box(0.5, 0.05, 0.4), M('#ece2c8'), cx0 + 0.85, 0.94, 0.15, world);   // feuille
  for (const [px, py, pz] of [[cx0 - 9, 0, 3], [cx0 + 9, 0, 3.5]]) { add(new THREE.CylinderGeometry(0.06, 0.1, 0.9, 10), mBrass, px, 0.55, pz, world); add(new THREE.SphereGeometry(0.42, 18, 14), M('#6fa8d8'), px, 1.35, pz, world); }
  for (const x of [-6, 0, 6]) { add(box(0.04, 0.9, 0.04), mIron, cx0 + x, 3.95, 1.2, world); add(new THREE.SphereGeometry(0.2, 10, 8), glowM, cx0 + x, 3.4, 1.2, world, { cast: false }); add(new THREE.ConeGeometry(0.36, 0.26, 10), mIron, cx0 + x, 3.68, 1.2, world); }
  K.crate(cx0 - 11.2, -2.6, { s: 0.8 }); K.crate(cx0 - 11.2, -2.6, { s: 0.55, y: 0.8 }); K.barrel(cx0 + 11.5, -2.7); K.sack(cx0 + 11.4, -1.8); K.pot(cx0 - 6.3, -3.4); K.pot(cx0 + 7.4, -3.4); K.pot(cx0 + 2.6, -3.4);
  for (const x of [-9, -4, 0, 4, 9]) for (const yaw of [-30, 0, 30]) K.backdrop([cx0 + x, 0, 0.5], yaw, { kinds: ['crate', 'barrel', 'sack', 'pot'], n: 2, near: 2.4, far: 3.6, spread: 0.35, avoid: (px, pz) => pz < -3.4 || pz > 9 || Math.abs(px - cx0) > 11.4 || (Math.abs(pz) < 1.6 && Math.abs(px - cx0) < 1.9) });

  // ---------- 2. salon doré ----------
  const sx0 = ZX.salon;
  room(sx0, { floor: checker('#efe4c8', '#c8a868'), wall: wallTex('#e8c26a', 'rgba(255,240,190,0.35)'), tint: '#8a2a32' });
  for (const wx of [-6, 6]) window_(sx0 + wx, 2.75, -3.84, 2.2, 2.9, '#a82a32');
  for (const x of [-9, -4, 4, 9]) column(sx0 + x, -3.0);
  add(box(8, 0.03, 9), M('#a0222c'), sx0, 0.02, 2.0, world, { cast: false }); add(box(8.3, 0.025, 9.3), mGold, sx0, 0.012, 2.0, world, { cast: false });
  chandelier(sx0, 3.7, 1.0); chandelier(sx0 - 7, 3.7, 1.0); chandelier(sx0 + 7, 3.7, 1.0);
  add(box(1.5, 0.08, 1.0), M('#c08a5a'), sx0 + 1.8, 0.88, 0.2, world); for (const a of [-0.6, 0.6]) for (const b of [-0.4, 0.4]) add(box(0.1, 0.84, 0.1), mWoodD, sx0 + 1.8 + a, 0.42, 0.2 + b, world);
  const plateSalon = makePlate(sx0 + 1.8, 1.35, 0.2, 0.8, 0.9, false);
  add(box(1.4, 0.14, 0.9), M('#8a2a32'), sx0, 0.4, -2.4, world); add(box(1.4, 0.7, 0.2), M('#8a2a32'), sx0, 0.8, -2.8, world);   // canapé
  add(box(0.9, 0.9, 0.9), M('#7a3a2a'), sx0 - 5.5, 0.45, -2.6, world); add(box(0.9, 0.9, 0.9), M('#7a3a2a'), sx0 + 5.5, 0.45, -2.6, world);
  K.pot(sx0 - 3, -3.4); K.pot(sx0 + 3, -3.4); K.pot(sx0 - 10.5, -2.8); K.pot(sx0 + 10.5, -2.8);

  // ---------- 3. l'Académie ----------
  const ax0 = ZX.acad;
  room(ax0, { floor: checker('#cfc6b4', '#a89c86', 10), wall: wallTex('#c9bfa8', 'rgba(255,255,240,0.2)'), ceil: '#e4dcc8', tint: '#5a4a3a' });
  for (const wx of [-7, 0, 7]) window_(ax0 + wx, 2.8, -3.84, 2.2, 3.0, '#2a4a7a');
  for (const x of [-10.5, -5.2, 5.2, 10.5]) column(ax0 + x, -3.0);
  // grande table verte du jury + fauteuils + tableau noir couvert de calculs
  add(box(7.0, 0.1, 1.5), M('#2f6a4a'), ax0, 0.9, -1.4, world); add(box(7.0, 0.7, 1.3), mWoodD, ax0, 0.5, -1.4, world);
  for (const x of [-2.6, -0.9, 0.9, 2.6]) { add(box(0.7, 0.1, 0.6), M('#7a2a32'), ax0 + x, 0.55, -2.55, world); add(box(0.7, 1.1, 0.1), M('#7a2a32'), ax0 + x, 1.1, -2.9, world); }
  const chalk = cv(512, 320, (g, w, h) => { g.fillStyle = '#2d3b36'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 5; g.lineCap = 'round';
    for (let k = 0; k < 7; k++) { g.beginPath(); const y = 30 + k * 40; g.moveTo(24, y); for (let x = 24; x < 480; x += 22) g.lineTo(x, y + Math.sin(x * 0.2 + k) * 9 + (r() - 0.5) * 6); g.stroke(); }
    g.lineWidth = 7; g.strokeStyle = '#ff7a7a'; g.beginPath(); g.moveTo(330, 60); g.lineTo(460, 250); g.moveTo(460, 60); g.lineTo(330, 250); g.stroke(); });
  for (const bx of [-8.5, 8.5]) { add(new THREE.PlaneGeometry(2.8, 1.75), toon({ map: P.tex(chalk) }), ax0 + bx, 2.3, -3.7, world, { cast: false }); add(box(3.0, 1.95, 0.08), mWoodD, ax0 + bx, 2.3, -3.76, world); }
  // sacs de pièces (3000 francs)
  const coinsG = new THREE.Group(); world.add(coinsG); const mCoin = toon({ color: '#ffd23a', emissive: new THREE.Color(0.28, 0.2, 0) });
  for (let i = 0; i < 4; i++) { const sk = add(new THREE.SphereGeometry(0.32, 12, 10), M(['#c9b088', '#b89a6c', '#d6c098', '#c4a878'][i]), ax0 + 1.0 + i * 0.55, 1.2, -1.1 + (i % 2) * 0.15, coinsG); sk.scale.set(1, 1.1, 0.9); add(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8), M('#7a3a2a'), ax0 + 1.0 + i * 0.55, 1.5, -1.1 + (i % 2) * 0.15, coinsG); }
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, rr = r() * 0.9; add(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 12), mCoin, ax0 - 1.8 + Math.cos(a) * rr, 0.97 + (i % 4) * 0.03, -1.3 + Math.sin(a) * rr * 0.4, coinsG).rotation.x = (r() - 0.5) * 0.3; }
  // pupitre / estrade
  add(box(1.1, 1.1, 0.8), mWood, ax0 + 3.6, 0.55, 2.4, world); add(box(1.2, 0.08, 0.9), mWoodD, ax0 + 3.6, 1.12, 2.4, world);
  K.pot(ax0 - 10.5, 2.5); K.pot(ax0 + 10.5, 2.5); K.sign(ax0 - 11.2, -2.7, 'ACADÉMIE', 0);

  // ---------- 4. l'université : façade, porte fermée ----------
  const rx0 = ZX.rue;
  const gnd = add(new THREE.PlaneGeometry(40, 30), toon({ map: P.tex(checker('#a49a88', '#8d8472', 12), 6, 5) }), rx0, 0, 6, world, { cast: false }); gnd.rotation.x = -Math.PI / 2;
  const facT = wallTex('#cdbf9f', 'rgba(255,245,215,0.22)');
  add(tbox(34, 8, 0.6, 3), toon({ map: P.tex(facT, 9, 2.4) }), rx0, 4, -4.2, world);
  for (const x of [-9, -5, 5, 9]) { add(box(2.0, 3.0, 0.12), M('#3a4a6a'), rx0 + x, 4.4, -3.84, world, { cast: false }); add(box(2.2, 0.16, 0.2), mStoneD, rx0 + x, 2.85, -3.8, world); add(box(2.2, 0.16, 0.2), mStoneD, rx0 + x, 5.95, -3.8, world); }
  for (const s of [-1, 1]) { column(rx0 + s * 2.6, -3.2, 5.6); } add(box(6.6, 0.8, 0.8), mStoneD, rx0, 5.9, -3.3, world);
  const frontT = cv(512, 128, (g, w, h) => { g.fillStyle = '#d8cdb8'; g.fillRect(0, 0, w, h); g.fillStyle = '#271925'; g.font = '800 70px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('UNIVERSITÉ', w / 2, h / 2 + 4); });
  add(new THREE.PlaneGeometry(5.6, 1.4), toon({ map: P.tex(frontT) }), rx0, 6.2, -2.88, world, { cast: false });
  add(box(3.4, 3.6, 0.2), M('#5a3a2a'), rx0, 1.8, -3.6, world); add(box(0.08, 3.6, 0.24), mIron, rx0, 1.8, -3.5, world);
  for (const s of [-1, 1]) for (const y of [0.7, 1.8, 2.9]) add(box(1.5, 0.12, 0.26), mIron, rx0 + s * 0.85, y, -3.5, world, { cast: false });
  add(box(3.2, 0.12, 0.3), mIron, rx0, 1.6, -3.42, world); for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.1, 8, 6), mBrass, rx0 + s * 0.3, 1.6, -3.3, world);   // barre en travers
  for (let i = 0; i < 4; i++) add(box(6.4 - i * 0.6, 0.18, 1.2), mStone, rx0, 0.09 + i * 0.18 - 0.0, -2.3 + i * 0.0 + (3 - i) * 0.0, world);
  K.lamp(rx0 - 4.5, -1.6); K.lamp(rx0 + 4.5, -1.6);
  for (const x of [-12, -8, 8, 12]) K.tree(rx0 + x, -1.4, { s: 1.1 });

  // ---------- 5. la chambre de Sophie ----------
  const cx5 = ZX.chambre;
  room(cx5, { floor: cv(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a5a3a', '#7a4a2e', '#926240'][i % 3]; g.fillRect(i * 64, 0, 64, h); g.fillStyle = 'rgba(30,16,8,0.7)'; g.fillRect(i * 64, 0, 3, h); } }), wall: wallTex('#8a7a6a', 'rgba(255,220,170,0.1)'), ceil: '#6a5a4a', W: 16, tint: '#4a3028' });
  window_(cx5 - 3.5, 2.6, -3.84, 1.4, 2.0, '#2a3a5a'); add(box(1.4, 2.0, 0.06), M('#1a2650'), cx5 - 3.5, 2.6, -3.78, world, { cast: false });
  for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.03, 5, 4), glowM, cx5 - 3.9 + (i * 0.37) % 1.3, 2.2 + (i * 0.41) % 1.2, -3.74, world, { cast: false });   // étoiles
  // lit
  add(box(2.2, 0.4, 1.2), mWoodD, cx5 + 4.6, 0.3, -2.8, world); add(box(2.0, 0.25, 1.1), M('#d8d0e0'), cx5 + 4.6, 0.62, -2.8, world); add(box(2.2, 1.0, 0.1), mWoodD, cx5 + 4.6, 0.9, -3.4, world);
  // bibliothèque de livres
  add(box(2.6, 3.0, 0.5), mWoodD, cx5 + 1.0, 1.5, -3.6, world);
  for (let i = 0; i < 5; i++) { add(box(2.4, 0.06, 0.44), mWood, cx5 + 1.0, 0.3 + i * 0.62, -3.55, world); for (let j = 0; j < 9; j++) add(box(0.14, 0.4 + (j % 3) * 0.05, 0.3), M(['#a82a32', '#2a5a8a', '#2f6a4a', '#d9a845', '#6a3a8a'][(i + j) % 5]), cx5 + 0.0 + j * 0.26, 0.55 + i * 0.62, -3.5, world); }
  // bureau + bougie + livres empilés
  add(box(2.2, 0.1, 1.1), M('#8a5a3a'), cx5 - 0.4, 0.85, 0.4, world); for (const a of [-0.95, 0.95]) for (const b of [-0.45, 0.45]) add(box(0.1, 0.8, 0.1), mWoodD, cx5 - 0.4 + a, 0.4, 0.4 + b, world);
  for (let i = 0; i < 6; i++) add(box(0.6 - i * 0.03, 0.12, 0.42), M(['#a82a32', '#2a5a8a', '#2f6a4a', '#d9a845', '#6a3a8a', '#8a5a3a'][i]), cx5 - 1.1 + (i % 2) * 0.03, 0.96 + i * 0.12, 0.5, world);
  add(box(0.7, 0.03, 0.5), M('#f1ead6'), cx5 - 0.1, 0.915, 0.65, world, { cast: false });   // feuille
  add(new THREE.CylinderGeometry(0.045, 0.05, 0.28, 10), M('#f4eed8'), cx5 + 0.6, 1.05, 0.35, world);
  const flame = add(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffd05a', fog: false }), cx5 + 0.6, 1.24, 0.35, world, { cast: false }); flame.scale.set(0.8, 1.5, 0.8);
  const halo = add(new THREE.SphereGeometry(0.26, 12, 10), new THREE.MeshBasicMaterial({ color: '#ffb84a', transparent: true, opacity: 0.2, fog: false, depthWrite: false }), cx5 + 0.6, 1.26, 0.35, world, { cast: false });
  add(box(0.5, 0.05, 0.4), M('#a82a32'), cx5 + 4.0, 0.9, 1.4, world); add(box(0.7, 0.5, 0.6), mWood, cx5 + 4.0, 0.25, 1.4, world);
  K.crate(cx5 - 6.8, -2.8, { s: 0.7 }); K.pot(cx5 - 6.8, 1.0);

  // ---------- 6. le pont métallique (les ingénieurs) ----------
  const px0 = ZX.pont;
  const water = add(new THREE.PlaneGeometry(80, 40), M('#5fa4c8'), px0, -3.2, 0, world, { cast: false }); water.rotation.x = -Math.PI / 2;
  const hills = add(new THREE.PlaneGeometry(80, 12), M('#6aa84a'), px0, 0, -14, world, { cast: false }); hills.rotation.x = -Math.PI / 2;
  const deck = new THREE.Group(); deck.position.set(px0, 0, 0); world.add(deck);
  const mBeam = M('#d94a3a'), mBeam2 = M('#ff8a5a');
  add(box(18, 0.3, 3.0), mIron, 0, 0.1, 0, deck); add(box(18, 0.06, 2.4), M('#6a6a72'), 0, 0.28, 0, deck, { cast: false });
  add(box(18, 0.12, 0.12), mBeam, 0, 1.0, 1.4, deck); for (let i = -8; i <= 8; i += 2) add(box(0.12, 0.8, 0.12), mBeam, i, 0.65, 1.4, deck);
  for (const z of [-1.4]) { add(box(18, 0.22, 0.2), mBeam, 0, 2.2, z, deck); add(box(18, 0.2, 0.2), mBeam, 0, 0.3, z, deck);
    for (let i = -8; i <= 8; i++) { add(box(0.16, 1.9, 0.14), mBeam2, i, 1.25, z, deck); if (i < 8) { const d = add(box(0.14, 2.2, 0.12), mBeam, i + 0.5, 1.25, z, deck); d.rotation.z = (i % 2 ? 1 : -1) * 0.42; } } }
  for (const x of [-9.4, 9.4]) add(box(1.2, 6, 3.4), mStone, px0 + x, -1.2, 0, world);
  for (const x of [-4, 4]) add(box(0.9, 3.4, 2.4), mStoneD, px0 + x, -1.9, 0, world);
  K.tree(px0 - 11, -6, { s: 1.4 }); K.tree(px0 + 12, -8, { s: 1.2 }); K.tree(px0 - 6, -9, { s: 1.0 }); K.tree(px0 + 5, -10, { s: 1.3 });
  const mountains = []; for (const x of [-16, -4, 10, 22]) { const m = add(new THREE.ConeGeometry(9 + (x % 5), 8, 6), M('#8aa0c0'), px0 + x, 4, -26, world, { cast: false }); mountains.push(m); }

  const clouds = [];
  function state(S, f) {
    const sd = S.sand || { a: 3, b: 3, t: 0, hop: 0 }; drawSand(sd, f);
    const bw = S.bow || { u: 0, on: 0, hide: 1 };
    // archet : sa mèche touche le bord droit de la plaque ; il glisse le long de la normale de la plaque (va-et-vient)
    const hs = PLATE.size / 2, T = PLATE.tilt, n = [0, Math.cos(T), Math.sin(T)];
    const lx = bw.zone === 'salon' ? ZX.salon + 1.8 : ZX.cab, py = bw.zone === 'salon' ? 1.35 : PLATE.y, pz = bw.zone === 'salon' ? 0.2 : PLATE.z, k = (bw.u ?? 0) * 0.22 - 0.38;
    bow.visible = !bw.hide;
    bow.position.set(lx + hs - 0.06 + (bw.dx ?? 0), py + n[1] * k, pz + n[2] * k); bow.rotation.set(T, 0, 0.04);
    flame.scale.set(0.8, 1.5 + 0.35 * Math.sin(f * 0.9) + 0.15 * Math.sin(f * 2.3), 0.8); halo.material.opacity = 0.16 + 0.08 * Math.sin(f * 0.8) + 0.06 * (S.flame ?? 0);
    halo.scale.setScalar(1 + 0.5 * (S.flame ?? 0));
    deck.position.y = (S.deck ?? 0) * 0.035 * Math.sin(f * 1.7); deck.rotation.z = (S.deck ?? 0) * 0.006 * Math.sin(f * 0.8);
    coinsG.visible = (S.coins ?? 1) > 0.5;
    plateCab.rotation.x = PLATE.tilt + (sd.hop > 0 ? 0.004 * Math.sin(f * 2.1) * sd.hop : 0);
  }
  return { DECK, clouds, state, onLight: () => {} };
}
