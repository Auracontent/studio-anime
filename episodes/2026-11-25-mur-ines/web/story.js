// « Le mur d'Inès » (fiction du quotidien) — 60 s, 30 fps, 1800 images. Cadres calés sur phrases.json (whisper).
// Chantier (library/chantier.js) : mur de Paco x = -2 (à gauche), mur d'Inès x = 1,2 (à droite), faces avant z ≈ -2,9, personnages à z ≈ -2,35.
// Héroïne : Inès (16 ans, casque moutarde, salopette turquoise). Secondaires : Paco (casque rouge, stout, smug), Victor le chef (casque blanc, moustache, deadpan). Figurants : 2 ouvriers.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, tremble, follow, transition, crane, fgCard } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1800, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 109 },        // Tout le chantier riait de son mur, parce qu'Inès posait chaque brique à la main,
  { id: 'une', a: 110, b: 144 },       // une par une.
  { id: 'seize', a: 145, b: 222 },     // Elle a seize ans, et c'est sa première semaine.
  { id: 'victor', a: 223, b: 309 },    // Son chef, Victor, soupire en regardant sa montre.
  { id: 'paco', a: 310, b: 375 },      // Le mur de Paco, lui, monte à toute vitesse.
  { id: 'tape', a: 376, b: 469 },      // Il tape, il plaisante, il ne vérifie rien.
  { id: 'fil', a: 470, b: 528 },       // Inès, elle, tend un fil,
  { id: 'niveau', a: 529, b: 586 },    // pose un niveau,
  { id: 'recommence', a: 587, b: 640 },// et recommence si une brique penche d'un doigt.
  { id: 'soir', a: 641, b: 697 },      // Le soir, Paco a fini trois mètres.
  { id: 'seul', a: 698, b: 758 },      // Inès, un seul. Tout le monde se moque d'elle.
  { id: 'sang', a: 759, b: 810 },      // Elle a les mains en sang,
  { id: 'rien', a: 811, b: 864 },      // mais elle ne change rien.
  { id: 'nuit', a: 865, b: 897 },      // Puis, la nuit,
  { id: 'vent', a: 898, b: 987 },      // le vent se lève, et la pluie tombe en rafales.
  { id: 'tremble', a: 988, b: 1029 },  // Le mur de Paco tremble.
  { id: 'glisse', a: 1030, b: 1076 },  // Une brique glisse, puis dix,
  { id: 'ecroule', a: 1077, b: 1134 }, // puis tout s'écroule dans la boue.
  { id: 'sauf', a: 1135, b: 1201 },    // Sauf que celui d'Inès reste debout,
  { id: 'droit', a: 1202, b: 1273 },   // droit comme un fil, sous la tempête.
  { id: 'matin', a: 1274, b: 1341 },   // Au matin, Victor pose la main dessus.
  { id: 'silence', a: 1342, b: 1375 }, // Il ne dit rien.
  { id: 'cles', a: 1376, b: 1431 },    // Il lui tend les clés du chantier.
  { id: 'ramasse', a: 1432, b: 1518 }, // Paco ramasse ses briques, et pour la première fois, il demande :
  { id: 'montre', a: 1519, b: 1557 },  // « Montre-moi comment tu fais. »
  { id: 'lecon1', a: 1558, b: 1630 },  // Ce que tu fais lentement et bien aujourd'hui
  { id: 'lecon2', a: 1631, b: 1709 },  // tiendra encore quand la tempête viendra.
  { id: 'alors', a: 1710, b: 1758 },   // Alors, ne te presse pas :
  { id: 'brique', a: 1759, b: 1799 },  // pose ta brique.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière : chaud (accroche) -> jour -> soir -> nuit -> tempête -> matin -> doré ----------
const DORE = mood('dore', { exposure: 1.3, gamma: 1.15 });
const JOUR = mood('jour', { exposure: 1.2, gamma: 1.1 });
const SOIR = mood('soir', { exposure: 1.3, gamma: 1.15 });
const NUIT = mood('nuit', { exposure: 1.5, gamma: 1.25 });
const TEMP = mood('tempete', { exposure: 1.55, gamma: 1.3 });
const MATIN = mood('matin', { exposure: 1.4, gamma: 1.15 });
export const lightFor = (S, f) => {
  if (f < 110) return blendMood(DORE, JOUR, ramp(f, 40, 110));
  if (f < 641) return JOUR;
  if (f < 865) return blendMood(JOUR, SOIR, ramp(f, 641, 670));
  if (f < 898) return blendMood(SOIR, NUIT, ramp(f, 865, 897));
  if (f < 1274) return blendMood(NUIT, TEMP, ramp(f, 898, 960));
  if (f < 1376) return blendMood(TEMP, MATIN, ramp(f, 1274, 1300));
  if (f < 1558) return blendMood(MATIN, DORE, ramp(f, 1376, 1420));
  return DORE;
};
const TINT = (f) => (f >= 865 && f < 1274 ? '#b8c6f0' : f >= 641 && f < 865 ? '#ffe6cc' : '#fff4e4');

// ---------- le décor qui évolue ----------
const keyed = (K, f) => { if (f <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (f <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (f - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K[K.length - 1][1]; };
const pacoRows = (f) => keyed([[0, 12], [110, 17], [309, 17], [363, 25], [470, 27], [640, 29], [683, 30.6]], f);
const inesRows = (f) => keyed([[0, 3.2], [640, 7.6], [698, 10], [1557, 10], [1709, 22], [1799, 24]], f);
export const worldAt = (f) => {
  const night = f >= 865 && f < 1274;
  return {
    pacoRows: pacoRows(f), inesRows: inesRows(f), lean: 0.3 + 0.5 * ramp(f, 310, 683), toss: f < 422 ? 1 : 0,
    trem: f < 930 ? 0 : f < 1030 ? 0.25 * ramp(f, 930, 988) + 0.75 * ramp(f, 988, 1010) : 0,
    slide: f < 1030 ? ramp(f, 1010, 1030) : 0, fall: ramp(f, 1030, 1134),
    picked: 0.55 * ramp(f, 1440, 1499),
    crook: f >= 520 && f < 640 ? 1 : 0, crookRow: 6, redo: ramp(f, 590, 630),
    line: ramp(f, 480, 522),
    wet: f < 880 ? 0 : f < 1274 ? ramp(f, 880, 960) : 1 - 0.5 * ramp(f, 1274, 1558),
    tarp: f < 865 ? 0.05 : f < 1274 ? 0.25 + 0.75 * ramp(f, 880, 930) : 0.12, lamp: night ? 1 : 0,
  };
};

// ---------- positions ----------
const PW = [-2.0, 0, -3.0], IWc = [1.2, 0, -3.0];
const walkTo = (f, a, b, x0, x1, p0, p1) => { const k = E.smooth(ramp(f, a, b)); return [lerp(p0[0], p1[0], k), Math.abs(Math.sin(f * 0.45)) * 0.03 * (k > 0 && k < 1 ? 1 : 0), lerp(p0[2], p1[2], k)]; };
const inesAt = (f) => {
  if (f < 470) return { pos: [0.9, 0, -2.35], mode: 'lay' };
  if (f < 530) { const k = E.smooth(ramp(f, 480, 522)); return { pos: [lerp(-0.2, 2.3, k), Math.abs(Math.sin(f * 0.45)) * 0.03 * (k > 0 && k < 1 ? 1 : 0), -2.35], mode: f < 524 ? 'walk' : 'stand' }; }
  if (f < 641) return { pos: [0.85, 0, -2.35], mode: f < 587 ? 'level' : 'redo' };
  if (f < 698) return { pos: [1.9, 0, -2.3], mode: 'tired' };
  if (f < 865) return { pos: [1.4, 0, -2.35], mode: f < 759 ? 'alone' : f < 811 ? 'hands' : 'pick' };
  if (f < 1342) return null;
  if (f < 1432) return { pos: [0.95, 0, -2.2], mode: f < 1376 ? 'wait' : 'keys' };
  if (f < 1519) return { pos: [1.35, 0, -2.35], mode: 'smile' };
  if (f < 1558) return { pos: [1.35, 0, -2.35], mode: 'show' };
  if (f < 1710) return { pos: [1.15, 0, -2.35], mode: 'teach' };
  return { pos: [1.3, 0, -2.35], mode: f < 1759 ? 'toi' : 'lay2' };
};
const pacoAt = (f) => {
  if (f < 310) return { pos: [-0.9, 0, -2.3], mode: 'hook' };
  if (f < 376) return { pos: [-2.7 + 0.5 * Math.sin(f * 0.3), Math.abs(Math.sin(f * 0.6)) * 0.04, -2.3], mode: 'throw' };
  if (f < 470) return { pos: [-1.55, 0, -2.35], mode: 'smug' };
  if (f < 641) return { pos: [-1.55, 0, -2.35], mode: 'smug' };
  if (f < 698) return { pos: [-1.5, 0, -2.35], mode: 'proud' };
  if (f < 759) return { pos: [-0.2, 0, -2.75], mode: 'laugh' };
  if (f < 865) return { pos: [-0.2, 0, -2.75], mode: 'laugh' };
  if (f < 1432) return null;
  if (f < 1500) return { pos: [-2.2 + 0.1 * Math.sin(f * 0.2), 0, -1.3], mode: 'pick' };
  if (f < 1520) { const k = E.smooth(ramp(f, 1500, 1520)); return { pos: [lerp(-2.2, 0.15, k), Math.abs(Math.sin(f * 0.45)) * 0.03, lerp(-1.3, -2.3, k)], mode: 'walk' }; }
  return { pos: [0.1, 0, -2.3], mode: f < 1710 ? 'learn' : 'work' };
};
const victorAt = (f) => {
  if (f >= 223 && f < 310) return { pos: [-0.15, 0, -1.9], mode: 'watch' };
  if (f >= 1274 && f < 1342) { const k = E.smooth(ramp(f, 1274, 1312)); return { pos: [lerp(-2.3, -0.55, k), Math.abs(Math.sin(f * 0.4)) * 0.03 * (k < 1 ? 1 : 0), lerp(-1.5, -2.45, k)], mode: f < 1312 ? 'walk' : 'hand' }; }
  if (f >= 1342 && f < 1432) return { pos: [-0.25, 0, -2.2], mode: f < 1376 ? 'silent' : 'keys' };
  return null;
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.9, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const INES = [0.9, 0, -2.35], PACO = [-1.55, 0, -2.35], HOOKCAM = () => R(0, [-0.9, 1.35, 0.9], [-1.6, 1.15, -3.0], 44);
const CRANE = (f, c, f0, n, from, to, fov = 42, ease = 'smooth') => crane(c, f, f0, n, { from, to, fov, ease });
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return camFromKeys([R(0, [-1.1, 1.1, -0.3], [-2.0, 1.0, -3.0], 44), R(55, [0.0, 1.0, -0.2], [0.7, 0.9, -3.0], 42), K(109, [0.9, 0, -2.35], { headW: 0.28, yaw: -8, low: 6, frameY: 0.4 })], f);
    case 'une': return camFromKeys([K(110, [1.0, 0, -2.35], { headW: 0.34, yaw: 10, low: 6, frameY: 0.42 }), K(144, [1.0, 0, -2.35], { headW: 0.4, yaw: 2, low: 4, frameY: 0.45 })], f);
    case 'seize': return camFromKeys([{ f: 145, ...frameTwo([0.9, 0, -2.35], [2.2, 0, -2.3], { headW: 0.24, yaw: -8, s: 0.95, low: 8 }) }, { f: 222, ...frameTwo([0.9, 0, -2.35], [2.2, 0, -2.3], { headW: 0.27, yaw: 4, s: 0.95, low: 12 }) }], f);
    case 'victor': return camFromKeys([{ f: 223, ...frameTwo([-0.15, 0, -1.9], [1.3, 0, -2.5], { headW: 0.27, yaw: 8, s: 1, low: 14, frameY: 0.42 }) }, { f: 250, ...frameOn([-0.15, 0, -1.9], { headW: 0.34, yaw: -6, s: 1.05, low: 16, frameY: 0.42 }) }, { f: 309, ...frameOn([-0.15, 0, -1.9], { headW: 0.38, yaw: -2, s: 1.05, low: 18, frameY: 0.44, dutch: 3 }) }], f);
    case 'paco': return CRANE(f, [-1.6, 0, -3.0], 310, 66, { r: 8, h: 2.6, yaw: -16, lookUp: 1.5 }, { r: 3.8, h: 1.7, yaw: 10, lookUp: 1.7 }, 42, 'easeOut');
    case 'tape': return camFromKeys([K(376, PACO, { headW: 0.36, yaw: -8, low: 10, frameY: 0.42 }), K(421, PACO, { headW: 0.32, yaw: 6, low: 12, frameY: 0.42 }), R(469, [-0.2, 0.7, -0.4], [-2.2, 1.6, -3.0], 38, { roll: 5 })], f);
    case 'fil': return follow((g) => inesAt(g).pos, f, { headW: 0.2, yaw: -8, lag: 6, lead: 0.6, s: 0.88, low: 4, frameY: 0.4 });
    case 'niveau': return camFromKeys([R(529, [1.9, 0.95, -1.0], [2.0, 0.72, -2.9], 34), R(586, [1.8, 0.85, -1.2], [2.05, 0.68, -2.9], 28)], f);
    case 'recommence': return camFromKeys([R(587, [1.7, 1.05, -0.5], [1.7, 0.75, -2.9], 40), K(640, [0.9, 0, -2.35], { headW: 0.3, yaw: -6, low: 4, frameY: 0.42, dutch: 3 })], f);
    case 'soir': return CRANE(f, [-0.5, 0, -3.0], 641, 57, { r: 9.5, h: 1.7, yaw: -8, lookUp: 1.4 }, { r: 8, h: 1.5, yaw: 6, lookUp: 1.5 }, 46);
    case 'seul': return camFromKeys([{ f: 698, ...frameTwo([1.4, 0, -2.35], [0.6, 0, -2.5], { headW: 0.27, yaw: -4, s: 0.9, low: 6 }) }, { f: 758, ...frameTwo([1.4, 0, -2.35], [0.6, 0, -2.5], { headW: 0.31, yaw: 6, s: 0.9, low: 10, dutch: 3 }) }], f);
    case 'sang': return camFromKeys([K(759, [1.4, 0, -2.35], { headW: 0.4, yaw: 6, low: 0, frameY: 0.56 }), K(810, [1.4, 0, -2.35], { headW: 0.46, yaw: 0, low: 0, frameY: 0.6 })], f);
    case 'rien': return camFromKeys([K(811, [1.4, 0, -2.35], { headW: 0.32, yaw: -6, low: 18, frameY: 0.42 }), K(864, [1.4, 0, -2.35], { headW: 0.38, yaw: 4, low: 22, frameY: 0.44 })], f);
    case 'nuit': return CRANE(f, [-0.4, 0, -3.0], 865, 33, { r: 15, h: 8, yaw: -22, lookUp: 0.5 }, { r: 9, h: 2.6, yaw: -8, lookUp: 1.2 }, 44);
    case 'vent': return camFromKeys([R(898, [4.0, 1.5, 0.6], [5.0, 2.3, -4.0], 46), R(987, [0.2, 1.4, 1.2], [-2.0, 1.5, -3.0], 44)], f);
    case 'tremble': return shake(camFromKeys([R(988, [-1.6, 1.9, 0.6], [-2.0, 1.9, -3.0], 44), R(1029, [-1.9, 2.1, 0.0], [-2.0, 2.3, -3.0], 36)], f), f, 1000, 0.05, 30);
    case 'glisse': return shake(camFromKeys([R(1030, [-1.1, 2.9, -0.8], [-1.4, 2.8, -3.0], 34), R(1060, [-1.5, 2.8, -0.5], [-1.9, 2.5, -3.0], 36), R(1076, [-1.9, 2.0, 1.4], [-2.0, 1.8, -3.0], 44)], f), f, 1062, 0.08, 14);
    case 'ecroule': return shake(camFromKeys([R(1077, [-2.2, 1.0, 3.6], [-2.0, 1.3, -3.0], 46), R(1134, [-1.0, 0.9, 3.0], [-2.0, 0.6, -2.5], 44)], f), f, 1082, 0.16, 36);
    case 'sauf': return camFromKeys([R(1135, [3.4, 0.9, 1.6], [1.2, 0.65, -3.0], 42), R(1201, [2.2, 0.75, 0.2], [1.2, 0.55, -3.0], 34)], f);
    case 'droit': return camFromKeys([R(1202, [-0.3, 0.42, -1.7], [2.4, 0.62, -2.9], 38), R(1273, [2.9, 0.42, -1.8], [-0.2, 0.62, -2.9], 38)], f);
    case 'matin': return CRANE(f, [-0.8, 0, -2.6], 1274, 68, { r: 7.5, h: 2.3, yaw: -22, lookUp: 1.0 }, { r: 2.9, h: 1.3, yaw: 12, lookUp: 1.1 }, 42);
    case 'silence': return camFromKeys([K(1342, [-0.25, 0, -2.2], { headW: 0.34, yaw: 6, low: 14, frameY: 0.42, s: 1.05 }), K(1375, [-0.25, 0, -2.2], { headW: 0.42, yaw: 0, low: 16, frameY: 0.44, s: 1.05 })], f);
    case 'cles': return camFromKeys([{ f: 1376, ...frameTwo([-0.25, 0, -2.2], [0.95, 0, -2.2], { headW: 0.26, yaw: 6, s: 0.98, low: 6 }) }, { f: 1431, ...frameTwo([-0.25, 0, -2.2], [0.95, 0, -2.2], { headW: 0.3, yaw: -4, s: 0.98, low: 10 }) }], f);
    case 'ramasse': return follow((g) => pacoAt(Math.max(g, 1432)).pos, f, { headW: 0.3, yaw: 8, lag: 6, lead: 0.5, s: 0.95, low: 4, frameY: 0.42 });
    case 'montre': return camFromKeys([{ f: 1519, ...frameTwo([0.1, 0, -2.3], [1.35, 0, -2.35], { headW: 0.26, yaw: -6, s: 0.92, low: 6 }) }, { f: 1557, ...frameTwo([0.1, 0, -2.3], [1.35, 0, -2.35], { headW: 0.3, yaw: 4, s: 0.92, low: 10 }) }], f);
    case 'lecon1': return CRANE(f, [0.7, 0, -2.4], 1558, 73, { r: 3.4, h: 1.5, yaw: -16, lookUp: 1.1 }, { r: 4.6, h: 1.9, yaw: 14, lookUp: 1.2 }, 44);
    case 'lecon2': return CRANE(f, [0.8, 0, -2.8], 1631, 79, { r: 4.5, h: 1.6, yaw: 14, lookUp: 1.2 }, { r: 12, h: 3.4, yaw: -12, lookUp: 1.1 }, 44, 'easeOut');
    case 'alors': return camFromKeys([K(1710, [1.3, 0, -2.35], { headW: 0.32, yaw: -6, low: 16, frameY: 0.42 }), K(1758, [1.3, 0, -2.35], { headW: 0.38, yaw: 4, low: 20, frameY: 0.44 })], f);
    case 'brique': return camFromKeys([K(1759, [1.3, 0, -2.35], { headW: 0.4, yaw: 8, low: 2, frameY: 0.5 }), R(1799, HOOKCAM().pos, HOOKCAM().look, HOOKCAM().fov)], f);
  }
  return HOOKCAM();
};
const TR = [{ a: 223, type: 'whip', dir: 1 }, { a: 310, type: 'push' }, { a: 470, type: 'whip', dir: -1 }, { a: 641, type: 'rise' }, { a: 865, type: 'rise' }, { a: 988, type: 'whip', dir: 1 }, { a: 1135, type: 'whip', dir: -1 }, { a: 1274, type: 'rise' }, { a: 1432, type: 'whip', dir: 1 }, { a: 1558, type: 'push' }, { a: 1710, type: 'whip', dir: -1 }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
const FG = { une: 'brick', niveau: 'level', sang: 'glove', brique: 'brick', cles: 'keys' };
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return FG[shotAt(f).id] ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
const LIGHTNING = [925, 1002, 1076, 1138, 1222];
export const envAt = (f) => {
  const S = shotAt(f);
  if (f >= 865 && f < 1274) {
    const k = ramp(f, 880, 950);
    const e = { rain: (f < 988 ? 0.5 : 1) * k, wind: [4 * k, 1.5 * k], lightning: LIGHTNING, motes: 0 };
    if (f >= 1077 && f < 1150) e.spray = [{ at: [-2.0, 0.15, -1.6], f0: 1090, n: 70, power: 1.3, col: '#6a4a34' }, { at: [-2.6, 0.15, -2.0], f0: 1104, n: 50, power: 1.1, col: '#6a4a34' }, { at: [-1.2, 0.15, -2.0], f0: 1116, n: 50, power: 1.1, col: '#7a5a40' }];
    return e;
  }
  switch (S.id) {
    case 'hook': case 'une': return { motes: 0.7, smoke: [{ at: [-2.0, 0.5, -2.7], f0: 0, f1: 109, rate: 5, size: 0.35, col: '#e8d6b4', rise: 0.3 }] };
    case 'victor': return { motes: 0.5, smoke: f >= 250 && f < 300 ? [{ at: [-0.15, 1.5, -1.7], f0: 250, f1: 290, rate: 4, size: 0.2, col: '#ffffff', rise: 0.5 }] : undefined };
    case 'paco': case 'tape': return { motes: 0.6, smoke: [{ at: [-2.0, 0.6, -2.7], f0: 310, f1: 470, rate: 5, size: 0.4, col: '#e8d6b4', rise: 0.3 }] };
    case 'matin': case 'silence': case 'cles': return { motes: 0.9, beams: [{ at: [4.0, 4.5, -4.5], yaw: 0.3, pitch: 0.7, len: 9, r: 1.8, col: '#ffe0a0', a: 0.18 * ramp(f, 1300, 1380) }] };
    case 'lecon1': case 'lecon2': case 'alors': case 'brique': case 'ramasse': case 'montre': return { motes: 1.0, beams: [{ at: [4.0, 4.5, -4.5], yaw: 0.3, pitch: 0.7, len: 9, r: 1.8, col: '#ffd890', a: 0.2 }] };
  }
  return { motes: 0.4 };
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.ines = { tunic: '#18b8d8', skin: '#a9724a', hair: '#1e1714', braids: '#1e1714', brows: '#1e1714', hat: 'hardhat', hatCol: '#e8b020', apron: '#18b8d8', cuffs: '#e8b020', belt: '#6a4a2a' };
  O.paco = { tunic: '#7a3aa8', skin: '#f3cfae', hair: '#3a2210', moustache: '#3a2210', brows: '#3a2210', hat: 'hardhat', hatCol: '#d6322e', stout: true, pattern: 'stripes', patternCol: '#9a5ac8', buttons: true };
  O.victor = { tunic: '#3a6a8a', skin: '#c58e66', hair: '#6a6a70', moustache: '#6a6a70', brows: '#4a4a52', hat: 'hardhat', hatCol: '#f6f1e6', lapels: true, belt: '#3a2a1a', medals: 1 };
  O.ouvA = { tunic: '#ff8a1e', skin: '#d8a070', hair: '#2a1e1a', brows: '#2a1e1a', hat: 'hardhat', hatCol: '#f2c230', cuffs: '#f6f1e6' };
  O.ouvB = { tunic: '#7cc043', skin: '#8a5a3a', hair: '#1a1410', brows: '#1a1410', hat: 'hardhat', hatCol: '#3f9ad8', stout: true };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const pick = (L, f) => L.reduce((a, [k, e]) => (f >= k ? e : a), L[0][1]);
// expressions d'Inès : déterminée, gênée, fière, effrayée... puis soulagée et heureuse
const EXI = [[0, 'determined'], [145, 'nervous'], [190, 'smile'], [470, 'determined'], [587, 'squint'], [620, 'determined'], [641, 'pained'], [698, 'nervous'], [759, 'pained'], [811, 'determined'], [1342, 'nervous'], [1376, 'shock'], [1405, 'grin'], [1432, 'smile'], [1519, 'grin'], [1558, 'proud'], [1710, 'proud'], [1759, 'determined']];
const EXP = [[0, 'laugh'], [310, 'determined'], [376, 'smug'], [422, 'sly'], [641, 'proud'], [698, 'laugh'], [1432, 'nervous'], [1500, 'nervous'], [1519, 'smile'], [1558, 'determined'], [1700, 'smile']];
const EXV = [[223, 'deadpan'], [245, 'pained'], [275, 'deadpan'], [1274, 'deadpan'], [1312, 'stern'], [1342, 'deadpan'], [1362, 'smile'], [1376, 'proud']];
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT(f);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const lau = (i) => ({ dy: Math.abs(Math.sin(f * 0.5 + i)) * 0.03, roll: Math.sin(f * 0.5 + i) * 0.04, marks: false });
  const step = q((f * 0.08) % 1, 2);
  // ---- Inès (toujours la même : casque moutarde, salopette turquoise) ----
  const ines = inesAt(f);
  if (ines) {
    const e = pick(EXI, f); let o = { expr: e, L: 'hip', R: 'hip', look: -0.2, headTilt: -5 }, ex = { s: 0.88 };
    switch (ines.mode) {
      case 'lay': o = { ...o, L: 'hip', R: 'reach', holdR: 'brick', look: 0.7 }; if (f < 110) ex = { ...ex, ...hop(f, 40, 0.03, 30) }; break;
      case 'walk': o = { ...o, L: 'point', R: 'carry', run: false, step, look: 0.8 }; break;
      case 'stand': o = { ...o, L: 'hip', R: 'hip', look: 0.4 }; break;
      case 'level': o = { ...o, L: 'chin', R: 'hip', look: 0.8 }; break;
      case 'redo': o = { ...o, L: 'reach', R: 'carry', holdR: 'brick', look: 0.8 }; break;
      case 'tired': o = { ...o, expr: 'pained', L: 'hang', R: 'cheek', look: -0.6 }; break;
      case 'alone': o = { ...o, L: 'hang', R: 'hang', look: -0.7 }; break;
      case 'hands': o = { ...o, L: 'show', R: 'hang', holdL: 'glove', look: 0 }; break;
      case 'pick': o = { ...o, L: 'carry', R: 'carry', holdL: 'brick', look: 0.6 }; break;
      case 'wait': o = { ...o, L: 'hang', R: 'hang', look: -0.6 }; break;
      case 'keys': o = { ...o, L: f < 1405 ? 'hang' : 'head', R: f < 1405 ? 'hang' : 'head', wv: q(f * 0.4, 1), look: -0.6 }; if (f >= 1376 && f < 1420) ex = { ...ex, ...tremble(f, 0.004, 2) }; if (f >= 1405) ex = { ...ex, ...lau(1) }; break;
      case 'smile': o = { ...o, L: 'hip', R: 'hip', look: -0.7 }; break;
      case 'show': o = { ...o, L: 'show', R: 'hip', holdL: 'level', look: -0.7 }; break;
      case 'teach': o = { ...o, L: 'point', R: 'hip', look: -0.6, expr: 'proud' }; break;
      case 'toi': o = { ...o, L: 'hip', R: 'point', look: 0, headTilt: 4, expr: 'proud' }; break;
      case 'lay2': o = { ...o, L: 'hip', R: 'reach', holdR: 'brick', look: 0.7 }; break;
    }
    fig('ines', 6, o, ines.pos, ex);
  }
  // ---- Paco ----
  const pa = pacoAt(f);
  if (pa) {
    const e = pick(EXP, f); let o = { expr: e, L: 'hip', R: 'hip', look: 0.5 }, ex = { s: 1.0 };
    switch (pa.mode) {
      case 'hook': o = { ...o, L: 'hip', R: 'point', look: 0.9 }; ex = { ...ex, ...lau(0) }; break;
      case 'throw': o = { ...o, L: f % 14 < 7 ? 'carry' : 'lift', R: 'carry', holdL: 'brick', look: 0.3, run: true, step: q((f * 0.12) % 1, 2) }; break;
      case 'smug': o = f < 422 ? { ...o, L: 'hip', R: 'show', holdR: 'tool', look: -0.2 } : { ...o, L: 'hip', R: 'hip', look: -0.8, headTilt: 5 }; if (f < 422 && f % 12 < 4) ex = { ...ex, dy: 0.03 }; break;
      case 'proud': o = { ...o, L: 'fist', R: 'hip', look: 0.4, headTilt: 5 }; break;
      case 'laugh': o = { ...o, L: 'hip', R: 'point', look: 0.9 }; ex = { ...ex, ...lau(2) }; break;
      case 'pick': o = { ...o, L: 'carry', R: 'carry', holdL: 'brick', look: 0.2, expr: 'nervous' }; break;
      case 'walk': o = { ...o, L: 'carry', R: 'carry', holdL: 'brick', run: false, step, look: 0.6 }; break;
      case 'learn': o = { ...o, L: 'reach', R: 'carry', holdR: 'brick', look: 0.7 }; break;
      case 'work': o = { ...o, L: 'reach', R: 'carry', holdR: 'brick', look: 0.7 }; break;
    }
    fig('paco', 8, o, pa.pos, ex);
  }
  // ---- Victor ----
  const vi = victorAt(f);
  if (vi) {
    const e = pick(EXV, f); let o = { expr: e, L: 'hip', R: 'hip', look: 0.4 }, ex = { s: 1.05 };
    switch (vi.mode) {
      case 'watch': o = { ...o, L: 'show', R: 'hip', holdL: 'watch', look: 0 }; break;
      case 'walk': o = { ...o, L: 'hang', R: 'hang', run: false, step, look: 0.6 }; break;
      case 'hand': o = { ...o, L: 'reach', R: 'hip', look: 0.6 }; break;
      case 'silent': o = { ...o, L: 'hip', R: 'cross', look: 0.5 }; break;
      case 'keys': o = { ...o, L: 'show', R: 'hip', holdL: 'keys', look: 0.6, expr: 'proud' }; break;
    }
    fig('victor', 12, o, vi.pos, ex);
  }
  // ---- ouvriers (figurants) ----
  if (f < 222 || (f >= 641 && f < 698) || (f >= 698 && f < 865)) {
    const A = f < 110 ? [3.0, 0, -2.3] : f < 222 ? [2.3, 0, -2.3] : f < 698 ? [3.6, 0, -2.3] : [2.7, 0, -2.7];
    fig('ouvA', 10, { expr: f >= 190 && f < 222 ? 'smile' : 'laugh', L: 'up', R: 'point', look: -0.8 }, A, { s: 1.12, ...(f >= 641 && f < 698 ? { marks: false } : lau(1)) });
  }
  if (f < 110 || (f >= 641 && f < 865)) {
    const B = f < 110 ? [-4.1, 0, -2.2] : f < 698 ? [-4.2, 0, -2.3] : [-1.0, 0, -2.85];
    fig('ouvB', 14, { expr: 'laugh', L: 'hip', R: 'up', look: 0.8 }, B, { s: 0.98, ...lau(3) });
  }
  // objets au premier plan, flous
  if (FG[S.id]) { const cam = camAt(f); out.push(fgCard(cam, T.fgProp(FG[S.id], { seed: 2 }), { key: 'fg' + S.id, side: S.id === 'sang' ? -1 : 1, dist: 1.15, drop: 0.6, s: 0.5 })); }
  return out;
};
export const fxAt = (f, T) => [];
