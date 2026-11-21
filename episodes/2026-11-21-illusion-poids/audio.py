"""Musique + bruitages clés pour « L'illusion de Charpentier ». Run: python3 tools/run_audio.py episodes/<slug>"""
from synth import *
DUR = 1358 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
BPM = 100; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])]
def bed(t0, t1, gain=1.0, bright=0.5, kick=True):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            if kick and b % 2 == 0: place(music, drum("kick"), tb, 0.18 * gain)
            place(music, pluck(midi(root + (12 if b == 2 else 0)), 0.4, 0.3), tb, 0.28 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.2, bright), tb + beat / 2, 0.12 * gain)
        bar += 1; tt += beat * 4
bed(0, F(655), 0.9, 0.4)
bed(F(785), DUR, 1.0, 0.6)       # la musique se tait sur le pivot (657-784)
music[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))
place(sfx, ting(), F(60), 0.3)
place(sfx, ting(), F(284), 0.4)                                   # 1891
place(sfx, sting(), F(659), 0.8)                                  # « Sauf que… »
place(sfx, ting(), F(765), 0.5)                                   # égalité parfaite
place(sfx, ting(), F(800), 0.3)                                   # l'idée : le cerveau
place(sfx, boing(), F(996), 0.5)                                  # la grosse boule jaillit
place(sfx, ting(), F(1086), 0.35)
place(sfx, cuckoo(), F(1332), 0.4)
write_stems()
