// « Le palais du facteur Cheval » (histoire vraie) — 52,8 s, 30 fps, 1585 images. Cadres calés sur phrases.json / words.json (whisper).
// Village (route à z = -3, palais à z = -13). Héros : Ferdinand Cheval (facteur). Secondaires : voisin (rouge), voisine (jaune).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, fallOver, tremble, follow, orbit, transition } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1585, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 186 },       // Ce facteur a bâti un palais entier… avec la pierre qui l'a fait trébucher.
  { id: 'matin', a: 187, b: 257 },    // Un matin de mille huit cent soixante-dix-neuf,
  { id: 'bute', a: 258, b: 357 },     // Ferdinand Cheval bute sur une pierre étrange pendant sa tournée.
  { id: 'ramasse', a: 358, b: 399 },  // Il la ramasse.
  { id: 'cherche', a: 400, b: 466 },  // Le lendemain, il en cherche d'autres.
  { id: 'poches', a: 467, b: 559 },   // Bientôt, ses poches sont pleines de cailloux.
  { id: 'voisins', a: 560, b: 656 },  // Les voisins rigolent : le facteur est devenu fou.
  { id: 'nuit', a: 657, b: 743 },     // Lui continue, nuit après nuit,
  { id: 'seul', a: 744, b: 771 },     // seul,
  { id: 'lampe', a: 772, b: 795 },    // une lampe à la main.
  { id: 'empile', a: 796, b: 855 },   // Il empile,
  { id: 'colle', a: 856, b: 887 },    // il colle,
  { id: 'sculpte', a: 888, b: 934 },  // il sculpte des tours,
  { id: 'geants', a: 935, b: 991 },   // des grottes et des géants de pierre.
  { id: 'ans', a: 992, b: 1070 },     // Trente-trois ans plus tard,
  { id: 'termine', a: 1071, b: 1136 },// le palais est enfin terminé.
  { id: 'archi', a: 1137, b: 1208 },  // Aucun architecte, aucun plan,
  { id: 'tetu', a: 1209, b: 1285 },   // juste un facteur têtu.
  { id: 'annee', a: 1286, b: 1333 },  // En mille neuf cent soixante-neuf,
  { id: 'ministre', a: 1334, b: 1384 },// le ministre André Malraux le classe
  { id: 'plaque', a: 1385, b: 1452 }, // monument historique.
  { id: 'reve', a: 1453, b: 1519 },   // Alors la prochaine fois qu'on rit de ton rêve…
  { id: 'regard', a: 1520, b: 1584 }, // regarde bien la pierre qui te fait trébucher.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière : une ambiance par acte ----------
const JOUR = mood('jour', { exposure: 1.1 }), MATIN = mood('matin', { exposure: 1.15 }), DORE = mood('dore', { exposure: 1.14 });
const NUIT = mood('nuit', { exposure: 1.3, gamma: 1.4 }), LAMPE = mood('lampe', { exposure: 1.25, gamma: 1.4 }), SOIR = mood('soir', { exposure: 1.12 }), FROID = mood('froid', { exposure: 1.1 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'hook': return JOUR;
    case 'matin': case 'bute': case 'ramasse': return MATIN;
    case 'nuit': return blendMood(JOUR, NUIT, ramp(f, 657, 680));
    case 'seul': return NUIT;
    case 'lampe': case 'empile': case 'colle': return blendMood(NUIT, LAMPE, ramp(f, 772, 800));
    case 'sculpte': return LAMPE;
    case 'geants': return blendMood(LAMPE, MATIN, ramp(f, 935, 975));
    case 'ans': return f < 1020 ? blendMood(MATIN, SOIR, ramp(f, 992, 1018)) : blendMood(SOIR, FROID, ramp(f, 1020, 1046));
    case 'termine': return blendMood(FROID, DORE, ramp(f, 1071, 1100));
    case 'archi': case 'tetu': return DORE;
    case 'plaque': return DORE;
    default: return JOUR;
  }
};
const TINT = { nuit: '#d6defa', seul: '#d6defa', lampe: '#ffe2b8', empile: '#ffe2b8', colle: '#ffe2b8', sculpte: '#ffe2b8', ans: '#fff8ee', archi: '#fff0d4', tetu: '#fff0d4', termine: '#fff0d4', plaque: '#fff0d4' };
const tintOf = (S) => TINT[S.id] || '#fff8ee';

// ---------- positions ----------
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ROAD = -3;
const HP = (f) => {   // position du facteur
  if (f < 187) return [lerp(-5, 0.0, ramp(f, 0, 137)), 0, ROAD];
  if (f < 358) return [lerp(-4.4, -0.2, ramp(f, 187, 278)), 0, ROAD];
  if (f < 400) return [0.1, 0, ROAD];
  if (f < 467) return [lerp(-8.4, -3.8, ramp(f, 400, 466)), 0, ROAD];
  if (f < 560) return [-2.0, 0, -4.2];
  if (f < 657) return [0.0, 0, -2.7];
  if (f < 744) return [lerp(-7.2, -3.0, ramp(f, 657, 743)), 0, -3.2];
  if (f < 796) return [-1.6, 0, -4.6];
  if (f < 856) return [-0.6, 0, -8.8];
  if (f < 888) return [0.2, 0, -8.9];
  if (f < 935) return [1.2, 0, -8.9];
  if (f < 992) return [-3.8, 0, -8.6];
  if (f < 1071) return [-2.2, 0, -8.4];
  if (f < 1137) return [-1.2, 0, -8.0];
  if (f < 1209) return [-1.6, 0, -7.6];
  return [-0.8, 0, -7.6];
};
const palAt = (f) => (f < 796 ? 0 : f < 856 ? lerp(0, 0.14, ramp(f, 796, 855)) : f < 888 ? lerp(0.14, 0.3, ramp(f, 856, 887)) : f < 935 ? lerp(0.3, 0.52, ramp(f, 888, 934)) : f < 992 ? lerp(0.52, 0.9, ramp(f, 935, 991)) : f < 1071 ? lerp(0.9, 1, ramp(f, 992, 1070)) : 1);
const stoneAt = (f) => {   // la pierre étrange : posée sur la route, brille, vole quand le facteur bute
  const rest = (x, glow = 1) => ({ vis: true, x, y: 0, z: -2.9, rx: 0, ry: 0.4, rz: 0, glow });
  if (f < 187) { if (f < 137) return rest(0.9); const u = clamp((f - 137) / 24); return { vis: true, x: lerp(0.9, 2.5, u), y: 4 * 1.5 * u * (1 - u), z: -2.9, rx: u * 9, ry: 0.4 + u * 6, rz: u * 4, glow: 1 }; }
  if (f < 258) return { vis: f >= 232, x: 0.0, y: 0, z: -2.9, rx: 0, ry: 0.4, rz: 0, glow: 1 };
  if (f < 358) { if (f < 278) return rest(0.0); const u = clamp((f - 278) / 26); return { vis: true, x: lerp(0.0, 1.7, u), y: 4 * 1.4 * u * (1 - u), z: -2.9, rx: u * 8, ry: 0.4 + u * 5, rz: u * 3, glow: 1 }; }
  if (f >= 1500) return { vis: true, x: 0.5, y: 0, z: -2.6, rx: 0, ry: 0.5, rz: 0, glow: 1 };
  return { vis: false };
};

// ---------- état du monde ----------
export const worldAt = (f) => {
  const S = shotAt(f), h = HP(f), W = { pal: palAt(f), stone: stoneAt(f), barrow: { vis: false }, pile: 0, road: null, signA: 0, signB: 0, win: 0, plaque: 0 };
  switch (S.id) {
    case 'hook': W.pal = f < 4 ? 1 : 1; break;
    case 'matin': W.signA = 1; break;
    case 'bute': W.signA = 1; break;
    case 'cherche': W.road = h[0] - 0.2; break;
    case 'poches': W.road = 99; W.pile = clamp(ramp(f, 467, 559) * 0.5); W.barrow = { vis: true, x: lerp(-8, -1.3, E.smooth(ramp(f, 480, 520))), z: -3.2, ry: 0, n: f > 515 ? 4 : 0 }; break;
    case 'voisins': W.road = 99; W.pile = 0.5; W.win = 0; break;
    case 'nuit': W.road = 99; W.pile = 0.5; W.win = 0.9; W.barrow = { vis: true, x: h[0] + 1.25, z: h[2], ry: 0, n: 4 }; break;
    case 'seul': W.road = 99; W.pile = 0.6; W.win = 0.05; break;
    case 'lampe': W.road = 99; W.pile = 0.7; W.win = 0.05; break;
    case 'empile': case 'colle': case 'sculpte': W.road = 99; W.pile = 0.7 - 0.2 * ramp(f, 796, 934); W.win = 0.05; break;
    case 'geants': W.road = 99; W.win = 0.0; break;
    case 'annee': case 'ministre': W.signB = 1; W.win = 0; break;
    case 'plaque': W.signB = 1; W.plaque = f >= 1388 ? 1 : 0; break;
    case 'reve': W.road = 99; W.pal = 0; break;
    case 'regard': W.road = 99; W.pal = 0; break;
  }
  if (S.id === 'annee' || S.id === 'ministre' || S.id === 'plaque') W.pal = 1;
  return W;
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const hk = (f, o = {}) => frameOn(HP(f), { headW: 0.3, ...o });
const baseCam = (f) => {
  const S = shotAt(f), h = HP(f);
  switch (S.id) {
    case 'hook': return camFromKeys([
      { f: 0, ...frameOn([-5.0, 0, ROAD], { headW: 0.3, yaw: 10, frameY: 0.4 }) }, { f: 30, ...frameOn([-3.9, 0, ROAD], { headW: 0.26, yaw: 6, frameY: 0.42 }) },
      R(80, [-1.0, 5.0, 11], [-1.0, 4.2, -13], 52), R(104, [0.2, 0.9, 0.5], [1.1, 0.5, -2.9], 38), R(124, [0.5, 0.7, -0.4], [0.9, 0.45, -2.9], 34),
      { f: 134, ...frameOn([0.5, 0, ROAD], { headW: 0.26, yaw: 0, frameY: 0.45 }) }, { f: 186, ...frameOn([0.8, 0, ROAD], { headW: 0.3, yaw: -4, frameY: 0.5 }) }], f, { creep: 0.0006 });
    case 'matin': return camFromKeys([K(187, [-3.3, 0, ROAD], { headW: 0.22, yaw: 6, frameY: 0.42 }), K(257, [-1.4, 0, ROAD], { headW: 0.26, yaw: -4, frameY: 0.42 })], f);
    case 'bute': { const c = camFromKeys([K(258, [-1.0, 0, ROAD], { headW: 0.24, yaw: 8, frameY: 0.42 }), K(290, [0.5, 0, ROAD], { headW: 0.26, yaw: -4, frameY: 0.4 }), R(304, [1.3, 0.8, -0.3], [1.5, 0.4, -2.9], 34), R(357, [1.4, 0.7, -0.6], [1.7, 0.4, -2.9], 32)], f); return shake(c, f, 280, 0.08, 10); }
    case 'ramasse': return camFromKeys([K(358, h, { headW: 0.3, yaw: 8, frameY: 0.42 }), K(399, h, { headW: 0.38, yaw: -4, frameY: 0.44 })], f);
    case 'cherche': return follow((g) => HP(g), f, { headW: 0.3, yaw: -14, lag: 6, lead: 0.5 });
    case 'poches': return camFromKeys([K(467, [-1.8, 0, -3.8], { headW: 0.27, yaw: 10, frameY: 0.42 }), K(559, [-1.6, 0, -3.8], { headW: 0.27, yaw: -8, frameY: 0.42 })], f);
    case 'voisins': return shake(camFromKeys([K(560, [0, 0, -2.2], { headW: 0.2, yaw: 6, frameY: 0.43 }), K(656, [0, 0, -2.2], { headW: 0.23, yaw: -6, frameY: 0.43 })], f), f, 600, 0.04, 10);
    case 'nuit': return follow((g) => HP(g), f, { headW: 0.27, yaw: -14, lag: 7, lead: 0.7 });
    case 'seul': return camFromKeys([R(744, [-1.4, 1.5, 3.2], [-1.6, 1.4, -4.6], 44), R(771, [0.6, 4.6, 10.5], [-1.6, 2.6, -6.0], 52)], f);
    case 'lampe': return camFromKeys([K(772, h, { headW: 0.28, yaw: 12, frameY: 0.42 }), K(795, h, { headW: 0.38, yaw: -3, frameY: 0.43 })], f);
    case 'empile': return camFromKeys([K(796, [-0.2, 0, -8.8], { headW: 0.26, yaw: 6, frameY: 0.42 }), K(855, [-0.2, 0, -8.8], { headW: 0.3, yaw: -6, frameY: 0.42 })], f);
    case 'colle': return camFromKeys([K(856, h, { headW: 0.32, yaw: 10, frameY: 0.43 }), K(887, h, { headW: 0.36, yaw: 0, frameY: 0.44 })], f);
    case 'sculpte': { let c = camFromKeys([K(888, h, { headW: 0.3, yaw: -8, frameY: 0.42 }), K(934, h, { headW: 0.36, yaw: 6, frameY: 0.44 })], f); for (const s of [898, 910, 922]) c = shake(c, f, s, 0.05, 8); return c; }
    case 'geants': return orbit([0, 0, -9], f, 935, { r: 15, h: 4.2, speed: 22, start: -14, fov: 46, lookUp: 2.6 });
    case 'ans': return camFromKeys([K(992, h, { headW: 0.24, yaw: 14, frameY: 0.42 }), K(1070, h, { headW: 0.32, yaw: -6, frameY: 0.43 })], f);
    case 'termine': return camFromKeys([K(1071, h, { headW: 0.3, yaw: 4, frameY: 0.42 }), R(1105, [2.0, 3.0, 4.0], [0, 3.2, -11], 50), R(1136, [3.5, 6.2, 12], [0, 4.8, -12], 54)], f);
    case 'archi': return camFromKeys([K(1137, h, { headW: 0.3, yaw: 10, frameY: 0.42 }), K(1208, h, { headW: 0.34, yaw: -6, frameY: 0.43 })], f);
    case 'tetu': return camFromKeys([K(1209, h, { headW: 0.34, yaw: 6, frameY: 0.43 }), K(1285, h, { headW: 0.4, yaw: -4, frameY: 0.44 })], f);
    case 'annee': return camFromKeys([R(1286, [4.0, 3.2, 6.2], [4.2, 1.8, -7.0], 48), K(1333, [4.6, 0, -6.2], { headW: 0.18, yaw: -6, frameY: 0.42 })], f);
    case 'ministre': return camFromKeys([K(1334, [3.2, 0, -6.8], { headW: 0.3, yaw: 8, frameY: 0.42 }), K(1384, [3.2, 0, -6.8], { headW: 0.38, yaw: -4, frameY: 0.44 })], f);
    case 'plaque': return shake(camFromKeys([R(1385, [3.0, 3.2, 1.5], [2.0, 3.6, -11], 50), R(1425, [0.5, 3.6, 2.0], [1.6, 3.8, -11.5], 50), R(1452, [-3.0, 5.6, 8.0], [0, 4.2, -11], 54)], f), f, 1388, 0.05, 10);
    case 'reve': return camFromKeys([K(1453, [0, 0, -2.4], { headW: 0.22, yaw: 6, frameY: 0.43 }), K(1519, [0, 0, -2.4], { headW: 0.25, yaw: -6, frameY: 0.43 })], f);
    case 'regard': return camFromKeys([K(1520, [-0.4, 0, -2.6], { headW: 0.27, yaw: 4, frameY: 0.4 }), K(1554, [-0.2, 0, -2.6], { headW: 0.3, yaw: 0, frameY: 0.4 }), R(1584, [0.2, 0.62, -0.5], [0.5, 0.3, -2.6], 32)], f, { creep: 0.0006 });
  }
  return hk(f);
};
const TR = [{ a: 187, type: 'whip', dir: 1 }, { a: 400, type: 'whip', dir: -1 }, { a: 657, type: 'drop' }, { a: 796, type: 'push' }, { a: 1071, type: 'rise' }, { a: 1286, type: 'whip', dir: 1 }, { a: 1453, type: 'whip', dir: -1 }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
const SUN = (x, z, a = 0.28) => ({ at: [x - 2.2, 5.2, z - 1.6], yaw: 0, pitch: 0.95, len: 6, r: 1.1, col: '#fff2c8', a });
export const envAt = (f) => {
  const S = shotAt(f), st = stoneAt(f), h = HP(f), glint = (f0, f1, at = [st.x, 0.5, st.z]) => ({ at, f0, f1, rate: 14, col: '#fff4b0', speed: 0.7, size: 1 });
  const lamp = (extra = {}) => ({ at: [h[0] + 0.5, 3.2, h[2] + 0.3], yaw: 0, pitch: 1.35, len: 4, r: 1.4, col: '#ffd890', a: 0.3, ...extra });
  switch (S.id) {
    case 'hook': return { motes: 0.5, beams: [SUN(st.x, st.z, 0.3)], sparks: [glint(86, 186), ...(f >= 137 && f < 143 ? [{ at: [0.8, 0.3, -2.9], f0: 137, f1: 143, rate: 60, col: '#ffe9a0', speed: 2.4 }] : [])] };
    case 'matin': return { motes: 0.7 };
    case 'bute': return { motes: 0.7, beams: f >= 296 ? [SUN(st.x, st.z, 0.3)] : [], sparks: [...(f >= 278 && f < 284 ? [{ at: [0.0, 0.3, -2.9], f0: 278, f1: 284, rate: 60, col: '#ffe9a0', speed: 2.4 }] : []), ...(f >= 296 ? [glint(296, 357, [1.7, 0.5, -2.9])] : [])] };
    case 'ramasse': return { motes: 0.9, sparks: [{ at: [h[0] + 0.55, 1.1, h[2] + 0.2], f0: 362, f1: 399, rate: 22, col: '#fff4b0', speed: 1.0, size: 1.3 }] };
    case 'cherche': return { motes: 0.5 };
    case 'poches': return { motes: 0.6, smoke: [{ at: [-3.4, 0.6, -6.2], f0: 467, f1: 559, rate: 3, size: 0.3, col: '#d8c6a0', rise: 0.2 }] };
    case 'voisins': return { motes: 0.5 };
    case 'nuit': return { motes: 0.5, beams: [lamp()] };
    case 'seul': return { motes: 0.6, beams: [lamp({ a: 0.2 })] };
    case 'lampe': return { motes: 0.9, beams: [lamp({ a: 0.34 })], sparks: [{ at: [h[0] + 0.5, 1.1, h[2] + 0.2], f0: 772, f1: 795, rate: 10, col: '#ffe08a', speed: 0.6, size: 1.2 }] };
    case 'empile': return { motes: 0.8, beams: [lamp()], smoke: [{ at: [h[0], 0.6, h[2] - 0.7], f0: 796, f1: 855, rate: 5, size: 0.3, col: '#d8c6a0', rise: 0.3 }] };
    case 'colle': return { motes: 0.8, beams: [lamp()] };
    case 'sculpte': return { motes: 0.8, beams: [lamp()], sparks: [898, 910, 922].map((f0) => ({ at: [h[0] + 0.7, 1.2, h[2] - 0.2], f0, f1: f0 + 4, rate: 70, col: '#ffe08a', speed: 2.6 })) };
    case 'geants': return { motes: 0.8, smoke: [0, 1, 2].map((i) => ({ at: [-4.2 + i * 4.2, 0.3, -10.6], f0: 950 + i * 8, f1: 962 + i * 8, rate: 40, size: 0.5, col: '#e0d0b0', rise: 0.4 })) };
    case 'ans': return { motes: 0.5, snow: ramp(f, 1020, 1034) * 0.9, wind: [0.6, 0] };
    case 'termine': return { motes: 0.9, snow: 0.9 * (1 - ramp(f, 1071, 1084)), beams: f > 1085 ? [{ at: [-4, 9, -6], yaw: 0, pitch: 0.9, len: 12, r: 2.2, col: '#ffd8a0', a: 0.26 * ramp(f, 1085, 1110) }] : [], sparks: [{ at: [-1.2, 3.2, -9.5], f0: 1099, f1: 1130, rate: 14, col: '#ffd23a', speed: 2.2, size: 0.5 }] };
    case 'archi': return { motes: 0.8, beams: [{ at: [-5, 9, -6], yaw: 0, pitch: 0.9, len: 12, r: 2.2, col: '#ffd8a0', a: 0.24 }] };
    case 'tetu': return { motes: 0.9 };
    case 'annee': case 'ministre': return { motes: 0.6 };
    case 'plaque': return { motes: 0.9, sparks: [{ at: [2.6, 4.6, -11.2], f0: 1388, f1: 1425, rate: 22, col: '#ffd23a', speed: 2, size: 0.8 }] };
    case 'reve': return { motes: 0.5 };
    case 'regard': return { motes: 0.7, beams: [SUN(0.5, -2.6, 0.32)], sparks: [glint(1500, 1584, [0.5, 0.5, -2.6])] };
  }
  return { motes: 0.5 };
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.cheval = { tunic: '#2f5aa8', skin: '#e2b088', hat: 'kepi', hatCol: '#26407e', hatBand: '#c8312c', moustache: '#4a2e1c', brows: '#3a2418', strap: '#7a4a28', stout: true };
  O.chevalOld = { ...O.cheval, moustache: '#ece8e0', brows: '#cfc9bf' };
  O.voisin = { tunic: '#c8312c', skin: '#d9a47c', cap: '#3a2a24', moustache: '#2a1a14', brows: '#2a1a14' };
  O.voisine = { tunic: '#e8b81c', dress: '#e8b81c', skin: '#f0c8a0', hair: '#7a3a1a', scarf: '#c8312c', brows: '#4a2a18' };
  O.mini = { tunic: '#3a3f4c', skin: '#e8b890', hair: '#8d8d94', glasses: true, bowtie: '#c8312c', brows: '#5a5a60' };
  O.v1 = { tunic: '#18b8d8', skin: '#b98a62', hair: '#2a1e1a', moustache: '#2a1e1a', brows: '#2a1e1a' };
  O.v2 = { tunic: '#e8782a', skin: '#7a4a30', hair: '#1e1714', brows: '#1e1714', stout: true };
  O.v3 = { tunic: '#7a3aa8', dress: '#7a3aa8', skin: '#f3cfae', hair: '#4a2a1a', brows: '#3a2418' };
  O.enfant = { tunic: '#2cb67d', skin: '#c89468', hair: '#2a1e1a', brows: '#2a1e1a' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1, rot = 0, cross = false) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 555, size, fill, 0);
  if (cross) { g.strokeStyle = '#d8281f'; g.lineWidth = 26; g.lineCap = 'round'; const kk = clamp((k - 0.5) * 2.4); g.beginPath(); g.moveTo(60, 440); g.lineTo(60 + 480 * kk, 440 + 160 * kk); g.stroke(); if (kk > 0.99) { g.beginPath(); g.moveTo(540, 440); g.lineTo(60, 600); g.stroke(); } }
  g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const stepOf = (f, f0, f1, k = 0.07) => (f > f0 && f < f1 ? { step: q((f * k) % 1, 2) } : {});
const walkBob = (f, f0, f1) => (f > f0 && f < f1 ? { dy: Math.abs(Math.sin(f * 0.23)) * 0.02 } : {});
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S), h = HP(f);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const hero = (o, ex = {}, who = 'cheval') => fig(who, 4, o, h, ex);
  switch (S.id) {
    case 'hook': { const fl = fallOver(f, 137, 1, 11), down = f >= 137, wk = f < 137; const star = f >= 150;
      hero({ expr: down ? (star ? 'dazed' : 'shock') : 'grin', L: down ? 'flail' : 'hip', R: 'hip', look: 0.8, wv: q(f * 0.5, 1), ...(wk ? { step: q((f * 0.07) % 1, 2) } : {}) }, { ...(down ? fl : walkBob(f, 0, 137)), ...(down ? { dx: 0.35 } : {}) }); break; }
    case 'matin': hero({ expr: 'smile', L: 'hang', R: 'hang', look: 0.4, ...stepOf(f, 187, 258) }, walkBob(f, 187, 258)); break;
    case 'bute': { const down = f >= 278, fl = fallOver(f, 278, 1, 11), up = f >= 316, getUp = ramp(f, 316, 340);
      if (down && !up) hero({ expr: f < 292 ? 'shock' : 'dazed', L: 'flail', R: 'hang', look: 0.8, wv: q(f * 0.5, 1) }, { ...fl, dx: 0.35 });
      else if (up) hero({ expr: 'squint', L: 'hip', R: 'reach', look: 0.9 }, { dx: 0.15, roll: -1.45 * (1 - E.smooth(getUp)), dy: 0 });
      else hero({ expr: 'smile', L: 'hang', R: 'hang', look: 0.4, ...stepOf(f, 258, 278) }, walkBob(f, 258, 278)); break; }
    case 'ramasse': hero({ expr: f < 372 ? 'squint' : 'grin', L: 'hip', R: 'lift', holdR: 'stone', look: 0.1 }, { ...(f >= 366 && f < 380 ? { dy: hop(f, 366, 0.1, 6).dy } : {}) }); break;
    case 'cherche': { const dip = (f % 24) < 10 ? Math.sin(((f % 24) / 10) * Math.PI) : 0;
      hero({ expr: 'squint', L: dip > 0.3 ? 'reach' : 'hip', R: 'lift', holdR: 'stone', look: -0.3, ...stepOf(f, 400, 466, 0.09) }, { roll: dip * 0.09, dy: Math.abs(Math.sin(f * 0.3)) * 0.02 }); break; }
    case 'poches': hero({ expr: f < 500 ? 'grin' : 'laugh', L: 'lift', holdL: 'stone', R: 'lift', holdR: 'stone', look: 0.5 }, { dy: Math.abs(Math.sin(f * 0.2)) * 0.015 }); break;
    case 'voisins': { const lau = Math.sin(f * 0.55), fou = f >= 599;
      fig('voisine', 20, { expr: 'laugh', L: 'up', R: 'hip', look: 0.7 }, [-1.5, 0, -2.5], { dy: Math.abs(lau) * 0.05, roll: lau * 0.05 });
      fig('voisin', 22, { expr: 'laugh', L: 'hip', R: fou ? 'temple' : 'point', look: -0.7, wv: q(f * 0.5, 1) }, [1.35, 0, -2.5], { dy: Math.abs(Math.sin(f * 0.55 + 1)) * 0.05, roll: Math.sin(f * 0.55 + 1) * 0.05 });
      hero({ expr: 'stubborn', L: 'hip', R: 'lift', holdR: 'stone', look: 0.1 }, { ...tremble(f, 0.004, 3), marks: false }); break; }
    case 'nuit': hero({ expr: 'stubborn', L: 'lift', holdL: 'lantern', R: 'push', look: 0.3, ...stepOf(f, 657, 743, 0.05) }, { dy: Math.abs(Math.sin(f * 0.17)) * 0.015, marks: false }); break;
    case 'seul': hero({ expr: 'stubborn', L: 'lift', holdL: 'lantern', R: 'hip', look: -0.4 }, { marks: false }); break;
    case 'lampe': hero({ expr: 'grin', L: 'lift', holdL: 'lantern', R: 'hip', look: 0.6 }, { marks: false, dy: Math.sin(f * 0.15) * 0.008 }); break;
    case 'empile': { const put = Math.sin(((f - 796) % 20) / 20 * Math.PI);
      hero({ expr: 'stubborn', L: 'carry', R: 'reach', holdL: 'stone', look: 0.4, lift: put * 0.1 }, { roll: put * 0.04, marks: false }); break; }
    case 'colle': { const sw = Math.sin(f * 0.4);
      hero({ expr: 'grin', L: 'hip', R: 'lift', holdR: 'tool', look: 0.5, wv: q(sw, 2) }, { roll: sw * 0.03, marks: false }); break; }
    case 'sculpte': { const hit = [898, 910, 922].some((s) => f >= s && f < s + 5);
      hero({ expr: hit ? 'pained' : 'stubborn', L: 'hip', R: hit ? 'up' : 'lift', holdR: 'tool', look: 0.6 }, { marks: false, dx: hit ? 0.05 : 0 }); break; }
    case 'geants': hero({ expr: 'grin', L: 'up', R: 'hip', look: 0.2 }, { marks: false, ...hop(f, 975, 0.2, 8) }); break;
    case 'ans': { const old = f >= 1036; hero({ expr: old ? 'smile' : 'grin', L: 'hip', R: 'lift', holdR: 'tool', look: 0.5 }, { marks: false, dy: Math.sin(f * 0.1) * 0.006 }, old ? 'chevalOld' : 'cheval'); break; }
    case 'termine': { const k = hop(f, 1099, 0.35, 12); hero({ expr: f >= 1099 ? 'laugh' : 'smile', L: f >= 1090 ? 'up' : 'hip', R: f >= 1090 ? 'up' : 'lift', holdR: f >= 1090 ? undefined : 'tool', look: 0.1 }, { marks: false, ...(f >= 1099 ? k : {}) }, 'chevalOld'); break; }
    case 'archi': { const lose = f >= 1182;
      hero({ expr: f < 1176 ? 'squint' : 'stubborn', L: 'hip', R: lose ? 'point' : 'lift', holdR: lose ? undefined : 'paper', look: 0.7 }, { marks: f < 1150 ? false : undefined }, 'chevalOld'); break; }
    case 'tetu': { const k = hop(f, 1243, 0.12, 8); hero({ expr: f < 1243 ? 'stubborn' : 'grin', L: 'hip', R: 'hip', look: 0.1 }, { marks: false, ...(f >= 1243 ? k : {}) }, 'chevalOld'); break; }
    case 'annee': { const w = (x, z, who, seed, ex = {}) => fig(who, seed, { expr: 'smile', L: 'hang', R: 'lift', look: -0.6, ...ex }, [x, 0, z]);
      w(3.6, -6.3, 'v1', 40, { L: 'up' }); w(4.9, -6.6, 'v3', 41, { expr: 'grin' }); w(6.2, -6.2, 'v2', 42, { R: 'point' }); w(2.5, -6.8, 'enfant', 43, { expr: 'shock', R: 'up' }); break; }
    case 'ministre': { const stamp = f >= 1376 && f < 1384, ex = f >= 1378 && f < 1384 ? { dy: -0.02 } : {};
      fig('mini', 50, { expr: f < 1376 ? 'stern' : 'smile', L: 'hip', R: 'lift', holdR: 'letter', look: 0.3 }, [3.2, 0, -6.8], ex);
      fig('v1', 40, { expr: 'smile', L: 'hang', R: 'hang', look: -0.8 }, [5.0, 0, -7.4]); fig('v3', 41, { expr: 'smile', L: 'hang', R: 'hang', look: -0.8 }, [1.8, 0, -7.6]); void stamp; break; }
    case 'plaque': { const cheer = Math.sin(f * 0.45), c2 = f >= 1388;
      fig('mini', 50, { expr: 'smile', L: 'hip', R: 'point', look: -0.2 }, [0.4, 0, -5.8]);
      fig('v1', 40, { expr: c2 ? 'laugh' : 'smile', L: c2 ? 'up' : 'hang', R: c2 ? 'up' : 'hang', look: 0.2 }, [-1.5, 0, -5.4], c2 ? { dy: Math.abs(cheer) * 0.06 } : {});
      fig('v3', 41, { expr: c2 ? 'laugh' : 'smile', L: c2 ? 'up' : 'hang', R: c2 ? 'up' : 'hang', look: -0.2, mark: c2 ? 'heart' : undefined }, [2.5, 0, -5.4], c2 ? { dy: Math.abs(Math.sin(f * 0.45 + 1)) * 0.06 } : {});
      fig('v2', 42, { expr: c2 ? 'grin' : 'smile', L: c2 ? 'up' : 'hip', R: c2 ? 'up' : 'hip', look: 0 }, [-3.2, 0, -5.8], c2 ? { dy: Math.abs(Math.sin(f * 0.45 + 2)) * 0.06 } : {});
      fig('enfant', 43, { expr: 'laugh', L: 'up', R: 'up', look: 0 }, [1.5, 0, -5.0], { s: 0.7, ...(c2 ? { dy: Math.abs(Math.sin(f * 0.6)) * 0.08 } : {}) }); break; }
    case 'reve': { const lau = Math.sin(f * 0.55);
      fig('enfant', 43, { expr: 'grin', L: 'hip', R: 'lift', holdR: 'paper', look: 0.2 }, [0.0, 0, -2.4], { s: 0.8 });
      fig('voisin', 22, { expr: 'laugh', L: 'up', R: 'point', look: -0.5, wv: q(f * 0.5, 1) }, [-1.4, 0, -2.6], { dy: Math.abs(lau) * 0.05, roll: lau * 0.05 });
      fig('voisine', 20, { expr: 'laugh', L: 'hip', R: 'up', look: 0.5 }, [1.4, 0, -2.6], { dy: Math.abs(Math.sin(f * 0.55 + 1)) * 0.05, roll: Math.sin(f * 0.55 + 1) * 0.05 }); break; }
    case 'regard': { const x = lerp(-1.2, -0.2, E.smooth(ramp(f, 1520, 1545))), look = f >= 1548, shk = f >= 1554;
      fig('enfant', 43, { expr: !look ? 'smile' : (f < 1562 ? 'shock' : 'grin'), L: look ? 'up' : 'hang', R: 'hang', look: look ? 0.8 : 0.2, ...stepOf(f, 1520, 1545, 0.07) }, [x, 0, -2.6], { s: 0.9, ...(shk && f < 1570 ? hop(f, 1554, 0.12, 8) : {}) }); break; }
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], h = HP(f);
  if (S.id === 'bute' && f >= 262 && f < 318) { const k = ramp(f, 262, 274) * (1 - ramp(f, 306, 318)); out.push(FX('nm' + q(k, 1), labelCard('Ferdinand Cheval', 56, '#ffd23a', INK, k, -0.05), [h[0] + 0.1, 2.75, h[2]], 0.5)); }
  if (S.id === 'ramasse' && f >= 362 && f < 392) { const t = q((f - 362) / 30, 2); out.push(FX('rb' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [h[0] + 0.55, 1.2, h[2] + 0.05], 0.9)); }
  if (S.id === 'voisins' && f >= 602) { const k = ramp(f, 602, 612) * (1 - ramp(f, 646, 656)); out.push(FX('fo' + q(k, 1), labelCard('FOU !', 130, '#ffffff', '#c8312c', k, 0.06), [1.1, 2.7, -2.5], 0.55)); }
  if (S.id === 'ans' && f >= 1036) { const k = ramp(f, 1036, 1050) * (1 - ramp(f, 1062, 1070)); out.push(FX('an' + q(k, 1), labelCard('33 ANS', 150, '#ffd23a', INK, k, -0.05), [h[0] + 0.2, 2.7, h[2] + 0.2], 0.62)); }
  if (S.id === 'archi') { if (f >= 1146) { const k = ramp(f, 1146, 1160); out.push(FX('ar' + q(k, 1), labelCard('ARCHITECTE', 76, '#ffffff', '#3f9ad8', k, -0.05, true), [h[0] - 0.1, 2.9, h[2] + 0.1], 0.6)); }
    if (f >= 1182) { const k = ramp(f, 1182, 1194); out.push(FX('pl' + q(k, 1), labelCard('PLAN', 130, '#ffffff', '#2f56a8', k, 0.06, true), [h[0] + 1.0, 2.2, h[2] + 0.1], 0.55)); } }
  if (S.id === 'annee' && f >= 1318) { const k = ramp(f, 1318, 1330); out.push(FX('y9' + q(k, 1), labelCard('1969', 160, '#ffd23a', INK, k, -0.05), [4.4, 3.0, -6.4], 0.65)); }
  if (S.id === 'ministre') { if (f >= 1344 && f < 1376) { const k = ramp(f, 1344, 1354) * (1 - ramp(f, 1368, 1376)); out.push(FX('mi' + q(k, 1), labelCard('LE MINISTRE', 62, '#ffffff', '#3a3f4c', k, -0.05), [3.4, 2.75, -6.8], 0.5)); }
    if (f >= 1378) { const k = ramp(f, 1378, 1386); out.push(FX('cl' + q(k, 1), labelCard('CLASSÉ !', 110, '#ffffff', '#c8312c', k, 0.1), [3.0, 2.5, -6.7], 0.6)); } }
  if (S.id === 'plaque' && f >= 1388 && f < 1400) { const t = q((f - 1388) / 12, 2); out.push(FX('pq' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [2.6, 4.6, -11.0], 2.4)); }
  return out;
};
