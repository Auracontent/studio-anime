// « Les pigeons du siège » — 46.16 s, 30 fps, 1385 images. Phrases : ../phrases.json. Plan de tournage : ../PLAN.md
import { M as E, camFromKeys, frameOn, frameTwo, shake, transition, hop, fallOver, tremble, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1385, DECK = 0;
const IX = 3000;

// ---------- plans (une phrase = une action) ----------
export const SHOTS = [
  { id: 'hook', a: 0, b: 139 },        // Ces pigeons ont livré cent mille lettres… attachées à une plume.
  { id: 'siege', a: 140, b: 196 },     // Paris était encerclé par l'armée prussienne,
  { id: 'facteur', a: 197, b: 264 },   // et plus aucun facteur ne passait.
  { id: 'ballon', a: 265, b: 331 },    // Alors on a lancé des ballons chargés de pigeons,
  { id: 'retour', a: 332, b: 390 },    // qui devaient rentrer en ville.
  { id: 'lourd', a: 391, b: 438 },     // Mais un pigeon ne porte presque rien,
  { id: 'pages', a: 439, b: 516 },     // et les familles écrivaient des pages entières.
  { id: 'idee', a: 517, b: 620 },      // Un photographe, René Dagron, a eu une idée folle :
  { id: 'photo', a: 621, b: 705 },     // photographier les lettres en minuscule.
  { id: 'film', a: 706, b: 807 },      // Des pages entières tenaient sur un film plus léger qu'une plume.
  { id: 'envol', a: 808, b: 866 },     // Le pigeon décollait, sous la neige,
  { id: 'faucons', a: 867, b: 927 },   // avec des faucons qui guettaient.
  { id: 'sauf', a: 928, b: 981 },      // Sauf que… sur trois cents oiseaux,
  { id: 'soixante', a: 982, b: 1049 }, // une soixantaine seulement a atteint Paris.
  { id: 'bureau', a: 1050, b: 1176 },  // À l'arrivée, on projetait le film sur un mur, et on recopiait chaque lettre.
  { id: 'total', a: 1177, b: 1288 },   // Au total, plus de cent mille messages sont passés par le ciel.
  { id: 'fin', a: 1289, b: 1384 },     // Le courrier le plus léger du monde tenait à une plume.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const SH = Object.fromEntries(SHOTS.map((s) => [s.id, s]));
const first = (id) => SH[id].a, last = (id) => SH[id].b;

// ---------- lumière : une ambiance par acte ----------
const FROID = mood('froid', { el: 22 });
export const lightFor = (S, f) => {
  const id = S.id;
  switch (id) {
    case 'hook': return mood('froid', { el: 17, sunI: 2.0 });
    case 'siege': case 'facteur': return FROID;
    case 'ballon': return blendMood(FROID, 'matin', ramp(f, 265, 300));
    case 'retour': return mood('matin');
    case 'lourd': case 'pages': return mood('lampe', { hemi: 1.5, sunI: 3.0, ao: 0.6 });
    case 'idee': case 'photo': return mood('lampe', { hemi: 1.5, sunI: 3.0, ao: 0.6 });
    case 'film': return blendMood(mood('lampe', { hemi: 1.5, sunI: 3.0, ao: 0.6 }), 'dore', ramp(f, 706, 760));
    case 'envol': return blendMood(FROID, 'tempete', ramp(f, 808, 840));
    case 'faucons': return mood('tempete', { hemi: 1.4 });
    case 'sauf': case 'soixante': return blendMood(mood('tempete', { hemi: 1.4 }), FROID, ramp(f, 928, 960));
    case 'bureau': return mood('lampe', { hemi: 1.5, sunI: 3.0, ao: 0.6 });
    case 'total': return mood('dore');
    default: return mood('dore', { el: 20 });
  }
};

// ---------- lieux ----------
const rad = (d) => (d * Math.PI) / 180;
const rel = (at, yaw, dx, dy, dz) => { const a = rad(yaw); return [at[0] + dx * Math.cos(a) + dz * Math.sin(a), at[1] + dy, at[2] - dx * Math.sin(a) + dz * Math.cos(a)]; };
const V = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const RE_SIEGE = [4, 0, 0.3], PA = [2.7, 0, 0.5], PB = [5.4, 0, 0.35];
const PTR = [22.6, 0, 0.5], RE_FAC = [21.5, 0, 0.5], MAILBOX = [24.2, 0, -0.4];
const SQ = [43, 0, 0.3];
const MA = [IX - 26.1, 0, 0.5], RE_M = [IX - 25.3, 0, 0.35];          // mère (derrière la table) et René (mansarde)
const RE_AT = [IX - 4.8, 0, 0.4];                                       // René dans l'atelier
const RE_FILM = [IX + 0.9, 0, -0.9];
const RE_OUT = [62, 0, 0.3];                                            // le lâcher
const RE_SAUF = [34, 0, 0.3];
const CL_A = [IX + 11.4, 0, 0.1], CL_B = [IX + 21.9, 0, -0.9];          // employés du bureau
const RE_TOT = [14.4, 0, 0.4], MO_TOT = [13.3, 0, 0.5], OLD_TOT = [15.5, 0, 0.4];

// ---------- le pigeon (objet-vedette) : position par plan ----------
const hookPos = (f) => [2 + f * 0.075, 2.5 + 0.1 * Math.sin(f * 0.11), 0];
const P_RETOUR = (f) => { const t = ramp(f, 332, 390); return [lerp(-63, -36, E.smooth(t)), lerp(11.4, 8.4, t) + 0.15 * Math.sin(f * 0.2), 0]; };
const P_OUT = (f) => { const t = ramp(f, 815, 927); return [62.7 + 22 * t * t + 3 * t, lerp(1.2, 9.5, E.easeOut(clamp(t * 2.2))) + 0.15 * Math.sin(f * 0.3), 0.3 + 0.0 * t]; };
const HAWK = (f) => { const p = P_OUT(f), t = ramp(f, 880, 927), dive = E.easeIn(ramp(f, 905, 927)); return [p[0] + lerp(1.0, 0.5, dive) + 0.15 * Math.sin(f * 0.08), p[1] + lerp(1.6, 0.45, dive) + 0.1 * Math.sin(f * 0.13), -0.5 + t * 0.2]; };
const pigeonState = (f, id) => {
  const fl = f * 0.55;
  switch (id) {
    case 'hook': case 'fin': { const g = id === 'fin' ? f - 1289 : f; return { p: hookPos(g), dir: 1, s: 1.0, flap: fl, tube: true, mode: 'fly' }; }
    case 'retour': { const p = P_RETOUR(f); return f < 338 ? { p: [p[0] + 0.2, p[1] - 1.2, 0.5], dir: 1, s: 0.9, flap: fl, tube: true, mode: 'fly' } : { p, dir: 1, s: 1.0, flap: fl, tube: true, mode: 'fly' }; }
    case 'envol': case 'faucons': {
      if (f < 818) return { p: rel(RE_OUT, 0, 0.62, 1.1, 0.35), dir: 1, s: 0.55, flap: 0, tube: true, mode: 'perch' };
      return { p: P_OUT(f), dir: 1, s: lerp(0.8, 1.25, ramp(f, 818, 840)), flap: fl, tube: true, mode: 'fly', roll: id === 'faucons' && f > 912 ? -0.4 * Math.sin((f - 912) * 0.6) : 0 };
    }
    default: return null;
  }
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const KC = (f, at, d, yaw, o = {}, e = {}) => { const a = rad(yaw); return { f, pos: [at[0] + d * Math.sin(a), at[1] + (o.h ?? 0), at[2] + d * Math.cos(a)], look: [at[0] + (o.lx || 0), at[1] + (o.ly || 0), at[2]], fov: o.fov ?? 40, ...e }; };
const mid = (a, b) => [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2];
const pg = (f, off, lookOff, fov = 40) => { const s = pigeonState(f, shotAt(f).id) || { p: [0, 0, 0] }, p = s.p; return { pos: [p[0] + off[0], p[1] + off[1], p[2] + off[2]], look: [p[0] + lookOff[0], p[1] + lookOff[1], p[2] + lookOff[2]], fov }; };

const CAMS = {
  siege: [K2(140, RE_SIEGE, PA, { yaw: 72, headW: 0.26 }), K2(196, RE_SIEGE, PB, { yaw: 84, headW: 0.28 }, { ease: 'smooth' })],
  facteur: [K2(197, RE_FAC, PTR, { yaw: -12, headW: 0.25 }), K2(264, RE_FAC, PTR, { yaw: 8, headW: 0.28 }, { ease: 'smooth' })],
  ballon: [K2(265, SQ, [SQ[0] - 1.5, 0, 0.5], { yaw: -22, headW: 0.22 }), K2(296, SQ, [SQ[0] - 1.5, 0, 0.5], { yaw: -12, headW: 0.2 }, { ease: 'smooth' }), { f: 331, pos: [SQ[0] - 2.5, 1.6, 4.6], look: [SQ[0] + 3.5, 10, -3.0], fov: 50, ease: 'smooth' }],
  lourd: [K(391, [IX - 25.3, 0, 0.3], { yaw: -10, headW: 0.25 }), K(438, [IX - 25.1, 0, 0.3], { yaw: 4, headW: 0.27 }, { ease: 'smooth' })],
  pages: [K(439, [IX - 26.0, 0, 0.5], { yaw: -8, headW: 0.26, frameY: 0.4 }), K(516, [IX - 25.8, 0, 0.5], { yaw: 4, headW: 0.29, frameY: 0.4 }, { ease: 'smooth' })],
  idee: [K(517, RE_AT, { yaw: -14, headW: 0.31 }), K(620, [IX - 4.3, 0, 0.4], { yaw: 6, headW: 0.26 }, { ease: 'smooth' })],
  photo: [K(621, [IX - 4.2, 0, 0.3], { yaw: -12, headW: 0.21 }), K(705, [IX - 4.2, 0, 0.3], { yaw: 6, headW: 0.24 }, { ease: 'smooth' })],
  film: [{ f: 706, pos: [IX + 0.5, 1.7, 3.9], look: [IX + 0.7, 1.4, 0.9], fov: 40 }, { f: 807, pos: [IX + 0.7, 1.55, 3.3], look: [IX + 0.8, 1.35, 0.9], fov: 40, ease: 'smooth' }],
  sauf: [K(928, [RE_SAUF[0] - 0.3, 0, 0.3], { yaw: -10, headW: 0.25, frameY: 0.5 }), K(981, [RE_SAUF[0] - 0.3, 0, 0.3], { yaw: 4, headW: 0.28, frameY: 0.5 }, { ease: 'smooth' })],
  soixante: [{ f: 982, pos: [RE_SAUF[0] + 0.1, 3.0, 4.4], look: [RE_SAUF[0] + 0.1, 2.9, 0.3], fov: 40 }, { f: 1049, pos: [RE_SAUF[0] + 0.1, 3.0, 3.7], look: [RE_SAUF[0] + 0.1, 2.9, 0.3], fov: 40, ease: 'smooth' }],
  bureau: [K(1050, CL_A, { yaw: -12, headW: 0.3 }), { ...K(1105, [IX + 17.6, 0, 0.5], { yaw: -6, headW: 0.1, frameY: 0.4 }), ease: 'smooth' }, { ...K(1176, [IX + 20.6, 0, -0.6], { yaw: 4, headW: 0.17 }), ease: 'smooth' }],
  total: [K2(1177, MO_TOT, RE_TOT, { yaw: -12, headW: 0.26 }), K2(1288, RE_TOT, OLD_TOT, { yaw: 10, headW: 0.28 }, { ease: 'smooth' })],
};
const KICKS = [{ f: 928, a: 0.04 }, { f: 647, a: 0.03 }];
const TRANS = [
  ['whip', 'hook', 'siege', 1], ['push', 'siege', 'facteur'], ['whip', 'facteur', 'ballon', -1], ['rise', 'ballon', 'retour'], ['drop', 'retour', 'lourd'], ['push', 'lourd', 'pages'],
  ['whip', 'pages', 'idee', 1], ['push', 'idee', 'photo'], ['push', 'photo', 'film'], ['whip', 'film', 'envol', -1],
  ['whip', 'faucons', 'sauf', 1], ['push', 'sauf', 'soixante'], ['drop', 'soixante', 'bureau'], ['rise', 'bureau', 'total'], ['whip', 'total', 'fin', 1],
];
const N_TR = 10;
const baseCam = (id, f) => {
  if (id === 'hook' || id === 'fin') {
    const g = id === 'fin' ? f - 1289 : f, t = E.smooth(ramp(g, 38, 100));
    const base = pg(f, [-0.3, -0.05, 3.5], [0.15, 0.0, 0]), tail = pg(f, [-1.25, 0.25, 1.65], [-0.5, 0.0, 0]);
    const c = { pos: V(base.pos, tail.pos, t), look: V(base.look, tail.look, t), fov: 40 };
    if (id === 'fin') { const k = ramp(g, 40, 95); const wide = pg(f, [-0.4, -0.1, 4.0], [0.1, 0.0, 0]); return { pos: V(c.pos, wide.pos, k * (1 - t) + k * t), look: V(c.look, wide.look, k), fov: 40 }; }
    return c;
  }
  if (id === 'retour') {
    const t = E.smooth(ramp(f, 332, 366)), wide = { pos: [-52, 10.6, 9.5], look: [-65, 11.2, 0], fov: 46 }, tr = pg(f, [-0.6, 0.7, 4.4], [0.0, -0.3, 0]);
    return { pos: V(wide.pos, tr.pos, t), look: V(wide.look, tr.look, t), fov: lerp(46, 40, t) };
  }
  if (id === 'envol') {
    const t = E.smooth(ramp(f, 808, 840)), a = K(808, RE_OUT, { yaw: -14, headW: 0.3 }), b = pg(f, [-0.5, 0.5, 5.6], [0.4, 0.5, 0]);
    return { pos: V(a.pos, b.pos, t), look: V(a.look, b.look, t), fov: 40 };
  }
  if (id === 'faucons') {
    const t = E.smooth(ramp(f, 867, 890)), a = pg(f, [-0.5, 0.5, 5.6], [0.4, 0.5, 0]), b = pg(f, [-0.5, 0.5, 5.6], [0.4, 0.5, 0]);
    return { pos: V(a.pos, b.pos, t), look: V(a.look, b.look, t), fov: 40 };
  }
  return camFromKeys(CAMS[id], f, { kicks: KICKS });
};
export const camAt = (f) => {
  for (const [type, from, to, dir] of TRANS) {
    const f0 = SH[to].a - N_TR / 2;
    if (f >= f0 && f < f0 + N_TR) return transition(type, baseCam(from, last(from)), baseCam(to, first(to)), f, f0, N_TR, { dir: dir || 1 });
  }
  let c = baseCam(shotAt(f).id, f);
  c = shake(c, f, 647, 0.05, 8);                 // le flash de l'appareil
  c = shake(c, f, 928, 0.07, 12);                // « Sauf que… »
  c = shake(c, f, 1100, 0.04, 8);
  return c;
};

// ---------- mise au point ----------
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const id = shotAt(f).id, C = camAt(f);
  let t;
  switch (id) {
    case 'hook': case 'fin': case 'retour': case 'envol': case 'faucons': t = pigeonState(f, id).p; break;
    case 'film': t = [IX + 0.8, 1.35, 0.9]; break;
    case 'soixante': t = [RE_SAUF[0] + 0.1, 2.9, 0.3]; break;
    case 'siege': t = [RE_SIEGE[0], 1.4, 0.3]; break;
    case 'facteur': t = [RE_FAC[0] + 0.5, 1.4, 0.5]; break;
    case 'ballon': return { focus: dist3(C.pos, [SQ[0], 1.4, 0.3]), cinf: f > 305 ? 3 : 8 };
    case 'lourd': t = [IX - 25.5, 1.4, 0.3]; break;
    case 'pages': t = [IX - 26.5, 1.3, 0.5]; break;
    case 'idee': case 'photo': t = [RE_AT[0], 1.4, 0.4]; break;
    case 'sauf': t = [RE_SAUF[0], 1.4, 0.3]; break;
    case 'bureau': t = f < 1085 ? [CL_A[0], 1.4, 0.1] : f < 1130 ? [IX + 18, 2.4, 0] : [CL_B[0], 1.4, -0.7]; break;
    case 'total': t = [RE_TOT[0], 1.4, 0.4]; break;
    default: t = [C.look[0], C.look[1], C.look[2]];
  }
  const far = id === 'retour' || id === 'faucons';
  return { focus: dist3(C.pos, t), cinf: far ? 4 : id === 'film' || id === 'soixante' ? 6 : 9 };
};

// ---------- état du monde ----------
const BAL0 = [SQ[0] + 1.3, 1.0, -2.2];
export const worldAt = (f) => {
  const id = shotAt(f).id, S = { lantern: f >= 1050 && f <= 1176 ? 1 : 0 };
  if (id === 'ballon') { const t = ramp(f, 285, 331); S.balloon = { x: BAL0[0] + 3.5 * t * t, y: BAL0[1] + 14 * E.smooth(t) * (0.5 + 0.5 * t), z: BAL0[2], s: 1 }; }
  if (id === 'retour') S.balloon = { x: -66 + (f - 332) * 0.01, y: 11.2 + Math.sin(f * 0.04) * 0.15, z: -2.2, s: 1 };
  S.pile = id === 'pages' ? ramp(f, 441, 505) : id === 'lourd' ? 0.35 : 0;
  S.flash = f >= 647 && f < 655 ? 1 - (f - 647) / 8 : 0;
  return S;
};

// ---------- effets 3D ----------
export const envAt = (f) => {
  const id = shotAt(f).id, e = {}, smoke = [], sparks = [], embers = [], beams = [];
  const ext = !['lourd', 'pages', 'idee', 'photo', 'film', 'bureau'].includes(id);
  if (ext) e.snow = id === 'envol' || id === 'faucons' ? 1 : id === 'total' || id === 'fin' ? 0.25 : id === 'hook' ? 0.55 : 0.7;
  if (id === 'envol' || id === 'faucons') e.wind = [5, 0];
  if (id === 'siege') for (const [x, z] of [[-14, -4], [-20, 5], [-17, 8]]) smoke.push({ at: [x, 0.4, z], f0: 100, f1: 200, rate: 5, col: '#9a9aa4', size: 1.8, rise: 0.8 });
  if (id === 'retour') for (const [x, z] of [[-24, -4], [-32, 3], [-20, 6], [-38, -2]]) smoke.push({ at: [x, 0.4, z], f0: 300, f1: 395, rate: 5, col: '#a8a8b0', size: 2.2, rise: 0.8 });
  if (id === 'hook' || id === 'fin') smoke.push({ at: [hookPos(0)[0] + 6, 16, -12], f0: 0, f1: 150, rate: 4, col: '#d8dce6', size: 1.6, rise: 0.5 }), smoke.push({ at: [hookPos(0)[0] + 16, 15, -12], f0: 0, f1: 150, rate: 4, col: '#d8dce6', size: 1.6, rise: 0.5 });
  if (['lourd', 'pages', 'idee', 'photo', 'film', 'bureau'].includes(id)) e.motes = 0.5;
  if (id === 'pages' || id === 'lourd') embers.push({ at: [IX - 15.5, 0.8, -3.1], f0: 380, f1: 520, rate: 8, col: '#ff8a2a' });
  if (id === 'photo' && f >= 645 && f < 665) sparks.push({ at: [IX - 3.0, 1.9, 0.7], f0: 647, f1: 655, rate: 90, col: '#fff3b0', speed: 3.5, size: 0.1 });
  if (id === 'bureau') beams.push({ at: [IX + 19, 1.4, 3.2], yaw: Math.PI, pitch: -0.12, len: 8.2, r: 3.4, col: '#fff2c0', a: 0.55 });
  if (id === 'faucons' && f > 905) sparks.push({ at: [P_OUT(f)[0] - 0.2, P_OUT(f)[1], 0.3], f0: 905, f1: 927, rate: 20, col: '#ffffff', speed: 1.5, size: 0.07 });
  if (smoke.length) e.smoke = smoke; if (sparks.length) e.sparks = sparks; if (embers.length) e.embers = embers; if (beams.length) e.beams = beams;
  return e;
};

// ---------- casting (nouveau à chaque épisode) ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  // le héros : René Dagron, photographe (blouse violette, écharpe orange, lunettes, moustache, haut-de-forme)
  O.rene = { tunic: '#7b4fb8', skin: '#e6b48a', hat: 'tophat', moustache: '#3a2418', brows: '#3a2418', glasses: true, scarf: '#ff8a1a', apron: '#efe3c8' };
  O.mere = { tunic: '#18b8c0', dress: '#18b8c0', skin: '#8a5a3a', hair: '#2a1a14', scarf: '#f2c230' };
  O.postier = { tunic: '#2b4a8c', skin: '#f1c9a4', hat: 'kepi', hatCol: '#2b4a8c', hatBand: '#c8312c', moustache: '#6a4a30', coat: true };
  O.vieux = { tunic: '#7a8a3a', skin: '#d9a27a', hair: '#f1f0ea', beard: '#f1f0ea', brows: '#f1f0ea', stout: true, scarf: '#c8312c' };
  O.civA = { tunic: '#d23a32', skin: '#c99067', cap: '#3a3a4a', scarf: '#f1ead8', moustache: '#2a1a14' };
  O.civB = { tunic: '#e8a020', dress: '#e8a020', skin: '#f1c9a4', hair: '#b8501f', scarf: '#5a3b8a', stout: true };
  O.clerkA = { tunic: '#e8c230', skin: '#f1c9a4', hair: '#6a6a72', brows: '#6a6a72', moustache: '#6a6a72', glasses: '#3a2a22', apron: '#d9cdb0' };
  O.clerkB = { tunic: '#4aa860', skin: '#8a5a3a', cap: '#3a3a4a', moustache: '#1e1714' };
  O.prus = { tunic: '#2e3646', skin: '#f1c9a4', hat: 'pickel', hatCol: '#2e3646', moustache: '#d9b060', coat: true };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };

// ---------- cartes (toile de conception 600 x 1000, contenu autour de (300, 520)) ----------
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const ellipse = (g, x, y, rx, ry, fill, lw = 9, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.283); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const poly = (g, pts, fill, lw = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const sparkle = (g, x, y, r, col = '#fff6c0') => { g.save(); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * 0.785, rr = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore(); };

/** petit rouleau de film (le microfilm accroché à la plume) */
function filmRoll(g, x, y, rot, glow = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.lineJoin = 'round';
  g.save(); g.globalAlpha = 0.55 * glow; const gr = g.createRadialGradient(0, 0, 4, 0, 0, 70); gr.addColorStop(0, '#fff6c0'); gr.addColorStop(1, 'rgba(255,246,192,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 70, 0, 6.283); g.fill(); g.restore();
  g.beginPath(); g.roundRect(-34, -11, 68, 22, 10); g.fillStyle = '#e8f0f8'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#9fc4e0'; g.beginPath(); g.roundRect(-26, -5, 52, 10, 5); g.fill(); g.lineWidth = 3; g.beginPath(); g.moveTo(-14, -11); g.lineTo(-14, 11); g.moveTo(14, -11); g.lineTo(14, 11); g.stroke();
  g.restore();
}
/** pigeon, vu de côté, tourné vers la droite (dir = -1 le retourne). flap = phase des ailes */
function pigeon(g, { flap = 0, dir = 1, tube = false, mode = 'fly', eye = 'open', roll = 0, load = 0 } = {}) {
  g.save(); g.translate(300, 520); g.rotate(roll); g.scale(dir, 1); g.lineJoin = 'round'; g.lineCap = 'round';
  const perch = mode === 'perch', hurt = mode === 'hurt';
  if (perch || hurt) { g.strokeStyle = INK; g.lineWidth = 12; for (const x of [-12, 26]) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 84); g.stroke(); } g.strokeStyle = '#e88a9a'; g.lineWidth = 6; for (const x of [-12, 26]) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 84); g.stroke(); } }
  const wa = perch ? -0.1 : hurt ? Math.sin(flap * 0.8) * 0.35 - 0.1 : Math.sin(flap) * 0.85;
  // aile du fond
  g.save(); g.translate(-6, -34); g.rotate(-0.3 - wa * 0.7); ellipse(g, -50, -6, 116, 28, '#6f788c', 8); g.restore();
  // queue
  poly(g, [[-72, -10], [-186, -38], [-200, -2], [-184, 30], [-70, 24]], '#7f889a', 8);
  g.strokeStyle = '#d9e0ea'; g.lineWidth = 6; g.beginPath(); g.moveTo(-170, -20); g.lineTo(-174, 14); g.stroke();
  // corps
  ellipse(g, 0, 0, 104, 66, '#a9b2c4', 10); ellipse(g, 10, 20, 72, 36, '#dde3ee', 0);
  ellipse(g, 74, -26, 36, 30, '#5fae9c', 0);                                   // collier irisé
  ellipse(g, 100, -48, 42, 38, '#a9b2c4', 10);                                 // tête
  poly(g, [[134, -54], [174, -44], [134, -38]], '#e8c8a0', 6); ellipse(g, 136, -52, 7, 6, '#fff', 3);
  if (eye === 'open') { ellipse(g, 112, -58, 11, 11, '#f0a020', 4); ellipse(g, 114, -58, 5, 5, INK, 0); } else { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(112, -58, 10, 0.2, Math.PI - 0.2); g.stroke(); }
  // aile proche
  g.save(); g.translate(-6, -34); g.rotate(-0.2 + wa * 0.9); ellipse(g, -56, 6, 124, 34, '#8a93a8', 9); g.strokeStyle = '#e8edf4'; g.lineWidth = 9; g.beginPath(); g.moveTo(-96, -14); g.lineTo(-20, -2); g.stroke();
  g.strokeStyle = '#586074'; g.lineWidth = 6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-150 - i * 2, 6 + i * 4); g.lineTo(-174 - i * 2, 14 + i * 5); g.stroke(); } g.restore();
  if (tube) { g.strokeStyle = '#d8c8a0'; g.lineWidth = 5; g.beginPath(); g.moveTo(-176, 4); g.lineTo(-190, 26); g.stroke(); filmRoll(g, -196, 40, 0.5); sparkle(g, -226, 6, 22); sparkle(g, -164, 62, 15); }
  if (load > 0) { g.save(); g.translate(-10, 72 + load * 28); g.scale(load, load); bundle(g); g.restore(); }
  g.restore();
}
/** gros paquet de lettres ficelé */
function bundle(g) {
  g.save(); g.lineJoin = 'round';
  for (let i = 0; i < 5; i++) { g.save(); g.translate(0, 50 - i * 22); g.rotate((i - 2) * 0.03); g.beginPath(); g.roundRect(-96, -14, 192, 30, 5); g.fillStyle = i % 2 ? '#f6efdc' : '#efe5cc'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.restore(); }
  g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(-26, -66); g.lineTo(-26, 80); g.moveTo(34, -66); g.lineTo(34, 80); g.stroke(); g.strokeStyle = '#c8312c'; g.lineWidth = 7; g.stroke();
  g.restore();
}
/** faucon : ailes déployées, regard dur, tourné vers la droite */
function hawk(g, { flap = 0, dive = 0, dir = 1 } = {}) {
  g.save(); g.translate(300, 520); g.scale(dir, 1); g.rotate(0.45 * dive); g.scale(1.25, 1.25); g.lineJoin = 'round'; g.lineCap = 'round';
  const wa = (1 - dive) * Math.sin(flap) * 0.35 + dive * 0.9;
  g.save(); g.translate(-4, -36); g.rotate(-0.45 - wa); ellipse(g, -40, -22, 134, 36, '#4e3523', 9); g.restore();
  poly(g, [[-64, -6], [-170, -30], [-186, 6], [-166, 38], [-64, 26]], '#8a5a3a', 9);
  ellipse(g, 0, 0, 102, 62, '#6a4a32', 10); ellipse(g, 12, 22, 70, 34, '#ecdcb8', 0); g.strokeStyle = '#8a6a4a'; g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-24 + i * 24, 12); g.lineTo(-20 + i * 24, 40); g.stroke(); }
  ellipse(g, 98, -44, 40, 36, '#7a5a40', 10); poly(g, [[130, -58], [176, -38], [158, -26], [136, -34]], '#f2c230', 7);
  ellipse(g, 114, -58, 13, 12, '#ffe36a', 5); ellipse(g, 118, -57, 6, 6, INK, 0); g.strokeStyle = INK; g.lineWidth = 11; g.beginPath(); g.moveTo(94, -80); g.lineTo(134, -64); g.stroke();   // sourcil dur
  g.save(); g.translate(-4, -36); g.rotate(-0.15 + wa); ellipse(g, -44, 12, 138, 38, '#5e4230', 9); g.strokeStyle = '#2e2018'; g.lineWidth = 6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-160 - i * 3, 14 + i * 5); g.lineTo(-188 - i * 3, 22 + i * 6); g.stroke(); } g.restore();
  g.strokeStyle = INK; g.lineWidth = 12; for (const x of [10, 40]) { g.beginPath(); g.moveTo(x, 56); g.lineTo(x + 8 - dive * 8, 92); g.stroke(); } g.strokeStyle = '#f2c230'; g.lineWidth = 6; for (const x of [10, 40]) { g.beginPath(); g.moveTo(x, 56); g.lineTo(x + 8 - dive * 8, 92); g.stroke(); }
  g.restore();
}
/** cage à pigeon (vide si bird = false, porte ouverte) */
function cageP(g, { bird = true, open = false } = {}) {
  const cx = 300; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  ellipse(g, cx, 706, 150, 34, '#7a4a28', 10); ellipse(g, cx, 690, 142, 28, '#b07a44', 0);
  if (bird) { g.save(); g.translate(cx - 6, 676); g.scale(0.5, 0.5); pigeon(g.__pg || g, {}); g.restore(); }
  for (let i = 0; i < 7; i++) { const u = (i / 6) * 2 - 1, xb = cx + u * 136, xt = cx + u * 40; for (const [col, lw] of [[INK, 11], ['#e0b040', 5.5]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(xb, 700); g.lineTo(xt, 420); g.stroke(); } }
  ellipse(g, cx, 520, 94, 15, null, 9); ellipse(g, cx, 420, 40, 10, '#e0b040', 9);
  if (open) { g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(cx + 126, 640); g.lineTo(cx + 190, 600); g.stroke(); g.strokeStyle = '#e0b040'; g.lineWidth = 6; g.stroke(); }
  g.restore();
}
function bulbCard(p, k) { const g = p.g; g.save(); const s = 0.4 + 0.6 * E.back(clamp(k)); g.translate(300, 540); g.scale(s, s); g.translate(-300, -540); g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = '#ffb81c'; g.lineWidth = 14; for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 8); g.beginPath(); g.moveTo(300 + Math.cos(a) * 150, 480 + Math.sin(a) * 150); g.lineTo(300 + Math.cos(a) * 215, 480 + Math.sin(a) * 215); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(300, 480, 100, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#9aa3ad'; g.beginPath(); g.roundRect(255, 570, 90, 70, 16); g.fill(); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(262, 600); g.lineTo(338, 600); g.stroke(); g.restore(); }
/** une page de lettre (lignes d'écriture) ; tiny = rend la page minuscule avec un trait plus épais (microfilm) */
function pageCard(p, { glow = 0, lines = 14 } = {}) { const g = p.g; g.save(); g.lineJoin = 'round';
  g.beginPath(); g.roundRect(150, 300, 300, 440, 10); g.fillStyle = '#fbf6e6'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = '#6a5a4a'; g.lineWidth = 6; for (let i = 0; i < lines; i++) { const y = 340 + i * 27, w = 220 - ((i * 53) % 60); g.beginPath(); g.moveTo(180, y); g.lineTo(180 + w, y); g.stroke(); }
  g.fillStyle = '#c8312c'; g.font = '800 40px Montserrat, Arial'; g.fillText('Mon cher…', 176, 322 + 0);
  if (glow) { g.globalAlpha = glow; g.fillStyle = '#fffbe0'; g.fillRect(150, 300, 300, 440); } g.restore(); }
/** le film transparent, grand (gros plan) */
function filmCard(p, { glint = 0 } = {}) { const g = p.g; g.save(); g.lineJoin = 'round';
  g.beginPath(); g.roundRect(170, 440, 260, 170, 14); g.fillStyle = 'rgba(190,225,245,0.88)'; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = '#2a3a58'; g.lineWidth = 3; for (let r2 = 0; r2 < 9; r2++) for (let c = 0; c < 3; c++) { g.beginPath(); g.moveTo(186 + c * 80, 456 + r2 * 16); g.lineTo(186 + c * 80 + 56 - (r2 * 7 % 14), 456 + r2 * 16); g.stroke(); }
  g.fillStyle = '#fff'; g.globalAlpha = 0.35 + 0.3 * glint; g.beginPath(); g.moveTo(190, 450); g.lineTo(260, 450); g.lineTo(215, 600); g.lineTo(190, 600); g.fill(); g.restore(); }
function featherCard(p, rot = 0) { const g = p.g; g.save(); g.translate(300, 520); g.rotate(rot); g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-170, 30); g.bezierCurveTo(-130, -70, 40, -110, 170, -40); g.bezierCurveTo(90, -10, 20, 40, -170, 30); g.closePath(); g.fillStyle = '#fbfbff'; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = '#c8d0e0'; g.lineWidth = 4; for (let i = 0; i < 9; i++) { const x = -130 + i * 28; g.beginPath(); g.moveTo(x, 12 - i * 3); g.lineTo(x + 34, -44 - i * 3); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(-200, 40); g.quadraticCurveTo(0, -30, 170, -40); g.stroke(); g.strokeStyle = '#efe6cf'; g.lineWidth = 5; g.stroke(); g.restore(); }
/** balance : la plume pèse plus lourd que le film ; tilt > 0 = côté plume (gauche) descend */
function balanceCard(p, tilt) { const g = p.g; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(300, 800); g.lineTo(300, 430); g.stroke(); g.strokeStyle = '#d9a845'; g.lineWidth = 12; g.stroke();
  ellipse(g, 300, 810, 92, 22, '#a8782e', 10);
  g.save(); g.translate(300, 430); g.rotate(-tilt);
  g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(-250, 0); g.lineTo(250, 0); g.stroke(); g.strokeStyle = '#d9a845'; g.lineWidth = 11; g.stroke(); ellipse(g, 0, 0, 20, 20, '#f2c230', 7);
  for (const s of [-1, 1]) { const x = s * 250; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(x, 0); g.lineTo(x - 70, 150); g.moveTo(x, 0); g.lineTo(x + 70, 150); g.stroke(); g.save(); g.translate(x, 150); g.rotate(tilt); ellipse(g, 0, 8, 96, 22, '#e0b040', 9); g.restore(); }
  g.restore();
  // la plume à gauche, le film à droite (posés sur les plateaux)
  const lx = 300 - 250 * Math.cos(tilt) + 0, ly = 430 + 250 * Math.sin(tilt) + 140, rx = 300 + 250 * Math.cos(tilt), ry = 430 - 250 * Math.sin(tilt) + 140;
  g.save(); g.translate(lx, ly - 16); g.scale(0.5, 0.5); g.translate(-300, -520); featherCard({ g }, 0.1); g.restore();
  g.save(); g.translate(rx, ry - 12); g.scale(0.34, 0.34); g.translate(-300, -520); filmCard({ g }); g.restore();
  g.restore(); }
/** le compteur : grille de 300 petits oiseaux qui disparaissent, ne restent que ~60 en or */
const SURV = (() => { const a = Array.from({ length: 300 }, (_, i) => i), s = []; let x = 7; for (let i = 299; i > 0; i--) { x = (x * 1103515245 + 12345) & 0x7fffffff; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } for (let i = 0; i < 300; i++) s[a[i]] = i; return s; })();   // rang de disparition de chaque oiseau
function gridCard(p, k, f) { const g = p.g; g.save(); panel(g, 20, 330, 560, 480, '#26304a');
  const gone = Math.floor(k * 241);                     // 241 disparaissent, 59 restent
  for (let i = 0; i < 300; i++) { const c = i % 20, r2 = Math.floor(i / 20), x = 52 + c * 25.6, y = 440 + r2 * 24.5, rk = SURV[i], alive = rk >= gone, surv = rk >= 241, fade = clamp((gone - rk + 3) / 3);
    if (!alive && fade >= 1) continue; g.save(); g.globalAlpha = alive ? 1 : 1 - fade; ellipse(g, x, y, 8.5, 6.5, surv && k > 0.1 ? '#ffd23a' : '#c9d3e4', 0); ellipse(g, x + 6, y - 5, 4.5, 4.5, surv && k > 0.1 ? '#ffd23a' : '#c9d3e4', 0); poly(g, [[x - 4, y - 2], [x - 12, y - 8], [x - 8, y + 2]], surv && k > 0.1 ? '#e8a01a' : '#9aa6bc', 0); g.restore(); }
  const n = 300 - gone; TXT(g, k < 0.04 ? '300' : String(n), 300, 410, 108, k > 0.9 ? '#ffd23a' : '#ffffff', 16); void f; g.restore(); }
function counterCard(p, n, done) { const g = p.g; g.save(); panel(g, 20, 400, 560, 230, '#271925'); const t = (Math.round(n / 1000) * 1000).toLocaleString('fr-FR').replace(/ | /g, ' ');
  TXT(g, t + (done ? '+' : ''), 300, 560, 126, '#ffd23a', 0); g.restore(); }
function projPage(g, flick, reveal) { g.save(); g.fillStyle = flick ? '#ffe9a0' : '#fff0b8'; g.fillRect(40, 140, 520, 760); g.strokeStyle = '#7a5a20'; g.lineWidth = 10; g.strokeRect(40, 140, 520, 760);
  g.strokeStyle = '#3a2a22'; g.lineWidth = 12; for (let i = 0; i < 20; i++) { const y = 190 + i * 33, w = (400 - ((i * 71) % 120)) * (i / 20 < reveal ? 1 : 0.0); g.beginPath(); g.moveTo(80, y); g.lineTo(80 + w, y); g.stroke(); }
  g.fillStyle = '#3a2a22'; g.font = '800 54px Montserrat, Arial'; g.fillText('Ma chère Louise,', 80, 178); g.restore(); }

// ---------- acteurs ----------
const FXC = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
const swingTool = (f, ph) => (((f + ph) % 20) < 10 ? 'lift' : 'hip');
const PIDS = ['hook', 'fin', 'retour', 'envol', 'faucons'];
export const actorsAt = (f, T) => {
  const S = shotAt(f), id = S.id, out = [];
  const A = (who, seed) => (o, pos, extra = {}) => out.push(R(T, who, life(f, seed, o), pos, extra));
  const rene = A('rene', 5), mere = A('mere', 6), post = A('postier', 7), vieux = A('vieux', 8), civA = A('civA', 9), civB = A('civB', 10), cla = A('clerkA', 11), clb = A('clerkB', 12), prus = A('prus', 13);
  const cold = (seed) => tremble(f, 0.006, seed);
  switch (id) {
    case 'siege':
      rene({ expr: f < 165 ? 'nervous' : 'shock', L: 'cross', R: 'point', look: -0.7 }, RE_SIEGE, { ...cold(1) });
      civA({ expr: 'pained', L: 'cross', R: 'cross', look: -0.5 }, PA, { ...cold(2) });
      civB({ expr: 'nervous', L: 'cross', R: 'cross', look: -0.5 }, PB, { ...cold(3) });
      for (const [x, z, sd] of [[-9, 0.1, 1], [-11.5, 1.6, 2], [-10.5, -1.4, 3], [-14, 0.3, 4]]) out.push(R(T, 'prus', life(f, 13 + sd, { expr: 'stern', L: 'hip', R: 'hip', look: 0.6 }), [x, 0, z], { s: 1.9 }));
      break;
    case 'facteur':
      post({ expr: f < 225 ? 'nervous' : 'pained', L: 'up', R: 'up', look: -0.5 }, PTR, { ...(f > 220 ? hop(f, 222, 0.06, 6) : {}) });
      rene({ expr: 'squint', L: 'hip', R: f < 232 ? 'reach' : 'point', holdR: 'letter', look: 0.6 }, RE_FAC, {});
      break;
    case 'ballon': {
      const t = ramp(f, 285, 331);
      rene({ expr: 'grin', L: 'wave', R: 'wave', wv: f * 0.4, look: 0.5 }, SQ, { ...hop(f, 292, 0.1, 8) });
      civA({ expr: 'laugh', L: 'up', R: 'up', look: 0.6 }, [SQ[0] - 1.5, 0, 0.5], { ...hop(f, 300 + 4, 0.14, 8) });
      civB({ expr: 'smile', L: 'wave', R: 'hip', wv: f * 0.35, look: 0.6 }, [SQ[0] + 1.5, 0, 0.45], {});
      void t; break; }
    case 'lourd': {
      const k = ramp(f, 408, 428);
      mere({ expr: f < 408 ? 'nervous' : 'stubborn', L: 'carry', R: 'reach', look: 0.6 }, MA, {});
      rene({ expr: f < 410 ? 'smile' : k > 0.5 ? 'shock' : 'nervous', L: 'hip', R: 'reach', look: 0.6 }, RE_M, f > 424 ? { ...tremble(f, 0.01, 4) } : {});
      break; }
    case 'pages':
      mere({ expr: f < 470 ? 'squint' : 'nervous', L: 'belly', R: 'belly', holdL: 'paper', holdR: 'tool', look: 0.3 }, MA, { dx: 0.03 * Math.sin(f * 0.45), dy: 0.012 * Math.abs(Math.sin(f * 0.45)) });
      break;
    case 'idee': {
      const k = ramp(f, 548, 566);
      rene({ expr: f < 540 ? 'squint' : f < 572 ? 'shock' : 'grin', L: f < 548 ? 'temple' : 'hip', R: f < 548 ? 'hip' : f < 590 ? 'up' : 'point', holdR: f < 548 ? undefined : undefined, look: 0.5 }, RE_AT, f > 566 ? { ...hop(f, 568, 0.14, 8) } : {});
      void k; break; }
    case 'photo':
      rene({ expr: f < 645 ? 'squint' : f < 656 ? 'shock' : 'grin', L: 'hip', R: f < 640 ? 'reach' : 'up', look: 0.7 }, RE_AT, f >= 647 && f < 660 ? { dx: -0.03 } : {});
      break;
    case 'film':
      rene({ expr: f < 740 ? 'smile' : 'laugh', L: 'hip', R: f < 735 ? 'reach' : 'wave', wv: f * 0.3, look: -0.3 }, RE_FILM, f > 745 ? { ...hop(f, 746, 0.1, 8) } : {});
      break;
    case 'envol': {
      const t = ramp(f, 812, 830);
      rene({ expr: f < 815 ? 'nervous' : 'smile', L: 'hip', R: f < 818 ? 'reach' : 'up', look: 0.6, lift: 0.5 }, RE_OUT, { ...cold(7) });
      void t; break; }
    case 'sauf': case 'soixante':
      if (id === 'sauf') rene({ expr: f < 944 ? 'shock' : 'pained', L: 'head', R: 'hang', look: 0.7 }, RE_SAUF, f > 940 ? { ...cold(3) } : {});
      break;
    case 'bureau': {
      const wr = f > 1118;
      cla({ expr: f < 1085 ? 'shock' : 'smile', L: f < 1075 ? 'reach' : 'hip', R: f < 1075 ? 'reach' : 'hip', look: -0.4, holdR: f > 1075 ? undefined : undefined }, CL_A, f < 1066 ? {} : { ...hop(f, 1068, 0.08, 6) });
      clb({ expr: wr ? 'squint' : 'neutral', L: 'hip', R: wr ? swingTool(f, 0) : 'hip', holdR: 'tool', look: -0.5 }, CL_B, { dy: 0 });
      break; }
    case 'total': {
      mere({ expr: f < 1215 ? 'smile' : 'laugh', L: 'hip', R: 'hip', holdR: 'letter', look: 0.4 }, MO_TOT, f > 1210 ? { ...hop(f, 1212, 0.08, 8) } : {});
      rene({ expr: 'grin', L: 'hip', R: 'wave', wv: f * 0.3, look: -0.3 }, RE_TOT, {});
      vieux({ expr: f < 1250 ? 'neutral' : 'laugh', L: 'hip', R: 'hip', holdL: 'letter', look: -0.4 }, OLD_TOT, f > 1250 ? { ...hop(f, 1252, 0.08, 8) } : {});
      break; }
  }
  // ----- le pigeon (objet-vedette) -----
  const ps = PIDS.includes(id) ? pigeonState(f, id) : null;
  if (ps) {
    const key = `pg${id}${q(ps.flap % 6.283, 1)}${ps.mode}${ps.dir}${q(ps.roll || 0, 1)}`;
    out.push(FXC(key, (p) => pigeon(p.g, ps), ps.p, ps.s, { id: 'pigeon' }));
  }
  if (id === 'faucons' || (id === 'envol' && f > 850)) { const h = HAWK(f), dv = ramp(f, 905, 927), fl = f * 0.35; out.push(FXC(`hk${q(fl % 6.283, 1)}${q(dv, 1)}`, (p) => hawk(p.g, { flap: fl, dive: dv }), h, 1.3, { id: 'hawk' })); }
  // pigeon porté à la main : mansarde
  if (id === 'lourd') {
    const k = ramp(f, 405, 428), hp = rel(RE_M, 0, 0.85, 1.3 - 0.35 * E.easeIn(k), 0.25), fell = f > 428;
    const st = { mode: fell ? 'hurt' : 'perch', load: f < 405 ? 0.001 : E.smooth(ramp(f, 405, 418)), eye: fell ? 'closed' : 'open', roll: fell ? 0.3 * Math.sin((f - 428) * 0.5) * Math.exp(-(f - 428) / 8) : 0, flap: (f - 428) * 0.7, tube: false };
    out.push(FXC(`pl${q(st.load, 1)}${st.mode}${q(st.roll, 1)}${q(st.flap % 6.283, 1)}`, (p) => pigeon(p.g, st), hp, 1.0, { id: 'pigeon' }));
    out.push(FXC('bundleL' + q(st.load, 1), (p) => { if (st.load > 0.05) { p.g.save(); p.g.translate(300, 560); p.g.scale(st.load, st.load); p.g.translate(-300, -560); p.g.save(); p.g.translate(300, 560); bundle(p.g); p.g.restore(); p.g.restore(); } }, [hp[0] + 0.04, hp[1] - 0.36, hp[2] + 0.1], 0.62, { id: 'bundle' }));
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), id = S.id, out = [];
  if (id === 'pages') { // des pages volent autour de la pile
    for (let i = 0; i < 4; i++) { const t = ((f + i * 19) % 76) / 76, x = IX - 25.1 + Math.sin(t * 6 + i) * 0.5, y = 1.2 + t * 1.5; out.push(FXC('pf' + i + q(t * 3, 1), (p) => pageCard(p, { lines: 8 }), [x, y, -1.6], 0.17 + 0.03 * i, { roll: Math.sin(t * 9 + i) * 0.5 })); } }
  if (id === 'idee' && f > 548) { const k = ramp(f, 550, 572); out.push(FXC('bulb' + q(k, 1), (p) => bulbCard(p, k), [RE_AT[0] + 0.05, 2.5, 0.4], 0.62 * (0.5 + 0.5 * clamp(k)))); }
  if (id === 'photo' || (id === 'idee' && f > 590)) {
    // la page grande à gauche, qui rapetisse en un petit film
    const t = id === 'idee' ? 0 : ramp(f, 650, 690), s = lerp(0.75, 0.05, E.easeIn(t)), x = lerp(IX - 5.5, IX - 3.5, E.easeIn(t)), y = lerp(1.7, 1.3, t);
    if (id === 'idee') out.push(FXC('pgb', (p) => pageCard(p), [IX - 5.5, 1.6, 0.1], 0.75));
    else if (t < 0.99) out.push(FXC('pgs' + q(t, 2), (p) => pageCard(p, { glow: f >= 647 && f < 652 ? 0.7 : 0 }), [x, y, 0.1], s));
    if (id === 'photo' && t > 0.7) { const u = ramp(f, 676, 705); out.push(FXC('fl' + q(u, 1), (p) => { filmRoll(p.g, 300, 520, 0.2); }, [lerp(IX - 3.5, IX - 4.3, u), lerp(1.3, 1.8, u), 0.55], lerp(0.5, 0.8, u))); }
  }
  if (id === 'film') {
    const tilt = 0.2 * E.back(ramp(f, 714, 740)) * (1 + 0.04 * Math.sin(f * 0.3)), key = 'bal' + q(tilt, 2);
    out.push(FXC(key, (p) => balanceCard(p, tilt), [IX + 0.8, 1.38, 0.9], 0.85, { id: 'balance' }));
    if (f > 748) for (let i = 0; i < 3; i++) { const r2 = (f * 0.8 + i * 40) % 80, a = (f + i * 11) * 0.2; out.push(FXC('gl' + i + q(a % 6.283, 1), (p) => sparkle(p.g, 300, 520, 60), [IX + 1.5 + Math.cos(a) * 0.5, 1.9 + (r2 / 80) * 0.4, 1.0], 0.3)); }
  }
  if (id === 'sauf' || id === 'soixante') {
    const k = id === 'sauf' ? 0 : ramp(f, 990, 1040), kk = q(k, 2), gp = [RE_SAUF[0] + 0.1, 2.9, 0.2], s = id === 'sauf' ? 1.2 : 1.0;
    out.push(FXC('gr' + kk, (p) => gridCard(p, k, f), id === 'sauf' ? [RE_SAUF[0] - 0.1, 3.0, 0.2] : gp, s, { id: 'grid' }));
    if (id === 'sauf') out.push(FXC('cg', (p) => cageP(p.g, { bird: false, open: true }), rel(RE_SAUF, 0, 0.95, 0.55, 0.3), 0.55, { id: 'cage' }));
  }
  if (id === 'bureau') {
    const reveal = ramp(f, 1090, 1150), fl = f % 6 < 2 ? 1 : 0;
    if (f >= 1086) out.push(FXC('pj' + q(reveal, 1) + fl, (p) => projPage(p.g, fl, reveal), [IX + 19, 2.9, -4.7], 1.55, { order: 4, id: 'proj' }));
    // le pigeon se pose sur le rebord de la fenêtre, le film est retiré de sa queue
    if (f < 1075) { const t = ramp(f, 1050, 1068), p0 = V([IX + 14, 4.2, 0.6], [IX + 10.6, 1.62, -4.5], E.easeOut(t)); out.push(FXC(`bpg${q(f * 0.55 % 6.283, 1)}${t > 0.98 ? 1 : 0}`, (p) => pigeon(p.g, t > 0.98 ? { mode: 'perch', tube: f < 1070 } : { flap: f * 0.8, tube: true }), p0, 0.55, { id: 'pigeon' })); }
    if (f >= 1070 && f < 1118) { const u = ramp(f, 1070, 1090); out.push(FXC('bfilm' + q(u, 1), (p) => filmRoll(p.g, 300, 520, 0.4), V([IX + 10.6, 1.75, -4.4], [IX + 19, 1.62, 3.0], E.smooth(u)), 0.6)); }
  }
  if (id === 'total') {
    const n = E.smooth(ramp(f, 1190, 1262)) * 100000, done = f > 1262;
    out.push(FXC('cnt' + q(n / 1000, 0) + done, (p) => counterCard(p, n, done), [RE_TOT[0] + 0.1, 2.6, 0.3], 1.25, { id: 'counter' }));
    for (let i = 0; i < 7; i++) { const t = ((f * 0.9 + i * 53) % 220) / 220, x = RE_TOT[0] - 4 + t * 12 + i * 0.3, y = 4.5 + (i % 3) * 0.9 + Math.sin(t * 9 + i) * 0.2, fl = (f + i * 5) * 0.55; out.push(FXC('bg' + i + q(fl % 6.283, 1), (p) => pigeon(p.g, { flap: fl, tube: false }), [x, y, -3.2 - (i % 2)], 1.1)); }
  }
  if (id === 'fin' && f > 1325) { const t = ramp(f, 1325, 1384), p0 = hookPos(1384 - 1289 - 8); out.push(FXC('ft' + q(t, 2), (p) => featherCard(p, 0.5 + Math.sin(t * 14) * 0.7), [p0[0] - 0.55 + Math.sin(t * 10) * 0.18, lerp(p0[1] - 0.3, 0.2, E.easeIn(t) * 0.8 + 0.2 * t), 0.15], 0.9)); }
  if (id === 'hook' || id === 'fin') { const ps = pigeonState(f, id).p; for (let i = 0; i < 3; i++) { const a = (f * 0.35 + i * 2.1); out.push(FXC('ts' + i + q(a % 6.283, 1), (p) => sparkle(p.g, 300, 520, 50, i % 2 ? '#fff6c0' : '#ffffff'), [ps[0] - 0.55 - i * 0.14, ps[1] - 0.2 + Math.sin(a) * 0.2, 0.3], 0.2 + 0.04 * i)); } }
  return out;
};
