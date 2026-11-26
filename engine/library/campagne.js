// Library set: campagne 1944-45 (camp d'artistes-soldats, atelier de gonflage, faux camp de chars gonflables, route + camion à haut-parleurs,
// tente radio, village normand, bords du Rhin avec colline allemande et bateaux). Chars en caoutchouc gonflables : makeTank().
// Ground level DECK = 0. Cameras look from +z toward -z. Zones are spread along x (see ZONE) so a whip/rise transition can hop between them.
// state(S, f): tank { pos:[x,y,z], ry, k (0 flat .. 1 full), sag 0..1 (barrel + turret droop), sx, sy (squash), roll },
//   truck (x offset on the road), boats (0..1 crossing), flagT (seconds), lamp 0..1 (lanterns glow).
export const DECK = 0;
export const ZONE = { camp: 0, pump: 60, fake: 120, road: 180, radio: 240, village: 300, rhin: 380, cross: 500 };
export const RIVER_Z = [-8, -95];     // near bank z, far bank z
export const HILL = [415, 5.5, -102]; // German observation hill (top)
export const SPOTS = { camp: [0, 0, 0], pump: [60, 0, 0], fake: [120, 0, 0], road: [180, 0, 0], radio: [240, 0, 0], village: [300, 0, 0], rhin: [380, 0, 0], cross: [500, 0, 0] };

/** Inflatable tank (Pourkoipa original). Returns { g, set(k, sag, sx, sy) }. Hull length ~2.2 m at scale 1. */
export function makeTank(ctx, { s = 1, body = '#6f8f3a', dark = '#2d3a22', stripe = '#e8d9a0' } = {}) {
  const { THREE, add, box, toon } = ctx;
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g);
  const mB = toon({ color: body }), mD = toon({ color: dark }), mS = toon({ color: stripe }), mL = toon({ color: '#9db85a' });
  const round = (w, h, d, rad) => new THREE.CapsuleGeometry(rad, 1, 6, 12);
  const hull = add(new THREE.CapsuleGeometry(0.36, 1.5, 6, 14), mB, 0, 0.62, 0, g); hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1.0, 1.35);
  const glacis = add(new THREE.SphereGeometry(0.42, 12, 8), mL, 1.05, 0.62, 0, g); glacis.scale.set(0.7, 0.8, 1.55);
  for (const z of [-0.62, 0.62]) {
    const tr = add(new THREE.CapsuleGeometry(0.2, 1.7, 6, 12), mD, 0, 0.3, z, g); tr.rotation.z = Math.PI / 2; tr.scale.set(1, 1.0, 0.75);
    for (const x of [-0.8, -0.27, 0.27, 0.8]) add(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 10), mL, x, 0.3, z * 1.28, g).rotation.x = Math.PI / 2;
  }
  const turret = new THREE.Group(); turret.position.set(-0.05, 0.98, 0); g.add(turret);
  const dome = add(new THREE.SphereGeometry(0.5, 14, 10), mB, 0, 0.1, 0, turret); dome.scale.set(1.05, 0.62, 0.95);
  add(new THREE.SphereGeometry(0.14, 8, 6), mD, -0.15, 0.4, 0, turret);
  const gun = new THREE.Group(); gun.position.set(0.4, 0.12, 0); turret.add(gun);
  const barrel = add(new THREE.CylinderGeometry(0.075, 0.095, 1.25, 10), mD, 0.62, 0, 0, gun); barrel.rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 10), mD, 1.26, 0, 0, gun).rotation.z = Math.PI / 2;
  add(box(0.08, 0.5, 0.9), mS, 0.5, 0.62, 0, g, { cast: false }).rotation.z = 0.25; // painted white star plate
  root.scale.setScalar(s);
  return { g: root, set: (k = 1, sag = 0, sx = 1, sy = 1) => {
    const kk = Math.max(0.02, k);
    g.scale.set((1 + 0.5 * (1 - kk)) * sx, (0.1 + 0.9 * kk) * sy, (1 + 0.3 * (1 - kk)) * sx);
    turret.position.y = 0.98 - 0.25 * sag; turret.rotation.z = -0.25 * sag; gun.rotation.z = -0.55 * sag; barrel.rotation.z = Math.PI / 2;
  } };
}

/** Boat i position [x, y, z] when the crossing is at u0 (0..1): from the near bank (z = -12) toward the far bank (-z). */
export function boatPos(i, u0) { const u = Math.max(0, Math.min(1, u0 * 1.25 - i * 0.04)); return [ZONE.cross - 18 + i * 7 + (i % 2) * 2, 0.05, RIVER_Z[0] - 4 + u * (RIVER_Z[1] - RIVER_Z[0] + 10)]; }
export const ROAD_Z = 1.5;

export function buildCampagne(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const M = (c) => toon({ color: c });
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1944); let flagMesh = null;
  const meadow = cv(512, 512, (g, w, h) => { g.fillStyle = '#8fb04c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${90 + r() * 70 | 0},${140 + r() * 60 | 0},${50 + r() * 30 | 0},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); } });
  const dirt = cv(512, 512, (g, w, h) => { g.fillStyle = '#c4a272'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${118 + r() * 50 | 0},${76 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); } });
  const cobble = cv(512, 512, (g, w, h) => { g.fillStyle = '#9a948a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 16; x < w; x += 32) { const c = 130 + r() * 50 | 0; g.fillStyle = `rgb(${c},${c - 4},${c - 10})`; g.strokeStyle = 'rgba(40,30,34,0.8)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x + 1, y + 1, 30, 30, 8); g.fill(); g.stroke(); } });
  const river = cv(512, 512, (g, w, h) => { g.fillStyle = '#4a9ab8'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { g.strokeStyle = `rgba(255,255,255,${0.1 + r() * 0.25})`; g.lineWidth = 2 + r() * 3; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 6, x + 44, y); g.stroke(); } });
  const canvasTex = cv(256, 256, (g, w, h) => { g.fillStyle = '#7d8a54'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(40,50,30,0.25)'; g.fillRect(0, y, w, 3); } });
  const mMeadow = toon({ map: P.tex(meadow, 260, 260) }), mDirt = toon({ map: P.tex(dirt, 5, 4) }), mCobble = toon({ map: P.tex(cobble, 10, 2) }), mRiver = toon({ map: P.tex(river, 40, 20) });
  const mCanvas = toon({ map: P.tex(canvasTex, 3, 3) }), mPlank = toon({ map: P.tex(P.planks(5), 2, 2) }), mTile = toon({ map: P.tex(P.roof(9), 3, 2) });
  const mWall = toon({ map: P.tex(P.plaster(31, 40), 1, 1) }), mStone = toon({ map: P.tex(P.stone(4, 40, 12, 72), 2, 1) });
  const mWood = M('#8a5d38'), mWood2 = M('#5a3b22'), mIron = M('#33302f'), mOlive = M('#6b7a3a'), mRed = M('#c8312c'), mGlass = M('#9fdce0'), mCream = M('#efe6cf');
  const ground = add(new THREE.PlaneGeometry(4000, 4000), mMeadow, 0, -0.02, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  const pad = (x, z, w, d, m, y = 0.01) => { const p = add(new THREE.PlaneGeometry(w, d), m, x, y, z, world, { cast: false }); p.rotation.x = -Math.PI / 2; return p; };
  const tree = (x, z, s = 1) => { add(new THREE.CylinderGeometry(0.2 * s, 0.32 * s, 3 * s, 7), M('#6b4a32'), x, 1.5 * s, z, world); for (let i = 0; i < 5; i++) { const b = add(new THREE.IcosahedronGeometry((1.2 + r() * 0.5) * s, 1), M(['#5e9e3e', '#6fae45', '#4f8a38'][i % 3]), x + (r() - 0.5) * 1.6 * s, (3.4 + r() * 1.2) * s, z + (r() - 0.5) * 1.6 * s, world); b.scale.y = 0.85; } };
  const poplar = (x, z, s = 1) => { add(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 3 * s, 5), M('#6b4a32'), x, 1.5 * s, z, world); const c = add(new THREE.SphereGeometry(1, 9, 8), M(r() > 0.5 ? '#5f8f3a' : '#79a343'), x, 6.5 * s, z, world); c.scale.set(1.2 * s, 4.4 * s, 1.2 * s); };
  const hill = (x, z, rad, h, col) => { const m = add(new THREE.SphereGeometry(rad, 20, 10, 0, 6.283, 0, 1.5708), M(col), x, 0, z, world, { cast: false }); m.scale.y = h / rad; return m; };
  const treeLine = (x0, x1, z, n, big = 1) => { for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i + r() * 0.6) / n; if (r() > 0.4) tree(x, z + (r() - 0.5) * 6, big * (1 + r() * 0.5)); else poplar(x, z + (r() - 0.5) * 6, big * (0.9 + r() * 0.4)); } };
  const tent = (x, z, w = 5, d = 4, ry = 0, col = mCanvas) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, 2.4); sh.closePath();
    const t = add(new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }), col, 0, 0, 0, g); t.rotation.y = Math.PI / 2; t.position.set(-w / 2, 0, 0);
    add(box(0.9, 1.5, 0.05), M('#2b2218'), 0, 0.75, d / 2 - 0.55, g, { cast: false }); return g; };
  const lampPost = (x, z, h = 3) => { add(new THREE.CylinderGeometry(0.05, 0.07, h, 6), mIron, x, h / 2, z, world); return add(new THREE.SphereGeometry(0.2, 8, 6), lampMat, x, h + 0.1, z, world, { cast: false }); };
  const lampMat = new THREE.MeshBasicMaterial({ color: '#fff0b8', fog: false });
  const crate = (x, z, s = 0.6, y = 0) => add(box(s, s, s), mWood, x, y + s / 2, z, world);
  const barrel = (x, z, col = '#6b7a3a') => add(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 12), M(col), x, 0.45, z, world);
  const sandbag = (x, z, n = 4) => { for (let i = 0; i < n; i++) { const b = add(new THREE.SphereGeometry(0.28, 8, 6), M('#c9b088'), x + i * 0.5, 0.16, z, world); b.scale.set(1.3, 0.6, 0.9); } };

  // ================= camp (x = 0) : tentes, drapeau, atelier de peinture, arbres =================
  pad(0, -4, 44, 30, mDirt);
  tent(-9, -9, 6, 4.4, 0.15); tent(9, -10, 6, 4.4, -0.2, M('#8a9660')); tent(-1, -15, 7, 5, 0);
  for (const [x, z] of [[-4, -3], [5, -2], [-7, 1.5], [7.5, 1.8]]) crate(x, z, 0.55 + r() * 0.2);
  barrel(-5.5, -4); barrel(6, -5, '#a83a2a'); sandbag(-12, -2, 5); sandbag(9, 3, 4);
  { const pole = add(new THREE.CylinderGeometry(0.05, 0.06, 7, 6), mWood2, 13, 3.5, -8, world); const fl = add(box(2.1, 1.3, 0.04), M('#e8442e'), 14.1, 6.2, -8, world, { cast: false }); fl.userData.flag = true; flagMesh = fl; add(box(2.1, 0.43, 0.05), M('#ffffff'), 14.1, 6.2, -8, world, { cast: false }); }
  // easel + painted board (the camouflage painters)
  { const e = new THREE.Group(); e.position.set(-3.6, 0, -6); world.add(e); for (const dx of [-0.5, 0.5]) { const l = add(box(0.06, 2.2, 0.06), mWood2, dx, 1.05, 0, e); l.rotation.z = -dx * 0.25; }
    add(box(1.6, 1.1, 0.06), M('#e6d8b0'), 0, 1.5, 0.1, e); add(box(1.2, 0.7, 0.04), M('#6f8f3a'), 0, 1.45, 0.14, e, { cast: false }); }
  treeLine(-40, 40, -26, 14); hill(-30, -50, 40, 9, '#7aa046'); hill(32, -55, 46, 12, '#86ac4c'); hill(0, -80, 70, 14, '#6f9a44');
  for (let i = 0; i < 10; i++) add(new THREE.CylinderGeometry(0.9, 0.9, 0.45, 12), M('#d8b24c'), -28 + i * 6.5 + r() * 3, 0.25, -34 + r() * 6, world); // hay bales

  // ================= atelier de gonflage (x = 60) : compresseur + lanternes =================
  const PX = ZONE.pump;
  pad(PX, -4, 40, 26, mDirt);
  { const g = new THREE.Group(); g.position.set(PX - 3.4, 0, -1.6); world.add(g);
    add(box(1.6, 1.0, 1.0), mRed, 0, 0.7, 0, g); add(box(1.7, 0.16, 1.1), mIron, 0, 1.25, 0, g); add(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 12), M('#b8b8c0'), -0.1, 1.5, 0.1, g).rotation.z = Math.PI / 2;
    for (const dx of [-0.55, 0.55]) add(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12), mIron, dx, 0.28, 0.55, g).rotation.x = Math.PI / 2;
    const gau = add(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16), mCream, 0.4, 1.0, 0.52, g, { cast: false }); gau.rotation.x = Math.PI / 2;
    add(box(0.04, 0.2, 0.02), M('#c8312c'), 0.4, 1.02, 0.56, g, { cast: false }); }
  { const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(PX - 2.6, 0.9, -1.2), new THREE.Vector3(PX - 1.8, 0.1, -0.2), new THREE.Vector3(PX - 0.9, 0.12, 0.2), new THREE.Vector3(PX - 0.3, 0.55, -0.3)]);
    add(new THREE.TubeGeometry(curve, 24, 0.07, 6, false), M('#2b2b30'), 0, 0, 0, world, { cast: false }); }
  for (const [x, z] of [[-9, -2], [9, -3], [-12, -9], [12, -10]]) { lampPost(PX + x, z, 3.2); }
  tent(PX - 10, -10, 6, 4.4, 0.1); tent(PX + 10, -12, 6, 4.4, -0.15); barrel(PX + 5, -4); crate(PX + 6.2, -3.4, 0.7); crate(PX + 6.5, -3.4, 0.5, 0.7); sandbag(PX - 14, -3, 4);
  treeLine(PX - 36, PX + 36, -26, 12); hill(PX - 20, -55, 42, 10, '#7aa046'); hill(PX + 30, -60, 50, 12, '#86ac4c');

  // ================= faux camp (x = 120) : rangée de chars et camions gonflés =================
  const FX0 = ZONE.fake;
  pad(FX0, -8, 90, 40, mDirt, 0.008);
  const fakes = [];
  const putFake = (x, z, ry, k = 1) => { const t = makeTank(ctx, { s: 1.7, body: r() > 0.5 ? '#6f8f3a' : '#7a9a44' }); t.g.position.set(x, 0, z); t.g.rotation.y = ry; t.set(k, 0); world.add(t.g); fakes.push(t); return t; };
  for (let i = 0; i < 7; i++) putFake(FX0 - 24 + i * 7.8, -4 - (i % 2) * 5, 0.1 * (i % 3 - 1));
  for (let i = 0; i < 5; i++) putFake(FX0 - 18 + i * 9, -22 - (i % 2) * 4, 0.12 * (i % 3 - 1));
  for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.position.set(FX0 - 14 + i * 12, 0, -13); g.rotation.y = 0.2 * (i % 2 ? 1 : -1); world.add(g); // gonflable trucks
    add(box(1.6, 1.3, 1.5), M('#7a9a44'), 0.9, 0.95, 0, g); add(box(2.8, 1.5, 1.7), M('#6f8f3a'), -1.0, 1.15, 0, g); for (const dx of [-1.8, -0.2, 1.3]) for (const dz of [-0.85, 0.85]) add(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12), mIron, dx, 0.42, dz, g).rotation.x = Math.PI / 2; }
  { const RH = ZONE.rhin; for (let i = 0; i < 8; i++) putFake(RH - 26 + i * 7.4, 9 + (i % 2) * 5, 0.1 * (i % 3 - 1)); for (let i = 0; i < 3; i++) putFake(RH - 18 + i * 14, 21, 0.2 * (i % 2 ? 1 : -1)); }
  treeLine(FX0 - 50, FX0 + 50, -34, 16); hill(FX0 - 30, -60, 44, 11, '#7aa046'); hill(FX0 + 34, -64, 50, 13, '#86ac4c'); for (let i = 0; i < 6; i++) tent(FX0 - 40 + i * 14, -28, 4, 3.4, 0.3 * (i % 2 ? 1 : -1), M('#8a9660'));

  // ================= route + camion à haut-parleurs (x = 180) =================
  const RX = ZONE.road;
  pad(RX, -1, 160, 8, M('#b49a76'), 0.012); pad(RX, -1, 160, 0.6, M('#d8c8a0'), 0.02);
  for (let i = -8; i <= 8; i++) { poplar(RX + i * 10 + r() * 3, -8 - r() * 3, 0.9 + r() * 0.3); }
  for (const dx of [-30, 40]) { const g = new THREE.Group(); g.position.set(RX + dx, 0, -16); world.add(g); add(tbox(6, 3.4, 5, 3), mWall, 0, 1.7, 0, g); const sh = new THREE.Shape(); sh.moveTo(-3.2, 0); sh.lineTo(3.2, 0); sh.lineTo(0, 2.4); sh.closePath(); add(new THREE.ExtrudeGeometry(sh, { depth: 6.6, bevelEnabled: false }), mTile, -3.3, 3.4, 0, g).rotation.y = Math.PI / 2; }
  treeLine(RX - 80, RX + 80, -28, 20); hill(RX - 30, -58, 46, 10, '#7aa046'); hill(RX + 40, -62, 52, 13, '#86ac4c');
  for (let i = 0; i < 16; i++) { const z = 3.8 + r() * 1.5; add(new THREE.IcosahedronGeometry(0.4 + r() * 0.3, 1), M('#5e9e3e'), RX - 78 + i * 10 + r() * 4, 0.3, z, world); } // hedge bushes along the road
  const truck = new THREE.Group(); world.add(truck);
  { add(box(1.8, 1.6, 2.1), M('#6b7a3a'), 2.6, 1.55, 0, truck); add(box(0.08, 0.7, 1.7), mGlass, 3.52, 1.8, 0, truck, { cast: false }); add(box(4.8, 0.3, 2.3), mIron, -0.4, 0.62, 0, truck);
    add(box(4.6, 0.12, 2.2), mWood, -0.4, 0.82, 0, truck);
    for (const dx of [-2.2, -0.3, 2.5]) for (const dz of [-1.12, 1.12]) add(new THREE.CylinderGeometry(0.55, 0.55, 0.36, 14), mIron, dx, 0.55, dz, truck).rotation.x = Math.PI / 2;
    // two huge loudspeaker horns on the bed, pointing forward (+x), facing the audience
    for (const dz of [-0.55, 0.55]) { const horn = add(new THREE.CylinderGeometry(1.0, 0.28, 1.6, 20, 1, true), M('#c8cdd4'), -0.6, 2.2, dz, truck); horn.rotation.z = -Math.PI / 2; horn.material.side = THREE.DoubleSide;
      add(new THREE.CylinderGeometry(0.28, 0.28, 0.6, 12), mIron, -1.55, 2.2, dz, truck).rotation.z = Math.PI / 2; add(new THREE.CircleGeometry(0.95, 20), M('#3a3a44'), 0.15, 2.2, dz, truck, { cast: false }).rotation.y = Math.PI / 2; add(box(0.14, 1.0, 0.14), mIron, -0.8, 1.55, dz, truck); } }

  // ================= tente radio (x = 240) =================
  const QX = ZONE.radio;
  pad(QX, -4, 40, 26, mDirt);
  tent(QX, -9, 9, 6, 0, M('#7d8a54')); tent(QX - 14, -8, 5, 4, 0.3); tent(QX + 14, -9, 5, 4, -0.25);
  { const g = new THREE.Group(); g.position.set(QX, 0, -2.5); world.add(g);
    add(box(3.2, 0.1, 1.3), mWood, 0, 0.95, 0, g); for (const sx of [-1.45, 1.45]) for (const sz of [-0.5, 0.5]) add(box(0.1, 0.95, 0.1), mWood2, sx, 0.47, sz, g);
    add(box(1.0, 0.55, 0.6), M('#4a5a40'), -0.7, 1.33, 0, g); add(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 14), mCream, -0.9, 1.35, 0.31, g, { cast: false }).rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 14), mCream, -0.5, 1.35, 0.31, g, { cast: false }).rotation.x = Math.PI / 2;
    add(box(0.7, 0.28, 0.5), M('#2f3440'), 0.7, 1.14, 0.1, g); add(box(0.6, 0.04, 0.3), mCream, 0.7, 1.3, -0.05, g, { cast: false }); // typewriter
    add(box(0.5, 0.05, 0.36), M('#f3e6c8'), 1.25, 1.02, 0.35, g, { cast: false }); }
  { const mast = add(new THREE.CylinderGeometry(0.04, 0.06, 8, 6), mIron, QX - 5, 4, -5, world); for (let k = 0; k < 3; k++) add(box(2.2, 0.05, 0.05), mIron, QX - 5, 3.2 + k * 1.6, -5, world); add(new THREE.CylinderGeometry(0.01, 0.01, 11, 3), mIron, QX - 0.2, 6, -5, world).rotation.z = 1.46; }
  lampPost(QX - 4, -1.5, 2.6); lampPost(QX + 5, -2.5, 2.6); crate(QX + 7, -3, 0.7); crate(QX - 8, -2.5, 0.6); barrel(QX + 8.5, -4); sandbag(QX - 12, -1.5, 5);
  treeLine(QX - 40, QX + 40, -26, 12); hill(QX - 20, -56, 42, 10, '#7aa046'); hill(QX + 30, -60, 50, 12, '#86ac4c');

  // ================= village normand (x = 300) =================
  const VX = ZONE.village;
  pad(VX, 1, 70, 7, mCobble, 0.02); pad(VX, -5.5, 70, 6, M('#b9b2a4'), 0.03);
  const house = (x, z, w, h, col, roof = mTile, d = 5) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    add(tbox(w, h, d, 3), col, 0, h / 2, 0, g); const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.5, 0); sh.lineTo(d / 2 + 0.5, 0); sh.lineTo(0, 2.6); sh.closePath();
    add(new THREE.ExtrudeGeometry(sh, { depth: w + 1, bevelEnabled: false }), roof, -(w + 1) / 2, h, 0, g).rotation.y = Math.PI / 2; (() => { const rm = g.children[g.children.length - 1]; rm.position.set(-(w + 1) / 2, h, 0); })();
    add(box(1.0, 2.1, 0.12), M('#5a3a24'), -w * 0.2, 1.05, d / 2 + 0.03, g); for (const wx of [w * 0.15, w * 0.36]) { add(box(0.9, 1.0, 0.12), M('#46557a'), wx, 2.0, d / 2 + 0.03, g, { cast: false }); add(box(1.1, 0.12, 0.3), M('#c8643a'), wx, 1.4, d / 2 + 0.1, g, { cast: false }); }
    add(new THREE.CylinderGeometry(0.3, 0.38, 1.2, 6), mStone, w * 0.3, h + 2.2, -0.8, g); return g; };
  house(VX - 14, -12, 8, 4.4, mWall); house(VX - 3, -13, 7, 5.2, toon({ map: P.tex(P.plaster(32, 34), 1, 1) })); house(VX + 8, -12, 8, 4.4, mWall); house(VX + 19, -13, 7, 4.8, mStone);
  { const g = new THREE.Group(); g.position.set(VX + 30, 0, -16); world.add(g); add(tbox(5, 11, 5, 3), mStone, 0, 5.5, 0, g); add(new THREE.ConeGeometry(3.7, 5, 4), M('#58637a'), 0, 13.5, 0, g).rotation.y = Math.PI / 4; add(box(1.1, 2.2, 0.1), M('#2b2218'), 0, 1.1, 2.55, g); }
  for (let i = 0; i < 4; i++) { const x = VX - 12 + i * 3.6, z = -6.8; add(box(0.1, 1.0, 0.1), mWood2, x, 0.5, z, world); }
  for (let i = 0; i < 6; i++) tree(VX - 30 + i * 12 + r() * 4, -24, 1.0 + r() * 0.4);
  hill(VX - 20, -56, 44, 10, '#7aa046'); hill(VX + 30, -60, 50, 12, '#86ac4c');
  // marché : étal rayé + panneau de village
  { const g = new THREE.Group(); g.position.set(VX + 4.4, 0, -4.2); world.add(g); add(box(2.4, 0.1, 1.1), mWood, 0, 0.9, 0, g); add(box(2.3, 0.85, 1.0), mWood2, 0, 0.45, 0, g); for (const sx of [-1.15, 1.15]) add(box(0.08, 2.4, 0.08), mWood2, sx, 1.2, -0.5, g);
    for (let i = 0; i < 6; i++) { const st = add(box(0.42, 0.05, 1.5), M(i % 2 ? '#fff' : '#2f7fd8'), -1.05 + i * 0.42, 2.45, 0.15, g); st.rotation.x = 0.28; } for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.14, 8, 6), M(['#e8442e', '#f2b52a', '#7cc043'][i % 3]), -0.8 + i * 0.3, 1.04, 0.1, g, { cast: false }); }
  { const g = new THREE.Group(); g.position.set(VX - 6.5, 0, -4.4); world.add(g); const c = cv(512, 192, (c2) => { c2.fillStyle = '#f3ead2'; c2.fillRect(0, 0, 512, 192); c2.strokeStyle = '#3b2a20'; c2.lineWidth = 14; c2.strokeRect(7, 7, 498, 178); c2.fillStyle = '#3b2a20'; c2.font = '800 78px Montserrat, Arial, sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('VILLAGE', 256, 100); });
    add(box(0.1, 2, 0.1), mWood2, 0, 1, 0, g); add(new THREE.PlaneGeometry(1.5, 0.56), toon({ map: P.tex(c) }), 0, 2.05, 0.06, g, { cast: false }); add(box(1.56, 0.62, 0.05), mWood2, 0, 2.05, 0.02, g); }
  for (const [x, z] of [[VX - 9, -4.6], [VX + 11, -4.8]]) { add(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 14), M('#f0ece2'), x, 0.74, z, world); add(new THREE.CylinderGeometry(0.04, 0.04, 0.74, 6), mIron, x, 0.37, z, world); for (const k of [-1, 1]) add(box(0.4, 0.05, 0.4), M('#c0392b'), x + k * 0.65, 0.45, z, world); }

  // ================= le Rhin (x = 380..560) : fleuve, colline allemande, faux camp devant, bateaux =================
  const RHX = ZONE.rhin, W = r;
  { const m = add(new THREE.PlaneGeometry(250, RIVER_Z[0] - RIVER_Z[1]), mRiver, RHX + 70, 0.03, (RIVER_Z[0] + RIVER_Z[1]) / 2, world, { cast: false }); m.rotation.x = -Math.PI / 2; m.userData.river = true; }
  pad(RHX, 8, 60, 28, M('#b9a678'), 0.012); pad(RHX + 120, 3, 90, 14, M('#b9a678'), 0.012);
  hill(RHX + 35, RIVER_Z[1] - 6, 38, 6.5, '#6f9a44'); hill(RHX + 80, RIVER_Z[1] - 12, 48, 9, '#7aa046'); hill(RHX + 135, RIVER_Z[1] - 14, 50, 10, '#86ac4c'); hill(RHX - 20, RIVER_Z[1] - 20, 40, 9, '#7aa046');
  treeLine(RHX - 40, RHX + 200, RIVER_Z[1] - 4, 26, 1.2);
  treeLine(RHX - 30, RHX + 60, -3, 8); treeLine(RHX + 90, RHX + 200, 0, 8);
  // far-bank observation post (sandbags, bunker slit, dark flag)
  { const g = new THREE.Group(); g.position.set(RHX + 35, 6.1, RIVER_Z[1] + 1); world.add(g); add(tbox(6, 1.4, 3, 2), mStone, 0, 0.7, 0, g); add(box(4.6, 0.2, 2.2), M('#5a626a'), 0, 1.5, 0, g); sandbag(-2.4, 2, 5);
    const pl = add(new THREE.CylinderGeometry(0.05, 0.06, 4.2, 6), mWood2, 2.8, 2.1, 0.5, g); add(box(1.1, 0.7, 0.04), M('#2b2b30'), 3.4, 3.8, 0.5, g, { cast: false }); }
  // the boats (real army crossing, x = 500): wooden assault boats, each with a hull and benches
  const boats = [];
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); world.add(g);
    add(box(1.3, 0.14, 3.6), mWood2, 0, 0.2, 0, g);
    for (const sx of [-1, 1]) { const sd = add(box(0.12, 0.62, 3.9), mWood, sx * 0.68, 0.5, 0, g); sd.rotation.z = -sx * 0.12; }
    for (const sz of [-1, 1]) { const bw = add(box(1.35, 0.6, 0.12), mWood, 0, 0.5, sz * 1.95, g); bw.rotation.x = sz * 0.5; const tip = add(box(0.8, 0.5, 0.1), mWood, 0, 0.48, sz * 2.25, g); tip.rotation.x = sz * 0.7; }
    for (const z of [-1.0, 0, 1.0]) add(box(1.3, 0.08, 0.2), mWood2, 0, 0.62, z, g);
    boats.push(g); }

  // ================= fonction d'état =================
  const tankG = makeTank(ctx, { s: 1.0 }); world.add(tankG.g);
  const sheep = [];
  const state = (S, f) => {
    // hero tank
    const T = S.tank; tankG.g.visible = !!T;
    if (T) { tankG.g.position.set(...T.pos); tankG.g.rotation.set(0, T.ry || 0, T.roll || 0); tankG.g.scale.setScalar(T.s || 1); tankG.set(T.k ?? 1, T.sag || 0, T.sx || 1, T.sy || 1); }
    // fake camp breathes a little
    fakes.forEach((t, i) => t.set(1, 0, 1 + 0.012 * Math.sin(f * 0.07 + i), 1 + 0.02 * Math.sin(f * 0.09 + i * 1.3)));
    truck.position.set(RX + (S.truck ?? -60), 0.0, 1.5); truck.rotation.y = Math.PI * 0; truck.position.y = 0.02 * Math.sin(f * 0.6);
    // boats: from near bank (z = -8) across to far bank (z ≈ -92) heading -z
    boats.forEach((b, i) => { b.visible = S.boats !== undefined; const [bx, by, bz] = boatPos(i, S.boats ?? 0); b.position.set(bx + Math.sin(f * 0.05 + i) * 0.3, by + 0.04 * Math.sin(f * 0.2 + i), bz); b.rotation.set(0.03 * Math.sin(f * 0.17 + i), Math.PI / 2, 0.05 * Math.sin(f * 0.13 + i * 2)); });
    if (flagMesh) flagMesh.rotation.y = 0.15 * Math.sin(f * 0.12);
  };
  return { DECK, SPOTS, clouds: [], state, onLight: () => {}, boatPos, truckX: (S_truck) => RX + S_truck };
}
