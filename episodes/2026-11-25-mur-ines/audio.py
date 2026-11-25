"""Musique + bruitages narratifs pour « Le mur d'Inès »."""
from synth import *
DUR = 1800 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
BPM = 112; beat = 60 / BPM
prog = [(45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62]), (45, [57, 60, 64])]
def bed(t0, t1, gain=1.0, minor=False, bright=0.5):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        if minor: ch = [c - 1 if i == 1 else c for i, c in enumerate(ch)]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            if b % 2 == 0: place(music, pluck(midi(root), 0.5, 0.4), tb, 0.3 * gain)
            place(music, pluck(midi(ch[b % 3] + 12), 0.3, bright), tb, 0.12 * gain)
        bar += 1; tt += beat * 4
bed(0, F(898), 1.0, False, 0.5)
bed(F(898), F(1130), 0.7, True, 0.25)
bed(F(1150), DUR - 0.05, 1.0, False, 0.6)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
for f in (30, 70, 118, 140): place(sfx, click(), F(f), 0.35)        # briques posées
place(sfx, thud(), F(1002), 0.3)                                    # le mur tremble
place(sfx, thud(), F(1090), 0.55); place(sfx, thud(), F(1110), 0.5)  # l'écroulement
place(sfx, sting(), F(1135), 0.8)                                   # « Sauf que… »
place(sfx, ting(), F(1395), 0.35); place(sfx, ting(), F(1540), 0.3)  # les clés, « montre-moi »
place(sfx, click(), F(1770), 0.4)                                   # la dernière brique
write_stems()
