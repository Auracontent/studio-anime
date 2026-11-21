// Demo of the engine features added in 2026-11: fx3d (rain, sea, lightning, beams, sparks, embers, smoke, spray, motes),
// moods (tempete, nuit, lampe, jour -> dore), follow / track / orbit / shake cameras, actions (run, hop, carry, fallOver),
// travelling transitions (whip, rise, push) and the automatic cartoon marks (! ? sweat, stars, speed lines).
// Not an episode: render stills with  node tools/render.mjs episodes/_demo-fx /tmp/demo "45,120,200,300"
import { M as E, frameOn, frameTwo, ramp, idle, blinkAt, q, follow, track, orbit, shake, hop, fallOver, run, rock, tremble, transition } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 360, DECK = 0;
const IX = 3000;
export const SHOTS = [
  { id: 'storm', a: 0, b: 89 },     // tempete: rain, rough sea, lightning, rotating beam, spray on the reef, boat tracked
  { id: 'night', a: 90, b: 179 },   // nuit: a keeper runs along the jetty, the camera follows him
  { id: 'forge', a: 180, b: 269 },  // lampe: forge sparks, embers, smoke, dust motes; the smith hops and carries
  { id: 'fall', a: 270, b: 359 },   // jour -> dore: a worker trips, dust cloud, camera shake
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const lightFor = (S, f) => S.id === 'storm' ? mood('tempete') : S.id === 'night' ? mood('nuit') : S.id === 'forge' ? mood('lampe') : blendMood('jour', 'dore', ramp(f, 290, 350));

const BOAT = (f) => [14 - (f / 30) * 1.2, 0, 26];
const RUNNER = (f) => { const r = run(f, 100, 3.0); return [-3 + Math.min(r.dist, 9), 0, 6.6]; };
const SMITH = [IX + 16.4, 0, -1.4], W = [IX - 2, 0, 0.4], W2 = [IX - 0.8, 0, 0.6];
// transitions between shots: the shot boundary sits in the middle of each one (90, 180, 270)
const TR = [{ f0: 84, n: 12, type: 'whip' }, { f0: 174, n: 12, type: 'rise' }, { f0: 264, n: 12, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.f0 && f < t.f0 + t.n);
  if (T) return transition(T.type, baseCam(T.f0), baseCam(T.f0 + T.n), f, T.f0, T.n);
  return baseCam(f);
};
const baseCam = (f) => {
  const S = shotAt(f);
  if (S.id === 'storm') { const c = f < 45 ? orbit([0, 0, -10], f, 0, { r: 46, h: 6, speed: 9, start: 160, lookUp: 12, fov: 44 }) : track(BOAT, f, [-7, 3.2, 9], { lookUp: 1.4, fov: 42 }); return shake(c, f, 40, 0.12, 14); }
  if (S.id === 'night') return follow(RUNNER, f, { headW: 0.24, yaw: 28, lag: 10 });
  if (S.id === 'forge') { const k = E.smooth(ramp(f, 180, 269)); return frameOn(SMITH, { headW: 0.26 + 0.06 * k, yaw: -28 + 26 * k }); }
  const c = frameTwo(W, W2, { headW: 0.24, yaw: 18 - 10 * E.smooth(ramp(f, 270, 359)) }); return shake(c, f, 306, 0.05, 10);
};
export const dofAt = (f) => { const S = shotAt(f); return S.id === 'storm' ? { focus: 30, cinf: 2 } : { focus: 4.5, cinf: 8 }; };
export const worldAt = (f) => {
  const S = shotAt(f), Wd = { beamOn: 0, beamYaw: 0, flame: 1, boat: BOAT(f), seaAmp: 0.3 };
  if (S.id === 'storm') { Wd.seaAmp = 1.1; }
  if (S.id === 'night') { Wd.seaAmp = 0.25; }
  return Wd;
};
// ---------- effects ----------
const LANT = [0, 21.7, -10];
export const envAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'storm') return { rain: 1, wind: [-6, 2], sea: { amp: 1.1, col: '#3a7f8e', deep: '#16384a', foam: '#e8f4f6', foamAmt: 1.4 }, lightning: [40, 72],
    beams: [{ at: LANT, yaw: f * 0.05, len: 120, r: 9, a: 0.55 }], spray: [{ at: [-9, 0.2, 22], f0: 20, n: 220, power: 7 }, { at: [6, 0.2, 30], f0: 58, n: 180, power: 6 }] };
  if (S.id === 'night') return { sea: { amp: 0.25, col: '#2a4f90', deep: '#142a5a', foam: '#bcd0ff', foamAmt: 0.6 }, beams: [{ at: LANT, yaw: 2.6 + f * 0.03, len: 140, r: 10, a: 0.45 }], motes: 0 };
  if (S.id === 'forge') return { sparks: [{ at: [IX + 18, 1.2, -3], f0: 190, rate: 90, speed: 4.5 }], embers: [{ at: [IX + 18, 1.1, -3], f0: 150, rate: 18 }],
    smoke: [{ at: [IX + 18, 3.1, -3.2], f0: 120, rate: 5, size: 1.1, col: '#9a948c' }], motes: 0.8 };
  return { smoke: [{ at: [W[0] + 0.6, 0.15, W[2]], f0: 306, f1: 316, rate: 30, size: 0.9, rise: 0.5, col: '#fff4e0' }], motes: 0.3 };
};
// ---------- cast ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.dGard = { tunic: '#2f6fa8', skin: '#e0a878', hat: 'bonnet', hatCol: '#c8312c', hatBand: '#2b3a5a', moustache: '#6a6a6a', brows: '#6a6a6a' };
  O.dSmith = { tunic: '#b8322f', skin: '#8a5a3a', apron: '#4a3a30', moustache: '#2b211c', stout: true };
  O.dW1 = { tunic: '#e0a020', skin: '#f1c9a4', cap: '#3a6a3a', hair: '#4a3222' };
  O.dW2 = { tunic: '#18a8b8', skin: '#c98b62', hair: '#2b211c' };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'night') { const r = run(f, 100, 3.0), moving = f >= 100 && r.dist < 9, p = RUNNER(f);
    out.push(R(T, 'dGard', life(f, 3, { expr: f < 112 ? 'shock' : moving ? 'grin' : 'laugh', L: moving ? 'flail' : 'hip', R: moving ? 'flail' : 'point', wv: q(f * 0.5, 1), step: moving ? q(r.step, 2) : 0, run: moving, tilt: moving ? r.tilt : 0, look: 0.6 }), p,
      { dy: moving ? r.bob : 0, tint: '#c8d0ff' })); }
  if (S.id === 'forge') { const h = hop(f, 214, 0.55, 14), carry = f > 245;
    out.push(R(T, 'dSmith', life(f, 5, { expr: f < 214 ? 'squint' : f < 240 ? 'laugh' : 'pained', L: carry ? 'carry' : 'up', R: carry ? 'carry' : 'up', holdR: carry ? 'tool' : undefined, look: -0.4 }), SMITH,
      { dy: h.dy, sx: h.sx, sy: h.sy, ...(carry ? tremble(f, 0.015) : {}), tint: '#ffe0c0' })); }
  if (S.id === 'fall') { const fo = fallOver(f, 300, 1, 10);
    out.push(R(T, 'dW1', life(f, 8, { expr: f < 286 ? 'squint' : f < 298 ? 'grin' : f < 306 ? 'shock' : 'dazed', L: f < 298 ? 'hip' : 'flail', R: f < 298 ? 'reach' : 'flail', wv: q(f * 0.6, 1), holdR: f < 298 ? 'paper' : undefined, look: 0.4 }), W, { roll: fo.roll, sy: fo.sy }));
    out.push(R(T, 'dW2', life(f, 9, { expr: f < 306 ? 'smile' : 'laugh', L: f < 306 ? 'hip' : 'belly', R: f < 306 ? 'hip' : 'point', look: -0.5 }), W2)); }
  if (S.id === 'storm') {}
  return out;
};
export const fxAt = () => [];
