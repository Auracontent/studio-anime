// « Zoé et le vélo » (fiction du quotidien) — 44,4 s, 30 fps, 1331 images. Cadres calés sur phrases.json (whisper).
// Cour d'école (x -24..18, immeuble au fond à droite, balcon de Malo x = 4). Héroïne : Zoé (pull rouge, nattes). Secondaire : Malo (sweat turquoise). Figurants : élèves jaune / vert / orange.
// Tout le monde roule vers -x (vers l'école). Zoé roule sur la voie z = BZ.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, tremble, follow, transition, crane, crowd, fgCard, fallOver } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1331, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 64 },        // Zoé tombe de son vélo, encore une fois,
  { id: 'ecole', a: 65, b: 114 },     // devant toute l'école.
  { id: 'autres', a: 115, b: 157 },   // Les autres roulent déjà. Ils rient,
  { id: 'poings', a: 158, b: 214 },   // et elle serre les poings.
  { id: 'vide', a: 215, b: 265 },     // Alors, chaque soir, quand la cour est vide,
  { id: 'recom', a: 266, b: 297 },    // elle recommence.
  { id: 'c1', a: 298, b: 325 },       // Une chute.
  { id: 'c2', a: 326, b: 360 },       // Deux chutes.
  { id: 'c10', a: 361, b: 394 },      // Dix chutes,
  { id: 'genou', a: 395, b: 426 },    // le genou rouge,
  { id: 'roue', a: 427, b: 472 },     // la roue tordue.
  { id: 'fenetre', a: 473, b: 522 },  // Son grand frère Malo la regarde par la fenêtre.
  { id: 'aussi', a: 523, b: 549 },    // Lui aussi,
  { id: 'riait', a: 550, b: 579 },    // il riait.
  { id: 'sauf', a: 580, b: 613 },     // Sauf que ce soir-là,
  { id: 'descend', a: 614, b: 648 },  // il descend.
  { id: 'tient', a: 649, b: 735 },    // Il tient la selle et court derrière elle.
  { id: 'lache', a: 736, b: 780 },    // Il lâche.
  { id: 'seule', a: 781, b: 832 },    // Zoé roule seule,
  { id: 'droite', a: 833, b: 870 },   // toute droite,
  { id: 'vent', a: 871, b: 916 },     // le vent dans le visage,
  { id: 'rendre', a: 917, b: 946 },   // sans s'en rendre compte.
  { id: 'lendemain', a: 947, b: 996 },// Le lendemain,
  { id: 'passer', a: 997, b: 1044 },  // toute l'école la regarde passer.
  { id: 'rit', a: 1045, b: 1093 },    // Plus personne ne rit.
  { id: 'prouve', a: 1094, b: 1137 }, // Tu sais ce que ça prouve ?
  { id: 'nul', a: 1138, b: 1195 },    // On ne tombe pas parce qu'on est nul.
  { id: 'apprendre', a: 1196, b: 1249 }, // On tombe pour apprendre.
  { id: 'fin', a: 1250, b: 1330 },    // Alors, la prochaine fois que tu tombes, relève-toi une fois de plus.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière : une ambiance par acte ----------
const DAY = mood('jour', { exposure: 1.08 });
const SOIR = mood('soir', { exposure: 1.3, gamma: 1.2 });
const NUIT = mood('nuit', { exposure: 1.4, gamma: 1.4 });
const CREP = blendMood(SOIR, NUIT, 0.4);
const DORE = mood('dore', { exposure: 1.12 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'vide': return blendMood(DAY, SOIR, ramp(f, 215, 232));
    case 'recom': case 'c1': case 'c2': case 'c10': case 'genou': case 'roue': return SOIR;
    case 'fenetre': return blendMood(SOIR, CREP, ramp(f, 473, 500));
    case 'aussi': return CREP;
    case 'riait': return DAY;
    case 'sauf': return CREP;
    case 'descend': return blendMood(CREP, DORE, ramp(f, 614, 640));
    case 'tient': case 'lache': case 'seule': case 'droite': case 'vent': case 'rendre': return DORE;
    case 'lendemain': return blendMood(DORE, DAY, ramp(f, 947, 962));
    case 'apprendre': return blendMood(DAY, DORE, ramp(f, 1196, 1225) * (1 - ramp(f, 1235, 1249)));
    default: return DAY;
  }
};
const TINTS = { vide: '#ffd9b8', recom: '#ffd9b8', c1: '#ffd9b8', c2: '#ffd9b8', c10: '#ffd9b8', genou: '#ffd9b8', roue: '#ffd9b8', fenetre: '#dbe0ff', aussi: '#dbe0ff', sauf: '#dbe0ff', descend: '#ffe2b8', tient: '#ffe2b8', lache: '#ffe2b8', seule: '#ffe2b8', droite: '#ffe2b8', vent: '#ffe2b8', rendre: '#ffe2b8', apprendre: '#fff0d8' };
const tintOf = (S) => TINTS[S.id] || '#fff8ee';

// ---------- Zoé et son vélo : une seule chronologie, vélo et personnage restent cohérents d'un plan à l'autre ----------
const BZ = -0.4, CZ = BZ - 0.28;
const D = (f) => (f < 652 ? 0 : f < 692 ? 0.07 * (f - 652) ** 2 / 80 : 0.07 * (f - 652 - 20));     // Malo pousse, Zoé accélère doucement
const D2 = (f) => { const t = clamp(f - 1070, 0, 28); return f < 1070 ? 0.15 * (f - 975) : 14.25 + 0.15 * t - 0.15 * t * t / 56; };   // le lendemain : elle passe, puis freine
const CIRC = [-5.2, -0.9], CR_ = 2.4, circA = (f) => 2.4 + (f - 1196) * 0.075;                          // « On tombe pour apprendre » : elle tourne autour de Malo
const circPos = (f) => { const a = circA(f); return { x: CIRC[0] + CR_ * Math.cos(a), z: CIRC[1] + CR_ * Math.sin(a), ry: -Math.atan2(CR_ * Math.cos(a), -CR_ * Math.sin(a)) }; };
const XC = 5.428, X0H = XC - 0.054 * 28;                                                              // fin = début : le vélo repart du point de chute, à la vitesse du plan 1
const finX = (f) => 6.4 - 0.054 * (f - 1250);
const SEG = [
  { a: 0, b: 22, t: 'ride', fn: (f) => X0H - 0.054 * f, wob: [12, 22] },
  { a: 22, b: 166, t: 'crash', x: X0H - 0.054 * 22, u0: 150, u1: 166 },
  { a: 166, b: 215, t: 'stand', x: X0H - 0.054 * 22 },
  { a: 215, b: 266, t: 'walk', fn: (f) => 15 - 0.12 * (f - 215) },
  { a: 266, b: 272, t: 'stand', x: 9, mount: 272 },
  { a: 272, b: 305, t: 'ride', fn: (f) => 9 - 0.07 * (f - 272) },
  { a: 305, b: 321, t: 'crash', x: 6.69, u0: 312, u1: 320 },
  { a: 321, b: 323, t: 'stand', x: 6.69, mount: 323 },
  { a: 323, b: 336, t: 'ride', fn: (f) => 6.69 - 0.09 * (f - 323) },
  { a: 336, b: 351, t: 'crash', x: 5.52, u0: 343, u1: 350 },
  { a: 351, b: 356, t: 'stand', x: 5.52, mount: 356 },
  { a: 356, b: 362, t: 'ride', fn: (f) => 5.52 - 0.1 * (f - 356) },
  { a: 362, b: 371, t: 'crash', x: 4.92, u0: 366, u1: 370 },
  { a: 371, b: 372, t: 'stand', x: 4.92, mount: 372 },
  { a: 372, b: 378, t: 'ride', fn: (f) => 4.92 - 0.1 * (f - 372) },
  { a: 378, b: 386, t: 'crash', x: 4.32, u0: 381, u1: 385 },
  { a: 386, b: 387, t: 'stand', x: 4.32, mount: 387 },
  { a: 387, b: 391, t: 'ride', fn: (f) => 4.32 - 0.1 * (f - 387) },
  { a: 391, b: 394, t: 'crash', x: 3.92, u0: 400, u1: 401 },
  { a: 394, b: 427, t: 'sit', x: 3.92 },
  { a: 427, b: 478, t: 'fix', x: 3.92 },
  { a: 478, b: 518, t: 'ride', fn: (f) => 7 - 0.05 * (f - 478) },
  { a: 518, b: 556, t: 'crash', x: 5.0, u0: 540, u1: 556 },
  { a: 556, b: 640, t: 'stand', x: 5.0 },
  { a: 640, b: 652, t: 'stand', x: 5.0, mount: 652 },
  { a: 652, b: 947, t: 'ride', fn: (f) => 5.0 - D(f) },
  { a: 947, b: 975, t: 'stand', x: 10.4 },
  { a: 975, b: 1098, t: 'ride', fn: (f) => 10 - D2(f) },
  { a: 1098, b: 1196, t: 'stand', x: -6.35 },
  { a: 1196, b: 1250, t: 'circ' },
  { a: 1250, b: 1268, t: 'ride', fn: finX, wob: [1256, 1268] },
  { a: 1268, b: 1300, t: 'crash', x: XC, u0: 1284, u1: 1296 },
  { a: 1300, b: 1304, t: 'stand', x: XC, mount: 1303 },
  { a: 1304, b: 1332, t: 'ride', fn: (f) => XC - 0.054 * (f - 1303) },
];
const BENT = (f) => (f < 22 ? 0 : f < 300 ? 0.6 : f < 361 ? 0.8 : f < 445 ? 1 : f < 472 ? lerp(1, 0.04, E.smooth(ramp(f, 445, 470))) : 0);
const bikeAt = (x, o = {}) => ({ x, z: BZ, ry: Math.PI, rot: -x / 0.3, vis: true, bent: BENT(o.f ?? 0), ...o });
const TIP = { roll: -0.5, y: 0.04 };
const zoeAt = (f) => {
  const s = SEG.find((g) => f >= g.a && f < g.b) || (f < 0 ? SEG[0] : SEG[SEG.length - 1]);
  const stepOf = (x) => q(((-x) * 1.3) % 1, 2);
  switch (s.t) {
    case 'ride': { const x = s.fn(f), wob = s.wob && f >= s.wob[0] ? Math.sin((f - s.wob[0]) * 1.1) * 0.1 * Math.min(1, (f - s.wob[0]) / 5) : 0, mh = hop(f, s.a - 3, 0.18, 6);
      return { k: 'ride', x, bike: bikeAt(x, { f, roll: wob * 0.4 }), card: { pos: [x + 0.05, 0.16 + mh.dy, CZ], step: stepOf(x), roll: wob, sx: mh.sx, sy: mh.sy } }; }
    case 'crash': { const fo = fallOver(f, s.a, -1, 9), up = f >= s.u0, k = ramp(f, s.u0, s.u1), roll = up ? 1.45 * (1 - E.smooth(k)) : fo.roll, tipped = f < s.u1;
      return { k: up ? 'rise' : 'down', x: s.x, bike: bikeAt(s.x, { f, ...(tipped ? TIP : {}), rot: -s.x / 0.3 }), card: { pos: [s.x + 0.05 + 1.05 * E.smooth(k), 0.16 * (1 - E.smooth(clamp((f - s.a) / 8))), CZ + 0.78 * E.smooth(clamp((f - s.a) / 8))], roll, step: 0 } }; }
    case 'stand': { const m = s.mount ? E.smooth(ramp(f, s.mount - 6, s.mount)) : 0, hp = s.mount ? hop(f, s.mount - 4, 0.18, 6) : { dy: 0, sx: 1, sy: 1 };
      return { k: 'stand', x: s.x, bike: bikeAt(s.x, { f }), card: { pos: [lerp(s.x + 1.1, s.x + 0.05, m), lerp(0, 0.16, m) + hp.dy, lerp(BZ + 0.5, CZ, m)], step: 0, sx: hp.sx, sy: hp.sy } }; }
    case 'walk': { const x = s.fn(f); return { k: 'walk', x, bike: bikeAt(x, { f }), card: { pos: [x + 0.75, 0, CZ + 0.3], step: q(((f * 0.065)) % 1, 2) } }; }
    case 'sit': return { k: 'sit', x: s.x, bike: bikeAt(s.x, { f, ...TIP }), card: { pos: [s.x + 0.9, 0, CZ + 0.35], step: 0 } };
    case 'fix': { const up = E.smooth(ramp(f, 427, 436)); return { k: 'fix', x: s.x, bike: bikeAt(s.x, { f, roll: TIP.roll * (1 - up), y: TIP.y * (1 - up) }), card: { pos: [s.x + 0.85, 0, CZ + 0.25], step: 0 } }; }
    case 'circ': { const c = circPos(f); return { k: 'ride', x: c.x, bike: bikeAt(c.x, { f, z: c.z, ry: c.ry, rot: circA(f) * CR_ / 0.3 }), card: { pos: [c.x, 0.16, c.z - 0.28], step: q((circA(f) * 1.6) % 1, 2) } }; }
  }
  return null;
};
// Malo
const DOOR = [9.5, 0, -6.2], BAL = [4, 3.28, -7.35];
const bxAt = (f) => 5.0 - D(f);
const MALO_HOLD = (f) => [bxAt(f) + 0.95, 0, CZ];
const MALO_REL = (f) => [bxAt(745) + 0.95 - 0.5 * E.easeOut(ramp(f, 745, 780)), 0, CZ];
const malo = (f) => {
  if (f < 616) return { pos: BAL, mode: 'bal' };
  if (f < 650) { const k = E.smooth(ramp(f, 616, 650)), p = lerp3(DOOR, [bxAt(650) + 0.95, 0, CZ], k); return { pos: [p[0], Math.abs(Math.sin(f * 0.62)) * 0.07, p[2]], mode: 'run' }; }
  if (f < 745) return { pos: MALO_HOLD(f), mode: 'hold' };
  if (f < 947) return { pos: MALO_REL(f), mode: 'free' };
  return { pos: [-4.7, 0, -0.5], mode: 'stand' };
};
function lerp3(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)); }

export const worldAt = (f) => {
  const S = shotAt(f), Z = zoeAt(f), bikes = [Z.bike, { vis: false }, { vis: false }, { vis: false }];
  if (f >= 65 && f <= 214) { const kb = (x, z, i) => ({ x, z, ry: Math.PI, rot: -x / 0.3, vis: true }); bikes[1] = kb(4.0 - 0.1 * (f - 115), -1.5); bikes[2] = kb(7.5 - 0.085 * (f - 115), -2.5); bikes[3] = kb(1.0 - 0.095 * (f - 115), -3.4); }
  if (S.id === 'riait') bikes[0] = bikeAt(-1.4, { f, z: -5.3, ...TIP });
  const win = f >= 473 && f < 947 ? 1 : 0.0;
  return { win: S.id === 'riait' ? 0 : win, bikes };
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.85, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const ZC = (f) => zoeAt(f).card.pos;                                   // position de la carte de Zoé
const ZS = (dx) => (f) => { const p = ZC(f); return [p[0] + dx, p[1], p[2]]; };    // idem, décalée (Zoé à droite du cadre : la mascotte entre à gauche)
const KID1 = (f) => [4.05 - 0.1 * (f - 115), 0.16, -1.78];
const MALO_C = (f) => malo(f).pos;
const BALC = frameOn(BAL, { headW: 0.3, yaw: 6, frameY: 0.4, s: 1.08 });
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': { const c = follow(ZS(0.5), f, { headW: 0.3, yaw: -14, lag: 4, lead: 0.3, s: 0.85, frameY: 0.4 }); return f >= 22 ? shake(c, f, 22, 0.1, 12) : c; }
    case 'ecole': return crane([X0H - 1.2, 0, -1.5], f, 65, 50, { from: { r: 5, h: 1.5, yaw: -14, lookUp: 1.2 }, to: { r: 27, h: 9, yaw: -30, lookUp: 0.6 }, fov: 44 });
    case 'autres': return follow(KID1, f, { headW: 0.27, yaw: -10, lag: 6, lead: 0.4, s: 0.85 });
    case 'poings': return camFromKeys([K(158, ZC(158), { headW: 0.3, yaw: 8, low: 12, frameY: 0.4 }), K(214, ZC(214), { headW: 0.36, yaw: -6, low: 16, frameY: 0.4 })], f);
    case 'vide': return crane([6, 0, -0.5], f, 215, 50, { from: { r: 26, h: 10, yaw: 28, lookUp: 0.5 }, to: { r: 7.5, h: 1.4, yaw: 8, lookUp: 1.1 }, fov: 42 });
    case 'recom': return follow(ZS(0.4), f, { headW: 0.3, yaw: -12, lag: 6, lead: 0.5, s: 0.85, low: 8 });
    case 'c1': case 'c2': case 'c10': { const c = follow(ZS(0.3), f, { headW: S.id === 'c10' ? 0.26 : 0.3, yaw: -14, lag: 6, lead: 0.3, s: 0.85, dutch: S.id === 'c10' ? 4 : 0 });
      return [305, 336, 362, 378, 391].reduce((cc, k) => shake(cc, f, k, 0.09, 10), c); }
    case 'genou': return camFromKeys([K(395, ZC(395), { headW: 0.34, yaw: 14, frameY: 0.4 }), K(426, ZC(426), { headW: 0.4, yaw: 6, frameY: 0.42 })], f);
    case 'roue': return camFromKeys([R(427, [5.0, 0.95, 1.9], [3.8, 0.45, -0.4], 36), R(450, [4.6, 0.6, 1.2], [3.5, 0.4, -0.4], 32), R(472, [4.9, 0.9, 1.5], [3.8, 0.6, -0.4], 34)], f);
    case 'fenetre': return crane(BAL, f, 473, 50, { from: { r: 26, h: 3, yaw: -10, lookUp: -2.4 }, to: { r: 5.5, h: 0.4, yaw: 5, lookUp: 1.2 }, fov: 42 });
    case 'aussi': return camFromKeys([{ f: 523, ...BALC }, { f: 549, ...frameOn(BAL, { headW: 0.36, yaw: -4, frameY: 0.4, s: 1.08 }) }], f);
    case 'riait': return camFromKeys([K(550, [-1.9, 0, -0.5], { headW: 0.27, yaw: -6, low: 10, frameY: 0.42, s: 1 }), K(579, [-1.9, 0, -0.5], { headW: 0.3, yaw: 6, low: 14, frameY: 0.42, s: 1 })], f);
    case 'sauf': return camFromKeys([{ f: 580, ...BALC }, { f: 613, ...frameOn(BAL, { headW: 0.38, yaw: 0, frameY: 0.4, s: 1.08, low: 8 }) }], f);
    case 'descend': return follow(MALO_C, f, { headW: 0.26, yaw: 18, lag: 5, lead: 0.5, s: 1.08, low: 6 });
    case 'tient': { if (f < 692) return follow(ZS(0.2), f, { headW: 0.2, yaw: 14, lag: 6, lead: 0.5, s: 1.0, frameY: 0.42 });
      return camFromKeys([{ f: 692, ...frameOn([bxAt(692) + 0.4, 0, CZ], { headW: 0.2, yaw: 14, frameY: 0.42 }) }, R(735, [bxAt(735) + 4.5, 5.5, 14], [bxAt(735) - 1.5, 0.8, -0.3], 44)], f); }
    case 'lache': return camFromKeys([K(736, [MALO_REL(736)[0] - 0.4, 0, CZ], { headW: 0.2, yaw: 10, s: 1.05, frameY: 0.42 }), K(756, [MALO_REL(760)[0] - 1.0, 0, CZ], { headW: 0.16, yaw: -6, s: 1.0, frameY: 0.42 }), R(780, [bxAt(780) + 2.2, 0.9, 3.4], [bxAt(780) - 2.5, 0.9, -0.5], 38)], f);
    case 'seule': return follow(ZS(0.3), f, { headW: 0.3, yaw: 22, lag: 7, lead: 0.6, s: 0.85, low: 6 });
    case 'droite': return follow(ZC, f, { headW: 0.32, yaw: -78, lag: 5, lead: 1.4, s: 0.85, low: 10 });
    case 'vent': return follow(ZC, f, { headW: 0.4, yaw: -40, lag: 5, lead: 0.8, s: 0.85, low: 4, frameY: 0.42 });
    case 'rendre': return camFromKeys([R(917, [bxAt(917) - 4.2, 1.3, 3.2], [bxAt(917) + 0.5, 1.2, -0.4], 42), R(946, [bxAt(946) - 3.6, 1.5, 3.6], [bxAt(946) + 5.5, 1.4, -0.4], 46)], f);
    case 'lendemain': return crane([0, 0, -1.5], f, 947, 50, { from: { r: 22, h: 3.6, yaw: 38, lookUp: 1.2 }, to: { r: 12, h: 1.3, yaw: 10, lookUp: 1.2 }, fov: 44 });
    case 'passer': return follow(ZC, f, { headW: 0.26, yaw: 12, lag: 6, lead: 0.7, s: 0.85, frameY: 0.4 });
    case 'rit': return camFromKeys([K(1045, [-2.2, 0, -1.1], { headW: 0.2, yaw: 4, frameY: 0.4, low: 4, s: 0.9 }), K(1093, [-2.2, 0, -1.1], { headW: 0.24, yaw: -4, frameY: 0.4, low: 10, s: 0.9 })], f);
    case 'prouve': return camFromKeys([K(1094, ZC(1100), { headW: 0.3, yaw: 8, low: 14, frameY: 0.4 }), K(1137, ZC(1100), { headW: 0.36, yaw: -4, low: 18, frameY: 0.4 })], f);
    case 'nul': return camFromKeys([{ f: 1138, ...frameTwoZM(0.27, 10) }, { f: 1195, ...frameTwoZM(0.31, -6) }], f);
    case 'apprendre': return camFromKeys([R(1196, [CIRC[0] + 9, 4.0, 8.5], [CIRC[0], 0.9, CIRC[1]], 44), R(1249, [CIRC[0] - 6, 2.4, 8.5], [CIRC[0] + 0.5, 1.0, CIRC[1]], 42)], f);
    case 'fin': { const c = follow(ZS(0.5), f, { headW: 0.3, yaw: -14, lag: 4, lead: 0.3, s: 0.85, frameY: 0.4 }); return shake(c, f, 1268, 0.1, 12); }
  }
  return baseCam(0);
};
function frameTwoZM(headW, yaw) { const a = [-6.1, 0, -0.55], b = [-4.7, 0, -0.5]; return frameOn([(a[0] + b[0]) / 2, 0, -0.5], { headW, yaw, frameY: 0.4, s: 0.95, low: 6 }); }
const TR = [{ a: 215, type: 'rise' }, { a: 473, type: 'rise' }, { a: 550, type: 'push' }, { a: 580, type: 'whip', dir: 1 }, { a: 614, type: 'whip', dir: -1 }, { a: 947, type: 'whip', dir: -1 }, { a: 1250, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
const FG = { poings: 'leaves', prouve: 'leaves', roue: 'tool', tient: 'leaves' };
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return FG[shotAt(f).id] ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
const dust = (x, f0) => ({ at: [x, 0.25, BZ], f0, n: 70, power: 1.5, col: '#cfc8d6' });
const CRASHES = [[22, X0H - 0.054 * 22], [305, 6.69], [336, 5.52], [362, 4.92], [378, 4.32], [391, 3.92], [518, 5.0], [1268, XC]];
const SUN = { at: [14, 4.2, 4], yaw: -2.0, pitch: 0.12, len: 24, r: 3.4, col: '#ffd8a0', a: 0.2 };
export const envAt = (f) => {
  const S = shotAt(f), sp = CRASHES.filter(([c]) => f >= c && f < c + 40).map(([c, x]) => dust(x, c));
  switch (S.id) {
    case 'poings': return { motes: 0.3, spray: sp };
    case 'vide': case 'recom': return { motes: 0.7, spray: sp };
    case 'c1': case 'c2': case 'c10': case 'genou': return { motes: 0.8, spray: sp, smoke: CRASHES.filter(([c]) => f >= c && f < c + 24).map(([c, x]) => ({ at: [x, 0.3, BZ], f0: c, f1: c + 18, rate: 6, size: 0.3, col: '#d8d0c8', rise: 0.2 })) };
    case 'roue': return { motes: 0.8, sparks: [{ at: [3.55, 0.45, BZ + 0.3], f0: 456, f1: 462, rate: 50, col: '#fff08a', speed: 2 }] };
    case 'fenetre': case 'aussi': case 'sauf': return { motes: 0.9, spray: sp };
    case 'descend': return { motes: 1, beams: [{ ...SUN, a: 0.2 * ramp(f, 622, 645) }] };
    case 'tient': case 'lache': return { motes: 1, beams: [SUN] };
    case 'seule': case 'droite': case 'vent': case 'rendre': return { motes: 1.1, wind: [-5, 0], beams: [SUN] };
    case 'lendemain': case 'passer': case 'rit': return { motes: 0.4 };
    case 'apprendre': return { motes: 0.8, beams: [{ ...SUN, a: 0.18 }] };
    case 'fin': return { motes: 0.3, spray: sp };
  }
  return { motes: 0.4 };
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.zoe = { tunic: '#d6322e', skin: '#a9724a', hair: '#1e1714', braids: '#1e1714', ribbon: '#ffd23a', brows: '#1e1714' };
  O.malo = { tunic: '#18b8d8', skin: '#b88660', cap: '#2a3a6a', hair: '#1e1714', brows: '#1e1714', thin: true, legs: 1.12 };
  O.kidA = { tunic: '#f2c230', skin: '#f0c8a0', hair: '#6a4026', brows: '#4a3222' };
  O.kidB = { tunic: '#8fd14f', skin: '#7a4a30', hair: '#1e1714', brows: '#1e1714' };
  O.kidC = { tunic: '#e8782a', skin: '#e8b890', hair: '#c8782a', brows: '#8a4a1a', stout: true };
  O.kidD = { tunic: '#7a3aa8', skin: '#c58e66', hair: '#2a1e1a', brows: '#2a1e1a' };
  O.kidE = { tunic: '#e05a9a', skin: '#f3cfae', hair: '#e8c46a', brows: '#8a6a2a' };
  O.kidF = { tunic: '#3a6ad8', skin: '#a9724a', hair: '#1e1714', brows: '#1e1714', stout: true };
  O.kidG = { tunic: '#14a88a', skin: '#e8b890', hair: '#4a2a1a', brows: '#3a2418' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
// carte « genou » : une jambe, le genou écorché et le pansement qu'on colle dessus
const kneeCard = (k) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k * 2)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520);
  panel(g, 30, 330, 540, 380, '#fff3d8'); g.lineJoin = 'round'; g.lineCap = 'round';
  const leg = (w, c) => { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); g.moveTo(110, 410); g.lineTo(300, 520); g.lineTo(190, 650); g.stroke(); };
  leg(124, INK); leg(100, '#a9724a');
  g.fillStyle = INK; g.beginPath(); g.arc(300, 520, 66, 0, 6.283); g.fill(); g.fillStyle = '#a9724a'; g.beginPath(); g.arc(300, 520, 54, 0, 6.283); g.fill();
  g.fillStyle = '#d8322e'; g.beginPath(); g.ellipse(300, 522, 38, 30, 0.3, 0, 6.283); g.fill(); g.fillStyle = '#a81e22'; g.beginPath(); g.ellipse(306, 528, 22, 16, 0.3, 0, 6.283); g.fill();
  const pk = E.back(clamp((k - 0.45) * 3)); g.save(); g.translate(300, 520); g.rotate(-0.5); g.scale(pk, pk); g.fillStyle = '#f2d4a8'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-72, -26, 144, 52, 22); g.fill(); g.stroke(); g.fillStyle = '#e0b886'; g.fillRect(-26, -22, 52, 44); g.restore(); g.restore(); };
const bellCard = (k) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(-0.08 + Math.sin(k * 30) * 0.05); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, '#ffd23a'); TXT(g, 'Dring !', 300, 555, 100, '#271925', 0); g.restore(); };

// ---------- acteurs ----------
const EXZ = [[0, 'nervous'], [12, 'shock'], [22, 'dazed'], [120, 'pained'], [150, 'stubborn'], [215, 'determined'], [305, 'shock'], [309, 'dazed'], [320, 'stubborn'], [323, 'determined'], [336, 'shock'], [340, 'dazed'], [350, 'determined'], [362, 'shock'], [366, 'dazed'], [378, 'shock'], [381, 'dazed'], [391, 'shock'], [394, 'pained'], [427, 'determined'], [473, 'determined'], [518, 'shock'], [522, 'dazed'], [540, 'stubborn'], [640, 'nervous'], [736, 'determined'], [758, 'smile'], [781, 'grin'], [871, 'laugh'], [947, 'neutral'], [975, 'proud'], [1094, 'proud'], [1138, 'grin'], [1196, 'laugh'], [1250, 'nervous'], [1268, 'shock'], [1272, 'dazed'], [1284, 'stubborn'], [1300, 'determined'], [1312, 'nervous']];
const exprZ = (f) => EXZ.reduce((a, [k, e]) => (f >= k ? e : a), 'neutral');
const kidRide = (f, T, who, seed, bx, bz, expr, tint) => R_(T, who, life(f, seed, { expr, L: 'push', R: 'push', run: true, step: q(((-bx) * 1.3) % 1, 2), look: 0.5 }), [bx + 0.05, 0.16, bz - 0.28], { s: 0.85, tint, marks: false, dy: Math.abs(Math.sin(bx * 2.2)) * 0.02 });
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S), Z = zoeAt(f);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const push = (a) => a && out.push(a);
  // ---- Zoé (toujours la même carte, la même tenue) ----
  const zk = Z.k, ex = exprZ(f), c = Z.card;
  const zPose = (() => {
    if (zk === 'ride') return { L: 'push', R: 'push', run: true, step: c.step };
    if (zk === 'down') return { L: 'flail', R: 'flail', wv: q(f * 0.5, 1) };
    if (zk === 'rise') return { L: 'hip', R: 'push' };
    if (zk === 'walk') return { L: 'push', R: 'push', step: c.step, run: false };
    if (zk === 'sit') return { L: 'cheek', R: 'hip', sit: true, seat: false };
    if (zk === 'fix') return { L: 'push', R: 'lift' };
    if (S.id === 'poings') return { L: 'hip', R: 'fist' };
    if (S.id === 'prouve' || S.id === 'nul') return { L: 'hip', R: S.id === 'nul' ? 'fist' : 'hip' };
    return { L: 'hip', R: 'hip' };
  })();
  if (S.id !== 'riait') {
    const o = { expr: ex, ...zPose, look: ex === 'dazed' ? 0 : -0.5 };
    if (S.id === 'vent') { o.headTilt = 8; }
    fig('zoe', 4, o, c.pos, { s: 0.85, roll: c.roll || 0, sx: c.sx ?? 1, sy: c.sy ?? 1, marks: undefined, ...(zk === 'sit' ? {} : {}) });
  }
  const mal = malo(f), mp = mal.pos;
  const malo_ = (o, ex2 = {}) => fig('malo', 6, o, mp, { s: 1.08, ...ex2 });
  switch (S.id) {
    case 'hook': case 'ecole': case 'autres': case 'poings': {
      const lau = (i) => ({ dy: Math.abs(Math.sin(f * 0.5 + i)) * 0.03, marks: false });
      if (f >= 65 && f <= 214) {
        const kx = [4.0 - 0.1 * (f - 115), 7.5 - 0.085 * (f - 115), 1.0 - 0.095 * (f - 115)], kz = [-1.5, -2.5, -3.4], who = ['kidA', 'kidB', 'kidC'], exs = [f >= 158 ? 'laugh' : 'laugh', 'laugh', 'grin'];
        for (let i = 0; i < 3; i++) push(kidRide(f, T, who[i], 20 + i * 2, kx[i], kz[i], exs[i], tint)); }
      if (f < 65) for (let i = 0; i < 3; i++) { const x = [5.4, 6.9, 8.4][i], z = -1.8 - i * 0.5; fig(['kidA', 'kidB', 'kidC'][i], 20 + i * 2, { expr: f > 26 ? 'laugh' : 'shock', L: f > 26 ? 'point' : 'up', R: 'hip', look: -0.8 }, [x, 0, z], { s: 0.85, ...(f > 26 ? lau(i) : {}) }); }
      break; }
    case 'aussi': case 'sauf': malo_({ expr: S.id === 'aussi' ? 'pained' : (f < 598 ? 'pained' : 'determined'), L: 'cross', R: 'cross', look: -0.3 }, { marks: false }); break;
    case 'fenetre': malo_({ expr: f < 510 ? 'neutral' : 'pained', L: 'hip', R: 'cheek', look: 0.1 }, { marks: false }); break;
    case 'riait': {
      const lau = (i) => ({ dy: Math.abs(Math.sin(f * 0.55 + i)) * 0.04, roll: Math.sin(f * 0.55 + i) * 0.05, marks: false });
      fig('malo', 6, { expr: f < 566 ? 'smug' : 'laugh', L: 'point', R: 'hip', look: 0.9 }, [-1.9, 0, -0.5], { s: 1.08, ...lau(0) });
      fig('kidA', 20, { expr: 'laugh', L: 'up', R: 'point', look: 0.9 }, [-3.1, 0, -0.9], { s: 0.9, ...lau(1) });
      fig('kidB', 22, { expr: 'laugh', L: 'point', R: 'hip', look: 0.9 }, [-0.6, 0, -1.0], { s: 0.9, ...lau(2) });
      fig('zoe', 4, { expr: 'dazed', L: 'flail', R: 'flail', wv: q(f * 0.5, 1) }, [-2.2, 0, -4.9], { s: 0.85, roll: 1.45, marks: false });
      break; }
    case 'descend': malo_({ expr: 'determined', L: 'push', R: 'push', run: true, step: q((f * 0.09) % 1, 2) }, { marks: undefined }); break;
    case 'tient': { const hold = f >= 649;
      malo_({ expr: f < 700 ? 'determined' : 'grin', L: 'push', R: 'push', run: true, step: q((f * 0.085) % 1, 2), look: -0.8, tilt: 10 }, { marks: false }); break; }
    case 'lache': { const rel = f >= 745;
      malo_({ expr: rel ? 'grin' : 'determined', L: rel ? 'up' : 'push', R: rel ? 'up' : 'push', run: !rel, step: rel ? 0 : q((f * 0.085) % 1, 2), look: -0.8 }, { mark: f >= 758 ? 'heart' : undefined, marks: rel ? undefined : false, dy: rel && f < 760 ? Math.abs(Math.sin((f - 745) * 0.3)) * 0.06 : 0 }); break; }
    case 'seule': case 'droite': case 'vent': break;
    case 'rendre': { const j = Math.abs(Math.sin(f * 0.35)) * 0.08;
      fig('malo', 6, { expr: 'laugh', L: 'up', R: 'up', look: -0.4 }, [MALO_REL(f)[0], 0, CZ], { s: 1.08, mark: 'heart', dy: j }); break; }
    case 'lendemain': case 'passer': case 'rit': {
      const cheer = f >= 1045 ? 0 : 0;
      const row = crowd(T, f, { center: [-1.5, 0, -3.3], n: 16, w: 20, d: 2.4, outfits: ['kidD', 'kidE', 'kidF', 'kidG', 'kidA', 'kidB', 'kidC'], exprs: f < 1045 ? ['shock', 'shock', 'smile', 'grin', 'shock'] : ['smile', 'grin', 'smile', 'laugh'], seed: 5, cheer: f >= 1045 ? 0.5 : 0.1, arms: ['up', 'hang', 'up', 'wave'] });
      for (const a of row) out.push({ ...a, tint });
      if (S.id === 'rit') { const o = 1045, shk = (i) => ({ dy: 0, marks: undefined });
        fig('kidA', 20, { expr: f < 1075 ? 'laugh' : 'shock', L: f < 1075 ? 'point' : 'hang', R: 'hip', look: 0.8 }, [-1.0, 0, -1.2], { s: 0.9, ...(f < 1075 ? { dy: Math.abs(Math.sin(f * 0.5)) * 0.03 } : {}) });
        fig('kidB', 22, { expr: f < 1068 ? 'laugh' : 'shock', L: f < 1068 ? 'up' : 'head', R: f < 1068 ? 'point' : 'head', wv: q(f * 0.4, 1), look: 0.8 }, [-2.3, 0, -1.0], { s: 0.9 });
        fig('kidC', 24, { expr: f < 1080 ? 'smug' : 'pained', L: 'cross', R: 'cross', look: 0.8 }, [-3.5, 0, -1.3], { s: 0.9, ...(f >= 1080 ? tremble(f, 0.006, 3) : {}) }); }
      break; }
    case 'prouve': break;
    case 'nul': { const k = E.smooth(ramp(f, 1138, 1160));
      fig('malo', 6, { expr: 'grin', L: 'hip', R: 'thumb', look: -0.6 }, [-4.7, 0, -0.5], { s: 1.08, dy: Math.abs(Math.sin(f * 0.25)) * 0.015 }); break; }
    case 'apprendre': fig('malo', 6, { expr: 'grin', L: 'up', R: 'up', look: 0.4 }, [CIRC[0], 0, CIRC[1]], { s: 1.08, mark: f > 1210 ? 'heart' : undefined, dy: Math.abs(Math.sin(f * 0.3)) * 0.03 }); break;
  }
  // objets au premier plan, flous (profondeur)
  if (FG[S.id] && S.id !== 'tient') { const cam = camAt(f); out.push(fgCard(cam, T.fgProp(FG[S.id], { seed: 2 }), { key: 'fg' + S.id, side: S.id === 'roue' ? -1 : 1, dist: 1.15, drop: S.id === 'roue' ? 0.6 : 0.5, s: S.id === 'roue' ? 0.45 : 0.55 })); }
  if (S.id === 'tient' && f >= 700) { const cam = camAt(f); out.push(fgCard(cam, T.fgProp('leaves', { seed: 3 }), { key: 'fgt', side: -1, dist: 1.1, drop: 0.55, s: 0.55 })); }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], zp = zoeAt(f).card.pos;
  const num = (txt, f0, f1, col = '#ffd23a') => { if (f >= f0 && f < f1) { const k = ramp(f, f0, f0 + 8) * (1 - ramp(f, f1 - 5, f1)); out.push(FX('n' + txt + q(k, 1), labelCard(txt, 150, col, INK, k, -0.05), [zp[0] + 0.75, 2.3, zp[2]], 0.5)); } };
  if (S.id === 'c1') num('1', 306, 326);
  if (S.id === 'c2') num('2', 337, 360);
  if (S.id === 'c10') { const n = Math.min(10, 3 + Math.floor((f - 361) / 3.4)); if (f >= 361 && f < 394) out.push(FX('c' + n, labelCard(String(n), 150, n === 10 ? '#ff5a4a' : '#ffd23a', INK, 1, -0.05), [zp[0] + 0.75, 2.3, zp[2]], 0.5 + (n === 10 ? 0.1 : 0), { })); }
  if (S.id === 'genou' && f >= 398) { const k = ramp(f, 398, 424); out.push(FX('kn' + q(k, 1), kneeCard(k), [zp[0] + 0.55, 1.5, zp[2] + 0.2], 0.42)); }
  if (S.id === 'passer' && f >= 1010 && f < 1040) { const k = ramp(f, 1010, 1018) * (1 - ramp(f, 1032, 1040)); out.push(FX('dr' + q(k, 1), bellCard(k), [zp[0], 2.6, zp[2]], 0.5)); }
  if (S.id === 'rit' && f >= 1048 && f < 1068) { const k = ramp(f, 1048, 1056) * (1 - ramp(f, 1060, 1068)); out.push(FX('dr2' + q(k, 1), bellCard(k), [-3.0, 2.6, -0.2], 0.5)); }
  return out;
};
