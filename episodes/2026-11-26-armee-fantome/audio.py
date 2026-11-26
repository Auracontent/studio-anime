"""Musique + bruitages narratifs pour « L'armée fantôme ». Run: python3 tools/run_audio.py episodes/<slug>"""
from synth import *
DUR = 1992 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique rapide (120 BPM), marche pincée ; coupée juste avant « Sauf que l'ennemi écoute », plus forte ensuite
BPM = 120; beat = 60 / BPM
walk = [55, 59, 62, 59, 57, 60, 64, 60, 52, 55, 59, 55, 53, 57, 60, 65]
def bed(t0, t1, gain=1.0, bright=0.5):
    tt = t0; i = 0
    while tt < t1:
        n = walk[i % len(walk)]
        place(music, pluck(midi(n - 12), 0.4, 0.4), tt, 0.3 * gain)
        if i % 2 == 1: place(music, pluck(midi(n), 0.25, bright), tt, 0.14 * gain); place(music, pluck(midi(n + 4), 0.25, bright), tt + 0.02, 0.1 * gain)
        tt += beat; i += 1
bed(0, F(896), 0.95); bed(F(930), F(1720), 1.1, 0.7); bed(F(1742), DUR - 0.05, 1.0, 0.55)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
place(sfx, pop(), F(250), 0.3)                       # carte « 1 100 »
place(sfx, pop(), F(398), 0.3)                       # le char commence à se gonfler
place(sfx, boing(), F(480), 0.45)                    # le char est plein : il rebondit
place(sfx, boing(), F(645), 0.45)                    # le héros tape le char
place(sfx, pop(), F(664), 0.3)                       # l'idée du bruit
place(sfx, sting(), F(906), 0.8)                     # « Sauf que l'ennemi écoute »
place(sfx, pop(), F(1238), 0.3); place(sfx, pop(), F(1292), 0.3); place(sfx, pop(), F(1320), 0.3)  # 21 / NORMANDIE / RHIN
place(sfx, pop(), F(1050), 0.3)                      # le message SECRET
place(sfx, ting(), F(1935), 0.3)                     # le char se dégonfle
write_stems()
