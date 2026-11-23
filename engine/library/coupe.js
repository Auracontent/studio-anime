// Cutaway (vue en coupe): a slice of the world seen from the side, like a school diagram that comes alive:
// the street or the field on top, the layers of the ground below, and the hidden places dug into it (vault, tunnel, mine gallery,
// cellar, sewer, metro, catacombs, roots of a tree, a well...). The camera can glide along it and dive from the surface to the room.
// It is a self-contained diorama: put it far from the other sets (e.g. x = 5000) so no other ground hides its front face.
//
//   import { buildCoupe } from '../library/coupe.js';
//   const C = buildCoupe(ctx, { at: [5000, 0, 0], w: 34, depth: 16, layers: [...], rooms: [...], top: 'road' });
//   C.surface  -> y of the surface (characters walk on it), C.front -> z of the cut face, C.room(i) -> [x, y, z] floor centre of room i
//
// layers: from the top down, { h: metres, col, dots?: colour of pebbles / roots, wave?: 0-1 wavy boundary look (painted) }
// rooms: { x0, x1, y0, y1, depth?: metres dug into the cut (default 6), wall, floor, light?: '#ffd27a' (warm lamp inside) }
//        x and y are relative to the cut: x from the centre (-w/2..w/2), y below the surface (0 = surface, negative = deeper).
// pipes: { pts: [[x, y], ...], r: radius, col } tunnels / pipes / roots drawn along the face (relative like rooms).
export function buildCoupe(ctx, o = {}) {
  const { THREE, P, world, add, box, toon } = ctx;
  const [X, Y0, Z] = o.at || [5000, 0, 0], W = o.w ?? 34, D = o.d ?? 14, front = Z + D / 2;
  const layers = o.layers || [
    { h: 0.6, col: '#8a5a3a', dots: '#5b3a24' }, { h: 2.2, col: '#d8a067', dots: '#b07a46' }, { h: 2.6, col: '#f2c98a', dots: '#d6a35f' },
    { h: 2.4, col: '#e07a4a', dots: '#f4d0b0' }, { h: 3.2, col: '#b9a9c9', dots: '#8d7ea6' }, { h: 6, col: '#7d7a8c', dots: '#5b586a' } ];
  const rooms = o.rooms || [], r = P.rng(o.seed ?? 5), M = (c) => toon({ color: c });
  const g = new THREE.Group(); g.position.set(X, Y0, Z); world.add(g);
  // painted face texture for one layer: base colour + pebbles / roots + darker top edge (reads like a drawn diagram)
  const layerTex = (L, w, h) => {
    const c = document.createElement('canvas'); c.width = Math.max(64, Math.round(w * 24)); c.height = Math.max(16, Math.round(h * 24)); const q = c.getContext('2d');
    q.fillStyle = L.col; q.fillRect(0, 0, c.width, c.height);
    q.fillStyle = 'rgba(0,0,0,0.13)'; q.fillRect(0, 0, c.width, Math.max(3, c.height * 0.06));
    if (L.dots) { q.fillStyle = L.dots; const n = Math.round(w * h * 1.4); for (let i = 0; i < n; i++) { q.beginPath(); q.ellipse(r() * c.width, r() * c.height, 2 + r() * 6, 1.5 + r() * 3.5, r() * 3, 0, 7); q.fill(); } }
    q.strokeStyle = 'rgba(39,25,37,0.55)'; q.lineWidth = 3; q.beginPath(); q.moveTo(0, 1.5); for (let x = 0; x <= c.width; x += 24) q.lineTo(x, 1.5 + (L.wave ? Math.sin(x * 0.03) * 6 * L.wave : 0)); q.stroke();
    return P.tex(c);
  };
  // the block: every layer is a slab; the slab in front of a room is split into pieces around the room opening
  let yTop = 0;
  const depthOf = (R) => R.depth ?? 6;
  for (const L of layers) {
    const yB = yTop - L.h, cy = (yTop + yB) / 2;
    // back part (behind the deepest room) is one piece
    const back = Math.max(0, ...rooms.map(depthOf)), bd = D - back;
    if (bd > 0.01) add(box(W, L.h, bd), M(L.col), 0, cy, -D / 2 + bd / 2, g, { cast: false });
    // front part: cut the band [yB, yTop] x [-W/2, W/2] minus room rectangles, slab depth = back
    if (back > 0) {
      const cuts = rooms.filter((R) => R.y1 > yB && R.y0 < yTop).map((R) => [Math.max(-W / 2, R.x0), Math.min(W / 2, R.x1), Math.max(yB, R.y0), Math.min(yTop, R.y1)]);
      const piece = (x0, x1, y0, y1) => { if (x1 - x0 < 0.01 || y1 - y0 < 0.01) return; const m = toon({ map: layerTex(L, x1 - x0, y1 - y0) });
        add(box(x1 - x0, y1 - y0, back), [M(L.col), M(L.col), M(L.col), M(L.col), m, M(L.col)], (x0 + x1) / 2, (y0 + y1) / 2, D / 2 - back / 2, g, { cast: false }); };
      // sweep in x: split points at every cut edge, then for each column fill the y-ranges not covered by a cut
      const xs = [...new Set([-W / 2, W / 2, ...cuts.flatMap((c) => [c[0], c[1]])])].sort((a, b) => a - b);
      for (let i = 0; i < xs.length - 1; i++) {
        const xa = xs[i], xb = xs[i + 1], mid = (xa + xb) / 2, cs = cuts.filter((c) => c[0] <= mid && c[1] >= mid).sort((a, b) => b[3] - a[3]);
        let y = yTop; for (const c of cs) { piece(xa, xb, c[3], y); y = c[2]; } piece(xa, xb, yB, y);
      }
    }
    yTop = yB;
  }
  // rooms: back wall, floor, ceiling, side walls (open towards the viewer), optional warm light
  rooms.forEach((R) => {
    const dp = depthOf(R), w = R.x1 - R.x0, h = R.y1 - R.y0, cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2, zb = D / 2 - dp;
    const wall = M(R.wall || '#c9b08a'), floor = M(R.floor || '#8a6a4a');
    add(box(w, h, 0.1), wall, cx, cy, zb + 0.05, g, { cast: false });
    add(box(w, 0.1, dp), floor, cx, R.y0 + 0.05, zb + dp / 2, g, { cast: false });
    add(box(w, 0.1, dp), M(R.ceil || R.wall || '#b8a07a'), cx, R.y1 - 0.05, zb + dp / 2, g, { cast: false });
    for (const s of [0, 1]) add(box(0.1, h, dp), wall, s ? R.x1 - 0.05 : R.x0 + 0.05, cy, zb + dp / 2, g, { cast: false });
    // ink frame around the opening (the cut edge), so the room reads as "dug into the ground"
    const ink = M('#271925'), t = 0.12; for (const [bw, bh, bx, by] of [[w + t, t, cx, R.y1], [w + t, t, cx, R.y0], [t, h, R.x0, cy], [t, h, R.x1, cy]]) add(box(bw, bh, 0.06), ink, bx, by, D / 2 + 0.02, g, { cast: false });
    if (R.light) { const l = new THREE.PointLight(R.light, 6, Math.max(w, h) * 2.2, 1.6); l.position.set(cx, R.y1 - 0.6, zb + dp * 0.6); g.add(l); }
  });
  // pipes / tunnels / roots along the face
  for (const T of o.pipes || []) {
    const pts = T.pts.map(([x, y]) => new THREE.Vector3(x, y, D / 2 - (T.r ?? 0.5) * 0.4)), cur = new THREE.CatmullRomCurve3(pts);
    add(new THREE.TubeGeometry(cur, 64, T.r ?? 0.5, 10, false), M(T.col || '#c9c4bb'), 0, 0, 0, g, { cast: false });
  }
  // surface: a thin top slab (road, grass or cobbles) slightly overhanging the cut, plus a kerb line
  const topCol = { road: '#6b6670', grass: '#6fae45', cobble: '#a89a88', sand: '#e8c890', snow: '#f4f6fa' }[o.top || 'grass'] || o.top;
  add(box(W + 0.3, 0.25, D + 0.3), M(topCol), 0, -0.1, 0, g, { cast: false });
  if (o.top === 'road') for (let x = -W / 2 + 1; x < W / 2; x += 3) add(box(1.4, 0.02, 0.18), M('#f4e9c8'), x, 0.04, 0, g, { cast: false });
  return { group: g, surface: Y0 + 0.03, front: front, room: (i) => { const R = rooms[i]; return [X + (R.x0 + R.x1) / 2, Y0 + R.y0 + 0.1, Z + D / 2 - depthOf(R) / 2]; },
    at: (x, y) => [X + x, Y0 + y, front] };
}
