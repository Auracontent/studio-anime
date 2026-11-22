// Library set: intérieur du Panthéon de Paris (nef circulaire sous la coupole), jour d'hiver doré.
// Tout est centré sur l'origine : sol en damier de marbre, couronne de 16 colonnes (R = 11), tambour de pierre à hautes fenêtres lumineuses (R = 13),
// coupole à caissons (sommet y = 27) avec oculus lumineux, statues et bancs. Pas de plafond au-delà : la coupole ferme le ciel.
// Les caméras restent à l'intérieur (|pos| < 12.5). Retourne { DECK, clouds, state, onLight, K, R, WIN } ; WIN = fenêtres [x, y, z, yaw] pour les faisceaux (beams).
import { propKit } from './props.js';
export const DECK = 0, R = 13, DOME_Y = 14;
export function buildPantheon(ctx, opts = {}) {
  const { THREE, P, world, add, box, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(opts.seed ?? 1851);
  const M = (c) => toon({ color: c });
  const glow = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const K = propKit(ctx, { seed: 51 });
  // ---------- textures ----------
  const floorC = cv(256, 256, (g, w, h) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#bdb2a0' : '#efe6d2'; g.fillRect(x * 128, y * 128, 128, 128); }
    for (let k = 0; k < 260; k++) { g.fillStyle = `rgba(110,90,70,${0.04 + r() * 0.06})`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 14, 2 + r() * 5, r() * 3, 0, 6.283); g.fill(); }
    g.strokeStyle = 'rgba(70,52,40,0.55)'; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, h - 2); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, h); g.moveTo(0, 128); g.lineTo(w, 128); g.stroke(); });
  const wallC = cv(256, 256, (g, w, h) => { g.fillStyle = '#e6d8b8'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 128) { const o = (y / 64) % 2 ? 64 : 0; g.fillStyle = `rgb(${222 + r() * 20 | 0},${206 + r() * 20 | 0},${170 + r() * 20 | 0})`; g.fillRect(x + o + 2, y + 2, 124, 60); }
    g.strokeStyle = 'rgba(100,78,52,0.5)'; g.lineWidth = 3; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = ((y / 64) % 2 ? 64 : 0); x < w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } } });
  const cofferC = cv(256, 256, (g, w, h) => { g.fillStyle = '#efe3c4'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9b48a'; g.fillRect(26, 26, w - 52, h - 52); g.fillStyle = '#e4d3aa'; g.fillRect(44, 44, w - 88, h - 88);
    g.fillStyle = '#d9a845'; g.beginPath(); g.arc(w / 2, h / 2, 26, 0, 6.283); g.fill(); g.fillStyle = '#b5802a'; g.beginPath(); g.arc(w / 2, h / 2, 12, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(100,70,40,0.6)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); g.strokeRect(26, 26, w - 52, h - 52); });
  // ---------- sol, tambour, coupole ----------
  const fl = add(new THREE.CircleGeometry(R + 0.5, 64), toon({ map: P.tex(floorC, 14, 14) }), 0, 0, 0, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  const drum = add(new THREE.CylinderGeometry(R, R, DOME_Y, 64, 1, true), toon({ map: P.tex(wallC, 26, 3.5), side: THREE.BackSide }), 0, DOME_Y / 2, 0, world, { cast: false });
  const dome = add(new THREE.SphereGeometry(R, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), toon({ map: P.tex(cofferC, 24, 7), side: THREE.BackSide }), 0, DOME_Y, 0, world, { cast: false });
  const ocu = add(new THREE.CircleGeometry(2.6, 24), glow('#fff6d6'), 0, DOME_Y + R - 0.05, 0, world, { cast: false }); ocu.rotation.x = Math.PI / 2;
  for (const [y, h, c] of [[0.45, 0.9, '#b09870'], [DOME_Y - 0.35, 0.7, '#d9a845']]) add(new THREE.CylinderGeometry(R - 0.12, R - 0.12, h, 64, 1, true), M(c), 0, y, 0, world, { cast: false }).material.side = THREE.BackSide;   // plinthe et corniche dorée
  // ---------- hautes fenêtres du tambour (lumineuses) ----------
  const WIN = [], NW = 12;
  for (let i = 0; i < NW; i++) { const a = ((i + 0.5) / NW) * Math.PI * 2, x = Math.sin(a) * (R - 0.15), z = Math.cos(a) * (R - 0.15);
    const g = new THREE.Group(); g.position.set(x, 8.6, z); g.rotation.y = a + Math.PI; world.add(g);
    add(box(2.0, 3.8, 0.12), glow('#fff2c4'), 0, 0, 0, g, { cast: false }); add(new THREE.CircleGeometry(1.0, 16, 0, Math.PI), glow('#fff2c4'), 0, 1.9, 0, g, { cast: false });
    add(box(2.3, 0.16, 0.3), M('#b09870'), 0, -1.95, 0.05, g); add(box(0.08, 3.8, 0.16), M('#8a7458'), 0, 0, 0.04, g); add(box(2.0, 0.08, 0.16), M('#8a7458'), 0, 0.3, 0.04, g);
    WIN.push([x, 8.6, z, Math.atan2(-x, -z)]); }
  // ---------- couronne de colonnes + entablement ----------
  const NC = 16, CR = 11;
  for (let i = 0; i < NC; i++) { const a = (i / NC) * Math.PI * 2, x = Math.sin(a) * CR, z = Math.cos(a) * CR;
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = a; world.add(g);
    add(new THREE.CylinderGeometry(0.62, 0.7, 0.4, 12), M('#cfc3a6'), 0, 0.2, 0, g); add(new THREE.CylinderGeometry(0.46, 0.55, 5.6, 14), M('#f1e8d2'), 0, 3.2, 0, g);
    for (let k = -1; k <= 1; k++) add(box(0.05, 5.4, 0.05), M('#cbbd9c'), k * 0.2, 3.2, 0.46, g, { cast: false });   // cannelures
    add(new THREE.CylinderGeometry(0.68, 0.5, 0.5, 12), M('#d9a845'), 0, 6.2, 0, g); add(box(1.5, 0.3, 1.5), M('#e6dabb'), 0, 6.6, 0, g);
    const b = add(box(2.5, 0.8, 0.9), M('#e0d3b0'), 0, 7.0, 0, g); b.scale.x = (2 * Math.PI * CR / NC) / 2.5 + 0.02; }
  // ---------- statues dans le tambour ----------
  const statue = (a, col) => { const x = Math.sin(a) * (R - 0.8), z = Math.cos(a) * (R - 0.8), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = a + Math.PI; world.add(g);
    add(box(1.4, 1.2, 1.4), M('#c9bc9c'), 0, 0.6, 0, g); add(new THREE.CylinderGeometry(0.34, 0.5, 1.9, 8), M(col), 0, 2.15, 0, g); add(new THREE.SphereGeometry(0.3, 10, 8), M(col), 0, 3.35, 0, g);
    const arm = add(new THREE.CylinderGeometry(0.1, 0.12, 1.1, 6), M(col), 0.42, 2.7, 0.1, g); arm.rotation.z = -0.5; };
  for (let i = 0; i < 8; i++) statue(((i + 0.5) / 8) * Math.PI * 2 + 0.13, i % 2 ? '#b9b0a0' : '#d4c7a8');
  // ---------- habillage : bancs, pots, candélabres, caisses, panneaux, entre les colonnes et le centre ----------
  const kinds = ['bench', 'pot', 'lamp', 'crate', 'barrel', 'sign', 'sack'];
  const rr = P.rng(77);
  for (let i = 0; i < 46; i++) { const a = rr() * Math.PI * 2, d = 4.9 + rr() * 5.4, x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (d < 5.6 && Math.abs(Math.sin(a)) > 0.2 && Math.abs(z) < 3.8) continue;                 // le couloir de la caméra à gauche et à droite reste dégagé
    const k = kinds[i % kinds.length];
    if (k === 'bench') K.bench(x, z, a + Math.PI / 2, { color: '#6a4a32' }); else if (k === 'sign') K.sign(x, z, ['PANTHÉON', 'ENTRÉE', 'SILENCE', 'EXPÉRIENCE'][i % 4], a + Math.PI); else if (k === 'lamp') K.lamp(x, z, { h: 3.2 }); else K[k](x, z, {}); }
  K.verge(-2, 2, 4, 6, { density: 0.0001 });
  // tapis rouge d'entrée et bannières
  const carpet = add(new THREE.PlaneGeometry(2.6, 9), toon({ color: '#9c2a38' }), 0, 0.012, 8.5, world, { cast: false }); carpet.rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) { add(box(0.9, 4.2, 0.08), M(s > 0 ? '#2f56a8' : '#c8312c'), s * 7.4, 6.6, -R + 0.8, world, { cast: false }); add(box(0.9, 0.06, 0.1), M('#d9a845'), s * 7.4, 8.7, -R + 0.8, world, { cast: false }); }
  const clouds = [];
  return { DECK, clouds, K, R, WIN, state: () => {}, onLight: () => {} };
}
