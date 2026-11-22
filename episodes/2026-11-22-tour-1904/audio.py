"""Musique + bruitages narratifs pour "Le Tour gagné en arrivant cinquième". Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1538 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# musique : galop de fanfare de village (2 temps) pour la course, s'éclaircit sur le pivot (« Sauf que… »), plus grave au bureau, retour joyeux
BPM = 112; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (53, [60, 65, 69]), (55, [59, 62, 67]), (48, [60, 64, 67])]
def march(t0, t1, gain=1.0, bright=0.55, minor=False):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        if minor: ch = [c - 1 if i == 1 else c for i, c in enumerate(ch)]
        for b in range(2):
            tb = tt + b * beat
            if tb >= t1: break
            if b == 0: place(music, drum("kick"), tb, 0.22 * gain); place(music, pluck(midi(root), 0.4, 0.4), tb, 0.34 * gain)
            else:
                place(music, drum("snare"), tb, 0.12 * gain)
                for k, n in enumerate(ch): place(music, pluck(midi(n + 12), 0.2, bright), tb + k * 0.012, 0.11 * gain)
        bar += 1; tt += beat * 2
march(0, F(933) - 0.05)
for k in range(int((F(1333) - F(933)) / (beat / 2))):                # pivot : arpège grave et lent au bureau
    m = [48, 55, 51, 55][k % 4]; place(music, pluck(midi(m), 0.5, 0.25), F(933) + k * beat / 2, 0.13)
march(F(1333), DUR - 0.05, 0.85, 0.6)                                 # la ligne d'arrivée, la boucle
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))

# bruitages narratifs (les bruitages de mouvement sont ajoutés automatiquement par tools/autosfx.py)
place(sfx, pop(), F(100), 0.3)                                                        # carte « 5e »
place(sfx, pop(), F(152), 0.3); place(sfx, pop(), F(232), 0.3)                        # « 1904 », « 19 ans »
for fr in [285, 300, 315, 330]: place(sfx, scrape(0.25), F(fr), 0.15)                 # jantes qui raclent
place(sfx, snap(), F(431), 0.35); place(sfx, bonk(), F(436), 0.4)                     # le pneu éclate, le favori tombe
for fr in [522, 540, 560, 580]: place(sfx, bonk(), F(fr), 0.3)                        # coups de bâton
place(sfx, boom(), F(640), 0.55); place(sfx, crackle(0.4), F(640), 0.2)               # coup de feu
place(sfx, whistle(1.1), F(715), 0.3); place(sfx, chug(2.0), F(718), 0.12)            # le train
place(sfx, boing(), F(764), 0.3)                                                      # le favori monte
place(sfx, engine(2.2, 70), F(795), 0.2); place(sfx, boing(), F(836), 0.3); place(sfx, whoosh(0.8), F(868), 0.3)   # la voiture
place(sfx, sting(), F(935), 0.8)                                                      # « Sauf que… »
place(sfx, gasp(), F(972), 0.3)                                                       # « ! »
for fr in [1085, 1094, 1103, 1112, 1121]: place(sfx, click(), F(fr), 0.25)            # calendrier qui tourne
for fr in [1150, 1168, 1186, 1204]: place(sfx, hammer(), F(fr), 0.4); place(sfx, bonk(), F(fr + 6), 0.3)   # tampons, chutes
place(sfx, ting(), F(1285), 0.4)                                                      # « 1er »
place(sfx, whoosh(0.6), F(1330), 0.25)                                                # vers la ligne
place(sfx, pop(), F(1412), 0.3)                                                       # « 19 ans » sur l'estrade
place(sfx, sting(), F(1480), 0.5)                                                     # chute finale
write_stems()
