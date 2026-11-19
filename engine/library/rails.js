// Library set: a French railway through Provence's ochre cliffs (Roussillon), plus a winter-night worksite.
// Ground level DECK = 0. The main track runs along z at x = 0 (trains travel toward -z or +z).
//   z  +90 .. -60  OLD    jointed rails (18 m bars, visible gaps), wooden ties          -> steam train, 1900 rail layer
//   z  -60 .. -140 BUCKLE continuous rails, wooden ties; S.buckle 0..1 bends it sideways  -> "flambée"
//   z -140 .. -420 MODERN welded rails, concrete ties; platform + NÎMES sign at z = -175  -> high-speed train
// Winter worksite on a spur at x = 70, z = -300 (hidden behind the cliffs): snow, a heater cart, a glowing rail.
// state(S, f): buckle 0..1, heat 0..1 (old/buckle rails glow red), glow 0..1 (worksite rail glow), steamZ, tgvZ, snow (bool)
export const DECK = 0;
export const SPOTS = {
  old: [0, 0, -20], gap: [0.72, 0.36, -16.05], buckle: [0, 0, -100], nimes: [3.2, 0.9, -175], modern: [0, 0, -250], site: [70, 0, -300],
};
export function buildRails(ctx) {
  const { THREE, P, scene, world, camera, M, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const texOf = (c, rx = 1, ry = 1) => { const t = P.tex(c, rx, ry); return t; };
  const r = P.rng(21);
  // ---- painted textures ----
  const ochre = cv(512, 512, (g, w, h) => {
    const bands = ['#d9692f', '#e8893a', '#c9462b', '#f0a94a', '#b8452e', '#e27a34', '#f3c063', '#cf5a2c'];
    let y = 0, i = 0; while (y < h) { const bh = 18 + r() * 46; g.fillStyle = bands[i++ % bands.length]; g.fillRect(0, y, w, bh + 2);
      g.fillStyle = 'rgba(80,30,30,0.25)'; g.fillRect(0, y + bh - 3, w, 3); y += bh; }
    for (let k = 0; k < 260; k++) { g.fillStyle = `rgba(${120 + r() * 80 | 0},${40 + r() * 40 | 0},${30},${0.15 + r() * 0.2})`; g.fillRect(r() * w, r() * h, 2 + r() * 16, 1 + r() * 3); }
    for (let k = 0; k < 40; k++) { g.strokeStyle = 'rgba(90,35,35,0.35)'; g.lineWidth = 2; g.beginPath(); const x = r() * w; g.moveTo(x, r() * h); g.lineTo(x + (r() - 0.5) * 30, r() * h); g.stroke(); }
  });
  const ballast = cv(512, 512, (g, w, h) => {
    g.fillStyle = '#8a7a6a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1400; k++) { const x = r() * w, y = r() * h, rr = 3 + r() * 7, c = [[150, 140, 128], [118, 104, 92], [176, 160, 140], [132, 98, 80], [96, 88, 82]][k % 5];
      g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.strokeStyle = 'rgba(46,30,34,0.85)'; g.lineWidth = 1.6;
      g.beginPath(); g.ellipse(x, y, rr, rr * (0.6 + r() * 0.4), r() * 3, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(x - rr * 0.3, y - rr * 0.3, rr * 0.35, rr * 0.2, 0, 0, 6.283); g.fill(); }
  });
  const dirt = cv(512, 512, (g, w, h) => {
    g.fillStyle = '#d98a4c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${170 + r() * 60 | 0},${90 + r() * 50 | 0},${50 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 10, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(120,140,60,0.55)'; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 6, 2 + r() * 3, 0, 0, 6.283); g.fill(); }
  });
  const wood = cv(256, 64, (g, w, h) => { g.fillStyle = '#7a5434'; g.fillRect(0, 0, w, h); for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(60,36,24,${0.3 + r() * 0.4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + (r() - 0.5) * 6); g.stroke(); } });
  const snow = cv(256, 256, (g, w, h) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, w, h); for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(190,205,230,${0.3 + r() * 0.4})`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, 0, 0, 6.283); g.fill(); } });
  const mOchre = toon({ map: texOf(ochre, 1, 1) }), mBallast = toon({ map: texOf(ballast, 1, 1) }), mDirt = toon({ map: texOf(dirt, 60, 60) });
  const mWood = toon({ map: texOf(wood) }), mConcrete = toon({ color: '#b9b2a6' }), mRail = toon({ color: '#9aa0a6' }), mRailSide = toon({ color: '#6b5148' });
  const mSnow = toon({ map: texOf(snow, 20, 20) });
  // ---- ground ----
  const ground = add(new THREE.PlaneGeometry(2000, 2000), mDirt, 0, -0.01, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  // ---- track builder ----
  const tracks = []; // {rails:[mesh...], ties, z0, z1, kind}
  const ballastBed = (x, z0, z1) => { const L = z0 - z1; const sh = new THREE.Shape(); sh.moveTo(-2.3, 0); sh.lineTo(2.3, 0); sh.lineTo(1.6, 0.36); sh.lineTo(-1.6, 0.36); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false }); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.5, uv.getY(i) / 2.5);
    const m = add(g, mBallast, x, 0, z1, world, { cast: false }); return m; };
  const railMat = { normal: mRail };
  const buildTrack = (x, z0, z1, kind) => {
    ballastBed(x, z0, z1);
    const T = { kind, z0, z1, x, rails: [], ties: null, tiePos: [] };
    const tieMat = kind === 'modern' ? mConcrete : mWood, tieGeo = kind === 'modern' ? box(2.5, 0.2, 0.3) : box(2.6, 0.14, 0.24);
    const n = Math.floor((z0 - z1) / 0.65); const ties = new THREE.InstancedMesh(tieGeo, tieMat, n); const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const z = z0 - 0.3 - i * 0.65; T.tiePos.push(z); m4.makeTranslation(x, 0.43, z); ties.setMatrixAt(i, m4); }
    ties.castShadow = true; ties.receiveShadow = true; world.add(ties); T.ties = ties;
    const seg = kind === 'old' ? 18 : 6, gap = kind === 'old' ? 0.14 : 0;
    for (const sx of [-0.72, 0.72]) for (let z = z0; z > z1 + 0.01; z -= seg) {
      const L = Math.min(seg, z - z1) - gap; const g = new THREE.Group(); g.position.set(x + sx, 0.5, z - gap / 2 - L / 2); world.add(g);
      add(box(0.09, 0.15, L), mRailSide, 0, 0.0, 0, g); const head = add(box(0.14, 0.05, L), mRail, 0, 0.09, 0, g);
      g.userData = { x0: x + sx, zc: z - gap / 2 - L / 2, L, head }; T.rails.push(g);
    }
    tracks.push(T); return T;
  };
  const OLD = buildTrack(0, 90, -60, 'old'), BUCK = buildTrack(0, -60, -140, 'buckle'), MOD = buildTrack(0, -140, -420, 'modern');
  // heat material per track (shared copy so it can glow)
  const heatMat = toon({ color: '#9aa0a6' }); for (const T of [OLD, BUCK]) for (const g of T.rails) g.userData.head.material = heatMat;
  // ---- cliffs (ochre strata) both sides ----
  const cliff = (x, z, w, h, d, ry) => { const g = new THREE.BoxGeometry(w, h, d, 3, 3, 3); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const yy = p.getY(i); if (yy > -h / 2 + 0.1) { p.setX(i, p.getX(i) * (1 - 0.12 * (yy / h + 0.5)) + (r() - 0.5) * 1.6); p.setZ(i, p.getZ(i) + (r() - 0.5) * 1.6); } }
    g.computeVertexNormals(); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 18, uv.getY(i) * h / 18);
    const m = add(g, mOchre, x, h / 2 - 0.5, z, world); m.rotation.y = ry; return m; };
  for (let z = 120; z > -460; z -= 16 + r() * 10) for (const s of [-1, 1]) { const x = s * (13 + r() * 6); if (Math.abs(z + 175) < 14 && s > 0) continue;
    cliff(x + s * 8, z, 14 + r() * 10, 12 + r() * 22, 14 + r() * 8, (r() - 0.5) * 0.5); if (r() > 0.5) cliff(x + s * 22, z - 6, 18, 26 + r() * 20, 16, r()); }
  // umbrella pines + bushes on the cliff tops and along the track
  const pineM = toon({ color: '#4f7d3a' }), trunkM = toon({ color: '#6a4a32' }), bushM = toon({ color: '#7d9a44' });
  const pine = (x, y, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, y, z); world.add(g); const t = add(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 4 * s, 6), trunkM, 0, 2 * s, 0, g); t.rotation.z = 0.15;
    const c = add(new THREE.SphereGeometry(1, 12, 8), pineM, 0.5 * s, 4.3 * s, 0, g); c.scale.set(2.8 * s, 0.9 * s, 2.8 * s); return g; };
  const CLEAR = [[-48, -18], [-114, -84], [-162, -138]];
  for (let i = 0; i < 40; i++) { const s = i % 2 ? 1 : -1, z = 100 - i * 13 - r() * 8; if (CLEAR.some(([a, b]) => z > a && z < b)) { r(); r(); r(); continue; } pine(s * (6 + r() * 4), 0, z, 0.8 + r() * 0.5); if (r() > 0.4) add(new THREE.SphereGeometry(0.8 + r() * 0.6, 10, 8), bushM, s * (3.4 + r() * 2), 0.3, z - 4, world).scale.y = 0.6; }
  for (let i = 0; i < 30; i++) { const s = i % 2 ? 1 : -1; pine(s * (26 + r() * 20), 30 + r() * 10, 80 - i * 18, 1.4); }
  // distant hills
  for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = 380 + r() * 200; const h = add(new THREE.SphereGeometry(60 + r() * 50, 18, 10), toon({ color: i % 2 ? '#c8803e' : '#a9a35a' }), Math.cos(a) * d, -20, Math.sin(a) * d - 150, world, { cast: false }); h.scale.y = 0.5; }
  // ---- Nîmes platform + sign (text reads correctly from +x side looking -x) ----
  add(tbox(3, 0.9, 40, 2), mConcrete, 3.6, 0.45, -175, world);
  const signTex = P.tex(cv(512, 128, (g, w, h) => { g.fillStyle = '#1f3d7a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2f2f2'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#ffffff'; g.font = 'bold 84px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NÎMES', w / 2, h / 2 + 4); }));
  const sign = new THREE.Group(); sign.position.set(4.6, 0.9, -172); world.add(sign);
  for (const zz of [-1.3, 1.3]) add(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), M.iron, 0, 1.3, zz, sign);
  const sp = add(new THREE.PlaneGeometry(3.2, 0.8), toon({ map: signTex }), -0.04, 2.6, 0, sign, { cast: false }); sp.rotation.y = -Math.PI / 2;
  const sp2 = add(new THREE.PlaneGeometry(3.2, 0.8), toon({ map: signTex }), 0.04, 2.6, 0, sign, { cast: false }); sp2.rotation.y = Math.PI / 2;
  // ---- steam locomotive + 2 coaches (front toward -z) ----
  const steam = new THREE.Group(); world.add(steam);
  { const black = toon({ color: '#2c2a2e' }), green = toon({ color: '#2f5a44' }), red = toon({ color: '#b8322f' }), brass = toon({ color: '#d4a64a' });
    const b = add(new THREE.CylinderGeometry(0.85, 0.85, 5.2, 16), green, 0, 2.0, -1.6, steam); b.rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.86, 0.86, 0.5, 16), black, 0, 2.0, -4.1, steam).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.22, 0.3, 1.2, 10), black, 0, 3.3, -3.6, steam); add(new THREE.SphereGeometry(0.32, 10, 8), brass, 0, 2.95, -1.6, steam);
    add(tbox(2.0, 2.4, 2.2, 2), green, 0, 2.4, 2.0, steam); add(tbox(2.2, 0.2, 2.6, 2), black, 0, 3.7, 2.0, steam);
    add(tbox(2.0, 0.4, 7.6, 2), black, 0, 0.95, -0.6, steam);
    for (const z of [-3.2, -1.6, 0]) for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(0.62, 0.62, 0.18, 16), red, s * 0.8, 1.15, z, steam); w.rotation.z = Math.PI / 2; }
    add(tbox(0.12, 0.08, 3.4, 1), M.iron, 0.95, 1.15, -1.6, steam); add(tbox(0.12, 0.08, 3.4, 1), M.iron, -0.95, 1.15, -1.6, steam);
    for (let k = 0; k < 2; k++) { const c = new THREE.Group(); c.position.z = 6 + k * 8.2; steam.add(c); add(tbox(2.4, 2.6, 7.6, 2), toon({ color: k ? '#7a2e2a' : '#2f5a44' }), 0, 2.3, 0, c);
      add(tbox(2.6, 0.2, 7.8, 2), black, 0, 3.7, 0, c); for (const s of [-1, 1]) for (let wdw = 0; wdw < 4; wdw++) add(box(0.08, 0.8, 1.1), toon({ color: '#f3e3b6' }), s * 1.22, 2.7, -2.7 + wdw * 1.8, c, { cast: false });
      for (const z of [-2.6, 2.6]) for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(0.45, 0.45, 0.16, 12), black, s * 0.8, 0.95, z, c); w.rotation.z = Math.PI / 2; } } }
  // ---- high-speed train (no logo), front toward -z ----
  const tgv = new THREE.Group(); world.add(tgv);
  { const white = toon({ color: '#eef0f2' }), stripe = toon({ color: '#3b5f9c' }), glass = toon({ color: '#20283a' });
    const ng = new THREE.BoxGeometry(2.9, 3.1, 6, 2, 2, 2); { const p = ng.attributes.position; for (let i = 0; i < p.count; i++) { const k = (3 - p.getZ(i)) / 6; // 0 at back, 1 at tip
        p.setX(i, p.getX(i) * (1 - 0.45 * k * k)); if (p.getY(i) > 0) p.setY(i, p.getY(i) - 1.75 * k); else p.setY(i, p.getY(i) + 0.4 * k * k); } ng.computeVertexNormals(); }
    add(ng, white, 0, 2.05, -8.5, tgv);
    add(tbox(2.9, 3.1, 11, 2), white, 0, 2.05, 0, tgv); const ws = add(box(2.1, 0.08, 2.4), glass, 0, 3.25, -6.9, tgv, { cast: false }); ws.rotation.x = -0.284;
    add(box(2.0, 0.3, 0.1), toon({ color: '#fff3c0' }), 0, 1.15, -11.45, tgv, { cast: false });
    add(tbox(2.95, 0.35, 11, 2), stripe, 0, 1.7, 0, tgv);
    for (let k = 1; k < 3; k++) { add(tbox(2.9, 3.1, 12.5, 2), white, 0, 2.05, 6 + (k - 1) * 12.8 + 6.2, tgv); add(tbox(2.95, 0.35, 12.5, 2), stripe, 0, 1.7, 12.2 + (k - 1) * 12.8, tgv);
      for (const s of [-1, 1]) for (let wdw = 0; wdw < 6; wdw++) add(box(0.06, 0.6, 1.3), glass, s * 1.47, 2.6, 7.6 + (k - 1) * 12.8 + wdw * 1.9, tgv, { cast: false }); }
    for (const s of [-1, 1]) for (let wdw = 0; wdw < 4; wdw++) add(box(0.06, 0.6, 1.3), glass, s * 1.47, 2.6, -3 + wdw * 1.9, tgv, { cast: false });
    add(tbox(2.3, 0.55, 36, 1), toon({ color: '#3a3640' }), 0, 0.3, 12, tgv); add(tbox(2.0, 0.4, 3, 1), toon({ color: '#3a3640' }), 0, 0.45, -9, tgv); }
  // ---- winter worksite on a spur (x = 70) ----
  const SITE = [70, 0, -300];
  const snowP = add(new THREE.PlaneGeometry(90, 120), mSnow, SITE[0], 0.02, SITE[2], world, { cast: false }); snowP.rotation.x = -Math.PI / 2;
  const SPUR = buildTrack(SITE[0], SITE[2] + 50, SITE[2] - 60, 'modern');
  const glowMat = new THREE.MeshBasicMaterial({ color: '#ff7a2a', fog: false });
  const glowRail = []; for (const g of SPUR.rails) if (Math.abs(g.userData.zc - SITE[2]) < 7) glowRail.push(g);
  const cart = new THREE.Group(); cart.position.set(SITE[0], 0.55, SITE[2] - 8.5); world.add(cart);
  add(tbox(2.4, 1.2, 2.0, 1.5), toon({ color: '#e0672a' }), 0, 0.9, 0, cart); add(tbox(2.5, 0.12, 2.1, 1), M.iron, 0, 1.55, 0, cart);
  for (const s of [-1, 1]) for (const z of [-0.7, 0.7]) { const w = add(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), M.iron, s * 0.72, 0.15, z, cart); w.rotation.z = Math.PI / 2; }
  const coil = add(box(2.0, 0.12, 0.5), glowMat, 0, 0.12, -1.25, cart, { cast: false });
  for (let i = 0; i < 6; i++) { const lp = add(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), M.iron, SITE[0] + (i % 2 ? 4 : -4), 1.5, SITE[2] + 8 - i * 6, world); add(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff1c2', fog: false }), lp.position.x, 3.05, lp.position.z, world, { cast: false }); }
  for (let i = 0; i < 12; i++) { const a = r() * 6.283; const p = pine(SITE[0] + Math.cos(a) * (22 + r() * 20), 0, SITE[2] + Math.sin(a) * 30, 1.1); p.children[1].material = toon({ color: '#3f6450' }); }
  // ---- clouds ----
  const clouds = [];
  { const rr = P.rng(90); for (let i = 0; i < 12; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  // ---- per frame ----
  const m4 = new THREE.Matrix4(), cHot = new THREE.Color('#ff4a24'), cSteel = new THREE.Color('#9aa0a6');
  const bendAt = (z, amt) => { const u = (z + 100) / 34; return amt * 1.1 * Math.exp(-u * u) * Math.sin(u * 2.2 + 0.6); };
  let lastB = -1;
  function state(S, f) {
    const b = Math.round((S.buckle || 0) * 100) / 100;
    if (b !== lastB) { lastB = b;
      BUCK.tiePos.forEach((z, i) => { m4.makeTranslation(bendAt(z, b), 0.43, z); const rot = new THREE.Matrix4().makeRotationY(-(bendAt(z - 0.3, b) - bendAt(z + 0.3, b)) / 0.6 * 0.6); m4.multiply(rot); BUCK.ties.setMatrixAt(i, m4); });
      BUCK.ties.instanceMatrix.needsUpdate = true;
      for (const g of BUCK.rails) { const z = g.userData.zc; g.position.x = g.userData.x0 + bendAt(z, b); g.rotation.y = -(bendAt(z - 1, b) - bendAt(z + 1, b)) / 2; } }
    heatMat.color.copy(cSteel).lerp(cHot, Math.min(1, S.heat || 0) * 0.75);
    const gl = S.glow || 0; for (const g of glowRail) g.userData.head.material = gl > 0.05 ? glowMat : mRail; glowMat.color.set(gl > 0.6 ? '#ff8a3a' : '#ff6a28'); coil.visible = gl > 0.05;
    steam.position.set(0, 0.5, S.steamZ ?? 400); steam.visible = S.steamZ !== undefined;
    tgv.position.set(0, 0.5, S.tgvZ ?? 600); tgv.visible = S.tgvZ !== undefined;
  }
  return { DECK, SPOTS, SITE, clouds, state, onLight: () => {} };
}
