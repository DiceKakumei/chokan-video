// THEME: Broadcast News Package (see Lemo-Opuscar styles/news-package/STYLE.md).
// Ink ground with light fins; the package layer (channel bug, lower-third strap with category tab, source line) is drawn PER SHEET inside frame(), so it travels with its picture.
// The strap carries the narration (spoken line flips in under a fixed headline) - there are no burned subtitles and no crawl on the frame; a separate .srt is made by build.sh.
// The lemon vertical band wipe sits in the gap between sheets, so every camera slide is a band wipe.
import { clamp, lerp, seg, ss, eio, eo, hash } from '/core/lib.js';
import { P, F, FC, FM, ST, cueAt, buildGround, ground, plate, strap, telop, ticker, stamp, bandWipe, ring } from './package.js';

export const W = 1920, H = 1080;
export const FONTS = ['900 40px Main', '700 40px Main', '800 40px Cond', '600 40px Cond', '500 40px Mono'];
export const CHARS = 'NEWS LINE SOURCE MORNING EDITION TOP NEWS THE END HEADLINES 見出し朝刊以上今朝';
export const BACK = '#0a0b0d', GAP = 200, DIR = 1, PAN = .45, TITLE_T = 1.6, TITLE_D = .5;
export const INK = P.paper;
export const COL = { paper: P.ink, a: P.lem, b: P.gold, c: P.paper, d: P.dim, grey: P.ink3, white: P.ink2, dark: P.ink };
export const font = (s, w = 700) => F(s, w >= 800 ? 900 : 700);
export const FR = { x0: 96, y0: 56, x1: 1824, y1: 830 };           // picture area; the strap and its tab are below y 834
const N = ST.sheets.length;

// per-sheet package layer: category tab, headline, source line
const ISSUE = await (await fetch('issue.json')).json();
const EN = { '政治': 'POLITICS', '経済': 'ECONOMY', '国際': 'WORLD', '社会': 'SOCIETY', '科学': 'SCIENCE', 'IT': 'TECH', 'AI': 'AI', 'ビジネス': 'BUSINESS', 'スポーツ': 'SPORTS', '文化': 'CULTURE', '健康': 'HEALTH', '暮らし': 'LIFE', '環境': 'CLIMATE' };
export const META = {};
for (const sh of ISSUE.sheets) META[sh.id] = {
  tab: sh.kind === 'cover' ? 'TOP NEWS' : sh.kind === 'outro' ? 'THE END' : sh.kind === 'digest' ? '見出し HEADLINES' : (sh.genre || '') + ' ' + (EN[sh.genre] || 'NEWS'),
  head: sh.kind === 'cover' ? '朝刊 ' + (ISSUE.date || '') : sh.kind === 'outro' ? '以上、今朝の朝刊' : (sh.title || ''),
  src: sh.source ? 'SOURCE: ' + sh.source : 'MORNING EDITION · ' + (ISSUE.date || ''),
};

export function build() { buildGround(); }

export function backdrop(ctx, M, cx, t) {
  ctx.save(); ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  for (let i = 0; i < N - 1; i++) {
    const gx = i * (W + GAP) + W + GAP / 2; if (Math.abs(gx - cx) > W) continue;
    ctx.fillStyle = '#0a0b0d'; ctx.fillRect(gx - GAP / 2, -50, GAP, H + 100); bandWipe(ctx, gx, H + 100);
  }
  ctx.restore();
}
export function paper(ctx, i, lt, sheet) { ground(ctx, lt, i * .37); }

export function frame(ctx, i, lt, sheet) {
  const m = META[sheet.id] || { tab: 'NEWS', head: '', src: '' }, abs = sheet.t0 + lt;
  // channel bug (the sting plate becomes the bug on the first sheet)
  if (i > 0 || lt > 1.45) { const a = i === 0 ? clamp((lt - 1.45) / .08) : 1; plate(ctx, 1739, 86, .327, { a }); }
  const sp = i === 0 ? ss(seg(lt, 2.5, 3.1)) : 1; if (sp <= 0) return;
  const c = cueAt(sheet.id, abs); let lineP = 0, lineA = 1;
  if (c) { lineP = clamp((abs - c.t0 + .05) / .34); lineA = 1 - clamp((abs - (c.t1 - .22)) / .22); }
  strap(ctx, { tab: m.tab, head: m.head, line: c ? c.text : null, lineP, lineA, src: m.src, p: sp, tabFlash: i > 0 ? 1 - clamp(lt / .5) : 0, mark: '' });
}

export function title(ctx, text, p, i, lt, sheet) {            // chapter title telop: slides in from the left under a lemon bar
  const u = eo(p); ctx.save(); ctx.font = F(86, 900); const w = ctx.measureText(text).width + 120, x = 96, y = 150, h = 128;
  ctx.beginPath(); ctx.rect(0, y - 10, x + w + 40, h + 20); ctx.clip(); ctx.translate(-(1 - u) * (w + 140), 0);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(x + 8, y + 10, w, h); ctx.fillStyle = P.paper; ctx.fillRect(x, y, w, h); ctx.fillStyle = P.lem; ctx.fillRect(x, y, 16, h); ctx.fillStyle = P.ink; ctx.fillRect(x + 16, y, 5, h); ctx.fillStyle = P.gold; ctx.fillRect(x + 21, y, 9, h);
  ctx.fillStyle = P.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 70, y + h / 2 + 4); ctx.restore();
}
export function overlay(ctx) { }
export const SUBFONT = '700 34px Main, sans-serif', SUBMAX = 1e6;
export function subtitle(ctx, lines, a, fo) { }                  // the strap carries the words (frame); nothing is burned over the picture

// slanted wipe into the end card
export function wash(ctx, p) {
  const e = lerp(-500, W + 500, p); ctx.save(); ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e, 0); ctx.lineTo(e - 260, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  if (p < 1) { ctx.fillStyle = P.lem; ctx.beginPath(); ctx.moveTo(e, 0); ctx.lineTo(e + 84, 0); ctx.lineTo(e - 176, H); ctx.lineTo(e - 260, H); ctx.closePath(); ctx.fill(); ctx.fillStyle = P.gold; ctx.beginPath(); ctx.moveTo(e + 84, 0); ctx.lineTo(e + 98, 0); ctx.lineTo(e - 162, H); ctx.lineTo(e - 176, H); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
export function endcard(ctx, p, text, t) {
  ctx.save(); ctx.globalAlpha = 1; ground(ctx, t, .5);
  const a = (d, len = .5) => clamp((t - d) / len);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.globalAlpha = a(.1); ctx.font = FM(22, 500); ctx.letterSpacing = '4px'; ctx.fillStyle = P.gold; ctx.fillText('NEWS LINE · MORNING EDITION', 140, 300); ctx.letterSpacing = '0px';
  ctx.globalAlpha = a(.25); ctx.font = F(96, 900); ctx.fillStyle = P.paper; ctx.fillText(text, 140, 410 + (1 - eo(a(.25))) * 30);
  ctx.globalAlpha = a(.5); ctx.font = `italic 600 54px Cond, sans-serif`; ctx.fillStyle = P.lem; ctx.fillText('Morning Edition', 144, 506);
  ctx.globalAlpha = a(.7); ctx.fillStyle = P.gold; ctx.fillRect(140, 566, 520 * eo(a(.7, .6)), 3);
  ctx.globalAlpha = a(1.0); ctx.font = F(30, 700); ctx.fillStyle = P.paper; ctx.fillText('ニュース番組パッケージ  BROADCAST NEWS PACKAGE', 140, 630);
  ctx.font = FM(18, 500); ctx.fillStyle = 'rgba(244,241,232,.72)'; ctx.letterSpacing = '1px';
  ['SOURCES: news agencies and newspapers named on each screen / summaries in our own words', 'FONTS: Noto Sans JP, Barlow Condensed, IBM Plex Mono (SIL OFL)  /  PICTURE, MUSIC, SOUND: made in code', 'VOICE: Microsoft Edge neural TTS (ja-JP-KeitaNeural)'].forEach((l, k) => ctx.fillText(l, 140, 720 + k * 34));
  ctx.letterSpacing = '0px'; ctx.globalAlpha = a(.15); const pp = eo(a(.2, .7)); plate(ctx, lerp(2000, 1560, pp), 880, 1.1, { sub: 'MORNING EDITION', subP: a(.9, .5), glint: ((t * .4) % 3) < 1 ? (t * .4) % 3 : 0 });
  ctx.restore();
}

// ---- diagram parts, news version ----
const nm = c => ({ a: P.lem, b: P.gold, c: P.paper, d: P.dim, lem: P.lem, gold: P.gold, paper: P.paper }[c] || c || P.paper);
const text = (x, o) => {
  const p = o._p; x.save(); x.globalAlpha = p; x.fillStyle = nm(o.col); const sz = o.size || 40; x.font = o.cond ? FC(sz, 800) : o.mono ? FM(sz, 500) : F(sz, (o.weight || 900) >= 800 ? 900 : 700); if (o.mono) x.letterSpacing = '3px';
  x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; const lines = String(o.str).split('\n'), lh = sz * (o.lh || 1.3), y0 = o.y + (1 - p) * 14 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => x.fillText(ln, o.x, y0 + i * lh)); x.restore();
};
const box = (x, o) => {
  const w = o.w, h = o.h, x0 = o.anchor === 'l' ? o.x : o.x - w / 2, fill = { a: 'lem', b: 'gold', c: 'paper' }[o.fill] || 'ink';
  telop(x, x0, o.y - h / 2, w, h, { p: o._p, fill, text: o.str, size: o.size || 38, sub: o.sub });
};
const arrow = (x, o) => {
  const p = o._p, pts = o.pts || [o.from, o.to], col = nm(o.col || 'a'), w = o.w || 8, L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  const upto = tot * eio(p); let acc = 0; const pa = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (acc + L[i - 1] <= upto) { pa.push(pts[i]); acc += L[i - 1]; } else { const u = (upto - acc) / L[i - 1]; pa.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } }
  if (pa.length < 2) return; x.save(); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'butt'; x.lineJoin = 'miter'; x.beginPath(); pa.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke();
  if (p > .85 && o.head !== false) { const a = pa[pa.length - 2], b = pa[pa.length - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), hs = w * 3; x.fillStyle = col; x.beginPath(); x.moveTo(b[0] + Math.cos(an) * hs, b[1] + Math.sin(an) * hs); x.lineTo(b[0] + Math.cos(an + 2.4) * hs, b[1] + Math.sin(an + 2.4) * hs); x.lineTo(b[0] + Math.cos(an - 2.4) * hs, b[1] + Math.sin(an - 2.4) * hs); x.closePath(); x.fill(); }
  x.restore();
};
const bar = (x, o) => {       // proportion bar on a track: o.w = full scale, o.frac = value share of the scale
  const p = eio(o._p), fw = o.w * (o.frac ?? 1), h = o.h; x.save();
  x.fillStyle = P.ink3; x.fillRect(o.x, o.y - h / 2, o.w, h); x.fillStyle = 'rgba(244,241,232,.12)'; for (let k = 1; k < 4; k++) x.fillRect(o.x + o.w * k / 4 - 1, o.y - h / 2, 2, h);
  x.fillStyle = nm(o.col || 'a'); x.fillRect(o.x, o.y - h / 2, fw * p, h); x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(o.x, o.y - h / 2, fw * p, 4);
  x.globalAlpha = Math.min(1, o._p * 2); x.textBaseline = 'middle'; if (o.label) { x.font = F(o.size || 42, 900); x.fillStyle = P.paper; x.textAlign = 'right'; x.fillText(o.label, o.x - 28, o.y + 2); }
  if (o.num) { x.font = FC((o.size || 42) * 1.5, 800); x.fillStyle = P.paper; x.textAlign = 'left'; x.fillText(o.num, o.x + Math.max(fw * p, 0) + 22, o.y + 2); } x.restore();
};
const line = (x, o) => { x.save(); x.globalAlpha = o._p; x.strokeStyle = nm(o.col || 'paper'); x.lineWidth = o.w || 4; if (o.dash) x.setLineDash(o.dash); x.beginPath(); o.pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); x.restore(); };
const token = (x, o) => {      // units as squares (one square = one unit)
  const n = o.n || 8, s = o.s || 40, rows = o.rows || 2; x.save(); x.globalAlpha = o._p; x.fillStyle = nm(o.col || 'a');
  for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) x.fillRect(o.x + (k - n / 2) * s * 1.2, o.y + r * s * 1.2, s, s);
  x.restore();
};
const pen = (x, o) => { const p = eio(o._p); x.save(); x.fillStyle = nm(o.col || 'a'); x.fillRect(o.x0, o.y - (o.w || 8) / 2, (o.x1 - o.x0) * p, o.w || 8); x.restore(); };
const tickerPart = (x, o, t) => ticker(x, o.x, o.y, o.w, o.h, o.items, t, { p: o._p, label: o.label, speed: o.speed });
const stampPart = (x, o) => stamp(x, o.x, o.y, o.str, o.sub, o._p, { rot: o.rot, size: o.size });
export const parts = { text, box, arrow, bar, line, token, pen, telop: box, ticker: tickerPart, stamp: stampPart };
