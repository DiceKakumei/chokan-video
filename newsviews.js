// News-package sheets built from plain data (issue.json): no hand-drawn picture per day.
// Kinds: cover | story | number | flow | compare | digest | outro.  The lower-third strap (theme.js frame()) carries the narration, so the picture area is y 56..830.
// Items appear on the words: TL.f(sheetId, k) = the fraction of the sheet at which narration line k starts.
import { clamp, lerp, seg, ss, eio, eo, back } from '/core/lib.js';
import { diagramView } from './diagram.js';
import { P, F, FC, FM, W, H, TL, plate, ring, shake, glint, stamp, telop, eyebrow, ticker } from './package.js';

// wrap Japanese text to lines of at most n chars, breaking after 、。 or spaces when possible
export function wrap(str, n, maxLines = 99) {
  const out = []; let s = String(str || '').replace(/\s+/g, ' ').trim();
  while (s.length > n && out.length < maxLines - 1) {
    let cut = -1;
    for (let i = n; i >= Math.floor(n * .55); i--) { if ('、。，．！？ '.includes(s[i - 1])) { cut = i; break; } }
    if (cut < 0) { cut = n; while (cut > 3 && /[0-9.%,]/.test(s[cut - 1]) && /[0-9.%,]/.test(s[cut])) cut--; }   // do not split inside a number
    out.push(s.slice(0, cut).trim()); s = s.slice(cut).trim();
  }
  if (s) out.push(s);
  if (out.length > maxLines) out.length = maxLines;
  return out;
}
const SPJ = await (await fetch('sheets.json')).json();
const NL = Object.fromEntries(SPJ.sheets.map(x => [x.id, x.lines.length]));
const at = (id, k, off = 0) => Math.min(.85, Math.max(0, TL.f(id, Math.min(k, 9), off)));
const FILLS = ['a', 'ink', 'b', 'ink', 'c'];
const lineLen = sh => NL[sh.id] || (sh.lines || []).length;
const nth = (sh, i, n, off = 0) => at(sh.id, Math.floor(i * lineLen(sh) / Math.max(1, n)), off);   // item i of n lands on its share of the narration
const T = (f, x, y, str, o = {}) => ({ k: 'text', f, d: .4, x, y, str, ...o });

function story(sh) {
  const id = sh.id, pts = (sh.points || []).slice(0, 3), items = [];
  const y0 = sh.opener ? 320 : 130, n = Math.max(1, pts.length), step = (810 - y0) / n;
  pts.forEach((p, i) => {
    const L = wrap(p, 22, 3), y = y0 + i * step, f = nth(sh, i, n, -.15);
    items.push({ k: 'box', f, d: .4, anchor: 'l', x: 96, y: y + step / 2 - 10, w: 1080, h: step - 28, str: L.join('\n'), fill: i === 0 ? 'a' : 'ink', size: 42 });
  });
  if (sh.key) {
    const kl = wrap(sh.key, 6, 2), f = at(id, 0, .6);
    items.push({ k: 'fn', f, fn(x, t, p) { stamp(x, 1450, 520, kl[0], sh.keysub || '', p, { size: kl.length > 1 ? 84 : 112, rot: -6 }); } });
  }
  return diagramView(id, { items });
}

function number(sh) {
  const id = sh.id, items = [], f0 = at(id, 0, .2);
  items.push({ k: 'fn', f: f0, fn(x, t, p) { x.save(); x.globalAlpha = p; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = P.lem; x.font = FC(sh.num.length > 6 ? 170 : 250, 800); x.fillText(sh.num, 96, sh.opener ? 520 : 400); x.fillStyle = P.paper; x.font = F(64, 900); x.fillText(sh.unit || '', 100, sh.opener ? 690 : 570); x.font = F(40, 700); x.fillStyle = P.gold; x.fillText(sh.label || '', 100, sh.opener ? 770 : 660); x.restore(); } });
  const bars = (sh.bars || []).slice(0, 4), mx = Math.max(1, ...bars.map(b => b.v));
  bars.forEach((b, i) => items.push({ k: 'bar', f: nth(sh, i, Math.max(1, bars.length), .0), d: .6, x: 1130, y: 300 + i * 120, w: 480, h: 66, frac: b.v / mx, label: b.label, num: b.text || String(b.v), col: i === 0 ? 'a' : 'b', size: 36 }));
  return diagramView(id, { items });
}

function flow(sh) {
  const id = sh.id, st = (sh.steps || []).slice(0, 4), n = st.length || 1, items = [];
  const bw = n >= 4 ? 380 : 470, gap = (1728 - n * bw) / (n + 1), y = 470, h = 360, dark = { a: P.ink, b: P.ink, ink: P.paper, c: P.ink };
  st.forEach((s, i) => {
    const x = 96 + gap * (i + 1) + bw * i + bw / 2, f = nth(sh, i, n, -.15), fill = FILLS[i % FILLS.length], tc = dark[fill], L = wrap(s.s || '', n >= 4 ? 10 : 12, 4);
    items.push({ k: 'box', f, d: .45, x, y, w: bw, h, str: '', fill });
    items.push({ k: 'text', f: f + .02, d: .4, x, y: y - h / 2 + 70, str: s.t || '', size: 52, col: tc });
    L.forEach((ln, j) => items.push({ k: 'text', f: f + .04, d: .4, x, y: y - 30 + j * 50, str: ln, size: 32, weight: 700, col: tc }));
    if (i < n - 1) items.push({ k: 'arrow', f: f + .06, d: .35, from: [x + bw / 2 + 8, y], to: [x + bw / 2 + gap - 8, y], col: 'a', w: 10 });
  });
  return diagramView(id, { items });
}

function compare(sh) {
  const id = sh.id, items = [], y0 = sh.opener ? 360 : 200;
  const side = (o, x, f, fill) => {
    items.push({ k: 'box', f, d: .45, x, y: y0 + 55, w: 700, h: 110, str: o.t || '', fill, size: 56 });
    (o.pts || []).slice(0, 3).forEach((p, i) => items.push({ k: 'box', f: f + .05 + i * .04, d: .4, x, y: y0 + 200 + i * 130, w: 700, h: 112, str: wrap(p, 20, 2).join('\n'), fill: 'ink', size: 34 }));
  };
  side(sh.left || {}, 500, nth(sh, 0, 2, -.15), 'a'); side(sh.right || {}, 1330, nth(sh, 1, 2, -.15), 'b');
  items.push({ k: 'fn', f: at(id, 0, .4), fn(x, t, p) { x.save(); x.globalAlpha = p; x.fillStyle = P.paper; x.font = FC(76, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('VS', 915, y0 + 55); x.restore(); } });
  return diagramView(id, { items });
}

function digest(sh) {
  const id = sh.id, rows = (sh.rows || []).slice(0, 6), items = [];
    rows.forEach((r, i) => {
    const y = 160 + i * 110, f = nth(sh, i, rows.length, -.1);
    items.push({ k: 'box', f, d: .35, anchor: 'l', x: 96, y, w: 200, h: 84, str: r.g, fill: i % 2 ? 'b' : 'a', size: 34 });
    items.push({ k: 'box', f: f + .02, d: .35, anchor: 'l', x: 310, y, w: 1400, h: 84, str: wrap(r.t, 32, 1)[0], fill: 'ink', size: 38 });
  });
  return diagramView(id, { items });
}

// cover: sting (plate slam -> bug) + dateline block + rundown of the top stories (adapted from the template's "open" scene)
function cover(sh) {
  const tops = (sh.tops || []).slice(0, 3), ROW_T = [2.1, 2.5, 2.9], dm = /(\d{4})年(\d{1,2})月(\d{1,2})日（?(.?)/.exec(sh.date || '') || [];
  const MON = ['', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  return {
    id: sh.id,
    paint(x, lt) {
      if (lt < 1.5) {
        for (const k of [.04, .10]) { const p = seg(lt, k, k + .16), a = 1 - seg(lt, .28, .5); if (p <= 0 || a <= 0) continue; const e = lerp(-500, W + 500, eo(p)); x.save(); x.globalAlpha = a; x.fillStyle = k < .05 ? P.lem : P.gold; x.beginPath(); x.moveTo(e - 140, 0); x.lineTo(e, 0); x.lineTo(e - 240, H); x.lineTo(e - 380, H); x.closePath(); x.fill(); x.restore(); }
        const slam = seg(lt, .16, .42), u = ss(seg(lt, 1.12, 1.45));
        if (slam > 0) { const [sx, sy] = shake(lt - .42, 12, .3), s0 = lerp(3.2, 1.5, eo(slam)), s = lerp(s0, .327, u), cx = lerp(960, 1739, u) + sx * (1 - u), cy = lerp(470, 86, u) + sy * (1 - u);
          plate(x, cx, cy, s, { letters: seg(lt, .42, .82), sub: 'MORNING EDITION', subP: seg(lt, .5, .85) * (1 - u), glint: seg(lt, .85, 1.1), a: clamp(slam * 4) }); ring(x, 960, 470, 100, 700, seg(lt, .42, .9), P.lem, 8); }
      }
      const d = eo(seg(lt, 1.3, 2.1));
      if (d > 0) {
        x.save(); x.globalAlpha = d; x.translate(-(1 - d) * 60, 0); x.fillStyle = P.ink2; x.fillRect(96, 200, 380, 560); x.fillStyle = P.lem; x.fillRect(96, 200, 380, 10);
        x.fillStyle = P.paper; x.font = FC(250, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(dm[3] || '', 286, 400);
        x.fillStyle = P.lem; x.font = FC(60, 800); x.letterSpacing = '6px'; x.fillText(MON[+dm[2]] || '', 286, 540); x.letterSpacing = '0px';
        x.fillStyle = P.gold; x.font = FM(22, 500); x.letterSpacing = '4px'; x.fillText((dm[1] || '') + ' · ' + (sh.no ? 'NO.' + sh.no : ''), 286, 600); x.letterSpacing = '0px';
        x.fillStyle = P.paper; x.font = F(44, 900); x.fillText((dm[4] || '') + '曜日', 286, 680); x.restore();
      }
      tops.forEach((t, k) => {
        const t0 = ROW_T[k], p = back(seg(lt, t0, t0 + .42), 1.6); if (p <= 0) return;
        const y = 210 + k * 190, h = 160, hh = Math.max(.02, p), L = wrap(t, 24, 2);
        x.save(); x.translate(0, y + h / 2); x.scale(1, hh); x.translate(0, -(y + h / 2)); x.globalAlpha = clamp(p * 2);
        x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(522, y + 8, 1260, h); x.fillStyle = P.ink2; x.fillRect(516, y, 1260, h); x.fillStyle = P.lem; x.fillRect(516, y, 130, h);
        x.fillStyle = P.ink; x.font = FC(96, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('0' + (k + 1), 581, y + h / 2 + 4);
        x.fillStyle = P.paper; x.font = F(44, 900); x.textAlign = 'left'; L.forEach((ln, j) => x.fillText(ln, 690, y + h / 2 + (j - (L.length - 1) / 2) * 54));
        glint(x, 516, y, 1260, h, seg(lt, t0 + .35, t0 + .9)); x.restore();
      });
    },
    ev: len => [{ t: .16, type: 'hit' }, { t: 1.12, type: 'glock', n: 6 }, ...ROW_T.map((t, k) => ({ t, type: 'glock', n: k }))],
  };
}

function outro(sh) {
  const items = [T(0.05, 960, 330, sh.title || '以上、今朝の朝刊', { size: 100, col: 'paper' }), { k: 'pen', f: 0.15, d: .6, x0: 560, x1: 1360, y: 420, col: 'a', w: 12 }];
  wrap(sh.note || '', 24, 3).forEach((ln, i) => items.push(T(.3 + i * .1, 960, 540 + i * 70, ln, { size: 48, weight: 700, col: 'lem' })));
  return diagramView(sh.id, { items });
}

const KIND = { cover, story, number, flow, compare, digest, outro };
export function buildView(sh) { return (KIND[sh.kind] || story)(sh); }
