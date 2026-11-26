"""Musique + bruitages narratifs pour « Léo et le costume de soleil »."""
from synth import *
DUR = 1656 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
BPM = 116; beat = 60 / BPM
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
            if b % 2 == 0: place(music, drum("kick"), tb, 0.25 * gain)
            else: place(music, drum("snare"), tb, 0.1 * gain)
        bar += 1; tt += beat * 4
bed(0, F(497), 1.0, False, 0.5)
bed(F(497), F(659), 0.6, True, 0.25)          # le doute, Lila dort
bed(F(659), F(960), 1.0, False, 0.55)
bed(F(960), F(1033), 0.45, True, 0.2)         # les poings serrés : la musique retient son souffle
bed(F(1038), DUR - 0.05, 1.15, False, 0.7)    # le Climax repart plus fort
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
for f in (8, 26, 44, 62): place(sfx, click(), F(f), 0.3)            # l'aiguille pique le tissu (accroche)
place(sfx, click(), F(236), 0.4); place(sfx, ting(), F(262), 0.25)  # il pique, le doigt
for f in range(372, 384, 6): place(sfx, click(), F(f), 0.25)        # tic-tac de l'horloge (minuit)
place(sfx, thud(), F(470), 0.4)                                     # le rayon tombe
for f in (705, 715, 725, 735, 745): place(sfx, click(), F(f), 0.3)  # un point après l'autre
place(sfx, sting(), F(1038), 0.8)                                   # « Sauf que… »
place(sfx, ting(), F(1425), 0.3)                                    # les pansements
place(sfx, click(), F(1640), 0.4)                                   # prends l'aiguille
write_stems()
