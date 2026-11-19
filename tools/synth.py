"""Shared sound synthesizers for the studio (music bed + SFX). Import in an episode's audio.py:
    from synth import *          # (tools/ is on sys.path when run through tools/run_audio.py)
    init(duration_seconds)       # sets the buffers; then place(music, ..., t) / place(sfx, ..., t); then write_stems()
Everything is mono, 48 kHz. Stems are peak-normalised; tools/mix.py locks the levels to the voice."""
import numpy as np, wave
SR = 48000
rng = np.random.default_rng(7)
N = 0; DUR = 0.0; music = None; sfx = None
def init(duration):
    global N, DUR, music, sfx
    DUR = float(duration); N = int(DUR * SR); music = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
    return music, sfx
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if i < len(buf) and j > i: buf[i:j] += sig[: j - i] * gain
def env(n, a=0.005, r=0.2, sus=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e

def lp(x, k):  # one-pole low-pass, k in (0,1)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += k * (x[i] - acc); y[i] = acc
    return y

def lp_fast(x, cutoff):
    # FFT brick-ish low-pass (fast, fine for beds)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)


midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- instruments ----------------
def pluck(f, dur=0.35, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def brass(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    a = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15).clip(0)
    return lp_fast((s * a).astype(np.float32), 1800) / len(fs)
def drum(kind):
    if kind == "kick":
        n = int(0.35 * SR); t = np.arange(n) / SR; f = 50 + 90 * np.exp(-t * 30)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
    n = int(0.18 * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * 28) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.5
    return hp_fast(s.astype(np.float32), 300)



# ---------------- sfx ----------------
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def thunk(f0=90, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp_fast(noise(d), 1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def rumble(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 160) * 3 * np.minimum(1, t / 0.15) * np.exp(-t / (d * 0.45))
    return s.astype(np.float32)
def crash(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for k in range(14):
        tk = rng.uniform(0, d * 0.6); i = int(tk * SR); g = thunk(rng.uniform(60, 160), 0.35) * rng.uniform(0.3, 0.9)
        s[i:i + len(g)] += g[: n - i]
    s += lp_fast(noise(d), 2500) * np.exp(-t * 3) * 0.25
    return s
def cuckoo():
    out = []
    for f, d in [(740, 0.16), (587, 0.24)]:
        n = int(d * SR); t = np.arange(n) / SR
        out.append(np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.exp(-t * 6)); out.append(np.zeros(int(0.06 * SR)))
    return np.concatenate(out).astype(np.float32)
def scrape(d=0.8):
    n = int(d * SR); t = np.arange(n) / SR
    s = noise(d) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t)) * np.sin(np.pi * t / d)
    s = hp_fast(lp_fast(s, 5000), 1500)
    ring = np.sin(2 * np.pi * 1870 * t) * np.exp(-t * 3) * 0.2
    return (s * 0.6 + ring).astype(np.float32)
def ting():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (3136, 6), (4186, 8)]) * 0.3).astype(np.float32)
def sting():
    n = int(2.0 * SR); t = np.arange(n) / SR
    low = np.sin(2 * np.pi * 41 * t) * np.exp(-t * 1.5) * 1.2
    hit = lp_fast(noise(2.0), 900) * np.exp(-t * 6) * 0.8
    stab = brass([midi(45), midi(48), midi(51)], 1.4); s = low + hit; s[: len(stab)] += stab * 2.2 * np.exp(-np.arange(len(stab)) / SR * 2)
    return s.astype(np.float32)
def creak(d=0.6, f0=140):
    n = int(d * SR); t = np.arange(n) / SR
    rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))
    ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    s = lp_fast(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), 2200) * np.sin(np.pi * t / d)
    return hp_fast(s, 200) * 2.5
def snap():
    d = 0.5; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 800) * np.exp(-t * 18) * 1.4 + np.pad(thunk(120, 0.4), (0, n - int(0.4 * SR))) * 0.6).astype(np.float32)
def splash(d=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 4000) * (np.exp(-t * 4) * np.minimum(1, t / 0.01)) + lp_fast(noise(d), 400) * np.exp(-t * 7) * 1.5
    return s.astype(np.float32)
def whoosh(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def snore(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR
    buzz = (np.mod(np.cumsum(60 + 25 * np.sin(np.pi * t / d)) / SR, 1) < 0.3).astype(np.float32)
    return (lp_fast(buzz * 0.5 + noise(d) * 0.15, 700) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def leaves(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 6000), 2500) * (0.3 + 0.3 * np.sin(2 * np.pi * 0.7 * t) ** 2) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def water(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 900) * 0.5 + hp_fast(lp_fast(noise(d), 3000), 1200) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t))).astype(np.float32)

def engine(d, f0=68):
    n = int(d * SR); t = np.arange(n) / SR
    saw = (np.mod(f0 * t * (1 + 0.01 * np.sin(2 * np.pi * 0.7 * t)), 1) * 2 - 1) + 0.6 * (np.mod(f0 * 1.51 * t, 1) * 2 - 1)
    s = lp_fast(saw.astype(np.float32), 520) + lp_fast(noise(d), 300) * 0.4
    return (s * np.sin(np.pi * t / d) ** 1.5).astype(np.float32)
def whistle(d=1.3):
    n = int(d * SR); t = np.arange(n) / SR; f = 1500 - 900 * (t / d)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.1) * 0.5).astype(np.float32)
def click():
    n = int(0.06 * SR); t = np.arange(n) / SR
    return (hp_fast(noise(0.06), 1500) * np.exp(-t * 90) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 60) * 0.5).astype(np.float32)
def hammer(): return thunk(160, 0.18) * 0.8 + np.pad(click(), (0, int(0.18 * SR) - int(0.06 * SR))) * 0.5
def chug(d):
    n = int(d * SR); out = np.zeros(n, np.float32); k = 0.0
    while k < d - 0.2:
        i = int(k * SR); b = lp_fast(noise(0.16), 900) * np.exp(-np.arange(int(0.16 * SR)) / SR * 22); out[i:i + len(b)] += b[: n - i]; k += 0.25
    return out * np.minimum(1, np.arange(n) / SR / 0.5) * np.minimum(1, (d - np.arange(n) / SR) / 0.5)
def boom():
    return (rumble(1.6) * 1.2 + np.pad(crash(1.0), (0, int(1.6 * SR) - int(1.0 * SR))) * 0.6).astype(np.float32)


def write_stems(prefix=""):
    def w(name, x):
        m = max(np.abs(x).max(), 1e-6); pcm = (np.clip(x / m * 0.9, -1, 1) * 32767).astype(np.int16)
        with wave.open(prefix + name, "wb") as f: f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    w("music.wav", music); w("sfx.wav", sfx)
