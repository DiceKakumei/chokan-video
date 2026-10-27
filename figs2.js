// War props: horse + rider, gunner and smoke, castle keep, nobori banners, tents, palisade
import { clamp, lerp, seg, ss, mulberry, hash, TAU } from '/core/lib.js';
import { W, H, PAL, poly, carve, kasumi, rgba } from './print.js';
const S = PAL.sumi;
const edges = (x, pts, w, seed) => { for (let i = 0; i < pts.length - 1; i++) carve(x, [pts[i], pts[i + 1]], w, { taper: [.02, .02], seed: seed + i, per: 10 }); };
export const rf = (x, c, x0, y0, x1, y1) => { x.fillStyle = c; x.fillRect(x0, y0, x1 - x0, y1 - y0); };
export const ridge = (x, pts, col, bot = H + 20) => { x.fillStyle = col; x.beginPath(); x.moveTo(pts[0][0], bot); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(pts[pts.length - 1][0], bot); x.closePath(); x.fill(); };

// nobori: a tall banner hung from a pole; mon = round crest
export function nobori(x, px, by, h, col, sway = 0, mon = true, key = false) {
  x.save(); x.translate(px, by); x.lineCap = 'round';
  x.strokeStyle = S; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -h); x.moveTo(0, -h + 6); x.lineTo(34, -h + 6); x.stroke();
  const fw = 30, fh = h * .62, fx = 3 + sway * .3;
  x.fillStyle = col; x.beginPath(); x.moveTo(fx, -h + 8); x.lineTo(fx + fw + sway, -h + 8); x.lineTo(fx + fw + sway * 1.4, -h + 8 + fh); x.lineTo(fx + sway * .3, -h + 8 + fh); x.closePath(); x.fill();
  if (mon) { x.fillStyle = PAL.white; x.beginPath(); x.arc(fx + fw / 2 + sway * .6, -h + 8 + fh * .4, 9, 0, TAU); x.fill(); if (key) { x.strokeStyle = S; x.lineWidth = 1.4; x.stroke(); } }
  if (key) { x.strokeStyle = S; x.lineWidth = 1.8; x.beginPath(); x.moveTo(fx, -h + 8); x.lineTo(fx + fw + sway, -h + 8); x.lineTo(fx + fw + sway * 1.4, -h + 8 + fh); x.lineTo(fx + sway * .3, -h + 8 + fh); x.closePath(); x.stroke(); }
  x.restore();
}
// maku: curtain wall of a field camp
export function maku(x, x0, x1, y, h, c1 = PAL.white, c2 = PAL.prusD, key = false) {
  const n = Math.max(2, Math.round((x1 - x0) / 74)), w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    if (!key) { x.fillStyle = i % 2 ? c2 : c1; x.fillRect(x0 + i * w, y, w + 1, h); if (i % 2 === 0) { x.fillStyle = c2; x.beginPath(); x.arc(x0 + i * w + w / 2, y + h / 2, h * .2, 0, TAU); x.fill(); x.fillStyle = c1; x.beginPath(); x.arc(x0 + i * w + w / 2, y + h / 2, h * .11, 0, TAU); x.fill(); } }
    else { x.strokeStyle = S; x.lineWidth = 1.8; x.strokeRect(x0 + i * w, y, w, h); }
  }
  if (key) { x.fillStyle = S; for (let i = 0; i <= n; i++) x.fillRect(x0 + i * w - 2, y - 26, 4, h + 26); } else { x.fillStyle = PAL.woodD; for (let i = 0; i <= n; i++) x.fillRect(x0 + i * w - 3, y - 26, 6, h + 26); }
}
export function tent(x, cx, by, w, h, col, key = false) {
  if (!key) { x.fillStyle = col; x.beginPath(); poly(x, [[cx - w / 2, by], [cx - 6, by - h], [cx + 6, by - h], [cx + w / 2, by]]); x.fill(); x.fillStyle = S; x.beginPath(); poly(x, [[cx - w * .14, by], [cx, by - h * .5], [cx + w * .14, by]]); x.fill(); }
  else { edges(x, [[cx - w / 2, by], [cx - 6, by - h], [cx + 6, by - h], [cx + w / 2, by], [cx - w / 2, by]], 2.4, cx); }
}
// palisade of stakes with cross rails (Nagashino)
export function palisade(x, x0, x1, y, h, key = false) {
  const n = Math.round((x1 - x0) / 46);
  for (let i = 0; i <= n; i++) {
    const X = x0 + i * (x1 - x0) / n, hh = h * (.9 + .2 * hash(i + 3)), lean = (hash(i + 9) - .5) * 5;
    if (!key) { x.fillStyle = i % 2 ? PAL.wood : PAL.woodL; x.beginPath(); poly(x, [[X - 8, y], [X - 8 + lean, y - hh + 12], [X + lean, y - hh - 4], [X + 8 + lean, y - hh + 12], [X + 8, y]]); x.fill(); }
    else carve(x, [[X - 8, y], [X - 8 + lean, y - hh + 12], [X + lean, y - hh - 4], [X + 8 + lean, y - hh + 12], [X + 8, y]], 1.9, { taper: [.05, .05], seed: i * 3 });
  }
  for (const k of [.32, .68]) {
    if (!key) { x.fillStyle = PAL.woodD; x.fillRect(x0 - 10, y - h * k - 5, x1 - x0 + 20, 10); }
    else { carve(x, [[x0 - 10, y - h * k - 5], [x1 + 10, y - h * k - 5]], 2, { taper: [0, 0], seed: k * 9 }); carve(x, [[x0 - 10, y - h * k + 5], [x1 + 10, y - h * k + 5]], 1.6, { taper: [0, 0], seed: k * 9 + 1 }); }
  }
}
// horse + rider, facing left (d=-1) or right (d=1). ph = gait phase, fall in [0,1] = tumbling
export function horse(x, px, py, s, ph, o = {}) {
  const d = o.dir ?? -1, k = s / 100, fall = o.fall || 0, sil = o.sil;
  x.save(); x.translate(px, py); x.scale(d * k, k); if (fall) { x.translate(40, 0); x.rotate(-fall * 1.2); x.translate(-40, 0); } x.lineCap = 'round'; x.lineJoin = 'round';
  const body = sil ? S : (o.col || PAL.woodD), leg = fall ? 0 : Math.sin(ph * TAU);
  x.strokeStyle = S; x.lineWidth = 6.5;
  for (const [lx, a] of [[-46, 0], [-36, .5], [38, .25], [48, .75]]) { const sw = fall ? 14 * (lx < 0 ? -1 : 1) : Math.sin((ph + a) * TAU) * 22; x.beginPath(); x.moveTo(lx, -52); x.lineTo(lx + sw * .6, -26); x.lineTo(lx + sw, -2 - Math.max(0, -Math.cos((ph + a) * TAU)) * 8 * (fall ? 0 : 1)); x.stroke(); }
  x.fillStyle = body; x.beginPath(); x.ellipse(0, -66, 62, 25, -.05, 0, TAU); x.fill();
  x.beginPath(); poly(x, [[44, -76], [80, -112], [104, -104], [112, -84], [100, -82], [82, -92], [58, -54]]); x.fill();
  x.beginPath(); poly(x, [[80, -112], [86, -126], [92, -108]]); x.fill();
  x.strokeStyle = S; x.lineWidth = 3.4; x.beginPath(); x.moveTo(-60, -76); x.quadraticCurveTo(-96, -70 + leg * 6, -92, -34); x.stroke();
  x.lineWidth = 2.6; x.beginPath(); x.moveTo(52, -108); x.quadraticCurveTo(40, -100, 34, -84); x.stroke();
  if (!sil) { x.strokeStyle = S; x.lineWidth = 1.8; x.beginPath(); x.ellipse(0, -66, 62, 25, -.05, 0, TAU); x.stroke(); x.fillStyle = PAL.beni; x.fillRect(-18, -92, 36, 10); }
  if (!o.norider) {
    x.fillStyle = sil ? S : (o.armor || PAL.beni); x.beginPath(); poly(x, [[-14, -86], [12, -86], [16, -128], [-8, -130]]); x.fill();
    x.fillStyle = sil ? S : PAL.skin; x.beginPath(); x.arc(4, -142, 9, 0, TAU); x.fill();
    x.fillStyle = S; x.beginPath(); x.arc(4, -145, 10.5, Math.PI, TAU); x.fill(); x.beginPath(); poly(x, [[-6, -150], [4, -168], [14, -150]]); x.fill();
    x.lineWidth = 3; x.strokeStyle = S; x.beginPath(); x.moveTo(14, -112); x.lineTo(108, -150 + (o.lance || 0)); x.stroke();
    x.fillStyle = S; x.beginPath(); poly(x, [[108, -150 + (o.lance || 0)], [124, -154 + (o.lance || 0)], [108, -146 + (o.lance || 0)]]); x.fill();
    if (o.flag) { x.strokeStyle = S; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-10, -124); x.lineTo(-18, -224); x.stroke(); x.fillStyle = sil ? S : o.flag; x.fillRect(-52, -222, 34, 70); if (!sil) { x.fillStyle = PAL.white; x.beginPath(); x.arc(-35, -186, 8, 0, TAU); x.fill(); } }
  }
  x.restore();
}
// kneeling gunner, aiming left (d=-1) or right; fire in [0,1] = muzzle flash
export function gunner(x, px, py, s, o = {}) {
  const d = o.dir ?? -1, k = s / 100; x.save(); x.translate(px, py); x.scale(d * k, k); x.lineCap = 'round'; x.lineJoin = 'round';
  x.fillStyle = o.col2 || PAL.greyD; x.beginPath(); poly(x, [[-18, -36], [14, -36], [22, -3], [-26, -3]]); x.fill(); x.strokeStyle = S; x.lineWidth = 2; x.stroke();
  x.fillStyle = o.col || PAL.ai; x.beginPath(); poly(x, [[-16, -78], [8, -78], [14, -30], [-20, -30]]); x.fill();
  x.fillStyle = PAL.ochre; x.fillRect(-16, -52, 30, 5);
  x.fillStyle = PAL.skin; x.beginPath(); x.arc(-2, -88, 9, 0, TAU); x.fill();
  x.fillStyle = S; x.beginPath(); poly(x, [[-16, -92], [-2, -112], [14, -92]]); x.fill();
  x.strokeStyle = PAL.woodD; x.lineWidth = 5; x.beginPath(); x.moveTo(14, -62); x.lineTo(-96, -76); x.stroke();
  x.strokeStyle = S; x.lineWidth = 3.4; x.beginPath(); x.moveTo(-10, -66); x.lineTo(-70, -74); x.stroke();
  if (o.fire > 0) { const f = o.fire; x.fillStyle = PAL.ochreL; x.beginPath(); poly(x, [[-96, -76], [-96 - 34 * f, -96], [-96 - 20 * f, -76], [-96 - 38 * f, -58]]); x.fill(); x.fillStyle = PAL.beni; x.beginPath(); poly(x, [[-96, -76], [-96 - 18 * f, -86], [-96 - 12 * f, -76], [-96 - 20 * f, -68]]); x.fill(); }
  x.restore();
}
export function puff(x, cx, cy, u, col = PAL.white, a = .8) {          // powder smoke: u 0..1
  if (u <= 0 || u >= 1) return; const r = 14 + 74 * Math.sqrt(u);
  x.save(); x.globalAlpha = a * (1 - u * u); x.fillStyle = col;
  for (let i = 0; i < 5; i++) { const an = i / 5 * TAU + hash(cx + i) * 2; x.beginPath(); x.arc(cx + Math.cos(an) * r * .55, cy - u * 46 + Math.sin(an) * r * .4, r * (.42 + .1 * hash(i + 4)), 0, TAU); x.fill(); }
  x.restore();
}
// castle keep. mode 'fill' (colour) or 'key' (outline). roof = roof colour, wall = wall colour. returns the y of the ridge top
export function castle(x, cx, by, s, mode, o = {}) {
  const tiers = o.tiers || 5, roof = o.roof || PAL.greyD, wall = o.wall || PAL.white, stone = o.stone || PAL.greyL;
  const baseH = 130 * s, baseW = 300 * s, key = mode === 'key';
  if (!key) { x.fillStyle = stone; x.beginPath(); poly(x, [[cx - baseW, by], [cx + baseW, by], [cx + baseW * .78, by - baseH], [cx - baseW * .78, by - baseH]]); x.fill(); }
  else { edges(x, [[cx - baseW, by], [cx - baseW * .78, by - baseH], [cx + baseW * .78, by - baseH], [cx + baseW, by], [cx - baseW, by]], 2.8, 5); for (let r = 1; r < 5; r++) carve(x, [[cx - baseW * (1 - r * .044), by - r * baseH / 5], [cx + baseW * (1 - r * .044), by - r * baseH / 5]], 1, { taper: [.1, .1], seed: r }); }
  let y = by - baseH, w = 360 * s;
  for (let k = 0; k < tiers; k++) {
    const h = 66 * s, top = y - h, ew = w / 2 + 44 * s, nw = 3 + (tiers - k > 3 ? 1 : 0);
    if (!key) {
      x.fillStyle = wall; x.fillRect(cx - w / 2, top, w, h);
      x.fillStyle = S; for (let q = 0; q < nw; q++) x.fillRect(cx - w / 2 + (q + .5) * w / nw - 7 * s, top + h * .3, 14 * s, 20 * s);
      x.fillStyle = roof; x.beginPath(); poly(x, [[cx - ew, top + 12 * s], [cx - ew * .74, top - 34 * s], [cx + ew * .74, top - 34 * s], [cx + ew, top + 12 * s]]); x.fill();
    } else {
      edges(x, [[cx - w / 2, y], [cx - w / 2, top], [cx + w / 2, top], [cx + w / 2, y]], 2, k + 10);
      edges(x, [[cx - ew, top + 12 * s], [cx - ew * .74, top - 34 * s], [cx + ew * .74, top - 34 * s], [cx + ew, top + 12 * s], [cx - ew, top + 12 * s]], 2.4, k + 20);
    }
    y = top - 22 * s; w *= .8;
  }
  const ty = y + 22 * s;
  if (!key) { x.fillStyle = roof; x.beginPath(); poly(x, [[cx - w * .5 - 40 * s, ty - 4 * s], [cx, ty - 82 * s], [cx + w * .5 + 40 * s, ty - 4 * s]]); x.fill(); x.fillStyle = o.gold || PAL.ochre; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(cx + sd * (w * .5 + 34 * s), ty - 14 * s, 8 * s, 18 * s, sd * .5, 0, TAU); x.fill(); } }
  else { edges(x, [[cx - w * .5 - 40 * s, ty - 4 * s], [cx, ty - 82 * s], [cx + w * .5 + 40 * s, ty - 4 * s], [cx - w * .5 - 40 * s, ty - 4 * s]], 2.4, 33); }
  return ty - 82 * s;
}

// billowing smoke column drifting up and to the right
export function smoke(x, t, bx, by, f, o = {}) {
  if (f <= 0) return; const n = o.n || 36, col = o.col || S, Rn = mulberry(o.seed || 3);
  x.save();
  for (let i = 0; i < n; i++) {
    const u = (i / n + t * (o.speed || .06) + Rn() * .02) % 1, r = (o.r || 46) + u * (o.grow || 150);
    x.globalAlpha = (o.a || .5) * f * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 1.2;
    x.fillStyle = col; x.beginPath(); x.arc(bx + u * (o.drift || 340) + Math.sin(u * 9 + i) * 26, by - u * (o.rise || 620) + Rn() * 20, r, 0, TAU); x.fill();
  }
  x.restore();
}
