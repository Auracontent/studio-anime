// « L'illusion de Charpentier » — 45.28 s, 30 fps, 1358 images. Phrases : ../phrases.json. Plan de tournage : ../PLAN.md
import { M as E, camFromKeys, frameOn, frameTwo, shake, transition, hop, tremble, walk, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
import { mood, blendMood } from '../moods.js';
import { BX, BZ } from '../library/laboratoire.js';
export const FPS = 30, TOTAL = 1358, DECK = 0;

// ---------- plans (une phrase = une action) ----------
export const SHOTS = [
  { id: 'hook', a: 0, b: 199 },        // Deux boîtes pèsent exactement pareil, et pourtant, ta main jure que la petite est plus lourde.
  { id: 'nancy', a: 200, b: 309 },     // Un médecin français l'a prouvé, à Nancy, en mille huit cent quatre-vingt-onze.
  { id: 'atelier', a: 310, b: 408 },   // Il fabrique des boules de même poids, mais de tailles différentes.
  { id: 'tend', a: 409, b: 510 },      // Il les tend à ses volontaires : laquelle est la plus lourde ?
  { id: 'reponse', a: 511, b: 580 },   // À chaque fois, même réponse : la petite !
  { id: 'repete', a: 581, b: 656 },    // Ils soupèsent, recommencent, et se trompent encore.
  { id: 'balance', a: 657, b: 784 },   // Sauf que… la balance, elle, ne ment pas : égalité parfaite.
  { id: 'fait', a: 785, b: 970 },      // En fait, ton cerveau devine le poids avant de soulever : gros, donc lourd.
  { id: 'grosse', a: 971, b: 1021 },   // Il prépare trop d'effort pour la grosse,
  { id: 'petite', a: 1022, b: 1062 },  // trop peu pour la petite,
  { id: 'ecart', a: 1063, b: 1114 },   // et cet écart te trompe.
  { id: 'sait', a: 1115, b: 1198 },    // Même quand on le sait, l'illusion reste.
  { id: 'mefie', a: 1199, b: 1303 },   // Alors méfie-toi de ta main : deux boîtes, un seul poids,
  { id: 'fin', a: 1304, b: 1357 },     // et une petite menteuse.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const SH = Object.fromEntries(SHOTS.map((s) => [s.id, s]));

// ---------- lumière : une ambiance par acte ----------
const LIGHT = { hook: mood('jour'), nancy: mood('matin'), atelier: mood('lampe', { hemi: 1.25, sunI: 3.0, ao: 0.6 }), tend: mood('jour'), reponse: mood('jour'), repete: mood('jour', { el: 40 }),
  balance: mood('dore'), fait: mood('jour', { el: 48 }), grosse: mood('jour', { el: 35, sunI: 3.0 }), petite: mood('jour', { el: 35, sunI: 3.0 }), ecart: mood('jour'), sait: mood('jour'), mefie: mood('jour'), fin: mood('dore') };
export const lightFor = (S, f) => {
  const i = SHOTS.indexOf(S), prev = i > 0 ? SHOTS[i - 1] : null;
  const k = prev ? ramp(f, S.a - 6, S.a + 8) : 1;
  const L = prev ? blendMood(LIGHT[prev.id], LIGHT[S.id], k) : LIGHT[S.id];
  if (S.id === 'mefie') return blendMood(LIGHT.mefie, LIGHT.fin, ramp(f, 1240, 1300));
  return L;
};

// ---------- lieux ----------
const rad = (d) => (d * Math.PI) / 180;
const P0 = [0, 0, 0.3], P2 = [-4, 0, 0.3];
const POS = {   // [docteur, volontaire M, volontaire F] par plan
  hook: { d: [0.95, 0, 0.5], m: [0, 0, 0.3] },
  atelier: { d: [-11.2, 0, -0.35] },
  tend: { d: [4.15, 0, 0.5], m: [3.0, 0, 0.25], f: [5.3, 0, 0.3] },
  reponse: { d: [4.3, 0, 0.55], m: [3.2, 0, 0.25], f: [5.35, 0, 0.3] },
  repete: { d: [4.3, 0, 0.55], m: [3.2, 0, 0.25], f: [5.35, 0, 0.3] },
  fait: { d: [-2.9, 0, 0.5], m: P2 },
  grosse: { d: [-2.9, 0, 0.5], m: P2 },
  petite: { d: [-5.2, 0, 0.5], f: P2 },
  ecart: { d: [-4, 0, 0.55], m: [-5.0, 0, 0.3], f: [-3.0, 0, 0.3] },
  sait: { d: [1.05, 0, 0.5], m: P0 },
  mefie: { d: [1.05, 0, 0.5], m: P0 },
  fin: { d: [1.05, 0, 0.5], m: P0 },
};
const mid = (a, b) => [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2];
const DOOR = [-5.2, 0, -2.4];
const nancyPos = (f) => { const w = walk(f, 206, 0.9); return [DOOR[0] + w.dist, 0, DOOR[2] + Math.min(1.9, w.dist * 0.9)]; };
const BALL_AT = (f) => [-12.1, 1.6, -1.55];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const KC = (f, at, d, yaw, o = {}, e = {}) => { const a = rad(yaw); return { f, pos: [at[0] + d * Math.sin(a), at[1] + (o.h ?? 0), at[2] + d * Math.cos(a)], look: [at[0] + (o.lx || 0), at[1] + (o.ly || 0), at[2]], fov: o.fov ?? 40, ...e }; };
const HOOKC = (f) => (f === 0 ? K2(0, POS.hook.m, POS.hook.d, { yaw: -20, headW: 0.3, frameY: 0.4 }) : K2(f, POS.hook.m, POS.hook.d, { yaw: -6, headW: 0.33, frameY: 0.4 }, { ease: 'smooth' }));
const BALC = [BX, 1.65, BZ];
const CAMS = {
  hook: [HOOKC(0), HOOKC(199)],
  nancy: [{ f: 200, pos: [-1.2, 1.9, 7.2], look: [-5.4, 1.9, -1.2], fov: 46 }, { f: 309, pos: [-5.4, 1.7, 6.0], look: [-4.2, 1.6, -0.6], fov: 44, ease: 'smooth' }],
  atelier: [K(310, [-11.3, 0, -0.35], { headW: 0.3, yaw: 18, frameY: 0.4 }), K(408, [-11.1, 0, -0.35], { headW: 0.34, yaw: 6, frameY: 0.4 }, { ease: 'smooth' })],
  tend: [K2(409, POS.tend.m, POS.tend.d, { yaw: -18, headW: 0.26 }), K2(510, POS.tend.m, POS.tend.d, { yaw: 6, headW: 0.29 }, { ease: 'smooth' })],
  reponse: [K2(511, POS.reponse.m, POS.reponse.f, { yaw: -10, headW: 0.2, frameY: 0.4 }), K2(580, POS.reponse.m, POS.reponse.f, { yaw: 6, headW: 0.23, frameY: 0.4 }, { ease: 'smooth' })],
  repete: [K2(581, POS.repete.m, POS.repete.f, { yaw: 8, headW: 0.2, frameY: 0.4 }), K2(656, POS.repete.m, POS.repete.f, { yaw: -8, headW: 0.23, frameY: 0.4 }, { ease: 'smooth' })],
  balance: [KC(657, BALC, 6.6, 8, { ly: 0.0 }), KC(745, BALC, 5.6, -3, { ly: -0.05 }, { ease: 'smooth' }), KC(784, BALC, 5.2, -3, { ly: -0.05 })],
  fait: [K(785, rel2(POS.fait.m, 0.4), { headW: 0.3, yaw: -14, frameY: 0.4 }), K(970, rel2(POS.fait.m, 0.4), { headW: 0.33, yaw: 6, frameY: 0.4 }, { ease: 'smooth' })],
  grosse: [K2(971, POS.grosse.m, POS.grosse.d, { yaw: -12, headW: 0.26 }), K2(1021, POS.grosse.m, POS.grosse.d, { yaw: 4, headW: 0.29 }, { ease: 'smooth' })],
  petite: [K(1022, POS.petite.f, { headW: 0.31, yaw: 14, frameY: 0.4 }), K(1062, POS.petite.f, { headW: 0.34, yaw: 6, frameY: 0.4 }, { ease: 'smooth' })],
  ecart: [K2(1063, POS.ecart.m, POS.ecart.f, { yaw: 0, headW: 0.22, frameY: 0.4 }), K2(1114, POS.ecart.m, POS.ecart.f, { yaw: -6, headW: 0.25, frameY: 0.4 }, { ease: 'smooth' })],
  sait: [K2(1115, POS.sait.m, POS.sait.d, { yaw: 16, headW: 0.28 }), K2(1198, POS.sait.m, POS.sait.d, { yaw: 0, headW: 0.31 }, { ease: 'smooth' })],
  mefie: [K(1199, rel2(POS.mefie.m, 0.35), { headW: 0.32, yaw: 12, frameY: 0.4 }), K(1303, rel2(POS.mefie.m, 0.35), { headW: 0.35, yaw: -4, frameY: 0.4 }, { ease: 'smooth' })],
  fin: [HOOKC(0), K2(1357, POS.fin.m, POS.fin.d, { yaw: -8, headW: 0.31, frameY: 0.4 }, { ease: 'smooth' })],
};
function rel2(p, dx) { return [p[0] + dx, p[1], p[2]]; }
const KICKS = [{ f: 659, a: 0.04 }, { f: 995, a: 0.04 }];
const TRANS = [['whip', 'hook', 'nancy', 1], ['push', 'nancy', 'atelier'], ['whip', 'atelier', 'tend', -1], ['push', 'tend', 'reponse'], ['push', 'reponse', 'repete'], ['whip', 'repete', 'balance', 1],
  ['rise', 'balance', 'fait'], ['push', 'fait', 'grosse'], ['whip', 'grosse', 'petite', -1], ['push', 'petite', 'ecart'], ['whip', 'ecart', 'sait', 1], ['push', 'sait', 'mefie'], ['drop', 'mefie', 'fin']];
const N_TR = 10;
const baseCam = (id, f) => camFromKeys(CAMS[id], f, { kicks: KICKS });
const first = (id) => SH[id].a, last = (id) => SH[id].b;
export const camAt = (f) => {
  for (const [type, from, to, dir] of TRANS) { const f0 = SH[to].a - N_TR / 2; if (f >= f0 && f < f0 + N_TR) return transition(type, baseCam(from, last(from)), baseCam(to, first(to)), f, f0, N_TR, { dir: dir || 1 }); }
  let c = baseCam(shotAt(f).id, f);
  c = shake(c, f, 995, 0.08, 10);
  if (f >= 659 && f < 665) c = { ...c, flash: (1 - (f - 659) / 6) * 0.5 };   // le pivot « Sauf que… »
  return c;
};

// ---------- mise au point ----------
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const id = shotAt(f).id, C = camAt(f);
  if (id === 'nancy') return { focus: dist3(C.pos, [-4.5, 1.2, -0.6]), cinf: 3 };
  if (id === 'balance') return { focus: dist3(C.pos, [BX, 1.6, BZ]), cinf: 5 };
  const p = (POS[id] && (POS[id].m || POS[id].f || POS[id].d)) || P0;
  return { focus: dist3(C.pos, [p[0], 1.4, p[2]]), cinf: 9 };
};

// ---------- état du monde (fléau de la balance, roue du tour) ----------
export const worldAt = (f) => {
  let beam = 0;
  if (f >= 640 && f < 760) { const t = (f - 650) / 30; beam = f < 659 ? 0 : 0.3 * Math.exp(-t * 0.9) * Math.cos(t * 5.5); }
  if (f >= 760) beam = 0;
  return { glow: 1, beam, lathe: f * 0.12 };
};

// ---------- effets 3D ----------
export const envAt = (f) => {
  const id = shotAt(f).id, e = {};
  if (id !== 'fin' && id !== 'mefie') e.motes = id === 'nancy' || id === 'balance' ? 0.7 : 0.4;
  if (id === 'atelier') e.sparks = [{ at: BALL_AT(f), f0: 310, f1: 408, rate: 40, col: '#ffcf70', speed: 2.4, size: 0.05 }];
  if (id === 'balance' || id === 'fin') e.beams = [{ at: [2.0, 3.3, -3.0], yaw: 0, pitch: -0.62, len: 9, r: 1.3, col: '#fff0c0', a: id === 'balance' ? 0.16 : 0.1 }];
  return e;
};

// ---------- casting (nouveau à chaque épisode) ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.docteur = { tunic: '#f4f0e6', skin: '#e9b98f', hair: '#4a3020', moustache: '#4a3020', brows: '#4a3020', glasses: true, bowtie: '#d23a32' };
  O.volM = { tunic: '#e0a526', skin: '#8a5a3a', cap: '#18b8d8', stout: true };
  O.volF = { tunic: '#7b4fb8', skin: '#f1c9a4', hair: '#2a1a18', brows: '#2a1a18' };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };

// ---------- cartes ----------
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 16) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const ellipse = (g, x, y, rx, ry, fill, lw = 9) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.283); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
function ball(g, x, y, rr, col, face = 0) {
  ellipse(g, x, y, rr, rr, col, 10); g.save(); g.globalAlpha = 0.55; ellipse(g, x - rr * 0.35, y - rr * 0.38, rr * 0.28, rr * 0.18, '#fff', 0); g.restore();
  if (face) { for (const s of [-1, 1]) { ellipse(g, x + s * rr * 0.36, y - rr * 0.12, rr * 0.2, rr * 0.22, '#fff', 5); ellipse(g, x + s * rr * 0.36 + rr * 0.05, y - rr * 0.08, rr * 0.09, rr * 0.11, INK, 0); }
    g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - rr * 0.5, y - rr * 0.42); g.lineTo(x - rr * 0.2, y - rr * 0.36); g.moveTo(x + rr * 0.5, y - rr * 0.42); g.lineTo(x + rr * 0.2, y - rr * 0.36); g.stroke();
    g.beginPath(); g.moveTo(x - rr * 0.35, y + rr * 0.3); g.quadraticCurveTo(x, y + rr * 0.62, x + rr * 0.45, y + rr * 0.2); g.stroke(); }
}
function bubbleCard(p, stage, k) {   // bulle de pensée du cerveau : cerveau -> grosse boule -> « LOURD »
  const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 500); g.scale(s, s); g.translate(-300, -500);
  for (const [x, y, r] of [[300, 700, 16], [330, 650, 24], [345, 590, 34]]) ellipse(g, x, y, r, r, '#fbf7ec', 8);
  g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = '#fbf7ec'; g.beginPath(); g.roundRect(40, 320, 520, 250, 110); g.fill(); g.stroke();
  if (stage === 'brain') { ellipse(g, 300, 445, 150, 95, '#f4a6bd', 9); g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(300, 355); g.quadraticCurveTo(280, 445, 300, 535); g.moveTo(200, 420); g.quadraticCurveTo(240, 400, 270, 430); g.moveTo(400, 420); g.quadraticCurveTo(360, 400, 330, 430); g.moveTo(215, 480); g.quadraticCurveTo(250, 500, 275, 480); g.moveTo(385, 480); g.quadraticCurveTo(350, 500, 325, 480); g.stroke(); }
  else { ball(g, 190, 445, stage === 'big' ? 100 : 80, '#e23d32'); if (stage === 'heavy') { g.save(); g.translate(400, 445); g.rotate(-0.12); TXT(g, 'LOURD', 0, 22, 72, '#ffd23a', 14); g.restore(); } }
  g.restore();
}
function gaugeCard(p, k, h1, h2, lab1, lab2) {   // deux jauges : effort préparé / effort nécessaire
  const g = p.g; g.save(); const s = 0.6 + 0.4 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 330, 540, 380, '#fbf7ec');
  [[150, h1, '#ff7a1a', lab1], [450, h2, '#2fae6a', lab2]].forEach(([x, h, c, lab]) => { g.fillStyle = '#e6dfcf'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(x - 50, 370, 100, 260, 18); g.fill(); g.stroke(); const hh = 250 * clamp(h); g.fillStyle = c; g.beginPath(); g.roundRect(x - 44, 626 - hh, 88, hh, 14); g.fill(); TXT(g, lab, x, 690, 38, INK, 0); });
  g.restore();
}
function eqCard(p, k) { const g = p.g; g.save(); const s = 0.4 + 0.6 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); ball(g, 120, 500, 78, '#e23d32'); TXT(g, '=', 300, 570, 190, '#ffd23a', 22); ball(g, 480, 520, 44, '#2f7fd8'); g.restore(); }
function yearCard(p, k) { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 400, 540, 240, '#271925'); TXT(g, '1891', 300, 565, 170, '#ffd23a', 0); g.restore(); }
function ballCard(p, big, face, sq = 1) { const g = p.g; g.save(); g.translate(300, 520); g.scale(1, sq); g.translate(-300, -520); ball(g, 300, 520, big ? 150 : 100, big ? '#e23d32' : '#2f7fd8', face); g.restore(); }
function sheetCard(p) { const g = p.g; g.lineJoin = 'round'; panel(g, 60, 360, 480, 300, '#fbf7ec'); g.strokeStyle = '#9a8f86'; g.lineWidth = 8; g.lineCap = 'round'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(110, 430 + i * 48); g.lineTo(490, 430 + i * 48); g.stroke(); } }

// ---------- acteurs ----------
const FXC = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
// bras qui soupèse : alterne haut / bas
const weigh = (f, ph = 0, period = 34) => (((f + ph) % period) < period / 2 ? ['up', 'reach'] : ['reach', 'up']);

export const actorsAt = (f, T) => {
  const id = shotAt(f).id, out = [], P = POS[id] || {};
  const doc = (o, pos, extra = {}) => out.push(R(T, 'docteur', life(f, 13, o), pos, extra));
  const vm = (o, pos, extra = {}) => out.push(R(T, 'volM', life(f, 5, o), pos, extra));
  const vf = (o, pos, extra = {}) => out.push(R(T, 'volF', life(f, 9, o), pos, extra));
  switch (id) {
    case 'hook': {
      const tr = f > 40 ? tremble(f, 0.012, 1) : {};
      vm({ expr: f < 30 ? 'smile' : f < 150 ? 'squint' : 'pained', L: 'up', R: 'lift', holdL: 'ballBig', holdR: 'ballSmall', look: 0.4, tilt: f > 30 ? 6 : 0 }, P.m, tr);
      doc({ expr: f < 100 ? 'grin' : 'laugh', L: 'hip', R: f > 105 ? 'point' : 'hip', look: -0.4 }, P.d, f > 175 ? hop(f, 178, 0.06, 6) : {});
      break; }
    case 'nancy': {
      const w = walk(f, 206, 0.9), p = nancyPos(f), arrived = f > 290;
      doc({ expr: 'smile', L: 'hip', R: arrived ? 'up' : 'hip', step: q(w.phase, 2), bob: q(0.012 + 0.012 * Math.abs(Math.sin(w.phase * 6.283)), 3), look: 0.3 }, [Math.min(p[0], -3.5), 0, Math.min(p[2], -0.5)], {});
      break; }
    case 'atelier': {
      const sw = f > 365;
      doc({ expr: sw ? 'grin' : 'squint', L: 'up', R: sw ? 'up' : 'push', holdL: 'ballBig', holdR: sw ? 'ballSmall' : 'tool', look: -0.6 }, P.d, sw ? hop(f, 366, 0.1, 8) : { dx: 0.015 * Math.sin(f * 0.8) });
      break; }
    case 'tend': {
      const rec = f > 440, wz = f > 462;
      doc({ expr: 'smile', L: 'lift', R: 'lift', holdL: rec ? undefined : 'ballBig', holdR: rec ? undefined : 'ballSmall', look: 0.3 }, P.d, {});
      const [l, r] = wz ? weigh(f, 0, 30) : ['lift', 'lift'];
      vm({ expr: wz ? 'squint' : 'neutral', L: rec ? l : 'hip', R: rec ? r : 'lift', holdL: rec ? 'ballBig' : undefined, holdR: rec ? 'ballSmall' : undefined, look: -0.3 }, P.m, rec ? hop(f, 441, 0.06, 6) : {});
      vf({ expr: 'squint', L: 'hip', R: 'cheek', look: -0.4 }, P.f, {});
      break; }
    case 'reponse': {
      const pt = f > 540;
      vm({ expr: pt ? 'grin' : 'squint', L: pt ? 'point' : 'hip', R: 'hip', holdR: undefined, look: 0.5 }, P.m, pt ? hop(f, 544, 0.1, 8) : {});
      doc({ expr: f > 553 ? 'shock' : 'smile', L: 'lift', R: 'lift', holdL: 'ballBig', holdR: 'ballSmall', look: 0 }, P.d, f > 553 ? hop(f, 552, 0.1, 8) : {});
      vf({ expr: pt ? 'grin' : 'squint', L: 'hip', R: pt ? 'point' : 'cheek', look: -0.5 }, P.f, pt ? hop(f, 546, 0.1, 8) : {});
      break; }
    case 'repete': {
      const [l, r] = weigh(f, 0, 28), [l2, r2] = weigh(f, 14, 28);
      vm({ expr: f < 625 ? 'squint' : 'nervous', L: f < 630 ? l : 'temple', R: f < 630 ? r : 'hip', holdL: f < 630 ? 'ballSmall' : undefined, holdR: f < 630 ? 'ballBig' : undefined, look: 0.4 }, P.m, f > 630 ? tremble(f, 0.006, 2) : {});
      vf({ expr: f < 625 ? 'squint' : 'pained', L: f < 630 ? l2 : 'cheek', R: f < 630 ? r2 : 'hip', holdL: f < 630 ? 'ballBig' : undefined, holdR: f < 630 ? 'ballSmall' : undefined, look: -0.4, headTilt: f > 630 ? 8 : 0 }, P.f, {});
      doc({ expr: f > 630 ? 'laugh' : 'grin', L: 'hip', R: 'hip', look: 0 }, [P.d[0], 0, P.d[2] + 0.1], {});
      break; }
    case 'balance': break;
    case 'fait': {
      vm({ expr: f < 930 ? 'squint' : f < 946 ? 'shock' : 'nervous', L: 'cheek', R: 'lift', holdR: f > 929 ? 'ballBig' : undefined, look: 0.4, headTilt: 6 }, P.m, {});
      doc({ expr: 'grin', L: 'hip', R: 'point', look: -0.5 }, P.d, {});
      break; }
    case 'grosse': {
      const rel = f > 996, k = ramp(f, 984, 996);
      vm({ expr: rel ? 'shock' : 'pained', L: rel ? 'up' : 'lift', R: rel ? 'up' : 'hip', holdL: rel ? undefined : 'ballBig', look: 0.2, tilt: rel ? -8 : 10 * k }, P.m, rel ? hop(f, 996, 0.2, 10) : tremble(f, 0.008, 1));
      doc({ expr: 'laugh', L: 'hip', R: 'point', look: -0.4 }, P.d, {});
      break; }
    case 'petite': {
      const k = ramp(f, 1028, 1050);
      vf({ expr: 'pained', L: 'lift', R: 'up', holdL: 'ballSmall', look: 0.3, tilt: 6 * k, headTilt: 5 }, P.f, { ...tremble(f, 0.01, 3), dy: -0.03 * k });
      doc({ expr: 'grin', L: 'hip', R: 'hip', look: 0.6 }, P.d, {});
      break; }
    case 'ecart': {
      vm({ expr: 'nervous', L: 'hip', R: 'cheek', look: 0.5 }, P.m, {});
      vf({ expr: 'squint', L: 'cheek', R: 'hip', look: -0.5 }, P.f, {});
      doc({ expr: 'grin', L: 'point', R: 'hip', look: 0 }, P.d, hop(f, 1080, 0.08, 8));
      break; }
    case 'sait': {
      const dip = ramp(f, 1155, 1175);
      doc({ expr: 'grin', L: 'hip', R: 'point', look: -0.5 }, P.d, f > 1130 && f < 1150 ? hop(f, 1130, 0.07, 6) : {});
      vm({ expr: f < 1140 ? 'squint' : 'stubborn', L: 'up', R: dip > 0.5 ? 'push' : 'lift', holdL: 'ballBig', holdR: 'ballSmall', look: 0.5, tilt: 7 * dip }, P.m, f > 1150 ? tremble(f, 0.01, 4) : {});
      break; }
    case 'mefie': {
      vm({ expr: f < 1245 ? 'stubborn' : 'nervous', L: 'up', R: 'lift', holdL: 'ballBig', holdR: 'ballSmall', look: -0.2, tilt: 6 }, P.m, tremble(f, 0.008, 5));
      doc({ expr: 'grin', L: 'hip', R: 'point', look: -0.5 }, P.d, f > 1220 ? hop(f, 1224, 0.08, 8) : {});
      break; }
    case 'fin': {
      vm({ expr: 'squint', L: 'up', R: 'lift', holdL: 'ballBig', look: 0.4, tilt: 6 }, P.m, tremble(f, 0.012, 1));
      doc({ expr: 'laugh', L: 'hip', R: 'hip', look: -0.4 }, P.d, f > 1330 ? hop(f, 1331, 0.1, 10) : {});
      break; }
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const id = shotAt(f).id, out = [];
  if (id === 'nancy' && f > 262) { const k = ramp(f, 262, 284); out.push(FXC('yr' + q(k, 1), (p) => yearCard(p, k), [-3.4, 2.5, 0.2], 0.55 * (0.5 + 0.5 * clamp(k)))); }
  if (id === 'balance' && f > 740) { const k = ramp(f, 745, 770); out.push(FXC('eq' + q(k, 1), (p) => eqCard(p, k), [BX, 2.7, BZ + 0.9], 0.55 * (0.5 + 0.5 * clamp(k)))); }
  if (id === 'fait') { const stage = f < 929 ? 'brain' : f < 946 ? 'big' : 'heavy', k = ramp(f, 800, 822); out.push(FXC('bu' + stage + q(k, 1), (p) => bubbleCard(p, stage, k), [POS.fait.m[0] + 0.15, 2.62, 0.5], 0.62)); }
  if (id === 'grosse') {
    const k = ramp(f, 976, 996);
    out.push(FXC('gg' + q(k, 1), (p) => gaugeCard(p, k, 0.95, 0.12, 'PRÉVU', 'RÉEL'), [POS.grosse.m[0] - 1.45, 1.6, 0.4], 0.52));
    if (f >= 996) { const t = (f - 996) / 22, y = 1.1 + 4.2 * t - 6 * t * t * 0.5; out.push(FXC('bf' + q(t, 2), (p) => ballCard(p, true, 0), [POS.grosse.m[0] - 0.35 + t * 0.2, 1.3 + Math.max(0, 2.4 * Math.sin(Math.min(1, t) * Math.PI * 0.95)) + y * 0 , 0.6], 0.2)); }
  }
  if (id === 'petite') { const k = ramp(f, 1026, 1046); out.push(FXC('gp' + q(k, 1), (p) => gaugeCard(p, k, 0.1, 0.8, 'PRÉVU', 'RÉEL'), [POS.petite.f[0] + 1.5, 1.6, 0.4], 0.52)); }
  if (id === 'ecart') { const k = ramp(f, 1066, 1086); out.push(FXC('ge' + q(k, 1), (p) => gaugeCard(p, k, 0.95, 0.15, 'PRÉVU', 'RÉEL'), [-4.0, 2.6, 0.9], 0.45)); }
  if (id === 'fin') { const k = ramp(f, 1318, 1334), pos = [POS.fin.m[0] + 0.6, 1.15, POS.fin.m[2] + 0.5]; out.push(FXC('fb' + q(k, 1), (p) => ballCard(p, false, k > 0.5 ? 1 : 0, 1 + 0.06 * Math.sin(f * 0.6)), pos, 0.32)); }
  return out;
};
