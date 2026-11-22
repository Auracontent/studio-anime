"""Musique + bruitages narratifs pour "Le pendule de Foucault". Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1373 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique : cordes douces (valse lente), plus grave pendant l'attente, s'éclaircit sur « c'est le sol qui tourne »
BPM = 96; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (53, [60, 65, 69]), (55, [59, 62, 67])]
def waltz(t0, t1, gain=1.0, bright=0.5, minor=False):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        if minor: ch = [c - 1 if i == 1 else c for i, c in enumerate(ch)]
        for b in range(3):
            tb = tt + b * beat
            if tb >= t1: break
            if b == 0: place(music, pluck(midi(root), 0.6, 0.4), tb, 0.3 * gain)
            else:
                for k, n in enumerate(ch): place(music, pluck(midi(n + 12), 0.25, bright), tb + k * 0.015, 0.1 * gain)
        bar += 1; tt += beat * 3
waltz(0, F(550) - 0.05)
waltz(F(550), F(825) - 0.05, 0.7, 0.35, minor=True)
waltz(F(825), DUR - 0.05, 1.0, 0.65)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
# bruitages narratifs (les mouvements sont ajoutés par tools/autosfx.py)
place(sfx, pop(), F(76), 0.3)                                                           # « LA TERRE ? »
place(sfx, pop(), F(140), 0.3)                                                          # « PARIS 1851 »
place(sfx, pop(), F(238), 0.3); place(sfx, thud(), F(289), 0.5)                         # « 28 kg », la boule s'accroche
place(sfx, pop(), F(338), 0.3)                                                          # « 67 m »
place(sfx, whoosh(0.7), F(412), 0.3)                                                    # il lâche la boule
for fr in [603, 612, 621, 630, 639]: place(sfx, click(), F(fr), 0.15)                   # l'horloge égrène les minutes
place(sfx, sting(), F(652), 0.8); place(sfx, gasp(), F(693), 0.25)                      # « le trait change de direction »
place(sfx, pop(), F(786), 0.3)                                                          # « même sens »
place(sfx, pop(), F(832), 0.3); place(sfx, ting(), F(850), 0.4)                         # « LE SOL ! »
place(sfx, pop(), F(914), 0.3)                                                          # « 11°/h »
for fr in range(1010, 1090, 6): place(sfx, click(), F(fr), 0.1)                         # le sol fait son tour
place(sfx, ting(), F(1064), 0.5)                                                        # « 32 h » ✓
place(sfx, boing(), F(1160), 0.25)                                                      # les Parisiens sautent
place(sfx, pop(), F(1330), 0.3); place(sfx, sting(), F(1236), 0.4)                      # boucle
write_stems()
