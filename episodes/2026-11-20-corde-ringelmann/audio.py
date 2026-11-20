"""Music bed + SFX cues for "La corde de Ringelmann". Run: python3 tools/run_audio.py episodes/<slug>  (writes music.wav, sfx.wav)."""
from synth import *
DUR = 1819 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# ---- music: light curious march in C major; stops on "Sauf que non" (656), cool drone in the lab (1181+), march returns at the result ----
BPM = 112; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])]  # C Am F G
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
PIVOT = F(656) - 0.05
bed(0, PIVOT)
# after the pivot: bare, a single low drone then the lab arpeggio
i0 = int(PIVOT * SR); i1 = int(F(1716) * SR); music[i0:i1] *= 0
for k in range(int((F(1716) - F(1181)) / (beat / 2))):
    m = [64, 67, 71, 76, 71, 67][k % 6]; place(music, pluck(midi(m), 0.5, 0.3), F(1181) + k * beat / 2, 0.1)
dn = int((F(1716) - F(1181)) * SR); td = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * midi(40) * td) + 0.5 * np.sin(2 * np.pi * midi(47) * td)) * np.minimum(1, td / 1.0) * np.minimum(1, (F(1716) - F(1181) - td) / 0.4)
place(music, lp_fast(drone.astype(np.float32), 500), F(1181), 0.1)
bed(F(1716), DUR, 1.0, 0.65)
music[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))

# ---- sfx ----
place(sfx, whoosh(0.5), F(0), 0.2)
for fr in [20, 50, 80]: place(sfx, creak(0.5, 160), F(fr), 0.3)             # rope strains
place(sfx, ting(), F(106), 0.3)                                              # "Un Français"
place(sfx, whoosh(0.5), F(141), 0.25)
place(sfx, thunk(90, 0.25), F(333), 0.3)                                     # tool
place(sfx, creak(0.6, 140), F(380), 0.4)                                     # rope tied
place(sfx, ting(), F(430), 0.3)                                              # dial
for fr, n in [(462, 3), (532, 3), (560, 3)]:
    for k in range(n): place(sfx, creak(0.35, 150 + 10 * k), F(fr) + k * 0.25, 0.25)
place(sfx, ting(), F(618), 0.4)                                              # sum card
place(sfx, sting(), F(656), 0.8)                                             # "Sauf que non"
place(sfx, ting(), F(700), 0.3)                                              # ratio card
place(sfx, whoosh(0.5), F(780), 0.25)
place(sfx, ting(), F(910), 0.4)                                              # 8 ≈ 4
place(sfx, whoosh(0.5), F(1178), 0.5)                                        # to 1974
place(sfx, ting(), F(1190), 0.25)
place(sfx, click(), F(1330), 0.5)
place(sfx, ting(), F(1500), 0.25)                                            # thought bubble
place(sfx, ting(), F(1620), 0.3)                                             # brain
place(sfx, whoosh(0.5), F(1713), 0.5)                                        # back to the farm
place(sfx, thunk(70, 0.3), F(1790), 0.5); place(sfx, crash(0.8), F(1800), 0.2)  # team topples
place(sfx, ting(), F(1806), 0.4)
write_stems()
