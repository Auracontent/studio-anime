// Library set: les freins magnétiques d'aujourd'hui : une montagne russe qui freine toute seule en bout de piste (ailerons de cuivre entre des rangées
// d'aimants) et un train qui ralentit sur sa voie, avec une grande roue et des tentes de fête en fond. Construit loin du cabinet, à x = FX.
// Sol DECK = 0. Montagne russe : rails le long de x à z = 0 (hauteur 1.4), la voiture roule vers +x, zone de freinage x de 12 à 46.
// Train : voie le long de x à z = -26, quai à z = -22.5, le train roule vers +x. Caméras côté +z (yaw ~0).
// state(S, f) : S.car = x de la voiture (local), S.train = x du nez du train (local), S.wheel = angle de la grande roue, S.pulse 0..1 (aimants qui s'allument).
import { propKit } from './props.js';
export const DECK = 0;
export const FX = 3000;
export const BRAKE = [12, 46], RAILY = 1.4, TRAINZ = -26;
export const SPOTS = { coaster: [FX + 20, 0, 0], train: [FX + 20, 0, TRAINZ] };

export function buildFreins(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(2026), M = (c) => toon({ color: c }), K = propKit(ctx, { seed: 2026 });
  const W = new THREE.Group(); W.position.set(FX, 0, 0); world.add(W);
  const grassT = cv(256, 256, (g, w, h) => { g.fillStyle = '#86b84e'; g.fillRect(0, 0, w, h); for (let k = 0; k < 700; k++) { g.fillStyle = `rgba(${90 + r() * 60 | 0},${150 + r() * 50 | 0},${50 + r() * 30 | 0},0.35)`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 8); } });
  const pathT = cv(256, 256, (g, w, h) => { g.fillStyle = '#e0c898'; g.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${170 + r() * 40 | 0},${140 + r() * 40 | 0},${100 + r() * 30 | 0},0.4)`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 1 + r() * 3); } });
  const ballT = cv(256, 256, (g, w, h) => { g.fillStyle = '#8a7a6a'; g.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { const c = [[150, 140, 128], [118, 104, 92], [176, 160, 140]][k % 3]; g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, 6.283); g.fill(); } });
  const mSteel = M('#9aa4ae'), mIron = M('#2f3440'), mRed = M('#e23d32'), mSil = M('#cfd6de'), mCu = M('#d27a3e'), mWhite = M('#f4f1ea'), mBlue = M('#2f7fd8'), mGlass = M('#9ed2ea');
  // ---------- sol ----------
  const gr = add(new THREE.PlaneGeometry(400, 260), toon({ map: P.tex(grassT, 60, 40) }), 0, 0.003, -40, W, { cast: false }); gr.rotation.x = -Math.PI / 2;
  const pa = add(new THREE.PlaneGeometry(130, 12), toon({ map: P.tex(pathT, 14, 2) }), 18, 0.01, 7.5, W, { cast: false }); pa.rotation.x = -Math.PI / 2;
  // ---------- montagne russe : voie ----------
  const X0 = -30, X1 = 70;
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.06, 0.06, X1 - X0, 8), mSteel, (X0 + X1) / 2, RAILY, s * 0.55, W).rotation.z = Math.PI / 2;
  for (let x = X0; x <= X1; x += 1.6) add(box(0.14, 0.08, 1.4), M('#7a5434'), x, RAILY - 0.09, 0, W, { cast: false });
  for (let x = X0; x <= X1; x += 4) { add(box(0.2, RAILY - 0.1, 0.2), M(((x - X0) / 4) % 2 ? '#e23d32' : '#f4f1ea'), x, (RAILY - 0.1) / 2, 0, W); add(box(0.16, 0.16, 1.6), mIron, x, RAILY - 0.18, 0, W, { cast: false }); }
  // zone de freinage : rangées d'aimants rouges et argent de chaque côté de l'aileron
  const nBlk = Math.floor((BRAKE[1] - BRAKE[0]) / 0.5), blkG = box(0.4, 0.34, 0.12);
  const instR = new THREE.InstancedMesh(blkG, mRed, nBlk * 2), instS = new THREE.InstancedMesh(blkG, mSil, nBlk * 2), m4 = new THREE.Matrix4();
  let iR = 0, iS = 0;
  for (let i = 0; i < nBlk; i++) for (const s of [-1, 1]) { m4.makeTranslation(BRAKE[0] + 0.25 + i * 0.5, 0.98, s * 0.11); (i % 2 ? instS : instR).setMatrixAt(i % 2 ? iS++ : iR++, m4); }
  instR.count = iR; instS.count = iS; instR.castShadow = instS.castShadow = true; W.add(instR); W.add(instS);
  for (let x = BRAKE[0]; x <= BRAKE[1]; x += 2) { add(box(0.1, 0.5, 0.5), mIron, x, 0.98, 0, W); add(box(0.2, 0.04, 0.6), mIron, x, 0.74, 0, W, { cast: false }); }
  // panneau « zone de freinage » côté public (pas de texte : bandes jaunes et noires)
  for (let i = 0; i < 6; i++) add(box(0.5, 0.12, 0.05), M(i % 2 ? '#1c1a22' : '#ffd23a'), BRAKE[0] + 0.5 + i * 0.5, 1.2, 0.8, W, { cast: false });
  // ---------- la voiture ----------
  const car = new THREE.Group(); W.add(car);
  add(box(3.4, 0.55, 1.2), M('#e8442e'), 0, RAILY + 0.45, 0, car); add(box(3.0, 0.3, 1.0), M('#ffd23a'), 0, RAILY + 0.82, 0, car);
  add(new THREE.CylinderGeometry(0.6, 0.6, 0.55, 14, 1, false, 0, Math.PI), M('#e8442e'), 1.7, RAILY + 0.45, 0, car).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) for (const x of [-1.1, 1.1]) add(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12), mIron, x, RAILY + 0.08, s * 0.62, car).rotation.x = Math.PI / 2;
  add(box(0.08, 0.5, 1.1), mIron, 0.2, RAILY + 1.25, 0, car); add(box(0.08, 0.5, 1.1), mIron, -1.2, RAILY + 1.25, 0, car);  // arceaux
  // l'aileron de cuivre sous la voiture, entre les rangées d'aimants
  add(box(1.8, 0.4, 0.05), mCu, 0, 0.98, 0, car); add(box(0.2, 0.3, 0.1), mIron, 0, RAILY - 0.08, 0, car);
  // ---------- grande roue + tentes de fête (fond) ----------
  const wheel = new THREE.Group(); wheel.position.set(-14, 9.8, -34); W.add(wheel);
  add(new THREE.TorusGeometry(8.5, 0.18, 8, 40), M('#e8442e'), 0, 0, 0, wheel); add(new THREE.TorusGeometry(5, 0.1, 6, 32), M('#ffd23a'), 0, 0, 0, wheel);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; add(box(17, 0.1, 0.1), M('#f4f1ea'), 0, 0, 0, wheel, { cast: false }).rotation.z = a; }
  const gond = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, g = new THREE.Group(); g.position.set(Math.cos(a) * 8.5, Math.sin(a) * 8.5, 0); wheel.add(g); add(box(1.1, 0.9, 1.0), M(['#2f7fd8', '#ffd23a', '#e8442e', '#7cc043'][i % 4]), 0, -0.55, 0, g); gond.push(g); }
  add(box(0.5, 9.8, 0.5), mIron, -14, 4.9, -34.8, W); add(box(0.5, 9.8, 0.5), mIron, -14, 4.9, -33.2, W);
  const tent = (x, z, c1, c2) => { const g = new THREE.Group(); g.position.set(x, 0, z); W.add(g); add(box(5, 2.2, 4), M(c1), 0, 1.1, 0, g); const roof = add(new THREE.ConeGeometry(4.2, 2.2, 4), M(c2), 0, 3.3, 0, g); roof.rotation.y = Math.PI / 4; };
  tent(28, -10, '#f4f1ea', '#e8442e'); tent(38, -12, '#ffe9a8', '#2f7fd8'); tent(-4, -14, '#f4f1ea', '#7cc043'); tent(58, -9, '#ffe9a8', '#e8442e');
  for (const [x, z] of [[8, 5.5], [24, 5.5], [40, 5.5], [56, 5.5]]) K.lamp(FX + x, z);
  // ---------- voie de train + quai ----------
  add(tbox(120, 0.3, 4.6, 2), toon({ map: P.tex(ballT, 40, 2) }), 20, 0.15, TRAINZ, W, { cast: false });
  for (const s of [-1, 1]) add(box(120, 0.14, 0.1), mSteel, 20, 0.37, TRAINZ + s * 0.72, W);
  for (let x = -40; x <= 80; x += 0.7) add(box(0.22, 0.1, 2.4), M('#b9b2a6'), x, 0.33, TRAINZ, W, { cast: false });
  add(box(110, 0.9, 3.6), M('#cbbfa6'), 22, 0.45, -22.2 + 0.4, W); add(box(110, 0.06, 0.3), M('#ffd23a'), 22, 0.93, -23.6 + 0.4, W, { cast: false });
  for (let x = 4; x <= 44; x += 8) { add(box(0.18, 3.0, 0.18), mIron, x, 2.4, -21.2, W); } add(box(42, 0.14, 3.4), M('#2f7fd8'), 24, 3.95, -21.8, W);
  // ---------- le train à grande vitesse (sans logo), nez vers +x ----------
  const train = new THREE.Group(); W.add(train);
  const coach = (x, nose) => { add(tbox(11.4, 3.0, 2.9, 2), mWhite, x, 2.05, 0, train); add(tbox(11.5, 0.4, 2.95, 2), mBlue, x, 1.15, 0, train);
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) add(box(1.2, 0.7, 0.06), mGlass, x - 4.2 + i * 1.7, 2.5, s * 1.48, train, { cast: false });
    for (const bx of [-3.8, 3.8]) { add(box(3.0, 0.5, 2.3), mIron, x + bx, 0.75, 0, train); for (const s of [-1, 1]) for (const wx of [-0.8, 0.8]) add(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 12), mIron, x + bx + wx, 0.5, s * 0.72, train).rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) add(box(1.6, 0.14, 0.12), mRed, x + bx, 0.46, s * 0.72, train); } };   // sabots électromagnétiques rouges juste au-dessus du rail
  coach(-5.7, true); coach(-17.5); coach(-29.3);
  { const ng = new THREE.SphereGeometry(1, 20, 14); const nose = add(ng, mWhite, 0, 2.05, 0, train); nose.scale.set(3.4, 1.5, 1.45); nose.position.x = 0.05;
    add(box(1.0, 0.7, 2.2), mGlass, 0.9, 2.5, 0, train, { cast: false }); add(box(0.1, 0.3, 1.5), M('#fff3c0'), 3.3, 1.5, 0, train, { cast: false }); add(tbox(3.4, 0.4, 2.95, 2), mBlue, -0.3, 1.15, 0, train); }
  const pulseM = [mRed];
  function state(S, f) {
    car.position.x = S.car ?? -20; car.visible = S.car !== undefined;
    train.position.set(S.train ?? -200, 0, TRAINZ); train.visible = S.train !== undefined;
    wheel.rotation.z = S.wheel ?? f * 0.002; gond.forEach((g) => { g.rotation.z = -wheel.rotation.z; });
    const p = S.pulse ?? 0; mRed.emissive = mRed.emissive || new THREE.Color(); mRed.emissive.setRGB(0.35 * p, 0.04 * p, 0.03 * p);
  }
  return { DECK, SPOTS, clouds: [], state, onLight: () => {} };
}
