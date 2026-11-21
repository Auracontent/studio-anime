#!/usr/bin/env python3
"""Level-locked mix: music bed at MUSIC_DB under the voice's gated RMS (default -12 dB), SFX at SFX_DB (default -8 dB) with peaks
capped at 0.6x the voice peak, so the narration always stays clear (viewers on phone speakers). One linear gain + a peak limiter
on the whole mix; no ducking or compression.
usage: [MUSIC_DB=-12] [SFX_DB=-8] python3 mix.py voice.wav music.wav sfx.wav  ->  mix_raw.wav"""
import os, sys, subprocess, wave, numpy as np
SR = 48000
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def gated_rms(x, win=0.05, gate_db=-40):
    n = int(win * SR); k = len(x) // n
    r = np.sqrt((x[: k * n].reshape(k, n) ** 2).mean(1) + 1e-12)
    th = r.max() * 10 ** (gate_db / 20); act = r[r > th]
    return float(np.sqrt((act ** 2).mean())) if len(act) else 1e-9
db = lambda a: 20 * np.log10(max(a, 1e-12))
v, m, s = (load(p) for p in sys.argv[1:4])
N = len(v); m = np.pad(m, (0, max(0, N - len(m))))[:N]; s = np.pad(s, (0, max(0, N - len(s))))[:N]
vr, vp = gated_rms(v), np.abs(v).max()
MUSIC = 10 ** (float(os.environ.get('MUSIC_DB', '-12')) / 20); SFX = 10 ** (float(os.environ.get('SFX_DB', '-8')) / 20)
m *= MUSIC * vr / gated_rms(m)
gs = SFX * vr / gated_rms(s, gate_db=-30)
gs = min(gs, 0.6 * vp / max(np.abs(s).max(), 1e-9)); s *= gs
mix = v + m + s
g = 0.89 / max(np.abs(mix).max(), 1e-9)          # one linear gain to -1 dBFS peak
mix *= g
mix = np.where(np.abs(mix) > 0.89, np.sign(mix) * (0.89 + 0.1 * np.tanh((np.abs(mix) - 0.89) / 0.1)), mix)  # peak limiter
fade = int(0.04 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"voice gated RMS {db(vr):.1f} dBFS | music {db(gated_rms(m)) - db(vr):+.1f} dB vs voice | sfx {db(gated_rms(s, gate_db=-30)) - db(vr):+.1f} dB vs voice, sfx peak {np.abs(s).max() / vp:.2f}x voice peak | duration {N / SR:.2f}s")
