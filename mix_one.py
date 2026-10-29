"""Audio of ONE clip (one sheet): score by mood + foley + narration + ambience. Run via mix_clips.py, which injects the dict CLIP.
Generic: all style-specific sound (instruments, moods, foley for events) lives in theme_audio.py; this file only mixes (voice on top, ducking, edge fades)."""
import os, sys, json, zlib, importlib.util
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
def wind(d, v=1, lo=150, hi=900, seed=1): return norm(bp(brown(d) + nz(d) * .02, lo, hi) * slow(d, .6, .6, seed)) * v
def pl(preset, p, d, v=.8, **kw): return norm(P.pluck(preset, p, d, vel=v, **kw))

mu = np.zeros((N, 2)); fx = np.zeros((N, 2)); ab = np.zeros((N, 2)); vo = np.zeros((N, 2))
K = dict(SR=SR, N=N, rng=rng, nz=nz, hz=hz, brown=brown, fade=fade, sines=sines, slow=slow, wind=wind, pl=pl, P=P, sfx=sfx,
         t_=t_, env_exp=env_exp, bp=bp, lp=lp, hp=hp, norm=norm, add=add, mu=mu, fx=fx, ab=ab, np=np, CLIP=CLIP)
spec = importlib.util.spec_from_file_location('theme_audio', HERE / 'theme_audio.py'); TA = importlib.util.module_from_spec(spec); spec.loader.exec_module(TA)

# —— score + ambience: driven by the mood of this sheet ——
a, b, m = 0.0, CLIP['sheet_t1'] - CLIP['sheet_t0'], CLIP['mood']
TA.score(m, a, b, K)
w, g = TA.ambience(m, K)
if w is not None:
    add(ab, fade(w(min(b - a, 60)), .4, .4), a, g, 0)

# —— foley and narration from the events ——
VOICE = {}
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'vo':
        y, sr = sf.read(HERE / 'voices' / (e['id'] + '.wav'))
        if y.ndim > 1: y = y.mean(1)
        y = resample_poly(y, SR, sr); VOICE[e['id']] = (t, len(y) / SR); add(vo, y, t, 1.0, 0)
    else:
        r = TA.foley(ty, e, K)
        if r is not None:
            y, gain, pan = r; add(fx, y, t, gain, pan)

vm = compress(vo[:, 0] * 1.414, .2, 3, .004, .1); vo = np.stack([vm, vm], 1) / 1.414
room = np.zeros_like(vo); dl = int(.023 * SR); room[dl:] = vo[:-dl] * .12; vo = vo + lp(room, 3000)
duck = np.ones(N)
for id_, (t0, d) in VOICE.items():
    a0, b0 = max(0, int((t0 - .25) * SR)), int((t0 + d + .3) * SR); duck[a0:b0] = np.minimum(duck[a0:b0], .3)
duck = uniform_filter1d(duck, int(.25 * SR))
mu *= duck[:, None]; ab *= np.sqrt(duck)[:, None]; fx *= np.sqrt(duck)[:, None]
MIX = mu * 1.0 + vo * 2.0 + fx * 1.0 + ab * 1.0
def edge_fade(m_, a_=.03, r_=.03):
    A, R = int(a_ * SR), int(r_ * SR)
    m_[:A] *= np.linspace(0, 1, A)[:, None]; m_[N - R:] *= np.linspace(1, 0, R)[:, None]
if CLIP['last']:                       # the last clip carries the fade to the end card and the closing sound
    _f = [e for e in EV if e['type'] == 'final'][0]; _s = [e for e in EV if e['type'] == 'seal'][-1]['t']
    _a, _b = int(_f['t'] * SR), int((_f['t'] + 1.4) * SR); MIX[_a:_b] *= np.linspace(1, .3, _b - _a)[:, None]
    _c, _d = int((_f['t'] + 1.4) * SR), int((_s - .05) * SR)
    if _d > _c: MIX[_c:_d] = 0
    k = int((_s + 1.2) * SR); MIX[k:] *= np.linspace(1, 0, N - k)[:, None]
edge_fade(MIX, .01 if CLIP['i'] == 0 else .03, .03 if not CLIP['last'] else .01)
for c in range(2): MIX[:, c] = limit(MIX[:, c], .5)
os.makedirs(os.path.dirname(CLIP['out']), exist_ok=True)
sf.write(CLIP['out'], MIX.astype(np.float32), SR)
