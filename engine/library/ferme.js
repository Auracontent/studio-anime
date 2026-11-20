// Library set: cour de ferme française, fin XIXe (grange, meules, abreuvoir, charrette, clôtures) + dynamomètre de traction.
// Ground level DECK = 0. The pulling line runs along x at z = 0, rope at y = ROPE_Y; the dynamometer stands at x = DYNO_X (-1.3).
// Cameras look from +z toward -z (barn behind). state(S, f): dyno 0..1 (needle), ropeSag 0..1 (rope droops when slack).
export const DECK = 0, ROPE_Y = 0.82, DYNO_X = -1.3;
export const SPOTS = { yard: [0, 0, 0], barn: [0, 0, -12], dyno: [DYNO_X, 0, 0] };

/** Dynamometer: post + dial box with a moving needle. Returns { g, setNeedle(v 0..1) }. Reused by labo.js. */
export function makeDyno(ctx, x, z, o = {}) {
  const { THREE, P, world, add, box, toon } = ctx;
  const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const c = cv.getContext('2d');
  c.fillStyle = '#f6f0dc'; c.beginPath(); c.arc(256, 256, 244, 0, 6.283); c.fill(); c.lineWidth = 14; c.strokeStyle = '#271925'; c.stroke();
  for (let i = 0; i <= 10; i++) { const a = (-215 + i * 25) * Math.PI / 180, r1 = i % 5 === 0 ? 170 : 195; c.lineWidth = i % 5 === 0 ? 12 : 6;
    c.beginPath(); c.moveTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1); c.lineTo(256 + Math.cos(a) * 220, 256 + Math.sin(a) * 220); c.stroke(); }
  c.strokeStyle = '#c8312c'; c.lineWidth = 16; c.beginPath(); c.arc(256, 256, 150, (-215 + 175) * Math.PI / 180, 35 * Math.PI / 180); c.stroke();
  c.fillStyle = '#271925'; c.font = '800 46px Montserrat, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('kg', 256, 370);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), new THREE.MeshBasicMaterial({ map: P.tex(cv) })); face.position.set(0, 1.32, 0.12); g.add(face);
  add(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 24), toon({ color: o.casing || '#6b4a2a' }), 0, 1.32, 0, g).rotation.x = Math.PI / 2;
  if (!o.wall) add(box(0.16, 1.2, 0.16), toon({ color: '#5a3b22' }), 0, 0.6, -0.06, g);
  add(box(0.5, 0.12, 0.3), toon({ color: '#2f3440' }), 0.42, ROPE_Y, 0, g); // hook plate where the rope is tied
  const pivot = new THREE.Group(); pivot.position.set(0, 1.32, 0.14); g.add(pivot);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.012), new THREE.MeshBasicMaterial({ color: '#c8312c' })); nd.position.y = 0.14; pivot.add(nd);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), new THREE.MeshBasicMaterial({ color: '#271925' })); hub.position.z = 0.012; pivot.add(hub);
  return { g, setNeedle: (v) => { pivot.rotation.z = (125 - v * 250) * Math.PI / 180; } };
}

export function buildFerme(ctx) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1913);
  const meadow = cv(512, 512, (g, w, h) => { g.fillStyle = '#8db04a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${90 + r() * 70 | 0},${140 + r() * 60 | 0},${50 + r() * 30 | 0},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); } });
  const yard = cv(512, 512, (g, w, h) => { g.fillStyle = '#c9a877'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${118 + r() * 50 | 0},${76 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(110,84,56,0.55)'; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 3, 0, 6.283); g.fill(); } });
  const mMeadow = toon({ map: P.tex(meadow, 220, 220) }), mYard = toon({ map: P.tex(yard, 5, 4) });
  const mPlank = toon({ map: P.tex(P.planks(5), 3, 2) }), mBeam = toon({ color: '#4a3424' }), mTile = toon({ map: P.tex(P.roof(9), 3, 2) });
  const mStone = toon({ map: P.tex(P.stone(4, 40, 12, 72), 2, 1) }), mWood = toon({ color: '#8a5d38' }), mIron = toon({ color: '#33302f' }), mHay = toon({ color: '#dcb450' }), mHay2 = toon({ color: '#c99a3a' });
  const ground = add(new THREE.PlaneGeometry(3000, 3000), mMeadow, 0, -0.02, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  const pad = (x, z, w, d, m, y = 0.01) => { const p = add(new THREE.PlaneGeometry(w, d), m, x, y, z, world, { cast: false }); p.rotation.x = -Math.PI / 2; return p; };
  pad(0, -2, 34, 22, mYard, 0.01);
  // ---- barn (grange), big double door, hay loft ----
  const barn = (x, z, w = 16, d = 9, h = 5, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    add(tbox(w, h, d, 3), mPlank, 0, h / 2, 0, g); add(tbox(w + 0.4, 0.5, d + 0.4, 2), mStone, 0, 0.25, 0, g);
    const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.6, 0); sh.lineTo(d / 2 + 0.6, 0); sh.lineTo(0, 3.6); sh.closePath();
    const rm = add(new THREE.ExtrudeGeometry(sh, { depth: w + 1.2, bevelEnabled: false }), mTile, -(w + 1.2) / 2, h, 0, g); rm.rotation.y = Math.PI / 2; rm.position.set(-(w + 1.2) / 2, h, 0);
    // front (toward +z): double door with cross braces + loft hatch
    for (const s of [-1, 1]) { add(box(2.2, 3.6, 0.14), toon({ color: '#6a3f26' }), s * 1.12, 1.8, d / 2 + 0.05, g);
      for (const k of [-1, 1]) { const br = add(box(0.16, 3.9, 0.06), mBeam, s * 1.12, 1.8, d / 2 + 0.14, g); br.rotation.z = k * 0.55; } }
    add(box(1.4, 1.2, 0.14), toon({ color: '#2b2218' }), 0, h - 0.2, d / 2 + 0.05, g); add(box(1.6, 0.14, 0.2), mBeam, 0, h + 0.5, d / 2 + 0.05, g);
    for (const s of [-1, 1]) add(box(0.3, h, 0.3), mBeam, s * (w / 2 - 0.1), h / 2, d / 2 + 0.02, g);
    return g; };
  barn(-2, -14, 18, 9, 5.2); barn(-23, -8, 9, 8, 4, 0.5);
  { const g = new THREE.Group(); g.position.set(15, 0, -9); world.add(g); add(tbox(7, 3.6, 6, 3), toon({ map: P.tex(P.plaster(31, 40), 1, 1) }), 0, 1.8, 0, g); // farmhouse
    const sh = new THREE.Shape(); sh.moveTo(-3.6, 0); sh.lineTo(3.6, 0); sh.lineTo(0, 2.6); sh.closePath(); const rm = add(new THREE.ExtrudeGeometry(sh, { depth: 7.6, bevelEnabled: false }), mTile, -3.8, 3.6, 0, g); rm.rotation.y = Math.PI / 2;
    add(box(1.0, 2.1, 0.12), toon({ color: '#5a3a24' }), -1.5, 1.05, 3.04, g); for (const wx of [0.8, 2.4]) add(box(0.9, 1.0, 0.12), toon({ color: '#46557a' }), wx, 2.1, 3.04, g, { cast: false }); add(new THREE.CylinderGeometry(0.35, 0.45, 1.3, 6), mStone, 2.4, 5.6, -1, g); }
  // ---- haystacks (meules) ----
  const meule = (x, z, s = 1) => { const m = add(new THREE.SphereGeometry(1.5 * s, 12, 8, 0, 6.283, 0, 1.57), r() > 0.5 ? mHay : mHay2, x, 0, z, world); m.scale.set(1, 1.15, 1); add(new THREE.ConeGeometry(0.25 * s, 0.6 * s, 6), mHay2, x, 1.8 * s, z, world); };
  for (const [x, z, s] of [[8, -6, 1.1], [10.5, -3.5, 0.9], [-9, -7, 1.2], [-12, -4, 1.0], [20, -3, 1.2], [-20, 2, 1.1]]) meule(x, z, s);
  // ---- trough (abreuvoir), cart (charrette), well ----
  add(box(2.4, 0.5, 0.7), mWood, 4.5, 0.25, -5, world); add(box(2.2, 0.06, 0.5), toon({ color: '#5aa0c0' }), 4.5, 0.46, -5, world, { cast: false });
  { const g = new THREE.Group(); g.position.set(-6, 0, -4); g.rotation.y = 0.5; world.add(g); add(box(2.2, 0.15, 1.2), mWood, 0, 0.8, 0, g); for (const s of [-1, 1]) { add(box(2.2, 0.35, 0.08), mWood, 0, 1.0, s * 0.6, g); const w = add(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 14), mWood, -0.3, 0.55, s * 0.7, g); w.rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 6), mIron, -0.3, 0.55, s * 0.74, g).rotation.x = Math.PI / 2; }
    add(box(2.0, 0.06, 0.08), mWood, 2.0, 0.7, 0, g); for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.4, 7, 5), mHay, -0.7 + i * 0.3, 1.2 + (i % 2) * 0.1, (i % 3 - 1) * 0.3, g); }
  { const g = new THREE.Group(); g.position.set(11, 0, 5); world.add(g); add(new THREE.CylinderGeometry(0.7, 0.75, 0.9, 12), mStone, 0, 0.45, 0, g); for (const s of [-1, 1]) add(box(0.1, 1.9, 0.1), mWood, s * 0.7, 1.4, 0, g); add(box(1.9, 0.12, 0.7), mTile, 0, 2.4, 0, g); }
  // ---- trees, hedge line, distant hills ----
  const leaf = [toon({ color: '#6f9a3c' }), toon({ color: '#5e8a34' }), toon({ color: '#7fa844' })], trunk = toon({ color: '#6a4a32' });
  const tree = (x, z, s = 1) => { add(new THREE.CylinderGeometry(0.22 * s, 0.34 * s, 3.4 * s, 7), trunk, x, 1.7 * s, z, world); for (let i = 0; i < 5; i++) { const b = add(new THREE.IcosahedronGeometry((1.5 + r() * 0.6) * s, 1), leaf[i % 3], x + (r() - 0.5) * 2 * s, 4.4 * s + r() * 1.2 * s, z + (r() - 0.5) * 2 * s, world); b.scale.y = 0.85; } };
  for (let i = 0; i < 26; i++) { const a = -2.9 + i * 0.22; tree(Math.sin(a) * (34 + r() * 10) * 1.1, -Math.cos(a) * 34 - r() * 8 - 14, 1 + r() * 0.7); }
  for (const [x, z] of [[-30, 18], [26, 22], [-16, 30], [38, 10]]) tree(x, z, 1.2);
  for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = 300 + r() * 220; add(new THREE.SphereGeometry(70 + r() * 50, 18, 10), toon({ color: i % 2 ? '#9db860' : '#7fa456' }), Math.cos(a) * d, -26, Math.sin(a) * d - 120, world, { cast: false }); }
  // ---- fence rails along the yard, tied to the left of the pulling line ----
  const fence = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 1.6), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i <= n; i++) add(box(0.12, 1.2, 0.12), mWood, x0 + (x1 - x0) * i / n, 0.6, z0 + (z1 - z0) * i / n, world);
    for (const y of [0.45, 0.95]) { const rl = add(box(0.07, 0.1, L), mWood, (x0 + x1) / 2, y, (z0 + z1) / 2, world); rl.rotation.y = ry; } };
  fence(-18, -9, -18, 16); fence(-18, 16, 20, 16); fence(20, 16, 20, 4);
  // ---- the rope + dynamometer ----
  const dyno = makeDyno(ctx, DYNO_X, 0);
  const ropeMat = toon({ color: '#c9a05a' });
  const rope = add(new THREE.CylinderGeometry(0.035, 0.035, 1, 8), ropeMat, 0, ROPE_Y, 0.02, world); rope.rotation.z = Math.PI / 2;
  rope.scale.set(1, 24, 1); rope.position.x = DYNO_X + 0.55 + 12;
  const clouds = [];
  { const rr = P.rng(91); for (let i = 0; i < 12; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  function state(S) { dyno.setNeedle(S.dyno ?? 0);
    const full = S.ropeFull ? 1 : 0; dyno.g.visible = !full; rope.scale.set(1, full ? 34 : 24, 1); rope.position.x = full ? DYNO_X + 0.55 + 12 - 5 : DYNO_X + 0.55 + 12; }
  return { DECK, SPOTS, clouds, state, dyno };
}
