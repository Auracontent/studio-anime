"""Musique + bruitages narratifs pour « Le gâteau de Malo »."""
from synth import *
DUR = 1145 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
BPM = 96; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (53, [60, 65, 69]), (55, [59, 62, 67]), (48, [60, 64, 67])]
def bed(t0, t1, gain=1.0, minor=False, bright=0.5):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        if minor: ch = [c - 1 if i == 1 else c for i, c in enumerate(ch)]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            if b == 0: place(music, pluck(midi(root), 0.6, 0.4), tb, 0.3 * gain)
            place(music, pluck(midi(ch[b % 3] + 12), 0.4, bright), tb, 0.12 * gain)
        bar += 1; tt += beat * 4
bed(0, F(310), 0.9, False, 0.5)
bed(F(310), F(470), 0.8, True, 0.3)
bed(F(540), DUR - 0.05, 1.0, False, 0.6)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
place(sfx, pop(), F(4), 0.3)                                   # le gâteau s'affaisse
place(sfx, click(), F(240), 0.4)                               # la porte du four
place(sfx, thud(), F(272), 0.45); place(sfx, gasp(), F(268), 0.3)   # il retombe
place(sfx, sting(), F(473), 0.8)                               # « Sauf que… »
place(sfx, ting(), F(600), 0.3); place(sfx, ting(), F(700), 0.35)   # la bouchée, « délicieux »
place(sfx, pop(), F(930), 0.3)                                 # Malo sourit
write_stems()
