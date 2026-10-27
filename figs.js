// Shared props: the bridge (one key block, reprinted in several views), flat figures, water, flames
import { clamp, lerp, seg, ss, mulberry, hash, vnoise, TAU } from '/core/lib.js';
import { W, H, FR, PAL, poly, carve, wob, line, bokashi, kasumi, rgba } from './print.js';
const S = PAL.sumi;

// —— the bridge: an arched wooden bridge, side view ——
export const dk = (B, X) => B.yb - B.H * (1 - Math.pow((X - B.xc) / B.half, 2));
const deckPoly = (B, xa, xb, o0, o1) => { const t = [], b = []; for (let X = xa; X <= xb + .1; X += 12) { t.push([X, dk(B, X) + o0]); b.push([X, dk(B, X) + o1]); } return t.concat(b.reverse()); };
export const piersOf = B => { const a = []; for (let k = 0; k <= 6; k++) a.push(B.xc - B.half + k * B.half / 3); return a; };
export function bridgeWood(x, B, prog = 1, o = {}) {
  const xL = B.xc - B.half, xE = xL + 2 * B.half * Math.max(.0001, prog), P = piersOf(B);
  x.lineCap = 'round'; x.lineJoin = 'round';
  if (prog < 1) {               // scaffolding where the span is not built yet
    x.strokeStyle = PAL.woodL; x.lineWidth = 6;
    for (const px of P) { if (px <= xE) continue; const y = dk(B, px) + 24; x.beginPath(); x.moveTo(px, B.water); x.lineTo(px, y); x.stroke(); x.beginPath(); x.moveTo(px - 70, B.water - 10); x.lineTo(px + 70, y + 70); x.stroke(); x.beginPath(); x.moveTo(px + 70, B.water - 10); x.lineTo(px - 70, y + 70); x.stroke(); }
  }
  x.fillStyle = PAL.woodD; x.strokeStyle = PAL.woodD;
  for (const px of P) { if (px > xE) continue; const y = dk(B, px) + 24; x.fillRect(px - 8, y, 16, B.water - y); }
  x.lineWidth = 5;
  for (let k = 0; k < 6; k++) { const a = P[k], b = P[k + 1]; if (b > xE) continue; const y0 = Math.max(dk(B, a), dk(B, b)) + 70, y1 = B.water - 26; x.beginPath(); x.moveTo(a, y1); x.lineTo(b, y0); x.moveTo(b, y1); x.lineTo(a, y0); x.stroke(); }
  x.fillStyle = PAL.woodD; x.beginPath(); poly(x, deckPoly(B, xL, xE, 16, 34)); x.fill();
  x.fillStyle = o.deck || PAL.woodL; x.beginPath(); poly(x, deckPoly(B, xL, xE, 0, 18)); x.fill();
  x.strokeStyle = PAL.wood; x.lineWidth = 2; for (let X = xL + 20; X < xE; X += 34) { x.beginPath(); x.moveTo(X, dk(B, X) + 1); x.lineTo(X + 5, dk(B, X) + 17); x.stroke(); }
  x.fillStyle = PAL.wood; for (let X = xL + 12; X <= xE; X += 84) x.fillRect(X - 4, dk(B, X) - 46, 8, 48);
  x.strokeStyle = PAL.wood; for (const [off, lw] of [[46, 8], [24, 4]]) { x.lineWidth = lw; x.beginPath(); for (let X = xL; X <= xE; X += 12) X === xL ? x.moveTo(X, dk(B, X) - off) : x.lineTo(X, dk(B, X) - off); x.stroke(); }
}
export function bridgeKey(x, B, prog = 1) {
  const xL = B.xc - B.half, xE = xL + 2 * B.half * Math.max(.0001, prog), P = piersOf(B);
  x.fillStyle = S;
  const pt = (off, a = xL, b = xE) => { const p = []; for (let X = a; X <= b + .1; X += 40) p.push([X, dk(B, X) + off]); return p; };
  carve(x, pt(0), 2.6, { taper: [.02, .02] }); carve(x, pt(18), 2.2, { taper: [.02, .02], seed: 3 }); carve(x, pt(34), 2.2, { taper: [.02, .02], seed: 4 });
  carve(x, pt(-46), 2.4, { taper: [.02, .02], seed: 5 }); carve(x, pt(-24), 1.5, { taper: [.02, .02], seed: 6 });
  for (let X = xL + 12; X <= xE; X += 84) { x.fillRect(X - 5, dk(B, X) - 46, 1.5, 46); x.fillRect(X + 3.5, dk(B, X) - 46, 1.5, 46); }
  for (const px of P) { if (px > xE) continue; const y = dk(B, px) + 34; carve(x, [[px - 8, y], [px - 8, B.water]], 1.8, { taper: [0, .3], seed: px }); carve(x, [[px + 8, y], [px + 8, B.water]], 1.8, { taper: [0, .3], seed: px + 1 }); }
  if (prog < 1) for (const px of P) { if (px <= xE) continue; const y = dk(B, px) + 24; carve(x, [[px, B.water], [px, y]], 1.4, { taper: [0, .2], seed: px }); carve(x, [[px - 70, B.water - 10], [px + 70, y + 70]], 1.1, { taper: [.1, .1], seed: px + 3 }); carve(x, [[px + 70, B.water - 10], [px - 70, y + 70]], 1.1, { taper: [.1, .1], seed: px + 4 }); }
}
export function bridgeSil(x, B) {      // flat black silhouette (the fire print)
  const xL = B.xc - B.half, xE = B.xc + B.half, P = piersOf(B);
  x.fillStyle = S; x.beginPath(); poly(x, deckPoly(B, xL, xE, -4, 34)); x.fill();
  for (const px of P) { const y = dk(B, px) + 24; x.fillRect(px - 8, y, 16, B.water - y); }
  for (let X = xL + 12; X <= xE; X += 84) x.fillRect(X - 4, dk(B, X) - 46, 8, 50);
  x.strokeStyle = S; x.lineWidth = 8; x.beginPath(); for (let X = xL; X <= xE; X += 12) X === xL ? x.moveTo(X, dk(B, X) - 46) : x.lineTo(X, dk(B, X) - 46); x.stroke();
}

// —— flat figures (side view, 8 fps by the caller) ——
export function fig(x, px, py, s, o = {}) {
  const d = o.dir ?? -1, k = s / 100, ph = o.ph ?? 0, sil = o.sil, ink = sil ? S : S;
  const col = sil ? S : (o.col || PAL.ai), obi = sil ? S : (o.obi || PAL.ochre), skin = sil ? S : PAL.skin;
  const sw = o.still ? 0 : Math.sin(ph * TAU) * 11;
  x.save(); x.translate(px, py); x.scale(d * k, k); x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = ink; x.lineWidth = 5;
  x.beginPath(); x.moveTo(-3, -38); x.lineTo(-3 + sw, -2); x.moveTo(3, -38); x.lineTo(3 - sw, -2); x.stroke();
  x.fillStyle = col; x.beginPath(); x.moveTo(-10, -84); x.lineTo(11, -84); x.lineTo(15, -33); x.lineTo(-15, -33); x.closePath(); x.fill();
  if (!sil) { x.lineWidth = 2; x.stroke(); x.fillStyle = obi; x.fillRect(-12, -62, 25, 6); if (o.col2) { x.fillStyle = o.col2; x.fillRect(-10, -84, 21, 10); } }
  // arm
  const ax = o.arm === 'point' ? 36 : o.arm === 'up' ? 18 : 12 + sw * .2, ay = o.arm === 'point' ? -86 : o.arm === 'up' ? -118 : -60;
  x.strokeStyle = sil ? S : col; x.lineWidth = 6; x.beginPath(); x.moveTo(5, -78); x.lineTo(ax, ay); x.stroke();
  // head
  x.fillStyle = skin; x.beginPath(); x.arc(3, -92, 9, 0, TAU); x.fill(); if (!sil) { x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke(); }
  if (o.hat === 'kasa') { x.fillStyle = sil ? S : PAL.ochreL; x.beginPath(); x.moveTo(-14, -94); x.lineTo(4, -112); x.lineTo(22, -94); x.closePath(); x.fill(); if (!sil) { x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke(); } }
  else { x.fillStyle = S; x.beginPath(); x.arc(3, -94, 9.5, Math.PI * 1.02, TAU * .98); x.fill(); x.fillRect(-9, -99, 9, 3); x.beginPath(); x.moveTo(-6, -98); x.lineTo(-13, -108); x.lineWidth = 3; x.strokeStyle = S; x.stroke(); }
  if (o.sword) { x.strokeStyle = S; x.lineWidth = 3; x.beginPath(); x.moveTo(-12, -58); x.lineTo(-32, -44); x.stroke(); }
  const c = o.carry;
  if (c === 'umbrella') { x.fillStyle = sil ? S : (o.ucol || PAL.ochreL); x.beginPath(); x.moveTo(-40, -112); x.quadraticCurveTo(8, -158, 56, -112); x.closePath(); x.fill(); x.strokeStyle = S; x.lineWidth = 2; if (!sil) x.stroke(); x.beginPath(); x.moveTo(8, -134); x.lineTo(ax, ay); x.stroke(); }
  if (c === 'spear') { x.strokeStyle = S; x.lineWidth = 3; x.beginPath(); x.moveTo(ax, ay + 20); x.lineTo(ax + 6, -170); x.stroke(); x.fillStyle = S; x.beginPath(); x.ellipse(ax + 6, -178, 7, 13, 0, 0, TAU); x.fill(); }
  if (c === 'banner') { x.strokeStyle = S; x.lineWidth = 3; x.beginPath(); x.moveTo(ax, ay + 24); x.lineTo(ax + 4, -196); x.moveTo(ax + 4, -192); x.lineTo(ax + 62, -192); x.stroke(); x.fillStyle = PAL.white; x.fillRect(ax + 6, -192, 54, 90); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(ax + 6, -192, 54, 90); x.fillStyle = S; x.beginPath(); x.arc(ax + 33, -150, 15, 0, TAU); x.fill(); x.fillStyle = PAL.white; x.beginPath(); x.arc(ax + 33, -150, 8, 0, TAU); x.fill(); }
  if (c === 'bundle') { x.fillStyle = PAL.straw; x.fillRect(-26, -84, 20, 26); x.strokeStyle = S; x.lineWidth = 1.8; x.strokeRect(-26, -84, 20, 26); }
  if (c === 'lantern') { x.fillStyle = PAL.beni; x.beginPath(); x.ellipse(ax + 4, ay + 12, 8, 11, 0, 0, TAU); x.fill(); x.strokeStyle = S; x.lineWidth = 1.5; x.stroke(); }
  if (c === 'hammer') { const sw2 = Math.sin(ph * TAU * 1.2) * 16; x.strokeStyle = S; x.lineWidth = 3; x.beginPath(); x.moveTo(ax, ay); x.lineTo(ax + 14, ay - 18 + sw2); x.stroke(); x.fillStyle = S; x.fillRect(ax + 8, ay - 24 + sw2, 14, 8); }
  if (c === 'pole') { x.strokeStyle = PAL.woodD; x.lineWidth = 4; x.beginPath(); x.moveTo(-60, -100); x.lineTo(70, -40); x.stroke(); }
  x.restore();
}
export function kago(x, px, py, s, ph, o = {}) {         // palanquin carried by two bearers (the lord's)
  const k = s / 100, bob = Math.abs(Math.sin(ph * TAU)) * 3 * k;
  fig(x, px - 74 * k, py, s, { ph, col: PAL.greyD, carry: 'pole', dir: -1, hat: 'kasa' }); fig(x, px + 74 * k, py, s, { ph: ph + .5, col: PAL.greyD, dir: -1, hat: 'kasa' });
  x.save(); x.translate(px, py - 128 * k + bob); x.scale(k, k);
  x.strokeStyle = PAL.woodD; x.lineWidth = 6; x.beginPath(); x.moveTo(-100, -4); x.lineTo(100, -4); x.stroke();
  x.fillStyle = S; x.fillRect(-54, 4, 108, 62); x.fillStyle = PAL.ochre; x.fillRect(-54, 50, 108, 7);
  x.fillStyle = S; x.beginPath(); x.moveTo(-64, 6); x.quadraticCurveTo(0, -30, 64, 6); x.closePath(); x.fill();
  x.fillStyle = PAL.paper; x.fillRect(-30, 18, 60, 26); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(-30, 18, 60, 26);
  x.restore();
}
export function chest(x, px, py, s, ph) {                  // a long chest on a pole, two porters
  const k = s / 100;
  fig(x, px - 70 * k, py, s, { ph, col: PAL.greyD, hat: 'kasa' }); fig(x, px + 70 * k, py, s, { ph: ph + .5, col: PAL.greyD, hat: 'kasa' });
  x.save(); x.translate(px, py - 118 * k); x.scale(k, k); x.strokeStyle = PAL.woodD; x.lineWidth = 6; x.beginPath(); x.moveTo(-96, -2); x.lineTo(96, -2); x.stroke();
  x.fillStyle = PAL.woodD; x.fillRect(-60, 6, 120, 38); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(-60, 6, 120, 38); x.fillStyle = PAL.ochre; x.fillRect(-60, 22, 120, 5); x.restore();
}

// —— water ——
export function ripples(x, tq, y0, y1, col = PAL.prusL, n = 24, a = .8, sp = 34) {
  x.strokeStyle = rgba(col, a); x.lineWidth = 2.2; x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const y = y0 + (y1 - y0) * Math.pow(i / n, 1.25), sc = .5 + i * .035, ph = tq * sp * sc + i * 97;
    x.beginPath();
    for (let X = -60 + ((ph % 180) + 180) % 180; X < W + 100; X += 180 * sc) { x.moveTo(X, y); x.quadraticCurveTo(X + 30 * sc, y - 6 * sc, X + 60 * sc, y); x.quadraticCurveTo(X + 90 * sc, y + 5 * sc, X + 115 * sc, y); }
    x.stroke();
  }
}
// —— fire ——
export function flame(x, bx, by, w, h, t12, seed, cols) {
  for (let layer = 0; layer < cols.length; layer++) {
    const sc = layer ? .55 : 1, sway = Math.sin(t12 * 5 + seed) * w * .25, tipx = bx + sway * (layer ? .6 : 1), tipy = by - h * sc * (.88 + .12 * Math.sin(t12 * 7 + seed * 2));
    x.fillStyle = cols[layer]; x.beginPath(); x.moveTo(bx - w / 2 * sc, by);
    x.bezierCurveTo(bx - w * .7 * sc, by - h * .35 * sc, bx - w * .2 * sc + sway * .3, by - h * .65 * sc, tipx, tipy);
    x.bezierCurveTo(bx + w * .25 * sc + sway * .3, by - h * .6 * sc, bx + w * .75 * sc, by - h * .3 * sc, bx + w / 2 * sc, by); x.quadraticCurveTo(bx, by + w * .34 * sc, bx - w / 2 * sc, by); x.closePath(); x.fill();
  }
}
export { S };
