// Explainer sheets in the same print language: washi paper, ink-edged boxes, brush arrows, bars. Items appear at fractions f (0..1) of the sheet length.
import { clamp, lerp, seg, ss, eio, mulberry, hash, TAU } from '/core/lib.js';
import { W, H, FR, PAL, poly, carve, bokashi, rgba } from './print.js';
import { fig, flame } from './figs.js';
import { nobori, rf } from './figs2.js';
const S = PAL.sumi;
const COL = { paper: '#f3e7c6', rice: PAL.beniP, blue: PAL.skyL, green: PAL.greenL, ochre: PAL.ochreL, grey: PAL.greyL, white: PAL.white, red: PAL.beniL, dark: '#cfc3a2' };
const font = (s, w = 700) => `${w} ${s}px Shippori, serif`;
const wobble = (x0, y0, x1, y1, k, a = 1.6) => [[x0, y0], [(x0 + x1) / 2 + (hash(k) - .5) * a * 2, (y0 + y1) / 2 + (hash(k + 1) - .5) * a * 2], [x1, y1]];

function text(x, o, t) {
  const p = o._p; x.save(); x.globalAlpha = p; x.fillStyle = o.col || S; x.font = font(o.size || 40, o.weight || 700); x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
  const lines = String(o.str).split('\n'), lh = (o.size || 40) * (o.lh || 1.3), y0 = o.y + (1 - p) * 12 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => x.fillText(ln, o.x, y0 + i * lh)); x.restore();
}
function box(x, o) {
  const p = o._p, w = o.w, h = o.h, X = o.x - w / 2 * (o.anchor === 'l' ? 0 : 1) + (o.anchor === 'l' ? 0 : w / 2) * 0, x0 = o.anchor === 'l' ? o.x : o.x - w / 2, y0 = o.y - h / 2 + (1 - p) * 14;
  x.save(); x.globalAlpha = p;
  x.fillStyle = COL[o.fill] || o.fill || COL.paper; x.fillRect(x0, y0, w, h);
  x.fillStyle = S; const k = Math.round(x0 + y0);
  carve(x, wobble(x0, y0, x0 + w, y0, k), 3.2, { taper: [.02, .02], seed: k }); carve(x, wobble(x0 + w, y0, x0 + w, y0 + h, k + 2), 3.2, { taper: [.02, .02], seed: k + 1 });
  carve(x, wobble(x0 + w, y0 + h, x0, y0 + h, k + 4), 3.2, { taper: [.02, .02], seed: k + 2 }); carve(x, wobble(x0, y0 + h, x0, y0, k + 6), 3.2, { taper: [.02, .02], seed: k + 3 });
  if (o.dbl !== false) { x.strokeStyle = S; x.lineWidth = 1.2; x.strokeRect(x0 + 6, y0 + 6, w - 12, h - 12); }
  x.fillStyle = o.tcol || S; x.textAlign = 'center'; x.textBaseline = 'middle';
  const lines = String(o.str).split('\n'), sz = o.size || 38, lh = sz * 1.3;
  lines.forEach((ln, i) => { x.font = font(i === 0 ? sz : (o.sub || sz * .72), i === 0 ? 700 : 500); x.fillText(ln, o.x + (o.anchor === 'l' ? w / 2 : 0), y0 + h / 2 - (lines.length - 1) * lh / 2 + i * lh * (i ? .92 : 1) + (i ? 4 : 0)); });
  x.restore();
}
function arrow(x, o) {
  const p = o._p, pts = o.pts || [o.from, o.to], col = o.col || S, w = o.w || 9;
  // draw polyline progressively
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  const upto = tot * eio(p); let acc = 0; const path = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (acc + L[i - 1] <= upto) { path.push(pts[i]); acc += L[i - 1]; } else { const u = (upto - acc) / L[i - 1]; path.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } }
  if (path.length < 2) return;
  x.save(); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); path.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke();
  if (p > .85 && o.head !== false) { const a = path[path.length - 2], b = path[path.length - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), hs = w * 2.6; x.fillStyle = col; x.beginPath(); x.moveTo(b[0] + Math.cos(an) * hs * .6, b[1] + Math.sin(an) * hs * .6); x.lineTo(b[0] + Math.cos(an + 2.5) * hs, b[1] + Math.sin(an + 2.5) * hs); x.lineTo(b[0] + Math.cos(an - 2.5) * hs, b[1] + Math.sin(an - 2.5) * hs); x.closePath(); x.fill(); }
  x.restore();
}
function bar(x, o) {
  const p = eio(o._p), w = o.w * (o.frac ?? 1) * p, h = o.h; x.save(); x.fillStyle = COL[o.col] || o.col || PAL.prusL; x.fillRect(o.x, o.y - h / 2, w, h);
  x.strokeStyle = S; x.lineWidth = 3; x.strokeRect(o.x, o.y - h / 2, o.w * (o.frac ?? 1), h); x.globalAlpha = Math.min(1, o._p * 2);
  x.fillStyle = S; x.font = font(o.size || 42); x.textAlign = 'left'; x.textBaseline = 'middle'; if (o.label) { x.textAlign = 'right'; x.fillText(o.label, o.x - 24, o.y); x.textAlign = 'left'; } if (o.num) x.fillText(o.num, o.x + o.w * (o.frac ?? 1) + 22, o.y); x.restore();
}
function line(x, o) { const p = o._p; x.save(); x.globalAlpha = p; x.strokeStyle = o.col || S; x.lineWidth = o.w || 5; x.lineCap = 'round'; if (o.dash) x.setLineDash(o.dash); x.beginPath(); (o.pts).forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); x.restore(); }
function river(x, o) { const p = o._p; x.save(); x.globalAlpha = p; x.strokeStyle = PAL.prusL; x.lineWidth = o.w || 46; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); o.pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); x.strokeStyle = PAL.skyL; x.lineWidth = (o.w || 46) * .55; x.stroke(); x.restore(); }
function hill(x, o) { const p = o._p; x.save(); x.globalAlpha = p; x.fillStyle = o.col || PAL.greenL; x.beginPath(); x.moveTo(o.x - o.w / 2, o.y); x.quadraticCurveTo(o.x - o.w * .2, o.y - o.h * 1.5, o.x, o.y - o.h); x.quadraticCurveTo(o.x + o.w * .2, o.y - o.h * 1.5, o.x + o.w / 2, o.y); x.closePath(); x.fill(); x.strokeStyle = S; x.lineWidth = 2.6; x.stroke(); x.restore(); }
function token(x, o, t) {      // an army: row of small figures + banner
  const p = o._p, n = o.n || 8, s = o.s || 52, mv = o.move ? eio(clamp((t - o.move.t0) / o.move.d)) : 0, px = lerp(o.x, o.move ? o.move.x : o.x, mv), py = lerp(o.y, o.move ? o.move.y : o.y, mv);
  x.save(); x.globalAlpha = p; const tq = Math.floor(t * 8) / 8;
  for (let r = 0; r < (o.rows || 2); r++) for (let k = 0; k < n; k++) { const X = px + (k - n / 2) * (s * .55) + (r % 2) * s * .25, Y = py + r * s * .5; fig(x, X, Y, s, { ph: tq * 1.6 * (mv > 0 && mv < 1 ? 1 : 0) + k * .3, still: !(mv > 0 && mv < 1), dir: o.dir ?? 1, col: o.col || PAL.ai, carry: o.carry ?? 'spear', hat: k % 3 ? null : 'kasa' }); }
  if (o.flag !== false) nobori(x, px - (o.dir ?? 1) * 6, py - 4, s * 2.6, o.flagCol || o.col || PAL.ai, Math.sin(tq * 2) * 4, true, true);
  if (o.label) { x.fillStyle = S; x.font = font(o.size || 40); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.label, px, py + (o.rows || 2) * s * .5 + 58); }
  x.restore();
}
function pen(x, o) {            // brush underline / stroke
  const p = eio(o._p); x.save(); x.fillStyle = o.col || PAL.beni; const pts = [[o.x0, o.y], [lerp(o.x0, o.x1, .5), o.y + (o.bow || 6)], [lerp(o.x0, o.x1, p), o.y]]; carve(x, [[o.x0, o.y], [lerp(o.x0, o.x1, p), o.y + (o.bow || 0)]], o.w || 10, { taper: [.05, .3], seed: 3 }); x.restore();
}
const DRAW = { text, box, arrow, bar, line, river, hill, token, pen };

export function diagramView(id, o) {
  const items = o.items;
  return {
    id, cart: o.cart, tint: o.tint,
    layers: {
      bg: { g: 1, grain: .06, draw(x) { bokashi(x, 0, FR.y0, W, 360, o.tint || PAL.skyL, .5, 0, { rough: 24, seed: 11 + id.length }); bokashi(x, 0, 760, W, FR.y1, o.tint2 || PAL.ochreL, 0, .5, { rough: 24, seed: 21 + id.length }); } },
    },
    paint(x, t, R) {
      const len = R.len || 14;
      R.L('bg');
      R.D(3, x => {
        for (const it of items) {
          const t0 = it.f * len, d = it.d ?? .5; it._p = clamp((t - t0) / d); if (it._p <= 0) continue;
          if (it.k === 'fn') { it.fn(x, t, it._p, len); continue; }
          DRAW[it.k](x, it, t);
        }
      });
    },
  };
}
export { COL, font };
