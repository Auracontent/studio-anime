// « Le gâteau de Malo » (fiction du quotidien) — 38,2 s, 30 fps, 1145 images. Cadres calés sur phrases.json (whisper).
// Cuisine de campagne (library/cuisine.js) : four x = -4,2 ; plan de travail et plat x = -2 ; poubelle x = 0,6 ; grande table x = 3,6 ; arche vers le salon x = 3,8.
// Héros : Malo (11 ans, pull moutarde, tablier turquoise). Secondaires : Odile la grand-mère (violet, lunettes, chignon), Jade la cousine (rouge, couettes). Figurants : tonton, tata, un ami.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, tremble, follow, transition, crane, fgCard } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1145, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 57 },          // Tout le monde se moquait de son gâteau,
  { id: 'moque', a: 58, b: 125 },       // parce qu'il s'était effondré au milieu.
  { id: 'malo', a: 126, b: 157 },       // Malo, onze ans,
  { id: 'surprendre', a: 158, b: 229 }, // voulait surprendre sa grand-mère pour son anniversaire.
  { id: 'four', a: 230, b: 263 },       // Mais en ouvrant le four,
  { id: 'affaisse', a: 264, b: 309 },   // le gâteau s'est affaissé.
  { id: 'jade', a: 310, b: 395 },       // Sa cousine Jade a éclaté de rire, puis tous les autres.
  { id: 'honte', a: 396, b: 472 },      // Malo, rouge de honte, a voulu jeter le plat.
  { id: 'sauf', a: 473, b: 560 },       // Sauf que sa grand-mère lui a pris le plat des mains.
  { id: 'goute', a: 561, b: 633 },      // Elle a goûté une part, puis elle a fermé les yeux.
  { id: 'premier', a: 634, b: 762 },    // « Mon premier gâteau s'est effondré aussi. Celui-ci est délicieux. »
  { id: 'reprend', a: 763, b: 871 },    // Jade en a repris deux fois, et plus personne ne riait.
  { id: 'miette', a: 872, b: 978 },     // Il ne restait plus une miette, et Malo souriait enfin.
  { id: 'toi', a: 979, b: 1060 },       // La prochaine fois que ton gâteau s'effondre, ne le jette pas.
  { id: 'fin', a: 1061, b: 1144 },      // Un gâteau effondré peut être le meilleur de la table.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière : chaud (accroche) -> matin (le souvenir) -> froid (la honte) -> doré (le retournement) ----------
const DORE = mood('dore', { exposure: 1.3, gamma: 1.15 });
const MATIN = mood('matin', { exposure: 1.35, gamma: 1.15 });
const FROID = mood('froid', { exposure: 1.2, gamma: 1.2 });
const LAMPE = mood('lampe', { exposure: 1.4, gamma: 1.3 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'hook': case 'moque': return blendMood(DORE, MATIN, ramp(f, 100, 125));
    case 'malo': case 'surprendre': return MATIN;
    case 'four': case 'affaisse': return blendMood(MATIN, LAMPE, 0.35 * ramp(f, 236, 262));
    case 'jade': return blendMood(blendMood(MATIN, LAMPE, 0.35), FROID, ramp(f, 310, 360));
    case 'honte': return FROID;
    case 'sauf': return blendMood(FROID, DORE, ramp(f, 505, 540));
    case 'fin': return blendMood(DORE, DORE, 1);
    default: return DORE;
  }
};
const TINT = (S) => ({ jade: '#e8ecff', honte: '#dbe0ff', sauf: '#f0ecff' }[S.id] || '#fff4e4');

// ---------- positions ----------
const DISH = [-2.0, 0.95, -3.75], TB = [3.6, 0, -0.7], BIN = [0.6, 0, -3.2];
const MALO_HOOK = [-1.3, 0, -3.0], JADE_HOOK = [-2.7, 0, -2.9];
const malo = (f) => {
  if (f < 126) return { pos: MALO_HOOK, mode: 'hook' };
  if (f < 190) return { pos: [-0.7, 0, -2.8], mode: 'mix' };
  if (f < 232) { const k = E.smooth(ramp(f, 190, 230)); return { pos: [lerp(-0.7, -3.0, k), Math.abs(Math.sin(f * 0.5)) * 0.03, lerp(-2.8, -2.5, k)], mode: 'walk' }; }
  if (f < 408) return { pos: [-3.0, 0, -2.5], mode: 'stand' };
  if (f < 458) { const k = E.smooth(ramp(f, 408, 456)); return { pos: [lerp(-3.0, 0.2, k), Math.abs(Math.sin(f * 0.4)) * 0.03, -2.5], mode: 'walk' }; }
  if (f < 763) return { pos: [0.2, 0, -2.5], mode: 'bin' };
  if (f < 979) return { pos: [3.15, 0, -1.8], mode: 'table' };
  return { pos: [0.2, 0, -2.5], mode: 'toi' };
};
const odile = (f) => {
  if (f >= 158 && f < 230) return { pos: [3.8, 0, -5.3], mode: 'sit' };
  if (f >= 473 && f < 510) { const k = E.smooth(ramp(f, 473, 508)); return { pos: [lerp(2.9, 1.0, k), Math.abs(Math.sin(f * 0.4)) * 0.03, -2.5], mode: 'walk' }; }
  if (f >= 510 && f < 763) return { pos: [1.0, 0, -2.5], mode: 'stand' };
  if (f >= 763) return { pos: [3.8, 0, -1.8], mode: 'table' };
  return null;
};
const dishAt = (f) => {
  if (f < 126) return { at: 'counter', c: 0.5 + 0.5 * E.easeOut(ramp(f, 0, 50)), eaten: 0 };
  if (f >= 214 && f < 306) return { at: 'oven', c: E.smooth(ramp(f, 266, 290)), eaten: 0 };
  if (f >= 763 && f < 979) return { at: 'table', c: 1, eaten: E.smooth(ramp(f, 775, 868)) };
  if (f >= 1061) return { at: 'counter', c: 1, eaten: 0 };
  return { at: 'none', c: 1, eaten: 0 };
};
export const worldAt = (f) => {
  const S = shotAt(f), ing = f >= 126 && f < 214 ? 1 : 0;
  return { win: S.id === 'honte' ? 0.7 : 1, oven: E.smooth(ramp(f, 236, 252)) * (1 - E.smooth(ramp(f, 305, 309))), cake: dishAt(f), ing, lid: E.smooth(ramp(f, 436, 452)) * (1 - E.smooth(ramp(f, 505, 515))) };
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.9, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const MP = (f) => malo(f).pos;
const CENTER = [-2.0, 0, -3.3];
const HOOKCAM = (f) => crane(CENTER, f, 0, 125, { ease: 'easeOut', from: { r: 2.4, h: 2.3, yaw: 0, lookUp: 0.95 }, to: { r: 8.2, h: 2.2, yaw: -14, lookUp: 1.2 }, fov: 42 });
const BIN_AT = [0.2, 0, -2.5];
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'moque': return HOOKCAM(f);
    case 'malo': return camFromKeys([K(126, [-0.7, 0, -2.8], { headW: 0.3, yaw: -10, low: 10, frameY: 0.4 }), K(157, [-0.7, 0, -2.8], { headW: 0.34, yaw: 6, low: 14, frameY: 0.4 })], f);
    case 'surprendre': return camFromKeys([R(158, [-2.4, 1.8, 2.0], [1.2, 1.2, -4.4], 54), R(205, [-2.2, 1.8, 1.9], [1.3, 1.2, -4.4], 54), K(229, [-2.4, 0, -2.5], { headW: 0.22, yaw: -10, frameY: 0.4 })], f);
    case 'four': return camFromKeys([K(230, [-3.4, 0, -2.5], { headW: 0.26, yaw: -10, low: 6, frameY: 0.4 }), R(252, [-3.3, 1.05, -1.0], [-4.1, 0.6, -3.8], 38), R(263, [-3.7, 0.9, -1.6], [-4.2, 0.55, -3.9], 34)], f);
    case 'affaisse': { const c = camFromKeys([R(264, [-3.7, 0.9, -1.6], [-4.2, 0.55, -3.9], 34), R(284, [-3.8, 0.85, -1.9], [-4.2, 0.5, -3.9], 30), K(297, [-3.0, 0, -2.5], { headW: 0.34, yaw: -8, low: 16, frameY: 0.4, dutch: 4 }), K(309, [-3.0, 0, -2.5], { headW: 0.36, yaw: 4, low: 18, frameY: 0.4, dutch: 4 })], f); return shake(c, f, 276, 0.1, 12); }
    case 'jade': return camFromKeys([{ f: 310, ...frameTwo([-3.0, 0, -2.5], [-1.9, 0, -2.6], { headW: 0.27, yaw: -8, s: 0.9, low: 6 }) }, { f: 352, ...frameTwo([-3.0, 0, -2.5], [-1.9, 0, -2.6], { headW: 0.25, yaw: 6, s: 0.9, low: 8 }) }, R(395, [-1.2, 1.5, 2.2], [-2.0, 1.1, -3.0], 44)], f);
    case 'honte': return follow(MP, f, { headW: 0.3, yaw: 12, lag: 5, lead: 0.5, s: 0.9, low: 4, dutch: 4, frameY: 0.4 });
    case 'sauf': return camFromKeys([K(473, BIN_AT, { headW: 0.26, yaw: 6, frameY: 0.4 }), { f: 512, ...frameTwo(BIN_AT, [1.0, 0, -2.5], { headW: 0.26, yaw: -4, s: 0.92 }) }, K(560, [1.0, 0, -2.5], { headW: 0.3, yaw: 4, low: 14, frameY: 0.4, s: 0.95 })], f);
    case 'goute': return camFromKeys([K(561, [1.0, 0, -2.5], { headW: 0.34, yaw: 6, low: 14, frameY: 0.4, s: 0.95 }), K(633, [1.0, 0, -2.5], { headW: 0.4, yaw: -4, low: 18, frameY: 0.42, s: 0.95 })], f);
    case 'premier': return camFromKeys([{ f: 634, ...frameTwo([0.2, 0, -2.5], [1.0, 0, -2.5], { headW: 0.26, yaw: 8, s: 0.92, low: 8 }) }, { f: 698, ...frameTwo([0.2, 0, -2.5], [1.0, 0, -2.5], { headW: 0.29, yaw: -2, s: 0.92, low: 12 }) }, { f: 762, ...frameTwo([0.2, 0, -2.5], [1.0, 0, -2.5], { headW: 0.31, yaw: -8, s: 0.92, low: 14, dutch: 3 }) }], f);
    case 'reprend': return camFromKeys([R(763, [3.1, 1.6, 3.5], [3.1, 1.0, -1.8], 40), R(830, [3.1, 1.45, 2.3], [3.0, 1.05, -1.8], 38), K(871, [2.5, 0, -1.8], { headW: 0.3, yaw: 6, frameY: 0.4, s: 0.9 })], f);
    case 'miette': return f < 929 ? camFromKeys([R(872, [3.6, 1.3, 0.4], [3.6, 0.85, -0.7], 34), R(928, [3.6, 1.2, 0.2], [3.6, 0.88, -0.7], 30)], f) : crane([3.4, 0, -1.5], f, 929, 49, { from: { r: 2.6, h: 1.3, yaw: 4, lookUp: 1.0 }, to: { r: 8.5, h: 3.0, yaw: -16, lookUp: 1.1 }, fov: 44 });
    case 'toi': return camFromKeys([K(979, [0.2, 0, -2.5], { headW: 0.3, yaw: -6, low: 14, frameY: 0.4 }), K(1060, [0.2, 0, -2.5], { headW: 0.36, yaw: 4, low: 20, frameY: 0.42 })], f);
    case 'fin': return camFromKeys([R(1061, [-2.0, 1.5, 0.2], [-2.0, 1.05, -3.7], 42), R(1100, HOOKCAM(0).pos, HOOKCAM(0).look, HOOKCAM(0).fov), R(1144, HOOKCAM(0).pos, HOOKCAM(0).look, HOOKCAM(0).fov)], f);
  }
  return HOOKCAM(0);
};
const TR = [{ a: 126, type: 'whip', dir: 1 }, { a: 473, type: 'whip', dir: -1 }, { a: 763, type: 'whip', dir: 1 }, { a: 979, type: 'push' }, { a: 1061, type: 'whip', dir: -1 }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
const FG = { goute: 'fork', premier: 'fork' };
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return FG[shotAt(f).id] ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
const BEAM = { at: [-0.5, 2.0, -3.9], yaw: 0.25, pitch: 0.55, len: 6, r: 1.3, col: '#ffd8a0', a: 0.2 };
export const envAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'moque': return { motes: 0.6, smoke: [{ at: [-2.0, 1.15, -3.7], f0: 0, f1: 100, rate: 5, size: 0.3, col: '#ffffff', rise: 0.4 }] };
    case 'surprendre': return { motes: 0.8, spray: [{ at: [-1.3, 1.25, -3.6], f0: 172, n: 50, power: 0.9, col: '#ffffff' }] };
    case 'four': return { motes: 0.5, smoke: [{ at: [-4.2, 0.95, -3.3], f0: 238, f1: 262, rate: 6, size: 0.4, col: '#ffffff', rise: 0.6 }] };
    case 'affaisse': return { motes: 0.5, smoke: [{ at: [-4.2, 0.85, -3.8], f0: 266, f1: 300, rate: 7, size: 0.4, col: '#ffffff', rise: 0.6 }], spray: [{ at: [-4.2, 0.8, -3.8], f0: 270, n: 60, power: 1.1, col: '#f0c878' }] };
    case 'sauf': return { motes: 0.8, beams: [{ ...BEAM, a: 0.2 * ramp(f, 510, 540) }] };
    case 'goute': case 'premier': return { motes: 1.1, beams: [BEAM] };
    case 'reprend': case 'miette': case 'toi': return { motes: 0.8 };
    case 'fin': return { motes: 0.6, smoke: [{ at: [-2.0, 1.15, -3.7], f0: 1050, f1: 1144, rate: 5, size: 0.3, col: '#ffffff', rise: 0.4 }] };
  }
  return { motes: 0.3 };
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.malo = { tunic: '#e8b020', skin: '#b88660', hair: '#3a2418', brows: '#2a1a12', apron: '#18b8d8' };
  O.odile = { tunic: '#7a3aa8', dress: '#8e4cc0', skin: '#ecc09a', hair: '#dcdce2', bun: '#dcdce2', glasses: true, brows: '#b0b0b8', stout: true, buttons: true };
  O.jade = { tunic: '#d6322e', skin: '#f3cfae', hair: '#3a2210', braids: '#3a2210', ribbon: '#ffd23a', brows: '#3a2210' };
  O.tonton = { tunic: '#14a88a', skin: '#c58e66', hair: '#2a1e1a', moustache: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.tata = { tunic: '#e05a9a', dress: '#e05a9a', skin: '#a9724a', hair: '#1e1714', brows: '#1e1714' };
  O.ami = { tunic: '#3a6ad8', skin: '#f0c8a0', hair: '#e8c46a', cap: '#e8483a', brows: '#8a6a2a' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };

// expressions de Malo : surpris, gêné, honteux, déterminé, soulagé, heureux
const EXM = [[0, 'shock'], [22, 'nervous'], [58, 'pained'], [126, 'grin'], [158, 'grin'], [190, 'determined'], [230, 'smile'], [252, 'determined'], [266, 'shock'], [300, 'dazed'], [310, 'nervous'], [396, 'pained'], [473, 'pained'], [510, 'shock'], [561, 'nervous'], [634, 'shock'], [699, 'smile'], [740, 'grin'], [763, 'smile'], [830, 'smile'], [872, 'laugh'], [979, 'proud'], [1030, 'grin'], [1061, 'grin']];
const exprM = (f) => EXM.reduce((a, [k, e]) => (f >= k ? e : a), 'neutral');
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT(S);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const lau = (i) => ({ dy: Math.abs(Math.sin(f * 0.5 + i)) * 0.03, roll: Math.sin(f * 0.5 + i) * 0.04, marks: false });
  const mal = malo(f), mp = mal.pos, ex = exprM(f);
  const step = q((f * 0.08) % 1, 2);
  // ---- Malo (toujours la même carte, le même pull moutarde) ----
  const plat = (f >= 300 && f < 510) || (f >= 979 && f < 1061);
  let mo = { expr: ex, L: 'hip', R: 'hip', look: -0.4 };
  switch (mal.mode) {
    case 'hook': mo = { ...mo, L: 'head', R: 'head', wv: q(f * 0.4, 1), look: -0.9 }; break;
    case 'mix': mo = f < 158 ? { ...mo, L: 'show', R: 'hip', holdL: 'paper', look: 0 } : { ...mo, L: 'hip', R: 'push', look: 0.5 }; break;
    case 'walk': mo = { ...mo, L: f >= 300 && f < 510 ? 'carry' : 'push', R: f >= 300 && f < 510 ? 'carry' : 'push', run: f < 232, step, look: 0.3, ...(plat ? { holdL: 'plat' } : {}) }; break;
    case 'stand': mo = f < 300 ? { ...mo, L: f < 264 ? 'hip' : 'head', R: f < 264 ? 'hip' : 'head', wv: q(f * 0.4, 1), look: -0.2 } : { ...mo, L: 'carry', R: 'carry', holdL: 'plat', look: 0.7 }; break;
    case 'bin': mo = f < 510 ? { ...mo, L: 'carry', R: 'carry', holdL: 'plat', look: 0.3 } : { ...mo, L: 'hang', R: 'hang', look: 0.6 }; break;
    case 'table': mo = { ...mo, L: 'hip', R: 'hip', look: -0.5 }; break;
    case 'toi': mo = { ...mo, L: 'point', R: 'show', holdR: 'plat', look: 0 }; break;
  }
  if (f >= 1061) mo = { ...mo, L: 'hip', R: 'hip', look: -0.8, expr: 'grin' };
  fig('malo', 6, mo, mp, { s: 0.9, ...(mal.mode === 'hook' ? tremble(f, 0.006, 3) : {}), ...(mo.expr === 'laugh' ? lau(1) : {}), ...(f >= 1061 ? { x: MALO_HOOK[0], z: MALO_HOOK[2] } : {}) });
  // ---- les rieurs ----
  if (f < 396 || (f >= 396 && f < 473)) {
    const laughing = f < 473, early = f < 126;
    const ex1 = f >= 353 || early || f >= 58 ? 'laugh' : 'smile';
    if (f < 126 || (f >= 264 && f < 473)) {
      const jx = f < 126 ? JADE_HOOK : [-1.9, 0, -2.6];
      const jex = f < 310 && f >= 264 ? 'shock' : (f >= 310 || f < 126 ? 'laugh' : 'smile');
      if (f >= 264 || f < 126) fig('jade', 8, { expr: jex, L: 'hip', R: 'point', look: f < 126 ? 0.8 : -0.8 }, jx, { s: 0.9, ...(jex === 'laugh' && laughing ? lau(0) : {}) });
    }
    if ((f >= 58 && f < 126) || (f >= 310 && f < 473)) {
      const g = (who, seed, pos, i, startF) => fig(who, seed, { expr: f >= startF || f < 126 ? 'laugh' : 'smile', L: i % 2 ? 'up' : 'point', R: 'hip', look: -0.6 }, pos, { s: 1.0, ...(f >= startF || f < 126 ? lau(i) : { marks: false }) });
      g('tonton', 10, [-0.9, 0, -3.2], 1, 353); g('tata', 12, [0.0, 0, -3.1], 2, 357); g('ami', 14, [-2.4, 0, -3.25], 3, 349);
    }
  }
  // ---- Odile ----
  const od = odile(f);
  if (od) {
    const o = { expr: 'proud', L: 'hip', R: 'hip', look: -0.4, headTilt: 4 };
    if (od.mode === 'sit') fig('odile', 16, { expr: 'smile', L: 'hip', R: 'hip', sit: true, seat: false, holdR: 'paper', look: 0 }, od.pos, { s: 0.95 });
    else if (od.mode === 'walk') fig('odile', 16, { ...o, expr: 'proud', L: 'hang', R: 'push', run: false, step, look: -0.7 }, od.pos, { s: 0.95 });
    else if (f < 763) {
      const taking = f < 534, tasted = f >= 590, eatPhase = f >= 561 && f < 590;
      let op = { ...o, L: taking ? 'carry' : 'hip', R: taking ? 'carry' : 'hip', holdR: f >= 510 ? 'plat' : undefined, look: f < 561 ? -0.8 : 0 };
      if (f >= 534 && f < 634) op = { ...o, L: 'chin', R: 'carry', holdR: 'plat', holdL: 'fork', look: 0, expr: tasted ? 'smile' : 'suspicious', blink: tasted ? 1 : 0 };
      if (f >= 634) op = { ...o, L: 'hip', R: 'show', holdR: f >= 640 ? 'plat' : undefined, expr: 'grin', look: -0.5, headTilt: 6 };
      if (op.blink === undefined) delete op.blink;
      const key = { ...op }; fig('odile', 16, key, od.pos, { s: 0.95 });
    } else {
      fig('odile', 16, { expr: f < 830 ? 'proud' : 'smile', L: 'hip', R: f >= 979 ? 'hip' : 'hip', look: 0, headTilt: 4 }, od.pos, { s: 0.95, ...(f >= 929 && f < 979 ? lau(2) : {}) });
    }
  }
  // ---- la tablée : Jade, tonton, tata, ami (de 763 à la fin du plan large) ----
  if (f >= 763 && f < 1061) {
    const second = f >= 800, silent = f >= 830, party = f >= 929;
    fig('jade', 8, { expr: party ? 'laugh' : second ? 'grin' : 'grin', L: second && !silent ? 'up' : 'hip', R: 'hip', holdR: f < 872 ? 'fork' : undefined, look: -0.2 }, [2.5, 0, -1.8], { s: 0.9, ...(party ? lau(0) : { dy: Math.abs(Math.sin(f * 0.35)) * 0.012 * (silent ? 0 : 1) }), marks: undefined });
    fig('tonton', 10, { expr: silent ? 'smile' : 'laugh', L: 'hip', R: 'hip', holdR: f < 872 ? 'fork' : undefined, look: -0.3 }, [4.5, 0, -1.9], { s: 1.0, ...(party ? lau(1) : {}), marks: false });
    fig('tata', 12, { expr: silent ? 'smile' : 'smile', L: 'hip', R: 'hip', look: -0.5 }, [5.3, 0, -1.9], { s: 1.0, ...(party ? lau(3) : {}), marks: false });
    fig('ami', 14, { expr: party ? 'laugh' : 'smile', L: 'hip', R: 'hip', look: 0.4 }, [1.8, 0, -1.9], { s: 0.95, ...(party ? lau(4) : {}), marks: false });
  }
  // ---- fin : les deux rieurs de l'accroche, qui sourient maintenant ----
  if (f >= 1061) fig('jade', 8, { expr: 'grin', L: 'hip', R: 'point', look: 0.8 }, JADE_HOOK, { s: 0.9, dy: Math.abs(Math.sin(f * 0.3)) * 0.015, marks: false });
  // objets au premier plan, flous
  if (FG[S.id]) { const cam = camAt(f); out.push(fgCard(cam, T.fgProp(FG[S.id], { seed: 2 }), { key: 'fg' + S.id, side: S.id === 'goute' ? -1 : 1, dist: 1.15, drop: 0.6, s: 0.5 })); }
  return out;
};
export const fxAt = (f, T) => [];
