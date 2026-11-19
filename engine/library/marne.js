// Library set: Paris 1914 (street + Invalides esplanade) and the road to the Marne (poplars, wheat, farms, church, bridge).
// Ground level DECK = 0. Paris street runs along z (x = 0) from z = +320 to +100, houses on both sides (esplanade + Invalides on the left at z < 180).
// The country road continues toward -z to the Marne bridge at z = -540. Taxis travel toward -z (front = -z).
// state(S, f):  night 0..1 (lit windows + lamps), taxis [{x,z,ry?,roll?}] (up to 18 red Renault cabs), lamps 0..1 (headlights on the cabs),
//   flagT (seconds, waves the flags), train {z} (small steam loco on the Paris spur, x = -22).
export const DECK = 0;
export const SPOTS = {
  street: [0, 0, 220], invalides: [-8, 0, 150], road: [0, 0, -150], sign: [-5, 0, -160], church: [22, 0, -300], flag: [4.5, 0, -330], bridge: [0, 0, -540], field: [30, 0, -250],
};
export function buildMarne(ctx) {
  const { THREE, P, scene, world, add, box, tbox, toon, M } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(1914);
  // ---- textures ----
  const wheat = cv(512, 512, (g, w, h) => { g.fillStyle = '#e0b04a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) { g.fillStyle = y % 16 ? 'rgba(244,206,98,0.7)' : 'rgba(176,122,40,0.55)'; g.fillRect(0, y, w, 4); }
    for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${200 + r() * 40 | 0},${150 + r() * 50 | 0},60,0.5)`; g.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 2); } });
  const meadow = cv(512, 512, (g, w, h) => { g.fillStyle = '#86a846'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${90 + r() * 70 | 0},${140 + r() * 60 | 0},${50 + r() * 30 | 0},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); } });
  const cobble = cv(512, 512, (g, w, h) => { g.fillStyle = '#8f8a84'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) for (let x = (y / 24 % 2) * 12; x < w; x += 24) { const c = 120 + r() * 50 | 0; g.fillStyle = `rgb(${c},${c - 4},${c - 10})`; g.strokeStyle = 'rgba(40,30,34,0.8)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x + 1, y + 1, 22, 22, 6); g.fill(); g.stroke(); } });
  const road = cv(512, 512, (g, w, h) => { g.fillStyle = '#c9a778'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 800; k++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${120 + r() * 50 | 0},${80 + r() * 30 | 0},0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3, r() * 3, 0, 6.283); g.fill(); }
    g.fillStyle = 'rgba(120,92,62,0.45)'; g.fillRect(150, 0, 40, h); g.fillRect(322, 0, 40, h); });
  const tex = (c, rx, ry) => P.tex(c, rx, ry);
  const mWheat = toon({ map: tex(wheat, 14, 14) }), mMeadow = toon({ map: tex(meadow, 30, 30) }), mCobble = toon({ map: tex(cobble, 9, 90) }), mRoad = toon({ map: tex(road, 1, 120) });
  const mCream = toon({ map: P.tex(P.plaster(31, 42), 1, 1) }), mCream2 = toon({ map: P.tex(P.plaster(32, 34), 1, 1) }), mStone = toon({ map: P.tex(P.stone(4, 40, 12, 72), 1, 1) });
  const mSlate = toon({ color: '#58637a' }), mTile = toon({ map: P.tex(P.roof(9), 2, 2) }), mIron = toon({ color: '#33302f' }), mGold = toon({ color: '#e0b440' });
  const winMat = new THREE.MeshBasicMaterial({ color: '#46557a' }), lampMat = new THREE.MeshBasicMaterial({ color: '#fff0b8', fog: false }), streetMat = new THREE.MeshBasicMaterial({ color: '#8a8576', fog: false });
  // ---- ground ----
  const ground = add(new THREE.PlaneGeometry(3000, 3000), mMeadow, 0, -0.02, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  const strip = (x, z0, z1, w, mat, y = 0.0) => { const m = add(new THREE.PlaneGeometry(w, z0 - z1), mat, x, y, (z0 + z1) / 2, world, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };
  strip(0, 340, 96, 12, mCobble, 0.02);                  // Paris cobbles
  strip(0, 96, -600, 7, mRoad, 0.015);                  // country road
  for (const s of [-1, 1]) strip(s * 7.2, 330, 96, 2.4, toon({ color: '#b9b2a4' }), 0.05); // pavements
  strip(-30, 176, 96, 40, toon({ color: '#d9c9a0' }), 0.03);  // esplanade gravel
  // wheat + meadow patches along the country road
  for (let z = 70; z > -600; z -= 46) for (const s of [-1, 1]) { const w = 30 + r() * 30, m = add(new THREE.PlaneGeometry(w, 44), r() > 0.35 ? mWheat : mMeadow, s * (6 + w / 2 + r() * 3), 0.03, z - 22, world, { cast: false }); m.rotation.x = -Math.PI / 2; m.rotation.z = r() > 0.5 ? 0 : Math.PI / 2; }
  // ---- Paris houses ----
  const slabs = [], winsInfo = [];
  const house = (cx, cz, w, h, d, side) => { // facade toward the road; side +1 = right of road (facade at x = cx - d/2)
    const fx = cx - side * d / 2, wallM = r() > 0.5 ? mCream : mCream2;
    add(tbox(d, h, w, 3), wallM, cx, h / 2, cz, world);
    const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.3, 0); sh.lineTo(d / 2 + 0.3, 0); sh.lineTo(d / 2 - 1.8, 3.4); sh.lineTo(-d / 2 + 1.8, 3.4); sh.closePath();
    const rg = new THREE.ExtrudeGeometry(sh, { depth: w + 0.4, bevelEnabled: false }); add(rg, mSlate, cx, h, cz - w / 2 - 0.2, world);
    for (let i = 0; i < Math.floor(w / 9); i++) add(tbox(0.9, 2.4, 0.9, 1), mStone, cx + (r() - 0.5) * d * 0.6, h + 3.4 + 1.0, cz - w / 2 + 3 + i * 9, world);
    add(tbox(0.5, 0.4, w + 0.2, 1), mStone, fx - side * 0.02 + (-side) * 0.1, h - 0.2, cz, world); // cornice
    const floors = Math.floor((h - 4.2) / 3.1), per = Math.floor(w / 3.2);
    for (let fl = 0; fl < floors; fl++) for (let k = 0; k < per; k++) winsInfo.push([fx - side * 0.04, 4.2 + fl * 3.1 + 1.0, cz - w / 2 + (k + 0.5) * (w / per)]);
    for (let fl = 1; fl < floors; fl += 2) add(box(0.9, 0.12, w), mIron, fx - side * 0.45, 4.2 + fl * 3.1 - 0.1, cz, world); // balcony strip
    const cols = ['#b8322f', '#2f5a8a', '#3f7a4a', '#d9a441', '#7a3a5a'];
    for (let k = 0; k < Math.floor(w / 6); k++) { const z = cz - w / 2 + 3 + k * 6; add(box(1.0, 0.3, 4.2), toon({ color: cols[(k + Math.floor(cz)) % 5] }), fx - side * 0.5, 3.4, z, world);
      add(box(0.1, 2.6, 3.8), winMat, fx - side * 0.04, 1.5, z, world, { cast: false }); }
  };
  for (let z = 310; z > 100; z -= 22) { house(9 + 7, z, 21, 15 + (z % 3) * 1.2, 14, 1); if (z > 190) house(-9 - 7, z, 21, 14 + (z % 4) * 0.8, 14, -1); }
  { const im = new THREE.InstancedMesh(box(0.1, 1.7, 1.05), winMat, winsInfo.length), m4 = new THREE.Matrix4();
    winsInfo.forEach((w, i) => { m4.makeTranslation(w[0], w[1], w[2]); im.setMatrixAt(i, m4); }); im.userData.ndSkip = false; world.add(im); }
  // lamps
  const lampHeads = [];
  for (let z = 310; z > 100; z -= 16) for (const s of [-1, 1]) { if (s < 0 && z < 190) continue; add(new THREE.CylinderGeometry(0.07, 0.1, 4.2, 6), mIron, s * 6.2, 2.1, z, world); const hd = add(new THREE.SphereGeometry(0.3, 8, 6), streetMat, s * 6.2, 4.4, z, world, { cast: false }); lampHeads.push(hd); }
  // plane trees on the esplanade + pavements
  const leaf = toon({ color: '#6f9a3c' }), trunkM = toon({ color: '#7a6a58' });
  const planeTree = (x, z, s = 1) => { add(new THREE.CylinderGeometry(0.2 * s, 0.28 * s, 4 * s, 6), trunkM, x, 2 * s, z, world); const c = add(new THREE.SphereGeometry(2.2 * s, 10, 8), leaf, x, 5.2 * s, z, world); c.scale.set(1, 0.85, 1); };
  for (let z = 300; z > 100; z -= 18) planeTree(7.2, z + 8, 1.0);
  for (let z = 170; z > 100; z -= 14) planeTree(-12, z, 1.1);
  // ---- Invalides: long stone front, golden dome ----
  { const g = new THREE.Group(); g.position.set(-62, 0, 140); world.add(g);
    add(tbox(16, 13, 110, 4), mStone, 0, 6.5, 0, g); add(tbox(18, 1, 112, 4), mSlate, 0, 13.4, 0, g);
    add(tbox(10, 18, 30, 4), mStone, 7, 9, 0, g); // central pavilion
    add(new THREE.CylinderGeometry(8, 8, 8, 24), mStone, 0, 21, 0, g);
    const dome = add(new THREE.SphereGeometry(8.6, 24, 12, 0, 6.283, 0, 1.45), mGold, 0, 25, 0, g); dome.scale.set(1, 1.15, 1);
    add(new THREE.CylinderGeometry(1.6, 1.6, 4, 12), mStone, 0, 36, 0, g); add(new THREE.ConeGeometry(1.6, 6, 12), mGold, 0, 41, 0, g);
    for (let i = -8; i <= 8; i++) for (let fl = 0; fl < 2; fl++) add(box(0.1, 2.2, 1.2), winMat, 8.05, 3.5 + fl * 5.2, i * 6, g, { cast: false });
    for (let i = -3; i <= 3; i++) add(new THREE.CylinderGeometry(0.5, 0.5, 9, 8), mStone, 12.5, 4.8, i * 4.2 + 0, g); // portico columns
    add(tbox(6, 1, 30, 2), mStone, 14, 0.5, 0, g);
    for (const z of [-9, 9]) for (const dz of [0]) { add(new THREE.CylinderGeometry(0.28, 0.34, 2.2, 8), toon({ color: '#6a5a3a' }), 22, 0.85, z + dz, g).rotation.z = 1.2; } }
  // ---- country: poplars, farms, church, haystacks ----
  const pop = toon({ color: '#5f8f3a' }), pop2 = toon({ color: '#79a343' });
  const poplar = (x, z, s = 1) => { add(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 3 * s, 5), trunkM, x, 1.5 * s, z, world); const c = add(new THREE.SphereGeometry(1, 9, 8), r() > 0.5 ? pop : pop2, x, 6.5 * s, z, world); c.scale.set(1.25 * s, 4.6 * s, 1.25 * s); };
  for (let z = 70; z > -600; z -= 10) { poplar(-6.2 + (r() - 0.5) * 0.8, z + (r() - 0.5) * 3, 0.9 + r() * 0.3); poplar(6.2 + (r() - 0.5) * 0.8, z - 5 + (r() - 0.5) * 3, 0.9 + r() * 0.3); }
  const oak = (x, z, s = 1) => { add(new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 3 * s, 6), trunkM, x, 1.5 * s, z, world); const c = add(new THREE.SphereGeometry(2.6 * s, 10, 8), leaf, x, 4.4 * s, z, world); c.scale.set(1.2, 0.9, 1.2); };
  for (let i = 0; i < 70; i++) { const s = i % 2 ? 1 : -1; oak(s * (40 + r() * 140), 60 - i * 9.5 - r() * 6, 1 + r() * 1.2); }
  const farm = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    add(tbox(10, 4.2, 6, 3), mCream2, 0, 2.1, 0, g);
    const sh = new THREE.Shape(); sh.moveTo(-3.4, 0); sh.lineTo(3.4, 0); sh.lineTo(0, 2.6); sh.closePath(); const rg = new THREE.ExtrudeGeometry(sh, { depth: 10.8, bevelEnabled: false }); const rm = add(rg, mTile, -5.4, 4.2, 0, g); rm.rotation.y = Math.PI / 2;
    add(box(1.2, 2.2, 0.15), toon({ color: '#5a3a24' }), -2, 1.1, 3.05, g); for (const wx of [1, 3.3]) add(box(1, 1.1, 0.15), winMat, wx, 2.3, 3.05, g, { cast: false });
    add(new THREE.CylinderGeometry(0.4, 0.5, 1.4, 6), mStone, 3.6, 5.8, 0, g); };
  for (const [x, z, ry] of [[-26, -40, 0.3], [24, -90, -0.2], [-30, -180, 0.1], [28, -230, 0], [-24, -380, -0.3], [26, -440, 0.2], [-30, -490, 0]]) farm(x, z, ry);
  { const g = new THREE.Group(); g.position.set(22, 0, -300); world.add(g); // church
    add(tbox(8, 7, 14, 3), mStone, 0, 3.5, 0, g); const sh = new THREE.Shape(); sh.moveTo(-4.3, 0); sh.lineTo(4.3, 0); sh.lineTo(0, 3); sh.closePath();
    add(new THREE.ExtrudeGeometry(sh, { depth: 14.4, bevelEnabled: false }), mSlate, 0, 7, -7.2, g);
    add(tbox(4.4, 15, 4.4, 3), mStone, 0, 7.5, 8, g); add(new THREE.ConeGeometry(3.4, 8, 4), mSlate, 0, 19, 8, g).rotation.y = Math.PI / 4;
    add(box(1.2, 2, 0.2), winMat, -4.02, 4, -2, g, { cast: false }).rotation.y = Math.PI / 2; add(new THREE.SphereGeometry(0.4, 8, 6), mGold, 0, 23.4, 8, g); }
  const hay = toon({ color: '#d8b04a' }); for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1, c = add(new THREE.SphereGeometry(1.5, 10, 8, 0, 6.283, 0, 1.57), hay, s * (14 + r() * 40), 0, -20 - i * 22, world); c.scale.set(1, 1.2, 1); }
  // distant hills
  for (let i = 0; i < 16; i++) { const a = r() * 6.283, d = 420 + r() * 220; add(new THREE.SphereGeometry(70 + r() * 50, 18, 10), toon({ color: i % 2 ? '#9db860' : '#7fa456' }), Math.cos(a) * d, -26, Math.sin(a) * d - 150, world, { cast: false }); }
  // ---- road sign + Marne bridge ----
  const signTex = P.tex(cv(512, 256, (g, w, h) => { g.fillStyle = '#f3ecd6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#271925'; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#271925'; g.font = 'bold 64px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LE FRONT', w / 2, 90); g.fillStyle = '#b8322f'; g.fillText('50 km  →', w / 2, 175); }));
  add(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 6), mIron, -5, 1.6, -160, world); const sg = add(new THREE.PlaneGeometry(2.4, 1.2), toon({ map: signTex }), -5, 3.1, -159.85, world, { cast: false });
  add(box(2.5, 1.3, 0.1), toon({ color: '#5a4332' }), -5, 3.1, -160.0, world);
  const river = add(new THREE.PlaneGeometry(900, 36), toon({ color: '#5aa0c0' }), 0, 0.0, -540, world, { cast: false }); river.rotation.x = -Math.PI / 2;
  add(tbox(8, 0.5, 40, 2), mStone, 0, 0.35, -540, world); for (const s of [-1, 1]) add(tbox(0.5, 1.1, 40, 2), mStone, s * 3.9, 1.0, -540, world);
  for (const z of [-528, -540, -552]) add(tbox(7.4, 1.4, 3, 2), mStone, 0, -0.4, z, world);
  // ---- flags (tricolore, waved per frame) ----
  const flagTex = P.tex(cv(96, 64, (g) => { g.fillStyle = '#2a4a9a'; g.fillRect(0, 0, 32, 64); g.fillStyle = '#f4f1ea'; g.fillRect(32, 0, 32, 64); g.fillStyle = '#c8312c'; g.fillRect(64, 0, 32, 64); }));
  const flags = [];
  const flagPole = (x, z, h) => { add(new THREE.CylinderGeometry(0.07, 0.09, h, 6), mIron, x, h / 2, z, world); add(new THREE.SphereGeometry(0.16, 8, 6), mGold, x, h + 0.1, z, world);
    const geo = new THREE.PlaneGeometry(3.0, 2.0, 14, 1), m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide })); m.position.set(x, h - 1.1, z + 1.5); m.rotation.y = Math.PI / 2; m.castShadow = true; world.add(m);
    m.userData.base = geo.attributes.position.array.slice(); flags.push(m); };
  flagPole(4.5, -330, 5.4); flagPole(-14, 120, 10); flagPole(-4, -470, 7);
  // ---- Renault AG-like cab ----
  const cabRed = toon({ color: '#c0302a' }), cabBlack = toon({ color: '#1f1c22' }), brass = toon({ color: '#d9a845' }), tyre = toon({ color: '#2a2628' }), rim = toon({ color: '#e8dcc0' });
  const makeCab = () => { const g = new THREE.Group(); const wheels = [];
    add(tbox(1.5, 0.7, 3.4, 2), cabRed, 0, 0.75, 0.4, g); add(tbox(1.2, 0.85, 1.2, 2), cabRed, 0, 0.9, -1.75, g);               // body + bonnet
    add(box(0.9, 0.8, 0.12), brass, 0, 0.9, -2.38, g);                                                                             // radiator
    for (const s of [-1, 1]) { const hl = add(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 10), brass, s * 0.62, 1.15, -2.2, g); hl.rotation.x = Math.PI / 2; const gl = add(new THREE.CircleGeometry(0.17, 10), lampMat, s * 0.62, 1.15, -2.32, g, { cast: false }); gl.rotation.y = Math.PI; gl.userData.lamp = true; }
    for (const [x, z] of [[-0.62, -0.6], [0.62, -0.6], [-0.62, 1.3], [0.62, 1.3], [-0.62, 1.7], [0.62, 1.7]]) if (Math.abs(z - 1.5) > 0.3 || z < 0) add(box(0.06, 1.35, 0.08), cabBlack, x, 1.5, z, g, { cast: false });
    for (const s of [-1, 1]) { add(box(0.1, 0.65, 1.7), cabRed, s * 0.78, 1.1, 0.6, g); add(box(0.08, 0.3, 0.9), cabBlack, s * 0.8, 1.2, -0.4, g, { cast: false }); } // door panels, hole for the windscreen frame
    add(tbox(1.65, 0.1, 2.5, 2), cabBlack, 0, 2.2, 0.9, g);                                                                        // roof
    const rr = add(tbox(1.5, 0.9, 0.7, 2), cabBlack, 0, 1.3, 2.25, g); rr.rotation.x = 0.1;                                       // folded landaulet hood
    const ws = add(box(1.4, 0.7, 0.04), toon({ color: '#9fd0e0' }), 0, 1.75, -0.62, g, { cast: false }); ws.rotation.x = -0.25;
    add(box(1.0, 0.1, 0.6), cabBlack, 0, 0.9, 1.0, g); add(box(0.3, 0.4, 0.3), cabBlack, 0, 1.0, -0.3, g);                         // seats
    for (const s of [-1, 1]) { add(tbox(0.4, 0.14, 1.4, 1), cabBlack, s * 0.78, 0.45, -1.7, g); add(tbox(0.4, 0.14, 1.4, 1), cabBlack, s * 0.78, 0.45, 1.5, g); } // fenders
    for (const [x, z] of [[-0.82, -1.7], [0.82, -1.7], [-0.82, 1.5], [0.82, 1.5]]) { const w = new THREE.Group(); w.position.set(x, 0.42, z); g.add(w);
      const t = add(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 14), tyre, 0, 0, 0, w); t.rotation.z = Math.PI / 2; const h = add(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 10), rim, 0, 0, 0, w); h.rotation.z = Math.PI / 2;
      add(box(0.22, 0.06, 0.5), toon({ color: '#9a7a5a' }), 0, 0, 0, w, { cast: false }); wheels.push(w); }
    g.userData.wheels = wheels; world.add(g); g.visible = false; return g; };
  const cabs = []; for (let i = 0; i < 18; i++) cabs.push(makeCab());
  // ---- small steam loco on the Paris spur (x = -22), front toward -z ----
  const loco = new THREE.Group(); world.add(loco); loco.visible = false;
  { const blk = toon({ color: '#2c2a2e' }), grn = toon({ color: '#2f5a44' }), red = toon({ color: '#b8322f' });
    const b = add(new THREE.CylinderGeometry(0.85, 0.85, 5, 14), grn, 0, 2.0, -1.4, loco); b.rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.22, 0.3, 1.2, 8), blk, 0, 3.3, -3.2, loco);
    add(tbox(2, 2.4, 2.2, 2), grn, 0, 2.4, 2.0, loco); add(tbox(2.2, 0.2, 2.6, 2), blk, 0, 3.7, 2.0, loco); add(tbox(2, 0.4, 7, 2), blk, 0, 0.95, -0.4, loco);
    for (const z of [-2.6, -1, 0.6]) for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(0.6, 0.6, 0.18, 14), red, s * 0.8, 1.1, z, loco); w.rotation.z = Math.PI / 2; }
    for (let k = 0; k < 2; k++) add(tbox(2.4, 2.4, 7, 2), toon({ color: k ? '#7a2e2a' : '#2f5a44' }), 0, 2.2, 6.5 + k * 7.6, loco); }
  strip(-22, 340, 96, 3.2, toon({ color: '#5c5248' }), 0.03);
  for (const s of [-1, 1]) strip(-22 + s * 0.72, 340, 96, 0.14, toon({ color: '#8a8f96' }), 0.07);
  // ---- clouds ----
  const clouds = [];
  { const rr = P.rng(91); for (let i = 0; i < 12; i++) { const c = cv(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  // ---- per frame ----
  const cDay = new THREE.Color('#46557a'), cWin = new THREE.Color('#ffcf6a'), cLampOff = new THREE.Color('#8a8576'), cLampOn = new THREE.Color('#fff0b8');
  const cHeadOff = new THREE.Color('#5a5148'), cHeadOn = new THREE.Color('#fff4c4');
  function state(S, f) {
    const n = S.night || 0;
    winMat.color.copy(cDay).lerp(cWin, n * 0.9); lampMat.color.copy(cHeadOff).lerp(cHeadOn, S.lamps ?? 0);
    cabs.forEach((c, i) => { const t = (S.taxis || [])[i]; c.visible = !!t; if (!t) return; c.position.set(t.x, 0, t.z); c.rotation.set(0, t.ry || 0, t.roll || 0);
      c.userData.wheels.forEach((w) => { w.rotation.x = -t.z / 0.42; }); });
    const tz = S.trainZ; loco.visible = tz !== undefined; if (loco.visible) loco.position.set(-22, 0.5, tz);
    for (const m of flags) { const pos = m.geometry.attributes.position, b = m.userData.base, T = S.flagT || 0; for (let i = 0; i < pos.count; i++) { const x = b[i * 3] + 1.5; pos.setZ(i, Math.sin(x * 2.2 - T * 5) * 0.16 * x); } pos.needsUpdate = true; m.geometry.computeVertexNormals(); }
    streetMat.color.copy(cLampOff).lerp(cLampOn, n);
  }
  return { DECK, SPOTS, clouds, state, onLight: (L) => { lampMat.fog = false; } };
}
