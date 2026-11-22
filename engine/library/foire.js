// Library set: foire agricole anglaise, 1906 (prairie d'automne, enclos, tentes, guirlandes de fanions, gradins de paille, grande balance à cadran)
// + un bœuf de concours en 3D (makeOx) et une balance de pesée (makeBalance). Sol DECK = 0 ; les caméras regardent depuis +z vers -z.
// buildFoire(ctx, { cxs }) -> { DECK, K, clouds, tent, bunting, banner, hills }
import { propKit } from './props.js';
export const DECK = 0;
const cvs = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };

/** Bœuf de concours (Hereford cartoon) : corps brun, tête blanche, cornes, rosette de prix. Regarde vers +x.
 *  set(x, z, { ry, walk (0..1 cycle), nod (-1..1), vis, y, tail }) */
export function makeOx(ctx, o = {}) {
  const { THREE, world, add, toon } = ctx;
  const g = new THREE.Group(); world.add(g);
  const S = (rr, m, x, y, z, sx, sy, sz, par = g) => { const s = add(new THREE.SphereGeometry(rr, 18, 12), m, x, y, z, par); s.scale.set(sx, sy, sz); return s; };
  const hide = toon({ color: o.hide || '#9b4a26' }), hide2 = toon({ color: '#843c1e' }), white = toon({ color: '#f4ecd8' }), pink = toon({ color: '#eaa4a0' }), horn = toon({ color: '#efe1b4' }), dark = toon({ color: '#2a1c18' }), cream = toon({ color: '#e2cba0' });
  S(1, hide, 0, 1.2, 0, 1.75, 0.85, 0.82);               // corps
  S(1, white, 0.05, 0.78, 0, 1.45, 0.38, 0.79);          // ventre blanc
  S(1, hide2, 1.0, 1.58, 0, 0.7, 0.55, 0.66);            // garrot
  S(1, hide, -1.2, 1.35, 0, 0.7, 0.62, 0.74);            // croupe
  for (const [x, z] of [[1.0, 0.42], [1.0, -0.42], [-1.0, 0.42], [-1.0, -0.42]]) {   // pattes (pivot à la hanche)
    const lg = new THREE.Group(); lg.position.set(x, 1.0, z); g.add(lg);
    add(new THREE.CylinderGeometry(0.17, 0.12, 0.8, 8), white, 0, -0.42, 0, lg); add(new THREE.CylinderGeometry(0.14, 0.15, 0.16, 8), dark, 0, -0.9, 0, lg);
    (g.userData.legs ||= []).push({ lg, ph: (x > 0) === (z > 0) ? 0 : 0.5 });
  }
  const hg = new THREE.Group(); hg.position.set(1.65, 1.42, 0); g.add(hg); g.userData.head = hg;   // tête (pivot au cou)
  add(new THREE.CylinderGeometry(0.42, 0.55, 0.9, 10), hide2, -0.05, 0.0, 0, hg).rotation.z = -1.1;
  S(1, white, 0.6, -0.16, 0, 0.62, 0.5, 0.46, hg);        // crâne
  S(1, pink, 1.14, -0.32, 0, 0.3, 0.24, 0.34, hg);        // mufle
  S(1, dark, 1.36, -0.26, 0.13, 0.05, 0.05, 0.05, hg); S(1, dark, 1.36, -0.26, -0.13, 0.05, 0.05, 0.05, hg);   // narines
  S(1, cream, 0.5, 0.2, 0, 0.3, 0.2, 0.3, hg);            // toupet
  for (const k of [-1, 1]) {
    S(1, new THREE.MeshBasicMaterial({ color: '#fffdf4' }), 0.78, -0.02, k * 0.38, 0.1, 0.11, 0.06, hg);        // yeux
    S(1, new THREE.MeshBasicMaterial({ color: '#1a1216' }), 0.82, -0.02, k * 0.4, 0.055, 0.075, 0.04, hg);
    const hn = add(new THREE.ConeGeometry(0.1, 0.62, 8), horn, 0.38, 0.4, k * 0.34, hg); hn.rotation.x = k * -0.9; hn.rotation.z = 0.15;
    S(1, hide2, 0.32, 0.1, k * 0.6, 0.2, 0.1, 0.22, hg);   // oreilles
  }
  const tail = new THREE.Group(); tail.position.set(-1.8, 1.55, 0); g.add(tail); g.userData.tail = tail;
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), hide2, 0, -0.5, 0, tail); S(1, dark, 0, -1.08, 0, 0.12, 0.2, 0.12, tail);
  // rosette de prix (rouge et or) + deux rubans, sur l'épaule côté caméra
  const ro = new THREE.Group(); ro.position.set(1.15, 1.05, 0.7); g.add(ro);
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 20), toon({ color: '#e8b830' }), 0, 0, 0, ro).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20), toon({ color: '#c8312c' }), 0, 0, 0.02, ro).rotation.x = Math.PI / 2;
  for (const k of [-1, 1]) { const rb = add(new THREE.BoxGeometry(0.16, 0.55, 0.03), toon({ color: k > 0 ? '#2f56a8' : '#c8312c' }), k * 0.12, -0.42, 0, ro); rb.rotation.z = k * 0.18; }
  // ombre au sol dessinée par le moteur : rien à faire ici
  const set = (x, z, p = {}) => {
    g.visible = p.vis !== false; g.position.set(x, p.y || 0, z); g.rotation.y = p.ry || 0;
    const w = p.walk || 0; for (const { lg, ph } of g.userData.legs) lg.rotation.z = p.walk === undefined ? 0 : Math.sin((w + ph) * Math.PI * 2) * 0.45;
    g.userData.head.rotation.z = (p.nod || 0) * 0.35; g.userData.tail.rotation.z = Math.sin((p.tail || 0) * 0.2) * 0.35;
    if (p.walk !== undefined) g.position.y += Math.abs(Math.sin(w * Math.PI * 2)) * 0.05;
  };
  return { g, set };
}

/** Balance de foire : plateforme de bois + rampe, grand cadran sur un mât (lb). setDial(v 0..1 -> 0..1500 lb). */
export function makeBalance(ctx, x, z) {
  const { THREE, P, world, add, box, toon } = ctx;
  const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
  const wood = toon({ color: '#b07a44' }), wood2 = toon({ color: '#7a5130' }), iron = toon({ color: '#33363f' });
  add(box(4.6, 0.3, 3.0), wood, 0, 0.15, 0, g); add(box(4.8, 0.08, 3.2), iron, 0, 0.3, 0, g, { cast: false });
  for (const sx of [-1, 1]) add(box(0.14, 0.4, 3.2), iron, sx * 2.34, 0.2, 0, g);
  const ramp = add(box(2.6, 0.12, 2.8), wood2, -3.8, 0.13, 0, g); ramp.rotation.z = 0.12;
  for (const sz of [-1.45, 1.45]) { add(box(4.6, 0.06, 0.08), iron, 0, 1.0, sz, g); for (const sx of [-2.2, 0, 2.2]) add(box(0.1, 1.0, 0.1), wood2, sx, 0.5, sz, g); }
  add(box(0.34, 3.4, 0.34), wood2, 0, 1.7, -1.9, g);
  const face = cvs(512, 512, (c) => { c.fillStyle = '#f6f0dc'; c.beginPath(); c.arc(256, 256, 244, 0, 6.283); c.fill(); c.lineWidth = 14; c.strokeStyle = '#271925'; c.stroke();
    for (let i = 0; i <= 10; i++) { const a = (-215 + i * 25) * Math.PI / 180, r1 = i % 2 === 0 ? 170 : 195; c.lineWidth = i % 2 === 0 ? 12 : 6;
      c.beginPath(); c.moveTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1); c.lineTo(256 + Math.cos(a) * 224, 256 + Math.sin(a) * 224); c.stroke();
      if (i % 2 === 0) { c.fillStyle = '#271925'; c.font = '800 38px Montserrat, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i * 150), 256 + Math.cos(a) * 128, 256 + Math.sin(a) * 128); } }
    c.strokeStyle = '#c8312c'; c.lineWidth = 16; c.beginPath(); c.arc(256, 256, 98, (-215 + 150) * Math.PI / 180, 35 * Math.PI / 180); c.stroke();
    c.fillStyle = '#271925'; c.font = '800 54px Montserrat, Arial, sans-serif'; c.fillText('LIVRES', 256, 340); });
  const R = 1.25, dz = -1.68, dy = 3.0;
  const fc = new THREE.Mesh(new THREE.CircleGeometry(R, 40), new THREE.MeshBasicMaterial({ map: P.tex(face) })); fc.position.set(0, dy, dz + 0.2); g.add(fc);
  add(new THREE.CylinderGeometry(R + 0.08, R + 0.08, 0.3, 36), toon({ color: '#6b4a2a' }), 0, dy, dz, g).rotation.x = Math.PI / 2;
  const piv = new THREE.Group(); piv.position.set(0, dy, dz + 0.24); g.add(piv);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.8, 0.02), new THREE.MeshBasicMaterial({ color: '#c8312c' })); nd.position.y = 0.36; piv.add(nd);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), new THREE.MeshBasicMaterial({ color: '#271925' })); hub.position.z = 0.02; piv.add(hub);
  return { g, setDial: (v) => { piv.rotation.z = (125 - v * 250) * Math.PI / 180; }, dial: [x, dy, z + dz] };
}

export function buildFoire(ctx, opts = {}) {
  const { THREE, P, scene, world, add, box, tbox, toon } = ctx;
  const r = P.rng(1906), K = propKit(ctx, { seed: 1906 });
  const meadow = cvs(512, 512, (g, w, h) => { g.fillStyle = '#9bb04e'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1000; k++) { g.fillStyle = `rgba(${110 + r() * 80 | 0},${140 + r() * 50 | 0},${50 + r() * 30 | 0},0.55)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 6.283); g.fill(); }
    for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(${200 + r() * 40 | 0},${150 + r() * 50 | 0},50,0.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 4, 1 + r() * 2, r() * 3, 0, 6.283); g.fill(); } });
  const straw = cvs(512, 512, (g, w, h) => { g.fillStyle = '#d6b66e'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1100; k++) { g.strokeStyle = `rgba(${170 + r() * 70 | 0},${130 + r() * 60 | 0},${60 + r() * 30 | 0},0.7)`; g.lineWidth = 1 + r() * 1.5; const x = r() * w, y = r() * h, a = r() * 3.14; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (8 + r() * 14), y + Math.sin(a) * (8 + r() * 14)); g.stroke(); } });
  const mMeadow = toon({ map: P.tex(meadow, 240, 240) }), mStraw = toon({ map: P.tex(straw, 6, 5) });
  const ground = add(new THREE.PlaneGeometry(3000, 3000), mMeadow, 0, -0.02, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
  const pad = (x, z, w, d, m = mStraw, y = 0.01) => { const p = add(new THREE.PlaneGeometry(w, d), m, x, y, z, world, { cast: false }); p.rotation.x = -Math.PI / 2; return p; };
  // ---- tente rayée ----
  const tent = (x, z, w = 8, d = 6, c1 = '#c8312c', c2 = '#f4ecd8') => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    const mA = toon({ color: c1 }), mB = toon({ color: c2 });
    for (let i = 0; i < 8; i++) add(box(w / 8, 2.4, 0.1), i % 2 ? mB : mA, -w / 2 + (i + 0.5) * w / 8, 1.2, -d / 2, g);
    for (const s of [-1, 1]) add(box(0.1, 2.4, d), s > 0 ? mA : mB, s * w / 2, 1.2, 0, g);
    for (const s of [-1, 1]) for (const t of [-w / 2 + 0.1, w / 2 - 0.1]) add(box(0.14, 3.0, 0.14), toon({ color: '#6b4a32' }), t, 1.5, s * (d / 2 - 0.1), g);
    const n = 8; for (let i = 0; i < n; i++) { const st = add(new THREE.BoxGeometry(w / n, 0.06, d / 2 + 0.9), i % 2 ? mB : mA, -w / 2 + (i + 0.5) * w / n, 3.55, d / 4 - 0.2, g); st.rotation.x = 0.3; const st2 = add(new THREE.BoxGeometry(w / n, 0.06, d / 2 + 0.9), i % 2 ? mB : mA, -w / 2 + (i + 0.5) * w / n, 3.55, -d / 4 - 0.2, g); st2.rotation.x = -0.3; }
    for (let i = 0; i < n; i++) add(box(w / n, 0.5, 0.06), i % 2 ? mB : mA, -w / 2 + (i + 0.5) * w / n, 2.85, d / 2 + 0.55, g);
    return g; };
  // ---- guirlande de fanions entre deux points ----
  const cols = ['#c8312c', '#f2c230', '#2f56a8', '#f4ecd8', '#3f8a3a'];
  const bunting = (x0, y0, z0, x1, y1, z1, n = 16) => { for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, sag = Math.sin(t * Math.PI) * 0.7;
      const f = add(new THREE.CylinderGeometry(0.0, 0.2, 0.34, 3), toon({ color: cols[i % 5] }), x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - sag - 0.17, z0 + (z1 - z0) * t, world, { cast: false }); f.rotation.x = Math.PI; f.rotation.y = 0.5; } };
  // ---- bannière peinte ----
  const banner = (x, y, z, text, w = 9, h = 1.5) => { const c = cvs(1024, 170, (g, W, H) => { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H); g.strokeStyle = '#8a1f1a'; g.lineWidth = 16; g.strokeRect(8, 8, W - 16, H - 16);
      g.fillStyle = '#8a1f1a'; g.font = '800 92px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 4); });
    for (const s of [-1, 1]) add(box(0.22, y + 0.9, 0.22), toon({ color: '#6b4a32' }), x + s * (w / 2 + 0.2), (y + 0.9) / 2, z, world);
    add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: P.tex(c), fog: false }), x, y, z + 0.14, world, { cast: false }); add(box(w + 0.1, h + 0.1, 0.1), toon({ color: '#4a3424' }), x, y, z + 0.05, world, { cast: false }); };
  // ---- gradins de paille ----
  const hay = (x, z, n = 3) => { for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) { const b = add(box(1.5, 0.7, 0.9), mStraw, x + (j + i * 0.5) * 1.55, 0.35 + i * 0.7, z, world); b.rotation.y = (r() - 0.5) * 0.12; } };
  // ---- collines et nuages lointains ----
  const lr = P.rng(77); for (let i = 0; i < 14; i++) { const a = lr() * 6.283, d = 300 + lr() * 220; add(new THREE.SphereGeometry(70 + lr() * 50, 18, 10), toon({ color: i % 3 === 0 ? '#c9a24e' : i % 2 ? '#9db860' : '#7fa456' }), (opts.cx || 0) + Math.cos(a) * d, -26, Math.sin(a) * d - 120, world, { cast: false }); }
  const clouds = [];
  for (const cx0 of opts.cxs || [0]) { const rr = P.rng(91 + cx0); for (let i = 0; i < 10; i++) { const c = cvs(600, 400, () => {}); const pen = new ctx.T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); ctx.T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = rr() * 6.283, d = 650 + rr() * 250; m.position.set(Math.cos(a) * d + cx0, 140 + rr() * 140, Math.sin(a) * d); m.scale.setScalar(170 + rr() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
  return { DECK, K, clouds, tent, bunting, banner, hay, pad, mStraw };
}
