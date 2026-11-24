// « La pénicilline de Fleming » (1928) — 42,2 s, 30 fps, 1267 images. Cadres calés sur phrases.json (whisper).
// Labo de Londres (library/labolondres.js) : paillasse z = -2.7, boîte vedette en (0, 1, -2.3). Hôpital en x = 60.
// Héros : Alexander Fleming (blouse blanche, nœud papillon rouge, lunettes rondes, moustache). Secondaires : un assistant (pull moutarde), 2 chercheurs.
// Accroche et dernière image : la boîte de Petri géante, moisissure et cercle vide qui grandissent (la fin reboucle).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, follow, transition, crane, crowd, fgCard, popIn } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1267, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 144 },        // Ce savant a oublié de ranger son labo… et ça a sauvé des millions de vies.
  { id: 'londres', a: 145, b: 215 },   // À Londres, en mille neuf cent vingt-huit,
  { id: 'boites', a: 216, b: 302 },    // Alexander Fleming cultive des microbes dans des boîtes.
  { id: 'vacances', a: 303, b: 379 },  // Un matin d'été, il part en vacances sans tout nettoyer.
  { id: 'retour', a: 380, b: 435 },    // Quand il revient,
  { id: 'moisi', a: 436, b: 516 },     // une moisissure a poussé sur l'une des boîtes.
  { id: 'vide', a: 517, b: 575 },      // Autour d'elle, les microbes ont disparu.
  { id: 'cercle', a: 576, b: 617 },    // Il reste un grand cercle vide.
  { id: 'comprend', a: 618, b: 728 },  // Fleming comprend que cette moisissure tue les bactéries.
  { id: 'nom', a: 729, b: 797 },       // Il l'appelle pénicilline.
  { id: 'sauf', a: 798, b: 905 },      // Sauf que… personne ne sait en fabriquer assez pour soigner quelqu'un.
  { id: 'ans', a: 906, b: 960 },       // Il faudra dix ans
  { id: 'cuves', a: 961, b: 1020 },    // et d'autres chercheurs pour en faire un médicament.
  { id: 'nobel', a: 1021, b: 1121 },   // Fleming partagera le prix Nobel en mille neuf cent quarante-cinq.
  { id: 'fin', a: 1122, b: 1266 },     // Alors, quand on te dit de ranger ton bazar… (reprise du plan d'ouverture : la fin reboucle)
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const HERO = [0, 1.0, -2.3], FL = [0.95, 0, -1.5], WX = 60;
const hash = (i, k, seed = 1) => { const x = Math.sin((i + 1) * 12.9898 * (k + 1) + seed * 78.233) * 43758.5453; return x - Math.floor(x); };

// ---------- lumière : une ambiance par acte ----------
const DAY = mood('jour', { exposure: 1.08 });
const MATIN = mood('matin', { exposure: 1.22, gamma: 1.12 });
const DORE = mood('dore', { exposure: 1.12 });
const FROID = mood('froid', { exposure: 1.1 });
const LAMP = mood('lampe', { exposure: 1.3, gamma: 1.35 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'vacances': return blendMood(DAY, MATIN, ramp(f, 330, 379));
    case 'retour': return MATIN;
    case 'moisi': return blendMood(MATIN, DAY, ramp(f, 436, 470));
    case 'comprend': return blendMood(DAY, DORE, ramp(f, 680, 728));
    case 'nom': return DORE;
    case 'sauf': return blendMood(DORE, FROID, ramp(f, 798, 818));
    case 'ans': return blendMood(FROID, LAMP, ramp(f, 906, 930));
    case 'cuves': return LAMP;
    case 'nobel': return blendMood(LAMP, DORE, ramp(f, 1021, 1050));
    case 'fin': return blendMood(DORE, DAY, ramp(f, 1122, 1150));
    default: return DAY;
  }
};
const TINTS = { vacances: '#fff4dc', retour: '#ffeede', nom: '#ffe8c8', comprend: '#fff2dc', sauf: '#f2f6ff', ans: '#ffe6c4', cuves: '#ffe2bc', nobel: '#ffe9c6' };
const tintOf = (S) => TINTS[S.id] || '#fff8ee';

// ---------- déplacements ----------
const route = (f, pts) => {
  if (f <= pts[0][0]) return { x: pts[0][1], z: pts[0][2], mv: false };
  for (let i = 1; i < pts.length; i++) if (f <= pts[i][0]) { const [f0, x0, z0] = pts[i - 1], [f1, x1, z1] = pts[i], t = (f - f0) / (f1 - f0); return { x: lerp(x0, x1, t), z: lerp(z0, z1, t), mv: Math.abs(x1 - x0) + Math.abs(z1 - z0) > 0.01 }; }
  const l = pts[pts.length - 1]; return { x: l[1], z: l[2], mv: false };
};
const stepOf = (x, z = 0) => q(((x + z) * 0.9) % 1, 2);
const FLEM = { // Fleming dans chaque plan du labo
  londres: (f) => route(f, [[145, -7.5, -1.2], [190, -1.0, -1.45], [215, 0.95, -1.5]]),
  vacances: (f) => route(f, [[303, 0.95, -1.5], [316, 0.95, -1.5], [372, -8.6, -1.4]]),
  boites: (f) => route(f, [[216, -3.2, -1.5], [296, 3.0, -1.5]]),
  retour: (f) => route(f, [[380, -8.6, -1.4], [418, -1.7, -1.5]]),
};
const flemAt = (S, f) => (FLEM[S.id] ? FLEM[S.id](f) : { x: FL[0], z: FL[2], mv: false });

// ---------- cartes 2D ----------
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 16) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const popK = (g, k) => { const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); };
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); g.translate(300, 520); g.rotate(rot); g.translate(-300, -520); popK(g, k); panel(g, 20, 410, 560, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); g.restore(); };
const counterCard = (txt, hot) => (p) => { const g = p.g; g.save(); popK(g, 1); panel(g, 10, 390, 580, 260, hot ? '#ff5a4a' : '#ffd23a'); TXT(g, txt, 300, 550, 150, hot ? '#ffffff' : INK, hot ? 14 : 0); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, marks: false, ...extra });
// bactérie dessinée (jaune, grincheuse) : dead = croix sur les yeux, mouth
const bacDraw = (dead, ph) => (p) => { const g = p.g; g.save(); g.translate(300, 840); g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, -90, 120, 100, 0, 0, 7); g.fillStyle = dead ? '#d9d2a0' : '#f0bf30'; g.fill(); g.lineWidth = 14; g.strokeStyle = INK; g.stroke();
  for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5; g.beginPath(); g.moveTo(Math.cos(a) * 118, -90 + Math.sin(a) * 98); g.lineTo(Math.cos(a) * 150, -90 + Math.sin(a) * 128); g.lineWidth = 12; g.stroke(); }
  for (const s of [-1, 1]) { if (dead) { g.beginPath(); g.moveTo(s * 42 - 18, -118); g.lineTo(s * 42 + 18, -84); g.moveTo(s * 42 + 18, -118); g.lineTo(s * 42 - 18, -84); g.lineWidth = 11; g.stroke(); }
    else { g.beginPath(); g.arc(s * 42, -104, 20, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 8; g.stroke(); g.beginPath(); g.arc(s * 42 + 4 * Math.sin(ph), -102, 8, 0, 7); g.fillStyle = INK; g.fill(); } }
  g.beginPath(); if (dead) { g.moveTo(-34, -40); g.quadraticCurveTo(0, -62, 34, -40); } else { g.moveTo(-34, -50); g.quadraticCurveTo(0, -20, 34, -50); } g.lineWidth = 10; g.stroke(); g.restore(); };
const mouldDraw = (k) => (p) => { const g = p.g; g.save(); g.translate(300, 860); g.lineJoin = 'round'; const s = 0.6 + 0.4 * E.back(clamp(k));
  g.scale(s, s); g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.283, r = 150 + 22 * Math.sin(a * 5); i ? g.lineTo(Math.cos(a) * r, -150 + Math.sin(a) * r * 0.82) : g.moveTo(Math.cos(a) * r, -150 + Math.sin(a) * r * 0.82); }
  g.closePath(); g.fillStyle = '#58b09a'; g.fill(); g.lineWidth = 16; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(0, -170, 90, 0, 7); g.fillStyle = '#2f8a7a'; g.fill();
  for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 52, -190, 24, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 9; g.stroke(); g.beginPath(); g.arc(sx * 52 + 6, -188, 9, 0, 7); g.fillStyle = INK; g.fill(); }
  g.beginPath(); g.moveTo(-50, -120); g.quadraticCurveTo(0, -70, 50, -120); g.lineWidth = 11; g.stroke(); g.restore(); };

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.fl = { tunic: '#f5f2ea', skin: '#efc7a4', hair: '#6a5a4a', moustache: '#6a5a4a', brows: '#4a3a2e', glasses: true, bowtie: '#c8312c', lapels: '#d6d2c6', buttons: '#c9cfd0', cuffs: '#e8e4d8' };
  O.flM = { ...O.fl, medals: 2, sash: '#2f56a8' };
  O.aide = { tunic: '#e2a62a', skin: '#c58e66', hair: '#1a1411', brows: '#1a1411', thin: true, belt: '#6a3a22' };
  O.cher1 = { tunic: '#e8f2f0', skin: '#e8b890', hair: '#2a1e1a', brows: '#2a1e1a', glasses: '#2f3440', bowtie: '#2f6fd0', stout: true, lapels: '#cfd8d4' };
  O.cher2 = { tunic: '#eaf0f6', skin: '#b78458', hair: '#1a1411', brows: '#1a1411', moustache: '#1a1411', thin: true, bowtie: '#3a9a5a', lapels: '#cfd8d4' };
  O.nurse = { tunic: '#ffffff', skin: '#efc7a4', cap: '#ffffff', hair: '#5a3a22', brows: '#5a3a22', belt: '#7fc4b0' };
  O.sold = { tunic: '#6a7a4a', skin: '#d8a878', cap: '#6a7a4a', hair: '#2a1e1a', brows: '#2a1e1a', moustache: '#4a3022', belt: '#5a4030' };
  O.kidA = { tunic: '#e05a9a', skin: '#e0b080', hair: '#1a1411', brows: '#1a1411' };
  O.kidB = { tunic: '#3a9ad8', skin: '#c58e66', hair: '#2a1e1a', brows: '#2a1e1a' };
  O.kidC = { tunic: '#8fd14f', skin: '#efc7a4', hair: '#c98a3a', brows: '#8a5a22' };
  O.civ = { tunic: '#d4483a', skin: '#b78458', hair: '#1a1411', brows: '#1a1411', stout: true };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };

// ---------- monde ----------
export const worldAt = (f) => {
  const S = shotAt(f), g = S.id === 'hook' ? f : S.id === 'fin' ? f - 1122 : -1;
  let mold = 1, clear = 0.95, lid = 1, dishes = 1, lidsOff = 1;
  if (g >= 0) { mold = lerp(0.78, 1, ramp(g, 0, 60)); clear = lerp(0.62, 0.95, E.smooth(ramp(g, 0, 70))); }
  else if (f < 436) { mold = 0; clear = 0; lid = f < 303 ? 0 : 1; dishes = ramp(f, 226, 292); lidsOff = f < 303 ? 0 : 1; }
  else if (f < 517) { mold = lerp(0, 0.8, E.smooth(ramp(f, 444, 506))); clear = 0; }
  else if (f < 576) { mold = lerp(0.8, 1, ramp(f, 517, 545)); clear = lerp(0, 0.72, E.smooth(ramp(f, 522, 568))); }
  else if (f < 618) { clear = lerp(0.72, 0.95, E.smooth(ramp(f, 576, 612))); }
  return { id: S.id, mold, clear, lid, dishes, lidsOff, noFlame: f > 303 && f < 560 };
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.95, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const hookCam = (f) => camFromKeys([R(0, [0.02, 1.42, -0.3], [0.02, 1.1, -2.3], 38, { roll: 2 }), R(60, [0.2, 1.45, -0.1], [0.15, 1.2, -2.3], 38, { roll: 1 }), R(144, [1.2, 1.7, 1.3], [0.45, 1.3, -2.3], 40, { roll: 0 })], f);
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return f >= 70 && f < 82 ? shake(hookCam(f), f, 70, 0.04, 10) : hookCam(f);
    case 'londres': return crane([0, 0, -1], f, 145, 71, { from: { r: 10, h: 4.6, yaw: -22, lookUp: 1.4 }, to: { r: 6.5, h: 1.7, yaw: 6, lookUp: 1.3 }, fov: 42 });
    case 'boites': { const m = FLEM.boites(f); return camFromKeys([R(216, [m.x + 1.5, 2.0, 2.3], [m.x - 0.1, 1.2, -2.2], 40), R(260, [m.x + 1.2, 1.95, 2.3], [m.x - 0.1, 1.2, -2.2], 38), R(302, [m.x + 1.5, 2.0, 2.3], [m.x - 0.1, 1.2, -2.2], 40)], f); }
    case 'vacances': { const m = FLEM.vacances(f); return camFromKeys([K(303, [FL[0] - 0.2, 0, FL[2]], { headW: 0.3, yaw: -14, low: 8, frameY: 0.4 }), R(330, [m.x + 2.2, 1.4, 1.2], [m.x - 0.2, 1.4, -1.45], 38), R(372, [-6.4, 1.4, 1.2], [-8.6, 1.5, -1.6], 38), R(379, [-2.5, 1.55, 0.5], [0.0, 1.15, -2.4], 40)], f); }
    case 'retour': return camFromKeys([R(380, [-5.0, 1.5, 1.0], [-8.4, 1.4, -1.6], 40), R(420, [-1.2, 1.6, 0.0], [-1.7, 1.45, -1.5], 36, { dutch: 3 }), R(435, [-1.0, 1.6, -0.3], [-1.4, 1.5, -1.6], 34, { dutch: 4 })], f);
    case 'moisi': return camFromKeys([R(436, [-0.1, 1.35, -0.9], [0.0, 1.06, -2.3], 36), R(500, [0.35, 1.3, -1.1], [0.1, 1.07, -2.3], 36), R(516, [0.5, 1.28, -1.2], [0.1, 1.08, -2.3], 36)], f);
    case 'vide': return camFromKeys([R(517, [0.5, 1.28, -1.15], [0.1, 1.08, -2.3], 34), R(575, [0.2, 1.62, -1.45], [0.1, 1.04, -2.3], 34)], f);
    case 'cercle': return camFromKeys([R(576, [0.2, 1.62, -1.45], [0.1, 1.04, -2.3], 34), R(617, [-0.9, 1.5, -0.2], [0.0, 1.2, -2.3], 38)], f);
    case 'comprend': return camFromKeys([R(618, [0.95, 1.45, 1.1], [0.95, 1.3, -2.0], 40), R(670, [1.0, 1.5, 1.0], [1.05, 1.3, -2.0], 38), R(728, [1.05, 1.55, 1.0], [1.15, 1.3, -2.0], 38)], f);
    case 'nom': return camFromKeys([K(729, [FL[0] - 0.1, 0, FL[2]], { headW: 0.3, yaw: 8, low: 16, frameY: 0.4 }), K(797, [FL[0] - 0.1, 0, FL[2]], { headW: 0.36, yaw: -6, low: 18, frameY: 0.4 })], f);
    case 'sauf': return camFromKeys([{ f: 798, ...frameTwo([-0.4, 0, -1.4], [0.9, 0, -1.4], { headW: 0.24, yaw: 8, s: 0.95, low: 6 }) }, { f: 860, ...frameTwo([-0.4, 0, -1.4], [0.9, 0, -1.4], { headW: 0.27, yaw: -6, s: 0.95, low: 6, dutch: 4 }) }, { f: 905, ...frameOn([0.9, 0, -1.4], { headW: 0.32, yaw: -10, s: 0.95, dutch: 5, frameY: 0.4 }) }], f);
    case 'ans': return camFromKeys([K(906, [FL[0], 0, FL[2]], { headW: 0.26, yaw: 12, s: 0.95, frameY: 0.42, sit: true }), K(960, [FL[0], 0, FL[2]], { headW: 0.3, yaw: -6, s: 0.95, frameY: 0.42, sit: true })], f);
    case 'cuves': return camFromKeys([{ f: 961, ...frameTwo([7.8, 0, -0.9], [9.1, 0, -0.9], { headW: 0.2, yaw: 14, s: 0.95, low: 4 }) }, { f: 1020, ...frameTwo([7.8, 0, -0.9], [9.1, 0, -0.9], { headW: 0.27, yaw: -8, s: 0.95, low: 8 }) }], f);
    case 'nobel': return f < 1070 ? crane([WX, 0, -0.6], f, 1021, 49, { from: { r: 10, h: 4.4, yaw: 12, lookUp: 1.2 }, to: { r: 6.5, h: 1.6, yaw: -4, lookUp: 1.5 }, fov: 42 }) : camFromKeys([K(1070, [WX, 0, -0.6], { headW: 0.2, yaw: -4, low: 10, frameY: 0.4 }), K(1121, [WX, 0, -0.6], { headW: 0.32, yaw: 6, low: 16, frameY: 0.4 })], f);
    case 'fin': return hookCam(f - 1122);
  }
  return baseCam(0);
};
const TR = [{ a: 145, type: 'rise' }, { a: 216, type: 'push' }, { a: 303, type: 'whip', dir: 1 }, { a: 380, type: 'whip', dir: -1 }, { a: 436, type: 'push' }, { a: 517, type: 'push' }, { a: 618, type: 'whip', dir: 1 }, { a: 729, type: 'push' },
  { a: 798, type: 'drop' }, { a: 906, type: 'whip', dir: -1 }, { a: 961, type: 'push' }, { a: 1021, type: 'whip', dir: 1 }, { a: 1122, type: 'whip', dir: -1 }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
const FG = { boites: 'flask', moisi: 'flask', cercle: 'petri', sauf: 'flask', cuves: 'flask', nom: 'petri' };
export const dofAt = (f) => { const C = camAt(f), d = C.dist || Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return FG[shotAt(f).id] ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- effets 3D ----------
export const envAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'fin': return { motes: 0.9 };
    case 'vacances': return { motes: 1.1 };
    case 'retour': return { motes: 1.8 };
    case 'moisi': case 'vide': case 'cercle': return { motes: 1.2 };
    case 'comprend': return { motes: 0.9, sparks: f >= 650 && f < 700 ? [{ at: [0.4, 1.2, -2.3], f0: 650, f1: 700, rate: 6, col: '#9ad8c0', speed: 0.8 }] : [] };
    case 'sauf': return { motes: 0.7, smoke: [{ at: [0.2, 1.1, -2.4], f0: 830, f1: 905, rate: 2, size: 0.25, col: '#b8b8b0', rise: 0.3 }] };
    case 'cuves': return { motes: 0.9, smoke: [8.9, 7.2, 10.6].map((x) => ({ at: [x, 2.4, -1.9], f0: 961, f1: 1020, rate: 2, size: 0.3, col: '#e8e8e4', rise: 0.35 })) };
    case 'nobel': return { motes: 1.0 };
  }
  return { motes: 0.5 };
};

// ---------- acteurs ----------
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const fm = flemAt(S, f);
  switch (S.id) {
    case 'hook': case 'fin': {
      const g = S.id === 'hook' ? f : f - 1122, fin = S.id === 'fin', h = hop(g, 6, 0.25, 8);
      if (!fin) fig('fl', 5, { expr: g < 26 ? 'shock' : g < 90 ? 'grin' : 'laugh', L: 'point', R: g < 90 ? 'head' : 'hip', wv: q(g * 0.5, 1), look: -0.6, tilt: 2 }, [0.5, 0, -1.7], { s: 0.9, dy: h.dy, sx: h.sx, sy: h.sy });
      else fig('fl', 5, { expr: g < 60 ? 'smile' : 'laugh', L: g < 60 ? 'hip' : 'point', R: 'hip', look: g < 60 ? -0.6 : 0.2, tilt: 2, headTilt: 5 }, [0.5, 0, -1.7], { s: 0.9, dy: g >= 60 ? Math.abs(Math.sin(g * 0.45)) * 0.02 : 0 });
      break; }
    case 'londres': fig('fl', 5, { expr: 'determined', L: 'carry', R: 'hip', step: fm.mv ? stepOf(fm.x) : 0, look: 0.2 }, [fm.x, 0, fm.z], { s: 0.95 }); break;
    case 'boites': { const k = f >= 262; fig('fl', 5, { expr: f < 262 ? 'determined' : 'proud', L: 'hip', R: 'lift', holdR: 'petri', step: fm.mv ? stepOf(fm.x) : 0, look: 0.5, headTilt: k ? 5 : 0 }, [fm.x, 0, fm.z], { s: 0.95 }); break; }
    case 'vacances': fig('fl', 5, { expr: f < 318 ? 'smug' : 'grin', L: 'hang', holdL: 'case', R: f < 316 ? 'wave' : 'hip', wv: q(f * 0.5, 1), step: fm.mv ? stepOf(fm.x) : 0, run: false, look: f < 318 ? 0.4 : -0.8 }, [fm.x, 0, fm.z], { s: 0.95 }); break;
    case 'retour': { const wk = fm.mv, sq = f >= 416; fig('fl', 5, { expr: sq ? 'squint' : 'smile', L: 'hang', holdL: f < 418 ? 'case' : undefined, R: sq ? 'chin' : 'hip', step: wk ? stepOf(fm.x) : 0, look: sq ? 0.9 : 0.2 }, [fm.x, 0, fm.z], { s: 0.95 }); break; }
    case 'moisi': fig('fl', 5, { expr: f < 470 ? 'squint' : 'shock', L: 'hip', R: 'point', look: 0.9 }, [-0.95, 0, -1.55], { s: 0.95 }); break;
    case 'vide': fig('fl', 5, { expr: f < 535 ? 'shock' : 'dazed', L: 'head', R: 'head', wv: q(f * 0.5, 1), look: 0.9 }, [-0.95, 0, -1.55], { s: 0.95, ...hop(f, 524, 0.2, 8) }); break;
    case 'cercle': fig('fl', 5, { expr: 'shock', L: 'hip', R: 'point', look: 0.9, headTilt: 3 }, [-0.95, 0, -1.55], { s: 0.95 }); break;
    case 'comprend': {
      const ex = f < 650 ? 'shock' : f < 690 ? 'grin' : 'proud', hp = ramp(f, 622, 645);
      fig('fl', 5, { expr: ex, L: 'up', holdL: 'petri', R: 'hip', look: 0.2, headTilt: f > 690 ? 6 : 0 }, [0.5, 0, -1.4], { s: 0.95, ...(f < 650 ? hop(f, 626, 0.25, 8) : {}) }); void hp;
      // microbes jaunes qui s'approchent de la moisissure et tombent à plat
      for (let i = 0; i < 4; i++) { const t0 = 646 + i * 9, dead = f >= t0 + 20, k = clamp((f - (t0 - 10)) / 10); if (f < t0 - 10) continue;
        const x = lerp(2.3 + i * 0.25, 1.45 + i * 0.1, ramp(f, t0 - 10, t0 + 18)), die = dead ? popIn(f, t0 + 20, 6) : 1, sh = dead ? clamp(1 - (f - (t0 + 22)) / 12) : 1;
        out.push({ key: 'bac' + i + (dead ? 'd' : 'a' + Math.floor(f * 0.3) % 2), draw: bacDraw(dead, f * 0.5), x, y: 1.0, z: -2.5 + i * 0.12, s: 0.13 * k * sh * (dead ? 1 + 0.1 * die : 1), tint, marks: false, blob: false, shadow: false, roll: dead ? 0.4 : Math.sin(f * 0.6 + i) * 0.1 }); }
      out.push({ key: 'mould' + Math.floor(ramp(f, 640, 660) * 6), draw: mouldDraw(ramp(f, 640, 658)), x: 1.15, y: 1.0, z: -2.5, s: 0.26 * Math.min(1, ramp(f, 640, 656) * 1.2), tint, marks: false, blob: false, shadow: false });
      break; }
    case 'nom': { const pp = popIn(f, 733, 10); fig('fl', 5, { expr: f < 765 ? 'proud' : 'grin', L: 'hip', R: 'up', holdR: 'flask', look: 0.1, headTilt: 7 }, FL, { s: 0.95 });
      void pp; break; }
    case 'sauf': {
      fig('fl', 5, { expr: f < 830 ? 'nervous' : 'pained', L: 'head', R: 'head', wv: q(f * 0.4, 1), look: 0.5 }, [0.9, 0, -1.4], { s: 0.95, ...(f > 880 ? { dx: Math.sin(f * 2.9) * 0.01 } : {}) });
      fig('aide', 8, { expr: f < 850 ? 'nervous' : 'pained', L: 'show', holdL: 'flask', R: 'shrug', look: 0.6 }, [-0.4, 0, -1.4], { s: 0.9 }); break; }
    case 'ans': fig('fl', 5, { expr: f < 940 ? 'deadpan' : 'pained', L: 'chin', R: 'hip', sit: true, seat: 'stool', look: 0.3 }, [FL[0], 0, FL[2]], { s: 0.95 }); break;
    case 'cuves': {
      fig('cher1', 31, { expr: 'determined', L: 'push', R: 'push', wv: q(f * 0.4, 1), look: 0.4 }, [7.8, 0, -0.9], { s: 0.95 });
      fig('cher2', 32, { expr: f < 990 ? 'smile' : 'grin', L: 'show', holdL: 'flask', R: 'hip', look: -0.4 }, [9.1, 0, -0.9], { s: 0.95 });
      fig('aide', 8, { expr: 'smile', L: 'carry', R: 'carry', look: 0.4 }, [10.9, 0, -1.4], { s: 0.9 }); break; }
    case 'nobel': {
      const cheer = clamp(ramp(f, 1050, 1090));
      fig('flM', 5, { expr: f < 1075 ? 'proud' : 'laugh', L: 'up', R: 'hip', wv: q(f * 0.3, 1), look: 0, headTilt: 6 }, [WX, 0, -0.6], { s: 0.95 });
      fig('cher1', 31, { expr: 'grin', L: 'hip', R: 'show', holdR: 'flask', look: -0.4 }, [WX - 1.4, 0, -0.9], { s: 0.9 });
      fig('cher2', 32, { expr: 'smile', L: 'hip', R: 'hip', look: -0.5 }, [WX + 1.4, 0, -0.9], { s: 0.9 });
      crowd(T, f, { center: [WX, 0, -1.9], n: 7, w: 12, d: 1.2, outfits: ['nurse', 'sold', 'civ', 'nurse', 'sold'], exprs: ['smile', 'grin', 'laugh'], seed: 4, s: 0.95, cheer }).forEach((a) => out.push({ ...a, tint }));
      [[-3.3, 'kidA'], [-2.5, 'kidB'], [2.6, 'kidC'], [3.4, 'kidA'], [-4.3, 'kidC'], [4.4, 'kidB']].forEach(([dx, w], i) => crowd(T, f, { center: [WX + dx, 0, -0.1 + (i % 2) * 0.3], n: 1, w: 0.01, d: 0.01, outfits: [w], exprs: ['laugh', 'grin', 'smile'], seed: 5 + i, s: 0.6, cheer: cheer * 1.2 }).forEach((a) => out.push({ ...a, tint })));
      break; }
  }
  if (FG[S.id] && S.id !== 'nom') { const cam = camAt(f); out.push(fgCard(cam, T.fgProp(FG[S.id], { seed: 2 }), { key: 'fg' + S.id, side: S.id === 'cercle' ? 1 : -1, dist: 1.0, drop: 0.6, s: 0.4 })); }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const out = [];
  if (f >= 158 && f < 215) { const k = ramp(f, 158, 168) * (1 - ramp(f, 208, 215)); out.push(FX('y' + q(k, 1), labelCard('1928', 150, '#ffd23a', INK, k, -0.04), [0.4, 3.0, -2.6], 1.0)); }
  if (f >= 325 && f < 379) { const k = ramp(f, 325, 335) * (1 - ramp(f, 372, 379)); const x = FLEM.vacances(f).x; out.push(FX('v' + q(k, 1), labelCard('VACANCES', 84, '#ffffff', '#2f9a8a', k, 0.04), [x - 0.4, 2.9, -1.2], 0.6)); }
  if (f >= 735 && f < 797) { const k = ramp(f, 735, 745); out.push(FX('pn' + q(k, 1), labelCard('PÉNICILLINE', 76, '#ffffff', '#2f8a7a', k, -0.03), [FL[0] - 0.25, 2.55, -1.2], 0.45)); }
  if (f >= 798 && f < 870) { const k = ramp(f, 800, 808) * (1 - ramp(f, 862, 870)); out.push(FX('pa' + q(k, 1), labelCard('PAS ASSEZ', 92, '#ffffff', '#d8322e', k, 0.04), [0.3, 2.8, -1.3], 0.65)); }
  if (f >= 906 && f < 961) { const n = Math.round(lerp(1928, 1938, E.smooth(ramp(f, 908, 950)))); const hot = f >= 950; out.push(FX('ct' + n, counterCard(String(n), hot), [FL[0], 2.5, -1.2], 0.5, { roll: hot ? Math.sin(f * 0.8) * 0.03 : 0 })); }
  if (f >= 1021 && f < 1075) { const k = ramp(f, 1030, 1040) * (1 - ramp(f, 1068, 1075)); out.push(FX('nb' + q(k, 1), labelCard('NOBEL 1945', 80, '#ffd23a', INK, k, -0.03), [WX, 3.3, -1.2], 0.9)); }
  return out;
};
