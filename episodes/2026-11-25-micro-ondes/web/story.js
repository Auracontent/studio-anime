// « Le micro-ondes de Percy Spencer » (1945) : histoire vraie, 52 s, 30 fps, 1566 images. Cadres calés sur phrases.json (whisper).
// Labo radar (library/radar.js, x = 0) : établi + magnétron x = 0,2 (z = -3,2), baie à tubes x = -4,4, antenne x = 5,2, four géant x = 3,2, calendrier x = -7.
// Cuisine moderne décalée de KX = 60 (library/cuisine.js) avec un micro-ondes sur le plan de travail. Personnages du labo à z ≈ -2,3.
// Héros : Percy Spencer (blouse grise, cravate rouge, moustache fine). Secondaires : Walt (pull moutarde, reçoit le maïs et l'œuf), deux techniciens, une enfant (finale).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, tremble, fallOver, popIn, transition, crane, fgCard } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1566, DECK = 0;
const KX = 60;
export const SHOTS = [
  { id: 'hook', a: 0, b: 142 },        // Une barre de chocolat fond dans sa poche… et rien ne la chauffait.
  { id: 'date', a: 143, b: 220 },      // En mille neuf cent quarante-cinq, Percy Spencer,
  { id: 'radar', a: 221, b: 290 },     // ingénieur américain, travaille sur des radars,
  { id: 'magne', a: 291, b: 365 },     // juste à côté d'un magnétron en marche.
  { id: 'poche', a: 366, b: 441 },     // Il sent sa poche chaude, et le chocolat qui coule.
  { id: 'mais', a: 442, b: 542 },      // Intrigué, il apporte des grains de maïs.
  { id: 'pop', a: 543, b: 670 },       // Ils éclatent partout dans le labo : du popcorn.
  { id: 'oeuf', a: 671, b: 761 },      // Le lendemain, on raconte qu'il essaie avec un œuf.
  { id: 'boom', a: 762, b: 812 },      // Il explose.
  { id: 'comprend', a: 813, b: 911 },  // Spencer comprend que les ondes du radar cuisent la nourriture.
  { id: 'boite', a: 912, b: 982 },     // Il construit une boîte pour les enfermer.
  { id: 'sauf', a: 983, b: 1066 },     // Sauf que… cette machine n'a rien d'une cuisine.
  { id: 'deux', a: 1067, b: 1127 },    // Les premiers fours font presque deux mètres,
  { id: 'poids', a: 1128, b: 1161 },   // pèsent plus de trois cents kilos,
  { id: 'prix', a: 1162, b: 1252 },    // et coûtent des milliers de dollars.
  { id: 'vingt', a: 1253, b: 1339 },   // Il faudra vingt ans pour en faire un modèle qui tient sur un comptoir.
  { id: 'cuisine', a: 1340, b: 1383 }, // Alors,
  { id: 'enfant', a: 1384, b: 1470 },  // la prochaine fois que ton plat tourne derrière la vitre…
  { id: 'boucle', a: 1471, b: 1565 },  // dis-toi qu'il y a eu d'abord un chocolat qui fondait dans une poche.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière : chaud (accroche) -> jour -> doré (popcorn) -> matin -> doré (idée) -> froid (pivot) -> doré (cuisine) ----------
const DORE = mood('dore', { exposure: 1.3, gamma: 1.15 });
const JOUR = mood('jour', { exposure: 1.2, gamma: 1.1 });
const MATIN = mood('matin', { exposure: 1.4, gamma: 1.15 });
const FROID = mood('froid', { exposure: 1.45, gamma: 1.2 });
export const lightFor = (S, f) => {
  if (f < 143) return DORE;
  if (f < 543) return blendMood(DORE, JOUR, ramp(f, 143, 190));
  if (f < 671) return blendMood(JOUR, DORE, ramp(f, 543, 570));
  if (f < 813) return blendMood(DORE, MATIN, ramp(f, 671, 700));
  if (f < 912) return blendMood(MATIN, DORE, ramp(f, 813, 840));
  if (f < 983) return blendMood(DORE, JOUR, ramp(f, 912, 940));
  if (f < 1253) return blendMood(JOUR, FROID, ramp(f, 983, 1010));
  if (f < 1340) return blendMood(FROID, JOUR, ramp(f, 1253, 1290));
  return blendMood(JOUR, DORE, ramp(f, 1340, 1420));
};
const TINT = (f) => (f >= 983 && f < 1290 ? '#dfe8f4' : '#fff4e4');

// ---------- le décor qui évolue ----------
export const worldAt = (f) => {
  const mag = f < 560 || (f >= 671 && f < 830) ? (f < 143 ? 0.6 : 1) : f < 912 ? 1 : 0.5;
  const big = f < 912 ? 0 : f < 1253 ? E.back(ramp(f, 912, 950)) : f < 1340 ? lerp(1, 0.28, E.smooth(ramp(f, 1290, 1336))) : 0;
  const x = f < 1128 ? 0 : f < 1161 ? 0.8 * E.smooth(ramp(f, 1128, 1161)) : 0.8;
  return {
    mag, dish: f * 0.035, big, bigX: x, bigDoor: f >= 1000 && f < 1060 ? E.smooth(ramp(f, 1000, 1020)) * (1 - ramp(f, 1040, 1060)) : 0,
    bigGlow: f >= 912 && f < 983 ? ramp(f, 940, 960) : 0, cal: f < 1253 ? 0 : ramp(f, 1256, 1330), turn: f * 0.1, mwOn: f >= 1384 ? 1 : f >= 1360 ? 0.6 : 0,
  };
};

// ---------- positions ----------
const walk = (f, a, b, p0, p1) => { const k = E.smooth(ramp(f, a, b)); return [lerp(p0[0], p1[0], k), Math.abs(Math.sin(f * 0.45)) * 0.03 * (k > 0 && k < 1 ? 1 : 0), lerp(p0[2], p1[2], k)]; };
const spAt = (f) => {
  if (f < 221) return { pos: [-0.7, 0, -2.3], mode: f < 143 ? 'hook' : 'date' };
  if (f < 291) return { pos: walk(f, 221, 250, [-2.0, 0, -2.3], [-3.3, 0, -2.3]), mode: 'radar' };
  if (f < 366) return { pos: [-0.8, 0, -2.3], mode: 'magne' };
  if (f < 442) return { pos: [-0.8, 0, -2.3], mode: 'poche' };
  if (f < 543) return { pos: [-0.8, 0, -2.3], mode: 'mais' };
  if (f < 671) return { pos: [-0.3, 0, -2.3], mode: 'pop' };
  if (f < 762) return { pos: [0.8, 0, -2.3], mode: 'oeuf' };
  if (f < 813) return { pos: [0.8, 0, -2.3], mode: 'boom' };
  if (f < 912) return { pos: [0.7, 0, -2.3], mode: 'comprend' };
  if (f < 983) return { pos: [2.0, 0, -1.9], mode: 'boite' };
  if (f < 1067) return { pos: [2.0, 0, -1.7], mode: 'sauf' };
  if (f < 1128) return { pos: [1.9, 0, -1.8], mode: 'deux' };
  if (f < 1162) return { pos: [-1.8, 0, -1.7], mode: 'poids' };
  if (f < 1253) return { pos: [0.6, 0, -1.8], mode: 'prix' };
  if (f < 1340) return { pos: [-5.0, 0, -2.4], mode: 'vingt' };
  return null;
};
const waAt = (f) => {
  if (f >= 543 && f < 671) return { pos: [2.0, 0, -2.3], mode: f < 626 ? 'shock' : 'popped' };
  if (f >= 671 && f < 913) return { pos: [2.3, 0, -2.3], mode: f < 762 ? 'lean' : f < 790 ? 'hit' : 'dazed' };
  return null;
};
const techAt = (f) => (f >= 1128 && f < 1162 ? { a: [0.2, 0, -2.0], b: [-0.7, 0, -2.0] } : null);
const KID = [KX - 1.9, 0, -2.55];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.9, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const SP = [-0.7, 0, -2.3];
const CRANE = (f, c, f0, n, from, to, fov = 42, ease = 'smooth') => crane(c, f, f0, n, { from, to, fov, ease });
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return camFromKeys([K(0, SP, { headW: 0.26, yaw: -14, low: 6, frameY: 0.42, s: 0.9 }), K(70, SP, { headW: 0.3, yaw: 2, low: 4, frameY: 0.42, s: 0.9 }), K(142, SP, { headW: 0.34, yaw: 10, low: 6, frameY: 0.44, s: 0.9 })], f);
    case 'date': return CRANE(f, [0.4, 0, -3.0], 143, 78, { r: 4.2, h: 1.5, yaw: -10, lookUp: 1.4 }, { r: 9.5, h: 2.6, yaw: 14, lookUp: 1.7 }, 44, 'easeOut');
    case 'radar': return camFromKeys([K(221, [-2.0, 0, -2.3], { headW: 0.3, yaw: 10, low: 10, frameY: 0.42 }), R(250, [-3.0, 1.8, 0.2], [-4.4, 1.7, -3.1], 40), R(290, [3.4, 1.9, 0.6], [5.0, 1.8, -2.9], 38)], f);
    case 'magne': return camFromKeys([R(291, [0.6, 1.5, -0.4], [0.3, 1.2, -3.1], 36), R(330, [1.0, 1.4, -1.0], [0.5, 1.25, -3.1], 30), R(365, [0.1, 1.35, -1.4], [0.6, 1.3, -3.1], 28)], f);
    case 'poche': return camFromKeys([K(366, [-0.8, 0, -2.3], { headW: 0.34, yaw: -6, low: 14, frameY: 0.46 }), K(441, [-0.8, 0, -2.3], { headW: 0.4, yaw: 4, low: 16, frameY: 0.48, dutch: 3 })], f);
    case 'mais': return camFromKeys([K(442, [-0.8, 0, -2.3], { headW: 0.34, yaw: 8, low: 10, frameY: 0.44 }), K(495, [-0.8, 0, -2.3], { headW: 0.3, yaw: -6, low: 8, frameY: 0.44 }), { f: 542, ...frameTwo([-0.6, 0, -2.3], [1.1, 0, -2.3], { headW: 0.22, yaw: 6, s: 0.9, low: 6 }) }], f);
    case 'pop': return camFromKeys([R(543, [0.2, 1.7, -0.6], [1.0, 1.3, -3.1], 44), { f: 600, ...frameTwo([-0.3, 0, -2.3], [2.0, 0, -2.3], { headW: 0.2, yaw: -4, s: 0.9, low: 4 }) }, K(626, [-0.3, 0, -2.3], { headW: 0.32, yaw: -4, low: 8, frameY: 0.44 }), K(670, [-0.3, 0, -2.3], { headW: 0.36, yaw: 6, low: 8, frameY: 0.46 })], f);
    case 'oeuf': return camFromKeys([{ f: 671, ...frameTwo([0.8, 0, -2.3], [2.3, 0, -2.3], { headW: 0.2, yaw: 6, s: 0.9, low: 4 }) }, { f: 730, ...frameTwo([0.8, 0, -2.3], [2.3, 0, -2.3], { headW: 0.24, yaw: -6, s: 0.9, low: 6 }) }, { f: 761, ...frameTwo([0.8, 0, -2.3], [2.3, 0, -2.3], { headW: 0.27, yaw: 0, s: 0.9, low: 8 }) }], f);
    case 'boom': return shake(camFromKeys([{ f: 762, ...frameTwo([0.8, 0, -2.3], [2.3, 0, -2.3], { headW: 0.27, yaw: 0, s: 0.9, low: 8 }) }, { f: 812, ...frameTwo([0.8, 0, -2.3], [2.8, 0, -2.3], { headW: 0.22, yaw: -4, s: 0.9, low: 2 }) }], f), f, 765, 0.12, 24);
    case 'comprend': return camFromKeys([K(813, [0.7, 0, -2.3], { headW: 0.32, yaw: -8, low: 16, frameY: 0.44 }), K(850, [0.7, 0, -2.3], { headW: 0.38, yaw: 4, low: 20, frameY: 0.46 }), K(890, [0.7, 0, -2.3], { headW: 0.26, yaw: -22, low: 8, frameY: 0.44 }), K(911, [0.7, 0, -2.3], { headW: 0.3, yaw: -12, low: 8, frameY: 0.44 })], f);
    case 'boite': return camFromKeys([{ f: 912, ...frameTwo([2.0, 0, -1.9], [3.4, 0, -2.6], { headW: 0.2, yaw: -10, s: 0.9, low: 6 }) }, { f: 960, ...frameTwo([2.0, 0, -1.9], [3.4, 0, -2.6], { headW: 0.24, yaw: 6, s: 0.9, low: 10 }) }, R(982, [3.2, 0.8, -0.2], [3.2, 1.5, -2.5], 44)], f);
    case 'sauf': return shake(camFromKeys([R(983, [3.0, 0.4, -0.6], [3.2, 1.6, -2.6], 46, { roll: 4 }), R(1040, [4.2, 0.5, 0.0], [3.0, 1.9, -2.6], 46, { roll: -3 }), R(1066, [2.0, 0.6, 0.4], [3.0, 1.7, -2.6], 44)], f), f, 984, 0.1, 14);
    case 'deux': return CRANE(f, [2.4, 0, -2.2], 1067, 60, { r: 3.2, h: 1.2, yaw: -20, lookUp: 1.5 }, { r: 7.5, h: 2.0, yaw: 14, lookUp: 1.4 }, 44);
    case 'poids': return camFromKeys([{ f: 1128, ...frameTwo([-0.7, 0, -2.0], [0.2, 0, -2.0], { headW: 0.26, yaw: -8, s: 0.95, low: 6 }) }, { f: 1161, ...frameTwo([0.1, 0, -2.0], [1.0, 0, -2.0], { headW: 0.26, yaw: 6, s: 0.95, low: 6 }) }], f);
    case 'prix': return camFromKeys([K(1162, [0.6, 0, -1.8], { headW: 0.34, yaw: -6, low: 8, frameY: 0.44 }), K(1210, [0.6, 0, -1.8], { headW: 0.4, yaw: 4, low: 10, frameY: 0.46, dutch: 4 }), R(1252, [3.8, 1.9, -0.6], [4.0, 1.9, -2.6], 30)], f);
    case 'vingt': return camFromKeys([R(1253, [-3.8, 1.8, -0.2], [-5.8, 1.8, -3.8], 40), R(1296, [-4.4, 1.8, -1.0], [-6.0, 1.8, -3.85], 32), R(1310, [0.6, 1.2, 1.0], [4.0, 0.7, -2.4], 36), R(1339, [1.9, 1.0, 0.2], [4.0, 0.5, -2.4], 34)], f);
    case 'cuisine': return camFromKeys([R(1340, [KX - 1.0, 1.3, -0.5], [KX - 2.0, 1.2, -3.75], 38), R(1383, [KX - 1.7, 1.25, -1.9], [KX - 2.0, 1.2, -3.7], 30)], f);
    case 'enfant': return camFromKeys([{ f: 1384, ...frameOn(KID, { headW: 0.3, yaw: -30, s: 0.78, head: 1.12, low: 4, frameY: 0.46 }) }, { f: 1470, ...frameOn(KID, { headW: 0.34, yaw: -14, s: 0.78, head: 1.12, low: 4, frameY: 0.46 }) }], f);
    case 'boucle': return camFromKeys([R(1471, [KX - 1.6, 1.3, -1.7], [KX - 2.0, 1.18, -3.7], 30), R(1500, [KX - 1.3, 1.2, -2.0], [KX - 1.95, 1.15, -3.7], 28), K(1565, [KX - 1.9, 0, -2.55], { headW: 0.3, yaw: 4, low: 6, frameY: 0.42, s: 0.78, head: 1.12 })], f);
  }
  return camFromKeys([K(0, SP, { headW: 0.3, yaw: 0 })], f);
};
const TR = [{ a: 221, type: 'whip', dir: 1 }, { a: 291, type: 'push' }, { a: 366, type: 'whip', dir: -1 }, { a: 442, type: 'push' }, { a: 543, type: 'whip', dir: 1 }, { a: 671, type: 'rise' }, { a: 813, type: 'push' }, { a: 912, type: 'whip', dir: -1 }, { a: 983, type: 'push' }, { a: 1067, type: 'whip', dir: 1 }, { a: 1253, type: 'rise' }, { a: 1340, type: 'push' }, { a: 1384, type: 'whip', dir: -1 }, { a: 1471, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
const FG = { hook: 'choc', poche: 'choc', pop: 'popbowl', boite: 'plan', prix: 'bill', boucle: 'choc' };
const fgOn = (f) => { const id = shotAt(f).id; if (id === 'poche') return f >= 392; if (id === 'pop') return f >= 626; if (id === 'boucle') return f >= 1500; return !!FG[id]; };
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]), id = shotAt(f).id; return FG[id] && id !== 'hook' && id !== 'boucle' ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
const POP = [[548, 22], [566, 26], [584, 30], [600, 34], [612, 40], [626, 110]];
export const envAt = (f) => {
  const S = shotAt(f), e = { motes: 0.5 };
  if (f < 143) { e.sparks = [{ at: [0.4, 1.5, -3.1], f0: 0, f1: 143, rate: 8, speed: 2.5 }]; e.motes = 0.8; }
  if (f >= 291 && f < 442) e.sparks = [{ at: [0.4, 1.55, -3.1], f0: 291, f1: 442, rate: 10, speed: 2.5 }];
  if (f >= 366 && f < 442) e.smoke = [{ at: [-0.7, 1.0, -2.2], f0: 400, f1: 442, rate: 4, size: 0.2, col: '#6a3a1e', rise: 0.3 }];
  if (f >= 543 && f < 671) e.spray = POP.map(([f0, n]) => ({ at: [1.6, 1.3, -3.0], f0, n, power: f0 === 626 ? 3.2 : 1.8, col: '#fff3c4' }));
  if (f >= 762 && f < 813) e.spray = [{ at: [2.0, 1.4, -2.9], f0: 762, n: 90, power: 3.0, col: '#fbe28a' }, { at: [2.0, 1.4, -2.9], f0: 764, n: 60, power: 2.2, col: '#ffffff' }];
  if (f >= 912 && f < 983) e.sparks = [{ at: [3.0, 1.3, -2.1], f0: 920, f1: 975, rate: 40, speed: 3.5, col: '#ffd070' }];
  if (f >= 983 && f < 1253) e.smoke = [{ at: [3.7, 2.9, -2.8], f0: 983, f1: 1253, rate: 6, size: 0.4, col: '#e8e8ec', rise: 0.5 }, { at: [2.7, 2.9, -2.8], f0: 983, f1: 1253, rate: 6, size: 0.4, col: '#e8e8ec', rise: 0.5 }];
  if (f >= 1340) e.motes = 0.9;
  return e;
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.spencer = { tunic: '#8a949c', skin: '#e8bf9a', hair: '#3a2a20', moustache: '#3a2a20', brows: '#3a2a20', lapels: '#f6f1e6', bowtie: '#c8312c', buttons: '#c9ced6', cuffs: '#f6f1e6', belt: '#3a2a1a' };
  O.walt = { tunic: '#d6a028', skin: '#a9724a', hair: '#1e1714', brows: '#1e1714', stout: true, pattern: 'checks', patternCol: '#e8b83a' };
  O.tec1 = { tunic: '#3f9ad8', skin: '#d8a070', hair: '#2a1e1a', brows: '#2a1e1a', cuffs: '#f6f1e6' };
  O.tec2 = { tunic: '#7a3aa8', skin: '#8a5a3a', hair: '#1a1410', brows: '#1a1410', thin: true };
  O.lea = { tunic: '#e8483a', skin: '#8a5a3a', hair: '#1a1410', braids: '#1a1410', brows: '#1a1410', head: 1.12, cuffs: '#ffd23a' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT(f);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const step = q((f * 0.08) % 1, 2);
  const sp = spAt(f);
  if (sp) {
    let o = { expr: 'determined', L: 'hip', R: 'hip', look: 0.4 }, ex = { s: 0.9 };
    switch (sp.mode) {
      case 'hook': o = { ...o, expr: 'shock', L: 'hip', R: 'belly', look: 0.2, headTilt: 4 }; ex = { ...ex, ...tremble(f, 0.006, 1) }; break;
      case 'date': o = { ...o, expr: 'determined', L: 'hip', R: 'point', look: 0.8 }; break;
      case 'radar': o = { ...o, expr: f < 250 ? 'proud' : 'smug', L: 'hip', R: 'point', look: -0.7, headTilt: -3 }; break;
      case 'magne': o = { ...o, expr: 'determined', L: 'hip', R: 'reach', look: 0.9 }; break;
      case 'poche': o = { ...o, expr: f < 392 ? 'nervous' : 'shock', L: 'hip', R: 'belly', look: -0.3, headTilt: 4 }; ex = { ...ex, ...tremble(f, 0.006, 3) }; break;
      case 'mais': o = f < 480 ? { ...o, expr: 'squint', L: 'chin', R: 'hip', look: 0.4 } : { ...o, expr: 'grin', L: 'hip', R: 'show', holdR: 'corn', look: 0.8 }; if (f >= 480 && f < 495) ex = { ...ex, ...hop(f, 480, 0.04, 8) }; break;
      case 'pop': o = f < 626 ? { ...o, expr: 'shock', L: 'up', R: 'show', holdR: 'corn', look: 0.8 } : { ...o, expr: 'laugh', L: 'up', R: 'up', look: 0.6 }; if (f >= 626) ex = { ...ex, ...hop(f, 626, 0.25, 12) }; break;
      case 'oeuf': o = { ...o, expr: 'sly', L: 'hip', R: 'show', holdR: 'egg', look: 0.8 }; if (f >= 720) ex = { ...ex, ...tremble(f, 0.004, 5) }; break;
      case 'boom': o = { ...o, expr: 'shock', L: 'head', R: 'head', wv: q(f * 0.4, 1), look: 0.8 }; ex = { ...ex, ...hop(f, 764, 0.2, 10) }; break;
      case 'comprend': o = f < 840 ? { ...o, expr: 'squint', L: 'chin', R: 'hip', look: 0.6 } : { ...o, expr: 'proud', L: 'up', R: 'hip', look: 0.8, headTilt: -4 }; if (f >= 840 && f < 852) ex = { ...ex, ...hop(f, 840, 0.15, 8) }; break;
      case 'boite': o = { ...o, expr: 'determined', L: 'hip', R: f % 16 < 8 ? 'lift' : 'carry', holdR: 'tool', look: 0.9 }; if (f % 16 < 3) ex = { ...ex, dy: 0.02 }; break;
      case 'sauf': o = { ...o, expr: 'nervous', L: 'shrug', R: 'shrug', look: 0.9 }; break;
      case 'deux': o = { ...o, expr: 'deadpan', L: 'shrug', R: 'point', look: 0.9 }; ex = { ...ex, s: 0.9 }; break;
      case 'poids': o = { ...o, expr: 'pained', L: 'hip', R: 'point', look: 0.9 }; break;
      case 'prix': o = { ...o, expr: 'shock', L: 'head', R: 'head', wv: q(f * 0.35, 1), look: 0.9 }; ex = { ...ex, ...tremble(f, 0.006, 4) }; break;
      case 'vingt': o = { ...o, expr: 'nervous', L: 'chin', R: 'hip', look: -0.8 }; break;
    }
    fig('spencer', 6, o, sp.pos, ex);
  }
  const wa = waAt(f);
  if (wa) {
    let o = { expr: 'smile', L: 'hip', R: 'hip', look: -0.8 }, ex = { s: 1.0 }, pos = wa.pos;
    switch (wa.mode) {
      case 'shock': o = { ...o, expr: 'shock', L: 'up', R: 'up', look: -0.6 }; if (f >= 560) ex = { ...ex, ...hop(f, 560, 0.15, 8), ...tremble(f, 0.01, 7) }; break;
      case 'popped': o = { ...o, expr: 'dazed', L: 'head', R: 'head', wv: q(f * 0.3, 1), look: -0.4 }; ex = { ...ex, ...tremble(f, 0.006, 7) }; break;
      case 'lean': o = { ...o, expr: f < 720 ? 'suspicious' : 'nervous', L: 'hip', R: 'cross', look: -0.8, headTilt: -6 }; break;
      case 'hit': o = { ...o, expr: 'dazed', L: 'flail', R: 'flail', wv: q(f * 0.5, 1), look: 0 }; ex = { ...ex, ...fallOver(f, 764, 1, 12) }; pos = [lerp(2.3, 3.0, E.smooth(ramp(f, 764, 780))), 0, -2.3]; break;
      case 'dazed': o = { ...o, expr: 'dazed', L: 'head', R: 'hip', look: -0.4 }; pos = [2.8, 0, -2.3]; ex = { ...ex, ...tremble(f, 0.006, 9) }; break;
    }
    fig('walt', 9, o, pos, ex);
  }
  const te = techAt(f);
  if (te) {
    const tr = tremble(f, 0.008, 2);
    fig('tec1', 11, { expr: 'pained', L: 'push', R: 'push', look: 0.9, run: false }, [te.a[0] + 0.8 * E.smooth(ramp(f, 1128, 1161)), 0, te.a[2]], { s: 0.95, ...tr });
    fig('tec2', 13, { expr: 'pained', L: 'push', R: 'push', look: 0.9, run: false }, [te.b[0] + 0.8 * E.smooth(ramp(f, 1128, 1161)), 0, te.b[2]], { s: 1.05, ...tremble(f, 0.008, 5) });
  }
  if (f >= 1384) {
    const watching = f >= 1384;
    fig('lea', 15, { expr: f < 1500 ? 'grin' : 'shock', L: 'hip', R: f < 1440 ? 'point' : 'up', look: -0.9, headTilt: 5, head: 1.12 }, KID, { s: 0.78, ...(f >= 1470 ? hop(f, 1500, 0.1, 8) : {}), ...(watching ? {} : {}) });
  }
  // objets au premier plan
  if (fgOn(f)) {
    const cam = camAt(f), id = S.id, kind = FG[id];
    if (id === 'hook' || id === 'boucle') out.push(fgCard(cam, T.fgProp('choc'), { key: 'fgchoc', side: 0, dist: 0.85, drop: 0.5 + 0.05 * Math.sin(f * 0.3), s: 0.3 }));
    else if (id === 'prix') { for (let i = 0; i < 3; i++) { const k = ((f - 1162) * 0.012 + i / 3) % 1; out.push(fgCard(cam, T.fgProp('bill'), { key: 'fgbill' + i, side: (i - 1) * 0.9, dist: 1.1, drop: -0.7 + k * 1.9, s: 0.4 })); } }
    else out.push(fgCard(cam, T.fgProp(kind, { seed: 2 }), { key: 'fg' + id, side: id === 'pop' ? -1 : 1, dist: 1.15, drop: 0.6, s: 0.5 }));
  }
  return out;
};
export const fxAt = (f, T) => [];
