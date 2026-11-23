// Library set: route de campagne française, 1904 (route poussiéreuse, platanes, bornes, village, ligne d'arrivée) + vélo de course 1900.
// Sol DECK = 0. La route court le long de x (z de -3.5 à +3.5), les caméras regardent depuis +z vers -z.
// buildRoute(ctx, { zones }) : zones = [[x0, x1], ...] où l'on habille (arbres, bornes, maisons, herbes). Retourne { clouds, K, makeBike, nails, finish }.
import { propKit } from './props.js';
export const DECK = 0;

/** Vélo de course 1900 : roues à rayons, cadre, guidon, selle. Roule vers +x. set(x, z, { ry, rot, flat, vis, y }) */
export function makeBike(ctx, col = '#d9b020') {
  const { THREE, world, add, box, toon } = ctx;
  const g = new THREE.Group(); world.add(g);
  const mFrame = toon({ color: col }), mTyre = toon({ color: '#1f1a1d' }), mMetal = toon({ color: '#b9bec6' }), mSeat = toon({ color: '#5a3a22' });
  const wheels = [];
  for (const sx of [-0.56, 0.56]) {
    const w = new THREE.Group(); w.position.set(sx, 0.36, 0); g.add(w);
    add(new THREE.TorusGeometry(0.34, 0.032, 6, 28), mTyre, 0, 0, 0, w);
    add(new THREE.TorusGeometry(0.3, 0.012, 4, 24), mMetal, 0, 0, 0, w, { cast: false });
    for (let k = 0; k < 4; k++) { const s = add(box(0.62, 0.014, 0.014), mMetal, 0, 0, 0, w, { cast: false }); s.rotation.z = k * Math.PI / 4; }
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8), mMetal, 0, 0, 0, w, { cast: false }).rotation.x = Math.PI / 2;
    wheels.push(w);
  }
  const bar = (a, b, r, m) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), c = add(new THREE.CylinderGeometry(r, r, L, 6), m, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0, g); c.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.PI / 2; return c; };
  const BB = [0, 0.3], ST = [-0.2, 0.86], HT = [0.42, 0.84];
  bar([-0.56, 0.36], BB, 0.022, mFrame); bar([-0.56, 0.36], ST, 0.022, mFrame); bar(BB, ST, 0.028, mFrame); bar(ST, HT, 0.028, mFrame); bar(BB, HT, 0.028, mFrame); bar(HT, [0.56, 0.36], 0.026, mFrame);
  bar(HT, [0.4, 1.0], 0.02, mMetal); add(box(0.06, 0.03, 0.5), mMetal, 0.4, 1.0, 0, g);
  add(box(0.3, 0.05, 0.12), mSeat, -0.24, 0.9, 0, g);
  const crank = new THREE.Group(); crank.position.set(0, 0.3, 0.06); g.add(crank);
  add(box(0.3, 0.025, 0.025), mMetal, 0, 0, 0, crank, { cast: false }); add(box(0.1, 0.03, 0.07), mTyre, 0.15, 0, 0.04, crank, { cast: false }); add(box(0.1, 0.03, 0.07), mTyre, -0.15, 0, 0.04, crank, { cast: false });
  return { g, set(x, z, o = {}) {
    g.visible = o.vis !== false; g.position.set(x, o.y || 0, z); g.rotation.set(0, o.ry || 0, o.roll || 0);
    const flat = o.flat ? 1 : 0;
    for (const w of wheels) { w.rotation.z = -(o.rot || 0); w.scale.set(1 + 0.12 * flat, 1 - 0.3 * flat, 1); w.position.y = 0.36 - 0.1 * flat; }
    if (o.bent) { wheels[1].rotation.y = 0.55 * o.bent; wheels[1].scale.set(1 - 0.2 * o.bent, 1 + 0.1 * o.bent, 1); }   // roue avant tordue (voilée)
    crank.rotation.z = -(o.rot || 0) * 0.5;
  } };
}

export function buildRoute(ctx, opts = {}) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const K = propKit(ctx, { seed: opts.seed ?? 1904 });
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1904);
  // ---- sol : prairie + route poussiéreuse avec ornières ----
  const meadow = cv(512, 512, (g, w, h) => { g.fillStyle = '#93b34c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${100 + r() * 70 | 0},${146 + r() * 56 | 0},${52 + r() * 30 | 0},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); } });
  const dust = cv(512, 256, (g, w, h) => { g.fillStyle = '#d9b98a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 700; k++) { g.fillStyle = `rgba(${170 + r() * 60 | 0},${130 + r() * 50 | 0},${84 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 3, r() * 0.4, 0, 6.283); g.fill(); }
    for (const y of [0.3, 0.7]) { g.strokeStyle = 'rgba(120,86,56,0.45)'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, y * h); g.lineTo(w, y * h + 3); g.stroke(); }
    g.fillStyle = 'rgba(120,150,60,0.35)'; g.fillRect(0, h * 0.46, w, h * 0.08);
    for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(100,80,60,0.6)'; g.beginPath(); g.arc(r() * w, r() * h, 1.5 + r() * 2.5, 0, 6.283); g.fill(); } });
  const ground = add(new THREE.PlaneGeometry(4000, 4000), toon({ map: P.tex(meadow, 300, 300) }), 2000, -0.03, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  const roads = opts.roads || [[-80, 700]];
  for (const [a, b] of roads) { const L = b - a, m = add(new THREE.PlaneGeometry(L, 7.5), toon({ map: P.tex(dust, L / 8, 1) }), (a + b) / 2, 0.01, 0, world, { cast: false }); m.rotation.x = -Math.PI / 2; }
  // ---- platanes (écorce claire tachetée), bornes, maisons ----
  const bark = toon({ color: '#cfc4a8' }), bark2 = toon({ color: '#8a7a5a' }), leaf = ['#6fa238', '#5c9230', '#80b244'].map((c) => toon({ color: c }));
  const platane = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    add(new THREE.CylinderGeometry(0.2 * s, 0.32 * s, 4.4 * s, 8), bark, 0, 2.2 * s, 0, g); for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(0.2 * s, 5, 4), bark2, (r() - 0.5) * 0.3 * s, (0.9 + i * 0.9) * s, 0.2 * s, g, { cast: false });
    for (let i = 0; i < 6; i++) { const a = i * 1.05, b = add(new THREE.IcosahedronGeometry((1.5 + r() * 0.5) * s, 1), leaf[i % 3], Math.cos(a) * 1.2 * s * (i ? 1 : 0), (5.3 + r() * 1.2) * s, Math.sin(a) * 1.2 * s * (i ? 1 : 0), g); b.scale.y = 0.8; } return g; };
  const borne = (x, z, txt = '') => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(box(0.4, 0.8, 0.3), toon({ color: '#e8e2d0' }), 0, 0.4, 0, g); add(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10, 1, false, 0, 3.1416), toon({ color: '#c8312c' }), 0, 0.82, 0, g).rotation.z = Math.PI / 2; return g; };
  const house = (x, z, w = 6, h = 3.6, col = '#e8d9b8', roof = '#b9553a') => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    add(tbox(w, h, 5, 3), toon({ color: col }), 0, h / 2, 0, g); const sh = new THREE.Shape(); sh.moveTo(-2.9, 0); sh.lineTo(2.9, 0); sh.lineTo(0, 2.2); sh.closePath();
    const rm = add(new THREE.ExtrudeGeometry(sh, { depth: w + 0.8, bevelEnabled: false }), toon({ color: roof }), -(w + 0.8) / 2, h, 0, g); rm.rotation.y = Math.PI / 2;
    add(box(0.9, 1.9, 0.12), toon({ color: '#5a3a24' }), -w * 0.2, 0.95, 2.52, g); for (const wx of [w * 0.15, w * 0.35]) add(box(0.8, 0.9, 0.12), toon({ color: '#46557a' }), wx, 2.2, 2.52, g, { cast: false });
    add(new THREE.CylinderGeometry(0.3, 0.38, 1.2, 6), toon({ color: '#9a8a7a' }), w * 0.25, h + 2.1, -1, g); return g; };
  for (const [a, b] of opts.zones || []) {
    for (let x = a; x <= b; x += 7.5) { platane(x + r() * 2, -4.8 - r() * 0.6, 0.9 + r() * 0.3); if (r() > 0.4) platane(x + 3 + r() * 2, 5.4 + r(), 1.0 + r() * 0.2); }
    for (let x = a + 3; x <= b; x += 22) borne(x, -3.9);
    for (let x = a + 6; x < b; x += 24) house(x + r() * 4, -15 - r() * 5, 5.5 + r() * 2, 3.4, ['#e8d9b8', '#efe3c4', '#e0c9a0', '#d9d0c0'][Math.floor(r() * 4)], ['#b9553a', '#a8482e', '#8a5a3a'][Math.floor(r() * 3)]);
    K.verge(a, b, -9, -3.7, { density: 2.2 }); K.verge(a, b, 3.8, 8, { density: 1.8 });
    for (let x = a; x < b; x += 12) { K.bush(x + r() * 6, -6.5 - r() * 2); K.rock(x + r() * 8, -4.2 - r() * 0.4, { s: 0.25 }); }
    for (let x = a + 4; x < b; x += 15) K.sack(x, 4.6 + r());
  }
  // ---- clous et tessons semés sur la route ----
  const nails = (x0, x1, n = 70) => { const mN = toon({ color: '#2a2224' }), mG = new THREE.MeshBasicMaterial({ color: '#bfe8ff', fog: false }), mG2 = new THREE.MeshBasicMaterial({ color: '#7fd0a8', fog: false });
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), z = (r() - 0.5) * 6;
      if (i % 3) { const c = add(new THREE.ConeGeometry(0.05, 0.34, 5), mN, x, 0.06, z, world, { cast: false }); c.rotation.set((r() - 0.5) * 1.2, 0, (r() - 0.5) * 1.6); add(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 6), mN, x, 0.02, z, world, { cast: false }); }
      else { const t = add(new THREE.TetrahedronGeometry(0.14 + r() * 0.1), i % 2 ? mG : mG2, x, 0.07, z, world, { cast: false }); t.rotation.set(r() * 3, r() * 3, r() * 3); } } };
  // ---- ligne d'arrivée : portique, banderoles, barrières, gradins de foule ----
  const finish = (x) => { const g = new THREE.Group(); g.position.set(x, 0, 0); world.add(g);
    const cvB = cv(1024, 160, (c, w, h) => { c.fillStyle = '#f7f1e0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#271925' : '#f7f1e0'; c.fillRect(i * 64, 0, 64, 40); c.fillStyle = i % 2 ? '#f7f1e0' : '#271925'; c.fillRect(i * 64, 120, 64, 40); }
      c.fillStyle = '#c8312c'; c.font = '800 80px Montserrat, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ARRIVÉE', 512, 82); });
    for (const s of [-1, 1]) add(box(0.3, 5.2, 0.3), toon({ color: '#8a5a32' }), 0, 2.6, s * 4.2, g);
    add(new THREE.PlaneGeometry(8.4, 1.3), new THREE.MeshBasicMaterial({ map: P.tex(cvB), side: THREE.DoubleSide }), 0, 4.5, 0, g, { cast: false }).rotation.y = Math.PI / 2;
    const bn = add(new THREE.PlaneGeometry(8.4, 1.3), new THREE.MeshBasicMaterial({ map: P.tex(cvB) }), 0.22, 4.5, 0, g, { cast: false }); bn.rotation.y = Math.PI / 2;
    const line = add(new THREE.PlaneGeometry(0.5, 7.5), toon({ color: '#f7f1e0' }), 0, 0.03, 0, g, { cast: false }); line.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 16; i++) { const b = add(new THREE.PlaneGeometry(0.25, 0.25), toon({ color: i % 2 ? '#271925' : '#f7f1e0' }), 0.25, 0.031, -3.5 + i * 0.47, g, { cast: false }); b.rotation.x = -Math.PI / 2; }
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) add(box(0.06, 0.9, 1.4), toon({ color: i % 2 ? '#d23a32' : '#f7f1e0' }), -8 + i * 1.5, 0.45, s * 3.9, g).rotation.y = Math.PI / 2;
    // estrade du vainqueur
    add(box(1.8, 0.55, 1.4), toon({ color: '#e8c24a' }), 5, 0.275, -1.6, g); add(box(1.8, 0.1, 1.4), toon({ color: '#f7e08a' }), 5, 0.6, -1.6, g);
    for (let i = 0; i < 12; i++) { const fl = add(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshBasicMaterial({ color: ['#2f56a8', '#f7f1e0', '#d23a32'][i % 3], side: THREE.DoubleSide }), -6 + i * 1.1, 2.6 + Math.sin(i) * 0.1, -5.5, g, { cast: false }); fl.rotation.z = Math.sin(i) * 0.1; }
    return g; };
  // ---- nuages ----
  const clouds = [];
  for (const cx0 of opts.cxs || [0]) { const rr = P.rng(91 + cx0); for (let i = 0; i < 9; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d + cx0, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  return { DECK, K, clouds, nails, finish, platane, house, borne };
}
