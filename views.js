// Sample views for the news package: 3 hand-drawn scenes (open = sting + rundown, share = split-flap board, line = threshold chart) and 3 diagram sheets (types, mix, goal).
// Timings come from the narration (TL.cue = when the k-th line of the sheet starts), so graphics land on the words. Everything is a pure function of the local time lt.
import { clamp, lerp, seg, ss, eio, eo, back, hash } from '/core/lib.js';
import { diagramView } from './diagram.js';
import { P, F, FC, FM, W, H, TL, plate, ring, shake, glint, stamp, telop, eyebrow, cornerTag, ticker, flapTile } from './package.js';

const tick = (x, cx, cy, s, col = P.ink, w = 8) => { x.save(); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'square'; x.beginPath(); x.moveTo(cx - s * .5, cy); x.lineTo(cx - s * .12, cy + s * .4); x.lineTo(cx + s * .55, cy - s * .42); x.stroke(); x.restore(); };

// ===== 1. open: sting (plate slam -> flies to the corner and becomes the channel bug) + rundown of three stories =====
const ROWS = [['01', 'どんな決済があるか', 'WHAT ARE THE TYPES'], ['02', 'どれだけ使われているか', 'HOW MUCH IS USED'], ['03', 'これからの目標は', 'WHERE IT IS HEADED']];
const ROW_T = [2.1, 2.5, 2.9];
function openScene(x, lt) {
  if (lt < 1.5) {                                                                           // sting 0 - 1.5 s
    for (const k of [.04, .10]) {                                                          // two lemon slashes
      const p = seg(lt, k, k + .16), a = 1 - seg(lt, .28, .5); if (p <= 0 || a <= 0) continue; const e = lerp(-500, W + 500, eo(p));
      x.save(); x.globalAlpha = a; x.fillStyle = k < .05 ? P.lem : P.gold; x.beginPath(); x.moveTo(e - 140, 0); x.lineTo(e, 0); x.lineTo(e - 240, H); x.lineTo(e - 380, H); x.closePath(); x.fill(); x.restore();
    }
    const slam = seg(lt, .16, .42), u = ss(seg(lt, 1.12, 1.45));
    if (slam > 0) {
      const [sx, sy] = shake(lt - .42, 12, .3), s0 = lerp(3.2, 1.5, eo(slam)), s = lerp(s0, .327, u), cx = lerp(960, 1739, u) + sx * (1 - u), cy = lerp(470, 86, u) + sy * (1 - u);
      plate(x, cx, cy, s, { letters: seg(lt, .42, .82), sub: 'CASHLESS SPECIAL', subP: seg(lt, .5, .85) * (1 - u), glint: seg(lt, .85, 1.1), a: clamp(slam * 4) });
      ring(x, 960, 470, 100, 700, seg(lt, .42, .9), P.lem, 8);
    }
  }
  const d = eo(seg(lt, 1.3, 2.1));                                                          // dateline block (appears under the band)
  if (d > 0) {
    x.save(); x.globalAlpha = d; x.translate(-(1 - d) * 60, 0);
    x.fillStyle = P.ink2; x.fillRect(96, 330, 380, 400); x.fillStyle = P.lem; x.fillRect(96, 330, 380, 10);
    x.fillStyle = P.paper; x.font = FC(250, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('31', 286, 500);
    x.fillStyle = P.lem; x.font = FC(64, 800); x.letterSpacing = '8px'; x.fillText('MARCH', 286, 640); x.letterSpacing = '0px';
    x.fillStyle = P.gold; x.font = FM(22, 500); x.letterSpacing = '4px'; x.fillText('2026 · TUESDAY', 286, 690); x.letterSpacing = '0px';
    x.fillStyle = P.paper; x.font = F(26, 900); x.fillText('経産省が発表', 286, 396); x.restore();
  }
  ROWS.forEach((r, k) => {                                                                  // rundown rows flip in vertically on the beat
    const t0 = ROW_T[k], p = back(seg(lt, t0, t0 + .42), 1.6); if (p <= 0) return;
    const y = 330 + k * 140, h = 120, hh = Math.max(.02, p);
    x.save(); x.translate(0, y + h / 2); x.scale(1, hh); x.translate(0, -(y + h / 2)); x.globalAlpha = clamp(p * 2);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(522, y + 8, 1260, h); x.fillStyle = P.ink2; x.fillRect(516, y, 1260, h); x.fillStyle = P.lem; x.fillRect(516, y, 130, h);
    x.fillStyle = P.ink; x.font = FC(96, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(r[0], 581, y + h / 2 + 4);
    x.fillStyle = P.paper; x.font = F(52, 900); x.textAlign = 'left'; x.fillText(r[1], 690, y + h / 2 - 12);
    x.fillStyle = P.gold; x.font = FM(20, 500); x.letterSpacing = '4px'; x.fillText(r[2], 692, y + h / 2 + 36); x.letterSpacing = '0px';
    if (lt > 4.2 && Math.floor((lt - 4.2) / 1.7) % 3 === k) { x.strokeStyle = P.lem; x.lineWidth = 4; x.strokeRect(518, y + 2, 1256, h - 4); }      // the outline walks down the list
    glint(x, 516, y, 1260, h, seg(lt, t0 + .35, t0 + .9)); x.restore();
  });
}
const open = { paint: openScene, ev: len => [{ t: .16, type: 'hit' }, { t: 1.12, type: 'glock', n: 6 }, ...ROW_T.map((t, k) => ({ t, type: 'glock', n: k }))] };

// ===== 2. share: split-flap board, old value -> new value in one look =====
const SH = 's2_share';
const sTf = TL.cue(SH, 0) + TL.dur(SH, 0) * .5, STEP = .085, sBadge = sTf + 1.1, sStamp = TL.cue(SH, 0) + TL.dur(SH, 0) * .82;
function flapSeq(x, tx, ty, w, h, fs, o, n, t, t0) {         // numeric tile cycling o -> n one digit per step
  const d = (n - o + 10) % 10; let a = o, b = o, p = 1;
  if (d === 0 || t < t0) { a = b = o; p = 1; } else { const k = Math.floor((t - t0) / STEP); if (k >= d) { a = b = n; } else { a = (o + k) % 10; b = (o + k + 1) % 10; p = (t - t0) / STEP - k; } }
  flapTile(x, tx, ty, w, h, String(a), String(b), p, fs);
}
function shareScene(x, lt) {
  eyebrow(x, 96, 176, 'CASHLESS RATIO · DOMESTIC BASIS · METI 2026.03.31', ss(seg(lt, .2, .7)));
  x.save(); x.globalAlpha = ss(seg(lt, .3, .8)); x.fillStyle = P.paper; x.font = F(44, 900); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('キャッシュレス決済比率', 96, 236); x.restore();
  const yb = ss(seg(lt, .35, .8)); x.save(); x.globalAlpha = yb;                           // years (small board): 2024 -> 2025
  ['2', '0', '2'].forEach((c, k) => flapTile(x, 140 + k * 74, 290, 66, 90, c, c, 1, 76)); flapSeq(x, 140 + 3 * 74, 290, 66, 90, 76, 4, 5, lt, sTf); x.restore();
  const T = [[200, '5', 5], [200, '2', 8], [80, '.', '.'], [200, '8', 0], [200, '%', '%']]; let bx = 140;    // the big board 52.8 -> 58.0
  const bb = ss(seg(lt, .5, 1.1)); x.save(); x.globalAlpha = bb; x.translate(0, (1 - bb) * 30);
  T.forEach((tl, k) => {
    const w = tl[0], by = 410, bh = 290;
    if (k === 0 || k === 2 || k === 4) flapTile(x, bx, by, w, bh, tl[1], tl[1], 1, 250);
    else flapSeq(x, bx, by, w, bh, 250, +tl[1], +tl[2], lt, sTf + (k === 3 ? .06 : 0));
    bx += w + 12;
  }); x.restore();
  const sx = 140, sw = 928, sy = 760, val = lerp(52.8, 58.0, ss(seg(lt, sTf, sTf + .75)));    // scale bar 0..100 with the marker moving
  x.save(); x.globalAlpha = ss(seg(lt, .9, 1.4)); x.fillStyle = P.ink3; x.fillRect(sx, sy - 14, sw, 28); x.fillStyle = P.lem; x.fillRect(sx, sy - 14, sw * val / 100, 28);
  x.fillStyle = 'rgba(244,241,232,.5)'; for (let k = 0; k <= 4; k++) x.fillRect(sx + sw * k / 4 - 1, sy - 22, 2, 44);
  x.fillStyle = P.gold; x.font = FM(16, 500); x.textAlign = 'center'; ['0', '25', '50', '75', '100%'].forEach((l, k) => x.fillText(l, sx + sw * k / 4, sy + 40)); x.restore();
  const pb = back(seg(lt, sBadge, sBadge + .35), 1.7);                                      // +5.2 badge
  if (pb > 0) {
    x.save(); x.translate(1470, 450); x.scale(pb, pb); x.globalAlpha = clamp(pb * 2);
    x.fillStyle = P.lem; x.font = FC(300, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('+5.2', 0, 0);
    x.fillStyle = P.paper; x.font = F(66, 900); x.fillText('ポイント', 0, 148); x.restore();
    x.save(); x.globalAlpha = ss(seg(lt, sBadge + .2, sBadge + .6)); x.fillStyle = P.gold; x.font = FM(20, 500); x.letterSpacing = '4px'; x.textAlign = 'center'; x.fillText('POINTS · YEAR ON YEAR', 1470, 668); x.letterSpacing = '0px'; x.restore();
    ring(x, 1470, 450, 60, 420, seg(lt, sBadge, sBadge + .6), P.lem, 6);
  }
  stamp(x, 1530, 748, '国内指標', 'DOMESTIC BASIS', seg(lt, sStamp, sStamp + .5), { size: 48 });
}
const share = {
  paint: shareScene,
  ev: len => {
    const e = [], d1 = (8 - 2 + 10) % 10, d2 = (0 - 8 + 10) % 10;
    for (let k = 0; k < d1; k++) e.push({ t: sTf + k * STEP, type: 'flap' });
    for (let k = 0; k < d2; k++) e.push({ t: sTf + .06 + k * STEP, type: 'flap' });
    e.push({ t: sBadge, type: 'stamp' }, { t: sStamp, type: 'stamp' }); return e;
  },
};

// ===== 3. types: four payment types (diagram sheet; each card fills in as the narration names it) =====
const TY = 's3_types', tyDur = k => TL.dur(TY, k);
const CARD_T = [TL.cue(TY, 0) + 1.0, TL.cue(TY, 0) + 1.15, TL.cue(TY, 0) + 1.3, TL.cue(TY, 0) + 1.45];
const FILL_T = [TL.cue(TY, 1) + .1, TL.cue(TY, 1) + tyDur(1) * .42, TL.cue(TY, 2) + .1, TL.cue(TY, 2) + tyDur(2) * .38];
const TAG_T = [TL.cue(TY, 1) + tyDur(1) * .3, TL.cue(TY, 1) + tyDur(1) * .78, TL.cue(TY, 2) + tyDur(2) * .26, TL.cue(TY, 2) + tyDur(2) * .72];
const TYPES = [
  { n: '01', name: 'クレジットカード', tag: '後払い', en: 'POSTPAID', cap: 'あとでまとめて\n請求・引き落とし' },
  { n: '02', name: 'デビットカード', tag: '即時払い', en: 'INSTANT', cap: '使った瞬間に\n口座から引き落とし' },
  { n: '03', name: '電子マネー', tag: '前払い', en: 'PREPAID', cap: '先にチャージした\n金額から払う' },
  { n: '04', name: 'コード決済', tag: 'スマホ読取り', en: 'SCAN', cap: 'QR・バーコードを\n読み取って払う' },
];
const CX = [294, 738, 1182, 1626];
function iconCard(x, cx, cy, w, h, tilt = 0) {
  x.save(); x.translate(cx, cy); x.rotate(tilt); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(-w / 2 + 6, -h / 2 + 8, w, h); const g = x.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, P.lemL); g.addColorStop(1, P.lemD); x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h);
  x.fillStyle = P.ink; x.fillRect(-w / 2, -h / 2 + h * .16, w, h * .17); x.fillStyle = P.gold; x.fillRect(-w / 2 + w * .1, -h / 2 + h * .45, w * .2, h * .24); x.fillStyle = 'rgba(18,20,23,.45)'; x.fillRect(-w / 2 + w * .1, h / 2 - h * .2, w * .5, h * .06); x.fillRect(-w / 2 + w * .1, h / 2 - h * .11, w * .3, h * .05); x.restore();
}
function iconCredit(x, cx, cy, t, u) {
  iconCard(x, cx, cy + Math.sin(t * 2) * 6, 240, 152, -.1 + Math.sin(t * 1.4) * .03);
  x.save(); x.globalAlpha = u; x.strokeStyle = P.paper; x.lineWidth = 4; x.setLineDash([10, 9]); x.lineDashOffset = -t * 30; x.beginPath(); x.moveTo(cx - 110, cy + 112); x.lineTo(cx + 110, cy + 112); x.stroke(); x.setLineDash([]);
  x.fillStyle = P.paper; x.font = FM(18, 500); x.textAlign = 'center'; x.letterSpacing = '3px'; x.fillText('LATER', cx, cy + 142); x.letterSpacing = '0px'; x.restore();
}
function bankIcon(x, cx, cy, s, col) {
  x.save(); x.fillStyle = col; x.beginPath(); x.moveTo(cx - s, cy - s * .35); x.lineTo(cx, cy - s * .9); x.lineTo(cx + s, cy - s * .35); x.closePath(); x.fill();
  for (let k = -1; k <= 1; k++) x.fillRect(cx + k * s * .6 - s * .14, cy - s * .2, s * .28, s * .7); x.fillRect(cx - s, cy + s * .58, s * 2, s * .16); x.restore();
}
function iconDebit(x, cx, cy, t, u) {
  iconCard(x, cx - 70, cy - 8, 150, 96, -.08); bankIcon(x, cx + 82, cy + 4, 56, P.paper);
  x.save(); x.globalAlpha = u; const ph = (t * 1.6) % 1; x.strokeStyle = P.lem; x.lineWidth = 5; x.beginPath(); x.moveTo(cx - 10, cy + 100); x.lineTo(cx + 82, cy + 100); x.stroke(); x.fillStyle = P.lem; x.beginPath(); x.moveTo(cx + 100, cy + 100); x.lineTo(cx + 80, cy + 88); x.lineTo(cx + 80, cy + 112); x.fill();
  x.fillRect(cx - 10 + ph * 80 - 6, cy + 94, 12, 12); x.fillStyle = P.paper; x.font = FM(18, 500); x.textAlign = 'center'; x.letterSpacing = '3px'; x.fillText('NOW', cx + 36, cy + 142); x.letterSpacing = '0px'; x.restore();
}
function iconEmoney(x, cx, cy, t, u) {
  x.save(); x.fillStyle = P.ink3; x.fillRect(cx - 80, cy + 20, 160, 100); x.fillStyle = P.lem; x.fillRect(cx - 80, cy + 20, 160, 8); x.fillStyle = P.paper; x.fillRect(cx - 50, cy + 52, 100, 38);
  const mv = Math.sin(t * 2.2) * .5 + .5; iconCard(x, cx, cy - 34 - mv * 16, 150, 96, 0);
  for (let k = 0; k < 3; k++) { const a = ((t * 1.3 + k * .33) % 1); x.strokeStyle = P.lem; x.globalAlpha = (1 - a) * u; x.lineWidth = 4; x.beginPath(); x.arc(cx, cy + 20, 40 + a * 60, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }
  x.globalAlpha = u; x.fillStyle = P.paper; x.font = FM(18, 500); x.textAlign = 'center'; x.letterSpacing = '3px'; x.fillText('CHARGED', cx, cy + 152); x.letterSpacing = '0px'; x.restore();
}
function qrCells(x, cx, cy, s, n, seed) {
  x.fillStyle = P.paper; x.fillRect(cx - s * n / 2 - 8, cy - s * n / 2 - 8, s * n + 16, s * n + 16); x.fillStyle = P.ink;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const fin = (r < 3 && c < 3) || (r < 3 && c >= n - 3) || (r >= n - 3 && c < 3); let on;
    if (fin) { const lr = r < 3 ? r : r - (n - 3), lc = c < 3 ? c : c - (n - 3); on = !((lr === 1 && lc !== 1) || (lc === 1 && lr !== 1)); } else on = hash(r * 31 + c * 7 + seed) > .5;
    if (on) x.fillRect(cx - s * n / 2 + c * s, cy - s * n / 2 + r * s, s, s);
  }
}
function iconCode(x, cx, cy, t, u) {
  x.save(); x.fillStyle = P.ink3; x.fillRect(cx - 76, cy - 126, 152, 250); x.strokeStyle = P.paper; x.lineWidth = 5; x.strokeRect(cx - 76, cy - 126, 152, 250); x.fillStyle = P.paper; x.fillRect(cx - 20, cy - 114, 40, 6);
  qrCells(x, cx, cy - 20, 10, 9, 5); const sy = cy - 20 - 54 + ((t * .8) % 1) * 108; x.fillStyle = P.lem; x.fillRect(cx - 62, sy - 2, 124, 5); x.globalAlpha = .2; x.fillRect(cx - 62, sy - 20, 124, 18);
  x.globalAlpha = u; x.fillStyle = P.paper; x.font = FM(18, 500); x.textAlign = 'center'; x.letterSpacing = '3px'; x.fillText('SCAN', cx, cy + 158); x.letterSpacing = '0px'; x.restore();
}
const ICON = [iconCredit, iconDebit, iconEmoney, iconCode];
function typeCard(k) {
  return { k: 'fn', f: 0, d: .01, fn: (x, t) => {
    const cx = CX[k], y0 = 190, h = 610, w = 396, a = ss(seg(t, CARD_T[k], CARD_T[k] + .4)); if (a <= 0) return;
    const ty = TYPES[k], fp = ss(seg(t, FILL_T[k], FILL_T[k] + .4)), tp = back(seg(t, TAG_T[k], TAG_T[k] + .35), 1.8);
    x.save(); x.globalAlpha = a; x.translate(0, (1 - a) * 26);
    x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(cx - w / 2 + 8, y0 + 10, w, h); x.fillStyle = P.ink2; x.fillRect(cx - w / 2, y0, w, h); x.fillStyle = P.lem; x.fillRect(cx - w / 2, y0, w, 8);
    x.fillStyle = P.gold; x.font = FM(22, 500); x.textAlign = 'left'; x.textBaseline = 'middle'; x.letterSpacing = '3px'; x.fillText('TYPE ' + ty.n, cx - w / 2 + 26, y0 + 40); x.letterSpacing = '0px';
    x.fillStyle = 'rgba(244,241,232,.08)'; x.fillRect(cx - w / 2 + 26, y0 + 66, w - 52, 3);
    if (fp > 0) {
      x.save(); x.globalAlpha = a * fp; x.translate(cx, y0 + 192); x.scale(.82, .82); ICON[k](x, 0, 0, t, fp); x.restore();
      x.fillStyle = P.paper; x.font = F(k === 0 ? 40 : 44, 900); x.textAlign = 'center'; x.globalAlpha = a * fp; x.fillText(ty.name, cx, y0 + 395 + (1 - fp) * 16);
    }
    if (tp > 0) {
      x.save(); x.globalAlpha = a * clamp(tp * 2); x.translate(cx, y0 + 462); x.scale(tp, tp); x.fillStyle = P.lem; x.fillRect(-150, -30, 300, 60); x.fillStyle = P.ink; x.font = F(32, 900); x.textAlign = 'center'; x.fillText(ty.tag, 0, -2);
      x.font = FM(13, 500); x.letterSpacing = '3px'; x.fillText(ty.en, 0, 20); x.letterSpacing = '0px'; x.restore();
      x.fillStyle = P.paper; x.font = F(28, 700); x.textAlign = 'center'; x.globalAlpha = a * ss(seg(t, TAG_T[k] + .2, TAG_T[k] + .6)); ty.cap.split('\n').forEach((l, i) => x.fillText(l, cx, y0 + 535 + i * 40));
    }
    x.restore();
  } };
}
const types = diagramView('types', {
  items: [
    { k: 'fn', f: 0, d: .01, fn: (x, t) => cornerTag(x, 'SCHEMATIC', '概念図 · 仕組みの説明', ss(seg(t, .3, .55))) },
    { k: 'text', f: TL.f(TY, 0, .2), x: 1000, y: 150, str: 'お金の払い方は、この4つ', size: 40, col: 'paper' },
    typeCard(0), typeCard(1), typeCard(2), typeCard(3),
  ],
});
types.ev = len => [...CARD_T.map(t => ({ t, type: 'tick' })), ...FILL_T.map(t => ({ t, type: 'glock', n: 3 })), ...TAG_T.map(t => ({ t, type: 'stamp' }))];

// ===== 4. mix: breakdown of 162.7 trillion yen on ONE scale, with a ticker =====
const MX = 's4_mix', mxT = [TL.cue(MX, 0) + .5, TL.cue(MX, 1) + .15, TL.cue(MX, 1) + TL.dur(MX, 1) * .5, TL.cue(MX, 1) + TL.dur(MX, 1) * .78];
const BARS = [['クレジットカード', 82.7, '134.6兆円', 'a'], ['コード決済', 10.2, '16.6兆円', 'b'], ['電子マネー', 3.7, '6.0兆円', 'c'], ['デビットカード', 3.4, '5.5兆円', 'c']];
const MXF = k => mxT[k] / TL.len(MX);
const mix = diagramView('mix', { items: [
  { k: 'fn', f: 0, d: .01, fn: (x, t) => eyebrow(x, 96, 176, 'PAYMENT VALUE BY TYPE · 2025 · SHARE OF CASHLESS TOTAL', ss(seg(t, .3, .8))) },
  { k: 'telop', f: TL.f(MX, 0, .1), x: 1500, y: 232, w: 560, h: 96, str: '合計 162.7兆円', fill: 'ink', size: 50, sub: 'CASHLESS TOTAL 2025' },
  ...BARS.flatMap((b, k) => [
    { k: 'bar', f: MXF(k), d: .9, x: 560, y: 340 + k * 112, w: 1000, h: 70, frac: b[1] / 100, col: b[3], label: b[0], num: b[1].toFixed(1) + '%', size: 38 },
    { k: 'text', f: MXF(k) + .08, d: .4, x: 1812, y: 340 + k * 112, str: b[2], size: 42, align: 'right', cond: true, col: 'gold' },
  ]),
  { k: 'fn', f: MXF(0), d: .5, fn: (x, t, p) => { x.save(); x.globalAlpha = p; x.fillStyle = P.gold; x.font = FM(16, 500); x.textAlign = 'center'; ['0', '25', '50', '75', '100%'].forEach((l, k) => x.fillText(l, 560 + 250 * k, 738)); x.restore(); } },
  { k: 'ticker', f: TL.f(MX, 0, .4), d: .4, x: 96, y: 766, w: 1728, h: 50, label: 'FLASH', items: [{ k: '決済額 合計', v: '162.7兆円', d: 1 }, { k: 'クレジット', v: '134.6兆円', d: 1 }, { k: 'コード決済', v: '16.6兆円', d: 1 }, { k: '電子マネー', v: '6.0兆円', d: 0 }, { k: 'デビット', v: '5.5兆円', d: 1 }, { k: '比率', v: '58.0%', d: 1 }] },
] });
mix.ev = len => [...mxT.map(t => ({ t, type: 'flap' })), { t: TL.cue(MX, 0) + .1, type: 'tick' }];

// ===== 5. line: the line breaks the threshold (native move: "breaking the threshold") =====
const LN = 's5_line', YRS = [2020, 2021, 2022, 2023, 2024, 2025], VAL = [29.7, 32.5, 36.0, 39.3, 42.8, 46.3];
const CX0 = 300, CX1 = 1620, YB = 740, YT = 220, XY = i => CX0 + i * (CX1 - CX0) / 5, VY = v => YB - (v - 25) / 25 * (YB - YT);
const tThr = TL.cue(LN, 0) + .5, tPts = [0, 1, 2, 3].map(k => TL.cue(LN, 1) + k * .5), tCross = TL.cue(LN, 1) + TL.dur(LN, 1) * .42, tHead = tCross - (40 - 39.3) / (42.8 - 39.3) * .6, t25 = TL.cue(LN, 2) + .55, tStamp = tCross + .9;
function headPts(lt) {          // polyline of revealed vertices, head interpolated
  const pts = [];
  for (let i = 0; i < 4; i++) if (lt >= tPts[i]) pts.push([XY(i), VY(VAL[i])]);
  if (lt >= tHead) { const u = ss(seg(lt, tHead, tHead + .6)); pts.push([lerp(XY(3), XY(4), u), lerp(VY(VAL[3]), VY(VAL[4]), u)]); }
  if (lt >= t25 - .5) { const u = ss(seg(lt, t25 - .5, t25)); if (u > 0) { pts[pts.length - 1] = [XY(4), VY(VAL[4])]; pts.push([lerp(XY(4), XY(5), u), lerp(VY(VAL[4]), VY(VAL[5]), u)]); } }
  return pts;
}
function lineScene(x, lt) {
  cornerTag(x, 'INTERNATIONAL BASIS', '国際比較指標 · 実データ', ss(seg(lt, .3, .55)));
  const [sx, sy] = shake(lt - tCross, 9, .38), ax = ss(seg(lt, .1, .6));
  x.save(); x.translate(sx, sy); x.globalAlpha = ax;
  x.fillStyle = P.gold; x.font = FC(30, 600); x.textAlign = 'right'; x.textBaseline = 'middle'; x.strokeStyle = 'rgba(244,241,232,.16)'; x.lineWidth = 2;
  [30, 40, 50].forEach(v => { x.beginPath(); x.moveTo(CX0 - 30, VY(v)); x.lineTo(CX1 + 60, VY(v)); x.stroke(); x.fillText(v + '%', CX0 - 50, VY(v)); });
  x.strokeStyle = P.paper; x.lineWidth = 3; x.beginPath(); x.moveTo(CX0 - 30, YB + 18); x.lineTo(CX1 + 60, YB + 18); x.stroke();
  x.textAlign = 'center'; x.font = FM(22, 500); x.fillStyle = P.gold; YRS.forEach((y, i) => x.fillText(String(y), XY(i), YB + 50));
  x.restore();
  const tp = eio(seg(lt, tThr, tThr + .9));                                                // threshold: dashed gold, drawn left to right
  if (tp > 0) {
    x.save(); x.translate(sx, sy); x.strokeStyle = P.gold; x.lineWidth = 5; x.setLineDash([22, 14]); x.beginPath(); x.moveTo(CX0 - 30, VY(40)); x.lineTo(lerp(CX0 - 30, CX1 + 60, tp), VY(40)); x.stroke(); x.setLineDash([]);
    x.globalAlpha = ss(seg(lt, tThr + .5, tThr + 1)); x.fillStyle = P.gold; x.font = F(30, 900); x.textAlign = 'left'; x.fillText('目標: 2025年までに4割', CX0 - 20, VY(40) - 30); x.font = FM(15, 500); x.letterSpacing = '3px'; x.fillText('TARGET 40% BY 2025', CX0 - 20, VY(40) - 62); x.letterSpacing = '0px'; x.restore();
  }
  const pts = headPts(lt);
  if (pts.length > 1) {
    const xc = XY(3) + (40 - 39.3) / (42.8 - 39.3) * (XY(4) - XY(3)), broke = lt >= tCross;
    x.save(); x.translate(sx, sy); x.lineWidth = 9; x.lineJoin = 'round'; x.lineCap = 'round';
    const path = () => { x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); };
    x.save(); x.beginPath(); x.rect(0, 0, broke ? xc : W, H); x.clip(); x.strokeStyle = P.paper; path(); x.restore();
    if (broke) { x.save(); x.beginPath(); x.rect(xc, 0, W, H); x.clip(); x.strokeStyle = P.lem; path(); x.restore(); }
    pts.forEach((q, i) => {
      x.fillStyle = i >= 4 ? P.lem : P.paper; x.beginPath(); x.arc(q[0], q[1], i === 4 ? 16 : 11, 0, 7); x.fill(); x.strokeStyle = P.ink; x.lineWidth = 4; x.stroke();
      if (i < 4 || (i === 4 && lt > tHead + .55) || (i === 5 && lt > t25 + .05)) { x.fillStyle = i >= 4 ? P.lem : P.paper; x.font = FC(i === 4 ? 56 : 38, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(VAL[i].toFixed(1), q[0], q[1] - (i === 4 ? 46 : 38)); }
    });
    x.restore();
    if (broke) { ring(x, xc + sx, VY(40) + sy, 20, 190, seg(lt, tCross, tCross + .7), P.lem, 8); ring(x, xc + sx, VY(40) + sy, 10, 110, seg(lt, tCross + .1, tCross + .6), P.paper, 4); }
  }
  const rp = ss(seg(lt, tCross + .15, tCross + .55));                                      // readout panel after the break
  if (rp > 0) { x.save(); x.globalAlpha = rp; x.translate(-(1 - rp) * 50, 0); telop(x, 330, 190, 560, 130, { fill: 'ink', text: '42.8%', size: 72, num: true, align: 'l', sub: '2024 · 目標40%を上回る' }); x.restore(); }
  stamp(x, 1360, 600, '目標達成', 'TARGET MET', seg(lt, tStamp, tStamp + .5), { size: 62 });
}
const line = { paint: lineScene, ev: len => [...tPts.map(t => ({ t, type: 'tick' })), { t: tHead, type: 'tick' }, { t: tCross, type: 'break' }, { t: tStamp, type: 'stamp' }, { t: t25, type: 'tick' }] };

// ===== 6. goal: target ladder on one scale + the three items ticked off =====
const GL = 's6_goal', gT = [TL.cue(GL, 0) + .2, TL.cue(GL, 0) + TL.dur(GL, 0) * .4, TL.cue(GL, 0) + TL.dur(GL, 0) * .72], kT = [0, 1, 2].map(k => TL.cue(GL, 1) + .3 + k * .8);
const GB = [['2025年  現在', 58.0, '58.0%', 'a'], ['2030年  中間目標', 65, '65%', 'b'], ['将来の目標', 80, '80%', 'c']];
const CHIPS = ['決済の種類', 'いまの比率', 'これからの目標'];
const goal = diagramView('goal', { items: [
  { k: 'fn', f: 0, d: .01, fn: (x, t) => cornerTag(x, 'DOMESTIC BASIS', '国内指標 · 目標の物差し', ss(seg(t, .3, .55))) },
  ...GB.map((b, k) => ({ k: 'bar', f: gT[k] / TL.len(GL), d: .9, x: 640, y: 290 + k * 112, w: 1000, h: 70, frac: b[1] / 100, col: b[3], label: b[0], num: b[2], size: 38 })),
  { k: 'fn', f: gT[0] / TL.len(GL), d: .5, fn: (x, t, p) => { x.save(); x.globalAlpha = p; x.fillStyle = P.gold; x.font = FM(16, 500); x.textAlign = 'center'; ['0', '25', '50', '75', '100%'].forEach((l, k) => x.fillText(l, 640 + 250 * k, 608)); x.restore(); } },
  ...CHIPS.map((c, k) => ({ k: 'fn', f: TL.f(GL, 1, -.2), d: .01, fn: (x, t) => {
    const a = back(seg(t, TL.cue(GL, 1) - .1 + k * .12, TL.cue(GL, 1) + .3 + k * .12), 1.5); if (a <= 0) return; const cx = 96 + k * 580, cy = 690, w = 548, h = 100, tp = ss(seg(t, kT[k], kT[k] + .25));
    x.save(); x.translate(cx + w / 2, cy + h / 2); x.scale(1, Math.max(.02, a)); x.translate(-w / 2, -h / 2); x.fillStyle = P.ink2; x.fillRect(0, 0, w, h); x.fillStyle = tp > 0 ? P.lem : P.ink3; x.fillRect(0, 0, 100, h);
    x.fillStyle = tp > 0 ? P.ink : P.paper; x.font = FC(64, 800); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('0' + (k + 1), 50, h / 2 + 3); x.fillStyle = P.paper; x.font = F(40, 900); x.textAlign = 'left'; x.fillText(c, 124, h / 2 + 2);
    if (tp > 0) { x.save(); x.globalAlpha = tp; tick(x, w - 56, h / 2 + 2, 52 * (.6 + .4 * tp), P.lem, 10); x.restore(); } x.restore();
  } })),
] });
goal.ev = len => [...gT.map(t => ({ t, type: 'flap' })), ...kT.map((t, k) => ({ t, type: 'glock', n: k + 3 }))];

export const VIEWS = { open, share, types, mix, line, goal };
