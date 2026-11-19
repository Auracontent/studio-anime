// Library set: Paris 1918-1925 by the Seine.
// Real Paris (near bank, x < -20): a street of lit buildings along z = 0 (x -26..-70), lamps, a station at x = -78,
// the Eiffel Tower at the end of the street (x = -104), city blocks, a blueprint table at x = -35.6.
// Fake Paris (far bank, x ~ 50, z ~ -140): flat facades on struts, bulb strings, a fake station, a fake train on rails.
// Sky: three German biplanes, bombs. Ground level DECK = 6.
// state(S, f) keys (all optional): on.{win,vitrine,lamp,gare,fakewin,fakegare,bulb,train} 0..1, realGlow, fakeGlow,
//   eiffel 0..1 (bulbs light bottom->top), build 0..1 (fake facades rising), fall 0..1 (facades falling), trainZ,
//   planes [{p:[x,y,z], yaw, pitch, roll}] (nose +z, yaw -PI/2 flies toward -x), bombs [[x,y,z]].
export const DECK = 6;
export function buildParis(ctx) {
  const { THREE, T, P, scene, world, camera, M, add, box, tbox, texM, toon, waterNd } = ctx;
  // The Seine runs along z between x = -14.5 and 14.5. Real Paris: near bank (x < -20). Fake Paris: far bank, further north (z ~ -140).
  const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
    vertexShader: `#include <fog_pars_vertex>
      varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `#include <fog_pars_fragment>
      uniform float t; uniform vec3 deep, shal, glint; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      void main(){ vec2 p = vW.xz*vec2(.35,.12) + vec2(0., -t*.25);
        float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4; float edge = smoothstep(10., 17., abs(vW.x));
        vec3 c = mix(deep, shal, .35 + .4*n + .4*edge);
        float streak = smoothstep(.72, .78, noise(vW.xz*vec2(.8,.09) + vec2(0., -t*.6))) * (1.-edge*.5);
        c = mix(c, glint, streak*.75);
        gl_FragColor = vec4(c,1.);
        #include <fog_fragment>
      }`,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 2300), waterMat); water.rotation.x = -Math.PI / 2; water.position.y = 0;
  water.userData.nd = waterNd; water.receiveShadow = false; scene.add(water);
  const bankGeo = (s) => {
    const shape = new THREE.Shape(); shape.moveTo(14.5 * s, -1.2); shape.lineTo(20.5 * s, DECK - 0.02); shape.lineTo(1150 * s, DECK - 0.02); shape.lineTo(1150 * s, -1.2);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 2300, bevelEnabled: false }); g.translate(0, 0, -1150); return g;
  };
  const bankMat = M.grass.clone(); bankMat.map = M.grass.map.clone(); bankMat.map.repeat.set(0.25, 0.25); bankMat.map.needsUpdate = true;
  for (const s of [-1, 1]) add(bankGeo(s), [M.stone, bankMat], 0, 0, 0, world, { cast: false });
  // quays + street paving in real Paris
  const pave = M.stone.clone(); pave.map = M.stone.map.clone(); pave.map.repeat.set(0.5, 0.5); pave.map.needsUpdate = true;
  const street = add(new THREE.PlaneGeometry(60, 7), pave, -52, DECK + 0.01, 0, world, { cast: false }); street.rotation.x = -Math.PI / 2;
  const quay = add(new THREE.PlaneGeometry(6, 300), pave, -23.5, DECK + 0.012, 0, world, { cast: false }); quay.rotation.x = -Math.PI / 2;
  
  // ---- light-up materials (kinds switched per frame) ----
  const LIT = { win: '#ffcf73', vitrine: '#ffe2a0', lamp: '#fff1c2', gare: '#ffd98a', bulb: '#fff4c8', train: '#ffd27a' };
  const matOn = {}; for (const [k, c] of Object.entries(LIT)) matOn[k] = new THREE.MeshBasicMaterial({ color: c, fog: false });
  const matOff = toon({ color: '#2a2433' }), bulbOff = toon({ color: '#6a6458' });
  const lights = []; // {mesh, kind, r}
  const lightObj = (m, kind, r) => { m.userData.kind = kind; m.userData.r = r; m.castShadow = false; lights.push(m); return m; };
  const rl = P.rng(77);
  
  // ---- real Paris: a street of tall plaster buildings with zinc roofs ----
  const zinc = toon({ color: '#6f7d8c' }), stoneB = texM(P.plaster(28, 42), 1, 1, '#efe2c8');
  const building = (x, z, w, d, h, face) => { // face: +1 front looks +z, -1 looks -z
    const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
    add(tbox(w, h, d, 2.5), face % 2 ? stoneB : M.plaster, 0, h / 2, 0, g);
    const rf = add(tbox(w + 0.3, 1.6, d + 0.3, 2), zinc, 0, h + 0.8, 0, g); rf.scale.set(1, 1, 1);
    const fz = face * (d / 2 + 0.03);
    // ground floor shop windows (vitrines) + door
    for (let i = 0; i < 2; i++) lightObj(add(box(w * 0.32, 1.7, 0.12), matOn.vitrine, (i ? 1 : -1) * w * 0.25, 1.3, fz, g, { cast: false }), 'vitrine', rl());
    add(box(0.9, 2.0, 0.12), M.door, 0, 1.0, fz * 1.001, g, { cast: false });
    // upper windows
    const floors = Math.floor((h - 3) / 2.3);
    for (let fl = 0; fl < floors; fl++) for (let c = 0; c < 3; c++)
      lightObj(add(box(0.75, 1.15, 0.12), matOn.win, (c - 1) * w * 0.3, 3.6 + fl * 2.3, fz, g, { cast: false }), 'win', rl());
    return g;
  };
  for (let i = 0; i < 7; i++) { const x = -27 - i * 6.6; building(x, -7.2, 6.2, 6, 9 + (i % 3) * 1.6, 1); building(x - 1.5, 7.2, 6.2, 6, 8.5 + ((i + 1) % 3) * 1.8, -1); }
  // street lamps
  for (let i = 0; i < 6; i++) for (const z of [-3.1, 3.1]) {
    const x = -26 - i * 7.5 - (z > 0 ? 3.5 : 0);
    add(new THREE.CylinderGeometry(0.06, 0.09, 3.6, 6), M.iron, x, DECK + 1.8, z, world);
    lightObj(add(new THREE.SphereGeometry(0.26, 10, 8), matOn.lamp, x, DECK + 3.75, z, world, { cast: false }), 'lamp', i / 6 * 0.9 + rl() * 0.1);
  }
  // the station at the end of the street (front faces +x)
  const gare = new THREE.Group(); gare.position.set(-78, DECK, 0); world.add(gare);
  add(tbox(5, 12, 22, 2.5), stoneB, 0, 6, 0, gare);
  add(tbox(5.4, 1.2, 22.4, 2), zinc, 0, 12.6, 0, gare);
  for (const z of [-6, 0, 6]) lightObj(add(box(0.12, 6, 3.6), matOn.gare, 2.53, 4.8, z, gare, { cast: false }), 'gare', 0.2 + rl() * 0.5);
  const clockFace = add(new THREE.CylinderGeometry(1.1, 1.1, 0.15, 24), matOn.gare, 2.6, 9.6, 0, gare, { cast: false }); clockFace.rotation.z = Math.PI / 2; lightObj(clockFace, 'gare', 0.9);
  // city blocks for the aerial shots (dark boxes, lit windows texture on top)
  const cityTex = (seed, n) => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); const r = P.rng(seed);
    for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,${190 + r() * 50 | 0},${90 + r() * 60 | 0},${0.5 + r() * 0.5})`; const s = 2 + r() * 4; g.fillRect(r() * 512, r() * 512, s, s); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const cityGlowMat = new THREE.MeshBasicMaterial({ map: cityTex(5, 2600), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
  const realGlow = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), cityGlowMat); realGlow.rotation.x = -Math.PI / 2; realGlow.position.set(-130, DECK + 9, 0);
  realGlow.userData.ndSkip = true; scene.add(realGlow);
  { const r = P.rng(8); for (let i = 0; i < 160; i++) { const x = -40 - r() * 190, z = (r() - 0.5) * 220; if (x > -125 && Math.abs(z) < 14) continue; if (Math.hypot(x + 104, z) < 16) continue; const h = 7 + r() * 6;
    add(tbox(5 + r() * 6, h, 5 + r() * 6, 3), i % 2 ? M.plaster : stoneB, x, DECK + h / 2, z, world); } }
  
  // ---- the Eiffel Tower (stylised), with bulbs that light up bottom to top ----
  const EIF = new THREE.Vector3(-104, DECK, 0), EH = 46;
  const tower = new THREE.Group(); tower.position.copy(EIF); world.add(tower);
  const iron = toon({ color: '#7b5a45' });
  const strut = (a, b, w = 0.7) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
    const m = add(box(w, L, w), iron, 0, 0, 0, tower); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m; };
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { strut([sx * 8, 0, sz * 8], [sx * 4, 13, sz * 4], 1.3); strut([sx * 4, 13, sz * 4], [sx * 1.8, 27, sz * 1.8], 0.9); }
  for (const [y, s] of [[13, 11], [27, 5.2]]) add(tbox(s, 0.7, s, 2), iron, 0, y, 0, tower);
  const arch = add(new THREE.TorusGeometry(5.2, 0.35, 6, 24, Math.PI), iron, 0, 2.6, 8 - 0.5, tower); arch.scale.set(1, 1.15, 1);
  const arch2 = arch.clone(); arch2.position.z = -7.5; tower.add(arch2);
  const top = add(new THREE.CylinderGeometry(0.35, 1.9, 17, 4), iron, 0, 27 + 8.5, 0, tower); top.rotation.y = Math.PI / 4;
  add(new THREE.CylinderGeometry(0.05, 0.12, 2.5, 6), iron, 0, 45.2, 0, tower);
  // bulbs: instanced, unlit, never inked
  const bulbPts = [];
  const along = (a, b, n) => { for (let i = 0; i <= n; i++) { const t = i / n; bulbPts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); } };
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    for (const o of [-0.7, 0.7]) { along([sx * 8 + o * sx, 0.5, sz * 8 - o * sz], [sx * 4 + o * sx * 0.5, 13, sz * 4 - o * sz * 0.5], 22); along([sx * 4 + o * sx * 0.4, 13.4, sz * 4], [sx * 1.8, 27, sz * 1.8 + o * 0.3], 20); }
    along([sx * 1.85, 27.5, sz * 1.85], [sx * 0.3, 44, sz * 0.3], 26);
  }
  for (const [y, s] of [[13.4, 5.6], [27.4, 2.7]]) for (const [ax, az] of [[1, 0], [0, 1]]) for (const sgn of [-1, 1]) along([ax ? -s : sgn * s, y, az ? -s : sgn * s], [ax ? s : sgn * s, y, az ? s : sgn * s], 14);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false }), bulbPts.length);
  { const m4 = new THREE.Matrix4(); bulbPts.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); bulbs.setMatrixAt(i, m4); bulbs.setColorAt(i, new THREE.Color('#5a5048')); }); }
  bulbs.userData.ndSkip = true; bulbs.castShadow = false; tower.add(bulbs);
  const glowMat = new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,214,140', 0.9)), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const towerGlow = new THREE.Mesh(new THREE.PlaneGeometry(70, 90), glowMat); towerGlow.position.set(EIF.x, EIF.y + 24, EIF.z); towerGlow.userData.ndSkip = true; scene.add(towerGlow);
  
  // ---- fake Paris: flat wooden facades on struts, bulb strings, a fake station, a fake train ----
  const FP = new THREE.Vector3(50, DECK, -140);
  const fakeGlow = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({ map: cityTex(6, 1500), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  fakeGlow.rotation.x = -Math.PI / 2; fakeGlow.position.set(FP.x + 10, DECK + 0.3, FP.z); fakeGlow.userData.ndSkip = true; scene.add(fakeGlow);
  const facades = [];
  const facade = (x, z, w, h, face, i) => { // face: +1 looks +x, -1 looks -x
    const piv = new THREE.Group(); piv.position.set(x, DECK, z); world.add(piv);
    const g = new THREE.Group(); piv.add(g);
    add(tbox(0.15, h, w, 2), i % 2 ? M.plaster : stoneB, 0, h / 2, 0, g);
    for (let fl = 0; fl < 2; fl++) for (let c = 0; c < 2; c++) lightObj(add(box(0.1, 1, 0.7), matOn.win, face * 0.09, 2.2 + fl * 2.2, (c - 0.5) * w * 0.45, g, { cast: false }), 'fakewin', rl());
    // struts behind (the joke: it's only a front)
    for (const zz of [-w * 0.35, w * 0.35]) { const s = add(tbox(0.18, h * 0.95, 0.18, 2), M.beam, -face * h * 0.22, h * 0.45, zz, g); s.rotation.z = face * 0.5; }
    piv.userData = { face, i, h }; facades.push(piv); return piv;
  };
  for (let i = 0; i < 6; i++) { facade(FP.x - 6, FP.z + 22 - i * 8.2, 7.4, 6 + (i % 3), 1, i); facade(FP.x + 6, FP.z + 18 - i * 8.2, 7.4, 6.5 + ((i + 1) % 3), -1, i + 1); }
  // bulb strings across the fake street
  const strPts = [];
  for (let i = 0; i < 7; i++) { const z = FP.z + 24 - i * 8; add(new THREE.CylinderGeometry(0.07, 0.07, 4.6, 6), M.wood, FP.x - 4.6, DECK + 2.3, z, world); add(new THREE.CylinderGeometry(0.07, 0.07, 4.6, 6), M.wood, FP.x + 4.6, DECK + 2.3, z, world);
    for (let k = 0; k <= 12; k++) { const t = k / 12; strPts.push([FP.x - 4.6 + 9.2 * t, DECK + 4.4 - Math.sin(t * Math.PI) * 0.9, z]); } }
  const strBulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false }), strPts.length);
  { const m4 = new THREE.Matrix4(); strPts.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); strBulbs.setMatrixAt(i, m4); strBulbs.setColorAt(i, new THREE.Color('#5a5048')); }); }
  strBulbs.userData.ndSkip = true; world.add(strBulbs);
  // fake Gare du Nord: a big painted front, propped up from behind
  const fgare = new THREE.Group(); fgare.position.set(FP.x, DECK, FP.z - 32); world.add(fgare); facades.push(fgare); fgare.userData = { face: 0, i: 3, h: 10, gare: true };
  const fgInner = new THREE.Group(); fgare.add(fgInner);
  add(tbox(18, 10, 0.2, 2.5), stoneB, 0, 5, 0, fgInner);
  const ped = new THREE.Shape(); ped.moveTo(-9, 0); ped.lineTo(9, 0); ped.lineTo(0, 3.2); ped.closePath();
  add(new THREE.ExtrudeGeometry(ped, { depth: 0.2, bevelEnabled: false }), stoneB, 0, 10, -0.1, fgInner);
  for (const x of [-5.5, 0, 5.5]) lightObj(add(box(3, 5, 0.1), matOn.gare, x, 4.2, 0.12, fgInner, { cast: false }), 'fakegare', 0.1 + rl() * 0.4);
  lightObj(add(new THREE.CylinderGeometry(1, 1, 0.1, 24), matOn.gare, 0, 8.3, 0.15, fgInner, { cast: false }), 'fakegare', 0.6).rotation.x = Math.PI / 2;
  for (const x of [-7, -2.5, 2.5, 7]) { const s = add(tbox(0.22, 10.5, 0.22, 2), M.beam, x, 4.8, -2.4, fgInner); s.rotation.x = -0.45; }
  // rails + fake train
  for (const dx of [-0.6, 0.6]) add(tbox(0.12, 0.1, 160, 2), M.iron, FP.x + 15 + dx, DECK + 0.06, FP.z, world, { cast: false });
  const train = new THREE.Group(); world.add(train);
  const carMat = toon({ color: '#3d4a5a' });
  for (let i = 0; i < 6; i++) { const car = new THREE.Group(); car.position.z = i * 5.6; train.add(car);
    add(tbox(2.2, 2.4, 5, 2), carMat, 0, 1.6, 0, car);
    for (const s of [-1, 1]) for (let w = 0; w < 3; w++) lightObj(add(box(0.1, 0.7, 0.9), matOn.train, s * 1.12, 2.0, (w - 1) * 1.5, car, { cast: false }), 'train', 0.1); }
  train.position.set(FP.x + 15, DECK, FP.z + 60);
  
  // ---- German bombers (stylised biplanes) + bombs ----
  const planeMat = toon({ color: '#55613f' }), planeDark = toon({ color: '#3a3f34' }), crossM = toon({ color: '#e9e4d6' });
  const makePlane = () => { const g = new THREE.Group();
    add(tbox(0.9, 0.9, 7, 2), planeMat, 0, 0, 0, g); add(tbox(15, 0.14, 1.7, 2), planeMat, 0, 1.0, 0.4, g); add(tbox(13, 0.14, 1.5, 2), planeMat, 0, -0.45, 0.5, g);
    add(tbox(4, 0.12, 1, 2), planeMat, 0, 0.2, -3.2, g); add(tbox(0.12, 1.4, 1, 2), planeMat, 0, 0.8, -3.3, g);
    for (const s of [-1, 1]) { add(new THREE.CylinderGeometry(0.32, 0.32, 1.6, 8), planeDark, s * 2.4, 0.3, 0.9, g).rotation.x = Math.PI / 2; add(tbox(0.08, 1.5, 0.08, 1), planeDark, s * 5, 0.3, 0.4, g); }
    for (const s of [-1, 1]) add(tbox(1.1, 0.16, 1.1, 1), crossM, s * 5.6, 1.08, 0.4, g);
    scene.add(g); g.visible = false; return g; };
  const planes = [makePlane(), makePlane(), makePlane()];
  const bombMat = toon({ color: '#2d2a28' });
  const bombs = []; for (let i = 0; i < 8; i++) { const b = add(new THREE.CapsuleGeometry(0.22, 0.7, 4, 8), bombMat, 0, -50, 0, scene); b.visible = false; bombs.push(b); }
  
  // ---- blueprint table (the engineer's idea) ----
  const bpTex = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 360; const g = c.getContext('2d');
    g.fillStyle = '#2f5c9a'; g.fillRect(0, 0, 512, 360); g.strokeStyle = '#dbe9ff'; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { g.strokeRect(40 + i * 86, 200 - (i % 3) * 40, 64, 110 + (i % 3) * 40); }
    g.beginPath(); g.moveTo(30, 320); g.lineTo(490, 320); g.stroke(); g.setLineDash([8, 8]); g.beginPath(); g.moveTo(30, 90); g.bezierCurveTo(200, 40, 320, 140, 490, 70); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const table = new THREE.Group(); table.position.set(-35.6, DECK, -2.3); world.add(table);
  add(tbox(2.4, 0.12, 1.3, 1), M.wood, 0, 1.0, 0, table); for (const [x, z] of [[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]]) add(tbox(0.1, 1, 0.1, 1), M.wood, x, 0.5, z, table);
  const plan = add(new THREE.PlaneGeometry(1.9, 1.1), toon({ map: bpTex }), 0, 1.07, 0, table, { cast: false }); plan.rotation.x = -Math.PI / 2 + 0.25;
  // background hills
  const rt = P.rng(44);
  for (let i = 0; i < 16; i++) { const a = rt() * Math.PI * 2, d = 260 + rt() * 160; const h = add(new THREE.SphereGeometry(40 + rt() * 40, 20, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -12, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.45 + rt() * 0.25; }
  for (let i = 0; i < 24; i++) { const x = 24 + rt() * 60, z = -40 - rt() * 200; if (Math.abs(x - FP.x) < 22 && Math.abs(z - FP.z) < 45) continue; const g = new THREE.Group(); g.position.set(x, DECK, z); world.add(g);
    add(new THREE.CylinderGeometry(0.2, 0.3, 4, 6), M.trunk, 0, 2, 0, g); const c = add(new THREE.SphereGeometry(1, 12, 8), M.pine, 0, 4.6, 0, g); c.scale.set(2.6, 1.6, 2.6); }
  // clouds: painted billboards far away (no fog, no ink)
  const clouds = [];
  { const r = P.rng(90);
    for (let i = 0; i < 14; i++) {
      const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
      pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
      const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
      m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
    } }
  
  
  const cOff = new THREE.Color('#5a5048'), cBulb = new THREE.Color('#fff2c0'), cStr = new THREE.Color('#ffe9a8');
  let lastEif = -1, lastStr = -1;
  function state(S, f) {
    const on = S.on || {};
    for (const m of lights) {
      const k = m.userData.kind, v = on[k] ?? 1, base = k.replace('fake', '');
      m.material = v > m.userData.r ? matOn[base] : (base === 'lamp' ? bulbOff : matOff);
    }
    const e = Math.round((S.eiffel || 0) * 200) / 200;
    if (e !== lastEif) { lastEif = e; bulbPts.forEach((p, i) => bulbs.setColorAt(i, p[1] / EH < e * 1.04 - ((i * 37) % 10) * 0.004 ? cBulb : cOff)); bulbs.instanceColor.needsUpdate = true; }
    glowMat.opacity = (S.eiffel || 0) * 0.5; towerGlow.quaternion.copy(camera.quaternion);
    const sb = Math.round((on.bulb ?? 0) * 100) / 100;
    if (sb !== lastStr) { lastStr = sb; strPts.forEach((p, i) => strBulbs.setColorAt(i, (i * 7 % strPts.length) / strPts.length < sb ? cStr : cOff)); strBulbs.instanceColor.needsUpdate = true; }
    fakeGlow.material.opacity = S.fakeGlow ?? 0; cityGlowMat.opacity = S.realGlow ?? 0;
    realGlow.visible = (S.realGlow ?? 0) > 0.01; fakeGlow.visible = (S.fakeGlow ?? 0) > 0.01;
    const build = S.build ?? 1, fall = S.fall ?? 0;
    for (const pv of facades) {
      const { face, i, gare: isG } = pv.userData, g = pv.children[0];
      const t = Math.max(0.002, Math.min(1, build * 1.7 - i * 0.1)); g.scale.y = t;
      const tf = Math.max(0, Math.min(1, fall * 1.6 - i * 0.09)), th = tf * tf * 1.52;
      pv.rotation.set(isG ? -th : 0, 0, isG ? 0 : face * th);
    }
    train.position.z = S.trainZ ?? (FP.z + 60);
    planes.forEach((pl, i) => { const P_ = (S.planes || [])[i]; pl.visible = !!P_; if (P_) { pl.position.set(...P_.p); pl.rotation.set(P_.pitch || 0, P_.yaw || 0, P_.roll || 0, 'YXZ'); } });
    bombs.forEach((b, i) => { const B = (S.bombs || [])[i]; b.visible = !!B; if (B) b.position.set(...B); });
    waterU.t.value = f / 30;
  }
  return { DECK, FP, EIF, clouds, state, onLight: (L) => { waterU.deep.value.set(L.waterDeep || '#2c6c8c'); waterU.shal.value.set(L.waterShal || '#5aaec4'); waterU.glint.value.set(L.glint || '#effaff'); } };
}
