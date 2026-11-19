// "Le faux Paris" — shot plan timed to voice.wav (60.40 s, 30 fps, 1812 frames). Phrase frames from work/phrases.json.
import { M as E, camFromKeys, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
export const FPS = 30, TOTAL = 1812, DECK = 6;
const FP = [50, DECK, -140];                    // fake Paris centre
const L0 = [-31.5, DECK, 1.2];                  // our Parisian witness in the real street
export const SHOTS = [
  { id: 'hook', a: 0, b: 147, light: 'night' },       // Pendant la Première Guerre mondiale... pour qu'on le bombarde.
  { id: 'raid', a: 148, b: 293, light: 'night' },     // En 1918, des avions allemands attaquent Paris la nuit.
  { id: 'radar', a: 294, b: 388, light: 'night' },    // Pas de radar : les pilotes visent les lumières de la ville.
  { id: 'black', a: 389, b: 553, light: 'night' },    // Alors on éteint tout. Les rues, les vitrines, les gares. Paris plonge dans le noir.
  { id: 'idea', a: 554, b: 659, light: 'dawn' },      // Mais ça ne suffit pas. Un ingénieur a une idée complètement folle :
  { id: 'build', a: 660, b: 809, light: 'day' },      // construire un faux Paris, à une vingtaine de km au nord, au bord de la Seine.
  { id: 'streets', a: 810, b: 854, light: 'night' },  // De fausses rues éclairées.
  { id: 'gare', a: 855, b: 895, light: 'night' },     // Une fausse gare du Nord.
  { id: 'train', a: 896, b: 1016, light: 'night' },   // Et même de faux trains, avec des lumières qui avancent dans la nuit.
  { id: 'plan', a: 1017, b: 1179, light: 'night' },   // Le plan est simple : les bombes tombent sur le faux, et le vrai survit.
  { id: 'sauf', a: 1180, b: 1349, light: 'golden' },  // Sauf que… le chantier prend du retard. ... n'est pas fini.
  { id: 'end', a: 1350, b: 1507, light: 'grey' },     // Deux mois plus tard, la guerre s'arrête. Le faux Paris est démonté...
  { id: 'eng', a: 1508, b: 1670, light: 'night' },    // Et l'ingénieur ? Fernand Jacopozzi avait passé la guerre à cacher les lumières de Paris.
  { id: 'twist', a: 1671, b: 1811, light: 'night' },  // Sept ans plus tard, c'est lui qui a illuminé la tour Eiffel… avec 250 000 ampoules.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lights ----------
const NIGHT = { az: -40, el: 38, sky: '#7484d4', ground: '#3d3466', hemi: 1.05, sun: '#b4c4ff', sunI: 1.35, fog: '#222a5a', fogNear: 90, fogFar: 950,
  skyTop: '#0f1640', skyHor: '#3c4282', sunDisc: '#eef2ff', sunSize: 0.0016, sat: 1.06, gain: '#eef0ff', waterDeep: '#18284f', waterShal: '#2e4c86', glint: '#c8d6ff', vig: 0.3, shadowExt: 30 };
export const LIGHTS = {
  night: NIGHT,
  dawn: { az: 160, el: 12, sky: '#a89ad0', ground: '#6a4c58', hemi: 1.0, sun: '#ffc08a', sunI: 2.2, fog: '#d8a8a0', fogNear: 70, fogFar: 800,
    skyTop: '#5e6aac', skyHor: '#ffc28e', sat: 1.08, gain: '#fff0e2', waterDeep: '#3d5a86', waterShal: '#d99a6e', glint: '#ffe2a8', vig: 0.26, shadowExt: 20 },
  day: { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 90, fogFar: 1000,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 30 },
  golden: { az: 8, el: 11, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 70, fogFar: 900,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', waterDeep: '#3d5a86', waterShal: '#d99a6e', glint: '#ffe2a8', vig: 0.26, shadowExt: 22 },
  grey: { az: 120, el: 40, sky: '#b9c4d4', ground: '#7a7466', hemi: 1.2, sun: '#f2f0ea', sunI: 1.9, fog: '#c9d0da', fogNear: 80, fogFar: 900,
    skyTop: '#7f98b8', skyHor: '#d4dbe4', sat: 0.96, waterDeep: '#40607a', waterShal: '#7a9cb0', glint: '#eef4fa', vig: 0.22, shadowExt: 30 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'black') { const k = E.smooth(ramp(f, 500, 530)); L.hemi = lerp(1.05, 0.72, k); L.sunI = lerp(1.35, 0.95, k); }
  if (S.id === 'eng') { L.hemi = 0.8; L.sunI = 1.05; }
  if (S.id === 'twist') { const k = E.smooth(ramp(f, 1738, 1795)); L.hemi = lerp(0.85, 1.15, k); L.gain = k > 0.5 ? '#fff4e2' : NIGHT.gain; }
  if (S.id === 'plan' || S.id === 'hook' || S.id === 'radar') L.shadowExt = 60;
  return L;
};
const TINT = { night: '#aab5ea', dawn: '#ffdcc8', day: '#ffffff', golden: '#ffe2c8', grey: '#f2f2f2' };

// ---------- planes + bombs ----------
const YAW_W = -Math.PI / 2; // nose toward -x
const raidPlanes = (f) => { const x = -30 - (f - 148) * 0.26; return [{ p: [x, 27, -5], yaw: YAW_W, roll: 0.04 }, { p: [x + 7, 26, -11], yaw: YAW_W }, { p: [x + 7, 26.5, 1.5], yaw: YAW_W }]; };
const radarLead = (f) => [26 - (f - 294) * 0.36, 48, 6];
const planLead = (f) => [96 - (f - 1017) * 0.34, 46, -142];
const BOMB_Z = [-150, -138, -126, -144];
const bombAt = (f, i) => { const t0 = 1058 + i * 5, t1 = 1098 + i * 5; if (f < t0 || f > t1) return null; const u = (f - t0) / (t1 - t0);
  const p0 = planLead(t0); return [p0[0] - u * 10, lerp(p0[1] - 1, DECK + 0.3, u * u), BOMB_Z[i]]; };

// ---------- cameras ----------
const CAMS = {
  hook: [
    { f: 0, pos: [-28.7, 7.7, 2.7], look: [-31.5, 7.45, 1.2], fov: 34 },
    { f: 22, pos: [-28.9, 7.75, 2.8], look: [-31.5, 7.5, 1.2], fov: 33 },
    { f: 96, pos: [-60, 50, 40], look: [-30, 6, -40], fov: 50, path: [[-26, 14, 8]] },
    { f: 147, pos: [-97, 82, 46], look: [-6, 6, -72], fov: 54, path: [[-80, 70, 46]] },
  ],
  raid: [
    { f: 148, pos: [-26.6, 6.8, 2.2], look: [-40, 12.6, -0.6], fov: 54 },
    { f: 293, pos: [-27.0, 6.75, 2.1], look: [-42, 15, -0.8], fov: 50 },
  ],
  radar: [], // follows the lead plane (computed)
  black: [
    { f: 389, pos: [-26.6, 8.1, 0.2], look: [-46, 8.6, 1.6], fov: 50 },
    { f: 500, pos: [-27.0, 8.0, 0.2], look: [-46, 8.6, 1.6], fov: 48 },
    { f: 553, pos: [-28.2, 7.8, 0.5], look: [-35, 7.4, 1.3], fov: 40, roll: -2 },
  ],
  idea: [
    { f: 554, pos: [-35.6, 8.4, 2.8], look: [-35.6, 7.3, -2.8], fov: 44 },
    { f: 600, pos: [-35.6, 8.35, 2.3], look: [-35.6, 7.4, -2.8], fov: 42, ease: 'easeOut' },
    { f: 659, pos: [-35.65, 8.3, 2.1], look: [-35.6, 7.45, -2.8], fov: 40 },
  ],
  build: [
    { f: 660, pos: [16, 28, -92], look: [50, 8, -138], fov: 46 },
    { f: 809, pos: [33, 13.5, -107], look: [50, 7.5, -137], fov: 44 },
  ],
  streets: [
    { f: 810, pos: [50, 7.2, -103], look: [50, 9.2, -140], fov: 46 },
    { f: 854, pos: [50, 7.6, -108], look: [50, 9.4, -140], fov: 44 },
  ],
  gare: [
    { f: 855, pos: [50, 8.6, -150], look: [50, 10, -172], fov: 48 },
    { f: 872, pos: [50, 8.6, -151], look: [50, 10, -172], fov: 47 },
    { f: 895, pos: [74, 9.5, -172.4], look: [50, 8.2, -172.6], fov: 48, path: [[64, 9, -162]] },
  ],
  train: [
    { f: 896, pos: [75, 8.6, -110], look: [65, 7.8, -128], fov: 44 },
    { f: 1016, pos: [74, 8.2, -116], look: [64, 7.6, -140], fov: 42 },
  ],
  plan: [
    { f: 1017, pos: [104, 66, -86], look: [52, 14, -140], fov: 50 },
    { f: 1120, pos: [96, 58, -92], look: [50, 8, -140], fov: 48 },
    { f: 1179, pos: [-12, 42, 52], look: [-56, 9, 0], fov: 50, path: [[40, 70, -20]] },
  ],
  sauf: [
    { f: 1180, pos: [47.6, 7.9, -110.2], look: [47.6, 7.3, -118], fov: 42 },
    { f: 1349, pos: [47.6, 7.85, -111.4], look: [47.6, 7.3, -118], fov: 38, roll: 2 },
  ],
  end: [
    { f: 1350, pos: [61, 9.5, -101], look: [50, 8.5, -132], fov: 50 },
    { f: 1507, pos: [60, 8.6, -104], look: [50, 8.0, -132], fov: 47 },
  ],
  eng: [
    { f: 1508, pos: [-17.6, 7.7, -2.4], look: [-23.1, 7.35, -2.8], fov: 40 },
    { f: 1670, pos: [-18.3, 7.6, -2.5], look: [-23.1, 7.35, -2.8], fov: 35 },
  ],
  twist: [
    { f: 1671, pos: [-44.5, 7.3, 0.8], look: [-104, 34, 0], fov: 48 },
    { f: 1738, pos: [-44.5, 7.5, 0.8], look: [-104, 30, 0], fov: 50 },
    { f: 1811, pos: [-41, 8.1, 0.6], look: [-104, 25, 0], fov: 52, roll: 3 },
  ],
};
const KICKS = [{ f: 214, a: 0.03 }, { f: 1100, a: 0.05 }, { f: 1180, a: 0.03 }, { f: 1430, a: 0.03 }, { f: 1795, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 'radar') { const p = radarLead(f); c = { pos: [p[0] + 24, p[1] + 9, p[2] + 7], look: [p[0] - 36, p[1] - 38, p[2] - 4], fov: 52, roll: 2 }; }
  else c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  // white flashes on the time jumps
  c.flash = f >= 1350 && f < 1356 ? (1 - (f - 1350) / 6) * 0.85 : f >= 1671 && f < 1677 ? (1 - (f - 1671) / 6) * 0.85 : 0;
  if (S.id === 'plan' || S.id === 'build' || S.id === 'end') c.shadowAt = [50, 6, -135];
  if (S.id === 'hook' && f > 40) c.shadowAt = [-40, 6, -10];
  if (S.id === 'twist') c.shadowAt = [-40, 6, 0];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, [L0[0], 7.4, L0[2]]), cinf: lerp(12, 0, E.smooth(ramp(f, 22, 50))) };
    case 'raid': return { focus: dist(C.pos, [L0[0], 7.2, L0[2]]), cinf: 4 };
    case 'black': return { focus: dist(C.pos, [L0[0], 7.3, L0[2]]), cinf: lerp(4, 10, E.smooth(ramp(f, 500, 540))) };
    case 'idea': return { focus: dist(C.pos, [-35.6, 7.4, -3.2]), cinf: 9 };
    case 'sauf': return { focus: dist(C.pos, [47.6, 7.3, -117.7]), cinf: 11 };
    case 'end': return { focus: dist(C.pos, [57.6, 7.3, -108.5]), cinf: 5 };
    case 'eng': return { focus: dist(C.pos, [-23.1, 7.4, -2.8]), cinf: 10 };
    case 'streets': case 'gare': case 'train': return { focus: 25, cinf: 3 };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
const REAL = (v) => ({ win: v, vitrine: v, lamp: v, gare: v });
export const worldAt = (f) => {
  const S = shotAt(f), W = { on: { ...REAL(1), fakewin: 0, fakegare: 0, bulb: 0, train: 0 }, realGlow: 0.85, fakeGlow: 0, build: 1, fall: 0, eiffel: 0, planes: [], bombs: [] };
  switch (S.id) {
    case 'hook': Object.assign(W.on, { fakewin: 1, fakegare: 1, bulb: 1, train: 1 }); W.fakeGlow = 0.9; break;
    case 'raid': W.planes = raidPlanes(f); break;
    case 'radar': { const p = radarLead(f); W.planes = [{ p, yaw: YAW_W, roll: 0.05 }, { p: [p[0] + 8, p[1] - 1, p[2] - 7], yaw: YAW_W }]; break; }
    case 'black': {
      W.on.lamp = 1 - ramp(f, 437, 452); W.on.vitrine = 1 - ramp(f, 456, 472); W.on.gare = 1 - ramp(f, 476, 490); W.on.win = 1 - E.smooth(ramp(f, 498, 530));
      W.realGlow = 0.85 * (1 - ramp(f, 498, 530)); break;
    }
    case 'idea': Object.assign(W.on, REAL(0)); W.realGlow = 0; break;
    case 'build': Object.assign(W.on, REAL(0)); W.realGlow = 0; W.build = lerp(0.12, 0.62, E.smooth(ramp(f, 660, 800))); break;
    case 'streets': case 'gare': case 'train': {
      Object.assign(W.on, REAL(0)); W.realGlow = 0;
      W.on.bulb = ramp(f, 812, 842); W.on.fakewin = ramp(f, 815, 850); W.on.fakegare = S.id === 'streets' ? 0 : ramp(f, 856, 868); W.on.train = S.id === 'train' ? 1 : 0;
      W.fakeGlow = 0.75 * ramp(f, 815, 850);
      if (S.id === 'train') W.trainZ = FP[2] + 22 - (f - 896) * 0.42;
      break;
    }
    case 'plan': {
      Object.assign(W.on, REAL(0), { fakewin: 1, fakegare: 1, bulb: 1, train: 1 }); W.realGlow = 0; W.fakeGlow = 0.85;
      const p = planLead(f); W.planes = [{ p, yaw: YAW_W }, { p: [p[0] + 8, p[1] + 1, p[2] - 8], yaw: YAW_W }, { p: [p[0] + 8, p[1], p[2] + 8], yaw: YAW_W }];
      W.bombs = [0, 1, 2, 3].map((i) => bombAt(f, i)).filter(Boolean); break;
    }
    case 'sauf': Object.assign(W.on, REAL(0)); W.realGlow = 0; W.build = 0.58; break;
    case 'end': Object.assign(W.on, REAL(0)); W.realGlow = 0; W.build = 0.58; W.fall = E.smooth(ramp(f, 1400, 1478)); break;
    case 'eng': Object.assign(W.on, REAL(0)); W.realGlow = 0; break;
    case 'twist': W.realGlow = 0.7; W.eiffel = E.smooth(ramp(f, 1738, 1795)); break;
  }
  return W;
};

// ---------- actors (2D cards) ----------
export const setupCast = (T) => {
  T.OUTFITS.gamin = { tunic: '#2f6db5', skin: '#f2c39a', hair: '#6b3a1f', cap: '#c24a2c', stout: false };
  T.OUTFITS.eng = { tunic: '#4e5a74', skin: '#e0a57c', hair: '#2b211c', moustache: '#2b211c', stout: true };
  T.OUTFITS.ouvA = { tunic: '#7a5a3a', skin: '#c98b62', cap: '#3f4d6a', apron: '#d8c9a6' };
  T.OUTFITS.ouvB = { tunic: '#4d6a5a', skin: '#f0c49e', cap: '#9a4a32', moustache: '#5a3a24' };
};
const FACEMAP = { neutral: 'neutral', confused: 'squint', shocked: 'shock', happy: 'grin', nervous: 'nervous', shouting: 'shock' };
const armPose = (a, side) => { const v = Math.abs(a || 0); return v >= 90 ? 'up' : v >= 20 ? 'cheek' : 'hang'; };
let TT = null;
const LEON = (o, pos, extra = {}) => { const f = o._f || 0; const I = idle(f, 5);
  const op = { seed: 5, expr: FACEMAP[o.face] || 'neutral', blink: o.face === 'shocked' ? 0 : blinkAt(f, 5), L: armPose(o.armL), R: armPose(o.armR), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt + (o.head || 0) * 0.5, 0), look: o.look ?? 0 };
  if (op.L === 'cheek' && op.R === 'hang') op.R = 'cheek'; if (op.R === 'cheek' && op.L === 'hang') op.L = 'cheek';
  if ((o.armR || 0) <= -90 && !((o.armL || 0) >= 90)) { op.R = 'wave'; op.wv = q(f * 0.4 % 6.283, 1); }
  return { key: 'gamin' + JSON.stringify(op), draw: (p) => TT.romanFront(p, 'gamin', op), x: pos[0], y: pos[1], z: pos[2], ...extra }; };
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const leonIdle = (f, o = {}) => ({ face: 'neutral', _f: f, ...o });
const engIdle = (f, o = {}) => { const I = idle(f, 9); return { seed: 9, blink: blinkAt(f, 9), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };

export const actorsAt = (f, T) => {
  TT = T; const S = shotAt(f), out = [], tint = TINT[S.light];
  switch (S.id) {
    case 'hook': {
      const look = f < 26 ? 'neutral' : 'confused';
      out.push(LEON(leonIdle(f, { face: look, head: f < 26 ? 0 : -6 }), L0, { tint })); break;
    }
    case 'raid': {
      const sh = f > 205;
      out.push(LEON(leonIdle(f, { face: sh ? 'shocked' : 'nervous', armL: sh ? 35 : 0, armR: sh ? -35 : 0, head: -5 }), L0, { tint })); break;
    }
    case 'black': {
      const face = f < 500 ? 'nervous' : f < 528 ? 'shocked' : 'nervous';
      const k = f >= 500 && f < 528 ? 1 : 0;
      out.push(LEON(leonIdle(f, { face, armL: k * 25, armR: -k * 25 }), L0, { tint: f > 515 ? '#8e98d0' : tint })); break;
    }
    case 'idea': {
      const idea = f >= 600;
      out.push(R(T, 'eng', engIdle(f, { expr: idea ? 'grin' : 'neutral', L: idea ? 'up' : 'hang', R: 'hip', look: 0.4, bob: idea && f < 606 ? 0.02 : 0 }), [-36.35, DECK, -3.3], { tint }));
      out.push(LEON(leonIdle(f, { face: f < 610 ? 'confused' : 'happy', armR: f >= 612 ? -30 : 0 }), [-34.85, DECK, -3.2], { tint }));
      break;
    }
    case 'build': {
      const hit = (s) => (Math.floor((f + s) / 9) % 2 ? 'up' : 'reach');
      out.push(R(T, 'ouvA', { seed: 41, L: hit(0), R: 'hang', expr: 'neutral', blink: blinkAt(f, 41) }, [42.6, DECK, -124], { tint }));
      out.push(R(T, 'ouvB', { seed: 42, R: hit(4), L: 'hang', expr: 'grin', blink: blinkAt(f, 42) }, [57.4, DECK, -131], { tint }));
      out.push(R(T, 'eng', engIdle(f, { expr: 'smile', L: 'point', R: 'hip' }), [48.8, DECK, -118], { tint }));
      out.push(LEON(leonIdle(f, { face: 'happy', armL: 20 }), [51.0, DECK, -117.6], { tint }));
      break;
    }
    case 'gare': if (f > 878) out.push(LEON(leonIdle(f, { face: 'shocked', armL: 30, armR: -30 }), [62.5, DECK, -173.6], { tint })); break;
    case 'train': out.push(LEON(leonIdle(f, { face: 'happy', armR: -110 }), [71.0, DECK, -117.5], { tint })); break;
    case 'sauf': {
      out.push(R(T, 'eng', engIdle(f, { expr: f < 1300 ? 'neutral' : 'nervous', L: f > 1215 ? 'temple' : 'hang', R: 'hip', swirl: q((f * 0.3) % 6.283, 1), look: 0.3 }), [46.6, DECK, -117.6], { tint }));
      out.push(LEON(leonIdle(f, { face: f < 1228 ? 'confused' : 'nervous' }), [48.7, DECK, -117.9], { tint }));
      break;
    }
    case 'end': {
      const late = f > 1440;
      out.push(LEON(leonIdle(f, { face: late ? 'confused' : 'happy', armL: late ? 45 : 110, armR: late ? -45 : -110 }), [57.6, DECK, -108.5], { tint }));
      break;
    }
    case 'eng': {
      out.push(R(T, 'eng', engIdle(f, { expr: f < 1580 ? 'neutral' : 'smile', L: 'hang', R: f > 1600 ? 'up' : 'hip', look: 0.3 }), [-23.1, DECK, -3.3], { tint: '#bcc6f2' }));
      out.push(LEON(leonIdle(f, { face: 'confused' }), [-23.2, DECK, -2.2], { tint: '#bcc6f2' }));
      break;
    }
    case 'twist': {
      const lit = f > 1760;
      out.push(LEON(leonIdle(f, { face: lit ? 'happy' : 'shocked', armL: lit ? 110 : 0, armR: lit ? -110 : 0, head: -6 }), [-51.0, DECK, 1.0], { tint: lit ? '#ffe6c2' : tint }));
      out.push(R(T, 'eng', engIdle(f, { expr: lit ? 'grin' : 'smile', L: 'hip', R: 'hip', look: -0.3 }), [-52.4, DECK, -0.3], { tint: lit ? '#ffe6c2' : tint }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const bulbIcon = (p, glow) => { if (glow) p.ell(300, 470, 150, 150, '#fff3b055', 0); p.ell(300, 480, 90, 100, '#ffe680', 12); p.poly([[255, 560], [345, 560], [335, 640], [265, 640]], '#b9b2a6', 10); p.stroke([[265, 600], [335, 600]], 8); };
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'idea' && f >= 598) {
    const t = q(clamp((f - 598) / 14), 2), s = 0.55 * E.back(t);
    out.push(FX('bulb' + t, (p) => { T.fxBurst(p, clamp(t * 1.4), '#fff3b0'); bulbIcon(p, true); }, [-36.35, DECK + 2.25, -3.1], q(s, 2)));
  }
  if (S.id === 'eng' && f > 1606) out.push(FX('bulbE', (p) => bulbIcon(p, true), [-22.6, DECK + 1.75, -3.05], 0.22));
  if (S.id === 'plan') for (let i = 0; i < 4; i++) {
    const t1 = 1098 + i * 5; if (f < t1 || f > t1 + 22) continue; const t = q((f - t1) / 22, 2);
    out.push(FX('boom' + t, (p) => { T.fxBurst(p, t, '#ffb35a', 12, 60, 320); T.fxPuff(p, t); }, [planLead(1058 + i * 5)[0] - 10, DECK, BOMB_Z[i]], 9));
  }
  if (S.id === 'end' && f > 1430) {
    const k = q(ramp(f, 1430, 1507), 2);
    [[-6, -125], [6, -133], [-6, -145], [6, -150], [0, -168]].forEach(([dx, z], i) => { const kk = q(clamp(k * 1.4 - i * 0.12), 2); if (kk > 0) out.push(FX('dust' + kk, (p) => T.fxDust(p, kk, '#e8dcc4'), [50 + dx * 1.3, DECK, z], 3.5)); });
  }
  if (S.id === 'build') for (let i = 0; i < 3; i++) { const t = q(((f + i * 13) % 26) / 26, 2); out.push(FX('dustB' + t, (p) => T.fxPuff(p, t), [44 + i * 6, DECK, -122 - i * 7], 1.4)); }
  return out;
};
