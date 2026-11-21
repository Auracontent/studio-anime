// Motion helpers: smooth, continuous, "animated" movement for cameras and cards.
// Import in story.js:  import { M } from './motion.js';
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const ramp = (f, a, b) => clamp((f - a) / (b - a));
export const M = {
  smooth: (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); },           // smootherstep (glides)
  easeOut: (t) => 1 - Math.pow(1 - clamp(t), 3),                                          // fast start, soft land (reference "burst" moves)
  easeIn: (t) => Math.pow(clamp(t), 3),
  back: (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; },        // overshoot then settle (pops, arrivals)
  anticip: (t, s = 0.12) => { t = clamp(t); return t < 0.25 ? -s * Math.sin(t / 0.25 * Math.PI) : M.back((t - 0.25) / 0.75); }, // wind-up then go
  spring: (t, freq = 3, damp = 5) => { t = Math.max(0, t); return 1 - Math.exp(-damp * t) * Math.cos(freq * 2 * Math.PI * t); },  // settle wobble (t in s)
};
/** Centripetal Catmull-Rom through 3D points; u in [0,1] over the whole path (constant-ish speed). */
export const spline = (pts, u) => {
  const n = pts.length - 1, x = clamp(u) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t));
};
/** Camera from keys {f,pos,look,fov,roll,ease?}. 3+ keys inside one glide use a spline (no corners).
 *  Every hold creeps (push-in) so nothing ever freezes; add kicks for impacts. */
export const camFromKeys = (K, f, { creep = 0.0012, kicks = [] } = {}) => {
  let c;
  if (f <= K[0].f) c = { ...K[0] };
  else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else {
    const i = K.findIndex((k, j) => f >= k.f && f <= K[j + 1].f), a = K[i], b = K[i + 1];
    const ease = M[b.ease || 'smooth'], t = ease((f - a.f) / (b.f - a.f));
    if (b.path) { // optional via-points for curved moves: b.path = [[x,y,z], ...]
      const pts = [a.pos, ...b.path, b.pos]; c = { pos: spline(pts, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
    } else c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
  c.fov *= 1 - creep * Math.max(0, f - K[0].f) * 0.15; // gentle push-in during holds
  for (const k of kicks) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0], c.look[1] + s * 3, c.look[2] + s * 2]; c.roll = (c.roll || 0) + s * 20; } }
  return c;
};
/** Idle life for a card: breathing bob + small sway, deterministic per seed. Use on EVERY on-screen character. */
export const idle = (f, seed = 1) => ({
  bob: 0.006 * Math.sin((f + seed * 11) * 0.11),
  tilt: 1.2 * Math.sin((f + seed * 7) * 0.05),
  headTilt: 1.5 * Math.sin((f + seed * 5) * 0.037 + 1),
});
/** Blink: 4-frame lid every 0.5-2.3 s. */
export const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
/** Walk: phase for step cycles + planted travel. speed m/s, stride m. */
export const walk = (f, f0, speed = 1.1, stride = 0.8) => { const t = Math.max(0, f - f0) / 30; return { dist: t * speed, phase: (t * speed / (2 * stride)) % 1 }; };
/** Round values used in card keys so canvas redraws happen only when the pose visibly changes. */
export const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
/** Character framing (the RicksClips scale): returns a camera key {pos, look, fov} so a card at `at` (feet position)
 *  has its head `headW` wide as a fraction of the 1080-px frame width.  0.28-0.34 = house close-up (default 0.30, RicksClips scale: head ~30 % of the width, feet near the bottom edge),
 *  0.24-0.28 = two characters side by side (frameTwo, stand them 0.8-1 m apart), <= 0.10 = wide / establishing only.
 *  yaw: degrees around the character (0 = camera on +z looking -z, 90 = camera on +x). frameY: head height in the frame (0 top, 1 bottom).
 *  s: card scale (1 = 2.25 m tall card; cast v2 head ~0.63 m wide, centre ~1.48 m). Use as a key: { f: 120, ...frameOn([2,0,-36], { headW: 0.26 }) } */
export const frameOn = (at, { headW = 0.30, yaw = 0, fov = 40, frameY = 0.38, s = 1, aspect = 9 / 16, lift = -0.08 } = {}) => {
  const HW = 0.63 * s, HC = 1.48 * s + (at[1] || 0), t = Math.tan((fov * Math.PI) / 360);   // cast v2 head: 0.63 m wide, centre 1.48 m
  const d = HW / (headW * 2 * t * aspect), Hv = 2 * d * t, a = (yaw * Math.PI) / 180;
  return { pos: [at[0] + d * Math.sin(a), HC + lift, at[2] + d * Math.cos(a)], look: [at[0], HC - (0.5 - frameY) * Hv, at[2]], fov };
};
/** Two characters in one medium shot: frames their midpoint with each head ~headW wide. */
export const frameTwo = (a, b, o = {}) => frameOn([(a[0] + b[0]) / 2, Math.min(a[1] || 0, b[1] || 0), (a[2] + b[2]) / 2], { headW: 0.26, frameY: 0.4, ...o });

// ===================== camera that follows the action =====================
/** Smoothed target: average of posAt over the last `lag` frames, so the camera trails a moving subject like a camera operator
 *  (no jerks when the subject starts or stops). posAt(f) -> [x, y, z]. Pure function of f. */
export const trail = (posAt, f, lag = 8) => {
  if (lag <= 0) return posAt(f);
  let s = [0, 0, 0], w = 0;
  for (let k = 0; k <= lag; k++) { const wk = 1 - k / (lag + 1), p = posAt(f - k); s = s.map((v, i) => v + p[i] * wk); w += wk; }
  return s.map((v) => v / w);
};
/** Follow a moving character with house framing: frameOn() around its trailed position. Use as the camera for a shot where someone
 *  walks, runs, falls or is carried. o: frameOn options + lag (frames, default 8) + lead (metres ahead along the motion, default 0.6). */
export const follow = (posAt, f, o = {}) => {
  const { lag = 8, lead = 0.6, ...fo } = o, p = trail(posAt, f, lag), q2 = trail(posAt, f - 3, lag);
  const v = [p[0] - q2[0], 0, p[2] - q2[2]], n = Math.hypot(v[0], v[2]) || 1, sp = Math.min(1, Math.hypot(v[0], v[2]) * 10);
  return frameOn([p[0] + (v[0] / n) * lead * sp, p[1], p[2] + (v[2] / n) * lead * sp], fo);
};
/** Tracking shot alongside a moving object (boat, cart, train, falling block): the camera keeps a fixed offset from it and looks at it.
 *  offset [dx, dy, dz] in metres, lookUp = height of the aimed point above the object. */
export const track = (posAt, f, offset = [6, 2, 6], { lag = 6, fov = 40, lookUp = 1 } = {}) => {
  const p = trail(posAt, f, lag); return { pos: [p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]], look: [p[0], p[1] + lookUp, p[2]], fov };
};
/** Orbit around a point: deg/s turn speed from frame f0, radius r, height h. Great for a reveal (lighthouse, machine, monument). */
export const orbit = (center, f, f0, { r = 12, h = 3, speed = 12, start = 0, fov = 40, lookUp = 1.5 } = {}) => {
  const a = ((start + ((f - f0) / 30) * speed) * Math.PI) / 180;
  return { pos: [center[0] + r * Math.sin(a), center[1] + h, center[2] + r * Math.cos(a)], look: [center[0], center[1] + lookUp, center[2]], fov };
};
/** Camera shake for impacts, thunder, explosions: returns a copy of the camera c, shaken for `dur` frames from f0 (decays). Deterministic. */
export const shake = (c, f, f0, amp = 0.06, dur = 12) => {
  const d = f - f0; if (d < 0 || d >= dur) return c; const k = amp * (1 - d / dur) ** 1.5, n = (s) => Math.sin(d * 2.7 + s) * 0.6 + Math.sin(d * 5.3 + s * 2) * 0.4;
  return { ...c, pos: [c.pos[0] + n(1) * k, c.pos[1] + n(2) * k, c.pos[2] + n(3) * k], look: [c.look[0] + n(4) * k * 1.5, c.look[1] + n(5) * k * 1.5, c.look[2]], roll: (c.roll || 0) + n(6) * k * 40 };
};

// ===================== character actions (actor-level: add the result to the actor object) =====================
// An actor in actorsAt() is { key, draw, x, y, z, s, roll, sx, sy, ... }. These return offsets to merge in, so a flat card
// gets real cartoon physics: anticipation, squash and stretch, overshoot, settle.
/** Hop / jump from frame f0: { dy, sx, sy }  (crouch 4 frames, take-off stretch, airborne, landing squash). h metres, dur frames in the air. */
export const hop = (f, f0, h = 0.6, dur = 14) => {
  const d = f - f0; if (d < 0 || d > dur + 12) return { dy: 0, sx: 1, sy: 1 };
  if (d < 4) { const k = Math.sin((d / 4) * Math.PI / 2); return { dy: 0, sx: 1 + 0.12 * k, sy: 1 - 0.14 * k }; }            // anticipation
  if (d < 4 + dur) { const u = (d - 4) / dur, st = Math.max(0, 1 - u * 3); return { dy: 4 * h * u * (1 - u), sx: 1 - 0.08 * st, sy: 1 + 0.12 * st }; }
  const k = (d - 4 - dur) / 8, sq = k < 1 ? Math.sin(k * Math.PI) : 0; return { dy: 0, sx: 1 + 0.14 * sq, sy: 1 - 0.16 * sq };  // landing squash
};
/** Fall over from frame f0 (side: 1 = to the right, -1 = left): { roll, dy, sx, sy } — tips over with overshoot, bounces once. */
export const fallOver = (f, f0, side = 1, dur = 12) => {
  const d = f - f0; if (d < 0) return { roll: 0, dy: 0, sx: 1, sy: 1 };
  const u = Math.min(1, d / dur), a = u * u * 1.45, bounce = d > dur ? Math.exp(-(d - dur) / 4) * Math.sin((d - dur) * 0.9) * 0.08 : 0;
  return { roll: -side * Math.min(1.45, a + bounce), dy: 0, sx: 1, sy: 1 - (d > dur && d < dur + 4 ? 0.06 : 0) };
};
/** Tremble (fear, cold, effort): small fast x offset + roll. amp metres. */
export const tremble = (f, amp = 0.02, seed = 1) => ({ dx: amp * Math.sin(f * 2.9 + seed) , roll: amp * 1.5 * Math.sin(f * 3.7 + seed * 2) });
/** Run from frame f0 along a direction: { dist, step, bob, tilt } — step feeds romanFront `step` (legs), with run: true for long strides.
 *  speed m/s. tilt (deg) leans the body forward; bob lifts the card at each stride. */
export const run = (f, f0, speed = 3.2, stride = 1.1) => {
  const t = Math.max(0, f - f0) / 30, ph = (t * speed) / (2 * stride);
  return { dist: t * speed, step: ph % 1, bob: Math.abs(Math.sin(ph * Math.PI * 2)) * 0.06, tilt: 8 };
};
/** Pop in (appear with overshoot) from f0 over n frames: scale factor 0 -> 1.1 -> 1. */
export const popIn = (f, f0, n = 10) => M.back((f - f0) / n);
/** Rocking (boat, swaying sign, drunk walk): roll radians and dy metres. */
export const rock = (f, amp = 0.08, period = 90, seed = 0) => ({ roll: amp * Math.sin((f / period) * Math.PI * 2 + seed), dy: amp * 0.6 * Math.sin((f / period) * Math.PI * 4 + seed) });

// ===================== transitions that travel instead of cutting =====================
// A and B are camera keys ({ pos, look, fov }) of the end of the outgoing shot and the start of the incoming one: they may be in
// two different places (exterior / interior x = 3000). The swap happens at the middle, hidden by the speed and the motion blur,
// so the viewer feels one continuous camera move. The returned camera carries mblur: [dx, dy] (pixels) for the motion-blur pass.
// Use inside camAt:   if (f >= 300 && f < 312) return transition('whip', camA, camB, f, 300, 12);
const rotY = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const aim = (c, yaw, pitch, dist = 10) => {           // turn the camera c by yaw / pitch (radians) around its own position
  let d = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]]; const n = Math.hypot(...d) || 1; d = d.map((x) => x / n);
  d = rotY(d, yaw); const h = Math.hypot(d[0], d[2]), el = Math.atan2(d[1], h) + pitch, ch = Math.cos(el) / (h || 1);
  d = [d[0] * ch, Math.sin(el), d[2] * ch]; return { ...c, look: [c.pos[0] + d[0] * dist, c.pos[1] + d[1] * dist, c.pos[2] + d[2] * dist] };
};
/** type: 'whip' (fast pan sideways, dir 1 = to the right), 'rise' (tilt up to the sky and come down elsewhere),
 *  'drop' (dive down past the ground), 'push' (rush forward into the subject). n frames (8-14 look right). */
export const transition = (type, A, B, f, f0, n = 10, { dir = 1, angle } = {}) => {
  const t = clamp((f - f0) / n), first = t < 0.5, u = first ? t * 2 : (t - 0.5) * 2;
  const inK = Math.pow(u, 2.2), outK = 1 - Math.pow(1 - u, 2.2), speed = first ? 2.2 * Math.pow(u, 1.2) : 2.2 * Math.pow(1 - u, 1.2);   // 0 at the ends, max at the swap
  if (type === 'whip') { const a = (angle ?? 1.25) * dir, c = first ? aim(A, -a * inK, 0) : aim(B, a * (1 - outK), 0); return { ...c, mblur: [dir * 90 * speed, 0], swap: !first }; }
  if (type === 'rise' || type === 'drop') { const s = type === 'rise' ? 1 : -1, a = 1.2 * s;
    const c = first ? aim({ ...A, pos: [A.pos[0], A.pos[1] + s * 2 * inK, A.pos[2]] }, 0, a * inK) : aim({ ...B, pos: [B.pos[0], B.pos[1] + s * 2 * (1 - outK), B.pos[2]] }, 0, a * (1 - outK));
    return { ...c, mblur: [0, -s * 90 * speed], swap: !first }; }
  if (type === 'push') { const C = first ? A : B, k = first ? inK : 1 - outK, d = [C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]];
    return { ...C, pos: C.pos.map((v, i) => v + d[i] * 0.55 * k), fov: C.fov * (1 - 0.35 * k), mblur: [0, 0], zoomBlur: 0.9 * speed, swap: !first }; }
  return first ? A : B;
};
