// Demo world for the new engine features (fx3d, moods, follow camera, actions): the lighthouse set + a small boat on the animated sea.
import { buildPhare, IX } from '../library/phare.js';
import { propKit } from '../library/props.js';
import { waveHeight } from '../fx3d.js';
export async function buildWorld(ctx) {
  const { THREE, world, add, box, toon } = ctx;
  const F = buildPhare(ctx), K = propKit(ctx, { seed: 7 });
  F.water.visible = false;                       // the animated sea of fx3d replaces the flat water
  K.verge(-14, 14, -6, 11, { density: 3, avoid: (x, z) => Math.hypot(x, z + 10) < 7.5 });
  K.barrel(-3, -2.5); K.crate(-4.5, -2); K.lamp(5.5, 1, { h: 3 });
  for (const x of [-4, 0, 4, 8]) K.backdrop([IX + x, 0, 0.3], 0, { kinds: ['crate', 'barrel', 'sack'], n: 4, near: 3.4, far: 4.8, spread: 0.6 });
  // forge corner in the workshop (sparks / embers / smoke)
  const forge = new THREE.Group(); forge.position.set(IX + 18, 0, -3); world.add(forge);
  add(box(1.8, 1.0, 1.2), toon({ color: '#6a5a50' }), 0, 0.5, 0, forge); add(box(1.4, 0.15, 0.9), new THREE.MeshBasicMaterial({ color: '#ff7a2a' }), 0, 1.05, 0, forge, { cast: false });
  add(box(0.9, 1.8, 0.8), toon({ color: '#4a3e38' }), 0, 2.2, -0.2, forge); add(box(0.7, 0.35, 0.4), toon({ color: '#3a3a40' }), 1.4, 0.9, 0.3, forge);
  // boat
  const boat = new THREE.Group(); world.add(boat);
  add(box(4.4, 0.8, 1.6), toon({ color: '#c8643a' }), 0, 0.25, 0, boat); add(box(4.6, 0.12, 1.8), toon({ color: '#efe6cf' }), 0, 0.68, 0, boat);
  add(box(0.12, 3.6, 0.12), toon({ color: '#5a3b22' }), 0, 2.4, 0, boat);
  const sail = add(new THREE.PlaneGeometry(1.9, 2.6), toon({ color: '#f4ecd8', side: THREE.DoubleSide }), 0.95, 2.6, 0, boat); sail.rotation.y = Math.PI / 2 * 0.15;
  const state = (S, f) => {
    F.state(S, f);
    const b = S.boat || [14, 0, 26], amp = S.seaAmp ?? 0.3, y = waveHeight(b[0], b[2], f, amp) - 0.45;
    const dz = waveHeight(b[0], b[2] + 1.5, f, amp) - waveHeight(b[0], b[2] - 1.5, f, amp), dx = waveHeight(b[0] + 2, b[2], f, amp) - waveHeight(b[0] - 2, b[2], f, amp);
    boat.position.set(b[0], y, b[2]); boat.rotation.set(Math.atan2(dz, 3) * 0.8, 0.5, -Math.atan2(dx, 4) * 0.8);
  };
  return { DECK: 0, clouds: F.clouds, state, onLight: () => {} };
}
