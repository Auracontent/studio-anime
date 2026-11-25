"""Musique + bruitages narratifs pour « Le bouton piéton qui ne fait rien ». Run: python3 tools/run_audio.py episodes/<slug>  (music.wav, sfx.wav)."""
from synth import *
DUR = 3664 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# musique : groove urbain léger (basse qui marche + accords pincés), plus tendu sur « Sauf que », chaleureux à la fin
BPM = 104; beat = 60 / BPM
walk = [45, 48, 52, 48, 50, 53, 57, 53, 52, 55, 59, 55, 45, 48, 52, 43]
def bed(t0, t1, gain=1.0, minor=False, bright=0.5):
    tt = t0; i = 0
    while tt < t1:
        n = walk[i % len(walk)] - (1 if minor and i % 4 == 1 else 0)
        place(music, pluck(midi(n), 0.5, 0.4), tt, 0.3 * gain)
        if i % 2 == 1: place(music, pluck(midi(n + 12), 0.3, bright), tt, 0.13 * gain); place(music, pluck(midi(n + 16), 0.3, bright), tt + 0.02, 0.1 * gain)
        tt += beat; i += 1
bed(0, F(615), 1.0, False, 0.55)
bed(F(622), F(1213), 0.85, True, 0.3)         # « Sauf que… » : plus sombre
bed(F(1213), F(2034), 0.9, True, 0.35)        # l'enquête : débranché, coût, chiffres
bed(F(2034), F(3100), 0.95, False, 0.5)       # « pas le plus étonnant » : léger, curieux
bed(F(3100), F(3326), 0.8, True, 0.3)         # la nuit
bed(F(3326), DUR - 0.05, 1.0, False, 0.6)     # fin chaleureuse
music[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))
# bruitages narratifs (les bruitages de mouvement sont automatiques)
for fr in [10, 24, 38, 52, 66, 80, 94, 108, 122]: place(sfx, click(), F(fr), 0.45)          # ouverture : le bouton martelé
for fr in [312, 326]: place(sfx, click(), F(fr), 0.5)                                      # elle appuie
for fr in [346, 373, 401]: place(sfx, click(), F(fr), 0.6); place(sfx, pop(), F(fr + 1), 0.25)   # une, deux, trois fois
for fr in range(432, 466, 7): place(sfx, step_tap(), F(fr), 0.5)                           # elle tape du pied
place(sfx, ting(), F(500), 0.5)                                                            # le bonhomme passe au vert
place(sfx, sting(), F(620), 0.9); place(sfx, gasp(), F(619), 0.25)                          # « Sauf que… »
place(sfx, ting(), F(700), 0.35)                                                           # le feu passe au vert tout seul
place(sfx, pop(), F(690), 0.3)
for fr in (920, 940): place(sfx, click(), F(fr), 0.5); place(sfx, ting(), F(fr + 2), 0.3)  # boutons posés
place(sfx, click(), F(968), 0.5); place(sfx, ting(), F(976), 0.4)                          # ça marche : vert tout de suite
place(sfx, click(), F(1020), 0.5); place(sfx, ting(), F(1032), 0.45); place(sfx, pop(), F(1033), 0.25)   # « ils marchaient vraiment »
for fr in range(1062, 1114, 6): place(sfx, click(), F(fr), 0.18)                           # l'horloge s'emballe
place(sfx, ting(), F(1136), 0.3); place(sfx, ting(), F(1194), 0.3)                         # le feu change seul
place(sfx, click(), F(1166), 0.4)
place(sfx, snap(), F(1262), 0.7); place(sfx, crackle(0.4), F(1262), 0.5); place(sfx, boing(), F(1268), 0.2)   # débranché
place(sfx, thud(), F(1418), 0.5); place(sfx, crash(0.6), F(1425), 0.3)                     # arracher
for fr in (1456, 1466, 1472): place(sfx, thud(), F(fr), 0.35)                              # reboucher
place(sfx, ting(), F(1528), 0.5); place(sfx, pop(), F(1526), 0.3)                          # tout cela coûtait cher
place(sfx, click(), F(1720), 0.5)                                                          # la petite plaque
place(sfx, pop(), F(1792), 0.3); place(sfx, pop(), F(1834), 0.3)
for fr in range(1886, 1950, 4): place(sfx, pop(), F(fr), 0.1)                              # le compteur descend
place(sfx, ting(), F(1952), 0.5); place(sfx, thud(), F(1954), 0.4)                         # « moins de 750 »
for fr in (1975, 1984, 1993): place(sfx, click(), F(fr), 0.4)                              # on appuie pour rien
place(sfx, ting(), F(2042), 0.4)                                                           # campus : ISRAËL
place(sfx, sting(), F(2186), 0.5)                                                          # « Pas du tout. »
place(sfx, click(), F(2196), 0.6); place(sfx, boing(), F(2200), 0.3)
place(sfx, pop(), F(2325), 0.3)
place(sfx, ting(), F(2500), 0.4); place(sfx, bonk(), F(2574), 0.3); place(sfx, gasp(), F(2572), 0.3)
place(sfx, click(), F(2616), 0.5)                                                          # le bouton ne change rien
place(sfx, ting(), F(2700), 0.4)                                                           # il change quelque chose en toi
place(sfx, pop(), F(2752), 0.35); place(sfx, ting(), F(2760), 0.35)                        # illusion de contrôle
place(sfx, pop(), F(2968), 0.35); place(sfx, gasp(), F(2970), 0.3)                         # attention
place(sfx, click(), F(3076), 0.5); place(sfx, ting(), F(3086), 0.4)                        # ça marche vraiment
place(sfx, click(), F(3164), 0.55); place(sfx, ting(), F(3190), 0.45)                      # la nuit : le feu des voitures passe au rouge
place(sfx, ting(), F(3264), 0.4)
place(sfx, click(), F(3426), 0.5)                                                          # le doigt sur le bouton
place(sfx, ting(), F(3484), 0.3)
place(sfx, ting(), F(3556), 0.3)                                                           # le feu passe au vert tout seul
place(sfx, click(), F(3640), 0.5); place(sfx, ting(), F(3650), 0.3)                        # dernière pression
write_stems()
