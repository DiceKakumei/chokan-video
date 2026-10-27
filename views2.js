// Scene prints for chapters 1-5 (times are local to the sheet: t = 0 at the start of the sheet, R.len = its length)
import { clamp, lerp, seg, ss, eio, mulberry, hash, vnoise, TAU } from '/core/lib.js';
import { W, H, FR, PAL, poly, carve, wob, fillPath, bokashi, kasumi, rgba, mix, drawSeal } from './print.js';
import { pine, goose, mountain, rain } from './nature.js';
import { q8, q12 } from './story.js';
import { fig, kago, ripples, flame, S } from './figs.js';
import { rf, ridge, nobori, maku, tent, horse, gunner, puff, castle, smoke } from './figs2.js';

// ———— 応仁の乱: Kyoto burns, ashigaru with torches ————
const TOWN = (() => { const R = mulberry(31), p = []; for (let X = 10; X < 1930; X += 60 + R() * 70) p.push({ x: X, w: 70 + R() * 70, h: 50 + R() * 70 }); return p; })();
export const BURN = {
  id: 'burn', cart: [120, 74],
  layers: {
    sky: { g: 1, grain: .1, draw(x) { rf(x, PAL.prusD, FR.x0, FR.y0, FR.x1, 800); bokashi(x, 0, FR.y0, W, 600, PAL.sumi, 1, 0, { rough: 28, seed: 81 }); x.fillStyle = '#2a1d2a'; x.fillRect(0, 800, W, H - 800); } },
    glow: { g: 3, draw(x) { bokashi(x, 0, 180, W, 760, PAL.beni, 0, 1, { rough: 22, seed: 83 }); bokashi(x, 0, 520, W, 820, PAL.ochre, 0, .65, { rough: 16, seed: 84 }); } },
    key: { g: 0, speck: .1, draw(x) {
      x.fillStyle = S; for (const h of TOWN) { x.fillRect(h.x, 800 - h.h, h.w, h.h + 20); x.beginPath(); poly(x, [[h.x - 14, 800 - h.h + 6], [h.x + 10, 800 - h.h - 34], [h.x + h.w - 10, 800 - h.h - 34], [h.x + h.w + 14, 800 - h.h + 6]]); x.fill(); }
      for (let k = 0; k < 5; k++) { const w = 150 - k * 22, y = 780 - k * 78; x.fillRect(1380 - w / 2, y - 60, w, 64); x.beginPath(); poly(x, [[1380 - w / 2 - 26, y - 52], [1380 - w / 2 + 10, y - 82], [1380 + w / 2 - 10, y - 82], [1380 + w / 2 + 26, y - 52]]); x.fill(); }
      x.fillRect(1376, 330, 8, 70);
      x.fillRect(0, 800, W, 260);
    } },
  },
  paint(x, t, R) {
    const t12 = q12(t), f = ss(seg(t, .5, 5));
    R.L('sky'); R.L('glow');
    R.D(3, x => { const g = x.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, rgba(PAL.beni, 0)); g.addColorStop(1, rgba(PAL.beni, .5 * f)); x.fillStyle = g; x.fillRect(0, 0, W, 800); });
    R.D(3, x => { const Rn = mulberry(7); TOWN.forEach((h, i) => { const p = ss(seg(t, .4 + (i * 7 % 11) * .35, 3 + (i * 7 % 11) * .35)); if (p > .02) flame(x, h.x + h.w / 2, 800 - h.h * .8, 60 + Rn() * 50, (80 + Rn() * 140) * p, t12, i * 2.1, [PAL.beni, PAL.ochreL]); }); });
    R.D(3, x => { for (let k = 0; k < 4; k++) { const p = ss(seg(t, 1.2 + k * .8, 4 + k * .8)); if (p > .02) flame(x, 1380 + (k - 1.5) * 34, 452 + (k % 2) * 14, 86, 230 * p, t12, k * 3, [PAL.beni, PAL.ochreL]); } });   // behind the tower: only the part above the roofs shows, so no cut-off base
    R.L('key');
    R.D(2, x => smoke(x, t, 900, 560, f, { a: .38, seed: 6, speed: .04, rise: 380, drift: 420, r: 34, grow: 80, n: 56 }));
    R.D(3, x => { const Rn = mulberry(12); for (let k = 0; k < 70; k++) { const u = (t12 * .5 + Rn() * 6) % 6 / 6, px = 100 + Rn() * 1700 + Math.sin(u * 7 + k) * 40, py = 780 - u * 640 * (.5 + Rn()); x.fillStyle = k % 3 ? PAL.ochreL : PAL.beniL; x.globalAlpha = f * (1 - u); x.fillRect(px, py, 3 + Rn() * 3, 3 + Rn() * 3); } x.globalAlpha = 1; });
    R.D(0, x => { [[200, 980], [340, 1010], [520, 990], [1480, 1000], [1650, 985], [1800, 1010]].forEach(([px, py], i) => fig(x, px, py, 124, { sil: true, ph: q8(t) * 1.4 + i, dir: px < 900 ? 1 : -1, carry: i % 2 ? 'spear' : null, hat: 'kasa', arm: i % 3 === 0 ? 'up' : null })); });
  },
};

// ———— 足軽: foot soldiers marching on a road ————
export const ASHI = {
  id: 'ashi', cart: [1800, 74],
  layers: {
    sky: { g: 1, grain: .08, draw(x) { bokashi(x, 0, FR.y0, W, 420, PAL.sky, .95, 0, { rough: 26, seed: 91 }); ridge(x, [[-20, 560], [300, 500], [700, 540], [1100, 480], [1500, 530], [1960, 490]], PAL.skyL); ridge(x, [[-20, 620], [400, 580], [900, 610], [1400, 570], [1960, 600]], PAL.greenL); } },
    sun: { g: 3, draw(x) { bokashi(x, 0, 300, W, 640, PAL.ochreL, 0, .6, { rough: 20, seed: 92 }); x.fillStyle = PAL.beni; x.beginPath(); x.arc(1500, 240, 50, 0, TAU); x.fill(); } },
    land: { g: 2, grain: .05, draw(x) { rf(x, PAL.green, 0, 640, W, H); x.fillStyle = PAL.ochreL; x.beginPath(); poly(x, [[0, 760], [W, 700], [W, 960], [0, 1020]]); x.fill(); } },
    key: { g: 0, speck: .1, draw(x) { x.fillStyle = S; carve(x, [[0, 640], [W, 640]], 1.6, { taper: [.1, .1], seed: 2 }); carve(x, [[0, 760], [W, 700]], 2.4, { taper: [0, 0], seed: 3 }); carve(x, [[0, 1020], [W, 960]], 2.4, { taper: [0, 0], seed: 4 }); pine(x, 220, 700, 1.2, { seed: 5, lean: .3, fills: false, lw: 2.4, minI: 4 }); } },
    pine: { g: 2, grain: .04, draw(x) { pine(x, 220, 700, 1.2, { seed: 5, lean: .3, lines: false, minI: 4 }); } },
  },
  paint(x, t, R) {
    const tq = q8(t);
    R.L('sky'); R.L('sun'); R.L('land'); R.L('pine'); R.L('key');
    R.D(3, x => {
      for (let r = 0; r < 3; r++) for (let k = 0; k < 14; k++) {
        const X = -300 + (t * 120 + k * 150 + r * 61) % 2500, Y = 820 + r * 62 - (X / W) * 24, s = 104 + r * 6;
        if (X < -120 || X > W + 120) continue;
        fig(x, X, Y, s, { ph: tq * 1.5 + k * .37 + r, dir: 1, col: [PAL.greyD, PAL.straw, PAL.prusD, PAL.woodD][(k + r) % 4], carry: k % 4 === 0 ? 'banner' : 'spear', hat: 'kasa' });
      }
    });
  },
};

// ———— 種子島: a Chinese junk with Portuguese aboard drifts ashore ————
function junk(x, px, py, s, bob) {
  x.save(); x.translate(px, py + bob); x.scale(s, s); x.lineJoin = 'round'; x.lineCap = 'round';
  x.fillStyle = PAL.woodD; x.beginPath(); poly(x, [[-230, -30], [210, -30], [290, -90], [-270, -110]]); x.fill(); x.strokeStyle = S; x.lineWidth = 4; x.stroke();
  x.fillStyle = PAL.wood; x.fillRect(-250, -110, 520, 28); x.strokeRect(-250, -110, 520, 28);
  for (const [mx, mh] of [[-90, 380], [90, 330]]) { x.strokeStyle = S; x.lineWidth = 8; x.beginPath(); x.moveTo(mx, -100); x.lineTo(mx, -100 - mh); x.stroke();
    x.fillStyle = PAL.paper; x.beginPath(); poly(x, [[mx + 6, -112 - mh + 20], [mx + 150, -112 - mh + 40], [mx + 150, -112 - 30], [mx + 6, -112 - 10]]); x.fill(); x.lineWidth = 3; x.stroke();
    x.strokeStyle = PAL.wood; x.lineWidth = 3; for (let k = 1; k < 6; k++) { const yy = -112 - mh + 20 + k * (mh - 50) / 6; x.beginPath(); x.moveTo(mx + 6, yy); x.lineTo(mx + 150, yy + 14); x.stroke(); } }
  x.restore();
}
export const TANE = {
  id: 'tane', cart: [120, 74],
  layers: {
    sky: { g: 1, grain: .08, draw(x) {
      bokashi(x, 0, FR.y0, W, 470, PAL.sky, .95, 0, { rough: 24, seed: 101 }); const g = x.createLinearGradient(0, 520, 0, H); g.addColorStop(0, PAL.skyL); g.addColorStop(1, PAL.ai); x.fillStyle = g; x.fillRect(0, 520, W, H - 520);
      kasumi(x, 600, 330, 700, 20, PAL.white, .85); kasumi(x, 1500, 280, 520, 16, PAL.white, .8);
      ridge(x, [[-20, 520], [200, 480], [520, 520], [800, 500], [1100, 520]], PAL.prusL, 540);
    } },
    land: { g: 2, grain: .05, draw(x) { fillPath(x, [[1260, 1060], [1360, 880], [1560, 800], [1960, 780], [1960, 1060]], PAL.ochreL, true); x.fillStyle = PAL.green; x.beginPath(); poly(x, [[1560, 800], [1700, 700], [1960, 660], [1960, 780]]); x.fill(); } },
    key: { g: 0, speck: .1, draw(x) { x.fillStyle = S; carve(x, wob([[1260, 1060], [1360, 880], [1560, 800], [1960, 780]], 2, 3), 2.6, { taper: [0, .2] }); carve(x, wob([[1560, 800], [1700, 700], [1960, 660]], 2, 4), 2.4, { taper: [0, .2] }); pine(x, 1780, 800, 1.0, { seed: 8, lean: -.3, fills: false, lw: 2.4, minI: 4 }); } },
    pine: { g: 2, grain: .04, draw(x) { pine(x, 1780, 800, 1.0, { seed: 8, lean: -.3, lines: false, minI: 4 }); } },
  },
  paint(x, t, R) {
    const tq = q8(t), u = ss(seg(t, 0, R.len || 14));
    R.L('sky'); R.D(1, x => ripples(x, tq, 560, 1040, PAL.prusL, 18, .7, 22)); R.L('land'); R.L('pine'); R.L('key');
    R.D(3, x => { junk(x, lerp(360, 980, u), 760, lerp(.8, 1.05, u), Math.sin(tq * 1.3) * 5);
      [[1380, 905], [1500, 870], [1640, 850]].forEach(([px, py], i) => fig(x, px, py, 112, { still: true, dir: -1, col: [PAL.prusD, PAL.greyD, PAL.straw][i], hat: i === 1 ? null : 'kasa', arm: i === 0 ? 'point' : null }));
      fig(x, 1700, 830, 120, { still: true, dir: -1, col: PAL.ai, carry: 'umbrella', ucol: PAL.beni, obi: PAL.ochre }); });
    R.D(0, x => { for (let k = 0; k < 4; k++) goose(x, lerp(1700, 500, seg(t, 1, R.len || 14)) + Math.abs(k - 1.5) * 34, 220 + Math.abs(k - 1.5) * 16, 1.2, Math.sin(tq * 9 + k) > 0 ? 1 : -.4); });
  },
};

// ———— 鍛冶場: a smith copies the gun ————
export const FORGE = {
  id: 'forge', cart: [1800, 74],
  layers: {
    sky: { g: 1, grain: .1, draw(x) { rf(x, '#2b1f19', FR.x0, FR.y0, FR.x1, FR.y1); bokashi(x, 0, FR.y0, W, 600, PAL.sumi, .9, 0, { rough: 24, seed: 111 }); rf(x, '#3b2a20', 0, 860, W, H); } },
    glow: { g: 3, draw(x) { const g = x.createRadialGradient(420, 700, 20, 420, 700, 620); g.addColorStop(0, rgba(PAL.ochreL, .9)); g.addColorStop(.4, rgba(PAL.beni, .5)); g.addColorStop(1, rgba(PAL.beni, 0)); x.fillStyle = g; x.fillRect(0, 0, W, H); } },
    key: { g: 0, speck: .1, draw(x) {
      x.fillStyle = S; x.fillRect(120, 560, 520, 300); x.fillRect(200, 460, 360, 110);            // hearth
      x.fillRect(1000, 760, 220, 100); x.fillRect(1020, 720, 180, 50);                              // anvil
      for (let k = 0; k < 6; k++) { x.save(); x.translate(1460 + k * 56, 880); x.rotate(-.12); x.fillStyle = k % 2 ? PAL.greyD : S; x.fillRect(-10, -460, 20, 460); x.restore(); }   // barrels leaning on the wall
      x.fillRect(1380, 400, 480, 14); x.fillRect(FR.x0, 860, FR.x1 - FR.x0, 8);
    } },
  },
  paint(x, t, R) {
    const t12 = q12(t), tq = q8(t);
    R.L('sky'); R.L('glow'); R.L('key');
    R.D(3, x => { flame(x, 380, 590, 150, 170, t12, 1, [PAL.beni, PAL.ochreL]); flame(x, 470, 590, 110, 120, t12, 4, [PAL.ochre, PAL.ochreL]);
      x.fillStyle = PAL.beniL; x.fillRect(1030, 706, 150, 14);   // glowing iron on the anvil
      const Rn = mulberry(21); for (let k = 0; k < 26; k++) { const u = (t12 * 1.4 + Rn() * 3) % 1, a = Rn() * 2.6 + .3; x.fillStyle = PAL.ochreL; x.globalAlpha = 1 - u; x.fillRect(1100 + Math.cos(a) * 160 * u * (Rn() + .3), 700 - Math.sin(a) * 200 * u + u * u * 140, 4, 4); } x.globalAlpha = 1; });
    R.D(0, x => { fig(x, 920, 870, 150, { dir: 1, ph: tq * .9, col: PAL.prusD, carry: 'hammer', hat: null, still: true }); fig(x, 760, 880, 124, { dir: 1, ph: tq, col: PAL.woodD, hat: null, arm: 'point' }); });
    R.D(0, x => { fig(x, 1180, 880, 130, { dir: -1, ph: 0, col: PAL.greyD, still: true, hat: 'kasa' }); });
  },
};

// ———— 鉄砲隊: a line of gunners firing in turn ————
export const GUNLINE = {
  id: 'gunline', cart: [120, 74],
  layers: {
    sky: { g: 1, grain: .08, draw(x) { bokashi(x, 0, FR.y0, W, 420, PAL.sky, .95, 0, { rough: 26, seed: 121 }); ridge(x, [[-20, 540], [300, 470], [700, 520], [1100, 450], [1500, 510], [1960, 470]], PAL.prusL); ridge(x, [[-20, 620], [500, 580], [1000, 600], [1500, 570], [1960, 600]], PAL.greenL); } },
    land: { g: 2, grain: .05, draw(x) { rf(x, PAL.green, 0, 640, W, H); } },
    key: { g: 0, speck: .1, draw(x) { x.fillStyle = S; carve(x, wob([[-20, 540], [300, 470], [700, 520], [1100, 450], [1500, 510], [1960, 470]], 2, 3), 2.4, { taper: [.02, .02] }); carve(x, [[0, 640], [W, 640]], 1.6, { taper: [.1, .1], seed: 2 }); } },
  },
  paint(x, t, R) {
    const tq = q8(t);
    R.L('sky'); R.L('land'); R.L('key');
    const N = 8;
    R.D(3, x => { for (let k = 0; k < N; k++) { const X = 220 + k * 210, ft = ((t - 1 - k * .35) % 3.2 + 3.2) % 3.2, on = t > 1 + k * .35; gunner(x, X, 860 - (k % 2) * 40, 132, { dir: -1, col: [PAL.ai, PAL.prusD, PAL.greyD][k % 3], fire: on && ft < .16 ? 1 - ft / .16 : 0 }); } });
    R.D(2, x => { for (let k = 0; k < N; k++) { const X = 220 + k * 210, ft = ((t - 1 - k * .35) % 3.2 + 3.2) % 3.2; if (t > 1 + k * .35 && ft < 2) puff(x, X + 150, 780 - (k % 2) * 40, ft / 2, PAL.white, .7); } });
  },
};
GUNLINE.ev = len => { const e = []; for (let k = 0; k < 8; k++) for (let t = 1 + k * .35; t < len - .5; t += 3.2) e.push({ type: 'gun', t, v: .7 }); return e; };

// ———— 桶狭間 (reuse of the V1 layers): the charge into the camp ————
export function okeDeath(V1) {
  return {
    id: 'oke_death', cart: [1800, 74], layers: V1.layers,
    paint(x, t, R) {
      const tq = q8(t), sway = Math.sin(tq * 1.7) * 5, u = ss(seg(t, .5, 5.5)), len = R.len || 12;
      R.L('sky'); R.L('land'); R.L('pines'); R.L('key');
      R.D(3, x => {
        [[1060, 740], [1330, 780], [1600, 745], [1830, 780]].forEach(([px, py], i) => { x.save(); x.translate(px, py); x.rotate(i * .12 * u); x.translate(-px, -py); nobori(x, px, py, 190, PAL.prus, sway, true, true); x.restore(); });
        kago(x, 1380, 880, 130, 0);
        for (let k = 0; k < 7; k++) { const X = lerp(1100 + k * 90, 1750 + (k % 3) * 40, u), Y = 860 + (k % 3) * 26; fig(x, X, Y, 104, { ph: tq * 2 + k, dir: 1, col: PAL.prusD, col2: PAL.greyL, sword: true, hat: null }); }     // Imagawa men scatter
        for (let k = 0; k < 12; k++) { const X = lerp(260 + k * 30, 1040 + (k % 4) * 60, u), Y = lerp(560 + k * 8, 790 + (k % 3) * 40, u), s = lerp(60, 112, u); fig(x, X, Y, s, { ph: tq * 2 + k * .3, dir: 1, col: PAL.beni, col2: PAL.greyL, carry: k % 2 ? 'spear' : null, sword: k % 2 === 0, hat: null }); if (k % 5 === 0) nobori(x, X + 18, Y - 20, s * 1.9, PAL.beni, sway, true, true); }
      });
      R.D(0, x => rain(x, t, [0, 0, W, H]));
      R.D(0, x => { for (const t0 of [1.1, 3.4]) { const a = Math.max(0, 1 - Math.abs(t - t0) * 7); if (a > 0) { x.globalAlpha = a * .55; x.fillStyle = PAL.white; x.fillRect(0, 0, W, H); x.globalAlpha = 1; } } });
    },
    ev: len => [{ type: 'whoomp', t: 1.1, v: .5 }, { type: 'whoomp', t: 3.4, v: .6 }],
  };
}

// ———— 天下布武: the seal comes down on the letter, Gifu castle above ————
export const TENKA = {
  id: 'tenka', cart: [1800, 74],
  layers: {
    sky: { g: 1, grain: .08, draw(x) { bokashi(x, 0, FR.y0, W, 420, PAL.prus, .85, 0, { rough: 26, seed: 131 }); bokashi(x, 0, 300, W, 640, PAL.beniP, 0, .8, { rough: 20, seed: 132 }); ridge(x, [[900, 640], [1100, 520], [1300, 430], [1500, 430], [1700, 520], [1960, 600]], PAL.greenD, 700); } },
    land: { g: 2, grain: .05, draw(x) { rf(x, PAL.greenD, 0, 700, W, H); castle(x, 1500, 440, .34, 'fill', { roof: PAL.greyD, wall: PAL.white, stone: PAL.greyL, tiers: 3 }); x.fillStyle = PAL.paper; x.fillRect(150, 520, 920, 400); x.fillStyle = PAL.paperD; x.fillRect(150, 920, 920, 14); } },
    key: { g: 0, speck: .1, draw(x) {
      x.fillStyle = S; carve(x, wob([[900, 640], [1100, 520], [1300, 430], [1500, 430], [1700, 520], [1960, 600]], 2, 3), 2.6, { taper: [.02, .02] }); castle(x, 1500, 440, .34, 'key', { tiers: 3 });
      x.strokeStyle = S; x.lineWidth = 3.4; x.strokeRect(150, 520, 920, 400);
      for (let r = 0; r < 7; r++) { const w = 560 + hash(r + 3) * 260; carve(x, [[220, 590 + r * 46], [220 + w, 590 + r * 46 + (hash(r) - .5) * 6]], 7, { taper: [.1, .5], seed: r + 20 }); }
    } },
  },
  paint(x, t, R) {
    const len = R.len || 12, ts = len * .38, p = clamp((t - ts) / .5);
    R.L('sky'); R.L('land'); R.L('key');
    R.D(3, x => { drawSeal(x, '天下布武', 760, 700, 250, p, { seed: 41, rot: -.05 }); });
    R.D(0, x => { const a = Math.max(0, 1 - Math.abs(t - ts - .25) * 5); if (a > 0) { x.globalAlpha = a * .18; x.fillStyle = PAL.beni; x.fillRect(150, 520, 920, 400); x.globalAlpha = 1; } });
  },
  ev: len => [{ type: 'seal', t: len * .38 + .2, v: 1 }],
};

// ———— 楽市楽座: a free market below the castle ————
export const MARKET = {
  id: 'market', cart: [120, 74],
  layers: {
    sky: { g: 1, grain: .08, draw(x) { bokashi(x, 0, FR.y0, W, 400, PAL.sky, .95, 0, { rough: 26, seed: 141 }); ridge(x, [[-20, 520], [400, 470], [900, 500], [1500, 460], [1960, 500]], PAL.skyL, 640); } },
    land: { g: 2, grain: .05, draw(x) {
      rf(x, PAL.plaster, 0, 520, W, 880); rf(x, PAL.ochreL, 0, 880, W, H);
      for (let k = 0; k < 6; k++) { const X = 40 + k * 320; rf(x, PAL.white, X, 460, X + 280, 760); x.fillStyle = PAL.greyD; x.beginPath(); poly(x, [[X - 20, 470], [X + 30, 400], [X + 250, 400], [X + 300, 470]]); x.fill(); }
      for (let k = 0; k < 4; k++) { const X = 160 + k * 440; x.fillStyle = PAL.woodD; x.fillRect(X, 640, 10, 240); x.fillRect(X + 260, 640, 10, 240); for (let q = 0; q < 6; q++) { x.fillStyle = q % 2 ? PAL.prus : PAL.white; x.fillRect(X + q * 44, 640, 44, 90); } x.fillStyle = PAL.wood; x.fillRect(X + 10, 820, 250, 20); }
    } },
    key: { g: 0, speck: .1, draw(x) { x.fillStyle = S; carve(x, [[0, 520], [W, 520]], 2, { taper: [0, 0], seed: 3 }); carve(x, [[0, 880], [W, 880]], 2.4, { taper: [0, 0], seed: 4 });
      for (let k = 0; k < 6; k++) { const X = 40 + k * 320; carve(x, [[X - 20, 470], [X + 30, 400], [X + 250, 400], [X + 300, 470]], 2.2, { taper: [.05, .05], seed: k }); carve(x, [[X, 470], [X, 760]], 1.8, { taper: [0, .1], seed: k + 9 }); carve(x, [[X + 280, 470], [X + 280, 760]], 1.8, { taper: [0, .1], seed: k + 19 }); }
      for (let k = 0; k < 4; k++) { const X = 160 + k * 440; x.fillRect(X, 640, 4, 240); x.fillRect(X + 266, 640, 4, 240); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(X, 640, 270, 90); } } },
  },
  paint(x, t, R) {
    const tq = q8(t);
    R.L('sky'); R.L('land'); R.L('key');
    R.D(3, x => { for (let k = 0; k < 4; k++) { const X = 160 + k * 440; fig(x, X + 135, 835, 104, { still: true, dir: k % 2 ? -1 : 1, col: [PAL.prusL, PAL.green, PAL.beni, PAL.ochre][k], hat: 'kasa', arm: k % 2 ? 'up' : null }); x.fillStyle = [PAL.beni, PAL.ochre, PAL.green, PAL.prusL][k]; for (let q = 0; q < 5; q++) x.fillRect(X + 30 + q * 46, 802, 30, 20); }
      for (let k = 0; k < 18; k++) { const dir = k % 2 ? 1 : -1, X = ((k * 173 + t * 70 * dir) % 2200 + 2200) % 2200 - 150, Y = 930 + (k % 3) * 36; fig(x, X, Y, 108, { ph: tq * 1.5 + k * .4, dir, col: [PAL.greyD, PAL.ai, PAL.straw, PAL.prusD, PAL.beni][k % 5], carry: k % 5 === 0 ? 'bundle' : null, hat: k % 3 ? null : 'kasa' }); }
      for (let k = 0; k < 8; k++) { const u = (t * .6 + k * .13) % 1, X = 300 + k * 200 + Math.sin(k) * 40; x.fillStyle = PAL.ochre; x.globalAlpha = Math.sin(u * Math.PI); x.beginPath(); x.ellipse(X, 600 - u * 120, 10, 10, 0, 0, TAU); x.fill(); x.globalAlpha = 1; } });
  },
};

// ———— 鉄甲船: big black ships against swarms of small boats ————
function bigShip(x, px, py, s, tq, fire) {
  x.save(); x.translate(px, py); x.scale(s, s); x.lineJoin = 'round';
  x.fillStyle = S; x.beginPath(); poly(x, [[-330, -10], [330, -10], [290, 60], [-290, 60]]); x.fill(); x.fillRect(-330, -56, 600, 46); x.beginPath(); poly(x, [[330, -10], [440, -60], [300, 20]]); x.fill();
  x.fillStyle = PAL.greyD; for (let k = 0; k < 9; k++) x.fillRect(-300 + k * 64, -40, 36, 22);
  x.strokeStyle = S; x.lineWidth = 6; for (const mx of [-200, 0, 180]) { x.beginPath(); x.moveTo(mx, -56); x.lineTo(mx, -320); x.stroke(); x.fillStyle = PAL.paper; x.fillRect(mx - 60, -300, 120, 120); x.lineWidth = 3; x.strokeRect(mx - 60, -300, 120, 120); x.lineWidth = 6; }
  if (fire > 0) { x.fillStyle = PAL.ochreL; x.beginPath(); poly(x, [[-330, -30], [-380 - 60 * fire, -52], [-360 - 30 * fire, -30], [-380 - 60 * fire, -8]]); x.fill(); }
  x.restore();
}
const SHIPS = [[1000, 700], [1330, 700], [1660, 700], [1180, 830], [1510, 830], [850, 830]];
export const IRON = {
  id: 'iron', cart: [120, 74],
  layers: {
    sky: { g: 1, grain: .1, draw(x) { rf(x, PAL.greyL, 0, 0, W, 520); bokashi(x, 0, FR.y0, W, 460, PAL.sumi, .75, 0, { rough: 28, seed: 151 }); const g = x.createLinearGradient(0, 520, 0, H); g.addColorStop(0, PAL.prusL); g.addColorStop(1, PAL.prusD); x.fillStyle = g; x.fillRect(0, 520, W, H - 520); } },
    key: { g: 0, speck: .08, draw(x) { x.fillStyle = S; carve(x, [[0, 520], [W, 520]], 1.6, { taper: [.1, .1], seed: 2 }); } },
  },
  paint(x, t, R) {
    const tq = q8(t), t12 = q12(t), len = R.len || 14, adv = ss(seg(t, 0, len * .8));
    R.L('sky'); R.D(1, x => ripples(x, tq, 540, 1040, PAL.skyL, 22, .55, 26)); R.L('key');
    R.D(3, x => {
      // Mori small boats (red flags), coming from the left and being broken up
      for (let k = 0; k < 22; k++) { const X0 = 100 + (k % 11) * 120, Y = 600 + Math.floor(k / 11) * 70 + (k % 3) * 22, X = X0 + adv * 120, sunk = ss(seg(t, 4 + k * .2, 6 + k * .2)); if (sunk > .98) continue;
        x.save(); x.translate(X, Y + Math.sin(tq * 2 + k) * 3 + sunk * 40); x.globalAlpha = 1 - sunk; x.fillStyle = PAL.woodD; x.beginPath(); poly(x, [[-50, 0], [50, 0], [66, -14], [-66, -14]]); x.fill(); x.strokeStyle = S; x.lineWidth = 2; x.stroke(); x.fillStyle = PAL.beni; x.fillRect(-4, -70, 32, 22); x.fillRect(-6, -70, 3, 70); x.restore(); }
      const SH = SHIPS;
      SH.forEach(([sx, sy], i) => { const ft = ((t - 2 - i * .6) % 3.4 + 3.4) % 3.4; bigShip(x, sx, sy + Math.sin(tq * 1.2 + i) * 4, .43, tq, t > 2 + i * .6 && ft < .16 ? 1 - ft / .16 : 0); });
    });
    R.D(2, x => { SHIPS.forEach(([sx, sy], i) => { const ft = ((t - 2 - i * .6) % 3.4 + 3.4) % 3.4; if (t > 2 + i * .6 && ft < 2.2) puff(x, sx - 190, sy - 20, ft / 2.2, PAL.greyL, .8); }); });
  },
};
IRON.ev = len => { const e = []; for (let i = 0; i < 6; i++) for (let t = 2 + i * .6; t < len - .5; t += 3.4) e.push({ type: 'whoomp', t, v: .5 }); return e; };

// ———— 安土城: a castle built to be seen ————
export const AZUCHI = {
  id: 'azuchi', cart: [1800, 74],
  layers: {
    sky: { g: 1, grain: .08, draw(x) { bokashi(x, 0, FR.y0, W, 430, PAL.sky, .95, 0, { rough: 26, seed: 161 }); ridge(x, [[-20, 600], [300, 560], [700, 590], [1100, 550], [1500, 590], [1960, 560]], PAL.skyL, 700); const g = x.createLinearGradient(0, 760, 0, H); g.addColorStop(0, PAL.skyL); g.addColorStop(1, PAL.ai); x.fillStyle = g; x.fillRect(0, 760, W, H - 760); } },
    sun: { g: 3, draw(x) { bokashi(x, 0, 280, W, 700, PAL.ochreL, 0, .65, { rough: 18, seed: 162 }); x.fillStyle = PAL.beni; x.beginPath(); x.arc(380, 270, 52, 0, TAU); x.fill(); } },
    land: { g: 2, grain: .05, draw(x) { ridge(x, [[520, 800], [700, 640], [960, 600], [1220, 640], [1400, 800]], PAL.greenD, 800); castle(x, 960, 640, .85, 'fill', { roof: PAL.greyD, wall: PAL.beniL, stone: PAL.greyL, gold: PAL.ochre, tiers: 5 }); } },
    key: { g: 0, speck: .1, draw(x) { x.fillStyle = S; carve(x, wob([[520, 800], [700, 640], [960, 600], [1220, 640], [1400, 800]], 2, 3), 2.6, { taper: [.02, .02] }); castle(x, 960, 640, .85, 'key', { tiers: 5 }); carve(x, [[0, 760], [W, 760]], 1.8, { taper: [0, 0], seed: 5 }); } },
  },
  paint(x, t, R) {
    const tq = q8(t);
    R.L('sky'); R.L('sun'); R.D(1, x => ripples(x, tq, 780, 1040, PAL.prusL, 14, .7, 20)); R.L('land'); R.L('key');
    R.D(3, x => { [[300, 930, 1], [1560, 960, -1], [1250, 900, 1]].forEach(([bx, by, d], k) => { const X = bx + Math.sin(tq * .6 + k) * 10; x.save(); x.translate(X, by + Math.sin(tq * 2 + k) * 2); x.fillStyle = PAL.woodL; x.beginPath(); poly(x, [[-90, 0], [90, 0], [116, -16], [-116, -16]]); x.fill(); x.strokeStyle = S; x.lineWidth = 2.4; x.stroke(); x.restore(); fig(x, X + 60 * d, by - 15, 92, { ph: tq * .45, col: PAL.prusL, carry: 'pole', hat: 'kasa', dir: -d }); }); });
    R.D(0, x => { for (let i = 0; i < 5; i++) goose(x, lerp(1700, 700, seg(t, 1, R.len || 14)) + Math.abs(i - 2) * 34, 200 + Math.abs(i - 2) * 16, 1.2, Math.sin(tq * 9 + i) > 0 ? 1 : -.4); });
  },
};

// ———— 長篠城を囲む武田軍 ————
export const SIEGE = {
  id: 'siege', cart: [1800, 74],
  layers: {
    sky: { g: 1, grain: .08, draw(x) { bokashi(x, 0, FR.y0, W, 420, PAL.sky, .95, 0, { rough: 26, seed: 171 }); ridge(x, (() => { const p = []; for (let X = -20; X <= W + 20; X += 20) p.push([X, 500 - vnoise(X * .003 + 4) * 130 - Math.abs(Math.sin(X * .007)) * 20]); return p; })(), PAL.prusL, 560); } },
    land: { g: 2, grain: .05, draw(x) {
      rf(x, PAL.green, 0, 560, W, H); const g = x.createLinearGradient(0, 560, 0, H); g.addColorStop(0, PAL.greenL); g.addColorStop(1, PAL.green); x.fillStyle = g; x.fillRect(0, 560, W, H - 560);
      x.strokeStyle = PAL.prusL; x.lineWidth = 56; x.lineCap = 'round'; x.beginPath(); x.moveTo(-40, 700); x.quadraticCurveTo(700, 640, 960, 740); x.quadraticCurveTo(1300, 860, 1960, 720); x.stroke(); x.strokeStyle = PAL.skyL; x.lineWidth = 30; x.stroke();
      fillPath(x, [[780, 700], [860, 600], [1060, 600], [1140, 700]], PAL.greyL, true);
      rf(x, PAL.woodD, 820, 560, 1100, 640); x.fillStyle = PAL.greyD; x.beginPath(); poly(x, [[810, 566], [850, 520], [1070, 520], [1110, 566]]); x.fill(); rf(x, PAL.white, 900, 600, 1020, 608);
    } },
    key: { g: 0, speck: .1, draw(x) { x.fillStyle = S; carve(x, [[780, 700], [860, 600], [1060, 600], [1140, 700]], 2.4, { taper: [.02, .02], seed: 4 }); x.strokeStyle = S; x.lineWidth = 2.6; x.strokeRect(820, 560, 280, 80); carve(x, [[810, 566], [850, 520], [1070, 520], [1110, 566]], 2.4, { taper: [.02, .02], seed: 5 });
      for (let k = 0; k < 8; k++) carve(x, [[820 + k * 38, 560], [820 + k * 38, 640]], 1.2, { taper: [0, 0], seed: k }); } },
  },
  paint(x, t, R) {
    const tq = q8(t), sway = Math.sin(tq * 1.8) * 5;
    R.L('sky'); R.L('land'); R.L('key');
    R.D(3, x => {
      [[200, 760], [420, 830], [1500, 770], [1720, 830], [320, 940], [1620, 940], [980, 880]].forEach(([px, py], i) => { tent(x, px, py, 220, 110, PAL.white); nobori(x, px + 70, py - 4, 190, PAL.beni, sway * (i % 2 ? -1 : 1), true, true); });
      for (let k = 0; k < 8; k++) fig(x, 700 + k * 74, 850 + (k % 2) * 28, 96, { still: true, dir: k < 4 ? 1 : -1, col: PAL.beni, col2: PAL.greyL, carry: 'spear', hat: null });
      nobori(x, 960, 560, 200, PAL.greyD, sway, true, true);
      const u = seg(t, 1, (R.len || 14) - 1), X = lerp(1900, 60, u); fig(x, X, 1000, 128, { ph: tq * 2.4, dir: -1, col: PAL.prusD, hat: null, arm: 'up' });
    });
  },
};
