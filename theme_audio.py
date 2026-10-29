"""Sound of the news package (see Lemo-Opuscar styles/news-package/STYLE.md section 8). No samples: strings/brass/pads are synthesised here (band-limited saws through low-pass filters),
plucked parts use core/audio/pluck.py, foley uses core/audio/sfx.py.  120 BPM (beat = 0.5 s), E minor news theme; the bar is 2.0 s.
   score(mood, a, b, K)    music for this sheet. Moods: march = full theme (opening) / think = octave down, tremolo, steady kick (markets) / calm = pizzicato and horn pads only (policy)
                           tense = low tremolo + timpani heartbeat / fire = lift to G major with a brass stab and glockenspiel figure (last story)
   ambience(mood, K)       soft air or a low hum
   foley(type, event, K)   hit (sting tutti) glock (n = scale step) flap tick stamp break (the heaviest hit) scroll (band wipe) chapter title seal (end-card tutti)"""
import numpy as np

BEAT = .5
MIN = [(40, 'm'), (36, 'M'), (43, 'M'), (38, 'M')]           # Em C G D  (i VI III VII), root MIDI in the low octave
MAJ = [(43, 'M'), (38, 'M'), (40, 'm'), (36, 'M')]           # G D Em C  (I V vi IV)
TRI = {'m': (0, 3, 7), 'M': (0, 4, 7)}
GLOCK = [76, 79, 81, 83, 86, 88, 91, 93]                     # E minor pentatonic-ish steps for glockenspiel notes


def _t(K, d): return np.arange(int(round(d * K['SR']))) / K['SR']

def saw(K, f, d, detune=0.0):
    t = _t(K, d); x = 2 * ((t * f) % 1) - 1
    if detune: x = (x + 2 * ((t * f * (1 + detune)) % 1) - 1) * .5
    return x

def env(K, d, a=.005, tau=.2, rel=.01):
    t = _t(K, d); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / tau); n = len(e); r = min(n, int(rel * K['SR']))
    if r: e[n - r:] *= np.linspace(1, 0, r)
    return e

def violin(K, m, d, cut=3600, tau=.14):                      # spiccato: short bowed saw, vibrato-free, filtered
    x = saw(K, K['hz'](m), d, .004) * env(K, d, .006, tau, .015); return K['norm'](K['lp'](x, cut))

def horn(K, m, d, cut=1100):                                 # soft brass: slow attack saw stack
    x = (saw(K, K['hz'](m), d, .003) + .6 * saw(K, K['hz'](m + .06), d)) * env(K, d, .22, 9, .25); return K['norm'](K['lp'](x, cut, 3))

def bell(K, m, d=1.4):                                       # glockenspiel: inharmonic sine partials
    f = K['hz'](m); t = _t(K, d); x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau) for r, a, tau in [(1, 1, .5), (2.76, .5, .3), (5.4, .3, .15), (8.9, .12, .08)])
    x[:int(.002 * K['SR'])] *= np.linspace(0, 1, int(.002 * K['SR'])); return K['norm'](x)

def kick(K, v=1.0):
    d = .28; t = _t(K, d); ph = 2 * np.pi * np.cumsum(48 + 110 * np.exp(-t / .035)) / K['SR']; return K['norm'](np.sin(ph) * np.exp(-t / .1) + K['lp'](K['nz'](d), 800) * np.exp(-t / .006) * .4) * v

def snare(K, v=1.0):
    d = .22; t = _t(K, d); return K['norm'](K['bp'](K['nz'](d), 1800, 7000) * np.exp(-t / .06) + np.sin(2 * np.pi * 190 * t) * np.exp(-t / .05) * .5) * v

def timp(K, m=40, d=1.3, v=1.0):                             # timpani: pitched thump with a slight drop, plus skin noise
    t = _t(K, d); f = K['hz'](m); x = np.sin(2 * np.pi * np.cumsum(f * (1 + .22 * np.exp(-t / .05))) / K['SR']) * np.exp(-t / .45) + .5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / .25)
    x += K['lp'](K['nz'](d), 500) * np.exp(-t / .02) * .6; return K['norm'](x) * v

def crash(K, d=1.8, v=1.0):
    t = _t(K, d); return K['norm'](K['hp'](K['nz'](d), 3500) * np.exp(-t / .55)) * v

def chord(m, q): return [m + i for i in TRI[q]]


def score(mood, a, b, K):
    pl, mu, hz = K['pl'], K['mu'], K['hz']
    add = lambda buf, x, at, g=1.0, p=0.0: K['add'](buf, x, at, g * 1.7, p)       # music sits about 4 dB louder than the raw note levels below
    prog = MAJ if mood == 'fire' else MIN
    nb = int((b - a) / (4 * BEAT)) + 1
    for bar in range(nb):
        t0 = a + bar * 4 * BEAT
        if t0 > b - .4: break
        root, q = prog[bar % 4]; ch = chord(root, q); pan = (-.15, .15)[bar % 2]
        L = min(4 * BEAT, b - t0)
        if mood in ('march', 'fire'):
            up = 12 if mood == 'fire' else 0
            arp = [ch[0] + 12 + up, ch[2] + 12 + up, ch[0] + 24 + up, ch[2] + 12 + up]
            for k in range(8):                                   # spiccato violins: root-fifth-octave eighths
                add(mu, violin(K, arp[k % 4], .22), t0 + k * BEAT / 2, .2 + .06 * (k % 2 == 0), (-.3, .3)[k % 2])
            for k in range(4):                                   # pizzicato bass on the beat
                add(mu, pl('upright_bass_pizz', root + 12, .45, .8), t0 + k * BEAT, .36, -.1)
            for m in ch[:3]: add(mu, horn(K, m + 24, min(L + .3, 2.3)), t0, .07, pan)
            for k in range(16):                                  # low-passed 16th-note pulse
                add(mu, K['lp'](saw(K, hz(root + 12), .1) * env(K, .1, .003, .05), 520), t0 + k * BEAT / 4, .1, 0)
            add(mu, kick(K), t0, .5, 0); add(mu, kick(K), t0 + 2 * BEAT, .5, 0); add(mu, snare(K), t0 + BEAT, .28, .1); add(mu, snare(K), t0 + 3 * BEAT, .28, .1)
            if mood == 'fire' and bar % 2 == 0:
                for j, m in enumerate([ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[0] + 36]): add(mu, bell(K, m, .8), t0 + 2 * BEAT + j * BEAT / 2, .12, .3)
        elif mood in ('think', 'tense'):
            for k in range(16):                                  # tremolo violins an octave down: 16ths, swelling through the bar
                m = ch[(0, 2, 1, 2)[k % 4]] + 12
                add(mu, violin(K, m, .13, 2400, .09), t0 + k * BEAT / 4, (.09 + .05 * k / 16) * (1.25 if mood == 'tense' else 1), (-.25, .25)[k % 2])
            for k in range(4):
                add(mu, kick(K), t0 + k * BEAT, .34 if mood == 'think' else .22, 0)              # four on the floor (heartbeat)
                add(mu, pl('upright_bass_pizz', root + 12, .4, .7), t0 + k * BEAT + BEAT / 2, .22, -.1)
            add(mu, horn(K, ch[0] + 12, min(L + .3, 2.3), 800), t0, .09, pan)
            if mood == 'tense': add(mu, timp(K, 40, 1.2, .7), t0, .3, 0); add(mu, timp(K, 40, 1.2, .5), t0 + 2 * BEAT, .22, 0)
        else:                                                    # calm: pizzicato and horns only
            for k in range(4):
                add(mu, pl('upright_bass_pizz', root + 12, .5, .75), t0 + k * BEAT, .3, -.1)
            for k, m in enumerate([ch[0] + 24, ch[2] + 24, ch[1] + 24, ch[2] + 24, ch[0] + 36, ch[2] + 24, ch[1] + 24, ch[2] + 24]):
                add(mu, pl('harp', m, .6, .55), t0 + k * BEAT / 2, .22, (-.3, .3)[k % 2])
            for m in ch: add(mu, horn(K, m + 12, min(L + .4, 2.4), 900), t0, .09, pan)


def ambience(mood, K):
    wind = K['wind']
    if mood in ('think', 'tense'):                               # low room hum under the data graphics
        def hum(d):
            t = np.arange(int(d * K['SR'])) / K['SR']; return (np.sin(2 * np.pi * 50 * t) + .5 * np.sin(2 * np.pi * 100.2 * t) + .15 * np.sin(2 * np.pi * 150 * t)) * (.8 + .2 * np.sin(2 * np.pi * .3 * t))
        return hum, .035
    return (lambda d: wind(d, .3, 80, 700, 7)), .06


def _mixto(K, parts, d):
    out = np.zeros(int(d * K['SR']))
    for x, at, g in parts:
        s = int(at * K['SR']); e = min(len(out), s + len(x));
        if s < len(out): out[s:e] += x[:e - s] * g
    return out


def foley(ty, e, K):
    sfx = K['sfx']; v = e.get('v', 1)
    if ty == 'scroll':                                           # band wipe: whoosh + a soft timpani as the band crosses the middle
        d = max(.3, e.get('d', .9)); return K['norm'](_mixto(K, [(sfx.whoosh(d, 1), 0, 1.0), (timp(K, 40, .9, 1), d * .5, .5)], d + .9)), .2, 0
    if ty in ('chapter', 'title'):
        return bell(K, 88, 1.6), .22, 0
    if ty == 'hit':                                              # sting tutti: brass chord + timpani + crash + bass drum
        d = 1.8; br = sum(K['lp'](saw(K, K['hz'](m), 1.0, .004) * env(K, 1.0, .01, .45, .05), 2600, 3) for m in (52, 59, 64, 71))
        return K['norm'](_mixto(K, [(K['norm'](br), 0, .8), (timp(K, 40, 1.4, 1), 0, .9), (crash(K, 1.6), 0, .45), (kick(K), 0, .8)], d)), .5, 0
    if ty == 'glock':
        return bell(K, GLOCK[int(e.get('n', 0)) % len(GLOCK)], 1.4), .3, (-.2, 0, .2)[int(e.get('n', 0)) % 3]
    if ty == 'flap':
        return sfx.click(1.1 + .25 * np.sin(e['t'] * 97), .8), .22, .1
    if ty == 'tick':
        return sfx.step(1.0), .2, -.1
    if ty == 'stamp':                                            # thump + a low-passed clack (no bright brass, so it never masks the word)
        return K['norm'](_mixto(K, [(sfx.thump(1, 60), 0, 1.0), (K['lp'](sfx.clack(.8), 1800), .01, .6)], .45)), .4, 0
    if ty == 'break':                                            # the heaviest hit of the film: low brass, timpani, crash, bass drum, rumble
        d = 3.0; br = sum(K['lp'](saw(K, K['hz'](m), 1.6, .004) * env(K, 1.6, .02, .8, .1), 1300, 3) for m in (28, 40, 47, 52))
        return K['norm'](_mixto(K, [(K['norm'](br), 0, .8), (timp(K, 28, 2.0, 1), 0, 1.0), (crash(K, 2.4), 0, .55), (kick(K), 0, .9), (sfx.rumble(2.2, 1), 0, .6)], d)), .6, 0
    if ty == 'seal':                                             # end card: E major tutti
        d = 3.2; br = sum(K['lp'](saw(K, K['hz'](m), 2.2, .004) * env(K, 2.2, .02, 1.2, .2), 2200, 3) for m in (40, 52, 56, 59, 64))
        return K['norm'](_mixto(K, [(K['norm'](br), 0, .8), (timp(K, 40, 2.0, 1), 0, .9), (crash(K, 2.8), 0, .5), (bell(K, 88, 2.2), .1, .3)], d)), .45, 0
    return None
