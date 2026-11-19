"""Music bed + SFX cues for "Les taxis de la Marne". Run: python3 tools/run_audio.py episodes/<slug>  (writes music.wav, sfx.wav)."""
from synth import *
DUR = 2066 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# ---- music: jaunty Parisian march in A minor / C major until "Sauf que…", then a cool drone, then the march returns ----
BPM = 108; beat = 60 / BPM
prog = [(45, [57, 60, 64]), (41, [57, 60, 65]), (36, [55, 60, 64]), (40, [56, 59, 64])]  # Am F C E
def bed(t0, t1, gain=1.0, bright=0.5):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            place(music, drum("kick"), tb, 0.3 * gain if b % 2 == 0 else 0)
            if b % 2: place(music, drum("snare"), tb, 0.14 * gain)
            place(music, pluck(midi(root + (12 if b == 2 else 0)), 0.35, 0.4), tb, 0.36 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.18, bright), tb + beat / 2, 0.15 * gain)
        bar += 1; tt += beat * 4
PIVOT = F(1349) - 0.05
bed(0, PIVOT)
# the night convoy (891-1160): lower, tenser, no snare
i0 = int(F(891) * SR); i1 = int(F(1161) * SR); music[i0:i1] *= 0.55
# silence on the pivot, then a cool arpeggio + drone for the historian
i0 = int(PIVOT * SR); i1 = int(F(1597) * SR); music[i0:i1] *= 0
for k in range(int((F(1597) - F(1360)) / (beat / 2))):
    m = [69, 72, 76, 81, 76, 72][k % 6]; place(music, pluck(midi(m), 0.5, 0.35), F(1360) + k * beat / 2, 0.12)
dn = int((F(1597) - F(1360)) * SR); td = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * midi(45) * td) + 0.5 * np.sin(2 * np.pi * midi(52) * td)) * np.minimum(1, td / 1.0) * np.minimum(1, (F(1597) - F(1360) - td) / 0.4)
place(music, lp_fast(drone.astype(np.float32), 500), F(1360), 0.1)
# "En fait…": the march comes back, brighter, to the end
bed(F(1597), DUR, 1.0, 0.65)
music[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))

# ---- sfx ----
place(sfx, whoosh(0.5), F(0), 0.2)
for k in range(8): place(sfx, click(), F(160) + k * 0.33, 0.7)          # the meter ticks on
place(sfx, ting(), F(205), 0.3)
place(sfx, whoosh(0.6), F(245), 0.3)                                    # to the map
place(sfx, thunk(90, 0.25), F(330), 0.4)                                # German arrow lands
place(sfx, chug(2.6), F(500), 0.4)                                      # slow train
place(sfx, whistle(0.7), F(540), 0.15)
place(sfx, ting(), F(586), 0.5)                                         # the idea
for k in range(5): place(sfx, engine(0.9, 60), F(630) + k * 0.33, 0.25) # cabs pass
place(sfx, whoosh(0.6), F(676), 0.5)                                    # to the night
place(sfx, whistle(0.5), F(700), 0.35)                                  # police whistle
place(sfx, thunk(120, 0.2), F(742), 0.5)                                # client pops out
place(sfx, whoosh(0.5), F(787), 0.3)
place(sfx, engine(3.0, 52), F(891), 0.5)                                # the convoy
for fr in [905, 940, 975]: place(sfx, whoosh(0.7), F(fr), 0.35)
place(sfx, engine(2.0, 48), F(996), 0.3)
place(sfx, thunk(70, 0.3), F(1060), 0.4)                                # soldiers squeezed in
for k in range(3): place(sfx, whoosh(0.5), F(1090) + k * 0.35, 0.4)     # cabs rush by the sign
place(sfx, whoosh(0.5), F(1158), 0.4)                                   # to the dawn
for k in range(10): place(sfx, click(), F(1205) + k * 0.15, 0.6)        # meter ticking
place(sfx, ting(), F(1318), 0.4)                                        # note handed over
place(sfx, sting(), F(1349), 0.8)                                       # "Sauf que…"
place(sfx, whoosh(0.5), F(1408), 0.3)
place(sfx, thunk(60, 0.4), F(1458), 0.3)                                # the crowd, heavy
place(sfx, creak(0.5, 110), F(1530), 0.25)
place(sfx, whoosh(0.5), F(1594), 0.3)
place(sfx, engine(2.0, 58), F(1700), 0.3)                               # cabs pass in the villages
place(sfx, whoosh(0.6), F(1768), 0.3)
place(sfx, ting(), F(1888), 0.25)
place(sfx, whoosh(0.5), F(1928), 0.3)
place(sfx, thunk(150, 0.18), F(2033), 0.7); place(sfx, ting(), F(2034), 0.5)  # "facturée": stamp
write_stems()
