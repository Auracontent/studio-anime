// Channel art for Pourkoipa. f0 = YouTube banner (render at SIZE=2560x1440, then brand/make_brand.py adds the text).
// Kipa and the heroes of our best videos, in the sunny village set (Facteur Cheval's palace behind them).
// YouTube shows only the central 1546x423 band on phones: Kipa and the main heroes stand inside it, extras outside.
import { camFromKeys } from '../motion.js';
import { mood } from '../moods.js';
export const FPS = 30, TOTAL = 1, DECK = 0, LOOP = false, MASCOT = false, MARKS = false;
export const SHOTS = [{ id: 'banner', a: 0, b: 0 }];
export const shotAt = () => SHOTS[0];
const JOUR = mood('jour', { exposure: 1.12, el: 48 });
export const lightFor = () => JOUR;
// camera 15.5 m from the road, eye height 1.0: the road (y 0) lands at ~y 920 px, heads at ~y 560, inside the safe band (508-931)
const CAM = [{ f: 0, pos: [0, 1.0, 12.5], look: [0, 1.0, -3], fov: 26 }, { f: 1, pos: [0, 1.0, 12.5], look: [0, 1.0, -3], fov: 26 }];
export const camAt = (f) => camFromKeys(CAM, f, {});
export const dofAt = () => ({ focus: 15.5, cinf: 9 });
export const worldAt = () => ({ pal: 0.12, stone: { vis: false }, barrow: { vis: false }, pile: 0, road: null, signA: 0, signB: 0, win: 0, plaque: 0 });
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.foucault = { tunic: '#8a1f3a', coat: true, skin: '#f3d3b4', hat: 'tophat', hatCol: '#2a2230', moustache: '#5a3a26', brows: '#5a3a26', lapels: true };
  O.mineur = { tunic: '#ff7a1a', skin: '#d9a070', hat: 'minerH', hatCol: '#f2c230', moustache: '#3a2418', brows: '#3a2418' };
  O.cheval = { tunic: '#2f5aa8', skin: '#e2b088', hat: 'kepi', hatCol: '#26407e', hatBand: '#c8312c', moustache: '#4a2e1c', brows: '#3a2418', strap: '#7a4a28', stout: true };
  O.therese = { tunic: '#6a2a7a', dress: '#8a2f8a', skin: '#f3cfae', hat: 'chapeauplume', hatCol: '#5a2a6a', hatBand: '#e8c24a', brows: '#3a2418' };
  O.mai = { tunic: '#e2a62a', skin: '#e2b684', cap: '#14b8c4', hair: '#1a1411', brows: '#1a1411', belt: '#6a3a22', cuffs: '#c8312c' };
  O.banquier = { tunic: '#d9a020', skin: '#f0c8a0', hat: 'tophat', moustache: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.assistant = { tunic: '#18b8d8', skin: '#c9966a', hair: '#2a1e1a', moustache: '#2a1e1a', brows: '#2a1e1a', scarf: '#f4ecd8' };
};
const life = (seed, o) => ({ seed, blink: 0, bob: 0, tilt: 0, headTilt: 0, ...o });
const R = (T, who, o, pos, s = 1) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], s });
export const actorsAt = (f, T) => [
  // outside the phone band (seen on computers and TVs)
  R(T, 'banquier', life(61, { expr: 'shock', L: 'cheek', R: 'cheek' }), [-6.0, 0, -3.4]),
  R(T, 'therese', life(52, { expr: 'sly', L: 'show', holdL: 'letter', R: 'hip', look: 0.4 }), [-4.7, 0, -3.1]),
  R(T, 'mai', life(71, { expr: 'proud', L: 'fist', R: 'hip', look: -0.3, headTilt: -4 }), [4.7, 0, -3.1]),
  R(T, 'assistant', life(81, { expr: 'laugh', L: 'wave', R: 'hang', look: -0.5 }), [6.0, 0, -3.4]),
  // inside the band: left pair, the promise text in the middle, Kipa and the postman on the right
  R(T, 'mineur', life(41, { expr: 'shock', L: 'up', R: 'cheek', look: 0.5 }), [-3.1, 0, -3.0]),
  R(T, 'foucault', life(31, { expr: 'smug', L: 'point', R: 'hip', look: 0.6, headTilt: -3 }), [-2.05, 0, -2.7]),
  { key: 'kipa', draw: (p) => T.mascot(p, { wv: 0.9, expr: 'grin', look: -0.4 }), x: 2.05, y: 0, z: -2.6, s: 1.0 },
  R(T, 'cheval', life(21, { expr: 'determined', L: 'carry', holdL: 'tool', R: 'hip', look: -0.5 }), [3.1, 0, -3.0]),
];
export const fxAt = () => [];
