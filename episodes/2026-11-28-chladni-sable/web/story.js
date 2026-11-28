// « Cet archet dessine dans le sable » (Chladni, Sophie Germain, 1809-1816) — 69,9 s, 30 fps, 2098 images. Cadres calés sur phrases.json (Whisper).
// Lieux (library/chladni.js) : cabinet x=0, salon x=40, Académie x=80, université x=120, chambre x=160, pont x=200. Caméras depuis +z vers -z.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, fallOver, crane, orbit, transition, tremble, fgCard, crowd } from '../motion.js';
import { mood, blendMood } from '../moods.js';
import { ZX, PLATE } from '../library/chladni.js';
export const FPS = 30, TOTAL = 2098, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 163 },        // Cet archet dessine des formes parfaites dans le sable… sans jamais le toucher.
  { id: 'phys', a: 164, b: 228 },      // Un physicien allemand, Ernst Chladni,
  { id: 'saupoudre', a: 229, b: 298 }, // saupoudre de sable une plaque de métal.
  { id: 'archet', a: 299, b: 405 },    // Puis il frotte son bord avec un archet. Le sable saute,
  { id: 'danse', a: 406, b: 519 },     // danse, et se range tout seul en étoile.
  { id: 'notes', a: 520, b: 605 },     // Une autre note, une autre figure.
  { id: 'paris', a: 606, b: 678 },     // En mille huit cent neuf, il montre ça à Paris.
  { id: 'napo', a: 679, b: 722 },      // Napoléon est fasciné.
  { id: 'defi', a: 723, b: 785 },      // Alors l'Académie des sciences lance un défi :
  { id: 'prime', a: 786, b: 877 },     // trois mille francs pour qui expliquera ces dessins.
  { id: 'sauf', a: 878, b: 927 },      // Sauf que personne n'y arrive.
  { id: 'sechent', a: 928, b: 996 },   // Les plus grands savants de France sèchent.
  { id: 'sophie', a: 997, b: 1085 },   // Une seule personne s'y attaque : Sophie Germain.
  { id: 'porte', a: 1086, b: 1192 },   // Une femme, qui n'a même pas le droit d'étudier à l'université.
  { id: 'bougie', a: 1193, b: 1299 },  // Elle apprend les mathématiques seule, chez elle, à la bougie.
  { id: 'echec', a: 1300, b: 1390 },   // Sa première tentative échoue. La deuxième aussi.
  { id: 'refus', a: 1391, b: 1440 },   // Les juges la refusent encore.
  { id: 'refait', a: 1441, b: 1531 },  // Mais elle refait ses calculs, une troisième fois,
  { id: 'lache', a: 1532, b: 1587 },   // et elle ne lâche rien.
  { id: 'remise', a: 1588, b: 1666 },  // En mille huit cent seize, l'Académie lui remet enfin le prix.
  { id: 'premiere', a: 1667, b: 1771 },// C'est la première femme à gagner un prix de l'Académie.
  { id: 'ingen', a: 1772, b: 1876 },   // Sa théorie sur les plaques qui vibrent sert encore aux ingénieurs.
  { id: 'final', a: 1877, b: 1989 },   // Alors la prochaine fois qu'on te dit que tu n'as pas ta place… regarde cet archet :
  { id: 'loop', a: 1990, b: 2097 },    // le sable se range, note après note.  (rejoue l'accroche)
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const hookish = (S) => S.id === 'hook' || S.id === 'loop';
const G = (f) => (f >= 1990 ? f - TOTAL : f);
const { cab: X0, salon: XS, acad: XA, rue: XR, chambre: XC, pont: XP } = ZX;

// ---------- lumière ----------
const MO = (n, o = {}) => mood(n, { exposure: 1.28, gamma: 1.14, el: 58, az: 150, ...o });
export const lightFor = (S, f) => {
  const D = MO('dore'), J = MO('jour'), C = MO('froid', { exposure: 1.35, gamma: 1.2 }), SO = MO('soir', { exposure: 1.4, gamma: 1.25, el: 50 }), L = MO('lampe', { exposure: 1.45, gamma: 1.3 });
  switch (S.id) {
    case 'saupoudre': case 'notes': case 'defi': return J;
    case 'sauf': return blendMood(J, C, ramp(f, 878, 900));
    case 'sechent': return C;
    case 'sophie': return blendMood(C, J, ramp(f, 997, 1030));
    case 'porte': return blendMood(J, SO, ramp(f, 1086, 1110));
    case 'bougie': return blendMood(SO, L, ramp(f, 1193, 1220));
    case 'echec': return blendMood(L, C, ramp(f, 1300, 1318));
    case 'refus': return C;
    case 'refait': return blendMood(C, L, ramp(f, 1441, 1465));
    case 'lache': return blendMood(L, D, ramp(f, 1550, 1587));
    case 'ingen': return MO('jour', { el: 48 });
    default: return D;
  }
};

// ---------- sable et archet ----------
const NG = 2400;
const sandAt = (f) => {
  if (f < 164) { const t = E.smooth(ramp(f, 4, 125)); return { a: 3, b: 0, t, hop: 1 - 0.85 * t + 0.1 }; }
  if (f < 229) return { a: 3, b: 3, t: 0, hop: 0, n: 0 };
  if (f < 299) return { a: 3, b: 3, t: 0, hop: 0, n: Math.round(NG * ramp(f, 232, 288)) };
  if (f < 382) return { a: 3, b: 3, t: 0, hop: 0.45 * ramp(f, 335, 382) };
  if (f < 520) { const t = ramp(f, 388, 508); return { a: 3, b: 0, t, hop: 1 - 0.8 * t + 0.1 }; }
  if (f < 606) { if (f < 566) { const t = ramp(f, 524, 560); return { a: 0, b: 1, t, hop: 0.9 - 0.7 * t }; } const t = ramp(f, 570, 602); return { a: 1, b: 2, t, hop: 0.9 - 0.7 * t }; }
  if (f < 1877) return { a: 2, b: 2, t: 1, hop: f < 723 ? 0.35 : 0 };
  if (f < 2003) return { a: 3, b: 0, t: 0, hop: 0.85, };
  const t = ramp(f, 2006, 2062); return { a: 3, b: 0, t: E.smooth(t), hop: 1 - 0.85 * t + 0.1 };
};
const bowAt = (f) => {
  const S = shotAt(f);
  const salon = f >= 606 && f < 723, cab = f < 164 || (f >= 299 && f < 606) || f >= 1877;
  if (!salon && !cab) return { hide: 1 };
  const g = G(f), u = Math.sin(g * 0.34) * (f >= 299 && f < 345 ? 0.25 : 1);
  return { hide: 0, u, zone: salon ? 'salon' : 'cab' };
};
const worldAt = (f) => ({ sand: sandAt(f), bow: bowAt(f), flame: ramp(f, 1532, 1587), deck: f >= 1772 && f < 1877 ? 1 : 0, coins: 1 });
export { worldAt };

// ---------- lieux ----------
const P_ = (x, y, z) => [x, y, z];
const CHL = [X0 + 0.85, 0, -0.5];                    // Chladni / Sophie du dernier plan, à droite de la plaque
const SA_CH = [XS + 2.7, 0, -0.1], SA_NA = [XS + 0.6, 0, 1.0];
const AC_J = [XA - 0.7, 0, 1.1], AC_S = [XA + 0.85, 0, 1.1];
const PS = [XR - 1.0, 0, 0.5], PP = [XR + 0.7, 0, -0.3];
const WRITE = [XC - 0.4, 0, -0.55];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const mixCam = (a, b, t) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], t)), look: a.look.map((v, i) => lerp(v, b.look[i], t)), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) });
// l'accroche : la plaque remplit le cadre et la caméra glisse sans arrêt ; le même cadre sert à la boucle finale
const hookCam = (f) => { const g = G(f), t = (g + 100) / 263; const A = { pos: [X0 + 1.0, 1.75, 2.5], look: [X0 + 0.42, 1.52, -0.05], fov: 40 }, B = { pos: [X0 + 0.45, 1.65, 2.15], look: [X0 + 0.38, 1.5, 0], fov: 38 };
  const c = mixCam(A, B, E.smooth(clamp(t))); c.pos[0] += 0.05 * Math.sin(g * 0.05); return c; };
const CAMS = {
  phys: [K(164, CHL, { headW: 0.3, yaw: -14, frameY: 0.4 }), K(228, CHL, { headW: 0.34, yaw: -6, frameY: 0.4, low: 8 })],
  saupoudre: [R(229, [X0 + 1.2, 2.3, 1.7], [X0 + 0.3, 1.45, -0.1], 40), R(298, [X0 + 0.8, 2.2, 1.5], [X0 + 0.25, 1.45, -0.1], 38)],
  archet: [R(299, [X0 + 1.7, 1.6, 2.3], [X0 + 0.55, 1.5, -0.1], 38), R(352, [X0 + 1.3, 1.62, 1.7], [X0 + 0.5, 1.5, -0.05], 30), R(405, [X0 + 0.9, 1.6, 2.1], [X0 + 0.35, 1.5, 0], 36)],
  notes: [R(520, [X0 - 0.6, 1.7, 2.4], [X0 + 0.35, 1.5, 0], 38), R(605, [X0 + 1.5, 1.7, 2.4], [X0 + 0.35, 1.5, 0], 38)],
  paris: [K2(606, SA_NA, SA_CH, { headW: 0.22, yaw: 8, frameY: 0.42 }), K2(678, SA_NA, SA_CH, { headW: 0.27, yaw: -4, frameY: 0.42 })],
  napo: [K(679, SA_NA, { headW: 0.3, yaw: 10, low: 16, s: 0.92, frameY: 0.4 }), K(722, SA_NA, { headW: 0.36, yaw: 4, low: 20, s: 0.92, frameY: 0.4 })],
  defi: [K2(723, AC_J, AC_S, { headW: 0.25, yaw: 12, low: 14, frameY: 0.42 }), K2(785, AC_J, AC_S, { headW: 0.29, yaw: 4, low: 16, frameY: 0.42 })],
  prime: [K2(786, [XA + 0.3, 0, 1.0], [XA + 1.5, 0, 1.0], { headW: 0.25, yaw: -18, frameY: 0.42 }), K2(877, [XA + 0.3, 0, 1.0], [XA + 1.5, 0, 1.0], { headW: 0.3, yaw: -6, frameY: 0.42 })],
  sauf: [K2(878, [XA - 0.9, 0, 1.1], [XA + 0.5, 0, 1.1], { headW: 0.25, yaw: 6, dutch: 4, frameY: 0.42 }), K2(927, [XA - 0.9, 0, 1.1], [XA + 0.5, 0, 1.1], { headW: 0.3, yaw: -3, dutch: 5, frameY: 0.42 })],
  sophie: [K(997, [XA - 3.0, 0, 1.2], { headW: 0.3, yaw: 18, low: 10, frameY: 0.4 }), K(1040, [XA - 1.0, 0, 1.2], { headW: 0.3, yaw: 6, low: 14, frameY: 0.4 }), K(1085, [XA - 0.6, 0, 1.2], { headW: 0.34, yaw: 0, low: 18, frameY: 0.4 })],
  porte: [K2(1086, PS, PP, { headW: 0.2, yaw: 8, dutch: 4, frameY: 0.44 }), K2(1192, PS, PP, { headW: 0.26, yaw: -4, dutch: 4, frameY: 0.44 })],
  echec: [K2(1300, [XA - 0.9, 0, 1.1], [XA + 0.5, 0, 1.1], { headW: 0.25, yaw: -8, frameY: 0.42 }), K2(1390, [XA - 0.9, 0, 1.1], [XA + 0.5, 0, 1.1], { headW: 0.3, yaw: 6, frameY: 0.42 })],
  refus: [K2(1391, [XA - 0.2, 0, 1.5], [XA + 0.9, 0, 0.9], { headW: 0.25, yaw: -6, low: 16, frameY: 0.42 }), K2(1440, [XA - 0.2, 0, 1.5], [XA + 0.9, 0, 0.9], { headW: 0.3, yaw: 4, low: 18, frameY: 0.42 })],
  lache: [K(1532, WRITE, { headW: 0.3, yaw: 22, low: 2, sit: true, frameY: 0.44 }), K(1587, WRITE, { headW: 0.38, yaw: 12, low: 4, sit: true, frameY: 0.44 })],
  remise: [K2(1588, [XA - 0.8, 0, 1.2], [XA + 0.7, 0, 1.2], { headW: 0.25, yaw: 10, frameY: 0.42 }), K2(1666, [XA - 0.8, 0, 1.2], [XA + 0.7, 0, 1.2], { headW: 0.3, yaw: -6, frameY: 0.42 })],
  final: [R(1877, [X0 + 0.75, 1.7, 4.5], [X0 + 0.4, 1.55, -0.2], 40), R(1989, [X0 + 0.7, 1.7, 3.5], [X0 + 0.4, 1.52, -0.1], 40)],
};
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'loop': return hookCam(f);
    case 'saupoudre': return camFromKeys(CAMS.saupoudre, f);
    case 'archet': return shake(camFromKeys(CAMS.archet, f), f, 382, 0.025, 20);
    case 'danse': return crane([X0 + 0.35, 1.3, 0], f, 406, 114, { from: { r: 2.8, h: 2.4, yaw: 28, lookUp: 0.2 }, to: { r: 2.5, h: 1.6, yaw: -14, lookUp: 0.2 }, fov: 40 });
    case 'notes': return camFromKeys(CAMS.notes, f);
    case 'paris': return camFromKeys(CAMS.paris, f);
    case 'napo': return camFromKeys(CAMS.napo, f);
    case 'defi': return camFromKeys(CAMS.defi, f);
    case 'prime': return camFromKeys(CAMS.prime, f);
    case 'sauf': return shake(camFromKeys(CAMS.sauf, f), f, 878, 0.08, 14);
    case 'sechent': return crane([XA - 0.2, 0, 0.8], f, 928, 68, { from: { r: 9, h: 4.2, yaw: -22, lookUp: 1.0 }, to: { r: 5.2, h: 1.7, yaw: 8, lookUp: 1.3 } });
    case 'sophie': return camFromKeys(CAMS.sophie, f);
    case 'porte': return camFromKeys(CAMS.porte, f);
    case 'bougie': return f < 1262 ? crane([XC - 0.4, 0, 0.2], f, 1193, 69, { from: { r: 8, h: 3.2, yaw: 24, lookUp: 1.0 }, to: { r: 3.6, h: 1.4, yaw: -8, lookUp: 1.15 } })
      : camFromKeys([R(1262, [XC + 1.5, 1.45, 1.9], [XC + 0.5, 1.2, 0.3], 36), R(1299, [XC + 1.0, 1.32, 1.3], [XC + 0.6, 1.22, 0.35], 26)], f);
    case 'echec': return camFromKeys(CAMS.echec, f);
    case 'refus': return camFromKeys(CAMS.refus, f);
    case 'refait': return crane([XC - 0.4, 0, -0.3], f, 1441, 90, { from: { r: 3.2, h: 1.5, yaw: -26, lookUp: 1.25 }, to: { r: 4.8, h: 2.6, yaw: 12, lookUp: 1.1 } });
    case 'lache': return camFromKeys(CAMS.lache, f);
    case 'remise': return camFromKeys(CAMS.remise, f);
    case 'premiere': return orbit([XA, 0, 1.2], f, 1667, { r: 3.6, h: 1.55, speed: 10, start: -22, lookUp: 1.55 });
    case 'ingen': return crane([XP - 0.3, 0.4, 0.5], f, 1772, 70, { from: { r: 16, h: 6.5, yaw: -28, lookUp: 0.6 }, to: { r: 4.2, h: 1.7, yaw: 8, lookUp: 1.4 } });
    case 'final': return camFromKeys(CAMS.final, f);
  }
  return hookCam(f);
};
const TR = [{ a: 164, type: 'whip', dir: 1 }, { a: 229, type: 'push' }, { a: 606, type: 'whip', dir: 1 }, { a: 723, type: 'whip', dir: -1 }, { a: 878, type: 'push' }, { a: 1086, type: 'whip', dir: 1 }, { a: 1193, type: 'drop' },
  { a: 1300, type: 'whip', dir: -1 }, { a: 1441, type: 'whip', dir: 1 }, { a: 1588, type: 'push' }, { a: 1772, type: 'rise' }, { a: 1877, type: 'drop' }, { a: 1990, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => {
  const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]), S = shotAt(f);
  return { focus: d, cinf: hookish(S) || S.id === 'archet' || S.id === 'saupoudre' ? 7 : 9, near: S.id === 'prime' || S.id === 'bougie' ? 3 : undefined };
};

// ---------- effets 3D ----------
const WIN = (x0) => [-5.6, 0, 5.6].map((x) => ({ at: [x0 + x, 3.6, -3.6], yaw: 0, pitch: 0.5, len: 9, r: 1.3, col: '#ffe6a0', a: 0.22 }));
const sprinkle = [229, 241, 253, 265, 277].map((f0) => ({ at: [X0 + 0.0, 2.0, 0.55], f0, n: 10, power: 0.22, col: '#ffe39a' }));
export const envAt = (f) => {
  const S = shotAt(f), o = {};
  o.motes = S.id === 'ingen' ? 0.3 : 1;
  if (['hook', 'loop', 'phys', 'archet', 'danse', 'notes', 'final', 'saupoudre'].includes(S.id)) o.beams = WIN(X0);
  if (S.id === 'paris' || S.id === 'napo') o.beams = WIN(XS).slice(0, 2);
  if (S.id === 'saupoudre') o.spray = sprinkle;
  if (S.id === 'prime') o.sparks = [{ at: [XA + 1.9, 1.5, -1.1], f0: 800, f1: 877, rate: 9, col: '#ffd23a', speed: 0.8, size: 0.35 }];
  if (S.id === 'sechent') o.spray = [940, 956, 972, 986].map((f0, i) => ({ at: [XA - 1.4 + i * 0.9, 2.0, 0.9], f0, n: 14, power: 0.8, col: '#f4ecd8' }));
  if (S.id === 'echec') o.spray = [{ at: [XA - 0.2, 1.7, 1.0], f0: 1316, n: 14, power: 0.7, col: '#f4ecd8' }, { at: [XA - 0.2, 1.7, 1.0], f0: 1362, n: 18, power: 0.8, col: '#f4ecd8' }];
  if (S.id === 'bougie' || S.id === 'refait' || S.id === 'lache') { o.smoke = [{ at: [XC + 0.6, 1.3, 0.35], f0: 1193, f1: 1587, rate: 3, size: 0.12, col: '#d8d0c0', rise: 0.4 }]; o.motes = 1; }
  if (S.id === 'remise' || S.id === 'premiere') o.sparks = [{ at: [XA, 3.0, 0.2], f0: 1620, f1: 1771, rate: 16, col: '#ffd23a', speed: 1.4, size: 0.45 }];
  if (S.id === 'sophie' || S.id === 'sauf') o.beams = [-7, 0, 7].map((x) => ({ at: [XA + x, 3.6, -3.6], yaw: 0, pitch: 0.5, len: 9, r: 1.3, col: '#cfe0ff', a: 0.18 }));
  return o;
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.chladni = { tunic: '#e0a81c', coat: true, skin: '#f3d3b4', hair: '#9a9488', moustache: '#9a9488', brows: '#7a746a', lapels: '#a87810', buttons: true, stout: true, cuffs: '#f4ecd8' };
  O.sophie = { tunic: '#14b5ae', dress: '#14b5ae', skin: '#f1c9a4', hair: '#5a3a26', bun: '#5a3a26', brows: '#3a2418', belt: true, buttons: true, cuffs: '#f4ecd8' };
  O.napo = { tunic: '#2f6a4a', coat: true, skin: '#f1d0b0', hat: 'bicorne', hatCol: '#1d1a24', brows: '#4a3020', lapels: '#f4ecd8', buttons: true, epaulettes: '#d9a845', medals: 1, stout: true };
  O.juge = { tunic: '#7a1f2e', skin: '#e8b890', hat: 'toque', hatCol: '#1d1a24', hair: '#f4f1ea', brows: '#f4f1ea', moustache: '#f4f1ea', lapels: '#f4ecd8', medals: 2, sash: '#2a4a8a', stout: true };
  O.juge2 = { tunic: '#5a2a6a', skin: '#b57a52', hat: 'toque', hatCol: '#1d1a24', hair: '#e8e4dc', brows: '#e8e4dc', beard: '#e8e4dc', lapels: '#f4ecd8', medals: 1 };
  O.savA = { tunic: '#2f7fd8', skin: '#b57a52', hair: '#1e1714', moustache: '#1e1714', brows: '#1e1714', glasses: true, thin: true, coat: true, lapels: '#1f5aa0' };
  O.savB = { tunic: '#7cb84e', skin: '#f3d3b4', hair: '#f4f1ea', beard: '#f4f1ea', brows: '#f4f1ea', glasses: true, stout: true, hat: 'tophat' };
  O.savC = { tunic: '#e8442e', skin: '#8a5a3a', hair: '#1e1714', moustache: '#1e1714', brows: '#1e1714', coat: true, buttons: true, legs: 1.1 };
  O.portier = { tunic: '#4a4a6a', skin: '#e8b890', hat: 'kepi', hatCol: '#2a2a4a', moustache: '#3a2a22', brows: '#3a2a22', buttons: true, epaulettes: '#d9a845', stout: true };
  O.ingen = { tunic: '#ff8a1c', skin: '#e8b890', hat: 'hardhat', hatCol: '#f4d23a', moustache: '#4a2e1e', brows: '#4a2e1e', belt: true, buttons: true };
  O.cA = { tunic: '#c25a7a', dress: '#c25a7a', skin: '#f3d3b4', hair: '#4a2a1e', bun: '#4a2a1e', brows: '#3a2418' };
  O.cB = { tunic: '#8a5ab8', skin: '#e8b890', hair: '#1e1714', coat: true, moustache: '#1e1714', brows: '#1e1714' };
  O.cC = { tunic: '#2f7fd8', skin: '#b57a52', hair: '#1e1714', dress: '#d9a845', bun: '#1e1714', brows: '#1e1714' };
  O.cD = { tunic: '#d9a441', skin: '#f3d3b4', hair: '#c9902a', coat: true, brows: '#8a5a1e', stout: true };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520);
  panel(g, 20, 410, 560, 220, bg); TXT(g, txt, 300, 520 + size * 0.36, size, fill, 0); g.restore(); };
const crossCard = (k = 1) => (p) => { const g = p.g; g.save(); const s = 0.4 + 0.6 * E.back(clamp(k)); g.translate(300, 520); g.rotate(-0.1); g.scale(s, s); g.translate(-300, -520); panel(g, 130, 330, 340, 380, '#f7f3ea');
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 70; g.beginPath(); g.moveTo(200, 400); g.lineTo(400, 640); g.moveTo(400, 400); g.lineTo(200, 640); g.stroke();
  g.strokeStyle = '#e8352e'; g.lineWidth = 44; g.beginPath(); g.moveTo(200, 400); g.lineTo(400, 640); g.moveTo(400, 400); g.lineTo(200, 640); g.stroke(); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s * 1.9, z: pos[2], s: s * 1.9, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const legsF = (x) => q((x * 1.1) % 1, 2);
export const actorsAt = (f, T) => {
  const S = shotAt(f), g = G(f), out = [], ff = hookish(S) ? g : f;
  const tint = f >= 1193 && f < 1587 ? '#ffe2c4' : '#fff0d8';
  const fig = (who, seed, o, pos, ex = {}) => R_(T, who, life(ff, seed, o), pos, { tint, ...ex });
  const cam = camAt(f);
  const bounce = (k, h = 0.025) => ({ dy: Math.abs(Math.sin(f * 0.33 + k)) * h });
  switch (S.id) {
    case 'hook': case 'loop': {
      const late = S.id === 'loop';
      out.push(fig(late ? 'sophie' : 'chladni', 4, { expr: late ? 'proud' : g < 60 ? 'grin' : 'proud', L: 'hip', R: 'reach', look: -0.9, headTilt: late ? 5 : 0 }, CHL));
      break; }
    case 'phys': {
      out.push(fig('chladni', 4, { expr: f < 200 ? 'proud' : 'grin', L: 'hip', R: f < 195 ? 'hip' : 'show', look: -0.4, headTilt: 4 }, CHL, f >= 195 ? hop(f, 195, 0.04, 6) : {}));
      break; }
    case 'saupoudre': {
      out.push(fig('chladni', 4, { expr: 'grin', L: 'hip', R: 'up', look: -0.9 }, CHL));
      break; }
    case 'archet': {
      out.push(fig('chladni', 4, { expr: f < 382 ? 'determined' : 'grin', L: 'hip', R: 'reach', look: -0.9, wv: q(Math.sin(f * 0.34) * 0.3, 2) }, CHL, f >= 382 ? hop(f, 382, 0.06, 8) : {}));
      break; }
    case 'danse': {
      out.push(fig('chladni', 4, { expr: 'laugh', L: 'up', R: 'reach', look: -0.9 }, CHL, bounce(0, 0.03)));
      break; }
    case 'notes': {
      out.push(fig('chladni', 4, { expr: f < 566 ? 'smug' : 'proud', L: 'hip', R: 'reach', look: -0.9 }, CHL, bounce(0, 0.02)));
      break; }
    case 'paris': {
      out.push(fig('chladni', 4, { expr: 'proud', L: 'hip', R: 'reach', look: -0.9 }, SA_CH));
      out.push(fig('napo', 12, { expr: f < 650 ? 'squint' : 'shock', L: 'hip', R: 'chin', look: 0.9 }, SA_NA, { s: 0.92 }));
      out.push(...crowd(T, f, { center: [XS - 0.5, 0, -1.6], n: 9, w: 9, d: 1.2, outfits: ['cA', 'cB', 'cC', 'cD'], exprs: ['shock', 'smile', 'grin', 'smile'], seed: 2, cheer: 0.1, arms: ['hang', 'wave', 'hip', 'hang'] }));
      break; }
    case 'napo': {
      out.push(fig('napo', 12, { expr: f < 700 ? 'shock' : 'laugh', L: 'up', R: 'point', look: 0.9 }, SA_NA, { s: 0.92, ...(f >= 684 ? hop(f, 684, 0.07, 8) : {}) }));
      out.push(...crowd(T, f, { center: [XS + 0.4, 0, -1.8], n: 8, w: 8, d: 1.0, outfits: ['cC', 'cD', 'cA', 'cB'], exprs: ['shock', 'laugh', 'grin'], seed: 4, cheer: 0.5, arms: ['up', 'wave', 'up'] }));
      break; }
    case 'defi': {
      const ann = f >= 760;
      out.push(fig('juge', 14, { expr: ann ? 'stern' : 'deadpan', L: 'hip', R: ann ? 'point' : 'hip', holdL: 'paper', look: 0.9 }, AC_J));
      out.push(fig('savA', 16, { expr: ann ? 'shock' : 'suspicious', L: 'hip', R: 'chin', look: -0.9 }, AC_S));
      break; }
    case 'prime': {
      out.push(fig('juge', 14, { expr: f < 820 ? 'smug' : 'proud', L: 'hip', R: 'point', look: 0.9 }, [XA + 0.3, 0, 1.0]));
      out.push(fig('savB', 18, { expr: 'shock', L: 'up', R: 'hip', look: -0.9 }, [XA + 1.5, 0, 1.0], f >= 806 ? hop(f, 806, 0.06, 8) : {}));
      out.push(fgCard(cam, T.fgProp('coin'), { key: 'coin', side: -1, dist: 0.85, drop: 0.6, s: 0.4 }));
      break; }
    case 'sauf': {
      const tr = tremble(f, 0.015, 2);
      out.push(fig('savA', 16, { expr: 'nervous', L: 'head', R: 'head', look: 0.9 }, [XA - 0.9, 0, 1.1], tr));
      out.push(fig('savB', 18, { expr: 'pained', L: 'hip', R: 'chin', look: -0.9 }, [XA + 0.5, 0, 1.1], tremble(f, 0.012, 5)));
      out.push(fig('savC', 20, { expr: 'shock', L: 'shrug', R: 'shrug', look: -0.5 }, [XA + 1.7, 0, 0.6], tremble(f, 0.01, 7)));
      break; }
    case 'sechent': {
      const fl = fallOver(f, 950, 1, 12);
      out.push(fig('savA', 16, { expr: 'nervous', L: 'head', R: 'head', look: 0.9 }, [XA - 1.5, 0, 1.0], tremble(f, 0.015, 2)));
      out.push(fig('savB', 18, { expr: f < 950 ? 'pained' : 'dazed', L: 'flail', R: 'flail', wv: q(f * 0.3, 1), look: -0.9 }, [XA - 0.1, 0, 1.0], f >= 950 ? fl : tremble(f, 0.012, 5)));
      out.push(fig('savC', 20, { expr: 'nervous', L: 'hip', R: 'head', look: -0.5 }, [XA + 1.4, 0, 0.8], tremble(f, 0.012, 7)));
      out.push(fig('juge2', 22, { expr: 'deadpan', L: 'hip', R: 'chin', look: 0.5 }, [XA + 2.6, 0, 0.3]));
      break; }
    case 'sophie': {
      const x = lerp(XA - 3.6, XA - 0.7, E.smooth(ramp(f, 997, 1052))), walking = f < 1052;
      out.push(fig('sophie', 6, { expr: f < 1042 ? 'determined' : 'proud', L: 'hip', R: f < 1042 ? 'hip' : 'fist', step: walking ? legsF(x * 1.6) : 0, look: 0.5, headTilt: f >= 1052 ? 5 : 0 }, [x, 0, 1.2], walking ? { dy: Math.abs(Math.sin(x * 5)) * 0.015 } : {}));
      out.push(fig('savA', 16, { expr: 'shock', L: 'hip', R: 'hip', look: 0.9 }, [XA + 1.2, 0, 0.5]));
      out.push(fig('savB', 18, { expr: 'suspicious', L: 'hip', R: 'chin', look: 0.9 }, [XA + 2.6, 0, 0.1]));
      break; }
    case 'porte': {
      const hold = f >= 1112;
      out.push(fig('sophie', 6, { expr: f < 1112 ? 'determined' : 'pained', L: 'hip', R: 'hip', holdL: 'letter', look: 0.9 }, PS));
      out.push(fig('portier', 24, { expr: 'deadpan', L: 'cross', R: hold ? 'point' : 'cross', look: -0.9, headTilt: -4 }, PP));
      break; }
    case 'bougie': {
      const k = f >= 1262;
      out.push(fig('sophie', 6, { expr: k ? 'determined' : 'squint', L: 'hip', R: 'tool', sit: true, seat: false, look: 0.2, wv: q(Math.sin(f * 0.5) * 0.4, 2) }, WRITE));
      break; }
    case 'echec': {
      const second = f >= 1352;
      out.push(fig('sophie', 6, { expr: f < 1318 ? 'determined' : f < 1352 ? 'pained' : f < 1362 ? 'determined' : 'pained', L: 'hip', R: 'show', holdR: 'paper', look: 0.9 }, [XA - 0.9, 0, 1.1], f >= 1318 && !second ? tremble(f, 0.008, 2) : {}));
      out.push(fig('juge', 14, { expr: 'deadpan', L: 'hip', R: f >= 1312 ? 'point' : 'hip', look: -0.9, headTilt: -5 }, [XA + 0.5, 0, 1.1]));
      break; }
    case 'refus': {
      out.push(fig('juge', 14, { expr: 'stern', L: 'cross', R: 'cross', look: -0.4, headTilt: f % 40 < 20 ? -6 : 6 }, [XA + 0.9, 0, 0.9]));
      out.push(fig('juge2', 22, { expr: 'deadpan', L: 'hip', R: 'hip', look: -0.4, headTilt: f % 36 < 18 ? 6 : -6 }, [XA + 2.2, 0, 0.3]));
      out.push(fig('sophie', 6, { expr: 'pained', L: 'hip', R: 'hip', look: 0.6, headTilt: -8 }, [XA - 0.2, 0, 1.5]));
      break; }
    case 'refait': {
      out.push(fig('sophie', 6, { expr: f < 1489 ? 'determined' : 'stubborn', L: 'hip', R: 'tool', sit: true, seat: false, look: 0.2, wv: q(Math.sin(f * 0.7) * 0.5, 2) }, WRITE, tremble(f, 0.004, 3)));
      break; }
    case 'lache': {
      out.push(fig('sophie', 6, { expr: 'stubborn', L: 'hip', R: 'tool', sit: true, seat: false, look: 0.2, wv: q(Math.sin(f * 0.8) * 0.5, 2) }, WRITE));
      out.push(fgCard(cam, T.fgProp('lantern'), { key: 'lant', side: 1, dist: 0.9, drop: 0.7, s: 0.38 }));
      break; }
    case 'remise': {
      out.push(fig('sophie', 6, { expr: f < 1628 ? 'shock' : 'proud', L: 'hip', R: f >= 1628 ? 'reach' : 'hip', look: 0.9 }, [XA - 0.8, 0, 1.2]));
      out.push(fig('juge', 14, { expr: f < 1628 ? 'stern' : 'smile', L: 'hip', R: f >= 1628 ? 'show' : 'hip', holdR: 'coin', look: -0.9 }, [XA + 0.7, 0, 1.2]));
      out.push(...crowd(T, f, { center: [XA, 0, -1.9], n: 10, w: 9, d: 1.2, outfits: ['cA', 'cB', 'cC', 'cD', 'savA', 'savB'], exprs: ['smile', 'grin', 'laugh'], seed: 6, cheer: 0.2, arms: ['hang', 'wave', 'up'] }));
      break; }
    case 'premiere': {
      out.push(fig('sophie', 6, { expr: 'laugh', L: 'up', R: 'up', holdR: 'coin', look: 0.1, headTilt: 5 }, [XA, 0, 1.2], hop(f, 1667 + ((f - 1667) % 34 < 14 ? 0 : 20), 0.12, 12)));
      out.push(...crowd(T, f, { center: [XA, 0, -0.6], n: 14, w: 9, d: 2.2, outfits: ['cA', 'cB', 'cC', 'cD', 'savA', 'savB', 'savC', 'juge2'], exprs: ['laugh', 'grin', 'smile'], seed: 8, cheer: 0.9, arms: ['up', 'wave', 'up', 'up'] }));
      break; }
    case 'ingen': {
      const k = ramp(f, 1830, 1876);
      out.push(fig('ingen', 26, { expr: 'proud', L: 'hip', R: 'show', holdR: 'plan', look: -0.5, headTilt: 4 }, [XP - 1.0, 0.38, 0.5], { ...tremble(f, 0.004, 2) }));
      out.push(fig('ingen', 28, { expr: 'grin', L: 'point', R: 'hip', look: 0.5, seed: 9 }, [XP + 1.2, 0.38, 0.2]));
      break; }
    case 'final': {
      out.push(fig('sophie', 6, { expr: f < 1940 ? 'proud' : 'grin', L: 'hip', R: f < 1930 ? 'point' : 'reach', look: f < 1930 ? 0.2 : -0.9, headTilt: 5 }, CHL, f >= 1925 ? hop(f, 1925, 0.05, 8) : {}));
      break; }
  }
  return out;
};

// ---------- effets 2D (cartes, chiffres) ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const lab = (id, a, b, txt, size, fill, pos, s, rot = 0) => { if (f >= a && f < b) { const k = ramp(f, a, a + 12); out.push(FX(id + q(k, 1), labelCard(txt, size, fill, INK, k, rot), pos, s)); } };
  lab('nm', 195, 240, 'ERNST CHLADNI', 62, '#ffd23a', [CHL[0] + 0.1, 2.85, CHL[2]], 0.36, -0.03);
  lab('an', 606, 700, '1809', 118, '#ffd23a', [XS + 2.0, 3.0, 1.0], 0.4, -0.04);
  lab('fr', 800, 877, '3 000 F', 108, '#ffd23a', [XA + 0.9, 2.75, 0.9], 0.4, 0.03);
  lab('sg', 1044, 1100, 'SOPHIE GERMAIN', 54, '#ffffff', [XA - 0.7, 2.85, 1.2], 0.38, -0.03);
  lab('t3', 1489, 1560, '3e FOIS', 100, '#ffd23a', [XC + 0.5, 2.5, 0.2], 0.34, 0.04);
  lab('an2', 1590, 1666, '1816', 118, '#ffd23a', [XA - 0.05, 2.85, 1.2], 0.42, -0.03);
  if (S.id === 'echec') for (const [a, p, s] of [[1318, [XA + 0.3, 2.6, 1.0], 0.4], [1362, [XA + 0.3, 2.6, 1.0], 0.5]]) if (f >= a && f < a + 38) { const k = ramp(f, a, a + 8); out.push(FX('x' + a + q(k, 1), crossCard(k), p, s)); }
  return out;
};
