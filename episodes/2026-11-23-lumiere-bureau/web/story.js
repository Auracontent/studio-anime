// « La lumière du bureau » (fiction du quotidien) — 39,4 s, 30 fps, 1181 images. Cadres calés sur phrases.json (whisper).
// Bureau (x -9..9, mur du fond z = -5,4) et chambre de Karim (x = 400). Héros : Karim (pull moutarde). Secondaire : Léa (violet). Figurants : Sam (turquoise), Jo (orange).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, tremble, follow, transition } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1181, DECK = 0;
const BX = 400;
export const SHOTS = [
  { id: 'hook', a: 0, b: 95 },        // Tous les matins, avant tout le monde, quelqu'un allume les lumières du bureau.
  { id: 'karim', a: 96, b: 135 },     // C'est Karim.
  { id: 'cafe', a: 136, b: 163 },     // Il lance la cafetière,
  { id: 'plante', a: 164, b: 205 },   // arrose la plante
  { id: 'imprim', a: 206, b: 255 },   // et débloque l'imprimante.
  { id: 'merci', a: 256, b: 294 },    // Personne ne dit merci.
  { id: 'moque', a: 295, b: 330 },    // Pire, on se moque de lui,
  { id: 'tot', a: 331, b: 378 },      // parce qu'il arrive trop tôt.
  { id: 'lundi', a: 379, b: 430 },    // Un lundi, Karim est malade. Il ne vient pas.
  { id: 'absent', a: 431, b: 465 },   // (la chaise vide, la porte qui reste fermée)
  { id: 'sombre', a: 466, b: 536 },   // Le bureau reste sombre et glacé.
  { id: 'cafef', a: 537, b: 569 },    // Le café est froid,
  { id: 'plantef', a: 570, b: 595 },  // la plante penche,
  { id: 'imprimf', a: 596, b: 650 },  // l'imprimante grince.
  { id: 'sauf', a: 651, b: 711 },     // Sauf que Léa, la cheffe, comprend.
  { id: 'repense', a: 712, b: 756 },  // Elle repense à cette lumière,
  { id: 'flash', a: 757, b: 824 },    // allumée chaque matin, depuis des années.
  { id: 'lendemain', a: 825, b: 896 },// Le lendemain, elle arrive à six heures,
  { id: 'allume', a: 897, b: 935 },   // allume les lumières
  { id: 'mug', a: 936, b: 990 },      // et pose un café sur son bureau.
  { id: 'retour', a: 991, b: 1035 },  // Ce que tu fais en silence,
  { id: 'fin2', a: 1036, b: 1093 },   // on ne le voit qu'une fois que tu t'arrêtes.
  { id: 'fin', a: 1094, b: 1180 },    // Alors, aujourd'hui, allume une lumière pour quelqu'un.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lieux ----------
const KSW = [-4.45, 0, -4.2];                 // devant l'interrupteur
const CO = [6.0, 0, -4.5], PL = [-1.0, 0, -4.7], PR = [-2.6, 0, -4.6];
const DESKK = [2.0, 0, -2.7], DOOR = [-6.5, 0, -5.0];
const KB = [BX, 0.15, -3.5];                  // Karim dans son lit

// ---------- lumière : une ambiance par acte ----------
const DARK = mood('nuit', { exposure: 1.3, gamma: 1.35 });
const DAY = mood('jour', { exposure: 1.12 });
const GLOOM = blendMood(mood('froid', { exposure: 1.1, sat: 0.9 }), mood('nuit', { exposure: 1.15, gamma: 1.2 }), 0.4);
const BED = mood('froid', { exposure: 1.18 });
const MATIN = mood('matin', { exposure: 1.18 });
const DORE = mood('dore', { exposure: 1.14 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'hook': return blendMood(DARK, DAY, ramp(f, 48, 86));
    case 'lundi': return BED;
    case 'absent': case 'sombre': case 'cafef': case 'plantef': case 'imprimf': case 'sauf': return GLOOM;
    case 'repense': return blendMood(GLOOM, MATIN, ramp(f, 736, 756));
    case 'flash': return MATIN;
    case 'lendemain': return blendMood(MATIN, DARK, ramp(f, 825, 840));
    case 'allume': return blendMood(DARK, DORE, ramp(f, 906, 934));
    case 'mug': case 'retour': case 'fin2': return DORE;
    case 'fin': return f < 1100 ? blendMood(DORE, DARK, ramp(f, 1094, 1104)) : blendMood(DARK, DAY, ramp(f, 1142, 1172));
    default: return DAY;
  }
};
const TINTS = { sombre: '#e2ecff', cafef: '#e2ecff', plantef: '#e2ecff', imprimf: '#e2ecff', sauf: '#e2ecff', absent: '#e2ecff', lundi: '#eef4ff', mug: '#fff0d4', retour: '#fff0d4', fin2: '#fff0d4' };
const tintOf = (S) => TINTS[S.id] || '#fff8ee';

// ---------- état du monde ----------
const rowsAt = (f, f0, step = 8, dur = 10) => [0, 1, 2, 3].map((i) => E.easeOut(ramp(f, f0 + i * step, f0 + i * step + dur)));
const ON = [1, 1, 1, 1], OFF = [0, 0, 0, 0];
const flashCycle = (f) => { const c = Math.floor((f - 757) / 22), l = (f - 757) % 22; return { c, l, on: l >= 9 }; };
export const worldAt = (f) => {
  const S = shotAt(f), W = { rows: ON, sw: 1, door: 0, coffee: 0, cm: 0, plant: 0, printer: { shake: 0, jam: 0, paper: 0, balls: 0 }, mugD: 0, mugCold: 0, win: 0.9, screens: 1 };
  switch (S.id) {
    case 'hook': W.rows = rowsAt(f, 50); W.sw = f >= 48 ? 1 : 0; W.win = 0.12 + 0.5 * ramp(f, 56, 90); W.screens = ramp(f, 60, 90); W.coffee = 0; break;
    case 'karim': W.coffee = 0; break;
    case 'cafe': W.cm = 1; W.coffee = E.smooth(ramp(f, 142, 163)) * 0.85; break;
    case 'plante': W.coffee = 0.85; break;
    case 'imprim': W.coffee = 0.85; W.printer = { shake: f < 232 ? 1 : 0, jam: f < 226 ? 1 : 0, paper: f >= 230 ? Math.min(4, 1 + Math.floor((f - 230) / 6)) : 0, balls: 0 }; W.door = ramp(f, 240, 255); break;
    case 'merci': W.door = 1 - ramp(f, 276, 294); W.coffee = 0.85; W.printer.paper = 4; break;
    case 'moque': case 'tot': W.coffee = 0.85; W.printer.paper = 4; W.door = 0; break;
    case 'lundi': W.rows = OFF; W.sw = 0; W.win = 0.5; break;
    case 'absent': W.rows = OFF; W.sw = 0; W.win = 0.3; W.screens = 0; W.mugD = 1; W.mugCold = 1; W.coffee = 0.5; break;
    case 'sombre': W.rows = OFF; W.sw = 0; W.win = 0.3; W.screens = 0; W.mugD = 1; W.mugCold = 1; W.coffee = 0.5; W.door = f < 484 ? 0 : 1 - ramp(f, 496, 510); break;
    case 'cafef': W.rows = OFF; W.sw = 0; W.win = 0.3; W.screens = 0; W.mugD = 1; W.mugCold = 1; W.coffee = 0.5; break;
    case 'plantef': W.rows = OFF; W.sw = 0; W.win = 0.3; W.screens = 0; W.mugD = 1; W.mugCold = 1; W.coffee = 0.5; W.plant = E.smooth(ramp(f, 572, 596)); break;
    case 'imprimf': W.rows = OFF; W.sw = 0; W.win = 0.3; W.screens = 0; W.mugD = 1; W.coffee = 0.5; W.plant = 1; W.printer = { shake: (f % 14) < 8 ? 1 : 0.3, jam: 1, paper: 0, balls: clamp(Math.floor((f - 598) / 8), 0, 6) }; break;
    case 'sauf': case 'repense': W.rows = OFF; W.sw = 0; W.win = 0.3; W.screens = 0; W.mugD = 1; W.mugCold = 1; W.coffee = 0.5; W.plant = 1; W.printer = { shake: 0, jam: 1, paper: 0, balls: 6 }; break;
    case 'flash': { const c = flashCycle(f); W.rows = c.on ? rowsAt(f - c.l + 9, f - c.l + 9, 1, 5).map((_, i) => E.easeOut(ramp(c.l, 9 + i, 14 + i))) : OFF; W.sw = c.on ? 1 : 0; W.win = 0.6; W.screens = c.on ? 1 : 0; W.plant = 0; W.coffee = 0.85; W.cm = 1; break; }
    case 'lendemain': W.rows = OFF; W.sw = 0; W.win = 0.06; W.screens = 0; W.door = E.smooth(ramp(f, 826, 842)) * (1 - ramp(f, 862, 880)); W.mugD = 0; W.plant = 1; W.printer = { shake: 0, jam: 1, paper: 0, balls: 6 }; W.coffee = 0.5; break;
    case 'allume': W.rows = rowsAt(f, 906, 7, 10); W.sw = f >= 905 ? 1 : 0; W.win = 0.06 + 0.7 * ramp(f, 912, 934); W.screens = ramp(f, 912, 934); W.plant = 1; W.printer = { shake: 0, jam: 1, paper: 0, balls: 6 }; break;
    case 'mug': W.mugD = f >= 958 ? 1 : 0; W.win = 0.85; W.plant = 1 - ramp(f, 960, 990) * 0.4; W.door = ramp(f, 976, 990); W.printer = { shake: 0, jam: 0, paper: 0, balls: 6 }; break;
    case 'retour': W.mugD = 1; W.door = 0; W.plant = 0.6 * (1 - ramp(f, 1010, 1035)); W.printer = { shake: 0, jam: 0, paper: 0, balls: 6 }; break;
    case 'fin2': W.mugD = 1; W.plant = 0.0; W.printer = { shake: 0, jam: 0, paper: 0, balls: 6 }; break;
    case 'fin': W.rows = f < 1100 ? ON : rowsAt(f, 1140, 5, 8); W.sw = f >= 1138 ? 1 : 0; W.win = f < 1100 ? 0.8 : 0.1 + 0.7 * ramp(f, 1142, 1172); W.screens = f < 1100 ? 1 : ramp(f, 1148, 1172); W.plant = 0; W.mugD = 1; W.printer = { shake: 0, jam: 0, paper: 0, balls: 6 };
      if (f < 1104) { W.rows = ON.map((v, i) => v * (1 - ramp(f, 1096 + i, 1104))); W.sw = 0; } break;
  }
  return W;
};

// ---------- positions des personnages ----------
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const SAM0 = [-0.7, 0, -1.8], SAM1 = [-3.3, 0, -1.9], JO0 = [0.2, 0, -1.3], JO1 = [-3.9, 0, -1.4], KMER = [-2.2, 0, -3.0];
const KWALK = (f) => lerp3([-3.7, 0, -2.9], [-2.7, 0, -1.8], E.smooth(ramp(f, 96, 135)));
const SAMP = (f) => lerp3(SAM0, SAM1, E.smooth(ramp(f, 256, 296)));
const JOP = (f) => lerp3(JO0, JO1, E.smooth(ramp(f, 256, 300)));
const LEAW = (f) => lerp3([-6.3, 0, -4.7], KSW, E.smooth(ramp(f, 830, 894)));
const KARIMIN = (f) => lerp3([-1.0, 0, -2.5], [0.6, 0, -1.7], E.smooth(ramp(f, 991, 1022)));
const LEAD = [-0.4, 0, -1.5];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const mixCam = (a, b, t) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], t)), look: a.look.map((v, i) => lerp(v, b.look[i], t)), fov: lerp(a.fov, b.fov, t) });
const SWCAM = frameOn(KSW, { headW: 0.3, yaw: 0, frameY: 0.42 });
const CAMS = {
  hook: [{ f: 0, ...SWCAM }, R(40, [SWCAM.pos[0] + 0.1, SWCAM.pos[1] + 0.05, SWCAM.pos[2]], SWCAM.look, 40), R(95, [-1.2, 2.1, 7.6], [-1.6, 1.7, -2.6], 56)],
  cafe: [R(136, [5.5, 1.5, 0.9], [5.4, 1.5, -4.4], 42), R(163, [5.6, 1.45, 0.5], [5.45, 1.5, -4.4], 38)],
  plante: [R(164, [-0.6, 1.4, 0.9], [-0.65, 1.45, -4.4], 42), R(205, [-0.65, 1.4, 0.5], [-0.65, 1.45, -4.4], 39)],
  imprim: [R(206, [-2.1, 1.4, 0.9], [-2.2, 1.35, -4.4], 42), R(255, [-2.15, 1.4, 0.5], [-2.2, 1.35, -4.4], 38)],
  merci: [K(256, [-2.4, 0, -2.4], { headW: 0.21, yaw: 4, frameY: 0.42 }), K(330, [-3.1, 0, -2.4], { headW: 0.25, yaw: -4, frameY: 0.42 })],
  tot: [R(331, [-2.8, 1.75, 1.3], [-2.9, 1.95, -4.4], 50), R(378, [-2.7, 1.7, 1.0], [-2.9, 1.9, -4.4], 46)],
  lundi: [K(379, KB, { headW: 0.26, yaw: 10, frameY: 0.4 }), K(430, KB, { headW: 0.34, yaw: -6, frameY: 0.4 })],
  absent: [R(431, [3.3, 0.95, -0.4], [2.0, 0.85, -3.4], 36), R(448, [0.8, 1.0, -0.2], [2.1, 0.9, -3.3], 36), R(465, [-4.6, 1.5, -0.4], [-6.5, 1.3, -5.0], 40)],
  sombre: [R(466, [-2.6, 1.9, 7.4], [-0.4, 1.35, -2.0], 56), R(508, [-1.2, 1.7, 4.8], [-1.0, 1.35, -1.2], 50), K2(536, [-1.2, 0, -1.0], [0.4, 0, -0.7], { headW: 0.26, yaw: -8, frameY: 0.42 })],
  cafef: [R(537, [5.4, 1.5, 0.1], [5.4, 1.45, -4.4], 40), R(569, [5.6, 1.45, -0.3], [5.4, 1.45, -4.4], 36)],
  plantef: [R(570, [-0.7, 1.2, -1.2], [-1.0, 1.0, -4.7], 36), R(595, [-0.65, 0.95, -1.7], [-1.0, 1.0, -4.7], 33)],
  imprimf: [R(596, [-2.1, 1.35, 0.5], [-2.2, 1.3, -4.4], 42), R(650, [-2.15, 1.35, 0.1], [-2.2, 1.3, -4.4], 37)],
  sauf: [K(651, LEAD, { headW: 0.2, yaw: 12, frameY: 0.44 }), K(690, LEAD, { headW: 0.3, yaw: -4, frameY: 0.42 }), K(711, LEAD, { headW: 0.34, yaw: 0, frameY: 0.42 })],
  repense: [K(712, LEAD, { headW: 0.34, yaw: 5, frameY: 0.42 }), K(756, LEAD, { headW: 0.38, yaw: -5, frameY: 0.42 })],
  merciA: [K(1036, [2.5, 0, -1.5], { headW: 0.24, yaw: 8, frameY: 0.44 }), K(1093, [2.5, 0, -1.5], { headW: 0.27, yaw: -6, frameY: 0.44 })],
};
const FLASHC = [K(757, KSW, { headW: 0.3, yaw: 14, frameY: 0.42 }), K(824, KSW, { headW: 0.36, yaw: 6, frameY: 0.42 })];
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return camFromKeys(CAMS.hook, f, { creep: 0.0006 });
    case 'karim': return follow(KWALK, f, { headW: 0.32, yaw: -14, lag: 6, lead: 0.5 });
    case 'cafe': { const c = camFromKeys(CAMS.cafe, f); return f >= 150 && f < 160 ? shake(c, f, 150, 0.02, 8) : c; }
    case 'plante': return camFromKeys(CAMS.plante, f);
    case 'imprim': { let c = camFromKeys(CAMS.imprim, f); c = shake(c, f, 213, 0.1, 12); c = shake(c, f, 224, 0.07, 10); return c; }
    case 'merci': return camFromKeys(CAMS.merci, f);
    case 'moque': { const c = camFromKeys(CAMS.merci, f); return shake(c, f, 312, 0.03, 10); }
    case 'tot': return camFromKeys(CAMS.tot, f);
    case 'lundi': return shake(camFromKeys(CAMS.lundi, f), f, 396, 0.08, 12);
    case 'absent': return camFromKeys(CAMS.absent, f);
    case 'sombre': return camFromKeys(CAMS.sombre, f);
    case 'cafef': return camFromKeys(CAMS.cafef, f);
    case 'plantef': return camFromKeys(CAMS.plantef, f);
    case 'imprimf': { let c = camFromKeys(CAMS.imprimf, f); for (const s of [604, 616, 628, 640]) c = shake(c, f, s, 0.05, 9); return c; }
    case 'sauf': return shake(camFromKeys(CAMS.sauf, f), f, 690, 0.1, 10);
    case 'repense': return camFromKeys(CAMS.repense, f);
    case 'flash': { let c = camFromKeys(FLASHC, f); const l = flashCycle(f); if (l.l === 9) c = shake(c, f, f, 0.04, 6); return c; }
    case 'lendemain': return follow(LEAW, f, { headW: 0.3, yaw: -12, lag: 7, lead: 0.5 });
    case 'allume': return camFromKeys([{ f: 897, ...frameOn(KSW, { headW: 0.3, yaw: -10, frameY: 0.42 }) }, R(915, [-4.2, 1.7, 1.2], [-4.4, 1.6, -4.4], 42), R(935, [-2.4, 2.2, 7.0], [-2.2, 1.7, -2.8], 56)], f, { creep: 0.0006 });
    case 'mug': return camFromKeys([R(936, [2.9, 1.25, 1.0], [2.1, 0.95, -2.6], 44), R(962, [2.7, 1.2, 0.4], [2.2, 1.0, -2.6], 38), R(990, [2.8, 1.3, 0.8], [2.0, 1.0, -2.6], 36)], f);
    case 'retour': return follow(KARIMIN, f, { headW: 0.3, yaw: -8, lag: 6, lead: 0.4 });
    case 'fin2': return camFromKeys(CAMS.merciA, f);
    case 'fin': { if (f < 1130) return camFromKeys([{ f: 1094, ...frameOn(KSW, { headW: 0.26, yaw: 16, frameY: 0.42 }) }, { f: 1130, ...frameOn(KSW, { headW: 0.3, yaw: 0, frameY: 0.42 }) }], f); return camFromKeys([{ f: 1130, ...frameOn(KSW, { headW: 0.3, yaw: 0, frameY: 0.42 }) }, R(1180, SWCAM.pos.map((v, i) => (i === 0 ? v + 0.02 : v)), SWCAM.look, 40)], f, { creep: 0.0005 }); }
  }
  return camFromKeys(CAMS.hook, f);
};
// transitions qui voyagent (changements de lieu / de temps)
const TR = [{ a: 379, type: 'drop' }, { a: 431, type: 'rise' }, { a: 651, type: 'whip', dir: 1 }, { a: 757, type: 'push' }, { a: 825, type: 'whip', dir: -1 }, { a: 991, type: 'whip', dir: 1 }, { a: 1094, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
const BEAM = { at: [3.0, 3.1, -5.0], yaw: 0, pitch: 0.55, len: 7, r: 1.3, col: '#fff2c8', a: 0.28 };
export const envAt = (f) => {
  const S = shotAt(f), w = worldAt(f);
  const day = { motes: 0.6, beams: [BEAM] }, steam = (at, f0, f1) => ({ at, f0, f1, rate: 10, size: 0.26, col: '#ffffff', rise: 0.5 });
  switch (S.id) {
    case 'hook': return { motes: 0.5, beams: f > 60 ? [{ ...BEAM, a: 0.28 * ramp(f, 60, 90) }] : [] };
    case 'karim': return day;
    case 'cafe': return { ...day, smoke: [steam([CO[0], 1.42, CO[2] + 0.18], 146, 163), steam([CO[0] + 1.5, 1.2, CO[2] + 0.05], 150, 163)], sparks: [{ at: [CO[0], 1.0, CO[2] + 0.2], f0: 142, f1: 163, rate: 14, col: '#7a4a2a', speed: 0.8, size: 1 }] };
    case 'plante': return { ...day, spray: [180, 190, 199].map((f0) => ({ at: [-1.45, 1.1, -4.55], f0, n: 90, power: 1.6, col: '#bfe4ff' })), smoke: [steam([CO[0], 1.4, CO[2]], 164, 205)] };
    case 'imprim': return { ...day, sparks: [{ at: [PR[0] + 0.3, 1.5, PR[2] + 0.3], f0: 213, f1: 218, rate: 70, col: '#ffe08a', speed: 3 }, { at: [PR[0] + 0.3, 1.5, PR[2] + 0.3], f0: 224, f1: 228, rate: 50, col: '#ffe08a', speed: 2.4 }] };
    case 'merci': case 'moque': case 'tot': return day;
    case 'lundi': return { motes: 0.5, smoke: [] };
    case 'absent': return { motes: 0.6, smoke: [{ at: [2.5, 0.88, -2.55], f0: 431, f1: 465, rate: 3, size: 0.2, col: '#cfe0f4', rise: 0.15 }] };
    case 'sombre': return { motes: 0.8, smoke: [{ at: [-1.4, 1.5, -1.0], f0: 466, f1: 536, rate: 7, size: 0.35, col: '#e8f2ff', rise: 0.2 }, { at: [0.2, 1.5, -0.7], f0: 466, f1: 536, rate: 7, size: 0.35, col: '#e8f2ff', rise: 0.2 }] };
    case 'cafef': return { motes: 0.7, smoke: [{ at: [4.9, 1.55, -3.5], f0: 537, f1: 569, rate: 6, size: 0.3, col: '#e8f2ff', rise: 0.2 }] };
    case 'plantef': return { motes: 0.8 };
    case 'imprimf': return { motes: 0.7, sparks: [604, 616, 628, 640].map((f0) => ({ at: [PR[0] + 0.1, 1.3, PR[2] + 0.4], f0, f1: f0 + 4, rate: 50, col: '#ff6a4a', speed: 2.2 })), smoke: [{ at: [PR[0], 1.5, PR[2]], f0: 596, f1: 650, rate: 5, size: 0.4, col: '#b8b8c0', rise: 0.5 }] };
    case 'sauf': case 'repense': return { motes: 0.9 };
    case 'flash': return { motes: 0.9, beams: [BEAM], sparks: [{ at: [KSW[0] - 0.7, 1.35, KSW[2] + 0.4], f0: 757 + 9, f1: 757 + 12, rate: 40, col: '#fff08a', speed: 2 }, { at: [KSW[0] - 0.7, 1.35, KSW[2] + 0.4], f0: 779 + 9, f1: 779 + 12, rate: 40, col: '#fff08a', speed: 2 }, { at: [KSW[0] - 0.7, 1.35, KSW[2] + 0.4], f0: 801 + 9, f1: 801 + 12, rate: 40, col: '#fff08a', speed: 2 }] };
    case 'lendemain': return { motes: 0.7 };
    case 'allume': return { motes: 0.7, sparks: [{ at: [KSW[0] - 0.7, 1.35, KSW[2] + 0.4], f0: 905, f1: 909, rate: 50, col: '#fff08a', speed: 2 }], beams: f > 918 ? [{ ...BEAM, a: 0.3 * ramp(f, 918, 934) }] : [] };
    case 'mug': return { motes: 0.9, beams: [{ ...BEAM, col: '#ffd8a0' }], smoke: f >= 958 ? [steam([2.5, 0.9, -2.55], 958, 990)] : [] };
    case 'retour': return { motes: 1, beams: [{ ...BEAM, col: '#ffd8a0' }], smoke: [steam([2.5, 0.9, -2.55], 991, 1035)] };
    case 'fin2': return { motes: 1, beams: [{ ...BEAM, col: '#ffd8a0' }], smoke: [steam([2.5, 0.9, -2.55], 1036, 1093)], sparks: [{ at: [-1.2, 2.4, -1.5], f0: 1036, f1: 1093, rate: 10, col: '#ffd23a', speed: 1.4, size: 1.6 }] };
    case 'fin': return { motes: 0.6, beams: f > 1150 ? [{ ...BEAM, a: 0.3 * ramp(f, 1150, 1172) }] : [], sparks: [{ at: [KSW[0] - 0.7, 1.35, KSW[2] + 0.4], f0: 1138, f1: 1142, rate: 50, col: '#fff08a', speed: 2 }] };
  }
  return { motes: 0.5 };
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.karim = { tunic: '#e0a81c', skin: '#b98a62', hair: '#2a1e1a', beard: '#2a1e1a', brows: '#2a1e1a' };
  O.lea = { tunic: '#7a3aa8', dress: '#7a3aa8', skin: '#f3cfae', hair: '#4a2a1a', brows: '#3a2418' };
  O.sam = { tunic: '#18b8d8', skin: '#e8b890', hair: '#6a4026', glasses: true, brows: '#4a3222' };
  O.jo = { tunic: '#e8782a', skin: '#7a4a30', hair: '#1e1714', moustache: '#1e1714', brows: '#1e1714', stout: true };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const stepOf = (f, f0, f1, k = 0.07) => (f > f0 && f < f1 ? { step: q((f * k) % 1, 2) } : {});
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  switch (S.id) {
    case 'hook': { const click = f >= 48, reach = f >= 14;
      fig('karim', 4, { expr: click ? 'grin' : 'nervous', L: reach ? 'reach' : 'hip', R: 'lift', holdR: 'mug', look: -0.8 }, KSW, { marks: false, dy: f >= 46 && f < 52 ? 0.03 : 0 }); break; }
    case 'karim': fig('karim', 4, { expr: 'grin', L: 'hip', R: 'lift', holdR: 'mug', look: 0.5, ...stepOf(f, 96, 128, 0.075) }, KWALK(f), { marks: false, dy: Math.abs(Math.sin(f * 0.23)) * 0.02 }); break;
    case 'cafe': { const press = f >= 142 && f < 150;
      fig('karim', 4, { expr: f > 150 ? 'smile' : 'grin', L: 'reach', R: 'hip', look: 0.7, lift: press ? 0.1 : 0 }, [4.95, 0, -3.9], { marks: false, dy: press ? -0.02 : 0 }); break; }
    case 'plante': { const pour = f >= 176 && f < 202;
      fig('karim', 4, { expr: 'smile', L: pour ? 'lift' : 'carry', R: 'hip', holdL: 'can', look: -0.7 }, [-0.1, 0, -3.9], { marks: false, roll: pour ? -0.06 : 0 }); break; }
    case 'imprim': { const hit = f >= 210 && f < 232, k = hop(f, 211, 0.12, 6);
      fig('karim', 4, { expr: f < 228 ? 'stubborn' : 'grin', L: hit ? 'push' : 'hip', R: 'hip', look: -0.9 }, [-1.7, 0, -3.9], { marks: false, dx: f >= 212 && f < 218 ? -0.1 : 0, ...(f >= 211 && f < 229 ? { dy: k.dy, sx: k.sx, sy: k.sy } : {}) }); break; }
    case 'merci': case 'moque': {
      const sam = SAMP(f), jo = JOP(f), turn = f >= 296, lau = f >= 300;
      fig('karim', 4, { expr: f < 276 ? 'smile' : 'pained', L: f < 284 ? 'wave' : 'hang', R: 'lift', holdR: 'mug', wv: q(f * 0.4, 1), look: 0.8 }, KMER, { marks: f < 290 ? false : undefined });
      fig('sam', 20, { expr: turn ? 'laugh' : 'neutral', L: turn ? 'point' : 'hip', R: 'lift', holdR: 'mug', look: turn ? 0.9 : -0.9, ...stepOf(f, 256, 296) }, sam, lau ? { dy: Math.abs(Math.sin(f * 0.5)) * 0.04, roll: Math.sin(f * 0.5) * 0.05 } : {});
      fig('jo', 22, { expr: turn ? 'laugh' : 'neutral', L: 'lift', holdL: 'mug', R: turn ? 'point' : 'hip', look: turn ? 0.9 : -0.9, ...stepOf(f, 256, 300, 0.065) }, jo, lau ? { dy: Math.abs(Math.sin(f * 0.5 + 1)) * 0.04, roll: Math.sin(f * 0.5 + 1) * 0.05 } : {});
      break; }
    case 'tot': { const lau = Math.sin(f * 0.55);
      fig('karim', 4, { expr: 'pained', L: 'hang', R: 'lift', holdR: 'mug', look: -0.4 }, KMER);
      fig('sam', 20, { expr: 'laugh', L: 'up', R: 'hip', look: -0.1 }, [-3.3, 0, -1.9], { dy: Math.abs(lau) * 0.05, roll: lau * 0.05 });
      fig('jo', 22, { expr: 'laugh', L: 'hip', R: 'point', look: 0.8 }, [-3.9, 0, -1.4], { dy: Math.abs(Math.sin(f * 0.55 + 1)) * 0.05, roll: Math.sin(f * 0.55 + 1) * 0.05 });
      break; }
    case 'lundi': { const sneeze = f >= 394 && f < 402;
      fig('karim', 4, { expr: sneeze ? 'shock' : 'pained', L: 'hang', R: 'lift', holdR: 'paper', look: 0 }, KB, { blob: false, marks: false, ...tremble(f, 0.006), dy: 0.0, ...(sneeze ? { sy: 1.04, sx: 0.97 } : {}) }); break; }
    case 'sombre': { const sh = tremble(f, 0.012, 2), sh2 = tremble(f, 0.012, 5), a = f - 466;
      fig('sam', 20, { expr: 'nervous', L: 'cross', R: 'cross', look: 0.4 }, lerp3([-1.9, 0, -0.9], [-1.2, 0, -1.0], E.smooth(ramp(f, 466, 520))), sh);
      fig('jo', 22, { expr: 'pained', L: 'cross', R: 'cross', look: -0.4 }, lerp3([0.9, 0, -0.5], [0.4, 0, -0.7], E.smooth(ramp(f, 466, 520))), sh2); break; }
    case 'cafef': { const sh = tremble(f, 0.01, 3);
      fig('sam', 20, { expr: f < 552 ? 'squint' : 'pained', L: 'cross', R: 'lift', holdR: 'mugCold', look: 0.9 }, [5.0, 0, -3.6], sh); break; }
    case 'plantef': { fig('jo', 22, { expr: 'pained', L: 'cheek', R: 'hip', look: -0.7 }, [0.3, 0, -3.7], tremble(f, 0.006, 4)); break; }
    case 'imprimf': { const bang = [604, 616, 628, 640].some((s) => f >= s && f < s + 5);
      fig('sam', 20, { expr: 'pained', L: bang ? 'push' : 'head', R: 'head', wv: q(f * 0.4, 1), look: -0.9 }, [-1.6, 0, -3.8], { dx: bang ? -0.08 : 0 });
      fig('jo', 22, { expr: 'nervous', L: 'cross', R: 'cross', look: -0.7 }, [-0.5, 0, -3.5], tremble(f, 0.01, 4)); break; }
    case 'sauf': { const comp = f >= 690, a = f >= 676;
      fig('lea', 30, { expr: comp ? 'shock' : (a ? 'stern' : 'stubborn'), L: 'cross', R: comp ? 'up' : 'cross', look: comp ? -0.2 : 0.7 }, LEAD, { dy: f >= 689 && f < 697 ? 0.05 : 0 });
      fig('sam', 20, { expr: 'nervous', L: 'cross', R: 'cross', look: 0.4 }, [-1.9, 0, -2.6], { ...tremble(f, 0.01, 2), marks: false });
      fig('jo', 22, { expr: 'pained', L: 'cross', R: 'cross', look: -0.4 }, [0.9, 0, -2.5], { ...tremble(f, 0.01, 5), marks: false }); break; }
    case 'repense': fig('lea', 30, { expr: f < 736 ? 'squint' : 'smile', L: 'cross', R: 'cheek', look: -0.6 }, LEAD, { marks: false }); break;
    case 'flash': { const c = flashCycle(f), h = hop(f, 757 + c.c * 22 + 9, 0.12, 5);
      fig('karim', 4, { expr: c.on ? 'grin' : 'smile', L: c.l >= 4 ? 'reach' : 'hip', R: 'lift', holdR: 'mug', look: -0.8 }, KSW, { marks: false, ...(c.on ? { dy: h.dy } : {}) }); break; }
    case 'lendemain': fig('lea', 30, { expr: 'neutral', L: 'hip', R: 'lift', holdR: 'mug', look: 0.2, ...stepOf(f, 828, 892, 0.065) }, LEAW(f), { marks: false }); break;
    case 'allume': { const click = f >= 905;
      fig('lea', 30, { expr: click ? 'smile' : 'neutral', L: f >= 898 ? 'reach' : 'hip', R: 'hip', look: -0.8 }, KSW, { marks: false, dy: f >= 903 && f < 909 ? 0.03 : 0 }); break; }
    case 'mug': { const down = f >= 944 && f < 960, put = f >= 958;
      fig('lea', 30, { expr: put ? 'smile' : 'neutral', L: 'hip', R: 'reach', holdR: put ? undefined : 'mug', lift: down ? 0.05 : 0, look: 0.6 }, [1.75, 0, -1.8], { marks: false, roll: down ? -0.04 : 0 }); break; }
    case 'retour': { const arrive = f >= 1016, k = hop(f, 1020, 0.14, 7);
      fig('karim', 4, { expr: arrive ? (f > 1026 ? 'grin' : 'shock') : 'neutral', L: arrive ? 'up' : 'hang', R: 'lift', holdR: arrive ? undefined : 'mug', look: -0.2, ...stepOf(f, 991, 1016, 0.075) }, KARIMIN(f), { ...(f >= 1026 ? { mark: 'heart' } : {}), ...(f >= 1020 && f < 1040 ? { dy: k.dy, sx: k.sx, sy: k.sy } : {}) }); break; }
    case 'fin2': { const nod = Math.sin(clamp((f - 1040) / 16) * Math.PI) * 0.06;
      fig('karim', 4, { expr: 'grin', L: 'hang', R: 'lift', holdR: 'mug', look: 0.8 }, [1.8, 0, -1.6], { mark: 'heart', dy: Math.abs(Math.sin(f * 0.18)) * 0.02 });
      fig('lea', 30, { expr: 'smile', L: 'hip', R: 'thumb', look: -0.7, headTilt: q(nod * 40, 0) }, [3.2, 0, -1.5], { dy: nod * 0.4 });
      fig('sam', 20, { expr: 'nervous', L: 'hang', R: 'cheek', look: -0.6 }, [4.4, 0, -2.2], { marks: false, ...tremble(f, 0.004, 3) });
      fig('jo', 22, { expr: 'pained', L: 'cross', R: 'cross', look: -0.8 }, [5.2, 0, -2.4], { marks: false }); break; }
    case 'fin': { const click = f >= 1138;
      fig('lea', 30, { expr: click ? (f > 1160 ? 'grin' : 'smile') : 'neutral', L: f >= 1130 ? 'reach' : 'hip', R: f > 1160 ? 'thumb' : 'lift', holdR: f > 1160 ? undefined : 'mug', look: f > 1160 ? 0 : -0.8 }, KSW, { marks: false, dy: f >= 1136 && f < 1142 ? 0.03 : 0 }); break; }
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], c = (k, ...a) => k;
  if (S.id === 'karim' && f >= 100) { const k = ramp(f, 100, 112), p = KWALK(f); out.push(FX('nm' + q(k, 1), labelCard('Karim', 96, '#ffd23a', INK, k, -0.05), [p[0] + 0.25, 2.55, p[2]], 0.5)); }
  if (S.id === 'merci' && f >= 262 && f < 292) { const k = ramp(f, 262, 272) * (1 - ramp(f, 284, 292)); out.push(FX('sl' + q(k, 1), labelCard('Salut !', 96, '#ffffff', '#3f9ad8', k, 0.05), [KMER[0] + 0.1, 2.5, KMER[2]], 0.45)); }
  if (S.id === 'tot' && f >= 336) { const k = ramp(f, 336, 348); out.push(FX('h6' + q(k, 1), labelCard('6 h', 150, '#ffd23a', INK, k, -0.05), [-2.4, 2.6, -3.0], 0.5)); }
  if (S.id === 'imprim' && f >= 211 && f < 231) { const t = q((f - 211) / 20, 2); out.push(FX('bm' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [-2.2, 0.75, -3.6], 0.9)); }
  if (S.id === 'lundi') { const k = ramp(f, 383, 395); out.push(FX('lu' + q(k, 1), labelCard('LUNDI', 112, '#ffffff', '#2f56a8', k, -0.05), [BX - 1.2, 2.7, -3.6], 0.6));
    if (f >= 394) { const k2 = ramp(f, 394, 402) * (1 - ramp(f, 420, 430)); out.push(FX('at' + q(k2, 1), labelCard('ATCHOUM !', 62, '#ffffff', '#c8312c', k2, 0.08), [BX + 1.1, 2.3, -3.2], 0.55)); } }
  if (S.id === 'cafef' && f >= 544) { const k = ramp(f, 544, 556); out.push(FX('br' + q(k, 1), labelCard('Brrr…', 100, '#ffffff', '#5a8ad0', k, -0.06), [5.7, 2.55, -3.6], 0.5)); }
  if (S.id === 'imprimf' && f >= 604) { const k = ramp(f, 604, 614) * (1 - ramp(f, 640, 650)); out.push(FX('cr' + q(k, 1), labelCard('GRRR', 112, '#ffffff', '#c8312c', k, 0.07), [-2.2, 2.55, -3.8], 0.5)); }
  if (S.id === 'lendemain' && f >= 832) { const k = ramp(f, 832, 844) * (1 - ramp(f, 880, 892)), p = LEAW(f); out.push(FX('h6b' + q(k, 1), labelCard('6 h', 150, '#ffd23a', INK, k, -0.05), [p[0] + 0.3, 2.55, p[2]], 0.5)); }
  if (S.id === 'imprim' || S.id === 'mug') { /* rien */ }
  return out;
};
