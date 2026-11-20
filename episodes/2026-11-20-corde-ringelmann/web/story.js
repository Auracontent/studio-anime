// "La corde de Ringelmann" — 60.64 s, 30 fps, 1819 frames. Phrase frames from ../phrases.json (silence-aligned).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
export const FPS = 30, TOTAL = 1819, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 100, light: 'jour' },        // Plus on tire à plusieurs sur une corde, moins chacun tire fort.
  { id: 'fr', a: 101, b: 140, light: 'jour' },        // Un Français l'a prouvé.
  { id: 'nom', a: 141, b: 232, light: 'jour' },       // Il s'appelle Maximilien Ringelmann,
  { id: 'agro', a: 233, b: 282, light: 'jour' },      // ingénieur agronome.
  { id: 'etude', a: 283, b: 375, light: 'jour' },     // Il étudie la force des hommes et des machines de ferme.
  { id: 'corde', a: 376, b: 460, light: 'jour' },     // Il attache une corde à un appareil de mesure,
  { id: 'eleves', a: 461, b: 530, light: 'jour' },    // et fait tirer ses élèves, un par un.
  { id: 'deux', a: 531, b: 558, light: 'jour' },      // Puis par deux.
  { id: 'trois', a: 559, b: 595, light: 'jour' },     // Puis par trois.
  { id: 'attend', a: 596, b: 655, light: 'jour' },    // Il s'attend à voir les forces s'additionner.
  { id: 'sauf', a: 656, b: 698, light: 'jour' },      // Sauf que non.
  { id: 'adeux', a: 699, b: 780, light: 'jour' },     // À deux, on ne tire pas le double.
  { id: 'groupe', a: 781, b: 870, light: 'jour' },    // Plus le groupe grandit, plus chacun lâche du lest.
  { id: 'huit', a: 871, b: 975, light: 'jour' },      // À huit, la corde reçoit la force d'environ quatre hommes.
  { id: 'triche', a: 976, b: 1015, light: 'jour' },   // Personne ne triche.
  { id: 'jure', a: 1016, b: 1080, light: 'jour' },    // Chacun jure qu'il a tiré de toutes ses forces.
  { id: 'coord', a: 1081, b: 1180, light: 'jour' },   // Ringelmann croit à un problème de coordination.
  { id: 'soixante', a: 1181, b: 1226, light: 'labo' },// Mais soixante ans plus tard,
  { id: 'cherch', a: 1227, b: 1275, light: 'labo' },  // des chercheurs refont le test,
  { id: 'bandes', a: 1276, b: 1320, light: 'labo' },  // les yeux bandés.
  { id: 'dit', a: 1321, b: 1380, light: 'labo' },     // On dit aux participants qu'ils tirent en équipe.
  { id: 'envrai', a: 1381, b: 1445, light: 'labo' },  // En vrai, ils sont seuls.
  { id: 'moins', a: 1446, b: 1575, light: 'labo' },   // Et ils tirent moins fort, juste parce qu'ils croient que d'autres tirent avec eux.
  { id: 'cerveau', a: 1576, b: 1655, light: 'labo' }, // Le cerveau se dit : les autres compenseront.
  { id: 'autres', a: 1656, b: 1715, light: 'labo' },  // Et les autres pensent la même chose.
  { id: 'fin', a: 1716, b: 1818, light: 'dore' },     // Résultat : une équipe de huit perd contre un seul homme décidé.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lights ----------
export const LIGHTS = {
  jour: { az: 125, el: 58, sky: '#c9d8f2', ground: '#b08a5c', hemi: 1.15, sun: '#fff1d6', sunI: 2.7, fog: '#f1dcb8', fogNear: 160, fogFar: 1200,
    skyTop: '#3f86d8', skyHor: '#f6dcb0', sat: 1.15, gain: '#fff6ea', vig: 0.2, shadowExt: 22 },
  labo: { az: 150, el: 62, sky: '#e8f0ec', ground: '#c8b890', hemi: 1.45, sun: '#fff6e4', sunI: 2.0, fog: '#d8e6dc', fogNear: 60, fogFar: 260,
    skyTop: '#bcd8e8', skyHor: '#e8f0ec', sat: 1.12, gain: '#fff8ee', vig: 0.2, shadowExt: 16, shadowTint: '#6a5a7a' },
  dore: { az: 20, el: 24, sky: '#c4b4d8', ground: '#8a5a3c', hemi: 1.08, sun: '#ffb46c', sunI: 2.9, fog: '#f0c090', fogNear: 120, fogFar: 1000,
    skyTop: '#5a78c0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.14, gain: '#fff2e2', vig: 0.24, shadowExt: 22, shadowTint: '#6a4a3a' },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
const TINT = { jour: '#ffffff', labo: '#fffaf0', dore: '#ffe2c8' };

// ---------- places ----------
const LX = 2000;
const SX = (i) => 0.9 + i * 0.95;                 // student i stands on the line, z = 0
const SP = (i) => [SX(i), 0, 0];
const RG = [-0.15, 0, 0.35];                       // Ringelmann, next to the dynamometer
const PX = (i) => LX + 0.9 + i * 0.95;
const PP = (i) => [PX(i), 0, 0];
const CH = [LX - 0.2, 0, 0.5];                     // researcher
const SOLO = [-1.7, 0, 0];
const teamX = (f, i) => 2.5 + i * 0.95 - E.easeIn(ramp(f, 1745, 1815)) * 1.1;

// ---------- cameras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const mid = (a, b) => [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2];
const CAMS = {
  hook: [K2(0, SP(0), SP(1), { yaw: -28, headW: 0.27 }), K2(100, SP(0), SP(1), { yaw: -5, headW: 0.3 }, { ease: 'smooth' })],
  fr: [K(101, [0.5, 0, 0.3], { headW: 0.30, yaw: 20 }), K(140, [0.5, 0, 0.3], { headW: 0.36, yaw: 8 })],
  nom: [K(141, [0.4, 0, 0.3], { headW: 0.31, yaw: -32 }), K(232, [0.4, 0, 0.3], { headW: 0.33, yaw: -10 })],
  agro: [K(233, [0.4, 0, 0.3], { headW: 0.34, yaw: 30 }), K(282, [0.4, 0, 0.3], { headW: 0.38, yaw: 12 })],
  etude: [K2(283, [0.0, 0, 0.3], [1.1, 0, 0.1], { yaw: 35 }), K2(375, [0.0, 0, 0.3], [1.1, 0, 0.1], { yaw: 5, headW: 0.28 })],
  corde: [K(376, [-0.7, 0, 0.3], { headW: 0.24, yaw: 25, frameY: 0.4 }), K(460, [-0.5, 0, 0.3], { headW: 0.28, yaw: 5, frameY: 0.4 })],
  eleves: [K2(461, SP(0), [0.3, 0, -0.8], { yaw: -30, headW: 0.27 }), K2(530, SP(0), [0.3, 0, -0.8], { yaw: -8, headW: 0.3 })],
  deux: [K2(531, SP(0), SP(1), { yaw: -20, headW: 0.27 }), K2(558, SP(0), SP(1), { yaw: 0, headW: 0.29 })],
  trois: [K(559, SP(1), { yaw: -15, headW: 0.2 }), K(595, SP(1), { yaw: 8, headW: 0.23 })],
  attend: [K(596, [0.3, 0, 0.4], { headW: 0.30, yaw: -22 }), K(655, [0.3, 0, 0.4], { headW: 0.33, yaw: -6 })],
  sauf: [K(656, [0.3, 0, 0.4], { headW: 0.31, yaw: 5 }), K(698, [0.3, 0, 0.4], { headW: 0.42, yaw: 0 }, { roll: 3, ease: 'easeOut' })],
  adeux: [K2(699, SP(0), SP(1), { yaw: 12, headW: 0.25 }), K2(780, SP(0), SP(1), { yaw: -14, headW: 0.28 })],
  groupe: [K(781, SP(2), { yaw: 72, headW: 0.17, frameY: 0.4 }), K(870, SP(2), { yaw: 48, headW: 0.2, frameY: 0.4 })],
  huit: [K(871, [SX(3.5), 0, 0], { yaw: 28, headW: 0.12, frameY: 0.46 }), K(975, [SX(3.5), 0, 0], { yaw: -10, headW: 0.14, frameY: 0.46 })],
  triche: [K(976, SP(2), { yaw: -24, headW: 0.31 }), K(1015, SP(2), { yaw: -6, headW: 0.35 })],
  jure: [K2(1016, SP(4), SP(5), { yaw: -22, headW: 0.26 }), K2(1080, SP(4), SP(5), { yaw: 6, headW: 0.29 })],
  coord: [K(1081, [0.4, 0, 0.3], { headW: 0.30, yaw: -35 }), K(1140, [0.4, 0, 0.3], { headW: 0.33, yaw: -12 }), K(1180, [0.4, 0, 0.3], { headW: 0.37, yaw: 4 })],
  soixante: [K2(1181, CH, PP(0), { yaw: -30, headW: 0.2 }), K2(1226, CH, PP(0), { yaw: -8, headW: 0.23 })],
  cherch: [K2(1227, [LX - 0.2, 0, 0.3], [LX + 0.9, 0, 0.3], { yaw: 25, headW: 0.27 }), K2(1275, [LX - 0.2, 0, 0.3], [LX + 0.9, 0, 0.3], { yaw: 5, headW: 0.3 })],
  bandes: [K(1276, PP(0), { yaw: -20, headW: 0.30 }), K(1320, PP(0), { yaw: 5, headW: 0.35 })],
  dit: [K2(1321, [LX + 0.0, 0, 0.5], PP(0), { yaw: -22, headW: 0.26 }), K2(1380, [LX + 0.0, 0, 0.5], PP(0), { yaw: 8, headW: 0.28 })],
  envrai: [K(1381, PP(0), { yaw: 8, headW: 0.31 }), K(1420, PP(0), { yaw: 22, headW: 0.2 }), K(1445, PP(0), { yaw: 38, headW: 0.1, frameY: 0.46 }, { ease: 'smooth' })],
  moins: [K(1446, PP(0), { yaw: 25, headW: 0.31 }), K(1520, PP(0), { yaw: -12, headW: 0.33 }), K(1575, PP(0), { yaw: -22, headW: 0.31 })],
  cerveau: [K(1576, PP(0), { yaw: -18, headW: 0.32 }), K(1655, PP(0), { yaw: 5, headW: 0.38 })],
  autres: [K(1656, PP(1), { yaw: 18, headW: 0.2 }), K(1715, PP(1), { yaw: -8, headW: 0.22 })],
  fin: [K(1716, SOLO, { yaw: 22, headW: 0.32 }), K(1760, SOLO, { yaw: 8, headW: 0.34 }), K(1805, [2.4, 0, 0], { yaw: 20, headW: 0.14, frameY: 0.46 }, { ease: 'smooth' }), K(1818, [1.9, 0, 0], { yaw: 12, headW: 0.16, frameY: 0.46 })],
};
const KICKS = [{ f: 656, a: 0.05 }, { f: 1181, a: 0.03 }, { f: 1716, a: 0.04 }, { f: 1805, a: 0.05 }, { f: 1409, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  for (const a of [1181, 1716]) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.8;
  if (S.id === 'groupe' || S.id === 'huit') c.pos = [c.pos[0], c.pos[1] + Math.sin(f * 1.7) * 0.006, c.pos[2]];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOC = { hook: mid(SP(0), SP(1)), fr: [0.5, 0, 0.3], nom: [0.4, 0, 0.3], agro: [0.4, 0, 0.3], etude: [0.5, 0, 0.2], corde: [-0.6, 0, 0.3], eleves: SP(0), deux: mid(SP(0), SP(1)), trois: SP(1),
  attend: [0.3, 0, 0.4], sauf: [0.3, 0, 0.4], adeux: mid(SP(0), SP(1)), groupe: SP(2), triche: SP(2), jure: mid(SP(4), SP(5)), coord: [0.4, 0, 0.3],
  soixante: mid(CH, PP(0)), cherch: [LX + 0.35, 0, 0.3], bandes: PP(0), dit: mid([LX, 0, 0.5], PP(0)), envrai: PP(0), moins: PP(0), cerveau: PP(0), autres: PP(1), fin: SOLO };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'huit' || (S.id === 'fin' && f > 1790) || (S.id === 'envrai' && f > 1425)) return { focus: 12, cinf: 2 };
  const t = FOC[S.id]; return { focus: dist(C.pos, [t[0], 1.5, t[2]]), cinf: 9 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { dyno: 0, dynoLab: 0, ropeFull: 0 };
  const shake = Math.sin(f * 0.9) * 0.012;
  switch (S.id) {
    case 'hook': W.dyno = 0.5 + shake; break;
    case 'corde': W.dyno = 0.02 + 0.02 * Math.sin(f * 0.3); break;
    case 'eleves': W.dyno = 0.2 + shake; break;
    case 'deux': W.dyno = 0.36 + shake; break;
    case 'trois': W.dyno = 0.48 + shake; break;
    case 'attend': W.dyno = 0.0; break;
    case 'sauf': W.dyno = 0.2 + 0.1 * E.easeOut(ramp(f, 656, 690)); break;
    case 'adeux': W.dyno = 0.36 + shake; break;
    case 'groupe': W.dyno = lerp(0.48, 0.7, ramp(f, 781, 870)) + shake; break;
    case 'huit': W.dyno = 0.8 + shake; break;
    case 'triche': case 'jure': W.dyno = 0.75; break;
    case 'bandes': case 'dit': W.dynoLab = 0.35 + shake; break;
    case 'envrai': W.dynoLab = 0.3 + shake; break;
    case 'moins': W.dynoLab = lerp(0.3, 0.14, E.smooth(ramp(f, 1446, 1500))) + shake * 0.5; break;
    case 'cerveau': W.dynoLab = 0.14 + shake * 0.5; break;
    case 'autres': W.dynoLab = 0.28 + shake; break;
    case 'fin': W.ropeFull = 1; break;
  }
  return W;
};

// ---------- cast ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.ringel = { tunic: '#2f6f6a', skin: '#f1c9a4', hair: '#9a9a9a', moustache: '#8a8a8a', brows: '#9a9a9a', glasses: '#3a2a22', coat: true };
  O.paysan = { tunic: '#8a5d3b', skin: '#e8b890', cap: '#c9a050', moustache: '#3b2a20', stout: true };
  const SK = ['#e9b98f', '#c98b62', '#f5d3b3', '#a8714a', '#e6bb94', '#7a4a30', '#f1c9a4', '#d9a27a'];
  O.st0 = { tunic: '#d23a32', skin: SK[0], cap: '#3b2a20' };
  O.st1 = { tunic: '#e0a82a', skin: SK[1], hair: '#2b211c', moustache: '#2b211c' };
  O.st2 = { tunic: '#9b2d5e', skin: SK[2], cap: '#f4f1ea' };
  O.st3 = { tunic: '#7a4fb8', skin: SK[3], hair: '#8a4a22', stout: true };
  O.st4 = { tunic: '#e8782a', skin: SK[4], cap: '#5a3b2a', beard: '#3b2a20' };
  O.st5 = { tunic: '#7cb83a', skin: SK[5], hair: '#c9a050' };
  O.st6 = { tunic: '#d8588a', skin: SK[6], hair: '#1e1714', moustache: '#1e1714' };
  O.st7 = { tunic: '#2f6fd0', skin: SK[7], cap: '#c8312c', stout: true };
  O.solo = { tunic: '#18b8d8', skin: '#c98b62', hair: '#1e1714', brows: '#1e1714' };
  O.cher1 = { tunic: '#f4f4ef', skin: '#f5d3b3', hair: '#5a3a22', glasses: '#3a2a22', moustache: '#5a3a22' };
  O.cher2 = { tunic: '#f4f4ef', skin: '#a8714a', hair: '#1e1714', beard: '#2b211c', glasses: '#c9a050', stout: true };
  O.p1 = { tunic: '#e8782a', skin: '#f5d3b3', hair: '#3b2a20', blind: true };
  O.p2 = { tunic: '#d9b02a', skin: '#7a4a30', hair: '#1e1714', blind: true, moustache: '#1e1714' };
  O.p3 = { tunic: '#2a9ab8', skin: '#e6bb94', hair: '#a05a2a', blind: true, stout: true };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const PROP = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, ...extra });

// ---------- prop cards ----------
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = '#271925'; g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function sumCard(p, k) { const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925'; g.lineWidth = 14; g.fillStyle = '#f7f3ea'; g.beginPath(); g.roundRect(40, 380, 520, 200, 40); g.fill(); g.stroke();
  TXT(g, '1+1+1 = 3', 300, 520, 96, '#271925', 0); if (k > 0.5) TXT(g, '✔', 300, 330, 80, '#3f9a4a', 14); g.restore(); }
function ratioCard(p) { const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925'; g.lineWidth = 14; g.fillStyle = '#f7f3ea'; g.beginPath(); g.roundRect(60, 330, 480, 360, 40); g.fill(); g.stroke();
  g.fillStyle = '#9aa3ad'; g.fillRect(120, 560, 90, 90); g.strokeRect(120, 560, 90, 90); g.fillStyle = '#c8312c'; g.fillRect(300, 470, 90, 180); g.strokeRect(300, 470, 90, 180);
  g.setLineDash([18, 12]); g.strokeStyle = '#271925'; g.lineWidth = 8; g.strokeRect(300, 380, 90, 270); g.setLineDash([]); g.strokeStyle = '#271925'; g.lineWidth = 14;
  TXT(g, '1', 165, 530, 62, '#271925', 0); TXT(g, '2', 345, 440, 62, '#271925', 0); TXT(g, '≠ ×2', 300, 760, 96, '#ffd23a'); g.restore(); }
function huitCard(p, k) { const g = p.g; g.save(); const s = 0.6 + 0.4 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520);
  TXT(g, '8', 170, 560, 220, '#ffffff', 26); TXT(g, '≈', 300, 540, 140, '#ffd23a', 20); TXT(g, '4', 430, 560, 220, '#ffd23a', 26); g.restore(); }
function ghostCard(p, k) { const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925'; g.lineWidth = 14; g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(300, 400, 250, 190, 0, 0, 6.283); g.fill(); g.stroke(); for (const [x, y, r] of [[120, 640, 38], [70, 730, 22]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke(); }
  for (let i = 0; i < 3; i++) { const x = 175 + i * 125, lean = Math.sin(k * 6 + i) * 6; g.fillStyle = '#b8bec8'; g.beginPath(); g.ellipse(x, 365, 34, 38, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(x - 34 + lean, 405, 68, 90, 22); g.fill(); g.stroke(); g.strokeStyle = '#9aa3ad'; g.lineWidth = 9; g.beginPath(); g.moveTo(x - 60, 440); g.lineTo(x + 60, 440); g.stroke(); g.strokeStyle = '#271925'; g.lineWidth = 14; }
  g.restore(); }
function brainCard(p, k) { const g = p.g; g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = '#271925'; g.lineWidth = 14; g.fillStyle = '#f2a0b8';
  g.beginPath(); g.ellipse(300, 480, 230, 170, 0, 0, 6.283); g.fill(); g.stroke(); g.lineWidth = 10; g.beginPath(); g.moveTo(300, 320); g.bezierCurveTo(260, 400, 340, 440, 300, 640); g.stroke();
  for (const [x0, y0, x1, y1] of [[130, 440, 220, 400], [150, 540, 240, 520], [380, 400, 470, 440], [370, 520, 450, 560], [200, 340, 250, 380], [350, 340, 410, 370]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, y0 - 40 * Math.sin(k * 8 + x0), x1, y1); g.stroke(); }
  TXT(g, '…', 300, 760, 120, '#ffffff', 16); g.restore(); }
function yearCard(p, k) { const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925'; g.lineWidth = 14; g.fillStyle = '#e08a3a'; g.beginPath(); g.roundRect(60, 400, 480, 200, 40); g.fill(); g.stroke(); TXT(g, '1974', 300, 560, 130, '#ffffff', 20); g.restore(); }

// ---------- actors ----------
const lean = (s, dir = 1) => 3 + 9 * s;
// a student pulling on the rope with the left hand (arm toward the dynamometer), leaning away
const pull = (T, f, i, st, tint, o = {}) => {
  const ex = st > 0.85 ? 'pained' : st > 0.65 ? 'stubborn' : st > 0.45 ? 'neutral' : st > 0.3 ? 'smile' : 'grin';
  return R(T, 'st' + i, life(f, 11 + i, { expr: o.expr || ex, L: 'hip', R: 'hip', tilt: q(lean(st) + Math.sin(f * 0.35 + i) * 0.6 * st, 1), look: -0.4, ...o.extra }), o.pos || SP(i), { tint });
};
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT[S.light];
  const ring = (o, pos = RG) => R(T, 'ringel', life(f, 5, o), pos, { tint });
  switch (S.id) {
    case 'hook': { const st = [1, 0.75, 0.5, 0.35]; st.forEach((s, i) => out.push(pull(T, f, i, s, tint))); break; }
    case 'fr': out.push(ring({ expr: 'grin', L: 'hip', R: 'up', holdR: 'flag', look: 0.3 }, [0.5, 0, 0.3])); break;
    case 'nom': out.push(ring({ expr: 'smile', L: 'hip', R: 'thumb', look: 0.3 }, [0.4, 0, 0.3])); break;
    case 'agro': out.push(ring({ expr: 'grin', L: 'hip', R: 'reach', holdR: 'paper', look: 0.3 }, [0.4, 0, 0.3])); break;
    case 'etude': {
      out.push(ring({ expr: 'smile', L: 'hip', R: 'point', look: 0.5 }, [0.0, 0, 0.3]));
      out.push(R(T, 'paysan', life(f, 21, { expr: f > 330 ? 'grin' : 'smile', L: 'hip', R: 'reach', holdR: 'tool', look: -0.5 }), [1.1, 0, 0.1], { tint })); break;
    }
    case 'corde': out.push(ring({ expr: 'smile', L: 'hip', R: 'hip', look: -0.6, tilt: -2 }, [-0.3, 0, 0.3])); break;
    case 'eleves': {
      out.push(pull(T, f, 0, 1, tint));
      out.push(ring({ expr: 'smile', L: 'hip', R: 'reach', holdR: 'paper', look: 0.5 }, [0.3, 0, -0.8])); break;
    }
    case 'deux': [0.9, 0.9].forEach((s, i) => out.push(pull(T, f, i, s, tint))); break;
    case 'trois': [0.85, 0.85, 0.85].forEach((s, i) => out.push(pull(T, f, i, s, tint))); break;
    case 'attend': out.push(ring({ expr: 'grin', L: 'hip', R: 'reach', holdR: 'paper', look: 0.5 }, [0.3, 0, 0.4])); break;
    case 'sauf': out.push(ring({ expr: f > 662 ? 'shock' : 'grin', L: f > 662 ? 'cheek' : 'hip', R: f > 662 ? 'cheek' : 'reach', holdR: f > 662 ? undefined : 'paper', look: 0.2 }, [0.3, 0, 0.4])); break;
    case 'adeux': [0.8, 0.8].forEach((s, i) => out.push(pull(T, f, i, s, tint))); break;
    case 'groupe': { const k = ramp(f, 781, 870); [0, 1, 2, 3, 4].forEach((i) => out.push(pull(T, f, i, lerp(0.9, 0.9 - i * 0.12, k), tint))); break; }
    case 'huit': for (let i = 0; i < 8; i++) out.push(pull(T, f, i, i % 2 ? 0.95 : 0.35, tint)); break;
    case 'triche': out.push(R(T, 'st2', life(f, 13, { expr: 'smile', L: 'hip', R: 'up', look: -0.4 }), SP(2), { tint })); break;
    case 'jure': {
      out.push(R(T, 'st4', life(f, 15, { expr: 'nervous', L: 'hip', R: 'up', look: 0.5 }), SP(4), { tint }));
      out.push(R(T, 'st5', life(f, 16, { expr: f > 1050 ? 'laugh' : 'grin', L: 'up', R: 'hip', look: -0.5 }), SP(5), { tint })); break;
    }
    case 'coord': out.push(ring({ expr: f > 1140 ? 'squint' : 'stern', L: 'hip', R: 'temple', swirl: f * 0.25, look: 0.3 }, [0.4, 0, 0.3])); break;
    case 'soixante': {
      out.push(R(T, 'cher1', life(f, 31, { expr: 'smile', L: 'hip', R: 'reach', holdR: 'paper', look: 0.5 }), CH, { tint }));
      out.push(R(T, 'p1', life(f, 41, { expr: 'smile', L: 'hip', R: 'hip', tilt: 6, look: 0 }), PP(0), { tint })); break;
    }
    case 'cherch': {
      out.push(R(T, 'cher1', life(f, 31, { expr: 'smile', L: 'hip', R: 'reach', holdR: 'paper', look: 0.5 }), [LX - 0.2, 0, 0.3], { tint }));
      out.push(R(T, 'cher2', life(f, 32, { expr: 'grin', L: 'point', R: 'hip', look: -0.5 }), [LX + 0.9, 0, 0.3], { tint })); break;
    }
    case 'bandes': out.push(R(T, 'p1', life(f, 41, { expr: 'nervous', L: 'hip', R: 'hip', tilt: 6, look: 0 }), PP(0), { tint })); break;
    case 'dit': {
      out.push(R(T, 'cher1', life(f, 31, { expr: 'smile', L: 'hip', R: 'point', holdL: 'paper', look: 0.5 }), [LX, 0, 0.5], { tint }));
      out.push(R(T, 'p1', life(f, 41, { expr: f > 1345 ? 'grin' : 'smile', L: 'hip', R: 'hip', tilt: 6, look: 0 }), PP(0), { tint })); break;
    }
    case 'envrai': out.push(R(T, 'p1', life(f, 41, { expr: 'nervous', L: 'hip', R: 'hip', tilt: 7, look: 0 }), PP(0), { tint })); break;
    case 'moins': {
      const k = E.smooth(ramp(f, 1446, 1500));
      out.push(R(T, 'p1', life(f, 41, { expr: f > 1480 ? 'smile' : 'neutral', L: 'hip', R: 'hip', tilt: q(lerp(7, 2, k), 1), look: 0 }), PP(0), { tint }));
      if (f > 1495) out.push(PROP('ghost' + q(f / 6, 0), (p) => ghostCard(p, f / 30), [PX(0) + 0.95, 2.05, 0.2], 0.62, { blob: false, shadow: false, order: 5, tint })); break;
    }
    case 'cerveau': {
      out.push(R(T, 'p1', life(f, 41, { expr: f > 1616 ? 'smile' : 'neutral', L: 'hip', R: 'temple', swirl: f * 0.25, tilt: 2, look: 0 }), PP(0), { tint }));
      out.push(PROP('brain' + q(f / 6, 0), (p) => brainCard(p, f / 30), [PX(0) + 0.8, 1.95, 0.2], 0.58, { blob: false, shadow: false, order: 5, tint })); break;
    }
    case 'autres': {
      ['p1', 'p2', 'p3'].forEach((who, i) => out.push(R(T, who, life(f, 41 + i, { expr: f > 1690 ? 'grin' : 'smile', L: 'reach', R: i === 1 ? 'temple' : 'hip', swirl: f * 0.25, tilt: 2, look: 0 }), PP(i), { tint })));
      break;
    }
    case 'fin': {
      const win = f > 1790;
      out.push(R(T, 'solo', life(f, 7, { expr: win ? 'grin' : 'stubborn', L: win ? 'up' : 'hip', R: 'hip', tilt: win ? 0 : -7 + Math.sin(f * 0.4) * 1, look: 0.4 }), [SOLO[0] + E.easeIn(ramp(f, 1745, 1815)) * 0.2, 0, 0], { tint }));
      for (let i = 0; i < 8; i++) { const fall = E.easeIn(ramp(f, 1770, 1815)); out.push(R(T, 'st' + i, life(f, 11 + i, { expr: f > 1760 ? 'shock' : 'pained', L: 'hip', R: 'hip', tilt: q(lerp(7, -9, fall), 1), look: -0.5 }), [teamX(f, i), 0, 0], { tint })); }
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'attend') { const k = E.back(ramp(f, 610, 630)); out.push(FX('sum' + q(k, 1) + (f > 640 ? 'v' : ''), (p) => sumCard(p, f > 640 ? 1 : 0), [0.9, 2.2, 0.3], 0.55 * (0.5 + 0.5 * clamp(k)))); }
  if (S.id === 'sauf' && f > 658 && f < 690) { const t = q((f - 658) / 26, 2); out.push(FX('sa' + t, (p) => T.fxBurst(p, t, '#ffe6a0', 9, 40, 220), [1.2, 2.0, 0.4], 0.9)); }
  if (S.id === 'adeux') out.push(FX('ratio', (p) => ratioCard(p), [SX(0.5) + 0.0, 2.6, 0.3], 0.62, { tint: '#ffffff' }));
  if (S.id === 'huit' && f > 905) { const k = ramp(f, 905, 930); out.push(FX('h8' + q(k, 1), (p) => huitCard(p, k), [SX(3.5), 2.9, 0.3], 0.9 * (0.3 + 0.7 * clamp(k)))); }
  if (S.id === 'jure') for (const i of [4, 5]) if (f % 22 < 3) out.push(FX('dr' + i + (f % 22), (p) => T.fxDrip(p), [SX(i) + 0.4, 1.9, 0.3], 0.3));
  if (S.id === 'soixante') out.push(FX('yr', (p) => yearCard(p, 0), [LX + 0.4, 2.2, 0.5], 0.7));
  if (S.id === 'cerveau' && f > 1616) { const t = q(((f - 1616) % 36) / 36, 2); out.push(FX('st' + t, (p) => T.fxStars(p, t), [PX(0) + 0.5, 2.3, 0.3], 0.5)); }
  if (S.id === 'fin' && f > 1795) { const t = q((f - 1795) / 22, 2); out.push(FX('win' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [SOLO[0] + 0.3, 2.2, 0.3], 0.9)); }
  if (S.id === 'fin' && f > 1790 && f % 14 < 3) out.push(FX('du' + (f % 14), (p) => T.fxDust(p, (f % 14) / 3), [teamX(f, 0) + 0.2, 0.2, 0.4], 0.5));
  return out;
};
