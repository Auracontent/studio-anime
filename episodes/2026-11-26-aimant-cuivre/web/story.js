// « L'aimant qui tombe au ralenti » (Foucault, 1855) — 58,2 s, 30 fps, 1745 images. Cadres calés sur phrases.json (Whisper).
// Cabinet de Foucault (library/cabinet.js, origine) + freins magnétiques d'aujourd'hui (library/freins.js, x = FX). Caméras depuis +z vers -z.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, track, crane, transition, tremble, fgCard, crowd, walk } from '../motion.js';
import { mood, blendMood } from '../moods.js';
import { FX as FXO, RAILY } from '../library/freins.js';
import { TUBE_X, TUBE_BASE } from '../library/cabinet.js';
export const FPS = 30, TOTAL = 1745, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 117 },        // Cet aimant tombe au ralenti dans ce tube… et rien ne le touche.
  { id: 'plast', a: 118, b: 180 },     // Dans un tube en plastique, il tombe d'un coup.
  { id: 'miel', a: 181, b: 282 },      // Dans le cuivre, il flotte presque, comme dans du miel.
  { id: 'plaque', a: 283, b: 411 },    // Pourtant, le cuivre n'attire pas les aimants. Essaie, il ne se passe rien.
  { id: 'qui', a: 412, b: 477 },       // Alors qui le retient ?
  { id: 'foucault', a: 478, b: 616 },  // Un Parisien a trouvé en mille huit cent cinquante-cinq. Léon Foucault, celui du pendule.
  { id: 'disque', a: 617, b: 710 },    // Il fait tourner un disque de cuivre entre les pôles d'un aimant.
  { id: 'chauffe', a: 711, b: 833 },   // Dès que l'aimant agit, le disque devient dur à tourner… et il chauffe.
  { id: 'frotte', a: 834, b: 900 },    // Sauf que rien ne frotte le disque.
  { id: 'courants', a: 901, b: 1024 }, // En fait, un aimant qui bouge fait naître de petits courants dans le cuivre.
  { id: 'repousse', a: 1025, b: 1132 },// Ces courants fabriquent un autre aimant, qui repousse le premier.
  { id: 'vite', a: 1133, b: 1182 },    // Plus l'aimant va vite, plus le frein est fort.
  { id: 'coaster', a: 1183, b: 1290 }, // Aujourd'hui, ces freins invisibles ralentissent des montagnes russes
  { id: 'train', a: 1291, b: 1402 },   // et certains trains, sans aucun frottement.
  { id: 'fin', a: 1403, b: 1513 },     // Pas d'usure, pas de bruit, juste de la physique.
  { id: 'sort', a: 1514, b: 1598 },    // Et dans le tube, l'aimant ressort enfin, tout doucement.
  { id: 'loop', a: 1599, b: 1744 },    // Il tombait au ralenti… et personne ne l'avait touché.  (rejoue l'accroche)
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const G = (f) => (f >= 1599 ? f - TOTAL : f);
const hookish = (S) => S.id === 'hook' || S.id === 'loop';
const bright = (id) => ['coaster', 'train', 'fin', 'sort'].includes(id);

// ---------- lumière ----------
export const lightFor = (S, f) => {
  const D = mood('dore', { exposure: 1.25, gamma: 1.12, el: 58, az: 150 }), J = mood('jour', { exposure: 1.2, gamma: 1.1, el: 58, az: 150 }), C = mood('froid', { exposure: 1.3, gamma: 1.2, el: 58, az: 150 });
  const L = mood('lampe', { exposure: 1.3, gamma: 1.25, el: 58, az: 150 }), SO = mood('soir', { exposure: 1.3, gamma: 1.2, el: 50, az: 150 }), CO = mood('dore', { exposure: 1.1, gamma: 1.05, el: 26, az: 20 });
  switch (S.id) {
    case 'plast': return blendMood(D, J, ramp(f, 118, 150));
    case 'miel': case 'plaque': return J;
    case 'qui': return blendMood(J, C, ramp(f, 412, 430));
    case 'foucault': return blendMood(C, J, ramp(f, 478, 505));
    case 'disque': return J;
    case 'chauffe': return blendMood(J, L, ramp(f, 730, 770));
    case 'frotte': return blendMood(L, C, ramp(f, 834, 850));
    case 'courants': return blendMood(C, SO, ramp(f, 901, 925));
    case 'repousse': return SO;
    case 'vite': return blendMood(SO, J, ramp(f, 1133, 1150));
    case 'coaster': case 'train': case 'fin': return CO;
    case 'sort': return blendMood(CO, D, ramp(f, 1514, 1545));
    default: return D;
  }
};

// ---------- l'aimant du tube de cuivre ----------
const TOP = 2.5, PADY = TUBE_BASE + 0.12;
const cuState = (f) => {
  const S = shotAt(f), g = G(f);
  let y = 1.5, ghost = 0, dz = 0, rot = 0;
  if (hookish(S)) y = Math.min(TOP, 2.3 - (0.2 * g) / 30);
  else if (S.id === 'plast') y = 2.3 - (0.2 * f) / 30;
  else if (S.id === 'miel') y = 2.0 - (0.13 * (f - 181)) / 30;
  else if (S.id === 'qui') y = 1.6 - (0.1 * (f - 412)) / 30;
  else if (S.id === 'repousse') { y = 2.05 - (0.14 * (f - 1025)) / 30; ghost = E.smooth(ramp(f, 1030, 1052)); }
  else if (S.id === 'vite') { const t = (f - 1133) / 30; y = 2.45 - (0.12 * t + 0.3 * (1 - Math.exp(-4 * t))); ghost = 0.3 + 0.7 * Math.exp(-4 * t); }
  else if (S.id === 'sort') {
    y = lerp(1.42, PADY, E.smooth(ramp(f, 1514, 1566)));
    const s = E.smooth(ramp(f, 1568, 1584)); dz = 0.42 * s; y = lerp(y, PADY - 0.04, E.easeIn(ramp(f, 1578, 1590))); rot = (Math.PI / 2) * E.smooth(ramp(f, 1578, 1592));
  }
  return { y, ghost, dz, rot };
};
const plState = (f) => {
  if (f < 120) return { y: 2.45, vis: 0, k: 0 };
  if (f < 143) return { y: 2.45, vis: 1, k: E.back(ramp(f, 120, 128)) };
  const t = (f - 143) / 30, fall = 2.45 - 4.9 * t * t, rest = TUBE_BASE + 0.1;
  if (fall > rest) return { y: fall, vis: 1, k: 1 };
  const tb = (f - (143 + Math.sqrt((2.45 - rest) / 4.9) * 30)) / 30;
  return { y: rest + Math.max(0, 0.05 * Math.sin(tb * 20) * Math.exp(-tb * 9)), vis: 1, k: 1 };
};
const magPos = (f) => [TUBE_X.cu, cuState(f).y, 0];

// ---------- le disque de Foucault ----------
const discA = (f) => { let a = 0; for (let ff = 617; ff <= f; ff++) { const w = ff < 711 ? 0.17 : ff < 834 ? 0.17 - 0.12 * E.smooth(ramp(ff, 711, 760)) : ff < 900 ? 0.02 : 0.1; a += w; } return a; };
const hotAt = (f) => (f < 730 ? 0 : f < 834 ? E.smooth(ramp(f, 735, 810)) : f < 1024 ? 1 - 0.8 * ramp(f, 834, 1024) : 0.2 * (1 - ramp(f, 1024, 1060)));
const eddyAt = (f) => (f >= 901 && f < 1025 ? E.smooth(ramp(f, 906, 930)) : 0);
const PEND = (f) => 0.22 * Math.sin(f * 0.075);

// ---------- les freins d'aujourd'hui ----------
const carX = (f) => { if (f < 1183) return -30; if (f < 1210) return 12 - ((1210 - f) / 30) * 14; const t = (f - 1210) / 30; return 12 + 14 * 0.9 * (1 - Math.exp(-t / 0.9)) + 1.5 * t; };
const trainX = (f) => { const T = 112; if (f < 1291) return -20 - (24 * (1291 - f)) / 30; const u = clamp((f - 1291) / T); return -20 + 50 * (2 * u - u * u); };
const worldAt = (f) => {
  const S = shotAt(f), o = { cu: cuState(f), pl: plState(f), pend: PEND(f), discA: discA(f), crank: discA(f), hot: hotAt(f), eddy: eddyAt(f), wheel: f * 0.004 };
  if (f >= 1183 && f < 1514) { o.car = carX(f); o.pulse = clamp((o.car - 8) / 8) * (o.car < 48 ? 1 : 0); }
  if (f >= 1183 && f < 1514) o.train = trainX(f);
  return o;
};
export { worldAt };

// ---------- lieux ----------
const FA = [-0.78, 0, 1.3], AA = [0.78, 0, 1.3];
const ASP = [-4.85, 0, 1.0], FOP = [-3.5, 0, 1.0];             // plaque de cuivre
const DAS = [4.95, 0, 1.25], DFO = [7.3, 0, 1.25];                 // disque
const car = (f) => [FXO + carX(f), RAILY, 0], trn = (f) => [FXO + trainX(f), 1.8, -26];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const mixCam = (a, b, t) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], t)), look: a.look.map((v, i) => lerp(v, b.look[i], t)), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) });
const trackMag = (f) => track(magPos, f, [0.03, 0.0, 0.78], { lookUp: 0, fov: 38, lag: 4 });
const twoCam = K2(0, FA, AA, { headW: 0.245, yaw: 0, frameY: 0.45 });
const hookCam = (f) => { const g = G(f), w = g >= 0 ? ramp(g, 40, 92) : 1 - ramp(g, -100, -30); return mixCam(trackMag(f), twoCam, E.smooth(w)); };
const CAMS = {
  plast: [K2(118, FA, AA, { headW: 0.245, frameY: 0.45 }), K2(180, FA, AA, { headW: 0.27, frameY: 0.45 })],
  miel: [K(181, [-1.55, 0, 1.0], { headW: 0.27, yaw: -12, frameY: 0.4 }), K(282, [-1.55, 0, 1.0], { headW: 0.31, yaw: -8, frameY: 0.4 })],
  plaque: [K2(283, ASP, FOP, { headW: 0.25, yaw: 6, frameY: 0.42 }), K2(346, ASP, FOP, { headW: 0.29, yaw: 0, frameY: 0.42 }), K2(411, ASP, FOP, { headW: 0.31, yaw: -5, frameY: 0.42 })],
  qui: [K2(412, FA, AA, { headW: 0.26, yaw: 6, low: 16, dutch: 4, frameY: 0.44 }), K2(477, FA, AA, { headW: 0.31, yaw: -4, low: 18, dutch: 4, frameY: 0.44 })],
  foucault: [K(478, [-5.5, 0, 1.8], { headW: 0.3, yaw: 18, frameY: 0.4 }), K(560, [-5.5, 0, 1.8], { headW: 0.3, yaw: 8, frameY: 0.4 }), K(616, [-5.6, 0, 1.8], { headW: 0.34, yaw: 2, frameY: 0.4, low: 10 })],
  chauffe: [K2(711, DAS, DFO, { headW: 0.2, yaw: 0, frameY: 0.44 }), K2(780, DAS, DFO, { headW: 0.22, yaw: -4, frameY: 0.44 }), K2(833, DAS, DFO, { headW: 0.25, yaw: 0, frameY: 0.44 })],
  frotte: [R(834, [4.5, 1.82, 0.02], [6.2, 1.75, 0.0], 24), R(862, [4.55, 1.84, 0.04], [6.2, 1.75, 0.0], 25), K(896, [7.0, 0, 1.0], { headW: 0.3, yaw: -22, frameY: 0.4 })],
  courants: [R(901, [4.6, 2.2, 2.2], [6.2, 1.75, 0], 40), R(960, [5.4, 2.0, 1.6], [6.2, 1.75, 0], 34), R(1024, [5.9, 1.95, 1.0], [6.2, 1.75, 0], 30)],
  vite: [K2(1133, FA, AA, { headW: 0.26, yaw: -4, low: 14, frameY: 0.44 }), K2(1182, FA, AA, { headW: 0.3, yaw: 4, low: 16, frameY: 0.44 })],
  sort: [R(1514, [-0.15, 1.5, 1.5], [-0.4, 1.3, 0], 38), R(1560, [-0.1, 1.3, 1.1], [-0.4, 1.12, 0], 32), K2(1598, [-0.75, 0, 1.2], [0.75, 0, 1.2], { headW: 0.245, yaw: 0, frameY: 0.45 })],
};
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'loop': return hookCam(f);
    case 'plast': return shake(camFromKeys(CAMS.plast, f), f, 159, 0.06, 10);
    case 'miel': return camFromKeys(CAMS.miel, f);
    case 'plaque': return camFromKeys(CAMS.plaque, f);
    case 'qui': return camFromKeys(CAMS.qui, f);
    case 'foucault': return camFromKeys(CAMS.foucault, f);
    case 'disque': return crane([6, 1.5, 0.4], f, 617, 93, { from: { r: 8.5, h: 3.8, yaw: -30, lookUp: 1 }, to: { r: 6.2, h: 1.9, yaw: -6, lookUp: 1.5 } });
    case 'chauffe': return shake(camFromKeys(CAMS.chauffe, f), f, 740, 0.04, 8);
    case 'frotte': return camFromKeys(CAMS.frotte, f);
    case 'courants': return camFromKeys(CAMS.courants, f);
    case 'repousse': return track(magPos, f, [0.1, -0.1, 0.95], { lookUp: -0.12, fov: 36, lag: 5 });
    case 'vite': return camFromKeys(CAMS.vite, f);
    case 'coaster': return track(car, f, [-2.5, 0.0, 8.0], { lookUp: 0.9, fov: 42, lag: 5 });
    case 'train': return track(trn, f, [-6 + 8 * ramp(f, 1291, 1400), 0.3, 15], { lookUp: -0.2, fov: 46, lag: 6 });
    case 'fin': { const c = car(f), u = ramp(f, 1403, 1513), A = [c[0] + 5.2, 1.1, 3.0], B = [c[0] + 3.2, 0.9, 3.6], t = E.smooth(ramp(f, 1450, 1513));
      return { pos: A.map((v, i) => lerp(v, B[i], t)), look: [c[0] + 1.0, 1.0, 0], fov: 40 - 4 * u }; }
    case 'sort': return camFromKeys(CAMS.sort, f);
  }
  return hookCam(f);
};
const TR = [{ a: 181, type: 'push' }, { a: 283, type: 'whip', dir: 1 }, { a: 412, type: 'whip', dir: -1 }, { a: 478, type: 'whip', dir: 1 }, { a: 617, type: 'whip', dir: 1 },
  { a: 834, type: 'push' }, { a: 901, type: 'drop' }, { a: 1025, type: 'push' }, { a: 1133, type: 'whip', dir: -1 }, { a: 1183, type: 'rise' }, { a: 1291, type: 'whip', dir: 1 }, { a: 1403, type: 'push' }, { a: 1514, type: 'drop' }, { a: 1599, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => {
  const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]), S = shotAt(f);
  return { focus: d, cinf: S.id === 'miel' ? 7 : 9, near: S.id === 'miel' ? 3 : undefined };
};

// ---------- effets 3D ----------
const WINB = [-5.6, 0, 5.6].map((x) => ({ at: [x, 3.6, -3.6], yaw: 0, pitch: 0.5, len: 9, r: 1.3, col: '#ffe6a0', a: 0.22 }));
export const envAt = (f) => {
  const S = shotAt(f), o = {};
  if (!bright(S.id)) { o.motes = 1; o.beams = WINB; } else o.motes = 0.3;
  if (S.id === 'chauffe') { o.smoke = [{ at: [6.0, 2.25, 0.15], f0: 745, f1: 833, rate: 8, size: 0.45, col: '#e8e0d4', rise: 0.5 }]; o.sparks = [{ at: [6.2, 1.4, 0.1], f0: 770, f1: 830, rate: 14, col: '#ff9a3a', speed: 1.6, size: 0.8 }]; }
  if (S.id === 'courants') o.sparks = [{ at: [6.2, 1.8, 0.08], f0: 925, f1: 1022, rate: 10, col: '#fff06a', speed: 1.0, size: 0.8 }];
  if (S.id === 'repousse' || S.id === 'vite') { const c = cuState(f); o.sparks = [{ at: [TUBE_X.cu, c.y - 0.1, 0.05], f0: S.id === 'repousse' ? 1055 : 1133, f1: S.id === 'repousse' ? 1130 : 1170, rate: 6, col: '#c7a6ff', speed: 0.6, size: 0.6 }]; }
  if (S.id === 'plast' && f >= 159 && f < 170) o.spray = [{ at: [TUBE_X.pl, 1.05, 0.05], f0: 159, n: 24, power: 0.9, col: '#ffe9c0' }];
  if (S.id === 'sort' && f >= 1586) o.sparks = [{ at: [TUBE_X.cu, 1.3, 0.5], f0: 1588, f1: 1596, rate: 12, col: '#ffd23a', speed: 1.4, size: 1.0 }];
  return o;
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.foucault = { tunic: '#18b8d8', coat: true, skin: '#f3d3b4', hair: '#5a3a26', moustache: '#5a3a26', brows: '#4a2e1e', glasses: true, lapels: '#0f7a96', buttons: true, thin: true, legs: 1.1 };
  O.assistant = { tunic: '#e0a81c', skin: '#b57a52', hair: '#1e1714', moustache: '#1e1714', brows: '#1e1714', apron: '#f4ecd8', stout: true, cap: '#6a3a2a' };
  O.r1 = { tunic: '#e8442e', skin: '#f1c9a4', cap: '#2b3a6a', brows: '#4a2e1e' };
  O.r2 = { tunic: '#7cb84e', skin: '#8a5a3a', hair: '#1e1714', brows: '#1e1714', moustache: '#1e1714' };
  O.r3 = { tunic: '#8a5ab8', skin: '#e8b890', hair: '#c9902a', brows: '#8a5a1e', bun: '#c9902a', dress: '#8a5ab8' };
  O.r4 = { tunic: '#2f7fd8', skin: '#f3d3b4', hair: '#4a2a1e', brows: '#3a2418', stout: true, hat: 'bonnet', hatCol: '#ffd23a' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520);
  panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 520 + size * 0.36, size, fill, 0); g.restore(); };
const arrowsCard = (k = 1) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 150, 330, 300, 380, '#ffd23a');
  g.lineCap = 'round'; g.lineJoin = 'round'; const path = () => { g.beginPath(); g.moveTo(300, 380); g.lineTo(300, 470); g.moveTo(300, 380); g.lineTo(250, 430); g.moveTo(300, 380); g.lineTo(350, 430); g.moveTo(300, 660); g.lineTo(300, 570); g.moveTo(300, 660); g.lineTo(250, 610); g.moveTo(300, 660); g.lineTo(350, 610); };
  g.strokeStyle = INK; g.lineWidth = 34; path(); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 16; path(); g.stroke(); g.restore(); };
const honeyCard = (k) => (p) => { const g = p.g, cx = 300, cy = 560 + 40 * k, s = 1; g.save(); g.lineJoin = 'round';
  g.beginPath(); g.moveTo(cx, cy - 190 * s); g.bezierCurveTo(cx + 40, cy - 90, cx + 120, cy - 30, cx + 110, cy + 60); g.bezierCurveTo(cx + 100, cy + 150, cx + 40, cy + 190, cx, cy + 190); g.bezierCurveTo(cx - 40, cy + 190, cx - 100, cy + 150, cx - 110, cy + 60); g.bezierCurveTo(cx - 120, cy - 30, cx - 40, cy - 90, cx, cy - 190);
  g.fillStyle = '#f2a623'; g.fill(); g.lineWidth = 16; g.strokeStyle = INK; g.stroke(); g.fillStyle = 'rgba(255,240,190,0.85)'; g.beginPath(); g.ellipse(cx - 40, cy + 40, 18, 52, 0.25, 0, 6.283); g.fill(); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s * 1.9, z: pos[2], s: s * 1.9, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const legsF = (x) => q((x * 1.1) % 1, 2);
export const actorsAt = (f, T) => {
  const S = shotAt(f), g = G(f), out = [], ff = hookish(S) ? g : f;
  const tint = bright(S.id) ? '#ffe2c4' : '#fff0d8';
  const fig = (who, seed, o, pos, ex = {}) => R_(T, who, life(ff, seed, o), pos, { tint, ...ex });
  const cam = camAt(f);
  switch (S.id) {
    case 'hook': case 'loop': {
      const late = S.id === 'loop';
      out.push(fig('foucault', 4, { expr: late ? 'grin' : g < 50 ? 'grin' : 'shock', L: 'hip', R: 'point', look: 0.9 }, FA));
      out.push(fig('assistant', 6, { expr: late ? 'laugh' : 'shock', L: 'hip', R: 'reach', look: -0.9 }, AA, late ? { dy: Math.abs(Math.sin(f * 0.3)) * 0.02 } : {}));
      break; }
    case 'plast': {
      const drop = f >= 143, land = f >= 159, j = hop(f, 159, 0.1, 8);
      out.push(fig('foucault', 4, { expr: land ? 'shock' : 'squint', L: 'hip', R: land ? 'point' : 'hip', look: 0.9 }, FA));
      out.push(fig('assistant', 6, { expr: land ? 'shock' : 'grin', L: 'hip', R: f >= 118 && !drop ? 'up' : 'hip', look: -0.9 }, AA, land ? { dy: j.dy, sx: j.sx, sy: j.sy } : {}));
      break; }
    case 'miel': {
      const k = ramp(f, 205, 282);
      out.push(fig('foucault', 4, { expr: f < 232 ? 'smug' : 'proud', L: 'hip', R: 'point', look: 0.9 }, [-1.55, 0, 1.0]));
      out.push(fgCard(cam, honeyCard(q(k, 1)), { key: 'honey' + q(k, 1), side: 1, dist: 1.0, drop: 0.85 - 0.2 * k, s: 0.3 }));
      break; }
    case 'plaque': {
      const w = clamp((f - 283) / 50), ax = lerp(-5.2, -4.85, E.smooth(w)), walking = f < 336;
      out.push(fig('assistant', 6, { expr: f < 346 ? 'determined' : 'deadpan', L: 'hip', R: 'reach', holdR: 'magnet', step: walking ? legsF(ax * 1.6) : 0, look: 0.6 }, [ax, 0, 1.0], walking ? { dy: Math.abs(Math.sin(ax * 5)) * 0.015 } : {}));
      out.push(fig('foucault', 4, { expr: f < 346 ? 'smug' : 'squint', L: 'hip', R: f < 346 ? 'hip' : 'chin', look: -0.8 }, FOP));
      break; }
    case 'qui': {
      out.push(fig('foucault', 4, { expr: 'suspicious', L: 'hip', R: 'chin', look: 0.9 }, FA));
      out.push(fig('assistant', 6, { expr: 'squint', L: 'hip', R: 'point', look: -0.9 }, AA));
      break; }
    case 'foucault': {
      const intro = f >= 545;
      out.push(fig('foucault', 4, { expr: intro ? 'proud' : 'smug', L: 'hip', R: intro ? 'wave' : 'hip', wv: q(f * 0.3, 1), look: 0.3, headTilt: intro ? 6 : 0 }, [-5.5, 0, 1.8], intro ? { dy: hop(f, 545, 0.05, 6).dy } : {}));
      break; }
    case 'disque': {
      out.push(fig('assistant', 6, { expr: 'determined', L: 'reach', R: 'reach', look: 0.8 }, DAS, { dx: Math.sin(f * 0.5) * 0.015 }));
      out.push(fig('foucault', 4, { expr: 'smug', L: 'hip', R: 'point', look: -0.8 }, DFO));
      break; }
    case 'chauffe': {
      const hard = ramp(f, 711, 760), tr = tremble(f, 0.02 * hard, 2);
      out.push(fig('assistant', 6, { expr: f < 740 ? 'determined' : 'pained', L: 'reach', R: 'reach', look: 0.8 }, DAS, { ...tr }));
      out.push(fig('foucault', 4, { expr: f < 770 ? 'squint' : 'shock', L: 'hip', R: 'point', look: -0.8 }, DFO));
      break; }
    case 'frotte': {
      out.push(fig('foucault', 4, { expr: f < 880 ? 'suspicious' : 'smug', L: 'hip', R: 'point', look: -0.9 }, [7.0, 0, 1.0]));
      break; }
    case 'courants': {
      out.push(fig('foucault', 4, { expr: 'shock', L: 'hip', R: 'point', look: -0.7 }, [4.2, 0, 1.2]));
      break; }
    case 'repousse': break;
    case 'vite': {
      out.push(fig('foucault', 4, { expr: 'laugh', L: 'up', R: 'hip', look: 0.9 }, FA, { dy: Math.abs(Math.sin(f * 0.35)) * 0.03 }));
      out.push(fig('assistant', 6, { expr: 'laugh', L: 'hip', R: 'up', look: -0.9 }, AA, { dy: Math.abs(Math.sin(f * 0.35 + 1)) * 0.03 }));
      break; }
    case 'coaster': {
      const cx = FXO + carX(f), slow = f > 1250;
      [['r1', 14, -0.95], ['r2', 16, 0.05], ['r3', 18, 1.0]].forEach(([w, s, dx], i) => out.push(fig(w, s, { expr: slow ? 'laugh' : 'shock', L: 'up', R: 'up', sit: true, seat: false, wv: q(f * 0.4, 1), look: 0.4 }, [cx + dx, RAILY + 0.35, 0.02], { dy: Math.sin(f * 0.3 + i) * 0.01, order: 4 })));
      out.push(...crowd(T, f, { center: [FXO + 26, 0, -4.5], n: 9, w: 22, d: 1.6, outfits: ['r1', 'r2', 'r3', 'r4'], exprs: ['laugh', 'grin', 'shock', 'smile'], seed: 3, cheer: 0.5, arms: ['up', 'wave', 'up', 'hang'] }));
      break; }
    case 'train': {
      out.push(...crowd(T, f, { center: [FXO + 22, 0.9, -21.7], n: 9, w: 28, d: 1.6, outfits: ['r1', 'r2', 'r3', 'r4'], exprs: ['smile', 'grin', 'smile', 'shock'], seed: 5, cheer: 0.2, arms: ['hang', 'wave', 'hang', 'hip'] }));
      break; }
    case 'fin': break;
    case 'sort': {
      const out2 = f >= 1584, j = hop(f, 1592, 0.1, 8);
      out.push(fig('foucault', 4, { expr: out2 ? 'laugh' : 'grin', L: 'hip', R: 'point', look: 0.9 }, [-0.75, 0, 1.2], out2 ? { dy: j.dy } : {}));
      out.push(fig('assistant', 6, { expr: out2 ? 'laugh' : 'smile', L: 'hip', R: 'hip', look: -0.9 }, [0.75, 0, 1.2], out2 ? { dy: hop(f, 1596, 0.08, 8).dy } : {}));
      break; }
  }
  return out;
};

// ---------- effets 2D (cartes, chiffres) ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'foucault' && f >= 500 && f < 600) { const k = ramp(f, 500, 512); out.push(FX('an' + q(k, 1), labelCard('1855', 118, '#ffd23a', INK, k, -0.04), [-5.0, 3.3, 1.8], 0.5)); }
  if (S.id === 'repousse' && f >= 1066) { const k = ramp(f, 1066, 1078), c = cuState(f); out.push(FX('ar' + q(k, 1), arrowsCard(k), [TUBE_X.cu - 0.55, c.y - 0.1, 0.5], 0.3)); }
  if (S.id === 'vite' && f >= 1140) { const k = ramp(f, 1140, 1152), c = cuState(f); out.push(FX('av' + q(k, 1), arrowsCard(k), [TUBE_X.cu + 0.0, 3.0, 0.9], 0.35)); }
  if (S.id === 'fin' && f >= 1410 && f < 1500) { const k = ramp(f, 1410, 1422), k2 = ramp(f, 1450, 1462), c = car(f);
    if (f < 1455) out.push(FX('u0' + q(k, 1), labelCard('0 USURE', 84, '#ffd23a', INK, k, -0.04), [c[0] + 1.7, 2.1, 0.6], 0.34));
    else out.push(FX('u1' + q(k2, 1), labelCard('0 BRUIT', 84, '#ffd23a', INK, k2, 0.04), [c[0] + 1.7, 2.1, 0.6], 0.34)); }
  return out;
};
