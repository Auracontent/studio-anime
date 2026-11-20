// Library set: laboratoire de psychologie, années 1970 (lino, murs vert d'eau, plinthe orange, tables, étagères, store, horloge).
// Built far from the farm at x = LX so both sets live in one scene. Pulling line along x at z = 0, rope y = 1.3, dynamometer at LX + DYNO_X.
import { makeDyno, ROPE_Y, DYNO_X } from './ferme.js';
export const LX = 2000;
export function buildLabo(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1974);
  const lino = cv(512, 512, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#d9c9a0' : '#c9b488'; g.fillRect(x * 64, y * 64, 64, 64); }
    for (let k = 0; k < 300; k++) { g.fillStyle = 'rgba(120,96,60,0.12)'; g.fillRect(r() * w, r() * h, 3 + r() * 14, 1 + r() * 2); } });
  const wallC = cv(256, 256, (g, w, h) => { g.fillStyle = '#b6d6c2'; g.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${150 + r() * 40 | 0},${190 + r() * 30 | 0},${170 + r() * 30 | 0},0.25)`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); } });
  const mFloor = toon({ map: P.tex(lino, 14, 10) }), mWall = toon({ map: P.tex(wallC, 6, 1.4) }), mWain = toon({ color: '#e08a3a' }), mWood = toon({ color: '#9a6a3e' }), mWood2 = toon({ color: '#6a4426' });
  const mMetal = toon({ color: '#aeb6bf' }), mDark = toon({ color: '#2f3440' }), mCream = toon({ color: '#efe6cf' });
  const X = (x) => LX + x;
  const fl = add(new THREE.PlaneGeometry(40, 30), mFloor, X(0), 0.005, 2, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  // walls: back (z = -6), left (x = -13), right (x = +15)
  add(tbox(40, 4, 0.4, 3), mWall, X(0), 2, -6.2, world); add(box(40, 0.9, 0.46), mWain, X(0), 0.45, -6.0, world);
  add(tbox(0.4, 4, 30, 3), mWall, X(-14), 2, 2, world); add(box(0.46, 0.9, 30), mWain, X(-13.8), 0.45, 2, world);
  add(tbox(0.4, 4, 30, 3), mWall, X(16), 2, 2, world); add(box(0.46, 0.9, 30), mWain, X(15.8), 0.45, 2, world);
  add(box(40, 0.2, 0.3), mCream, X(0), 4.0, -6.0, world); // cornice
  // big window with venetian blind (back wall) + curtain strips
  for (const wx of [-7, 6]) { add(box(3.4, 2.2, 0.1), toon({ color: '#cfe6f2' }), X(wx), 2.3, -5.95, world, { cast: false }); add(box(3.7, 0.18, 0.2), mCream, X(wx), 3.5, -5.9, world); add(box(3.7, 0.18, 0.3), mCream, X(wx), 1.18, -5.85, world);
    for (let i = 0; i < 9; i++) add(box(3.3, 0.07, 0.04), toon({ color: i % 2 ? '#f4efe0' : '#e6dfca' }), X(wx), 3.35 - i * 0.12, -5.88, world, { cast: false }); }
  // 70s wall clock + wall poster (brain diagram) + chalkboard-ish panel
  { const c = add(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 24), toon({ color: '#f6f0dc' }), X(-1.5), 3.2, -5.9, world); c.rotation.x = Math.PI / 2; add(box(0.04, 0.3, 0.02), mDark, X(-1.5), 3.3, -5.82, world); add(box(0.24, 0.04, 0.02), mDark, X(-1.4), 3.2, -5.82, world); }
  add(box(2.2, 1.5, 0.06), toon({ color: '#d85a3a' }), X(2), 2.6, -5.93, world, { cast: false }); add(box(1.9, 1.2, 0.04), toon({ color: '#f4efe0' }), X(2), 2.6, -5.9, world, { cast: false });
  for (let i = 0; i < 4; i++) add(box(1.4, 0.06, 0.02), toon({ color: '#8a7a6a' }), X(2), 2.95 - i * 0.22, -5.86, world, { cast: false });
  // shelves with binders and boxes
  const shelf = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(X(x), 0, z); g.rotation.y = ry; world.add(g); add(box(2.4, 2.2, 0.5), mWood2, 0, 1.1, 0, g);
    for (let k = 0; k < 4; k++) { add(box(2.3, 0.05, 0.52), mWood, 0, 0.3 + k * 0.55, 0.02, g); const cols = ['#c8312c', '#2f5a8a', '#e0b440', '#3f7a4a', '#7a3a5a', '#e08a3a'];
      for (let i = 0; i < 9; i++) add(box(0.14, 0.38, 0.3), toon({ color: cols[(i * 3 + k) % 6] }), -1 + i * 0.25, 0.52 + k * 0.55, 0.05, g); } };
  shelf(-11, -5.5); shelf(11, -5.5); shelf(-13.4, 3, Math.PI / 2);
  // tables with equipment (oscilloscope-ish boxes, tape recorder, clipboards)
  const table = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(X(x), 0, z); g.rotation.y = ry; world.add(g); add(box(1.8, 0.06, 0.8), mWood, 0, 0.78, 0, g); for (const sx of [-0.8, 0.8]) for (const sz of [-0.3, 0.3]) add(box(0.06, 0.78, 0.06), mMetal, sx, 0.39, sz, g);
    add(box(0.5, 0.35, 0.4), mDark, -0.5, 1.0, 0, g); add(box(0.4, 0.22, 0.3), toon({ color: '#7a8a7a' }), 0.2, 0.92, 0, g); add(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), toon({ color: '#e8d46a' }), -0.5, 1.2, 0.14, g).rotation.x = Math.PI / 2; add(box(0.35, 0.03, 0.45), mCream, 0.65, 0.82, 0.05, g); };
  table(-6, -3.8); table(5, -4); table(-9.5, 5, 1.2); table(12, 4, -1.2);
  // plants, stool, trolley, desk lamp
  for (const [x, z] of [[-3.5, -5], [9, -5.3], [14, -2]]) { add(new THREE.CylinderGeometry(0.25, 0.18, 0.4, 10), toon({ color: '#c8643a' }), X(x), 0.2, z, world); for (let i = 0; i < 6; i++) { const lf = add(new THREE.IcosahedronGeometry(0.28, 0), toon({ color: ['#4f8a38', '#6fae45'][i % 2] }), X(x) + (r() - 0.5) * 0.4, 0.7 + r() * 0.5, z + (r() - 0.5) * 0.4, world); lf.scale.y = 1.4; } }
  for (const x of [-4, 3.5]) { add(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12), mWood2, X(x), 0.65, -3, world); add(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 6), mMetal, X(x), 0.32, -3, world); }
  // hanging neon lamps (visible in wide shots) + a door on the left wall
  for (const x of [-8, 0, 8]) add(box(2.4, 0.08, 0.3), new THREE.MeshBasicMaterial({ color: '#fffbe6' }), X(x), 3.75, -1, world, { cast: false });
  add(box(0.1, 2.3, 1.1), mWood2, X(-13.8), 1.15, -2.5, world); add(new THREE.SphereGeometry(0.06, 6, 5), toon({ color: '#d9a845' }), X(-13.7), 1.1, -2.1, world);
  // the pull line: anchor on the wall, dynamometer, rope
  const dyno = makeDyno(ctx, X(DYNO_X), 0, { casing: '#2f3440' });
  const rope = add(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), toon({ color: '#f1ece0' }), X(DYNO_X + 0.55 + 12), ROPE_Y, 0.02, world); rope.rotation.z = Math.PI / 2; rope.scale.set(1, 24, 1);
  function state(S) { dyno.setNeedle(S.dynoLab ?? 0); }
  return { state, dyno };
}
