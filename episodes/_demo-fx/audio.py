"""Demo: music bed only; every sound effect comes from tools/autosfx.py (events.json)."""
from synth import *
DUR = 360 / 30
music, sfx = init(DUR)
beat = 60 / 112
for k in range(int(DUR / (beat / 2))):
    t = k * beat / 2; m = [57, 60, 64, 60, 55, 59, 62, 59][k % 8]
    place(music, pluck(midi(m), 0.3, 0.45), t, 0.3)
    if k % 4 == 0: place(music, drum("kick"), t, 0.35)
    if k % 4 == 2: place(music, drum("snare"), t, 0.15)
music[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))
write_stems()
