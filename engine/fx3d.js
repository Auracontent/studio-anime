// 3D effects driven by the episode: rain, snow, dust motes, sparks, embers, smoke, spray, light beams, animated sea, lightning.
// Every frame is a pure function of the frame number (no Math.random, no state carried between frames): the 8 render
// slices of the workflow must produce the same picture for the same frame.
//
// story.js may export   envAt(f) => ({ ... })   with any of these keys (all optional):
//   rain:   0..1          density of rain streaks around the camera          wind: [x, z]  m/s, slants rain / snow / smoke
//   snow:   0..1          falling flakes around the camera                   motes: 0..1   floating dust in the light (interiors, sunbeams)
//   sea:    { y, amp, col, deep, foam, size }   animated waves (amp in m: 0.15 calm, 0.6 rough, 1.2 storm) — hide the set's flat water
//   lightning: [f0, f1, ...]  frames of strikes: white flash + brighter sky for ~8 frames
//   sparks: [{ at:[x,y,z], f0, f1, rate, col, speed, size }]   bright particles shot upward, falling with gravity
//   embers: [{ at, f0, f1, rate, col }]                          slow rising glowing dots (fire, forge, torches)
//   smoke:  [{ at, f0, f1, rate, col, size, rise }]              soft puffs growing and fading (chimney, gun, steam, dust cloud)
//   spray:  [{ at, f0, n, power, col }]                          one burst (wave on a rock, splash, explosion of glass)
//   beams:  [{ at, yaw, pitch, len, r, col, a }]                 volumetric light cone (lighthouse, headlight, window sunbeam, torch);
//                                                                yaw/pitch in radians, yaw 0 = toward +z, pitch > 0 = downward, a = brightness 0..1
// Effects are drawn without ink and do not hide the characters from the ink pass.
const fract = (x) => x - Math.floor(x);
const h1 = (n) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);           // deterministic hash 0..1
const h2 = (n, k) => h1(n * 13.37 + k * 71.11);
const wave = (x, z, t, amp) => amp * (0.55 * Math.sin(x * 0.21 + t * 1.3) + 0.35 * Math.sin(z * 0.27 - t * 1.05 + 1.3) + 0.22 * Math.sin((x + z) * 0.52 + t * 2.1) + 0.12 * Math.sin((x - z) * 0.93 - t * 2.9));
/** Height of the animated sea at (x, z) on frame f, for floating things (boats, barrels, a swimmer): same formula as the sea itself. */
export const waveHeight = (x, z, f, amp = 0.3) => wave(x, z, f / 30, amp);

export function createFX3D(ctx) {
  const { THREE, scene, waterNd } = ctx;
  const root = new THREE.Group(); scene.add(root);
  const skip = (m, order = 3) => { m.userData.ndSkip = true; m.renderOrder = order; m.frustumCulled = false; root.add(m); return m; };

  // ---------- soft round sprite used by every particle ----------
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  const puff = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, r = 22 + 10 * h1(i), x = 64 + Math.cos(a) * 24, y = 64 + Math.sin(a) * 20;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 46); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c); })();

  // ---------- generic particle cloud: per-particle position, size (m), colour, alpha ----------
  const H = ctx.H || 1920;
  function cloud(max, tex, additive) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(max * 3), size = new Float32Array(max), col = new Float32Array(max * 3), alpha = new Float32Array(max);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('size', new THREE.BufferAttribute(size, 1));
    g.setAttribute('col', new THREE.BufferAttribute(col, 3)); g.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { tex: { value: tex }, scale: { value: H / 2 } }, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: additive ? THREE.OneFactor : THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,   // premultiplied: colour * alpha over the scene, destination alpha untouched
      vertexShader: `attribute float size; attribute vec3 col; attribute float alpha; uniform float scale; varying vec3 vC; varying float vA;
        void main(){ vC = col; vA = alpha; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = clamp(size * scale * projectionMatrix[1][1] / -mv.z, 0., 400.); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D tex; varying vec3 vC; varying float vA; void main(){ vec4 t = texture2D(tex, gl_PointCoord); float a = clamp(t.a*vA, 0., 1.); if (a < .003) discard; gl_FragColor = vec4(vC*a, a); }`,
    });
    const pts = skip(new THREE.Points(g, mat), additive ? 4 : 3); let n = 0; const c = new THREE.Color();
    return {
      begin() { n = 0; },
      push(x, y, z, s, colour, a) { if (n >= max || a <= 0.003) return; pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = z; size[n] = s; c.set(colour); col[n * 3] = c.r; col[n * 3 + 1] = c.g; col[n * 3 + 2] = c.b; alpha[n] = a; n++; },
      end() { g.setDrawRange(0, n); for (const k of ['position', 'size', 'col', 'alpha']) g.attributes[k].needsUpdate = true; pts.visible = n > 0; },
    };
  }
  const glow = cloud(6000, dot, true);      // sparks, embers, motes (additive: they light up)
  const soft = cloud(3000, dot, false);     // snow, spray
  const smokeC = cloud(800, puff, false);   // smoke puffs

  // ---------- rain: thin camera-facing streaks in a box that follows the camera ----------
  const RN = 2600, rg = new THREE.BufferGeometry(), rpos = new Float32Array(RN * 6 * 3);
  rg.setAttribute('position', new THREE.BufferAttribute(rpos, 3));
  const rmat = new THREE.MeshBasicMaterial({ color: '#d6e6ff', transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const rain = skip(new THREE.Mesh(rg, rmat), 3);

  // ---------- light beams: additive cone, bright at the source, fading with length and at the edges ----------
  const beamGeo = (() => { const g = new THREE.CylinderGeometry(0.04, 1, 1, 28, 12, true); g.translate(0, -0.5, 0); g.rotateX(-Math.PI / 2); return g; })(); // apex at the origin, opens toward +z (length 1, radius 1)
  const beamMat = () => new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color() }, a: { value: 0.5 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: `varying float vL; varying vec3 vN; varying vec3 vV; void main(){ vL = clamp(position.z, 0., 1.); vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 col; uniform float a; varying float vL; varying vec3 vN; varying vec3 vV;
      void main(){ float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.4); float fall = pow(1. - vL, 1.6) * smoothstep(0., .04, vL);
        gl_FragColor = vec4(col * a * edge * fall, 1.); }`,
  });
  const beams = []; const getBeam = (i) => beams[i] || (beams[i] = (() => { const m = skip(new THREE.Mesh(beamGeo, beamMat()), 5); return m; })());

  // ---------- animated sea: grid that follows the camera (snapped, so waves do not slide) ----------
  const SEG = 110, SEA = new THREE.PlaneGeometry(1, 1, SEG, SEG); SEA.rotateX(-Math.PI / 2);
  const seaCol = new Float32Array(SEA.attributes.position.count * 3); SEA.setAttribute('color', new THREE.BufferAttribute(seaCol, 3));
  const seaMat = new THREE.MeshToonMaterial({ gradientMap: ctx.grad, vertexColors: true });
  const sea = new THREE.Mesh(SEA, seaMat); sea.receiveShadow = true; sea.userData.nd = waterNd; sea.frustumCulled = false; sea.visible = false; root.add(sea);
  const seaFar = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: '#2f8ea8' }));
  seaFar.rotation.x = -Math.PI / 2; seaFar.userData.nd = waterNd; seaFar.visible = false; root.add(seaFar);

  const cA = new THREE.Color(), cB = new THREE.Color(), cF = new THREE.Color(), tmp = new THREE.Vector3(), right = new THREE.Vector3();
  let flashOut = 0;

  function update(E, f, camera) {
    E = E || {}; const t = f / 30, cp = camera.position, wind = E.wind || [0, 0];
    // ---- rain ----
    const rn = Math.round(RN * Math.min(1, E.rain || 0)); rain.visible = rn > 0;
    if (rn) {
      camera.getWorldDirection(tmp); right.set(-tmp.z, 0, tmp.x).normalize();
      const BX = 26, BY = 22, BZ = 26, sp = 14, len = 0.55, w = 0.012;
      for (let i = 0; i < rn; i++) {
        const fx = h2(i, 1), fz = h2(i, 2), fy = h2(i, 3);
        const y = fract(fy - (t * sp) / BY) * BY, ox = fract(fx + (wind[0] * t) / BX) * BX - BX / 2, oz = fract(fz + (wind[1] * t) / BZ) * BZ - BZ / 2;
        const X = cp.x + ox, Z = cp.z + oz, Y = cp.y - BY * 0.45 + y, dx = (wind[0] / sp) * len, dz = (wind[1] / sp) * len;
        const k = i * 18, a = [X, Y, Z], b = [X + dx, Y + len, Z + dz];
        const p = (o, v, s) => { rpos[o] = v[0] + right.x * s; rpos[o + 1] = v[1]; rpos[o + 2] = v[2] + right.z * s; };
        p(k, a, -w); p(k + 3, a, w); p(k + 6, b, w); p(k + 9, a, -w); p(k + 12, b, w); p(k + 15, b, -w);
      }
      rg.setDrawRange(0, rn * 6); rg.attributes.position.needsUpdate = true; rmat.opacity = 0.35 + 0.25 * Math.min(1, E.rain);
    }
    // ---- particles ----
    glow.begin(); soft.begin(); smokeC.begin();
    if (E.snow) { const n = Math.round(1800 * Math.min(1, E.snow)), B = 24;
      for (let i = 0; i < n; i++) { const y = fract(h2(i, 4) - t * 0.06) * B, x = fract(h2(i, 5) + t * wind[0] / B * 0.5) * B - B / 2 + Math.sin(t * 1.3 + i) * 0.3, z = fract(h2(i, 6) + t * wind[1] / B * 0.5) * B - B / 2;
        soft.push(cp.x + x, cp.y - B * 0.4 + y, cp.z + z, 0.05 + 0.05 * h2(i, 7), '#ffffff', 0.9); } }
    if (E.motes) { const n = Math.round(700 * Math.min(1, E.motes)), B = 10;
      for (let i = 0; i < n; i++) { const x = (h2(i, 8) - 0.5) * B + Math.sin(t * 0.4 + i) * 0.25, y = h2(i, 9) * 4 + Math.sin(t * 0.3 + i * 1.7) * 0.2, z = (h2(i, 10) - 0.5) * B;
        const px = cp.x + x, pz = cp.z + z - B * 0.4; if (Math.hypot(px - cp.x, y - cp.y, pz - cp.z) < 1.6) continue;   // never a giant blurry dot on the lens
        glow.push(px, y, pz, 0.025 + 0.02 * h2(i, 11), '#ffe9b0', 0.35 + 0.35 * Math.sin(t * 2 + i)); } }
    for (const s of E.sparks || []) { const rate = s.rate ?? 60, life = 26, f1 = s.f1 ?? Infinity, sp = s.speed ?? 4;
      for (let e = Math.max(s.f0, Math.floor(f - life)); e <= Math.min(f, f1); e++) { const per = Math.round(rate / 30) || 1;
        for (let j = 0; j < per; j++) { const id = e * 7 + j, age = (f - e) / 30; if (age < 0) continue; const a = h2(id, 12) * 6.283, up = sp * (0.6 + 0.6 * h2(id, 13)), out = sp * 0.45 * h2(id, 14);
          const x = s.at[0] + Math.cos(a) * out * age, z = s.at[2] + Math.sin(a) * out * age, y = s.at[1] + up * age - 4.9 * age * age;
          glow.push(x, y, z, (s.size ?? 0.09) * (1 - age / (life / 30) * 0.6), s.col || '#ffc04a', 1 - age / (life / 30)); } } }
    for (const s of E.embers || []) { const rate = s.rate ?? 20, life = 70, f1 = s.f1 ?? Infinity;
      for (let e = Math.max(s.f0, Math.floor(f - life)); e <= Math.min(f, f1); e++) { if (h2(e, 15) > rate / 30) continue; const age = (f - e) / 30, k = age / (life / 30);
        glow.push(s.at[0] + Math.sin(e + age * 2) * 0.3 + wind[0] * age * 0.3, s.at[1] + age * 0.9, s.at[2] + Math.cos(e * 1.3 + age * 2) * 0.3 + wind[1] * age * 0.3, 0.04, s.col || '#ff8a2a', (1 - k) * (0.6 + 0.4 * Math.sin(age * 9 + e))); } }
    for (const s of E.smoke || []) { const rate = s.rate ?? 6, life = 90, f1 = s.f1 ?? Infinity, sz = s.size ?? 1, rise = s.rise ?? 0.8;
      for (let e = Math.max(s.f0, Math.floor(f - life)); e <= Math.min(f, f1); e++) { if (h2(e, 16) > rate / 30) continue; const age = (f - e) / 30, k = age / (life / 30);
        smokeC.push(s.at[0] + (h2(e, 17) - 0.5) * 0.4 + wind[0] * age * 0.5, s.at[1] + rise * age, s.at[2] + (h2(e, 18) - 0.5) * 0.4 + wind[1] * age * 0.5, sz * (0.6 + 1.8 * k), s.col || '#e8e2da', 0.55 * (1 - k) * Math.min(1, age * 6)); } }
    for (const s of E.spray || []) { const age = (f - s.f0) / 30; if (age < 0 || age > 1.6) continue; const n = s.n ?? 160, pw = s.power ?? 5;
      for (let i = 0; i < n; i++) { const a = h2(i, 19) * 6.283, up = pw * (0.5 + 0.7 * h2(i, 20)), out = pw * 0.5 * h2(i, 21);
        const y = s.at[1] + up * age - 4.9 * age * age; if (y < s.at[1] - 0.5) continue;
        soft.push(s.at[0] + Math.cos(a) * out * age, y, s.at[2] + Math.sin(a) * out * age, 0.08 + 0.12 * h2(i, 22), s.col || '#f4fbff', Math.max(0, 1 - age / 1.6)); } }
    glow.end(); soft.end(); smokeC.end();
    // ---- beams ----
    const BL = E.beams || []; beams.forEach((m) => { m.visible = false; });
    BL.forEach((b, i) => { const m = getBeam(i); m.visible = (b.a ?? 0.5) > 0.005; m.position.set(...b.at);
      m.rotation.order = 'YXZ'; m.rotation.set(b.pitch || 0, b.yaw || 0, 0); 
      const L = b.len ?? 60, R = b.r ?? L * 0.08; m.scale.set(R, R, L); m.material.uniforms.col.value.set(b.col || '#fff2b0'); m.material.uniforms.a.value = b.a ?? 0.5; });
    // ---- sea ----
    const S = E.sea; sea.visible = seaFar.visible = !!S;
    if (S) {
      const size = S.size ?? 160, step = size / SEG, ox = Math.round(cp.x / step) * step, oz = Math.round(cp.z / step) * step, amp = S.amp ?? 0.3;
      sea.position.set(ox, S.y ?? -0.8, oz); sea.scale.set(size, 1, size); seaFar.position.set(cp.x, (S.y ?? -0.8) - Math.max(0.6, amp * 1.4), cp.z);
      cA.set(S.col || '#2f9ab4'); cB.set(S.deep || '#1d5f80'); cF.set(S.foam || '#f2fbff'); seaFar.material.color.copy(cB);
      const P = SEA.attributes.position;
      for (let i = 0; i < P.count; i++) {
        const lx = P.getX(i), lz = P.getZ(i), wx = ox + lx * size, wz = oz + lz * size;
        const edge = Math.min(1, (0.5 - Math.max(Math.abs(lx), Math.abs(lz))) * 8), y = wave(wx, wz, t, amp) * edge;
        P.setY(i, y);  // the plane is scaled in x/z only, so y stays in metres
        const crest = Math.max(0, y / Math.max(amp, 1e-3) - 0.45) * 2.2, k = 0.5 + 0.5 * (y / Math.max(amp, 1e-3));
        const r = cB.r + (cA.r - cB.r) * k, g = cB.g + (cA.g - cB.g) * k, bl = cB.b + (cA.b - cB.b) * k, fo = Math.min(1, crest * (S.foamAmt ?? 1));
        seaCol[i * 3] = r + (cF.r - r) * fo; seaCol[i * 3 + 1] = g + (cF.g - g) * fo; seaCol[i * 3 + 2] = bl + (cF.b - bl) * fo;
      }
      P.needsUpdate = true; SEA.attributes.color.needsUpdate = true; SEA.computeVertexNormals();
    }
    // ---- lightning ----
    flashOut = 0;
    for (const s of E.lightning || []) { const d = f - s; if (d >= 0 && d < 8) flashOut = Math.max(flashOut, d < 2 ? 0.85 : d < 3 ? 0.15 : d < 5 ? 0.55 : 0.55 * (1 - (d - 5) / 3)); }
    return { flash: flashOut };
  }
  return { update, waveAt: (x, z, f, amp) => wave(x, z, f / 30, amp) };
}
