// Channel art for "Savètu". f0 = banner (render at SIZE=2560x1440), f1 = avatar close-up (SIZE=1080x1080).
import { M as E, camFromKeys, idle, blinkAt, q } from '../motion.js';
export const FPS = 30, TOTAL = 2, DECK = 0;
export const SHOTS = [{ id: 'banner', a: 0, b: 0, light: 'midi' }, { id: 'logo', a: 1, b: 1, light: 'midi' }];
export const shotAt = (f) => SHOTS[Math.min(1, f)];
const LIGHTS = {
  midi: { az: 160, el: 62, sky: '#c9d8f2', ground: '#b06a3c', hemi: 1.2, sun: '#fff1d6', sunI: 2.8, fog: '#f3d2a6', fogNear: 120, fogFar: 900,
    skyTop: '#3f86d8', skyHor: '#f6dcb0', sat: 1.16, gain: '#fff6ea', vig: 0.12, shadowExt: 22 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
const CAMS = {
  banner: [{ f: 0, pos: [0, 1.15, -2], look: [0, 1.15, -20], fov: 26 }, { f: 1, pos: [0, 1.15, -2], look: [0, 1.15, -20], fov: 26 }],
  logo: [{ f: 1, pos: [0.1, 1.55, -17.5], look: [0, 1.45, -20], fov: 30 }, { f: 2, pos: [0.1, 1.55, -17.5], look: [0, 1.45, -20], fov: 30 }],
};
export const camAt = (f) => camFromKeys(CAMS[shotAt(f).id], f, {});
export const dofAt = (f) => (shotAt(f).id === 'logo' ? { focus: 2.5, cinf: 18 } : { focus: 18, cinf: 4 });
export const worldAt = () => ({ buckle: 0, heat: 0, glow: 0 });
export const setupCast = (T) => {
  T.OUTFITS.savetu = { tunic: '#2f6db5', skin: '#f2c39a', cap: '#e8582a' };
  T.OUTFITS.poseur = { tunic: '#3f5f8a', skin: '#d9a27a', cap: '#5a4a3a', moustache: '#3b2a20' };
  T.OUTFITS.chef = { tunic: '#6b4a34', skin: '#efc39a', cap: '#2e2e36', moustache: '#2b211c', stout: true };
  T.OUTFITS.ouvA = { tunic: '#f07a1a', skin: '#c98b62', cap: '#f4f4f4' };
  T.OUTFITS.ouvB = { tunic: '#f07a1a', skin: '#f0c49e', cap: '#f2d23a', moustache: '#6b3a1f' };
};
const R = (T, who, o, pos) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2] });
const life = (seed, o) => ({ seed, blink: 0, bob: 0, tilt: 0, headTilt: 0, ...o });
export const actorsAt = (f, T) => {
  if (shotAt(f).id === 'logo') return [R(T, 'savetu', life(5, { expr: 'shock', L: 'cheek', R: 'cheek' }), [0, 0, -20])];
  return [
    R(T, 'poseur', life(31, { expr: 'grin', L: 'wave', R: 'hang', look: 0.3 }), [-4.15, 0, -20.2]),
    R(T, 'ouvA', life(41, { expr: 'shock', L: 'cheek', R: 'cheek' }), [-3.1, 0, -19.7]),
    R(T, 'savetu', life(5, { expr: 'laugh', L: 'point', R: 'hip', look: -0.4 }), [3.1, 0, -19.7]),
    R(T, 'chef', life(32, { expr: 'squint', L: 'hip', R: 'temple', look: -0.3 }), [4.15, 0, -20.2]),
  ];
};
export const fxAt = () => [];
