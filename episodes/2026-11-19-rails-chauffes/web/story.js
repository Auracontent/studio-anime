// "Les rails chauffés" — 54.56 s, 30 fps, 1637 frames. Phrase frames from ../phrases.json (silence-aligned).
import { M as E, camFromKeys, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
export const FPS = 30, TOTAL = 1637, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 140, light: 'hiver' },        // En plein hiver, la SNCF chauffe ses rails… avant de les poser.
  { id: 'tactac', a: 141, b: 240, light: 'midi' },     // Pendant plus d'un siècle, les trains français ont fait « tac-tac ».
  { id: 'trou', a: 241, b: 291, light: 'midi' },       // Ce bruit… c'était un trou.
  { id: 'pose', a: 292, b: 402, light: 'midi' },       // Tous les dix-huit mètres, on laissait un petit espace entre deux rails.
  { id: 'soleil', a: 403, b: 568, light: 'canicule' }, // Parce que l'acier, en plein soleil, ça gonfle. En été... soixante degrés.
  { id: 'nimes', a: 569, b: 693, light: 'canicule' },  // En 2019, près de Nîmes, on en a mesuré un… à soixante-cinq.
  { id: 'tord', a: 694, b: 850, light: 'canicule' },   // Sans espace... Alors il pousse… et la voie se tord sur le côté.
  { id: 'flambee', a: 851, b: 917, light: 'canicule' },// Les cheminots appellent ça une flambée.
  { id: 'sauf', a: 918, b: 1137, light: 'golden' },    // Sauf que… soudés... Plus de tac-tac. Plus de place pour gonfler.
  { id: 'secret', a: 1138, b: 1365, light: 'hiver' },  // Le secret ? La température. Une nuit de novembre... puis ils le fixent.
  { id: 'doux', a: 1366, b: 1430, light: 'hiver' },    // Le rail est persuadé qu'il fait doux… pour toujours.
  { id: 'fin', a: 1431, b: 1636, light: 'canicule' },  // Voilà pourquoi, quand il fait quarante degrés, ton train ralentit...
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lights ----------
export const LIGHTS = {
  midi: { az: 125, el: 58, sky: '#c9d8f2', ground: '#b06a3c', hemi: 1.15, sun: '#fff1d6', sunI: 2.7, fog: '#f3d2a6', fogNear: 160, fogFar: 1200,
    skyTop: '#3f86d8', skyHor: '#f6dcb0', sat: 1.14, gain: '#fff6ea', vig: 0.2, shadowExt: 22 },
  canicule: { az: 140, el: 64, sky: '#d8d4ea', ground: '#c0703a', hemi: 1.15, sun: '#ffe2b0', sunI: 3.0, fog: '#f6c88e', fogNear: 140, fogFar: 1100,
    skyTop: '#4a8ad6', skyHor: '#ffd59a', sat: 1.2, gain: '#ffefd8', vig: 0.22, shadowExt: 22 },
  golden: { az: 20, el: 14, sky: '#a89ad0', ground: '#7a4c38', hemi: 1.05, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 120, fogFar: 1000,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', vig: 0.24, shadowExt: 26 },
  hiver: { az: -30, el: 35, sky: '#7b8ad8', ground: '#4a5a8a', hemi: 1.0, sun: '#b9c8ff', sunI: 1.3, fog: '#1e2a58', fogNear: 70, fogFar: 650,
    skyTop: '#0e1638', skyHor: '#33407a', sunDisc: '#eef2ff', sunSize: 0.0016, sat: 1.02, gain: '#eef2ff', vig: 0.3, shadowExt: 16 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });
const TINT = { midi: '#ffffff', canicule: '#fff0dc', golden: '#ffe2c8', hiver: '#b8c3f2' };

// ---------- cameras ----------
const SITE = [70, 0, -300];
const tgvZfin = (f) => -60 - (f - 1431) * 0.12;
const CAMS = {
  hook: [
    { f: 0, pos: [70.95, 0.7, -296.8], look: [70.72, 0.56, -301.5], fov: 38 },
    { f: 60, pos: [70.5, 1.3, -294.6], look: [70.2, 1.15, -300.5], fov: 44, ease: 'easeOut' },
    { f: 140, pos: [70.2, 1.6, -293.0], look: [70.1, 1.2, -300.5], fov: 46 },
  ],
  tactac: [
    { f: 141, pos: [2.8, 0.6, -24], look: [0, 1.8, 8], fov: 50 },
    { f: 200, pos: [2.85, 0.65, -27], look: [0, 1.8, -8], fov: 50, ease: 'smooth' },
    { f: 240, pos: [2.9, 0.7, -30], look: [-0.5, 1.5, -44], fov: 50 },
  ],
  trou: [
    { f: 241, pos: [1.45, 0.86, -16.4], look: [0.72, 0.6, -18.0], fov: 34 },
    { f: 291, pos: [1.25, 0.8, -16.9], look: [0.72, 0.6, -18.0], fov: 28 },
  ],
  pose: [
    { f: 292, pos: [7.6, 1.6, -38.0], look: [2.4, 1.2, -36.6], fov: 50 },
    { f: 402, pos: [7.4, 1.4, -35.0], look: [2.4, 1.2, -36.6], fov: 48 },
  ],
  soleil: [
    { f: 403, pos: [1.35, 0.78, -31.0], look: [0.72, 0.62, -36.5], fov: 40 },
    { f: 470, pos: [7.4, 1.6, -36.2], look: [2.9, 1.3, -36.2], fov: 50, ease: 'smooth' },
    { f: 568, pos: [6.9, 1.5, -36.0], look: [2.9, 1.3, -36.2], fov: 46 },
  ],
  nimes: [
    { f: 569, pos: [0.9, 2.3, -186], look: [3.6, 2.1, -176.5], fov: 46 },
    { f: 693, pos: [1.2, 2.2, -183], look: [3.6, 2.1, -177], fov: 42 },
  ],
  tord: [
    { f: 694, pos: [0.5, 1.35, -70], look: [0, 0.4, -110], fov: 42 },
    { f: 850, pos: [0.4, 1.9, -76], look: [0, 0.3, -108], fov: 44 },
  ],
  flambee: [
    { f: 851, pos: [3.6, 1.6, -93.5], look: [1.8, 1.2, -100.4], fov: 46 },
    { f: 917, pos: [3.3, 1.5, -94.6], look: [1.8, 1.2, -100.4], fov: 42 },
  ],
  sauf: [
    { f: 918, pos: [1.2, 0.74, -150], look: [0.72, 0.6, -230], fov: 40 },
    { f: 1040, pos: [-3.6, 3.2, -146], look: [0, 1.2, -230], fov: 48 },
    { f: 1137, pos: [-3.9, 2.2, -150], look: [0, 1.6, -200], fov: 48 },
  ],
  secret: [
    { f: 1138, pos: [70.2, 1.6, -292.8], look: [70.1, 1.2, -300.5], fov: 46 },
    { f: 1365, pos: [70.3, 1.4, -294.6], look: [70.2, 1.1, -300.5], fov: 42 },
  ],
  doux: [
    { f: 1366, pos: [71.35, 0.72, -296.6], look: [70.72, 0.56, -300.4], fov: 36 },
    { f: 1430, pos: [71.2, 0.7, -297.4], look: [70.72, 0.56, -300.4], fov: 32 },
  ],
  fin: [
    { f: 1431, pos: [5.6, 2.0, -108], look: [0.5, 1.8, -80], fov: 48 },
    { f: 1560, pos: [3.2, 1.2, -106], look: [0.4, 1.4, -86], fov: 44 },
    { f: 1636, pos: [1.6, 0.7, -104], look: [0.4, 1.2, -90], fov: 38, roll: 3 },
  ],
};
const KICKS = [{ f: 214, a: 0.02 }, { f: 790, a: 0.05 }, { f: 820, a: 0.04 }, { f: 918, a: 0.03 }, { f: 1318, a: 0.04 }, { f: 1600, a: 0.03 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  const flashAt = [569, 1138, 1431];
  for (const a of flashAt) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.8;
  if (S.id === 'tactac') { const sh = Math.sin(f * 2.1) * 0.012; c.pos = [c.pos[0], c.pos[1] + sh, c.pos[2]]; }
  if (S.id === 'fin' && f > 1560) { const sh = Math.sin(f * 1.7) * 0.006 * ramp(f, 1560, 1636); c.look = [c.look[0] + sh, c.look[1], c.look[2]]; }
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, f < 40 ? [70.72, 0.6, -301] : [70.1, 1.2, -300.3]), cinf: 10 };
    case 'trou': return { focus: dist(C.pos, [0.72, 0.6, -18.0]), cinf: 13 };
    case 'pose': return { focus: dist(C.pos, [2.6, 1.3, -36.4]), cinf: 8 };
    case 'soleil': return { focus: dist(C.pos, f < 450 ? [0.72, 0.6, -36] : [3.0, 1.4, -36.3]), cinf: 10 };
    case 'nimes': return { focus: dist(C.pos, [3.3, 2.1, -178]), cinf: 7 };
    case 'flambee': return { focus: dist(C.pos, [2.0, 1.3, -100.4]), cinf: 9 };
    case 'secret': return { focus: dist(C.pos, [70.1, 1.2, -300.3]), cinf: 9 };
    case 'doux': return { focus: dist(C.pos, [70.72, 0.6, -300.4]), cinf: 14 };
    case 'fin': return { focus: dist(C.pos, [0.4, 1.6, tgvZfin(f) - 5]), cinf: 8 };
  }
  return { focus: 20, cinf: 3 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { buckle: 0, heat: 0, glow: 0 };
  switch (S.id) {
    case 'hook': W.glow = 1; break;
    case 'tactac': W.steamZ = 38 - (f - 141) * 0.62; break;
    case 'soleil': W.heat = 0.65 * E.smooth(ramp(f, 430, 549)); break;
    case 'tord': W.heat = 0.7; W.buckle = E.easeIn(ramp(f, 765, 833)) * 1.0; break;
    case 'flambee': W.heat = 0.7; W.buckle = 1; break;
    case 'sauf': if (f >= 1040) W.tgvZ = -112 - (f - 1040) * 1.25; break;
    case 'secret': W.glow = f < 1318 ? E.smooth(ramp(f, 1180, 1240)) : 1 - ramp(f, 1318, 1350); break;
    case 'doux': W.glow = 0; break;
    case 'fin': W.heat = 0.45; W.buckle = 0.06 + 0.025 * Math.sin(f * 0.6) * ramp(f, 1540, 1600); W.tgvZ = tgvZfin(f); break;
  }
  return W;
};

// ---------- actors (2D cards) ----------
export const setupCast = (T) => {
  T.OUTFITS.poseur = { tunic: '#3f5f8a', skin: '#d9a27a', cap: '#5a4a3a', moustache: '#3b2a20' };
  T.OUTFITS.chef = { tunic: '#6b4a34', skin: '#efc39a', cap: '#2e2e36', moustache: '#2b211c', stout: true };
  T.OUTFITS.ouvA = { tunic: '#f07a1a', skin: '#c98b62', cap: '#f4f4f4' };
  T.OUTFITS.ouvB = { tunic: '#f07a1a', skin: '#f0c49e', cap: '#f2d23a', moustache: '#6b3a1f' };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const hop = (f, f0, h = 0.18) => (f >= f0 && f < f0 + 10 ? h * Math.sin((f - f0) / 10 * Math.PI) : 0);
const THERMO = (value, pos, s = 0.75, extra = {}) => { const v = Math.round(value); return { key: 'thermo' + v, draw: (p) => thermoCard(p, v), x: pos[0], y: pos[1], z: pos[2], s, blob: true, ...extra }; };
function thermoCard(p, v) {
  const g = p.g, top = 210, bot = 860, x = 300, k = Math.max(0, Math.min(1, (v + 5) / 75)), hot = v >= 50;
  g.save(); g.lineJoin = 'round';
  g.fillStyle = '#f7f3ea'; g.strokeStyle = '#271925'; g.lineWidth = 16;
  g.beginPath(); g.roundRect(x - 52, top, 104, bot - top, 52); g.fill(); g.stroke();
  g.beginPath(); g.arc(x, bot + 30, 82, 0, 6.283); g.fillStyle = hot ? '#e8322a' : '#e8582a'; g.fill(); g.stroke();
  g.fillStyle = hot ? '#e8322a' : '#e8582a'; const mt = bot - k * (bot - top - 60); g.fillRect(x - 24, mt, 48, bot - mt + 20);
  g.strokeStyle = '#271925'; g.lineWidth = 6; for (let i = 0; i <= 7; i++) { const y = bot - i / 7 * (bot - top - 60); g.beginPath(); g.moveTo(x + 52, y); g.lineTo(x + 84, y); g.stroke(); }
  g.font = '800 120px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineWidth = 18; g.strokeStyle = '#271925'; g.strokeText(v + '°', x, 170); g.fillStyle = hot ? '#ff4a2a' : '#ffffff'; g.fillText(v + '°', x, 170);
  g.restore();
}

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT[S.light];
  switch (S.id) {
    case 'hook': case 'secret': {
      const fix = S.id === 'secret' && f >= 1312 && f < 1330;
      if (S.id === 'hook') out.push(R(T, 'ouvA', life(f, 41, { expr: 'neutral', L: 'hip', R: 'hang', look: 0.4 }), [69.25, 0, -300.2], { tint }));
      else out.push(THERMO(lerp(3, 25, E.smooth(ramp(f, 1198, 1300))), [69.3, 0, -300.2], 0.62, { tint: '#d8defa' }));
      out.push(R(T, 'ouvB', life(f, 42, { expr: fix ? 'grin' : 'neutral', L: 'hang', R: fix ? 'up' : 'reach', look: -0.4 }), [70.95, 0, -300.6], { tint }));
      break;
    }
    case 'pose': {
      const ham = Math.floor(f / 8) % 2 ? 'up' : 'reach';
      out.push(R(T, 'poseur', life(f, 31, { expr: 'neutral', L: 'hang', R: ham, look: -0.3 }), [2.5, 0, -36.0], { tint }));
      out.push(R(T, 'chef', life(f, 32, { expr: f > 360 ? 'smile' : 'stern', L: 'point', R: 'hip', look: 0.3 }), [2.8, 0, -37.2], { tint }));
      break;
    }
    case 'soleil': {
      const hot = f > 520;
      out.push(R(T, 'poseur', life(f, 31, { expr: hot ? 'pained' : 'nervous', L: hot ? 'cheek' : 'hang', R: hot ? 'cheek' : 'hang' }), [2.5, 0, -35.4], { tint }));
      out.push(THERMO(lerp(28, 60, E.smooth(ramp(f, 470, 549))), [3.6, 0, -37.0], 0.78, { tint }));
      break;
    }
    case 'nimes': {
      const v = lerp(48, 65, E.easeOut(ramp(f, 600, 655))), shock = f > 655;
      out.push(R(T, 'ouvA', life(f, 41, { expr: shock ? 'shock' : 'neutral', L: shock ? 'cheek' : 'hang', R: shock ? 'cheek' : 'hang' }), [3.1, 0.9, -178.2], { tint, ground: 0.9 }));
      out.push(THERMO(v, [3.9, 0.9, -180.3], 0.78, { tint, ground: 0.9 }));
      break;
    }
    case 'flambee': {
      out.push(R(T, 'ouvB', life(f, 42, { expr: f > 880 ? 'grin' : 'neutral', L: 'point', R: 'hip', look: -0.4 }), [2.7, 0, -100.4], { tint }));
      break;
    }
    case 'fin': out.push(THERMO(40, [2.7, 0, -97.5], 0.7, { tint })); break;
  }
  return out.map((a) => (a.y > -10 ? { ...a, y: a.y + 0 } : a)).filter((a) => a.y > -10);
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.light === 'hiver') for (let i = 0; i < 26; i++) { // snow
    const t = ((f * 0.006 + i * 0.137) % 1), x = SITE[0] - 5 + ((i * 3.7) % 11) + Math.sin(f * 0.03 + i) * 0.4, y = 6 - t * 6.5, z = SITE[2] + 6 - ((i * 1.9) % 12);
    out.push(FX('flake', (p) => p.ell(300, 500, 60, 60, '#ffffff', 0), [x, y, z], 0.05));
  }
  if (S.id === 'tactac') for (let i = 0; i < 4; i++) { const t = q(((f + i * 9) % 36) / 36, 2), z = 38 - (f - 141) * 0.62 - 3.6 + t * 6; out.push(FX('steam' + t, (p) => T.fxPuff(p, t), [0, 3.6 + t * 2.2, z], 1.6 + t * 1.4)); }
  if (S.id === 'trou' && f > 258) { const t = q(((f - 258) % 30) / 30, 2); out.push(FX('ring' + t, (p) => T.fxRing(p, t), [0.72, 0.58, -18.0], 0.35)); }
  if (S.id === 'pose' && Math.floor(f / 8) % 2 === 0) { const t = q((f % 8) / 8, 2); out.push(FX('spark' + t, (p) => T.fxBurst(p, t, '#fff3b0', 8, 30, 160), [2.2, 0.6, -35.6], 0.4)); }
  if (S.id === 'soleil' || S.id === 'tord' || S.id === 'flambee' || S.id === 'fin') { // heat shimmer streaks over the rails
    for (let i = 0; i < 5; i++) { const t = q(((f * 0.02 + i * 0.21) % 1), 2); const zc = S.id === 'soleil' ? -34 : S.id === 'fin' ? -96 : -96;
      out.push(FX('haze' + t, (p) => { p.g.globalAlpha = 0.18 * Math.sin(t * Math.PI); p.ell(300, 500, 260, 40, '#fff4d8', 0); p.g.globalAlpha = 1; }, [((i % 2) - 0.5) * 1.4, 0.7 + t * 1.2, zc - i * 2.2], 1.2)); }
  }
  if (S.id === 'nimes' && f > 655 && f < 690) { const t = q((f - 655) / 35, 2); out.push(FX('boom' + t, (p) => T.fxBurst(p, t, '#ff7a3a', 12, 50, 300), [3.9, 3.1, -180.3], 1.3)); }
  if (S.id === 'tord' && f > 765) { const t = q(((f - 765) % 20) / 20, 2); out.push(FX('creak' + t, (p) => { p.g.translate(150, 400); T.fxCreak(p, t); }, [0.9, 0.9, -98], 1.0)); }
  if (S.id === 'flambee' && f > 885 && f < 915) { const t = q((f - 885) / 30, 2); out.push(FX('flam' + t, (p) => T.fxBurst(p, t, '#ffa040', 10, 40, 260), [0.6, 0.8, -101], 1.1)); }
  if (S.id === 'secret' && f > 1312 && f < 1330) { const t = q((f - 1312) / 18, 2); out.push(FX('hit' + t, (p) => T.fxBurst(p, t, '#ffe6a0', 9, 30, 200), [70.75, 0.7, -300.8], 0.6)); }
  if (S.id === 'doux') { const t = q(((f - 1366) % 40) / 40, 2); out.push(FX('z' + t, (p) => T.fxZ(p, t), [70.95, 0.8, -300.2], 0.35)); out.push(FX('st' + t, (p) => T.fxStars(p, t), [70.5, 0.9, -300.8], 0.35)); }
  return out;
};
