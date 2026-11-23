FACE.snore = { eye: ["dash", "dash"], brow: [0, -1], mouth: "o" };
FACE.stubborn = { eye: ["lid", "lid"], brow: [4, -3], mouth: "frown" };
FACE.squint = { eye: ["slit", "slit"], brow: [3, -2], mouth: "dash" };
// "attitude" faces (2026-11): half-closed eyes ("heavy"), one brow up (browR = brow of the right-hand side), one-sided smirk.
// They give the characters a personality in every shot (the sure-of-himself boss, the sly crook, the unimpressed guard).
FACE.smug = { eye: ["heavy", "heavy"], brow: [2, 0], browR: [-4, -6], mouth: "smirkSide" };
FACE.sly = { eye: ["slit", "heavy"], brow: [4, -1], browR: [-3, -5], mouth: "smirkSide" };
FACE.deadpan = { eye: ["heavy", "heavy"], brow: [1, 1], mouth: "flat" };
FACE.proud = { eye: ["happy", "happy"], brow: [-4, -5], mouth: "smile" };
FACE.suspicious = { eye: ["slit", "dot"], brow: [5, -1], browR: [-4, -6], mouth: "frown" };
FACE.determined = { eye: ["heavy", "heavy"], brow: [5, -2], mouth: "flat" };
FACE.scheming = { eye: ["heavy", "heavy"], brow: [5, -1], mouth: "grin" };

// ---------------- Roman-era cast (our own designs), built on the Pen / blob / face helpers above ----------------
const STEEL = "#aeb6bf", BRASS = "#d9a845", LEATHER = "#7a4a2a";
export const OUTFITS = {
  legion: { tunic: "#b8322f", cape: "#8f2228", skin: SKIN, helmet: true, armor: true, spear: true, shield: true },
  old: { tunic: "#9c4a3c", cape: "#6e3330", skin: "#f3d6bb", helmet: "old", armor: true, spear: true, shield: false, beard: "#f4f1ea", brows: "#f4f1ea" },
  toga: { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#6b3c8f", hair: "#3b2a20", stout: true },
  civA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  civB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  civC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  workA: { tunic: "#8a5d3b", skin: "#f5c9a0", cap: "#c2733a", apron: "#d8c9a6" },
  workB: { tunic: "#3f6a6f", skin: "#ecd0b6", cap: "#5b4a8a", moustache: "#4a3020" },
};

/** galea: iron bowl, brass brow band, cheek guards, transverse red crest */
const galea = (p, H, cx, hc, light, thick, ow, old, u) => {
  const crest = old ? "#8d4b3f" : "#d2372f", bowl = old ? "#8f8a7e" : STEEL;
  // crest (behind the bowl top)
  const cy0 = hc - H.b * 0.98;
  const cr = ellPts(cx, cy0, 0.66 * 2 * H.a, 0.42 * 2 * H.b, 180, 360, 0, 40);
  cr.push([cx + 0.66 * 2 * H.a * 0.98, cy0 + 4 * u], [cx - 0.66 * 2 * H.a * 0.98, cy0 + 4 * u]);
  const crP = [...ellPts(cx, cy0 + 2 * u, 0.62 * 2 * H.a, 0.36 * 2 * H.b, 180, 360, 0, 40)];
  p.shadedFill(crP, crest, mul(crest, [0.7, 0.62, 0.7]), light, 0.62 * 2 * H.a, 0.3);
  p.clip(crP, () => { for (let i = -9; i <= 9; i++) p.stroke([[cx + i * 7.4 * u, cy0], [cx + i * 9.4 * u, cy0 - 0.62 * H.b * Math.cos(i / 11)]], 1.4 * u, mul(crest, [0.62, 0.55, 0.62])); });
  if (old) p.clip(crP, () => { for (let i = 0; i < 6; i++) p.ell(cx + (i - 3) * 22 * u, cy0 - 18 * u - (i % 2) * 10 * u, 9 * u, 5 * u, "#6f6a5e", 0); });
  p.inkRing(crP, ow * 0.85, thick);
  p.poly(rrect(cx - 10 * u, cy0 - 6 * u, cx + 10 * u, cy0 + 6 * u, 3 * u), BRASS, 2 * u);
  // bowl: upper head cap
  const bandY = hc - H.b * 0.42;
  const bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  p.shadedFill(bp, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => {
    p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55");
    if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (3 + (i % 3) * 2) * u, (2 + (i % 2)) * u, "#8a4b22", 0);
  });
  p.inkRing(bp, ow * 0.9, thick);
  p.band([[cx - H.a * 1.04, bandY], [cx + H.a * 1.04, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
  for (const s of [-1, 1]) p.dot(cx + s * 0.55 * H.a, bandY, 2.2 * u, "#fff3c4");
};
const cheeks = (p, H, cx, hc, light, ow, old, u) => {
  const bowl = old ? "#8f8a7e" : STEEL;
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.78 * H.a, x1 = cx + s * 1.07 * H.a, y0 = hc - H.b * 0.42, y1 = hc + H.b * 0.48;
    const pts = [[x0, y0], [x1, y0], [x1 - s * 0.04 * H.a, y1 - 0.1 * H.b], [x0 + s * 0.06 * H.a, y1], [x0 - s * 0.05 * H.a, (y0 + y1) / 2]];
    p.shadedFill(pts, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, 0.2 * H.a, 0.3);
    p.poly(pts, null, ow * 0.8);
    p.dot((x0 + x1) / 2, (y0 + y1) / 2 - 0.05 * H.b, 2.2 * u, BRASS);
  }
};
const cobweb = (p, cx, cy, r, u) => {
  const g = p.g; g.save(); g.globalAlpha = 0.8;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); p.stroke([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1 * u, "#f2f2f2"); }
  for (let k = 1; k <= 4; k++) { const rr = r * k / 4.3, pts = []; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } p.stroke(pts, 1 * u, "#f2f2f2"); }
  g.restore();
};

/** WWI / 1900s headgear (Pourkoipa originals): adrian = poilu helmet, kepi, chauff = driver's peaked cap */
const headgear = (p, kind, O, H, cx, hc, light, ow, u) => {
  const W = 2 * H.a;
  if (kind === "adrian") {
    const col = O.hatCol || "#6f86a8", dk = mul(col, [0.6, 0.64, 0.74]);
    const dome = ellPts(cx, hc - 0.3 * H.b, 1.1 * H.a, 0.82 * H.b, 180, 360, 0, 48);
    p.shadedFill(dome, col, dk, light, H.a, 0.4);
    p.clip(dome, () => { p.stroke(ellPts(cx - 24 * u, hc - 0.85 * H.b, 0.3 * H.a, 0.2 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff66"); });
    p.inkRing(dome, ow * 0.95, thickAngle(light));
    p.band([[cx, hc - 1.12 * H.b], [cx, hc - 0.4 * H.b]], mul(col, [0.82, 0.86, 0.95]), 7 * u, 1.6 * u, "round"); // central crest
    p.arc(cx, hc - 0.28 * H.b, 1.14 * H.a, 0.12 * H.b, 0, 180, 6 * u, mul(col, [0.72, 0.76, 0.86])); // front visor
    p.arc(cx, hc - 0.28 * H.b, 1.14 * H.a + 3 * u, 0.12 * H.b + 3 * u, 0, 180, 1.4 * u);
    p.ell(cx, hc - 0.62 * H.b, 7.5 * u, 7.5 * u, "#d9a845", 2 * u); // grenade badge
  } else if (kind === "kepi") {
    const col = O.hatCol || "#2b4a8c", band = O.hatBand || "#c8312c";
    const body = rrect(cx - 0.98 * H.a, hc - 1.5 * H.b, cx + 0.98 * H.a, hc - 0.45 * H.b, 7 * u);
    p.shadedFill(body, col, mul(col, [0.6, 0.64, 0.78]), light, H.a, 0.4);
    p.clip(body, () => { p.band([[cx - 1.1 * H.a, hc - 0.62 * H.b], [cx + 1.1 * H.a, hc - 0.62 * H.b]], band, 0.2 * H.b, 0.6 * u); p.band([[cx - 1.1 * H.a, hc - 1.4 * H.b], [cx + 1.1 * H.a, hc - 1.4 * H.b]], "#e8c45a", 4 * u, 0.6 * u); });
    p.poly(body, null, ow);
    p.ell(cx, hc - 0.46 * H.b, 0.95 * H.a, 0.1 * H.b, mul(col, [0.5, 0.52, 0.6]), ow, 0, 180);
    p.ell(cx, hc - 0.94 * H.b, 6 * u, 6 * u, "#e8c45a", 2 * u);
  } else if (kind === "bonnet") { // wool sailor / keeper cap: floppy dome falling to one side, folded brim
    const col = O.hatCol || "#c8312c", dk = mul(col, [0.62, 0.55, 0.62]);
    const dome = ellPts(cx, hc - 0.45 * H.b, 1.02 * H.a, 0.9 * H.b, 180, 360, 0, 48);
    dome.push([cx + 1.02 * H.a, hc - 0.4 * H.b], [cx - 1.02 * H.a, hc - 0.4 * H.b]);
    p.shadedFill(dome, col, dk, light, H.a, 0.4);
    p.clip(dome, () => { for (let i = -5; i <= 5; i++) p.stroke([[cx + i * 14 * u, hc - 0.45 * H.b], [cx + i * 12 * u, hc - 1.4 * H.b]], 1.6 * u, dk); });
    p.inkRing(dome, ow * 0.95, thickAngle(light));
    p.ell(cx + 0.95 * H.a, hc - 1.28 * H.b, 0.28 * H.a, 0.28 * H.a, mul(col, [1.1, 1.0, 1.0]), ow); // pompon / drooping tip
    const brim = rrect(cx - 1.06 * H.a, hc - 0.86 * H.b, cx + 1.06 * H.a, hc - 0.6 * H.b, 8 * u);
    p.shadedFill(brim, O.hatBand || "#2b3a5a", "#1a2238", light, H.a, 0.4); p.poly(brim, null, ow);
  } else if (kind === "minerH") { // miner's hard hat with a front lamp (Pourkoipa original): dome + brim + ridge + glowing lamp
    const col = O.hatCol || "#f2c230", dk = mul(col, [0.66, 0.6, 0.5]);
    const dome = ellPts(cx, hc - 0.34 * H.b, 1.06 * H.a, 0.86 * H.b, 180, 360, 0, 48);
    dome.push([cx + 1.06 * H.a, hc - 0.34 * H.b], [cx - 1.06 * H.a, hc - 0.34 * H.b]);
    p.shadedFill(dome, col, dk, light, H.a, 0.4);
    p.clip(dome, () => { p.band([[cx, hc - 1.3 * H.b], [cx, hc - 0.34 * H.b]], mul(col, [1.08, 1.08, 0.95]), 11 * u, 1.6 * u, "round"); p.stroke(ellPts(cx - 24 * u, hc - 0.95 * H.b, 0.3 * H.a, 0.2 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff77"); });
    p.inkRing(dome, ow * 0.95, thickAngle(light));
    p.ell(cx, hc - 0.34 * H.b, 1.2 * H.a, 0.13 * H.b, dk, ow);                                  // brim
    p.ell(cx, hc - 0.78 * H.b, 0.3 * H.a, 0.3 * H.a, "#dfe3e8", ow * 0.8);                        // lamp housing
    p.ell(cx, hc - 0.78 * H.b, 0.17 * H.a, 0.17 * H.a, "#fffbd0", 0);                              // lamp glass
  } else if (kind === "pickel") { // casque à pointe prussien : dôme sombre, bandeau, plaque dorée, pointe
    const col = O.hatCol || "#2e3646", dk = mul(col, [0.55, 0.58, 0.7]);
    const dome = ellPts(cx, hc - 0.34 * H.b, 1.04 * H.a, 0.8 * H.b, 180, 360, 0, 48);
    dome.push([cx + 1.04 * H.a, hc - 0.34 * H.b], [cx - 1.04 * H.a, hc - 0.34 * H.b]);
    p.shadedFill(dome, col, dk, light, H.a, 0.4);
    p.clip(dome, () => { p.stroke(ellPts(cx - 24 * u, hc - 0.95 * H.b, 0.3 * H.a, 0.2 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff77"); });
    p.inkRing(dome, ow * 0.95, thickAngle(light));
    p.poly([[cx - 7 * u, hc - 1.12 * H.b], [cx + 7 * u, hc - 1.12 * H.b], [cx + 4 * u, hc - 1.62 * H.b], [cx - 4 * u, hc - 1.62 * H.b]], "#d9a845", 2 * u);
    p.ell(cx, hc - 1.12 * H.b, 12 * u, 6 * u, "#d9a845", 2 * u);
    p.ell(cx, hc - 0.34 * H.b, 1.14 * H.a, 0.12 * H.b, mul(col, [0.5, 0.52, 0.62]), ow);       // visière
    p.poly(ellPts(cx, hc - 0.66 * H.b, 0.2 * H.a, 0.26 * H.b, 0, 360, 0, 20), "#d9a845", 2 * u); // plaque
  } else if (kind === "kabuto") { // casque de samouraï (Pourkoipa original): bol laqué, crête dorée en V, large garde-nuque à lamelles
    const col = O.hatCol || "#2a2a36", dk = mul(col, [0.55, 0.55, 0.7]), lace = O.hatBand || "#c8402a";
    for (const s of [-1, 1]) { const fl = [[cx + s * 0.9 * H.a, hc - 0.55 * H.b], [cx + s * 1.55 * H.a, hc - 0.1 * H.b], [cx + s * 1.5 * H.a, hc + 0.55 * H.b], [cx + s * 0.95 * H.a, hc + 0.2 * H.b]]; p.shadedFill(fl, lace, mul(lace, [0.6, 0.55, 0.6]), light, H.a, 0.4); p.poly(fl, null, ow * 0.9); p.stroke([[cx + s * 1.0 * H.a, hc - 0.2 * H.b], [cx + s * 1.5 * H.a, hc + 0.2 * H.b]], 2 * u, "#271925"); }
    const dome = ellPts(cx, hc - 0.34 * H.b, 1.04 * H.a, 0.82 * H.b, 180, 360, 0, 48);
    dome.push([cx + 1.04 * H.a, hc - 0.34 * H.b], [cx - 1.04 * H.a, hc - 0.34 * H.b]);
    p.shadedFill(dome, col, dk, light, H.a, 0.4);
    p.clip(dome, () => { for (let i = -4; i <= 4; i++) p.stroke([[cx + i * 0.25 * H.a, hc - 0.34 * H.b], [cx + i * 0.1 * H.a, hc - 1.15 * H.b]], 1.6 * u, mul(col, [1.5, 1.5, 1.6])); p.stroke(ellPts(cx - 24 * u, hc - 0.95 * H.b, 0.3 * H.a, 0.2 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55"); });
    p.inkRing(dome, ow * 0.95, thickAngle(light));
    p.band([[cx - 1.06 * H.a, hc - 0.46 * H.b], [cx + 1.06 * H.a, hc - 0.46 * H.b]], lace, 0.16 * H.b, 1.4 * u);
    for (const s of [-1, 1]) p.stroke([[cx + s * 0.1 * H.a, hc - 0.8 * H.b], [cx + s * 0.55 * H.a, hc - 1.75 * H.b]], 5 * u, "#d9a845");    // maedate : crête en V
    p.ell(cx, hc - 0.7 * H.b, 0.14 * H.a, 0.14 * H.a, "#d9a845", 2 * u);
  } else if (kind === "chonmage") { // chignon de samouraï / peintre : crâne rasé, cheveux noirs sur les côtés, petit chignon en avant
    const col = O.hair || "#1e1714", dk = mul(col, [0.6, 0.6, 0.7]);
    const cap = ellPts(cx, hc - 0.28 * H.b, 1.03 * H.a, 0.78 * H.b, 180, 360, 0, 48); cap.push([cx + 1.03 * H.a, hc - 0.2 * H.b], [cx + 0.7 * H.a, hc - 0.55 * H.b], [cx - 0.7 * H.a, hc - 0.55 * H.b], [cx - 1.03 * H.a, hc - 0.2 * H.b]);
    p.shadedFill(cap, col, dk, light, H.a, 0.4); p.inkRing(cap, ow * 0.95, thickAngle(light));
    const kn = [[cx - 0.2 * H.a, hc - 0.95 * H.b], [cx + 0.2 * H.a, hc - 0.95 * H.b], [cx + 0.26 * H.a, hc - 1.4 * H.b], [cx - 0.1 * H.a, hc - 1.55 * H.b]];
    p.shadedFill(kn, col, dk, light, H.a, 0.4); p.poly(kn, null, ow * 0.9); p.band([[cx - 0.22 * H.a, hc - 1.0 * H.b], [cx + 0.22 * H.a, hc - 1.0 * H.b]], O.hatBand || "#e8d6a0", 6 * u, 1 * u);
  } else if (kind === "divehood") { // cagoule de plongée + masque relevé sur le front (Pourkoipa original)
    const col = O.hatCol || "#14a8c0", dk = mul(col, [0.55, 0.6, 0.7]);
    const hood = blobPts(cx, hc - 0.05 * H.b, { ...H, a: H.a * 1.08, b: H.b * 1.1 });
    p.shadedFill(hood, col, dk, light, H.a, 0.4); p.inkRing(hood, ow, thickAngle(light));
    const sk = O.skin ?? SKIN, fc = blobPts(cx, hc + 0.12 * H.b, { ...H, a: H.a * 0.8, b: H.b * 0.74 });
    p.shadedFill(fc, sk, mul(sk, SH_SKIN), light, H.a); p.inkRing(fc, ow * 0.9, thickAngle(light));
    const mk = rrect(cx - 0.8 * H.a, hc - 0.92 * H.b, cx + 0.8 * H.a, hc - 0.45 * H.b, 16 * u);
    p.poly(mk, "#2a3340", ow * 0.9); p.poly(rrect(cx - 0.66 * H.a, hc - 0.84 * H.b, cx + 0.66 * H.a, hc - 0.53 * H.b, 12 * u), "#a8e8f4", 2 * u);
    p.stroke(ellPts(cx - 0.3 * H.a, hc - 0.72 * H.b, 0.2 * H.a, 0.1 * H.b, 180, 300, 0, 10), 3 * u, "#ffffffaa");
  } else if (kind === "mongol") { // bonnet mongol : calotte pointue rouge sombre, large bord de fourrure
    const col = O.hatCol || "#a83a2a", dk = mul(col, [0.55, 0.5, 0.55]);
    const cone = [[cx - 0.98 * H.a, hc - 0.5 * H.b], [cx - 0.55 * H.a, hc - 1.2 * H.b], [cx + 0.05 * H.a, hc - 1.75 * H.b], [cx + 0.6 * H.a, hc - 1.2 * H.b], [cx + 0.98 * H.a, hc - 0.5 * H.b]];
    p.shadedFill(cone, col, dk, light, H.a, 0.4); p.poly(cone, null, ow);
    p.ell(cx, hc - 0.5 * H.b, 1.14 * H.a, 0.24 * H.b, O.hatBand || "#4a3626", ow);
    for (let i = -4; i <= 4; i++) p.stroke([[cx + i * 0.25 * H.a, hc - 0.4 * H.b], [cx + i * 0.25 * H.a + 3 * u, hc - 0.62 * H.b]], 1.6 * u, "#2a1e16");
  } else if (kind === "chapeauplume") { // grand chapeau 1900 à large bord, noeud, fleur et grande plume (Pourkoipa original)
    const col = O.hatCol || "#5a2a6a", dk = mul(col, [0.55, 0.5, 0.62]), ft = O.feather || "#f4efe4";
    p.ell(cx, hc - 0.52 * H.b, 1.62 * H.a, 0.3 * H.b, col, ow);                                        // large bord
    const crown = ellPts(cx, hc - 0.62 * H.b, 1.0 * H.a, 0.82 * H.b, 180, 360, 0, 40);
    p.shadedFill(crown, col, dk, light, H.a, 0.4); p.inkRing(crown, ow * 0.95, thickAngle(light));
    p.band([[cx - 0.98 * H.a, hc - 0.7 * H.b], [cx + 0.98 * H.a, hc - 0.7 * H.b]], O.hatBand || "#e8c24a", 9 * u, 1.4 * u);
    const fe = [[cx + 0.5 * H.a, hc - 1.0 * H.b], [cx + 1.1 * H.a, hc - 1.9 * H.b], [cx + 1.75 * H.a, hc - 1.7 * H.b], [cx + 1.5 * H.a, hc - 1.0 * H.b], [cx + 1.0 * H.a, hc - 0.8 * H.b]];
    p.shadedFill(fe, ft, mul(ft, [0.8, 0.78, 0.86]), light, H.a, 0.4); p.poly(fe, null, ow * 0.9);
    p.stroke([[cx + 0.6 * H.a, hc - 0.95 * H.b], [cx + 1.5 * H.a, hc - 1.65 * H.b]], 2 * u, mul(ft, [0.6, 0.58, 0.66]));
    p.ell(cx - 0.55 * H.a, hc - 0.8 * H.b, 0.22 * H.a, 0.2 * H.b, "#e0455a", 2 * u); p.ell(cx - 0.55 * H.a, hc - 0.8 * H.b, 0.08 * H.a, 0.07 * H.b, "#ffd75e", 0);
  } else if (kind === "toque") { // toque de magistrat : cylindre noir, bandeau d'hermine
    const col = O.hatCol || "#1d1a24";
    const crown = rrect(cx - 0.8 * H.a, hc - 1.42 * H.b, cx + 0.8 * H.a, hc - 0.5 * H.b, 8 * u);
    p.shadedFill(crown, col, mul(col, [0.6, 0.6, 0.7]), light, H.a, 0.4); p.poly(crown, null, ow);
    p.ell(cx, hc - 1.42 * H.b, 0.8 * H.a, 0.14 * H.b, mul(col, [1.5, 1.5, 1.6]), ow);
    p.band([[cx - 0.82 * H.a, hc - 0.62 * H.b], [cx + 0.82 * H.a, hc - 0.62 * H.b]], "#f4f1ea", 0.2 * H.b, 1 * u, "round");
    for (let i = -3; i <= 3; i++) p.dot(cx + i * 0.22 * H.a, hc - 0.62 * H.b, 2.4 * u, "#1d1a24");
  } else if (kind === "chauff") {
    const col = O.hatCol || "#26303f";
    const crown = rrect(cx - 0.86 * H.a, hc - 1.38 * H.b, cx + 0.86 * H.a, hc - 0.5 * H.b, 10 * u);
    p.shadedFill(crown, col, mul(col, [0.6, 0.62, 0.72]), light, H.a, 0.4);
    p.clip(crown, () => p.band([[cx - H.a, hc - 0.64 * H.b], [cx + H.a, hc - 0.64 * H.b]], "#14171e", 0.18 * H.b, 0.6 * u));
    p.poly(crown, null, ow);
    p.ell(cx, hc - 1.38 * H.b, 1.12 * H.a, 0.2 * H.b, mul(col, [1.15, 1.15, 1.2]), ow); // flared top
    p.ell(cx, hc - 0.5 * H.b, 0.9 * H.a, 0.12 * H.b, "#0e1016", ow, 0, 180); // visor
    p.ell(cx, hc - 0.9 * H.b, 6 * u, 6 * u, "#d9a845", 2 * u); // badge
  }
};

// ---------------- Cast v2 (Pourkoipa): bigger head, real eyes, thick brows, bigger mouth, props in hand ----------------
// Episodes can switch back to the original look with T.CAST.v2 = false (in setupCast).
export const CAST = { v2: true };
const BLUSH = "#ff8f8f";
const faceV2 = (p, cx, cy, W, expr, facing, look, lid, brim, skin, moustache, stout = false) => {
  const u = W / 100, F = FACE[expr] || FACE.neutral, fx = cx + 6 * u * facing, ey = cy - 2 * u;
  for (const side of [-1, 1]) {
    const ex = (F.eye[0] === "shock" ? 18 : 17) * u, x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    const open = kind === "dot" || kind === "small" || kind === "lid" || kind === "slit" || kind === "shock" || kind === "shockHalf" || kind === "heavy";
    if (open) {
      const rx = (kind === "shock" ? 13.5 : 11.5) * u, ry = (kind === "shock" ? 16 : 14) * u;
      const sc = ellPts(x, ey, rx, ry, 0, 360, 0, 40);
      p.poly(sc, WHITE, 0);
      const pr = (kind === "shock" ? 4.4 : kind === "small" ? 5.6 : 7) * u, px = x + look * 4.5 * u + side * 0.6 * u, py = ey + 2.2 * u;
      p.clip(sc, () => {
        p.dot(px, py, pr, INK); p.dot(px - 1.9 * u, py - 2.2 * u, 1.7 * u, WHITE);
        const cover = kind === "lid" || kind === "shockHalf" ? 0.42 : kind === "heavy" ? 0.54 : kind === "slit" ? 0.66 : 0;   // eyelid, skin colour
        if (cover) { const yL = ey - ry + 2 * ry * cover; p.poly([[x - rx - 2, ey - ry - 2], [x + rx + 2, ey - ry - 2], [x + rx + 2, yL], [x - rx - 2, yL]], skin, 0); p.stroke([[x - rx, yL], [x + rx, yL]], 2.6 * u); }
      });
      p.poly(sc, null, 2.6 * u);
    } else eye(p, kind, x, ey, u * 1.35, side, look, skin);   // happy arcs, squeeze, dash (blink), spiral
    const [dI, dO] = side > 0 && F.browR ? F.browR : F.brow, by = ey - (brim ? 19 : 23) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 10 * u, 3.5 * u, 200, 340, 4.6 * u);
    else taper(p, [x - side * 10 * u, by + dI * 1.4 * u], [x + side * 10 * u, by + dO * 1.4 * u], 6.4 * u, 3 * u);
  }
  const mx = cx + 7 * u * facing, my = cy + 25 * u;
  if (["smile", "grin", "laugh", "smile_closed", "relief", "lick"].includes(expr)) for (const s of [-1, 1]) {
    const g = p.g; g.save(); g.globalAlpha = 0.35; p.ell(fx + s * 27 * u, cy + 12 * u, 7.5 * u, 4.5 * u, BLUSH, 0); g.restore();
  }
  if (F.mouth === "smirkSide") { const s = facing || 1, k = u * 1.3;   // flat on one side, curled up on the other: the know-it-all smile
    p.stroke(curve([mx - s * 7 * k, my + 0.5 * k], [mx + s * 3 * k, my + 1.2 * k], [mx + s * 9 * k, my - 4.5 * k]), 4 * k); p.stroke([[mx + s * 9 * k, my - 4.5 * k], [mx + s * 10.5 * k, my - 3 * k]], 2.6 * k);
  } else if (F.mouth === "flat") { const k = u * 1.3; p.stroke([[mx - 8 * k, my], [mx + 8 * k, my]], 4 * k); }   // long straight line: unimpressed
  else mouth(p, F.mouth, mx, my, u * 1.3);
  if (moustache) for (const s of [-1, 1]) taper(p, [mx + s * 2 * u, cy + 15 * u], [mx + s * (stout ? 23 : 18) * u, cy + (stout ? 12.5 : 18) * u], stout ? 6.5 * u : 5.5 * u, 2 * u, moustache);
  if (expr === "nervous" || expr === "pained") { p.ell(cx + 44 * u * (facing || 1), cy - 26 * u, 4 * u, 6.5 * u, "#9fd4ff", 2.2 * u); p.dot(cx + 43 * u * (facing || 1), cy - 28 * u, 1.3 * u, WHITE); }
};
/** small props held in a hand: bill, paper, ticket, mug, flag, coin, letter, tool */
const heldProp = (p, kind, hx, hy, side, u, light) => {
  const g = p.g;
  switch (kind) {
    case "bill": { const r = rrect(hx - 22 * u, hy - 14 * u, hx + 22 * u, hy + 10 * u, 3 * u); p.poly(r, "#b9d9a0", 2.2 * u); p.ell(hx, hy - 2 * u, 7 * u, 7 * u, "#8fbf72", 1.6 * u); p.stroke([[hx - 17 * u, hy - 9 * u], [hx - 11 * u, hy - 9 * u]], 1.6 * u); break; }
    case "paper": case "letter": { const r = [[hx - 20 * u, hy - 34 * u], [hx + 18 * u, hy - 36 * u], [hx + 20 * u, hy + 8 * u], [hx - 18 * u, hy + 10 * u]]; p.poly(r, kind === "letter" ? "#f3e6c8" : "#fbfbf6", 2.4 * u);
      for (let i = 0; i < 5; i++) p.stroke([[hx - 12 * u, hy - 24 * u + i * 7 * u], [hx + 12 * u, hy - 25 * u + i * 7 * u]], 1.4 * u, "#9a8f86"); break; }
    case "ticket": { const r = rrect(hx - 18 * u, hy - 12 * u, hx + 18 * u, hy + 6 * u, 2 * u); p.poly(r, "#ffd75e", 2.2 * u); p.stroke([[hx + 8 * u, hy - 12 * u], [hx + 8 * u, hy + 6 * u]], 1.4 * u, "#b8902a"); break; }
    case "mug": { const r = rrect(hx - 12 * u, hy - 22 * u, hx + 12 * u, hy + 6 * u, 3 * u); p.poly(r, "#e8e2d6", 2.4 * u); p.arc(hx + side * 13 * u, hy - 8 * u, 6 * u, 7 * u, side > 0 ? 270 : 90, side > 0 ? 450 : 270, 2.4 * u);
      g.save(); g.globalAlpha = 0.6; p.stroke([[hx - 4 * u, hy - 28 * u], [hx - 1 * u, hy - 38 * u], [hx - 5 * u, hy - 46 * u]], 2 * u, "#ffffff"); g.restore(); break; }
    case "mugCold": { const r = rrect(hx - 12 * u, hy - 22 * u, hx + 12 * u, hy + 6 * u, 3 * u); p.poly(r, "#bcd0e6", 2.4 * u); p.arc(hx + side * 13 * u, hy - 8 * u, 6 * u, 7 * u, side > 0 ? 270 : 90, side > 0 ? 450 : 270, 2.4 * u); break; }   // mug de café froid (bleuté, sans vapeur)
    case "can": { // arrosoir (Pourkoipa original) : corps bleu, anse, long bec incliné avec pomme
      p.poly([[hx - 20 * u, hy - 26 * u], [hx + 20 * u, hy - 26 * u], [hx + 24 * u, hy + 10 * u], [hx - 24 * u, hy + 10 * u]], "#3f9ad8", 2.6 * u);
      p.arc(hx - side * 22 * u, hy - 12 * u, 11 * u, 16 * u, side > 0 ? 90 : 270, side > 0 ? 270 : 450, 3 * u);
      p.stroke([[hx + side * 20 * u, hy - 2 * u], [hx + side * 44 * u, hy - 24 * u]], 5 * u, "#2f7ab8"); p.poly([[hx + side * 42 * u, hy - 30 * u], [hx + side * 54 * u, hy - 28 * u], [hx + side * 50 * u, hy - 16 * u], [hx + side * 40 * u, hy - 20 * u]], "#9ad0f0", 2.2 * u); break; }
    case "flag": { p.stroke([[hx, hy + 10 * u], [hx, hy - 70 * u]], 3 * u, "#6b4a2a"); const f = [[hx, hy - 70 * u], [hx + side * 42 * u, hy - 62 * u], [hx, hy - 44 * u]];
      p.poly([[hx, hy - 70 * u], [hx + side * 14 * u, hy - 67 * u], [hx + side * 14 * u, hy - 47 * u], [hx, hy - 44 * u]], "#2f56a8", 0); p.poly([[hx + side * 14 * u, hy - 67 * u], [hx + side * 28 * u, hy - 64 * u], [hx + side * 28 * u, hy - 50 * u], [hx + side * 14 * u, hy - 47 * u]], "#ffffff", 0);
      p.poly([[hx + side * 28 * u, hy - 64 * u], [hx + side * 42 * u, hy - 62 * u], [hx + side * 42 * u, hy - 52 * u], [hx + side * 28 * u, hy - 50 * u]], "#d23a32", 0); p.poly([[hx, hy - 70 * u], [hx + side * 42 * u, hy - 62 * u], [hx + side * 42 * u, hy - 52 * u], [hx, hy - 44 * u]], null, 2 * u); break; }
    case "coin": p.ell(hx, hy - 6 * u, 9 * u, 9 * u, "#e9be4a", 2.2 * u); p.ell(hx, hy - 6 * u, 5 * u, 5 * u, null, 1.2 * u); break;
    case "ballBig": case "ballSmall": case "ballBigB": case "ballSmallB": { // boules d'expérience : grosse rouge / petite bleue (même poids), tenues dans la paume
      const big = kind.startsWith("ballBig"), r = (big ? 15.5 : 9) * u / 1.7 * 1.7, col = big ? "#e23d32" : "#2f7fd8", cy = hy - r * 0.85;
      p.ell(hx, cy, r, r, col, 2.6 * u); p.ell(hx - r * 0.35, cy - r * 0.38, r * 0.3, r * 0.2, "#ffffffaa", 0, 0, 360, -30); break; }
    case "stick": { p.stroke([[hx - 4 * u, hy + 20 * u], [hx + side * 6 * u, hy - 62 * u]], 9 * u, "#6a4426"); p.stroke([[hx - 4 * u, hy + 20 * u], [hx + side * 6 * u, hy - 62 * u]], 4 * u, "#9a6a3e"); p.ell(hx + side * 6 * u, hy - 64 * u, 9 * u, 8 * u, "#6a4426", 2.2 * u); break; }   // bâton / gourdin
    case "pistol": { p.poly([[hx - 8 * u, hy - 14 * u], [hx - 2 * u, hy - 14 * u], [hx + 4 * u, hy + 12 * u], [hx - 8 * u, hy + 12 * u]], "#5a3a22", 2.2 * u);   // crosse
      p.poly(rrect(hx - 10 * u, hy - 26 * u, hx + 8 * u, hy - 12 * u, 3 * u), "#3a3f48", 2.4 * u); p.poly(rrect(hx + side * 4 * u - 4 * u, hy - 24 * u, hx + side * 36 * u + 4 * u, hy - 15 * u, 2 * u), "#5a606a", 2.2 * u); break; }   // revolver de commissaire
    case "stone": { // pierre étrange du facteur (Pourkoipa original) : cailloux ocre tout en bosses, reflet clair
      p.poly([[hx - 20 * u, hy + 8 * u], [hx - 24 * u, hy - 10 * u], [hx - 12 * u, hy - 30 * u], [hx + 2 * u, hy - 24 * u], [hx + 10 * u, hy - 38 * u], [hx + 24 * u, hy - 16 * u], [hx + 22 * u, hy + 8 * u]], "#d9b27a", 2.6 * u);
      p.stroke([[hx - 10 * u, hy - 14 * u], [hx + 2 * u, hy - 4 * u], [hx + 14 * u, hy - 12 * u]], 1.8 * u, "#9a7448"); p.ell(hx - 8 * u, hy - 22 * u, 5 * u, 3 * u, "#fff2cc", 0, 0, 360, -30); break; }
    case "lantern": { // lampe à pétrole : anse, verre jaune lumineux, pied noir
      p.stroke([[hx - 12 * u, hy - 36 * u], [hx, hy - 50 * u], [hx + 12 * u, hy - 36 * u]], 2.6 * u); p.poly(rrect(hx - 15 * u, hy - 38 * u, hx + 15 * u, hy - 32 * u, 2 * u), "#2f3440", 2 * u);
      p.poly([[hx - 13 * u, hy - 32 * u], [hx + 13 * u, hy - 32 * u], [hx + 16 * u, hy + 4 * u], [hx - 16 * u, hy + 4 * u]], "#ffe27a", 2.4 * u); p.ell(hx, hy - 12 * u, 6 * u, 10 * u, "#fff8d0", 0);
      p.poly(rrect(hx - 18 * u, hy + 2 * u, hx + 18 * u, hy + 12 * u, 2 * u), "#2f3440", 2 * u); break; }
    case "tool": { p.stroke([[hx, hy + 18 * u], [hx, hy - 30 * u]], 4.5 * u, "#7a5434"); p.poly(rrect(hx - 14 * u, hy - 40 * u, hx + 14 * u, hy - 28 * u, 2 * u), "#9aa3ad", 2.2 * u); break; }
    case "brush": { p.stroke([[hx - 6 * u, hy + 16 * u], [hx + 2 * u, hy - 40 * u]], 3.6 * u, "#8a5a34"); p.poly([[hx - 1 * u, hy - 38 * u], [hx + 7 * u, hy - 38 * u], [hx + 6 * u, hy - 58 * u], [hx + 2 * u, hy - 62 * u]], "#1b1418", 2 * u); break; }
    case "bomb": { const r = 17 * u, cy = hy - r * 0.8; p.stroke([[hx, cy - r * 0.9], [hx + 3 * u, cy - r * 1.5]], 4 * u, "#e8d8a0"); p.ell(hx, cy - r * 0.95, r * 0.34, r * 0.22, "#5a3a24", 2.2 * u); p.ell(hx, cy, r, r, "#7a4a2e", 2.6 * u);
      p.stroke(ellPts(hx, cy, r, r * 0.28, 0, 360, 0, 24), 3 * u, "#c9a060"); p.ell(hx - r * 0.35, cy - r * 0.4, r * 0.28, r * 0.18, "#ffffff88", 0, 0, 360, -30); break; }
  }
};

/** front-facing Roman-era character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, nohelmet, light */
export const romanFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = O.spear ? "spear" : "hang", tilt = 0, headTilt = 0,
    bob = 0, nohelmet = false, light = rad(-120), web = false, step = 0, run = false } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const V2 = CAST.v2 && opts.v2 !== false;
  // silhouette (2026-11): O.head (head size, 0.85-1.15), O.legs (leg length, 0.8-1.25), O.thin (lanky limbs and narrow torso).
  // A tall thin character next to a small round one reads at once, even without colour.
  const headK = Math.min(1.15, Math.max(0.8, O.head ?? 1)), legsK = Math.min(1.25, Math.max(0.75, O.legs ?? 1)), thinK = O.thin ? 0.78 : 1;
  const sit = !!opts.sit;
  const H = headBlob(seed, (V2 ? 140 : 118) * headK, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = V2 ? (O.stout ? 0.9 : 0.82) : (O.stout ? 1.12 : 1.08), legsL = (V2 ? 1.08 : 1.38) * legsK * (sit ? 0.55 : 1), sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(O.tunic, INK, 0.62), armCol = mix(O.tunic, INK, 0.5);
  const helmet = !!O.helmet && !nohelmet, old = O.helmet === "old";
  p.rot = null;
  // ---- cape behind everything ----
  if (O.cape) {
    const cp = [[cx - 0.48 * W, chin + 0.08 * HH], [cx + 0.48 * W, chin + 0.08 * HH], [cx + 0.62 * W, sole - 0.55 * HH], [cx + 0.2 * W, sole - 0.45 * HH], [cx - 0.2 * W, sole - 0.5 * HH], [cx - 0.62 * W, sole - 0.55 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick);
  }
  // ---- legs ----
  const dress = !!O.dress;
  if (sit && opts.seat !== false) { // seat drawn on the card (a wooden crate by default, 'stool' for a three-legged stool)
    const sy = hipY + 0.02 * HH, sw = 0.62 * W;
    if (opts.seat === "stool") { p.poly(rrect(cx - sw * 0.8, sy - 6 * u, cx + sw * 0.8, sy + 8 * u, 4 * u), "#9a6a3e", 2.6 * u); for (const s of [-1, 0, 1]) p.stroke([[cx + s * sw * 0.55, sy + 8 * u], [cx + s * sw * 0.75, sole]], 5 * u, "#7a5130"); }
    else { const bx = rrect(cx - sw, sy - 4 * u, cx + sw, sole, 3 * u); p.poly(bx, "#b07a46", 3 * u); for (let i = 1; i < 3; i++) p.stroke([[cx - sw, sy - 4 * u + i * (sole - sy) / 3], [cx + sw, sy - 4 * u + i * (sole - sy) / 3]], 2.4 * u, "#7a5130"); p.stroke([[cx - sw, sy], [cx + sw, sole]], 3 * u, "#7a5130"); }
  }
  for (const side of [-1, 1]) {
    if (sit) { // sitting: knees apart at hip height, shins straight down in front of the seat
      const kx = cx + side * 30 * u, ky = hipY + 0.1 * HH, fx = cx + side * 26 * u, fy = sole - 4 * u;
      p.stroke(curve([cx + side * 14 * u, hipY], [cx + side * 24 * u, hipY + 0.06 * HH], [kx, ky]), 4.6 * u * thinK, legCol);
      p.stroke([[kx, ky], [fx, fy]], 4.2 * u * thinK, legCol);
      p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK); p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, "#5a3b2a");
      continue;
    }
    const ph = Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)), up = Math.max(0, Math.sin(ph)) * (run ? 62 : 30) * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u + (run && step ? Math.cos(ph) * 26 * u : 0), fy = sole - 4 * u - up;   // run: long strides, feet swing forward and back
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), (V2 ? 4.2 : 5.8) * u * thinK, legCol);
    const sandal = O.helmet ? LEATHER : "#5a3b2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, sandal);
    if (O.helmet) for (let k = 1; k <= 3; k++) p.stroke([[fx - 4 * u, fy - k * 0.07 * HH], [fx + 4 * u, fy - k * 0.07 * HH - 2 * u]], 2 * u, LEATHER);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: ((V2 ? 0.34 : 0.4) * W) / 1.06 * (O.stout ? (V2 ? 1.22 : 1.12) : 1) * (O.thin ? 0.85 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "spear": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "temple": return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]], front: false, swirl: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "shield": return { pts: [s, [X(4), s[1] + 0.4 * HH], [tcx + side * 0.6 * T.a, torsoBot - 0.1 * HH]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return { pts: [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]], front: false }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      // action poses (story beats you can SEE): carry a heavy thing in front, push, hands on the head (panic), flail (wind-milling, use opts.wv)
      case "carry": return { pts: [s, [X(10), s[1] + 0.3 * HH], [tcx + side * 0.55 * T.a, s[1] + 0.28 * HH]], front: true };
      case "push": return { pts: [s, [X(36), s[1] + 0.06 * HH], [X(78), s[1] + 0.02 * HH]], front: false };
      case "head": return { pts: [s, [X(24), s[1] - 0.28 * HH], [cx + side * (H.a * 0.55), hc - 0.78 * H.b]], front: false };
      case "flail": { const w = Math.sin((opts.wv || 0) + (side > 0 ? 0 : 2.1)); return { pts: [s, [X(26 + 10 * w), s[1] - 0.18 * HH - 0.1 * w * HH], [X(44 + 24 * w), s[1] - 0.6 * HH + 0.35 * w * HH]], front: false }; }
      // attitude poses (2026-11): shrug (arms out, palms up), chin (thinking, hand under the chin), salute, fist (raised, victory or anger),
      // show (holds a prop up towards the camera: use with holdL / holdR), knuckles (hand on the table edge, leaning: the boss)
      case "shrug": return { pts: [s, [X(18), s[1] + 0.22 * HH], [X(40), s[1] + 0.05 * HH]], front: false, palm: true };
      case "chin": return { pts: [s, [X(6), s[1] + 0.32 * HH], [cx + side * 0.22 * H.a, hc + 0.92 * H.b]], front: true };
      case "salute": return { pts: [s, [X(30), s[1] - 0.08 * HH], [cx + side * 0.78 * H.a, hc - 0.42 * H.b]], front: false };
      case "fist": return { pts: [s, [X(18), s[1] - 0.05 * HH], [X(12), s[1] - 0.52 * HH]], front: false, fist: true };
      case "show": return { pts: [s, [X(16), s[1] + 0.2 * HH], [tcx + side * 0.75 * T.a, s[1] - 0.05 * HH]], front: true };
      case "knuckles": return { pts: [s, [X(10), s[1] + 0.3 * HH], [X(16), torsoBot + 0.12 * HH]], front: false, fist: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [{ ...arm(-1, L), side: -1, hold: opts.holdL }, { ...arm(1, R), side: 1, hold: opts.holdR }];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), (V2 ? 3.9 : 5.2) * u * thinK, armCol);
    if (O.cuffs) { const [x1, y1] = a.pts[1], [x2, y2] = a.pts[2], cxx = x1 + (x2 - x1) * 0.8, cyy = y1 + (y2 - y1) * 0.8; p.dot(cxx, cyy, 4.6 * u, O.cuffs); }   // coloured cuffs
    const [hx, hy] = a.pts[2];
    if (a.hold) heldProp(p, a.hold, hx, hy, a.side, u * 1.7, light);
    const hr = (V2 ? 5 : 5.5) * u * (a.fist ? 1.25 : 1);
    if (a.palm) { p.ell(hx, hy, 7 * u, 4.5 * u, skin, 1.8 * u); for (const k of [-1, 0, 1]) p.stroke([[hx + a.side * 4 * u + k * 3 * u, hy - 3 * u], [hx + a.side * 6 * u + k * 3.5 * u, hy - 8 * u]], 2 * u); }
    else { p.dot(hx, hy, hr, V2 ? skin : INK); if (V2) p.ell(hx, hy, hr, hr, null, 1.8 * u); if (a.fist) p.stroke([[hx - 2.5 * u, hy - 1 * u], [hx + 2.5 * u, hy - 1 * u]], 1.4 * u); }
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.thumb) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 6 * u, hy - 12 * u]], 2.6 * u);
  };
  // spear behind
  if (O.spear && R === "spear") {
    const [hx, hy] = arms[1].pts[2], s0 = [hx + 2 * u, sole - 2 * u], s1 = [hx - 3 * u, 70];
    p.band([s0, s1], old ? "#6d5236" : "#8a5a34", 4.2 * u, 1.4 * u, "round");
    const tip = [[s1[0] - 7 * u, s1[1] + 6 * u], [s1[0], s1[1] - 34 * u], [s1[0] + 7 * u, s1[1] + 6 * u], [s1[0], s1[1] + 14 * u]];
    p.poly(tip, old ? "#8b7c6a" : "#c9cfd6", 2 * u);
    if (web) cobweb(p, s1[0] - 2 * u, s1[1] + 60 * u, 70 * u, u);
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso
  if (dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  }
  // skirt / pteruges below the torso
  if (!dress) {
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.0 * T.a, torsoBot + 0.3 * HH], [tcx - 1.0 * T.a, torsoBot + 0.3 * HH]];
    p.gradFill(sk, O.tunic, mul(O.tunic, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.armor) for (let i = -3; i <= 3; i++) { const x = tcx + i * 0.27 * T.a, st = [[x - 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot + 0.22 * HH], [x - 9 * u, torsoBot + 0.22 * HH]]; p.poly(st, old ? "#5e4632" : LEATHER, 1.6 * u); }
  }
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.armor) {
      const top = chin - 0.1 * HH, bot = torsoBot - 0.25 * HH, n = 5;
      for (let i = 0; i < n; i++) {
        const y0 = top + (bot - top) * i / n, y1 = top + (bot - top) * (i + 1) / n;
        const c = O.armorCols ? O.armorCols[i % 2] : old ? (i % 2 ? "#8d8679" : "#9a9384") : (i % 2 ? "#a7b0ba" : "#bcc4cc");
        p.poly([[tcx - 1.5 * T.a, y0], [tcx + 1.5 * T.a, y0 + 3 * u], [tcx + 1.5 * T.a, y1 + 3 * u], [tcx - 1.5 * T.a, y1]], c, 1.8 * u);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], LEATHER, 0.08 * HH, 1.5 * u);
      for (let i = -2; i <= 2; i++) p.dot(tcx + i * 0.3 * T.a, torsoBot - 0.2 * HH, 2.4 * u, BRASS);
      if (old) for (let i = 0; i < 5; i++) p.ell(tcx + Math.sin(i * 1.7) * 0.7 * T.a, top + (bot - top) * ((i * 0.31) % 1), 6 * u, 3 * u, "#8a4b22", 0);
    } else {
      if (O.pattern) { // fabric pattern under everything else: 'stripes' (horizontal), 'vstripes', 'checks', 'dots'
        const pc = O.patternCol || mix(O.tunic, INK, 0.28), top = chin - 0.3 * HH, bot = torsoBot + 0.1 * HH, L0 = tcx - 1.3 * T.a, R0 = tcx + 1.3 * T.a, st = 0.11 * HH;
        if (O.pattern === "stripes" || O.pattern === "checks") for (let y = top; y < bot; y += st * 2) p.poly([[L0, y], [R0, y], [R0, y + st], [L0, y + st]], pc, 0);
        if (O.pattern === "vstripes" || O.pattern === "checks") { const g = p.g; g.save(); if (O.pattern === "checks") g.globalAlpha = 0.55; for (let x = L0; x < R0; x += st * 2) p.poly([[x, top], [x + st, top], [x + st, bot], [x, bot]], pc, 0); g.restore(); }
        if (O.pattern === "dots") for (let y = top + st, i = 0; y < bot; y += st * 1.4, i++) for (let x = L0 + (i % 2) * st * 0.7; x < R0; x += st * 1.4) p.dot(x, y, 0.22 * st, pc);
      }
      if (O.lapels) for (const s of [-1, 1]) p.poly([[tcx + s * 0.06 * T.a, chin + 0.02 * HH], [tcx + s * 0.62 * T.a, chin + 0.0 * HH], [tcx + s * 0.18 * T.a, chin + 0.55 * HH]], O.lapels, 2 * u);   // jacket lapels (V opening)
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], O.apron ? "#5a3b2a" : "#e2c27a", 0.05 * HH, 1.2 * u);
      if (O.toga) p.band([[tcx - 1.0 * T.a, chin - 0.1 * HH], [tcx + 1.1 * T.a, torsoBot - 0.1 * HH]], O.toga, 0.16 * HH, 1.6 * u);
      if (O.apron) p.poly([[tcx - 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.6 * T.a, torsoBot + 0.2 * HH], [tcx - 0.6 * T.a, torsoBot + 0.2 * HH]], O.apron, 1.6 * u);
      p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
      if (O.scarf) { // écharpe : bande autour du cou + un pan qui pend
        p.band([[tcx - 0.62 * T.a, chin + 0.05 * HH], [tcx + 0.62 * T.a, chin + 0.07 * HH]], O.scarf, 0.13 * HH, 2 * u);
        p.band([[tcx + 0.3 * T.a, chin + 0.1 * HH], [tcx + 0.42 * T.a, chin + 0.5 * HH]], O.scarf, 0.1 * HH, 1.6 * u);
        p.band([[tcx + 0.3 * T.a, chin + 0.38 * HH], [tcx + 0.46 * T.a, chin + 0.4 * HH]], "#f3e6c8", 0.03 * HH, 0);
      }
      if (O.strap) { // sacoche de facteur : bandoulière en cuir + sac sur la hanche
        p.band([[tcx - 0.7 * T.a, chin + 0.04 * HH], [tcx + 0.9 * T.a, torsoBot - 0.1 * HH]], O.strap, 0.07 * HH, 1.6 * u);
        p.poly([[tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 1.5 * T.a, torsoBot - 0.2 * HH], [tcx + 1.55 * T.a, torsoBot + 0.3 * HH], [tcx + 0.5 * T.a, torsoBot + 0.3 * HH]], O.strap, 2 * u);
        p.band([[tcx + 0.55 * T.a, torsoBot - 0.05 * HH], [tcx + 1.5 * T.a, torsoBot - 0.05 * HH]], "#e8c45a", 0.04 * HH, 1.2 * u);
      }
      if (O.bowtie) { // nœud papillon
        const by = chin + 0.1 * HH, bw = 0.34 * T.a;
        p.poly([[tcx, by], [tcx - bw, by - 0.09 * HH], [tcx - bw, by + 0.09 * HH]], O.bowtie, 2 * u); p.poly([[tcx, by], [tcx + bw, by - 0.09 * HH], [tcx + bw, by + 0.09 * HH]], O.bowtie, 2 * u); p.dot(tcx, by, 4 * u, O.bowtie);
      }
      if (O.coat) { // capote: two rows of buttons, belt, collar
        for (const s of [-1, 1]) for (let i = 0; i < 4; i++) p.dot(tcx + s * 0.2 * T.a, chin + (0.2 + i * 0.17) * HH, 2.6 * u, "#d9a845");
        p.band([[tcx - 1.4 * T.a, torsoBot - 0.34 * HH], [tcx + 1.4 * T.a, torsoBot - 0.34 * HH]], "#3a2a22", 0.07 * HH, 1.2 * u);
        p.dot(tcx, torsoBot - 0.34 * HH, 4 * u, "#d9a845");
      }
      if (O.buttons) for (let i = 0; i < 4; i++) p.dot(tcx, chin + (0.22 + i * 0.16) * HH, 2.8 * u, O.buttons);   // single row of buttons
      if (O.sash) { // diagonal sash from the shoulder to the hip (officer, mayor, champion)
        p.band([[tcx - 0.95 * T.a, chin + 0.02 * HH], [tcx + 1.0 * T.a, torsoBot - 0.12 * HH]], O.sash, 0.13 * HH, 1.8 * u);
        p.band([[tcx - 0.95 * T.a, chin + 0.02 * HH], [tcx + 1.0 * T.a, torsoBot - 0.12 * HH]], mix(O.sash, "#ffffff", 0.45), 0.02 * HH, 0);
      }
      if (O.belt) { p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], O.belt, 0.075 * HH, 1.6 * u);   // belt + big buckle
        p.poly(rrect(tcx - 7 * u, torsoBot - 0.2 * HH - 6 * u, tcx + 7 * u, torsoBot - 0.2 * HH + 6 * u, 1.5 * u), BRASS, 2 * u); p.poly(rrect(tcx - 3 * u, torsoBot - 0.2 * HH - 2.5 * u, tcx + 3 * u, torsoBot - 0.2 * HH + 2.5 * u, 1 * u), O.belt, 0); }
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.medals) for (let i = 0; i < Math.min(4, O.medals); i++) { // medals pinned on the chest: ribbon + disc
    const mx = tcx - 0.55 * T.a + i * 0.2 * T.a * (O.medals > 2 ? 1 : 1.4), my = chin + 0.26 * HH, rc = ["#d23a32", "#2f6fd0", "#f0c419", "#2fa86a"][i % 4];
    p.poly([[mx - 4 * u, my - 6 * u], [mx + 4 * u, my - 6 * u], [mx + 4 * u, my + 4 * u], [mx - 4 * u, my + 4 * u]], rc, 1.6 * u);
    p.ell(mx, my + 9 * u, 5.5 * u, 5.5 * u, i % 2 ? "#c9cfd6" : BRASS, 1.8 * u); p.ell(mx - 1.6 * u, my + 7.4 * u, 1.6 * u, 1.1 * u, "#ffffffaa", 0);
  }
  if (O.epaulettes) for (const s of [-1, 1]) { // officer shoulder boards with a fringe
    const ex = tcx + s * 0.78 * T.a, ey = chin + 0.07 * HH;
    for (let k = -3; k <= 3; k++) p.stroke([[ex + k * 3.2 * u, ey + 2 * u], [ex + k * 3.4 * u, ey + 13 * u]], 2.2 * u, BRASS);
    p.ell(ex, ey, 0.34 * T.a, 0.07 * HH, O.epaulettes, 2 * u);
  }
  if (O.armor) for (const s of [-1, 1]) { // shoulder plates
    const sp = ellPts(tcx + s * 0.72 * T.a, chin + 0.1 * HH, 0.42 * T.a, 0.13 * HH, 180, 360, s * 8, 20);
    p.poly(sp, O.armorCols ? O.armorCols[0] : old ? "#9a9384" : "#c5ccd3", 1.8 * u);
  }
  if (O.moss) {/* reserved */}
  for (const a of arms) if (a.front) drawArm(a);
  // shield in front, held by the left hand
  if (O.shield && L === "shield") {
    const sx = tcx - 0.55 * T.a, sy = torsoBot + 0.05 * HH, sw = 0.36 * W, sh = 0.78 * HH;
    const sp = rrect(sx - sw, sy - sh, sx + sw, sy + sh, 8 * u);
    p.gradFill(sp, "#c0302c", "#7d1d22", light);
    p.clip(sp, () => {
      p.band([[sx - sw, sy], [sx + sw, sy]], BRASS, 6 * u, 1.2 * u);
      p.band([[sx, sy - sh], [sx, sy + sh]], BRASS, 6 * u, 1.2 * u);
      for (const s of [-1, 1]) { p.stroke([[sx + s * 12 * u, sy - 14 * u], [sx + s * 34 * u, sy - 46 * u], [sx + s * 22 * u, sy - 44 * u], [sx + s * 46 * u, sy - 74 * u]], 3.5 * u, BRASS); p.stroke([[sx + s * 12 * u, sy + 14 * u], [sx + s * 34 * u, sy + 46 * u], [sx + s * 22 * u, sy + 44 * u], [sx + s * 46 * u, sy + 74 * u]], 3.5 * u, BRASS); }
      p.stroke(ellPts(sx - sw * 0.5, sy - sh * 0.7, sw * 0.3, sh * 0.1, 200, 320, 0, 10), 3 * u, "#ffffff44");
    });
    p.ell(sx, sy, 13 * u, 13 * u, "#e6c068", 2.2 * u);
    p.inkRing(sp, ow, thick);
  }
  if (O.pet === "parrot" || O.pet === "pigeon") { // a companion on the shoulder: instantly memorable silhouette
    const sd = O.petSide ?? 1, [px0, py0] = S(sd), bx = px0 + sd * 6 * u, by = py0 - 22 * u, col = O.petCol || (O.pet === "parrot" ? "#2fae4a" : "#8a93a6");
    p.poly([[bx - sd * 4 * u, by + 14 * u], [bx - sd * 16 * u, by + 46 * u], [bx - sd * 6 * u, by + 44 * u]], O.pet === "parrot" ? "#2f6fd0" : mix(col, INK, 0.3), 2 * u);   // tail
    p.ell(bx, by + 6 * u, 13 * u, 17 * u, col, 2.6 * u);                                                   // body
    p.ell(bx + sd * 4 * u, by - 12 * u, 10.5 * u, 10 * u, O.pet === "parrot" ? "#e23d32" : col, 2.6 * u);   // head
    p.poly([[bx + sd * 12 * u, by - 15 * u], [bx + sd * 22 * u, by - 9 * u], [bx + sd * 12 * u, by - 6 * u]], "#f0c419", 2 * u);   // beak
    p.dot(bx + sd * 7 * u, by - 14 * u, 3.4 * u, WHITE); p.dot(bx + sd * 7.8 * u, by - 14 * u, 1.8 * u, INK);
    p.arc(bx - sd * 2 * u, by + 6 * u, 7 * u, 9 * u, sd > 0 ? 100 : 260, sd > 0 ? 250 : 410, 2 * u);       // wing
  }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (helmet) galea(p, H, cx, hc, light, thick, ow, old, u);
  const hp = blobPts(cx, hc, H);
  if (O.hair && !helmet && !O.hat) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (helmet) {
    const bandY = hc - H.b * 0.42, bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
    p.shadedFill(bp, old ? "#8f8a7e" : STEEL, mul(old ? "#8f8a7e" : STEEL, [0.62, 0.64, 0.72]), light, H.a, 0.4);
    p.clip(bp, () => { p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff66");
      if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
    p.poly(bp, null, ow * 0.9);
    p.band([[cx - H.a * 1.05, bandY], [cx + H.a * 1.05, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
    p.poly(rrect(cx - 4 * u, bandY - 0.55 * H.b, cx + 4 * u, bandY - 3 * u, 2 * u), old ? "#a88a4a" : BRASS, 1.5 * u);
    cheeks(p, H, cx, hc, light, ow, old, u);
  } else if (O.hat === "adrian" || O.hat === "kepi" || O.hat === "chauff" || O.hat === "bonnet" || O.hat === "minerH" || O.hat === "pickel" || O.hat === "kabuto" || O.hat === "chonmage" || O.hat === "divehood" || O.hat === "mongol" || O.hat === "chapeauplume" || O.hat === "toque") headgear(p, O.hat, O, H, cx, hc, light, ow, u);
  else if (O.hat === "tophat") hatOn(p, { hat: "tophat", jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.helmet && nohelmet) { // bald old head with white side tufts
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.1 * H.b, 0.22 * H.a, 0.3 * H.b, "#f4f1ea", 3 * u);
  }
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.75 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, "#c9c4bb"); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  (V2 ? faceV2 : faceFront)(p, cx, hc, W, expr, facing, look, lid, helmet || !!O.hat || !!O.cap, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (O.plume) { // feather on the hat / helmet: O.plumeAt = [dx, dy] in head units (default: side of the hat brim)
    const [pdx, pdy] = O.plumeAt || [0.62, -1.05], px = cx + pdx * H.a, py = hc + pdy * H.b, sd = Math.sign(pdx) || 1;
    const sp = curve([px, py], [px + sd * 18 * u, py - 40 * u], [px + sd * 46 * u, py - 62 * u]);
    const n = sp.length, outline = [...sp.map(([x, y], i) => [x - sd * 8 * u * Math.sin(Math.PI * i / (n - 1)), y - 4 * u * Math.sin(Math.PI * i / (n - 1))]), ...sp.slice().reverse().map(([x, y], j) => { const i = n - 1 - j; return [x + sd * 8 * u * Math.sin(Math.PI * i / (n - 1)), y + 4 * u * Math.sin(Math.PI * i / (n - 1))]; })];
    p.poly(outline, O.plume, 2.4 * u); p.stroke(sp, 1.6 * u, mix(O.plume, INK, 0.35));
  }
  if (O.glasses) { // lorgnons / round spectacles: two thin rings and a bridge
    const gy = hc - 2 * u, gx = cx + 6 * u * facing;
    for (const sd of [-1, 1]) p.stroke(ellPts(gx + sd * 17 * u, gy, 16 * u, 16.5 * u, 0, 360, 0, 32), 3 * u, O.glasses === true ? "#3a2a22" : O.glasses);
    p.stroke([[gx - 1.5 * u, gy - 2 * u], [gx + 1.5 * u, gy - 2 * u]], 2.6 * u, O.glasses === true ? "#3a2a22" : O.glasses);
  }
  if (O.blind) { // blindfold: dark band across the eyes with a knot at the side
    const by = hc - 2 * u, bd = rrect(cx - 0.97 * H.a, by - 13 * u, cx + 0.97 * H.a, by + 13 * u, 5 * u);
    p.poly(bd, O.blind === true ? "#2b2b36" : O.blind, 3 * u);
    p.stroke([[cx - 1.0 * H.a, by - 6 * u], [cx - 1.25 * H.a, by - 20 * u]], 5 * u, O.blind === true ? "#2b2b36" : O.blind);
    p.stroke([[cx - 1.0 * H.a, by + 4 * u], [cx - 1.3 * H.a, by + 6 * u]], 5 * u, O.blind === true ? "#2b2b36" : O.blind);
  }
  if (O.beard) { // re-draw the mouth over the beard for open mouths
    if (expr === "shock" || expr === "snore") p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  }
  p.rot = null;
  if (arms.some((a) => a.swirl)) { // cuckoo swirl next to the temple
    const a = arms.find((x) => x.swirl), [hx, hy] = a.pts[2], ph = opts.swirl || 0, pts = [];
    for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 4 + ph, r = (4 + i * 0.7) * u; pts.push([hx + Math.cos(t) * r, hy - 40 * u + Math.sin(t) * r]); }
    p.stroke(pts, 3 * u, "#ffffff"); p.stroke(pts, 1.4 * u, INK);
  }
};

/** loose helmet prop card (lifted off the old soldier) */
export const helmetCard = (p) => {
  const H = headBlob(3, 118, 0), u = 2 * H.a / 100, hc = 560, light = rad(-120), thick = thickAngle(light), ow = 5 * u;
  galea(p, H, 300, hc, light, thick, ow, true, u);
  const bandY = hc - H.b * 0.42, bp = ellPts(300, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  // dark inside visible from below
  p.ell(300, bandY, H.a * 1.05, 0.12 * H.b, "#2a221e", 0);
  p.shadedFill(bp, "#8f8a7e", mul("#8f8a7e", [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => { for (let i = 0; i < 9; i++) p.ell(300 + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
  p.poly(bp, null, ow * 0.9);
  p.band([[300 - H.a * 1.05, bandY], [300 + H.a * 1.05, bandY]], "#a88a4a", 7 * u, 1.8 * u, "round");
  cheeks(p, H, 300, hc, light, ow, true, u);
};

/** ZZZ for the sleeping guard */
export const fxZ = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
/** falling leaf */
export const fxLeaf = (p, col) => { p.poly([[300, 380], [420, 470], [300, 620], [180, 470]], col, 14); p.stroke([[300, 400], [300, 600]], 8); };
/** dust cloud puff (k 0..1 growth) */
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
export const fxDrip = (p) => p.ell(300, 500, 40, 64, "#9fd4ff", 10);
export const fxWood = (p, seed) => { p.poly([[200, 420], [400, 400], [420, 560], [230, 600]], "#5b3d22", 14); p.stroke([[240, 450], [380, 440]], 6, "#3a2614"); p.ell(330, 520, 26, 18, "#4d7a32", 0); };

export const headCenter = (seed = 3) => { const v = CAST.v2, H = headBlob(seed, v ? 140 : 118, 0), HH = 2 * H.b; return 975 - (v ? 1.08 : 1.38) * HH - (v ? 0.82 : 1.08) * HH - H.b; };

/** Foreground prop card (use with motion.js fgCard): one big object drawn on its own card, to pass blurred in front of the lens.
 *  kind: any held prop (coin, bill, lantern, mug, flag, bomb, letter, ticket, stone, stick...) or 'leaves' (a branch framing the corner). */
export const fgProp = (kind, o = {}) => (p) => {
  if (kind === "leaves") { // a leafy branch coming from the bottom corner: pointed oval leaves with a vein, three greens
    const r = (i) => { const x = Math.sin(i * 91.7 + (o.seed || 1) * 13.1) * 43758.5; return x - Math.floor(x); };
    const br = curve([40, 1000], [170, 820], [330, 660]); p.stroke(br, 16, "#5a3d26");
    for (let i = 0; i < 11; i++) { const t = 0.15 + 0.85 * i / 10, j = Math.min(br.length - 1, Math.round(t * (br.length - 1))), [bx, by] = br[j], sd = i % 2 ? 1 : -1;
      const a = -Math.PI / 4 + sd * (0.7 + 0.4 * r(i)), len = 120 + 50 * r(i + 9), wd = 0.38 * len;
      const tip = [bx + Math.cos(a) * len, by + Math.sin(a) * len], nx = -Math.sin(a), ny = Math.cos(a), pts = [];
      for (let k = 0; k <= 16; k++) { const q = k / 16, w = Math.sin(Math.PI * q) * wd / 2; pts.push([bx + Math.cos(a) * len * q + nx * w, by + Math.sin(a) * len * q + ny * w]); }
      for (let k = 16; k >= 0; k--) { const q = k / 16, w = Math.sin(Math.PI * q) * wd / 2; pts.push([bx + Math.cos(a) * len * q - nx * w, by + Math.sin(a) * len * q - ny * w]); }
      p.poly(pts, ["#4f8a38", "#6fae45", "#3f7a30"][i % 3], 7); p.stroke([[bx, by], tip], 3, "#2f5a24"); }
    return;
  }
  heldProp(p, kind, 300, 640, 1, o.u ?? 5.2, rad(-120));
};
