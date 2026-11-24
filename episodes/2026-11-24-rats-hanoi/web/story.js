// « Les rats de Hanoï » (1902) — 41,9 s, 30 fps, 1256 images. Cadres calés sur phrases.json (whisper).
// Rue coloniale (étal de la prime en (6.7, 0, -2.4)), faubourg aux cages (x ~ -31), égout en coupe (x = 5000, sol de l'égout y = -5.9).
// Héros : Mai, chasseuse de rats (casquette turquoise, gilet moutarde). Secondaires : le fonctionnaire français (casque colonial) + le petit éleveur.
// Les rats sont des cartes dessinées au canvas (ratDraw). Hook et dernière image : le même rat sans queue sur le pavé (la fin reboucle).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, follow, transition, crane, crowd, fgCard, popIn } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1256, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 137 },        // Cette ville a payé ses habitants pour tuer les rats… et elle en a eu encore plus.
  { id: 'hanoi', a: 138, b: 220 },     // À Hanoï, en mille neuf cent deux,
  { id: 'egout', a: 221, b: 293 },     // les égouts grouillent de rats, et la peste menace.
  { id: 'prime', a: 294, b: 370 },     // Les Français offrent un centime
  { id: 'piece', a: 371, b: 423 },     // par queue de rat rapportée.
  { id: 'premier', a: 424, b: 520 },   // Dès le premier jour, des milliers de queues arrivent.
  { id: 'compter', a: 521, b: 583 },   // Les fonctionnaires comptent, ravis.
  { id: 'sauf', a: 584, b: 696 },      // Sauf que… des rats se promènent en ville, sans queue.
  { id: 'coupe', a: 697, b: 734 },     // Les chasseurs les coupent,
  { id: 'relache', a: 735, b: 789 },   // puis les relâchent pour qu'ils fassent des petits.
  { id: 'elev1', a: 790, b: 853 },     // Des habitants ouvrent même des élevages de rats,
  { id: 'elev2', a: 854, b: 905 },     // juste à côté de la ville.
  { id: 'masse', a: 906, b: 996 },     // Un seul jour, plus de vingt mille queues sont comptées,
  { id: 'rats', a: 997, b: 1051 },     // et les rats sont toujours là.
  { id: 'supprime', a: 1052, b: 1098 },// La prime est supprimée.
  { id: 'restent', a: 1099, b: 1155 }, // Les rats, eux, restent.
  { id: 'alors', a: 1156, b: 1214 },   // Alors méfie-toi : paie pour des queues, et tu auras des rats.
  { id: 'fin', a: 1215, b: 1255 },     // (reprise du plan d'ouverture : la fin reboucle)
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const CX = 5000, FLOOR = -5.9;
const hash = (i, k, seed = 1) => { const x = Math.sin((i + 1) * 12.9898 * (k + 1) + seed * 78.233) * 43758.5453; return x - Math.floor(x); };

// ---------- lumière : une ambiance par acte ----------
const DAY = mood('jour', { exposure: 1.06 });
const LAMP = mood('lampe', { exposure: 1.25, gamma: 1.35 });
const DORE = mood('dore', { exposure: 1.1 });
const SOIR = mood('soir', { exposure: 1.25, gamma: 1.2 });
export const lightFor = (S, f) => {
  switch (S.id) {
    case 'egout': return blendMood(DAY, LAMP, ramp(f, 221, 238));
    case 'premier': return blendMood(DAY, DORE, ramp(f, 460, 500));
    case 'compter': return DORE;
    case 'sauf': return blendMood(DORE, DAY, ramp(f, 584, 604));
    case 'coupe': case 'relache': return LAMP;
    case 'rats': return blendMood(DAY, SOIR, ramp(f, 1000, 1030));
    case 'supprime': case 'restent': return SOIR;
    case 'alors': return blendMood(SOIR, DAY, ramp(f, 1170, 1210));
    default: return DAY;
  }
};
const TINTS = { egout: '#ffe2c0', coupe: '#ffe2c0', relache: '#ffe2c0', premier: '#fff0dc', compter: '#ffe2b8', rats: '#ffeedd', supprime: '#ffd9b8', restent: '#ffd9b8' };
const tintOf = (S) => TINTS[S.id] || '#fff8ee';

// ---------- positions ----------
const OFFH = [3.0, 0, -0.8];            // le fonctionnaire à l'ouverture
const OFFP = [6.0, 0, -0.9], MAIP = [7.4, 0, -0.55];   // devant l'étal
const MAIT = [CX + 1.7, FLOOR, 5.0], BARREL = [CX + 2.9, FLOOR + 0.95, 4.8];   // dans l'égout
const BOY = [-31.3, 0, -2.4];
const route = (f, pts) => { // [[f0, x, z], ...] : position linéaire par morceaux + « en marche » ?
  if (f <= pts[0][0]) return { x: pts[0][1], z: pts[0][2], mv: false };
  for (let i = 1; i < pts.length; i++) if (f <= pts[i][0]) { const [f0, x0, z0] = pts[i - 1], [f1, x1, z1] = pts[i], t = (f - f0) / (f1 - f0); return { x: lerp(x0, x1, t), z: lerp(z0, z1, t), mv: Math.abs(x1 - x0) + Math.abs(z1 - z0) > 0.01 }; }
  const l = pts[pts.length - 1]; return { x: l[1], z: l[2], mv: false };
};
const stepOf = (x, z = 0) => q(((x + z) * 0.9) % 1, 2);
// le rat sans queue de l'ouverture (et de la fin)
const starRat = (f) => ({ x: 2.5 - 0.011 * f, z: 0.55, dir: -1, tail: false, s: 0.58, ph: 0, eye: f > 44 ? 1 : 0 });
// hanoi : mai porte son sac de queues
const hanoiMai = (f) => route(f, [[138, 0.2, 0.5], [220, 3.4, 0.3]]);
const hanoiOff = [5.4, 0, -1.2];

// ---------- rats : essaim déterministe ----------
const swarm = (f, { cx, cz, w, d, n, f0 = 0, vel = -0.05, seed = 1, tailFrac = 0.8, s = 0.5, y = 0, span = 30, hold = false }) => {
  const out = [], vis = n * ramp(f, f0, f0 + span);
  for (let i = 0; i < n; i++) {
    if (i >= vis) break;
    const sp = 0.7 + 0.6 * hash(i, 2, seed), x = cx + ((((hash(i, 1, seed) * w + vel * sp * (f - f0)) % w) + w) % w) - w / 2;
    out.push({ x, z: cz + (hash(i, 3, seed) - 0.5) * d, y, dir: vel < 0 ? -1 : 1, tail: hash(i, 4, seed) < tailFrac, s: s * (0.8 + 0.4 * hash(i, 5, seed)), ph: hash(i, 6, seed) * 2, mv: !hold, pop: popIn(f, f0 + i * (span / n), 8) });
  }
  return out;
};
const ratDraw = ({ dir = 1, step = 0, tail = true, eye = 0 }) => (p) => {
  const g = p.g; g.save(); g.translate(300, 975); g.scale(dir, 1); g.lineJoin = 'round'; g.lineCap = 'round';
  const P1 = '#e8a2a2', FUR = '#8f8278', FUR2 = '#6f645c';
  const line = (pts, w, col, ink = 4) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineWidth = w + ink * 2; g.strokeStyle = INK; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
  if (tail) { g.beginPath(); g.moveTo(-122, -100); g.bezierCurveTo(-210, -60, -270, -150, -236, -225); g.lineWidth = 26; g.strokeStyle = INK; g.stroke(); g.lineWidth = 14; g.strokeStyle = P1; g.stroke(); }
  line([[-70, -55], [-70 + (step ? 34 : -12), -6]], 24, FUR2); line([[60, -55], [60 + (step ? -16 : 34), -6]], 24, FUR2);
  g.beginPath(); g.ellipse(-8, -105, 128, 80, 0, 0, 7); g.fillStyle = FUR; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.ellipse(0, -68, 92, 26, 0, 0, 7); g.fillStyle = '#c4b4a2'; g.fill();
  if (!tail) { g.beginPath(); g.arc(-132, -104, 15, 0, 7); g.fillStyle = P1; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); }
  line([[-48, -50], [-48 + (step ? -14 : 30), -4]], 24, FUR); line([[84, -50], [84 + (step ? 30 : -12), -4]], 24, FUR);
  g.beginPath(); g.moveTo(60, -168); g.bezierCurveTo(140, -192, 210, -146, 258, -102); g.bezierCurveTo(206, -56, 126, -42, 60, -66); g.closePath(); g.fillStyle = FUR; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(100, -182, 36, 0, 7); g.fillStyle = P1; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(102, -180, 18, 0, 7); g.fillStyle = '#c97a86'; g.fill();
  g.beginPath(); g.arc(256, -102, 15, 0, 7); g.fillStyle = '#e0607a'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  const er = eye === 1 ? 26 : 18; g.beginPath(); g.arc(158, -126, er, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(164, -126, eye === 1 ? 6 : 10, 0, 7); g.fillStyle = INK; g.fill();
  if (eye === 2) { g.beginPath(); g.moveTo(158 - 22, -130); g.lineTo(158 + 22, -130); g.lineTo(158 + 22, -150); g.lineTo(158 - 22, -150); g.closePath(); g.fillStyle = FUR; g.fill(); g.lineWidth = 7; g.stroke(); }
  for (const dy of [-10, 6, 20]) line([[236, -96 + dy * 0.2], [292, -96 + dy * 2]], 3, INK, 0);
  g.restore();
};
const ratAct = (f, r, tint) => { const st = r.mv === false ? 0 : (Math.floor(f * 0.5 + (r.ph || 0) * 3) % 2), pp = r.pop ?? 1;
  return { key: `rat${r.dir}${st}${r.tail ? 1 : 0}${r.eye || 0}`, draw: ratDraw({ dir: r.dir, step: st, tail: r.tail, eye: r.eye || 0 }), x: r.x, y: (r.y || 0) + (r.mv === false ? 0 : Math.abs(Math.sin(f * 0.9 + (r.ph || 0) * 5)) * 0.03) + (r.dy || 0), z: r.z, s: r.s * Math.max(0.01, pp), tint, marks: false, shadow: true, blob: true }; };

// ---------- cartes 2D ----------
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 16) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const popK = (g, k) => { const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); };
const labelCard = (txt, size, fill, bg, k = 1, rot = 0) => (p) => { const g = p.g; g.save(); g.translate(300, 520); g.rotate(rot); g.translate(-300, -520); popK(g, k); panel(g, 20, 410, 560, 220, bg); TXT(g, txt, 300, 555, size, fill, 0); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s, z: pos[2], s, blob: false, shadow: false, order: 5, marks: false, ...extra });
const tailPath = (g, x0, y0, sc = 1, flip = 1) => { g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + 60 * sc * flip, y0 - 70 * sc, x0 + 120 * sc * flip, y0 + 50 * sc, x0 + 190 * sc * flip, y0 - 30 * sc); };
const tailDraw = (g, x0, y0, sc = 1, flip = 1) => { tailPath(g, x0, y0, sc, flip); g.lineWidth = 30 * sc; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); g.lineWidth = 17 * sc; g.strokeStyle = '#e8a2a2'; g.stroke(); };
const priceCard = (k) => (p) => { const g = p.g; g.save(); popK(g, k); panel(g, 10, 360, 580, 320, '#f7f3ea');
  g.beginPath(); g.arc(135, 520, 88, 0, 7); g.fillStyle = '#e9be4a'; g.fill(); g.lineWidth = 14; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(135, 520, 62, 0, 7); g.lineWidth = 6; g.stroke(); TXT(g, '1', 135, 556, 110, '#fff6d0', 12);
  TXT(g, '=', 300, 556, 120, INK, 0); tailDraw(g, 360, 540, 1.1); g.restore(); };
const counterCard = (txt, hot) => (p) => { const g = p.g; g.save(); popK(g, 1); panel(g, 10, 390, 580, 260, hot ? '#ff5a4a' : '#ffd23a'); TXT(g, txt, 300, 550, txt.length > 6 ? 118 : 140, hot ? '#ffffff' : INK, hot ? 14 : 0); g.restore(); };
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const flyTail = (rot) => (p) => { const g = p.g; g.save(); g.translate(300, 520); g.rotate(rot); g.translate(-300, -520); tailDraw(g, 190, 540, 1.1); g.restore(); };
const heartCard = (k) => (p) => { const g = p.g; g.save(); g.translate(300, 520); g.scale(0.6 + 0.4 * E.back(clamp(k)), 0.6 + 0.4 * E.back(clamp(k))); g.translate(-300, -520); g.beginPath(); g.moveTo(300, 600); g.bezierCurveTo(180, 520, 200, 420, 300, 470); g.bezierCurveTo(400, 420, 420, 520, 300, 600); g.fillStyle = '#ff5a7a'; g.fill(); g.lineWidth = 14; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); g.restore(); };
const halfPoster = (side) => (p) => { const g = p.g; g.save(); g.beginPath(); if (side < 0) { g.moveTo(190, 430); g.lineTo(330, 410); g.lineTo(300, 520); g.lineTo(340, 640); g.lineTo(190, 640); } else { g.moveTo(310, 410); g.lineTo(420, 430); g.lineTo(420, 640); g.lineTo(320, 640); g.lineTo(290, 520); }
  g.closePath(); g.fillStyle = '#f3ead2'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); TXT(g, side < 0 ? 'PRI' : 'ME', side < 0 ? 255 : 365, 560, 70, '#c8312c', 0); g.restore(); };

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.off = { tunic: '#efe3c0', skin: '#f3cfae', hat: 'colonial', moustache: '#5a3a22', stout: true, buttons: '#c9a24a', belt: '#7a4a2a', epaulettes: true, medals: 2, brows: '#5a3a22' };
  O.clerk = { tunic: '#e0d0a8', skin: '#e8b890', hat: 'colonial', hatCol: '#e8dcc0', moustache: '#2a1e1a', thin: true, buttons: '#c9a24a', brows: '#2a1e1a' };
  O.mai = { tunic: '#e2a62a', skin: '#e2b684', cap: '#14b8c4', hair: '#1a1411', brows: '#1a1411', belt: '#6a3a22', cuffs: '#c8312c' };
  O.boy = { tunic: '#d4483a', skin: '#c58e66', hat: 'paille', hair: '#1a1411', brows: '#1a1411', stout: true };
  O.hA = { tunic: '#3a6ad8', skin: '#cf9f70', hat: 'paille', hair: '#1a1411', brows: '#1a1411', thin: true };
  O.hB = { tunic: '#8fd14f', skin: '#b78458', cap: '#5a4030', hair: '#1a1411', brows: '#1a1411' };
  O.hC = { tunic: '#7a3aa8', skin: '#d8a878', hat: 'paille', hatCol: '#d8a84a', hair: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.hD = { tunic: '#e05a9a', skin: '#e0b080', hair: '#1a1411', brows: '#1a1411' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const exprAt = (f, tab, d = 'neutral') => tab.reduce((a, [k, e]) => (f >= k ? e : a), d);

// ---------- monde ----------
export const worldAt = (f) => {
  const tails = f < 424 ? 0 : f < 520 ? lerp(0, 0.5, ramp(f, 424, 520)) : f < 583 ? lerp(0.5, 0.72, ramp(f, 521, 583)) : f < 906 ? 0.72 : lerp(0.72, 1, E.smooth(ramp(f, 906, 945)));
  return { tails, poster: f < 1070 ? 1 : 0 };
};

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, { s: 0.95, ...o }), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const hookCam = (f) => camFromKeys([K(0, [OFFH[0] - 0.35, 0, OFFH[2]], { headW: 0.3, yaw: -8, low: 8, frameY: 0.4 }), K(60, [OFFH[0] - 0.3, 0, OFFH[2]], { headW: 0.28, yaw: -2, low: 10, frameY: 0.4 }), K(137, [OFFH[0] - 0.2, 0, OFFH[2]], { headW: 0.2, yaw: 10, low: 4, frameY: 0.42 })], f);
const offStall = (f) => (f >= 1052 ? [5.6, 0, -0.9] : OFFP);
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return f >= 62 ? shake(hookCam(f), f, 62, 0.08, 10) : hookCam(f);
    case 'hanoi': return crane([4.2, 0, -1.5], f, 138, 82, { from: { r: 27, h: 9, yaw: 24, lookUp: 1 }, to: { r: 8.5, h: 2.2, yaw: -8, lookUp: 1.5 }, fov: 42 });
    case 'egout': return crane([CX + 1.4, -2.6, 5], f, 221, 72, { from: { r: 30, h: 5.5, yaw: 0, lookUp: 0 }, to: { r: 6.2, h: -2.6, yaw: 0, lookUp: -3.0 }, fov: 42 });
    case 'prime': return camFromKeys([{ f: 294, ...frameTwo(OFFP, MAIP, { headW: 0.25, yaw: -12, low: 12, s: 0.95 }) }, { f: 370, ...frameTwo(OFFP, MAIP, { headW: 0.28, yaw: 4, low: 14, s: 0.95 }) }], f);
    case 'piece': return camFromKeys([K(371, [OFFP[0] + 0.3, 0, OFFP[2]], { headW: 0.34, yaw: -8, low: 14, frameY: 0.42 }), K(423, [OFFP[0] + 0.3, 0, OFFP[2]], { headW: 0.4, yaw: 4, low: 16, frameY: 0.42 })], f);
    case 'premier': return camFromKeys([{ f: 424, ...frameTwo([9.6, 0, -0.5], [8.0, 0, -0.5], { headW: 0.2, yaw: 12, s: 0.95, low: 4 }) }, { f: 478, ...frameTwo([9.2, 0, -0.5], [6.6, 0, -0.9], { headW: 0.17, yaw: 6, s: 0.95, low: 6 }) }, { f: 520, ...frameTwo([8.2, 0, -0.5], [6.4, 0, -0.9], { headW: 0.2, yaw: -6, s: 0.95 }) }], f);
    case 'compter': return camFromKeys([K(521, [OFFP[0] - 0.3, 0, OFFP[2]], { headW: 0.34, yaw: 10, low: 12, frameY: 0.42 }), K(583, [OFFP[0] - 0.3, 0, OFFP[2]], { headW: 0.4, yaw: -4, low: 14, frameY: 0.42 })], f);
    case 'sauf': { const r = starRatSauf(640), r2 = starRatSauf(690);
      return camFromKeys([{ f: 584, ...frameTwo(OFFP, MAIP, { headW: 0.26, yaw: 6, low: 6, s: 0.95 }) }, { f: 628, ...frameTwo(OFFP, MAIP, { headW: 0.3, yaw: -6, low: 4, s: 0.95, dutch: 3 }) },
        R(652, [r.x + 2.4, 0.5, 2.0], [r.x - 0.3, 0.42, r.z], 34), R(696, [r2.x + 2.0, 0.5, 2.0], [r2.x - 0.3, 0.42, r2.z], 32)], f); }
    case 'coupe': return camFromKeys([{ f: 697, ...frameTwo(MAIT, BARREL, { headW: 0.28, yaw: -8, s: 0.9, low: 6 }) }, { f: 734, ...frameTwo(MAIT, BARREL, { headW: 0.34, yaw: 6, s: 0.9, low: 8 }) }], f);
    case 'relache': { const x = relX(f); return camFromKeys([R(735, [BARREL[0] - 0.3, -4.9, 9.0], [BARREL[0] - 0.2, -5.4, 5], 38), R(760, [x - 0.7, -5.62, 7.9], [x + 0.5, -5.5, 5.0], 36), R(789, [x - 0.9, -5.62, 7.9], [x + 0.9, -5.5, 5.0], 38)], f); }
    case 'elev1': return crane([-30.5, 0, -4], f, 790, 63, { from: { r: 24, h: 8, yaw: -42, lookUp: 1 }, to: { r: 7, h: 1.6, yaw: -22, lookUp: 1.2 }, fov: 42 });
    case 'elev2': return camFromKeys([K(854, [BOY[0] + 0.4, 0, BOY[2]], { headW: 0.3, yaw: -18, s: 0.8, frameY: 0.4, low: 6 }), K(905, [BOY[0] + 0.9, 0, BOY[2]], { headW: 0.24, yaw: -8, s: 0.8, frameY: 0.4, low: 8 })], f);
    case 'masse': return camFromKeys([K(906, [6.7, 0, -1.2], { headW: 0.16, yaw: -10, low: 18, frameY: 0.45 }), K(950, [6.4, 0, -0.9], { headW: 0.24, yaw: 8, low: 10, frameY: 0.4 }), K(996, [6.2, 0, -0.9], { headW: 0.3, yaw: -4, low: 8, frameY: 0.4 })], f);
    case 'rats': return crane([6.4, 0, -1], f, 997, 54, { from: { r: 5.5, h: 1.5, yaw: -6, lookUp: 1.3 }, to: { r: 15, h: 5.5, yaw: 14, lookUp: 0.9 }, fov: 42 });
    case 'supprime': return camFromKeys([K(1052, [offStall(f)[0] + 0.5, 0, -0.9], { headW: 0.28, yaw: 12, low: 12, frameY: 0.4 }), K(1098, [offStall(f)[0] + 0.5, 0, -0.9], { headW: 0.32, yaw: -4, low: 14, frameY: 0.4 })], f);
    case 'restent': return camFromKeys([{ f: 1099, ...frameTwo([5.7, 0, -0.9], [7.2, 0, -0.5], { headW: 0.2, yaw: 8, low: 4, s: 0.95, dutch: 3 }) }, { f: 1155, ...frameTwo([5.7, 0, -0.9], [7.2, 0, -0.5], { headW: 0.27, yaw: -6, low: 8, s: 0.95, dutch: 4 }) }], f);
    case 'alors': return camFromKeys([K(1156, [6.0, 0, -0.4], { headW: 0.3, yaw: 12, low: 10, frameY: 0.4 }), K(1214, [6.0, 0, -0.4], { headW: 0.34, yaw: 4, low: 12, frameY: 0.4 })], f);
    case 'fin': return hookCam(f - 1215);
  }
  return baseCam(0);
};
const TR = [{ a: 138, type: 'rise' }, { a: 221, type: 'drop' }, { a: 294, type: 'whip', dir: 1 }, { a: 371, type: 'push' }, { a: 424, type: 'whip', dir: -1 }, { a: 521, type: 'push' }, { a: 584, type: 'push' }, { a: 697, type: 'drop' },
  { a: 735, type: 'push' }, { a: 790, type: 'whip', dir: 1 }, { a: 854, type: 'push' }, { a: 906, type: 'whip', dir: -1 }, { a: 997, type: 'push' }, { a: 1052, type: 'push' }, { a: 1099, type: 'push' }, { a: 1156, type: 'push' }, { a: 1215, type: 'whip', dir: 1 }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
const FG = { prime: 'coin', premier: 'leaves', compter: 'paper', supprime: 'paper', elev1: 'leaves', elev2: 'leaves', alors: 'coin' };
export const dofAt = (f) => { const C = camAt(f), d = C.dist || Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return FG[shotAt(f).id] ? { focus: d, cinf: 8, near: 3 } : { focus: d, cinf: 8 }; };

// ---------- les rats de chaque plan ----------
function starRatSauf(f) { return { x: lerp(8.5, -3, ramp(f, 600, 700)) , z: 0.9 + 0.2 * Math.sin(f * 0.1) }; }
const relX = (f) => (f < 742 ? BARREL[0] : Math.min(CX + 8.3, BARREL[0] + 0.11 * (f - 742)));
const ratsAt = (f) => {
  const S = shotAt(f), L = [], push = (a) => a.forEach((r) => L.push(r));
  const mk = (o) => L.push(o);
  switch (S.id) {
    case 'hook': mk(starRat(f)); push(swarm(f, { cx: 2.4, cz: 1.0, w: 5.5, d: 2.6, n: 34, f0: 52, vel: -0.05, seed: 3, tailFrac: 0.85, s: 0.5, span: 40 })); break;
    case 'fin': mk(starRat(f - 1215)); break;
    case 'hanoi': push(swarm(f, { cx: 5, cz: 0.5, w: 20, d: 3, n: 8, f0: 138, vel: -0.04, seed: 5, tailFrac: 0.8, s: 0.42, span: 10 })); break;
    case 'egout': push(swarm(f, { cx: CX, cz: 5.3, w: 28, d: 1.5, n: 30, f0: 221, vel: -0.06, seed: 7, tailFrac: 0.95, s: 0.6, y: FLOOR, span: 40 })); break;
    case 'prime': case 'piece': push(swarm(f, { cx: 6.5, cz: 0.9, w: 12, d: 1.2, n: 4, f0: 294, vel: -0.02, seed: 9, tailFrac: 1, s: 0.42, span: 5 })); break;
    case 'premier': case 'compter': push(swarm(f, { cx: 6.5, cz: 1.0, w: 12, d: 1.2, n: 3, f0: 424, vel: -0.02, seed: 11, tailFrac: 1, s: 0.4, span: 5 })); break;
    case 'sauf': { const r = starRatSauf(f); mk({ x: r.x, z: r.z, dir: -1, tail: false, s: lerp(0.5, 0.95, ramp(f, 626, 660)) * (f > 668 ? lerp(1, 0.5, ramp(f, 668, 696)) : 1), ph: 0, eye: f > 650 ? 2 : 0 });
      push(swarm(f, { cx: 4, cz: 1.5, w: 18, d: 2.4, n: 9, f0: 596, vel: -0.075, seed: 13, tailFrac: 0, s: 0.46, span: 40 })); break; }
    case 'coupe': push(swarm(f, { cx: CX, cz: 5.9, w: 28, d: 0.6, n: 10, f0: 0, vel: -0.02, seed: 15, tailFrac: 1, s: 0.34, y: FLOOR, span: 1 }));
      mk({ x: BARREL[0], y: BARREL[1], z: BARREL[2], dir: -1, tail: f < 721, s: 0.66, mv: false, eye: f >= 721 ? 1 : 0 }); break;
    case 'relache': { const run = f >= 742, x = relX(f);
      push(swarm(f, { cx: CX + 4, cz: 5.9, w: 28, d: 0.6, n: 10, f0: 0, vel: -0.02, seed: 15, tailFrac: 1, s: 0.34, y: FLOOR, span: 1 }));
      mk({ x, y: run ? FLOOR : BARREL[1], z: run ? 5.0 : BARREL[2], dir: run ? 1 : -1, tail: false, s: 0.66, mv: run, eye: 2, dy: run ? 0 : hop(f, 738, 0.4, 6).dy });
      for (let i = 0; i < 6; i++) { const t0 = 770 + i * 3; if (f >= t0) mk({ x: CX + 9.0 + (i % 3) * 0.5, y: FLOOR, z: 4.7 + (i % 2) * 0.7, dir: i % 2 ? -1 : 1, tail: i % 2 === 0, s: 0.24, mv: true, ph: i, pop: popIn(f, t0, 8) }); }
      mk({ x: CX + 9.6, y: FLOOR, z: 5.4, dir: -1, tail: true, s: 0.5, mv: false }); break; }
    case 'elev1': case 'elev2': { const n = Math.floor(12 * ramp(f, 800, 905)) + 3;
      for (let i = 0; i < n; i++) { const cg = [[-34.5, -4.2, 1.0], [-31.2, -4.5, 1.0], [-26.9, -4.7, 1.0], [-33, -3.9, 0], [-28.6, -4.2, 0], [-24.8, -4.1, 0], [-35.6, -5.0, 0]][i % 7]; const k = 800 + i * 7;
        mk({ x: cg[0] + (hash(i, 1) - 0.5) * 0.6, y: cg[2] ? 1.0 + 0.38 : 0.38, z: cg[1] + 0.2, dir: i % 2 ? -1 : 1, tail: hash(i, 2) < 0.7, s: 0.3, mv: false, pop: i < 3 ? 1 : popIn(f, k, 9), dy: 0 }); }
      push(swarm(f, { cx: BOY[0] + 0.4, cz: -1.3, w: 3.6, d: 1.0, n: 10, f0: 856, vel: 0.02, seed: 17, tailFrac: 0.8, s: 0.36, span: 40 })); break; }
    case 'masse': push(swarm(f, { cx: 6.5, cz: 0.9, w: 14, d: 2, n: 8, f0: 930, vel: -0.05, seed: 19, tailFrac: 0.4, s: 0.46, span: 50 })); break;
    case 'rats': push(swarm(f, { cx: 6.5, cz: 0.4, w: 15, d: 3.4, n: 26, f0: 997, vel: -0.03, seed: 21, tailFrac: 0.5, s: 0.5, span: 36 }));
      for (let i = 0; i < 5; i++) mk({ x: 5.7 + i * 0.5, y: 1.35 + (i % 2) * 0.1, z: -2.2, dir: i % 2 ? -1 : 1, tail: i % 2 === 0, s: 0.4, mv: false, pop: popIn(f, 1010 + i * 4, 8) }); break;
    case 'supprime': push(swarm(f, { cx: 6.2, cz: 0.5, w: 12, d: 2.6, n: 12, f0: 1052, vel: -0.03, seed: 23, tailFrac: 0.5, s: 0.46, span: 4 })); break;
    case 'restent': push(swarm(f, { cx: 6.4, cz: 0.5, w: 11, d: 2.6, n: 24, f0: 1099, vel: -0.01, seed: 25, tailFrac: 0.5, s: 0.5, span: 8, hold: false })); break;
    case 'alors': push(swarm(f, { cx: 8.6, cz: 0.5, w: 4.6, d: 2.2, n: 22, f0: 1176, vel: -0.012, seed: 27, tailFrac: 0.6, s: 0.48, span: 60 })); break;
  }
  return L;
};

// ---------- effets 3D ----------
const dropDust = (x, f0) => ({ at: [x, 0.25, -0.2], f0, n: 40, power: 1.6, col: '#efe3cc' });
export const envAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return { motes: 0.5, spray: f >= 62 && f < 100 ? [dropDust(3.2, 62)] : [] };
    case 'egout': return { motes: 0.8, smoke: [{ at: [CX - 4, -0.2, 3], f0: 221, f1: 293, rate: 2, size: 0.4, col: '#c8c0b0', rise: 0.25 }] };
    case 'premier': return { motes: 0.9, spray: [[447, 8.2], [466, 8.4], [494, 8.4]].filter(([k]) => f >= k && f < k + 30).map(([k, x]) => dropDust(x, k)) };
    case 'compter': return { motes: 1.0 };
    case 'sauf': return { motes: 0.6 };
    case 'coupe': return { motes: 1.2, sparks: f >= 716 && f < 726 ? [{ at: [CX + 2.4, FLOOR + 1.5, 5.0], f0: 718, f1: 724, rate: 40, col: '#fff08a', speed: 1.6 }] : [] };
    case 'relache': return { motes: 1.2 };
    case 'masse': return { motes: 0.9, spray: [[925, 8.6], [940, 7.6], [962, 8.8]].filter(([k]) => f >= k && f < k + 30).map(([k, x]) => dropDust(x, k)) };
    case 'rats': return { motes: 0.7 };
    case 'supprime': case 'restent': return { motes: 0.9 };
    case 'alors': return { motes: 0.6 };
  }
  return { motes: 0.4 };
};

// ---------- acteurs ----------
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = tintOf(S);
  const fig = (who, seed, o, pos, ex = {}) => out.push(R_(T, who, life(f, seed, o), pos, { tint, ...ex }));
  const walkP = (who, seed, rt, pose, exp, ex = {}) => { const r = route(f, rt); fig(who, seed, { expr: exp, ...pose(r.mv), step: r.mv ? stepOf(r.x, r.z) : 0 }, [r.x, 0, r.z], { s: 0.95, ...ex }); return r; };
  const hookActors = (g) => {
    const ex = g < 40 ? 'suspicious' : g < 70 ? 'shock' : g < 100 ? 'nervous' : 'dazed', h = hop(g, 44, 0.3, 8);
    fig('off', 6, { expr: ex, L: g < 70 ? 'point' : 'head', R: g < 70 ? 'show' : 'head', holdR: g < 70 ? 'coin' : undefined, wv: q(g * 0.5, 1), look: -0.8, tilt: g > 44 && g < 100 ? 3 : 0 }, OFFH, { s: 0.95, dy: h.dy, sx: h.sx, sy: h.sy });
  };
  switch (S.id) {
    case 'hook': hookActors(f); break;
    case 'fin': hookActors(f - 1215); break;
    case 'hanoi': {
      const m = hanoiMai(f), mv = f < 215;
      fig('mai', 4, { expr: 'smile', L: 'show', R: 'hip', holdL: 'tails', step: mv ? stepOf(m.x) : 0, look: 0.4 }, [m.x, 0, m.z], { s: 0.92 });
      fig('off', 6, { expr: 'smug', L: 'hip', R: 'hip', look: -0.6 }, hanoiOff, { s: 0.95 });
      crowd(T, f, { center: [8, 0, -4.2], n: 9, w: 24, d: 2.4, outfits: ['hA', 'hB', 'hC', 'hD', 'clerk'], exprs: ['smile', 'neutral', 'grin'], seed: 3, s: 0.95 }).forEach((a) => out.push({ ...a, tint }));
      break; }
    case 'egout': {
      fig('mai', 4, { expr: f < 250 ? 'shock' : 'pained', L: 'head', R: 'head', wv: q(f * 0.4, 1), look: 0.4 }, [CX + 1.9, FLOOR, 5.0], { s: 0.9, ...(f < 240 ? hop(f, 232, 0.2, 8) : {}) });
      fig('off', 6, { expr: f < 261 ? 'nervous' : 'pained', L: 'cheek', R: 'hip', look: 0.4 }, [CX - 5.0, 0, 2.2], { s: 0.95 });
      fig('hB', 8, { expr: 'shock', L: 'up', R: 'hip', look: 0.4 }, [CX + 3.6, 0, 2.8], { s: 0.95 }); break; }
    case 'prime': {
      fig('off', 6, { expr: f < 330 ? 'smug' : 'proud', L: 'hip', R: 'show', holdR: 'coin', headTilt: f > 330 ? 6 : 0, look: 0.5 }, OFFP, { s: 0.95 });
      fig('mai', 4, { expr: f < 316 ? 'neutral' : 'grin', L: 'hip', R: 'hip', look: -0.6 }, MAIP, { s: 0.92 }); break; }
    case 'piece': {
      fig('off', 6, { expr: 'proud', L: 'hip', R: 'show', holdR: 'coin', headTilt: 8, look: 0.4 }, OFFP, { s: 0.95 });
      fig('mai', 4, { expr: f < 400 ? 'grin' : 'laugh', L: 'show', holdL: 'tails', R: 'hip', look: -0.5 }, MAIP, { s: 0.92 }); break; }
    case 'premier': {
      const m = route(f, [[424, 12.2, -0.2], [446, 8.0, -0.5]]); fig('mai', 4, { expr: 'grin', L: 'show', holdL: f < 450 ? 'tails' : undefined, R: 'hip', step: m.mv ? stepOf(m.x) : 0, look: -0.5 }, [m.x, 0, m.z], { s: 0.92 });
      walkP('hA', 12, [[424, 14.5, -0.7], [458, 9.0, -0.7], [484, 9.0, -0.7], [514, 15, -0.7]], (mv) => ({ L: 'show', holdL: 'tails', R: 'hip', look: -0.4 }), 'smile', {});
      walkP('hC', 14, [[424, 16.5, -0.2], [468, 9.9, -0.2], [498, 9.9, -0.2], [520, 16.5, -0.2]], (mv) => ({ L: 'show', holdL: 'tails', R: 'hip', look: -0.4 }), 'grin', {});
      fig('off', 6, { expr: f < 470 ? 'smile' : 'laugh', L: 'show', R: 'hip', holdL: 'paper', look: 0.7 }, OFFP, { s: 0.95 }); break; }
    case 'compter': {
      const lau = Math.abs(Math.sin(f * 0.45)) * 0.03;
      fig('off', 6, { expr: 'laugh', L: 'hip', R: 'show', holdR: 'paper', look: 0.5 }, OFFP, { s: 0.95, dy: lau, roll: Math.sin(f * 0.45) * 0.03 });
      fig('mai', 4, { expr: 'grin', L: 'hip', R: 'hip', look: -0.5 }, MAIP, { s: 0.92 });
      fig('clerk', 9, { expr: 'smile', L: 'show', R: 'hip', holdL: 'paper', look: -0.4 }, [4.5, 0, -1.6], { s: 0.95 }); break; }
    case 'sauf': {
      fig('off', 6, { expr: f < 600 ? 'laugh' : 'squint', L: 'hip', R: f < 600 ? 'show' : 'hip', holdR: f < 600 ? 'paper' : undefined, look: f < 610 ? 0.3 : 0.9 }, OFFP, { s: 0.95 });
      fig('mai', 4, { expr: f < 600 ? 'grin' : 'suspicious', L: 'hip', R: 'hip', look: 0.9 }, MAIP, { s: 0.92 }); break; }
    case 'coupe': {
      const cut = f >= 718 && f < 724, up = f < 716 ? Math.floor(f / 4) % 2 : 0;
      fig('mai', 4, { expr: f < 718 ? 'scheming' : 'smug', L: 'hip', R: f < 716 ? (up ? 'lift' : 'reach') : (cut ? 'reach' : 'lift'), holdR: 'scissors', look: 0.9 }, MAIT, { s: 0.9 }); break; }
    case 'relache': {
      fig('mai', 4, { expr: 'scheming', L: 'hip', R: 'point', look: 0.9, headTilt: 5 }, MAIT, { s: 0.9 }); break; }
    case 'elev1': case 'elev2': {
      const eat = Math.sin(f * 0.5);
      fig('boy', 21, { expr: f < 880 ? 'scheming' : 'grin', L: 'carry', R: 'show', holdR: 'tails', look: 0.5 }, BOY, { s: 0.78, dy: Math.abs(eat) * 0.01 });
      fig('hA', 12, { expr: 'smile', L: 'hip', R: 'show', holdR: 'tails', look: 0.4 }, [-27.6, 0, -2.4], { s: 0.92 });
      fig('hC', 14, { expr: 'smug', L: 'cross', R: 'cross', look: 0.5 }, [-35.2, 0, -2.2], { s: 0.92 });
      if (f >= 868) { const r = route(f, [[868, -22.4, -1.6], [884, -26.4, -1.7]]); const sh = f >= 884;
        fig('off', 6, { expr: sh ? 'shock' : 'suspicious', L: sh ? 'head' : 'hip', R: sh ? 'head' : 'hip', wv: q(f * 0.5, 1), step: r.mv ? stepOf(r.x) : 0, look: -0.6 }, [r.x, 0, r.z], { s: 0.95, ...(sh ? hop(f, 884, 0.25, 8) : {}) }); }
      break; }
    case 'masse': {
      const pan = f > 950;
      fig('off', 6, { expr: f < 940 ? 'shock' : 'dazed', L: 'head', R: 'head', wv: q(f * 0.5, 1), look: 0.5 }, OFFP, { s: 0.95, ...(f > 962 ? { dx: Math.sin(f * 2.9) * 0.01 } : {}) });
      fig('mai', 4, { expr: 'nervous', L: 'up', R: 'hip', look: -0.4 }, MAIP, { s: 0.92 });
      walkP('hA', 12, [[906, 14, -0.4], [924, 9.6, -0.4], [946, 9.6, -0.4], [970, 15, -0.4]], () => ({ L: 'show', holdL: 'tails', R: 'hip' }), 'laugh', {});
      walkP('hC', 14, [[906, 17, -0.1], [940, 10.6, -0.1], [964, 10.6, -0.1], [990, 16, -0.1]], () => ({ L: 'show', holdL: 'tails', R: 'hip' }), 'grin', {}); void pan; break; }
    case 'rats': {
      fig('off', 6, { expr: 'dazed', L: 'head', R: 'head', wv: q(f * 0.4, 1), look: 0.3, roll: 0 }, OFFP, { s: 0.95 });
      fig('mai', 4, { expr: 'squint', L: 'shrug', R: 'shrug', look: 0.4 }, MAIP, { s: 0.92 }); break; }
    case 'supprime': {
      const torn = f >= 1070, rr = E.smooth(ramp(f, 1052, 1068));
      fig('off', 6, { expr: torn ? 'stubborn' : 'determined', L: torn ? 'hip' : 'reach', R: torn ? 'show' : 'reach', holdR: torn ? 'paper' : undefined, lift: 1 - (torn ? 1 : rr), look: 0.7 }, offStall(f), { s: 0.95 });
      fig('mai', 4, { expr: 'pained', L: 'hip', R: 'hip', look: -0.5 }, [7.7, 0, -0.5], { s: 0.92 }); break; }
    case 'restent': {
      fig('off', 6, { expr: f < 1120 ? 'deadpan' : 'pained', L: 'cross', R: 'cross', look: 0.5 }, [5.7, 0, -0.9], { s: 0.95 });
      fig('mai', 4, { expr: 'smug', L: 'shrug', R: 'shrug', look: -0.6 }, [7.2, 0, -0.5], { s: 0.92 }); break; }
    case 'alors': {
      const k = f > 1222;
      fig('mai', 4, { expr: f < 1184 ? 'smug' : 'proud', L: 'show', holdL: 'tails', R: k ? 'point' : 'show', holdR: k ? undefined : 'coin', headTilt: 6, look: 0 }, [6.0, 0, -0.4], { s: 0.95 });
      break; }
  }
  for (const r of ratsAt(f)) out.push(ratAct(f, r, tint));
  if (FG[S.id] && S.id !== 'alors') { const cam = camAt(f); out.push(fgCard(cam, T.fgProp(FG[S.id], { seed: 2 }), { key: 'fg' + S.id, side: S.id === 'prime' ? 1 : -1, dist: 1.15, drop: 0.55, s: 0.5 })); }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (f >= 188 && f < 221) { const k = ramp(f, 188, 198) * (1 - ramp(f, 214, 221)); out.push(FX('y' + q(k, 1), labelCard('1902', 150, '#ffd23a', INK, k, -0.04), [4.4, 3.9, -1.2], 0.8)); }
  if (f >= 261 && f < 294) { const k = ramp(f, 261, 270) * (1 - ramp(f, 288, 294)); out.push(FX('p' + q(k, 1), labelCard('PESTE !', 110, '#ffffff', '#d8322e', k, 0.05), [CX - 4.0, 3.2, 3.2], 1.25)); }
  if (f >= 392 && f < 424) { const k = ramp(f, 392, 402) * (1 - ramp(f, 418, 424)); out.push(FX('pr' + q(k, 1), priceCard(k), [OFFP[0] + 0.42, 1.95, -0.2], 0.5, { roll: -0.04 })); }
  if (S.id === 'compter') { const k = ramp(f, 530, 540); out.push(FX('c1' + q(k, 1), labelCard('+ 1', 130, '#ffd23a', INK, k, 0.05), [OFFP[0] + 1.0, 2.5, -0.4], 0.5)); }
  if (f >= 718 && f < 742) { const t = (f - 718) / 22; out.push(FX('ft' + Math.floor(t * 12), flyTail(t * 9), [BARREL[0] - 0.2 + 1.1 * t, BARREL[1] + 0.5 + 1.6 * t - 2.6 * t * t, BARREL[2] + 0.5], 0.5)); }
  if (S.id === 'relache') for (const [k0, x] of [[768, CX + 9.2], [776, CX + 9.9]]) if (f >= k0 && f < k0 + 22) { const k = ramp(f, k0, k0 + 8) * (1 - ramp(f, k0 + 16, k0 + 22)); out.push(FX('h' + k0 + q(k, 1), heartCard(k), [x, FLOOR + 1.3 + (f - k0) * 0.02, 5.4], 0.3)); }
  if (f >= 934 && f < 1023) { const n = lerp(0, 20000, E.smooth(ramp(f, 934, 984))), hot = f >= 984; const txt = hot ? '20 000 +' : fmt(n); const k = ramp(f, 934, 942);
    out.push(FX('ct' + txt, counterCard(txt, hot), [6.5, 3.0, -1.0], 0.8, { roll: hot ? Math.sin(f * 0.8) * 0.03 : 0 })); void k; }
  if (f >= 1070 && f < 1098) { const t = (f - 1070) / 28; for (const s of [-1, 1]) out.push(FX('hp' + s + Math.floor(t * 10), halfPoster(s), [5.8 + s * 0.35 + s * 0.5 * t, 2.0 - 1.9 * t * t, -0.3], 0.5, { roll: s * t * 2.2 })); }
  return out;
};
