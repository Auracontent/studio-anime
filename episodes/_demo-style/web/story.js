// Demo of the 2026-11 "attitude" update (not an episode): faces with attitude (smug, sly, deadpan, proud, suspicious, determined),
// rich costumes (patterns, lapels, sash, medals, epaulettes, plume, parrot), new poses (shrug, chin, salute, fist, show, sit),
// silhouettes (head, legs, thin), low-angle / dutch framing, blurred foreground prop, crane reveal over a cutaway, crowd of extras.
// Stills:  node tools/render.mjs episodes/_demo-style /tmp/style "20,45,80,115,145,165,175,185,195,205,215,225,233,241,249,257,280"
import { M as E, frameOn, frameTwo, ramp, idle, blinkAt, crane, fgCard, crowd } from '../motion.js';
import { mood } from '../moods.js';
export const FPS = 30, TOTAL = 300, DECK = 0;
const CX = 5000;
export const SHOTS = [
  { id: 'reveal', a: 0, b: 59 }, { id: 'vault', a: 60, b: 99 }, { id: 'before', a: 100, b: 129 }, { id: 'after', a: 130, b: 159 },
  { id: 'faces', a: 160, b: 219 }, { id: 'poses', a: 220, b: 259 }, { id: 'crowd', a: 260, b: 299 } ];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const lightFor = (S) => S.id === 'vault' ? mood('lampe') : mood('jour');
const VAULT = [CX + 7.2, -7.5, 2.6], HERO = [0.4, 0, -1.2], PAL = [-0.6, 0, -1.4];
const FACES = ['smug', 'sly', 'deadpan', 'proud', 'suspicious', 'determined'];
const POSES = [['shrug', 'shrug'], ['chin', 'hip'], ['salute', 'hang'], ['fist', 'hip'], ['show', 'hang']];
export const camAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'reveal') return crane([CX + 7.5, -5.4, 2], f, 0, 59, { from: { r: 48, h: 18, yaw: -40, lookUp: 1 }, to: { r: 10.5, h: 0.6, yaw: 4, lookUp: -0.4 }, fov: 44 });
  if (S.id === 'vault') return frameOn(VAULT, { headW: 0.3, low: 16, yaw: -14 + 10 * E.smooth(ramp(f, 60, 99)), fov: 40 });
  if (S.id === 'before') return frameOn(HERO, { headW: 0.26, yaw: 0 });
  if (S.id === 'after') return frameOn(HERO, { headW: 0.3, low: 18, dutch: 5, yaw: -12 + 6 * E.smooth(ramp(f, 130, 159)) });
  if (S.id === 'faces') return frameOn(HERO, { headW: 0.34, yaw: -6 });
  if (S.id === 'poses') return frameTwo(HERO, PAL, { headW: 0.22, yaw: 6 });
  return frameOn(HERO, { headW: 0.2, low: 20, yaw: 10 - 8 * E.smooth(ramp(f, 260, 299)), frameY: 0.42 });
};
export const dofAt = (f) => { const S = shotAt(f), c = camAt(f);
  if (S.id === 'reveal') return { focus: 40, cinf: 1.5 };
  if (S.id === 'vault' || S.id === 'after') return { focus: c.dist, cinf: 7, near: 3 };   // subject sharp, foreground prop blurred
  return { focus: c.dist || 5, cinf: 5 }; };
export const worldAt = () => ({ pal: 0.6 });
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.sPlain = { tunic: '#4f7fb8', skin: '#e0a878', hair: '#3a2a20' };   // "before": what most of our characters looked like
  O.sCapt = { tunic: '#2f56a8', skin: '#e0a878', hair: '#3a2a20', pattern: 'vstripes', lapels: '#1e3a78', sash: '#d23a32', medals: 3, epaulettes: '#f0c419',
    hat: 'chapeauplume', plume: '#ff7ab0', pet: 'parrot', belt: '#3a2a22', cuffs: '#f0c419', moustache: '#3a2a20', head: 1.08 };
  O.sBoss = { tunic: '#7a2f8f', skin: '#c98b62', pattern: 'checks', patternCol: '#5a1f6a', lapels: '#3a1446', buttons: '#f0c419', hat: 'tophat', moustache: '#2b211c', stout: true, medals: 1 };
  O.sLanky = { tunic: '#e0a020', skin: '#f1c9a4', cap: '#3a6a3a', hair: '#4a3222', thin: true, legs: 1.1, pattern: 'stripes', patternCol: '#c07a10', belt: '#5a3b2a' };
  O.sThief = { tunic: '#2b2b36', skin: '#f1c9a4', pattern: 'stripes', patternCol: '#e8e2d6', cap: '#2b2b36', hair: '#2b211c', thin: true };
  O.sX1 = { tunic: '#d23a32', skin: '#e0a878', cap: '#2f56a8', belt: '#3a2a22' }; O.sX2 = { tunic: '#18a8b8', skin: '#8a5a3a', hair: '#1e1714', sash: '#f0c419' };
  O.sX3 = { tunic: '#6aae3a', skin: '#f1c9a4', cap: '#e0a020' }; O.sX4 = { tunic: '#e07a2a', skin: '#c98b62', hair: '#3a2a20', pattern: 'dots' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: Math.round(i.bob * 1000) / 1000, tilt: Math.round(i.tilt * 4) / 4, headTilt: Math.round(i.headTilt * 4) / 4, blink: blinkAt(f, seed) }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f);
  if (S.id === 'reveal' || S.id === 'vault') {
    const a = [R_(T, 'sBoss', { expr: 'smug', look: -0.4, L: 'show', holdL: 'coin', R: 'hip', ...life(f, 3) }, VAULT, { ground: VAULT[1] }),
               R_(T, 'sThief', { expr: 'sly', look: 0.6, L: 'reach', R: 'hang', holdR: 'tool', facing: 1, ...life(f, 5) }, [CX - 8, -4.9, 4.6], { ground: -4.9 }),
               R_(T, 'sX1', { expr: 'neutral', ...life(f, 6) }, [CX - 2, 0, 3.2]), R_(T, 'sX4', { expr: 'smile', ...life(f, 8) }, [CX + 15, 0, 2.2])];
    if (S.id === 'vault') a.push(fgCard(camAt(f), T.fgProp('coin'), { key: 'fgcoin', side: 1, dist: 1.0, drop: 0.45, s: 0.36 }));
    return a;
  }
  if (S.id === 'before') return [R_(T, 'sPlain', { expr: 'neutral', ...life(f, 3) }, HERO)];
  if (S.id === 'after') return [R_(T, 'sCapt', { expr: 'smug', look: -0.3, L: 'hip', R: 'show', holdR: 'flag', facing: -1, ...life(f, 3) }, HERO),
    fgCard(camAt(f), T.fgProp('leaves', { seed: 2 }), { key: 'fgleaves', side: -1, dist: 0.9, drop: 0.55, s: 0.42 })];
  if (S.id === 'faces') { const k = Math.min(FACES.length - 1, Math.floor((f - 160) / 10)); return [R_(T, 'sCapt', { expr: FACES[k], look: k % 2 ? 0.4 : -0.3, L: 'hip', R: 'hang' }, HERO)]; }
  if (S.id === 'poses') { const k = Math.min(POSES.length - 1, Math.floor((f - 220) / 8)), [L, R] = POSES[k];
    return [R_(T, 'sLanky', { expr: ['deadpan', 'suspicious', 'determined', 'proud', 'smug'][k], L, R, holdL: L === 'show' ? 'letter' : undefined, look: -0.5, ...life(f, 4) }, HERO),
            R_(T, 'sBoss', { expr: 'scheming', sit: true, L: 'knuckles', R: 'chin', look: 0.6, ...life(f, 7) }, PAL)]; }
  return [R_(T, 'sCapt', { expr: 'proud', L: 'fist', R: 'show', holdR: 'flag', facing: -1, ...life(f, 3) }, HERO),
          ...crowd(T, f, { center: [0.2, 0, -5.2], n: 14, w: 9, d: 2.6, outfits: ['sX1', 'sX2', 'sX3', 'sX4'], exprs: ['grin', 'laugh', 'shock', 'proud'], cheer: 1, seed: 4 })];
};
export const fxAt = () => [];
