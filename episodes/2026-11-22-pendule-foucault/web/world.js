// Monde de « Le pendule de Foucault » (Panthéon, 1851) : la nef sous la coupole (library/pantheon.js) + le pendule.
// Le pendule est suspendu en (0, PIV, 0) ; il oscille dans le plan x (fixe). Le plateau de sable (rayon DR) tourne avec le sol : état S.disc (radians).
// Les traces dans le sable sont des barres posées sur le plateau : la barre « vivante » reste alignée sur le plan du pendule, les barres figées tournent avec le sol.
import { buildPantheon } from '../library/pantheon.js';
export const PIV = 24, WL = 22.8, DR = 2.9, BR = 0.45, TIPD = 1.1, STEP = 11 * Math.PI / 180, NB = 46;
export async function buildWorld(ctx) {
  const { THREE, P, world, add, box, toon } = ctx;
  const H = buildPantheon(ctx, { seed: 1851 });
  const M = (c) => toon({ color: c });
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(3);
  // ---- plateau de sable (tourne) ----
  const sandC = cv(256, 256, (g, w, h) => { g.fillStyle = '#ead7a4'; g.fillRect(0, 0, w, h); for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${120 + r() * 50 | 0},${70 + r() * 40 | 0},${0.1 + r() * 0.2})`; g.fillRect(r() * w, r() * h, 2 + r() * 4, 1 + r() * 2); } });
  const disc = new THREE.Group(); world.add(disc);
  add(new THREE.CylinderGeometry(DR, DR + 0.08, 0.14, 48), toon({ map: P.tex(sandC, 3, 3) }), 0, 0.07, 0, disc, { cast: false });
  add(new THREE.CylinderGeometry(DR + 0.22, DR + 0.22, 0.12, 48), M('#8a5a34'), 0, 0.06, 0, disc, { cast: false });           // rebord de bois
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2, m = add(box(0.26, 0.05, 0.42), M(i % 6 === 0 ? '#c8312c' : i % 2 ? '#f4ecd8' : '#2f56a8'), Math.sin(a) * (DR + 0.02 - 0.22), 0.16, Math.cos(a) * (DR + 0.02 - 0.22), disc, { cast: false }); m.rotation.y = a; }   // graduations : on voit le sol tourner
  // ---- barres de trace ----
  const barMat = toon({ color: '#3a2a22' });
  const bars = []; for (let i = 0; i < NB + 1; i++) { const b = add(box(1, 0.03, 0.1), barMat, 0, 0.17, 0, disc, { cast: false }); b.visible = false; bars.push(b); }
  // ---- balustrade fixe autour du plateau ----
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, x = Math.sin(a) * (DR + 0.7), z = Math.cos(a) * (DR + 0.7); add(new THREE.CylinderGeometry(0.06, 0.08, 0.8, 8), M('#2f3440'), x, 0.4, z, world); add(new THREE.SphereGeometry(0.1, 8, 6), M('#d9a845'), x, 0.86, z, world); }
  add(new THREE.TorusGeometry(DR + 0.7, 0.03, 6, 48), M('#d9a845'), 0, 0.7, 0, world, { cast: false }).rotation.x = Math.PI / 2;
  // ---- le pendule ----
  const rod = add(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8), M('#2f3440'), 0, PIV + 1.6, 0, world, { cast: false }); add(new THREE.SphereGeometry(0.2, 8, 6), M('#2f3440'), 0, PIV, 0, world, { cast: false });
  const wire = add(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), M('#4a4048'), 0, 0, 0, world, { cast: false });
  const ball = new THREE.Group(); world.add(ball);
  add(new THREE.SphereGeometry(BR, 28, 20), toon({ color: '#e0b040' }), 0, 0, 0, ball);
  add(new THREE.TorusGeometry(BR * 0.98, 0.03, 6, 28), M('#a87a22'), 0, 0, 0, ball, { cast: false }).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.07, 0.12, 0.18, 8), M('#a87a22'), 0, BR + 0.05, 0, ball);
  const tip = add(new THREE.ConeGeometry(0.1, 0.62, 8), M('#2f3440'), 0, -BR - 0.31, 0, ball); tip.rotation.x = Math.PI;
  const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
  const state = (S) => {
    disc.rotation.y = S.disc ?? 0;
    const b = S.ball || { x: 0, y: PIV - WL, z: 0, wire: true };
    ball.position.set(b.x, b.y, b.z);
    wire.visible = !!b.wire;
    if (b.wire) { dir.set(b.x, b.y + BR + 0.12 - PIV, b.z); const len = dir.length(); wire.position.set(b.x / 2, (PIV + b.y + BR + 0.12) / 2, b.z / 2); wire.scale.set(1, len, 1); wire.quaternion.setFromUnitVectors(up, dir.normalize()); }
    const T = S.trace || { live: null, k0: null, n: 0 };
    bars.forEach((m, i) => {
      let v = false;
      if (i === 0) { const e = T.k0; v = !!e; if (v) { m.position.set(e[0], 0.17, 0); m.scale.set(e[1], 1, 1); m.rotation.y = 0; } }
      else if (i === NB) { const e = T.live; v = !!e; if (v) { m.position.set(e[0] * Math.cos(-(S.disc ?? 0)), 0.17, -e[0] * Math.sin(-(S.disc ?? 0))); m.scale.set(e[1], 1, 1); m.rotation.y = -(S.disc ?? 0); } }
      else { v = i <= T.n; if (v) { m.position.set(0, 0.17, 0); m.scale.set(2 * 2.4, 1, 1); m.rotation.y = -i * STEP; } }
      m.visible = v;
    });
  };
  return { DECK: 0, clouds: H.clouds, state, onLight: () => {}, WIN: H.WIN };
}
