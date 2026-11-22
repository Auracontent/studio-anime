// « Le pendule de Foucault » (Panthéon, 1851) — 45,8 s, 30 fps, 1373 images. Cadres calés sur phrases.json (Whisper).
// Le pendule oscille toujours dans le plan x (fixe). Le plateau de sable tourne (state.disc). Caméras depuis +z vers -z.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, track, orbit, transition, tremble, rock } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1373, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 127 },          // Ce boulet qui se balance sans rien toucher prouve que la Terre tourne.
  { id: 'paris', a: 128, b: 210 },       // Paris, mille huit cent cinquante et un.
  { id: 'boule', a: 211, b: 306 },       // Léon Foucault accroche une boule de vingt-huit kilos au plafond du Panthéon,
  { id: 'fil', a: 307, b: 386 },         // au bout d'un fil de soixante-sept mètres.
  { id: 'lance', a: 387, b: 435 },       // Il la lance doucement.
  { id: 'pointe', a: 436, b: 549 },      // Une pointe, sous la boule, trace un trait dans le sable.
  { id: 'attend', a: 550, b: 645 },      // Le public attend. Les minutes passent.
  { id: 'trait', a: 646, b: 723 },       // Et le trait change de direction.
  { id: 'touche', a: 724, b: 780 },      // Personne n'a touché la boule.
  { id: 'sens', a: 781, b: 824 },        // Elle balance toujours dans le même sens.
  { id: 'sol', a: 825, b: 909 },         // C'est le sol qui tourne.
  { id: 'heure', a: 910, b: 1006 },      // Chaque heure, le trait dévie de onze degrés.
  { id: 'tour', a: 1007, b: 1095 },      // En trente-deux heures, le tour est complet.
  { id: 'parisiens', a: 1096, b: 1229 }, // Les Parisiens, bouche bée, sentent la Terre tourner sous leurs pieds.
  { id: 'loop', a: 1230, b: 1372 },      // Alors, ce boulet qui se balance sans rien toucher… c'est toi qui bouges.  (rejoue l'accroche)
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const G = (f) => (f >= 1230 ? f - TOTAL : f);                 // le plan final rejoue l'accroche : la dernière image est juste avant la première
const hookish = (S) => S.id === 'hook' || S.id === 'loop';

// ---------- lumière ----------
export const lightFor = (S, f) => {
  const D = mood('dore', { exposure: 1.25, gamma: 1.15, el: 56, az: 150 }), SO = mood('soir', { exposure: 1.2, gamma: 1.18, el: 52, az: 150 }), N = mood('nuit', { exposure: 1.2, gamma: 1.3, el: 60, az: 200 });
  switch (S.id) {
    case 'trait': return blendMood(D, SO, ramp(f, 646, 690));
    case 'touche': case 'sens': return SO;
    case 'sol': return blendMood(SO, N, ramp(f, 825, 850));
    case 'heure': case 'tour': return N;
    case 'parisiens': return blendMood(N, D, ramp(f, 1096, 1130));
    default: return D;
  }
};
const tintOf = (S) => ({ trait: '#ffe2c8', touche: '#ffdcc8', sens: '#ffdcc8', sol: '#e4e4ff', heure: '#e4e4ff', tour: '#e4e4ff' }[S.id] || '#fff0d8');

// ---------- le pendule ----------
const A = 2.4, PIV = 24, WL = 22.8, PER = 150, REL = 410;
const hangY = (x) => PIV - Math.sqrt(WL * WL - x * x);
const dispAt = (f) => {
  const S = shotAt(f);
  if (hookish(S) || S.id === 'paris') return A * Math.sin((2 * Math.PI * G(f)) / PER);
  if (f < 387) return Math.sin(f * 0.05) * 0.04;
  if (f < REL) return -A * E.smooth(ramp(f, 387, 402));
  return -A * Math.cos((2 * Math.PI * (f - REL)) / PER);
};
const CX = (f) => lerp(-6, -0.75, E.smooth(ramp(f, 211, 284)));            // centre des porteurs (la boule va à x = 0)
const ballAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'boule' && f < 288) return { x: CX(f) + 0.75, y: 1.02 + Math.abs(Math.sin(f * 0.35)) * 0.025, z: 0.25, wire: false };
  const x = dispAt(f), y = hangY(x) + (S.id === 'boule' && f >= 288 ? 0.0 : 0) + (S.id === 'boule' ? -0.2 * Math.exp(-(f - 288) / 6) * Math.cos((f - 288) * 0.5) : 0);
  return { x, y, z: 0, wire: true };
};
const ballPos = (f) => { const b = ballAt(f); return [b.x, b.y, b.z]; };
const tipPos = (f) => { const b = ballAt(f); return [b.x, b.y - 1.0, 0]; };
const ext = (f) => {            // étendue de la trace dans le plan du pendule depuis le lâcher
  const S = shotAt(f); if (hookish(S) || S.id === 'paris' || f >= 560) return [0, 2 * A];
  if (f < REL) return null; let mn = 0, mx = 0, d0 = -A; mn = d0; mx = d0;
  for (let ff = REL; ff <= f; ff++) { const d = dispAt(ff); mn = Math.min(mn, d); mx = Math.max(mx, d); }
  return [(mn + mx) / 2, Math.max(0.05, mx - mn)];
};
const discAt = (f) => {         // rotation du sol (degrés) : lente, puis la révélation, puis le tour complet
  const d = 12 * ramp(f, 560, 646) + 24 * E.smooth(ramp(f, 646, 723)) + 4 * ramp(f, 723, 825) + 62 * E.smooth(ramp(f, 825, 909)) + 33 * E.smooth(ramp(f, 910, 1006)) + 360 * E.smooth(ramp(f, 1007, 1090));
  return S_ok(f) ? d : 0;
};
const S_ok = (f) => !(hookish(shotAt(f)) || shotAt(f).id === 'paris');
const worldAt = (f) => {
  const deg = discAt(f), n = Math.min(45, Math.floor(deg / 11)), e = ext(f);
  return { ball: ballAt(f), disc: (deg * Math.PI) / 180, trace: { live: e, k0: deg > 0.5 ? [0, 2 * A] : null, n: S_ok(f) ? n : 0 } };
};
export { worldAt };

// ---------- lieux ----------
const FP = [-3.3, 0, 1.7], AP = [-2.15, 0, 2.2];                      // Foucault et son assistant (accroche, boucle)
const P1 = [2.7, 0, 2.3], P2 = [3.9, 0, 1.8], P3 = [1.5, 0, 3.0], P4 = [5.2, 0, 2.8], P5 = [-0.3, 0, 3.6];

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const mixCam = (a, b, t) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], t)), look: a.look.map((v, i) => lerp(v, b.look[i], t)), fov: lerp(a.fov, b.fov, t) });
const trackBall = (f) => track(ballPos, f, [0.3, 0.45, 4.4], { lookUp: -0.2, fov: 40, lag: 5 });
const twoCam = K2(0, FP, AP, { headW: 0.25, yaw: -26, frameY: 0.42 });
const hookCam = (f) => { const g = G(f), w = g >= 0 ? ramp(g, 38, 88) : 1 - ramp(g, -100, -30); return mixCam(trackBall(f), twoCam, E.smooth(w)); };
const CAMS = {
  fil: [R(307, [0.5, 1.7, 5.8], [0, 2.4, 0], 42), R(345, [1.0, 9, 8], [0, 12, 0], 46), R(386, [1.0, 17, 9], [0, 23, 0], 52)],
  attend: [K2(550, P1, P2, { headW: 0.26, yaw: -14 }), K2(600, P1, P2, { headW: 0.3, yaw: -10 }), K(645, P3, { headW: 0.3, yaw: 8 })],
  trait: [R(646, [1.2, 2.4, 3.0], [0, 0.1, 0], 44), R(682, [0.6, 2.2, 2.4], [0, 0.1, 0], 44), { f: 702, ...frameTwo(P1, P2, { headW: 0.27, yaw: -14 }) }, { f: 723, ...frameTwo(P1, P2, { headW: 0.3, yaw: -10 }) }],
  touche: [K(724, [-0.2, 0, 2.4], { headW: 0.3, yaw: 8 }), K(780, [-0.2, 0, 2.4], { headW: 0.34, yaw: -6 })],
  sens: [R(781, [0, 1.8, 9.5], [0, 1.5, 0], 52), R(824, [0, 1.9, 8.5], [0, 1.5, 0], 52)],
  sol: [R(825, [0, 2.4, 9.5], [0, 1.2, 0], 52), R(855, [0, 7.5, 7.5], [0, 0, 0.5], 55), R(909, [0.5, 9.5, 5.5], [0, 0, 0.5], 60)],
  heure: [R(910, [0.6, 2.7, 3.2], [0, 0.1, 0], 46), R(955, [0.9, 3.0, 2.8], [0, 0.1, 0], 46), K(1006, [-2.2, 0, 2.0], { headW: 0.3, yaw: 24 })],
  tour: [R(1007, [0, 10, 5.5], [0, 0, 0.5], 60), R(1095, [0, 10.5, 5], [0, 0, 0.5], 60)],
  parisiens: [K2(1096, P1, P2, { headW: 0.25, yaw: -14 }), K2(1150, P1, P2, { headW: 0.29, yaw: -8 }), K2(1190, P3, P1, { headW: 0.27, yaw: 6 }), K2(1229, P3, P1, { headW: 0.3, yaw: -4 })],
};
const baseCam = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': case 'loop': return hookCam(f);
    case 'paris': return orbit([0, 0, 0], f, 128, { r: 10.5, h: 3.0, speed: -9, start: 18, fov: 56, lookUp: 4.2 });
    case 'boule': { const px = (ff) => [CX(ff) + 0.75 + 0.7 * E.smooth(ramp(ff, 262, 292)), 0, 0.3]; return shake(follow2(px, f, { headW: lerp(0.24, 0.17, E.smooth(ramp(f, 266, 300))), yaw: -12 }), f, 288, 0.07, 12); }
    case 'fil': return camFromKeys(CAMS.fil, f, { creep: 0 });
    case 'lance': { const a = frameOn([-3.3, 0, 0.7], { headW: 0.27, yaw: 12, frameY: 0.45 }); return mixCam(a, trackBall(f), E.smooth(ramp(f, 405, 428))); }
    case 'pointe': return track(tipPos, f, [0.6, 1.0, 2.3], { lookUp: -0.2, fov: 42, lag: 14 });
    case 'attend': return camFromKeys(CAMS.attend, f);
    case 'trait': return shake(camFromKeys(CAMS.trait, f), f, 650, 0.06, 10);
    case 'touche': return camFromKeys(CAMS.touche, f);
    case 'sens': return camFromKeys(CAMS.sens, f);
    case 'sol': return camFromKeys(CAMS.sol, f);
    case 'heure': return camFromKeys(CAMS.heure, f);
    case 'tour': return camFromKeys(CAMS.tour, f);
    case 'parisiens': return shake(camFromKeys(CAMS.parisiens, f), f, 1100, 0.05, 8);
  }
  return hookCam(f);
};
function follow2(px, f, o) { const p = px(f); return frameOn(p, { frameY: 0.4, ...o }); }
const TR = [{ a: 128, type: 'rise' }, { a: 211, type: 'whip', dir: 1 }, { a: 307, type: 'push' }, { a: 387, type: 'drop' }, { a: 436, type: 'whip', dir: -1 }, { a: 550, type: 'whip', dir: 1 },
  { a: 724, type: 'whip', dir: -1 }, { a: 781, type: 'whip', dir: 1 }, { a: 825, type: 'rise' }, { a: 910, type: 'drop' }, { a: 1007, type: 'push' }, { a: 1096, type: 'whip', dir: 1 }, { a: 1230, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return { focus: d, cinf: 9 }; };

// ---------- effets 3D ----------
const WINB = [0, 3, 6, 9].map((i) => { const a = ((i + 0.5) / 12) * Math.PI * 2, x = Math.sin(a) * 12.85, z = Math.cos(a) * 12.85; return { at: [x, 10.2, z], yaw: Math.atan2(-x, -z), pitch: 0.62, len: 17, r: 1.6, col: '#ffe6a0', a: 0.3 }; });
export const envAt = (f) => {
  const S = shotAt(f), o = { motes: 1, beams: WINB };
  if (S.id === 'boule' && f >= 288 && f < 312) o.smoke = [{ at: [0, 0.25, 0.3], f0: 288, f1: 312, rate: 18, size: 0.7, col: '#e8dcc0', rise: 0.2 }];
  if (S.id === 'boule' && f >= 284) o.spray = [{ at: [0, 0.2, 0.3], f0: 288, n: 90, power: 2.4, col: '#e8dcc0' }];
  if (S.id === 'trait') o.sparks = [{ at: [2.8, 3.3, 2.0], f0: 690, f1: 706, rate: 30, col: '#ffd23a', speed: 2.6, size: 1.6 }];
  if (S.id === 'tour') o.sparks = [{ at: [0, 1.0, 0], f0: 1050, f1: 1090, rate: 16, col: '#fff08a', speed: 3.4, size: 0.9 }];
  if (S.id === 'parisiens') o.sparks = [['#ffd23a'], ['#ff6fa1'], ['#7fd0ff']].map(([col]) => ({ at: [2.7, 4.2, 2.3], f0: 1110, f1: 1229, rate: 14, col, speed: 3.2, size: 1.2 }));
  return o;
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.foucault = { tunic: '#8a1f3a', coat: true, skin: '#f3d3b4', hat: 'tophat', hatCol: '#2a2230', moustache: '#5a3a26', brows: '#5a3a26' };
  O.assistant = { tunic: '#18b8d8', skin: '#c9966a', hair: '#2a1e1a', moustache: '#2a1e1a', brows: '#2a1e1a', scarf: '#f4ecd8' };
  O.ouvrier = { tunic: '#e8782a', skin: '#e0a07a', cap: '#4a3a2a', moustache: '#7a4a2a', brows: '#6a4026', stout: true, apron: '#f1ead8' };
  O.p1 = { tunic: '#8a5ab8', skin: '#e8b890', hat: 'tophat', hatCol: '#3a2a4a', beard: '#3a2418', brows: '#3a2418' };
  O.p2 = { tunic: '#7cb84e', dress: '#7cb84e', skin: '#f1c9a4', hat: 'chapeauplume', hatCol: '#e8a030', hatBand: '#6a2a7a', brows: '#3a2418' };
  O.p3 = { tunic: '#e0a81c', skin: '#7a4a30', cap: '#2b3a6a', moustache: '#1e1714', brows: '#1e1714', stout: true };
  O.p4 = { tunic: '#d8587a', dress: '#d8587a', skin: '#f3cfae', hat: 'bonnet', hatCol: '#f1ead8', brows: '#6a4a2a' };
  O.p5 = { tunic: '#4f7fb8', skin: '#f1c9a4', hair: '#8a4a2a', moustache: '#8a4a2a', brows: '#8a4a2a', bowtie: '#d23a32' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
const icon = (g, kind, cx, cy, s, col) => { g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); if (kind === 'check') { g.moveTo(cx - s, cy); g.lineTo(cx - s * 0.3, cy + s * 0.75); g.lineTo(cx + s, cy - s * 0.8); } else { g.moveTo(cx - s * 0.8, cy - s * 0.8); g.lineTo(cx + s * 0.8, cy + s * 0.8); g.moveTo(cx + s * 0.8, cy - s * 0.8); g.lineTo(cx - s * 0.8, cy + s * 0.8); } };
  g.strokeStyle = INK; g.lineWidth = s * 0.62; path(); g.stroke(); g.strokeStyle = col; g.lineWidth = s * 0.34; path(); g.stroke(); g.restore(); };
const labelCard = (txt, size, fill, bg, k = 1, rot = 0, ic = null) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520);
  panel(g, 30, 410, 540, 220, bg);
  if (ic) icon(g, ic, 300, 520, 78, ic === 'check' ? '#3fb04a' : '#ff5a4a'); else TXT(g, txt, 300, 520 + size * 0.36, size, fill, 0); g.restore(); };
// double flèche (même sens) et horloge (les minutes passent) dessinées à la main
const arrowCard = (k = 1) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520); panel(g, 30, 410, 540, 220, '#ffd23a');
  g.lineCap = 'round'; g.lineJoin = 'round'; const path = () => { g.beginPath(); g.moveTo(90, 520); g.lineTo(510, 520); g.moveTo(90, 520); g.lineTo(150, 465); g.moveTo(90, 520); g.lineTo(150, 575); g.moveTo(510, 520); g.lineTo(450, 465); g.moveTo(510, 520); g.lineTo(450, 575); };
  g.strokeStyle = INK; g.lineWidth = 34; path(); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 16; path(); g.stroke(); g.restore(); };
const clockCard = (ang, k = 1) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.scale(s, s); g.translate(-300, -520);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.fillStyle = '#f7f3ea'; g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(300, 520, 150, 0, 6.283); g.fill(); g.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.lineWidth = 9; g.beginPath(); g.moveTo(300 + Math.sin(a) * 118, 520 - Math.cos(a) * 118); g.lineTo(300 + Math.sin(a) * 136, 520 - Math.cos(a) * 136); g.stroke(); }
  const hand = (a, L, w, c) => { g.strokeStyle = INK; g.lineWidth = w + 12; g.beginPath(); g.moveTo(300, 520); g.lineTo(300 + Math.sin(a) * L, 520 - Math.cos(a) * L); g.stroke(); g.strokeStyle = c; g.lineWidth = w; g.stroke(); };
  hand(ang / 12, 78, 14, '#271925'); hand(ang, 112, 10, '#d23a32'); g.fillStyle = INK; g.beginPath(); g.arc(300, 520, 16, 0, 6.283); g.fill(); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s * 1.9, z: pos[2], s: s * 1.9, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const legs = (x) => q((x * 1.1) % 1, 2);
export const actorsAt = (f, T) => {
  const S = shotAt(f), g = G(f), out = [], tint = tintOf(S), ff = hookish(S) ? g : f;
  const fig = (who, seed, o, pos, ex = {}) => R_(T, who, life(ff, seed, o), pos, { tint, ...ex });
  const sway = (k, a = 0.03) => ({ dx: Math.sin(f * 0.21 + k) * a, roll: Math.sin(f * 0.17 + k * 2) * a * 1.6 });
  const pend = ballPos(f);
  switch (S.id) {
    case 'hook': case 'loop': {
      const late = S.id === 'loop' ? 1 : 0;
      out.push(fig('foucault', 4, { expr: g < 60 && !late ? 'shock' : late ? 'grin' : 'grin', L: 'hip', R: 'point', look: 0.9 }, FP, { dy: late ? Math.abs(Math.sin(f * 0.3)) * 0.02 : 0 }));
      out.push(fig('assistant', 6, { expr: late ? 'laugh' : 'shock', L: 'hip', R: 'reach', holdR: 'paper', look: 0.9 }, AP));
      break; }
    case 'paris': {
      out.push(fig('foucault', 4, { expr: 'grin', L: 'hip', R: 'point', look: 0.5 }, [2.0, 0, 2.2]));
      out.push(fig('assistant', 6, { expr: 'smile', L: 'hip', R: 'hip', look: 0.5 }, [3.1, 0, 2.6]));
      [[P3, 'p3', 14], [P5, 'p5', 18], [[-4.5, 0, 0.5], 'p1', 12], [[-5.6, 0, 3.5], 'p2', 16], [[4.6, 0, -2.4], 'p4', 20]].forEach(([p, w, s]) => out.push(fig(w, s, { expr: 'smile', L: 'hip', R: 'hip', look: -0.3 }, p)));
      break; }
    case 'boule': {
      const cx = CX(f), walking = f < 286, tr = walking ? tremble(f, 0.012, 2) : { dx: 0, roll: 0 };
      const st = legs(cx * 1.6), carryP = walking ? 'carry' : 'hip';
      out.push(fig('ouvrier', 8, { expr: walking ? 'pained' : f < 300 ? 'laugh' : 'smile', L: carryP, R: carryP, step: walking ? st : 0, look: 0.5 }, [cx, 0, 0.3], { ...tr, dy: walking ? Math.abs(Math.sin(cx * 4)) * 0.02 : 0 }));
      out.push(fig('assistant', 6, { expr: walking ? 'nervous' : 'laugh', L: carryP, R: carryP, step: walking ? legs(cx * 1.6 + 0.5) : 0, look: -0.5 }, [cx + 1.5, 0, 0.3], { dx: -tr.dx, roll: -tr.roll, dy: walking ? Math.abs(Math.sin(cx * 4 + 1.5)) * 0.02 : 0 }));
      out.push(fig('foucault', 4, { expr: f < 288 ? 'grin' : 'laugh', L: 'hip', R: f < 288 ? 'point' : 'up', look: -0.7 }, [1.9, 0, 1.2], f >= 290 && f < 306 ? { dy: hop(f, 290, 0.08, 6).dy } : {}));
      break; }
    case 'fil': {
      out.push(fig('foucault', 4, { expr: 'grin', L: 'hip', R: 'up', look: 0.1 }, [-1.9, 0, 1.3]));
      out.push(fig('assistant', 6, { expr: 'shock', L: 'reach', R: 'hip', look: 0.1 }, [-0.9, 0, 1.7]));
      break; }
    case 'lance': {
      const rel = f >= 410;
      out.push(fig('foucault', 4, { expr: rel ? 'grin' : 'squint', L: 'hip', R: rel ? 'wave' : 'reach', wv: q(f * 0.3, 1), look: 0.8 }, [-3.4, 0, 0.7], rel ? { dy: hop(f, 410, 0.07, 6).dy } : {}));
      out.push(fig('assistant', 6, { expr: rel ? 'shock' : 'nervous', L: 'hip', R: 'hip', look: 0.8 }, [-4.5, 0, 1.3]));
      break; }
    case 'pointe': break;
    case 'attend': {
      const t = f > 603;
      out.push(fig('p1', 12, { expr: t ? 'pained' : 'nervous', L: 'hip', R: 'reach', holdR: 'coin', look: 0.6 }, P1, sway(1, 0.012)));
      out.push(fig('p2', 14, { expr: t ? 'squint' : 'smile', L: 'cross', R: 'cross', look: -0.4 }, P2, sway(2, 0.012)));
      out.push(fig('p3', 16, { expr: f > 625 ? 'stubborn' : 'squint', L: 'cross', R: 'cross', look: 0.6 }, P3, sway(3, 0.01)));
      out.push(fig('p4', 20, { expr: 'smile', L: 'hip', R: 'hip', look: -0.6 }, P4));
      break; }
    case 'trait': {
      const sh = f >= 690, jump = hop(f, 692, 0.12, 8), j2 = hop(f, 696, 0.1, 8);
      out.push(fig('p1', 12, { expr: sh ? 'shock' : 'squint', L: sh ? 'head' : 'hip', R: sh ? 'head' : 'reach', holdR: sh ? undefined : 'coin', wv: q(f * 0.4, 1), look: -0.7 }, P1, sh ? { dy: jump.dy, sx: jump.sx, sy: jump.sy } : {}));
      out.push(fig('p2', 14, { expr: sh ? 'shock' : 'squint', L: sh ? 'up' : 'hip', R: sh ? 'up' : 'hip', look: -0.7 }, P2, sh ? { dy: j2.dy, sx: j2.sx, sy: j2.sy } : {}));
      out.push(fig('p3', 16, { expr: sh ? 'shock' : 'squint', L: 'head', R: 'head', look: -0.5 }, P3));
      break; }
    case 'touche': {
      out.push(fig('foucault', 4, { expr: f < 750 ? 'stern' : 'laugh', L: 'up', R: 'up', look: -0.1 }, [-0.2, 0, 2.4], { dy: f >= 750 ? Math.abs(Math.sin(f * 0.4)) * 0.02 : 0 }));
      break; }
    case 'sens': {
      out.push(fig('foucault', 4, { expr: 'grin', L: 'hip', R: 'point', look: 0.9 }, [-1.0, 0, 3.2]));
      out.push(fig('assistant', 6, { expr: 'smile', L: 'point', R: 'hip', look: -0.9 }, [1.0, 0, 3.2]));
      break; }
    case 'sol': {
      out.push(fig('foucault', 4, { expr: 'shock', L: 'hip', R: 'point', look: 0.1 }, [-3.3, 0, 2.0]));
      out.push(fig('assistant', 6, { expr: 'shock', L: 'point', R: 'hip', look: -0.1 }, [3.3, 0, 2.0]));
      break; }
    case 'heure': {
      const hot = f > 960;
      out.push(fig('foucault', 4, { expr: hot ? 'grin' : 'squint', L: 'hip', R: 'point', look: 0.8 }, [-2.2, 0, 2.0]));
      break; }
    case 'tour': break;
    case 'parisiens': {
      const lau = f > 1150;
      const act = (who, seed, pos, k, o = {}) => out.push(fig(who, seed, { expr: lau ? 'laugh' : 'shock', L: lau ? 'up' : 'head', R: lau ? 'up' : 'head', look: 0, wv: q(f * 0.4, 1), ...o }, pos, { ...sway(k, 0.045), ...(lau ? { dy: Math.abs(Math.sin(f * 0.32 + k)) * 0.07 } : {}) }));
      act('p1', 12, P1, 1); act('p2', 14, P2, 2); act('p3', 16, P3, 3, { stout: true }); act('p4', 20, P4, 4); act('p5', 22, P5, 5);
      break; }
  }
  return out;
};

// ---------- effets 2D (cartes, chiffres) ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), g = G(f), out = [];
  if (hookish(S) && g >= 70 && g < 127) { const k = ramp(g, 70, 82); out.push(FX('te' + q(k, 1), labelCard('LA TERRE ?', 70, '#ffd23a', INK, k, -0.04), [-2.5, 3.5, 1.5], 0.5)); }
  if (S.id === 'loop' && g >= -40) { const k = ramp(g, -40, -28); out.push(FX('toi' + q(k, 1), labelCard("C'EST TOI !", 62, '#ffd23a', INK, k, 0.04), [0.4, 2.7, 1.0], 0.5)); }
  if (S.id === 'paris') { const k = ramp(f, 134, 148); out.push(FX('pa' + q(k, 1), labelCard('PARIS 1851', 78, '#ffd23a', INK, k, -0.03), [0, 6.0, 0.5], 1.15)); }
  if (S.id === 'boule' && f >= 232 && f < 300) { const k = ramp(f, 232, 244); out.push(FX('kg' + q(k, 1), labelCard('28 kg', 118, '#ffd23a', INK, k, -0.04), [CX(f) + 0.75, 2.9, 0.8], 0.52)); }
  if (S.id === 'fil' && f >= 332) { const k = ramp(f, 332, 346); out.push(FX('m67' + q(k, 1), labelCard('67 m', 120, '#ffd23a', INK, k, 0.04), [0.7, 11.5, 0.6], 0.9)); }
  if (S.id === 'attend' && f >= 603) { const k = ramp(f, 603, 614); out.push(FX('ck' + q(k, 1) + q(f * 0.9, 1), clockCard(f * 0.9, k), [3.3, 3.5, 1.9], 0.55)); }
  if (S.id === 'sens') { const k = ramp(f, 784, 796); out.push(FX('ar' + q(k, 1), arrowCard(k), [0, 3.7, 0.5], 0.8)); }
  if (S.id === 'sol') { const k = ramp(f, 830, 842); out.push(FX('so' + q(k, 1), labelCard('LE SOL !', 100, '#ffd23a', INK, k, -0.04), [0, 3.4, -1.0], 1.0)); }
  if (S.id === 'heure') {
    const k = ramp(f, 912, 924); out.push(FX('h11' + q(k, 1), labelCard('11°/h', 128, '#ffd23a', INK, k, 0.04), [-0.15, 1.1, 0.7], 0.3));
    out.push(FX('hc' + q(k, 1) + q(f * 0.5, 1), clockCard(f * 0.5, k), [0.5, 1.1, 0.7], 0.3)); }
  if (S.id === 'tour') {
    const k = ramp(f, 1008, 1020); if (f < 1062) out.push(FX('h32' + q(k, 1), labelCard('32 h', 130, '#ffd23a', INK, k, -0.04), [0, 3.6, 0.0], 0.95));
    else { const k2 = ramp(f, 1062, 1074); out.push(FX('chk' + q(k2, 1), labelCard('', 0, '#fff', '#2f9a4a', k2, 0.04, 'check'), [0, 3.6, 0.0], 0.95)); } }
  return out;
};
