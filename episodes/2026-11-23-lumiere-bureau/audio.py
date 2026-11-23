"""Musique + bruitages narratifs pour "La lumière du bureau". Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1181 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# musique : piano doux (pluck), s'assombrit pendant l'absence, silence sur « Sauf que », retour chaleureux
BPM = 84; beat = 60 / BPM
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
bed(0, F(379) - 0.05)
bed(F(379), F(651) - 0.2, 0.8, True, 0.3)
bed(F(712), F(1000), 0.9, False, 0.55)
bed(F(1000), DUR - 0.05, 1.0, False, 0.6)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))

# bruitages narratifs (les bruitages de mouvement sont automatiques)
place(sfx, click(), F(48), 0.5); place(sfx, ting(), F(52), 0.25)                 # clac de l'interrupteur
for i in range(4): place(sfx, pop(), F(50 + i * 8), 0.15)                        # néons rangée par rangée
place(sfx, pop(), F(100), 0.3)                                                   # carte « Karim »
place(sfx, bonk(), F(213), 0.4); place(sfx, bonk(), F(224), 0.3)                 # coups sur l'imprimante
place(sfx, pop(), F(262), 0.25)                                                  # « Salut ! »
place(sfx, pop(), F(336), 0.3)                                                   # « 6 h »
place(sfx, gasp(), F(394), 0.35)                                                 # atchoum
for fr in [604, 616, 628, 640]: place(sfx, scrape(0.25), F(fr), 0.2)             # imprimante qui grince
place(sfx, sting(), F(651), 0.8)                                                 # « Sauf que… »
place(sfx, gasp(), F(690), 0.3)                                                  # « comprend »
for fr in [766, 788, 810]: place(sfx, click(), F(fr), 0.4)                       # flash-back : clac x3
place(sfx, pop(), F(832), 0.3)                                                   # « 6 h »
place(sfx, click(), F(905), 0.5)                                                 # Léa allume
place(sfx, ting(), F(958), 0.35)                                                 # le mug se pose
place(sfx, gasp(), F(1016), 0.3); place(sfx, ting(), F(1028), 0.3)               # Karim voit le mug
place(sfx, click(), F(1138), 0.5)                                                # dernier clac
write_stems()
