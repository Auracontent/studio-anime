// "Le coffre-fort vide" (affaire Humbert, 1902) — 49.7 s, 30 fps, 1492 images. Cadres calés sur phrases.json / words.json.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, fallOver, popIn, tremble, run, follow, transition } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1492, DECK = 0;
const TX = 3000, MX = 6000;
export const SHOTS = [
  { id: 'hook', a: 0, b: 185 },        // Pendant vingt ans, tout Paris a prêté de l'argent à une femme grâce à un coffre-fort… que personne n'avait ouvert.
  { id: 'herit', a: 186, b: 340 },     // Thérèse Humbert prétend avoir hérité d'un millionnaire américain.
  { id: 'coffre', a: 341, b: 436 },    // La fortune dort dans un coffre, scellé par la justice.
  { id: 'queue', a: 437, b: 505 },     // Les banquiers font la queue pour lui prêter.
  { id: 'bal', a: 506, b: 590 },       // Elle donne des bals et invite les ministres.
  { id: 'creancier', a: 591, b: 669 }, // Dès qu'un créancier s'impatiente,
  { id: 'patience', a: 670, b: 789 },  // elle sourit : « Patience, l'héritage arrive. »
  { id: 'sauf', a: 790, b: 838 },      // Sauf que… les dettes grossissent,
  { id: 'juge', a: 839, b: 914 },      // et un juge exige enfin l'ouverture du coffre.
  { id: 'serrurier', a: 915, b: 978 }, // Le serrurier force la porte,
  { id: 'presse', a: 979, b: 1019 },   // devant la presse.
  { id: 'penche', a: 1020, b: 1069 },  // Tout le monde se penche.
  { id: 'dedans', a: 1070, b: 1099 },  // Dedans,
  { id: 'contenu', a: 1100, b: 1174 }, // il n'y a qu'une brique et une pièce d'un penny.
  { id: 'choc', a: 1175, b: 1195 },    // (réaction)
  { id: 'fuite', a: 1196, b: 1240 },   // Les Humbert s'enfuient,
  { id: 'madrid', a: 1241, b: 1283 },  // mais on les arrête à Madrid.
  { id: 'verdict', a: 1284, b: 1361 }, // Thérèse est condamnée à cinq ans de travaux forcés.
  { id: 'fin', a: 1362, b: 1491 },     // La plus grande fortune de Paris tenait dans un coffre… vide.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière : une ambiance par acte (jour doré -> bal à la lampe -> froid de la révélation -> soir -> froid -> doré) ----------
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'bal': return mood('lampe', { exposure: 1.4, hemi: 1.4 });
    case 'sauf': return blendMood(mood('jour'), mood('froid'), ramp(f, 790, 836));
    case 'dedans': case 'contenu': return mood('froid', { exposure: 1.3, hemi: 1.5 });
    case 'juge': case 'serrurier': case 'presse': case 'penche': case 'choc': return mood('froid', { exposure: 1.12 });
    case 'fuite': case 'madrid': return mood('soir', { exposure: 1.1 });
    case 'verdict': return mood('froid', { exposure: 1.1 });
    case 'fin': return blendMood(mood('froid', { exposure: 1.12 }), mood('dore', { exposure: 1.05 }), ramp(f, 1362, 1440));
    default: return mood('jour', { exposure: 1.08 });
  }
};
const TINTS = { bal: '#ffd8a0', sauf: '#e8eef8', juge: '#dfe8f4', serrurier: '#dfe8f4', presse: '#dfe8f4', penche: '#dfe8f4', dedans: '#dfe8f4', contenu: '#dfe8f4', choc: '#dfe8f4', fuite: '#ffd8b8', madrid: '#ffd8b8', verdict: '#dfe8f4' };
const tintOf = (S) => TINTS[S.id] || '#fff0d8';

// ---------- lieux ----------
const SAFE = [0, 0, -3.2];
const TH = [0.7, 0, -0.6], BQ = [-0.5, 0, -0.4], BQ2 = [-1.2, 0, -1.1], BQ3 = [-2.0, 0, -1.5];    // salon : Thérèse, le banquier (créancier), la queue
const MIN = [-0.5, 0, -0.4], DA = [-2.4, 0, -1.7], DB = [2.6, 0, -1.7];                              // bal
const THS = [-1.9, 0, -1.0];                                                                          // Thérèse près de la pile de dettes
const SR = [1.0, 0, -1.45], J2 = [2.3, 0, -1.2], J1 = [-1.5, 0, -1.2], THJ = [-2.8, 0, -1.0];        // ouverture : serrurier, journalistes, Thérèse
const THT = [TX - 0.9, 0, -1.9], JG = [TX + 0.5, 0.65, -3.3];                                        // tribunal
const MAD = (f) => [MX - 3.6 + 5.4 * E.smooth(ramp(f, 1196, 1248)), 0, -0.5];                        // Thérèse court dans la rue de Madrid
const G1 = [MX + 3.1, 0, -0.5], G2 = [MX + 4.5, 0, -1.0];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const CAMS = {
  hook: [R(0, [0, 1.7, 3.4], [0, 1.5, -3.2]), K2(95, BQ, TH, { yaw: -8, headW: 0.26 }), K2(185, BQ, TH, { yaw: 6, headW: 0.27 })],
  herit: [K2(186, TH, BQ, { yaw: 6, headW: 0.27, frameY: 0.46 }), K(260, TH, { headW: 0.27, yaw: -10, frameY: 0.46 }), K(340, TH, { headW: 0.3, yaw: 6, frameY: 0.44 })],
  coffre: [R(341, [2.4, 1.7, 1.2], [0.6, 1.4, -3.0], 38), R(400, [1.7, 1.5, -0.1], [1.15, 1.35, -2.15], 34), K2(436, TH, BQ, { yaw: -10, headW: 0.26 })],
  queue: [K2(437, TH, BQ, { yaw: -10, headW: 0.26 }), K2(505, TH, BQ, { yaw: 10, headW: 0.29 })],
  bal: [K2(506, TH, MIN, { yaw: -24, headW: 0.26 }), K2(590, TH, MIN, { yaw: 24, headW: 0.28 })],
  creancier: [K2(591, BQ, TH, { yaw: -14, headW: 0.27 }), K2(669, BQ, TH, { yaw: -4, headW: 0.3 })],
  patience: [K2(670, BQ, TH, { yaw: -4, headW: 0.28, frameY: 0.46 }), K2(730, BQ, TH, { yaw: 8, headW: 0.27, frameY: 0.46 }), K2(789, BQ, TH, { yaw: 14, headW: 0.28, frameY: 0.46 })],
  sauf: [K2(790, THS, [-3.4, 0, -2.2], { yaw: 10, headW: 0.2 }), K2(838, THS, [-3.4, 0, -2.2], { yaw: 4, headW: 0.26 })],
  juge: [K2(839, THT, JG, { yaw: -8, headW: 0.24 }), K2(914, THT, JG, { yaw: 6, headW: 0.27 })],
  serrurier: [K2(915, SR, J2, { yaw: -26, headW: 0.26 }), K2(978, SR, J2, { yaw: -12, headW: 0.29 })],
  presse: [K2(979, J1, THJ, { yaw: 12, headW: 0.26 }), K2(1019, J1, THJ, { yaw: -6, headW: 0.29 })],
  penche: [K2(1020, SR, J2, { yaw: -12, headW: 0.29 }), K2(1069, SR, J2, { yaw: -20, headW: 0.31 })],
  dedans: [R(1070, [1.2, 1.8, 1.7], [0, 1.6, -3.0]), R(1099, [0.2, 1.8, -0.4], [-0.1, 1.6, -3.0])],
  contenu: [R(1100, [0.1, 1.9, -0.7], [-0.2, 1.65, -3.0], 38), R(1135, [-0.15, 1.95, -1.4], [-0.3, 1.7, -3.0], 34), R(1174, [0.5, 1.9, -0.7], [0.5, 1.7, -3.0], 36)],
  choc: [K2(1175, J1, THJ, { yaw: 10, headW: 0.27 }), K2(1195, J1, THJ, { yaw: 0, headW: 0.3 })],
  madrid: [K2(1241, [MX + 1.7, 0, -0.5], G1, { yaw: -12, headW: 0.26, frameY: 0.46 }), K2(1283, [MX + 1.7, 0, -0.5], G1, { yaw: 8, headW: 0.28, frameY: 0.46 })],
  verdict: [K2(1284, THT, JG, { yaw: -8, headW: 0.26, frameY: 0.46 }), K2(1330, THT, JG, { yaw: 4, headW: 0.28, frameY: 0.46 }), K2(1361, THT, JG, { yaw: 10, headW: 0.26, frameY: 0.46 })],
  fin: [R(1362, [0.55, 1.9, -1.4], [0.5, 1.62, -3.0], 34), R(1430, [0.1, 1.8, 1.4], [0, 1.55, -3.2], 38), R(1491, [0, 1.7, 3.4], [0, 1.5, -3.2], 40)],
};
const KICKS = [{ f: 790, a: 0.04 }, { f: 1070, a: 0.03 }, { f: 1362, a: 0.03 }];
const baseCam = (f) => {
  const S = shotAt(f);
  if (S.id === 'fuite') return follow(MAD, f, { headW: 0.27, yaw: -18, lag: 6, lead: 0.9 });
  let c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  if (S.id === 'juge') c = shake(c, f, 856, 0.1, 12);
  if (S.id === 'serrurier') c = shake(shake(c, f, 940, 0.07, 10), f, 968, 0.09, 10);
  if (S.id === 'verdict') c = shake(c, f, 1300, 0.1, 12);
  if (S.id === 'madrid') c = shake(c, f, 1250, 0.06, 10);
  return c;
};
const TR = [{ a: 839, type: 'whip', dir: 1 }, { a: 915, type: 'whip', dir: -1 }, { a: 1196, type: 'whip', dir: 1 }, { a: 1284, type: 'whip', dir: -1 }, { a: 1362, type: 'rise' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};

// ---------- objectif ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mid = (a, b) => [(a[0] + b[0]) / 2, 1.5, (a[2] + b[2]) / 2];
const FOC = { hook: SAFE, herit: TH, coffre: [1.15, 1.4, -2.15], queue: mid(TH, BQ), bal: mid(TH, MIN), creancier: mid(BQ, TH), patience: mid(BQ, TH), sauf: mid(THS, [-3.4, 0, -2.2]), juge: mid(THT, JG),
  serrurier: mid(SR, J2), presse: mid(J1, THJ), penche: mid(SR, J2), dedans: [-0.1, 1.6, -3], contenu: [0, 1.65, -3.0], choc: mid(J1, THJ), madrid: mid([MX + 1.7, 0, -0.5], G1), verdict: mid(THT, JG), fin: [0.2, 1.6, -3.0] };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'fuite') return { focus: dist(C.pos, [MAD(f)[0], 1.5, -0.5]), cinf: 9 };
  const t = FOC[S.id]; return { focus: dist(C.pos, [t[0], t[1] || 1.5, t[2]]), cinf: S.id === 'contenu' || S.id === 'coffre' ? 6 : 9 };
};

// ---------- état du monde ----------
export const worldAt = (f) => ({ door: E.smooth(ramp(f, 1040, 1092)), seals: 1, debts: f < 790 ? 0 : E.smooth(ramp(f, 790, 838)), chand: 1 });

// ---------- effets 3D ----------
export const envAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'serrurier': return { sparks: [{ at: [1.15, 1.35, -2.0], f0: 924, f1: 978, rate: 70, col: '#ffb040', speed: 3.4 }], motes: 0.6 };
    case 'presse': return { sparks: [{ at: [1.15, 1.35, -2.0], f0: 979, f1: 1010, rate: 60, col: '#ffb040', speed: 3 }], motes: 0.6 };
    case 'penche': return { motes: 0.7 };
    case 'dedans': case 'contenu': return { motes: 1 };
    case 'juge': return { sparks: [{ at: [TX + 0.3, 1.9, -3.0], f0: 856, f1: 868, rate: 60, col: '#ffe08a', speed: 3 }], motes: 0.5 };
    case 'verdict': return { sparks: [{ at: [TX + 0.3, 1.9, -3.0], f0: 1300, f1: 1312, rate: 60, col: '#ffe08a', speed: 3 }], motes: 0.5 };
    case 'fuite': return { smoke: [{ at: [MAD(f)[0] - 0.6, 0.15, -0.3], f0: 1196, f1: 1248, rate: 18, size: 0.6, col: '#d8c8a8', rise: 0.3 }], wind: [-2, 0] };
    case 'fin': return { motes: 1 };
    default: return { motes: 0.8 };
  }
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.therese = { tunic: '#6a2a7a', dress: '#8a2f8a', skin: '#f3cfae', hat: 'chapeauplume', hatCol: '#5a2a6a', hatBand: '#e8c24a', brows: '#3a2418' };
  O.banquier = { tunic: '#d9a020', skin: '#f0c8a0', hat: 'tophat', moustache: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.banquierB = { tunic: '#2f8aa8', skin: '#d8a070', hat: 'tophat', moustache: '#7a5a3a', brows: '#5a3a22' };
  O.banquierC = { tunic: '#b84a2a', skin: '#a8714a', hat: 'tophat', brows: '#1e1714', beard: '#2a1e1a' };
  O.serrurier = { tunic: '#18b8d8', skin: '#c9966a', cap: '#3a4a5a', apron: '#6a4a32', moustache: '#2a1e1a', brows: '#2a1e1a' };
  O.juge = { tunic: '#b8222f', skin: '#f0cfa8', hat: 'toque', beard: '#f4f1ea', brows: '#f4f1ea', stout: true };
  O.journalA = { tunic: '#7ab03a', skin: '#f1c9a4', cap: '#c2733a', glasses: '#3a2a22', brows: '#4a3222' };
  O.journalB = { tunic: '#e0643a', skin: '#7a4a30', hat: 'tophat', brows: '#1e1714', moustache: '#1e1714' };
  O.ministre = { tunic: '#243a6a', skin: '#f0c8a0', hat: 'tophat', moustache: '#8a8a8a', brows: '#6a6a6a', stout: true };
  O.danseuse = { tunic: '#2f9a8a', dress: '#e0643a', skin: '#e8b890', hair: '#3a2a1a', brows: '#3a2a1a' };
  O.danseur = { tunic: '#8a3a6a', skin: '#f1c9a4', hair: '#2b211c', moustache: '#2b211c', brows: '#2b211c' };
  O.mari = { tunic: '#6a6a78', skin: '#f0c8a0', hat: 'tophat', moustache: '#3a2a1a', brows: '#3a2a1a' };
  O.gendarme = { tunic: '#2f4a8a', skin: '#e8b890', hat: 'kepi', hatCol: '#2f4a8a', moustache: '#2a1e1a', brows: '#2a1e1a', stout: true };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); g.restore(); };
const portraitCard = (k = 1) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520);
  panel(g, 130, 330, 340, 380, '#e8c24a'); g.fillStyle = '#3a2a3c'; g.fillRect(168, 368, 264, 304);
  g.fillStyle = '#1f1a26'; g.beginPath(); g.ellipse(300, 672, 110, 70, 0, 0, 6.283); g.fill(); g.fillStyle = '#e8b890'; g.beginPath(); g.ellipse(300, 520, 60, 72, 0, 0, 6.283); g.fill();
  g.fillStyle = '#e6e6e6'; g.beginPath(); g.ellipse(300, 580, 54, 46, 0, 0, 3.14); g.fill(); g.beginPath(); g.ellipse(300, 462, 66, 30, 0, 3.14, 6.283); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(280, 515, 6, 0, 6.283); g.arc(320, 515, 6, 0, 6.283); g.fill(); TXT(g, '$', 300, 700, 90, '#ffd23a', 14); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S);
  const th = (o, pos = TH, ex = {}) => R_(T, 'therese', life(f, 4, o), pos, { tint, ...ex });
  const bq = (o, pos = BQ, ex = {}) => R_(T, 'banquier', life(f, 6, o), pos, { tint, ...ex });
  const fig = (who, seed, o, pos, ex = {}) => R_(T, who, life(f, seed, o), pos, { tint, ...ex });
  const walkTo = (a, b, f0, f1) => { const k = E.smooth(ramp(f, f0, f1)); return [lerp(a[0], b[0], k), 0, lerp(a[2], b[2], k)]; };
  const moving = (f0, f1) => (f > f0 && f < f1 ? { step: q((f * 0.06) % 1, 2) } : {});
  const sway = (amp = 0.05, sd = 0) => ({ roll: amp * Math.sin(f * 0.18 + sd), dy: Math.abs(Math.sin(f * 0.18 + sd)) * 0.05 });
  switch (S.id) {
    case 'hook': { const bp = walkTo([-3.3, 0, -0.4], BQ, 0, 70), arrived = f > 70;
      out.push(bq({ expr: 'grin', L: 'carry', R: arrived ? 'reach' : 'hip', holdL: 'bill', look: 0.6, ...moving(0, 70) }, bp, { dy: arrived ? 0 : Math.abs(Math.sin(f * 0.3)) * 0.05 }));
      out.push(fig('banquierB', 8, { expr: 'smile', L: 'hip', R: 'hip', holdL: 'bill', look: 0.6 }, BQ2)); out.push(fig('banquierC', 12, { expr: 'smile', L: 'hip', R: 'hip', holdR: 'bill', look: 0.6 }, BQ3));
      if (f > 40) out.push(th({ expr: 'grin', L: 'hip', R: 'point', look: -0.4 }, TH, { s: Math.max(0.01, popIn(f, 40, 10)) })); break; }
    case 'herit': out.push(th({ expr: f > 300 ? 'grin' : 'smile', L: 'up', R: 'hip', holdL: 'letter', look: -0.3 })); if (f < 262) out.push(bq({ expr: 'squint', L: 'hip', R: 'hip', look: 0.6 })); break;
    case 'coffre': if (f > 418) { const k = Math.max(0.01, popIn(f, 418, 10)); out.push(th({ expr: 'grin', L: 'hip', R: 'point', look: -0.4 }, TH, { s: k })); out.push(bq({ expr: 'smile', L: 'carry', R: 'hip', holdL: 'bill', look: 0.6 }, BQ, { s: k })); } break;
    case 'queue': { const h = hop(f, 468, 0.15, 8);
      out.push(th({ expr: 'grin', L: 'reach', R: 'hip', holdR: 'bill', look: -0.5 }));
      out.push(bq({ expr: f > 470 ? 'laugh' : 'smile', L: 'hip', R: 'reach', holdR: 'coin', look: 0.6 }, BQ, { dy: h.dy, sx: h.sx, sy: h.sy }));
      out.push(fig('banquierB', 8, { expr: 'smile', L: 'reach', R: 'hip', holdL: 'bill', look: 0.6 }, BQ2)); out.push(fig('banquierC', 12, { expr: 'smile', L: 'hip', R: 'reach', holdR: 'coin', look: 0.6 }, BQ3, moving(0, 0))); break; }
    case 'bal': out.push(th({ expr: 'laugh', L: 'up', R: 'hip', look: -0.4 }, [TH[0], 0, TH[2]], sway(0.06, 0)));
      out.push(fig('ministre', 14, { expr: 'smile', L: 'hip', R: 'cross', look: 0.5 }, MIN, sway(0.05, 1.5)));
      out.push(fig('danseuse', 16, { expr: 'laugh', L: 'up', R: 'hip', look: 0.4 }, DA, sway(0.07, 2.5))); out.push(fig('danseur', 18, { expr: 'grin', L: 'hip', R: 'up', look: -0.4 }, [DA[0] + 1.0, 0, DA[2]], sway(0.07, 4)));
      out.push(fig('danseuse', 16, { expr: 'grin', L: 'hip', R: 'up', look: 0.4 }, DB, sway(0.07, 1))); out.push(fig('danseur', 18, { expr: 'laugh', L: 'up', R: 'hip', look: -0.4 }, [DB[0] - 1.0, 0, DB[2]], sway(0.07, 3))); break;
    case 'creancier': { const j = Math.floor((f - 600) / 18), h = hop(f, 600 + 18 * Math.max(0, j), 0.1, 6);
      out.push(bq({ expr: 'nervous', L: 'hip', R: 'point', look: 0.6 }, BQ, f >= 600 ? { dy: h.dy, sx: h.sx, sy: h.sy } : {}));
      out.push(th({ expr: f > 650 ? 'smile' : 'neutral', L: 'hip', R: 'hip', look: -0.5 })); break; }
    case 'patience': out.push(th({ expr: 'grin', L: 'hip', R: 'up', look: -0.5 }, TH, f > 700 ? hop(f, 700, 0.08, 6) : {}));
      out.push(bq({ expr: f > 745 ? 'relief' : 'stern', L: 'hip', R: f > 745 ? 'reach' : 'hip', holdR: f > 745 ? 'bill' : undefined, look: 0.6 })); break;
    case 'sauf': { const p = walkTo(TH, THS, 790, 815);
      out.push(th({ expr: 'shock', L: 'head', R: 'head', wv: q(f * 0.5, 1), look: -0.7 }, p, tremble(f, 0.012))); break; }
    case 'juge': { const hit = f >= 852 && f < 860;
      out.push(R_(T, 'juge', life(f, 20, { expr: f > 856 ? 'stern' : 'stubborn', L: 'hip', R: f < 852 ? 'up' : 'hip', holdR: 'tool', look: -0.5 }), JG, { tint, dy: hit ? -0.03 : 0 }));
      out.push(th({ expr: f > 856 ? 'nervous' : 'smile', L: 'hip', R: 'hip', look: 0.5 }, THT)); break; }
    case 'serrurier': out.push(R_(T, 'serrurier', life(f, 22, { expr: 'squint', L: 'hip', R: 'reach', holdR: 'tool', lift: q(0.1 + 0.7 * (Math.sin(f * 0.5) * 0.5 + 0.5), 2), look: -0.7 }), SR, { tint }));
      out.push(fig('journalB', 24, { expr: 'squint', L: 'hip', R: 'reach', holdR: 'paper', look: -0.7 }, J2)); break;
    case 'presse': out.push(fig('journalA', 26, { expr: 'squint', L: 'hip', R: 'reach', holdR: 'paper', look: 0.7 }, J1)); out.push(th({ expr: 'nervous', L: 'hip', R: 'hip', look: 0.7 }, THJ)); break;
    case 'penche': { const k = E.smooth(ramp(f, 1020, 1046));
      out.push(R_(T, 'serrurier', life(f, 22, { expr: 'squint', L: 'hip', R: 'hip', look: -0.9 }), SR, { tint, roll: 0.14 * k, ...tremble(f, 0.006) }));
      out.push(fig('journalB', 24, { expr: 'squint', L: 'hip', R: 'hip', look: -0.9 }, J2, { roll: 0.16 * k })); break; }
    case 'choc': { const fo = fallOver(f, 1182, 1, 10);
      out.push(fig('journalA', 26, { expr: 'shock', L: 'up', R: 'up', look: 0.7 }, J1, { roll: fo.roll * 0.9, sy: fo.sy })); out.push(th({ expr: 'shock', L: 'head', R: 'head', wv: q(f * 0.5, 1), look: 0.7 }, THJ, tremble(f, 0.015))); break; }
    case 'fuite': { const p = MAD(f), r = run(f, 1196, 5.4, 1.0);
      out.push(R_(T, 'mari', life(f, 30, { expr: 'nervous', L: 'flail', R: 'flail', wv: q(f * 0.6, 1), look: 0.7, run: true, step: q(r.step, 2) }), [p[0] - 1.1, r.bob, p[2] + 0.15], { tint }));
      out.push(th({ expr: 'pained', L: 'carry', R: 'carry', look: 0.6, run: true, step: q((r.step + 0.5) % 1, 2) }, [p[0], r.bob, p[2]], { tint })); break; }
    case 'madrid': { const k = Math.max(0.01, popIn(f, 1241, 8)), fo = fallOver(f, 1252, -1, 10), pos = [MX + 1.7, 0, -0.5];
      out.push(th({ expr: 'shock', L: 'up', R: 'up', look: 0.6 }, pos, tremble(f, 0.012)));
      out.push(fig('gendarme', 32, { expr: 'stern', L: 'reach', R: 'hip', look: -0.6 }, G1, { s: k })); out.push(fig('gendarme', 33, { expr: 'laugh', L: 'hip', R: 'point', look: -0.6 }, G2, { s: k }));
      out.push(R_(T, 'mari', life(f, 30, { expr: 'dazed', L: 'flail', R: 'flail', wv: q(f * 0.5, 1), look: 0.5 }), [MX + 0.1, 0, -0.9], { tint, roll: fo.roll * 0.8 })); break; }
    case 'verdict': { const hit = f >= 1297 && f < 1305;
      out.push(R_(T, 'juge', life(f, 20, { expr: 'stern', L: 'hip', R: f < 1297 ? 'up' : 'hip', holdR: 'tool', look: -0.5 }), JG, { tint, dy: hit ? -0.03 : 0 }));
      out.push(th({ expr: f > 1300 ? 'pained' : 'nervous', L: f > 1300 ? 'head' : 'hip', R: f > 1300 ? 'head' : 'hip', wv: q(f * 0.4, 1), look: 0.5 }, THT, f > 1300 ? tremble(f, 0.01) : {})); break; }
    case 'fin': break;
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'herit') { const k = ramp(f, 232, 252); out.push(FX('pt' + q(k, 1), portraitCard(k), [TH[0] - 0.7, 2.55, 0.4], 0.5, { draw: portraitCard(k) })); }
  if (S.id === 'patience' && f > 696) { const k = ramp(f, 696, 712); out.push(FX('pa' + q(k, 1), labelCard('Patience !', 74, '#ffffff', '#7a2f8a', k), [TH[0] - 0.15, 2.7, 0.3], 0.45)); }
  if ((S.id === 'juge' && f >= 852 && f < 872) || (S.id === 'verdict' && f >= 1297 && f < 1317)) { const f0 = S.id === 'juge' ? 852 : 1297, t = q((f - f0) / 20, 2); out.push(FX('gv' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [TX + 0.4, 1.8, -2.2], 1.1)); }
  if (S.id === 'verdict' && f > 1308) { const k = ramp(f, 1308, 1326); out.push(FX('c5' + q(k, 1), labelCard('5 ans', 120, '#ffd23a', INK, k), [THT[0] - 0.1, 2.75, 0.2], 0.45)); }
  if (S.id === 'madrid') { const k = ramp(f, 1244, 1262); out.push(FX('md' + q(k, 1), labelCard('MADRID', 84, '#ffd23a', INK, k), [MX + 1.7, 2.75, 0.2], 0.45)); }
  if (S.id === 'contenu' && f >= 1148 && f < 1170) { const t = q((f - 1148) / 22, 2); out.push(FX('pn' + t, (p) => T.fxBurst(p, t, '#fff08a', 10, 40, 200), [0.5, 1.9, -2.6], 0.35)); }
  return out;
};
