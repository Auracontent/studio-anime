// Cast-library demo (not an episode): each archetype of engine/roman.js in turn, cycling through the new expressions,
// then a line-up of all of them. Stills (one per archetype + line-up):
//   node tools/render.mjs episodes/_demo-cast /tmp/cast "10,50,90,130,170,210,250,290,330,370,410"
import { M as E, frameOn, frameTwo, ramp, idle, blinkAt } from '../motion.js';
import { mood } from '../moods.js';
export const FPS = 30, TOTAL = 450, DECK = 0;
const ARC = ['arcCurieuse', 'arcSceptique', 'arcEnthousiaste', 'arcMaladroit', 'arcExpert', 'arcAntagoniste', 'arcChef', 'arcParisien'];
const FACES = ['skeptical', 'awe', 'worried', 'embarrassed', 'excited', 'thinking', 'fedup', 'eureka'];
const POSES = [['hip', 'wave'], ['chin', 'hip'], ['fist', 'up'], ['shrug', 'shrug'], ['show', 'hang'], ['hip', 'point'], ['hip', 'hang'], ['salute', 'hip']];
const HERO = [0.4, 0, -1.2];
const SEG = 40;                                    // frames per archetype (8 x 40 = 320), then 130 frames of line-up
export const SHOTS = [...ARC.map((a, i) => ({ id: a, a: i * SEG, b: i * SEG + SEG - 1, i })), { id: 'lineup', a: 320, b: 449 }];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const lightFor = () => mood('jour');
export const camAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'lineup') return frameOn([0.4, 0, -2.2], { headW: 0.12, yaw: 0 });
  return frameOn(HERO, { headW: 0.32, yaw: -8 + 10 * E.smooth(ramp(f, S.a, S.b)) });
};
export const dofAt = (f) => ({ focus: camAt(f).dist || 5, cinf: 5 });
export const worldAt = () => ({ pal: 0.6 });
export const setupCast = () => {};                 // archetypes live in engine/roman.js (OUTFITS.arc*)
const life = (f, seed) => { const i = idle(f, seed); return { bob: Math.round(i.bob * 1000) / 1000, tilt: Math.round(i.tilt * 4) / 4, headTilt: Math.round(i.headTilt * 4) / 4, blink: blinkAt(f, seed) }; };
const R_ = (T, who, o, pos) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2] });
export const actorsAt = (f, T) => {
  const S = shotAt(f);
  if (S.id === 'lineup') return ARC.map((a, i) => R_(T, a, { expr: FACES[(i + Math.floor((f - 320) / 16)) % FACES.length], L: 'hip', R: 'hang', look: 0, ...life(f, i + 2) }, [(i - 3.5) * 1.15, 0, -2.2]));
  const k = Math.min(3, Math.floor((f - S.a) / 10)), [L, R] = POSES[S.i];
  return [R_(T, S.id, { expr: FACES[(S.i + k) % FACES.length], L, R, look: k % 2 ? 0.4 : -0.3, ...life(f, S.i + 3) }, HERO)];
};
export const fxAt = () => [];
