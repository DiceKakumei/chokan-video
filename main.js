// Generic modular film engine. Sheets are laid side by side and the camera slides from sheet to sheet (clip joins fall in the middle of a slide, so they are seamless).
// Everything that looks like a style lives in theme.js (paper, frame, title card, subtitles, ending) and in the views (registry.js). Do not put style code here.
import { clamp, lerp, seg, ss, eio } from '/core/lib.js';
import * as T from './theme.js';
import { VIEW } from './registry.js';

const W = T.W ?? 1920, H = T.H ?? 1080;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const QS = new URLSearchParams(location.search), NOSUB = QS.has('nosub');
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = (await J('lines.json')) || [], DURS = (await J('voices/dur.json')) || {}, ST = await J('story.json');
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
const SH = ST.sheets, N = SH.length, DUR = ST.dur;
const GAP = T.GAP ?? 260, SW = W + GAP, DIR = T.DIR ?? 1;             // DIR 1: sheets go left -> right, -1: right -> left (a handscroll)
const SLOT = i => DIR > 0 ? i * SW : (N - 1 - i) * SW;
const PAN = T.PAN ?? .45, TITLE_T = T.TITLE_T ?? 1.2;               // PAN: half of the slide time; TITLE_T: when the chapter title appears (s after the chapter sheet starts)

const CHARS = [...new Set((LINES.map(l => l.text).join('') + SH.map(s => s.cart || '').join('') + (ST.seal.char || '') + (T.CHARS || '') + '、。0123456789').split(''))].join('');
await Promise.all((T.FONTS || []).map(f => document.fonts.load(f, CHARS)));
T.build?.();

export const SUBS = Object.entries(ST.vo).map(([id, t0]) => { const d = DURS[id] ?? (LINE[id]?.text.length || 20) * .22; return { id, t0, t1: t0 + Math.max(1.8, d + .75), text: LINE[id]?.text || '' }; });
SUBS.forEach((s, i) => { if (SUBS[i + 1] && s.t1 > SUBS[i + 1].t0 - .1) s.t1 = SUBS[i + 1].t0 - .1; });

function drawSheet(i, t, M) {
  const s = SH[i], v = VIEW[s.view], len = s.t1 - s.t0, lt = Math.max(0, t - s.t0);
  ctx.save(); ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  T.paper(ctx, i, lt, s);
  const R = { len, i, sheet: s, chapter: !!s.chapter, titleT: TITLE_T };
  v.paint(ctx, lt, R);
  T.frame?.(ctx, i, lt, s);
  if (s.cart) { const c0 = s.chapter ? TITLE_T : .6, p = clamp((lt - c0) / (T.TITLE_D ?? .45)); if (p > 0) T.title(ctx, s.cart, p, i, lt - c0, s); }
  T.overlay?.(ctx, i, lt, s);
  ctx.restore();
}

// —— camera: slide from sheet to sheet with a slow push inside each ——
const C = i => [SLOT(i) + W / 2, H / 2];
const startOf = i => ({ cx: C(i)[0] - DIR * (i % 2 ? -1 : 1) * 18, z: 1 }), endOf = i => ({ cx: C(i)[0] + DIR * (i % 2 ? -1 : 1) * 18, z: 1.03 });
function camera(t) {
  let i = SH.findIndex(s => t < s.t1 + PAN); if (i < 0) i = N - 1;
  const s = SH[i], h0 = i ? SH[i - 1].t1 + PAN : 0, h1 = s.t1 - PAN;
  if (t <= h1 || i === N - 1) { const u = ss(seg(t, h0, h1)), a = startOf(i), b = endOf(i); return { cx: lerp(a.cx, b.cx, u), cy: H / 2, z: lerp(a.z, b.z, u) }; }
  const u = eio(seg(t, h1, s.t1 + PAN)), a = endOf(i), b = startOf(i + 1);
  return { cx: lerp(a.cx, b.cx, u), cy: H / 2, z: lerp(a.z, b.z, u) };
}
const camMatrix = cam => [cam.z, 0, 0, cam.z, W / 2 - cam.z * cam.cx, H / 2 - cam.z * cam.cy];

function subtitle(t) {
  const s = SUBS.find(s => t >= s.t0 - .05 && t < s.t1); if (!s) return;
  const a = clamp((t - s.t0 + .05) / .22), fo = 1 - clamp((t - (s.t1 - .25)) / .25);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = T.SUBFONT || '500 42px sans-serif'; const maxW = T.SUBMAX ?? 1480;
  let lines = [s.text];
  if (ctx.measureText(s.text).width > maxW) {                 // two lines, split at a punctuation mark near the middle
    const mid = s.text.length / 2; let best = -1, bd = 1e9;
    [...s.text].forEach((ch, k) => { if ('、。，．,. '.includes(ch) && k < s.text.length - 1 && Math.abs(k - mid) < bd) { bd = Math.abs(k - mid); best = k; } });
    const cut = best >= 0 ? best + 1 : Math.ceil(mid); lines = [s.text.slice(0, cut), s.text.slice(cut)];
  }
  T.subtitle(ctx, lines, a, fo, s);
  ctx.restore();
}

function renderFrame(t, nosub) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = T.BACK || '#111'; ctx.fillRect(0, 0, W, H);
  const cam = camera(t), M = camMatrix(cam);
  T.backdrop?.(ctx, M, cam.cx, t);
  const half = (W / 2) / cam.z * 1.8 + 400;
  for (let i = 0; i < N; i++) {
    const x0 = SLOT(i); if (x0 + W < cam.cx - half || x0 > cam.cx + half) continue;
    drawSheet(i, t, [M[0], M[1], M[2], M[3], M[4] + M[0] * x0, M[5] + M[1] * x0]);
  }
  if (!nosub) subtitle(t);
  const we = ss(seg(t, ST.wash[0], ST.wash[1]));
  if (we > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); T.wash(ctx, we); ctx.restore(); }
  if (t >= ST.seal.t) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); T.endcard(ctx, clamp((t - ST.seal.t) / .5), ST.seal.char, t - ST.seal.t); ctx.restore(); }
}
window.render = t => renderFrame(t, NOSUB);
window.DUR = DUR; window.SUBS = SUBS;

function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  for (const [id, t0] of Object.entries(ST.vo)) add('vo', t0, { id });
  SH.forEach((s, i) => {
    const len = s.t1 - s.t0, v = VIEW[s.view];
    add('sheet', s.t0, { id: s.id, mood: s.mood, d: len });
    if (s.cart) add(s.chapter ? 'chapter' : 'title', s.t0 + (s.chapter ? TITLE_T : .6), { v: .8 });
    if (i < N - 1) add('scroll', s.t1 - PAN, { d: PAN * 2, v: .7 });
    if (v.ev) for (const e of v.ev(len)) { const { t, ...rest } = e; add(e.type, s.t0 + t, rest); }
  });
  add('seal', ST.seal.t, { v: 1 });
  add('final', ST.wash[0], { d: ST.seal.t - ST.wash[0] });
  return ev.sort((a, b) => a.t - b.t);
}
window.EV = events();
window.render(parseFloat(QS.get('t') ?? '10'));
window.READY = true;
