import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import * as STORY from './episode/story.js';
import { buildWorld } from './episode/world.js';
import { createFX3D } from './fx3d.js';
import { mood } from './moods.js';
import { marksFor } from './marks.js';
const { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } = STORY;
const DECK = STORY.DECK ?? 0;
const envAt = STORY.envAt || (() => null);   // optional: 3D effects per frame (see fx3d.js)
if (STORY.setupCast) STORY.setupCast(T);

const QS = new URLSearchParams(location.search);
const W = +(QS.get('w') || 1080), H = +(QS.get('h') || 1920);  // default vertical Short; ?w=&h= for stills (banner, logo)
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  rot: texM(P.rotten(4), 1, 1), rotB: texM(P.rotten(14), 1, 1),
  stone: texM(P.stone(4), 1, 1), stoneMoss: texM(P.mossy(P.stone(4), 5, 1.2), 1, 1),
  grass: texM(P.grass(6), 40, 40), dirt: texM(P.dirt(7), 6, 30), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#5c5a57' }), bronze: toon({ color: '#b08a4a' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }),
  window: toon({ color: '#2b2430' }), red: toon({ color: '#b8282b' }),
};
M.banner = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.banner()), alphaTest: 0.5, side: THREE.DoubleSide });
// helmet
const helmetIn = P.tex(P.helmetInside()); helmetIn.wrapS = helmetIn.wrapT = THREE.ClampToEdgeWrapping;
M.helmIn = new THREE.MeshToonMaterial({ gradientMap: grad, map: helmetIn, side: THREE.BackSide });
M.helmOut = toon({ color: '#8f8a7e' });

// ---------- ink / normal-depth contract ----------
const NOINK = 'noink'; // userData flag: never outlined (cards, fx, water handled specially)
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const uvScale = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; };
/** box with world-scaled UVs per face (texel density 1 tile per `t` metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- world (built by the episode: episode/world.js, usually from library/ modules) ----------
const world = new THREE.Group(); scene.add(world);
const ctx = { THREE, T, P, scene, world, camera, M, add, box, tbox, uvScale, texM, toon, grad, waterNd, ndMat, cardNd, rx, NOINK };
const WORLD = await buildWorld(ctx);
const clouds = WORLD.clouds || [];
const FX3D = createFX3D({ ...ctx, H });
// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor(scale = 1) {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 },
  ao: { value: 0.5 }, aoR: { value: 1 }, shTint: { value: new THREE.Color('#5d4a7a') }, shAmt: { value: 0.22 }, gam: { value: 1 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, ao, aoR, shAmt, gam; uniform vec3 fogCol, lift, gain, shTint; varying vec2 vUv;
  // screen-space ambient occlusion from the depth buffer: soft darkening in corners, under props, around feet (world only, not the 2D cards)
  float aoAt(vec2 uv){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; if (d <= 0.) return 0.;
    float R = clamp(70./d, 5., 46.) * aoR * res.y / 1920.; float o = 0.;
    for (int i=0;i<12;i++){ float fi = float(i); float a = fi*2.39996 + fract(sin(dot(uv, vec2(12.9898,78.233)))*43758.5)*6.283;
      float r = R*(.25 + .75*fract(fi*.618034)); vec4 s = texture2D(nd, uv + vec2(cos(a), sin(a))*r/res);
      float ds = s.a; if (ds <= 0.) continue; float dz = d - ds;
      o += smoothstep(.015*d, .06*d, dz) * (1. - smoothstep(.22*d, .5*d, dz)); }
    return o / 12. * (1. - smoothstep(60., 260., d));
  }
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;            // character cards: never outlined by the world ink
      if (card) ds = 1e4;                        // sky
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));                           // depth jump, near side only
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); // crease
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    c *= 1. - ao * aoAt(vUv);
    float l0 = dot(c, vec3(.299,.587,.114));
    c = mix(c, c * shTint * 1.9, (1. - smoothstep(.12, .55, l0)) * shAmt);   // shadows tinted (violet by default), never grey
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    c = pow(max(c, vec3(0.)), vec3(1./gam));   // shadow lift (moods: gamma > 1 opens dark interiors and nights without burning the lights)
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4*max(near, 1.)); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
// final copy with sRGB handled by the renderer output (we render to screen with linear->sRGB in the shader chunk)
dofScene.children[0].material.toneMapped = false;
// motion blur for fast camera moves and transitions (camera key: mblur [dx, dy] in pixels, zoomBlur 0..1): 24 taps along the move
const rtLens = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const mbU = { src: { value: rtLens.texture }, res: { value: new THREE.Vector2(W, H) }, dir: { value: new THREE.Vector2() }, zoom: { value: 0 } };
const mbScene = fs(new THREE.ShaderMaterial({ uniforms: mbU, toneMapped: false, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src; uniform vec2 res, dir; uniform float zoom; varying vec2 vUv;
  void main(){ vec3 acc = vec3(0.); float w = 0.;
    for (int i=0;i<24;i++){ float t = (float(i)/23. - .5); float k = 1. - abs(t)*1.2;
      vec2 o = dir*t/res + (vUv-.5)*zoom*.12*t; acc += texture2D(src, vUv+o).rgb*k; w += k; }
    gl_FragColor = linearToOutputTexel(vec4(acc/w, 1.)); }` }));

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff').multiplyScalar(L.exposure ?? 1); inkU.gam.value = L.gamma ?? 1;   // exposure: brightens the whole picture (interiors, night) inkU.lift.value.set(L.lift || '#000000');
  inkU.ao.value = L.ao ?? 0.7; inkU.aoR.value = L.aoR ?? 1.35; inkU.shTint.value.set(L.shadowTint || '#5d4a7a'); inkU.shAmt.value = L.shadowAmt ?? 0.22;
  if (WORLD.onLight) WORLD.onLight(L, f);
}
function placeSun(L, focus) {
  // sun direction from azimuth/elevation in world space
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
}

const cOff = new THREE.Color('#5a5048'), cBulb = new THREE.Color('#fff2c0'), cStr = new THREE.Color('#ffe9a8');
let lastEif = -1, lastStr = -1;
function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x + (a.dx || 0), a.y + (a.dy || 0), a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.sx ?? 1) * (a.flip ? -1 : 1), s * (a.sy ?? 1), s);   // sx / sy: squash and stretch (motion.js hop)
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false && a.y < (a.ground ?? DECK) + 0.5) {   // contact shadow: shrinks when the character is in the air, stretches along a fallen body
      const air = Math.max(0, a.dy || 0), k = 1 / (1 + air * 0.8), ry = c.mesh.rotation.y, lean = Math.sin(-(a.roll || 0)), sh = lean * 0.95 * s * (a.sy ?? 1);
      c.blob.visible = true; c.blob.position.set(a.x + (a.dx || 0) + Math.cos(ry) * sh, (a.ground ?? DECK) + 0.02, a.z - Math.sin(ry) * sh);
      c.blob.rotation.set(-Math.PI / 2, 0, ry); c.blob.scale.set(0.95 * s * k * (1 + 1.6 * Math.abs(lean)), 0.6 * s * k, 1); c.blob.material.opacity = k; }
  });
}



const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

// ---------- loop + mascot (2026-11) ----------
// LOOP: the last frames glide the camera back to the opening framing and dissolve into frame 0, so when the Short restarts
// the viewer does not see the seam (more re-watches, higher % watched). Story can opt out with `export const LOOP = false`.
// MASCOT: Kipa, the Pourkoipa host, pops in from the left for ~1.6 s before the loop with « Pourkoipa ? » (`export const MASCOT = false`).
const VERTICAL = H > W, LONG = TOTAL > 150;
const LOOP_ON = STORY.LOOP !== false && VERTICAL && LONG, MASCOT_ON = STORY.MASCOT !== false && VERTICAL && LONG && !!T.mascot;
const GLIDE = 24, DISS = 10, M0 = TOTAL - 96, M1 = TOTAL - 24;   // Kipa on screen ~2.4 s: « Pourkoipa ? » then « Abonne-toi ! »
const rtOut = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }), rtFirst = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const blU = { a: { value: rtOut.texture }, b: { value: rtFirst.texture }, t: { value: 0 } };
const blScene = fs(new THREE.ShaderMaterial({ uniforms: blU, toneMapped: false, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D a, b; uniform float t; varying vec2 vUv; void main(){ gl_FragColor = linearToOutputTexel(vec4(mix(texture2D(a, vUv).rgb, texture2D(b, vUv).rgb, t), 1.)); }` }));
const ovC = document.createElement('canvas'); ovC.width = W; ovC.height = H; const ovG = ovC.getContext('2d');
const ovT = new THREE.CanvasTexture(ovC); ovT.colorSpace = THREE.SRGBColorSpace;
const ovScene = fs(new THREE.MeshBasicMaterial({ map: ovT, transparent: true, depthTest: false, toneMapped: false }));
const sm3 = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const loopCam = (f) => {
  const C = camAt(f); if (!LOOP_ON || f < TOTAL - GLIDE) return C;
  const C0 = camAt(0); if (Math.hypot(C.pos[0] - C0.pos[0], C.pos[1] - C0.pos[1], C.pos[2] - C0.pos[2]) > 40) return C;   // other place: dissolve only
  const k = sm3((f - (TOTAL - GLIDE)) / GLIDE), L = (a, b) => a + (b - a) * k;
  return { ...C, pos: C.pos.map((v, i) => L(v, C0.pos[i])), look: C.look.map((v, i) => L(v, C0.look[i])), fov: L(C.fov, C0.fov), roll: L(C.roll || 0, C0.roll || 0), mblur: [0, 0], zoomBlur: 0 };
};
function drawMascot(f) {
  ovG.setTransform(1, 0, 0, 1, 0, 0); ovG.clearRect(0, 0, W, H);
  const d = f - M0, n = M1 - M0, inK = Math.min(1, d / 9), outK = Math.min(1, (M1 - f) / 8);
  const back = (t) => { t = Math.max(0, Math.min(1, t)) - 1; return t * t * (2.7 * t + 1.7) + 1; };
  const sc = (H / 1920) * 0.86, wdt = 600 * sc, x = -wdt + (wdt - 40 * W / 1080) * back(inK) * (outK < 1 ? sm3(outK) : 1), y = H * 0.3;
  ovG.setTransform(sc, 0, 0, sc, x, y);
  T.mascot(new T.Pen(ovG), { wv: d * 0.55, expr: d < n * 0.55 ? 'grin' : 'proud', look: 0.6 });
  if (d > 6 && f < M1 - 4) { // speech bubble « Pourkoipa ? »
    const sub = d >= n * 0.45, k = W / 1080;   // second half: the subscribe line (a promise, no voice, does not break the loop)
    const a = Math.min(1, (d - 6) / 5) * Math.min(1, (M1 - 4 - f) / 4), bw = (sub ? 520 : 470) * k, bh = (sub ? 190 : 150) * k, bx = Math.max(24 * W / 1080, x + 300 * sc - bw * 0.3), by = y + 70 * sc - bh;   // above Kipa's head
    ovG.setTransform(1, 0, 0, 1, 0, 0); ovG.globalAlpha = a; ovG.lineWidth = 9 * W / 1080; ovG.strokeStyle = '#271925'; ovG.fillStyle = '#ffffff';
    ovG.beginPath(); ovG.roundRect(bx, by, bw, bh, 42 * W / 1080); ovG.moveTo(bx + bw * 0.22, by + bh - 4); ovG.lineTo(bx + bw * 0.3, by + bh + 52 * W / 1080); ovG.lineTo(bx + bw * 0.42, by + bh - 4); ovG.fill(); ovG.stroke();
    ovG.fillRect(bx + bw * 0.22 + 6, by + bh - 12 * W / 1080, bw * 0.2 - 12, 14 * W / 1080);
    ovG.textBaseline = 'middle';
    if (!sub) {
      ovG.font = `900 ${Math.round(68 * k)}px Montserrat, "DejaVu Sans", sans-serif`;
      const t1 = 'Pourkoipa ', w1 = ovG.measureText(t1).width, w2 = ovG.measureText('?').width, tx = bx + (bw - w1 - w2) / 2, ty = by + bh / 2 + 4;
      ovG.fillStyle = '#271925'; ovG.fillText(t1, tx, ty); ovG.lineWidth = 8 * k; ovG.strokeText('?', tx + w1, ty); ovG.fillStyle = '#ffc72c'; ovG.fillText('?', tx + w1, ty);
    } else {
      ovG.textAlign = 'center'; ovG.fillStyle = '#271925';
      ovG.font = `900 ${Math.round(60 * k)}px Montserrat, "DejaVu Sans", sans-serif`; ovG.fillText('Abonne-toi !', bx + bw / 2, by + bh * 0.37);
      ovG.font = `700 ${Math.round(34 * k)}px Montserrat, "DejaVu Sans", sans-serif`; ovG.fillStyle = '#2563d6'; ovG.fillText('Une histoire par jour', bx + bw / 2, by + bh * 0.72);
      ovG.textAlign = 'start';
    }
    ovG.globalAlpha = 1;
  }
  ovT.needsUpdate = true;
}
function drawFrame(f, C, target) {
  const S = shotAt(f), L0 = lightFor(S, f), L = typeof L0 === 'string' ? mood(L0) : L0.mood ? mood(L0.mood, L0) : L0;   // lightFor may return a mood name (moods.js)
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); WORLD.state(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  const ACT = actorsAt(f, T);
  const MK = STORY.MARKS === false ? [] : marksFor(ACT, (k) => (f - k >= 0 ? actorsAt(f - k, T) : []), camera, f);   // automatic cartoon marks (marks.js)
  drawActors([...ACT, ...(fxAt ? fxAt(f, T) : []), ...MK], camera);
  const FXO = FX3D.update(envAt(f), f, camera);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  // pass A: colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return false; }
  // ink + grade
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : Math.max(C.flash || 0, FXO.flash || 0); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  // lens
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  const mb = C.mblur || [0, 0], zb = C.zoomBlur || 0;
  if (Math.hypot(mb[0], mb[1]) > 0.5 || zb > 0.01) {
    renderer.setRenderTarget(rtLens); renderer.render(dofScene, fsCam);
    mbU.dir.value.set(mb[0] * W / 1080, -mb[1] * H / 1920); mbU.zoom.value = zb;
    renderer.setRenderTarget(target); renderer.render(mbScene, fsCam);
  } else { renderer.setRenderTarget(target); renderer.render(dofScene, fsCam); }
  return true;
}
// SERIES: « France insolite #6 » pops in at the top for ~2.5 s (story: `export const SERIES = { name, n }`, number from tools/series.py).
// Not on frame 0, so the loop dissolve (which blends into frame 0) stays seamless.
const SER = STORY.SERIES && VERTICAL && LONG ? STORY.SERIES : null, B0 = 4, B1 = 80;
function drawBadge(f) {
  ovG.setTransform(1, 0, 0, 1, 0, 0); ovG.clearRect(0, 0, W, H);
  const k = W / 1080, d = f - B0, inK = Math.min(1, d / 9), outK = Math.min(1, (B1 - f) / 8);
  const back = (t) => { t = Math.max(0, Math.min(1, t)) - 1; return t * t * (2.7 * t + 1.7) + 1; };
  const name = SER.name.toUpperCase(), num = `#${SER.n}`;
  ovG.font = `900 ${Math.round(46 * k)}px Montserrat, "DejaVu Sans", sans-serif`; const wN = ovG.measureText(name + ' ').width;
  ovG.font = `900 ${Math.round(58 * k)}px Montserrat, "DejaVu Sans", sans-serif`; const wH = ovG.measureText(num).width;
  const bw = wN + wH + 70 * k, bh = 96 * k, cx = W / 2, cy = H * 0.135 - (1 - sm3(outK)) * 60 * k, sc = back(inK) * sm3(outK);   // pops in, shrinks away (no fade: no see-through shadow)
  if (sc < 0.02) { ovT.needsUpdate = true; return; }
  ovG.setTransform(sc, 0, 0, sc, cx * (1 - sc), cy * (1 - sc)); ovG.rotate(-0.025);
  ovG.lineWidth = 9 * k; ovG.strokeStyle = '#271925'; ovG.fillStyle = '#271925';
  ovG.beginPath(); ovG.roundRect(cx - bw / 2 + 6 * k, cy - bh / 2 + 9 * k, bw, bh, bh / 2); ovG.fill();   // drop shadow
  ovG.fillStyle = '#2563d6'; ovG.beginPath(); ovG.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, bh / 2); ovG.fill(); ovG.stroke();
  ovG.textBaseline = 'middle'; const tx = cx - bw / 2 + 35 * k, ty = cy + 3 * k;
  ovG.font = `900 ${Math.round(46 * k)}px Montserrat, "DejaVu Sans", sans-serif`; ovG.fillStyle = '#ffffff'; ovG.fillText(name, tx, ty);
  ovG.font = `900 ${Math.round(58 * k)}px Montserrat, "DejaVu Sans", sans-serif`; ovG.lineWidth = 8 * k; ovG.strokeText(num, tx + wN, ty); ovG.fillStyle = '#ffc72c'; ovG.fillText(num, tx + wN, ty);
  ovG.globalAlpha = 1; ovG.setTransform(1, 0, 0, 1, 0, 0); ovT.needsUpdate = true;
}
window.renderFrame = (f) => {
  const diss = LOOP_ON && f >= TOTAL - DISS, mascot = MASCOT_ON && f >= M0 && f < M1, badge = !!SER && f >= B0 && f < B1;
  if (badge && !diss && !mascot) { drawFrame(f, loopCam(f), null); drawBadge(f); renderer.autoClear = false; renderer.render(ovScene, fsCam); renderer.autoClear = true; return true; }
  if (!diss && !mascot) { drawFrame(f, loopCam(f), null); return true; }   // same path as before for every other frame
  if (diss) drawFrame(0, camAt(0), rtFirst);
  if (!drawFrame(f, loopCam(f), rtOut)) return true;
  blU.t.value = diss ? sm3((f - (TOTAL - DISS) + 1) / (DISS + 1)) : 0;
  renderer.setRenderTarget(null); renderer.render(blScene, fsCam);
  if (mascot) { drawMascot(f); renderer.autoClear = false; renderer.render(ovScene, fsCam); renderer.autoClear = true; }
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
