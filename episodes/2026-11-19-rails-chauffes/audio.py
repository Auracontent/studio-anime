"""Music bed + SFX cues for "Les rails chauffés". Run: python3 tools/run_audio.py episodes/<slug>  (writes music.wav, sfx.wav)."""
from synth import *
DUR = 1637 / 30
music, sfx = init(DUR); N = len(music)
F = lambda f: f / 30

# ---- music: curious, bouncy G-major bed (pluck bass + stabs) until "Sauf que…" ----
BPM = 112; beat = 60 / BPM
prog = [(43, [59, 62, 67]), (40, [55, 59, 64]), (36, [55, 60, 64]), (38, [54, 57, 62])]  # G Em C D
def bed(t0, t1, gain=1.0, bright=0.5):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            place(music, drum("kick"), tb, 0.3 * gain if b % 2 == 0 else 0)
            if b % 2: place(music, drum("snare"), tb, 0.14 * gain)
            place(music, pluck(midi(root), 0.35, 0.4), tb, 0.38 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.18, bright), tb + beat / 2, 0.15 * gain)
            place(music, pluck(midi(ch[(b * 2 + bar) % 3] + 12), 0.14, bright), tb + beat * 0.75, 0.08 * gain)
        bar += 1; tt += beat * 4
P1_END = F(918) - 0.05
bed(F(141), P1_END)
# hook: suspended night pad under the first line
hn = int(F(141) * SR); th = np.arange(hn) / SR
pad = sum(np.sin(2 * np.pi * midi(m) * th) for m in [55, 62, 69]) * np.minimum(1, th / 0.6) * np.minimum(1, (F(141) - th) / 0.3)
place(music, lp_fast(pad.astype(np.float32), 900), 0, 0.1)
i0 = int(P1_END * SR); i1 = int(F(1138) * SR); music[i0:i1] *= 0
# after the sting: sparse, cool arpeggio for the welded rails + winter night
for k in range(int((F(1431) - F(960)) / (beat / 2))):
    m = [67, 71, 74, 79, 74, 71][k % 6]; place(music, pluck(midi(m), 0.5, 0.35), F(960) + k * beat / 2, 0.12)
dn = int((F(1431) - F(960)) * SR); td = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * midi(43) * td) + 0.5 * np.sin(2 * np.pi * midi(50) * td)) * np.minimum(1, td / 1.5) * np.minimum(1, (F(1431) - F(960) - td) / 0.4)
place(music, lp_fast(drone.astype(np.float32), 500), F(960), 0.1)
# "Voilà pourquoi": the bouncy bed comes back, brighter, to the end
bed(F(1431), DUR, 1.0, 0.6)
music[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))

# ---- sfx ----
def sizzle(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 7000), 2500) * (0.5 + 0.5 * rng.random(n).astype(np.float32) ** 4) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3) * 0.5).astype(np.float32)
def tactac():  # wheel over a rail gap: two quick knocks
    a = thunk(110, 0.12) * 0.9; b = np.zeros(int(0.32 * SR), np.float32); b[:len(a)] += a; j = int(0.13 * SR); b[j:j + len(a)] += a * 0.8; return b
place(sfx, sizzle(4.6), 0.0, 0.5)                                  # rail glowing in the cold
place(sfx, whoosh(0.6), F(138), 0.4)                               # night -> day
place(sfx, chug(3.4), F(141), 0.55)                                # steam train
for k in range(9): place(sfx, tactac(), F(178) + k * 0.42, 0.75)  # "tac-tac"
place(sfx, whistle(0.9), F(150), 0.2)
place(sfx, ting(), F(262), 0.4)                                    # the gap
for k in range(12): place(sfx, hammer(), F(300) + k * 0.27, 0.4)  # 1900 layer at work
place(sfx, sizzle(4.0), F(450), 0.25)                              # heat rising
place(sfx, ting(), F(549), 0.3)                                    # 60°
place(sfx, whoosh(0.5), F(566), 0.5)                               # flash to Nîmes
place(sfx, boom(), F(655), 0.35)                                   # 65 !
for fr in [770, 790, 805, 820]: place(sfx, creak(0.5, 120), F(fr), 0.55)  # the track pushes
place(sfx, snap(), F(828), 0.5)
place(sfx, sting(), F(918), 0.8)                                   # "Sauf que…"
place(sfx, whoosh(1.4), F(1050), 0.7)                              # high-speed train, almost silent
place(sfx, whoosh(0.5), F(1134), 0.5)                              # flash to the winter night
place(sfx, sizzle(3.6), F(1198), 0.45)                             # heating the steel
for k in range(3): place(sfx, hammer(), F(1318) + k * 0.22, 0.6)  # fixed
place(sfx, ting(), F(1380), 0.3); place(sfx, snore(1.2), F(1395), 0.35)  # "il fait doux… pour toujours"
place(sfx, whoosh(0.5), F(1428), 0.5)                              # back to the heatwave
place(sfx, engine(4.0, 52), F(1490), 0.35)                         # the train crawling
for fr in [1580, 1605]: place(sfx, creak(0.5, 110), F(fr), 0.4)
place(sfx, sting(), F(1625), 0.0)                                  # (loop point kept clean)
write_stems()
