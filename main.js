// 戦国から泰平へ — long version. Sheets of one handscroll are listed in story.json (made by plan.py from sheets.json + narration lengths)
import { clamp, lerp, seg, ss, eio, hash } from '/core/lib.js';
import { W, H, FR, PAL, TX, mk, buildTextures, inkify, stampLayer, stampFn, drawSeal, cartouche, sealCanvas } from './print.js';
import { VIEW } from './registry.js';

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const QS = new URLSearchParams(location.search), NOSUB = QS.has('nosub');
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = (await J('lines.json')) || [], DURS = (await J('voices/dur.json')) || {}, ST = await J('story.json');
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
const SH = ST.sheets, N = SH.length, DUR = ST.dur;
const GAP = 260, SW = W + GAP, SLOT = i => (N - 1 - i) * SW;
const PRINTL = [.35, 1.0, 1.7, 2.3], REVEAL_DUR = .34, PAN = .45;

const CHARS = [...new Set((LINES.map(l => l.text).join('') + SH.map(s => s.cart || '').join('') + '戦国から泰平へ続。、0123456789').split(''))].join('');
await document.fonts.load('400 40px Yuji', CHARS); await document.fonts.load('500 40px Shippori', CHARS); await document.fonts.load('700 40px Shippori', CHARS);
buildTextures();

export const SUBS = Object.entries(ST.vo).map(([id, t0]) => { const d = DURS[id] ?? (LINE[id]?.text.length || 20) * .22; return { id, t0, t1: t0 + Math.max(1.8, d + .75), text: LINE[id]?.text || '' }; });
SUBS.forEach((s, i) => { if (SUBS[i + 1] && s.t1 > SUBS[i + 1].t0 - .1) s.t1 = SUBS[i + 1].t0 - .1; });

const REG = [[0, 0], [2.2, -1.3], [-1.8, 1.9], [1.5, 2.2]], SHIFT = [[4, -5], [-6, 4], [5, 5], [-5, -4]];
const cache = new Map();
function layer(v, name) {
  const k = v.id + ':' + name; if (cache.has(k)) return cache.get(k);
  const d = v.layers[name], c = mk(), x = c.getContext('2d'); d.draw(x);
  const hk = hash(k.length * 7.3 + k.charCodeAt(1) + k.charCodeAt(0));
  inkify(c, { speck: d.speck ?? .3, grain: (d.grain || 0) * 1.7, gx: hk * 400 - 200, baren: d.baren ?? (d.g ? .38 : .12), bx: (hk - .5) * 300, by: (hash(hk) - .5) * 200 });
  cache.set(k, c); return c;
}
const SERIES = '朝刊';

function drawSheet(i, t, M) {
  const s = SH[i], v = VIEW[s.view], len = s.t1 - s.t0, lt = s.print ? t - s.t0 : Math.max(0, t - s.t0);
  const revFor = (g) => s.print ? clamp((lt - PRINTL[g]) / REVEAL_DUR) : 1;
  ctx.save(); ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  if (i % 2) { ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); ctx.drawImage(TX.paper, 0, 0); ctx.restore(); } else ctx.drawImage(TX.paper, 0, 0);
  const blank = s.print && lt < PRINTL[0] - .05;
  if (!blank) {
    ctx.save(); ctx.beginPath(); ctx.rect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0); ctx.clip();
    const R = {
      len,
      L: name => { const g = v.layers[name].g; stampLayer(ctx, layer(v, name), revFor(g), REG[g], SHIFT[g]); },
      D: (g, fn) => { const r = revFor(g); if (r >= 1) { ctx.save(); ctx.translate(REG[g][0], REG[g][1]); fn(ctx); ctx.restore(); } else stampFn(ctx, fn, r, SHIFT[g]); },
      free: fn => { ctx.restore(); ctx.restore(); fn(ctx); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); ctx.save(); ctx.beginPath(); ctx.rect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0); ctx.clip(); },
    };
    v.paint(ctx, lt, R);
    ctx.restore();
    { const r = revFor(0); if (r > 0) stampFn(ctx, x => { x.strokeStyle = PAL.sumi; x.lineWidth = 3.4; x.strokeRect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0); x.lineWidth = 1.3; x.strokeRect(FR.x0 - 9, FR.y0 - 9, FR.x1 - FR.x0 + 18, FR.y1 - FR.y0 + 18); }, r, SHIFT[0]); }
    if (s.cart) {
      const C = v.cart || [1800, 74], c0 = s.print ? 3.0 : 1.0, p = clamp((lt - c0) / .35), sp = clamp((lt - c0 - .5) / .3);
      if (p > 0) {
        stampFn(ctx, x => { C._b = cartouche(x, C[0], C[1], s.cart, { series: SERIES, ssize: 25, size: s.cart.length > 5 ? 44 : 50 }); }, p, [0, -14]);
        if (C._b) drawSeal(ctx, '朝', C[0], C._b.y0 + C._b.h + 56, 62, sp, { seed: i + 3, rot: (hash(i) - .5) * .06 });
      }
    }
  }
  ctx.globalAlpha = 1; ctx.drawImage(TX.fiber, 0, 0);
  ctx.restore(); ctx.restore();
}

// —— camera: the handscroll slides right → left from sheet to sheet, with a slow push inside each ——
const C = i => [SLOT(i) + 960, 540];
const TOTAL = SLOT(0) + W;
const startOf = i => ({ cx: C(i)[0] - (i % 2 ? -1 : 1) * 18, z: 1 }), endOf = i => ({ cx: C(i)[0] + (i % 2 ? -1 : 1) * 18, z: 1.03 });
function camera(t) {
  let i = SH.findIndex(s => t < s.t1 + PAN); if (i < 0) i = N - 1;
  const s = SH[i], h0 = i ? SH[i - 1].t1 + PAN : 0, h1 = s.t1 - PAN;
  if (t <= h1 || i === N - 1) { const u = ss(seg(t, h0, h1)), a = startOf(i), b = endOf(i); return { cx: lerp(a.cx, b.cx, u), cy: 540, z: lerp(a.z, b.z, u), rot: 0 }; }
  const u = eio(seg(t, h1, s.t1 + PAN)), a = endOf(i), b = startOf(i + 1);
  return { cx: lerp(a.cx, b.cx, u), cy: 540, z: lerp(a.z, b.z, u), rot: 0 };
}
const camMatrix = cam => { const c = Math.cos(cam.rot) * cam.z, s = Math.sin(cam.rot) * cam.z; return [c, s, -s, c, W / 2 - (c * cam.cx - s * cam.cy), H / 2 - (s * cam.cx + c * cam.cy)]; };

const BAND = [-1100, 1510];
function drawScroll(M, cx) {
  const x0 = cx - 2600, x1 = cx + 2600;
  ctx.save(); ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.fillStyle = PAL.mount; ctx.fillRect(x0, BAND[0], x1 - x0, BAND[1] - BAND[0]);
  ctx.globalAlpha = .55; ctx.globalCompositeOperation = 'multiply';
  for (let X = Math.floor(x0 / W) * W; X < x1; X += W) for (let Y = BAND[0]; Y < BAND[1]; Y += H) ctx.drawImage(TX.paper, X, Y);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAL.mountD; ctx.fillRect(x0, BAND[0], x1 - x0, 34); ctx.fillRect(x0, BAND[1] - 34, x1 - x0, 34);
  ctx.restore();
}

function subtitle(t) {
  const s = SUBS.find(s => t >= s.t0 - .05 && t < s.t1); if (!s) return;
  const a = clamp((t - s.t0 + .05) / .22), fo = 1 - clamp((t - (s.t1 - .25)) / .25);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = '500 42px Shippori'; const longText = ctx.measureText(s.text).width > 1480;
  const lines = longText ? [s.text.slice(0, Math.ceil(s.text.length / 2)), s.text.slice(Math.ceil(s.text.length / 2))] : [s.text];
  // split long lines at a punctuation mark near the middle
  if (longText) { const mid = s.text.length / 2; let best = -1, bd = 1e9; [...s.text].forEach((ch, k) => { if ('、。'.includes(ch) && k < s.text.length - 1 && Math.abs(k - mid) < bd) { bd = Math.abs(k - mid); best = k; } }); if (best >= 0) { lines[0] = s.text.slice(0, best + 1); lines[1] = s.text.slice(best + 1); } }
  ctx.font = '500 42px Shippori'; const tw = Math.max(...lines.map(l => ctx.measureText(l).width)), lh = 54, h = 30 + lines.length * lh, w = tw + 150, x0 = (W - w) / 2, y0 = H - 66 - h;
  ctx.globalAlpha = fo;
  stampFn(ctx, x => { x.fillStyle = 'rgba(243,231,198,.96)'; x.fillRect(x0, y0, w, h); x.strokeStyle = PAL.sumi; x.lineWidth = 2.6; x.strokeRect(x0, y0, w, h); x.lineWidth = 1; x.strokeRect(x0 + 5, y0 + 5, w - 10, h - 10);
    x.fillStyle = PAL.sumi; x.textAlign = 'left'; x.textBaseline = 'middle'; x.font = '500 42px Shippori'; lines.forEach((l, k) => x.fillText(l, x0 + 96, y0 + 15 + lh / 2 + k * lh + 2)); }, a, [0, 0]);
  const sc = sealCanvas('朝', 40, { seed: 17 }); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = fo * a * .92; ctx.drawImage(sc, x0 + 30, y0 + h / 2 - sc.height / 2);
  ctx.restore();
}

function renderFrame(t, nosub) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#161a22'; ctx.fillRect(0, 0, W, H);
  const cam = camera(t), M = camMatrix(cam);
  drawScroll(M, cam.cx);
  const half = (W / 2) / cam.z * 1.8 + 400;
  for (let i = 0; i < N; i++) {
    const x0 = SLOT(i); if (x0 + W < cam.cx - half || x0 > cam.cx + half) continue;
    drawSheet(i, t, [M[0], M[1], M[2], M[3], M[4] + M[0] * x0, M[5] + M[1] * x0]);
  }
  if (!nosub) subtitle(t);
  const we = ss(seg(t, ST.wash[0], ST.wash[1]));
  if (we > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = we; ctx.drawImage(TX.paper, 0, 0); ctx.drawImage(TX.fiber, 0, 0); ctx.restore(); }
  if (t >= ST.seal.t) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawSeal(ctx, ST.seal.char, W / 2, H / 2, 150, clamp((t - ST.seal.t) / .3), { seed: 31 }); ctx.restore(); }
}
window.render = t => renderFrame(t, NOSUB);
window.DUR = DUR; window.SUBS = SUBS;

function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  for (const [id, t0] of Object.entries(ST.vo)) add('vo', t0, { id });
  SH.forEach((s, i) => {
    const len = s.t1 - s.t0, v = VIEW[s.view];
    add('sheet', s.t0, { id: s.id, mood: s.mood, d: len });
    if (s.print) PRINTL.forEach((pt, g) => { add('block', s.t0 + pt - .12, { v: .5 + g * .1 }); add('baren', s.t0 + pt, { d: .36, v: .7 }); });
    if (s.cart) { const c0 = s.t0 + (s.print ? 3.0 : 1.0); add('slip', c0, { v: .45 }); add('seal', c0 + .5, { v: .85 }); }
    if (i < N - 1) add('scroll', s.t1 - PAN, { d: PAN * 2, v: .7 });
    if (v.ev) for (const e of v.ev(len)) { const { t, ...rest } = e; add(e.type, s.t0 + t, rest); }
  });
  add('seal', ST.seal.t, { v: 1.1 });
  add('final', ST.wash[0], { d: ST.seal.t - ST.wash[0] });
  return ev.sort((a, b) => a.t - b.t);
}
window.EV = events();
window.render(parseFloat(QS.get('t') ?? '10'));
window.READY = true;
