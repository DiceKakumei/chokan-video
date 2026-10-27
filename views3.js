// Scene prints for chapters 6-12 (local sheet time). Re-uses the layers of the first-cut prints in views.js.
import { clamp, lerp, seg, ss, eio, mulberry, hash, vnoise, TAU } from '/core/lib.js';
import { W, H, FR, PAL, poly, carve, wob, fillPath, bokashi, kasumi, rgba, mix } from './print.js';
import { goose, rain } from './nature.js';
import { q8, q12 } from './story.js';
import { fig, kago, chest, ripples, flame, S } from './figs.js';
import { rf, ridge, nobori, maku, tent, horse, gunner, puff, castle, smoke } from './figs2.js';
import { V3, V4, V5, V6, V7 } from './views.js';
import { SIEGE } from './views2.js';

// ———— 本能寺 ————
export const HONNOJI = {
  id: 'honnoji', cart: [120, 74], layers: V3.layers,
  paint(x, t, R) {
    const t12 = q12(t), tq = q8(t), len = R.len || 14, f = ss(seg(t, 1.5, 6)), brk = ss(seg(t, len - 3.4, len - .6));
    R.L('sky'); R.L('glow');
    R.D(3, x => { const g = x.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, rgba(PAL.beni, 0)); g.addColorStop(1, rgba(PAL.beni, .55 * f)); x.fillStyle = g; x.fillRect(0, 0, W, 900); });
    R.D(3, x => { for (let i = 0; i < 7; i++) { const p = ss(seg(t, 1.5 + .3 * i, 4.5 + .3 * i)); if (p > .02) flame(x, 642 + i * 130, 800, 90, 110 * p + 40 * p * hash(i), t12, i * 2.3, [PAL.beni, PAL.ochreL]); } });
    R.D(3, x => {      // roof flames sit behind the silhouette, so only the tips show
      const Rn = mulberry(5);
      for (let k = 0; k < 16; k++) { const bx = 500 + k * 70 + Rn() * 24, by = k % 3 ? 690 : 560, p = ss(seg(t, 2.5 + (k * 13 % 7) * .45, 6.5 + (k * 13 % 7) * .45)); if (p > .02) flame(x, bx, by, 80 + Rn() * 50, (140 + Rn() * 220) * p, t12, k * 3.1, [PAL.beni, PAL.ochre]); }
    });
    R.L('key');
    R.D(2, x => smoke(x, t, 900, 430, f * .8, { a: .4, seed: 5, speed: .05, rise: 380, drift: 300, r: 36, grow: 90, n: 44 }));
    R.D(3, x => { const Rn = mulberry(12); for (let k = 0; k < 90; k++) { const u = (t12 * .55 + Rn() * 6) % 6 / 6, px = 520 + Rn() * 1000 + Math.sin(u * 7 + k) * 40, py = 700 - u * 640 * (.5 + Rn()); x.fillStyle = k % 3 ? PAL.ochreL : PAL.beniL; x.globalAlpha = f * (1 - u); x.fillRect(px, py, 3 + Rn() * 3, 3 + Rn() * 3); } x.globalAlpha = 1; });
    R.D(0, x => { [[170, 960], [300, 990], [1500, 975], [1670, 1000], [1810, 965], [90, 1010]].forEach(([px, py], i) => fig(x, px, py, 118, { sil: true, ph: 0, still: true, dir: px < 900 ? 1 : -1, carry: i % 2 ? 'spear' : 'banner', hat: i % 3 ? null : 'kasa' })); });
    if (brk > 0) R.free(x => { const Rn = mulberry(61); for (let k = 0; k < 11; k++) { const bx = 560 + k * 80 + Rn() * 30, h = (700 + Rn() * 900) * brk * (1 - Math.abs(k - 5) / 12); flame(x, bx, 860, 130 + Rn() * 70, h, t12, k * 2.3, [PAL.beni, PAL.ochre]); } });
  },
  ev: len => [{ type: 'whoomp', t: len - 3.2, v: 1 }],
};

// ———— 関ヶ原 (霧の中): armies close in ————
export const SEKI = {
  id: 'seki', cart: [120, 74], layers: V5.layers,
  paint(x, t, R) {
    const tq = q8(t), sway = Math.sin(tq * 1.9) * 6, len = R.len || 14, u = ss(seg(t, .6, len - 1));
    R.L('sky'); R.L('land');
    const army = (x, dir, front, col, bcol) => { for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { const X = front - dir * (r * 92 + (k % 3) * 22), Y = 590 + k * 15 + r * 4, s = 74 + (Y - 590) * .3; fig(x, X, Y, s, { ph: tq * 1.6 + k * .3 + r, dir, col: k % 2 ? col : mix(col, PAL.greyD, .4), col2: PAL.greyL, carry: 'spear', hat: k % 3 ? null : 'kasa', still: u > .98 }); if (k % 4 === 0 && r === 1) nobori(x, X - dir * 10, Y - 6, s * 2.2, bcol, sway * dir, true, true); } };
    R.D(3, x => { army(x, 1, lerp(160, 860, u), PAL.prus, PAL.prus); army(x, -1, lerp(1760, 1050, u), PAL.beni, PAL.beni); });
    R.D(2, x => { kasumi(x, 800 + Math.sin(tq * .25) * 90, 640, 1500, 70, PAL.white, .55); kasumi(x, 1300 - Math.sin(tq * .2) * 100, 560, 1300, 50, PAL.white, .5); kasumi(x, 500 + Math.sin(tq * .3 + 2) * 80, 740, 1200, 60, PAL.white, .4 * (1 - ss(seg(t, len - 4, len - 1)))); });
    R.L('key');
    R.D(3, x => {
      const cx = 1500, by = 860, s = 1.9, pulse = Math.sin(tq * 1.2);
      x.save(); x.translate(cx, by); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round';
      x.fillStyle = PAL.woodD; x.fillRect(-26, -34, 52, 34); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(-26, -34, 52, 34);
      x.fillStyle = PAL.ai; x.beginPath(); poly(x, [[-24, -34], [-14, -88], [14, -88], [24, -34]]); x.fill(); x.stroke(); x.fillStyle = PAL.ochre; x.fillRect(-14, -58, 28, 5);
      x.fillStyle = PAL.skin; x.beginPath(); x.arc(0, -98, 10, 0, TAU); x.fill(); x.stroke(); x.fillStyle = S; x.beginPath(); x.arc(0, -101, 11.5, Math.PI, TAU); x.fill(); x.beginPath(); poly(x, [[-9, -104], [0, -126], [9, -104]]); x.fill();
      x.strokeStyle = S; x.lineWidth = 5; x.beginPath(); x.moveTo(12, -80); x.lineTo(34, -112 + pulse * 3); x.stroke();
      x.fillStyle = PAL.white; x.beginPath(); x.ellipse(40, -126 + pulse * 3, 15, 20, .35, 0, TAU); x.fill(); x.lineWidth = 1.6; x.stroke(); x.fillStyle = PAL.beni; x.beginPath(); x.arc(40, -126 + pulse * 3, 6, 0, TAU); x.fill();
      x.restore(); nobori(x, 1260, 870, 330, PAL.white, sway, true, true); nobori(x, 1740, 870, 330, PAL.white, -sway, true, true);
    });
  },
  ev: len => [{ type: 'horn', t: .5, v: .8 }],
};

// ———— 大坂城: three moods of one print (dusk · siege · burning) ————
const CB = { cx: 960, by: 790, s: 1.0 };
const tierTop = k => CB.by - 130 * CB.s - (k + 1) * 66 * CB.s - k * 22 * CB.s;
function osaka(id, o) {
  return {
    id, cart: o.cart || [120, 74], layers: V6.layers,
    paint(x, t, R) {
      const t12 = q12(t), tq = q8(t), len = R.len || 14, f = o.fire ? ss(seg(t, 1.0, 7)) : 0;
      R.L('sky');
      R.D(3, x => { const g = x.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, rgba(PAL.beni, 0)); g.addColorStop(1, rgba(PAL.beni, (o.fire ? .5 * f : .12))); x.fillStyle = g; x.fillRect(0, 0, W, 800); });
      R.D(1, x => { ripples(x, tq, 820, 1030, PAL.prusL, 14, .6, 22); if (o.fire) ripples(x, tq, 830, 1030, PAL.beniL, 8, .55 * f, 16); });
      R.D(3, x => {      // flames are drawn behind the walls: only the tips above the eaves show
        if (!o.fire) return; const Rn = mulberry(9);
        for (let k = 0; k < 5; k++) for (let j = 0; j < 3; j++) { const p = ss(seg(t, 1.2 + k * .9 + j * .25, 5 + k * .9 + j * .25)); if (p < .02) continue; const w = (360 * Math.pow(.8, k)) * CB.s, bx = CB.cx + (j - 1) * w * .42 + (Rn() - .5) * 20; flame(x, bx, tierTop(k) + 40, 50 + Rn() * 26, (60 + Rn() * 80) * p * (1 + .1 * k), t12, k * 5 + j, [PAL.beni, PAL.ochreL]); }
      });
      R.L('land'); R.L('key');
      R.D(2, x => { if (o.fire) smoke(x, t, 960, 330, f, { a: .55, seed: 4, speed: .05, rise: 560, drift: 380, r: 52, grow: 160, n: 40 }); });
      R.D(0, x => {
        [[330, 1010], [420, 1030], [1620, 1020], [1740, 1005], [1850, 1030], [110, 1040]].forEach(([px, py], i) => fig(x, px, py, 124, { sil: true, still: true, dir: px < 900 ? 1 : -1, carry: i % 2 ? 'spear' : 'banner', hat: i % 3 ? null : 'kasa' }));
        if (o.cannon) for (let i = 0; i < 3; i++) { const ft = ((t - 1 - i * .8) % 3.2 + 3.2) % 3.2; if (t > 1 + i * .8 && ft < 2.4) puff(x, 380 + i * 90, 930, ft / 2.4, PAL.greyL, .75); }
      });
      if (o.cannon) R.D(3, x => { for (let i = 0; i < 3; i++) { const ft = ((t - 1 - i * .8) % 3.2 + 3.2) % 3.2; if (t > 1 + i * .8 && ft < .15) { x.fillStyle = PAL.ochreL; x.beginPath(); x.arc(420 + i * 90, 940, 40 * (1 - ft / .15), 0, TAU); x.fill(); } } });
    },
    ev: len => { const e = []; if (o.cannon) for (let i = 0; i < 3; i++) for (let t = 1 + i * .8; t < len - .5; t += 3.2) e.push({ type: 'whoomp', t, v: .8 }); return e; },
  };
}
export const OSAKA_DUSK = osaka('osaka_dusk', {});
export const OSAKA_SIEGE = osaka('osaka_siege', { cannon: true });
export const OSAKA_BURN = osaka('osaka_burn', { fire: true, cart: [120, 74] });

// ———— 豊臣の黄金の城 / 天下統一 (reuse of the first-cut castle print) ————
export const GOLD = {
  id: 'gold', cart: [1800, 74], layers: V4.layers,
  paint(x, t, R) {
    const tq = q8(t), sway = Math.sin(tq * 1.5) * 6;
    R.L('sky'); R.L('sun'); R.L('land'); R.L('pine'); R.L('key');
    R.D(3, x => { nobori(x, 1180, 770, 230, PAL.ochre, sway, true, true); nobori(x, 1230, 770, 230, PAL.beni, -sway, true, true); nobori(x, 1280, 770, 230, PAL.ochre, sway, true, true); for (let k = 0; k < 8; k++) fig(x, 1180 + k * 70, 900 + (k % 2) * 26, 100, { still: true, dir: -1, col: PAL.prusD, col2: PAL.greyL, carry: 'spear', hat: null }); });
  },
};

// ———— 江戸の夜明け: the procession of a daimyo ————
export const EDO = {
  id: 'edo', cart: [1800, 74], layers: V7.layers,
  paint(x, t, R) {
    const tq = q8(t), ox = -t * 78;
    R.L('sky'); R.L('glow'); R.D(1, x => ripples(x, tq, 550, 840, PAL.prusL, 18, .8, 26)); R.L('land'); R.L('key');
    R.D(3, x => {
      const items = [['spear', 0], ['sam', 90], ['banner', 180], ['sam', 270], ['kago', 400], ['sam', 540], ['umb', 620], ['chest', 780], ['sam', 940]];
      items.forEach(([ty, d], i) => { const X = 1700 + ox + d, Y = 905, ph = tq * 1.5 + i * .37; if (X < -200 || X > W + 260) return;
        if (ty === 'spear') fig(x, X, Y, 104, { ph, col: PAL.greyD, carry: 'spear', hat: 'kasa' }); else if (ty === 'sam') fig(x, X, Y, 108, { ph, col: i % 2 ? PAL.ai : PAL.prusD, col2: PAL.greyL, sword: true });
        else if (ty === 'banner') fig(x, X, Y, 104, { ph, col: PAL.greyD, carry: 'banner', hat: 'kasa' }); else if (ty === 'kago') kago(x, X, Y, 104, ph); else if (ty === 'umb') fig(x, X, Y, 104, { ph, col: PAL.greyD, carry: 'umbrella', ucol: PAL.beni, hat: 'kasa' }); else chest(x, X, Y, 98, ph); });
    });
    R.D(0, x => { for (let i = 0; i < 7; i++) { const off = Math.abs(i - 3), u = seg(t, 0, R.len || 14); goose(x, lerp(1700, 380, u) + off * 34 + i * 2, 190 + off * 18 + Math.sin(u * 6 + i) * 3, 1.25, Math.sin(tq * 9 + i) > 0 ? 1 : -.4); } });
  },
};

// ———— 小田原: Toyotomi banners ring the Hojo fort ————
export const ODAWARA = {
  id: 'odawara', cart: [1800, 74], layers: SIEGE.layers,
  paint(x, t, R) {
    const tq = q8(t), sway = Math.sin(tq * 1.8) * 5;
    R.L('sky'); R.L('land'); R.L('key');
    R.D(3, x => {
      [[200, 760], [420, 830], [1500, 770], [1720, 830], [320, 940], [1620, 940], [980, 880], [760, 960], [1240, 960]].forEach(([px, py], i) => { tent(x, px, py, 220, 110, PAL.white); nobori(x, px + 70, py - 4, 190, i % 2 ? PAL.ochre : PAL.beni, sway * (i % 2 ? -1 : 1), true, true); });
      for (let k = 0; k < 12; k++) fig(x, 620 + k * 62, 850 + (k % 2) * 28, 96, { still: true, dir: k < 6 ? 1 : -1, col: PAL.ochre, col2: PAL.greyL, carry: 'spear', hat: null });
      nobori(x, 960, 560, 200, PAL.greyD, sway, true, true);
    });
  },
};
