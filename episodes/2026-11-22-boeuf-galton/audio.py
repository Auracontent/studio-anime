"""Musique + bruitages narratifs pour "Le bœuf de Galton". Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1260 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique : valse de fanfare de village (3 temps), plus calme pendant que Galton doute, s'éclaircit au pivot
BPM = 120; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (53, [60, 65, 69]), (55, [59, 62, 67]), (48, [60, 64, 67])]
def waltz(t0, t1, gain=1.0, bright=0.55, minor=False):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        if minor: ch = [c - 1 if i == 1 else c for i, c in enumerate(ch)]
        for b in range(3):
            tb = tt + b * beat
            if tb >= t1: break
            if b == 0: place(music, drum("kick"), tb, 0.2 * gain); place(music, pluck(midi(root), 0.45, 0.4), tb, 0.32 * gain)
            else:
                place(music, drum("snare"), tb, 0.08 * gain)
                for k, n in enumerate(ch): place(music, pluck(midi(n + 12), 0.2, bright), tb + k * 0.012, 0.1 * gain)
        bar += 1; tt += beat * 3
waltz(0, F(405) - 0.05)
waltz(F(405), F(588) - 0.05, 0.7, 0.4, minor=True)
waltz(F(588), DUR - 0.05, 0.95, 0.65)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
# bruitages narratifs (les mouvements sont ajoutés par tools/autosfx.py)
place(sfx, pop(), F(14), 0.3); place(sfx, ting(), F(104), 0.4)                         # « ? lb » puis « ✓ »
place(sfx, pop(), F(228), 0.3)                                                          # « ≈ 800 »
for fr in [200, 217, 234, 251, 268]: place(sfx, click(), F(fr), 0.18)                   # billets dans l'urne
place(sfx, boing(), F(372), 0.3); place(sfx, gasp(), F(374), 0.25)                      # le citadin sursaute
for fr in [470, 476, 482, 488, 494]: place(sfx, click(), F(fr), 0.2)                    # les billets tombent
place(sfx, sting(), F(590), 0.8)                                                        # « Sauf que… »
for fr in range(600, 656, 6): place(sfx, click(), F(fr), 0.15)                          # le rang de billets
place(sfx, ting(), F(694), 0.45)                                                        # « 1207 lb »
place(sfx, thud(), F(806), 0.6); place(sfx, ting(), F(856), 0.45)                       # le bœuf sur la balance, « 1198 »
place(sfx, pop(), F(884), 0.3)                                                          # « < 1 % »
place(sfx, bonk(), F(942), 0.25); place(sfx, bonk(), F(952), 0.25)                      # billets faux
place(sfx, ting(), F(1012), 0.5)                                                        # les erreurs s'annulent
place(sfx, whoosh(0.7), F(1046), 0.3); place(sfx, pop(), F(1056), 0.3)                  # 1906
place(sfx, sting(), F(1232), 0.45)                                                      # boucle
write_stems()
