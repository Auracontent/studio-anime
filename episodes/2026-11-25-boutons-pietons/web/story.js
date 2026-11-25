// « Le bouton piéton qui ne fait rien » — 122,1 s, 30 fps, 3664 images. Cadres calés sur phrases.json (whisper).
// Carrefour new-yorkais (library/carrefour.js) : avenue z -5.5..5.5, poteaux à bouton P1 (-4.9, 0, 6.2) et P2 (4.9, 0, 6.2), trottoir proche z > 5.5.
// Campus au soleil (x = 300), poteau ouvert en coupe (x = 5000). Héroïne : Inès (manteau rouge). Secondaires : Léon (gilet moutarde), Marc (technicien orange).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, follow, transition, crane, crowd, fgCard, popIn, orbit, tremble, fallOver } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 3664, DECK = 0;
const CX = 5000, CAMP = 300;
const LIST = [['hook', 0], ['ny', 148], ['arrive', 240], ['appuie', 302], ['fois', 343], ['pied', 430], ['vert', 468], ['traverse', 527], ['sauf', 618], ['auto', 683],
  ['comprendre', 758], ['nyrow', 846], ['poser', 886], ['presse', 960], ['debut', 1013], ['cycles', 1058], ['fixe1', 1115], ['fixe2', 1160], ['alors', 1213], ['debr', 1256],
  ['laisse', 1328], ['pourquoi', 1380], ['arrache', 1402], ['rebouche', 1447], ['remet', 1478], ['cher', 1520], ['milliers', 1557], ['laisses', 1632], ['plaque', 1706],
  ['res', 1776], ['sur', 1827], ['moins', 1879], ['eteints', 1957], ['etonnant', 2034], ['penses', 2095], ['pastout', 2183], ['cherch1', 2220], ['cherch2', 2290], ['observe', 2355],
  ['constat', 2428], ['att1', 2464], ['att2', 2530], ['rien', 2610], ['change', 2665], ['illusion', 2742], ['sentiment', 2828], ['attente', 2878], ['attention', 2960],
  ['marchent', 3066], ['nuit', 3106], ['demande', 3134], ['la', 3230], ['prochaine', 3326], ['doigt', 3414], ['souviens', 3444], ['rienfait', 3526], ['attendu', 3592]];
export const SHOTS = LIST.map(([id, a], i) => ({ id, a, b: i + 1 < LIST.length ? LIST[i + 1][1] - 1 : TOTAL - 1 }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const hash = (i, k, seed = 1) => { const x = Math.sin((i + 1) * 12.9898 * (k + 1) + seed * 78.233) * 43758.5453; return x - Math.floor(x); };
const ZONE = (id) => (['comprendre', 'cycles', 'alors', 'debr', 'laisse'].includes(id) ? 'D' : ['etonnant', 'penses', 'pastout', 'cherch1', 'cherch2', 'observe', 'constat', 'att1', 'att2', 'rien', 'change', 'illusion', 'sentiment', 'attente', 'attention'].includes(id) ? 'C' : 'A');

// ---------- feux : le bonhomme est vert dans ces fenêtres ; les voitures s'arrêtent 12 images avant ----------
const WIN = [[498, 640], [698, 772], [975, 1010], [1030, 1056], [1134, 1158], [1192, 1222], [2000, 2030], [3188, 3262], [3552, 3590]];
const walkOn = (f) => WIN.some(([a, b]) => f >= a && f < b);
const hold = (f) => WIN.some(([a, b]) => f >= a - 12 && f < b);
// simulation des voitures (déterministe, calculée une fois)
const CARS = (() => {
  const N = 10, LIM = 95, VMAX = 0.17, GAP = 5.6, st = [], out = [];
  for (let i = 0; i < N; i++) { const dir = i % 2 ? -1 : 1, k = Math.floor(i / 2); st.push({ dir, z: dir > 0 ? 2.4 : -2.4, x: dir * (-72 + k * 31 + (i % 3) * 5), v: VMAX * (0.8 + 0.2 * hash(i, 1)), i }); }
  for (let f = 0; f < TOTAL + 2; f++) {
    out.push(st.map((c) => ({ x: c.x, z: c.z, dir: c.dir, i: c.i })));
    for (const c of st) {
      let vt = VMAX;
      if (hold(f)) { const stopX = c.dir > 0 ? -7.6 : 7.6, dist = c.dir > 0 ? stopX - c.x : c.x - stopX; if (dist > -0.3) vt = Math.min(vt, Math.max(0, dist * 0.09)); }
      for (const o of st) if (o !== c && o.dir === c.dir) { const gap = (o.x - c.x) * c.dir; if (gap > 0 && gap < 16) vt = Math.min(vt, Math.max(0, (gap - GAP) * 0.09)); }
      c.v += clamp(vt - c.v, -0.012, 0.006); c.x += c.dir * c.v; if (c.x * c.dir > LIM) c.x -= c.dir * 2 * LIM;
    }
  }
  return out;
})();
export const worldAt = (f) => {
  const g = (a, b) => ramp(f, a, b);
  let clock = 0; // aiguilles de l'horloge de la coupe : s'emballent à « cycles minutés »
  if (f >= 758) clock = f * 0.4 + (f >= 1058 ? (f - 1058) * 2.4 : 0);
  const gap = f < 1262 ? 1 : 0, spark = f >= 1262 && f < 1272;
  return { walk: walkOn(f) ? 1 : 0, carGreen: hold(f) ? 0 : 1, cars: CARS[Math.min(f, TOTAL)], clock, gap, spark, led: Math.floor(f / 18) % 2, g };
};

// ---------- lumière : une ambiance par acte ----------
const DAY = mood('jour', { exposure: 1.1 });
const DORE = mood('dore', { exposure: 1.12 });
const MATIN = mood('matin', { exposure: 1.2 });
const NUIT = mood('nuit', { exposure: 1.15, gamma: 1.25 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'vert': return blendMood(DAY, DORE, ramp(f, 468, 500));
    case 'traverse': return DORE;
    case 'sauf': return blendMood(DORE, DAY, ramp(f, 618, 640));
    case 'comprendre': case 'cycles': case 'alors': case 'debr': case 'laisse': return mood('jour', { exposure: 1.18 });
    case 'res': case 'sur': case 'moins': return MATIN;
    case 'eteints': return blendMood(MATIN, DAY, ramp(f, 1957, 1990));
    case 'change': return DORE;
    case 'illusion': case 'sentiment': case 'attente': return blendMood(DORE, DAY, ramp(f, 2790, 2900));
    case 'marchent': return DAY;
    case 'nuit': return blendMood(DAY, NUIT, ramp(f, 3106, 3124));
    case 'demande': return NUIT;
    case 'la': return blendMood(NUIT, DORE, ramp(f, 3270, 3318));
    case 'prochaine': case 'doigt': case 'souviens': return DORE;
    case 'rienfait': return blendMood(DORE, DAY, ramp(f, 3526, 3560));
    default: return DAY;
  }
};
const TINTS = { vert: '#ffe8c8', traverse: '#ffe8c8', res: '#fff0d8', sur: '#fff0d8', moins: '#fff0d8', change: '#ffe8c8', nuit: '#e8e8ff', demande: '#dfe6ff', la: '#ffeedd', prochaine: '#ffe8c8', doigt: '#ffe8c8', souviens: '#ffe8c8' };
const tintOf = (S) => TINTS[S.id] || '#fff8ee';

// ---------- positions ----------
const IN = [-3.7, 0, 6.9], LE = [4.4, 0, 6.9];                 // Inès à P1, Léon à P2
const route = (f, pts) => {
  if (f <= pts[0][0]) return { x: pts[0][1], z: pts[0][2], mv: false };
  for (let i = 1; i < pts.length; i++) if (f <= pts[i][0]) { const [f0, x0, z0] = pts[i - 1], [f1, x1, z1] = pts[i], t = (f - f0) / (f1 - f0); return { x: lerp(x0, x1, t), z: lerp(z0, z1, t), mv: Math.abs(x1 - x0) + Math.abs(z1 - z0) > 0.01 }; }
  const l = pts[pts.length - 1]; return { x: l[1], z: l[2], mv: false };
};
const stepOf = (x, z = 0) => q(((Math.abs(x) + Math.abs(z)) * 0.9) % 1, 2);
const INES_CROSS = [[527, -3.2, 7.2], [548, -3.2, 5.2], [596, -3.0, -2.4], [618, -3.0, -7.4], [640, -3.4, -8.4]];   // elle traverse
const LEON_CROSS = [[698, 3.6, 7.0], [716, 3.4, 5.4], [760, 3.2, -6.6], [772, 3.2, -8.0]];
const PRESS = (f, f0, per = 14) => (f >= f0 ? Math.max(0, 1 - ((f - f0) % per) / 6) : 0);   // 1 à l'appui, retombe en 6 images

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.95, ...o }), ...e });
const KT = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, { s: 0.95, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const hookCam = (f) => {
  let c = camFromKeys([K(0, [IN[0] + 0.05, 0, IN[2]], { headW: 0.31, yaw: -14, low: 10, frameY: 0.4 }), K(70, [IN[0] + 0.05, 0, IN[2]], { headW: 0.29, yaw: -2, low: 12, frameY: 0.4 }), K(147, [IN[0] + 0.05, 0, IN[2]], { headW: 0.27, yaw: 8, low: 8, frameY: 0.4 })], f);
  for (const k of [10, 24, 38, 52, 66, 80, 94, 108, 122]) c = shake(c, f, k, 0.035, 8);
  return c;
};
const tw = (a0, a1, A, B, o0, o1) => (f) => camFromKeys([K(a0, A, o0), K(a1, B, o1)], f);
const tt = (a0, a1, A, B, C, D, o0, o1) => (f) => camFromKeys([KT(a0, A, B, o0), KT(a1, C, D, o1)], f);
const sig = [-4.9, 0, -6.2];
const CAMS = {
  hook: hookCam,
  ny: (f) => crane([0, 0, 2], f, 148, 92, { from: { r: 38, h: 24, yaw: 26, lookUp: 0 }, to: { r: 17, h: 5.5, yaw: 6, lookUp: 1.3 }, fov: 42 }),
  arrive: (f) => follow((g) => { const r = route(g, [[240, 18, 8.0], [300, IN[0] + 0.3, IN[2]]]); return [r.x, 0, r.z]; }, f, { headW: 0.22, yaw: -22, lag: 6, lead: 0.4, low: 6 }),
  appuie: tw(302, 342, [IN[0], 0, IN[2]], [IN[0] + 0.1, 0, IN[2]], { headW: 0.27, yaw: -20, low: 14, frameY: 0.4 }, { headW: 0.33, yaw: -8, low: 16, frameY: 0.4 }),
  fois: (f) => { let c = tw(343, 430, [IN[0], 0, IN[2]], [IN[0], 0, IN[2]], { headW: 0.3, yaw: -6, low: 10, frameY: 0.4 }, { headW: 0.42, yaw: 6, low: 14, frameY: 0.4, dutch: 4 })(f); for (const k of [346, 373, 401]) c = shake(c, f, k, 0.05, 8); return c; },
  pied: tw(430, 467, [IN[0] + 0.2, 0, IN[2]], [IN[0] + 0.2, 0, IN[2]], { headW: 0.2, yaw: 12, low: 20, frameY: 0.46, legs: 1 }, { headW: 0.24, yaw: -6, low: 24, frameY: 0.46 }),
  vert: (f) => camFromKeys([R(468, [sig[0] + 1.6, 1.8, -1.0], [sig[0] + 0.1, 2.9, sig[2]], 40), R(498, [sig[0] + 1.8, 2.0, -0.2], [sig[0], 2.8, sig[2]], 36), K(500, [IN[0], 0, IN[2]], { headW: 0.28, yaw: -8, low: 10, frameY: 0.4 }), K(526, [IN[0], 0, IN[2]], { headW: 0.31, yaw: 4, low: 12, frameY: 0.4 })], f),
  traverse: (f) => follow((g) => { const r = route(g, INES_CROSS); return [r.x, 0, r.z]; }, f, { headW: 0.26, yaw: 6, lag: 8, lead: 0.7, low: 6 }),
  sauf: tw(618, 682, [-3.0, 0, -7.2], [-3.1, 0, -7.6], { headW: 0.28, yaw: 160, low: 8, frameY: 0.4, dutch: 3 }, { headW: 0.34, yaw: 168, low: 10, frameY: 0.4, dutch: 5 }),
  auto: (f) => crane([0, 0, 0], f, 683, 75, { from: { r: 22, h: 7, yaw: 20, lookUp: 1.2 }, to: { r: 26, h: 11, yaw: -14, lookUp: 1.0 }, fov: 42 }),
  comprendre: (f) => crane([CX, 4.2, 0], f, 758, 88, { from: { r: 26, h: 3.2, yaw: 18, lookUp: 0 }, to: { r: 9, h: 2.5, yaw: -6, lookUp: 0.6 }, fov: 42 }),
  nyrow: (f) => camFromKeys([R(846, [0, 1.7, 9.4], [22, 1.6, 6.2], 40), R(886, [20, 1.8, 9.2], [44, 1.6, 6.2], 42)], f),
  poser: tt(886, 959, [24.4, 0, 7.4], [25.9, 0, 7.6], [24.4, 0, 7.4], [25.9, 0, 7.6], { headW: 0.24, yaw: -16, low: 8 }, { headW: 0.26, yaw: -4, low: 10 }),
  presse: tt(960, 1012, [-3.9, 0, 6.9], [-3.0, 0, 6.9], [-3.9, 0, 6.9], [-3.0, 0, 6.9], { headW: 0.24, yaw: -12, low: 8 }, { headW: 0.27, yaw: 4, low: 8 }),
  debut: tw(1013, 1057, [-3.1, 0, 6.9], [-3.0, 0, 6.9], { headW: 0.28, yaw: -14, low: 10, frameY: 0.4 }, { headW: 0.3, yaw: 2, low: 12, frameY: 0.4 }),
  cycles: tw(1058, 1114, [CX + 5.3, 3.9, -4.9], [CX + 4.0, 3.2, -4.9], { headW: 0.4, yaw: 0, frameY: 0.4 }, { headW: 0.28, yaw: 12, frameY: 0.4 }),
  fixe1: (f) => crane([0, 0, 0], f, 1115, 45, { from: { r: 30, h: 22, yaw: -12, lookUp: 0 }, to: { r: 20, h: 9, yaw: 10, lookUp: 1 }, fov: 42 }),
  fixe2: tt(1160, 1212, [-3.2, 0, 6.9], [3.8, 0, 6.9], [-3.1, 0, 6.9], [3.7, 0, 6.9], { headW: 0.2, yaw: 2, s: 0.95 }, { headW: 0.24, yaw: -6 }),
  alors: tw(1213, 1255, [CX + 2.4, 0, 2.2], [CX + 2.3, 0, 2.2], { headW: 0.28, yaw: -12, low: 8, frameY: 0.4 }, { headW: 0.36, yaw: 6, low: 10, frameY: 0.4 }),
  debr: (f) => { let c = camFromKeys([R(1256, [CX - 0.6, 3.3, 5.4], [CX - 0.55, 3.3, 0.5], 40), R(1327, [CX - 0.4, 3.2, 4.2], [CX - 0.5, 3.3, 0.5], 36)], f); return shake(c, f, 1262, 0.05, 10); },
  laisse: tw(1328, 1379, [CX + 2.6, 0, 2.2], [CX + 3.0, 0, 2.2], { headW: 0.27, yaw: -14, low: 10, frameY: 0.4 }, { headW: 0.24, yaw: 6, low: 12, frameY: 0.4 }),
  pourquoi: tw(1380, 1401, [-2.6, 0, 6.9], [-2.6, 0, 6.9], { headW: 0.3, yaw: 8, low: 14, frameY: 0.4, dutch: 3 }, { headW: 0.36, yaw: 2, low: 16, frameY: 0.4, dutch: 5 }),
  arrache: tt(1402, 1446, [-3.6, 0, 7.4], [-2.2, 0, 7.4], [-3.4, 0, 7.4], [-2.2, 0, 7.4], { headW: 0.24, yaw: -16, low: 6 }, { headW: 0.28, yaw: -4, low: 8 }),
  rebouche: tw(1447, 1477, [-2.6, 0, 7.4], [-2.6, 0, 7.4], { headW: 0.3, yaw: 10, low: 6, frameY: 0.4 }, { headW: 0.34, yaw: 2, low: 8, frameY: 0.4 }),
  remet: tt(1478, 1519, [-3.4, 0, 7.4], [-2.0, 0, 7.4], [-3.4, 0, 7.4], [-2.0, 0, 7.4], { headW: 0.24, yaw: 8, low: 8 }, { headW: 0.26, yaw: -4, low: 6 }),
  cher: tw(1520, 1556, [-2.6, 0, 7.4], [-2.6, 0, 7.4], { headW: 0.3, yaw: -6, low: 12, frameY: 0.4 }, { headW: 0.38, yaw: 4, low: 14, frameY: 0.4 }),
  milliers: (f) => crane([30, 0, 2], f, 1557, 74, { from: { r: 20, h: 6, yaw: 8, lookUp: 1.2 }, to: { r: 78, h: 50, yaw: 22, lookUp: 0 }, fov: 42 }),
  laisses: (f) => camFromKeys([R(1632, [8, 1.5, 9.8], [20, 1.35, 6.2], 36), R(1706, [52, 1.5, 9.4], [66, 1.35, 6.2], 36)], f),
  plaque: (f) => camFromKeys([R(1706, [IN[0] - 1.2, 1.35, 7.5], [-4.9, 1.15, 6.4], 36), R(1775, [-4.9, 1.2, 7.2], [-4.9, 1.14, 6.4], 30)], f),
  res: tt(1776, 1826, [-2.6, 0, 6.9], [-4.0, 0, 6.9], [-2.4, 0, 6.9], [-4.0, 0, 6.9], { headW: 0.24, yaw: -12, low: 8 }, { headW: 0.27, yaw: 4, low: 10 }),
  sur: (f) => crane([-6, 0, 3], f, 1827, 52, { from: { r: 10, h: 2.5, yaw: -12, lookUp: 2.0 }, to: { r: 34, h: 18, yaw: 24, lookUp: 0 }, fov: 42 }),
  moins: (f) => crane([20, 0, 3], f, 1879, 78, { from: { r: 40, h: 22, yaw: -26, lookUp: 0 }, to: { r: 14, h: 3.4, yaw: 10, lookUp: 1.4 }, fov: 42 }),
  eteints: (f) => camFromKeys([R(1957, [10, 1.4, 10.4], [18, 1.2, 6.9], 38), R(2033, [38, 1.4, 10.4], [46, 1.2, 6.9], 38)], f),
  etonnant: (f) => crane([CAMP, 0, 1], f, 2034, 62, { from: { r: 34, h: 24, yaw: 30, lookUp: 0 }, to: { r: 14, h: 3.6, yaw: 14, lookUp: 1.4 }, fov: 42 }),
  penses: tw(2095, 2182, [CAMP - 3.2, 0, 6.3], [CAMP - 3.2, 0, 6.3], { headW: 0.28, yaw: -10, low: 12, frameY: 0.4 }, { headW: 0.34, yaw: 6, low: 14, frameY: 0.4 }),
  pastout: (f) => shake(tw(2183, 2219, [CAMP - 3.2, 0, 6.3], [CAMP - 3.1, 0, 6.3], { headW: 0.3, yaw: 8, low: 8, frameY: 0.4 }, { headW: 0.4, yaw: -4, low: 12, frameY: 0.4 })(f), f, 2200, 0.06, 8),
  cherch1: tw(2220, 2289, [CAMP + 1.5, 0, -7.4], [CAMP + 1.5, 0, -7.4], { headW: 0.3, yaw: 14, low: 20, frameY: 0.4 }, { headW: 0.34, yaw: -2, low: 24, frameY: 0.4 }),
  cherch2: (f) => crane([CAMP, 0, -2], f, 2290, 64, { from: { r: 18, h: 3.4, yaw: -24, lookUp: 1.4 }, to: { r: 46, h: 22, yaw: 16, lookUp: 0 }, fov: 42 }),
  observe: tt(2355, 2427, [CAMP + 1.5, 0, -7.4], [CAMP + 0.3, 0, 7.0], [CAMP + 1.8, 0, -7.4], [CAMP + 0.1, 0, 7.0], { headW: 0.12, yaw: 168 }, { headW: 0.12, yaw: 172 }),
  constat: tw(2428, 2463, [CAMP + 1.5, 0, -7.4], [CAMP + 1.5, 0, -7.4], { headW: 0.3, yaw: 8, low: 14, frameY: 0.4 }, { headW: 0.36, yaw: -4, low: 16, frameY: 0.4 }),
  att1: tt(2464, 2529, [CAMP - 1.6, 0, 6.5], [CAMP + 0.4, 0, 6.5], [CAMP - 1.6, 0, 6.5], [CAMP + 0.4, 0, 6.5], { headW: 0.25, yaw: -10, low: 8 }, { headW: 0.27, yaw: 4, low: 8 }),
  att2: tt(2530, 2609, [CAMP - 1.6, 0, 6.5], [CAMP + 0.6, 0, 6.2], [CAMP - 1.6, 0, 6.5], [CAMP + 0.9, 0, 5.2], { headW: 0.25, yaw: 6, low: 6 }, { headW: 0.22, yaw: -4, low: 6 }),
  rien: tw(2610, 2666, [CAMP - 3.2, 0, 6.3], [CAMP - 3.2, 0, 6.3], { headW: 0.3, yaw: -8, low: 10, frameY: 0.4 }, { headW: 0.34, yaw: 4, low: 12, frameY: 0.4 }),
  change: tw(2665, 2741, [CAMP - 3.2, 0, 6.3], [CAMP - 3.2, 0, 6.3], { headW: 0.36, yaw: 4, low: 6, frameY: 0.4 }, { headW: 0.3, yaw: -8, low: 10, frameY: 0.4 }),
  illusion: tw(2742, 2827, [CAMP - 3.2, 0, 6.3], [CAMP - 3.0, 0, 6.3], { headW: 0.26, yaw: -14, low: 12, frameY: 0.42 }, { headW: 0.24, yaw: 6, low: 10, frameY: 0.42 }),
  sentiment: tw(2828, 2877, [CAMP - 3.2, 0, 6.3], [CAMP - 3.2, 0, 6.3], { headW: 0.3, yaw: 10, low: 8, frameY: 0.4 }, { headW: 0.34, yaw: -2, low: 8, frameY: 0.4 }),
  attente: tt(2878, 2959, [CAMP - 3.2, 0, 6.3], [CAMP - 1.6, 0, 6.3], [CAMP - 3.1, 0, 6.3], [CAMP - 1.5, 0, 6.3], { headW: 0.25, yaw: -4, low: 8 }, { headW: 0.2, yaw: 10, low: 8 }),
  attention: tt(2960, 3065, [CAMP - 3.2, 0, 6.3], [CAMP - 1.8, 0, 6.3], [CAMP - 3.0, 0, 6.3], [CAMP - 1.8, 0, 6.3], { headW: 0.25, yaw: 6, low: 14, dutch: 3 }, { headW: 0.28, yaw: -6, low: 16, dutch: 4 }),
  marchent: tw(3066, 3105, [-3.0, 0, 6.9], [-3.0, 0, 6.9], { headW: 0.26, yaw: -12, low: 8, frameY: 0.4 }, { headW: 0.3, yaw: 4, low: 10, frameY: 0.4 }),
  nuit: (f) => camFromKeys([R(3106, [-3.0, 1.4, 11], [-3.0, 1.9, 5.5], 40), R(3133, [-1.0, 1.5, 9.6], [-3.0, 1.3, 6.4], 36)], f),
  demande: (f) => camFromKeys([K(3134, [-3.2, 0, 6.9], { headW: 0.26, yaw: -10, low: 10, frameY: 0.4 }), K(3186, [-3.2, 0, 6.9], { headW: 0.3, yaw: 6, low: 12, frameY: 0.4 }), K(3229, [-3.2, 0, 6.9], { headW: 0.24, yaw: 20, low: 8, frameY: 0.42 })], f),
  la: tw(3230, 3325, [-3.1, 0, 6.9], [-3.1, 0, 6.9], { headW: 0.32, yaw: 6, low: 16, frameY: 0.4 }, { headW: 0.28, yaw: -8, low: 18, frameY: 0.4 }),
  prochaine: tw(3326, 3413, [IN[0] + 0.2, 0, IN[2]], [IN[0] + 0.2, 0, IN[2]], { headW: 0.26, yaw: -16, low: 10, frameY: 0.4 }, { headW: 0.32, yaw: 2, low: 12, frameY: 0.4 }),
  doigt: tw(3414, 3443, [IN[0] + 0.1, 0, IN[2]], [IN[0] + 0.1, 0, IN[2]], { headW: 0.34, yaw: 10, low: 6, frameY: 0.4 }, { headW: 0.4, yaw: 2, low: 8, frameY: 0.4 }),
  souviens: tw(3444, 3525, [IN[0] + 0.1, 0, IN[2]], [IN[0] + 0.1, 0, IN[2]], { headW: 0.3, yaw: -6, low: 18, frameY: 0.4 }, { headW: 0.28, yaw: 8, low: 14, frameY: 0.4 }),
  rienfait: (f) => camFromKeys([R(3526, [-4.4, 1.3, 7.6], [-4.9, 1.15, 6.4], 34), R(3560, [-4.0, 1.7, 9.4], [-3.9, 2.2, -6.2], 38), K(3591, [IN[0] + 0.05, 0, IN[2]], { headW: 0.27, yaw: -4, low: 8, frameY: 0.4 })], f),
  attendu: (f) => camFromKeys([K(3592, [IN[0] + 0.05, 0, IN[2]], { headW: 0.27, yaw: -4, low: 8, frameY: 0.4 }), K(3640, [IN[0] + 0.05, 0, IN[2]], { headW: 0.3, yaw: -12, low: 10, frameY: 0.4 }), K(3663, [IN[0] + 0.05, 0, IN[2]], { headW: 0.31, yaw: -14, low: 10, frameY: 0.4 })], f),
};
const TRS = { ny: 'whip', arrive: 'push', appuie: 'push', vert: 'whip', traverse: 'push', sauf: 'push', auto: 'rise', comprendre: 'drop', nyrow: 'whip', poser: 'push', presse: 'push', cycles: 'push',
  fixe1: 'whip', fixe2: 'push', alors: 'push', laisse: 'push', pourquoi: 'whip', arrache: 'drop', cher: 'push', milliers: 'rise', laisses: 'whip', plaque: 'push', res: 'whip', sur: 'push', moins: 'rise', eteints: 'whip',
  etonnant: 'whip', penses: 'drop', cherch1: 'push', cherch2: 'rise', observe: 'whip', constat: 'push', att1: 'whip', rien: 'push', change: 'push', illusion: 'push', sentiment: 'push', attention: 'whip', marchent: 'whip',
  nuit: 'whip', demande: 'push', la: 'push', prochaine: 'whip', doigt: 'push', souviens: 'push', rienfait: 'whip', attendu: 'push' };
const baseCam = (f) => (CAMS[shotAt(f).id] || CAMS.hook)(f);
const TRL = SHOTS.filter((s) => TRS[s.id]).map((s) => ({ a: s.a, type: TRS[s.id], dir: hash(s.a, 3) < 0.5 ? -1 : 1 }));
export const camAt = (f) => {
  const T = TRL.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir });
  return baseCam(f);
};
// objet flou au premier plan : le bouton sur les plans qui parlent du bouton
const FGB = { hook: [-1, 0.95, 0.42, 0.62], appuie: [-1, 0.95, 0.5, 0.55], fois: [-1, 0.95, 0.5, 0.6], pied: [1, 0.95, 0.55, 0.5], presse: [-1, 1.0, 0.5, 0.5], debut: [-1, 1.0, 0.5, 0.5], plaque: [0, 0.55, 0.12, 1.1],
  laisse: [1, 1.0, 0.55, 0.5], pourquoi: [-1, 1.0, 0.5, 0.55], fixe2: [-1, 1.0, 0.55, 0.5], pastout: [-1, 0.95, 0.5, 0.6], rien: [1, 1.0, 0.5, 0.55], doigt: [-1, 0.9, 0.35, 0.8], attendu: [-1, 0.95, 0.5, 0.6], cher: [-1, 1.0, 0.55, 0.5],
  penses: [1, 1.0, 0.55, 0.5], constat: [1, 1.0, 0.55, 0.5], la: [-1, 1.0, 0.5, 0.55], souviens: [1, 1.0, 0.55, 0.5], res: [-1, 1.0, 0.5, 0.5] };
export const dofAt = (f) => { const C = camAt(f), d = C.dist || Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return FGB[shotAt(f).id] ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
export const envAt = (f) => {
  const S = shotAt(f), z = ZONE(S.id), out = { motes: z === 'C' ? 0.9 : 0.6 };
  const pt = f >= 3188 || (f >= 3106 && f < 3134) ? 1 : 0;
  if (z === 'A' && f >= 3106 && f < 3326) {
    const beams = [];
    for (const c of worldAt(f).cars) if (Math.abs(c.x) < 40) beams.push({ at: [c.x + c.dir * 2.0, 0.75, c.z], yaw: c.dir > 0 ? Math.PI / 2 : -Math.PI / 2, pitch: 0.06, len: 9, r: 1.5, col: '#ffe9a8', a: 0.5 });
    out.beams = beams.slice(0, 6); void pt;
  }
  if (z === 'A') out.smoke = [{ at: [8.8, 2.4, -7.4], f0: 0, f1: TOTAL, rate: 1.4, size: 0.8, col: '#f4f1ea', rise: 0.5 }];
  if (S.id === 'debr') out.sparks = f >= 1262 && f < 1274 ? [{ at: [CX - 0.55, 3.2, 0.7], f0: 1262, f1: 1272, rate: 40, col: '#fff08a', speed: 1.8 }] : [];
  if (S.id === 'poser') out.sparks = [[920, 25.2], [940, 27.4]].filter(([k]) => f >= k && f < k + 8).map(([k, x]) => ({ at: [x, 1.2, 6.5], f0: k, f1: k + 6, rate: 40, col: '#7cffa0', speed: 1.4 }));
  if (S.id === 'arrache') out.spray = [[1425, -4.9]].filter(([k]) => f >= k && f < k + 30).map(([k, x]) => ({ at: [x, 0.2, 6.6], f0: k, n: 50, power: 1.8, col: '#cfc8bc' }));
  if (S.id === 'rebouche') out.spray = [[1458, -4.4], [1470, -4.2]].filter(([k]) => f >= k && f < k + 30).map(([k, x]) => ({ at: [x, 0.2, 6.6], f0: k, n: 40, power: 1.4, col: '#a8896a' }));
  if (S.id === 'traverse' || S.id === 'vert') out.spray = [];
  return out;
};

// ---------- cartes 2D ----------
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 16) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const popK = (g, k) => { const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); };
const labelCard = (txt, size, fill, bg, k = 1, rot = 0, txt2) => (p) => { const g = p.g; g.save(); g.translate(300, 520); g.rotate(rot); g.translate(-300, -520); popK(g, k);
  if (txt2) { panel(g, 20, 380, 560, 300, bg); TXT(g, txt, 300, 505, size, fill, 0); TXT(g, txt2, 300, 625, size, fill, 0); } else { panel(g, 20, 410, 560, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); } g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, marks: false, ...extra });
const pieCard = (t, k = 1) => (p) => { const g = p.g; g.save(); popK(g, k); panel(g, 10, 330, 580, 400, '#f7f3ea'); const cx = 300, cy = 530, r = 150;
  g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.62); g.closePath(); g.fillStyle = '#e8402f'; g.fill();
  g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2 + Math.PI * 2 * 0.62, -Math.PI / 2 + Math.PI * 2); g.closePath(); g.fillStyle = '#38c870'; g.fill();
  g.beginPath(); g.arc(cx, cy, r, 0, 7); g.lineWidth = 14; g.strokeStyle = INK; g.stroke();
  const a = -Math.PI / 2 + Math.PI * 2 * (t % 1); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8)); g.lineWidth = 16; g.lineCap = 'round'; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.fillStyle = INK; g.fill(); g.restore(); };
const checkCard = (k, ok = true) => (p) => { const g = p.g; g.save(); popK(g, k); g.beginPath(); g.arc(300, 520, 150, 0, 7); g.fillStyle = ok ? '#38c870' : '#e8402f'; g.fill(); g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
  g.lineWidth = 36; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK; g.beginPath(); if (ok) { g.moveTo(215, 525); g.lineTo(280, 590); g.lineTo(395, 450); } else { g.moveTo(230, 450); g.lineTo(370, 590); g.moveTo(370, 450); g.lineTo(230, 590); } g.stroke();
  g.lineWidth = 20; g.strokeStyle = '#ffffff'; g.stroke(); g.restore(); };
const warnCard = (k) => (p) => { const g = p.g; g.save(); popK(g, k); g.beginPath(); g.moveTo(300, 360); g.lineTo(470, 650); g.lineTo(130, 650); g.closePath(); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 18; g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke(); TXT(g, '!', 300, 600, 190, INK, 0); g.restore(); };
const leverCard = (k) => (p) => { const g = p.g; g.save(); popK(g, k); g.beginPath(); g.arc(300, 520, 190, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 14; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(150, 700, 26, 0, 7); g.arc(210, 690, 14, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.stroke();
  g.fillStyle = '#7a8088'; g.beginPath(); g.roundRect(210, 570, 180, 60, 18); g.fill(); g.lineWidth = 12; g.stroke();
  g.lineWidth = 26; g.lineCap = 'round'; g.strokeStyle = INK; g.beginPath(); g.moveTo(300, 575); g.lineTo(350, 440); g.stroke(); g.lineWidth = 14; g.strokeStyle = '#c9ced6'; g.stroke();
  g.beginPath(); g.arc(358, 425, 42, 0, 7); g.fillStyle = '#e8402f'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); g.restore(); };
const dollarCard = (k) => (p) => { const g = p.g; g.save(); popK(g, k); panel(g, 70, 400, 460, 240, '#b9d9a0'); g.beginPath(); g.arc(300, 520, 70, 0, 7); g.fillStyle = '#8fbf72'; g.fill(); g.lineWidth = 10; g.stroke(); TXT(g, '$', 300, 566, 120, INK, 0); g.restore(); };
const numCard = (txt, hot, bg) => (p) => { const g = p.g; g.save(); popK(g, 1); panel(g, 10, 390, 580, 260, bg || (hot ? '#ff5a4a' : '#ffd23a')); TXT(g, txt, 300, 550, txt.length > 6 ? 112 : 140, hot ? '#ffffff' : INK, hot ? 14 : 0); g.restore(); };
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.ines = { tunic: '#e5383b', skin: '#b87a52', hair: '#1a1411', brows: '#1a1411', scarf: '#ffd23a', coat: true, buttons: '#ffd23a', cuffs: '#271925' };
  O.leon = { tunic: '#d9a23a', skin: '#efc9a0', cap: '#6b7078', hair: '#e8e8e8', moustache: '#ececec', brows: '#cfcfcf', stout: true, buttons: '#7a4a1e', pattern: 'vstripes', patternCol: '#c48a22', lapels: '#b8801c' };
  O.marc = { tunic: '#ff8a1f', skin: '#8a5a3c', hat: 'hardhat', hatCol: '#ffd23a', brows: '#1a1411', moustache: '#1a1411', belt: '#3a3f48', cuffs: '#f4f1ea', pattern: 'stripes', patternCol: '#f4f1ea', stout: true };
  O.jo = { tunic: '#ff8a1f', skin: '#d9a066', hat: 'hardhat', hatCol: '#f4f1ea', brows: '#3a2a1a', thin: true, belt: '#3a3f48', cuffs: '#f4f1ea' };
  O.tal = { tunic: '#f4f4ef', skin: '#e8b890', hair: '#4a2a1e', brows: '#3a2a1e', glasses: true, lapels: '#dfe3ea', cuffs: '#3a6ad8', buttons: '#9aa3ad' };
  O.pa = { tunic: '#14b8c4', skin: '#cf9f70', hair: '#1a1411', brows: '#1a1411' };
  O.pb = { tunic: '#7a3aa8', skin: '#8a5a3c', hair: '#1a1411', brows: '#1a1411', stout: true };
  O.pc = { tunic: '#8fd14f', skin: '#efc9a0', cap: '#3a6ad8', hair: '#5a3a22', brows: '#3a2a1a', thin: true };
  O.pd = { tunic: '#e05a9a', skin: '#b78458', hair: '#2a1e1a', brows: '#2a1e1a' };
  O.pe = { tunic: '#3a6ad8', skin: '#f0d0b0', hair: '#c88a3a', brows: '#8a5a22', scarf: '#ffffff' };
  O.pf = { tunic: '#5a6a7a', skin: '#a8704a', hat: 'tophat', hair: '#1a1411', brows: '#1a1411', moustache: '#1a1411' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const CROWD_OUT = ['pa', 'pb', 'pc', 'pd', 'pe', 'pf'];

// ---------- piétons de fond qui traversent quand le bonhomme est vert ----------
const ambient = (f, T, tint, skip = []) => {
  const out = [];
  WIN.forEach(([a, b], wi) => { if (a > 2100) return; for (let k = 0; k < 6; k++) { if (skip.includes(wi * 10 + k)) continue; const t0 = a + 3 + k * 7, d = 96, u = (f - t0) / d; if (u < 0 || u > 1) continue; const lane = -2.6 + k * 1.15 + (wi % 2) * 0.3, dirn = k % 2 ? 1 : -1;
    const z = dirn > 0 ? lerp(-7.6, 7.6, u) : lerp(7.6, -7.6, u); const who = CROWD_OUT[(k + wi) % 6];
    out.push(R_(T, who, life(f, 30 + k, { expr: 'neutral', L: 'hang', R: 'hang', step: stepOf(lane, z * 1.2) }), [lane + 0.0, 0, z], { s: 0.93, tint })); } });
  return out;
};
const sidewalkExtras = (f, T, tint, side = 1) => crowd(T, f, { center: [side * 0 + 0, 0, -9.2], n: 9, w: 26, d: 1.6, outfits: CROWD_OUT, exprs: ['neutral', 'smile', 'grin'], seed: 5, s: 0.92 }).map((a) => ({ ...a, tint }));
const nearExtras = (f, T, tint, cx) => crowd(T, f, { center: [cx, 0, 8.2], n: 4, w: 6, d: 1.0, outfits: CROWD_OUT, exprs: ['neutral', 'smile'], seed: 8, s: 0.93 }).map((a) => ({ ...a, tint }));
const exprAt = (f, tab, d = 'neutral') => tab.reduce((a, [k, e]) => (f >= k ? e : a), d);

// ---------- acteurs ----------
export const actorsAt = (f, T) => {
  const S = shotAt(f), id = S.id, z = ZONE(id), out = [], tint = tintOf(S);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, s: 0.95, ...ex }));
  const pr = PRESS(f, 0, 14);
  const ines = (o, pos = IN, ex = {}) => fig('ines', 6, o, pos, ex);
  const leon = (o, pos = LE, ex = {}) => fig('leon', 9, o, pos, { s: 0.96, ...ex });
  const marc = (o, pos, ex = {}) => fig('marc', 12, o, pos, ex);
  const tal = (o, pos, ex = {}) => fig('tal', 15, o, pos, ex);
  const walker = (who, seed, rt, o, ex = {}) => { const r = route(f, rt); fig(who, seed, { ...o, step: r.mv ? stepOf(r.x, r.z * 1.2) : 0 }, [r.x, 0, r.z], ex); return r; };
  const pressAt = (f0, per = 14) => PRESS(f, f0, per);
  switch (id) {
    case 'hook': { const p = PRESS(f, 10, 14); ines({ expr: f < 100 ? 'nervous' : 'determined', L: 'point', R: 'hip', look: -0.4, wv: 0 }, IN, { dy: -0.02 * p, roll: 0.01 * p }); break; }
    case 'ny': { out.push(...sidewalkExtras(f, T, tint)); out.push(...nearExtras(f, T, tint, -8)); out.push(...nearExtras(f, T, tint, 9)); out.push(...ambient(f, T, tint)); break; }
    case 'arrive': { const r = route(f, [[240, 18, 8.0], [296, IN[0] + 0.3, IN[2]]]); const arrived = f >= 296;
      ines({ expr: arrived ? 'nervous' : 'shock', L: arrived ? 'hip' : 'flail', R: arrived ? 'hip' : 'flail', wv: q(f * 0.9, 1), run: !arrived, step: r.mv ? q((f * 0.09) % 1, 2) : 0, look: -0.2, tilt: r.mv ? 7 : 0 }, [r.x, 0, r.z], { dy: r.mv ? Math.abs(Math.sin(f * 0.55)) * 0.06 : 0 });
      leon({ expr: 'deadpan', L: 'cross', R: 'cross', look: -0.3 }, [LE[0] + 1.6, 0, 7.2]); out.push(...nearExtras(f, T, tint, -9)); break; }
    case 'appuie': { const p = PRESS(f, 312, 14); ines({ expr: f < 318 ? 'nervous' : 'determined', L: 'point', R: 'hip', look: -0.5 }, IN, { dx: -0.02 * p }); leon({ expr: 'deadpan', L: 'cross', R: 'cross', look: -0.3 }, [LE[0] + 1.8, 0, 7.4]); break; }
    case 'fois': { const p = (PRESS(f, 346, 14) + PRESS(f, 373, 14) + PRESS(f, 401, 14)) > 0.4 ? 1 : 0; ines({ expr: f < 372 ? 'nervous' : f < 400 ? 'pained' : 'stubborn', L: 'point', R: 'hip', look: -0.5 }, IN, { dx: -0.03 * p, ...tremble(f, 0.006, 3) }); break; }
    case 'pied': { const tap = Math.abs(Math.sin(f * 0.62)) * 0.07; ines({ expr: 'pained', L: 'hip', R: 'hip', look: -0.6, step: Math.floor(f / 5) % 2 ? 0.5 : 0 }, IN, { dy: tap }); leon({ expr: 'deadpan', L: 'cross', R: 'cross', look: -0.2 }); break; }
    case 'vert': { const g = f >= 500; ines({ expr: g ? 'grin' : 'nervous', L: g ? 'fist' : 'hip', R: 'hip', look: -0.5 }, IN, g ? hop(f, 502, 0.25, 8) : {}); leon({ expr: 'deadpan', L: 'cross', R: 'cross', look: -0.3 }); break; }
    case 'traverse': { const r = route(f, INES_CROSS); fig('ines', 6, { expr: f < 561 ? 'grin' : 'proud', L: f < 561 ? 'fist' : 'hip', R: 'hip', run: false, step: r.mv ? q((f * 0.07) % 1, 2) : 0, look: 0.1, headTilt: f > 561 ? 8 : 0 }, [r.x, 0, r.z], { dy: r.mv ? Math.abs(Math.sin(f * 0.4)) * 0.03 : 0 });
      const l = route(f, [[498, 4.4, 6.9], [514, 3.8, 5.6], [560, 3.6, -3], [600, 3.6, -7.6]]); fig('leon', 9, { expr: 'smug', L: 'hip', R: 'hip', step: l.mv ? q((f * 0.05) % 1, 2) : 0 }, [l.x, 0, l.z], { s: 0.96 }); out.push(...ambient(f, T, tint, [])); break; }
    case 'sauf': { const sq = f >= 640; fig('ines', 6, { expr: f < 640 ? 'shock' : 'squint', L: sq ? 'shrug' : 'hip', R: sq ? 'shrug' : 'hip', look: 0.5 }, [-3.0, 0, -7.6], { ...(f < 640 ? hop(f, 622, 0.2, 6) : {}) }); break; }
    case 'auto': { const l = route(f, LEON_CROSS); fig('leon', 9, { expr: f < 698 ? 'deadpan' : 'smug', L: 'cross', R: 'cross', step: l.mv ? q((f * 0.05) % 1, 2) : 0, look: -0.2 }, [l.x, 0, l.z], { s: 0.96 }); out.push(...sidewalkExtras(f, T, tint)); break; }
    case 'comprendre': { marc({ expr: 'determined', L: 'chin', R: 'hip', look: -0.6 }, [CX + 2.6, 0, 2.2]); jo(f, T, out, tint, [CX - 3.4, 0, 2.6], { expr: 'smile', L: 'hip', R: 'hip', look: 0.4 }); break; }
    case 'nyrow': { const r1 = route(f, [[846, 11, 8.0], [885, 26, 8.0]]); fig('marc', 12, { expr: 'smile', L: 'show', holdL: 'button', R: 'hip', step: r1.mv ? stepOf(r1.x) : 0, look: 0.4 }, [r1.x, 0, r1.z], { s: 0.92 }); out.push(...nearExtras(f, T, tint, 36)); break; }
    case 'poser': { const w = (a, x) => (f >= a ? 1 : 0); const sp = f % 24 < 12 ? 'reach' : 'lift'; marc({ expr: f < 920 ? 'smile' : 'proud', L: 'show', holdL: f < 918 ? 'button' : undefined, R: f >= 905 && f < 918 ? 'reach' : 'hip', look: 0.5 }, [24.4, 0, 7.4], f >= 918 ? { ...hop(f, 922, 0.12, 6) } : {});
      fig('jo', 13, { expr: 'smile', L: 'hip', R: f >= 940 ? 'reach' : 'hip', look: -0.5 }, [25.9, 0, 7.6], { s: 0.92 }); void w; void sp; out.push(...nearExtras(f, T, tint, 36)); break; }
    case 'presse': { const g = walkOn(f), p = PRESS(f, 968, 14); fig('pa', 40, { expr: g ? 'grin' : 'neutral', L: 'point', R: 'hip', look: -0.5 }, [-3.9, 0, 6.9], { dx: -0.02 * p }); fig('pb', 41, { expr: g ? 'laugh' : 'smile', L: 'hip', R: 'hip', look: -0.3 }, [-3.0, 0, 7.1]); out.push(...ambient(f, T, tint)); break; }
    case 'debut': { const g = walkOn(f), p = PRESS(f, 1020, 14); fig('pc', 42, { expr: g ? 'grin' : 'smile', L: 'point', R: 'hip', look: -0.5 }, [-3.1, 0, 6.9], { dx: -0.02 * p }); fig('pd', 43, { expr: g ? 'laugh' : 'neutral', L: 'hip', R: 'hip', look: -0.3 }, [-4.0, 0, 7.2]); break; }
    case 'cycles': { marc({ expr: 'deadpan', L: 'point', R: 'hip', look: -0.7 }, [CX + 3.2, 0, 2.4]); break; }
    case 'fixe1': { out.push(...sidewalkExtras(f, T, tint)); out.push(...nearExtras(f, T, tint, -8)); out.push(...nearExtras(f, T, tint, 8)); out.push(...ambient(f, T, tint)); break; }
    case 'fixe2': { const g = walkOn(f), p = PRESS(f, 1166, 12); fig('pa', 40, { expr: g ? 'grin' : 'nervous', L: 'point', R: 'hip', look: -0.4 }, [-3.2, 0, 6.9], { dx: -0.02 * p }); fig('pf', 44, { expr: g ? 'smug' : 'deadpan', L: 'cross', R: 'cross', look: -0.3 }, [3.6, 0, 6.9]); break; }
    case 'alors': { marc({ expr: 'squint', L: 'chin', R: 'hip', look: -0.6, headTilt: 6 }, [CX + 2.4, 0, 2.2]); break; }
    case 'debr': { const pulling = f >= 1258; marc({ expr: pulling ? 'determined' : 'scheming', L: 'hip', R: pulling ? 'reach' : 'lift', lift: 0.6, look: -0.8 }, [CX + 2.4, 0, 2.2], { s: 0.9 }); break; }
    case 'laisse': { const r = route(f, [[1328, CX + 2.6, 2.2], [1379, CX + 6.5, 2.4]]); marc({ expr: 'smug', L: 'show', holdL: 'tool', R: 'hip', step: r.mv ? stepOf(r.x) : 0, look: 0.4 }, [r.x, 0, r.z]); break; }
    case 'pourquoi': { marc({ expr: 'squint', L: 'shrug', R: 'shrug', look: -0.2 }, [-2.6, 0, 6.9]); ines({ expr: 'suspicious', L: 'chin', R: 'hip', look: 0.5 }, [-4.4, 0, 7.4], { s: 0.92 }); break; }
    case 'arrache': { const t = tremble(f, 0.02, 2); marc({ expr: 'determined', L: 'push', R: 'push', look: -0.6 }, [-3.5, 0, 7.4], f > 1415 ? { dx: t.dx, roll: t.roll } : {}); fig('jo', 13, { expr: 'pained', L: 'push', R: 'push', look: -0.6 }, [-2.3, 0, 7.5], { s: 0.92, ...tremble(f, 0.02, 5) }); break; }
    case 'rebouche': { const sw = Math.floor(f / 8) % 2; marc({ expr: 'stubborn', L: 'hip', R: sw ? 'lift' : 'reach', holdR: 'tool', look: -0.6 }, [-2.6, 0, 7.4], { s: 0.95 }); break; }
    case 'remet': { fig('jo', 13, { expr: 'determined', L: 'carry', R: 'carry', look: -0.4 }, [-3.4, 0, 7.5], { s: 0.92, dy: Math.abs(Math.sin(f * 0.3)) * 0.01 }); marc({ expr: 'proud', L: 'hip', R: 'point', look: -0.4 }, [-2.1, 0, 7.3]); break; }
    case 'cher': { marc({ expr: 'stern', L: 'show', holdL: 'bill', R: 'show', holdR: 'bill', look: 0.2, headTilt: 5 }, [-2.6, 0, 7.4]); break; }
    case 'milliers': { out.push(...nearExtras(f, T, tint, 40)); const r = route(f, [[1557, 28, 8.0], [1632, 40, 8.0]]); fig('marc', 12, { expr: 'proud', L: 'hip', R: 'hip', look: 0.3 }, [28.4, 0, 8.0], { s: 0.92 }); void r; break; }
    case 'laisses': { out.push(...nearExtras(f, T, tint, 28)); out.push(...nearExtras(f, T, tint, 52)); break; }
    case 'plaque': { const p = PRESS(f, 1720, 18); fig('pe', 45, { expr: 'nervous', L: 'point', R: 'hip', look: -0.5 }, [-4.0, 0, 7.5], { s: 0.9, dx: -0.02 * p }); break; }
    case 'res': { marc({ expr: 'deadpan', L: 'show', holdL: 'paper', R: 'hip', look: 0.4 }, [-2.6, 0, 6.9]); ines({ expr: 'suspicious', L: 'cross', R: 'cross', look: -0.4 }, [-4.2, 0, 7.2], { s: 0.92 }); break; }
    case 'sur': { fig('jo', 13, { expr: 'smile', L: 'show', holdL: 'paper', R: 'hip', look: 0.4 }, [-6.2, 0, 7.4], { s: 0.95 }); out.push(...nearExtras(f, T, tint, 6)); break; }
    case 'moins': { out.push(...nearExtras(f, T, tint, 14)); out.push(...nearExtras(f, T, tint, 26)); break; }
    case 'eteints': { const xs = [18, 29, 41]; ['pa', 'pb', 'pd'].forEach((who, i) => { const p = PRESS(f, 1975 + i * 9, 20 - i * 3); fig(who, 50 + i, { expr: f < 2000 + i * 8 ? 'nervous' : 'pained', L: 'point', R: 'hip', look: -0.5 }, [xs[i] - 0.9, 0, 7.4], { dx: -0.02 * p, s: 0.93 }); }); break; }
    case 'etonnant': { out.push(...campusCrowd(f, T, tint)); tal({ expr: 'smile', L: 'show', holdL: 'notebook', R: 'hip', look: 0.4 }, [CAMP + 1.5, 0, -7.4], { s: 0.93 }); break; }
    case 'penses': { ines({ expr: f < 2140 ? 'suspicious' : 'smug', L: 'chin', R: 'hip', look: -0.4 }, [CAMP - 3.2, 0, 6.3]); break; }
    case 'pastout': { const p = PRESS(f, 2196, 10); ines({ expr: f < 2196 ? 'smug' : 'grin', L: 'point', R: f >= 2196 ? 'fist' : 'hip', look: -0.5 }, [CAMP - 3.2, 0, 6.3], { dx: -0.03 * p, ...(f >= 2190 ? hop(f, 2192, 0.1, 6) : {}) }); break; }
    case 'cherch1': { tal({ expr: f < 2250 ? 'smile' : 'proud', L: 'show', holdL: 'notebook', R: 'hip', look: 0.4, headTilt: 5 }, [CAMP + 1.5, 0, -7.4], { s: 0.97 }); break; }
    case 'cherch2': { tal({ expr: 'proud', L: 'show', holdL: 'notebook', R: 'hip', look: 0.4 }, [CAMP + 1.5, 0, -7.4], { s: 0.93 }); out.push(...campusCrowd(f, T, tint)); break; }
    case 'observe': { const w = Math.floor(f / 10) % 2; tal({ expr: 'squint', L: 'show', holdL: 'notebook', R: w ? 'reach' : 'point', look: 0.8 }, [CAMP + 1.6, 0, -7.4], { s: 0.93 });
      const a = route(f, [[2355, CAMP - 3.6, 8.4], [2380, CAMP - 3.0, 6.4]]); fig('pa', 40, { expr: 'neutral', L: 'hip', R: 'hip', step: a.mv ? stepOf(a.x, a.z) : 0 }, [a.x, 0, a.z], { s: 0.93 });
      fig('pe', 45, { expr: 'smile', L: 'point', R: 'hip', look: -0.4 }, [CAMP + 0.4, 0, 6.5], { s: 0.93 }); break; }
    case 'constat': { tal({ expr: 'proud', L: 'show', holdL: 'notebook', R: 'point', look: 0.2, headTilt: 6 }, [CAMP + 1.5, 0, -7.4], { s: 0.97 }); break; }
    case 'att1': { const p = PRESS(f, 2480, 20); fig('pb', 41, { expr: 'smile', L: 'point', R: 'hip', look: -0.4 }, [CAMP - 1.7, 0, 6.5], { dx: -0.02 * p }); fig('pc', 42, { expr: 'smile', L: 'hip', R: 'hip', look: -0.4 }, [CAMP + 0.3, 0, 6.6]); break; }
    case 'att2': { const r = route(f, [[2530, CAMP + 0.8, 6.0], [2552, CAMP + 0.8, 5.2], [2570, CAMP + 0.8, 4.4]]); fig('pb', 41, { expr: 'smile', L: 'cross', R: 'cross', look: -0.4 }, [CAMP - 1.7, 0, 6.5]);
      const b = f >= 2570; fig('pd', 43, { expr: b ? 'shock' : 'nervous', L: b ? 'head' : 'hip', R: b ? 'head' : 'hip', wv: q(f * 0.5, 1), step: r.mv ? stepOf(r.x, r.z) : 0, look: -0.4 }, [r.x, 0, r.z], { ...(b ? hop(f, 2572, 0.2, 6) : {}) }); break; }
    case 'rien': { const p = PRESS(f, 2616, 16); ines({ expr: 'determined', L: 'point', R: 'hip', look: -0.5 }, [CAMP - 3.2, 0, 6.3], { dx: -0.02 * p }); break; }
    case 'change': { const calm = ramp(f, 2680, 2720); ines({ expr: calm > 0.5 ? 'smile' : 'nervous', L: 'hip', R: 'hip', look: 0, mark: calm > 0.5 ? 'heart' : undefined, marks: calm > 0.5 }, [CAMP - 3.2, 0, 6.3], { dy: 0 }); break; }
    case 'illusion': { const p = PRESS(f, 2760, 22); ines({ expr: 'smug', L: 'point', R: 'hip', look: -0.5, headTilt: 5 }, [CAMP - 3.2, 0, 6.3], { dx: -0.02 * p }); break; }
    case 'sentiment': { const p = PRESS(f, 2840, 30); ines({ expr: 'smile', L: 'point', R: 'hip', look: -0.4 }, [CAMP - 3.2, 0, 6.3], { dx: -0.02 * p }); break; }
    case 'attente': { ines({ expr: 'smile', L: 'hip', R: 'hip', look: 0.2, mark: 'note', marks: true }, [CAMP - 3.2, 0, 6.3]); fig('pa', 40, { expr: ramp(f, 2900, 2930) > 0.5 ? 'pained' : 'nervous', L: 'hip', R: 'hip', look: -0.2 }, [CAMP - 1.7, 0, 6.5], { ...tremble(f, 0.012, 4) }); break; }
    case 'attention': { ines({ expr: 'stern', L: 'point', R: 'hip', look: 0 }, [CAMP - 3.2, 0, 6.3]); leon({ expr: 'deadpan', L: 'cross', R: 'cross', look: -0.2 }, [CAMP - 1.8, 0, 6.5]); break; }
    case 'marchent': { const p = PRESS(f, 3076, 20), g = f >= 3084; fig('pa', 40, { expr: g ? 'grin' : 'neutral', L: 'point', R: 'hip', look: -0.5 }, [-3.0, 0, 6.9], { dx: -0.02 * p }); break; }
    case 'nuit': { fig('pd', 43, { expr: 'neutral', L: 'cross', R: 'cross', look: -0.3 }, [-3.0, 0, 6.9]); break; }
    case 'demande': { const p = PRESS(f, 3164, 16); leon({ expr: f < 3164 ? 'deadpan' : 'smug', L: 'point', R: 'hip', look: -0.5 }, [-3.2, 0, 6.9], { dx: -0.02 * p }); break; }
    case 'la': { const p = PRESS(f, 3236, 14); leon({ expr: 'proud', L: 'thumb', R: 'hip', look: -0.3, headTilt: 6 }, [-3.1, 0, 6.9], { dx: -0.02 * p }); break; }
    case 'prochaine': { ines({ expr: 'smug', L: 'cross', R: 'cross', look: -0.4, headTilt: 5 }, [IN[0] + 0.2, 0, IN[2]]); break; }
    case 'doigt': { const p = PRESS(f, 3426, 24); ines({ expr: 'smug', L: 'point', R: 'hip', look: -0.6 }, [IN[0] + 0.1, 0, IN[2]], { dx: -0.02 * p }); break; }
    case 'souviens': { ines({ expr: f < 3480 ? 'smug' : 'sly', L: 'hip', R: f < 3480 ? 'hip' : 'wave', wv: q(f * 0.4, 1), look: 0 }, [IN[0] + 0.1, 0, IN[2]]); break; }
    case 'rienfait': { ines({ expr: 'deadpan', L: 'cross', R: 'cross', look: -0.4 }, IN, { s: 0.95 }); out.push(...nearExtras(f, T, tint, 8)); break; }
    case 'attendu': { const pp = PRESS(f, 3640, 14); ines({ expr: f < 3640 ? 'smile' : 'determined', L: 'hip', R: 'hip', look: f < 3640 ? 0 : -0.4 }, [IN[0] + 0.05, 0, IN[2]], { dx: -0.02 * pp }); break; }
  }
  if (z === 'A' && !['hook', 'arrive', 'appuie', 'fois', 'pied', 'vert', 'traverse'].includes(id)) { /* le fond de rue vit déjà via les voitures */ }
  const fg = FGB[id];
  if (fg) { const cam = camAt(f), pk = id === 'hook' ? PRESS(f, 10, 14) : id === 'appuie' ? PRESS(f, 312, 14) : id === 'fois' ? Math.max(PRESS(f, 346, 14), PRESS(f, 373, 14), PRESS(f, 401, 14)) : id === 'plaque' ? PRESS(f, 1720, 18) : id === 'pastout' ? PRESS(f, 2196, 10) : id === 'doigt' ? PRESS(f, 3426, 24) : id === 'attendu' ? PRESS(f, 3640, 14) : id === 'pied' ? 0 : 0;
    const a = fgCard(cam, T.fgProp('button', { u: 5.2 }), { key: 'fg' + id, side: fg[0], dist: fg[1], drop: fg[2], s: fg[3] * (1 - 0.14 * pk) }); a.roll = fg[0] * 0.05 + pk * 0.04; a.y -= 0.03 * pk; out.push(a); }
  return out;
};
function jo(f, T, out, tint, pos, o) { out.push(R_(T, 'jo', life(f, 13, o), pos, { tint, s: 0.92 })); }
const campusCrowd = (f, T, tint) => crowd(T, f, { center: [CAMP, 0, 8.4], n: 7, w: 22, d: 1.4, outfits: CROWD_OUT, exprs: ['neutral', 'smile', 'grin'], seed: 6, s: 0.93 }).map((a) => ({ ...a, tint }));

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], id = S.id;
  const win = (a, b, n = 8) => ramp(f, a, a + n) * (1 - ramp(f, b - n, b));
  if (f >= 150 && f < 236) { const k = win(150, 236); out.push(FX('ny' + q(k, 1), labelCard('NEW YORK', 96, '#ffd23a', INK, k, -0.04), [0, 6.5, -1.0], 3.0)); }
  if (id === 'fois') for (const [a, n] of [[346, '1'], [373, '2'], [401, '3']]) if (f >= a && f < a + 26) { const k = ramp(f, a, a + 6) * (1 - ramp(f, a + 20, a + 26)); out.push(FX('n' + n + q(k, 1), labelCard(n, 160, '#ffd23a', INK, k, 0.05), [IN[0] + 0.9, 2.15 + (f - a) * 0.01, IN[2] - 0.4], 0.5)); }
  if (f >= 690 && f < 758) { const t = (f - 683) / 75 * 1.6; const k = win(690, 758); out.push(FX('pie' + Math.floor(t * 14) + q(k, 1), pieCard(t, k), [-3.2, 3.3, -1.0], 1.4, { roll: -0.04 })); }
  if (id === 'debut' && f >= 1032 && f < 1056) { const k = win(1032, 1056, 6); out.push(FX('ok' + q(k, 1), checkCard(k, true), [-2.3, 3.0, 5.4], 0.7)); }
  if (id === 'debr' && f >= 1262 && f < 1300) { const k = win(1262, 1300, 6); out.push(FX('x' + q(k, 1), checkCard(k, false), [CX + 2.4, 3.6, 2.2], 0.5)); }
  if (id === 'cher' && f >= 1524) { const k = ramp(f, 1524, 1534); out.push(FX('d' + q(k, 1), dollarCard(k), [-1.2, 2.9, 7.2], 0.75, { roll: Math.sin(f * 0.3) * 0.06 })); }
  if (id === 'res' && f >= 1790) { const k = ramp(f, 1790, 1800); out.push(FX('y' + q(k, 1), numCard('2004', false), [-3.6, 3.3, 6.4], 0.9, { roll: -0.05 })); }
  if (id === 'sur' && f >= 1832) { const k = ramp(f, 1832, 1842); out.push(FX('t' + q(k, 1), numCard('3 250', false, '#f7f3ea'), [-6.0, 4.2, 2.0], 2.0, { roll: 0.03 })); }
  if (id === 'moins' && f >= 1884) { const n = lerp(3250, 750, E.smooth(ramp(f, 1884, 1950))), hot = f >= 1950; out.push(FX('m' + fmt(n) + hot, numCard(hot ? '< 750' : fmt(n), hot), [20, 4.0, 2.0], 2.0, { roll: hot ? Math.sin(f * 0.8) * 0.03 : 0 })); }
  if (id === 'etonnant' && f >= 2040) { const k = win(2040, 2094); out.push(FX('is' + q(k, 1), labelCard('ISRAËL', 120, '#ffffff', '#2f6ab8', k, 0.04), [CAMP - 1, 4.8, -1.0], 1.5)); }
  if (id === 'cherch2' && f >= 2322 && f < 2358) { const k = win(2322, 2358); out.push(FX('bg' + q(k, 1), labelCard('BEN-GOURION', 70, '#ffffff', '#2f6ab8', k, -0.03), [CAMP - 1, 5.0, -3.0], 1.8)); }
  if (id === 'att1' && f >= 2500) { const k = ramp(f, 2500, 2510); out.push(FX('c1' + q(k, 1), checkCard(k, true), [CAMP - 0.9, 3.0, 4.8], 0.6)); }
  if (id === 'att2' && f >= 2572) { const k = ramp(f, 2572, 2580); out.push(FX('c2' + q(k, 1), checkCard(k, false), [CAMP + 1.1, 3.0, 3.4], 0.6)); }
  if (id === 'illusion' && f >= 2750) { const k = ramp(f, 2750, 2760); out.push(FX('l' + q(k, 1), leverCard(k), [CAMP - 1.6, 2.8, 5.4], 0.8, { roll: 0.04 })); out.push(FX('il' + q(k, 1), labelCard('ILLUSION', 92, '#ffd23a', INK, k, -0.03, 'DE CONTRÔLE'), [CAMP - 3.2, 3.0, 6.3], 0.62)); }
  if (id === 'attention' && f >= 2966) { const k = ramp(f, 2966, 2976); out.push(FX('w' + q(k, 1), warnCard(k), [CAMP - 1.6, 3.2, 5.5], 0.8, { roll: Math.sin(f * 0.4) * 0.05 })); }
  if (id === 'la' && f >= 3262 && f < 3300) { const k = win(3262, 3300, 6); out.push(FX('ok2' + q(k, 1), checkCard(k, true), [-1.4, 3.0, 5.4], 0.7)); }
  return out;
};
