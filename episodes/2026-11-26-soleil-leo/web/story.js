// « Léo et le costume de soleil » (fiction du quotidien) — 55 s, 30 fps, 1656 images. Cadres calés sur phrases.json (whisper).
// Chambre (library/chambre.js) : table de couture x -2.8..-0.2 (costume en x = -1.0, z = -2.7), lit x 1.7..4.1 (z = -2.3). Salle des fêtes (library/scene.js) en x = 100 :
// scène (dessus y = 0.8) à z = -5.5, chaises z -3.3..1.4, public debout z ≈ 0.4, Léo au fond z ≈ 4.
// Héros : Léo (12 ans, pull turquoise). Secondaire : Lila (6 ans, petite sœur, costume de soleil). Figurants : le public.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, tremble, transition, crane, fgCard, crowd } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1656, DECK = 0;
const HX = 100;
export const SHOTS = [
  { id: 'hook', a: 0, b: 78 },          // Léo a une nuit pour coudre un costume de soleil.
  { id: 'sait', a: 79, b: 123 },        // Il ne sait pas coudre.
  { id: 'lila', a: 124, b: 224 },       // Demain, sa petite sœur Lila joue le soleil à la fête de l'école.
  { id: 'aiguille1', a: 225, b: 248 },  // Il pique l'aiguille,
  { id: 'doigt', a: 249, b: 293 },      // et il se pique le doigt.
  { id: 'tire', a: 294, b: 311 },       // Il tire le fil,
  { id: 'dechire', a: 312, b: 347 },    // et le tissu se déchire.
  { id: 'minuit', a: 348, b: 386 },     // À minuit,
  { id: 'travers', a: 387, b: 435 },    // les rayons jaunes sont tout de travers,
  { id: 'tombe', a: 436, b: 496 },      // et l'un d'eux tombe par terre.
  { id: 'abandon', a: 497, b: 549 },    // Léo veut tout abandonner.
  { id: 'lit', a: 550, b: 594 },        // Mais sur le lit, Lila dort,
  { id: 'dort', a: 595, b: 658 },       // sa peluche serrée contre elle.
  { id: 'reprend', a: 659, b: 699 },    // Alors il reprend l'aiguille,
  { id: 'points', a: 700, b: 751 },     // un point après l'autre,
  { id: 'lever', a: 752, b: 773 },      // jusqu'au lever du jour.
  { id: 'scene', a: 774, b: 810 },      // Sur la scène,
  { id: 'entre', a: 811, b: 848 },      // Lila entre.
  { id: 'penche', a: 849, b: 885 },     // Le costume penche,
  { id: 'pend', a: 886, b: 903 },       // un rayon pend,
  { id: 'rigolent', a: 904, b: 959 },   // et les enfants rigolent.
  { id: 'fond', a: 960, b: 987 },       // Au fond de la salle,
  { id: 'poings', a: 988, b: 1037 },    // Léo serre les poings.
  { id: 'sauf', a: 1038, b: 1122 },     // Sauf que Lila lève les bras et tourne sur elle-même.
  { id: 'ondulent', a: 1123, b: 1157 }, // Tous les rayons ondulent,
  { id: 'danse', a: 1158, b: 1219 },    // comme un vrai soleil qui danse.
  { id: 'applaudit', a: 1220, b: 1268 },// La salle applaudit debout.
  { id: 'crie', a: 1269, b: 1344 },     // Lila crie : « C'est mon grand frère qui l'a cousu ! »
  { id: 'rougit', a: 1345, b: 1406 },   // Léo rougit et sourit,
  { id: 'pansements', a: 1407, b: 1466 },// le doigt couvert de pansements.
  { id: 'lecon', a: 1467, b: 1582 },    // Ce qu'on fait de travers pour quelqu'un vaut mieux que le parfait qu'on n'ose pas commencer.
  { id: 'hesites', a: 1583, b: 1629 },  // La prochaine fois que tu hésites,
  { id: 'prends', a: 1630, b: 1655 },   // prends l'aiguille.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const inHall = (f) => f >= 774 && f < 1467;

// ---------- lumière : lampe chaude (accroche) -> nuit (Lila dort) -> lampe -> aube -> salle de jour -> doré (la danse) -> lampe ----------
const LAMP = mood('lampe', { exposure: 1.75, gamma: 1.5, sunI: 3.1, sat: 1.22 });
const NUIT = mood('nuit', { exposure: 1.55, gamma: 1.3 });
const MATIN = mood('matin', { exposure: 1.45, gamma: 1.2 });
const JOUR = mood('jour', { exposure: 1.2, gamma: 1.1 });
const FROID = mood('froid', { exposure: 1.2, gamma: 1.15 });
const DORE = mood('dore', { exposure: 1.3, gamma: 1.15 });
export const lightFor = (S, f) => {
  if (f < 550) return LAMP;
  if (f < 659) return blendMood(blendMood(LAMP, NUIT, ramp(f, 550, 575)), LAMP, ramp(f, 640, 659));
  if (f < 774) return blendMood(LAMP, MATIN, ramp(f, 700, 765));
  if (f < 960) return blendMood(MATIN, JOUR, ramp(f, 774, 800));
  if (f < 1038) return blendMood(JOUR, FROID, ramp(f, 960, 990));
  if (f < 1467) return blendMood(FROID, DORE, ramp(f, 1038, 1062));
  return blendMood(DORE, LAMP, ramp(f, 1467, 1490));
};
const TINT = (f) => (f >= 550 && f < 659 ? '#d4dcff' : f >= 774 ? '#fff4e4' : '#ffe6c4');

// ---------- le décor qui évolue ----------
const keyed = (K, f) => { if (f <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (f <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (f - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K[K.length - 1][1]; };
const ND0 = [-0.85, 1.0, -2.6];
const needleAt = (f) => {   // aiguille 3D (dessus le tissu) : pique en rythme quand personne ne la tient en main
  const k = 0.5 + 0.5 * Math.sin(f * 0.55), x = -0.85 + 0.12 * Math.sin(f * 0.11);
  if (f < 79) return [x, 0.98 + 0.3 * k, -2.62 + 0.04 * Math.sin(f * 0.2)];
  if (f >= 225 && f < 249) return [-0.8, 0.98 + 0.34 * Math.max(0, Math.cos((f - 225) * 0.32)), -2.55];
  if (f >= 700 && f < 774) return [-1.2 + 0.5 * ((f - 700) / 74), 0.98 + 0.26 * k, -2.5];
  if (f >= 1467 && f < 1583) return [x, 0.98 + 0.3 * k, -2.62];
  if (f >= 1630) return [x, 0.98 + 0.3 * k, -2.62];
  return null;
};
export const worldAt = (f) => ({
  crook: keyed([[0, 0.25], [100, 0.3], [380, 0.35], [425, 1], [659, 1], [740, 0.5], [774, 0.5]], f),
  fallen: ramp(f, 446, 476), tear: ramp(f, 316, 330), stitch: 0.0, sew: f < 700 ? 0 : f < 774 ? ramp(f, 704, 760) : 1,
  nd: inHall(f) ? null : needleAt(f), ndTilt: 0.3,
  win: f < 700 ? 0 : f < 774 ? 0.5 * ramp(f, 700, 748) + 0.5 * ramp(f, 748, 774) : 1,
  clock: f < 372 ? 9 + 3 * ramp(f, 60, 372) : f < 659 ? 12 : 12 + 6.5 * ramp(f, 659, 751),
  lamp: 1, cloth: 1,
  curtain: f < 774 ? 0 : ramp(f, 776, 808), spot: 1, sway: f * 0.06,
});

// ---------- positions ----------
const LEO = [0.15, 0, -2.3], LILA_BED = [2.15, 0.7, -1.95], HALL_LILA = [HX, 0.8, -5.4], HALL_LEO = [HX + 3.0, 0, 4.0];
const leoAt = (f) => {
  if (f >= 960 && f < 1467) return { pos: HALL_LEO, mode: f < 988 ? 'wait' : f < 1038 ? 'fists' : f < 1220 ? 'watch' : f < 1269 ? 'clap' : f < 1345 ? 'named' : f < 1407 ? 'blush' : 'plaster', hall: true };
  if (f >= 774 && f < 960) return null;
  if (f < 560) return { pos: LEO, mode: f < 79 ? 'sew' : f < 123 ? 'shrug' : f < 225 ? 'sew' : f < 249 ? 'sew' : f < 294 ? 'ouch' : f < 312 ? 'pull' : f < 348 ? 'torn' : f < 497 ? 'look' : 'quit' };
  if (f < 592) { const k = E.smooth(ramp(f, 560, 590)); return { pos: [lerp(LEO[0], 1.2, k), Math.abs(Math.sin(f * 0.4)) * 0.03 * (k < 1 ? 1 : 0), lerp(LEO[2], -1.15, k)], mode: k < 1 ? 'walk' : 'tender' }; }
  if (f < 640) return { pos: [1.2, 0, -1.15], mode: 'tender' };
  if (f < 664) { const k = E.smooth(ramp(f, 640, 664)); return { pos: [lerp(1.2, LEO[0], k), Math.abs(Math.sin(f * 0.4)) * 0.03 * (k < 1 ? 1 : 0), lerp(-1.15, LEO[2], k)], mode: k < 1 ? 'walk' : 'resume' }; }
  if (f < 774) return { pos: LEO, mode: 'stitch' };
  return { pos: LEO, mode: f < 1583 ? 'proud' : f < 1630 ? 'you' : 'offer' };
};
const lilaAt = (f) => {
  if (f < 774 || f >= 1467) return { pos: LILA_BED, mode: 'sleep' };
  if (f < 811) return null;
  if (f < 849) { const k = E.smooth(ramp(f, 811, 846)); return { pos: [lerp(HX - 2.6, HALL_LILA[0], k), 0.8 + Math.abs(Math.sin(f * 0.5)) * 0.03 * (k < 1 ? 1 : 0), lerp(-6.0, HALL_LILA[2], k)], mode: 'enter' }; }
  return { pos: HALL_LILA, mode: f < 904 ? 'droop' : f < 1038 ? 'shy' : f < 1123 ? 'spin' : f < 1220 ? 'dance' : f < 1269 ? 'bow' : 'point' };
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.95, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const CRANE = (f, c, f0, n, from, to, fov = 42, ease = 'smooth') => crane(c, f, f0, n, { from, to, fov, ease });
const C0 = [-1.0, 0.98, -2.7];
const HOOK = () => R(0, [-0.6, 1.62, -1.55], [-1.0, 1.0, -2.7], 42);
const BED = [3.0, 0.8, -2.3];
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return camFromKeys([HOOK(), R(40, [-0.35, 1.75, -1.1], [-0.85, 1.0, -2.6], 44), R(78, [0.1, 1.5, -0.2], [-0.4, 1.1, -2.6], 44)], f);
    case 'sait': return camFromKeys([K(79, LEO, { headW: 0.32, yaw: -10, low: 6, frameY: 0.42 }), K(123, LEO, { headW: 0.4, yaw: 0, low: 4, frameY: 0.44 })], f);
    case 'lila': return camFromKeys([R(124, [1.0, 1.6, 2.2], [2.9, 1.0, -2.4], 46), R(190, [3.0, 1.9, 2.4], [3.1, 1.1, -2.5], 42), R(224, [3.3, 2.1, 1.0], [3.0, 2.2, -3.2], 40)], f);
    case 'aiguille1': return camFromKeys([R(225, [-0.5, 1.5, -1.6], [-0.9, 1.0, -2.7], 36), R(248, [-0.65, 1.3, -1.8], [-0.9, 1.0, -2.65], 30)], f);
    case 'doigt': return camFromKeys([K(249, LEO, { headW: 0.4, yaw: 8, low: 4, frameY: 0.42, dutch: 3 }), K(293, LEO, { headW: 0.34, yaw: -4, low: 6, frameY: 0.42, dutch: -3 })], f);
    case 'tire': return camFromKeys([{ f: 294, ...frameTwo([0.15, 0, -2.3], [-0.8, 0, -2.7], { headW: 0.22, yaw: 8, s: 0.95, low: 6, frameY: 0.45 }) }, { f: 311, ...frameTwo([0.15, 0, -2.3], [-0.8, 0, -2.7], { headW: 0.24, yaw: 0, s: 0.95, low: 6, frameY: 0.45 }) }], f);
    case 'dechire': return shake(camFromKeys([R(312, [-0.7, 1.25, -1.7], [-1.0, 1.0, -2.7], 34), R(347, [-0.95, 1.45, -1.9], [-1.0, 1.0, -2.7], 32)], f), f, 322, 0.08, 16);
    case 'minuit': return camFromKeys([R(348, [1.4, 2.4, -1.2], [1.0, 2.7, -3.4], 34), R(386, [1.15, 2.6, -1.8], [1.0, 2.7, -3.4], 28)], f);
    case 'travers': return camFromKeys([R(387, [-1.0, 1.6, -1.35], [-1.0, 1.0, -2.7], 42), R(435, [-0.7, 1.45, -1.55], [-1.0, 1.0, -2.7], 40, { roll: 3 })], f);
    case 'tombe': return camFromKeys([R(436, [-0.8, 1.5, -0.6], [-0.8, 0.8, -2.5], 44), R(470, [-0.6, 1.1, 0.2], [-0.4, 0.4, -2.0], 44), R(496, [-0.4, 1.0, 0.5], [-0.3, 0.3, -1.8], 44)], f);
    case 'abandon': return camFromKeys([K(497, LEO, { headW: 0.34, yaw: -6, low: 16, frameY: 0.42, dutch: -4 }), K(549, LEO, { headW: 0.4, yaw: 4, low: 18, frameY: 0.44, dutch: -4 })], f);
    case 'lit': return camFromKeys([R(550, [0.6, 1.5, 2.0], [2.4, 0.9, -2.4], 46), R(594, [2.8, 1.7, 1.6], [3.0, 0.85, -2.3], 40)], f);
    case 'dort': return camFromKeys([R(595, [2.0, 1.5, 1.6], [3.0, 0.9, -2.1], 40), R(658, [3.4, 1.5, 0.9], [3.4, 0.85, -2.0], 34)], f);
    case 'reprend': return camFromKeys([K(659, LEO, { headW: 0.32, yaw: 6, low: 14, frameY: 0.42 }), K(699, LEO, { headW: 0.4, yaw: -4, low: 10, frameY: 0.44 })], f);
    case 'points': return camFromKeys([R(700, [-0.7, 1.35, -1.75], [-1.0, 1.0, -2.7], 34), R(751, [-1.1, 1.3, -1.9], [-1.0, 1.0, -2.7], 32)], f);
    case 'lever': return camFromKeys([R(752, [-2.0, 1.7, -1.4], [-2.6, 1.9, -3.4], 40), R(773, [-2.9, 1.9, -1.8], [-3.7, 1.9, -3.4], 36)], f);
    case 'scene': return camFromKeys([R(774, [HX, 2.0, 5.5], [HX, 2.2, -6], 52), R(810, [HX, 1.7, 1.2], [HX, 1.7, -6], 46)], f);
    case 'entre': return camFromKeys([K(811, [HX - 2.4, 0.8, -6.0], { headW: 0.24, yaw: 6, low: 6, frameY: 0.42, s: 0.85 }), K(848, HALL_LILA, { headW: 0.3, yaw: 0, low: 8, frameY: 0.42, s: 0.85 })], f);
    case 'penche': return camFromKeys([K(849, HALL_LILA, { headW: 0.2, yaw: -8, low: 10, frameY: 0.46, s: 0.85, dutch: 4 }), K(885, HALL_LILA, { headW: 0.26, yaw: 6, low: 8, frameY: 0.46, s: 0.85, dutch: 5 })], f);
    case 'pend': return camFromKeys([R(886, [HX + 0.9, 2.4, -3.6], [HX - 0.3, 2.0, -5.4], 36), R(903, [HX + 0.4, 2.35, -3.9], [HX - 0.4, 1.95, -5.4], 30)], f);
    case 'rigolent': return camFromKeys([R(904, [HX - 1.0, 1.9, -4.0], [HX + 0.5, 1.3, 1.8], 52), R(959, [HX + 1.0, 1.9, -4.2], [HX - 0.5, 1.3, 1.8], 50)], f);
    case 'fond': return camFromKeys([R(960, [HX + 2.0, 1.6, 6.8], [HX + 0.5, 1.5, -5.5], 52), K(987, HALL_LEO, { headW: 0.22, yaw: -4, low: 4, frameY: 0.4, s: 0.95 })], f);
    case 'poings': return camFromKeys([K(988, HALL_LEO, { headW: 0.3, yaw: -6, low: 8, frameY: 0.42, dutch: 4 }), K(1037, HALL_LEO, { headW: 0.42, yaw: 3, low: 6, frameY: 0.44, dutch: 4 })], f);
    case 'sauf': return camFromKeys([K(1038, HALL_LILA, { headW: 0.2, yaw: 0, low: 14, frameY: 0.46, s: 0.85 }), K(1080, HALL_LILA, { headW: 0.24, yaw: 8, low: 16, frameY: 0.46, s: 0.85 }), K(1122, HALL_LILA, { headW: 0.24, yaw: -8, low: 16, frameY: 0.46, s: 0.85 })], f);
    case 'ondulent': return camFromKeys([K(1123, HALL_LILA, { headW: 0.42, yaw: -6, low: 4, frameY: 0.44, s: 0.85 }), K(1157, HALL_LILA, { headW: 0.46, yaw: 6, low: 2, frameY: 0.44, s: 0.85 })], f);
    case 'danse': return CRANE(f, [HX, 1.6, -5.4], 1158, 61, { r: 3.4, h: 1.7, yaw: 18, lookUp: 0.0 }, { r: 8.5, h: 3.0, yaw: -14, lookUp: -0.3 }, 44, 'easeOut');
    case 'applaudit': return camFromKeys([R(1220, [HX - 0.8, 1.9, -4.0], [HX, 1.6, 1.8], 58), R(1268, [HX + 0.8, 1.9, -3.6], [HX - 0.2, 1.7, 1.8], 52)], f);
    case 'crie': return camFromKeys([K(1269, HALL_LILA, { headW: 0.26, yaw: 6, low: 16, frameY: 0.46, s: 0.85 }), K(1344, HALL_LILA, { headW: 0.34, yaw: -3, low: 18, frameY: 0.46, s: 0.85 })], f);
    case 'rougit': return camFromKeys([K(1345, HALL_LEO, { headW: 0.3, yaw: 6, low: 4, frameY: 0.42 }), K(1406, HALL_LEO, { headW: 0.42, yaw: 0, low: 2, frameY: 0.44 })], f);
    case 'pansements': return camFromKeys([K(1407, HALL_LEO, { headW: 0.36, yaw: -6, low: 4, frameY: 0.48 }), K(1466, HALL_LEO, { headW: 0.32, yaw: 4, low: 6, frameY: 0.4, dutch: -3 })], f);
    case 'lecon': return CRANE(f, [0.0, 0.5, -2.4], 1467, 115, { r: 11, h: 5.5, yaw: 14, lookUp: 0.8 }, { r: 4.2, h: 1.7, yaw: -10, lookUp: 1.2 }, 42, 'smooth');
    case 'hesites': return camFromKeys([K(1583, LEO, { headW: 0.32, yaw: 8, low: 14, frameY: 0.42 }), K(1629, LEO, { headW: 0.4, yaw: -2, low: 18, frameY: 0.44 })], f);
    case 'prends': return camFromKeys([K(1630, LEO, { headW: 0.4, yaw: -2, low: 6, frameY: 0.46 }), HOOK_END()], f);
  }
  return HOOK();
};
const HOOK_END = () => R(1655, ...(() => { const h = HOOK(); return [h.pos, h.look, h.fov]; })());
const TR = [{ a: 124, type: 'whip', dir: 1 }, { a: 225, type: 'push' }, { a: 348, type: 'rise' }, { a: 550, type: 'whip', dir: 1 }, { a: 659, type: 'whip', dir: -1 }, { a: 774, type: 'rise' }, { a: 886, type: 'push' }, { a: 960, type: 'whip', dir: -1 }, { a: 1038, type: 'push' }, { a: 1220, type: 'whip', dir: 1 }, { a: 1345, type: 'push' }, { a: 1467, type: 'whip', dir: -1 }, { a: 1583, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
const FG = { aiguille1: 'needle', dechire: 'needle', points: 'needle', pansements: 'plaster', hesites: 'needle', prends: 'needle' };
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return FG[shotAt(f).id] ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
export const envAt = (f) => {
  const S = shotAt(f);
  if (f >= 1038 && f < 1220) return { motes: 0.9, sparks: [{ at: [HX, 1.6, -5.2], f0: 1060, f1: 1219, rate: 10, col: '#ffe27a', speed: 2.4, size: 0.18 }], beams: [{ at: [HX - 2.5, 4.5, -2.0], yaw: 0.0, pitch: 1.0, len: 8, r: 1.4, col: '#ffe9a0', a: 0.22 * ramp(f, 1038, 1070) }, { at: [HX + 2.5, 4.5, -2.0], yaw: 0.0, pitch: 1.0, len: 8, r: 1.4, col: '#ffd890', a: 0.2 * ramp(f, 1038, 1070) }] };
  if (inHall(f)) return { motes: 0.6, sparks: f >= 1220 && f < 1345 ? [{ at: [HX, 2.4, -3], f0: 1220, f1: 1340, rate: 8, col: '#ffe27a', speed: 2, size: 0.18 }] : undefined };
  if (S.id === 'dechire') return { motes: 0.5, smoke: [{ at: [-1.0, 1.05, -2.7], f0: 322, f1: 340, rate: 5, size: 0.18, col: '#ffe9a8', rise: 0.2 }] };
  if (S.id === 'tombe') return { motes: 0.5, smoke: f >= 470 && f < 485 ? [{ at: [-0.2, 0.1, -1.5], f0: 470, f1: 485, rate: 6, size: 0.2, col: '#d8c8b0', rise: 0.2 }] : undefined };
  if (S.id === 'lever' || S.id === 'points') return { motes: 0.9, beams: [{ at: [-3.7, 1.9, -3.2], yaw: 0.35, pitch: 0.55, len: 6, r: 1.1, col: '#ffcf80', a: 0.2 * ramp(f, 720, 770) }] };
  return { motes: 0.8 };
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.leo = { tunic: '#18b8d8', skin: '#c58e66', hair: '#2a1a12', brows: '#2a1a12', cuffs: '#ffd23a', belt: null, buttons: true };
  O.lilaNuit = { tunic: '#ff8fb8', skin: '#c58e66', hair: '#2a1a12', braids: '#2a1a12', brows: '#2a1a12', cuffs: '#f6f1e6', head: 1.1 };
  O.lila = { tunic: '#ffd52e', skin: '#c58e66', hair: '#2a1a12', braids: '#2a1a12', brows: '#2a1a12', cuffs: '#ff8a1e', sun: 10, head: 1.08 };
  O.kidA = { tunic: '#e8483a', skin: '#f3cfae', hair: '#6a3a1a', brows: '#4a2a14' };
  O.kidB = { tunic: '#7cc043', skin: '#8a5a3a', hair: '#1a1410', brows: '#1a1410', cuffs: '#f6f1e6' };
  O.kidC = { tunic: '#7a3aa8', skin: '#d8a070', hair: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.mamA = { tunic: '#ff8a1e', skin: '#e8b48a', hair: '#1e1714', brows: '#1e1714', dress: '#ff8a1e' };
  O.papaB = { tunic: '#3a6a8a', skin: '#a9724a', hair: '#1a1410', brows: '#1a1410', moustache: '#1a1410', stout: true };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const pick = (L, f) => L.reduce((a, [k, e]) => (f >= k ? e : a), L[0][1]);
const EXL = [[0, 'determined'], [79, 'nervous'], [124, 'squint'], [225, 'determined'], [249, 'shock'], [272, 'pained'], [294, 'stubborn'], [312, 'shock'], [336, 'pained'], [387, 'squint'], [436, 'nervous'], [497, 'pained'], [560, 'smile'], [659, 'determined'], [728, 'squint'], [960, 'nervous'], [988, 'pained'], [1038, 'shock'], [1110, 'smile'], [1158, 'grin'], [1220, 'laugh'], [1269, 'shock'], [1296, 'smile'], [1345, 'grin'], [1467, 'proud'], [1583, 'smug'], [1630, 'grin']];
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT(f);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const step = q((f * 0.08) % 1, 2);
  // ---- Léo (pull turquoise, toujours le même) ----
  const leo = leoAt(f);
  if (leo) {
    let o = { expr: pick(EXL, f), L: 'hip', R: 'hip', look: -0.5, headTilt: -4 }, ex = { s: 0.95 };
    if (leo.hall) ex.ground = 0;
    switch (leo.mode) {
      case 'sew': o = { ...o, L: 'reach', R: 'hip', holdL: 'needle', look: -0.8 }; if (f < 79 && f % 12 < 6) ex = { ...ex, dy: 0.015 }; break;
      case 'shrug': o = { ...o, L: 'shrug', R: 'shrug', look: 0, expr: 'nervous' }; break;
      case 'ouch': o = f < 272 ? { ...o, L: 'head', R: 'hang', look: 0 } : { ...o, L: 'hang', R: 'cheek', look: -0.3 }; if (f < 272) ex = { ...ex, ...hop(f, 249, 0.1, 10) }; break;
      case 'pull': o = { ...o, L: 'reach', R: 'carry', holdL: 'needle', look: -0.8 }; ex = { ...ex, dx: 0.03 * Math.sin(f * 1.2) }; break;
      case 'torn': o = { ...o, L: 'flail', R: 'flail', wv: q(f * 0.5, 1), look: -0.8 }; ex = { ...ex, dx: f < 330 ? lerp(0, 0.18, ramp(f, 316, 330)) : 0.18 }; break;
      case 'look': o = { ...o, L: 'chin', R: 'hip', look: -0.8 }; break;
      case 'quit': o = { ...o, L: 'head', R: 'head', look: 0, headTilt: -7 }; ex = { ...ex, ...tremble(f, 0.004, 2) }; break;
      case 'walk': o = { ...o, L: 'hang', R: 'hang', run: false, step, look: 0.8 }; break;
      case 'tender': o = { ...o, L: 'hang', R: 'hang', look: 0.8, headTilt: 6 }; break;
      case 'resume': o = { ...o, L: 'reach', R: 'hip', holdL: 'needle', look: -0.8, headTilt: -3 }; break;
      case 'stitch': o = { ...o, L: 'reach', R: 'hip', holdL: 'needle', look: -0.9 }; if (f % 16 < 8) ex = { ...ex, dy: 0.012 }; break;
      case 'wait': o = { ...o, L: 'hang', R: 'hang', look: -0.4 }; break;
      case 'fists': o = { ...o, L: 'fist', R: 'fist', look: -0.3 }; ex = { ...ex, ...tremble(f, 0.003, 4) }; break;
      case 'watch': o = { ...o, L: f < 1110 ? 'fist' : 'hip', R: f < 1110 ? 'fist' : 'hip', look: -0.2 }; break;
      case 'clap': o = { ...o, L: 'up', R: 'up', look: 0 }; ex = { ...ex, dy: Math.abs(Math.sin(f * 0.5)) * 0.05 }; break;
      case 'named': o = { ...o, L: 'head', R: 'head', look: 0 }; break;
      case 'blush': o = { ...o, L: 'hip', R: 'hip', look: 0, headTilt: 5 }; break;
      case 'plaster': o = { ...o, L: 'hip', R: 'show', holdR: 'plaster', look: 0, expr: 'smile', headTilt: 4 }; break;
      case 'proud': o = { ...o, L: 'show', R: 'hip', holdL: 'needle', look: 0.2, headTilt: 5 }; break;
      case 'you': o = { ...o, L: 'hip', R: 'point', look: 0, expr: 'smug' }; break;
      case 'offer': o = { ...o, L: 'hip', R: 'show', holdR: 'needle', look: 0, expr: 'grin' }; break;
    }
    fig('leo', 6, o, leo.pos, ex);
  }
  // ---- Lila ----
  const li = lilaAt(f);
  if (li) {
    let ex = { s: 0.82 }, o = { L: 'hang', R: 'hang', look: 0, expr: 'smile' }, who = 'lila';
    switch (li.mode) {
      case 'sleep': who = 'lilaNuit'; o = { ...o, expr: 'snore', L: 'belly', R: 'belly', look: 0, headTilt: 0 }; ex = { ...ex, roll: -Math.PI / 2 + 0.05, s: 0.8, marks: false, blob: false }; break;
      case 'enter': o = { ...o, expr: 'nervous', L: 'hang', R: 'hang', step, look: -0.5, sunDroop: 1 }; break;
      case 'droop': o = { ...o, expr: 'nervous', L: 'hang', R: 'cross', look: -0.2, sunDroop: 1 }; ex = { ...ex, roll: 0.07, ...tremble(f, 0.004, 3) }; break;
      case 'shy': o = { ...o, expr: 'nervous', L: 'hang', R: 'hang', look: 0, sunDroop: 1 }; ex = { ...ex, roll: 0.06 }; break;
      case 'spin': { const k = ramp(f, 1038, 1062), sp = Math.abs(Math.cos((f - 1038) * 0.34)); o = { ...o, expr: 'laugh', L: 'up', R: 'up', look: 0, sunDroop: lerp(1, 0.2, k), sunWave: q(f * 0.3, 1) }; ex = { ...ex, ...hop(f, 1038, 0.1, 10), sx: 0.3 + 0.7 * sp, roll: 0.0, marks: false }; break; }
      case 'dance': o = { ...o, expr: 'laugh', L: 'up', R: 'up', look: 0, sunDroop: 0.1, sunWave: q(f * 0.28, 1) }; ex = { ...ex, roll: 0.07 * Math.sin(f * 0.25), dy: Math.abs(Math.sin(f * 0.22)) * 0.07, marks: false }; break;
      case 'bow': o = { ...o, expr: 'grin', L: 'wave', R: 'up', look: 0, sunDroop: 0.1, sunWave: q(f * 0.2, 1) }; ex = { ...ex, dy: Math.abs(Math.sin(f * 0.4)) * 0.05, marks: false }; break;
      case 'point': o = { ...o, expr: 'laugh', L: 'hip', R: 'point', look: 0.9, sunDroop: 0.1, sunWave: q(f * 0.2, 1) }; ex = { ...ex, dy: f >= 1290 ? Math.abs(Math.sin(f * 0.3)) * 0.04 : 0, marks: false }; break;
    }
    if (li.pos[1] > 0.7) ex.ground = 0.8;
    fig(who, 9, o, li.pos, ex);
  }
  // ---- le public (salle) ----
  if (inHall(f) && f >= 790) {
    const cheer = f >= 1220 && f < 1345 ? 1 : f >= 1345 ? 0.5 : f >= 904 && f < 960 ? 0.25 : 0;
    const exprs = f >= 1220 ? ['laugh', 'grin', 'smile'] : f >= 904 && f < 960 ? ['laugh', 'grin', 'smile'] : f >= 1038 ? ['smile', 'shock', 'grin'] : ['neutral', 'smile', 'shock'];
    const arms = f >= 1220 ? ['up', 'up', 'wave'] : f >= 904 && f < 960 ? ['hip', 'point', 'hang'] : f >= 1038 ? ['up', 'wave', 'hang'] : ['hang', 'hang', 'hip'];
    out.push(...crowd(T, f, { center: [HX, 0, 1.7], n: 14, w: 8.5, d: 2.0, outfits: ['kidA', 'mamA', 'kidB', 'papaB', 'kidC'], exprs, arms, cheer, seed: 4, s: 0.92 }).map((a) => ({ ...a, tint })));
  }
  // objets au premier plan, flous
  if (FG[S.id]) { const cam = camAt(f); out.push(fgCard(cam, T.fgProp(FG[S.id], { seed: 2 }), { key: 'fg' + S.id, side: S.id === 'pansements' ? -1 : 1, dist: 1.15, drop: 0.6, s: 0.5 })); }
  return out;
};
export const fxAt = (f, T) => [];
