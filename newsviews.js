// News sheets: every sheet of the morning-paper film is built from plain data (issue.json), no hand-drawn picture per day.
// Kinds: cover | story | number | flow | compare | digest | outro.  Items appear at fractions f (0..1) of the sheet length; keep notes above y=850 (subtitles cover ~915+).
import { PAL } from './print.js';
import { diagramView } from './diagram.js';
const S = PAL.sumi;
// genre -> box colour + background tint
const GENRE = {
  '政治': ['rice', PAL.beniP], '経済': ['ochre', PAL.ochreL], '国際': ['blue', PAL.skyL], '社会': ['grey', PAL.greyL],
  '科学': ['green', PAL.greenL], 'IT': ['blue', PAL.skyL], 'ビジネス': ['ochre', PAL.ochreL], 'スポーツ': ['green', PAL.greenL],
  '文化': ['rice', PAL.beniP], '健康': ['green', PAL.greenL], '暮らし': ['ochre', PAL.ochreL], '環境': ['blue', PAL.skyL],
};
const gcol = g => (GENRE[g] || ['paper', PAL.skyL])[0];
const gtint = g => (GENRE[g] || ['paper', PAL.skyL])[1];

// wrap Japanese text to lines of at most n chars, breaking after 、。 or spaces when possible
export function wrap(str, n, maxLines = 99) {
  const out = []; let s = String(str || '').replace(/\s+/g, ' ').trim();
  while (s.length > n && out.length < maxLines - 1) {
    let cut = -1;
    for (let i = n; i >= Math.floor(n * .55); i--) { if ('、。，．！？ '.includes(s[i - 1])) { cut = i; break; } }
    if (cut < 0) cut = n;
    out.push(s.slice(0, cut).trim()); s = s.slice(cut).trim();
  }
  if (s) out.push(s);
  if (out.length > maxLines) out.length = maxLines;
  return out;
}
const T = (f, x, y, str, o = {}) => ({ k: 'text', f, d: .5, x, y, str, ...o });
const head = (title, f = 0, size = 60, n = 20) => {
  const L = wrap(title, n, 2), items = [];
  L.forEach((ln, i) => items.push(T(f + i * .02, 130, 118 + i * size * 1.28, ln, { align: 'left', size })));
  const w = Math.max(...L.map(l => l.length)) * size;
  items.push({ k: 'pen', f: f + .05, d: .6, x0: 128, x1: 128 + Math.min(w, 1500), y: 118 + (L.length - 1) * size * 1.28 + size * .66, col: PAL.beni, w: 9 });
  return { items, bottom: 118 + (L.length - 1) * size * 1.28 + size * .66 };
};
const tag = (g, f = 0, op = false) => op ? null : ({ k: 'box', f, d: .4, x: 1700, y: 120, w: 300, h: 80, str: g, fill: gcol(g), size: 40, dbl: false });
const src = (s, f = .8) => s ? T(f, 1840, 836, '出典　' + s, { align: 'right', size: 28, weight: 500, col: PAL.greyD }) : null;

function story(sh) {
  const g = sh.genre, h = head(sh.title, 0, 58, 22), pts = (sh.points || []).slice(0, 3), items = [...h.items, tag(g, .02, sh.opener)];
  const y0 = h.bottom + 120, step = Math.min(150, (810 - y0) / Math.max(1, pts.length));
  pts.forEach((p, i) => {
    const f = .16 + i * .17, y = y0 + i * step + step / 2 - 30, L = wrap(p, 21, 2);
    items.push({ k: 'box', f, d: .4, x: 130, y, w: 1080, h: Math.max(110, step - 24), str: '', fill: i % 2 ? 'paper' : 'white', anchor: 'l' });
    L.forEach((ln, j) => items.push(T(f + .03, 170, y + (j - (L.length - 1) / 2) * 46, ln, { align: 'left', size: 38, weight: 500 })));
  });
  if (sh.key) {
    const kl = wrap(sh.key, 6, 2);
    items.push({ k: 'box', f: .5, d: .5, x: 1560, y: 500, w: 520, h: 380, str: '', fill: gcol(g) });
    kl.forEach((ln, j) => items.push(T(.55, 1560, 450 + (j - (kl.length - 1) / 2) * 120, ln, { size: kl.length > 1 ? 92 : 112, col: PAL.beni })));
    if (sh.keysub) items.push(T(.62, 1560, 640, sh.keysub, { size: 34, weight: 500 }));
  }
  items.push(src(sh.source));
  return diagramView(sh.id, { items: items.filter(Boolean), tint: gtint(g), cart: sh.cart ? undefined : null });
}

function number(sh) {
  const g = sh.genre, h = head(sh.title, 0, 56, 22), items = [...h.items, tag(g, .02, sh.opener)];
  items.push(T(.16, 640, 470, sh.num, { size: sh.num.length > 6 ? 150 : 210, col: PAL.beni }));
  items.push(T(.22, 640, 640, sh.unit || '', { size: 56 }));
  if (sh.label) items.push(T(.28, 640, 730, sh.label, { size: 40, weight: 500, col: PAL.greyD }));
  const bars = (sh.bars || []).slice(0, 4), mx = Math.max(1, ...bars.map(b => b.v));
  bars.forEach((b, i) => items.push({ k: 'bar', f: .34 + i * .12, d: .6, x: 1230, y: 330 + i * 130, w: 380, h: 70, frac: b.v / mx, label: b.label, num: b.text || String(b.v), col: i === 0 ? 'red' : 'blue', size: 36 }));
  items.push(src(sh.source));
  return diagramView(sh.id, { items: items.filter(Boolean), tint: gtint(g) });
}

function flow(sh) {
  const g = sh.genre, h = head(sh.title, 0, 56, 22), items = [...h.items, tag(g, .02, sh.opener)], st = (sh.steps || []).slice(0, 4), n = st.length || 1;
  const bw = n >= 4 ? 400 : 480, gap = (1700 - n * bw) / (n + 1), y = 500;
  st.forEach((s, i) => {
    const x = 130 + gap * (i + 1) + bw * i + bw / 2, f = .12 + i * .2;
    items.push({ k: 'box', f, d: .45, x, y, w: bw, h: 320, str: s.t + '\n' + wrap(s.s || '', n >= 4 ? 9 : 11, 4).join('\n'), fill: ['rice', 'blue', 'green', 'ochre'][i % 4], size: 50, sub: 34 });
    if (i < n - 1) items.push({ k: 'arrow', f: f + .1, d: .35, from: [x + bw / 2 + 12, y], to: [x + bw / 2 + gap - 12, y], col: PAL.beni, w: 11 });
  });
  items.push(src(sh.source));
  return diagramView(sh.id, { items: items.filter(Boolean), tint: gtint(g) });
}

function compare(sh) {
  const g = sh.genre, h = head(sh.title, 0, 56, 22), items = [...h.items, tag(g, .02, sh.opener)], side = (o, x, f, fill) => {
    items.push({ k: 'box', f, d: .45, x, y: 420, w: 640, h: 120, str: o.t, fill, size: 56 });
    (o.pts || []).slice(0, 3).forEach((p, i) => { const L = wrap(p, 17, 2); items.push({ k: 'box', f: f + .1 + i * .08, d: .4, x, y: 565 + i * 100 + 30, w: 640, h: 90, str: '', fill: 'white', dbl: false });
      L.forEach((ln, j) => items.push(T(f + .13 + i * .08, x, 565 + i * 100 + 30 + (j - (L.length - 1) / 2) * 36, ln, { size: 32, weight: 500 }))); });
  };
  side(sh.left || {}, 520, .14, 'blue'); side(sh.right || {}, 1400, .34, 'rice');
  items.push(T(.28, 960, 420, 'VS', { size: 70, col: PAL.beni }));
  items.push(src(sh.source));
  return diagramView(sh.id, { items: items.filter(Boolean), tint: gtint(g) });
}

function digest(sh) {   // quick hits: one line per story, genre chip + headline
  const rows = (sh.rows || []).slice(0, 6), items = [...head(sh.title || 'ほかの主なニュース', 0, 58, 22).items];
  rows.forEach((r, i) => {
    const y = 270 + i * 110, f = .1 + i * .13, L = wrap(r.t, 28, 1);
    items.push({ k: 'box', f, d: .4, x: 270, y, w: 220, h: 84, str: r.g, fill: gcol(r.g), size: 36, dbl: false });
    items.push(T(f + .02, 420, y, L[0], { align: 'left', size: 46, weight: 500 }));
  });
  return diagramView(sh.id, { items, tint: PAL.skyL });
}

function cover(sh) {
  const items = [T(0, 960, 250, '朝刊', { size: 250, col: S }),
    { k: 'pen', f: .05, d: .7, x0: 520, x1: 1400, y: 380, col: PAL.beni, w: 14 },
    T(.1, 960, 450, sh.date, { size: 54, weight: 500 }), T(.12, 960, 520, sh.no ? `第${sh.no}号` : '', { size: 40, weight: 500, col: PAL.greyD })];
  (sh.tops || []).slice(0, 3).forEach((t, i) => {
    const x = 360 + i * 600, f = .25 + i * .18, L = wrap(t, 11, 4);
    items.push({ k: 'box', f, d: .45, x, y: 690, w: 540, h: 250, str: '', fill: ['rice', 'blue', 'ochre'][i], size: 40 });
    L.forEach((ln, j) => items.push(T(f + .04, x, 690 + (j - (L.length - 1) / 2) * 46, ln, { size: 38 })));
  });
  return diagramView(sh.id, { items, tint: PAL.skyL, tint2: PAL.beniP });
}

function outro(sh) {
  const items = [T(0, 960, 330, sh.title || '以上、今朝の朝刊', { size: 96 }),
    { k: 'pen', f: .1, d: .6, x0: 560, x1: 1360, y: 410, col: PAL.beni, w: 12 }];
  wrap(sh.note || '', 24, 3).forEach((ln, i) => items.push(T(.25 + i * .1, 960, 540 + i * 70, ln, { size: 48, weight: 500 })));
  return diagramView(sh.id, { items, tint: PAL.skyL, tint2: PAL.ochreL });
}

const KIND = { cover, story, number, flow, compare, digest, outro };
export function buildView(sh) { return (KIND[sh.kind] || story)(sh); }
