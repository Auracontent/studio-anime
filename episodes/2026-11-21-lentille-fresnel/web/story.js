// "La lentille de Fresnel" — 57.88 s, 30 fps, 1736 frames. Phrase frames from ../phrases.json / words.json.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
export const FPS = 30, TOTAL = 1736, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 168, light: 'jour' },        // En mille huit cent vingt-trois, un phare français a vu plus loin en retirant du verre.
  { id: 'avant', a: 169, b: 259, light: 'jour' },      // Avant, on brûlait des lampes devant des miroirs de métal.
  { id: 'tous', a: 260, b: 319, light: 'jour' },       // La lumière partait dans tous les sens.
  { id: 'fres', a: 320, b: 389, light: 'jour' },       // Augustin Fresnel, un ingénieur,
  { id: 'veut', a: 390, b: 481, light: 'jour' },       // veut la concentrer avec une lentille géante.
  { id: 'sauf', a: 482, b: 607, light: 'jour' },       // Sauf que pour porter la lumière à des kilomètres,
  { id: 'bloc', a: 608, b: 677, light: 'jour' },       // il faudrait un bloc de verre épais comme un tonneau.
  { id: 'lourd', a: 678, b: 703, light: 'jour' },      // Trop lourd, trop cher,
  { id: 'avale', a: 704, b: 772, light: 'jour' },      // et le verre avalerait la lumière.
  { id: 'idee', a: 773, b: 839, light: 'jour' },       // Alors Fresnel a une idée folle :
  { id: 'anneaux', a: 840, b: 903, light: 'jour' },    // découper la lentille en anneaux.
  { id: 'garde', a: 904, b: 996, light: 'jour' },      // Il garde seulement la surface qui courbe la lumière,
  { id: 'jette', a: 997, b: 1036, light: 'jour' },     // et jette tout le verre du milieu.
  { id: 'cercles', a: 1037, b: 1141, light: 'jour' },  // Ça donne des cercles fins, emboîtés comme les marches d'un escalier.
  { id: 'cord', a: 1142, b: 1182, light: 'soir' },     // Au phare de Cordouan,
  { id: 'faisceau', a: 1183, b: 1269, light: 'jour' }, // à l'entrée de la Gironde, la lentille tourne et lance un faisceau
  { id: 'marins', a: 1270, b: 1326, light: 'soir' },   // à plus de trente kilomètres. Pour les marins,
  { id: 'apparait', a: 1327, b: 1390, light: 'soir' }, // le phare apparaît enfin
  { id: 'cheer', a: 1391, b: 1445, light: 'soir' },    // avant les rochers.
  { id: 'meurt', a: 1446, b: 1557, light: 'dore' },    // Fresnel meurt en mille huit cent vingt-sept, à trente-neuf ans.
  { id: 'siecles', a: 1558, b: 1659, light: 'soir' },  // Deux siècles plus tard, ses anneaux éclairent encore des côtes.
  { id: 'genie', a: 1660, b: 1735, light: 'jour' },    // Son génie : enlever du verre.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lights ----------
export const LIGHTS = {
  jour: { az: 125, el: 58, sky: '#c9d8f2', ground: '#b08a5c', hemi: 1.15, sun: '#fff1d6', sunI: 2.7, fog: '#cfe6ee', fogNear: 160, fogFar: 1200,
    skyTop: '#3f86d8', skyHor: '#e4f0f2', sat: 1.15, gain: '#fff6ea', vig: 0.2, shadowExt: 22 },
  soir: { az: 70, el: 14, sky: '#a898d0', ground: '#7a5a4a', hemi: 1.0, sun: '#ffa868', sunI: 2.8, fog: '#f0b890', fogNear: 120, fogFar: 1000,
    skyTop: '#4a5fb0', skyHor: '#ffb27a', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.15, gain: '#fff0e0', vig: 0.26, shadowExt: 22, shadowTint: '#5a4a80' },
  dore: { az: 20, el: 24, sky: '#c4b4d8', ground: '#8a5a3c', hemi: 1.08, sun: '#ffb46c', sunI: 2.9, fog: '#f0c090', fogNear: 120, fogFar: 1000,
    skyTop: '#5a78c0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.14, gain: '#fff2e2', vig: 0.24, shadowExt: 22, shadowTint: '#6a4a3a' },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
const TINT = { jour: '#ffffff', soir: '#ffe2d2', dore: '#ffe2c8' };

// ---------- places ----------
const IX = 3000;
const EF = [0.9, 0, 0.5], EG = [-0.1, 0, 0.5];          // exterior: Fresnel, gardien (hook)
const GM = [IX - 8, 0, 0.3];                             // keeper at the mirrors rack
const FT = [IX - 2.8, 0, 0.2], WT = [IX - 1.7, 0, 0.35]; // Fresnel at the plan table, worker beside
const FS = [IX + 3.0, 0, 0.3], W1 = [IX + 3.9, 0, 0.4], W2 = [IX + 5.0, 0, 0.2]; // stand: Fresnel + workers
const GD = [IX + 11.0, 0, 0.4];                          // keeper at the lens drum
const S1 = [2.4, 0, 8], S2 = [3.4, 0, 8];                // sailors on the jetty
const MK = [IX + 11.2, 0, 0.4];                          // modern keeper at the drum

// ---------- cameras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const CAMS = {
  hook: [K2(0, EG, EF, { yaw: -32, headW: 0.27 }), K2(168, EG, EF, { yaw: -4, headW: 0.31 }, { ease: 'smooth' })],
  avant: [K(169, GM, { headW: 0.30, yaw: 28 }), K(259, GM, { headW: 0.34, yaw: 6 })],
  tous: [K(260, GM, { headW: 0.32, yaw: -12 }), K(319, GM, { headW: 0.40, yaw: 4 }, { ease: 'easeOut' })],
  fres: [K(320, FT, { headW: 0.31, yaw: -30 }), K(389, FT, { headW: 0.34, yaw: -8 })],
  veut: [K2(390, FT, WT, { yaw: 24, headW: 0.27 }), K2(481, FT, WT, { yaw: -2, headW: 0.29 })],
  sauf: [K(482, FS, { headW: 0.30, yaw: -36 }), K(607, FS, { headW: 0.32, yaw: -14 })],
  bloc: [K2(608, W1, W2, { yaw: -26, headW: 0.26 }), K2(677, W1, W2, { yaw: 0, headW: 0.28 })],
  lourd: [K2(678, W1, W2, { yaw: 4, headW: 0.29 }), K2(703, W1, W2, { yaw: 14, headW: 0.32 })],
  avale: [K(704, FS, { headW: 0.32, yaw: 22 }), K(772, FS, { headW: 0.36, yaw: 8 })],
  idee: [K(773, FS, { headW: 0.31, yaw: -10 }), K(839, FS, { headW: 0.40, yaw: 0 }, { ease: 'easeOut' })],
  anneaux: [K2(840, FS, W1, { yaw: -26, headW: 0.26 }), K2(903, FS, W1, { yaw: -4, headW: 0.28 })],
  garde: [K2(904, FS, W1, { yaw: 8, headW: 0.27 }), K2(996, FS, W1, { yaw: 28, headW: 0.29 })],
  jette: [K2(997, FS, W1, { yaw: 24, headW: 0.29 }), K2(1036, FS, W1, { yaw: 4, headW: 0.32 })],
  cercles: [K2(1037, FS, W1, { yaw: -34, headW: 0.25 }), K2(1141, FS, W1, { yaw: 20, headW: 0.28 })],
  cord: [K(1142, [0, 0, -10], { headW: 0.045, yaw: 78, frameY: 0.86 }), K(1182, [0, 0, -10], { headW: 0.055, yaw: 66, frameY: 0.86 })],
  faisceau: [K(1183, GD, { headW: 0.30, yaw: -30 }), K(1269, GD, { headW: 0.33, yaw: -8 })],
  marins: [K2(1270, S1, S2, { yaw: 192, headW: 0.26 }), K2(1326, S1, S2, { yaw: 176, headW: 0.29 })],
  apparait: [K(1327, [0, 0, -10], { headW: 0.032, yaw: 172, frameY: 0.8 }), K(1390, [0, 0, -10], { headW: 0.04, yaw: 160, frameY: 0.8 })],
  cheer: [K2(1391, S1, S2, { yaw: 196, headW: 0.28 }), K2(1445, S1, S2, { yaw: 180, headW: 0.33 })],
  meurt: [K(1446, FT, { headW: 0.30, yaw: 24 }), K(1557, FT, { headW: 0.36, yaw: 6 })],
  siecles: [K(1558, MK, { headW: 0.30, yaw: -28 }), K(1659, MK, { headW: 0.34, yaw: -6 })],
  genie: [K(1660, FS, { headW: 0.30, yaw: -24 }), K(1700, FS, { headW: 0.34, yaw: -8 }), K(1735, FS, { headW: 0.40, yaw: 0 }, { ease: 'easeOut' })],
};
const KICKS = [{ f: 482, a: 0.05 }, { f: 773, a: 0.03 }, { f: 1142, a: 0.03 }, { f: 1030, a: 0.04 }, { f: 1446, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  for (const a of [169, 1142, 1183, 1270, 1446, 1558, 1660]) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.8;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mid = (a, b) => [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2];
const FOC = { hook: mid(EG, EF), avant: GM, tous: GM, fres: FT, veut: mid(FT, WT), sauf: FS, bloc: mid(W1, W2), lourd: mid(W1, W2), avale: FS, idee: FS, anneaux: mid(FS, W1), garde: mid(FS, W1),
  jette: mid(FS, W1), cercles: mid(FS, W1), faisceau: GD, marins: mid(S1, S2), apparait: S1, cheer: mid(S1, S2), meurt: FT, siecles: MK, genie: FS };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'cord' || S.id === 'apparait') return { focus: 40, cinf: 2 };
  const t = FOC[S.id]; return { focus: dist(C.pos, [t[0], 1.5, t[2]]), cinf: 9 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { beamOn: 0, beamYaw: 0, block: 0, lens: 0, drum: 0, flame: 1 };
  switch (S.id) {
    case 'sauf': W.block = E.easeOut(ramp(f, 490, 600)); break;
    case 'bloc': case 'lourd': case 'avale': case 'idee': case 'anneaux': case 'garde': W.block = 1; break;
    case 'jette': W.block = 1 - E.easeIn(ramp(f, 1000, 1030)); break;
    case 'cercles': W.lens = E.back(ramp(f, 1037, 1062)); break;
    case 'cord': W.beamOn = 1; W.beamYaw = 1.2 + f * 0.012; break;
    case 'faisceau': W.drum = f * 0.045; break;
    case 'marins': case 'cheer': W.beamOn = 1; W.beamYaw = 3.14 + Math.sin(f * 0.03) * 0.5; break;
    case 'apparait': W.beamOn = 1; W.beamYaw = Math.sin(f * 0.035) * 0.3; break;
    case 'siecles': W.drum = f * 0.045; break;
    case 'genie': W.lens = 1; break;
  }
  return W;
};

// ---------- cast ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.fres = { tunic: '#d9a02a', skin: '#f1c9a4', hair: '#4a3222', moustache: '#5a3a22', brows: '#4a3222', coat: true };
  O.fresH = { tunic: '#d9a02a', skin: '#f1c9a4', hat: 'tophat', hair: '#4a3222', moustache: '#5a3a22', brows: '#4a3222', coat: true };
  O.gardien = { tunic: '#2f6fa8', skin: '#e0a878', hat: 'bonnet', hatCol: '#c8312c', hatBand: '#2b3a5a', moustache: '#9a9a9a', brows: '#9a9a9a', stout: true };
  O.ouvA = { tunic: '#3f9a5a', skin: '#7a4a30', cap: '#e8d6a0', moustache: '#1e1714' };
  O.ouvB = { tunic: '#8a4fb8', skin: '#f5d3b3', hair: '#c9a050', stout: true, apron: '#d8c9a6' };
  O.marinA = { tunic: '#18b8d8', skin: '#c98b62', hat: 'bonnet', hatCol: '#f4f1ea', hatBand: '#2b4a8a', beard: '#3b2a20' };
  O.marinB = { tunic: '#e8782a', skin: '#e9b98f', hat: 'bonnet', hatCol: '#2b3a5a', hatBand: '#c8312c', moustache: '#8a4a22' };
  O.gardienM = { tunic: '#ff7a1a', skin: '#a8714a', hat: 'chauff', hatCol: '#1f3a6a', beard: '#2b211c' };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const PROP = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, ...extra });

// ---------- prop cards (design canvas 600 x 1000, content around y = 520) ----------
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = '#271925'; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
const INK = '#271925';
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
// lens cross-section, k = 0 (full glass) .. 1 (rings only); optical axis horizontal, light comes from the left
function schemaCard(p, k) {
  const g = p.g; g.save(); panel(g, 20, 330, 560, 380, '#fbf7ec');
  const cy = 520, R = 135, T = 110, n = 5, tmin = 12, th0 = (y) => T * (1 - (y / R) * (y / R));
  const band = (y) => { const a = Math.abs(y), j = Math.min(n - 1, Math.floor(a / (R / n))); return (j + 1) * R / n; };
  const thF = (y) => th0(y) - th0(band(y)) + tmin;
  const th = (y) => lerp(th0(y), thF(y), k), cx = 300;
  if (k > 0.45) { g.setLineDash([14, 10]); g.strokeStyle = '#9a8f80'; g.lineWidth = 6; g.beginPath(); for (let y = -R; y <= R; y += 3) { const x = cx - th0(y) / 2; y === -R ? g.moveTo(x, cy + y) : g.lineTo(x, cy + y); } g.stroke(); g.beginPath(); for (let y = -R; y <= R; y += 3) { const x = cx + th0(y) / 2; y === -R ? g.moveTo(x, cy + y) : g.lineTo(x, cy + y); } g.stroke(); g.setLineDash([]); }
  const pts = []; for (let y = -R; y <= R; y += 1.5) pts.push([cx - th(y) / 2, cy + y]); for (let y = R; y >= -R; y -= 1.5) pts.push([cx + th(y) / 2, cy + y]);
  g.fillStyle = '#8fdcdc'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  if (k < 0.98) { g.strokeStyle = '#2a7a8a'; g.lineWidth = 4; g.setLineDash([8, 7]); for (let j = 1; j < n; j++) for (const s of [-1, 1]) { const y = s * j * R / n; g.beginPath(); g.moveTo(cx - T / 2 - 8, cy + y); g.lineTo(cx + T / 2 + 8, cy + y); g.stroke(); } g.setLineDash([]); }
  g.strokeStyle = '#ffb81c'; g.lineWidth = 9; g.lineCap = 'round'; for (const y of [-95, -48, 0, 48, 95]) { const xl = cx - th(y) / 2; g.beginPath(); g.moveTo(50, cy + y); g.lineTo(xl, cy + y); g.lineTo(545, cy + y * 0.0 + (y ? -y * 0.0 : 0) + 0); g.stroke(); }
  g.restore();
}
function bulbCard(p, k) { const g = p.g; g.save(); const s = 0.4 + 0.6 * E.back(clamp(k)); g.translate(300, 540); g.scale(s, s); g.translate(-300, -540); g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = '#ffb81c'; g.lineWidth = 14; for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 8); g.beginPath(); g.moveTo(300 + Math.cos(a) * 150, 480 + Math.sin(a) * 150); g.lineTo(300 + Math.cos(a) * 215, 480 + Math.sin(a) * 215); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(300, 480, 100, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#9aa3ad'; g.beginPath(); g.roundRect(255, 570, 90, 70, 16); g.fill(); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(262, 600); g.lineTo(338, 600); g.stroke(); g.restore(); }
function dimCard(p) { const g = p.g; g.save(); panel(g, 20, 350, 560, 340, '#fbf7ec'); g.lineJoin = 'round';
  g.fillStyle = '#8fdcdc'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(190, 400, 230, 240, 22); g.fill(); g.stroke();
  for (const y of [450, 520, 590]) { const gr = g.createLinearGradient(50, 0, 410, 0); gr.addColorStop(0, '#ffb81c'); gr.addColorStop(0.45, '#ffb81c'); gr.addColorStop(1, 'rgba(60,70,80,0.9)'); g.strokeStyle = gr; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(50, y); g.lineTo(410, y); g.stroke(); }
  TXT(g, '?', 505, 560, 120, '#271925', 0); g.restore(); }
function coinCard(p, k) { const g = p.g; g.save(); g.lineJoin = 'round'; const s = 0.6 + 0.4 * E.back(clamp(k)); g.translate(300, 560); g.scale(s, s); g.translate(-300, -560);
  for (let i = 0; i < 4; i++) { const y = 620 - i * 36, x = 300 + (i % 2) * 14 - 7; g.fillStyle = '#e9be4a'; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.ellipse(x, y, 110, 34, 0, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#c99a2a'; g.beginPath(); g.ellipse(x, y - 8, 70, 18, 0, 0, 6.283); g.fill(); }
  TXT(g, 'F', 300, 450, 110, '#ffd23a', 20); g.restore(); }
function kmCard(p, k) { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 400, 540, 240, '#271925'); TXT(g, '30 km', 300, 570, 150, '#ffd23a', 0); g.restore(); }
function yearCard(p, big) { const g = p.g; g.save(); panel(g, 40, 400, 520, 220, '#e08a3a'); TXT(g, '1788 – 1827', 300, 535, 90, '#ffffff', 18); if (big) { g.translate(300, 700); g.rotate(-0.06); TXT(g, '39 ans', 0, 0, 120, '#ffd23a', 24); } g.restore(); }

// ---------- actors ----------
const SKY = (S) => TINT[S.light];
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = SKY(S);
  const fr = (o, pos, hat = false) => R(T, hat ? 'fresH' : 'fres', life(f, 5, o), pos, { tint });
  const gd = (o, pos) => R(T, 'gardien', life(f, 9, o), pos, { tint });
  const wa = (o, pos) => R(T, 'ouvA', life(f, 21, o), pos, { tint });
  const wb = (o, pos) => R(T, 'ouvB', life(f, 22, o), pos, { tint });
  switch (S.id) {
    case 'hook': out.push(gd({ expr: 'grin', L: 'hip', R: 'thumb', look: 0.4 }, EG)); out.push(fr({ expr: f > 60 ? 'grin' : 'smile', L: 'hip', R: 'point', look: -0.3 }, EF, true)); break;
    case 'avant': out.push(gd({ expr: f > 215 ? 'nervous' : 'smile', L: 'hip', R: 'reach', holdR: 'mug', look: -0.5 }, GM)); break;
    case 'tous': out.push(gd({ expr: 'shock', L: 'cheek', R: 'cheek', look: 0.2 }, GM)); break;
    case 'fres': out.push(fr({ expr: 'grin', L: 'hip', R: 'reach', holdR: 'paper', look: 0.4 }, FT)); break;
    case 'veut': out.push(fr({ expr: 'grin', L: 'hip', R: 'point', look: 0.3 }, FT)); out.push(wa({ expr: 'smile', L: 'hip', R: 'hip', look: -0.4 }, WT)); break;
    case 'sauf': out.push(fr({ expr: f > 492 ? 'shock' : 'grin', L: f > 492 ? 'cheek' : 'hip', R: f > 492 ? 'cheek' : 'reach', holdR: f > 492 ? undefined : 'paper', look: 0.5 }, FS)); break;
    case 'bloc': out.push(wa({ expr: 'pained', L: 'reach', R: 'reach', look: 0.5, tilt: 4 }, W1)); out.push(wb({ expr: 'pained', L: 'reach', R: 'reach', look: -0.5, tilt: -4 }, W2)); break;
    case 'lourd': out.push(wa({ expr: 'pained', L: 'hip', R: 'temple', swirl: f * 0.25, look: 0.5 }, W1)); out.push(wb({ expr: 'nervous', L: 'hip', R: 'hip', look: -0.5 }, W2)); break;
    case 'avale': out.push(fr({ expr: 'squint', L: 'hip', R: 'temple', swirl: f * 0.25, look: 0.5 }, FS)); break;
    case 'idee': out.push(fr({ expr: f > 790 ? 'laugh' : 'shock', L: 'hip', R: 'up', look: 0.2 }, FS)); break;
    case 'anneaux': out.push(fr({ expr: 'grin', L: 'hip', R: 'point', look: 0.4 }, FS)); out.push(wa({ expr: 'smile', L: 'hip', R: 'hip', look: -0.5 }, W1)); break;
    case 'garde': out.push(fr({ expr: 'grin', L: 'hip', R: 'point', look: 0.4 }, FS)); out.push(wa({ expr: f > 950 ? 'shock' : 'smile', L: 'hip', R: 'hip', look: -0.5 }, W1)); break;
    case 'jette': out.push(fr({ expr: 'laugh', L: 'up', R: 'up', look: 0.3 }, FS)); out.push(wa({ expr: 'shock', L: 'cheek', R: 'hip', look: -0.4 }, W1)); break;
    case 'cercles': out.push(fr({ expr: 'grin', L: 'hip', R: 'reach', look: 0.5 }, FS)); out.push(wa({ expr: 'smile', L: 'reach', R: 'hip', look: -0.5 }, W1)); break;
    case 'faisceau': out.push(gd({ expr: 'grin', L: 'hip', R: 'up', look: 0.5 }, GD)); break;
    case 'marins': out.push(R(T, 'marinA', life(f, 31, { expr: 'grin', L: 'hip', R: 'up', look: 0.2 }), S1, { tint })); out.push(R(T, 'marinB', life(f, 32, { expr: 'nervous', L: 'up', R: 'hip', look: -0.2 }), S2, { tint })); break;
    case 'cheer': out.push(R(T, 'marinA', life(f, 31, { expr: f > 1420 ? 'laugh' : 'smile', L: 'up', R: 'up', look: 0.2 }), S1, { tint })); out.push(R(T, 'marinB', life(f, 32, { expr: f > 1420 ? 'laugh' : 'grin', L: 'hip', R: 'reach', holdR: 'flag', look: -0.2 }), S2, { tint })); break;
    case 'meurt': out.push(fr({ expr: f > 1500 ? 'pained' : 'neutral', L: 'hip', R: 'hip', look: 0.3, tilt: -2 }, FT)); break;
    case 'siecles': out.push(R(T, 'gardienM', life(f, 41, { expr: 'smile', L: 'hip', R: 'thumb', look: -0.5 }), MK, { tint })); break;
    case 'genie': out.push(fr({ expr: 'grin', L: 'hip', R: f > 1693 ? 'up' : 'thumb', look: 0.4 }, FS)); break;
  }
  return out;
};

// ---------- 2D effects (cards above / beside the characters) ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'tous') { const t = q(((f - 262) % 30) / 30, 2); out.push(FX('ray' + t, (p) => T.fxBurst(p, t, '#ffd870', 14, 60, 250), [GM[0] + 0.2, 1.9, -0.9], 1.1)); }
  if (S.id === 'veut') out.push(FX('lenA', (p) => schemaCard(p, 0), [(FT[0] + WT[0]) / 2, 2.35, 0.2], 0.62));
  if (S.id === 'lourd') { const k = ramp(f, 680, 698); out.push(FX('coin' + q(k, 1), (p) => coinCard(p, k), [(W1[0] + W2[0]) / 2, 2.35, 0.2], 0.6 * (0.5 + 0.5 * clamp(k)))); }
  if (S.id === 'avale') out.push(FX('dim', (p) => dimCard(p), [FS[0] + 0.72, 2.0, 0.3], 0.5));
  if (S.id === 'idee') { const k = ramp(f, 776, 800); out.push(FX('bulb' + q(k, 1), (p) => bulbCard(p, k), [FS[0] + 0.6, 2.05, 0.3], 0.6 * (0.5 + 0.5 * clamp(k)))); }
  if (S.id === 'anneaux') { const k = q(0.5 * E.smooth(ramp(f, 845, 900)), 2); out.push(FX('sc' + k, (p) => schemaCard(p, k), [(FS[0] + W1[0]) / 2 + 0.1, 2.4, 0.2], 0.68)); }
  if (S.id === 'garde') { const k = q(0.5 + 0.5 * E.smooth(ramp(f, 910, 975)), 2); out.push(FX('sc' + k, (p) => schemaCard(p, k), [(FS[0] + W1[0]) / 2 + 0.1, 2.4, 0.2], 0.68)); }
  if (S.id === 'jette' && f > 1003 && f < 1036) { const t = q((f - 1003) / 30, 2); out.push(FX('du' + t, (p) => T.fxDust(p, t), [IX + 4.0, 0.9, -1.2], 1.2)); }
  if (S.id === 'marins' || (S.id === 'faisceau' && f > 1240)) { const k = ramp(f, f > 1240 && S.id === 'faisceau' ? 1240 : 1272, f > 1240 && S.id === 'faisceau' ? 1262 : 1292); const pos = S.id === 'faisceau' ? [GD[0] + 0.9, 2.3, 0.3] : [mid(S1, S2)[0], 2.35, 7.6]; out.push(FX('km' + q(k, 1) + S.id, (p) => kmCard(p, k), pos, 0.62)); }
  if (S.id === 'meurt') out.push(FX('yr' + (f > 1519 ? 'b' : 'a'), (p) => yearCard(p, f > 1519), [FT[0] + 0.5, 2.15, 0.3], 0.42));
  if (S.id === 'genie' && f > 1694) { const t = q((f - 1694) / 30, 2); out.push(FX('gb' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [FS[0] + 0.5, 2.0, 0.4], 0.9)); }
  return out;
};
