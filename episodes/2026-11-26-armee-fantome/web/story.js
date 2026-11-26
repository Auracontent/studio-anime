// « L'armée fantôme » (23rd Headquarters Special Troops, 1944-45) — 66,4 s, 30 fps, 1992 images. Cadres calés sur phrases.json (Whisper).
// Décor : library/campagne.js (zones le long de x). Caméras depuis +z vers -z.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, track, follow, crane, transition, tremble, fgCard, crowd, walk, popIn } from '../motion.js';
import { mood, blendMood } from '../moods.js';
import { ZONE, boatPos, HILL, RIVER_Z } from '../library/campagne.js';
export const FPS = 30, TOTAL = 1992, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 132 },        // Ces soldats soulèvent un char d'assaut à bout de bras… parce qu'il est gonflé à l'air.
  { id: 'plan', a: 133, b: 232 },      // En mille neuf cent quarante-quatre, l'armée américaine doit tromper les Allemands.
  { id: 'hommes', a: 233, b: 385 },    // Sa solution : onze cents hommes, dont des peintres, des décorateurs et des ingénieurs du son.
  { id: 'gonfle', a: 386, b: 516 },    // La nuit, ils gonflent des chars, des camions et des canons en caoutchouc.
  { id: 'loin', a: 517, b: 592 },      // De loin, tout ressemble à une vraie division prête à attaquer.
  { id: 'pres', a: 593, b: 720 },      // Mais de près, ça ne trompe personne. Alors il faut aussi du bruit.
  { id: 'camions', a: 721, b: 903 },   // Des camions portent d'énormes haut-parleurs… audibles à des kilomètres.
  { id: 'radio', a: 904, b: 969 },     // Sauf que l'ennemi écoute aussi la radio.
  { id: 'faux', a: 970, b: 1084 },     // Alors des opérateurs envoient de faux messages, avec le style de vraies unités.
  { id: 'insignes', a: 1085, b: 1206 },// Et les soldats cousent de faux insignes et se promènent dans les villages.
  { id: 'missions', a: 1207, b: 1345 },// Ce n'est pas un jeu : vingt et une missions, de la Normandie jusqu'au Rhin.
  { id: 'rhin', a: 1346, b: 1470 },    // En mars 1945, ils jouent une armée entière près du fleuve.
  { id: 'jumelles', a: 1471, b: 1569 },// Les Allemands regardent ce faux camp et déplacent leurs troupes face à lui.
  { id: 'traverse', a: 1570, b: 1741 },// Pendant ce temps, la vraie armée américaine traverse le Rhin, ailleurs, avec peu de résistance.
  { id: 'chute1', a: 1742, b: 1777 },  // Les chars étaient en caoutchouc,
  { id: 'chute2', a: 1778, b: 1841 },  // l'armée n'existait pas,
  { id: 'chute3', a: 1842, b: 1918 },  // et l'ennemi a bien regardé au mauvais endroit.
  { id: 'loop', a: 1919, b: 1991 },    // Et le char, lui, se dégonfle doucement.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const Z = ZONE, PX = Z.pump, FX0 = Z.fake, RX = Z.road, QX = Z.radio, VX = Z.village, RHX = Z.rhin;
const G = (f) => (f >= 1919 ? f - TOTAL : f);
const hookish = (S) => S.id === 'hook' || S.id === 'loop';

// ---------- lumière ----------
export const lightFor = (S, f) => {
  const MA = mood('matin', { exposure: 1.35, gamma: 1.12, el: 26 }), J = mood('jour', { exposure: 1.2, gamma: 1.1 }), N = mood('nuit', { exposure: 1.9, gamma: 1.6, sunI: 2.6, hemi: 1.5 });
  const SO = mood('soir', { exposure: 1.3, gamma: 1.2 }), D = mood('dore', { exposure: 1.2, gamma: 1.1, el: 30 });
  switch (S.id) {
    case 'plan': return blendMood(MA, J, ramp(f, 140, 232));
    case 'hommes': case 'pres': case 'camions': case 'insignes': case 'missions': return J;
    case 'gonfle': return blendMood(J, N, ramp(f, 386, 398));
    case 'loin': return blendMood(N, MA, ramp(f, 517, 540));
    case 'radio': return blendMood(J, SO, ramp(f, 904, 920));
    case 'faux': return SO;
    case 'rhin': return blendMood(J, D, ramp(f, 1346, 1390));
    case 'jumelles': case 'chute1': case 'chute2': case 'chute3': return D;
    case 'traverse': return blendMood(D, MA, ramp(f, 1570, 1600));
    case 'loop': return blendMood(D, MA, ramp(f, 1930, 1991));
    default: return MA;
  }
};

// ---------- monde ----------
const tankAt = (f) => {
  const S = shotAt(f), g = G(f);
  if (S.id === 'hook') return { pos: [0, 1.75 + 0.07 * Math.sin(f * 0.34), 1.0], ry: 0.15 * Math.sin(f * 0.1), roll: 0.09 * Math.sin(f * 0.21), s: 1.0, k: 1, sag: 0 };
  if (S.id === 'loop') { const u = ramp(f, 1925, 1985), sg = E.smooth(u); return { pos: [0, 1.75 - 0.3 * sg + 0.05 * Math.sin(f * 0.3) * (1 - sg), 1.0], ry: 0.1 * Math.sin(f * 0.1), roll: 0.09 * Math.sin(f * 0.21) * (1 - sg) + 0.2 * sg, s: 1.0, k: 1 - 0.5 * sg, sag: sg }; }
  if (S.id === 'gonfle') { const k = E.smooth(ramp(f, 396, 480)), pul = Math.sin(f * 0.5) * 0.03 * (1 - ramp(f, 460, 490)) * (k > 0.05 ? 1 : 0), bounce = f > 478 ? Math.exp(-(f - 478) / 6) * Math.sin((f - 478) * 0.9) * 0.1 : 0;
    return { pos: [PX + 0.4, 0, -0.5], ry: 0.35, s: 1.15, k, sag: 0, sx: 1 + pul + bounce, sy: 1 - bounce * 1.5 }; }
  if (S.id === 'pres') { const d = f - 645, tap = d >= 0 ? Math.exp(-d / 9) * Math.sin(d * 0.9) * 0.14 : 0; return { pos: [FX0 + 0.3, 0, -1.1], ry: 0.45, s: 1.35, k: 1, sag: 0, sx: 1 + tap, sy: 1 - tap * 1.3 }; }
  if (S.id === 'chute1') { const sx = 1 + 0.03 * Math.sin(f * 0.5); return { pos: [FX0 + 0.3, 0, -1.1], ry: 0.45, s: 1.35, k: 1, sag: 0, sx }; }
  return null;
};
const truckX = (f) => (f < 721 ? -34 : f < 805 ? lerp(-34, 1.5, E.easeOut(ramp(f, 721, 805))) : 1.5);
const boatU = (f) => ramp(f, 1572, 1735);
export const worldAt = (f) => { const o = { tank: tankAt(f), truck: truckX(f) }; if (f >= 1570 && f < 1742) o.boats = boatU(f); return o; };
const TRK = (f) => [RX + truckX(f), 0, 1.5];
const BOAT1 = (f) => { const b = boatPos(1, boatU(f)); return [b[0], b[1], b[2]]; };

// ---------- lieux ----------
const pair = (cx, z = 1.1, d = 0.82) => [[cx - d, 0, z], [cx + d, 0, z]];
const [HA, HB] = pair(0, 1.0, 0.8);
const [CA, CB] = pair(0, 1.2, 0.72);
const [GA, GB] = pair(FX0, 1.2);
const [PA, PB] = pair(PX, 1.3, 1.0);
const [TA, TB] = pair(RX - 0.2, 4.6, 0.8);
const OPP = [QX + 0.3, 0, -3.5], IN2 = [QX + 1.9, 0, -2.9];
const HG = [[RHX + 35 - 0.85, 6.15, -91.2], [RHX + 35 + 0.85, 6.15, -91.2]];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const mixCam = (a, b, t) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], t)), look: a.look.map((v, i) => lerp(v, b.look[i], t)), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) });
const hookA = frameTwo(HA, HB, { headW: 0.22, frameY: 0.6, low: 10, dutch: 3, yaw: -6 }), hookB = frameTwo(HA, HB, { headW: 0.245, frameY: 0.6, low: 12, dutch: 2, yaw: 6 });
const hookCam = (f) => { const u = G(f); return u >= 0 ? mixCam(hookA, hookB, E.smooth(ramp(u, 0, 132))) : mixCam(hookA, hookB, -0.5 * ramp(-u, 0, 73)); };
const trkPos = (f) => TRK(f);
const CAMS = {
  hommes: [K2(233, CA, CB, { headW: 0.23, yaw: 8, low: 8, frameY: 0.45 }), K2(300, CA, CB, { headW: 0.25, yaw: -6, low: 12, frameY: 0.45 }), K2(385, CA, CB, { headW: 0.27, yaw: 4, low: 14, frameY: 0.45 })],
  pres: [K2(593, GA, GB, { headW: 0.26, yaw: 10, frameY: 0.44 }), K2(650, GA, GB, { headW: 0.29, yaw: -4, low: 6, frameY: 0.44 }), K2(720, GA, GB, { headW: 0.3, yaw: 4, low: 14, dutch: 3, frameY: 0.44 })],
  radio: [K(904, OPP, { headW: 0.25, yaw: -10, dutch: 3, frameY: 0.42 }), K(969, OPP, { headW: 0.34, yaw: 6, dutch: 3, frameY: 0.42 })],
  faux: [K2(970, OPP, IN2, { headW: 0.22, yaw: 10, low: 8, frameY: 0.44 }), K2(1084, OPP, IN2, { headW: 0.26, yaw: -6, low: 12, frameY: 0.44 })],
  chute1: [K2(1742, GA, GB, { headW: 0.26, yaw: -6, frameY: 0.44, low: 8 }), K2(1777, GA, GB, { headW: 0.3, yaw: 4, frameY: 0.44, low: 12 })],
  jum1: [K2(1471, HG[0], HG[1], { headW: 0.26, yaw: 0, low: 16, frameY: 0.44 }), K2(1520, HG[0], HG[1], { headW: 0.3, yaw: -6, low: 18, frameY: 0.44 })],
  chute3: [K2(1842, HG[0], HG[1], { headW: 0.26, yaw: 8, low: 14, dutch: 4, frameY: 0.44 }), K2(1918, HG[0], HG[1], { headW: 0.31, yaw: -4, low: 16, dutch: 4, frameY: 0.44 })],
};
const walkMid = (f) => { const p = walkGi(f); return [p[0] + 0.8, 0, p[2]]; };
const marchMid = (f) => { const p = marchGi(f); return [p[0] + 0.8, 0, p[2]]; };
const walkGi = (f) => { const u = ramp(f, 1085, 1206); return [VX - 8 + 9 * u, 0, 1.8]; };
const marchGi = (f) => { const u = ramp(f, 1207, 1345); return [RX - 9 + 8 * u, 0, 1.6]; };
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'loop': return hookCam(f);
    case 'plan': return crane([0, 0, 1.2], f, 133, 42, { from: { r: 22, h: 9, yaw: -32, lookUp: 1 }, to: { r: 7, h: 1.6, yaw: -6, lookUp: 1.3 } });
    case 'hommes': return camFromKeys(CAMS.hommes, f);
    case 'gonfle': return camFromKeys([R(386, [PX - 1.5, 0.9, 3.4], [PX + 0.4, 0.55, -0.5], 40), R(450, [PX + 2.6, 1.1, 6.0], [PX + 0.4, 0.8, -0.5], 40), R(516, [PX + 5.0, 1.5, 7.2], [PX + 0.2, 1.0, -0.3], 40)], f);
    case 'loin': return camFromKeys([R(517, [FX0 - 22, 1.0, 3.0], [FX0 - 16, 1.1, -6], 56), R(592, [FX0 + 10, 1.2, 3.0], [FX0 + 16, 1.1, -6], 54)], f);
    case 'pres': return camFromKeys(CAMS.pres, f);
    case 'camions': {
      if (f < 800) return track(trkPos, f, [3.5 + 2 * ramp(f, 721, 800), 1.4, 9.5], { lookUp: 1.3, fov: 42, lag: 5 });
      if (f < 860) return K2(800, TA, TB, { headW: 0.26, yaw: 14, low: 8, frameY: 0.44 }) && camFromKeys([K2(800, TA, TB, { headW: 0.26, yaw: 14, low: 8, frameY: 0.44 }), K2(860, TA, TB, { headW: 0.3, yaw: 4, low: 12, frameY: 0.44 })], f);
      return crane([RX + 1, 0, 3], f, 860, 43, { from: { r: 9, h: 2.2, yaw: 14, lookUp: 1.4 }, to: { r: 40, h: 9, yaw: 52, lookUp: 1.5 } }); }
    case 'radio': return camFromKeys(CAMS.radio, f);
    case 'faux': return camFromKeys(CAMS.faux, f);
    case 'insignes': return follow(walkMid, f, { headW: 0.21, yaw: 14, lag: 6, lead: 0, frameY: 0.44, low: 6 });
    case 'missions': return follow(marchMid, f, { headW: 0.21, yaw: -10, lag: 6, lead: 0, frameY: 0.44, low: 8 });
    case 'rhin': return crane([RHX - 2.5, 0, 14], f, 1346, 118, { from: { r: 44, h: 22, yaw: -34, lookUp: 0 }, to: { r: 7.5, h: 1.7, yaw: 4, lookUp: 1.3 } });
    case 'jumelles': {
      if (f < 1522) return camFromKeys(CAMS.jum1, f);
      return follow((ff) => [RHX + 33.5 + (ff - 1522) * 0.04, 6.15, -91.2], f, { headW: 0.2, yaw: -14, low: 10, lag: 4, lead: 0, frameY: 0.44 }); }
    case 'traverse': {
      const u = ramp(f, 1570, 1650);
      return track(BOAT1, f, [lerp(13, 5.6, E.smooth(u)), lerp(4.5, 1.3, E.smooth(u)), lerp(12, 5.6, E.smooth(u))], { lookUp: 0.9, fov: 42, lag: 5 }); }
    case 'chute1': return camFromKeys(CAMS.chute1, f);
    case 'chute2': return crane([FX0 - 4, 0, -8], f, 1778, 63, { from: { r: 24, h: 5, yaw: 78, lookUp: 1.2 }, to: { r: 46, h: 22, yaw: 40, lookUp: 0 } });
    case 'chute3': return camFromKeys(CAMS.chute3, f);
  }
  return hookCam(f);
};
const TR = [{ a: 133, type: 'rise' }, { a: 233, type: 'whip', dir: 1 }, { a: 386, type: 'drop' }, { a: 517, type: 'rise' }, { a: 593, type: 'whip', dir: -1 }, { a: 721, type: 'whip', dir: 1 },
  { a: 904, type: 'push' }, { a: 970, type: 'push' }, { a: 1085, type: 'whip', dir: 1 }, { a: 1207, type: 'whip', dir: 1 }, { a: 1346, type: 'rise' }, { a: 1471, type: 'push' },
  { a: 1570, type: 'whip', dir: -1 }, { a: 1742, type: 'push' }, { a: 1778, type: 'rise' }, { a: 1842, type: 'whip', dir: 1 }, { a: 1919, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => {
  const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]), S = shotAt(f);
  return { focus: d, cinf: ['loin', 'chute2', 'rhin'].includes(S.id) ? 12 : 9, near: ['hook', 'loop', 'pres', 'faux', 'insignes'].includes(S.id) ? 3 : undefined };
};

// ---------- effets 3D ----------
export const envAt = (f) => {
  const S = shotAt(f), o = {};
  o.motes = S.id === 'gonfle' ? 0.4 : 1;
  if (hookish(S)) o.beams = [{ at: [-3, 5, -4], yaw: 0, pitch: 0.55, len: 9, r: 1.3, col: '#ffe6a0', a: 0.22 }, { at: [3.5, 5, -4], yaw: 0, pitch: 0.55, len: 9, r: 1.3, col: '#ffe6a0', a: 0.2 }];
  if (S.id === 'gonfle') { o.spray = []; for (let k = 0; k < 4; k++) o.spray.push({ at: [PX - 1.1, 0.5, -0.1], f0: 400 + k * 30, n: 14, power: 0.5, col: '#e8eef8' }); }
  if (S.id === 'camions' && f >= 721) o.smoke = [{ at: [RX + truckX(f) - 2.7, 0.9, 1.5], f0: 725, f1: 800, rate: 6, size: 0.5, col: '#d8cfc0', rise: 0.4 }];
  if (S.id === 'traverse') { const b = boatPos(1, boatU(f)); o.spray = [{ at: [b[0], 0.2, b[2] - 1.8], f0: 1580 + 0, n: 18, power: 0.6, col: '#f2fbff' }]; }
  if (S.id === 'pres' && f >= 645 && f < 665) o.spray = [{ at: [FX0 - 0.1, 1.3, -0.1], f0: 645, n: 16, power: 0.6, col: '#d8e0c0' }];
  if (S.id === 'loop' && f >= 1935) o.spray = [{ at: [0.5, 2.5, 1.0], f0: 1935, n: 20, power: 0.4, col: '#f0f4f8' }];
  return o;
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.gi = { tunic: '#5f7a3a', skin: '#f1c9a4', hat: 'adrian', hatCol: '#6b7a45', brows: '#4a2e1e', sash: '#f08a2a', buttons: true, lapels: '#4a5f2a', cuffs: '#4a5f2a' };
  O.giIns = { ...O.gi, medals: 3, epaulettes: true, belt: true, plume: false };
  O.ing = { tunic: '#e0a81c', skin: '#8a5a3a', hair: '#1e1714', moustache: '#1e1714', brows: '#1e1714', glasses: true, cap: '#2f6a8a', thin: true, legs: 1.1, buttons: true };
  O.op = { tunic: '#2fa3b8', skin: '#e8b890', hat: 'adrian', hatCol: '#4a6a4a', brows: '#6a4a2a', hair: '#8a5a2a', stout: true, buttons: true };
  O.ger = { tunic: '#7a828a', skin: '#f3d3b4', hat: 'adrian', hatCol: '#5a626a', brows: '#4a2e1e', moustache: '#4a3a2a', buttons: true, belt: true };
  O.ger2 = { ...O.ger, tunic: '#6a727a', skin: '#e8c0a0', stout: true, moustache: null };
  O.e1 = { tunic: '#d23a32', skin: '#f3d3b4', hat: 'bonnet', hatCol: '#2b3a6a', hair: '#4a2a1e', brows: '#3a2418' };
  O.e2 = { tunic: '#7cb84e', skin: '#8a5a3a', hair: '#1e1714', brows: '#1e1714', glasses: true, cap: '#e8442e' };
  O.e3 = { tunic: '#8a5ab8', skin: '#e8b890', hat: 'adrian', hatCol: '#6b7a45', moustache: '#c9902a', brows: '#8a5a1e' };
  O.e4 = { tunic: '#2f7fd8', skin: '#f3d3b4', stout: true, hair: '#c9902a', cap: '#ffd23a', brows: '#8a5a1e' };
  O.v1 = { tunic: '#c8643a', skin: '#f1c9a4', dress: '#c8643a', hair: '#5a3a26', bun: '#5a3a26', apron: '#f4ecd8', brows: '#3a2418' };
  O.v2 = { tunic: '#f2b52a', skin: '#e8b890', stout: true, cap: '#46557a', moustache: '#6a5a4a', brows: '#4a3a2a', apron: '#6a4a3a' };
  O.v3 = { tunic: '#46557a', skin: '#8a5a3a', dress: '#8a5ab8', hair: '#1e1714', bun: '#1e1714', brows: '#1e1714' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520);
  panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 520 + size * 0.36, size, fill, 0); g.restore(); };
const wavesCard = (ph, col = '#ffd23a') => (p) => { const g = p.g; g.save(); g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const t = (ph + i / 4) % 1, r = 80 + t * 380, a = 1 - t; g.globalAlpha = Math.min(1, a * 1.6); g.strokeStyle = INK; g.lineWidth = 46; g.beginPath(); g.arc(120, 520, r, -0.75, 0.75); g.stroke(); g.strokeStyle = col; g.lineWidth = 24; g.beginPath(); g.arc(120, 520, r, -0.75, 0.75); g.stroke(); } g.restore(); };
const paperCard = (k) => (p) => { const g = p.g; g.save(); const s = 0.6 + 0.4 * E.back(clamp(k)); g.translate(300, 520); g.rotate(-0.06); g.scale(s, s); g.translate(-300, -520);
  panel(g, 70, 330, 460, 380, '#f3e6c8'); TXT(g, 'SECRET', 300, 430, 86, '#c8312c', 0); for (let i = 0; i < 5; i++) { g.strokeStyle = '#7a6f64'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(130, 490 + i * 38); g.lineTo(i === 4 ? 330 : 470, 490 + i * 38); g.stroke(); } g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s * 1.9, z: pos[2], s: s * 1.9, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const legsF = (x) => q((x * 1.1) % 1, 2);
export const actorsAt = (f, T) => {
  const S = shotAt(f), g = G(f), out = [], ff = hookish(S) ? g : f;
  const tint = ['gonfle'].includes(S.id) ? '#dfe6ff' : '#fff0d8';
  const fig = (who, seed, o, pos, ex = {}) => R_(T, who, life(ff, seed, o), pos, { tint, ...ex });
  const cam = camAt(f);
  const bob = (ph = 0, a = 0.03) => ({ dy: Math.abs(Math.sin(f * 0.34 + ph)) * a });
  switch (S.id) {
    case 'hook': case 'loop': {
      const late = S.id === 'loop', fl = late ? ramp(f, 1925, 1985) : 0;
      out.push(fig('gi', 4, { expr: late ? (fl > 0.4 ? 'shock' : 'laugh') : g < 60 ? 'laugh' : 'grin', L: 'up', R: 'up', look: 0.8 }, HA, { dy: Math.abs(Math.sin(f * 0.34)) * 0.03 * (1 - fl) - 0.1 * fl }));
      out.push(fig('ing', 6, { expr: late ? 'laugh' : g < 60 ? 'shock' : 'laugh', L: 'up', R: 'up', look: -0.8 }, HB, { dy: Math.abs(Math.sin(f * 0.34 + 1.6)) * 0.03 * (1 - fl) - 0.1 * fl }));
      if (g > 40 || late) out.push(fgCard(cam, T.fgProp('leaves', { seed: 3 }), { key: 'lvH', side: -1, dist: 0.9, drop: 0.7, s: 0.5 }));
      break; }
    case 'plan': {
      const k = ramp(f, 190, 232);
      out.push(fig('gi', 4, { expr: f < 200 ? 'scheming' : 'sly', L: 'hip', R: 'chin', look: 0.9 }, CA, { ...bob(0, 0.0) }));
      out.push(fig('ing', 6, { expr: 'smug', L: 'show', R: 'hip', holdL: 'paper', look: -0.9 }, CB));
      break; }
    case 'hommes': {
      const k = ramp(f, 252, 264);
      out.push(fig('gi', 4, { expr: f < 300 ? 'proud' : 'grin', L: 'hip', R: f >= 290 ? 'show' : 'hip', holdR: 'brush', look: 0.7, headTilt: 5 }, CA));
      out.push(fig('ing', 6, { expr: f < 330 ? 'smug' : 'proud', L: f >= 322 ? 'show' : 'hip', R: 'hip', holdL: 'tool', look: -0.8 }, CB));
      out.push(...crowd(T, f, { center: [0, 0, -3.2], n: 10, w: 8.5, d: 2.2, outfits: ['e1', 'e2', 'e3', 'e4', 'gi'], exprs: ['grin', 'smile', 'laugh', 'proud'], seed: 4, cheer: 0.25, arms: ['hang', 'wave', 'up', 'hip'] }));
      break; }
    case 'gonfle': {
      const pump = Math.abs(Math.sin(f * 0.42));
      out.push(fig('gi', 4, { expr: f < 470 ? 'determined' : 'laugh', L: 'push', R: 'push', look: 0.9 }, [PX - 1.6, 0, 1.6], { dy: pump * 0.03 }));
      out.push(fig('ing', 6, { expr: f < 470 ? 'nervous' : 'laugh', L: f < 470 ? 'reach' : 'up', R: f < 470 ? 'reach' : 'up', look: -0.9 }, [PX + 2.1, 0, 1.6], f >= 478 ? { dy: hop(f, 478, 0.1, 8).dy } : { dy: pump * 0.02 }));
      break; }
    case 'loin': break;
    case 'pres': {
      const tap = f >= 640;
      out.push(fig('gi', 4, { expr: f < 640 ? 'squint' : f < 662 ? 'suspicious' : 'grin', L: 'hip', R: f >= 634 && f < 665 ? 'reach' : 'hip', look: -0.9 }, GA));
      out.push(fig('ing', 6, { expr: f < 660 ? 'deadpan' : 'laugh', L: 'hip', R: f >= 660 ? 'up' : 'chin', look: 0.9 }, GB, f >= 660 ? hop(f, 662, 0.12, 8) : {}));
      if (f > 600) out.push(fgCard(cam, T.fgProp('leaves', { seed: 5 }), { key: 'lvP', side: 1, dist: 0.9, drop: 0.7, s: 0.5 }));
      break; }
    case 'camions': {
      const stop = f >= 805;
      if (f < 800) { out.push(fig('ing', 6, { expr: 'proud', L: 'hip', R: 'wave', wv: q(f * 0.3, 1), look: 0.9 }, [RX + truckX(f) + 2.6, 1.7, 1.5], { tint, s: 0.5, order: 6, shadow: false })); }
      else {
        out.push(fig('gi', 4, { expr: f < 830 ? 'shock' : 'pained', L: 'head', R: 'head', look: 0.9, step: 0 }, TA, { ...tremble(f, 0.015, 2) }));
        out.push(fig('ing', 6, { expr: 'laugh', L: 'hip', R: f > 840 ? 'point' : 'hip', look: -0.9 }, TB, { dy: Math.abs(Math.sin(f * 0.3)) * 0.02 }));
      }
      if (f >= 730) { const ph = (f * 0.03) % 1, tx = RX + truckX(f); out.push(FX('wv' + q(ph, 1), wavesCard(q(ph, 1)), [tx + 3.4, 2.4, 3.2], 1.5)); }
      break; }
    case 'radio': {
      out.push(fig('op', 6, { expr: f < 935 ? 'determined' : 'sly', L: 'reach', R: 'reach', look: 0.5 }, OPP));
      out.push(fig('ing', 4, { expr: 'sly', L: 'hip', R: 'point', look: -0.8 }, IN2));
      const ph = (f * 0.04) % 1; out.push(FX('wr' + q(ph, 1), wavesCard(q(ph, 1), '#ffffff'), [QX - 4.2, 8.2, -4.8], 1.4));
      break; }
    case 'faux': {
      const k = ramp(f, 1030, 1046);
      out.push(fig('op', 6, { expr: 'smug', L: 'reach', R: 'reach', look: 0.4 }, OPP, { dy: Math.abs(Math.sin(f * 0.8)) * 0.012 }));
      out.push(fig('ing', 4, { expr: 'scheming', L: 'hip', R: 'show', holdR: 'paper', look: -0.8 }, IN2));
      if (f > 1010) out.push(fgCard(cam, T.fgProp('letter'), { key: 'ltr', side: -1, dist: 0.95, drop: 0.7, s: 0.5 }));
      if (f >= 1048) out.push(FX('pp' + q(k, 1), paperCard(k), [QX + 0.5, 2.5, -1.2], 0.7));
      break; }
    case 'insignes': {
      const p0 = walkGi(f), p1 = [p0[0] + 1.6, 0, 1.6], st = legsF(p0[0] * 1.6), sew = f < 1108;
      out.push(fig(sew ? 'gi' : 'giIns', 4, { expr: sew ? 'proud' : 'smug', L: sew ? 'hip' : 'hip', R: sew ? 'show' : 'hip', holdR: sew ? 'coin' : undefined, step: sew ? 0 : st, look: 0.7, headTilt: 4 }, sew ? [p0[0], 0, 1.8] : p0, sew ? {} : { dy: Math.abs(Math.sin(p0[0] * 5)) * 0.02 }));
      out.push(fig('ing', 6, { expr: 'grin', L: 'hip', R: 'hip', step: sew ? 0 : st, look: -0.7 }, sew ? [p0[0] + 1.6, 0, 1.8] : p1, sew ? {} : { dy: Math.abs(Math.sin(p0[0] * 5 + 1)) * 0.02 }));
      out.push(...crowd(T, f, { center: [VX, 0, -3.4], n: 8, w: 13, d: 2.5, outfits: ['v1', 'v2', 'v3'], exprs: ['suspicious', 'smile', 'shock', 'grin'], seed: 9, cheer: 0, arms: ['hang', 'wave', 'hip', 'point'], s: 0.92 }));
      if (sew) out.push(fgCard(cam, T.fgProp('coin'), { key: 'coin', side: 1, dist: 0.9, drop: 0.75, s: 0.4 }));
      break; }
    case 'missions': {
      const p0 = marchGi(f), st = legsF(p0[0] * 1.6), k1 = ramp(f, 1236, 1250), k2 = ramp(f, 1290, 1302), k3 = ramp(f, 1318, 1330);
      out.push(fig('gi', 4, { expr: 'determined', L: 'hip', R: 'hip', step: st, look: 0.7 }, p0, { dy: Math.abs(Math.sin(p0[0] * 5)) * 0.02 }));
      out.push(fig('ing', 6, { expr: 'proud', L: 'hip', R: 'hip', step: st, look: -0.7 }, [p0[0] + 1.6, 0, 1.6], { dy: Math.abs(Math.sin(p0[0] * 5 + 1)) * 0.02 }));
      out.push(...crowd(T, f, { center: [p0[0] + 0.5, 0, -2.6], n: 6, w: 7, d: 1.8, outfits: ['e1', 'e2', 'e3', 'e4'], exprs: ['determined', 'smile', 'grin'], seed: 11, cheer: 0, arms: ['hang', 'hip'], s: 0.9 }));
      if (f >= 1236 && f < 1290) out.push(FX('c21' + q(k1, 1), labelCard('21', 190, '#ffd23a', INK, k1, -0.04), [p0[0] + 0.6, 3.5, 1.8], 0.55));
      if (f >= 1290 && f < 1318) out.push(FX('cN' + q(k2, 1), labelCard('NORMANDIE', 70, '#ffffff', '#2f5a8a', k2, -0.04), [p0[0] - 0.8, 3.5, 1.8], 0.55));
      if (f >= 1318) out.push(FX('cR' + q(k3, 1), labelCard('RHIN', 100, '#ffd23a', '#2f5a8a', k3, 0.04), [p0[0] + 1.0, 3.5, 1.8], 0.55));
      break; }
    case 'rhin': {
      const fin = f >= 1425;
      out.push(fig('gi', 4, { expr: fin ? 'proud' : 'smug', L: fin ? 'salute' : 'hip', R: 'hip', look: 0.8 }, [RHX - 3.3, 0, 14.3], { }));
      out.push(fig('ing', 6, { expr: fin ? 'grin' : 'smug', L: 'hip', R: fin ? 'show' : 'hip', look: -0.8 }, [RHX - 1.7, 0, 14.3]));
      break; }
    case 'jumelles': {
      if (f < 1522) {
        out.push(fig('ger', 4, { expr: f < 1500 ? 'squint' : 'shock', L: 'up', R: 'up', holdR: 'binocs', look: -0.7 }, HG[0]));
        out.push(fig('ger2', 6, { expr: 'suspicious', L: 'hip', R: 'point', look: 0.8 }, HG[1]));
      } else {
        const x0 = RHX + 35, st = legsF((f - 1522) * 0.05);
        [[-3.6, 'ger', 4], [-1.8, 'ger2', 6], [0, 'ger', 5], [1.8, 'ger2', 7]].forEach(([dx, w, sd], i) => out.push(fig(w, sd, { expr: i % 2 ? 'determined' : 'stern', L: 'hip', R: 'hip', step: st, look: 0.6 }, [x0 + dx + (f - 1522) * 0.04, 6.15, -91.2 + (i % 2) * 0.6], { dy: Math.abs(Math.sin(f * 0.34 + i)) * 0.03 })));
      }
      break; }
    case 'traverse': {
      const seat = (i, dz, who, sd, o) => { const b = boatPos(i, boatU(f)); out.push(fig(who, sd, { sit: true, seat: false, look: 0.4, ...o }, [b[0], b[1] + 0.45, b[2] + dz], { dy: Math.sin(f * 0.2 + i) * 0.015, order: 4 })); };
      seat(1, 0.95, 'gi', 4, { expr: f < 1700 ? 'determined' : 'grin', L: 'hip', R: 'hip' });
      seat(1, -0.85, 'ing', 6, { expr: f < 1700 ? 'nervous' : 'laugh', L: 'hip', R: 'hip' });
      seat(0, 0.9, 'e3', 8, { expr: 'determined', L: 'hip', R: 'hip' }); seat(0, -0.9, 'e4', 9, { expr: 'nervous', L: 'hip', R: 'hip' });
      seat(2, 0.9, 'e1', 10, { expr: 'determined', L: 'hip', R: 'hip' }); seat(2, -0.9, 'e2', 11, { expr: 'smile', L: 'hip', R: 'hip' });
      break; }
    case 'chute1': {
      const j = hop(f, 1744, 0.1, 8);
      out.push(fig('gi', 4, { expr: 'laugh', L: 'up', R: 'fist', look: 0.8 }, GA, { dy: j.dy }));
      out.push(fig('ing', 6, { expr: 'laugh', L: 'hip', R: 'point', look: -0.8 }, GB, { dy: hop(f, 1748, 0.1, 8).dy }));
      break; }
    case 'chute2': {
      out.push(fig('gi', 4, { expr: 'smug', L: 'hip', R: 'hip', look: 0.8 }, [FX0 - 4.5, 0, 2]));
      out.push(fig('ing', 6, { expr: 'grin', L: 'hip', R: 'hip', look: -0.8 }, [FX0 - 3.1, 0, 2]));
      break; }
    case 'chute3': {
      out.push(fig('ger', 4, { expr: f < 1880 ? 'shock' : 'dazed', L: 'up', R: 'point', look: -0.9 }, HG[0], { ...tremble(f, 0.012, 1) }));
      out.push(fig('ger2', 6, { expr: f < 1870 ? 'squint' : 'shock', L: 'head', R: 'head', look: 0.9 }, HG[1], { ...tremble(f, 0.012, 3) }));
      break; }
  }
  return out;
};

// ---------- effets 2D (cartes, chiffres) ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'hommes' && f >= 252 && f < 380) { const k = ramp(f, 252, 264); out.push(FX('n1100' + q(k, 1), labelCard('1 100', 120, '#ffd23a', INK, k, -0.04), [0.0, 3.0, 1.2], 0.42)); }
  return out;
};
