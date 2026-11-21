// "Le canari de la mine" — 45.76 s, 30 fps, 1373 frames. Phrases : ../phrases.json. Plan de tournage : ../PLAN.md
import { M as E, camFromKeys, frameOn, frameTwo, follow, shake, transition, hop, fallOver, tremble, run, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1373, DECK = 0;

// ---------- plans (une phrase = une action) ----------
export const SHOTS = [
  { id: 'hook', a: 0, b: 124 },        // Ce petit canari descendait dans la mine pour s'évanouir avant tout le monde.
  { id: 'gaz', a: 125, b: 245 },       // Au fond des galeries, un gaz invisible se glissait entre les mineurs.
  { id: 'monox', a: 246, b: 370 },     // Le monoxyde de carbone endormait les hommes sans qu'ils sentent rien.
  { id: 'expl', a: 371, b: 416 },      // Après une explosion,
  { id: 'hald', a: 417, b: 535 },      // un savant écossais, John Haldane, a eu une idée simple.
  { id: 'oiseau', a: 536, b: 655 },    // Un oiseau respire très vite, alors le poison l'atteint bien avant nous.
  { id: 'vac', a: 656, b: 702 },       // Quand le canari vacillait,
  { id: 'fuite', a: 703, b: 800 },     // les mineurs lâchaient leurs pioches et couraient vers la sortie.
  { id: 'sauf', a: 801, b: 890 },      // Sauf que… le plus étonnant, c'est la suite.
  { id: 'cage', a: 891, b: 1010 },     // Ils ont inventé une minuscule cage avec une bouteille d'oxygène.
  { id: 'valve', a: 1011, b: 1125 },   // Un tour de valve, et le canari se réveillait, prêt à repartir.
  { id: 'sent', a: 1126, b: 1229 },    // Cette sentinelle a travaillé en Angleterre
  { id: 'wide', a: 1230, b: 1300 },    // jusqu'en mille neuf cent quatre-vingt-six.
  { id: 'fin', a: 1301, b: 1372 },     // Le premier à tomber dans la mine était toujours le premier qu'on sauvait.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const SH = Object.fromEntries(SHOTS.map((s) => [s.id, s]));

// ---------- lumière : une ambiance par acte ----------
const LAMPE = mood('lampe', { hemi: 1.45, sunI: 3.1, ao: 0.6 });
export const lightFor = (S, f) => {
  if (f < 1080) return LAMPE;
  if (f < 1180) return blendMood(LAMPE, 'dore', ramp(f, 1090, 1170));
  return mood('dore');
};

// ---------- lieux ----------
const MX = 30;
const HK = [0, 0, 0.3];                                          // accroche : le héros et sa cage
const G1 = [-4, 0, 0.35], G2 = [-6.9, 0, 0.2], G3 = [-9.5, 0, 0.45];   // mineurs au travail dans le gaz
const MA = [-6, 0, 0.3], MB = [-4.8, 0, 0.4];                     // le mineur qui s'endort, le héros qui le retient
const HA = [-21.7, 0, 0.25], HR = [-20.7, 0, 0.4], HM = [-19.6, 0, 0.3];   // Haldane, le héros, le 2e mineur (éboulis)
const BLAST = [-23.5, 0.4, -0.6];
const RUN0 = 9.5;                                                  // départ de la course (x)
const FIN = [41, 0, 0.5];                                          // fin : dehors, lumière dorée
const rad = (d) => (d * Math.PI) / 180;
const rel = (at, yaw, dx, dy, dz) => { const a = rad(yaw); return [at[0] + dx * Math.cos(a) + dz * Math.sin(a), at[1] + dy, at[2] - dx * Math.sin(a) + dz * Math.cos(a)]; };
const mid = (a, b) => [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2];

// position du héros par plan (le héros est toujours l'orange au casque jaune)
const heroPos = (f) => {
  const id = shotAt(f).id;
  switch (id) {
    case 'hook': return HK;
    case 'gaz': return G1;
    case 'monox': return MB;
    case 'expl': return [-16.5, 0, 0.5];
    case 'hald': case 'oiseau': case 'vac': return HR;
    case 'fuite': return [RUN0 + run(f, 703, 5.2).dist, 0, 0.4];
    case 'sauf': case 'cage': case 'valve': return [RUN0 + run(800, 703, 5.2).dist, 0, 0.4];
    case 'sent': return [27.5 + Math.max(0, f - 1126) * 0.052, 0, 0.45];
    case 'wide': return [27.5 + (1229 - 1126) * 0.052 + Math.max(0, f - 1230) * 0.045, 0, 0.45];
    default: return FIN;
  }
};
const SAUF = [RUN0 + run(800, 703, 5.2).dist, 0, 0.4];   // ~ x = 26.3

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const KC = (f, at, d, yaw, o = {}, e = {}) => { const a = rad(yaw); return { f, pos: [at[0] + d * Math.sin(a), at[1] + (o.h ?? 0), at[2] + d * Math.cos(a)], look: [at[0] + (o.lx || 0), at[1] + (o.ly || 0), at[2]], fov: o.fov ?? 40, ...e }; };
const sh = (at, dx = 0) => [at[0] + dx, at[1], at[2]];
// cage tenue par le héros (position monde du centre de la cage) selon le plan
const CAGE = {
  hook: { dx: 0.42, dy: 0.92, dz: 1.25, yaw: -18, s: 1.0 },
  oiseau: { dx: 0.55, dy: 1.0, dz: 1.3, yaw: -8, s: 1.3 },
  fuite: { dx: 0.85, dy: 1.0, dz: 0.5, yaw: 0, s: 0.95 },
  vac: { dx: 0.5, dy: 1.0, dz: 1.25, yaw: -10, s: 1.1 },
  sauf: { dx: 0.55, dy: 0.98, dz: 0.9, yaw: -16, s: 1.15 },
  cage: { dx: 0.7, dy: 1.15, dz: 1.6, yaw: 0, s: 1.4 },
  valve: { dx: 0.7, dy: 1.15, dz: 1.6, yaw: 0, s: 1.4 },
  sent: { dx: 0.85, dy: 0.95, dz: 0.6, yaw: -30, s: 0.95 },
  wide: { dx: 0.85, dy: 0.95, dz: 0.6, yaw: 0, s: 0.95 },
  fin: { dx: 0.42, dy: 0.92, dz: 1.25, yaw: -18, s: 1.0 },
};
const cageAt = (id, hp) => { const c = CAGE[id]; return rel(hp, c.yaw, c.dx, c.dy, c.dz); };

const CAMS = {
  hook: [K(0, rel(HK, -18, 0.3, 0, 0), { headW: 0.31, yaw: -18, frameY: 0.34 }, {}), K(124, rel(HK, -10, 0.3, 0, 0), { headW: 0.33, yaw: -10, frameY: 0.34 }, { ease: 'smooth' })],
  gaz: [K2(125, G1, G2, { yaw: -12, headW: 0.26 }), K2(245, G3, G2, { yaw: 14, headW: 0.26 }, { ease: 'smooth' })],
  monox: [K2(246, MA, MB, { yaw: -22, headW: 0.28 }), K2(370, MA, MB, { yaw: 8, headW: 0.31 }, { ease: 'smooth' })],
  expl: [K(371, [-19, 0, 0.4], { headW: 0.1, yaw: 88, frameY: 0.45 }), K(416, [-19.5, 0, 0.4], { headW: 0.13, yaw: 84, frameY: 0.45 }, { ease: 'easeOut' })],
  hald: [K2(417, HA, HR, { yaw: -26, headW: 0.27 }), K2(535, HA, HR, { yaw: 4, headW: 0.3 }, { ease: 'smooth' })],
  oiseau: [K(536, rel(HR, 0, 0.2, 0, 0), { headW: 0.27, yaw: 4, frameY: 0.38 }), K(655, rel(HR, -8, 0.4, 0, 0), { headW: 0.31, yaw: -10, frameY: 0.36 })],
  vac: [K(656, rel(HR, -10, 0.4, 0, 0), { headW: 0.31, yaw: -10, frameY: 0.34 }), K(702, rel(HR, -10, 0.4, 0, 0), { headW: 0.36, yaw: -10, frameY: 0.34 }, { ease: 'easeOut' })],
  sauf: [K(801, rel(SAUF, -24, 0.3, 0, 0), { headW: 0.3, yaw: -24 }), K(890, rel(SAUF, -12, 0.35, 0, 0), { headW: 0.34, yaw: -12 }, { ease: 'easeOut' })],
  cage: [K(891, SAUF, { headW: 0.12, yaw: 0 }), K(1010, SAUF, { headW: 0.12, yaw: 0 })],   // remplacé dans camAt (plan serré sur la cage)
  valve: [K(1011, SAUF, { headW: 0.12, yaw: 0 }), K(1125, SAUF, { headW: 0.12, yaw: 0 })],  // idem
  sent: [K(1126, [27.5, 0, 0.45], { headW: 0.3, yaw: -30 }), K(1229, [32.5, 0, 0.45], { headW: 0.3, yaw: -10 })],
  wide: [{ f: 1230, pos: [28.5, 1.7, 7.0], look: [36.5, 1.7, 0], fov: 44 }, { f: 1300, pos: [31.5, 2.4, 7.4], look: [41, 3.6, -3], fov: 44, ease: 'smooth' }],
  fin: [K(1301, rel(FIN, -18, 0.3, 0, 0), { headW: 0.31, yaw: -18, frameY: 0.34 }), K(1372, rel(FIN, -10, 0.3, 0, 0), { headW: 0.33, yaw: -10, frameY: 0.34 })],
};
const KICKS = [{ f: 801, a: 0.04 }, { f: 1033, a: 0.025 }];
// transitions : la caméra voyage au lieu de couper (le changement est caché par la vitesse et le flou)
const TRANS = [
  ['whip', 'hook', 'gaz', 1], ['push', 'gaz', 'monox'], ['whip', 'monox', 'expl', -1], ['push', 'expl', 'hald'], ['rise', 'hald', 'oiseau'], ['push', 'oiseau', 'vac'],
  ['whip', 'vac', 'fuite', 1], ['push', 'fuite', 'sauf'], ['push', 'sauf', 'cage'], ['drop', 'cage', 'valve'], ['rise', 'valve', 'sent'], ['push', 'sent', 'wide'], ['drop', 'wide', 'fin'],
];
const N_TR = 10;
const baseCam = (id, f) => {
  if (id === 'fuite') return follow((g) => { const p = [RUN0 - 0.9 + run(g, 703, 5.2).dist, 0, 0.4]; return p; }, f, { headW: 0.17, yaw: -8, lag: 2, lead: 0.5 });
  if (id === 'cage' || id === 'valve') {
    const c = cageAt(id, SAUF), t = id === 'cage' ? ramp(f, 891, 1010) : ramp(f, 1011, 1125);
    // plan serré : la cage (et son canari) remplit le cadre, puis on recule sur le héros
    const keys = id === 'cage'
      ? [KC(891, c, 3.7, 3, { lx: 0.02, ly: -0.12 }), KC(965, c, 3.4, -3, { lx: 0.02, ly: -0.12 }), K2(1010, [SAUF[0] - 1.1, 0, 0.5], rel(SAUF, 0, 0.7, 0, 0), { headW: 0.25, yaw: -6 })]
      : [K2(1011, [SAUF[0] - 1.1, 0, 0.5], rel(SAUF, 0, 0.7, 0, 0), { headW: 0.25, yaw: -6 }), KC(1030, c, 3.5, 4, { lx: 0.02, ly: -0.12 }), KC(1125, c, 3.2, -3, { lx: 0.02, ly: -0.12 })];
    return camFromKeys(keys, f, { kicks: id === 'valve' ? [{ f: 1038, a: 0.03 }] : [] });
  }
  return camFromKeys(CAMS[id], f, { kicks: KICKS });
};
const first = (id) => SH[id].a, last = (id) => SH[id].b;
export const camAt = (f) => {
  for (const [type, from, to, dir] of TRANS) {
    const f0 = SH[to].a - N_TR / 2;
    if (f >= f0 && f < f0 + N_TR) return transition(type, baseCam(from, last(from)), baseCam(to, first(to)), f, f0, N_TR, { dir: dir || 1 });
  }
  let c = baseCam(shotAt(f).id, f);
  c = shake(c, f, 371, 0.22, 22);                // l'explosion
  c = shake(c, f, 396, 0.1, 14);                 // 2e secousse (éboulement)
  c = shake(c, f, 703, 0.05, 10);                // départ de la course
  if (f >= 371 && f < 377) c = { ...c, flash: (1 - (f - 371) / 6) * 0.9 };
  return c;
};

// ---------- mise au point ----------
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), id = S.id;
  let t;
  if (id === 'expl' || id === 'wide') return { focus: dist3(C.pos, [C.look[0], 1.0, C.look[2]]), cinf: 3 };
  if (id === 'cage' || id === 'valve') t = cageAt(id, SAUF);
  else if (id === 'hook' || id === 'fin') t = cageAt(id, id === 'hook' ? HK : FIN);
  else t = heroPos(f);
  return { focus: dist3(C.pos, [t[0], id === 'cage' || id === 'valve' || id === 'hook' || id === 'fin' ? t[1] : 1.4, t[2]]), cinf: id === 'cage' || id === 'valve' ? 6 : id === 'fuite' ? 3 : 9 };
};

// ---------- état du monde ----------
export const worldAt = (f) => ({ lampGlow: 1 });

// ---------- effets 3D ----------
const GAS = '#8fd36a';
export const envAt = (f) => {
  const id = shotAt(f).id, e = {};
  if (f < 1160) e.motes = id === 'expl' ? 0.2 : 0.55;
  const smoke = [], sparks = [], embers = [], spray = [];
  if (id === 'hook') smoke.push({ at: [HK[0] + 0.4, 0.05, 0.8], f0: 0, f1: 124, rate: 4, col: GAS, size: 0.9, rise: 0.05 });
  if (id === 'gaz') for (let x = -14; x <= 4; x += 3) smoke.push({ at: [x + (f - 125) * 0.035, 0.12, 0.8 + (x % 2) * 0.3], f0: 100, f1: 250, rate: 8, col: GAS, size: 1.5, rise: 0.04 });
  if (id === 'monox') for (let x = -11; x <= -2; x += 2.2) smoke.push({ at: [x, 0.15, 0.9], f0: 230, f1: 375, rate: 9, col: GAS, size: 1.6, rise: 0.06 });
  if (id === 'expl' || (id === 'hald' && f < 470)) {
    smoke.push({ at: BLAST, f0: 371, f1: 470, rate: 22, col: '#3a302e', size: 3.4, rise: 1.4 }, { at: [BLAST[0] + 3, 0.2, 0.2], f0: 375, f1: 470, rate: 7, col: '#6a5a50', size: 1.6, rise: 0.5 });
    sparks.push({ at: BLAST, f0: 371, f1: 392, rate: 150, col: '#ffb040', speed: 6, size: 0.16 });
    embers.push({ at: BLAST, f0: 371, f1: 540, rate: 20, col: '#ff8a2a' });
    spray.push({ at: BLAST, f0: 371, n: 220, power: 7, col: '#6a5a50' }, { at: [BLAST[0] + 2, 0.2, 0.4], f0: 396, n: 120, power: 5, col: '#7a6a5e' });
  }
  if (id === 'hald' && f >= 470) embers.push({ at: [BLAST[0] + 0.5, 0.3, -0.4], f0: 371, f1: 540, rate: 10, col: '#ff8a2a' });
  if (id === 'oiseau' || id === 'vac') {
    const cx = cageAt(id, HR)[0];
    smoke.push({ at: [cx + 2.2, 0.35, 0.9], f0: 520, f1: 700, rate: 8, col: GAS, size: 0.9, rise: 0.1 }, { at: [cx + 1.5, 0.5, 0.7], f0: 560, f1: 700, rate: 8, col: GAS, size: 0.7, rise: 0.15 }, { at: [cx + 0.9, 0.7, 0.8], f0: 600, f1: 700, rate: 6, col: GAS, size: 0.6, rise: 0.15 });
  }
  if (id === 'fuite') { const hx = heroPos(f)[0]; smoke.push({ at: [hx - 1.5, 0.1, 0.4], f0: 703, f1: 800, rate: 15, col: '#8a7a6a', size: 0.9, rise: 0.2 }); embers.length = 0; }
  if (id === 'valve') smoke.push({ at: [cageAt('valve', SAUF)[0] + 0.3, cageAt('valve', SAUF)[1] - 0.35, 1.2], f0: 1036, f1: 1060, rate: 24, col: '#f2f6fa', size: 0.35, rise: 0.3 });
  if (f >= 1126 && id !== 'fin') e.motes = 0.3;
  if (smoke.length) e.smoke = smoke; if (sparks.length) e.sparks = sparks; if (embers.length) e.embers = embers; if (spray.length) e.spray = spray;
  return e;
};

// ---------- casting (nouveau à chaque épisode) ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  // le héros : mineur gallois moustachu, veste orange, casque jaune à lampe
  O.mineur = { tunic: '#ff7a1a', skin: '#d9a070', hat: 'minerH', hatCol: '#f2c230', moustache: '#3a2418', brows: '#3a2418' };
  O.mineurB = { tunic: '#18b8d8', skin: '#8a5a3a', hat: 'minerH', hatCol: '#e8e8ee', stout: true };
  O.haldane = { tunic: '#f1ede2', skin: '#f1c9a4', hair: '#b8501f', beard: '#b8501f', brows: '#b8501f', apron: '#d9cdb0' };
  O.mineurC = { tunic: '#c8312c', skin: '#f1c9a4', hat: 'minerH', hatCol: '#f2c230', moustache: '#8a5a30' };
  O.mineurD = { tunic: '#7b4fb8', skin: '#e9b98f', hat: 'minerH', hatCol: '#d9822a', stout: true };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };

// ---------- cartes (toile de conception 600 x 1000, contenu autour de y = 520) ----------
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const ellipse = (g, x, y, rx, ry, fill, lw = 9, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.283); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const poly = (g, pts, fill, lw = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };

/** le canari, origine aux pattes ; eye 'open' | 'spiral' | 'closed' ; wing angle (rad) ; beak 0..1 ; breath (échelle du torse) */
function bird(g, { eye = 'open', wing = 0, beak = 0, breath = 1 } = {}) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  poly(g, [[-46, -34], [-112, -14], [-104, -46], [-54, -58]], '#e8b01e', 8);
  g.strokeStyle = '#d9822a'; g.lineWidth = 8; for (const x of [-10, 14]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -16); g.stroke(); }
  ellipse(g, 0, -50, 60, 48 * breath, '#ffd93a', 10);
  ellipse(g, 12, -40, 36, 28 * breath, '#ffee8a', 0);
  g.save(); g.translate(-16, -56); g.rotate(wing); ellipse(g, -6, 0, 38, 20, '#f0b81c', 8, 0.15); g.restore();
  ellipse(g, 32, -102, 36, 34, '#ffd93a', 10);
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(20, -132); g.lineTo(14, -150); g.moveTo(32, -135); g.lineTo(34, -155); g.moveTo(44, -132); g.lineTo(54, -148); g.stroke();
  const by = -100 + beak * 4;
  poly(g, [[62, by - 6], [94, by + 4 + beak * 6], [62, by + 6 + beak * 5]], '#ff8a1c', 6); if (beak > 0.2) poly(g, [[62, by + 7], [86, by + 14 + beak * 8], [62, by + 16]], '#ff6a1c', 5);
  g.save(); g.globalAlpha = 0.45; ellipse(g, 38, -84, 11, 7, '#ff8fa0', 0); g.restore();
  const ex = 46, ey = -112;
  if (eye === 'open') { ellipse(g, ex, ey, 12, 13, '#fff', 4); ellipse(g, ex + 3, ey + 2, 6.5, 7, INK, 0); ellipse(g, ex + 1, ey - 2, 2.2, 2.2, '#fff', 0); }
  else if (eye === 'closed') { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(ex, ey, 11, 0.15, Math.PI - 0.15); g.stroke(); }
  else { ellipse(g, ex, ey, 14, 14, '#fff', 4); g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); for (let a = 0; a < 12; a += 0.4) { const r = 1 + a * 0.95; g.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); } g.stroke(); }
}
/** état du canari dans la cage : mode + progression */
function birdState(f, id) {
  const sw = Math.sin(f * 0.13) * 0.035;
  switch (id) {
    case 'hook': if (f < 8) return { m: 'perch', sw, breath: 1 + 0.05 * Math.sin(f * 0.9) }; if (f < 30) return { m: 'wobble', t: ramp(f, 8, 30) }; if (f < 42) return { m: 'fall', t: ramp(f, 30, 42) }; return { m: 'dizzy', t: (f - 42) / 30 };
    case 'oiseau': return f < 618 ? { m: 'perch', sw, breath: 1 + 0.12 * Math.sin(f * 1.5) } : { m: 'wobble', t: ramp(f, 618, 655) * 0.5 };
    case 'vac': if (f < 676) return { m: 'wobble', t: 0.45 + 0.5 * ramp(f, 656, 676) }; if (f < 692) return { m: 'fall', t: ramp(f, 676, 692) }; return { m: 'dizzy', t: (f - 692) / 30 };
    case 'fuite': case 'sauf': return { m: 'dizzy', t: f / 30 };
    case 'cage': return { m: 'sleep', t: f / 30 };
    case 'valve': if (f < 1045) return { m: 'sleep', t: f / 30 }; if (f < 1076) return { m: 'revive', t: ramp(f, 1045, 1076) }; return { m: 'happy', t: (f - 1076) / 30 };
    default: return { m: 'happy', t: f / 30 };
  }
}
function cageCard(p, st, bottle = 0, valveRot = 0, hose = 0) {
  const g = p.g, cx = 270; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  // arrière : plateau + perchoir
  g.strokeStyle = INK; g.lineWidth = 15; g.beginPath(); g.arc(cx, 378, 30, 0, 6.283); g.stroke(); g.strokeStyle = '#e0b040'; g.lineWidth = 8; g.stroke();
  ellipse(g, cx, 706, 156, 36, '#7a4a28', 10);
  ellipse(g, cx, 690, 150, 30, '#b07a44', 0);
  g.strokeStyle = INK; g.lineWidth = 17; g.beginPath(); g.moveTo(cx - 118, 618); g.lineTo(cx + 118, 618); g.stroke(); g.strokeStyle = '#9a6a3a'; g.lineWidth = 9; g.stroke();
  // barreaux (devant)
  const bars = 7;
  for (let i = 0; i < bars; i++) { const u = i / (bars - 1) * 2 - 1, xb = cx + u * 142, xt = cx + u * 50;
    for (const [col, lw] of [[INK, 11], ['#e0b040', 5.5]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(xb, 700); g.lineTo(xt, 410); g.stroke(); } }
  ellipse(g, cx, 700, 146, 22, null, 9); g.strokeStyle = '#e0b040'; g.lineWidth = 4.5; g.beginPath(); g.ellipse(cx, 700, 146, 22, 0, 0, 6.283); g.stroke();
  ellipse(g, cx, 520, 98, 15, null, 9); g.strokeStyle = '#e0b040'; g.lineWidth = 4.5; g.beginPath(); g.ellipse(cx, 520, 98, 15, 0, 0, 6.283); g.stroke();
  ellipse(g, cx, 410, 52, 11, '#e0b040', 9);
  // le canari
  g.save();
  const m = st.m, t = st.t ?? 0, fx = cx - 4;
  let px = fx, py = 618, rot = 0, eye = 'open', wing = 0, beak = 0, breath = st.breath || 1;
  if (m === 'perch') rot = st.sw;
  else if (m === 'wobble') { rot = Math.sin(t * 22) * (0.06 + 0.2 * t); eye = t > 0.7 ? 'spiral' : 'open'; py += 4 * t; }
  else if (m === 'fall') { rot = -1.35 * E.easeIn(t) + Math.sin(t * 9) * 0.1; py = 618 + 56 * E.easeIn(t); px = fx + 14 * t; eye = 'spiral'; wing = -0.8 * Math.sin(t * 6); }
  else if (m === 'dizzy') { rot = -1.35 + 0.03 * Math.sin(t * 8); py = 672; px = fx + 14; eye = 'spiral'; breath = 1 + 0.03 * Math.sin(t * 6); }
  else if (m === 'sleep') { rot = -1.35; py = 672; px = fx + 14; eye = 'closed'; breath = 1 + 0.05 * Math.sin(t * 3.2); }
  else if (m === 'revive') { const u = E.back(t, 1.2); rot = -1.35 * (1 - u); py = lerp(672, 618, E.easeOut(t)) - 40 * Math.sin(t * Math.PI) * (t > 0.5 ? 1 : 0); px = lerp(fx + 14, fx, u); eye = t > 0.18 ? 'open' : 'closed'; wing = Math.sin(t * 44) * 0.7 * (t > 0.35 ? 1 : 0); beak = t > 0.5 ? 0.8 : 0; }
  else if (m === 'happy') { rot = Math.sin(t * 5) * 0.04; wing = t < 1.2 ? Math.sin(t * 40) * 0.5 : Math.sin(t * 6) * 0.08; beak = Math.sin(t * 14) > 0.2 ? 0.8 : 0; breath = 1 + 0.04 * Math.sin(t * 7); }
  g.translate(px, py); g.rotate(rot); g.scale(1.1, 1.1); bird(g, { eye, wing, beak, breath }); g.restore();
  if (m === 'dizzy' || m === 'fall') { g.save(); for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1, x = cx + 20 + Math.cos(a) * 74, y = 560 + Math.sin(a) * 18; poly(g, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => { const r = k % 2 ? 6 : 14, b = k * 0.628 - 1.57; return [x + r * Math.cos(b), y + r * Math.sin(b)]; }), '#ffd84a', 4); } g.restore(); }
  if (m === 'sleep') { TXT(g, 'z', cx + 100, 520 - (t * 40) % 40, 52, '#ffffff', 12); TXT(g, 'Z', cx + 140, 470 - (t * 40) % 40, 72, '#ffffff', 14); }
  // bouteille d'oxygène + robinet (se fixe à la cage)
  if (bottle > 0.001) {
    const bx = lerp(600, 474, E.easeOut(bottle)), by = lerp(0, 0, bottle);
    g.save(); g.translate(bx, by);
    g.strokeStyle = INK; g.lineWidth = 8;
    const body = () => { g.beginPath(); g.roundRect(-34, 470, 68, 232, 30); };
    body(); g.fillStyle = '#7f95b0'; g.fill(); g.stroke(); g.fillStyle = '#a8bdd6'; g.beginPath(); g.roundRect(-24, 486, 16, 190, 8); g.fill();
    g.fillStyle = '#e8e8ee'; g.beginPath(); g.roundRect(-34, 560, 68, 36, 6); g.fill(); g.lineWidth = 6; g.stroke(); TXT(g, 'O₂', 0, 590, 34, INK, 0);
    g.fillStyle = '#b08a2a'; g.beginPath(); g.roundRect(-14, 446, 28, 36, 6); g.fill(); g.lineWidth = 7; g.stroke();
    g.save(); g.translate(0, 436); g.rotate(valveRot); ellipse(g, 0, 0, 30, 30, null, 7); g.strokeStyle = '#d23a32'; g.lineWidth = 9; g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * 1.571; g.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); g.lineTo(-Math.cos(a) * 30, -Math.sin(a) * 30); } g.stroke(); ellipse(g, 0, 0, 7, 7, '#d23a32', 4); g.restore();
    g.restore();
    // tuyau vers la cage
    g.strokeStyle = INK; g.lineWidth = 15; g.beginPath(); g.moveTo(bx - 34, 520); g.bezierCurveTo(bx - 70, 540, cx + 160, 580, cx + 112, 600); g.stroke(); g.strokeStyle = '#3a4252'; g.lineWidth = 8; g.stroke();
  }
  g.restore();
}
function pickCard(p) { const g = p.g; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 24; g.beginPath(); g.moveTo(300, 760); g.lineTo(300, 360); g.stroke(); g.strokeStyle = '#8a5e38'; g.lineWidth = 14; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 34; g.beginPath(); g.moveTo(170, 400); g.quadraticCurveTo(300, 330, 430, 400); g.stroke(); g.strokeStyle = '#aab3bd'; g.lineWidth = 20; g.stroke(); }
function bulbCard(p, k) { const g = p.g; g.save(); const s = 0.4 + 0.6 * E.back(clamp(k)); g.translate(300, 540); g.scale(s, s); g.translate(-300, -540); g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = '#ffb81c'; g.lineWidth = 14; for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 8); g.beginPath(); g.moveTo(300 + Math.cos(a) * 150, 480 + Math.sin(a) * 150); g.lineTo(300 + Math.cos(a) * 215, 480 + Math.sin(a) * 215); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(300, 480, 100, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#9aa3ad'; g.beginPath(); g.roundRect(255, 570, 90, 70, 16); g.fill(); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(262, 600); g.lineTo(338, 600); g.stroke(); g.restore(); }
function yearCard(p, k) { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 400, 540, 240, '#271925'); TXT(g, '1986', 300, 570, 170, '#ffd23a', 0); g.restore(); }
function breathCard(p, kind, f) { // « respire vite » (oiseau) / « respire lentement » (mineur) : jauge de poumons qui bat
  const g = p.g; g.save(); panel(g, 60, 410, 480, 200, '#fbf7ec'); const rate = kind === 'bird' ? 1.5 : 0.22, a = 0.5 + 0.5 * Math.sin(f * rate);
  g.strokeStyle = kind === 'bird' ? '#e8942a' : '#2a7a8a'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 40; i++) { const x = 90 + i * 10.5, y = 510 + Math.sin(i * (kind === 'bird' ? 1.1 : 0.28) - f * rate * 0.6) * (kind === 'bird' ? 34 : 38); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); void a; }

// ---------- acteurs ----------
const FXC = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
const hopWalk = (f, seed) => 0.02 * Math.abs(Math.sin(f * 0.4 + seed));

export const actorsAt = (f, T) => {
  const S = shotAt(f), id = S.id, out = [];
  const hero = (o, pos, extra = {}) => out.push(R(T, 'mineur', life(f, 5, o), pos, extra));
  const m2 = (o, pos, extra = {}) => out.push(R(T, 'mineurB', life(f, 9, o), pos, extra));
  const mc = (o, pos, extra = {}) => out.push(R(T, 'mineurC', life(f, 21, o), pos, extra));
  const md = (o, pos, extra = {}) => out.push(R(T, 'mineurD', life(f, 22, o), pos, extra));
  const hal = (o, pos, extra = {}) => out.push(R(T, 'haldane', life(f, 13, o), pos, extra));
  const swing = (f, ph) => (((f + ph) % 24) < 12 ? 'lift' : 'push');
  switch (id) {
    case 'hook': { const t = f > 30 ? 1 : 0; hero({ expr: f < 12 ? 'smile' : f < 30 ? 'nervous' : 'shock', L: 'hip', R: 'reach', look: -0.5 }, HK, f > 30 ? { ...hop(f, 34, 0.12, 8) } : {}); void t; break; }
    case 'gaz': {
      hero({ expr: 'squint', L: 'lift', R: swing(f, 0), holdR: 'tool', look: 0.3 }, G1, { dx: 0.02 * Math.sin(f * 0.52) });
      m2({ expr: 'neutral', L: 'push', R: swing(f, 12), holdR: 'tool', look: -0.3 }, G2, { dx: 0.02 * Math.sin(f * 0.52 + 2) });
      mc({ expr: 'grin', L: 'lift', R: swing(f, 6), holdR: 'tool', look: 0.3 }, G3, {});
      break; }
    case 'monox': {
      const k = E.smooth(ramp(f, 300, 365)), yaw = f > 316 ? 1 : 0;
      m2({ expr: f < 280 ? 'neutral' : f < 320 ? 'squint' : 'snore', L: f < 280 ? 'hip' : 'belly', R: f < 280 ? 'hip' : 'cheek', look: 0.3, tilt: 2 + 10 * k }, MA, { roll: -0.5 * k, dx: 0.22 * k });
      hero({ expr: f < 300 ? 'neutral' : 'shock', L: f < 300 ? 'hip' : 'reach', R: f < 300 ? 'hip' : 'reach', look: -0.5 }, MB, f < 300 ? {} : { ...hop(f, 322, 0.08, 8) });
      void yaw; break; }
    case 'expl': {
      const k = ramp(f, 371, 400);
      hero({ expr: 'shock', L: 'head', R: 'head', look: -0.6, tilt: -8 * E.easeOut(k) }, [-16.5, 0, 0.5], { dx: 0.35 * E.easeOut(k), ...tremble(f, 0.01, 1) });
      m2({ expr: 'shock', L: 'head', R: 'head', look: -0.6 }, [-15.4, 0, 0.35], { dx: 0.3 * E.easeOut(k), ...tremble(f, 0.01, 3) });
      md({ expr: 'shock', L: 'up', R: 'up', look: -0.6 }, [-18.8, 0, 0.6], { ...fallOver(f, 380, -1) });
      break; }
    case 'hald': {
      hal({ expr: f > 470 ? 'grin' : 'squint', L: 'hip', R: f > 470 ? 'up' : 'point', look: 0.4 }, HA, f > 470 ? { ...hop(f, 472, 0.1, 8) } : {});
      hero({ expr: f > 470 ? 'smile' : 'nervous', L: 'hip', R: 'reach', look: -0.5 }, HR, {});
      m2({ expr: 'nervous', L: 'cheek', R: 'hip', look: -0.4 }, HM, {});
      break; }
    case 'oiseau': {
      hero({ expr: f < 618 ? 'smile' : 'smile', L: 'hip', R: 'reach', look: 0.6 }, HR, {});
      hal({ expr: 'grin', L: 'hip', R: 'point', look: 0.5 }, HA, {});
      break; }
    case 'vac': hero({ expr: f < 676 ? 'nervous' : 'shock', L: 'hip', R: 'reach', look: 0.7 }, HR, f > 690 ? { ...hop(f, 692, 0.1, 8) } : { ...tremble(f, 0.008, 2) }); break;
    case 'fuite': {
      const r = run(f, 703, 5.2), x0 = RUN0;
      const pose = (f - 703 < 8) ? { L: 'up', R: 'up' } : { L: 'flail', R: 'hip' };
      hero({ expr: 'shock', ...pose, R: 'reach', step: q(r.step, 2), run: true, bob: q(r.bob, 3), tilt: 8, look: 0.5, wv: f * 0.5 }, [x0 + r.dist, 0, 0.4], {});
      m2({ expr: 'pained', L: 'flail', R: 'flail', step: q((r.step + 0.3) % 1, 2), run: true, tilt: 8, look: 0.4, wv: f * 0.5 }, [x0 - 1.3 + run(f, 706, 5.0).dist, 0, 0.25], { dy: run(f, 706, 5.0).bob });
      mc({ expr: 'shock', L: 'head', R: 'head', step: q((r.step + 0.6) % 1, 2), run: true, tilt: 8, look: 0.4 }, [x0 - 2.7 + run(f, 710, 4.9).dist, 0, 0.5], { dy: run(f, 710, 4.9).bob });
      md({ expr: 'nervous', L: 'flail', R: 'flail', step: q((r.step + 0.15) % 1, 2), run: true, tilt: 8, look: 0.4, wv: f * 0.5 + 1 }, [x0 - 4.1 + run(f, 714, 4.8).dist, 0, 0.15], { dy: run(f, 714, 4.8).bob });
      break; }
    case 'sauf': hero({ expr: f < 830 ? 'neutral' : 'grin', L: 'hip', R: 'reach', look: f < 830 ? 0.4 : -0.1 }, SAUF, {}); m2({ expr: f < 830 ? 'shock' : 'smile', L: 'cheek', R: 'hip', look: 0.4 }, [SAUF[0] - 1.1, 0, 0.5], {}); break;
    case 'cage': hero({ expr: 'grin', L: 'hip', R: 'reach', look: 0.4 }, SAUF, {}); m2({ expr: 'smile', L: 'hip', R: 'hip', look: 0.4 }, [SAUF[0] - 1.1, 0, 0.5], {}); break;
    case 'valve': hero({ expr: f < 1045 ? 'squint' : 'laugh', L: 'hip', R: f < 1045 ? 'reach' : 'up', look: 0.5 }, SAUF, f > 1045 ? { ...hop(f, 1046, 0.14, 10) } : {}); m2({ expr: f < 1045 ? 'nervous' : 'laugh', L: 'cheek', R: 'hip', look: 0.4 }, [SAUF[0] - 1.1, 0, 0.5], f > 1076 ? { ...hop(f, 1078, 0.1, 8) } : {}); break;
    case 'sent': case 'wide': {
      const hp = heroPos(f), w = Math.min(1, ((f - 1126) / 12)), step = (((f - 1126) * 0.052 / 0.55) % 1);
      hero({ expr: 'smile', L: 'hip', R: 'reach', step: q(step, 2), bob: q(0.012 + 0.012 * Math.abs(Math.sin(step * 6.283)), 3), look: 0.3 }, hp, {});
      m2({ expr: 'grin', L: 'hip', R: 'thumb', step: q((step + 0.5) % 1, 2), look: -0.3 }, [hp[0] - 1.25, 0, 0.7], {});
      mc({ expr: 'smile', L: 'hip', R: 'hip', step: q((step + 0.25) % 1, 2), look: -0.3 }, [hp[0] - 2.5, 0, 0.2], {});
      if (id === 'wide') md({ expr: 'grin', L: 'hip', R: 'wave', wv: f * 0.3, look: -0.2 }, [hp[0] + 2.6, 0, 1.1], {});
      void w; break; }
    case 'fin': hero({ expr: f > 1345 ? 'smile' : 'grin', L: 'hip', R: 'reach', look: -0.5 }, FIN, {}); break;
  }
  // cage tenue par le héros (en vedette quand c'est l'objet de la phrase)
  if (CAGE[id]) {
    const c = CAGE[id], hp = heroPos(f), st = birdState(f, id), s = c.s;
    let pos = cageAt(id, hp), bounce = 0;
    if (id === 'fuite') { pos = rel(heroPos(f), 0, 0.85, 1.0, 0.5); bounce = run(f, 703, 5.2).bob; }
    if (id === 'cage') { const bt = E.smooth(ramp(f, 905, 975)); out.push(FXC('cg' + q(bt, 2) + st.m + q(st.t || 0, 1), (p) => cageCard(p, st, bt, 0), pos, s, { order: 6, id: 'cage' })); }
    else if (id === 'valve') { const rot = E.smooth(ramp(f, 1020, 1041)) * 6.283 * 1.2, key = q(rot, 1) + st.m + q(st.t || 0, 2); out.push(FXC('cv' + key, (p) => cageCard(p, st, 1, rot), pos, s, { order: 6, id: 'cage' })); }
    else if (id === 'fuite' || id === 'sauf') out.push(FXC('cs' + st.m + q(st.t || 0, 1), (p) => cageCard(p, st), [pos[0], pos[1] + bounce, pos[2]], s, { order: 6, id: 'cage' }));
    else out.push(FXC('c' + id + st.m + q(st.t || 0, 2) + q(st.sw || 0, 2) + q(st.breath || 0, 2), (p) => cageCard(p, st), pos, s, { order: 6, id: 'cage' }));
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), id = S.id, out = [];
  if (id === 'expl' && f < 400) { const t = q(ramp(f, 371, 400), 2); out.push(FXC('bl' + t, (p) => T.fxBurst(p, t, '#ffb040', 14, 50, 260), [BLAST[0] + 0.6, 1.8, -0.2], 4.2)); }
  if (id === 'hald' && f > 468) { const k = ramp(f, 470, 492); out.push(FXC('bulb' + q(k, 1), (p) => bulbCard(p, k), [HA[0] + 0.5, 2.25, 0.3], 0.55 * (0.5 + 0.5 * clamp(k)))); }
  if (id === 'oiseau') {
    const a = f < 600 ? 1 : 0;
    out.push(FXC('bb' + q(f / 3, 0), (p) => breathCard(p, 'bird', f), [cageAt('oiseau', HR)[0], 2.45, cageAt('oiseau', HR)[2]], 0.5));
    out.push(FXC('bh' + q(f / 3, 0), (p) => breathCard(p, 'man', f), [HR[0] - 0.1, 2.45, 0.5], 0.5)); void a;
  }
  if (id === 'fuite' && f < 728) { for (const [i, x] of [[0, 0], [1, -1.3], [2, -2.7]]) { const t = ramp(f, 704 + i * 3, 724 + i * 3), p0 = [RUN0 + x + 0.2, 1.1, 0.5], y = lerp(p0[1], 0.15, E.easeIn(t)), rot = t * 2.2 + i;
    out.push(FXC('pk' + i + q(t, 2), (p) => { p.g.save(); p.g.translate(300, 520); p.g.rotate(rot); p.g.translate(-300, -520); pickCard(p); p.g.restore(); }, [p0[0] + t * 0.3, y, p0[2] + 0.2], 0.4, { order: 6 })); } }
  if (id === 'sent' || id === 'wide') { if (f > 1215) { const k = ramp(f, 1218, 1246); out.push(FXC('yr' + q(k, 1), (p) => yearCard(p, k), [heroPos(f)[0] + (id === 'wide' ? 2.2 : 0.4), id === 'wide' ? 4.0 : 2.55, 0.6], (id === 'wide' ? 1.15 : 0.55) * (0.5 + 0.5 * clamp(k)))); } }
  if (id === 'fin' && f > 1330) { const t = q(((f - 1330) % 40) / 40, 2); out.push(FXC('nt' + t, (p) => T.fxNote ? T.fxNote(p, 'a') : 0, [FIN[0] + 0.7, 2.3, 0.8], 0.45)); }
  return out;
};
