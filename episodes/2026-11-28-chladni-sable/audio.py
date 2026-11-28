"""Musique + bruitages narratifs pour « Cet archet dessine dans le sable ». Run: python3 tools/run_audio.py episodes/<slug>"""
from synth import *
DUR = 2098 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30
# archet : note tenue (harmoniques + vibrato) ; sert d'accroche, de note de Chladni et de rappel final
def bowed(freq, dur, bright=0.6):
    t = np.arange(int(dur * SR)) / SR
    ph = 2 * np.pi * freq * t + 0.012 * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t * 3)
    x = sum(np.sin(k * ph) * (bright ** (k - 1)) / k for k in range(1, 7)).astype(np.float32)
    a = np.minimum(1, t / 0.09); r = np.minimum(1, (dur - t) / 0.25)
    return (x * a * r).astype(np.float32) * 0.5
# musique rapide (120 BPM) : basse pincée + accords ; coupée juste avant « Sauf que », plus forte ensuite, retient son souffle avant le prix
BPM = 120; beat = 60 / BPM
walk = [57, 60, 64, 60, 55, 59, 62, 59, 53, 57, 60, 57, 55, 59, 62, 67]
def bed(t0, t1, gain=1.0, bright=0.5):
    tt = t0; i = 0
    while tt < t1:
        n = walk[i % len(walk)]
        place(music, pluck(midi(n - 12), 0.4, 0.4), tt, 0.3 * gain)
        if i % 2 == 1: place(music, pluck(midi(n), 0.25, bright), tt, 0.14 * gain); place(music, pluck(midi(n + 4), 0.25, bright), tt + 0.02, 0.1 * gain)
        tt += beat; i += 1
bed(0, F(868), 0.95); bed(F(900), F(1560), 1.05, 0.6); bed(F(1590), DUR - 0.05, 1.15, 0.75)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
# l'archet frotte : accroche, scène de l'archet, trois notes, retour final
for a, b, n in [(0, 4.3, 69), (F(300), F(380), 64), (F(382), F(520), 69), (F(524), F(566), 71), (F(570), F(604), 76), (F(1930), F(2075), 69)]:
    place(sfx, bowed(midi(n), b - a), a, 0.3)
place(sfx, pop(), F(195), 0.3)                                   # carte « ERNST CHLADNI »
for f0 in (229, 241, 253, 265, 277): place(sfx, leaves(0.25), F(f0), 0.3)   # le sable tombe
place(sfx, pop(), F(610), 0.3)                                   # carte « 1809 »
place(sfx, gasp(), F(684), 0.35)                                 # Napoléon fasciné
place(sfx, thunk(120, 0.25), F(740), 0.4)                        # le décret de l'Académie
place(sfx, ting(), F(802), 0.35); place(sfx, ting(), F(822), 0.3)  # les pièces
place(sfx, sting(), F(880), 0.8)                                 # « Sauf que personne n'y arrive »
place(sfx, bonk(), F(952), 0.4)                                  # le savant tombe
place(sfx, pop(), F(1048), 0.3)                                  # carte « SOPHIE GERMAIN »
place(sfx, thunk(70, 0.4), F(1150), 0.4)                         # la porte reste fermée
place(sfx, thunk(150, 0.2), F(1320), 0.45); place(sfx, thunk(150, 0.2), F(1364), 0.5)   # refus x2
place(sfx, pop(), F(1492), 0.3)                                  # carte « 3e FOIS »
place(sfx, ting(), F(1630), 0.45)                                # le prix
place(sfx, pop(), F(1594), 0.3)                                  # carte « 1816 »
place(sfx, ting(), F(1700), 0.35); place(sfx, ting(), F(1730), 0.3)
place(sfx, whoosh(0.6), F(1768), 0.3)                            # montée vers le pont
place(sfx, scrape(0.5), F(1800), 0.12)                           # le métal vibre
write_stems()
