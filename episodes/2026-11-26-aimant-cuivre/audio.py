"""Musique + bruitages narratifs pour « L'aimant dans le tube de cuivre ». Run: python3 tools/run_audio.py episodes/<slug>"""
from synth import *
DUR = 1745 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique rapide (120 BPM) : basse pincée + accords, coupée une seconde avant « Sauf que », plus forte ensuite
BPM = 120; beat = 60 / BPM
walk = [57, 60, 64, 60, 55, 59, 62, 59, 53, 57, 60, 57, 55, 59, 62, 67]
def bed(t0, t1, gain=1.0, bright=0.5):
    tt = t0; i = 0
    while tt < t1:
        n = walk[i % len(walk)]
        place(music, pluck(midi(n - 12), 0.4, 0.4), tt, 0.3 * gain)
        if i % 2 == 1: place(music, pluck(midi(n), 0.25, bright), tt, 0.14 * gain); place(music, pluck(midi(n + 4), 0.25, bright), tt + 0.02, 0.1 * gain)
        tt += beat; i += 1
bed(0, F(820), 0.95); bed(F(852), F(1403), 1.1, 0.7); bed(F(1415), DUR - 0.05, 0.9, 0.5)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
place(sfx, thud(), F(159), 0.5)                                   # l'aimant tombe d'un coup dans le plastique
place(sfx, pop(), F(122), 0.3)                                    # l'aimant apparaît en haut du tube
place(sfx, pop(), F(520), 0.3)                                    # carte « 1855 »
place(sfx, sting(), F(836), 0.8)                                  # « Sauf que rien ne frotte »
place(sfx, ting(), F(930), 0.35)                                  # les courants s'allument
place(sfx, pop(), F(1070), 0.3)                                   # flèches : l'aimant repousse
place(sfx, whoosh(0.6), F(1210), 0.3)                             # la montagne russe arrive
place(sfx, pop(), F(1412), 0.3); place(sfx, pop(), F(1452), 0.3)  # « 0 USURE » « 0 BRUIT »
place(sfx, ting(), F(1590), 0.4)                                  # l'aimant ressort
write_stems()
