// Explainer sheets: a list of items that appear at fractions f (0..1) of the sheet's length. Parts use the theme's palette; a theme may replace any part via `parts` in theme.js.
//   diagramView('id', { items: [ { k:'text', f:.1, x, y, str, size }, { k:'box', f:.2, x, y, w, h, str, fill:'a' }, { k:'arrow', f:.4, pts:[[x,y],[x,y]] }, ... ] })
// k = text | box | arrow | bar | line | token | pen | fn   (fn: { k:'fn', f, fn:(ctx, t, p, len) => {} } for anything custom)
// Part signature: (ctx, item, t). item._p = appear progress 0..1 (set by diagramView). Keep notes above y = 850 (subtitles cover the bottom).
import { clamp, lerp, eio } from '/core/lib.js';
import * as T from './theme.js';
const S = T.INK, COL = T.COL, font = T.font;
function path(x, pts) { x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); }
const text = (x, o) => {
  const p = o._p; x.save(); x.globalAlpha = p; x.fillStyle = o.col || S; x.font = font(o.size || 40, o.weight || 700); x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
  const lines = String(o.str).split('\n'), lh = (o.size || 40) * (o.lh || 1.3), y0 = o.y + (1 - p) * 12 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => x.fillText(ln, o.x, y0 + i * lh)); x.restore();
};
const box = (x, o) => {
  const p = o._p, w = o.w, h = o.h, x0 = o.anchor === 'l' ? o.x : o.x - w / 2, y0 = o.y - h / 2 + (1 - p) * 14;
  x.save(); x.globalAlpha = p; x.fillStyle = COL[o.fill] || o.fill || COL.white; x.fillRect(x0, y0, w, h); x.strokeStyle = S; x.lineWidth = 3.4; x.strokeRect(x0, y0, w, h);
  x.fillStyle = o.tcol || S; x.textAlign = 'center'; x.textBaseline = 'middle';
  const lines = String(o.str).split('\n'), sz = o.size || 38, lh = sz * 1.3;
  lines.forEach((ln, i) => { x.font = font(i === 0 ? sz : (o.sub || sz * .72), i === 0 ? 700 : 500); x.fillText(ln, o.x + (o.anchor === 'l' ? w / 2 : 0), y0 + h / 2 - (lines.length - 1) * lh / 2 + i * lh * (i ? .92 : 1) + (i ? 4 : 0)); });
  x.restore();
};
const arrow = (x, o) => {
  const p = o._p, pts = o.pts || [o.from, o.to], col = o.col || S, w = o.w || 8, L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  const upto = tot * eio(p); let acc = 0; const pa = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (acc + L[i - 1] <= upto) { pa.push(pts[i]); acc += L[i - 1]; } else { const u = (upto - acc) / L[i - 1]; pa.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } }
  if (pa.length < 2) return;
  x.save(); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; path(x, pa); x.stroke();
  if (p > .85 && o.head !== false) { const a = pa[pa.length - 2], b = pa[pa.length - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), hs = w * 2.6; x.fillStyle = col; x.beginPath(); x.moveTo(b[0] + Math.cos(an) * hs * .6, b[1] + Math.sin(an) * hs * .6); x.lineTo(b[0] + Math.cos(an + 2.5) * hs, b[1] + Math.sin(an + 2.5) * hs); x.lineTo(b[0] + Math.cos(an - 2.5) * hs, b[1] + Math.sin(an - 2.5) * hs); x.closePath(); x.fill(); }
  x.restore();
};
const bar = (x, o) => {
  const p = eio(o._p), fw = o.w * (o.frac ?? 1), h = o.h; x.save(); x.fillStyle = COL[o.col] || o.col || COL.a; x.fillRect(o.x, o.y - h / 2, fw * p, h);
  x.strokeStyle = S; x.lineWidth = 3; x.strokeRect(o.x, o.y - h / 2, fw, h); x.globalAlpha = Math.min(1, o._p * 2);
  x.fillStyle = S; x.font = font(o.size || 42); x.textBaseline = 'middle'; if (o.label) { x.textAlign = 'right'; x.fillText(o.label, o.x - 24, o.y); } if (o.num) { x.textAlign = 'left'; x.fillText(o.num, o.x + fw + 22, o.y); } x.restore();
};
const line = (x, o) => { x.save(); x.globalAlpha = o._p; x.strokeStyle = o.col || S; x.lineWidth = o.w || 5; x.lineCap = 'round'; if (o.dash) x.setLineDash(o.dash); path(x, o.pts); x.stroke(); x.restore(); };
const token = (x, o) => {       // a block of simple figures (people / units) with a label
  const p = o._p, n = o.n || 8, s = o.s || 40, rows = o.rows || 2; x.save(); x.globalAlpha = p; x.fillStyle = COL[o.col] || o.col || COL.a; x.strokeStyle = S; x.lineWidth = 2.4;
  for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) { const X = o.x + (k - n / 2) * s * .8 + (r % 2) * s * .4, Y = o.y + r * s * .9; x.beginPath(); x.arc(X, Y - s * .5, s * .22, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(X - s * .25, Y + s * .3); x.lineTo(X, Y - s * .22); x.lineTo(X + s * .25, Y + s * .3); x.closePath(); x.fill(); x.stroke(); }
  if (o.label) { x.fillStyle = S; x.font = font(o.size || 38); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.label, o.x, o.y + rows * s * .9 + 50); } x.restore();
};
const pen = (x, o) => { const p = eio(o._p); x.save(); x.strokeStyle = o.col || COL.d; x.lineWidth = o.w || 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(o.x0, o.y); x.lineTo(lerp(o.x0, o.x1, p), o.y + (o.bow || 0) * p); x.stroke(); x.restore(); };
const DRAW = { text, box, arrow, bar, line, token, pen, ...(T.parts || {}) };

export function diagramView(id, o) {
  const items = o.items;
  return {
    id,
    paint(x, t, R) {
      const len = R.len || 14;
      if (o.bg) o.bg(x, t, R);
      for (const it of items) {
        const t0 = it.f * len, d = it.d ?? .5; it._p = clamp((t - t0) / d); if (it._p <= 0) continue;
        if (it.k === 'fn') { it.fn(x, t, it._p, len); continue; }
        DRAW[it.k](x, it, t);
      }
    },
    ev: o.ev,
  };
}
export { COL, font };
