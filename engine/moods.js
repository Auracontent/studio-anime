// Ready-made light moods. One mood per act of the story: the light changes when the story changes
// (calm day -> storm at the problem -> golden light at the payoff). Import in story.js:
//   import { MOODS, mood, blendMood } from '../moods.js';
//   export const lightFor = (S, f) => S.id === 'orage' ? blendMood('soir', 'tempete', ramp(f, S.a, S.a + 20)) : mood(S.light);
// Every mood is a full light object for main.js (sun, sky, fog, grade, ambient occlusion, tinted shadows).
// mood(name, over) returns a copy with your overrides; blendMood(a, b, t) mixes two moods smoothly (colours and numbers).
const base = { ao: 0.7, aoR: 1.35, shadowAmt: 0.22, shadowTint: '#5d4a7a', vig: 0.22, shadowExt: 22, sunSize: 0, sunDisc: '#000000', lift: '#000000', gain: '#ffffff' };
export const MOODS = {
  // warm summer day, sun high: the house default
  jour: { ...base, az: 125, el: 58, sky: '#c9d8f2', ground: '#b08a5c', hemi: 1.15, sun: '#fff1d6', sunI: 2.7, fog: '#cfe6ee', fogNear: 160, fogFar: 1200,
    skyTop: '#3f86d8', skyHor: '#e4f0f2', sat: 1.15, gain: '#fff6ea', vig: 0.2 },
  // early morning: low cool-gold light, long shadows, light mist
  matin: { ...base, az: 95, el: 16, sky: '#bcc8e8', ground: '#8a7a6a', hemi: 1.05, sun: '#ffd9a8', sunI: 2.5, fog: '#e6d8d0', fogNear: 60, fogFar: 700,
    skyTop: '#6f9ad8', skyHor: '#f6d8c0', sunDisc: '#fff4dc', sunSize: 0.003, sat: 1.1, gain: '#fff4ec', shadowTint: '#5a5a8a' },
  // golden hour: the payoff light
  dore: { ...base, az: 20, el: 24, sky: '#c4b4d8', ground: '#8a5a3c', hemi: 1.08, sun: '#ffb46c', sunI: 2.9, fog: '#f0c090', fogNear: 120, fogFar: 1000,
    skyTop: '#5a78c0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.14, gain: '#fff2e2', vig: 0.24, shadowTint: '#6a4a3a' },
  // sunset: orange key, violet shadows
  soir: { ...base, az: 70, el: 14, sky: '#a898d0', ground: '#7a5a4a', hemi: 1.0, sun: '#ffa868', sunI: 2.8, fog: '#f0b890', fogNear: 120, fogFar: 1000,
    skyTop: '#4a5fb0', skyHor: '#ffb27a', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.15, gain: '#fff0e0', vig: 0.26, shadowTint: '#5a4a80' },
  // night: luminous ultramarine, never black; a pale moon key so characters stay readable
  nuit: { ...base, az: 230, el: 38, sky: '#5a6ab8', ground: '#2a2a4a', hemi: 1.2, sun: '#b8c8ff', sunI: 1.6, fog: '#2a3a78', fogNear: 60, fogFar: 600,
    skyTop: '#141c4a', skyHor: '#3a4a9a', sunDisc: '#eef2ff', sunSize: 0.002, sat: 1.12, gain: '#dfe6ff', lift: '#0a0c1e', vig: 0.32, shadowTint: '#3a3a8a', shadowAmt: 0.3, ao: 0.8 },
  // storm: low dark teal sky, flat cold key, close fog. Pair with envAt: rain, wind, rough sea, lightning
  tempete: { ...base, az: 200, el: 30, sky: '#7a8a9a', ground: '#3a3a40', hemi: 1.25, sun: '#c8d4e0', sunI: 1.3, fog: '#4a5a66', fogNear: 25, fogFar: 300,
    skyTop: '#1e2a34', skyHor: '#58687a', sat: 0.95, gain: '#e4ecf2', lift: '#0c1016', vig: 0.36, shadowTint: '#2a3a4a', shadowAmt: 0.28, ao: 0.8 },
  // interior at night by lamp or fire: warm key from the side, deep blue ambient
  lampe: { ...base, az: 160, el: 22, sky: '#5a5aa0', ground: '#3a2a2a', hemi: 0.95, sun: '#ffbe70', sunI: 2.6, fog: '#2a2440', fogNear: 30, fogFar: 200,
    skyTop: '#151a3a', skyHor: '#3a3a70', sat: 1.18, gain: '#fff0dc', lift: '#0a0812', vig: 0.34, shadowTint: '#3a2a6a', shadowAmt: 0.3, ao: 0.85 },
  // winter / cold: white-blue light, pale sky
  froid: { ...base, az: 150, el: 26, sky: '#d8e4f4', ground: '#9aa4b4', hemi: 1.2, sun: '#e8f0ff', sunI: 2.2, fog: '#d8e2ee', fogNear: 60, fogFar: 600,
    skyTop: '#7a9ad0', skyHor: '#e8eef6', sat: 1.0, gain: '#f2f6ff', vig: 0.22, shadowTint: '#4a5a8a' },
};
export const mood = (name, over = {}) => ({ ...(MOODS[name] || MOODS.jour), ...over });

const hex = (c) => { c = String(c).replace('#', ''); if (c.length === 3) c = c.split('').map((x) => x + x).join(''); const n = parseInt(c, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (v) => '#' + v.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
/** Mix two moods (names or objects): t = 0 -> a, 1 -> b. Colours mix in RGB, numbers linearly, the azimuth along the short way. */
export const blendMood = (a, b, t) => {
  const A = typeof a === 'string' ? mood(a) : a, B = typeof b === 'string' ? mood(b) : b, k = Math.max(0, Math.min(1, t)), out = {};
  for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const x = A[key] ?? B[key], y = B[key] ?? A[key];
    if (typeof x === 'number') out[key] = key === 'az' ? x + ((((y - x) % 360) + 540) % 360 - 180) * k : x + (y - x) * k;
    else if (typeof x === 'string' && x[0] === '#') { const p = hex(x), q = hex(y); out[key] = toHex(p.map((v, i) => v + (q[i] - v) * k)); }
    else out[key] = k < 0.5 ? x : y;
  }
  return out;
};
