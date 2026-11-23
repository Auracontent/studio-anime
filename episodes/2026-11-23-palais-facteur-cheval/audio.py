"""Musique + bruitages narratifs pour « Le palais du facteur Cheval ». Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1585 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# musique : guitare douce (pluck) ; plus grave et sourde la nuit, qui s'ouvre sur le palais terminé, s'arrête sur « Il la ramasse »
BPM = 92; beat = 60 / BPM
prog = [(45, [57, 60, 64]), (50, [57, 62, 65]), (52, [56, 59, 64]), (45, [57, 60, 64])]
def bed(t0, t1, gain=1.0, bright=0.5, minor=False):
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
bed(0, F(358) - 0.1, 0.9, 0.5)
bed(F(372), F(657) - 0.1, 1.0, 0.55)
bed(F(657), F(992), 0.85, 0.3, True)          # nuits : plus sombre
bed(F(992), F(1071), 0.9, 0.5)
bed(F(1071), DUR - 0.05, 1.05, 0.65)          # le palais, la gloire
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))

# bruitages narratifs (les bruitages de mouvement sont automatiques)
place(sfx, bonk(), F(137), 0.45); place(sfx, gasp(), F(140), 0.25)               # il bute sur la pierre
place(sfx, pop(), F(43), 0.2)                                                    # « palais »
place(sfx, bonk(), F(278), 0.45)                                                 # il bute (1879)
place(sfx, pop(), F(266), 0.25)                                                  # carte « Ferdinand Cheval »
place(sfx, sting(), F(362), 0.7); place(sfx, ting(), F(372), 0.3)                # « Il la ramasse »
for fr in [412, 432, 448]: place(sfx, thud(110), F(fr), 0.15)                    # cailloux ramassés
place(sfx, pop(), F(520), 0.3)                                                   # « cailloux »
place(sfx, pop(), F(602), 0.35)                                                  # « FOU ! »
place(sfx, ting(), F(780), 0.3)                                                  # « lampe »
for fr in [805, 818, 830, 842]: place(sfx, thud(90), F(fr), 0.3)                 # il empile
place(sfx, pop(), F(862), 0.25)                                                  # mortier
for fr in [898, 910, 922]: place(sfx, hammer(), F(fr), 0.4)                      # ciseau
for fr in [950, 958, 966, 974]: place(sfx, pop(), F(fr), 0.25)                   # grottes, géants
place(sfx, ting(), F(1036), 0.4); place(sfx, ting(), F(1044), 0.25)              # « 33 ans »
place(sfx, ting(), F(1099), 0.4); place(sfx, gasp(), F(1100), 0.3)               # « terminé »
place(sfx, pop(), F(1150), 0.3); place(sfx, pop(), F(1186), 0.3)                 # cartes barrées
place(sfx, sting(), F(1210), 0.7)                                                # « têtu »
place(sfx, pop(), F(1322), 0.3)                                                  # « 1969 »
place(sfx, hammer(), F(1379), 0.5); place(sfx, ting(), F(1382), 0.35)            # tampon « CLASSÉ »
place(sfx, ting(), F(1390), 0.4)                                                 # plaque
for fr in range(1394, 1440, 7): place(sfx, pop(), F(fr), 0.15)                   # applaudissements
place(sfx, gasp(), F(1556), 0.35); place(sfx, sting(), F(1556), 0.6)             # la pierre brille
write_stems()
