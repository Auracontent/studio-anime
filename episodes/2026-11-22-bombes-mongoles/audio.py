"""Musique + bruitages narratifs pour "Les bombes mongoles". Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1782 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# musique : marche pentatonique légère (Am G F E), s'amincit sur le pivot (732), grave sous l'eau, revient pour la preuve, tonnerre à 1458
BPM = 104; beat = 60 / BPM
prog = [(45, [57, 60, 64]), (43, [55, 59, 62]), (41, [53, 57, 60]), (40, [52, 56, 59])]
def bed(t0, t1, gain=1.0, bright=0.5):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            place(music, drum("kick"), tb, 0.28 * gain if b % 2 == 0 else 0)
            if b % 2: place(music, drum("snare"), tb, 0.12 * gain)
            place(music, pluck(midi(root + (12 if b == 2 else 0)), 0.35, 0.4), tb, 0.34 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.18, bright), tb + beat / 2, 0.14 * gain)
        bar += 1; tt += beat * 4
bed(0, F(732) - 0.05)
for k in range(int((F(1256) - F(732)) / (beat / 2))):          # sous l'eau : arpège lent et grave
    m = [45, 52, 57, 52][k % 4]; place(music, pluck(midi(m), 0.5, 0.25), F(732) + k * beat / 2, 0.12)
bed(F(1256), F(1458) - 0.05, 0.9, 0.6)                           # la preuve
bed(F(1563), DUR, 0.9, 0.65)                                     # retour au rouleau
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))

# bruitages narratifs (les bruitages de mouvement sont ajoutés automatiquement par tools/autosfx.py)
place(sfx, pop(), F(10), 0.35); place(sfx, crackle(1.5), F(10), 0.2)                 # l'explosion se peint
place(sfx, ting(), F(176), 0.3)                                                      # 1293
place(sfx, pop(), F(396), 0.35); place(sfx, ting(), F(440), 0.3)                     # +400 ans
place(sfx, pop(), F(512), 0.3)                                                       # Suenaga réapparaît
place(sfx, sting(), F(732), 0.8)                                                     # « Sauf que… »
place(sfx, splash(1.0), F(766), 0.4)                                                 # elle saute
place(sfx, ting(), F(960), 0.3); place(sfx, scrape(0.8), F(960), 0.2)                # sable, 1 m
place(sfx, ting(), F(1024), 0.3)                                                     # 1281
place(sfx, gasp(), F(1198), 0.35)                                                    # elle trouve une boule
for fr in [1270, 1290, 1310]: place(sfx, click(), F(fr), 0.25)                       # balayage du scanner
place(sfx, ting(), F(1330), 0.35); place(sfx, ting(), F(1394), 0.35)                 # poudre, fer
place(sfx, whoosh(0.4), F(1480), 0.3)                                                # le lancer
place(sfx, boom(), F(1494), 0.7); place(sfx, thunder(2.4), F(1494), 0.4)             # explosion + tonnerre
place(sfx, pop(), F(1624), 0.4); place(sfx, ting(), F(1630), 0.4)                    # la bombe apparaît
place(sfx, sting(), F(1668), 0.5)                                                    # « elle, était bien réelle »
write_stems()
