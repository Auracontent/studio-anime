// Library set: fond marin sableux avec une épave de navire en bois (x = XS = 6000) + salle d'analyse aux rayons X (x = XL = 9000).
// Fond : sol y = 0, épave à demi ensablée (hull le long de x, ouverte côté +z), boules de céramique tassées entre pierres et briques dans la cale,
//   rochers, algues, coraux, poissons qui tournent (fonction de f). Caméras depuis +z vers -z. Lumière : ambiance bleu clair (lightFor), fog serré.
// Labo : banc, scanner à rayons X, grand écran portrait (z = -1.2) qui montre la boule en transparence : poudre + éclats de fer (texte « POUDRE », « FER »).
// state(S, f) : sand 0..1 (monticule de sable sur l'épave), scan 0..1 (l'écran se révèle), scanBall 0..1 (boule dans le scanner), hl 0|1|2 (anneau jaune : poudre / fer), fish 0..1
export const XS = 6000, XL = 9000;
export const SPOTS = { wreck: [XS + 4, 0, -3.2], hold: [XS + 4.2, 0.5, -3.0], diver: [XS + 1.0, 0, 0.6], lab: [XL, 0, 0], screen: [XL + 0.5, 1.85, -1.2] };

export function buildFondmarin(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const r = P.rng(2011);
  const M = (c) => toon({ color: c });
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const INK = '#271925';
  const sandC = cv(512, 512, (g, w, h) => { g.fillStyle = '#d8c48e'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 700; k++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${130 + r() * 50 | 0},${90 + r() * 40 | 0},0.3)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 30; k++) { g.strokeStyle = 'rgba(255,240,200,0.45)'; g.lineWidth = 4; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y - 12, w * 0.6, y + 12, w, y); g.stroke(); } });
  const plankC = cv(256, 256, (g, w, h) => { g.fillStyle = '#6a5a44'; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(30,24,16,${0.2 + r() * 0.25})`; g.lineWidth = 1 + r() * 3; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 8, h * 0.3, x - 8, h * 0.6, x + 3, h); g.stroke(); }
    for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(80,130,70,${0.1 + r() * 0.2})`; g.beginPath(); g.ellipse(r() * w, r() * h, 4 + r() * 12, 2 + r() * 5, 0, 0, 6.283); g.fill(); } });
  const mSand = toon({ map: P.tex(sandC, 24, 24) }), mPlank = toon({ map: P.tex(plankC, 1, 1) });
  const mBall = M('#7a4a2e'), mBand = M('#c9a060'), mRock = M('#6a7480'), mBrick = M('#b8573a');
  // ---------- seabed ----------
  const floor = add(new THREE.PlaneGeometry(120, 90), mSand, XS + 6, 0, -14, world, { cast: false }); floor.rotation.x = -Math.PI / 2;
  const rock = (x, z, s) => { const m = add(new THREE.DodecahedronGeometry(s, 0), r() > 0.5 ? mRock : M('#58606c'), x, s * 0.25, z, world); m.scale.set(1.3, 0.7, 1); m.rotation.y = r() * 3; return m; };
  for (let i = 0; i < 22; i++) rock(XS - 8 + r() * 26, -14 + r() * 8 - 2, 0.5 + r() * 1.5);
  for (let i = 0; i < 12; i++) rock(XS - 7 + r() * 24, 2.5 + r() * 5, 0.25 + r() * 0.5);
  const weed = (x, z, h, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); for (let i = 0; i < 5; i++) { const b = add(new THREE.CylinderGeometry(0.02, 0.07, h * (0.7 + r() * 0.5), 5), M(col), (r() - 0.5) * 0.4, h * 0.4, (r() - 0.5) * 0.3, g, { cast: false }); b.rotation.z = (r() - 0.5) * 0.5; b.rotation.x = (r() - 0.5) * 0.3; } return g; };
  for (let i = 0; i < 40; i++) weed(XS - 8 + r() * 26, -12 + r() * 16, 0.8 + r() * 1.4, ['#3f8a4a', '#5aa04a', '#2f7a5a', '#8a9a3a'][i % 4]);
  const coral = (x, z, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); for (let i = 0; i < 5; i++) { const s = add(new THREE.SphereGeometry(0.22 + r() * 0.18, 8, 6), M(col), (r() - 0.5) * 0.6, 0.2 + r() * 0.4, (r() - 0.5) * 0.5, g); s.scale.y = 1.4; } };
  for (const [x, z, c] of [[-3, -7, '#e8608a'], [13, -8, '#f08a3a'], [-1, 5, '#e8608a'], [12, 4, '#f08a3a'], [9, -10, '#c86bff'], [-5, -3, '#f08a3a'], [15, -4, '#e8608a']]) coral(XS + x, z, c);
  // ---------- the wreck: planks over ribs, open on the +z side so the hold is visible ----------
  const W = SPOTS.wreck, hull = new THREE.Group(); hull.position.set(...W); world.add(hull);
  add(tbox(8.4, 0.3, 2.8, 2), mPlank, 0, 0.15, 0, hull);                                                                        // bottom
  for (let i = 0; i < 10; i++) { const x = -3.8 + i * 0.85;
    const rb = add(box(0.18, 2.0, 0.2), mPlank, x, 1.0, -1.45, hull); rb.rotation.z = 0; rb.rotation.x = -0.28;                  // back ribs lean outward
  }
  for (let k = 0; k < 5; k++) { const pl = add(tbox(8.4, 0.3, 0.12, 2), mPlank, 0, 0.35 + k * 0.38, -1.5 - k * 0.1 + 0.2, hull); pl.rotation.x = -0.28; if (k === 3) pl.scale.x = 0.7; }  // back planks (outer wall)
  { const pl = add(tbox(2.0, 0.25, 0.12, 2), mPlank, -3.0, 0.2, 1.5, hull); pl.rotation.x = 0.3; }
  const bow = add(tbox(0.3, 3.4, 2.8, 2), mPlank, 4.6, 1.6, 0, hull); bow.rotation.z = -0.4; add(tbox(0.3, 2.2, 2.8, 2), mPlank, -4.3, 1.1, 0, hull); add(tbox(1.8, 0.2, 2.8, 2), mPlank, -3.4, 2.2, 0, hull);
  for (const z of [-1.3, 1.3]) add(box(0.16, 1.6, 0.16), mPlank, -3.4, 1.4, z, hull);                                                     // stern castle (poop deck)
  const mast = add(new THREE.CylinderGeometry(0.12, 0.2, 6.5, 8), mPlank, 0.2, 3.0, -0.3, hull); mast.rotation.z = 0.12; const yard = add(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 6), mPlank, 0.6, 4.8, -0.3, hull); yard.rotation.z = Math.PI / 2 - 0.25;
  // cargo: stones + bricks + the ceramic bombs, packed in the hold
  const hold = new THREE.Group(); hold.position.set(...SPOTS.hold); world.add(hold);
  for (let i = 0; i < 14; i++) { const m = add(new THREE.DodecahedronGeometry(0.28 + r() * 0.12, 0), mRock, -2.4 + r() * 4.8, 0.2, -0.6 + r() * 1.4, hold); m.rotation.set(r() * 3, r() * 3, r() * 3); m.scale.y = 0.7; }
  for (let i = 0; i < 16; i++) { const m = add(box(0.34, 0.16, 0.22), mBrick, -2.4 + r() * 4.8, 0.2 + (i % 2) * 0.14, -0.7 + r() * 1.4, hold); m.rotation.y = r() * 3; }
  const bombs = [];
  const bomb = (x, y, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, y, z); hold.add(g); const R = 0.21 * s;
    add(new THREE.SphereGeometry(R, 14, 10), mBall, 0, 0, 0, g); const bd = add(new THREE.TorusGeometry(R, 0.025 * s, 5, 20), mBand, 0, R * 0.05, 0, g); bd.rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(R * 0.32, R * 0.4, R * 0.35, 8), M('#5a3a24'), 0, R * 1.0, 0, g); bombs.push(g); return g; };
  for (let i = 0; i < 9; i++) bomb(-1.8 + i * 0.5 + (r() - 0.5) * 0.1, 0.34, 0.15 + (i % 2) * 0.32, 1);
  for (let i = 0; i < 7; i++) bomb(-1.5 + i * 0.52 + (r() - 0.5) * 0.1, 0.34, 0.75 - (i % 2) * 0.2, 1);
  for (let i = 0; i < 6; i++) bomb(-1.2 + i * 0.55, 0.72, 0.45 + (i % 2) * 0.1, 1);
  // sand mound over the wreck (flattens as the diver sweeps)
  const mound = add(new THREE.SphereGeometry(1, 20, 12), mSand, W[0] + 0.3, 0, W[2] + 0.2, world); mound.scale.set(5.2, 1.5, 2.6);
  // fish circling the wreck
  const fish = [];
  for (let i = 0; i < 9; i++) { const g = new THREE.Group(); world.add(g); const col = ['#f08a3a', '#ffd23f', '#e8608a', '#3aa0e8'][i % 4]; const b = add(new THREE.SphereGeometry(0.24, 8, 6), new THREE.MeshBasicMaterial({ color: col, fog: true }), 0, 0, 0, g, { cast: false }); b.scale.set(1.6, 1, 0.5);
    const t = add(new THREE.ConeGeometry(0.14, 0.3, 5), new THREE.MeshBasicMaterial({ color: col }), -0.4, 0, 0, g, { cast: false }); t.rotation.z = Math.PI / 2; fish.push({ g, ph: i * 0.9, rad: 3 + (i % 4) * 1.4, y: 1.0 + (i % 3) * 0.7, sp: 0.5 + (i % 3) * 0.15, cx: XS + 3.5 + (i % 2) * 2 }); }
  // ---------- X-ray room (x = XL) ----------
  const L = (x) => XL + x;
  const tileC = cv(256, 256, (g, w, h) => { g.fillStyle = '#d8e2e4'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8c6ca'; for (let i = 0; i <= 4; i++) { g.fillRect(i * 64 - 2, 0, 4, h); g.fillRect(0, i * 64 - 2, w, 4); } });
  const wallC = cv(256, 256, (g, w, h) => { g.fillStyle = '#a8d4cf'; g.fillRect(0, 0, w, h); for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(r() * w, r() * h, 20 + r() * 30, 3); } g.fillStyle = '#7aa8a4'; g.fillRect(0, 200, w, 6); });
  const lf = add(new THREE.PlaneGeometry(30, 16), toon({ map: P.tex(tileC, 10, 6) }), L(0), 0.005, 0, world, { cast: false }); lf.rotation.x = -Math.PI / 2;
  add(tbox(30, 4.2, 0.4, 3), toon({ map: P.tex(wallC, 10, 1.4) }), L(0), 2.1, -4.0, world); add(tbox(0.4, 4.2, 16, 3), toon({ map: P.tex(wallC, 6, 1.4) }), L(-9), 2.1, 0, world); add(tbox(0.4, 4.2, 16, 3), toon({ map: P.tex(wallC, 6, 1.4) }), L(9), 2.1, 0, world);
  const lc = add(new THREE.PlaneGeometry(30, 16), M('#e8f0f0'), L(0), 4.4, 0, world, { cast: false }); lc.rotation.x = Math.PI / 2;
  for (const x of [-6, 6]) add(box(2.6, 1.6, 0.1), new THREE.MeshBasicMaterial({ color: '#cfeefa', fog: false }), L(x), 2.6, -3.75, world, { cast: false });
  // bench
  add(box(5.0, 0.9, 1.1), M('#e8e8e4'), L(0.4), 0.45, -1.2, world); add(box(5.1, 0.08, 1.2), M('#3a4a58'), L(0.4), 0.94, -1.2, world);
  // scanner: boxy housing + dark tunnel + tray
  const sc = new THREE.Group(); sc.position.set(L(-1.4), 0.98, -1.2); world.add(sc);
  add(box(1.7, 1.1, 1.0), M('#c9d2d8'), 0, 0.55, 0, sc); add(box(1.2, 0.7, 0.2), M('#1b2128'), 0, 0.5, 0.45, sc); add(box(1.76, 0.12, 1.06), M('#2a6aa8'), 0, 1.12, 0, sc); add(box(0.8, 0.06, 0.6), M('#9aa3ad'), 0, 0.2, 0.8, sc);
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), new THREE.MeshBasicMaterial({ color: '#ff4a3a' }), -0.7, 0.9, 0.52, sc, { cast: false }).rotation.x = Math.PI / 2;
  const trayBall = new THREE.Group(); trayBall.position.set(0, 0.35, 0.8); sc.add(trayBall);
  { const R = 0.21; add(new THREE.SphereGeometry(R, 14, 10), mBall, 0, 0, 0, trayBall); const bd = add(new THREE.TorusGeometry(R, 0.025, 5, 20), mBand, 0, 0.01, 0, trayBall); bd.rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(R * 0.32, R * 0.4, R * 0.35, 8), M('#5a3a24'), 0, R, 0, trayBall); }
  // portrait monitor with the X-ray image; a dark cover shrinks as the scan runs
  const xr = cv(512, 680, (g, w, h) => {
    g.fillStyle = '#0c2630'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,200,220,0.18)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(0, i * 60); g.lineTo(w, i * 60); g.stroke(); }
    const cx = 256, cy = 330, R = 190;
    g.fillStyle = '#12485a'; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.fill(); g.lineWidth = 22; g.strokeStyle = '#6fe0f0'; g.stroke();
    g.fillStyle = '#0a2c38'; g.beginPath(); g.arc(cx, cy, R - 26, 0, 6.283); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R - 30, 0, 6.283); g.clip();
    for (let k = 0; k < 900; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * (R - 36), y = cy + Math.sin(a) * d; if (y < cy - 40) continue; g.fillStyle = `rgba(${150 + r() * 70 | 0},${200 + r() * 55 | 0},${210 + r() * 40 | 0},${0.35 + r() * 0.4})`; g.beginPath(); g.arc(cx + Math.cos(a) * d, y, 2 + r() * 3.5, 0, 6.283); g.fill(); }   // black powder (bright grains on X-ray)
    for (const [sx, sy, sa, sz] of [[-80, 300, 0.4, 44], [30, 275, 2.4, 52], [95, 335, 1.2, 40], [-30, 345, 3.6, 36], [-110, 250, 5.2, 38], [60, 235, 0.2, 34]]) { g.save(); g.translate(cx + sx, sy); g.rotate(sa); g.fillStyle = '#fffbe0'; g.beginPath(); g.moveTo(-sz, -sz * 0.2); g.lineTo(sz * 0.2, -sz * 0.45); g.lineTo(sz, sz * 0.3); g.lineTo(-sz * 0.3, sz * 0.4); g.closePath(); g.fill(); g.lineWidth = 4; g.strokeStyle = '#ffffff'; g.stroke(); g.restore(); }   // iron shards
    g.restore();
    g.font = '800 54px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = INK;
    g.strokeText('POUDRE', 256, 585); g.fillStyle = '#7ee8ff'; g.fillText('POUDRE', 256, 585); g.strokeText('FER', 256, 80); g.fillStyle = '#ffe36a'; g.fillText('FER', 256, 80);
    g.strokeStyle = '#7ee8ff'; g.lineWidth = 8; g.beginPath(); g.moveTo(256, 528); g.lineTo(256, 470); g.stroke(); g.strokeStyle = '#ffe36a'; g.beginPath(); g.moveTo(256, 100); g.lineTo(256, 170); g.stroke();
  });
  const mon = new THREE.Group(); mon.position.set(...SPOTS.screen); world.add(mon);
  add(box(1.45, 1.85, 0.12), M('#2a3340'), 0, 0, -0.07, mon); add(box(0.3, 1.0, 0.2), M('#2a3340'), 0, -1.4, -0.1, mon);
  add(new THREE.PlaneGeometry(1.3, 1.7), new THREE.MeshBasicMaterial({ map: P.tex(xr, 1, 1), fog: false }), 0, 0, 0.0, mon, { cast: false });
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.7), new THREE.MeshBasicMaterial({ color: '#0a1a22', fog: false })); cover.position.set(0, 0.85, 0.01); cover.geometry.translate(0, -0.85, 0); cover.userData.ndSkip = true; mon.add(cover);
  const scanBar = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.05), new THREE.MeshBasicMaterial({ color: '#8affff', fog: false })); scanBar.userData.ndSkip = true; mon.add(scanBar);
  const ring = (y, col) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 28), new THREE.MeshBasicMaterial({ color: col, fog: false })); m.position.set(0, y, 0.02); m.scale.set(1.7, 0.55, 1); m.userData.ndSkip = true; mon.add(m); return m; };
  const ringP = ring(-0.62, '#7ee8ff'), ringF = ring(0.55, '#ffe36a');
  // shelves and equipment along the back wall
  for (const x of [-7, -4.8, 4.8, 7]) { add(box(1.8, 2.6, 0.5), M('#cdd6d8'), L(x), 1.3, -3.6, world); for (let k = 0; k < 4; k++) { add(box(1.7, 0.05, 0.5), M('#8a99a0'), L(x), 0.4 + k * 0.65, -3.6, world); for (let j = 0; j < 3; j++) add(box(0.4, 0.3, 0.3), M(['#e0a020', '#2a6aa8', '#c8402a', '#3f7a5a'][(j + k) % 4]), L(x - 0.5 + j * 0.5), 0.58 + k * 0.65, -3.6, world); } }
  for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(0.1, 0.1, 0.34, 8), M(['#8ad8e8', '#e8b8f0', '#f8e090'][i % 3]), L(2.2 + i * 0.3), 1.14, -1.2, world, { cast: false });   // flasks
  add(box(1.6, 0.9, 0.06), M('#f4f1e6'), L(4.2), 2.5, -3.75, world, { cast: false });
  function state(S, f) {
    const sd = Math.max(0, Math.min(1, S.sand ?? 1)); mound.visible = sd > 0.02; mound.scale.set(5.2 * (0.55 + 0.45 * sd), Math.max(0.05, 1.5 * sd), 2.6 * (0.55 + 0.45 * sd));
    const k = Math.max(0, Math.min(1, S.scan ?? 0)); cover.scale.y = Math.max(0.001, 1 - k); scanBar.visible = k > 0.01 && k < 0.99; scanBar.position.set(0, 0.85 - 1.7 * k, 0.02);
    trayBall.visible = (S.scanBall ?? 0) > 0.5; trayBall.position.z = 0.8 - 0.8 * Math.min(1, S.scanBall ?? 0) * 0.0;
    ringP.visible = S.hl === 1; ringF.visible = S.hl === 2; ringP.scale.set(1.7 * (1 + 0.06 * Math.sin(f * 0.4)), 0.55, 1); ringF.scale.set(1.7 * (1 + 0.06 * Math.sin(f * 0.4)), 0.55, 1);
    const fk = S.fish ?? 1; fish.forEach((o) => { const a = o.ph + (f / 30) * o.sp, x = o.cx + Math.cos(a) * o.rad * 1.4, z = -3 + Math.sin(a) * o.rad * 0.9 + 1; o.g.visible = fk > 0.5; o.g.position.set(x, o.y + Math.sin(a * 2) * 0.15, z); o.g.rotation.y = -a + Math.PI; });
    bombs.forEach((b, i) => { b.visible = (S.bombs ?? 1) > 0.5 || i > 0; });
    hold.visible = true;
  }
  return { SPOTS, state, mound, hold };
}
