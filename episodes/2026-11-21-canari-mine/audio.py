"""Musique + bruitages clés pour "Le canari de la mine". Run: python3 tools/run_audio.py episodes/<slug>  (écrit music.wav, sfx.wav).
Les bruitages de mouvement (pas, chutes, chocs, plans) sont posés automatiquement par tools/autosfx.py."""
from synth import *
DUR = 1373 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# ---- musique : lente et sombre dans la mine (Am F C G, basse grave), s'arrête sur l'explosion, tendue pendant la course,
# coupée net sur le pivot « Sauf que… » (801), puis lumineuse et chaleureuse quand le canari se réveille (1045) ----
BPM = 92; beat = 60 / BPM
prog = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [60, 64, 67]), (43, [55, 59, 62])]
def bed(t0, t1, gain=1.0, bright=0.4, kick=True):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            if kick and b % 2 == 0: place(music, drum("kick"), tb, 0.2 * gain)
            place(music, pluck(midi(root + (12 if b == 2 else 0)), 0.45, 0.3), tb, 0.3 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.22, bright), tb + beat / 2, 0.12 * gain)
        bar += 1; tt += beat * 4
bed(0, F(371) - 0.05, 0.9, 0.3, kick=False)                    # galerie : ambiance sombre
for k in range(int((F(536) - F(420)) / (beat / 2))):             # après l'explosion : arpège hésitant
    m = [52, 55, 59, 55][k % 4]; place(music, pluck(midi(m), 0.5, 0.25), F(420) + k * beat / 2, 0.1)
bed(F(536), F(703) - 0.05, 0.9, 0.35)
for k in range(int((F(801) - F(703)) / (beat / 4))):             # course : pulsation rapide
    place(music, drum("kick"), F(703) + k * beat / 2, 0.2); place(music, pluck(midi([45, 48, 52, 48][k % 4]), 0.2, 0.5), F(703) + k * beat / 4, 0.14)
bed(F(1030), F(1076), 0.5, 0.5, kick=False)                      # le retour du souffle
bed(F(1076), DUR, 1.0, 0.7)                                      # sortie à la lumière : chaleureux
music[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))

# ---- bruitages qui comptent pour l'histoire ----
place(sfx, snore(0.9), F(8), 0.0)
place(sfx, ting(), F(14), 0.25)                                  # le canari vacille
place(sfx, bonk(), F(32), 0.5)                                   # il tombe de son perchoir
for k in range(4): place(sfx, noise(0.5) * np.hanning(int(0.5 * SR)) * 0.12, F(130) + k * 0.7, 0.5)   # le gaz rampe (souffle doux)
place(sfx, snore(1.1), F(318), 0.35)                             # le mineur s'endort
place(sfx, boom(), F(371), 0.9); place(sfx, rumble(1.6), F(374), 0.5); place(sfx, crash(1.0), F(396), 0.4)   # explosion + éboulement
place(sfx, ting(), F(472), 0.4)                                  # l'idée de Haldane
for k in range(10): place(sfx, ting(), F(540) + k * 0.2, 0.06)    # respiration rapide de l'oiseau
place(sfx, bonk(), F(686), 0.5)                                  # le canari tombe
place(sfx, sting(), F(703), 0.4)                                 # on lâche les pioches
for k in range(3): place(sfx, thunk(110, 0.2), F(712) + k * 0.12, 0.35)   # pioches au sol
place(sfx, sting(), F(806), 0.9)                                 # « Sauf que… »
place(sfx, click(), F(920), 0.5); place(sfx, creak(0.5, 200), F(930), 0.3); place(sfx, thunk(120, 0.2), F(972), 0.5)   # la bouteille se fixe
for k in range(5): place(sfx, click(), F(1020) + k * 0.1, 0.4)    # la valve tourne
place(sfx, whoosh(0.7), F(1038), 0.5)                            # pssht : l'oxygène
place(sfx, ting(), F(1050), 0.5); place(sfx, cuckoo(), F(1080), 0.4)   # le canari se réveille et chante
place(sfx, ting(), F(1218), 0.4)                                 # 1986
place(sfx, cuckoo(), F(1330), 0.35)                              # le canari de la fin
write_stems()
