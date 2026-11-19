"""Music bed + SFX cues for "Le faux Paris". Run: python3 tools/run_audio.py episodes/<slug>  (writes music.wav, sfx.wav)."""
from synth import *
DUR = 1812 / 30
music, sfx = init(DUR); N = len(music)
BPM = 100; beat = 60 / BPM
prog = [(50, [62, 65, 69]), (46, [58, 62, 65]), (43, [55, 58, 62]), (45, [57, 61, 64])]  # Dm Bb Gm A — sneaky wartime march
MUSIC_END = 39.30  # stops on "Sauf que…"
bar = 0; tt = 0.25
while tt < MUSIC_END:
    root, ch = prog[bar % 4]
    place(music, brass([midi(m - 12) for m in ch], beat * 4 * 0.98), tt, 0.07)
    for b in range(4):
        tb = tt + b * beat
        if tb >= MUSIC_END: break
        place(music, drum("kick" if b % 2 == 0 else "snare"), tb, 0.4 if b % 2 == 0 else 0.22)
        if b % 2: place(music, drum("snare"), tb + beat / 2, 0.1)   # military roll feel
        place(music, pluck(midi(root), 0.4, 0.4), tb, 0.35)
        place(music, pluck(midi(ch[(b + bar) % 3]), 0.2, 0.6), tb + beat / 2, 0.16)
    bar += 1; tt += beat * 4
i0 = int((MUSIC_END - 0.08) * SR); music[i0:] *= np.linspace(1, 0, N - i0) ** 8
# low drone from the pivot until the time jump
D0, D1 = MUSIC_END, 55.7
dn = int((D1 - D0) * SR); td = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * 73.4 * td) + 0.5 * np.sin(2 * np.pi * 110 * td) + 0.3 * np.sin(2 * np.pi * 87.3 * td)) * np.minimum(1, td / 1.2) * np.minimum(1, (D1 - D0 - td) / 0.6)
place(music, lp_fast(drone.astype(np.float32), 600), D0, 0.12)
# the lights: a warm D-major swell and rising plucks to the end
place(music, brass([midi(62), midi(66), midi(69), midi(74)], DUR - 57.6), 57.6, 0.16)
for k, m in enumerate([62, 66, 69, 74, 78, 81, 86]): place(music, pluck(midi(m), 0.6, 0.6), 57.9 + k * 0.26, 0.22)


F = lambda f: f / 30
place(sfx, whoosh(0.9), F(28), 0.45)                       # crane up over Paris
place(sfx, engine(5.6), F(150), 0.55)                      # bombers over the street
place(sfx, engine(3.4, 74), F(292), 0.7)                   # behind the lead bomber
for fr in [439, 444, 449]: place(sfx, click(), F(fr), 0.6) # street lamps out
for fr in [458, 466]: place(sfx, click(), F(fr), 0.6)       # shop windows
place(sfx, click(), F(478), 0.7)                           # the station
place(sfx, thunk(55, 0.6), F(502), 0.6)                    # Paris goes dark
place(sfx, ting(), F(598), 0.5)                            # the idea
for k in range(14): place(sfx, hammer(), F(664) + k * 0.33 + (k % 3) * 0.05, 0.45)   # building the fake city
for fr in [812, 822, 832]: place(sfx, ting(), F(fr), 0.18)  # bulbs on
place(sfx, ting(), F(857), 0.35)                           # fake station lights
place(sfx, chug(4.0), F(896), 0.5)                         # fake train
place(sfx, engine(3.0), F(1017), 0.5)
for i in range(4): place(sfx, whistle(1.3), F(1058 + i * 5), 0.25); place(sfx, boom(), F(1098 + i * 5), 0.45)
place(sfx, sting(), F(1180), 0.8)                          # "Sauf que…"
place(sfx, whoosh(0.5), F(1348), 0.6)                      # time jump flash
for fr in [1405, 1420, 1438, 1452, 1466]: place(sfx, creak(0.5, 120), F(fr) - 0.3, 0.5); place(sfx, crash(0.9), F(fr), 0.35)
place(sfx, ting(), F(1606), 0.35)                          # the bulb in his hand
place(sfx, whoosh(0.5), F(1669), 0.6)                      # seven years later
for k in range(10): place(sfx, ting(), F(1740) + k * 0.19, 0.16)  # 250,000 bulbs, bottom to top


write_stems()
