// "Les bombes mongoles : le dessin faux, la bombe vraie" — 59.4 s, 30 fps, 1782 images. Cadres calés sur phrases.json / words.json.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, orbit, shake, hop, fallOver, popIn, tremble, transition } from '../motion.js';
import { mood, blendMood } from '../moods.js';
import { waveHeight } from '../fx3d.js';
export const FPS = 30, TOTAL = 1782, DECK = 0;
const IX = 3000, XS = 6000, XL = 9000;
export const SHOTS = [
  { id: 'hook', a: 0, b: 162 },       // Le plus célèbre dessin d'une bombe médiévale… a été ajouté après coup.
  { id: 'vers', a: 163, b: 230 },     // Vers douze cent quatre-vingt-treize,
  { id: 'peint', a: 231, b: 370 },    // le samouraï Suenaga fait peindre ses exploits contre les Mongols.
  { id: 'mais', a: 371, b: 428 },     // Mais l'explosion, elle,
  { id: 'rajout', a: 429, b: 511 },   // n'a été rajoutée que plus de quatre siècles plus tard.
  { id: 'alors', a: 512, b: 584 },    // Alors,
  { id: 'squint', a: 585, b: 731 },   // ces bombes existaient-elles vraiment ?
  { id: 'sauf', a: 732, b: 772 },     // Sauf que… en deux mille onze,
  { id: 'plong', a: 773, b: 863 },    // des plongeurs fouillent le fond de la mer,
  { id: 'taka', a: 864, b: 948 },     // à Takashima.
  { id: 'sable', a: 949, b: 1016 },   // Sous un mètre de sable dort un navire mongol,
  { id: 'coule', a: 1017, b: 1071 },  // coulé en douze cent quatre-vingt-un.
  { id: 'dedans', a: 1072, b: 1116 }, // Dedans,
  { id: 'boules', a: 1117, b: 1255 }, // des boules de céramique, tassées entre les pierres et les briques.
  { id: 'rayons', a: 1256, b: 1326 }, // Les rayons X les ouvrent sans les casser :
  { id: 'poudre', a: 1327, b: 1390 }, // de la poudre noire,
  { id: 'eclats', a: 1391, b: 1457 }, // et des éclats de fer.
  { id: 'tonnerre', a: 1458, b: 1562 }, // Les Mongols lançaient bien du tonnerre sur les samouraïs.
  { id: 'faux', a: 1563, b: 1662 },   // Le dessin était faux… mais la bombe,
  { id: 'reelle', a: 1663, b: 1781 }, // elle, était bien réelle.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière : une ambiance par acte ----------
const SOUS = mood('froid', { sky: '#6ab8d0', ground: '#2a7088', hemi: 1.3, fog: '#2c93b4', fogNear: 5, fogFar: 40, skyTop: '#2a8ab0', skyHor: '#2c93b4', sunI: 2.3, el: 75, az: 150, gain: '#eafcff', shadowTint: '#1f5a78', exposure: 1.1, gamma: 1.1 });
const LAB = mood('jour', { hemi: 1.3, sunI: 2.0, gain: '#f2fbff', fog: '#d8e8ea', fogNear: 60, fogFar: 300, exposure: 1.05 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'vers': case 'peint': return mood('matin', { exposure: 1.1 });
    case 'mais': return blendMood(mood('matin', { exposure: 1.1 }), 'soir', ramp(f, 371, 400));
    case 'rajout': case 'alors': case 'squint': return mood('soir', { exposure: 1.1 });
    case 'sauf': case 'taka': return mood('jour');
    case 'plong': case 'sable': case 'coule': case 'dedans': case 'boules': return SOUS;
    case 'rayons': case 'poudre': case 'eclats': return LAB;
    case 'tonnerre': return mood('tempete', { fogNear: 40, fogFar: 450 });
    default: return mood('dore', { exposure: 1.1 });
  }
};
const TINT = { hook: '#ffe6c8', vers: '#fff0e0', peint: '#fff0e0', sauf: '#ffffff', plong: '#b8e8f4', sable: '#b8e8f4', coule: '#b8e8f4', dedans: '#b8e8f4', boules: '#b8e8f4', rayons: '#f2fbff', poudre: '#f2fbff', eclats: '#f2fbff', tonnerre: '#c8d4e0' };
const tintOf = (S) => TINT[S.id] || '#ffe2c8';

// ---------- lieux ----------
const BOAT = [3.5, 0, 10];
const boatY = (f) => -0.2 + waveHeight(BOAT[0], BOAT[2], f, 0.15);
const PNT = [IX - 0.5, 0, 0.25], SUE = [IX + 0.5, 0, 0.3];            // le peintre (gauche, pinceau) et Suenaga (droite)
const BOOM = [IX + 0.4, 1.55, -0.86], BALL = [IX, 0.95, 0.05];
const DV1 = [XS + 1.0, 0, 0.6], DV2 = [XS + 2.1, 0, 0.0], DS = [XS + 1.6, 0, 0.2], DB = [XS + 6.2, 0, -0.7], WRECK = [XS + 4, 0, -3.2];
const DL = [XL + 1.55, 0, 0.4];
const MON = [0.7, 0, 2.3], SB = [-0.5, 0, 2.3], CB = [-0.2, 0, 2.3];                         // flash-back : le Mongol et Suenaga sur la plage

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const DECKP = (f) => [BOAT[0] - 0.3, boatY(f) + 0.44, BOAT[2] + 0.35];
const CAMS = {
  hook: [R(0, [IX + 0.55, 1.6, 2.0], [IX + 0.4, 1.55, -0.9]), K(95, PNT, { headW: 0.27, yaw: 22 }), K(162, PNT, { headW: 0.31, yaw: 12 })],
  vers: [K(163, SUE, { headW: 0.31, yaw: -22 }), K(230, SUE, { headW: 0.34, yaw: -4 })],
  peint: [K2(231, PNT, SUE, { yaw: -20, headW: 0.26 }), K2(320, PNT, SUE, { yaw: 14, headW: 0.28 }), K2(370, PNT, SUE, { yaw: 24, headW: 0.3 })],
  mais: [K(371, PNT, { headW: 0.30, yaw: 26 }), K(428, PNT, { headW: 0.33, yaw: 10 })],
  rajout: [K(429, PNT, { headW: 0.33, yaw: 10 }), R(468, [IX + 0.5, 1.62, 1.35], [IX + 0.4, 1.55, -0.9]), K(511, PNT, { headW: 0.30, yaw: 24 })],
  alors: [K2(512, PNT, SUE, { yaw: -16, headW: 0.27 }), K2(584, PNT, SUE, { yaw: 8, headW: 0.30 })],
  squint: [K2(585, PNT, SUE, { yaw: 8, headW: 0.30 }), K2(650, PNT, SUE, { yaw: -8, headW: 0.27 }), K2(731, PNT, SUE, { yaw: 12, headW: 0.31 })],
  sauf: [K(732, DECKP(740), { headW: 0.32, yaw: -22 }), K(772, DECKP(760), { headW: 0.34, yaw: -6 })],
  plong: [K2(773, DV1, DV2, { yaw: -22, headW: 0.26 }), K2(863, DV1, DV2, { yaw: 12, headW: 0.28 })],
  taka: [R(864, [9, 3.0, 24], [-1.5, 1.6, 2], 42), R(948, [5.5, 2.6, 17.5], [-1.5, 1.9, 2], 44)],
  sable: [K(949, DS, { headW: 0.28, yaw: -30 }), K(1016, DS, { headW: 0.30, yaw: -10 })],
  dedans: [R(1072, [XS + 5.6, 1.9, 1.6], [XS + 4.2, 0.9, -3.0]), R(1116, [XS + 4.4, 1.1, -0.8], [XS + 4.2, 0.6, -3.0])],
  boules: [R(1117, [XS + 4.6, 1.0, -0.6], [XS + 4.3, 0.6, -3.0]), R(1175, [XS + 4.9, 0.95, -0.7], [XS + 4.6, 0.6, -3.0]), K(1255, DB, { headW: 0.30, yaw: -16 })],
  rayons: [R(1256, [XL + 1.3, 1.7, 4.4], [XL + 1.15, 1.5, -1.2], 48), R(1296, [XL + 1.35, 1.7, 4.2], [XL + 1.15, 1.5, -1.2], 48), K(1326, DL, { headW: 0.28, yaw: 30 })],
  poudre: [R(1327, [XL + 0.55, 1.9, 2.2], [XL + 0.5, 1.75, -1.2]), R(1390, [XL + 0.55, 1.5, 1.6], [XL + 0.5, 1.35, -1.2])],
  eclats: [R(1391, [XL + 0.55, 1.5, 1.6], [XL + 0.5, 1.4, -1.2]), R(1457, [XL + 0.55, 2.05, 1.7], [XL + 0.5, 2.0, -1.2])],
  tonnerre: [K(1458, CB, { headW: 0.25, yaw: 172 }), K(1562, CB, { headW: 0.25, yaw: 188 })],
  faux: [K2(1563, PNT, SUE, { yaw: 14, headW: 0.27 }), K2(1662, PNT, SUE, { yaw: -10, headW: 0.29 })],
  reelle: [R(1663, [IX + 0.0, 1.3, 1.6], [IX, 1.0, 0.05]), R(1730, [IX + 0.25, 1.5, 1.7], [IX + 0.3, 1.3, -0.5]), R(1781, [IX + 0.55, 1.6, 2.0], [IX + 0.4, 1.55, -0.9])],
};
const KICKS = [{ f: 732, a: 0.04 }, { f: 1117, a: 0.03 }, { f: 1663, a: 0.03 }];
const baseCam = (f) => {
  const S = shotAt(f);
  if (S.id === 'coule') return orbit([XS + 4, 0, -3], f, 1017, { r: 8, h: 1.6, speed: 16, start: -18, lookUp: 0.7, fov: 42 });
  let c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  if (S.id === 'tonnerre') c = shake(c, f, 1494, 0.14, 16);
  return c;
};
// transitions voyageuses (la limite entre deux plans est au milieu de chacune)
const TR = [
  { a: 163, type: 'whip', dir: 1 }, { a: 371, type: 'whip', dir: -1 }, { a: 732, type: 'drop' }, { a: 773, type: 'drop' }, { a: 864, type: 'rise' },
  { a: 949, type: 'drop' }, { a: 1256, type: 'whip', dir: 1 }, { a: 1458, type: 'whip', dir: -1 }, { a: 1563, type: 'rise' },
];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};

// ---------- objectif ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mid = (a, b) => [(a[0] + b[0]) / 2, 1.5, (a[2] + b[2]) / 2];
const FOC = { hook: BOOM, vers: SUE, peint: mid(PNT, SUE), mais: PNT, rajout: BOOM, alors: mid(PNT, SUE), squint: mid(PNT, SUE), sauf: DV1, plong: mid(DV1, DV2), sable: DS, dedans: [XS + 4.2, 0.6, -3], boules: [XS + 4.4, 0.6, -3],
  rayons: [XL + 0.5, 1.5, -1.2], poudre: [XL + 0.5, 1.5, -1.2], eclats: [XL + 0.5, 2.0, -1.2], tonnerre: mid(SB, MON), faux: mid(PNT, SUE), reelle: BALL };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'taka') return { focus: 40, cinf: 2 };
  if (S.id === 'coule') return { focus: 8, cinf: 3 };
  if (S.id === 'sauf') { const d = DECKP(f); return { focus: dist(C.pos, [d[0], 1.5, d[2]]), cinf: 9 }; }
  const t = FOC[S.id]; return { focus: dist(C.pos, [t[0], t[1] ?? 1.5, t[2]]), cinf: 9 };
};

// ---------- état du monde ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { boom: 1, ballOn: 0, sand: 1, scan: 0, scanBall: 0, hl: 0, fish: 1, boatY: boatY(f), boatRoll: 0.02 * Math.sin(f * 0.05) };
  switch (S.id) {
    case 'hook': W.boom = 0.5 + 0.5 * E.back(ramp(f, 4, 70)); break;
    case 'vers': case 'peint': W.boom = 0; break;
    case 'mais': W.boom = E.back(ramp(f, 396, 424)); break;
    case 'sable': W.fish = 0; W.sand = 1 - 0.85 * E.smooth(ramp(f, 954, 1010)); break;
    case 'coule': case 'dedans': case 'boules': W.sand = 0.15; break;
    case 'rayons': W.scanBall = 1; W.scan = E.smooth(ramp(f, 1264, 1322)); break;
    case 'poudre': W.scan = 1; W.hl = 1; break;
    case 'eclats': W.scan = 1; W.hl = 2; break;
    case 'faux': W.ballOn = E.back(ramp(f, 1620, 1640)); break;
    case 'reelle': W.ballOn = 1; break;
  }
  return W;
};

// ---------- effets 3D ----------
const SEA = { y: -0.55, amp: 0.15, col: '#3b9fb6', deep: '#1d6a86', foam: '#ffffff', foamAmt: 0.5 };
export const envAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return { sparks: [{ at: [IX + 0.4, 1.5, -0.6], f0: 0, f1: 75, rate: 50, col: '#ff8a2a', speed: 3.2 }], motes: 0.5 };
    case 'mais': return { sparks: [{ at: [IX + 0.4, 1.5, -0.6], f0: 396, f1: 430, rate: 50, col: '#ff8a2a', speed: 3.2 }], motes: 0.5 };
    case 'rajout': return { sparks: [{ at: [IX + 0.4, 1.5, -0.6], f0: 429, f1: 450, rate: 30, col: '#ff8a2a', speed: 3 }], motes: 0.5 };
    case 'vers': case 'peint': case 'alors': case 'squint': case 'faux': case 'reelle': return { motes: 0.5 };
    case 'sauf': return { sea: SEA, spray: [{ at: [DECKP(766)[0], 0, DECKP(766)[2]], f0: 766, n: 90, power: 5, col: '#ffffff' }] };
    case 'taka': return { sea: SEA };
    case 'plong': return { motes: 1, beams: [{ at: [XS + 2, 9, 3], yaw: 0, pitch: 1.4, len: 14, r: 2.2, a: 0.3, col: '#d8ffff' }] };
    case 'sable': return { motes: 1, smoke: [{ at: [XS + 4, 0.4, -2], f0: 954, f1: 1010, rate: 14, size: 1.1, col: '#d8c48e', rise: 0.3 }] };
    case 'coule': case 'dedans': case 'boules': return { motes: 1 };
    case 'rayons': case 'poudre': case 'eclats': return { motes: 0.3 };
    case 'tonnerre': return { rain: 0.25, wind: [-4, 1], sea: { y: -0.95, amp: 0.45, col: '#2a6a7e', deep: '#14384a', foam: '#e8f4f6', foamAmt: 1.0 }, lightning: [1488],
      spray: [{ at: [-0.1, 0.4, 2.3], f0: 1494, n: 150, power: 6, col: '#ffb050' }], smoke: [{ at: [-0.1, 0.6, 2.3], f0: 1494, f1: 1550, rate: 26, size: 1.4, col: '#4a4038', rise: 0.8 }],
      sparks: [{ at: [-0.1, 0.8, 2.3], f0: 1494, f1: 1514, rate: 120, col: '#ffb040', speed: 5 }] };
  }
  return null;
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.suenaga = { tunic: '#d8482a', skin: '#c9966a', hat: 'kabuto', hatCol: '#2a2a36', hatBand: '#c8402a', armor: true, armorCols: ['#c8402a', '#8f2a1e'], moustache: '#1e1714', brows: '#1e1714' };
  O.peintre = { tunic: '#7a3fb0', skin: '#f0cfa8', hat: 'chonmage', hair: '#1e1714', hatBand: '#e8d6a0', moustache: '#2a1e1a', brows: '#1e1714' };
  O.plongeuse = { tunic: '#18b8d8', skin: '#a8714a', hat: 'divehood', hatCol: '#0f7e96', brows: '#1e1714' };
  O.plongeur = { tunic: '#f08a1a', skin: '#f1c9a4', hat: 'divehood', hatCol: '#c8601a', stout: true, brows: '#4a3222' };
  O.labo = { tunic: '#f4f4ee', skin: '#a8714a', hair: '#2b1a14', brows: '#1e1714', glasses: '#3a2a22' };
  O.mongol = { tunic: '#2f7a5a', skin: '#d8a070', hat: 'mongol', hatCol: '#a83a2a', hatBand: '#4a3626', moustache: '#2a1e16', brows: '#2a1e16', stout: true };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg) => (p, k = 1) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); g.restore(); };
const ballCard = (p) => { p.ell(300, 520, 70, 70, '#7a4a2e', 14); p.ell(300, 470, 24, 16, '#5a3a24', 10); p.ell(270, 495, 22, 14, '#ffffffaa', 0); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S);
  const sue = (o, pos, ex = {}) => R_(T, 'suenaga', life(f, 3, o), pos, { tint, ...ex });
  const pnt = (o, pos = PNT, ex = {}) => R_(T, 'peintre', life(f, 5, o), pos, { tint, ...ex });
  const paint = Math.sin(f * 0.32) * 0.5 + 0.5;
  switch (S.id) {
    case 'hook': out.push(pnt({ expr: f < 80 ? 'squint' : 'grin', L: 'hip', R: 'reach', holdR: 'brush', lift: q(0.2 + 0.7 * paint, 2), look: 0.5 })); break;
    case 'vers': out.push(sue({ expr: 'grin', L: 'hip', R: 'thumb', look: -0.3 }, SUE)); break;
    case 'peint':
      out.push(pnt({ expr: 'squint', L: 'hip', R: 'reach', holdR: 'brush', lift: q(0.1 + 0.6 * paint, 2), look: 0.5 }));
      out.push(sue({ expr: f > 300 ? 'laugh' : 'grin', L: 'point', R: 'hip', look: -0.5 }, SUE)); break;
    case 'mais': out.push(pnt({ expr: f > 400 ? 'grin' : 'smile', L: 'hip', R: 'reach', holdR: 'brush', lift: q(0.2 + 0.7 * paint, 2), look: 0.5 })); break;
    case 'rajout': out.push(pnt({ expr: f > 480 ? 'laugh' : 'grin', L: 'hip', R: f > 470 ? 'up' : 'reach', holdR: 'brush', lift: q(0.2 + 0.7 * paint, 2), look: 0.4 })); break;
    case 'alors': { const k = popIn(f, 512, 10);
      out.push(pnt({ expr: 'nervous', L: 'hip', R: 'hip', holdR: 'brush', look: 0.5 }));
      out.push(sue({ expr: 'squint', L: 'hip', R: 'temple', swirl: q(f * 0.25, 1), look: -0.5 }, SUE, { s: Math.max(0.01, k) })); break; }
    case 'squint':
      out.push(pnt({ expr: f > 640 ? 'laugh' : 'nervous', L: f > 640 ? 'up' : 'hip', R: f > 640 ? 'up' : 'hip', holdR: f > 640 ? undefined : 'brush', look: 0.5 }));
      out.push(sue({ expr: f > 640 ? 'stubborn' : 'squint', L: 'hip', R: f > 640 ? 'cross' : 'temple', swirl: q(f * 0.25, 1), look: -0.5 }, SUE)); break;
    case 'sauf': { if (f > 768) break; const d = DECKP(f), h = hop(f, 752, 0.5, 12), up = f >= 752;
      out.push(R_(T, 'plongeuse', life(f, 9, { expr: up ? 'shock' : 'grin', L: up ? 'up' : 'hip', R: up ? 'up' : 'thumb', look: 0.3 }), [d[0], d[1], d[2]], { tint, dy: h.dy, sx: h.sx, sy: h.sy })); break; }
    case 'plong':
      out.push(R_(T, 'plongeuse', life(f, 9, { expr: 'squint', L: 'hip', R: 'reach', holdR: 'tool', lift: q(0.1 + 0.6 * paint, 2), look: 0.5 }), DV1, { tint }));
      out.push(R_(T, 'plongeur', life(f, 11, { expr: 'grin', L: 'hip', R: 'point', look: -0.3 }), DV2, { tint })); break;
    case 'sable': out.push(R_(T, 'plongeuse', life(f, 9, { expr: f > 995 ? 'shock' : 'squint', L: 'hip', R: 'reach', holdR: 'tool', lift: q(0.1 + 0.6 * paint, 2), look: 0.6 }), DS, { tint })); break;
    case 'coule': out.push(R_(T, 'plongeuse', life(f, 9, { expr: 'grin', L: 'hip', R: 'point', look: 0.6 }), DS, { tint })); break;
    case 'boules': { const h = hop(f, 1196, 0.3, 10), got = f > 1200;
      out.push(R_(T, 'plongeuse', life(f, 9, { expr: f < 1196 ? 'squint' : 'shock', L: got ? 'carry' : 'hip', R: got ? 'carry' : 'reach', holdR: got ? 'bomb' : undefined, lift: q(0.2 + 0.4 * paint, 2), look: -0.4 }), DB, { tint, dy: h.dy, sx: h.sx, sy: h.sy })); break; }
    case 'rayons': out.push(R_(T, 'labo', life(f, 9, { expr: 'grin', L: 'point', R: 'hip', holdR: 'bomb', look: -0.6 }), DL, { tint })); break;
    case 'poudre': out.push(R_(T, 'labo', life(f, 9, { expr: 'shock', L: 'point', R: 'hip', holdR: 'bomb', look: -0.6 }), DL, { tint })); break;
    case 'eclats': out.push(R_(T, 'labo', life(f, 9, { expr: f > 1425 ? 'laugh' : 'grin', L: 'point', R: f > 1425 ? 'up' : 'hip', holdR: f > 1425 ? undefined : 'bomb', look: -0.6 }), DL, { tint })); break;
    case 'tonnerre': { const fo = fallOver(f, 1496, 1, 12), thrown = f >= 1480;
      out.push(R_(T, 'mongol', life(f, 13, { expr: f > 1494 ? 'laugh' : 'grin', L: 'hip', R: thrown ? 'point' : 'up', holdR: thrown ? undefined : 'bomb', look: 0.5 }), MON, { tint, ...(thrown ? {} : tremble(f, 0.01)) }));
      out.push(sue({ expr: f > 1494 ? 'dazed' : f > 1476 ? 'shock' : 'nervous', L: f > 1494 ? 'flail' : 'head', R: f > 1494 ? 'flail' : 'head', wv: q(f * 0.6, 1), look: -0.5 }, SB, { roll: fo.roll * 0.55, sy: fo.sy })); break; }
    case 'faux':
      out.push(pnt({ expr: 'laugh', L: 'belly', R: 'point', look: 0.5 }));
      out.push(sue({ expr: f > 1625 ? 'shock' : 'stubborn', L: f > 1625 ? 'point' : 'hip', R: 'hip', look: -0.5 }, SUE)); break;
    case 'reelle': out.push(pnt({ expr: 'laugh', L: 'belly', R: f > 1700 ? 'thumb' : 'point', look: 0.5 })); break;
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'vers') { const k = ramp(f, 168, 186); out.push(FX('y93' + q(k, 1), labelCard('1293', 120, '#ffd23a', '#271925'), [SUE[0] - 0.25, 2.55, 0.4], 0.5 * (0.5 + 0.5 * clamp(k)), { draw: (p) => labelCard('1293', 120, '#ffd23a', '#271925')(p, k) })); }
  if (S.id === 'rajout') { const k = ramp(f, 436, 456); out.push(FX('p400' + q(k, 1), (p) => labelCard('+400 ans', 96, '#ffd23a', '#271925')(p, k), [PNT[0] + 1.05, 2.15, 0.4], 0.5)); }
  if (S.id === 'sable') { const k = ramp(f, 955, 975); out.push(FX('m1' + q(k, 1), (p) => labelCard('1 m', 130, '#ffd23a', '#271925')(p, k), [DS[0] + 0.55, 2.5, 0.3], 0.5)); }
  if (S.id === 'coule') { const k = ramp(f, 1022, 1040); out.push(FX('y81' + q(k, 1), (p) => labelCard('1281', 120, '#ffd23a', '#271925')(p, k), [XS + 4, 2.3, -2.4], 0.7)); }
  if (S.id === 'tonnerre') {
    if (f >= 1480 && f < 1494) { const u = (f - 1480) / 14, x = lerp(MON[0] - 0.1, SB[0], u), y = 1.9 + 1.0 * Math.sin(u * Math.PI) - 0.7 * u; out.push(FX('ball' + q(u, 2), ballCard, [x, y, 2.3], 1.2)); }
    if (f >= 1494 && f < 1514) { const t = q((f - 1494) / 20, 2); out.push(FX('bm' + t, (p) => T.fxBurst(p, t, '#ffb040', 14, 60, 300), [-0.1, 1.5, 2.45], 2.4)); }
  }
  if (S.id === 'faux' && f > 1620 && f < 1650) { const t = q((f - 1620) / 30, 2); out.push(FX('gb' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [BALL[0], 1.3, 0.3], 0.9)); }
  return out;
};
