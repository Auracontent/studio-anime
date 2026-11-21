// Library set: phare sur un rocher (Cordouan-like) + atelier / salle de lanterne, début XIXe.
// Exterior: ground DECK = 0 on a rocky plateau at the origin, tower behind at (0, 0, -10), sea all around (y = -0.8). Cameras look from +z toward -z (tower)
// or from -z toward +z (open sea + reefs) with yaw ~150-180.
// Interior at x = IX (3000): stone workshop. Stations (x offsets): mirrors rack (-8), plan table (0), glass block / ring lens stand (+4), rotating lens drum (+12).
// state(S, f): beamOn 0..1, beamYaw (rad), block 0..1 (scale of the giant glass block, 0 = hidden), lens 0..1 (ring lens visible), drum (rad), flame 0..1
export const DECK = 0, IX = 3000;
export const SPOTS = { cliff: [0, 0, 0], tower: [0, 0, -10], reef: [0, 0, 30], mirrors: [IX - 8, 0, 0], table: [IX, 0, 0], stand: [IX + 4, 0, 0], drum: [IX + 12, 0, 0] };

/** lens disc facing +z: sawtooth lathe profile (rings). R radius, n rings. Returns THREE.LatheGeometry */
export function fresnelGeo(THREE, R = 1.2, n = 9, base = 0.05, rise = 0.09) {
  const sl = (i) => rise * (0.5 + (i / n) * 1.0), pts = [new THREE.Vector2(0, 0), new THREE.Vector2(R, 0), new THREE.Vector2(R, base + sl(n - 1))];
  for (let i = n - 1; i >= 0; i--) { const r0 = (R * i) / n; pts.push(new THREE.Vector2(r0, base)); if (i > 0) pts.push(new THREE.Vector2(r0, base + sl(i - 1))); } // ring ramps down toward the axis, then a step wall
  const g = new THREE.LatheGeometry(pts, 40); g.rotateX(Math.PI / 2); return g;
}

export function buildPhare(ctx) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1823);
  const M = (c) => toon({ color: c });
  // ---------- textures ----------
  const sea = cv(512, 512, (g, w, h) => { g.fillStyle = '#2fa3b8'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { g.strokeStyle = `rgba(${200 + r() * 55 | 0},255,255,${0.25 + r() * 0.35})`; g.lineWidth = 2 + r() * 3; const x = r() * w, y = r() * h, l = 14 + r() * 30; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); }
    for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(20,110,140,${0.12 + r() * 0.15})`; g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 24, 2 + r() * 6, 0, 0, 6.283); g.fill(); } });
  const rock = cv(512, 512, (g, w, h) => { g.fillStyle = '#b49a78'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 800; k++) { g.fillStyle = `rgba(${120 + r() * 80 | 0},${100 + r() * 60 | 0},${70 + r() * 50 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 14, 2 + r() * 6, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 40; k++) { g.strokeStyle = 'rgba(60,44,40,0.35)'; g.lineWidth = 2; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 40); g.stroke(); } });
  const towerC = cv(256, 512, (g, w, h) => { g.fillStyle = '#f1e7d0'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(150,130,100,0.35)'; g.fillRect(0, y, w, 3); for (let x = (y / 32) % 2 ? 0 : 32; x < w; x += 64) g.fillRect(x, y, 3, 32); }
    g.fillStyle = '#c8312c'; g.fillRect(0, 150, w, 70); g.fillRect(0, 330, w, 70); g.fillStyle = 'rgba(90,40,40,0.4)'; g.fillRect(0, 216, w, 4); g.fillRect(0, 396, w, 4); });
  const mSea = toon({ map: P.tex(sea, 300, 300) }), mRock = toon({ map: P.tex(rock, 6, 6) }), mTower = toon({ map: P.tex(towerC, 3, 3) });
  const mStone = toon({ map: P.tex(P.stone(4, 40, 12, 72), 3, 1) }), mGlass = toon({ color: '#9fdce0' }), mBrass = M('#d9a845'), mDark = M('#2f3440'), mWood = M('#8a5d38'), mWood2 = M('#5a3b22');
  const mSilver = M('#cfd6de'), mCream = M('#efe6cf');
  const beamMat = new THREE.MeshBasicMaterial({ color: '#fff0a8', transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, fog: false });
  // ---------- exterior ----------
  const water = add(new THREE.PlaneGeometry(4000, 4000), mSea, 0, -0.8, 0, world, { cast: false }); water.rotation.x = -Math.PI / 2;
  const plat = add(new THREE.CylinderGeometry(17, 21, 1.2, 28), mRock, 0, -0.6, -4, world); plat.scale.set(1.2, 1, 1);
  const top = add(new THREE.CylinderGeometry(16, 16.4, 0.05, 28), toon({ map: P.tex(rock, 5, 5) }), 0, 0.0, -4, world, { cast: false }); top.scale.set(1.2, 1, 1);
  for (let i = 0; i < 22; i++) { const a = r() * 6.283, d = 16 + r() * 8, s = 1 + r() * 2.5; const m = add(new THREE.DodecahedronGeometry(s, 0), mRock, Math.cos(a) * d * 1.2, s * 0.1, -4 + Math.sin(a) * d, world); m.scale.set(1.2, 0.8 + r() * 0.5, 1); m.rotation.y = r() * 3; }
  // reefs (the rocks the sailors fear), south of the plateau
  for (let i = 0; i < 26; i++) { const x = -60 + r() * 120, z = 26 + r() * 90, s = 1.2 + r() * 2.6; const m = add(new THREE.ConeGeometry(s, s * (1.6 + r() * 1.4), 6), M(i % 3 ? '#4c4a52' : '#6a5a52'), x, s * 0.4, z, world); m.rotation.y = r() * 3; }
  for (let i = 0; i < 26; i++) { const x = -60 + r() * 120, z = -50 - r() * 80, s = 1.2 + r() * 2.6; const m = add(new THREE.ConeGeometry(s, s * (1.6 + r() * 1.4), 6), M(i % 3 ? '#4c4a52' : '#6a5a52'), x, s * 0.4, z, world); m.rotation.y = r() * 3; }
  // tower: base block with columns + arched windows, shaft, gallery, lantern, red cap
  const tw = new THREE.Group(); tw.position.set(0, 0, -10); world.add(tw);
  add(new THREE.CylinderGeometry(6.2, 6.8, 5, 20), mStone, 0, 2.5, 0, tw); add(new THREE.CylinderGeometry(6.6, 6.6, 0.5, 20), mCream, 0, 5.2, 0, tw);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; add(box(0.5, 5, 0.5), mCream, Math.sin(a) * 6.4, 2.5, Math.cos(a) * 6.4, tw); }
  for (let i = 0; i < 7; i++) { const a = Math.PI * 0.2 + (i / 6) * Math.PI * 0.6; const w = add(box(0.9, 1.6, 0.2), mDark, Math.sin(a) * 6.5, 2.4, Math.cos(a) * 6.5, tw); w.rotation.y = a; }
  add(new THREE.CylinderGeometry(3.6, 4.6, 14, 20), mTower, 0, 12.4, 0, tw);
  add(new THREE.CylinderGeometry(3.4, 3.6, 0.5, 20), mCream, 0, 19.6, 0, tw);
  add(new THREE.CylinderGeometry(3.2, 3.2, 0.3, 20), mDark, 0, 20.1, 0, tw);
  add(new THREE.CylinderGeometry(1.9, 1.9, 2.8, 14), mGlass, 0, 21.7, 0, tw); add(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff3b0' }), 0, 21.7, 0, tw, { cast: false });
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; add(box(0.12, 2.8, 0.12), mDark, Math.sin(a) * 1.9, 21.7, Math.cos(a) * 1.9, tw); }
  add(new THREE.ConeGeometry(2.3, 1.8, 14), M('#c8312c'), 0, 24.0, 0, tw);
  const LANT = [0, 21.7, -10];
  const beam = new THREE.Group(); beam.position.set(...LANT); scene.add(beam);
  for (const [rad, op] of [[10, 0.2], [4.5, 0.28]]) { const geo = new THREE.ConeGeometry(rad, 170, 16, 1, true); geo.translate(0, -85, 0); geo.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(geo, beamMat.clone()); m.material.opacity = op; m.userData.ndSkip = true; m.renderOrder = 2; beam.add(m); }
  // jetty + little boat near the plateau edge (sailors scene)
  add(box(7, 0.25, 1.6), mWood, 6, 0.1, 6.5, world); for (let i = 0; i < 5; i++) add(box(0.2, 1.4, 0.2), mWood2, 3 + i * 1.5, -0.4, 5.7, world);
  { const b = new THREE.Group(); b.position.set(12, -0.55, 8); b.rotation.y = 0.3; world.add(b); add(box(4.4, 0.7, 1.5), M('#c8643a'), 0, 0.2, 0, b); add(box(4.6, 0.12, 1.7), mCream, 0, 0.58, 0, b); add(box(0.1, 3.4, 0.1), mWood2, 0, 2.2, 0, b); add(box(0.04, 2.6, 1.5), M('#f4efe0'), 0.05, 2.2, 0.3, b); }
  // ---------- interior (x = IX) ----------
  const X = (x) => IX + x;
  const stoneF = cv(512, 512, (g, w, h) => { g.fillStyle = '#a8a094'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { { const v = 150 + r() * 36 | 0; g.fillStyle = `rgb(${v + 10},${v + 4},${v - 10})`; } g.fillRect(x * 64 + 3, y * 64 + 3, 58, 58); } });
  const fl = add(new THREE.PlaneGeometry(50, 30), toon({ map: P.tex(stoneF, 14, 8) }), X(5), 0.005, 2, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  add(tbox(50, 5, 0.5, 3), mStone, X(5), 2.5, -6.2, world); add(tbox(0.5, 5, 30, 3), mStone, X(-19.5), 2.5, 2, world); add(tbox(0.5, 5, 30, 3), mStone, X(29.5), 2.5, 2, world);
  for (const wx of [-14, -4, 4, 14, 22]) { add(box(2.0, 2.6, 0.12), new THREE.MeshBasicMaterial({ color: '#bfe2f2', fog: false }), X(wx), 2.7, -5.9, world, { cast: false }); add(box(2.3, 0.2, 0.3), mCream, X(wx), 1.35, -5.85, world); add(box(2.3, 0.2, 0.3), mCream, X(wx), 4.1, -5.85, world); add(box(0.1, 2.6, 0.14), mWood2, X(wx), 2.7, -5.85, world); }
  add(box(50, 0.25, 0.4), mCream, X(5), 4.9, -6.0, world);
  // mirrors rack (the old way): 5 polished metal dishes + oil lamps
  const flames = [];
  { const g = new THREE.Group(); g.position.set(X(-8), 0, -3.2); world.add(g); add(box(6.4, 0.2, 0.7), mWood, 0, 0.9, 0, g); for (const s of [-1, 1]) add(box(0.16, 1.9, 0.5), mWood2, s * 3.1, 0.95, 0, g);
    for (let i = 0; i < 5; i++) { const x = -2.5 + i * 1.25, d = add(new THREE.SphereGeometry(0.62, 18, 10, 0, 6.283, 0, 1.25), mSilver, x, 1.75, -0.05, g); d.rotation.x = Math.PI / 2 + 0.2; d.material.side = THREE.DoubleSide;
      add(box(0.3, 0.35, 0.3), mBrass, x, 1.1, 0.35, g); const fl2 = add(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb23a' }), x, 1.5, 0.35, g, { cast: false }); fl2.scale.y = 1.5; flames.push(fl2); } }
  // plan table with scrolls (atelier)
  { const g = new THREE.Group(); g.position.set(X(-3.6), 0, -3.4); world.add(g); add(box(2.8, 0.1, 1.2), mWood, 0, 0.95, 0, g); for (const sx of [-1.25, 1.25]) for (const sz of [-0.45, 0.45]) add(box(0.12, 0.95, 0.12), mWood2, sx, 0.47, sz, g);
    add(box(1.6, 0.02, 0.9), M('#f6f1e4'), -0.2, 1.01, 0, g); for (let i = 0; i < 3; i++) { const sc = add(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), M('#efe6cf'), 0.9, 1.12, -0.3 + i * 0.3, g); sc.rotation.z = Math.PI / 2; }
    add(new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8), M('#2f3a5a'), 1.05, 1.2, 0.35, g); }
  // giant glass block ("épais comme un tonneau") + ring lens, on a stand at x = +4
  const stand = new THREE.Group(); stand.position.set(X(4), 0, -2); world.add(stand);
  add(box(2.6, 0.5, 1.4), mWood2, 0, 0.25, 0, stand);
  const block = new THREE.Group(); stand.add(block); block.position.set(0, 1.35, 0);
  const bm = add(new THREE.CylinderGeometry(1.0, 1.0, 1.7, 22), mGlass, 0, 0, 0, block); bm.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.98, 0.98, 0.05, 22), M('#d4f2f2'), 0, 0, 0.86, block).rotation.x = Math.PI / 2;
  const lens = new THREE.Group(); stand.add(lens); lens.position.set(0, 1.55, 0.2);
  add(fresnelGeo(THREE, 1.25, 9), mGlass, 0, 0, 0, lens); const frame = add(new THREE.TorusGeometry(1.3, 0.08, 8, 40), mBrass, 0, 0, 0.05, lens);
  add(box(0.1, 1.1, 0.1), mBrass, 0, -1.9, -0.1, lens);
  // rotating lens drum at x = +12 (lantern room): 4 ring-lens panels around a bright lamp, brass frame, behind a stone ring wall
  const drum = new THREE.Group(); drum.position.set(X(12), 0, -2.2); world.add(drum);
  const rot = new THREE.Group(); rot.position.y = 1.75; drum.add(rot);
  add(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 16), mBrass, 0, -1.55, 0, drum); add(new THREE.CylinderGeometry(0.9, 1.2, 0.5, 16), mBrass, 0, -1.55 + 0.05, 0, drum);
  const bulb = add(new THREE.SphereGeometry(0.35, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff3b0' }), 0, 0, 0, rot, { cast: false });
  for (let k = 0; k < 4; k++) { const pg = new THREE.Group(); pg.rotation.y = (k * Math.PI) / 2; rot.add(pg); const l = add(fresnelGeo(THREE, 1.1, 8, 0.04, 0.08), mGlass, 0, 0, 1.35, pg); add(new THREE.TorusGeometry(1.16, 0.07, 8, 30), mBrass, 0, 0, 1.4, pg); }
  add(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16), mBrass, 0, 1.55, 0, rot); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; add(box(0.1, 3.1, 0.1), mBrass, Math.sin(a) * 1.2, 0, Math.cos(a) * 1.2, rot); }
  // wall racks / crates in the workshop
  for (const x of [-16, 8, 17, 25]) { add(box(1.6, 2.4, 0.6), mWood2, X(x), 1.2, -5.5, world); for (let k = 0; k < 3; k++) add(box(1.5, 0.06, 0.62), mWood, X(x), 0.5 + k * 0.7, -5.5, world); }
  // clouds
  const clouds = [];
  { const rr = P.rng(91); for (let i = 0; i < 14; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 120 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  function state(S, f) {
    const on = S.beamOn ?? 0; beam.visible = on > 0.01; beam.rotation.y = S.beamYaw ?? 0; beam.children.forEach((m, i) => { m.material.opacity = (i ? 0.3 : 0.2) * on; });
    const bk = S.block ?? 0; block.visible = bk > 0.01; block.scale.setScalar(Math.max(0.01, bk)); const ln = S.lens ?? 0; lens.visible = ln > 0.01; lens.scale.setScalar(Math.max(0.01, ln));
    rot.rotation.y = S.drum ?? 0; flames.forEach((m, i) => { const fl3 = S.flame ?? 1; m.scale.set(fl3, 1.5 * fl3 * (1 + 0.15 * Math.sin(f * 0.7 + i * 2)), fl3); });
  }
  return { DECK, SPOTS, clouds, state };
}
