"""Musique + bruitages narratifs pour "Le coffre-fort vide". Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1492 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# musique : valse de salon 1900 (3 temps) pour l'acte des banquiers, s'amincit sur le pivot (« Sauf que… »), grave et tendue ensuite
BPM = 96; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (53, [60, 65, 69]), (55, [59, 62, 67]), (48, [60, 64, 67])]
def waltz(t0, t1, gain=1.0, bright=0.55, minor=False):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        if minor: ch = [c - 1 if i == 1 else c for i, c in enumerate(ch)]
        for b in range(3):
            tb = tt + b * beat
            if tb >= t1: break
            if b == 0: place(music, drum("kick"), tb, 0.22 * gain); place(music, pluck(midi(root), 0.4, 0.4), tb, 0.34 * gain)
            else:
                for k, n in enumerate(ch): place(music, pluck(midi(n + 12), 0.2, bright), tb + k * 0.012, 0.11 * gain)
        bar += 1; tt += beat * 3
waltz(0, F(790) - 0.05)
for k in range(int((F(1196) - F(790)) / (beat / 2))):               # après le pivot : arpège grave et lent
    m = [48, 55, 51, 55][k % 4]; place(music, pluck(midi(m), 0.5, 0.25), F(790) + k * beat / 2, 0.13)
waltz(F(1196), F(1362) - 0.05, 0.8, 0.5, True)                       # la fuite, le verdict
waltz(F(1362), DUR, 0.7, 0.6)                                        # retour au salon
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))

# bruitages narratifs (les bruitages de mouvement sont ajoutés automatiquement par tools/autosfx.py)
for fr in [8, 30, 60, 475]: place(sfx, ting(), F(fr), 0.3)                           # pièces qui tintent
place(sfx, pop(), F(40), 0.3)                                                        # Thérèse apparaît
place(sfx, pop(), F(240), 0.3); place(sfx, ting(), F(246), 0.3)                      # le portrait de l'Américain
place(sfx, thunk(120, 0.25), F(360), 0.3)                                            # sceaux de cire
place(sfx, ting(), F(504), 0.3)                                                      # le bal
for fr in [600, 618, 636]: place(sfx, thunk(150, 0.12), F(fr), 0.3)                  # le créancier tape du pied
place(sfx, pop(), F(700), 0.3)                                                       # « Patience ! »
place(sfx, sting(), F(792), 0.8)                                                     # « Sauf que… »
place(sfx, crash(0.6), F(838), 0.25)                                                 # la pile de dettes
place(sfx, boom(), F(852), 0.5); place(sfx, bonk(), F(852), 0.4)                     # coup de maillet du juge
for fr in [925, 940, 955, 968, 985, 1000]: place(sfx, hammer(), F(fr), 0.35); place(sfx, crackle(0.5), F(fr), 0.15)   # le serrurier force
place(sfx, scrape(0.8), F(1000), 0.25)
place(sfx, creak(1.4, 120), F(1040), 0.45)                                           # la porte s'ouvre
place(sfx, thud(60), F(1092), 0.4)                                                   # elle bute contre le mur
place(sfx, bonk(), F(1112), 0.35)                                                    # la brique
place(sfx, ting(), F(1150), 0.4)                                                     # le penny
place(sfx, gasp(), F(1178), 0.4); place(sfx, bonk(), F(1186), 0.4)                   # la foule : choc, un journaliste tombe
place(sfx, whoosh(0.5), F(1200), 0.3)                                                # la course
place(sfx, whistle(0.9), F(1246), 0.3); place(sfx, bonk(), F(1254), 0.4)             # les gendarmes à Madrid
place(sfx, boom(), F(1297), 0.5); place(sfx, bonk(), F(1297), 0.4)                   # verdict : maillet
place(sfx, ting(), F(1312), 0.3)                                                     # « 5 ans »
place(sfx, sting(), F(1368), 0.5)                                                    # « tenait dans un coffre… vide »
write_stems()
