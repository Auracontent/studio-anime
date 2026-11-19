// "Les taxis de la Marne" — 68.88 s, 30 fps, 2066 frames. Phrase frames from ../phrases.json (silence-aligned).
import { M as E, camFromKeys, frameOn, frameTwo, clamp, lerp, ramp, idle, blinkAt, q } from '../motion.js';
export const FPS = 30, TOTAL = 2066, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 150, light: 'jour' },        // En 1914, pour sauver la France, l'armée a réquisitionné des taxis.
  { id: 'meter', a: 151, b: 240, light: 'jour' },     // Et ils ont gardé le compteur allumé.
  { id: 'carte', a: 241, b: 362, light: 'jour' },     // Début septembre, les Allemands sont à quelques dizaines de km de Paris.
  { id: 'gen', a: 363, b: 490, light: 'jour' },       // Le général a besoin de soldats sur la Marne, tout de suite.
  { id: 'trains', a: 491, b: 575, light: 'jour' },    // Mais les trains sont trop lents et trop peu nombreux.
  { id: 'idee', a: 576, b: 620, light: 'jour' },      // Alors il a une idée :
  { id: 'taxis', a: 621, b: 680, light: 'jour' },     // prendre les taxis de Paris.
  { id: 'arret', a: 681, b: 790, light: 'nuit' },     // La nuit du six au sept septembre, les policiers arrêtent les voitures, font descendre les clients,
  { id: 'inval', a: 791, b: 890, light: 'nuit' },     // et envoient les chauffeurs aux Invalides.
  { id: 'convoi', a: 891, b: 995, light: 'nuit' },    // Environ six cents taxis, des Renault rouges, partent dans la nuit,
  { id: 'phares', a: 996, b: 1027, light: 'nuit' },   // les phares éteints.
  { id: 'cinq', a: 1028, b: 1085, light: 'nuit' },    // Cinq soldats entassés dans chacun.
  { id: 'dir', a: 1086, b: 1160, light: 'nuit' },     // Direction le front, à cinquante kilomètres.
  { id: 'drole', a: 1161, b: 1198, light: 'aube' },   // Et le plus drôle ?
  { id: 'compt', a: 1199, b: 1257, light: 'aube' },   // Les chauffeurs étaient payés au compteur.
  { id: 'paye', a: 1258, b: 1348, light: 'aube' },    // L'armée a payé la course, comme un client ordinaire.
  { id: 'sauf', a: 1349, b: 1410, light: 'jour' },    // Sauf que… les historiens sont formels :
  { id: 'six', a: 1411, b: 1505, light: 'jour' },     // six mille hommes, c'est très peu, face à des armées d'un million de soldats.
  { id: 'pas', a: 1506, b: 1590, light: 'jour' },     // Les taxis n'ont pas gagné la bataille.
  { id: 'pouvoir', a: 1591, b: 1665, light: 'jour' }, // En fait, leur vrai pouvoir était ailleurs.
  { id: 'france', a: 1666, b: 1770, light: 'jour' },  // Toute la France a vu des soldats partir à la guerre dans des voitures de ville.
  { id: 'patrie', a: 1771, b: 1930, light: 'dore' },  // Et ce jour-là, le pays a compris que tout le monde, même un chauffeur de taxi, pouvait sauver la patrie.
  { id: 'marne', a: 1931, b: 1998, light: 'dore' },   // Les Allemands n'ont jamais passé la Marne.
  { id: 'course', a: 1999, b: 2065, light: 'jour' },  // Et la course, elle, a été facturée.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lights ----------
export const LIGHTS = {
  jour: { az: 125, el: 58, sky: '#c9d8f2', ground: '#b08a5c', hemi: 1.15, sun: '#fff1d6', sunI: 2.7, fog: '#f1dcb8', fogNear: 160, fogFar: 1200,
    skyTop: '#3f86d8', skyHor: '#f6dcb0', sat: 1.15, gain: '#fff6ea', vig: 0.2, shadowExt: 22 },
  nuit: { az: -30, el: 38, sky: '#a4b2f0', ground: '#6a78ac', hemi: 1.9, sun: '#d4dcff', sunI: 2.5, fog: '#26356a', fogNear: 90, fogFar: 700,
    skyTop: '#101c4a', skyHor: '#3a4a8a', sunDisc: '#eef2ff', sunSize: 0.002, sat: 1.1, gain: '#f4f6ff', vig: 0.28, shadowExt: 18 },
  aube: { az: 70, el: 14, sky: '#d4b8d8', ground: '#8a5a48', hemi: 1.12, sun: '#ffc088', sunI: 2.6, fog: '#f2c4a0', fogNear: 120, fogFar: 1000,
    skyTop: '#5a74b8', skyHor: '#ffc48c', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.16, gain: '#fff2e2', vig: 0.24, shadowExt: 24 },
  dore: { az: 20, el: 24, sky: '#c4b4d8', ground: '#8a5a3c', hemi: 1.08, sun: '#ffb46c', sunI: 2.9, fog: '#f0c090', fogNear: 120, fogFar: 1000,
    skyTop: '#5a78c0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.14, gain: '#fff2e2', vig: 0.24, shadowExt: 26 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
const TINT = { jour: '#ffffff', nuit: '#d4dcff', aube: '#ffe6d0', dore: '#ffe2c8' };

// ---------- places ----------
const CH = [1.2, 0, 214];          // hook: the driver, Paris street
const CABH = [-1.6, 0, 211];
const MET = [0.35, 0, 215.6];
const MAP = [0.2, 0, 212];
const GEN = [1.3, 0, 205];
const POI = [-18.6, 0, 214];       // waiting poilu at the spur
const POL = [0.55, 0, 200.5], CLI = [-0.85, 0, 200.2], CABA = [-0.4, 0, 195.5];   // night arrest
const DRV = [-9, 0, 150];          // Invalides driver
const RD = { x: 0, z: -130 };      // dawn roadside
const HIS = [1.0, 0, -250];
const FL = [4.5, 0, -330];
const cabZ = (f) => -40 - (f - 1028) * 0.0;  // cab with soldiers stays put (rocks)

// ---------- cameras ----------
const K = (f, at, o = {}, e = {}) => ({ f, ...frameOn(at, o), ...e });
const around = (c, d, yaw, dy = 0, fov = 40, e = {}) => { const a = yaw * Math.PI / 180; return { pos: [c[0] + d * Math.sin(a), c[1] + dy, c[2] + d * Math.cos(a)], look: c, fov, ...e }; };
const CAMS = {
  hook: [K(0, CH, { headW: 0.30, yaw: 55 }), K(70, CH, { headW: 0.31, yaw: 35 }, { ease: 'smooth' }), K(150, CH, { headW: 0.36, yaw: 18 })],
  meter: [{ f: 151, ...around([0.35, 1.0, 215.6], 1.9, 30, 0.1, 40) }, { f: 240, ...around([0.35, 1.0, 215.6], 1.5, -10, 0.0, 38) }],
  carte: [{ f: 241, ...around([0.2, 1.1, 212], 3.6, 25, 0.2, 40) }, { f: 362, ...around([0.2, 1.1, 212], 2.7, -5, 0.1, 40) }],
  gen: [K(363, GEN, { headW: 0.31, yaw: 28 }), K(430, GEN, { headW: 0.32, yaw: 5 }), K(490, GEN, { headW: 0.36, yaw: -10 })],
  trains: [K(491, POI, { headW: 0.30, yaw: 75 }), K(575, POI, { headW: 0.33, yaw: 55 })],
  idee: [K(576, GEN, { headW: 0.32, yaw: -22, frameY: 0.46 }), K(620, GEN, { headW: 0.38, yaw: -8, frameY: 0.44 })],
  taxis: [{ f: 621, pos: [-0.6, 0.8, 204], look: [0.4, 1.3, 250], fov: 50 }, { f: 680, pos: [0.2, 0.9, 207], look: [-0.4, 1.4, 255], fov: 48, roll: 2 }],
  arret: [{ f: 681, ...frameTwo(POL, CLI, { yaw: 22, headW: 0.23 }) }, { f: 790, ...frameTwo(POL, CLI, { yaw: -8, headW: 0.27 }) }],
  inval: [K(791, DRV, { headW: 0.30, yaw: 95 }), K(890, DRV, { headW: 0.35, yaw: 70 })],
  convoi: [{ f: 891, pos: [3.4, 0.7, 134], look: [-2.2, 1.0, 118], fov: 50 }, { f: 995, pos: [3.0, 0.8, 108], look: [-2.0, 1.1, 90], fov: 46, roll: 2 }],
  phares: [{ f: 996, pos: [0.9, 0.75, 49.5], look: [-0.1, 0.9, 54], fov: 44 }, { f: 1027, pos: [0.7, 0.7, 43.4], look: [-0.1, 0.9, 48.2], fov: 40 }],
  cinq: [{ f: 1028, pos: [2.9, 1.7, -42.3], look: [0, 1.75, -39.5], fov: 36 }, { f: 1085, pos: [2.3, 1.65, -41.6], look: [0, 1.75, -39.6], fov: 31 }],
  dir: [{ f: 1086, pos: [-4.3, 1.1, -125], look: [-1.5, 2.4, -150], fov: 48 }, { f: 1160, pos: [-4.3, 1.4, -125], look: [-1.0, 2.3, -165], fov: 44 }],
  drole: [K(1161, [RD.x - 1.0, 0, RD.z], { headW: 0.31, yaw: 15 }), K(1198, [RD.x - 1.0, 0, RD.z], { headW: 0.38, yaw: 8 })],
  compt: [{ f: 1199, ...around([0.0, 1.15, -130], 3.8, 10, 0.1, 40) }, { f: 1257, ...around([0.0, 1.15, -130], 3.2, -4, 0, 38) }],
  paye: [{ f: 1258, ...frameTwo([-0.6, 0, -125], [0.6, 0, -125], { yaw: 18 }) }, { f: 1348, ...frameTwo([-0.6, 0, -125], [0.6, 0, -125], { yaw: -6, headW: 0.25 }) }],
  sauf: [K(1349, HIS, { headW: 0.30, yaw: 40, frameY: 0.4, lift: -0.04 }), K(1410, HIS, { headW: 0.34, yaw: 12 })],
  six: [{ f: 1411, pos: [6, 3.6, -188], look: [-7, 1.6, -250], fov: 52 }, { f: 1505, pos: [3, 8.5, -192], look: [-10, 0.5, -262], fov: 50, ease: 'smooth' }],
  pas: [K(1506, [-1, 0, -190], { headW: 0.30, yaw: 30 }), K(1590, [-1, 0, -190], { headW: 0.36, yaw: 6 })],
  pouvoir: [K(1591, HIS, { headW: 0.31, yaw: -40 }), K(1665, HIS, { headW: 0.35, yaw: -12 })],
  france: [{ f: 1666, ...frameTwo([4.7, 0, -299.5], [4.7, 0, -300.7], { yaw: -75, headW: 0.24 }) }, { f: 1770, ...frameTwo([4.7, 0, -299.5], [4.7, 0, -300.7], { yaw: -55, headW: 0.26 }) }],
  patrie: [K(1771, [2.4, 0, FL[2] + 4], { headW: 0.32, yaw: -80 }), K(1850, [2.4, 0, FL[2] + 4], { headW: 0.30, yaw: -70 }),
    { f: 1930, ...around([3.4, 3.0, FL[2] + 2.4], 8.0, -72, -1.0, 44), roll: 2, ease: 'smooth' }],
  marne: [K(1931, [1.8, 0, -520], { headW: 0.30, yaw: 20 }), K(1998, [1.8, 0, -520], { headW: 0.36, yaw: 8 })],
  course: [K(1999, [0.8, 0, -80], { headW: 0.31, yaw: 15 }), K(2065, [0.8, 0, -80], { headW: 0.36, yaw: 0 })],
};
const KICKS = [{ f: 1349, a: 0.05 }, { f: 1521, a: 0.03 }, { f: 2033, a: 0.05 }, { f: 745, a: 0.03 }, { f: 1888, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  for (const a of [681, 891, 1161, 1349, 1931, 1999, 241]) if (f >= a && f < a + 6 && a !== 241 && a !== 891 && a !== 1999) c.flash = (1 - (f - a) / 6) * 0.8;
  if (S.id === 'convoi' || S.id === 'dir') c.pos = [c.pos[0], c.pos[1] + Math.sin(f * 1.9) * 0.01, c.pos[2]];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOC = { hook: CH, gen: GEN, trains: POI, idee: GEN, inval: DRV, drole: [RD.x - 1, 0, RD.z], sauf: HIS, pas: [-1, 0, -190], pouvoir: HIS, marne: [1.8, 0, -520], course: [0.8, 0, -80] };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (FOC[S.id]) { const t = FOC[S.id]; return { focus: dist(C.pos, [t[0], 1.6, t[2]]), cinf: 9 }; }
  switch (S.id) {
    case 'meter': return { focus: dist(C.pos, [0.35, 1.0, 215.6]), cinf: 10 };
    case 'carte': return { focus: dist(C.pos, [0.2, 1.1, 212]), cinf: 7 };
    case 'arret': return { focus: dist(C.pos, [0, 1.5, 200.4]), cinf: 7 };
    case 'phares': return { focus: dist(C.pos, [-0.1, 0.9, 52 - (f - 996) * 0.25]), cinf: 10 };
    case 'cinq': return { focus: dist(C.pos, [0, 1.6, -39.4]), cinf: 9 };
    case 'compt': return { focus: dist(C.pos, [-0.2, 1.4, -130]), cinf: 8 };
    case 'paye': return { focus: dist(C.pos, [0, 1.6, -125]), cinf: 7 };
    case 'france': return { focus: dist(C.pos, [5.3, 1.6, -300]), cinf: 8 };
    case 'patrie': return { focus: f < 1860 ? dist(C.pos, [2.4, 1.6, FL[2] + 4]) : dist(C.pos, [3.2, 2.6, FL[2] + 3]), cinf: f < 1860 ? 9 : 4 };
  }
  return { focus: 40, cinf: 3 };
};

// ---------- convoy / street cabs ----------
const convoy = (f, n, z0, v, gap, xs = [1.8, -1.8]) => Array.from({ length: n }, (_, i) => ({ x: xs[i % xs.length], z: z0 - (f - 0) * 0 - i * gap - v * 0 }));
export const worldAt = (f) => {
  const S = shotAt(f), W = { night: S.light === 'nuit' ? 1 : 0, taxis: [], lamps: 0, flagT: f / 30 };
  if (S.light === 'aube') W.night = 0;
  switch (S.id) {
    case 'hook': case 'meter': W.taxis = [{ x: CABH[0], z: CABH[2] }, { x: 2.8, z: 214 + 90 - f * 0.2, ry: 0 }]; W.taxis[1].z = 330 - f * 0.9; break;
    case 'carte': W.taxis = [{ x: -3.2, z: 232 }]; break;
    case 'gen': case 'idee': W.taxis = [{ x: -3.8, z: 224 }]; break;
    case 'trains': W.trainZ = 222 - (f - 491) * 0.14; break;
    case 'taxis': { const v = 0.9; W.taxis = [0, 1, 2, 3, 4].map((i) => ({ x: i % 2 ? 1.9 : -1.9, z: 250 + i * 11 - (f - 621) * v })); break; }
    case 'arret': W.lamps = 1; W.taxis = [{ x: CABA[0], z: CABA[2] }, { x: 3.0, z: 188 }]; break;
    case 'inval': W.lamps = 0.4; W.taxis = [{ x: -15, z: 142, ry: 1.2 }, { x: -15.5, z: 150, ry: 1.15 }, { x: -14.5, z: 158, ry: 1.25 }, { x: -3.5, z: 160 + 0, ry: 0 }]; break;
    case 'convoi': { const v = 0.42; W.lamps = f < 993 ? 0.8 : 0; W.taxis = Array.from({ length: 11 }, (_, i) => ({ x: i % 2 ? 1.7 : -1.7, z: 160 - i * 8.5 - (f - 891) * v })); break; }
    case 'phares': W.taxis = [{ x: 0, z: 56 - (f - 996) * 0.25 }]; break;
    case 'cinq': W.taxis = [{ x: 0, z: -40 + Math.sin(f * 0.4) * 0.01, roll: Math.sin(f * 0.5) * 0.012 }]; break;
    case 'dir': W.taxis = Array.from({ length: 7 }, (_, i) => ({ x: i % 2 ? 1.5 : -1.2, z: -110 + i * 7.5 - (f - 1086) * 0.72 })); break;
    case 'drole': W.taxis = [{ x: 2.6, z: RD.z - 6, ry: 0.15 }]; break;
    case 'compt': case 'paye': W.taxis = [{ x: 2.8, z: -122, ry: 0.15 }]; break;
    case 'sauf': W.taxis = []; break;
    case 'six': W.taxis = [0, 1, 2, 3, 4, 5].map((i) => ({ x: i % 2 ? 1.6 : -1.2, z: -196 - i * 7.5 })); break;
    case 'pas': W.taxis = [{ x: 3.0, z: -184, ry: 0.2 }]; break;
    case 'france': W.taxis = [{ x: 1.6, z: -262 - (f - 1666) * 0.75 + 70 }]; break;
    case 'patrie': break;
    case 'course': W.taxis = [{ x: -3, z: -86, ry: 0.2 }]; break;
  }
  return W;
};

// ---------- cast ----------
export const setupCast = (T) => {
  T.OUTFITS.chauffA = { tunic: '#5b4636', skin: '#e9b98f', hat: 'chauff', moustache: '#3b2a20', hatCol: '#26303f' };
  T.OUTFITS.chauffB = { tunic: '#4a5a3a', skin: '#c98b62', hat: 'chauff', moustache: '#2b211c', stout: true, hatCol: '#3b2f26' };
  T.OUTFITS.general = { tunic: '#233f78', skin: '#f1c9a4', hat: 'kepi', hatCol: '#2b4a8c', hatBand: '#e8c45a', moustache: '#ececec', brows: '#ececec', coat: true };
  T.OUTFITS.officier = { tunic: '#2b4a8c', skin: '#f0c49e', hat: 'kepi', hatCol: '#2b4a8c', hatBand: '#c8312c', moustache: '#6b3a1f', coat: true };
  T.OUTFITS.agent = { tunic: '#1c2438', skin: '#efc39a', hat: 'kepi', hatCol: '#1c2438', hatBand: '#d8d8d8', moustache: '#2b211c', stout: true, cape: '#141a2a' };
  T.OUTFITS.client = { tunic: '#2c2a36', skin: '#f5c9a0', hat: 'tophat', moustache: '#9a9a9a', stout: true, brows: '#9a9a9a' };
  T.OUTFITS.histo = { tunic: '#5a4a3a', skin: '#f3d6bb', hair: '#e8e4da', beard: '#f4f1ea', brows: '#f4f1ea' };
  T.OUTFITS.poilu1 = { tunic: '#6f86a8', skin: '#d9a27a', hat: 'adrian', moustache: '#4a3020', coat: true };
  T.OUTFITS.poilu2 = { tunic: '#6f86a8', skin: '#a8714a', hat: 'adrian', coat: true };
  T.OUTFITS.poilu3 = { tunic: '#6f86a8', skin: '#f5d3b3', hat: 'adrian', moustache: '#c9a050', coat: true, stout: true };
  T.OUTFITS.poilu4 = { tunic: '#6f86a8', skin: '#7a4a30', hat: 'adrian', coat: true };
  T.OUTFITS.poilu5 = { tunic: '#6f86a8', skin: '#e6bb94', hat: 'adrian', beard: '#3b2a20', coat: true };
  T.OUTFITS.paysanne = { tunic: '#d9a441', skin: '#f5c9a0', hair: '#5a3b2a', dress: '#c25a7a' };
  T.OUTFITS.paysan = { tunic: '#8a5d3b', skin: '#e8b890', cap: '#5a4a3a', moustache: '#3b2a20', stout: true };
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), tilt: q(I.tilt, 0), headTilt: q(I.headTilt, 0), ...o }; };
const PROP = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, ...extra });

// ---------- prop cards ----------
function meterCard(p, v) {
  const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925';
  g.fillStyle = '#7a5a34'; g.lineWidth = 14; g.beginPath(); g.roundRect(270, 640, 60, 330, 14); g.fill(); g.stroke();
  g.fillStyle = '#e8c860'; g.beginPath(); g.roundRect(120, 270, 360, 400, 70); g.fill(); g.stroke();
  g.fillStyle = '#f7f3ea'; g.beginPath(); g.roundRect(160, 330, 280, 130, 26); g.fill(); g.stroke();
  g.font = '800 98px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#271925'; g.fillText(v, 300, 436);
  g.fillStyle = '#c8312c'; g.beginPath(); g.arc(300, 565, 54, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = '#271925'; g.font = '800 40px Montserrat, Arial, sans-serif'; g.fillText('TAXI', 300, 580);
  g.fillStyle = '#c8312c'; g.beginPath(); g.moveTo(420, 270); g.lineTo(420, 150); g.lineTo(540, 190); g.lineTo(420, 230); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function mapCard(p, t) {
  const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925'; g.lineCap = 'round';
  g.fillStyle = '#ecd9a6'; g.lineWidth = 16; g.beginPath(); g.roundRect(30, 230, 540, 640, 26); g.fill(); g.stroke();
  g.fillStyle = '#cfe0a8'; g.beginPath(); g.moveTo(60, 400); g.bezierCurveTo(200, 330, 380, 450, 540, 360); g.lineTo(540, 840); g.lineTo(60, 840); g.closePath(); g.fill();
  g.strokeStyle = '#4f93b8'; g.lineWidth = 22; g.beginPath(); g.moveTo(70, 700); g.bezierCurveTo(200, 560, 300, 720, 540, 560); g.stroke(); // la Marne
  g.strokeStyle = '#271925'; g.fillStyle = '#c8312c'; g.lineWidth = 8; g.beginPath(); g.arc(200, 470, 30, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = '#271925'; g.font = '800 48px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('PARIS', 200, 420);
  g.font = '800 34px Montserrat, Arial, sans-serif'; g.fillText('LA MARNE', 380, 770);
  const k = E.easeOut(t), ax = lerp(600, 300, k), ay = lerp(300, 440, k); // German arrow creeping toward Paris
  g.strokeStyle = '#2b2b30'; g.fillStyle = '#2b2b30'; g.lineWidth = 26; g.beginPath(); g.moveTo(560, 300); g.quadraticCurveTo(480, 330, ax, ay); g.stroke();
  g.beginPath(); g.moveTo(ax - 38, ay + 4); g.lineTo(ax + 6, ay - 34); g.lineTo(ax + 6, ay + 38); g.closePath(); g.fill();
  g.restore();
}
function noteCard(p) {
  const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925'; g.lineWidth = 12; g.fillStyle = '#d8e6c0'; g.beginPath(); g.roundRect(120, 380, 360, 220, 14); g.fill(); g.stroke();
  g.fillStyle = '#3f6a4a'; g.beginPath(); g.arc(300, 490, 62, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#f4f1ea'; g.font = '800 70px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('F', 300, 516); g.restore();
}
function ticketCard(p, stamp) {
  const g = p.g; g.save(); g.lineJoin = 'round'; g.strokeStyle = '#271925'; g.lineWidth = 14; g.fillStyle = '#f7f3e6'; g.beginPath(); g.roundRect(110, 150, 380, 640, 14); g.fill(); g.stroke();
  g.fillStyle = '#271925'; g.textAlign = 'center'; g.font = '800 64px Montserrat, Arial, sans-serif'; g.fillText('COURSE', 300, 250);
  g.font = '700 38px Montserrat, Arial, sans-serif'; for (let i = 0; i < 5; i++) { g.fillRect(170, 310 + i * 66, 260 - (i % 2) * 70, 10); }
  g.font = '800 48px Montserrat, Arial, sans-serif'; g.fillText('TOTAL', 300, 690);
  if (stamp > 0) { g.save(); g.translate(300, 540); g.rotate(-0.28); g.scale(stamp, stamp); g.strokeStyle = '#c8312c'; g.fillStyle = '#c8312c'; g.lineWidth = 12; g.strokeRect(-190, -62, 380, 124); g.font = '900 78px Montserrat, Arial, sans-serif'; g.lineWidth = 3; g.fillText('FACTURÉ', 0, 26); g.restore(); }
  g.restore();
}

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT[S.light];
  const FLIP = (a) => a;
  switch (S.id) {
    case 'hook':
      out.push(R(T, 'chauffA', life(f, 11, { expr: f > 100 ? 'smile' : 'neutral', L: 'hip', R: 'thumb', look: -0.3 }), CH, { tint })); break;
    case 'meter': {
      const v = (0.5 + (f - 151) * 0.07).toFixed(2);
      out.push(R(T, 'chauffA', life(f, 11, { expr: f > 170 ? 'grin' : 'smile', L: 'hip', R: 'point', look: 0.5 }), [1.4, 0, 214.2], { tint }));
      out.push(PROP('meter' + v, (p) => meterCard(p, v), MET, 0.62, { tint, order: 3 })); break;
    }
    case 'carte': {
      out.push(PROP('map' + q(E.smooth(ramp(f, 250, 355)), 2), (p) => mapCard(p, E.smooth(ramp(f, 250, 355))), MAP, 1.0, { tint }));
      out.push(R(T, 'general', life(f, 21, { expr: 'stern', L: 'hip', R: 'point', look: -0.4 }), [1.7, 0, 212.6], { tint })); break;
    }
    case 'gen': out.push(R(T, 'general', life(f, 21, { expr: f > 466 ? 'pained' : 'stern', L: 'hip', R: f > 466 ? 'up' : 'point', look: 0.2 }), GEN, { tint })); break;
    case 'trains': {
      const tap = Math.sin(f * 0.5) * 0.5 > 0 ? 0.3 : 0;
      out.push(R(T, 'poilu1', life(f, 31, { expr: 'nervous', L: 'cross', R: 'cross', look: -0.4, step: 0 }), POI, { tint })); break;
    }
    case 'idee': {
      out.push(R(T, 'general', life(f, 21, { expr: f > 584 ? 'grin' : 'stern', L: 'hip', R: f > 584 ? 'up' : 'temple', look: 0.1, swirl: 0 }), GEN, { tint }));
      if (f > 584) { const t = q(clamp((f - 584) / 24), 2); out.push(PROP('burst' + t, (p) => T.fxBurst(p, t, '#fff08a', 12, 50, 250), [GEN[0] - 0.1, 2.6, GEN[2]], 0.9, { blob: false, shadow: false, order: 5 })); }
      break;
    }
    case 'arret': {
      const out_ = E.smooth(ramp(f, 742, 772)), hopY = f >= 742 && f < 760 ? 0.2 * Math.sin((f - 742) / 18 * Math.PI) : 0;
      out.push(R(T, 'agent', life(f, 41, { expr: 'stern', L: 'hip', R: 'up', look: -0.3 }), POL, { tint }));
      out.push(R(T, 'client', life(f, 42, { expr: f > 742 ? 'shock' : 'neutral', L: f > 742 ? 'cheek' : 'hang', R: f > 742 ? 'cheek' : 'hang', look: 0.3 }), [lerp(-0.1, -0.85, out_), hopY, CLI[2]], { tint }));
      break;
    }
    case 'inval': out.push(R(T, 'chauffB', life(f, 51, { expr: f > 850 ? 'nervous' : 'stern', L: 'hip', R: 'cheek', look: -0.3 }), DRV, { tint })); break;
    case 'cinq': {
      const cz = -40, ws = f > 1060 ? 'wave' : 'hang';
      const sx = [[-0.38, -0.25, 'poilu1'], [0.38, -0.25, 'poilu2'], [-0.34, 0.55, 'poilu3'], [0.34, 0.55, 'poilu4'], [0, 1.25, 'poilu5']];
      sx.forEach(([x, dz, who], i) => out.push(R(T, who, life(f, 60 + i, { expr: ['grin', 'smile', 'nervous', 'laugh', 'grin'][i], L: 'hang', R: i === 4 && f > 1050 ? 'wave' : 'hang', wv: f * 0.4, look: i % 2 ? -0.3 : 0.3 }), [x, 0.87, cz + dz + 0.1], { tint, s: 0.55, blob: false })));
      break;
    }
    case 'drole': out.push(R(T, 'chauffA', life(f, 11, { expr: f > 1163 ? 'grin' : 'smile', L: 'hip', R: 'thumb', look: 0.3 }), [RD.x - 1.0, 0, RD.z], { tint })); break;
    case 'compt': {
      const v = (12 + (f - 1199) * 0.19).toFixed(2);
      out.push(R(T, 'chauffA', life(f, 11, { expr: 'grin', L: 'point', R: 'hip', look: 0.4 }), [-0.45, 0, -130.6], { tint }));
      out.push(PROP('meter' + v, (p) => meterCard(p, v), [0.42, 0, -129.0], 0.5, { tint, order: 3 })); break;
    }
    case 'paye': {
      const k = E.smooth(ramp(f, 1276, 1318));
      out.push(R(T, 'officier', life(f, 71, { expr: 'stern', L: 'hip', R: 'reach', look: 0.4 }), [-0.6, 0, -125], { tint }));
      out.push(R(T, 'chauffA', life(f, 11, { expr: f > 1300 ? 'grin' : 'neutral', L: 'hip', R: f > 1316 ? 'up' : 'reach', look: -0.4 }), [0.6, 0, -125.4], { tint }));
      if (f < 1328) out.push(PROP('note', (p) => noteCard(p), [lerp(-0.2, 0.3, k), 0.28 + 0.12 * Math.sin(k * Math.PI), -125.8], 0.5, { blob: false, shadow: false, order: 5 }));
      break;
    }
    case 'sauf': out.push(R(T, 'histo', life(f, 81, { expr: 'stern', L: 'hip', R: f > 1362 ? 'up' : 'point', look: 0.3 }), HIS, { tint })); break;
    case 'six': {
      for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) { const who = ['poilu1', 'poilu2', 'poilu3', 'poilu4', 'poilu5'][(r * 2 + c) % 5];
        out.push(R(T, who, { expr: 'neutral', blink: 0, seed: 90 + ((r + c) % 4), L: 'hang', R: 'hang', bob: q(0.004 * Math.sin((f + r * 7 + c * 3) * 0.11), 3) }, [-5 - c * 2.7 + (r % 2) * 1.2, 0, -228 - r * 4], { tint: '#d8dce8', s: 1, blob: false })); }
      break;
    }
    case 'pas': out.push(R(T, 'chauffA', life(f, 11, { expr: f > 1521 ? 'dazed' : 'nervous', L: 'hip', R: f > 1540 ? 'cheek' : 'hang', look: -0.3 }), [-1, 0, -190], { tint })); break;
    case 'pouvoir': out.push(R(T, 'histo', life(f, 81, { expr: f > 1597 ? 'smile' : 'stern', L: 'hip', R: 'point', look: -0.3 }), HIS, { tint })); break;
    case 'france': {
      out.push(R(T, 'paysanne', life(f, 91, { expr: 'laugh', L: 'wave', R: 'wave', wv: f * 0.5, look: -0.5 }), [4.7, 0, -299.5], { tint }));
      out.push(R(T, 'paysan', life(f, 92, { expr: 'grin', L: 'hang', R: 'wave', wv: f * 0.45 + 1, look: -0.5 }), [4.9, 0, -300.7], { tint }));
      const cx = 1.6, cz = -262 - (f - 1666) * 0.75 + 70;
      out.push(R(T, 'poilu2', life(f, 62, { expr: 'laugh', L: 'wave', R: 'hang', wv: f * 0.4 }), [cx - 0.2, 1.12, cz + 0.1], { tint, s: 0.44, blob: false }));
      out.push(R(T, 'poilu3', life(f, 63, { expr: 'grin', L: 'hang', R: 'wave', wv: f * 0.4 + 2 }), [cx + 0.25, 1.12, cz + 0.7], { tint, s: 0.44, blob: false }));
      break;
    }
    case 'patrie': out.push(R(T, 'chauffA', life(f, 11, { expr: 'smile', L: 'hip', R: f > 1888 ? 'up' : 'hip', look: 0.4 }), [2.4, 0, FL[2] + 4], { tint })); break;
    case 'marne': out.push(R(T, 'poilu1', life(f, 31, { expr: 'smile', L: 'up', R: 'wave', wv: f * 0.4, look: 0.2 }), [1.8, 0, -520], { tint })); break;
    case 'course': {
      const st = f >= 2033 ? E.back(ramp(f, 2033, 2043)) : 0;
      out.push(R(T, 'chauffA', life(f, 11, { expr: f > 2030 ? 'grin' : 'smile', L: 'hip', R: 'thumb', look: 0.3 }), [0.8, 0, -80], { tint }));
      out.push(PROP('ticket' + q(st, 2), (p) => ticketCard(p, st), [1.3, 0.6, -79.6], 0.5, { tint, blob: false, order: 4 })); break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'trains') for (let i = 0; i < 3; i++) { const t = q(((f + i * 14) % 42) / 42, 2), z = 222 - (f - 491) * 0.14; out.push(FX('steam' + t, (p) => T.fxPuff(p, t), [-22, 3.8 + t * 3, z - 3.4], 1.4 + t * 1.4)); }
  if (S.id === 'meter' && f % 18 < 2) out.push(FX('ring' + (f % 18), (p) => T.fxRing(p, (f % 18) / 2), [0.35, 1.7, 215.6], 0.4));
  if (S.id === 'sauf' && f < 1376) { const t = q((f - 1349) / 26, 2); out.push(FX('sauf' + t, (p) => T.fxBurst(p, t, '#ffe6a0', 9, 40, 220), [HIS[0] + 0.6, 2.0, HIS[2]], 0.9)); }
  if (S.id === 'pas' && f > 1521) { const t = q(((f - 1521) % 40) / 40, 2); out.push(FX('stp' + t, (p) => T.fxPuff(p, t), [3.0, 1.8 + t * 1.2, -184 - 1.8], 1.0 + t)); }
  if (S.id === 'course' && f >= 2033 && f < 2053) { const t = q((f - 2033) / 20, 2); out.push(FX('hit' + t, (p) => T.fxBurst(p, t, '#ffd0a0', 10, 40, 240), [1.3, 1.2, -79], 0.8)); }
  if (S.id === 'patrie' && f > 1900) { const t = q(((f - 1900) % 36) / 36, 2); out.push(FX('st' + t, (p) => T.fxStars(p, t), [2.0, 2.0, FL[2] + 4], 0.5)); }
  return out;
};
