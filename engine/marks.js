// Cartoon marks drawn next to the characters, chosen automatically from what they do (sound-off storytelling):
//   shock -> "!" burst      squint -> "?"         nervous / pained -> flying sweat drops     stern / stubborn -> anger vein
//   dazed or fallen (roll > 1.2) -> stars turning above the head      moving fast (> 1.6 m/s) -> speed lines behind
// An actor can force one with  mark: 'bang' | 'question' | 'sweat' | 'anger' | 'stars' | 'speed' | 'heart' | 'note',
// or switch them off with  marks: false.  Each mark is a card drawn in the house style (plum ink #271925).
// main.js calls marksFor(...) every frame; it only looks at the actors' keys and positions, so it stays deterministic.
const INK = '#271925';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const back = (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

const EXPR_MARK = { shock: 'bang', squint: 'question', nervous: 'sweat', pained: 'sweat', stern: 'anger', stubborn: 'anger', dazed: 'stars' };
const LIFE = { bang: 40, question: 50, sweat: 1e9, anger: 1e9, stars: 1e9, speed: 1e9, heart: 60, note: 1e9 };

// ---------- drawings (design canvas 600 x 1000, mark centred on (300, 520)) ----------
const txt = (g, t, x, y, size, fill, ol = 22) => { g.font = `900 ${size}px Montserrat, Arial Black, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = ol; g.strokeStyle = INK; g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
const DRAW = {
  bang(p, k) { const g = p.g, s = back(k * 3); g.save(); g.translate(300, 520); g.scale(s, s); g.rotate(-0.12);
    g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = 16; for (const a of [-2.3, -1.6, -0.9]) { g.beginPath(); g.moveTo(Math.cos(a) * 150, Math.sin(a) * 150); g.lineTo(Math.cos(a) * 215, Math.sin(a) * 215); g.stroke(); }
    txt(g, '!', 0, 10, 300, '#ffd23a', 26); g.restore(); },
  question(p, k) { const g = p.g, s = back(k * 3); g.save(); g.translate(300, 520 + Math.sin(k * 9) * 10); g.scale(s, s); g.rotate(0.12); txt(g, '?', 0, 0, 280, '#ffffff', 26); g.restore(); },
  sweat(p, k) { const g = p.g; g.save();
    for (let i = 0; i < 3; i++) { const ph = (k * 1.6 + i / 3) % 1, x = 230 + i * 70 + ph * 60, y = 430 + ph * 240 - Math.sin(ph * Math.PI) * 90, s = 1 - ph * 0.5;
      g.globalAlpha = clamp((1 - ph) * 2.2); g.save(); g.translate(x, y); g.scale(s, s); g.rotate(0.5);
      g.beginPath(); g.moveTo(0, -60); g.bezierCurveTo(34, -10, 40, 30, 0, 40); g.bezierCurveTo(-40, 30, -34, -10, 0, -60); g.closePath();
      g.fillStyle = '#9fd4ff'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(-10, 8, 7, 12, 0.3, 0, 6.283); g.fill(); g.restore(); }
    g.restore(); },
  anger(p, k) { const g = p.g, s = 0.85 + 0.15 * Math.sin(k * 40); g.save(); g.translate(300, 520); g.scale(s, s); g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2 + Math.PI / 4); g.beginPath(); g.moveTo(22, -70); g.quadraticCurveTo(22, -22, 70, -22);
      g.lineWidth = 44; g.strokeStyle = INK; g.stroke(); g.lineWidth = 26; g.strokeStyle = '#e8322e'; g.stroke(); g.restore(); }
    g.restore(); },
  stars(p, k) { const g = p.g; g.save(); g.translate(300, 540);
    for (let i = 0; i < 3; i++) { const a = k * 9 + i * 2.094, x = Math.cos(a) * 200, y = Math.sin(a) * 60, s = 0.75 + 0.25 * Math.sin(a);
      g.save(); g.translate(x, y); g.scale(s, s); g.rotate(a); g.beginPath();
      for (let j = 0; j < 10; j++) { const r = j % 2 ? 44 : 100, b = j * Math.PI / 5 - Math.PI / 2; j ? g.lineTo(Math.cos(b) * r, Math.sin(b) * r) : g.moveTo(Math.cos(b) * r, Math.sin(b) * r); }
      g.closePath(); g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = INK; g.fillStyle = '#ffd23a'; g.fill(); g.stroke(); g.restore(); }
    g.restore(); },
  speed(p, k, dir = 1) { const g = p.g; g.save(); g.translate(300, 520); g.scale(dir, 1); g.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const y = -260 + i * 120 + (i % 2) * 30, ph = (k * 5 + i * 0.37) % 1, x0 = -60 + ph * 120, L = 160 + (i % 3) * 70;
      g.globalAlpha = 0.9 * Math.sin(ph * Math.PI); g.lineWidth = 30; g.strokeStyle = INK; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + L, y); g.stroke();
      g.lineWidth = 16; g.strokeStyle = '#ffffff'; g.stroke(); }
    g.restore(); },
  heart(p, k) { const g = p.g, s = back(k * 3) * (1 + 0.08 * Math.sin(k * 30)); g.save(); g.translate(300, 520 - k * 60); g.scale(s, s); g.beginPath();
    g.moveTo(0, 70); g.bezierCurveTo(-140, -20, -70, -130, 0, -55); g.bezierCurveTo(70, -130, 140, -20, 0, 70); g.closePath();
    g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = INK; g.fillStyle = '#ff5a7a'; g.fill(); g.stroke(); g.restore(); },
  note(p, k) { const g = p.g; g.save(); for (let i = 0; i < 2; i++) { const ph = (k * 1.2 + i * 0.5) % 1; g.globalAlpha = Math.sin(ph * Math.PI);
    g.save(); g.translate(250 + i * 110 + ph * 40, 600 - ph * 250); txt(g, i ? '♫' : '♪', 0, 0, 170, '#ffffff', 18); g.restore(); } g.restore(); },
};

/** Marks for frame f. now = actors at f, past(k) = actors at f - k (k = 1..36), cam = camera. Returns card objects for drawActors. */
export function marksFor(now, past, cam, f = 0) {
  const out = [], idOf = (a, i) => (a.id ?? String(a.key || '').split('{')[0]) + '#' + i;
  const exprOf = (a) => { const m = String(a.key || '').match(/"expr":"(\w+)"/); return m ? m[1] : null; };
  const byId = (list) => { const m = new Map(); list.forEach((a, i) => m.set(idOf(a, i), a)); return m; };
  const hist = []; for (let k = 1; k <= 36; k++) hist.push(byId(past(k) || []));
  now.forEach((a, i) => {
    if (a.marks === false || a.isMark) return;
    const id = idOf(a, i), ex = exprOf(a), s = a.s || 1, fallen = Math.abs(a.roll || 0) > 1.2;
    const ry = Math.atan2(cam.position.x - a.x, cam.position.z - a.z), rx = Math.cos(ry), rz = -Math.sin(ry), fx = Math.sin(ry), fz = Math.cos(ry);
    const kinds = [];                                     // an actor can show two marks at once (speed lines + "!")
    if (a.mark) kinds.push(a.mark);
    else {
      if (fallen) kinds.push('stars');
      const p = hist[2].get(id);
      if (p) { const dx = a.x - p.x, dz = a.z - p.z, v = Math.hypot(dx, dz) * 10; if (v > 1.6) kinds.push('speed:' + (Math.sign(dx * rx + dz * rz) || 1)); }
      const ek = ex && EXPR_MARK[ex]; if (ek && !(fallen && ek === 'stars')) kinds.push(ek);
    }
    for (const kk of kinds) {
      const [kind, d] = kk.split(':'), dirX = +(d || 1);
      // age of this mark = how long the same reason has held (onset -> pop-in animation, one-shot marks fade out)
      let age = 0;
      for (; age < 36; age++) { const p = hist[age].get(id); if (!p) break; if (kind === 'speed' || kind === 'stars' || a.mark) continue; if (EXPR_MARK[exprOf(p)] !== kind) break; }
      if (age > LIFE[kind]) continue;
      const loop = kind === 'sweat' || kind === 'anger' || kind === 'stars' || kind === 'speed' || kind === 'note';
      const k = q(loop ? f / 30 + Math.abs((a.x * 0.37) % 1) : age / 30, 2);
      const P = { speed: [-dirX * 0.9, 1.0, 1.0], stars: fallen ? [Math.sign(-(a.roll || 0)) * 1.4, 0.95, 0.85] : [0, 2.1, 0.75], sweat: [0.45, 1.8, 0.42],
        bang: [0.5, 2.05, 0.5], question: [0.5, 2.05, 0.48], anger: [0.42, 2.0, 0.4], heart: [0.45, 2.05, 0.42], note: [0.45, 2.0, 0.45] }[kind];
      const ms = P[2] * s, y = (a.y || 0) + (a.dy || 0) + P[1] * s;
      out.push({ key: 'mk' + kind + k + (dirX > 0 ? 'r' : 'l'), draw: (pen) => DRAW[kind](pen, k, dirX), isMark: true,
        x: a.x + (a.dx || 0) + rx * P[0] * s + fx * 0.08, y: y - 1.08 * ms, z: a.z + rz * P[0] * s + fz * 0.08, s: ms, blob: false, shadow: false, order: 6, tint: a.tint });
    }
  });
  return out;
}
