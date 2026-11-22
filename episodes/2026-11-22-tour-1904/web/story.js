// "Le Tour gagné en arrivant cinquième" (1904) — 51.3 s, 30 fps, 1538 images. Cadres calés sur phrases.json.
// Zones : route A (x 0..140), clous B (~210), foule C (~420), arrivée F = 1500, gare G = 3000, voiture CX = 4000, bureau OX = 6000.
import { M as E, trail, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, fallOver, popIn, tremble, run, follow, track, orbit, transition } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1538, DECK = 0;
const FX0 = 1500, GX = 3000, CX = 4000, OX = 6000;
export const SHOTS = [
  { id: 'hook', a: 0, b: 146 },        // Il a gagné le Tour de France… en finissant cinquième.
  { id: 'datum', a: 147, b: 205 },     // C'était en 1904.
  { id: 'age', a: 206, b: 272 },       // Henri Cornet avait dix-neuf ans,
  { id: 'pneus', a: 273, b: 338 },     // et il pédalait sur deux pneus crevés.
  { id: 'clous', a: 339, b: 466 },     // Cette année-là, des clous et du verre jonchaient la route.
  { id: 'foule', a: 467, b: 601 },     // Des supporters bloquaient les coureurs à coups de bâton,
  { id: 'commis', a: 602, b: 708 },    // et les commissaires tiraient en l'air pour les disperser.
  { id: 'train', a: 709, b: 790 },     // Les favoris, eux, sautaient dans un train,
  { id: 'voiture', a: 791, b: 932 },   // ou dans une voiture, dès que personne ne regardait.
  { id: 'sauf', a: 933, b: 1070 },     // Sauf que quelqu'un a fini par regarder.
  { id: 'mois', a: 1071, b: 1140 },    // Quatre mois plus tard,
  { id: 'disq', a: 1141, b: 1236 },    // les quatre premiers sont disqualifiés.
  { id: 'passe', a: 1237, b: 1332 },   // Le jeune Cornet passe de la cinquième à la première place,
  { id: 'bras', a: 1333, b: 1402 },    // sans avoir levé les bras sur la ligne.
  { id: 'jeune', a: 1403, b: 1477 },   // Le plus jeune vainqueur de l'histoire du Tour,
  { id: 'fin', a: 1478, b: 1537 },     // c'est celui qui est arrivé cinquième.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lumière ----------
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'train': return blendMood(mood('jour', { exposure: 1.08 }), mood('soir', { exposure: 1.12 }), ramp(f, 709, 740));
    case 'voiture': return mood('soir', { exposure: 1.12 });
    case 'sauf': return blendMood(mood('soir', { exposure: 1.12 }), mood('lampe', { exposure: 1.4, hemi: 1.4 }), ramp(f, 933, 965));
    case 'mois': case 'disq': return mood('lampe', { exposure: 1.4, hemi: 1.4 });
    case 'passe': return blendMood(mood('lampe', { exposure: 1.4, hemi: 1.4 }), mood('dore', { exposure: 1.1 }), ramp(f, 1237, 1300));
    case 'bras': case 'jeune': return mood('dore', { exposure: 1.1 });
    case 'fin': return blendMood(mood('dore', { exposure: 1.1 }), mood('jour', { exposure: 1.08 }), ramp(f, 1478, 1500));
    case 'commis': return mood('jour', { exposure: 1.05 });
    default: return mood('jour', { exposure: 1.08 });
  }
};
const TINTS = { train: '#ffe6cc', voiture: '#ffd8b8', sauf: '#ffd8a0', mois: '#ffd8a0', disq: '#ffd8a0', passe: '#ffe2b0', bras: '#ffe2b0', jeune: '#ffe2b0' };
const tintOf = (S) => TINTS[S.id] || '#fff0d8';

// ---------- cinématique des vélos ----------
const V = 5.5, DX = V / 30;                                  // 5,5 m/s
const gx = (g) => 2 + DX * g;                                 // Henri sur la route A (g = images depuis le début de la boucle)
const GF = (f) => (f >= 1478 ? f - 1537 : f);                 // la fin rejoue la même route : la dernière image = la première
const HXA = (f) => gx(GF(f));
const HXB = (f) => 225 + DX * (f - 440);                      // Henri dans les clous
const FAVB = (f) => (f < 432 ? 212 - 0.2 * (432 - f) : 212 + 5 * (1 - Math.exp(-(f - 432) / 9)));   // le favori roule puis glisse après la crevaison
const XH = 419.4, CH = (f) => XH - 26 + 26 * E.easeOut(ramp(f, 467, 509));   // Henri freine devant la foule
const CHX = (f) => (f < 665 ? CH(Math.min(f, 509)) : XH + 48 * E.easeIn(ramp(f, 665, 708)));
const B = (x, z = 0.12, o = {}) => ({ x, z, rot: x / 0.34, vis: true, ...o });
const HIDE = { x: 0, z: 0, vis: false };
const bikesAt = (f) => {
  const S = shotAt(f), out = [HIDE, HIDE, HIDE, HIDE, HIDE, HIDE];
  switch (S.id) {
    case 'hook': case 'fin': out[0] = B(HXA(f), 0.12, { flat: true }); break;
    case 'datum': { const h = HXA(f); out[0] = B(h, 0.1, { flat: true }); out[1] = B(h - 3.4, -0.9); out[2] = B(h - 6.6, 0.9); out[3] = B(h + 3.6, 1.0); out[4] = B(h - 10, -0.5); out[5] = B(h + 7, -0.8); break; }
    case 'age': out[0] = B(HXA(f), 0.12, { flat: true }); break;
    case 'pneus': out[0] = B(HXA(f), 0.12, { flat: true }); break;
    case 'clous': { out[0] = B(HXB(f), 0.1, { flat: true }); const fb = FAVB(f), d = f - 432;
      out[1] = f < 432 ? B(fb, 0.1) : B(fb, 0.1 + 0.2 * Math.min(1, d / 10), { flat: true, roll: -0.5 * Math.min(1, d / 8), rot: 212 / 0.34 + Math.max(0, 5 - d * 0.5)  }); break; }
    case 'foule': case 'commis': { const h = CHX(f); out[0] = B(h, 0.1, { flat: true }); out[1] = B(h - 2.3, -0.9); out[2] = B(h - 4.3, 0.95); out[3] = B(h - 6.4, -0.3); break; }
    case 'voiture': break;
    case 'bras': { out[0] = B(HEN_BRAS(f)[0], 0.1); break; }
    case 'jeune': out[0] = B(FX0 + 7.5, 3.0, { ry: 1.2 }); break;
  }
  return out;
};
export const worldAt = (f) => {
  const S = shotAt(f); let car = { x: CX - 120, rot: 0 };
  if (S.id === 'voiture') { const x = f < 862 ? CX - 36 * (1 - E.easeOut(ramp(f, 791, 826))) : CX + 14 * Math.pow(ramp(f, 862, 932), 2); car = { x, rot: x / 0.55 }; }
  return { bikes: bikesAt(f), car };
};
const CAR = (f) => [worldAt(f).car.x, 0, 0];

// ---------- lieux ----------
const GY = (f) => [HXA(f), 0, 0];
const JUGE = [OX, 0, -2.9], FAV = [-1.95, -0.65, 0.65, 1.95];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const mixCam = (a, b, t) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], t)), look: a.look.map((v, i) => lerp(v, b.look[i], t)), fov: lerp(a.fov, b.fov, t) });
const STAND = { clous: [212, 0, 0] };
const SUP = [[420.9, 0, -1.3], [421.4, 0, 0.3], [420.7, 0, 1.5]];
const COM = [419.6, 0, -2.5];
const CARS = (f) => { const c = CAR(f); return [c[0] + 0.45, 0.32, 0.2]; };
const CAMS = {
  clouslow: [R(339, [212.0, 0.45, 2.7], [214.4, 0.4, 0], 36), R(405, [213.4, 0.55, 2.4], [215.6, 0.4, 0], 34)],
  clousfav: [K(406, [210, 0, 0], { headW: 0.2, yaw: 8 }), K(466, [214, 0, 0], { headW: 0.26, yaw: -6 })],
  foule: [K2(467, [XH - 2.2, 0, 0], SUP[1], { headW: 0.14, yaw: -12, frameY: 0.46 }), K2(520, [XH, 0, 0.1], SUP[1], { headW: 0.25, yaw: 10 }), K(601, [XH, 0, 0.1], { headW: 0.33, yaw: 6 })],
  commis: [K2(602, COM, SUP[1], { headW: 0.22, yaw: 4 }), K2(640, COM, SUP[0], { headW: 0.25, yaw: -4 }), K(708, COM, { headW: 0.3, yaw: 10 })],
  train: [K2(709, [GX - 2.5, 0, -4.4], [GX - 1.0, 0, -4.4], { headW: 0.2, yaw: -6, frameY: 0.44 }), K2(790, [GX - 1.5, 0.3, -4.4], [GX - 0.1, 0.3, -4.4], { headW: 0.26, yaw: 4, frameY: 0.44 })],
  voitureA: [R(791, [CX - 1.6, 1.5, 7.4], [CX - 1.4, 0.9, 0], 40)],
  sauf: [K(933, JUGE, { headW: 0.2, yaw: 6, frameY: 0.46 }), K(1000, JUGE, { headW: 0.34, yaw: -3, frameY: 0.42 }), K(1070, JUGE, { headW: 0.3, yaw: 5, frameY: 0.44 })],
  mois: [K(1071, [OX + 0.3, 0, -2.9], { headW: 0.27, yaw: -12, frameY: 0.44 }), K(1140, [OX - 0.3, 0, -2.9], { headW: 0.3, yaw: 12, frameY: 0.44 })],
  disq: [K2(1141, [OX + FAV[0], 0, 0], [OX + FAV[1], 0, 0], { headW: 0.26, yaw: -4, frameY: 0.46 }), K2(1176, [OX + FAV[0], 0, 0], [OX + FAV[1], 0, 0], { headW: 0.27, yaw: 4, frameY: 0.46 }),
    K2(1195, [OX + FAV[2], 0, 0], [OX + FAV[3], 0, 0], { headW: 0.26, yaw: -4, frameY: 0.46 }), K2(1236, [OX + FAV[2], 0, 0], [OX + FAV[3], 0, 0], { headW: 0.27, yaw: 4, frameY: 0.46 })],
  passe: [K2(1237, [OX - 0.5, 0, -0.5], [OX + 0.7, 0, -0.5], { headW: 0.27, yaw: -14, frameY: 0.45 }), K2(1290, [OX - 0.5, 0, -0.5], [OX + 0.7, 0, -0.5], { headW: 0.3, yaw: 6, frameY: 0.45 }), K2(1332, [OX - 0.5, 0, -0.5], [OX + 0.7, 0, -0.5], { headW: 0.3, yaw: -6, frameY: 0.45 })],
};
const HEN_BRAS = (f) => [FX0 - 15 + 18 * E.smooth(ramp(f, 1333, 1385)) + 0.5 * ramp(f, 1385, 1402), 0, 0];
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'fin': { return follow((ff) => [HXA(ff), 0, 0], f, { headW: 0.3, yaw: 24, lag: 6, lead: 0.6 }); }
    case 'datum': return track((ff) => [HXA(ff) - 1.2, 0, 0], f, [5.5, 1.5, 9.5], { lookUp: 1.0 });
    case 'age': return follow((ff) => [HXA(ff), 0, 0], f, { headW: 0.31, yaw: -22, lag: 6, lead: 0.5 });
    case 'pneus': { const a = track((ff) => [HXA(ff), 0, 0], f, [1.3, 0.4, 2.7], { lookUp: 0.36, fov: 36 }), b = follow((ff) => [HXA(ff), 0, 0], f, { headW: 0.32, yaw: 18, lag: 6, lead: 0.5 }); return mixCam(a, b, E.smooth(ramp(f, 304, 322))); }
    case 'clous': { if (f < 406) return camFromKeys(CAMS.clouslow, f); let c = mixCam(camFromKeys(CAMS.clouslow, 405), follow((ff) => [FAVB(ff) + 0.2, 0, 0], f, { headW: 0.24, yaw: 10, lag: 5, lead: 0 }), E.smooth(ramp(f, 398, 414))); if (f >= 432) c = shake(c, f, 432, 0.07, 10); return c; }
    case 'foule': { let c = camFromKeys(CAMS.foule, f); c = shake(c, f, 522, 0.07, 10); c = shake(c, f, 560, 0.06, 10); return c; }
    case 'commis': { let c = camFromKeys(CAMS.commis, f); return shake(c, f, 640, 0.14, 12); }
    case 'train': return camFromKeys(CAMS.train, f);
    case 'voiture': { if (f < 846) return mixCam(camFromKeys(CAMS.voitureA, f), frameTwo([CX - 0.55, 0.32, 0.2], [CX + 0.45, 0.32, 0.2], { headW: 0.25, yaw: -14, frameY: 0.5 }), E.smooth(ramp(f, 810, 846))); const cp = trail(CAR, f, 3), a = frameTwo([cp[0] - 0.55, 0.32, 0.2], [cp[0] + 0.45, 0.32, 0.2], { headW: 0.25, yaw: -14, frameY: 0.5 }); return a; }
    case 'sauf': return shake(camFromKeys(CAMS.sauf, f, { kicks: [{ f: 935, a: 0.04 }] }), f, 940, 0.06, 10);
    case 'mois': return camFromKeys(CAMS.mois, f);
    case 'disq': { let c = camFromKeys(CAMS.disq, f); for (const s of [1150, 1168, 1186, 1204]) c = shake(c, f, s, 0.07, 9); return c; }
    case 'passe': return shake(camFromKeys(CAMS.passe, f), f, 1285, 0.07, 10);
    case 'bras': return follow(HEN_BRAS, f, { headW: 0.28, yaw: -26, lag: 6, lead: 0.6 });
    case 'jeune': return orbit([FX0 + 5, 0.6, -1.6], f, 1403, { r: 4.9, h: 1.7, speed: -9, start: 14, fov: 40, lookUp: 1.55 });
  }
  return camFromKeys(CAMS.sauf, f);
};
const TR = [{ a: 339, type: 'whip', dir: 1 }, { a: 467, type: 'whip', dir: -1 }, { a: 709, type: 'whip', dir: 1 }, { a: 791, type: 'whip', dir: -1 }, { a: 933, type: 'rise' }, { a: 1333, type: 'whip', dir: 1 }, { a: 1478, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); const S = shotAt(f); return { focus: d, cinf: S.id === 'pneus' || S.id === 'clous' ? 6 : 9 }; };

// ---------- effets 3D ----------
export const envAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'fin': return { sparks: [{ at: [HXA(f) + 0.56, 0.12, 0.12], f0: 0, f1: 1e5, rate: 45, col: '#ffb040', speed: 2.6 }], smoke: [{ at: [HXA(f) - 0.5, 0.15, 0.1], f0: 0, f1: 1e5, rate: 8, size: 0.5, col: '#e0cfa8', rise: 0.3 }], motes: 0.5, wind: [-1.5, 0] };
    case 'age': return { smoke: [{ at: [HXA(f) - 0.5, 0.15, 0.1], f0: 206, f1: 272, rate: 8, size: 0.5, col: '#e0cfa8', rise: 0.3 }], motes: 0.5 };
    case 'datum': return { smoke: [{ at: [HXA(f) - 1.5, 0.2, 0.1], f0: 147, f1: 205, rate: 14, size: 1.2, col: '#e0cfa8', rise: 0.4 }], wind: [-1.5, 0] };
    case 'pneus': return { sparks: [{ at: [HXA(f) + 0.56, 0.1, 0.14], f0: 273, f1: 338, rate: 90, col: '#ffb040', speed: 3 }, { at: [HXA(f) - 0.56, 0.1, 0.14], f0: 273, f1: 338, rate: 70, col: '#ffd070', speed: 2.6 }], smoke: [{ at: [HXA(f) - 0.7, 0.15, 0.1], f0: 273, f1: 338, rate: 12, size: 0.6, col: '#e0cfa8', rise: 0.3 }] };
    case 'clous': return { sparks: [{ at: [HXB(f) + 0.5, 0.1, 0.12], f0: 339, f1: 470, rate: 60, col: '#ffb040', speed: 2.8 }], spray: [{ at: [212.3, 0.3, 0.1], f0: 431, n: 140, power: 4, col: '#e8e2da' }], smoke: f > 432 ? [{ at: [FAVB(f), 0.15, 0.1], f0: 432, f1: 470, rate: 20, size: 0.8, col: '#d9b98a', rise: 0.3 }] : [] };
    case 'foule': return { smoke: [{ at: [CH(f) - 0.4, 0.15, 0.1], f0: 470, f1: 520, rate: 28, size: 0.9, col: '#d9b98a', rise: 0.4 }], wind: [1, 0] };
    case 'commis': return { smoke: [{ at: [COM[0] + 0.9, 2.1, -1.0], f0: 640, f1: 700, rate: 14, size: 0.55, col: '#d8d8d8', rise: 0.5 }, { at: [SUP[1][0], 0.15, 0.2], f0: 646, f1: 690, rate: 20, size: 0.9, col: '#d9b98a', rise: 0.4 }], sparks: [{ at: [COM[0] + 1.0, 2.1, -1.0], f0: 640, f1: 646, rate: 90, col: '#fff08a', speed: 4 }] };
    case 'train': return { smoke: [{ at: [GX - 8.5, 5.2, -6.6], f0: 709, f1: 790, rate: 16, size: 1.5, col: '#e8e2da', rise: 1.0 }], wind: [1.5, 0], motes: 0.5 };
    case 'voiture': { const c = CAR(f); return { smoke: [{ at: [c[0] - 1.7, 0.35, 0], f0: 791, f1: 932, rate: 18, size: 0.9, col: '#d9c9a8', rise: 0.5 }], motes: 0.5 }; }
    case 'jeune': return { sparks: [{ at: [FX0 + 3.5, 4.2, -2], f0: 1403, f1: 1477, rate: 16, col: '#ffd23a', speed: 3.2, size: 2 }, { at: [FX0 + 6.5, 4.2, -2.4], f0: 1403, f1: 1477, rate: 16, col: '#ff6fa1', speed: 3.2, size: 2 }, { at: [FX0 + 5, 4.4, -2.2], f0: 1403, f1: 1477, rate: 14, col: '#7fd0ff', speed: 3.4, size: 2 }], motes: 0.5 };
    case 'bras': return { sparks: [{ at: [FX0 + 3, 3.8, -1.5], f0: 1360, f1: 1402, rate: 16, col: '#ffd23a', speed: 3, size: 2 }], smoke: [{ at: [HEN_BRAS(f)[0] - 0.6, 0.15, 0.1], f0: 1333, f1: 1402, rate: 12, size: 0.6, col: '#e8d8b0', rise: 0.3 }], motes: 0.6 };
    case 'sauf': case 'mois': case 'disq': case 'passe': return { motes: 1 };
    default: return { motes: 0.6 };
  }
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.henri = { tunic: '#e0a81c', skin: '#f1c9a4', cap: '#2b3a6a', hair: '#6a4026', brows: '#4a3222' };
  O.fav1 = { tunic: '#d8302a', skin: '#e8b890', cap: '#2a2a2a', moustache: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.fav2 = { tunic: '#18b8d8', skin: '#c9966a', cap: '#f1ead8', beard: '#2a1e1a', brows: '#2a1e1a' };
  O.fav3 = { tunic: '#7a3aa8', skin: '#7a4a30', cap: '#e8c24a', moustache: '#1e1714', brows: '#1e1714' };
  O.fav4 = { tunic: '#e8782a', skin: '#f3cfae', cap: '#3a6a3a', moustache: '#7a4a2a', brows: '#6a4a2a' };
  O.commissaire = { tunic: '#3f8a3a', skin: '#e8b890', hat: 'kepi', hatCol: '#3f8a3a', moustache: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.supA = { tunic: '#4f7fb8', skin: '#f1c9a4', cap: '#5a3a22', moustache: '#4a3020', brows: '#4a3020', stout: true };
  O.supB = { tunic: '#f1ead8', skin: '#d8a070', cap: '#c2733a', beard: '#8a8a8a', brows: '#8a8a8a' };
  O.supC = { tunic: '#c25a7a', dress: '#c25a7a', skin: '#f3cfae', hat: 'chapeauplume', hatCol: '#e8a030', hatBand: '#6a2a7a', brows: '#3a2418' };
  O.juge = { tunic: '#5a3a8a', skin: '#f0cfa8', hat: 'tophat', beard: '#cfcfcf', glasses: true, brows: '#9a9a9a' };
  O.chauffeur = { tunic: '#c9a05a', skin: '#e8b890', hat: 'chauff', glasses: '#3a2a22', moustache: '#4a3020', brows: '#4a3020' };
  O.cheminot = { tunic: '#2f4a8a', skin: '#e8b890', hat: 'kepi', hatCol: '#2f4a8a', moustache: '#2a1e1a', brows: '#2a1e1a' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const legs = (x) => q((x * 1.1) % 1, 2);
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S), W = worldAt(f).bikes;
  const fig = (who, seed, o, pos, ex = {}) => R_(T, who, life(f, seed, o), pos, { tint, ...ex });
  // coureur sur un vélo : la carte est posée sur la selle, le vélo passe devant
  const rider = (who, seed, bi, o = {}, ex = {}) => { const b = W[bi]; if (!b.vis) return null; return fig(who, seed, { L: 'push', R: 'push', run: true, step: legs(b.x), ...o }, [b.x + 0.1, 0.16 + (b.y || 0), b.z - 0.28], { dy: Math.abs(Math.sin(b.x * 2.2)) * 0.02, ...ex }); };
  const push = (a) => { if (a) out.push(a); };
  const moving = (f0, f1) => (f > f0 && f < f1 ? { step: q((f * 0.07) % 1, 2) } : {});
  switch (S.id) {
    case 'hook': case 'fin': push(rider('henri', 4, 0, { expr: S.id === 'fin' ? 'grin' : (f > 112 ? 'laugh' : 'stubborn'), look: 0.7 })); break;
    case 'datum': push(rider('henri', 4, 0, { expr: 'stubborn', look: 0.6 })); push(rider('fav1', 6, 1, { expr: 'grin', look: 0.5 })); push(rider('fav2', 8, 2, { expr: 'smile', look: 0.5 })); push(rider('fav3', 10, 3, { expr: 'grin', look: 0.5 })); push(rider('fav4', 12, 4, { expr: 'smile', look: 0.5 })); push(rider('fav2', 14, 5, { expr: 'grin', look: 0.5 })); break;
    case 'age': push(rider('henri', 4, 0, { expr: f > 236 ? 'grin' : 'smile', look: 0.7 })); break;
    case 'pneus': push(rider('henri', 4, 0, { expr: f > 304 ? 'pained' : 'stubborn', look: 0.4 })); break;
    case 'clous': { push(rider('henri', 4, 0, { expr: 'nervous', look: 0.3 }));
      const fo = fallOver(f, 432, -1, 10), h = hop(f, 428, 0.3, 6);
      if (f < 432) push(rider('fav1', 6, 1, { expr: f > 424 ? 'shock' : 'grin', look: 0.4 }, f >= 428 ? { dy: h.dy } : {}));
      else out.push(fig('fav1', 6, { expr: 'dazed', L: 'flail', R: 'flail', wv: q(f * 0.5, 1), look: 0.5 }, [FAVB(f) + 0.15, 0.1, -0.1], { roll: fo.roll, sy: fo.sy }));
      break; }
    case 'foule': { const hp = f > 515 ? 'head' : 'push';
      push(rider('henri', 4, 0, { expr: f > 515 ? 'pained' : 'shock', ...(f > 515 ? { L: 'head', R: 'head', wv: q(f * 0.5, 1), run: false } : { run: f < 510 }), look: 0.7 }, f > 515 ? tremble(f, 0.012) : {}));
      push(rider('fav1', 6, 1, { expr: f > 515 ? 'nervous' : 'shock', look: 0.6, run: f < 510 })); push(rider('fav2', 8, 2, { expr: 'nervous', look: 0.6, run: f < 510 }));
      const sw = (i, o) => { const k = Math.max(0, Math.sin(f * 0.34 + i * 2)); return fig(['supA', 'supB', 'supC'][i], 30 + i, { expr: f > 480 ? 'stern' : 'stubborn', L: 'hip', R: 'up', holdR: 'stick', look: -0.6, ...o }, SUP[i], { dy: f > 500 ? k * 0.05 : 0, roll: f > 500 ? Math.sin(f * 0.34 + i * 2) * 0.07 : 0 }); };
      for (let i = 0; i < 3; i++) out.push(sw(i, {})); break; }
    case 'commis': { const aim = f >= 628, shot = f >= 640;
      out.push(fig('commissaire', 20, { expr: shot ? 'stern' : 'stubborn', L: 'hip', R: aim ? 'up' : 'reach', holdR: 'pistol', look: 0.6 }, COM, { dy: shot && f < 646 ? 0.04 : 0, roll: shot && f < 648 ? -0.05 : 0 }));
      for (let i = 0; i < 3; i++) { const fl = ramp(f, 644 + i * 4, 700), r = run(f, 644 + i * 4, 4.6, 1.0), dir = i === 1 ? 1 : (i === 0 ? 0.5 : 0.5);
        const pos = f < 644 + i * 4 ? SUP[i] : [SUP[i][0] + 3.2 * fl * (i === 1 ? 1.3 : 0.8), r.bob, SUP[i][2] + (i === 0 ? -1 : 1) * 4.2 * fl];
        out.push(fig(['supA', 'supB', 'supC'][i], 30 + i, f < 644 + i * 4 ? { expr: 'stern', L: 'hip', R: 'up', holdR: 'stick', look: -0.6 } : { expr: 'shock', L: 'head', R: 'head', wv: q(f * 0.5, 1), run: true, step: q(r.step, 2), look: 0.5 }, pos)); }
      const h = CHX(f); const hb = W; push(rider('henri', 4, 0, { expr: f > 650 ? 'nervous' : 'pained', L: 'head', R: 'head', wv: q(f * 0.3, 1), run: false, look: 0.7 }, {})); push(rider('fav1', 6, 1, { expr: 'nervous', look: 0.6, run: f > 665 })); push(rider('fav2', 8, 2, { expr: 'nervous', look: 0.6, run: f > 665 }));
      break; }
    case 'train': { const k = E.smooth(ramp(f, 709, 748)), a1 = [lerp(GX - 4.4, GX - 2.0, k), 0, -3.4], a2 = [lerp(GX - 5.8, GX - 0.7, k), 0, -3.3];
      const up = hop(f, 760, 0.3, 10), boarded = f >= 770;
      const g1 = f < 760 ? 0 : 0.5 * Math.min(1, (f - 764) / 8);
      out.push(fig('fav1', 6, { expr: f < 752 ? 'nervous' : 'grin', L: 'hip', R: 'hip', look: -0.9, ...moving(709, 750) }, a1, { dy: g1 + (f >= 760 && f < 775 ? up.dy : 0), sx: up.sx, sy: up.sy, ...(f < 750 ? { roll: Math.sin(f * 0.4) * 0.03 } : {}) }));
      out.push(fig('fav2', 8, { expr: f < 752 ? 'nervous' : 'smile', L: 'hip', R: 'hip', look: -0.9, ...moving(709, 750) }, a2, { dy: f < 760 ? 0 : 0.4 * Math.min(1, (f - 764) / 8), sy: 1 }));
      out.push(fig('cheminot', 26, { expr: 'squint', L: 'hip', R: 'hip', look: -1 }, [GX + 3.4, 0, -3.2]));
      // Henri passe sur la route, pneus crevés (ses roues sont au premier plan)
      break; }
    case 'voiture': { const c = CAR(f), seat = [c[0] - 0.55, 0.32, 0.2], pre = [CX - 1.5, 0, 1.3], k = E.smooth(ramp(f, 826, 852)), h = hop(f, 836, 0.35, 12);
      out.push(fig('chauffeur', 36, { expr: f > 862 ? 'laugh' : 'smile', L: 'push', R: 'push', look: 0.6 }, [c[0] + 0.45, 0.32, 0.2]));
      const pos = f < 836 ? pre : [lerp(pre[0], c[0] - 0.55, k), lerp(0, 0.32, k) + (f < 852 ? h.dy : 0), lerp(pre[2], 0.2, k)];
      out.push(fig('fav1', 6, { expr: f < 836 ? 'nervous' : (f < 862 ? 'grin' : 'laugh'), L: f < 836 ? 'hip' : 'up', R: 'hip', look: f < 836 ? -0.9 : 0.8 }, pos, f < 836 ? { sx: 1 } : { sx: h.sx, sy: h.sy }));
      out.push(fig('commissaire', 20, { expr: 'squint', L: 'hip', R: 'hip', look: -1 }, [CX - 8.5, 0, -2.2]));
      break; }
    case 'sauf': { const up = f > 950, pen = f > 1010;
      out.push(fig('juge', 40, { expr: up ? (f > 975 ? 'squint' : 'shock') : 'neutral', L: 'hip', R: pen ? 'reach' : 'hip', holdR: pen ? 'paper' : undefined, look: up ? 0 : -0.8 }, JUGE, { dy: up && f < 958 ? 0.04 : 0 })); break; }
    case 'mois': { const sh = f > 1100;
      out.push(fig('juge', 40, { expr: sh ? 'stern' : 'squint', L: 'hip', R: 'reach', holdR: 'paper', look: -0.2 }, [OX, 0, -2.9], tremble(f, 0.006)));
      break; }
    case 'disq': { const cols = ['fav1', 'fav2', 'fav3', 'fav4'];
      cols.forEach((w, i) => { const s0 = 1150 + i * 18, fo = fallOver(f, s0 + 6, i % 2 ? -1 : 1, 10), hit = f >= s0 && f < s0 + 6;
        out.push(fig(w, 6 + i * 2, { expr: f < s0 ? 'grin' : (f < s0 + 6 ? 'shock' : 'dazed'), L: f < s0 ? 'up' : 'head', R: f < s0 ? 'up' : 'head', wv: q(f * 0.5, 1), look: 0.3 }, [OX + FAV[i], 0, 0], f >= s0 + 6 ? { roll: fo.roll, sy: fo.sy } : (f < s0 ? {} : tremble(f, 0.012)))); });
      out.push(fig('juge', 40, { expr: 'stern', L: 'hip', R: ((f - 1146) % 18 < 6 && f > 1146 && f < 1214) ? 'up' : 'reach', holdR: 'tool', look: 0 }, [OX, 0, -3.0], { dy: ((f - 1150) % 18 < 3 && f >= 1150 && f < 1210) ? -0.03 : 0 })); break; }
    case 'passe': { const k = ramp(f, 1285, 1300);
      out.push(fig('henri', 4, { expr: f < 1270 ? 'neutral' : (f < 1300 ? 'shock' : 'laugh'), L: 'hip', R: 'reach', holdR: 'paper', look: 0.5 }, [OX - 0.5, 0, -0.5], f >= 1285 && f < 1297 ? { dy: hop(f, 1285, 0.15, 6).dy } : {}));
      out.push(fig('juge', 40, { expr: 'smile', L: 'hip', R: 'reach', holdR: 'paper', look: -0.5 }, [OX + 0.7, 0, -0.5], {})); break; }
    case 'bras': { 
      push(rider('henri', 4, 0, { expr: 'neutral', look: 0.5 }));
      out.push(fig('fav1', 6, { expr: 'laugh', L: 'up', R: 'up', look: -0.6 }, [FX0 + 3.0, 0, -0.5], { dy: Math.abs(Math.sin(f * 0.3)) * 0.05 }));
      out.push(fig('supA', 30, { expr: 'laugh', L: 'up', R: 'up', look: 0.2 }, [FX0 + 1.0, 0, -3.2], { dy: Math.abs(Math.sin(f * 0.3)) * 0.05 })); out.push(fig('supC', 32, { expr: 'laugh', L: 'up', R: 'hip', look: 0.2 }, [FX0 - 2.5, 0, -3.4], { dy: Math.abs(Math.sin(f * 0.3 + 1)) * 0.05 })); break; }
    case 'jeune': { const h = hop(f, 1428, 0.2, 8);
      out.push(fig('henri', 4, { expr: f < 1428 ? 'smile' : 'laugh', L: 'hip', R: 'hip', holdL: 'flag', look: 0.2 }, [FX0 + 5, 0.62, -1.6], f >= 1428 ? { dy: h.dy, sx: h.sx, sy: h.sy } : {}));
      out.push(fig('supA', 30, { expr: 'laugh', L: 'up', R: 'up', look: 0.2 }, [FX0 + 2.6, 0, -2.4], { dy: Math.abs(Math.sin(f * 0.3)) * 0.05 })); out.push(fig('supC', 32, { expr: 'laugh', L: 'hip', R: 'up', look: 0.2 }, [FX0 + 7.4, 0, -2.4], { dy: Math.abs(Math.sin(f * 0.3 + 1)) * 0.05 })); break; }
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if ((S.id === 'hook') && f >= 100) { const k = ramp(f, 100, 112); out.push(FX('c5' + q(k, 1), labelCard('5e', 130, '#ffd23a', INK, k, -0.06), [HXA(f) + 0.2, 2.45, 0.1], 0.5)); }
  if (S.id === 'datum') { const k = ramp(f, 152, 164); out.push(FX('an' + q(k, 1), labelCard('1904', 120, '#ffd23a', INK, k), [HXA(f) - 1.0, 3.3, -1], 1.2)); }
  if (S.id === 'age' && f >= 232) { const k = ramp(f, 232, 244); out.push(FX('ag' + q(k, 1), labelCard('19 ans', 100, '#ffd23a', INK, k), [HXA(f) + 0.5, 2.45, 0.1], 0.45)); }
  if (S.id === 'clous' && f >= 432 && f < 452) { const t = q((f - 432) / 20, 2); out.push(FX('pp' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [212.3, 0.5, 0.4], 0.7)); }
  if (S.id === 'commis' && f >= 638 && f < 660) { const t = q((f - 638) / 22, 2); out.push(FX('gs' + t, (p) => T.fxBurst(p, t, '#fff08a', 14, 60, 300), [COM[0] + 1.1, 2.1, -0.4], 0.8)); }
  if (S.id === 'sauf' && f >= 970) { const k = ramp(f, 970, 984); out.push(FX('oe' + q(k, 1), labelCard('!', 150, '#ffd23a', '#c8312c', k), [JUGE[0] + 0.62, 2.5, -2.4], 0.4)); }
  if (S.id === 'mois') { const m = ['JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'], i = Math.min(5, Math.floor(Math.max(0, f - 1076) / 9)), k = ramp(f, 1071, 1080); out.push(FX('mo' + i + q(k, 1), labelCard(m[i] + (i === 5 ? ' 1904' : ''), i === 5 ? 76 : 100, i === 5 ? '#ffd23a' : '#ffffff', i === 5 ? '#c8312c' : '#2f56a8', k), [OX + 0.62, 2.4, -2.3], 0.45)); }
  if (S.id === 'disq') { for (let i = 0; i < 4; i++) { const s0 = 1150 + i * 18; if (f >= s0) { const k = ramp(f, s0, s0 + 8); out.push(FX('dq' + i + q(k, 1), labelCard('DISQUALIFIÉ', 52, '#ffffff', '#c8312c', k, -0.18 + i * 0.1), [OX + FAV[i] + 0.1, 3.0, 0.3], 0.5)); } }
    for (let i = 0; i < 4; i++) { const s0 = 1150 + i * 18; if (f >= s0 && f < s0 + 16) { const t = q((f - s0) / 16, 2); out.push(FX('dqb' + i + t, (p) => T.fxBurst(p, t, '#ffd0c0', 10, 40, 200), [OX + FAV[i], 1.5, 0.8], 0.6)); } } }
  if (S.id === 'passe') { const second = f >= 1285, k = ramp(f, 1237, 1252), k2 = ramp(f, 1285, 1296);
    out.push(FX(second ? 'p1' + q(k2, 1) : 'p5' + q(k, 1), second ? labelCard('1er', 150, '#ffd23a', '#2f9a4a', k2) : labelCard('5e', 150, '#ffffff', '#c8312c', k), [OX - 0.5, 2.5, 0.1], 0.45));
    if (f >= 1285 && f < 1305) { const t = q((f - 1285) / 20, 2); out.push(FX('pb' + t, (p) => T.fxBurst(p, t, '#fff08a', 14, 60, 300), [OX - 0.5, 2.7, 0.3], 0.9)); } }
  if (S.id === 'bras' && f >= 1345) { const k = ramp(f, 1345, 1358); out.push(FX('br' + q(k, 1), labelCard('bras baissés', 56, '#ffffff', '#2f56a8', k), [HEN_BRAS(f)[0] + 0.1, 2.55, 0.2], 0.5)); }
  if (S.id === 'jeune') { const k = ramp(f, 1412, 1426); out.push(FX('pj' + q(k, 1), labelCard('19 ans', 100, '#ffd23a', INK, k), [FX0 + 5.1, 3.7, -1.4], 0.55)); }
  if (S.id === 'fin' && f >= 1506) { const k = ramp(f, 1506, 1516) * (1 - ramp(f, 1528, 1537)); out.push(FX('f5' + q(k, 1), labelCard('5e', 130, '#ffd23a', INK, k, -0.06), [HXA(f) + 0.2, 2.45, 0.1], 0.5)); }
  return out;
};
