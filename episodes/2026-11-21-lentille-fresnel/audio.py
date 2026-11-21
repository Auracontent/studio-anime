"""Music bed + SFX cues for "La lentille de Fresnel". Run: python3 tools/run_audio.py episodes/<slug>  (writes music.wav, sfx.wav)."""
from synth import *
DUR = 1736 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# ---- music: curious light march (C Am F G); thins out on the pivot "Sauf que" (482) until the idea (773); lighter arpeggio for the death (1446-1557); returns for the end ----
BPM = 108; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])]
def bed(t0, t1, gain=1.0, bright=0.5):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            place(music, drum("kick"), tb, 0.28 * gain if b % 2 == 0 else 0)
            if b % 2: place(music, drum("snare"), tb, 0.12 * gain)
            place(music, pluck(midi(root + (12 if b == 2 else 0)), 0.35, 0.4), tb, 0.34 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.18, bright), tb + beat / 2, 0.14 * gain)
        bar += 1; tt += beat * 4
bed(0, F(482) - 0.05)
for k in range(int((F(773) - F(482)) / (beat / 2))):               # worry: slow low arpeggio
    m = [52, 55, 59, 55][k % 4]; place(music, pluck(midi(m), 0.5, 0.25), F(482) + k * beat / 2, 0.12)
bed(F(773), F(1446), 1.0, 0.6)                                      # the idea: the march comes back brighter
for k in range(int((F(1558) - F(1446)) / (beat / 2))):             # death: soft tender arpeggio
    m = [64, 67, 71, 67][k % 4]; place(music, pluck(midi(m), 0.5, 0.3), F(1446) + k * beat / 2, 0.1)
bed(F(1558), DUR, 0.9, 0.65)
music[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))

# ---- sfx ----
place(sfx, whoosh(0.5), F(0), 0.2)
place(sfx, ting(), F(150), 0.3)                                      # "du verre"
place(sfx, whoosh(0.5), F(169), 0.3)
place(sfx, ting(), F(215), 0.2)
place(sfx, sting(), F(260), 0.4)                                     # light everywhere
place(sfx, whoosh(0.5), F(320), 0.25); place(sfx, ting(), F(350), 0.25)
place(sfx, ting(), F(395), 0.3)                                      # lens card
place(sfx, sting(), F(482), 0.8)                                     # "Sauf que"
for fr in [500, 530, 560]: place(sfx, thunk(70, 0.3), F(fr), 0.25)   # block grows
for fr in [625, 650]: place(sfx, creak(0.5, 130), F(fr), 0.3)        # workers strain
place(sfx, ting(), F(684), 0.3)                                      # coins
place(sfx, creak(0.6, 110), F(720), 0.3)
place(sfx, ting(), F(780), 0.5)                                      # idea
place(sfx, whoosh(0.5), F(840), 0.3); place(sfx, ting(), F(850), 0.3)
place(sfx, click(), F(930), 0.5); place(sfx, click(), F(950), 0.5)
place(sfx, thunk(90, 0.3), F(1005), 0.35); place(sfx, crash(0.8), F(1022), 0.2)
place(sfx, ting(), F(1050), 0.4)                                     # lens appears
place(sfx, whoosh(0.5), F(1142), 0.45)                               # Cordouan
place(sfx, whoosh(0.5), F(1183), 0.4)
for k in range(4): place(sfx, whoosh(0.5), F(1230) + k * 0.7, 0.2)   # drum turning
place(sfx, ting(), F(1275), 0.4)                                     # 30 km
place(sfx, whoosh(0.5), F(1327), 0.4); place(sfx, ting(), F(1400), 0.4)
place(sfx, whoosh(0.5), F(1446), 0.4)
place(sfx, ting(), F(1520), 0.3)                                     # 39 ans
place(sfx, whoosh(0.5), F(1558), 0.45)
place(sfx, whoosh(0.5), F(1660), 0.45)
place(sfx, ting(), F(1696), 0.5)                                     # génie
write_stems()
