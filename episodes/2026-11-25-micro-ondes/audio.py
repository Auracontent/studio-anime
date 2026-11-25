"""Musique + bruitages narratifs pour « Le micro-ondes de Percy Spencer »."""
from synth import *
DUR = 1566 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
BPM = 120; beat = 60 / BPM
prog = [(45, [57, 60, 64]), (43, [55, 59, 62]), (41, [57, 60, 65]), (43, [55, 59, 62])]
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
bed(0, F(983), 1.0, False, 0.5)
bed(F(1000), F(1253), 0.7, True, 0.25)
bed(F(1260), DUR - 0.05, 1.0, False, 0.6)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
for f in (0, 380): place(sfx, pop(), F(f), 0.4)                                  # chocolat qui coule
for f in (548, 566, 584, 600, 612, 626): place(sfx, pop(), F(f), 0.4)            # popcorn
place(sfx, thud(), F(766), 0.5); place(sfx, bonk(), F(772), 0.4)                 # l'œuf explose, Walt tombe
place(sfx, ting(), F(842), 0.4)                                                  # l'idée
place(sfx, bonk(), F(926), 0.3); place(sfx, bonk(), F(942), 0.3)                 # marteau
place(sfx, sting(), F(990), 0.8)                                                 # « Sauf que… »
place(sfx, thud(), F(1140), 0.4)                                                 # le four qu'on pousse
place(sfx, ting(), F(1345), 0.35); place(sfx, ting(), F(1500), 0.3)
write_stems()
