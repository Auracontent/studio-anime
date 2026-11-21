"""Musique + bruitages clés pour "Les pigeons du siège". Run: python3 tools/run_audio.py episodes/<slug>.
Les bruitages de mouvement sont posés automatiquement par tools/autosfx.py."""
from synth import *
DUR = 1385 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
BPM = 84; beat = 60 / BPM
prog = [(50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (45, [57, 60, 64])]
def bed(t0, t1, gain=1.0, bright=0.4, kick=True):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            if kick and b % 2 == 0: place(music, drum("kick"), tb, 0.18 * gain)
            place(music, pluck(midi(root + (12 if b == 2 else 0)), 0.45, 0.3), tb, 0.28 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.22, bright), tb + beat / 2, 0.12 * gain)
        bar += 1; tt += beat * 4
bed(0, F(928) - 0.05, 0.9, 0.35)          # hiver, siège, invention : mélodie douce puis plus vive
bed(F(986), F(1177), 0.6, 0.45, kick=False)   # le bilan, le bureau
bed(F(1177), DUR, 1.0, 0.7)               # lumière dorée, final chaleureux
music[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))
place(sfx, ting(), F(0.5), 0.3)           # la lumière du film
place(sfx, bonk(), F(430), 0.5)           # le pigeon plie sous le paquet
place(sfx, ting(), F(556), 0.45)          # l'idée de René
place(sfx, pop(), F(647), 0.5)            # flash de l'appareil
place(sfx, ting(), F(748), 0.3)           # le film plus léger que la plume
place(sfx, boom(), F(928), 0.7)           # « Sauf que… » : sting
place(sfx, gasp(), F(912), 0.3)           # le faucon plonge
place(sfx, ting(), F(1262), 0.4)          # 100 000+
write_stems()
