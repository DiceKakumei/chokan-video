// Seven prints: Okehazama · Nagashino · Honnoji · Hideyoshi · Sekigahara · Osaka · Edo peace. Layer group g: 0 key line · 1 blue · 2 secondary · 3 red/figures
import { clamp, lerp, seg, ss, eio, mulberry, hash, vnoise, TAU } from '/core/lib.js';
import { W, H, FR, PAL, poly, carve, wob, line, fillPath, bokashi, kasumi, rgba, mix } from './print.js';
import { pine, goose, mountain, rain } from './nature.js';
import { T, q8, q12 } from './story.js';
import { fig, kago, chest, ripples, flame, S } from './figs.js';
import { rf, ridge, nobori, maku, tent, palisade, horse, gunner, puff, castle, smoke } from './figs2.js';

// ———————————— 一 · 永禄三年 桶狭間: rain, a small column comes down on a big camp ————————————
const HILL1 = [[-20, 620], [180, 520], [430, 440], [700, 400], [980, 470], [1230, 570], [1500, 640], [1960, 660]];
const CAMP = [[1000, 760, 150], [1260, 790, 170], [1520, 760, 150], [1760, 800, 170]];
export const V1 = {
  id: 'v1',
  layers: {
    sky: { g: 1, grain: .1, draw(x) {
      rf(x, PAL.greyL, 0, 0, W, 560); bokashi(x, 0, FR.y0, W, 480, PAL.sumi, .95, 0, { rough: 30, seed: 2 }); bokashi(x, 0, 330, W, 600, PAL.prusD, 0, .55, { rough: 20, seed: 3 });
      ridge(x, [[-20, 520], [260, 470], [620, 500], [1000, 450], [1400, 500], [1960, 470]], PAL.prusL);
    } },
    land: { g: 2, grain: .05, draw(x) {
      ridge(x, HILL1, PAL.greenD);
      x.fillStyle = PAL.ochreL; x.beginPath(); poly(x, [[900, 600], [1960, 700], [1960, 1000], [700, 1000], [600, 760]]); x.fill();
      x.strokeStyle = PAL.straw; x.lineWidth = 34; x.lineCap = 'round'; x.beginPath(); x.moveTo(320, 500); x.quadraticCurveTo(560, 700, 940, 800); x.stroke();
      for (const [cx, by, w] of CAMP) tent(x, cx, by, w, 110, PAL.white);
      maku(x, 930, 1860, 830, 80, PAL.white, PAL.prusD);
    } },
    key: { g: 0, speck: .12, draw(x) {
      x.fillStyle = S;
      carve(x, wob(HILL1, 2, 3), 2.6, { taper: [.02, .1] });
      for (const [cx, by, w] of CAMP) tent(x, cx, by, w, 110, PAL.white, true);
      maku(x, 930, 1860, 830, 80, PAL.white, PAL.prusD, true);
      pine(x, 240, 640, 1.1, { seed: 3, lean: .3, fills: false, lw: 2.4, minI: 4 }); pine(x, 1720, 700, 1.0, { seed: 5, lean: -.3, fills: false, lw: 2.4, minI: 4 });
    } },
    pines: { g: 2, grain: .04, draw(x) { pine(x, 240, 640, 1.1, { seed: 3, lean: .3, lines: false, minI: 4 }); pine(x, 1720, 700, 1.0, { seed: 5, lean: -.3, lines: false, minI: 4 }); } },
  },
  paint(x, t, R) {
    const tq = q8(t), sway = Math.sin(tq * 1.7) * 5;
    R.L('sky'); R.L('land'); R.L('pines'); R.L('key');
    R.D(3, x => {                 // Imagawa banners (blue) around the camp, Oda column (red) coming down the road
      [[1060, 740], [1330, 780], [1600, 745], [1830, 780]].forEach(([px, py], i) => nobori(x, px, py, 190, PAL.prus, sway * (i % 2 ? -1 : 1), true, true));
      [[1090, 850, 0], [1220, 880, 1], [1400, 860, 0], [1540, 885, 1], [1700, 860, 0]].forEach(([px, py, k], i) => fig(x, px, py, 108, { still: true, dir: k ? 1 : -1, col: PAL.prusD, col2: PAL.greyL, sword: true }));
      const u = seg(t, .4, (R.len || 12) - 1.2);
      for (let k = 0; k < 14; k++) {
        const p = clamp(u * 1.2 - k * .035, 0, 1); if (p <= 0) continue;
        const X = lerp(330, 960, p), Y = lerp(520, 800, Math.pow(p, 1.1)), s = lerp(54, 96, p);
        fig(x, X + (k % 3) * 8, Y + (k % 2) * 9, s, { ph: tq * 2 + k * .3, dir: 1, col: PAL.beni, col2: PAL.greyL, carry: k % 3 ? 'spear' : null, sword: !(k % 3), hat: null });
        if (k % 5 === 0) nobori(x, X + 18, Y - 20, s * 1.9, PAL.beni, sway, true, true);
      }
    });
    R.D(0, x => rain(x, t, [0, 0, W, H]));
  },
};

// ———————————— 二 · 天正三年 長篠: a palisade, volleys, cavalry that does not get through ————————————
const HZ2 = 470;
const FENCE = { x0: 60, x1: 1860, y: 735, h: 92 };
export const V2 = {
  id: 'v2',
  layers: {
    sky: { g: 1, grain: .08, draw(x) {
      bokashi(x, 0, FR.y0, W, 380, PAL.sky, .9, 0, { rough: 26, seed: 21 });
      ridge(x, (() => { const p = []; for (let X = -20; X <= W + 20; X += 20) p.push([X, HZ2 - 20 - vnoise(X * .003 + 6) * 150 - Math.abs(Math.sin(X * .008)) * 20]); return p; })(), PAL.prusL, HZ2 + 30);
      ridge(x, (() => { const p = []; for (let X = -20; X <= W + 20; X += 20) p.push([X, HZ2 + 4 - vnoise(X * .005 + 1) * 60]); return p; })(), PAL.skyL, HZ2 + 30);
      kasumi(x, 800, 420, 700, 22, PAL.white, .85); kasumi(x, 1600, 400, 520, 18, PAL.white, .8);
    } },
    field: { g: 2, grain: .05, draw(x) {
      const g = x.createLinearGradient(0, HZ2, 0, H); g.addColorStop(0, PAL.greenL); g.addColorStop(1, PAL.green); x.fillStyle = g; x.fillRect(0, HZ2 + 20, W, H - HZ2);
      x.fillStyle = PAL.ochreL; x.beginPath(); poly(x, [[0, 560], [W, 540], [W, 600], [0, 620]]); x.fill();
    } },
    fence: { g: 2, grain: .05, draw(x) { palisade(x, FENCE.x0, FENCE.x1, FENCE.y, FENCE.h); } },
    key: { g: 0, speck: .12, draw(x) {
      x.fillStyle = S;
      { const p = []; for (let X = -20; X <= W + 20; X += 20) p.push([X, HZ2 - 20 - vnoise(X * .003 + 6) * 150 - Math.abs(Math.sin(X * .008)) * 20]); carve(x, p, 2.6, { taper: [.02, .02], seed: 7 }); }
      carve(x, [[0, HZ2 + 22], [W, HZ2 + 22]], 1.6, { taper: [.1, .1], seed: 2 });
      palisade(x, FENCE.x0, FENCE.x1, FENCE.y, FENCE.h, true);
      for (let r = 0; r < 14; r++) for (let q = 0; q < 6; q++) { const X = 80 + r * 135 + (q % 2) * 40, Y = 780 + q * 46; carve(x, [[X, Y], [X + 6, Y - 14]], 1, { taper: [.1, .1], seed: r * 7 + q }); }
    } },
  },
  paint(x, t, R) {
    const tq = q8(t), t0 = .5;
    R.L('sky'); R.L('field');
    R.D(3, x => {                 // Takeda cavalry: charge, then go down one by one at the fence
      for (let i = 0; i < 9; i++) {
        const xs = 1950 + i * 150, xstop = 360 + ((i * 173) % 900), v = 135, X0 = xs - v * Math.max(0, t - t0), tf = t0 + (xs - xstop) / v;
        const run = X0 > xstop, X = run ? X0 : xstop, fall = run ? 0 : ss(seg(t, tf, tf + .55)), Y = [596, 626, 656][i % 3];
        if (X > W + 220) continue;
        horse(x, X, Y, 74 + (i % 3) * 5, tq * 3.2 + i * .4, { dir: -1, col: i % 2 ? PAL.woodD : PAL.greyD, armor: i % 2 ? PAL.beni : PAL.prusD, flag: PAL.beni, lance: Math.sin(tq * 3 + i) * 3, fall });
      }
    });
    R.L('fence'); R.L('key');
    R.D(3, x => {                 // Oda gunners: three ranks, each rank fires on its own beat
      const rows = [[802, 98, 0], [858, 106, .9], [914, 114, 1.8]];
      rows.forEach(([Y, s, ph], r) => {
        for (let k = 0; k < 11; k++) {
          const X = 150 + k * 160 + r * 52, jit = hash(k * 3 + r) * .12, ft = ((t - 1.6 - ph - jit) % 2.7 + 2.7) % 2.7, on = t > 1.6 + ph;
          gunner(x, X, Y, s, { dir: -1, col: r % 2 ? PAL.prusD : PAL.ai, fire: on && ft < .16 ? 1 - ft / .16 : 0 });
        }
      });
    });
    R.D(2, x => {                 // powder smoke
      const rows = [[802, 0], [858, .9], [914, 1.8]];
      rows.forEach(([Y, ph], r) => {
        for (let k = 0; k < 11; k++) {
          const X = 150 + k * 160 + r * 52, jit = hash(k * 3 + r) * .12, ft = ((t - 1.6 - ph - jit) % 2.7 + 2.7) % 2.7;
          if (t > 1.6 + ph && ft < 1.9) puff(x, X + 112, Y - 74, ft / 1.9, PAL.white, .6);
        }
      });
      const a = .55 * ss(seg(t, 2.6, 7.6)); if (a > 0) { kasumi(x, 700 + Math.sin(tq * .3) * 60, 700, 1500, 90, PAL.white, a); kasumi(x, 1500 - tq % 4 * 14, 600, 1100, 70, PAL.white, a * .8); }
    });
  },
};

// ———————————— 三 · 天正十年 本能寺: night, a temple in flames ————————————
export const TEMPLE = x => {
  x.fillStyle = S;
  x.beginPath(); poly(x, [[470, 666], [570, 642], [700, 520], [1360, 520], [1490, 642], [1590, 666], [1500, 682], [560, 682]]); x.fill();
  x.beginPath(); poly(x, [[700, 520], [770, 420], [1290, 420], [1360, 520]]); x.fill();
  x.fillRect(560, 682, 940, 130);
  x.beginPath(); poly(x, [[900, 420], [960, 350], [1160, 350], [1190, 420]]); x.fill();
  x.fillRect(1650, 560, 70, 250); x.beginPath(); poly(x, [[1620, 570], [1685, 500], [1750, 570]]); x.fill();     // bell tower
  x.fillRect(420, 770, 140, 40);
  x.fillRect(430, 810, 1300, 40);                                                                                        // stone platform
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 7; i++) x.fillRect(600 + i * 130, 712, 84, 82);
  x.globalCompositeOperation = 'source-over';
};
export const V3 = {
  id: 'v3',
  layers: {
    sky: { g: 1, grain: .1, draw(x) {
      rf(x, PAL.prusD, FR.x0, FR.y0, FR.x1, 800); bokashi(x, 0, FR.y0, W, 560, PAL.sumi, 1, 0, { rough: 30, seed: 31 });
      const g = x.createLinearGradient(0, 800, 0, H); g.addColorStop(0, '#2a1d2a'); g.addColorStop(1, PAL.sumi); x.fillStyle = g; x.fillRect(0, 800, W, H - 800);
    } },
    glow: { g: 3, draw(x) {
      bokashi(x, 0, 150, W, 700, PAL.beni, 0, 1, { rough: 22, seed: 33 }); bokashi(x, 0, 520, W, 820, PAL.ochre, 0, .7, { rough: 16, seed: 34 });
      x.fillStyle = PAL.beniP; x.beginPath(); x.arc(300, 220, 46, 0, TAU); x.fill();
    } },
    key: { g: 0, speck: .1, draw(x) {
      TEMPLE(x);
      x.fillStyle = S; ridge(x, [[-20, 862], [400, 850], [900, 858], [1500, 850], [1960, 862]], S);
    } },
  },
  paint(x, t, R) {
    const t12 = q12(t), tq = q8(t), f = ss(seg(t, T.fireStart, 31.5)), brk = ss(seg(t, 33.0, 35.6));
    R.L('sky'); R.L('glow');
    R.D(3, x => {                 // light of the fire grows on the whole sky
      const g = x.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, rgba(PAL.beni, 0)); g.addColorStop(1, rgba(PAL.beni, .55 * f)); x.fillStyle = g; x.fillRect(0, 0, W, 900);
    });
    R.D(3, x => {                 // flames behind the open walls
      for (let i = 0; i < 7; i++) { const p = ss(seg(t, T.fireStart + .3 * i, T.fireStart + 3 + .3 * i)); if (p > .02) flame(x, 642 + i * 130, 800, 90, 110 * p + 40 * p * hash(i), t12, i * 2.3, [PAL.beni, PAL.ochreL]); }
    });
    R.L('key');
    R.D(3, x => {                 // flames on the roofs
      const Rn = mulberry(5);
      for (let k = 0; k < 16; k++) {
        const bx = 500 + k * 70 + Rn() * 24, by = k % 3 ? 650 : 520, p = ss(seg(t, T.fireStart + 1 + (k * 13 % 7) * .45, T.fireStart + 5 + (k * 13 % 7) * .45));
        if (p > .02) flame(x, bx, by, 80 + Rn() * 50, (140 + Rn() * 220) * p, t12, k * 3.1, [PAL.beni, PAL.ochre]);
      }
      smoke(x, t, 900, 420, f * .8, { a: .45, seed: 5, speed: .05, rise: 380, drift: 300, r: 46, grow: 120, n: 28 });
    });
    R.D(3, x => { const Rn = mulberry(12); for (let k = 0; k < 90; k++) { const u = (t12 * .55 + Rn() * 6) % 6 / 6, px = 520 + Rn() * 1000 + Math.sin(u * 7 + k) * 40, py = 700 - u * 640 * (.5 + Rn()); x.fillStyle = k % 3 ? PAL.ochreL : PAL.beniL; x.globalAlpha = f * (1 - u); x.fillRect(px, py, 3 + Rn() * 3, 3 + Rn() * 3); } x.globalAlpha = 1; });
    R.D(0, x => {                 // besiegers, black against the fire
      [[170, 960], [300, 990], [1500, 975], [1670, 1000], [1810, 965], [90, 1010]].forEach(([px, py], i) => {
        fig(x, px, py, 118, { sil: true, ph: 0, still: true, dir: px < 900 ? 1 : -1, carry: i % 2 ? 'spear' : 'banner', hat: i % 3 ? null : 'kasa' });
      });
    });
    if (brk > 0) R.free(x => {    // the flames break the border and climb into the mounting paper
      const Rn = mulberry(61);
      for (let k = 0; k < 11; k++) { const bx = 560 + k * 80 + Rn() * 30, h = (700 + Rn() * 900) * brk * (1 - Math.abs(k - 5) / 12); flame(x, bx, 860, 130 + Rn() * 70, h, t12, k * 2.3, [PAL.beni, PAL.ochre]); }
    });
  },
};

// ———————————— 四 · 天正十八年 秀吉: a golden castle, swords collected from the fields ————————————
const FIELD0 = 800;
export const V4 = {
  id: 'v4',
  layers: {
    sky: { g: 1, grain: .08, draw(x) {
      bokashi(x, 0, FR.y0, W, 400, PAL.sky, .95, 0, { rough: 26, seed: 41 });
      ridge(x, [[-20, 620], [300, 560], [700, 600], [1100, 540], [1500, 590], [1960, 550]], PAL.skyL);
      ridge(x, [[-20, 660], [400, 620], [900, 650], [1400, 610], [1960, 640]], PAL.greenL);
    } },
    sun: { g: 3, draw(x) { bokashi(x, 0, 300, W, 620, PAL.ochreL, 0, .7, { rough: 20, seed: 42 }); x.fillStyle = PAL.beni; x.beginPath(); x.arc(1560, 250, 58, 0, TAU); x.fill(); } },
    land: { g: 2, grain: .05, draw(x) {
      rf(x, PAL.green, 0, 660, W, H); rf(x, PAL.greenL, 0, FIELD0, W, H);
      x.fillStyle = PAL.greyL; x.beginPath(); poly(x, [[300, 700], [1100, 700], [1200, 760], [200, 760]]); x.fill();
      castle(x, 700, 740, .92, 'fill', { roof: PAL.ochre, wall: PAL.white, stone: PAL.greyL, gold: PAL.ochreL });
      rf(x, PAL.ochreL, 0, 925, W, 990);
    } },
    key: { g: 0, speck: .1, draw(x) {
      x.fillStyle = S; castle(x, 700, 740, .92, 'key', { });
      carve(x, [[0, 660], [W, 660]], 1.2, { taper: [.1, .1], seed: 4 }); carve(x, [[0, 925], [W, 925]], 2.2, { taper: [0, 0], seed: 5 }); carve(x, [[0, 990], [W, 990]], 2, { taper: [0, 0], seed: 6 });
      for (let r = 0; r < 5; r++) for (let X = 20; X < W; X += 54) { x.fillRect(X + (r % 2) * 26, FIELD0 + 18 + r * 24, 1.6, 12); }
      pine(x, 1780, 800, 1.15, { seed: 4, lean: -.35, fills: false, lw: 2.4, minI: 4 });
      carve(x, [[200, 760], [1200, 760]], 1.8, { taper: [.05, .05], seed: 8 });
    } },
    pine: { g: 2, grain: .04, draw(x) { pine(x, 1780, 800, 1.15, { seed: 4, lean: -.35, lines: false, minI: 4 }); } },
  },
  paint(x, t, R) {
    const tq = q8(t), sway = Math.sin(tq * 1.5) * 6;
    R.L('sky'); R.L('sun'); R.L('land'); R.L('pine'); R.L('key');
    const swordsAt = (x, px, py, n, a0 = -.9) => { for (let i = 0; i < n; i++) { const a = a0 + i * .13 + hash(i) * .05; x.strokeStyle = S; x.lineWidth = 3.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 92, py + Math.sin(a) * 92); x.stroke(); x.strokeStyle = PAL.ochreL; x.lineWidth = 1.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 92, py + Math.sin(a) * 92); x.stroke(); x.fillStyle = PAL.ochre; x.fillRect(px - 5, py - 3, 12, 6); } };
    R.D(3, x => {
      nobori(x, 1180, 770, 230, PAL.ochre, sway, true, true); nobori(x, 1230, 770, 230, PAL.beni, -sway, true, true);
      // cart piling up with swords
      const cx = 1330, cy = 910, n = Math.floor(2 + 14 * ss(seg(t, 41, 49)));
      x.fillStyle = PAL.woodD; x.fillRect(cx - 90, cy - 70, 180, 40); x.strokeStyle = S; x.lineWidth = 2.4; x.strokeRect(cx - 90, cy - 70, 180, 40);
      x.fillStyle = PAL.woodL; x.beginPath(); x.arc(cx - 56, cy - 24, 28, 0, TAU); x.fill(); x.stroke(); x.beginPath(); x.arc(cx + 56, cy - 24, 28, 0, TAU); x.fill(); x.stroke();
      for (let i = 0; i < n; i++) { const a = -2.6 + (i % 7) * .06 + Math.floor(i / 7) * .09 + hash(i + 1) * .05; x.strokeStyle = S; x.lineWidth = 3.6; x.beginPath(); x.moveTo(cx - 70 + (i * 11) % 120, cy - 70); x.lineTo(cx - 70 + (i * 11) % 120 + Math.cos(a) * -86, cy - 70 + Math.sin(a) * 86); x.stroke(); }
      // farmers on their knees hand swords over; soldiers carry them to the cart
      [[1560, 925], [1690, 930], [1820, 925]].forEach(([px, py], i) => { fig(x, px, py, 100, { still: true, dir: 1, col: [PAL.straw, PAL.greyD, PAL.prusL][i], obi: PAL.woodD, hat: 'kasa', arm: 'point' }); swordsAt(x, px + 38, py - 98, 1, -1.2); });
      for (let k = 0; k < 4; k++) {
        const p = ((t - 41) * .045 + k * .26) % 1, X = lerp(1560, 1440, p) + (k % 2) * 30, Y = 900 + (k % 2) * 28;
        fig(x, X, Y, 100, { ph: tq * 1.4 + k, dir: p < .5 ? 1 : -1, col: PAL.prusD, col2: PAL.greyL, sword: true }); swordsAt(x, X + 30, Y - 80, 3, -1.1);
      }
    });
  },
};

// ———————————— 五 · 慶長五年 関ヶ原: fog, two lines of banners closing ————————————
const HZ5 = 520;
const RIDGE5 = () => { const p = []; for (let X = -20; X <= W + 20; X += 20) p.push([X, HZ5 - 40 - vnoise(X * .0025 + 2) * 200 - Math.abs(Math.sin(X * .006)) * 30]); return p; };
const RIDGE5b = () => { const p = []; for (let X = -20; X <= W + 20; X += 20) p.push([X, HZ5 + 6 - vnoise(X * .004 + 9) * 70]); return p; };
export const V5 = {
  id: 'v5',
  layers: {
    sky: { g: 1, grain: .08, draw(x) {
      bokashi(x, 0, FR.y0, W, 400, PAL.prusL, .9, 0, { rough: 26, seed: 51 });
      ridge(x, RIDGE5(), PAL.prusL, HZ5 + 30);
      ridge(x, RIDGE5b(), PAL.skyL, HZ5 + 30);
      const g = x.createLinearGradient(0, HZ5, 0, H); g.addColorStop(0, '#c8d3c8'); g.addColorStop(1, PAL.greenL); x.fillStyle = g; x.fillRect(0, HZ5 + 24, W, H - HZ5);
    } },
    land: { g: 2, grain: .05, draw(x) {
      rf(x, PAL.ochreL, 1100, 830, W, H); rf(x, PAL.ochre, 1100, 826, W, 836);
      maku(x, 1180, 1860, 830, 100, PAL.white, PAL.prusD); tent(x, 1520, 830, 300, 180, PAL.white);
    } },
    key: { g: 0, speck: .12, draw(x) {
      x.fillStyle = S; carve(x, RIDGE5(), 2.8, { taper: [.02, .02], seed: 7 });
      carve(x, [[0, HZ5 + 22], [W, HZ5 + 22]], 1.4, { taper: [.1, .1], seed: 2 });
      maku(x, 1180, 1860, 830, 100, PAL.white, PAL.prusD, true); tent(x, 1520, 830, 300, 180, PAL.white, true);
    } },
  },
  paint(x, t, R) {
    const tq = q8(t), sway = Math.sin(tq * 1.9) * 6, u = ss(seg(t, 54.2, 60.8));
    R.L('sky'); R.L('land');
    const army = (dir, front, col, bcol, seed) => {
      for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) {
        const X = front - dir * (r * 92 + (k % 3) * 22), Y = 590 + k * 15 + r * 4, s = 74 + (Y - 590) * .3;
        fig(x_, X, Y, s, { ph: tq * 1.6 + k * .3 + r, dir, col: k % 2 ? col : mix(col, PAL.greyD, .4), col2: PAL.greyL, carry: 'spear', hat: k % 3 ? null : 'kasa', still: u > .98 });
        if (k % 4 === 0 && r === 1) nobori(x_, X - dir * 10, Y - 6, s * 2.2, bcol, sway * dir, true, true);
      }
    };
    let x_ = null;
    R.D(3, x => { x_ = x; army(1, lerp(160, 860, u), PAL.prus, PAL.prus, 1); army(-1, lerp(1760, 1050, u), PAL.beni, PAL.beni, 2); });
    R.D(2, x => {
      kasumi(x, 800 + Math.sin(tq * .25) * 90, 640, 1500, 70, PAL.white, .55); kasumi(x, 1300 - Math.sin(tq * .2) * 100, 560, 1300, 50, PAL.white, .5);
      kasumi(x, 500 + Math.sin(tq * .3 + 2) * 80, 740, 1200, 60, PAL.white, .4 * (1 - ss(seg(t, 57, 62))));
    });
    R.L('key');
    R.D(3, x => {                 // Ieyasu seated at the command post, fan raised
      const cx = 1500, by = 860, s = 1.9, pulse = Math.sin(tq * 1.2);
      x.save(); x.translate(cx, by); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round';
      x.fillStyle = PAL.woodD; x.fillRect(-26, -34, 52, 34); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(-26, -34, 52, 34);
      x.fillStyle = PAL.ai; x.beginPath(); poly(x, [[-24, -34], [-14, -88], [14, -88], [24, -34]]); x.fill(); x.stroke();
      x.fillStyle = PAL.ochre; x.fillRect(-14, -58, 28, 5);
      x.fillStyle = PAL.skin; x.beginPath(); x.arc(0, -98, 10, 0, TAU); x.fill(); x.stroke();
      x.fillStyle = S; x.beginPath(); x.arc(0, -101, 11.5, Math.PI, TAU); x.fill(); x.beginPath(); poly(x, [[-9, -104], [0, -126], [9, -104]]); x.fill();
      x.strokeStyle = S; x.lineWidth = 5; x.beginPath(); x.moveTo(12, -80); x.lineTo(34, -112 + pulse * 3); x.stroke();
      x.fillStyle = PAL.white; x.beginPath(); x.ellipse(40, -126 + pulse * 3, 15, 20, .35, 0, TAU); x.fill(); x.lineWidth = 1.6; x.stroke(); x.fillStyle = PAL.beni; x.beginPath(); x.arc(40, -126 + pulse * 3, 6, 0, TAU); x.fill();
      x.restore();
      nobori(x, 1260, 870, 330, PAL.white, sway, true, true); nobori(x, 1740, 870, 330, PAL.white, -sway, true, true);
    });
  },
};

// ———————————— 六 · 慶長二十年 大坂: dusk, the castle burns ————————————
const CB = { cx: 960, by: 790, s: 1.0 };
const tierTop = k => CB.by - 130 * CB.s - (k + 1) * 66 * CB.s - k * 22 * CB.s;
export const V6 = {
  id: 'v6',
  layers: {
    sky: { g: 1, grain: .1, draw(x) {
      rf(x, PAL.prusD, FR.x0, FR.y0, FR.x1, 800); bokashi(x, 0, FR.y0, W, 560, PAL.sumi, 1, 0, { rough: 30, seed: 61 });
      const g = x.createLinearGradient(0, 790, 0, H); g.addColorStop(0, '#3a2a3a'); g.addColorStop(1, PAL.prusD); x.fillStyle = g; x.fillRect(0, 790, W, H - 790);
      bokashi(x, 0, 380, W, 820, PAL.beni, 0, .85, { rough: 20, seed: 62 });
    } },
    land: { g: 2, grain: .04, draw(x) {
      castle(x, CB.cx, CB.by, CB.s, 'fill', { roof: PAL.sumiL, wall: PAL.beniP, stone: PAL.greyD, gold: PAL.ochre });
      rf(x, PAL.greenD, 0, 800, 250, 1060); rf(x, PAL.greenD, 1680, 800, W, 1060);
    } },
    key: { g: 0, speck: .1, draw(x) {
      x.fillStyle = S; castle(x, CB.cx, CB.by, CB.s, 'key', {});
      carve(x, [[0, 800], [W, 800]], 2, { taper: [0, 0], seed: 3 });
    } },
  },
  paint(x, t, R) {
    const t12 = q12(t), tq = q8(t), f = ss(seg(t, 64.0, 70.0));
    R.L('sky');
    R.D(3, x => { const g = x.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, rgba(PAL.beni, 0)); g.addColorStop(1, rgba(PAL.beni, .5 * f)); x.fillStyle = g; x.fillRect(0, 0, W, 800); });
    R.D(1, x => { ripples(x, tq, 820, 1030, PAL.prusL, 14, .6, 22); ripples(x, tq, 830, 1030, PAL.beniL, 8, .55 * f, 16); });
    R.L('land'); R.L('key');
    R.D(3, x => {                 // flames climb from the lowest tier to the roof
      const Rn = mulberry(9);
      for (let k = 0; k < 5; k++) for (let j = 0; j < 3; j++) {
        const p = ss(seg(t, 64.2 + k * .9 + j * .25, 68.0 + k * .9 + j * .25)); if (p < .02) continue;
        const w = (360 * Math.pow(.8, k)) * CB.s, bx = CB.cx + (j - 1) * w * .42 + (Rn() - .5) * 20;
        flame(x, bx, tierTop(k) + 40, 46 + Rn() * 26, (50 + Rn() * 70) * p * (1 + .1 * k), t12, k * 5 + j, [PAL.beni, PAL.ochreL]);
      }
    });
    R.D(2, x => {
      smoke(x, t, 960, 330, f, { a: .55, seed: 4, speed: .05, rise: 560, drift: 380, r: 52, grow: 160, n: 40 });
      const Rn = mulberry(77); for (let k = 0; k < 70; k++) { const u = (t12 * .5 + Rn() * 6) % 6 / 6, px = 760 + Rn() * 420 + Math.sin(u * 7 + k) * 50 + u * 160, py = 560 - u * 560 * (.5 + Rn()); x.fillStyle = k % 3 ? PAL.ochreL : PAL.beniL; x.globalAlpha = f * (1 - u); x.fillRect(px, py, 3 + Rn() * 3, 3 + Rn() * 3); } x.globalAlpha = 1;
    });
    R.D(0, x => {                 // the besiegers on the bank, black
      [[330, 1010], [420, 1030], [1620, 1020], [1740, 1005], [1850, 1030], [110, 1040]].forEach(([px, py], i) => fig(x, px, py, 124, { sil: true, still: true, dir: px < 900 ? 1 : -1, carry: i % 2 ? 'spear' : 'banner', hat: i % 3 ? null : 'kasa' }));
      [[40, 5.2], [250, 3.4]].forEach(([dx, t1], i) => { const tt = t - (65 + i * 2.2); if (tt > 0 && tt < 2) puff(x, 400 + dx, 930, tt / 2, PAL.greyL, .7); });
    });
  },
};

// ———————————— 七 · 寛永十二年 江戸: calm dawn, a daimyo procession, the castle small and quiet ————————————
const HZ7 = 520;
export const V7 = {
  id: 'v7',
  layers: {
    sky: { g: 1, grain: .1, draw(x) {
      bokashi(x, 0, FR.y0, W, 330, PAL.prus, .9, 0, { rough: 26, seed: 71 });
      ridge(x, (() => { const p = []; for (let X = -20; X <= W + 20; X += 20) p.push([X, HZ7 - 30 - vnoise(X * .004 + 3) * 70 - Math.abs(Math.sin(X * .011)) * 12]); return p; })(), PAL.prusL, HZ7 + 10);
      const g = x.createLinearGradient(0, HZ7, 0, H); g.addColorStop(0, '#bcd0d6'); g.addColorStop(1, PAL.ai); x.fillStyle = g; x.fillRect(0, HZ7, W, H - HZ7);
    } },
    glow: { g: 3, draw(x) {
      bokashi(x, 0, 250, W, HZ7, PAL.beniL, 0, .85, { rough: 16, seed: 79 });
      x.fillStyle = PAL.beni; x.beginPath(); x.arc(560, 470, 44, 0, TAU); x.fill();
      kasumi(x, 700, 488, 700, 20, PAL.beniP, .9); kasumi(x, 1500, 505, 520, 15, PAL.beniP, .85);
    } },
    land: { g: 2, grain: .04, draw(x) {
      ridge(x, [[560, 870], [900, 720], [1120, 645], [1500, 600], [1960, 640]], PAL.greenD, 870);
      castle(x, 1480, 640, .5, 'fill', { roof: PAL.greyD, wall: PAL.white, stone: PAL.greyL, gold: PAL.ochre });
      rf(x, PAL.ochreL, 0, 860, W, 930); rf(x, PAL.greenD, 0, 930, W, 1060);
      pine(x, 140, 900, 1.4, { seed: 3, lean: .3, lines: false, minI: 4 });
    } },
    key: { g: 0, speck: .1, draw(x) {
      x.fillStyle = S; castle(x, 1480, 640, .5, 'key', {});
      carve(x, wob([[560, 870], [900, 720], [1120, 645], [1500, 600], [1960, 640]], 2, 4), 2.4, { taper: [.1, .1] });
      carve(x, [[0, 860], [W, 860]], 2.2, { taper: [0, 0], seed: 3 }); carve(x, [[0, 930], [W, 930]], 2, { taper: [0, 0], seed: 4 });
      pine(x, 140, 900, 1.4, { seed: 3, lean: .3, fills: false, lw: 2.6, minI: 4 });
    } },
  },
  paint(x, t, R) {
    const tq = q8(t), tt = Math.min(t, 82), ox = -(tt - 72.9) * 78;
    R.L('sky'); R.L('glow');
    R.D(1, x => ripples(x, tq, HZ7 + 30, 840, PAL.prusL, 18, .8, 26));
    R.L('land'); R.L('key');
    R.D(3, x => {                 // a daimyo procession crossing the road
      const items = [['spear', 0], ['sam', 90], ['banner', 180], ['sam', 270], ['kago', 400], ['sam', 540], ['umb', 620], ['chest', 780], ['sam', 940]];
      items.forEach(([ty, d], i) => {
        const X = 1700 + ox + d * 1.0, Y = 905, ph = tq * 1.5 + i * .37;
        if (X < -200 || X > W + 260) return;
        if (ty === 'spear') fig(x, X, Y, 104, { ph, col: PAL.greyD, carry: 'spear', hat: 'kasa' });
        else if (ty === 'sam') fig(x, X, Y, 108, { ph, col: i % 2 ? PAL.ai : PAL.prusD, col2: PAL.greyL, sword: true });
        else if (ty === 'banner') fig(x, X, Y, 104, { ph, col: PAL.greyD, carry: 'banner', hat: 'kasa' });
        else if (ty === 'kago') kago(x, X, Y, 104, ph);
        else if (ty === 'umb') fig(x, X, Y, 104, { ph, col: PAL.greyD, carry: 'umbrella', ucol: PAL.beni, hat: 'kasa' });
        else chest(x, X, Y, 98, ph);
      });
    });
    R.D(0, x => { for (let i = 0; i < 7; i++) { const off = Math.abs(i - 3), u = seg(t, 74, 89); goose(x, lerp(1700, 380, u) + off * 34 + i * 2, 190 + off * 18 + Math.sin(u * 6 + i) * 3, 1.25, Math.sin(tq * 9 + i) > 0 ? 1 : -.4); } });
  },
};
export const VIEWS = [V1, V2, V3, V4, V5, V6, V7];

V2.cart = [1800, 74]; V1.cart = [1800, 74];
V2.ev = len => { const e = []; for (const ph of [0, .9, 1.8]) for (let t = 1.6 + ph; t < len - .4; t += 2.7) e.push({ type: 'gun', t, v: 1 }); for (let t = .8; t < Math.min(len - 1, 7); t += .16) e.push({ type: 'hoof', t, v: .6 }); return e; };
