// Library set: open space de bureau (porte + interrupteur géant, imprimante, plante, cafetière, bureaux, néons, fenêtres, horloge) + chambre de Karim (lit, table de nuit).
// Bureau : x de -9 à 9, mur du fond z = -5.3, mur avant z = 9.7, plafond 3.7. Caméra côté +z (yaw ~0). Chambre : décalée de BX = 400 (lit au centre, mur du fond z = -4.6).
// DECK = 0. state(S, f) :
//   S.rows [4]  : allumage des rangées de néons (0..1), de la plus proche du mur du fond (z -3.2) à la plus proche de la caméra
//   S.sw        : interrupteur (0 = bas, 1 = haut)           S.door  : porte (0 fermée .. 1 grande ouverte)
//   S.coffee    : niveau dans la verseuse (0..1)             S.cm    : voyant de la cafetière (0/1)
//   S.plant     : 0 plante droite et verte .. 1 plante qui penche et jaunit
//   S.printer   : { shake, jam (0/1), paper (0..4 feuilles sorties), balls (0..6 boules de papier au sol) }
//   S.mugD      : mug sur le bureau de Karim (0/1)           S.mugCold : le mug de la cafetière est froid (0/1)
//   S.win       : luminosité des fenêtres (0 nuit bleue .. 1 jour)    S.screens : écrans allumés (0/1)
import { propKit } from './props.js';
export const DECK = 0;
export const BX = 400;
export const SW = [-5.1, 1.4, -5.15];                 // interrupteur
export const SPOTS = { switchK: [-4.45, 0, -4.2], door: [-6.5, 0, -5.0], printer: [-2.6, 0, -4.6], plant: [-1.0, 0, -4.7], coffee: [6.0, 0, -4.5], deskK: [2.0, 0, -2.7], clock: [-2.6, 2.6, -5.15], bed: [BX, 0, -2.2] };

export function buildBureau(ctx, { seed = 2311 } = {}) {
  const { THREE, P, world, add, box, tbox, toon } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const r = P.rng(seed), M = (c) => toon({ color: c }), K = propKit(ctx, { seed });
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
  const lerpC = (m, a, b, t) => m.color.set(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t)));
  // ---------- textures ----------
  const carpetT = cv(256, 256, (g, w, h) => { g.fillStyle = '#7a8aa0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#6f7f96' : '#8494aa'; g.fillRect(i * 64, j * 64, 64, 64); }
    g.strokeStyle = 'rgba(40,52,72,0.55)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
    for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${60 + r() * 60 | 0},${80 + r() * 60 | 0},${110 + r() * 50 | 0},0.18)`; g.fillRect(r() * w, r() * h, 2, 2); } });
  const wallT = cv(256, 256, (g, w, h) => { g.fillStyle = '#e6dcc6'; g.fillRect(0, 0, w, h); for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(${200 + r() * 30 | 0},${190 + r() * 30 | 0},${160 + r() * 30 | 0},0.25)`; g.fillRect(r() * w, r() * h, 3 + r() * 6, 3 + r() * 6); } });
  const mFloor = toon({ map: P.tex(carpetT, 6, 4) }), mWall = toon({ map: P.tex(wallT, 5, 1.2) });
  const mDesk = M('#d8b078'), mDeskD = M('#9a6c3e'), mMetal = M('#6a7280'), mDark = M('#2c3038'), mWhite = M('#f3f0e8'), mCab = M('#9aa6b4'), mBand = M('#7fa3c4');
  // ---------- pièce : sol, murs (le mur du fond a une porte), plafond ----------
  const fl = add(new THREE.PlaneGeometry(18, 15), mFloor, 0, 0.004, 2.2, world, { cast: false }); fl.rotation.x = -Math.PI / 2;
  const WZ = -5.4, WH = 3.7;
  add(tbox(2.0, WH, 0.4, 3), mWall, -8.0, WH / 2, WZ, world); add(tbox(14.9, WH, 0.4, 3), mWall, 1.55, WH / 2, WZ, world);          // du fond : à gauche de la porte et à droite
  add(tbox(1.2, WH - 2.7, 0.4, 3), mWall, -6.5, 2.7 + (WH - 2.7) / 2, WZ, world);                                                    // linteau
  add(tbox(0.4, WH, 15, 3), mWall, -9.2, WH / 2, 2.2, world); add(tbox(0.4, WH, 15, 3), mWall, 9.2, WH / 2, 2.2, world); add(tbox(18.8, WH, 0.4, 3), mWall, 0, WH / 2, 9.9, world);
  add(box(18, 0.9, 0.12), mBand, 0, 0.45, WZ + 0.26, world, { cast: false }); add(box(18, 0.08, 0.16), M('#f6f2ea'), 0, 0.92, WZ + 0.26, world, { cast: false });   // soubassement bleu
  const ce = add(new THREE.PlaneGeometry(18, 15), M('#f0ede4'), 0, WH, 2.2, world, { cast: false }); ce.rotation.x = Math.PI / 2;
  // couloir derrière la porte
  add(box(5, WH, 0.2), M('#c9cfd8'), -6.5, WH / 2, WZ - 2.6, world, { cast: false }); const cf = add(new THREE.PlaneGeometry(5, 3), M('#8a96a8'), -6.5, 0.004, WZ - 1.1, world, { cast: false }); cf.rotation.x = -Math.PI / 2;
  add(box(0.2, WH, 3), M('#c9cfd8'), -9.0, WH / 2, WZ - 1.1, world, { cast: false }); add(box(0.2, WH, 3), M('#c9cfd8'), -4.0, WH / 2, WZ - 1.1, world, { cast: false });
  // ---------- porte ----------
  const door = new THREE.Group(); door.position.set(-7.05, 0, WZ + 0.12); world.add(door);
  add(box(1.1, 2.7, 0.1), M('#b07a48'), 0.55, 1.35, 0, door); add(new THREE.SphereGeometry(0.07, 8, 6), M('#e0b848'), 0.98, 1.2, 0.09, door);
  add(box(1.0, 0.7, 0.04), M('#cfe6ee'), 0.55, 1.95, 0.06, door, { cast: false });
  for (const [x, y, w, h] of [[-0.03, 1.35, 0.1, 2.75], [1.13, 1.35, 0.1, 2.75], [0.55, 2.75, 1.3, 0.1]]) add(box(w, h, 0.22), M('#8a5a30'), -7.05 + x, y, WZ + 0.1, world, { cast: false });
  // ---------- interrupteur géant (cartoon) ----------
  add(box(0.5, 0.78, 0.06), mWhite, SW[0], SW[1], SW[2] + 0.02, world, { cast: false }); add(box(0.6, 0.88, 0.04), M('#3a3f48'), SW[0], SW[1], SW[2] - 0.0, world, { cast: false });
  const rock = new THREE.Group(); rock.position.set(SW[0], SW[1], SW[2] + 0.07); world.add(rock);
  add(box(0.26, 0.44, 0.1), new THREE.MeshBasicMaterial({ color: '#ff5a3a', fog: false }), 0, 0, 0.0, rock, { cast: false }); add(box(0.26, 0.06, 0.12), new THREE.MeshBasicMaterial({ color: '#ffe05a', fog: false }), 0, 0.17, 0.0, rock, { cast: false });
  // ---------- fenêtres (ciel peint, luminosité pilotée) ----------
  const winM = new THREE.MeshBasicMaterial({ color: '#3b4a8a', fog: false }), winTop = [];
  for (const wx of [0.4, 3.0]) {
    add(box(2.0, 1.9, 0.06), winM, wx, 2.3, WZ + 0.22, world, { cast: false });
    for (const [dx, dy, w, h] of [[0, 0, 2.2, 0.1], [0, 0.95, 2.2, 0.12], [0, -0.95, 2.2, 0.12], [-1.0, 0, 0.12, 1.95], [1.0, 0, 0.12, 1.95], [0, 0, 0.07, 1.9]]) add(box(w, h, 0.12), mWhite, wx + dx, 2.3 + dy, WZ + 0.26, world, { cast: false });
    add(box(2.3, 0.06, 0.3), mWhite, wx, 1.32, WZ + 0.34, world, { cast: false });
  }
  // ---------- néons au plafond (4 rangées x 4) ----------
  const rowM = [0, 1, 2, 3].map(() => BASIC('#6a7488')), ROWZ = [-3.2, -0.2, 2.8, 5.8];
  ROWZ.forEach((z, i) => { for (const x of [-6, -2, 2, 6]) { add(box(1.5, 0.05, 0.4), M('#dcdcdc'), x, WH - 0.04, z, world, { cast: false }); add(box(1.35, 0.03, 0.28), rowM[i], x, WH - 0.075, z, world, { cast: false }); } });
  // ---------- horloge murale : 6 h pile ----------
  const clockT = cv(256, 256, (g) => { g.fillStyle = '#f7f1e0'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#271925'; g.lineWidth = 12; g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.lineWidth = i % 3 ? 4 : 9; g.beginPath(); g.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); g.lineTo(128 + Math.sin(a) * 110, 128 - Math.cos(a) * 110); g.stroke(); }
    g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 196); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 36); g.stroke(); g.fillStyle = '#c8312c'; g.beginPath(); g.arc(128, 128, 10, 0, 7); g.fill(); });
  add(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24), M('#271925'), SPOTS.clock[0], SPOTS.clock[1], SPOTS.clock[2] + 0.04, world, { cast: false }).rotation.x = Math.PI / 2;
  add(new THREE.CircleGeometry(0.46, 28), toon({ map: P.tex(clockT) }), SPOTS.clock[0], SPOTS.clock[1], SPOTS.clock[2] + 0.1, world, { cast: false });
  // ---------- bureaux ----------
  const scrM = [0, 1, 2, 3, 4, 5].map(() => BASIC('#222c3e'));
  let scrI = 0;
  const chair = (x, z, ry, col, sw = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry + sw; world.add(g);
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), mDark, 0, 0.25, 0, g); add(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8), mDark, 0, 0.04, 0, g);
    add(box(0.5, 0.08, 0.5), M(col), 0, 0.48, 0, g); add(box(0.46, 0.5, 0.07), M(col), 0, 0.78, -0.24, g); return g; };
  const desk = (x, z, o = {}) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = o.ry ?? 0; world.add(g);
    add(box(1.7, 0.06, 0.85), mDesk, 0, 0.74, 0, g); for (const sx of [-0.78, 0.78]) add(box(0.06, 0.72, 0.8), mDeskD, sx, 0.36, 0, g); add(box(1.5, 0.4, 0.04), mDeskD, 0, 0.5, -0.38, g);
    const sm = scrM[scrI++ % scrM.length]; add(box(0.62, 0.4, 0.05), mDark, -0.25, 1.1, -0.18, g); add(box(0.54, 0.32, 0.02), sm, -0.25, 1.1, -0.15, g, { cast: false }); add(box(0.08, 0.18, 0.08), mDark, -0.25, 0.9, -0.18, g);
    add(box(0.45, 0.025, 0.16), M('#c8ccd4'), -0.25, 0.775, 0.12, g, { cast: false });
    for (let i = 0; i < (o.papers ?? 2); i++) add(box(0.3, 0.03 + 0.02 * i, 0.22), M('#fbfbf6'), 0.45, 0.78 + i * 0.03, 0.05 + i * 0.03, g, { cast: false }).rotation.y = i * 0.3;
    if (o.pot) { add(new THREE.CylinderGeometry(0.08, 0.06, 0.12, 8), M('#c8643a'), 0.7, 0.83, -0.2, g, { cast: false }); add(new THREE.SphereGeometry(0.1, 8, 6), M('#5e9e3e'), 0.7, 0.97, -0.2, g, { cast: false }); }
    if (o.lamp) { add(box(0.04, 0.3, 0.04), mDark, -0.7, 0.92, -0.25, g); add(box(0.2, 0.04, 0.06), mDark, -0.62, 1.07, -0.22, g); }
    return g; };
  desk(2.0, -2.7, { papers: 1, pot: true });
  const deskL = desk(8.0, -2.7, { papers: 1 }); add(box(0.5, 0.13, 0.04), M('#e8c24a'), 8.35, 0.84, -2.3, world, { cast: false });                  // bureau de Léa + plaque dorée
  chair(8.0, -3.6, 0, '#7a3aa8');
  for (const [x, c] of [[-4.6, '#8a3f5a'], [-1.6, '#3f6f8a'], [2.0, '#5a8a3f'], [5.6, '#9a6a3a']]) { desk(x, 5.6, { ry: Math.PI, papers: 2, pot: x === 2.0 }); chair(x, 6.5, Math.PI, c); }          // rangée de bureaux au premier plan (plans larges)
  const chK = chair(2.0, -3.55, 0.1, '#e0a81c');                                                                                         // la chaise de Karim (jaune moutarde)
  for (const z of [-0.5, 3.0]) { desk(-8.2, z, { ry: Math.PI / 2, papers: 2 }); desk(8.3, z + 0.4, { ry: -Math.PI / 2, papers: 1, pot: true }); chair(-7.3, z, Math.PI / 2, '#4a6a9a'); chair(7.4, z + 0.4, -Math.PI / 2, '#9a6a3a'); }
  // le mug de Karim sur son bureau
  const mugDesk = new THREE.Group(); mugDesk.position.set(2.5, 0.77, -2.55); world.add(mugDesk);
  add(new THREE.CylinderGeometry(0.075, 0.07, 0.1, 12), M('#f4efe2'), 0, 0.05, 0, mugDesk, { cast: false }); add(new THREE.TorusGeometry(0.04, 0.012, 6, 10), M('#f4efe2'), 0.08, 0.05, 0, mugDesk, { cast: false }); add(new THREE.CylinderGeometry(0.062, 0.062, 0.01, 12), M('#5a3420'), 0, 0.096, 0, mugDesk, { cast: false });
  // ---------- imprimante (objet vedette) ----------
  const PR = SPOTS.printer; add(box(1.5, 0.78, 0.7), M('#e4e0d4'), PR[0], 0.39, PR[2] - 0.05, world); add(box(1.4, 0.04, 0.66), mDeskD, PR[0], 0.8, PR[2] - 0.05, world);
  const pr = new THREE.Group(); pr.position.set(PR[0], 0.82, PR[2] - 0.05); world.add(pr);
  add(box(0.95, 0.4, 0.55), M('#d4d2cc'), 0, 0.2, 0, pr); add(box(0.99, 0.07, 0.59), M('#9ea4ae'), 0, 0.43, 0, pr); add(box(0.8, 0.03, 0.36), M('#3a3f48'), 0, 0.466, 0.0, pr, { cast: false });
  add(box(0.7, 0.05, 0.3), M('#3a3f48'), 0, 0.2, 0.3, pr, { cast: false }); add(box(0.3, 0.1, 0.12), M('#2c3038'), -0.3, 0.3, 0.29, pr);
  const led = add(new THREE.SphereGeometry(0.04, 8, 6), BASIC('#2fd45a'), 0.38, 0.33, 0.29, pr, { cast: false });
  const sheets = []; for (let i = 0; i < 4; i++) sheets.push(add(box(0.5, 0.012, 0.38), M('#fbfbf6'), -0.05 + i * 0.03, 0.215 + i * 0.014, 0.52 + i * 0.03, pr, { cast: false }));
  const balls = []; for (let i = 0; i < 6; i++) { const b = add(new THREE.IcosahedronGeometry(0.1 + r() * 0.04, 0), M('#f4f2ea'), PR[0] + (r() - 0.5) * 1.6, 0.11, PR[2] + 0.55 + r() * 0.6, world, { cast: false }); b.rotation.set(r() * 3, r() * 3, r() * 3); balls.push(b); }
  // ---------- plante (objet vedette) ----------
  const PL = SPOTS.plant, plant = new THREE.Group(); plant.position.set(PL[0], 0, PL[2]); world.add(plant);
  add(new THREE.CylinderGeometry(0.34, 0.26, 0.5, 12), M('#c8643a'), 0, 0.25, 0, plant); add(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12), M('#4a3020'), 0, 0.5, 0, plant, { cast: false });
  const stem = new THREE.Group(); stem.position.set(0, 0.5, 0); plant.add(stem); add(new THREE.CylinderGeometry(0.04, 0.05, 0.7, 6), M('#4a7a30'), 0, 0.35, 0, stem);
  const leafM = M('#4fae45'), leaves = [];
  for (let i = 0; i < 9; i++) { const pv = new THREE.Group(); pv.position.set(0, 0.4 + (i % 3) * 0.14, 0); pv.rotation.y = i * 0.7; stem.add(pv); const L = add(new THREE.SphereGeometry(0.3, 10, 6), leafM, 0.32, 0, 0, pv); L.scale.set(1.2, 0.12, 0.55); leaves.push({ pv, up: 0.85 + (i % 3) * 0.12, dn: -0.95 - (i % 2) * 0.35 }); }
  // ---------- coin café : comptoir, cafetière, mugs, placards ----------
  const CO = SPOTS.coffee; add(box(4.0, 0.9, 0.75), M('#e8e2d2'), CO[0] + 0.7, 0.45, CO[2] - 0.05, world); add(box(4.1, 0.06, 0.8), M('#7a5a3c'), CO[0] + 0.7, 0.93, CO[2] - 0.05, world);
  for (const dx of [-0.9, 0.5, 1.9]) add(box(1.2, 0.7, 0.04), M('#d4cdb8'), CO[0] + 0.7 + dx, 0.45, CO[2] + 0.34, world, { cast: false });
  add(box(4.0, 0.7, 0.4), M('#e8e2d2'), CO[0] + 0.7, 2.3, WZ + 0.4, world); for (const dx of [-0.9, 0.5, 1.9]) add(box(1.25, 0.6, 0.04), M('#d4cdb8'), CO[0] + 0.7 + dx, 2.3, WZ + 0.62, world, { cast: false });
  const cm = new THREE.Group(); cm.position.set(CO[0], 0.96, CO[2] - 0.12); world.add(cm);
  add(box(0.6, 0.78, 0.4), M('#3a3f48'), 0, 0.39, 0, cm); add(box(0.62, 0.12, 0.44), M('#c8312c'), 0, 0.74, 0, cm); add(box(0.5, 0.05, 0.3), M('#9ea4ae'), 0, 0.4, 0.2, cm, { cast: false });
  const cmLed = add(new THREE.SphereGeometry(0.03, 8, 6), BASIC('#555555'), 0.2, 0.6, 0.21, cm, { cast: false });
  const potG = new THREE.Group(); potG.position.set(0, 0.07, 0.3); cm.add(potG);
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 12), M('#d8ecf2'), 0, 0.15, 0, potG, { cast: false });
  const liquid = add(new THREE.CylinderGeometry(0.14, 0.14, 0.28, 12), M('#4a2814'), 0, 0.14, 0, potG, { cast: false });
  const mugM = new THREE.Group(); mugM.position.set(CO[0] + 1.5, 0.96, CO[2] + 0.05); world.add(mugM);
  add(new THREE.CylinderGeometry(0.085, 0.078, 0.12, 12), M('#f4efe2'), 0, 0.06, 0, mugM, { cast: false }); add(new THREE.TorusGeometry(0.045, 0.013, 6, 10), M('#f4efe2'), 0.09, 0.06, 0, mugM, { cast: false });
  const cup = add(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 12), M('#5a3420'), 0, 0.115, 0, mugM, { cast: false });
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.07, 0.065, 0.1, 10), M(['#e8483a', '#3f9ad8', '#ffd23a', '#7cc043'][i]), CO[0] + 2.2 + i * 0.22, 1.0, CO[2] - 0.3, world, { cast: false });
  // ---------- affiches, armoires, fontaine, portant : habillage ----------
  const poster = (x, y, w, h, col, col2) => { const c = cv(128, 160, (g, W, H) => { g.fillStyle = col; g.fillRect(0, 0, W, H); g.fillStyle = col2; g.beginPath(); g.arc(64, 60, 34, 0, 7); g.fill(); g.fillRect(20, 112, 88, 12); g.fillRect(30, 132, 68, 8); });
    add(new THREE.PlaneGeometry(w, h), toon({ map: P.tex(c) }), x, y, WZ + 0.22, world, { cast: false }); add(box(w + 0.1, h + 0.1, 0.04), mWhite, x, y, WZ + 0.2, world, { cast: false }); };
  poster(-8.2, 1.9, 0.8, 1.0, '#f0a830', '#d23a32'); poster(-4.2, 2.4, 0.7, 0.9, '#3f9ad8', '#ffffff'); poster(6.2, 3.0, 0.6, 0.6, '#7cc043', '#fff2c0'); poster(8.4, 1.9, 0.8, 1.0, '#c86bff', '#ffd23a');
  const cabinet = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g); add(box(0.8, 1.4, 0.55), mCab, 0, 0.7, 0, g); for (let i = 0; i < 3; i++) { add(box(0.7, 0.4, 0.04), M('#aab6c4'), 0, 0.25 + i * 0.45, 0.28, g, { cast: false }); add(box(0.2, 0.04, 0.04), mDark, 0, 0.35 + i * 0.45, 0.31, g, { cast: false }); } return g; };
  cabinet(-8.7, -4.9, 0); cabinet(-7.9, -4.9, 0); cabinet(8.5, -4.9, 0); cabinet(-8.8, 5.5, Math.PI / 2); cabinet(8.8, 6.0, -Math.PI / 2);
  { const g = new THREE.Group(); g.position.set(-8.4, 0, 1.2); world.add(g); add(box(0.4, 0.9, 0.4), mWhite, 0, 0.45, 0, g); add(new THREE.CylinderGeometry(0.17, 0.17, 0.45, 12), M('#8fd0f0'), 0, 1.12, 0, g, { cast: false }); }   // fontaine à eau
  { const g = new THREE.Group(); g.position.set(-8.4, 0, -3.4); world.add(g); add(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), mDark, 0, 0.9, 0, g); for (const [dx, col] of [[-0.2, '#8a3f5a'], [0.2, '#3f6f8a']]) add(box(0.3, 0.7, 0.12), M(col), dx, 1.25, 0.05, g, { cast: false }); }  // portant + manteaux
  K.pot(-8.7, -2.2, {}); K.pot(8.7, -1.0, {}); K.bush(-8.0, 8.0, { s: 1.0, flowers: false }); K.bush(8.0, 8.4, { s: 1.1, flowers: false });
  for (const [x, z] of [[-4.6, -4.9], [-2.6, -4.9], [3.8, -4.9]]) add(box(0.5, 0.35, 0.4), M('#c9a878'), x, 0.18, z, world);               // cartons de papier
  { const bn = (x, z) => add(new THREE.CylinderGeometry(0.2, 0.17, 0.4, 10), mMetal, x, 0.2, z, world, { cast: false }); bn(-1.6, -1.8); bn(3.4, -1.9); bn(6.4, -1.9); }
  // ---------- chambre de Karim (BX) ----------
  const bedFloor = add(new THREE.PlaneGeometry(9, 8), M('#b88a5c'), BX, 0.004, -1.0, world, { cast: false }); bedFloor.rotation.x = -Math.PI / 2;
  const bw = M('#d9c9a8'); add(box(9, 3.4, 0.3), bw, BX, 1.7, -4.8, world); add(box(0.3, 3.4, 8), bw, BX - 4.5, 1.7, -1.0, world); add(box(0.3, 3.4, 8), bw, BX + 4.5, 1.7, -1.0, world); add(box(9, 3.4, 0.3), bw, BX, 1.7, 3.1, world);
  add(box(9, 0.8, 0.1), M('#a8896a'), BX, 0.4, -4.6, world, { cast: false });
  add(box(2.4, 0.4, 2.6), M('#8a5a34'), BX, 0.2, -3.0, world); add(box(2.2, 0.2, 2.4), M('#f4f0e6'), BX, 0.5, -3.0, world);                       // lit + matelas
  add(box(2.4, 1.3, 0.14), M('#8a5a34'), BX, 0.9, -4.3, world); add(box(1.0, 0.18, 0.55), M('#ffffff'), BX - 0.1, 0.7, -3.9, world, { cast: false });
  const blanket = add(box(2.3, 0.4, 1.4), M('#3f9ad8'), BX, 0.72, -2.4, world); add(box(2.34, 0.1, 1.44), M('#8fcff0'), BX, 0.9, -2.4, world, { cast: false });
  add(box(0.7, 0.55, 0.5), M('#9a6c3e'), BX + 2.0, 0.28, -3.6, world); add(box(0.5, 0.2, 0.3), M('#f8f6ee'), BX + 2.0, 0.65, -3.6, world, { cast: false });   // table de nuit + boîte de mouchoirs
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), mDark, BX + 2.0, 0.95, -3.6, world, { cast: false }); add(new THREE.ConeGeometry(0.2, 0.25, 10), M('#ffd86a'), BX + 2.0, 1.28, -3.6, world, { cast: false });
  for (let i = 0; i < 5; i++) add(new THREE.IcosahedronGeometry(0.08, 0), M('#fbfbf6'), BX - 1.9 + r() * 0.8, 0.07, -1.2 + r() * 0.6, world, { cast: false });   // mouchoirs froissés
  add(box(1.6, 1.4, 0.06), BC('#8ec8e8'), BX - 2.6, 2.1, -4.62, world, { cast: false }); add(box(1.7, 0.08, 0.1), mWhite, BX - 2.6, 1.4, -4.58, world, { cast: false });
  function BC(c) { return new THREE.MeshBasicMaterial({ color: c, fog: false }); }
  add(box(0.5, 1.6, 0.1), M('#c8643a'), BX - 3.6, 2.1, -4.55, world, { cast: false }); add(box(0.5, 1.6, 0.1), M('#c8643a'), BX - 1.6, 2.1, -4.55, world, { cast: false });
  K.pot(BX + 3.4, -4.0, {}); K.pot(BX - 3.6, 1.0, {}); add(new THREE.PlaneGeometry(3, 2.2), M('#8a4a5a'), BX + 0.2, 0.012, -0.2, world, { cast: false }).rotation.x = -Math.PI / 2;
  for (const [x, z] of [[-3.4, -2.0], [3.2, -1.4], [-3.0, 0.8]]) K.crate(BX + x, z, { s: 0.6 });
  const clouds = [];
  function state(S, f) {
    (S.rows || [1, 1, 1, 1]).forEach((v, i) => lerpC(rowM[i], '#6a7488', '#fffbe0', v));
    rock.rotation.x = (S.sw ? -1 : 1) * 0.42; door.rotation.y = -(S.door ?? 0) * 1.5;
    const w = S.win ?? 1; lerpC(winM, '#2c3a7a', '#bfe4ff', w);
    for (const m of scrM) lerpC(m, '#222c3e', '#8fd0ff', S.screens ?? 1);
    const pt = S.printer || {}; pr.position.x = PR[0] + (pt.shake ? Math.sin(f * 2.3) * 0.03 * pt.shake : 0); pr.rotation.z = pt.shake ? Math.sin(f * 3.1) * 0.012 * pt.shake : 0;
    led.material.color.set(pt.jam ? (Math.floor(f / 5) % 2 ? '#ff2a2a' : '#661010') : '#2fd45a'); sheets.forEach((s, i) => { s.visible = i < (pt.paper ?? 0); }); balls.forEach((b, i) => { b.visible = i < (pt.balls ?? 0); });
    const pd = S.plant ?? 0; stem.rotation.z = -0.28 * pd; leaves.forEach((l, i) => { l.pv.rotation.z = l.up + (l.dn - l.up) * pd; }); leafM.color.set('#4fae45').lerp(new THREE.Color('#b7b13a'), pd * 0.9);
    const cf2 = S.coffee ?? 0; liquid.scale.y = Math.max(0.001, cf2); liquid.position.y = 0.01 + 0.14 * cf2; liquid.visible = cf2 > 0.01; cmLed.material.color.set(S.cm ? '#ff3a2a' : '#555555');
    mugDesk.visible = !!S.mugD; cup.material.color.set(S.mugCold ? '#8a7a70' : '#5a3420');
  }
  return { DECK, SPOTS, clouds, state, onLight: () => {} };
}
