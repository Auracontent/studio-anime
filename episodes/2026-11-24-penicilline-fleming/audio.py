"""Musique + bruitages narratifs pour « La pénicilline de Fleming ». Run: python3 tools/run_audio.py episodes/<slug>"""
from synth import *
DUR = 1267 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique : piano pincé léger et curieux, silence sur « Sauf que », plus doux ensuite
BPM = 100; beat = 60 / BPM
walk = [60, 64, 67, 64, 62, 65, 69, 65, 59, 62, 67, 62, 60, 64, 67, 72]
def bed(t0, t1, gain=1.0, minor=False, bright=0.5):
    tt = t0; i = 0
    while tt < t1:
        n = walk[i % len(walk)] - (1 if minor and i % 4 == 1 else 0)
        place(music, pluck(midi(n - 12), 0.5, 0.4), tt, 0.28 * gain)
        if i % 2 == 1: place(music, pluck(midi(n), 0.3, bright), tt, 0.13 * gain); place(music, pluck(midi(n + 4), 0.3, bright), tt + 0.02, 0.1 * gain)
        tt += beat; i += 1
bed(0, F(798) - 0.05, 0.9, False, 0.5)
bed(F(798) + 0.2, F(1021), 0.85, True, 0.3)
bed(F(1021), DUR - 0.05, 1.0, False, 0.5)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
place(sfx, gasp(), F(8), 0.3)                                  # ouverture : choc
place(sfx, pop(), F(165), 0.3)                                 # carte « 1928 »
for fr in range(230, 290, 9): place(sfx, pop(), F(fr), 0.15)   # les boîtes se posent
place(sfx, pop(), F(335), 0.3)                                 # « vacances »
place(sfx, gasp(), F(522), 0.3); place(sfx, ting(), F(560), 0.35)   # le cercle vide
place(sfx, gasp(), F(624), 0.3)                                # Fleming comprend
for fr in (668, 677, 686, 695): place(sfx, boing(), F(fr), 0.15)  # les microbes tombent
place(sfx, ting(), F(735), 0.5); place(sfx, pop(), F(736), 0.3)   # pénicilline
place(sfx, sting(), F(798), 0.8)                               # « Sauf que… »
for fr in range(910, 950, 5): place(sfx, pop(), F(fr), 0.1)    # le calendrier défile
place(sfx, ting(), F(950), 0.4)
place(sfx, ting(), F(1036), 0.4); place(sfx, pop(), F(1033), 0.3)  # Nobel
place(sfx, ting(), F(1250), 0.35)
write_stems()
