"""Musique + bruitages narratifs pour « Zoé et le vélo ». Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1331 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique : piano / guitare douce (pluck), plus sombre le soir, silence sur « Sauf que », chaleureuse ensuite
BPM = 88; beat = 60 / BPM
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
bed(0, F(215) - 0.05, 0.9, False, 0.5)
bed(F(215), F(578), 0.8, True, 0.3)
bed(F(614), F(947), 1.0, False, 0.55)
bed(F(947), DUR - 0.05, 1.0, False, 0.6)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
# bruitages narratifs (les bruitages de mouvement sont automatiques)
for fr in [22, 305, 336, 362, 378, 391, 518, 1268]: place(sfx, thud(), F(fr), 0.45)       # chutes
place(sfx, boing(), F(24), 0.3)
for i, n in enumerate([306, 337]): place(sfx, pop(), F(n), 0.3)                           # cartes « 1 », « 2 »
for fr in range(364, 392, 4): place(sfx, pop(), F(fr), 0.15)                              # compteur jusqu'à « 10 »
place(sfx, pop(), F(400), 0.3)                                                            # genou + pansement
place(sfx, click(), F(456), 0.5); place(sfx, ting(), F(460), 0.3)                         # la roue se redresse
place(sfx, sting(), F(580), 0.8)                                                          # « Sauf que ce soir-là »
place(sfx, ting(), F(758), 0.35)                                                          # Malo lâche, cœur
place(sfx, ting(), F(1018), 0.5); place(sfx, ting(), F(1052), 0.4)                        # sonnette « Dring ! »
place(sfx, gasp(), F(1070), 0.3)                                                          # les moqueurs
place(sfx, pop(), F(1303), 0.3)                                                           # elle remonte en selle
write_stems()
