// "Le bœuf de Galton" (1906) — 42,0 s, 30 fps, 1260 images. Cadres calés sur phrases.json (Whisper).
// Zones : table du concours TX = -16, enclos du bœuf OXX = 0, balance BX = 14.4.
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q, shake, hop, track, orbit, transition } from '../motion.js';
import { mood, blendMood } from '../moods.js';
export const FPS = 30, TOTAL = 1260, DECK = 0;
const TX = -16, BX = 14.4;
export const SHOTS = [
  { id: 'hook', a: 0, b: 142 },          // Personne n'a trouvé le poids de ce bœuf. Mais la foule entière, si.
  { id: 'large', a: 143, b: 179 },       // Dans une foire anglaise,
  { id: 'billets', a: 180, b: 278 },     // près de huit cents visiteurs écrivent leur estimation sur un billet.
  { id: 'gens', a: 279, b: 404 },        // Il y a des bouchers, des fermiers, et des gens qui n'ont jamais touché un bœuf.
  { id: 'savant', a: 405, b: 512 },      // Un savant, Francis Galton, ramasse les billets.
  { id: 'sur', a: 513, b: 587 },         // Il est sûr que la foule va se tromper lourdement.
  { id: 'pivot', a: 588, b: 677 },       // Sauf que… il calcule le chiffre du milieu :
  { id: 'chiffre', a: 678, b: 741 },     // mille deux cent sept livres.
  { id: 'boeuf', a: 742, b: 870 },       // Le bœuf, une fois préparé, pèse mille cent quatre-vingt-dix-huit livres.
  { id: 'ecart', a: 871, b: 930 },       // Moins d'un pour cent d'écart.
  { id: 'faux', a: 931, b: 968 },        // Chaque billet se trompait,
  { id: 'annule', a: 969, b: 1045 },     // mais les erreurs trop fortes et trop faibles s'annulaient.
  { id: 'annee', a: 1046, b: 1120 },     // C'était en mil neuf cent six.
  { id: 'rien', a: 1121, b: 1186 },      // Aucun visiteur n'avait la réponse,
  { id: 'tous', a: 1187, b: 1227 },      // mais tous ensemble,
  { id: 'loop', a: 1228, b: 1259 },      // ils l'avaient.  (même plan que l'accroche)
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const G = (f) => (f >= 1228 ? f - 1259 : f);                // le plan final rejoue l'accroche : la dernière image = la première

// ---------- lumière ----------
export const lightFor = (S, f) => {
  const J = mood('jour', { exposure: 1.08 }), MA = mood('matin', { exposure: 1.12 }), D = mood('dore', { exposure: 1.1 });
  switch (S.id) {
    case 'savant': case 'sur': return MA;
    case 'pivot': return blendMood(MA, D, ramp(f, 592, 650));
    case 'chiffre': case 'boeuf': case 'ecart': case 'faux': case 'annule': case 'annee': case 'rien': case 'tous': return D;
    case 'loop': return blendMood(D, J, ramp(f, 1228, 1259));
    default: return J;
  }
};
const tintOf = (S) => ({ savant: '#ffe6cc', sur: '#ffe6cc', pivot: '#ffe2b8', chiffre: '#ffe2b0', boeuf: '#ffe2b0', ecart: '#ffe2b0', faux: '#ffe2b0', annule: '#ffe2b0', annee: '#ffe2b0', rien: '#ffe2b0', tous: '#ffe2b0' }[S.id] || '#fff0d8');

// ---------- lieux ----------
const PEN = {                                              // l'enclos du bœuf (accroche, plan large, finale)
  galton: [3.5, 0, 0.9], boucher: [-3.2, 0, 1.0], fermiere: [7.4, 0, 1.2], citadin: [5.8, 0, -0.4],
  c1: [-0.4, 0, -3.4], c2: [1.6, 0, -3.6], c3: [4.2, 0, -2.8], c4: [-2.8, 0, 0.2], c5: [7.0, 0, 0.2],
};
const OXP = [0, 0, -1.4], HEAD = [2.5, 0, -1.4];
const GT = [TX + 0.4, 0, -1.7], URN_REST = { x: TX + 1.5, y: 0.92, z: -0.3, rz: 0 };
const BU = [TX - 1.2, 0, 0.6], FE = [TX - 0.0, 0, 0.75];
const GB = [BX - 1.0, 0, 2.3], BB = [BX + 0.8, 0, 2.3];
const oxX = (f) => 8.2 + (BX - 8.2) * E.smooth(ramp(f, 742, 806));
const oxY = (x) => x < 9.3 ? 0 : x < 11.9 ? 0.34 * (x - 9.3) / 2.6 : 0.34;
const worldAt = (f) => {
  const S = shotAt(f), g = G(f), w = { ox: { vis: false } };
  const penOx = { vis: true, x: OXP[0], z: OXP[2], ry: 0, nod: Math.sin(g * 0.07) * 0.25, tail: g };
  switch (S.id) {
    case 'hook': case 'loop': case 'large': case 'annee': case 'rien': case 'tous': w.ox = { ...penOx, nod: S.id === 'hook' || S.id === 'loop' ? Math.sin(g * 0.07) * 0.25 : Math.sin(f * 0.07) * 0.25, tail: S.id === 'hook' || S.id === 'loop' ? g : f }; break;
    case 'gens': { const sn = ramp(f, 368, 376) * (1 - ramp(f, 384, 396)); w.ox = { ...penOx, nod: Math.sin(f * 0.07) * 0.25 + sn * 0.9, tail: f * 2 }; break; }
    case 'boeuf': case 'ecart': case 'faux': case 'annule': { const x = f < 806 ? oxX(f) : BX; w.ox = { vis: true, x, z: 0, y: oxY(x), ry: 0, walk: f < 806 ? (x * 0.55) % 1 : undefined, nod: Math.sin(f * 0.07) * 0.2, tail: f }; break; }
  }
  // billets (tickets) en 3D
  const tix = []; let pile = 0, row = 0, mid = 0, urn = { ...URN_REST, ry: 0 };
  if (f >= 180 && f < 279) {   // les visiteurs jettent leur billet dans l'urne
    for (const [i, h] of [[0, BU], [1, FE]]) { const t0 = 186 + i * 17 + 0; for (let k = 0; k < 3; k++) { const s0 = t0 + k * 34, u = (f - s0) / 14; if (u >= 0 && u <= 1) tix.push([lerp(h[0] + 0.5, URN_REST.x, u), lerp(1.55, 1.0, u) + 0.7 * 4 * u * (1 - u), lerp(h[2], URN_REST.z, u), u * 6, 0]); } }
  }
  if (f >= 405 && f < 513) {
    const lift = E.smooth(ramp(f, 432, 454)), tilt = E.smooth(ramp(f, 456, 474)), back = E.smooth(ramp(f, 498, 510));
    const ux = lerp(lerp(URN_REST.x, TX + 1.0, lift), TX - 0.2, tilt), uy = lerp(lerp(URN_REST.y, 1.15, lift), 1.25, tilt), uz = lerp(URN_REST.z, -1.2, lift);
    urn = { x: lerp(ux, TX + 1.8, back), y: lerp(uy, URN_REST.y, back), z: lerp(uz, -0.3, back), rz: tilt * 2.0 * (1 - back), ry: 0 };
    pile = 70 * ramp(f, 470, 500);
    for (let i = 0; i < 6; i++) { const s0 = 468 + i * 5, u = (f - s0) / 12; if (u >= 0 && u <= 1) tix.push([TX - 0.5 - 0.1 * i, lerp(1.3, 1.0, u * u), -1.0 + i * 0.12, u * 4 + i, 0.3]); }
  } else if (f >= 513 && f < 588) { pile = 70; urn = { x: TX + 1.8, y: URN_REST.y, z: -0.3, rz: 0, ry: 0 }; }
  else if (f >= 588 && f < 742) { pile = 70 * (1 - ramp(f, 596, 650)); row = 41 * ramp(f, 596, 656); mid = E.smooth(ramp(f, 680, 704)) * (f < 742 ? 1 : 0); urn = { x: TX + 1.8, y: URN_REST.y, z: -0.3, rz: 0, ry: 0 }; }
  // balance
  let dial = 0; if (f >= 806) dial = (1198 / 1500) * E.spring((f - 806) / 30, 1.5, 3.2);
  return { ...w, tix, pile, row, mid, urn, dial };
};
export { worldAt };

// ---------- caméras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const K2 = (f, a, b, o = {}, e = {}) => ({ f, ...frameTwo(a, b, o), ...e });
const R = (f, pos, look, fov = 40, e = {}) => ({ f, pos, look, fov, ...e });
const mixCam = (a, b, t) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], t)), look: a.look.map((v, i) => lerp(v, b.look[i], t)), fov: lerp(a.fov, b.fov, t) });
const CAMS = {
  hook: [K2(0, [3.5, 0, 0.9], [1.7, 0, -1.4], { headW: 0.21, yaw: -10, frameY: 0.45 }), K2(100, [3.5, 0, 0.9], [1.7, 0, -1.4], { headW: 0.15, yaw: -6, frameY: 0.5 }), K2(142, [2.2, 0, 0], [2.2, 0, 0], { headW: 0.1, yaw: 2, frameY: 0.5 })],
  billets: [K(180, [TX - 0.6, 0, 0.7], { headW: 0.18, yaw: -8, frameY: 0.42 }), K(278, [TX - 0.3, 0, 0.7], { headW: 0.18, yaw: 6, frameY: 0.42 })],
  gens: [K(279, [-1.6, 0, 0.8], { headW: 0.32, yaw: -6, frameY: 0.4 }), K(312, [-1.4, 0, 0.8], { headW: 0.32, yaw: 4, frameY: 0.4 }), K(318, [0.0, 0, 0.8], { headW: 0.32, yaw: -4, frameY: 0.4 }), K(340, [0.2, 0, 0.8], { headW: 0.32, yaw: 5, frameY: 0.4 }),
    K2(360, [1.5, 0, -0.1], HEAD, { headW: 0.24, yaw: -10, frameY: 0.4 }), K2(404, [1.5, 0, -0.1], HEAD, { headW: 0.25, yaw: 6, frameY: 0.4 })],
  savant: [K(405, GT, { headW: 0.36, yaw: -6, frameY: 0.58 }), K(512, GT, { headW: 0.4, yaw: 6, frameY: 0.58 })],
  sur: [K(513, GT, { headW: 0.38, yaw: 8, frameY: 0.58 }), K(587, GT, { headW: 0.42, yaw: -6, frameY: 0.58 })],
  pivot: [R(588, [TX - 2.6, 1.0, 3.2], [TX - 1.2, 1.0, 0], 40), R(640, [TX - 0.8, 1.2, 2.6], [TX - 0.2, 1.2, 0], 40), K(677, GT, { headW: 0.38, yaw: 8, frameY: 0.58 })],
  chiffre: [K(678, GT, { headW: 0.38, yaw: 8, frameY: 0.58 }), K(741, GT, { headW: 0.42, yaw: -4, frameY: 0.58 })],
  ecart: [K2(871, GB, BB, { headW: 0.24, yaw: -8, frameY: 0.42 }), K2(930, GB, BB, { headW: 0.26, yaw: 6, frameY: 0.42 })],
  faux: [K2(931, [BX - 0.9, 0, 2.3], [BX + 0.7, 0, 2.3], { headW: 0.25, yaw: -6, frameY: 0.42 }), K2(968, [BX - 0.9, 0, 2.3], [BX + 0.7, 0, 2.3], { headW: 0.27, yaw: 6, frameY: 0.42 })],
  annule: [K(969, [BX, 0, 2.3], { headW: 0.16, yaw: -6, frameY: 0.46 }), K(1045, [BX, 0, 2.3], { headW: 0.19, yaw: 6, frameY: 0.46 })],
  rien: [K2(1121, [-3.4, 0, 1.4], [-1.9, 0, 1.4], { headW: 0.27, yaw: 8, frameY: 0.42 }), K2(1186, [-3.4, 0, 1.4], [-1.9, 0, 1.4], { headW: 0.3, yaw: -6, frameY: 0.42 })],
  tous: [K(1187, [2.4, 0, 0.0], { headW: 0.16, yaw: 16, frameY: 0.5 }), K(1227, [2.6, 0, 0.0], { headW: 0.2, yaw: 4, frameY: 0.5 })],
};
const dialCam = R(0, [BX, 2.9, 5.6], [BX, 2.7, -1.6], 38);
const oxTrack = (f) => track((ff) => [oxX(ff), oxY(oxX(ff)), 0], f, [-0.5, 1.3, 7.0], { lookUp: 1.0, fov: 42 });
const baseCam = (f) => {
  const S = shotAt(f), g = G(f);
  switch (S.id) {
    case 'hook': case 'loop': { return camFromKeys(CAMS.hook, g, { creep: 0.0008 }); }
    case 'large': return orbit([2, 0.5, -1.5], f, 143, { r: 30, h: 9, speed: -6, start: 8, fov: 42, lookUp: 1.2 });
    case 'billets': return camFromKeys(CAMS.billets, f);
    case 'gens': { let c = camFromKeys(CAMS.gens, f); return shake(c, f, 370, 0.05, 8); }
    case 'savant': return camFromKeys(CAMS.savant, f);
    case 'sur': return shake(camFromKeys(CAMS.sur, f), f, 548, 0.03, 8);
    case 'pivot': { return shake(camFromKeys(CAMS.pivot, f), f, 592, 0.09, 12); }
    case 'chiffre': return shake(camFromKeys(CAMS.chiffre, f, { kicks: [{ f: 681, a: 0.03 }] }), f, 688, 0.05, 8);
    case 'boeuf': { const a = oxTrack(Math.min(f, 800)); if (f < 800) return a; const b = { ...dialCam }; let c = mixCam(a, b, E.smooth(ramp(f, 800, 836))); return shake(c, f, 807, 0.1, 12); }
    case 'ecart': return camFromKeys(CAMS.ecart, f);
    case 'faux': return camFromKeys(CAMS.faux, f);
    case 'annule': return shake(camFromKeys(CAMS.annule, f), f, 1010, 0.05, 8);
    case 'annee': return orbit([2, 0.5, -1.5], f, 1046, { r: 26, h: 8.5, speed: -7, start: 6, fov: 42, lookUp: 1.4 });
    case 'rien': return camFromKeys(CAMS.rien, f);
    case 'tous': return camFromKeys(CAMS.tous, f);
  }
  return camFromKeys(CAMS.hook, g);
};
const TR = [{ a: 742, type: 'whip', dir: 1 }, { a: 1046, type: 'rise' }, { a: 1121, type: 'whip', dir: -1 }, { a: 1187, type: 'whip', dir: 1 }, { a: 1228, type: 'push' }];
export const camAt = (f) => {
  const T = TR.find((t) => f >= t.a - 6 && f < t.a + 6);
  if (T) return transition(T.type, baseCam(T.a - 6), baseCam(T.a + 6), f, T.a - 6, 12, { dir: T.dir || 1 });
  return baseCam(f);
};
export const dofAt = (f) => { const C = camAt(f), d = Math.hypot(C.pos[0] - C.look[0], C.pos[1] - C.look[1], C.pos[2] - C.look[2]); return { focus: d, cinf: 9 }; };

// ---------- effets 3D ----------
const CONF = (at, f0, f1, rate = 16) => [['#ffd23a'], ['#ff6fa1'], ['#7fd0ff']].map(([col]) => ({ at, f0, f1, rate, col, speed: 3.2, size: 1 }));
export const envAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'hook': return { motes: 0.6, sparks: CONF([3.0, 4.6, -3.0], 102, 142), wind: [0.8, 0] };
    case 'gens': return { motes: 0.5, smoke: f >= 368 && f < 392 ? [{ at: [3.0, 1.15, -1.4], f0: 368, f1: 392, rate: 20, size: 0.4, col: '#f4ecd8', rise: 0.2 }] : [] };
    case 'chiffre': return { motes: 1, sparks: [{ at: [TX + 0.0, 1.7, 0.2], f0: 690, f1: 735, rate: 18, col: '#ffd23a', speed: 2.6, size: 2 }] };
    case 'pivot': case 'sur': case 'savant': return { motes: 1 };
    case 'boeuf': return { motes: 0.6, spray: [{ at: [BX - 2.0, 0.35, 1.6], f0: 806, n: 150, power: 3.6, col: '#e8dcc0' }], smoke: f < 806 ? [{ at: [oxX(f) - 1.8, 0.2, 0.2], f0: 742, f1: 806, rate: 16, size: 0.9, col: '#d9c9a0', rise: 0.25 }] : [], wind: [1, 0] };
    case 'ecart': return { motes: 0.5, sparks: CONF([BX, 4.4, 1.6], 873, 930, 12) };
    case 'annule': return { motes: 0.5, sparks: [{ at: [BX, 3.4, 1.4], f0: 1010, f1: 1030, rate: 50, col: '#fff08a', speed: 3.4, size: 2 }] };
    case 'annee': return { motes: 0.6, wind: [1, 0] };
    case 'tous': return { motes: 0.6, sparks: CONF([2.4, 4.6, 0.0], 1196, 1227, 20) };
    case 'loop': return { motes: 0.6, wind: [0.8, 0] };
    default: return { motes: 0.6 };
  }
};

// ---------- casting ----------
export const setupCast = (T) => {
  const O = T.OUTFITS;
  O.galton = { tunic: '#6a7a62', skin: '#f3d3b4', hat: 'tophat', hatCol: '#6a4a36', moustache: '#c8b898', glasses: true, brows: '#b0a48a' };
  O.boucher = { tunic: '#d8302a', skin: '#e0a07a', cap: '#f1ead8', apron: '#f1ead8', moustache: '#7a4a2a', brows: '#6a4026', stout: true };
  O.fermiere = { tunic: '#18b8d8', dress: '#18b8d8', skin: '#f3cfae', hat: 'bonnet', hatCol: '#f1ead8', brows: '#6a4a2a' };
  O.citadin = { tunic: '#8a5ab8', skin: '#e8b890', hair: '#3a2418', moustache: '#3a2418', brows: '#3a2418' };
  O.v1 = { tunic: '#e8782a', skin: '#c9966a', cap: '#4a3a2a', beard: '#2a1e1a', brows: '#2a1e1a', stout: true };
  O.v2 = { tunic: '#7cb84e', dress: '#7cb84e', skin: '#f1c9a4', hat: 'chapeauplume', hatCol: '#e8a030', hatBand: '#6a2a7a', brows: '#3a2418' };
  O.v3 = { tunic: '#e0a81c', skin: '#7a4a30', cap: '#2b3a6a', moustache: '#1e1714', brows: '#1e1714' };
  O.v4 = { tunic: '#d8587a', dress: '#d8587a', skin: '#f3cfae', hair: '#8a4a2a', brows: '#6a4a2a' };
  O.v5 = { tunic: '#4f7fb8', skin: '#f1c9a4', cap: '#c2733a', moustache: '#8a8a8a', brows: '#8a8a8a' };
};
const R_ = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const INK = '#271925';
const TXT = (g, t, x, y, size, fill, ol = 18) => { g.font = `800 ${size}px Montserrat, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = ol; g.strokeStyle = INK; if (ol) g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
function panel(g, x, y, w, h, fill = '#f7f3ea') { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, 40); g.fill(); g.stroke(); }
// icônes dessinées (les polices n'ont pas toujours ✓ ✗)
const icon = (g, kind, cx, cy, s, col) => { g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); if (kind === 'check') { g.moveTo(cx - s, cy); g.lineTo(cx - s * 0.3, cy + s * 0.75); g.lineTo(cx + s, cy - s * 0.8); } else { g.moveTo(cx - s * 0.8, cy - s * 0.8); g.lineTo(cx + s * 0.8, cy + s * 0.8); g.moveTo(cx + s * 0.8, cy - s * 0.8); g.lineTo(cx - s * 0.8, cy + s * 0.8); } };
  g.strokeStyle = INK; g.lineWidth = s * 0.62; path(); g.stroke(); g.strokeStyle = col; g.lineWidth = s * 0.34; path(); g.stroke(); g.restore(); };
const labelCard = (txt, size, fill, bg, k = 1, rot = 0, ic = null) => (p) => { const g = p.g; g.save(); const s = 0.5 + 0.5 * E.back(clamp(k)); g.translate(300, 520); g.rotate(rot); g.scale(s, s); g.translate(-300, -520);
  panel(g, 30, 410, 540, 220, bg);
  if (ic && txt) { icon(g, ic, 130, 520, 52, ic === 'check' ? '#3fb04a' : '#ff5a4a'); TXT(g, txt, 360, 520 + size * 0.36, size, fill, 0); }
  else if (ic) icon(g, ic, 300, 520, 78, ic === 'check' ? '#3fb04a' : '#ff5a4a');
  else TXT(g, txt, 300, 520 + size * 0.36, size, fill, 0); g.restore(); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.08 * s * 1.9, z: pos[2], s: s * 1.9, blob: false, shadow: false, order: 5, ...extra });

// ---------- acteurs ----------
const legs = (x) => q((x * 1.1) % 1, 2);
export const actorsAt = (f, T) => {
  const S = shotAt(f), g = G(f), out = [], tint = tintOf(S);
  const hookish = S.id === 'hook' || S.id === 'loop';
  const ff = hookish ? g : f;
  const fig = (who, seed, o, pos, ex = {}) => R_(T, who, life(ff, seed, o), pos, { tint, ...ex });
  const cheer = (k) => hookish ? (g >= 100 ? Math.abs(Math.sin(g * 0.3 + k)) * 0.05 : 0) : Math.abs(Math.sin(f * 0.3 + k)) * 0.05;
  // la scène « enclos » : tout le monde brandit son billet (accroche, plan large, finale)
  const penScene = (happy) => {
    out.push(fig('galton', 4, { expr: happy ? 'laugh' : (hookish && g >= 100 ? 'grin' : 'squint'), L: happy ? 'up' : 'hip', R: happy ? 'wave' : 'cheek', wv: happy ? q(f * 0.3, 1) : 0, look: -0.9 }, PEN.galton, { dy: happy ? cheer(0) : 0 }));
    const up = (who, seed, key, hp, k) => out.push(fig(who, seed, { expr: happy || (hookish && g >= 100) ? 'laugh' : 'smile', L: 'hip', R: 'up', holdR: 'paper', look: -0.4 }, PEN[key], { dy: cheer(k) }));
    up('boucher', 6, 'boucher', 0, 1); up('fermiere', 8, 'fermiere', 0, 2); up('citadin', 10, 'citadin', 0, 3);
    up('v1', 12, 'c1', 0, 4); up('v2', 14, 'c2', 0, 5); up('v3', 16, 'c3', 0, 6); up('v4', 18, 'c4', 0, 7); up('v5', 20, 'c5', 0, 8);
  };
  switch (S.id) {
    case 'hook': case 'loop': penScene(false); break;
    case 'large': penScene(false); break;
    case 'annee': penScene(true); break;
    case 'tous': penScene(true); break;
    case 'billets': {
      const cyc = (i, h, who, seed, c) => { const ph = ((f - (186 + i * 17)) % 34 + 34) % 34, writing = ph > 20 || ph < 0; const tossing = ph >= 0 && ph < 14;
        out.push(fig(who, seed, { expr: tossing ? 'grin' : 'smile', L: 'hip', R: tossing ? 'up' : 'reach', holdR: tossing ? undefined : 'paper', lift: 0.2, look: 0.6 }, h, { dy: tossing && ph < 6 ? 0.03 : 0 })); };
      cyc(0, BU, 'boucher', 6); cyc(1, FE, 'fermiere', 8);
      out.push(fig('galton', 4, { expr: 'squint', L: 'hip', R: 'hip', look: -0.4 }, GT));
      out.push(fig('v1', 12, { expr: 'smile', L: 'hip', R: 'reach', holdR: 'paper', look: -0.6 }, [TX + 3.0, 0, 0.9])); break; }
    case 'gens': {
      const boo = ramp(f, 279, 296), sn = ramp(f, 368, 376);
      out.push(fig('boucher', 6, { expr: f < 313 ? 'grin' : 'smile', L: 'hip', R: 'up', holdR: 'tool', look: 0.3 }, [-1.6, 0, 0.8], { dy: f < 313 ? Math.abs(Math.sin(f * 0.25)) * 0.03 : 0 }));
      out.push(fig('fermiere', 8, { expr: f > 322 ? 'grin' : 'smile', L: 'hip', R: 'reach', holdR: 'paper', look: 0.4 }, [0.0, 0, 0.8]));
      const jump = hop(f, 372, 0.25, 8);
      out.push(fig('citadin', 10, { expr: f < 366 ? 'nervous' : 'shock', L: 'head', R: f < 368 ? 'reach' : 'hip', wv: q(f * 0.4, 1), look: 0.8, lift: 0.1 }, [1.5, 0, -0.1], f >= 372 ? { dy: jump.dy, sx: jump.sx, sy: jump.sy } : {}));
      break; }
    case 'savant': {
      const hold = f >= 432 && f < 500;
      out.push(fig('galton', 4, { expr: f < 456 ? 'smile' : 'grin', L: hold ? 'carry' : 'hip', R: hold ? 'carry' : (f < 432 ? 'reach' : 'hip'), look: 0.3 }, GT, { dy: f >= 470 && f < 500 ? Math.abs(Math.sin(f * 0.6)) * 0.015 : 0 }));
      break; }
    case 'sur': out.push(fig('galton', 4, { expr: f < 545 ? 'stubborn' : 'laugh', L: 'cross', R: 'cross', look: 0.3 }, GT, f >= 545 ? { dy: Math.abs(Math.sin(f * 0.5)) * 0.03, roll: Math.sin(f * 0.5) * 0.03 } : {})); break;
    case 'pivot': { const arm = Math.floor(f / 6) % 2;
      out.push(fig('galton', 4, { expr: f < 640 ? 'squint' : 'stubborn', L: f < 662 ? (arm ? 'reach' : 'hip') : 'hip', R: f < 662 ? (arm ? 'hip' : 'reach') : 'reach', lift: 0.1, look: 0.4 }, GT, { dy: f < 662 && f % 6 < 2 ? -0.015 : 0 })); break; }
    case 'chiffre': { const sh = ramp(f, 684, 696);
      out.push(fig('galton', 4, { expr: f < 706 ? 'shock' : 'grin', L: 'hip', R: 'up', holdR: 'paper', look: 0.4 }, GT, { dy: f >= 684 && f < 700 ? hop(f, 684, 0.08, 6).dy : 0 })); break; }
    case 'boeuf': {
      const x = f < 806 ? oxX(f) : BX, walking = f < 806;
      out.push(fig('boucher', 6, { expr: 'grin', L: walking ? 'hip' : 'hip', R: walking ? 'hip' : 'up', step: walking ? legs(x) : 0, look: -0.6 }, walking ? [x + 3.4, 0, 1.6] : [BX + 0.8, 0, 2.3], !walking ? { dy: Math.abs(Math.sin(f * 0.3)) * 0.04 } : { dy: Math.abs(Math.sin(x * 2)) * 0.02 }));
      out.push(fig('galton', 4, { expr: walking ? 'squint' : 'shock', L: 'hip', R: 'hip', step: walking ? legs(x + 0.4) : 0, look: -0.6 }, walking ? [x + 5.0, 0, 2.5] : [BX - 1.0, 0, 2.3]));
      break; }
    case 'ecart': {
      out.push(fig('galton', 4, { expr: f < 900 ? 'shock' : 'laugh', L: 'hip', R: 'reach', holdR: 'paper', look: 0.6 }, GB, f >= 873 && f < 885 ? { dy: hop(f, 873, 0.1, 6).dy } : {}));
      out.push(fig('boucher', 6, { expr: f < 880 ? 'shock' : 'laugh', L: 'hip', R: 'up', look: -0.6 }, BB, { dy: f >= 884 ? Math.abs(Math.sin(f * 0.3)) * 0.04 : 0 })); break; }
    case 'faux': {
      out.push(fig('citadin', 10, { expr: f < 950 ? 'nervous' : 'pained', L: 'hip', R: 'up', holdR: 'paper', look: 0.5 }, [BX - 0.9, 0, 2.3], { dy: f >= 940 && f < 948 ? hop(f, 940, 0.06, 5).dy : 0 }));
      out.push(fig('fermiere', 8, { expr: f < 956 ? 'nervous' : 'pained', L: 'hip', R: 'up', holdR: 'paper', look: -0.5 }, [BX + 0.7, 0, 2.3], { dy: f >= 950 && f < 958 ? hop(f, 950, 0.06, 5).dy : 0 })); break; }
    case 'annule': {
      out.push(fig('galton', 4, { expr: f < 1010 ? 'squint' : 'laugh', L: f < 1010 ? 'up' : 'wave', R: f < 1010 ? 'reach' : 'wave', wv: q(f * 0.3, 1), look: 0.0 }, [BX, 0, 2.3], { dy: f >= 1012 ? Math.abs(Math.sin(f * 0.3)) * 0.04 : 0 }));
      const hi = f < 1010;
      out.push(fig('v1', 12, { expr: 'smile', L: 'hip', R: 'up', holdR: 'paper', look: 0.6 }, [BX - 1.5, 0, 2.3], { dy: hi ? Math.abs(Math.sin(f * 0.25)) * 0.03 : 0 }));
      out.push(fig('v2', 14, { expr: 'smile', L: 'hip', R: 'up', holdR: 'paper', look: 0.6 }, [BX - 2.6, 0, 1.0]));
      out.push(fig('v3', 16, { expr: 'nervous', L: 'hip', R: 'hip', holdR: undefined, look: -0.6 }, [BX + 1.5, 0, 2.3]));
      out.push(fig('v5', 20, { expr: 'nervous', L: 'hip', R: 'hip', look: -0.6 }, [BX + 2.6, 0, 1.0])); break; }
    case 'rien': {
      out.push(fig('boucher', 6, { expr: 'squint', L: 'hip', R: 'temple', holdL: 'paper', look: 0.6 }, [-3.4, 0, 1.4], { roll: Math.sin(f * 0.15) * 0.02 }));
      out.push(fig('citadin', 10, { expr: f < 1160 ? 'nervous' : 'squint', L: 'shield', R: 'hip', holdL: 'paper', look: -0.6 }, [-1.9, 0, 1.4], { roll: Math.sin(f * 0.15 + 1) * 0.02 })); break; }
  }
  return out;
};

// ---------- effets 2D ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), g = G(f), out = [];
  if (S.id === 'hook' || S.id === 'loop') {
    if (g >= 8 && g < 100) { const k = ramp(g, 8, 20); out.push(FX('q' + q(k, 1), labelCard('? lb', 112, '#ffd23a', INK, k, -0.05), [2.9, 3.0, 0.2], 0.52)); }
    if (g >= 100 && g < 125) { const k = ramp(g, 100, 110); out.push(FX('ok' + q(k, 1), labelCard('', 0, '#fff', '#2f9a4a', k, 0.04, 'check'), [2.9, 3.0, 0.2], 0.52)); }
  }
  if (S.id === 'billets' && f >= 222) { const k = ramp(f, 222, 234); out.push(FX('n8' + q(k, 1), labelCard('≈ 800', 108, '#ffd23a', INK, k, -0.04), [TX - 0.4, 2.9, 0.4], 0.48)); }
  if (S.id === 'sur' && f >= 534) { const k = ramp(f, 534, 546); out.push(FX('x' + q(k, 1), labelCard('', 0, '#fff', '#c8312c', k, 0.05, 'cross'), [TX + 0.9, 2.45, -1.2], 0.36)); }
  if (S.id === 'chiffre' && f >= 690) { const k = ramp(f, 690, 702); out.push(FX('n12' + q(k, 1), labelCard('1207 lb', 98, '#ffd23a', INK, k, 0.04), [TX + 0.55, 2.6, -1.2], 0.32)); }
  if (S.id === 'boeuf' && f >= 851) { const k = ramp(f, 851, 863); out.push(FX('n11' + q(k, 1), labelCard('1198 lb', 98, '#ffffff', '#2f56a8', k, -0.04), [BX + 0.2, 1.7, 3.4], 0.5)); }
  if (S.id === 'ecart' && f >= 880) { const k = ramp(f, 880, 892); out.push(FX('pc' + q(k, 1), labelCard('< 1 %', 120, '#ffd23a', '#2f9a4a', k, 0.04), [BX - 0.1, 3.5, 1.5], 0.6)); }
  if (S.id === 'faux') {
    if (f >= 938) { const k = ramp(f, 938, 950); out.push(FX('w1' + q(k, 1), labelCard('900', 100, '#ffffff', '#c8312c', k, -0.06, 'cross'), [BX - 1.0, 3.1, 1.6], 0.42)); }
    if (f >= 948) { const k = ramp(f, 948, 960); out.push(FX('w2' + q(k, 1), labelCard('1500', 90, '#ffffff', '#c8312c', k, 0.06, 'cross'), [BX + 0.8, 3.1, 1.6], 0.42)); } }
  if (S.id === 'annule') {
    const k0 = ramp(f, 969, 981), m = E.smooth(ramp(f, 984, 1010));
    if (f < 1010) { out.push(FX('pl' + q(k0, 1) + q(m, 2), labelCard('+', 150, '#ffffff', '#d23a32', k0, -0.05), [lerp(BX - 2.3, BX - 0.45, m), 3.3, 1.6], 0.42));
      out.push(FX('mi' + q(k0, 1) + q(m, 2), labelCard('−', 150, '#ffffff', '#2f56a8', k0, 0.05), [lerp(BX + 2.3, BX + 0.45, m), 3.3, 1.6], 0.42)); }
    else { const k = ramp(f, 1010, 1022); out.push(FX('eq' + q(k, 1), labelCard('', 0, '#fff', '#2f9a4a', k, 0, 'check'), [BX, 3.3, 1.6], 0.55)); } }
  if (S.id === 'annee' && f >= 1052) { const k = ramp(f, 1052, 1066); out.push(FX('y' + q(k, 1), labelCard('1906', 128, '#ffd23a', INK, k), [2.2, 6.0, -1.0], 1.9)); }
  return out;
};
