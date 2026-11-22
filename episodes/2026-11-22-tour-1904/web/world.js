// Monde de "Le Tour gagné en arrivant cinquième" (1904) : route de campagne, clous, foule, gare + train, voiture, bureau du juge, ligne d'arrivée.
// Zones le long de x : route A (0..140), clous B (180..260), foule C (380..470), arrivée F = 1500, gare G = 3000, voiture CX = 4000, bureau OX = 6000.
import { buildRoute, makeBike } from '../library/route.js';
export const FX0 = 1500, GX = 3000, CX = 4000, OX = 6000;
export const BIKE_COLS = ['#d9b020', '#d23a32', '#18b8d8', '#7a3aa8', '#e8782a', '#4a9a4a'];
export async function buildWorld(ctx) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const R = buildRoute(ctx, { seed: 1904, zones: [[-30, 140], [170, 270], [370, 480], [FX0 - 60, FX0 + 60], [CX - 40, CX + 90]], roads: [[-80, 520], [FX0 - 80, FX0 + 80], [CX - 100, CX + 200]], cxs: [0, FX0, GX, CX, OX] });
  const K = R.K;
  const bikes = BIKE_COLS.map((c) => makeBike(ctx, c));
  R.nails(186, 262, 90); R.nails(204, 224, 60); R.nails(-8, 26, 50);
  R.finish(FX0);
  // dressing foule / arrivée
  for (let x = FX0 - 26; x < FX0 + 30; x += 5) { K.barrel(x + 1, -6.2); if (x % 10 === 4) K.stall(x, -7.5, 0, { awning: ['#d23a32', '#fff'] }); }
  K.sign(FX0 - 12, -5.8, 'TOUR', 0); K.sign(FX0 + 14, -5.8, '1904', 0);
  // ---- gare : voie, wagon ouvert, locomotive, quai ----
  const gr = (x0, x1, z, w, col, y = 0.012) => { const m = add(new THREE.PlaneGeometry(x1 - x0, w), toon({ color: col }), (x0 + x1) / 2, y, z, world, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };
  gr(GX - 60, GX + 60, 3.2, 14, '#d9b98a'); gr(GX - 60, GX + 60, -6.6, 2.2, '#8a7a6a', 0.02);
  for (let x = GX - 60; x < GX + 60; x += 0.8) add(box(0.22, 0.12, 2.0), toon({ color: '#6a4a32' }), x, 0.06, -6.6, world, { cast: false });
  for (const z of [-7.3, -5.9]) add(box(120, 0.1, 0.1), toon({ color: '#8a8f96' }), GX, 0.17, z, world, { cast: false });
  const wagon = (x, col) => { const g = new THREE.Group(); g.position.set(x, 0, -6.6); world.add(g);
    add(tbox(9, 2.5, 2.6, 3), toon({ color: col }), 0, 1.75, 0, g); add(box(9.4, 0.3, 2.9), toon({ color: '#3a2f2a' }), 0, 3.15, 0, g); add(box(9, 0.3, 2.4), toon({ color: '#2b2a30' }), 0, 0.5, 0, g);
    add(box(1.7, 2.1, 0.1), toon({ color: '#1d1620' }), 0, 1.6, 1.32, g, { cast: false }); add(box(0.2, 2.2, 0.14), toon({ color: '#e8c24a' }), -0.95, 1.6, 1.34, g, { cast: false }); add(box(0.2, 2.2, 0.14), toon({ color: '#e8c24a' }), 0.95, 1.6, 1.34, g, { cast: false });
    for (const wx of [-3.4, -2.4, 2.4, 3.4]) add(box(0.7, 0.8, 0.1), toon({ color: '#ffe6a8' }), wx, 2.1, 1.32, g, { cast: false });
    for (const wx of [-3, 3]) for (const wz of [-1.1, 1.1]) add(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 14), toon({ color: '#2f2a30' }), wx, 0.42, wz, g).rotation.x = Math.PI / 2;
    add(box(1.0, 0.1, 0.5), toon({ color: '#6a4a32' }), 0, 0.5, 1.6, g, { cast: false }); return g; };
  wagon(GX, '#8a4a2a'); wagon(GX + 10, '#6a7a3a');
  { const g = new THREE.Group(); g.position.set(GX - 11, 0, -6.6); world.add(g);
    add(new THREE.CylinderGeometry(1.25, 1.25, 6.4, 14), toon({ color: '#26242c' }), 0.4, 2.1, 0, g).rotation.z = Math.PI / 2; add(box(2.2, 3.0, 2.8), toon({ color: '#3a2430' }), -3.6, 2.4, 0, g); add(box(2.6, 0.25, 3.2), toon({ color: '#c8312c' }), -3.6, 4.0, 0, g);
    add(new THREE.CylinderGeometry(0.28, 0.4, 1.5, 10), toon({ color: '#1a181c' }), 2.5, 4.0, 0, g); add(new THREE.CylinderGeometry(0.45, 0.28, 0.4, 10), toon({ color: '#d9a845' }), 2.5, 4.8, 0, g);
    for (const wx of [-3.2, 0, 2.4]) for (const wz of [-1.4, 1.4]) add(new THREE.CylinderGeometry(wx === 0 ? 0.9 : 0.6, wx === 0 ? 0.9 : 0.6, 0.15, 16), toon({ color: '#c8312c' }), wx, wx === 0 ? 0.9 : 0.6, wz, g).rotation.x = Math.PI / 2; }
  add(box(8, 3.2, 3), toon({ color: '#e8d9b8' }), GX - 22, 1.6, -12, world); add(box(9, 0.5, 3.6), toon({ color: '#b9553a' }), GX - 22, 3.4, -12, world);
  { const cvS = document.createElement('canvas'); cvS.width = 512; cvS.height = 160; const c = cvS.getContext('2d'); c.fillStyle = '#1f4a8a'; c.fillRect(0, 0, 512, 160); c.fillStyle = '#f7f1e0'; c.font = '800 84px Montserrat, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GARE', 256, 84);
    add(new THREE.PlaneGeometry(3, 0.94), new THREE.MeshBasicMaterial({ map: P.tex(cvS) }), GX - 22, 2.3, -10.45, world, { cast: false }); }
  for (let x = GX - 40; x < GX + 40; x += 6) { K.bush(x + 1, -9.5); K.crate(x + 3, -3.2, { s: 0.6 }); }
  for (const x of [GX - 8, GX + 6, GX + 18]) K.lamp(x, -3.4);
  K.verge(GX - 40, GX + 40, 3.5, 9, {}); K.verge(GX - 40, GX + 40, -10, -8, {});
  for (let x = GX - 30; x < GX + 40; x += 11) K.poplar(x, -14);
  // ---- voiture 1904 (torpedo ouverte) ----
  const car = new THREE.Group(); world.add(car);
  { const body = toon({ color: '#1f5a4a' }), brass = toon({ color: '#d9a845' }), blk = toon({ color: '#1f1a1d' });
    add(tbox(3.4, 0.9, 1.5, 2), body, 0.1, 0.85, 0, car); add(tbox(1.6, 0.65, 1.3, 2), body, 2.05, 0.8, 0, car); add(box(0.15, 0.7, 1.2), brass, 2.9, 0.8, 0, car);
    for (const s of [-1, 1]) { add(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 10), brass, 2.6, 1.25, s * 0.55, car).rotation.x = Math.PI / 2; add(box(0.1, 0.5, 0.06), brass, 1.0, 1.55, s * 0.75, car); }
    add(box(0.1, 0.5, 1.3), brass, 1.0, 1.5, 0, car, { cast: false }).material = new THREE.MeshBasicMaterial({ color: '#cfe8f0', transparent: true, opacity: 0.45 });
    add(box(1.1, 0.12, 1.2), toon({ color: '#6a3a22' }), -0.8, 1.32, 0, car); add(box(0.12, 0.7, 1.2), toon({ color: '#6a3a22' }), -1.4, 1.55, 0, car);
    add(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 6), blk, -0.2, 2.0, 0.7, car, { cast: false });
  }
  const cw = [];
  for (const [wx, wz, rd] of [[1.9, 0.82, 0.5], [-1.1, 0.82, 0.58], [1.9, -0.82, 0.5], [-1.1, -0.82, 0.58]]) { const w = new THREE.Group(); w.position.set(wx, rd, wz); car.add(w);
    add(new THREE.TorusGeometry(rd, 0.09, 6, 22), toon({ color: '#1f1a1d' }), 0, 0, 0, w); for (let k = 0; k < 6; k++) add(box(rd * 2, 0.045, 0.045), toon({ color: '#d9c9a0' }), 0, 0, 0, w, { cast: false }).rotation.z = k * Math.PI / 6; cw.push(w); }
  // ---- bureau du juge (UVF), 1904 ----
  const OZ = -4.6;
  { const fl = add(new THREE.PlaneGeometry(26, 14), toon({ map: P.tex(P.planks(7), 6, 3) }), OX, 0.02, 0, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(box(26, 5.5, 0.4), toon({ map: P.tex(P.plaster(12, 30), 3, 1) }), OX, 2.75, OZ - 1.2, world); add(box(0.5, 5.5, 8), toon({ color: '#9a7a52' }), OX - 13, 2.75, 0, world); add(box(0.5, 5.5, 8), toon({ color: '#9a7a52' }), OX + 13, 2.75, 0, world);
    add(box(26, 0.6, 0.5), toon({ color: '#4a3424' }), OX, 0.3, OZ - 0.95, world, { cast: false });
    // fenêtre haute avec ciel nocturne
    add(box(3.2, 3.2, 0.12), toon({ color: '#2a3470' }), OX - 5.2, 3.0, OZ - 0.98, world, { cast: false }).material = new THREE.MeshBasicMaterial({ color: '#3a4a9a' });
    for (const [dx, dy, w, h] of [[0, 0, 3.4, 0.14], [0, 1.6, 3.4, 0.14], [0, -1.6, 3.4, 0.14], [-1.6, 0, 0.14, 3.4], [1.6, 0, 0.14, 3.4], [0, 0, 0.1, 3.2]]) add(box(w, h, 0.16), toon({ color: '#4a3424' }), OX - 5.2 + dx, 3.0 + dy, OZ - 0.92, world, { cast: false });
    // bibliothèque : rayons + registres colorés
    for (const bx of [OX + 2.4, OX + 4.2, OX + 6.0]) { add(box(1.6, 4.0, 0.7), toon({ color: '#5a3a22' }), bx, 2.0, OZ - 0.6, world);
      for (let row = 0; row < 4; row++) for (let k = 0; k < 7; k++) add(box(0.16, 0.7, 0.5), toon({ color: ['#a8322f', '#2f56a8', '#4a8a3a', '#d9a020', '#6a3a8a'][(k + row * 2) % 5] }), bx - 0.6 + k * 0.2, 0.6 + row * 0.9, OZ - 0.3, world, { cast: false }); }
    // bureau : plateau, tiroirs, lampe, registre ouvert, encrier
    const DESKZ = -1.8; add(box(3.6, 0.14, 1.5), toon({ color: '#6a4426' }), OX, 0.92, DESKZ, world); add(box(3.4, 0.9, 1.3), toon({ color: '#4a3020' }), OX, 0.45, DESKZ, world);
    add(box(1.1, 0.06, 0.8), toon({ color: '#f7f1e0' }), OX - 0.7, 1.02, DESKZ + 0.15, world, { cast: false }); add(box(1.1, 0.06, 0.8), toon({ color: '#efe7d2' }), OX - 0.7, 1.05, DESKZ + 0.15, world, { cast: false });
    add(new THREE.CylinderGeometry(0.2, 0.28, 0.12, 10), toon({ color: '#d9a845' }), OX + 1.1, 1.05, DESKZ, world); add(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), toon({ color: '#d9a845' }), OX + 1.1, 1.4, DESKZ, world);
    add(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff0b8', fog: false }), OX + 1.1, 1.85, DESKZ, world, { cast: false });
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8), toon({ color: '#1f1a1d' }), OX + 0.3, 1.1, DESKZ + 0.1, world, { cast: false });
    // piles de papiers au sol, tapis
    const rug = add(new THREE.PlaneGeometry(9, 6), toon({ color: '#7a2a3a' }), OX, 0.035, 0.6, world, { cast: false }); rug.rotation.x = -Math.PI / 2;
    for (const [x, z] of [[-8, -2.4], [-9.5, -1.4], [9, -2], [10.2, -1.2]]) { add(box(0.9, 0.5 + (x % 2 ? 0.3 : 0), 0.7), toon({ color: '#efe7d2' }), OX + x, 0.3, z, world); }
    K.pot(OX - 7.5, -3.4); K.pot(OX + 8.6, -3.4); K.crate(OX - 10.5, -2.8, { s: 0.7 }); K.crate(OX + 11, -2.6, { s: 0.7 }); K.barrel(OX - 11.4, -1.6);
    const cl = add(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 20), toon({ color: '#f7f1e0' }), OX + 8.2, 3.6, OZ - 0.9, world, { cast: false }); cl.rotation.x = Math.PI / 2; }
  // ---- état par image ----
  const state = (S) => {
    (S.bikes || []).forEach((b, i) => bikes[i].set(b.x, b.z, b));
    for (let i = (S.bikes || []).length; i < bikes.length; i++) bikes[i].set(0, 0, { vis: false });
    const c = S.car || { x: CX - 200, rot: 0 }; car.position.set(c.x, 0, c.z ?? 0); car.rotation.y = 0; cw.forEach((w) => { w.rotation.z = -c.rot; });
  };
  return { DECK: 0, clouds: R.clouds, state, onLight: () => {} };
}
