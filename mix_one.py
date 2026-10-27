"""Audio of ONE clip (one sheet): score by mood + foley + narration + ambience. Run via mix_clips.py, which injects the dict CLIP."""
import os, sys, json, zlib
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d

HERE = Path(__file__).resolve().parent
LIB = Path(os.environ.get('LIB') or Path.home() / 'lemo-opuscar')
sys.path.insert(0, str(LIB / 'core' / 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, norm, compress, limit, add
import sfx, pluck as P

E = json.load(open(HERE / 'events.json')); C0, LEN = CLIP['c0'], CLIP['L']; N = int(round(LEN * SR))
EV = [dict(e, t=e['t'] - C0) for e in E['ev'] if ((C0 - .5 <= e['t'] < C0 + LEN) if e['type'] == 'scroll' else (C0 - 1e-6 <= e['t'] < C0 + LEN)) and e['type'] != 'sheet']
rng = np.random.default_rng(zlib.crc32(CLIP['id'].encode()))
nz = lambda d: rng.standard_normal(int(round(d * SR)))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def brown(d):
    w = np.cumsum(nz(d)); w -= np.linspace(w[0], w[-1], len(w)); return norm(hp(w, 20))
def fade(x, a=.005, r=.02):
    n = len(x); x = x.copy(); A, R = min(n, int(a * SR)), min(n, int(r * SR))
    if A: x[:A] *= np.linspace(0, 1, A)
    if R: x[n - R:] *= np.linspace(1, 0, R)
    return x
def sines(fs, d, taus, amps):
    tt = t_(d); return sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / tau) for f, tau, a in zip(fs, taus, amps))
def slow(d, rate, depth, seed=0):
    k = max(2, int(d * rate) + 3); r = np.random.default_rng(seed).random(k)
    return 1 - depth + depth * np.interp(np.linspace(0, k - 1, int(round(d * SR))), np.arange(k), r)

# —— paper, wood, water (foley) ——
def baren(d=.36, v=1):
    tt = t_(d); m = .55 + .45 * np.abs(np.sin(2 * np.pi * 4.6 * tt)); e = np.sin(np.pi * tt / d) ** .7
    return norm(bp(nz(d), 700, 5200) * m * e + lp(nz(d), 500) * e * .3) * v
def slip(v=1):
    d = .28; tt = t_(d); return norm(hp(nz(d), 1800) * np.sin(np.pi * tt / d) ** 2 * (1 - tt / d * .5)) * v
def seal(v=1):
    d = .35; x = sines([88, 180], d, [.07, .03], [1, .4]); x[:int(.012 * SR)] += bp(nz(.012), 200, 1500) * .9
    y = np.zeros(int(.45 * SR)); y[:len(x)] += x; k = int(.22 * SR); c = hp(nz(.08), 3000) * env_exp(.08, .02) * .15; y[k:k + len(c)] += c
    return norm(lp(y, 2500)) * v
def scroll(d, v=1):
    tt = t_(d); e = np.sin(np.pi * np.minimum(tt / d, 1)) ** 1.2; f = np.interp(tt, [0, d], [1200, 3200]); x = np.zeros_like(tt); blk = 2400; src = nz(d)
    for i in range(0, len(tt), blk): x[i:i + blk] = bp(src[max(0, i - 4800):i + blk], f[i] * .6, f[i] * 1.6)[-len(x[i:i + blk]):]
    cr = hp(nz(d), 4000) * (rng.random(len(tt)) > .9985) * 3
    return norm(x * e + lp(cr, 9000) * e * .4) * v
def block(v=1):
    d = .2; x = sines([180, 410, 960], d, [.05, .03, .015], [1, .6, .3]); x[:int(.004 * SR)] += nz(.004) * .5; return norm(lp(x, 3000)) * v
def geta(v=1):
    d = .16; x = sines([300, 700, 1500], d, [.03, .02, .01], [1, .6, .3]); x[:int(.004 * SR)] += bp(nz(.004), 500, 3500) * .8; return norm(lp(x, 3800)) * v
def snowstep(v=1):
    d = .22; tt = t_(d); return norm(bp(nz(d), 900, 3200) * np.sin(np.pi * np.minimum(tt / d, 1)) ** 2 * (1 + .6 * np.sin(2 * np.pi * 70 * tt))) * v
def hammer(v=1):
    d = .12; x = sines([620, 1500, 2600], d, [.02, .012, .006], [1, .6, .3]); x[:int(.003 * SR)] += nz(.003) * .6; return norm(x) * v
def firework(v=1):
    d = 2.2; tt = t_(d); boom = sines([55, 90], .9, [.25, .12], [1, .5]); y = np.zeros(int(d * SR)); y[:len(boom)] += boom
    k = int(.35 * SR); c = hp(nz(1.6), 2500) * (rng.random(int(1.6 * SR)) > .995) * 6; y[k:k + len(c)] += lp(c, 9000) * np.linspace(1, 0, len(c)) * .4; return norm(y) * v
def whoomp(v=1):
    d = 1.0; tt = t_(d); return norm(lp(nz(d), 500) * np.exp(-tt / .3) + np.sin(2 * np.pi * 48 * tt) * np.exp(-tt / .35)) * v
def horn(v=1):
    d = 2.6; tt = t_(d); e = np.minimum(tt / .5, 1) * np.minimum((d - tt) / .8, 1)
    return norm(lp((np.sin(2 * np.pi * 98 * tt) + .6 * np.sin(2 * np.pi * 147 * tt) + .3 * np.sin(2 * np.pi * 196 * tt)) * e, 1200)) * v
def crash_(v=1):
    d = .6; tt = t_(d); x = lp(nz(d), 5000) * np.exp(-tt / .25) + sines([48, 70], d, [.3, .2], [1.2, .6]) + hp(nz(d), 3000) * np.exp(-tt / .1) * .5; return norm(x) * v
def gun(v=1):
    d = .5; tt = t_(d); x = hp(nz(d), 700) * np.exp(-tt / .06) * 2 + lp(nz(d), 400) * np.exp(-tt / .09) + sines([70, 120], d, [.12, .06], [1, .5]); return norm(lp(x, 6000)) * v
def hoof(v=1, f=0):
    d = .14; x = sines([260, 520], d, [.03, .015], [1, .5]); x[:int(.003 * SR)] += bp(nz(.003), 400, 3000) * .6; return norm(lp(x, 2500)) * v
def clink(v=1):
    d = .5; x = sines([2100, 3300, 4700], d, [.1, .06, .03], [1, .6, .35]); x[:int(.002 * SR)] += hp(nz(.002), 3000); return norm(x) * v
def wind(d, v=1, lo=150, hi=900, seed=1): return norm(bp(brown(d) + nz(d) * .02, lo, hi) * slow(d, .6, .6, seed)) * v
def amb(w, d):
    tt = t_(d)
    if w == 'river': return wind(d, .5, 120, 700, 3) + lp(bp(nz(d), 1500, 5000) * slow(d, 3, .8, 4), 6000) * .08
    if w == 'town': return norm(bp(nz(d), 250, 1100) * slow(d, 2.5, .7, 5) + lp(brown(d), 200) * .3) * .35 + wind(d, .15, 100, 500, 6)
    if w == 'fire':
        pops = np.zeros_like(tt); idx = rng.integers(0, len(tt) - 600, int(d * 55))
        for i in idx: pops[i:i + 300] += np.exp(-np.arange(300) / 40) * (rng.random() - .5) * 4
        e = np.clip((tt - 0) / (d * .7), 0, 1) ** 1.2
        return norm((lp(brown(d), 900) * 1.2 + hp(pops, 900) * .6 + bp(nz(d), 300, 2500) * .3) * (.25 + .75 * e))
    if w == 'fest': return norm(bp(nz(d), 300, 1300) * slow(d, 3.5, .6, 8) + lp(brown(d), 260) * .25) * .5 + lp(bp(nz(d), 3000, 6000) * (rng.random(len(tt)) > .9992) * 5, 7000) * .1
    if w == 'snow': return wind(d, .3, 60, 260, 9) + wind(d, .12, 500, 1200, 10) * .5
    if w == 'sea':
        sw = .35 + .65 * (np.sin(2 * np.pi * tt / 4.2 - 1) * .5 + .5) ** 2; return norm(lp(brown(d), 700) * sw + bp(nz(d), 800, 5000) * sw ** 3 * .4) * .75
    if w == 'dawn': return wind(d, .3, 100, 600, 12) + lp(bp(nz(d), 2500, 5500) * (uniform_filter1d(np.abs(nz(d)), 1500) > .93), 7000) * .08
    if w == 'rain': return norm(bp(nz(d), 1500, 7000) * slow(d, 8, .25, 20) + lp(brown(d), 300) * .2) * .8
    if w == 'field': return wind(d, .3, 100, 500, 21) + lp(bp(nz(d), 2500, 5500) * slow(d, 2, .8, 22), 6000) * .05
    if w == 'fog': return wind(d, .35, 80, 400, 23) + lp(brown(d), 160) * .2
    return np.zeros_like(tt)

# —— instruments ——
def taiko(v=1):
    d = 1.4; tt = t_(d); f = 52 + 78 * np.exp(-tt / .05); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-tt / .3) + lp(nz(d), 500) * np.exp(-tt / .035) * .9 + np.sin(ph * 2.01) * .18 * np.exp(-tt / .12); return norm(x) * v
def shaku(m, d, v=.8, meri=True):
    f0 = hz(m); tt = t_(d); f = f0 * (1 - .035 * np.exp(-tt / .09)) * (1 + .004 * np.sin(2 * np.pi * 5.1 * tt) * np.clip(tt / 1.2, 0, 1))
    if meri: f = f * (1 - .03 * np.clip((tt - (d - .4)) / .4, 0, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR; x = np.sin(ph) + .28 * np.sin(2 * ph) + .12 * np.sin(3 * ph) + .05 * np.sin(4 * ph)
    env = np.minimum(tt / .14, 1) * np.minimum((d - tt) / .3, 1); br = bp(nz(d), 1200, 4500) * (.08 + .3 * np.exp(-tt / .1))
    return norm((x + br) * env) * v
def pl(preset, p, d, v=.8, **kw): return norm(P.pluck(preset, p, d, vel=v, **kw))
def hyoshigi(v=1): return np.concatenate([sfx.clack(1.7, v), np.zeros(int(.03 * SR)), sfx.clack(1.9, v * .9)])
sc = lambda *a: None

mu = np.zeros((N, 2)); fx = np.zeros((N, 2)); ab = np.zeros((N, 2)); vo = np.zeros((N, 2))
BE = 60. / 72
def pluck_seq(preset, notes, gain, pan=0):
    for t, p, d, v in notes: add(mu, pl(preset, p, d, v), t, gain, pan)

# —— score: driven by the mood of each sheet (consecutive sheets with the same mood form one segment) ——
OST = ['D3', 'A3', 'D4', 'G3', 'A3', 'G3', 'D4', 'Eb3']
PEN = ['D4', 'Eb4', 'G4', 'A4', 'Bb4', 'D5', 'A4', 'G4']
SHAKU = [74, 69, 70, 62, 65, 69]
def mood_score(m, a, b):
    n = 0
    if m == 'march':
        for k, t in enumerate(np.arange(a + .3, b - .4, 1.0)): add(mu, taiko(.5 + .3 * (k % 4 == 0)), t, .5, 0)
        for k, t in enumerate(np.arange(a + .7, b - .3, .3125)):
            if k % 2 == 0 or k % 8 in (3, 7): add(mu, pl('shamisen', OST[k % 8], .5, .45 + .2 * (k % 4 == 0)), t, .42, -.2)
        for t in np.arange(a + 6.0, b - 1, 9.0): add(mu, hyoshigi(1), t, .45, 0)
    elif m in ('tense', 'fire'):
        t = a + .5; gap = 1.1
        while t < b - 1.0: add(mu, taiko(.4 + .5 * (t - a) / max(1, b - a)), t, .6, 0); t += gap; gap = max(.16, gap * .9)
        trem = ['D4', 'Eb4', 'G4', 'A4', 'Bb4', 'D5', 'Eb5', 'G5']
        for k in range(8):
            tt = b - 3.4 + k * .4
            if tt > a: add(mu, pl('shamisen', trem[k], .8, .8, trem=14), tt, .45, .2)
        add(mu, taiko(1.1), b - .6, .9, 0)
    elif m == 'rain':
        for i, t in enumerate(np.arange(a + .5, b - 2.6, 4.4)): add(mu, shaku(SHAKU[(i + 3) % 6] - 12, 3.2, .7), t, .5, .1)
        for t in np.arange(a + 1.0, b - 1, 1.5): add(mu, taiko(.3), t, .45, 0)
    elif m == 'sea':
        for i, t in enumerate(np.arange(a + .5, b - 2.8, 5.2)): add(mu, shaku(SHAKU[i % 6], 3.0, .7), t, .5, .1)
        for k, t in enumerate(np.arange(a + 1.5, b - 1.5, 1.67)): add(mu, pl('koto', PEN[(k * 3) % 8], 1.2, .5), t, .4, .2 if k % 2 else -.2)
    elif m == 'think':
        for k, t in enumerate(np.arange(a + .8, b - 1.3, 1.67)): add(mu, pl('koto', PEN[(k * 3) % 8], 1.1, .45), t, .35, .25 if k % 2 else -.25)
        for i, t in enumerate(np.arange(a + 2.0, b - 3.0, 7.0)): add(mu, shaku(SHAKU[i % 6], 2.6, .5), t, .28, .1)
    else:   # calm
        for k, t in enumerate(np.arange(a + .6, b - 1.3, .8333)): add(mu, pl('koto', PEN[(k * 3) % 8], 1.2, .5), t, .45, .25 if k % 2 else -.25)
        for i, t in enumerate(np.arange(a + 1.0, b - 3.0, 5.5)): add(mu, shaku(SHAKU[i % 6], 2.8, .6), t, .35, .1)
        for k, t in enumerate(np.arange(a + 1.2, b - 1.4, 1.667)): add(mu, pl('shamisen', ['D3', 'A3', 'G3', 'D3'][k % 4], 1.3, .45), t, .35, -.2)
SEGS = [[0.0, CLIP['sheet_t1'] - CLIP['sheet_t0'], CLIP['mood']]]
AMBW = {'rain': 'rain', 'fire': 'fire', 'sea': 'sea'}
for a, b, m in SEGS:
    mood_score(m, a, b)
    add(ab, fade(amb(AMBW.get(m, 'field'), min(b - a, 60)), .4, .4), a, {'sea': .3, 'fire': .3, 'rain': .3}.get(AMBW.get(m, 'field'), .16), 0)

# —— foley and ambience from the events ——
VOICE = {}
for e in EV:
    t, ty, v = e['t'], e['type'], e.get('v', 1)
    if ty == 'vo':
        y, sr = sf.read(HERE / 'voices' / (e['id'] + '.wav'))
        if y.ndim > 1: y = y.mean(1)
        y = resample_poly(y, SR, sr); VOICE[e['id']] = (t, len(y) / SR); add(vo, y, t, 1.0, 0)
    elif ty == 'baren': add(fx, baren(e['d'], v), t, .32, .1)
    elif ty == 'block': add(fx, block(v), t, .3, -.1)
    elif ty == 'slip': add(fx, slip(v), t, .18, .2)
    elif ty == 'seal': add(fx, seal(v), t, .5, 0)
    elif ty == 'scroll': add(fx, scroll(e['d'], v), t, .22, 0)
    elif ty == 'geta': add(fx, geta(v), t, .1, -.1 + rng.random() * .2)
    elif ty == 'snowstep': add(fx, snowstep(), t, .16, 0)
    elif ty == 'hammer': add(fx, hammer(), t, .12, -.3)
    elif ty == 'firework': add(fx, firework(), t + .25, .3, .1)
    elif ty == 'crackle': pass
    elif ty == 'whoomp': add(fx, whoomp(v if v else 1), t, .6, 0)
    elif ty == 'horn': add(fx, horn(v), t, .3, .3)
    elif ty == 'crash': add(fx, crash_(1), t - .04, .9, 0)
    elif ty == 'gun': add(fx, gun(v), t, .5, rng.random() * .6 - .3)
    elif ty == 'hoof': add(fx, hoof(v), t, .12 if not e.get('f') else .06, rng.random() * .4 - .2)
    elif ty == 'clink': add(fx, clink(v), t, .12, rng.random() * .6 - .3)
    elif ty == 'amb': add(ab, fade(amb(e['w'], e['d']), .4, .4), t, {'sea': .3, 'fire': .3, 'rain': .3}.get(e['w'], .22), 0)

vm = compress(vo[:, 0] * 1.414, .2, 3, .004, .1); vo = np.stack([vm, vm], 1) / 1.414
room = np.zeros_like(vo); dl = int(.023 * SR); room[dl:] = vo[:-dl] * .12; vo = vo + lp(room, 3000)
duck = np.ones(N)
for id_, (t0, d) in VOICE.items():
    a, b = int((t0 - .25) * SR), int((t0 + d + .3) * SR); duck[a:b] = np.minimum(duck[a:b], .3)
duck = uniform_filter1d(duck, int(.25 * SR))
mu *= duck[:, None]; ab *= np.sqrt(duck)[:, None]; fx *= np.sqrt(duck)[:, None]
MIX = mu * 1.0 + vo * 2.0 + fx * 1.0 + ab * 1.0
# short fades at the clip edges (no clicks); the last clip also carries the wash to paper and the final seal
def edge_fade(m, a=.03, r=.03):
    A, R = int(a * SR), int(r * SR)
    m[:A] *= np.linspace(0, 1, A)[:, None]; m[N - R:] *= np.linspace(1, 0, R)[:, None]
if CLIP['last']:
    _f = [e for e in EV if e['type'] == 'final'][0]; _s = [e for e in EV if e['type'] == 'seal'][-1]['t']
    _a, _b = int(_f['t'] * SR), int((_f['t'] + 1.4) * SR); MIX[_a:_b] *= np.linspace(1, .3, _b - _a)[:, None]
    _c, _d = int((_f['t'] + 1.4) * SR), int((_s - .05) * SR); MIX[_c:_d] = 0
    k = int((_s + 1.2) * SR); MIX[k:] *= np.linspace(1, 0, N - k)[:, None]
edge_fade(MIX, .01 if CLIP['i'] == 0 else .03, .03 if not CLIP['last'] else .01)
for c in range(2): MIX[:, c] = limit(MIX[:, c], .5)
os.makedirs(os.path.dirname(CLIP['out']), exist_ok=True)
sf.write(CLIP['out'], MIX.astype(np.float32), SR)
