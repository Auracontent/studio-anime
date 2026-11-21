// Lists what happens on screen, frame by frame, so the sound can follow the picture automatically (tools/autosfx.py).
//   node tools/events.mjs episodes/<slug>      ->  episodes/<slug>/events.json
// It runs the episode's story.js in Node (no browser, no drawing) and watches: shot changes and flashes, fast camera moves
// and transitions, camera shakes, characters appearing, jumping, landing, falling, running steps, a shock expression,
// effect cards popping in, and the 3D effects of envAt (lightning, spray, sparks, smoke puffs, rain, sea, fire).
import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), engine = path.resolve(here, '..', 'engine');
const ep = path.resolve(process.argv[2] || ''); if (!fs.existsSync(path.join(ep, 'web', 'story.js'))) { console.log('usage: node tools/events.mjs episodes/<slug>'); process.exit(1); }
// story.js imports '../motion.js' etc. (served from engine/ in the browser): copy web/ next to the engine modules
const tmp = path.join(engine, '.ev_' + path.basename(ep)); fs.rmSync(tmp, { recursive: true, force: true }); fs.cpSync(path.join(ep, 'web'), tmp, { recursive: true });
const noop = () => {}; const T = new Proxy({ OUTFITS: {}, CAST: { v2: true } }, { get: (o, k) => (k in o ? o[k] : noop) });
let S;
try { S = await import(pathToFileURL(path.join(tmp, 'story.js')).href + '?t=' + Date.now()); }
finally { fs.rmSync(tmp, { recursive: true, force: true }); }
if (S.setupCast) try { S.setupCast(T); } catch {}
const N = S.TOTAL, ev = [], loops = [];
const GAP = { whoosh: 8, swish: 8, flash: 8, pop: 6, impact: 10, step: 4, surprise: 15, jump: 6, land: 6, fall: 12 }, lastAt = {};
const push = (f, type, k = 1) => {                                    // one sound per beat: no machine-gun repeats
  const fam = type === 'flash' || type === 'swish' ? 'whoosh' : type, g = GAP[type] ?? 4;
  if (lastAt[fam] !== undefined && f - lastAt[fam] < g) return; lastAt[fam] = f;
  ev.push({ f, t: +(f / 30).toFixed(3), type, k: +Math.min(1, k).toFixed(2) }); };
const sub = (a, b) => a.map((v, i) => v - b[i]), len = (v) => Math.hypot(...v), norm = (v) => { const n = len(v) || 1; return v.map((x) => x / n); };
const exprOf = (a) => { const m = String(a.key || '').match(/"expr":"(\w+)"/); return m ? m[1] : null; };
const idOf = (a, i) => (a.id ?? String(a.key || '').split('{')[0]) + '#' + i;
const stepOf = (a) => { const m = String(a.key || '').match(/"step":([\d.]+)/); return m ? +m[1] : 0; };
let prevS = null, prevC = null, prevDir = null, fast = false, prevA = new Map(), prevFx = new Set(), prevMb = 0;
const loopState = {};
const loop = (type, on, f, k) => { const L = loopState[type]; if (on && !L) loopState[type] = { type, f0: f, k }; else if (on && L) L.k = Math.max(L.k, k); else if (!on && L) { loops.push({ ...L, f1: f, t0: +(L.f0 / 30).toFixed(3), t1: +(f / 30).toFixed(3) }); delete loopState[type]; } };
for (let f = 0; f < N; f++) {
  const sh = S.shotAt(f), C = S.camAt(f), dir = norm(sub(C.look, C.pos));
  const cut = prevS && sh.id !== prevS.id;
  // camera
  if (prevC) {
    const jump = len(sub(C.pos, prevC.pos));
    const ang = Math.acos(Math.max(-1, Math.min(1, dir[0] * prevDir[0] + dir[1] * prevDir[1] + dir[2] * prevDir[2]))) * 57.3;
    const mb = Math.hypot(...(C.mblur || [0, 0])) + (C.zoomBlur || 0) * 100;
    if (mb > 20 && prevMb <= 20) push(f, 'swish', mb / 150);
    else if (jump > 50 && !cut) {}                                    // invisible swap inside a transition
    else if (cut && (C.flash || 0) > 0.3) push(f, 'flash', 0.8);
    else if (cut) push(f, 'whoosh', 0.6);
    else { const sp = Math.max(ang / 1.2, jump / 0.12);              // > 1: faster than ~36 deg/s or 3.6 m/s
      if (!fast && sp > 1 && mb <= 20) { fast = true; push(f, 'whoosh', Math.min(1, sp / 2.5)); } else if (fast && sp < 0.6) fast = false; }
    const dr = Math.abs((C.roll || 0) - (prevC.roll || 0));
    if (dr > 0.8 && !cut) { const last = ev.findLast?.((e) => e.type === 'impact'); if (!last || f - last.f > 10) push(f, 'impact', dr / 3); }
    prevMb = mb;
  }
  // actors
  let A = []; try { A = S.actorsAt(f, T) || []; } catch {}
  const cur = new Map();
  A.forEach((a, i) => { const id = idOf(a, i), p = prevA.get(id), ex = exprOf(a), dy = a.dy || 0, roll = Math.abs(a.roll || 0), st = stepOf(a);
    cur.set(id, { x: a.x, z: a.z, dy, roll, ex, st });
    if (!p) { if (!cut && f > 0) push(f, 'pop', 0.5); return; }
    if (dy > 0.04 && p.dy <= 0.01) push(f, 'jump', 0.8);
    if (dy <= 0.01 && p.dy > 0.04) push(f, 'land', 0.8);
    if (roll > 1.0 && p.roll <= 1.0) push(f, 'fall', 1);
    if (ex === 'shock' && p.ex !== 'shock' && !cut) push(f, 'surprise', 0.7);
    if (st && p.st !== undefined && Math.floor(st * 2) !== Math.floor(p.st * 2) && Math.hypot(a.x - p.x, a.z - p.z) > 0.01) push(f, 'step', 0.5);
  });
  prevA = cur;
  // 2D effect cards appearing
  let FX = []; try { FX = S.fxAt ? S.fxAt(f, T) || [] : []; } catch {}
  const fxs = new Set(FX.map((x) => String(x.key).replace(/[\d.\-]+/g, '')));
  for (const k of fxs) if (!prevFx.has(k) && !cut && f > 0) push(f, 'pop', 0.6);
  prevFx = fxs;
  // 3D effects
  const E = S.envAt ? S.envAt(f) || {} : {};
  for (const l of E.lightning || []) if (l === f) push(f, 'thunder', 1);
  for (const s of E.spray || []) if (s.f0 === f) push(f, 'splash', Math.min(1, (s.power ?? 5) / 7));
  for (const s of E.sparks || []) if (s.f0 === f) push(f, 'sparks', 0.7);
  for (const s of E.smoke || []) if (s.f0 === f && s.f1 !== undefined && s.f1 - s.f0 < 40) push(f, 'puff', 0.6);
  loop('rain', (E.rain || 0) > 0.05, f, E.rain || 0);
  loop('sea', !!E.sea, f, Math.min(1, (E.sea?.amp ?? 0.3) / 1.1));
  loop('fire', !!(E.embers && E.embers.some((s) => f >= s.f0 && f <= (s.f1 ?? Infinity))), f, 0.6);
  loop('wind', len(E.wind || [0, 0]) > 3, f, Math.min(1, len(E.wind || [0, 0]) / 8));
  prevS = sh; prevC = C; prevDir = dir;
}
for (const k of Object.keys(loopState)) loop(k, false, N, 0);
fs.writeFileSync(path.join(ep, 'events.json'), JSON.stringify({ fps: 30, total: N, events: ev, loops }, null, 1));
const count = {}; ev.forEach((e) => (count[e.type] = (count[e.type] || 0) + 1));
console.log(`events.json: ${ev.length} événements`, JSON.stringify(count), `| ambiances: ${loops.map((l) => `${l.type} ${l.t0}-${l.t1}s`).join(', ') || 'aucune'}`);
