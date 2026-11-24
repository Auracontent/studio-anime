"""Musique + bruitages narratifs pour « Les rats de Hanoï ». Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 1256 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique : pizzicato ironique de « jazz manouche » (basse qui marche + accords pincés), silence sur « Sauf que », plus sombre dans l'égout
BPM = 112; beat = 60 / BPM
walk = [48, 52, 55, 52, 53, 57, 60, 57, 55, 59, 62, 59, 48, 52, 55, 47]
def bed(t0, t1, gain=1.0, minor=False, bright=0.5):
    tt = t0; i = 0
    while tt < t1:
        n = walk[i % len(walk)] - (1 if minor and i % 4 == 1 else 0)
        place(music, pluck(midi(n), 0.5, 0.4), tt, 0.3 * gain)
        if i % 2 == 1: place(music, pluck(midi(n + 12), 0.3, bright), tt, 0.13 * gain); place(music, pluck(midi(n + 16), 0.3, bright), tt + 0.02, 0.1 * gain)
        tt += beat; i += 1
bed(0, F(584) - 0.05, 0.9, False, 0.5)
bed(F(584) + 0.2, F(906), 0.85, True, 0.3)
bed(F(906), DUR - 0.05, 1.0, True, 0.4)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
# bruitages narratifs (les bruitages de mouvement sont automatiques)
place(sfx, gasp(), F(46), 0.3); place(sfx, pop(), F(190), 0.3)                           # ouverture : choc, carte « 1902 »
place(sfx, pop(), F(262), 0.35); place(sfx, ting(), F(266), 0.3)                         # « peste ! »
place(sfx, ting(), F(396), 0.5); place(sfx, pop(), F(394), 0.3)                          # pièce = queue
for fr in [447, 466, 494, 925, 940, 962]: place(sfx, thud(), F(fr), 0.35)                # sacs de queues posés
for fr in range(534, 580, 11): place(sfx, pop(), F(fr), 0.15)                           # « + 1 » : on compte
place(sfx, sting(), F(584), 0.8)                                                         # « Sauf que… »
place(sfx, click(), F(720), 0.6); place(sfx, boing(), F(724), 0.3); place(sfx, gasp(), F(722), 0.25)   # ciseaux : la queue saute
for fr in (768, 776): place(sfx, ting(), F(fr), 0.3)                                      # cœurs
for i in range(10): place(sfx, pop(), F(870 + i * 3), 0.12)                              # les rats se multiplient
place(sfx, gasp(), F(886), 0.3)                                                          # le fonctionnaire arrive : choc
for fr in range(936, 986, 4): place(sfx, pop(), F(fr), 0.12)                             # le compteur grimpe
place(sfx, ting(), F(986), 0.5); place(sfx, thud(), F(988), 0.4)                         # « 20 000 + »
place(sfx, click(), F(1070), 0.5); place(sfx, thud(), F(1096), 0.25)                     # il déchire l'affiche
place(sfx, ting(), F(1230), 0.35)                                                        # dernier mot
write_stems()
