// Set dressing kit: cartoon props built in code (no external assets), to make every set rich and lived-in.
// Usage in a library set or an episode world:
//   import { propKit } from './props.js';           (from engine/library/*.js)
//   import { propKit } from '../library/props.js';  (from episodes/<slug>/web/world.js)
//   const K = propKit(ctx, { seed: 7 });
//   K.tree(x, z, { s: 1.2 }); K.bush(x, z); K.bench(x, z, ry); K.lamp(x, z); K.stall(x, z, ry, { awning: ['#d23a32', '#fff'] });
//   K.verge(x0, x1, z0, z1)   -> grass tufts + flowers + pebbles over a strip (instanced, cheap)
//   K.scatter([...kinds], { x0, x1, z0, z1, n, avoid: (x, z) => bool })
// Every builder returns its THREE.Group (except the instanced ground cover). Sizes are in metres, ground at y = DECK (opts.y).
export function propKit(ctx, opts = {}) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const r = P.rng(opts.seed ?? 11), Y = opts.y ?? 0;
  const M = (c) => toon({ color: c });
  const LEAF = ['#5e9e3e', '#6fae45', '#4f8a38', '#7cb84e'], BARK = M('#6b4a32'), WOOD = M('#9a6a3e'), WOOD2 = M('#7a5130'), IRON = M('#2f3440');
  const leafM = LEAF.map(M), stoneM = ['#9a948a', '#b0aa9e', '#868077'].map(M);
  const grp = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, Y, z); g.rotation.y = ry; world.add(g); return g; };
  const blob = (g, rad, mat, x, y, z, sx = 1, sy = 0.85, sz = 1) => { const m = add(new THREE.IcosahedronGeometry(rad, 1), mat, x, y, z, g); m.scale.set(sx, sy, sz); m.rotation.set(r() * 3, r() * 3, r() * 3); return m; };
  const pick = (a) => a[Math.floor(r() * a.length)];
  const K = {};

  /** leafy tree: tapered trunk, two branches, canopy of 5-7 overlapping blobs in mixed greens */
  K.tree = (x, z, o = {}) => {
    const s = o.s ?? (0.9 + r() * 0.5), g = grp(x, z, r() * 6.28), h = 2.6 * s;
    add(new THREE.CylinderGeometry(0.16 * s, 0.3 * s, h, 7), BARK, 0, h / 2, 0, g);
    for (const k of [-1, 1]) { const b = add(new THREE.CylinderGeometry(0.06 * s, 0.11 * s, 1.3 * s, 5), BARK, k * 0.35 * s, h * 0.82, 0, g); b.rotation.z = -k * 0.7; }
    const n = 5 + Math.floor(r() * 3), base = o.leaf ? M(o.leaf) : null;
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + r(), rr = i === 0 ? 0 : (0.7 + r() * 0.5) * s;
      blob(g, (1.05 + r() * 0.45) * s, base || pick(leafM), Math.cos(a) * rr, h + (0.6 + r() * 0.9) * s, Math.sin(a) * rr, 1, 0.82, 1); }
    return g;
  };
  /** tall narrow tree (poplar / cypress) */
  K.poplar = (x, z, o = {}) => { const s = o.s ?? (0.9 + r() * 0.4), g = grp(x, z); add(new THREE.CylinderGeometry(0.1 * s, 0.16 * s, 2 * s, 6), BARK, 0, s, 0, g);
    for (let i = 0; i < 4; i++) blob(g, 0.95 * s, pick(leafM), (r() - 0.5) * 0.4 * s, (2.4 + i * 1.5) * s, (r() - 0.5) * 0.4 * s, 1, 1.25, 1); return g; };
  /** bush: 3-5 blobs, optional flowers on top */
  K.bush = (x, z, o = {}) => { const s = o.s ?? (0.6 + r() * 0.5), g = grp(x, z);
    const n = 3 + Math.floor(r() * 3); for (let i = 0; i < n; i++) blob(g, (0.55 + r() * 0.3) * s, pick(leafM), (r() - 0.5) * 1.1 * s, (0.4 + r() * 0.25) * s, (r() - 0.5) * 0.9 * s);
    if (o.flowers ?? r() > 0.5) { const fm = M(o.flowerCol || pick(['#ff6fa1', '#ffd23f', '#ffffff', '#c86bff'])); for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.09 * s, 6, 4), fm, (r() - 0.5) * 1.1 * s, (0.75 + r() * 0.2) * s, (r() - 0.5) * 0.9 * s, g, { cast: false }); }
    return g; };
  /** rocks / pebbles */
  K.rock = (x, z, o = {}) => { const s = o.s ?? (0.3 + r() * 0.6), g = grp(x, z); const m = add(new THREE.DodecahedronGeometry(s, 0), pick(stoneM), 0, s * 0.35, 0, g); m.scale.set(1.2, 0.6, 1); m.rotation.y = r() * 3; return g; };
  /** park bench */
  K.bench = (x, z, ry = 0, o = {}) => { const g = grp(x, z, ry), wm = o.color ? M(o.color) : M('#3f6f4a');
    for (let i = 0; i < 3; i++) add(box(1.8, 0.06, 0.13), wm, 0, 0.48, -0.16 + i * 0.16, g);
    for (let i = 0; i < 2; i++) add(box(1.8, 0.12, 0.05), wm, 0, 0.72 + i * 0.17, -0.27, g);
    for (const sx of [-0.78, 0.78]) { add(box(0.07, 0.48, 0.5), IRON, sx, 0.24, 0, g); add(box(0.07, 0.5, 0.06), IRON, sx, 0.75, -0.28, g); } return g; };
  /** street lamp (glows at night: returns { g, glass }) */
  K.lampMat = new THREE.MeshBasicMaterial({ color: '#fff0b8', fog: false });
  K.lamp = (x, z, o = {}) => { const g = grp(x, z), h = o.h ?? 3.8;
    add(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 8), IRON, 0, 0.25, 0, g); add(new THREE.CylinderGeometry(0.06, 0.08, h, 8), IRON, 0, h / 2, 0, g);
    add(new THREE.CylinderGeometry(0.22, 0.14, 0.5, 6), K.lampMat, 0, h + 0.2, 0, g, { cast: false }); add(new THREE.ConeGeometry(0.3, 0.25, 6), IRON, 0, h + 0.55, 0, g);
    return g; };
  /** wooden crate, barrel, sack */
  K.crate = (x, z, o = {}) => { const s = o.s ?? (0.5 + r() * 0.25), g = grp(x, z, r() * 0.6 - 0.3); const y = o.y ?? 0;
    add(box(s, s, s), WOOD, 0, y + s / 2, 0, g); for (const k of [-1, 1]) add(box(s * 1.02, s * 0.12, s * 1.02), WOOD2, 0, y + s / 2 + k * s * 0.32, 0, g);
    if (o.fruit) { const fm = M(o.fruit); for (let i = 0; i < 7; i++) add(new THREE.SphereGeometry(s * 0.13, 6, 5), fm, (r() - 0.5) * s * 0.7, y + s + 0.04, (r() - 0.5) * s * 0.7, g, { cast: false }); } return g; };
  K.barrel = (x, z, o = {}) => { const s = o.s ?? 1, g = grp(x, z); add(new THREE.CylinderGeometry(0.34 * s, 0.34 * s, 0.95 * s, 12), WOOD, 0, 0.48 * s, 0, g);
    add(new THREE.CylinderGeometry(0.38 * s, 0.38 * s, 0.4 * s, 12), WOOD, 0, 0.48 * s, 0, g); for (const k of [0.12, 0.48, 0.84]) add(new THREE.CylinderGeometry(0.385 * s, 0.385 * s, 0.05 * s, 12), IRON, 0, k * s, 0, g); return g; };
  K.sack = (x, z, o = {}) => { const g = grp(x, z, r() * 3); blob(g, 0.32, M(o.color || '#c9b088'), 0, 0.3, 0, 1, 1.15, 0.85); return g; };
  /** fence along a line from (x0,z0) to (x1,z1) */
  K.fence = (x0, z0, x1, z1, o = {}) => { const g = grp(0, 0), fm = M(o.color || '#e9e2d0'), L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 1.2)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i <= n; i++) { const t = i / n; add(box(0.1, 1, 0.1), fm, x0 + (x1 - x0) * t, 0.5, z0 + (z1 - z0) * t, g); }
    for (const yy of [0.35, 0.75]) { const rail = add(box(0.05, 0.08, L), fm, (x0 + x1) / 2, yy, (z0 + z1) / 2, g); rail.rotation.y = ry; } return g; };
  /** market stall with striped awning and fruit crates */
  K.stall = (x, z, ry = 0, o = {}) => { const g = grp(x, z, ry), [c1, c2] = o.awning || ['#d23a32', '#ffffff'];
    add(box(2.4, 0.1, 1.1), WOOD, 0, 0.9, 0, g); add(box(2.3, 0.85, 1.0), WOOD2, 0, 0.45, 0, g);
    for (const sx of [-1.15, 1.15]) for (const sz of [-0.5, 0.5]) add(box(0.08, 2.4, 0.08), WOOD2, sx, 1.2, sz, g);
    for (let i = 0; i < 6; i++) { const st = add(box(0.42, 0.05, 1.5), M(i % 2 ? c2 : c1), -1.05 + i * 0.42, 2.45, 0.15, g); st.rotation.x = 0.28; }
    (o.fruits || ['#e8442e', '#f2b52a', '#7cc043']).forEach((c, i) => { const cr = K.crate(0, 0, { s: 0.5, fruit: c }); world.remove(cr); cr.position.set(-0.7 + i * 0.7, 0.95, 0); g.add(cr); });
    return g; };
  /** sign board on a post, text drawn on a canvas */
  K.sign = (x, z, text, ry = 0, o = {}) => { const g = grp(x, z, ry), cv = document.createElement('canvas'); cv.width = 512; cv.height = 192;
    const c = cv.getContext('2d'); c.fillStyle = o.bg || '#f3ead2'; c.fillRect(0, 0, 512, 192); c.strokeStyle = '#3b2a20'; c.lineWidth = 14; c.strokeRect(7, 7, 498, 178);
    c.fillStyle = o.fg || '#3b2a20'; c.font = '800 84px Montserrat, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 100);
    add(box(0.1, 2, 0.1), WOOD2, 0, 1, 0, g); const t = P.tex(cv); const pl = add(new THREE.PlaneGeometry(1.5, 0.56), toon({ map: t }), 0, 2.05, 0.06, g, { cast: false });
    add(box(1.56, 0.62, 0.05), WOOD2, 0, 2.05, 0.02, g); return g; };
  /** flower pot (window sills, doorsteps) */
  K.pot = (x, z, o = {}) => { const g = grp(x, z); add(new THREE.CylinderGeometry(0.22, 0.16, 0.36, 10), M(o.color || '#c8643a'), 0, (o.y ?? 0) + 0.18, 0, g);
    const b = K.bush(0, 0, { s: 0.45, flowers: true }); world.remove(b); b.position.set(0, (o.y ?? 0) + 0.25, 0); g.add(b); return g; };
  /** café table + 2 chairs */
  K.cafe = (x, z, o = {}) => { const g = grp(x, z, r() * 6); add(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 14), M(o.top || '#f0ece2'), 0, 0.74, 0, g); add(new THREE.CylinderGeometry(0.04, 0.04, 0.74, 6), IRON, 0, 0.37, 0, g);
    for (const k of [-1, 1]) { const c = new THREE.Group(); c.position.set(k * 0.65, 0, 0); c.rotation.y = k * Math.PI / 2; g.add(c); add(box(0.42, 0.05, 0.42), M(o.chair || '#c0392b'), 0, 0.45, 0, c); add(box(0.42, 0.5, 0.05), M(o.chair || '#c0392b'), 0, 0.72, -0.2, c);
      for (const lx of [-0.18, 0.18]) for (const lz of [-0.18, 0.18]) add(box(0.04, 0.45, 0.04), IRON, lx, 0.22, lz, c); } return g; };

  /** instanced ground cover over a strip: grass tufts, small flowers, pebbles. density = items per m² */
  const coverGeo = { tuft: new THREE.IcosahedronGeometry(0.1, 0), flower: new THREE.SphereGeometry(0.06, 5, 4), pebble: new THREE.DodecahedronGeometry(0.09, 0) };
  K.verge = (x0, x1, z0, z1, o = {}) => {
    const area = Math.abs((x1 - x0) * (z1 - z0)), dens = o.density ?? 3, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    const sets = [['tuft', leafM[0], 0.55], ['tuft', leafM[3], 0.25], ['flower', M('#ffd23f'), 0.06], ['flower', M('#ffffff'), 0.05], ['flower', M('#ff6fa1'), 0.04], ['pebble', stoneM[1], 0.05]];
    for (const [kind, mat, share] of sets) {
      const n = Math.max(1, Math.round(area * dens * share * (o.flowers === false && kind === 'flower' ? 0 : 1))); if (!n) continue;
      const im = new THREE.InstancedMesh(coverGeo[kind], mat, n); im.castShadow = false; im.receiveShadow = true;
      for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); if (o.avoid && o.avoid(x, z)) { m4.makeScale(0, 0, 0); im.setMatrixAt(i, m4); continue; }
        const k = 0.7 + r() * 0.8; p.set(x, Y + (kind === 'tuft' ? 0.07 * k : kind === 'flower' ? 0.16 : 0.03), z); e.set((r() - 0.5) * 0.4, r() * 6, (r() - 0.5) * 0.4); q.setFromEuler(e); sc.set(k * (kind === 'tuft' ? 1.3 : 1), k * (kind === 'tuft' ? 0.9 : 1), k * (kind === 'tuft' ? 1.3 : 1)); m4.compose(p, q, sc); im.setMatrixAt(i, m4); }
      world.add(im);
    }
  };
  /** dress the background of a shot: props in a wedge BEHIND `at` as seen from a camera placed with frameOn's `yaw` (degrees).
   *  o: { kinds: ['bush','crate',...], n: 8, near: 2, far: 10, spread: 0.45 (half-angle, rad), avoid } */
  K.backdrop = (at, yaw, o = {}) => { const a = (yaw * Math.PI) / 180, vx = -Math.sin(a), vz = -Math.cos(a), out = [];
    const kinds = o.kinds || ['bush', 'bush', 'rock', 'crate', 'barrel', 'tree']; const n = o.n ?? 8, near = o.near ?? 2, far = o.far ?? 10, spread = o.spread ?? 0.45;
    for (let i = 0; i < n; i++) { const t = near + (far - near) * Math.pow(r(), 0.8), ang = (r() * 2 - 1) * spread, ca = Math.cos(ang), sa = Math.sin(ang);
      const dx = vx * ca - vz * sa, dz = vx * sa + vz * ca, x = at[0] + dx * t, z = at[2] + dz * t; if (o.avoid && o.avoid(x, z)) continue;
      const k = pick(kinds); out.push(k === 'tree' && t < 5 ? K.bush(x, z) : K[k](x, z, {})); }
    return out; };
  /** random props in a rectangle */
  K.scatter = (kinds, o) => { const out = []; for (let i = 0; i < o.n; i++) { const x = o.x0 + r() * (o.x1 - o.x0), z = o.z0 + r() * (o.z1 - o.z0); if (o.avoid && o.avoid(x, z)) continue; const k = pick(kinds); out.push(K[k](x, z, o.opts || {})); } return out; };
  return K;
}
