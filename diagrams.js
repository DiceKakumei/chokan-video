// Explainer sheets (chapters 1-5). Times are fractions f of the sheet length.
import { clamp, lerp, seg, ss, eio, mulberry, hash, TAU } from '/core/lib.js';
import { W, H, FR, PAL, poly, carve } from './print.js';
import { fig } from './figs.js';
import { horse, gunner, puff, palisade, nobori } from './figs2.js';
import { diagramView, font } from './diagram.js';
const S = PAL.sumi;
const title = (str, sub) => [
  { k: 'text', f: .0, d: .6, x: 130, y: 118, align: 'left', size: 62, str },
  { k: 'pen', f: .04, d: .6, x0: 128, x1: 128 + str.length * 62 + 20, y: 160, col: PAL.beni, w: 9 },
  ...(sub ? [{ k: 'text', f: .06, d: .6, x: 130 + str.length * 62 + 50, y: 122, align: 'left', size: 36, weight: 500, col: PAL.greyD, str: sub }] : []),
];

// ———— 1 下剋上
export const D_GEKOKUJO = diagramView('d_gekoku', { items: [
  ...title('下剋上のはじまり'),
  { k: 'box', f: .10, x: 420, y: 270, w: 560, h: 150, str: '将軍\n幕府の力が衰える', fill: 'rice', size: 46 },
  { k: 'box', f: .22, x: 420, y: 500, w: 560, h: 150, str: '守護大名\n各地を支配する', fill: 'blue', size: 46 },
  { k: 'box', f: .34, x: 420, y: 730, w: 560, h: 150, str: '家臣・国人\n力を蓄える', fill: 'green', size: 46 },
  { k: 'arrow', f: .17, d: .4, from: [420, 350], to: [420, 420], col: PAL.greyD, w: 8 },
  { k: 'arrow', f: .29, d: .4, from: [420, 580], to: [420, 650], col: PAL.greyD, w: 8 },
  { k: 'arrow', f: .46, d: .8, pts: [[710, 730], [1000, 730], [1000, 560], [1100, 560]], col: PAL.beni, w: 14 },
  { k: 'text', f: .50, d: .5, x: 1010, y: 800, size: 78, col: PAL.beni, str: '下剋上' },
  { k: 'box', f: .62, x: 1450, y: 540, w: 640, h: 300, str: '戦国大名\n実力で主君にとって代わり\n領国を治める者', fill: 'ochre', size: 56, sub: 38 },
] });

// ———— 1 戦国大名たち
const FIEF = [['北条', '相模', 'rice'], ['武田', '甲斐', 'blue'], ['上杉', '越後', 'green'], ['今川', '駿河', 'ochre'], ['織田', '尾張', 'rice'], ['毛利', '安芸', 'blue']];
export const D_DAIMYO = diagramView('d_daimyo', { items: [
  ...title('戦国大名', '各地に生まれた有力者'),
  ...FIEF.map(([n, r, c], i) => ({ k: 'box', f: .08 + i * .06, x: 330 + (i % 3) * 630, y: 360 + Math.floor(i / 3) * 250, w: 520, h: 190, str: `${n}家\n${r}`, fill: c, size: 64, sub: 40 })),
  { k: 'arrow', f: .58, d: .7, pts: [[330, 760], [960, 760], [1590, 760]], head: false, col: PAL.beni, w: 8 },
  { k: 'text', f: .62, d: .6, x: 960, y: 820, size: 46, str: '自分の力で領国を守り、広げようとした', col: S },
] });

// ———— 2 鉄砲の生産地
export const D_SITES = diagramView('d_sites', { items: [
  ...title('鉄砲の生産地'),
  { k: 'box', f: .12, x: 400, y: 450, w: 480, h: 330, str: '堺\n和泉の港町', fill: 'blue', size: 84, sub: 44 },
  { k: 'box', f: .32, x: 960, y: 450, w: 480, h: 330, str: '国友\n近江', fill: 'green', size: 84, sub: 44 },
  { k: 'box', f: .52, x: 1520, y: 450, w: 480, h: 330, str: '根来\n紀伊', fill: 'ochre', size: 84, sub: 44 },
  { k: 'text', f: .72, d: .6, x: 960, y: 760, size: 46, str: '各地の大名が、競って鉄砲を買い求めた', col: S },
] });

// ———— 2 火縄銃のしくみ
function gunDraw(x, ox, oy, k) {
  x.save(); x.translate(ox, oy); x.scale(k, k); x.lineJoin = 'round'; x.lineCap = 'round';
  x.fillStyle = PAL.wood; x.beginPath(); poly(x, [[-520, 40], [-120, -20], [140, -20], [140, 22], [-120, 34], [-420, 150], [-560, 120]]); x.fill(); x.strokeStyle = S; x.lineWidth = 4; x.stroke();     // stock
  x.fillStyle = PAL.greyD; x.fillRect(-40, -44, 880, 30); x.strokeRect(-40, -44, 880, 30);               // barrel
  x.fillStyle = PAL.ochre; x.fillRect(-20, -62, 40, 20); x.strokeRect(-20, -62, 40, 20);                    // pan
  x.fillStyle = S; x.beginPath(); poly(x, [[-80, -40], [-30, -120], [-14, -112], [-50, -36]]); x.fill();    // serpentine arm
  x.strokeStyle = PAL.beni; x.lineWidth = 6; x.beginPath(); x.moveTo(-30, -122); x.quadraticCurveTo(-110, -150, -170, -90); x.stroke();     // match
  x.fillStyle = PAL.beni; x.beginPath(); x.arc(-30, -122, 8, 0, TAU); x.fill();
  x.restore();
}
export const D_GUN = diagramView('d_gun', { items: [
  ...title('火縄銃のしくみ'),
  { k: 'fn', f: .08, fn(x, t, p) { x.globalAlpha = Math.min(1, p * 1.4); gunDraw(x, 760, 560, 1.15); x.globalAlpha = 1; } },
  { k: 'fn', f: .30, fn(x, t, p) { label(x, p, [690, 480], [520, 320], '火縄\n火をつけた縄', 'l'); } },
  { k: 'fn', f: .46, fn(x, t, p) { label(x, p, [760, 500], [980, 330], '火皿・火蓋\n火薬をのせる', 'c'); } },
  { k: 'fn', f: .62, fn(x, t, p) { label(x, p, [1420, 510], [1480, 340], '銃身\n弾を撃ち出す', 'c'); } },
  { k: 'fn', f: .78, fn(x, t, p) { label(x, p, [380, 640], [380, 800], '台\n肩にあてて構える', 'c'); } },
] });
function label(x, p, from, to, str, al) {
  x.save(); x.globalAlpha = p; x.strokeStyle = PAL.beni; x.lineWidth = 4; x.beginPath(); x.moveTo(from[0], from[1]); x.lineTo(to[0], to[1]); x.stroke();
  x.fillStyle = PAL.beni; x.beginPath(); x.arc(from[0], from[1], 7, 0, TAU); x.fill();
  x.fillStyle = S; x.font = font(42); x.textAlign = 'center'; x.textBaseline = 'middle'; const L = str.split('\n'); x.fillText(L[0], to[0], to[1] + (to[1] < from[1] ? -40 : 44)); x.font = font(30, 500); x.fillStyle = PAL.greyD; x.fillText(L[1] || '', to[0], to[1] + (to[1] < from[1] ? -4 : 82)); x.restore();
}

// ———— 2 装填の手順
const STEPS = [['①', '火薬を\n入れる'], ['②', '弾を\n入れる'], ['③', '棒で\n突き固める'], ['④', '火皿に\n火薬をのせる'], ['⑤', '火縄をつけ\n構えて撃つ']];
export const D_RELOAD = diagramView('d_reload', { items: [
  ...title('一発撃つまで'),
  ...STEPS.map(([n, s], i) => ({ k: 'box', f: .10 + i * .11, x: 280 + i * 340, y: 430, w: 300, h: 330, str: `${n}\n${s}`, fill: ['rice', 'blue', 'green', 'ochre', 'red'][i], size: 80, sub: 40 })),
  { k: 'fn', f: .72, d: 1, fn(x, t, p, len) {
    const u = clamp((t - .72 * len) / (len * .22)); x.save(); x.globalAlpha = Math.min(1, p * 2);
    x.fillStyle = PAL.paperD; x.fillRect(280, 730, 1360, 50); x.fillStyle = PAL.beni; x.fillRect(280, 730, 1360 * u, 50); x.strokeStyle = S; x.lineWidth = 3; x.strokeRect(280, 730, 1360, 50);
    x.fillStyle = S; x.font = font(46); x.textAlign = 'center'; x.fillText('一発に、およそ二十秒', 960, 830); x.restore();
  } },
] });

// ———— 3 桶狭間: 両軍の位置
export const D_OKE_MAP = diagramView('d_oke_map', { tint: PAL.greenL, items: [
  ...title('1560年 桶狭間', '尾張へ進む今川軍'),
  { k: 'hill', f: .05, x: 380, y: 640, w: 520, h: 200, col: PAL.greenL },
  { k: 'hill', f: .06, x: 1500, y: 640, w: 560, h: 180, col: PAL.greenL },
  { k: 'text', f: .08, x: 260, y: 740, size: 44, str: '駿河' }, { k: 'text', f: .08, x: 1560, y: 740, size: 44, str: '尾張' },
  { k: 'token', f: .14, x: 420, y: 480, n: 10, rows: 3, s: 46, col: PAL.prus, label: '今川軍', move: { t0: 4, d: 8, x: 980, y: 480 } },
  { k: 'token', f: .50, x: 1560, y: 500, n: 4, rows: 2, s: 46, col: PAL.beni, label: '織田軍', flag: true },
  { k: 'text', f: .60, x: 960, y: 880, size: 40, weight: 500, col: PAL.greyD, str: '※兵数や進軍の目的には諸説あります' },
] });
export const D_OKE_NUM = diagramView('d_oke_num', { items: [
  ...title('兵力の比較', '通説'),
  { k: 'bar', f: .15, d: 1.4, x: 480, y: 400, w: 1100, h: 110, frac: 1, col: PAL.prusL, label: '今川軍', num: '約2万5千', size: 54 },
  { k: 'bar', f: .45, d: 1.4, x: 480, y: 620, w: 1100, h: 110, frac: .13, col: PAL.beni, label: '織田軍', num: '数千', size: 54 },
  { k: 'text', f: .75, x: 960, y: 820, size: 40, weight: 500, col: PAL.greyD, str: '兵数は史料や研究によって異なります' },
] });
export const D_OKE_AFTER = diagramView('d_oke_after', { items: [
  ...title('桶狭間のあと'),
  { k: 'box', f: .08, x: 330, y: 500, w: 440, h: 230, str: '今川義元\n討死', fill: 'blue', size: 60, sub: 38 },
  { k: 'box', f: .30, x: 830, y: 500, w: 440, h: 230, str: '今川家\n力が弱まる', fill: 'grey', size: 56, sub: 38 },
  { k: 'box', f: .52, x: 1330, y: 500, w: 440, h: 230, str: '松平元康\n三河で独立', fill: 'ochre', size: 56, sub: 38 },
  { k: 'arrow', f: .22, d: .4, from: [560, 500], to: [600, 500], col: PAL.beni, w: 10 }, { k: 'arrow', f: .44, d: .4, from: [1060, 500], to: [1100, 500], col: PAL.beni, w: 10 },
  { k: 'text', f: .74, d: .6, x: 1330, y: 700, size: 44, col: PAL.beni, str: 'のちの徳川家康' },
  { k: 'text', f: .84, d: .6, x: 960, y: 820, size: 44, str: '信長と家康は、やがて手を結ぶ' },
] });

// ———— 5 長篠: 布陣図
export const D_NAGA_MAP = diagramView('d_naga_map', { tint: PAL.greenL, items: [
  ...title('設楽原の布陣', '長篠の戦い'),
  { k: 'river', f: .05, d: .8, pts: [[960, 230], [920, 380], [970, 540], [930, 700], [960, 860]], w: 54 },
  { k: 'text', f: .08, x: 990, y: 215, size: 34, weight: 500, col: PAL.prusD, align: 'left', str: '連吾川' },
  { k: 'token', f: .14, x: 480, y: 470, n: 9, rows: 3, s: 46, col: PAL.ai, label: '織田・徳川軍', move: null },
  { k: 'fn', f: .30, d: .8, fn(x, t, p) {       x.save(); x.globalAlpha = p; for (let y = 260; y < 840; y += 42) { x.fillStyle = PAL.wood; x.fillRect(858, y, 16, 34); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(858, y, 16, 34); } x.fillStyle = S; x.font = font(40); x.textAlign = 'center'; x.fillText('馬防柵', 790, 900); x.restore(); } },
  { k: 'token', f: .52, x: 1560, y: 470, n: 9, rows: 3, s: 46, col: PAL.beni, dir: -1, label: '武田軍', move: { t0: 8.5, d: 4, x: 1190, y: 470 } },
  { k: 'arrow', f: .66, d: .8, pts: [[1400, 360], [1100, 360]], col: PAL.beni, w: 12 },
] });
export const D_NAGA_NUM = diagramView('d_naga_num', { items: [
  ...title('兵力の比較', '通説'),
  { k: 'bar', f: .12, d: 1.4, x: 560, y: 400, w: 860, h: 110, frac: 1, col: PAL.ai, label: '織田・徳川軍', num: '約3万8千', size: 52 },
  { k: 'bar', f: .42, d: 1.4, x: 560, y: 620, w: 860, h: 110, frac: .395, col: PAL.beni, label: '武田軍', num: '約1万5千', size: 52 },
  { k: 'text', f: .72, x: 960, y: 820, size: 40, weight: 500, col: PAL.greyD, str: '兵数には諸説があります' },
] });

// ———— 5 三段撃ち(通説)
const SLOT_X = [1000, 790, 580];
export const D_TIER = diagramView('d_tier', { items: [
  ...title('三段撃ち', '通説'),
  { k: 'fn', f: .04, fn(x, t, p, len) {
    const t0 = .12 * len, tt = Math.max(0, t - t0), CY = 2.4, step = Math.floor(tt / CY), u = (tt % CY) / CY;
    x.save(); x.globalAlpha = Math.min(1, p * 2);
    // ranks: rank r currently sits at slot (r - step) mod 3 ; the firing rank (front) walks to the rear
    for (let r = 0; r < 3; r++) {
      const slot = ((r - step) % 3 + 3) % 3; let X = SLOT_X[slot];
      if (slot === 0 && u > .55) X = lerp(SLOT_X[0], SLOT_X[2] - 140, ss((u - .55) / .35)) ;
      else if (u > .55) X = lerp(SLOT_X[slot], SLOT_X[slot - 1], ss((u - .55) / .35));
      const rear = slot === 0 && u > .55;
      for (let k = 0; k < 4; k++) { const Y = 390 + k * 125, fire = slot === 0 && u > .1 && u < .28 ? 1 - (u - .1) / .18 : 0; gunner(x, X + (rear ? -Math.min(40, (u - .55) * 80) : 0), Y, 92, { dir: -1, col: [PAL.ai, PAL.prusL, PAL.greenD][r], fire }); }
    }
    // state labels
    const L = [['撃つ', PAL.beni], ['構える', PAL.ochre], ['弾込め', PAL.prusL]];
    for (let s2 = 0; s2 < 3; s2++) { x.fillStyle = L[s2][1]; x.font = font(40); x.textAlign = 'center'; x.fillText(L[s2][0], SLOT_X[s2] - 20, 300); }
    x.restore();
  } },
  { k: 'fn', f: .12, fn(x, t, p, len) {      // cavalry approaching, held at the fence
    const tt = t - .12 * len, X0 = 1780 - (tt * 40 % 260), tq = Math.floor(t * 8) / 8;
    x.save(); x.globalAlpha = Math.min(1, p * 2); for (let k = 0; k < 4; k++) horse(x, X0 + (k % 2) * 90, 470 + k * 100, 64, tq * 3 + k * .3, { dir: -1, col: PAL.woodD, armor: PAL.beni, flag: PAL.beni });
    x.fillStyle = PAL.wood; for (let y = 330; y < 820; y += 38) { x.fillRect(1290, y, 14, 30); x.strokeStyle = S; x.lineWidth = 2; x.strokeRect(1290, y, 14, 30); } x.fillStyle = S; x.font = font(36); x.textAlign = 'center'; x.fillText('馬防柵', 1297, 870); x.restore(); } },
] });

// ———— 5 通説と近年の見方
export const D_DEBATE = diagramView('d_debate', { items: [
  ...title('三段撃ちは本当か'),
  { k: 'box', f: .08, x: 520, y: 480, w: 780, h: 420, str: '通説\n鉄砲 約三千挺\n三段撃ちで 騎馬隊を撃破', fill: 'blue', size: 56, sub: 44 },
  { k: 'box', f: .30, x: 1400, y: 480, w: 780, h: 420, str: '近年の見方\n信長公記は「千挺ばかり」\n三段撃ちは 後世の書物の話', fill: 'rice', size: 56, sub: 42 },
  { k: 'text', f: .55, d: .6, x: 1400, y: 740, size: 34, weight: 500, col: PAL.greyD, str: '三か所に分けて順に撃った、とする説も' },
  { k: 'text', f: .78, d: .6, x: 960, y: 860, size: 48, col: PAL.beni, str: '柵と大量の鉄砲が、勝敗を分けた' },
] });

// ———— 5 武田家のその後
export const D_NAGA_AFTER = diagramView('d_naga_after', { items: [
  ...title('長篠のあと'),
  { k: 'line', f: .08, d: .8, pts: [[300, 560], [1620, 560]], w: 10 },
  { k: 'fn', f: .10, fn(x, t, p) { x.save(); x.globalAlpha = p; for (const [X, yr] of [[420, '1575'], [1500, '1582']]) { x.fillStyle = PAL.beni; x.beginPath(); x.arc(X, 560, 26, 0, TAU); x.fill(); x.strokeStyle = S; x.lineWidth = 4; x.stroke(); x.fillStyle = S; x.font = font(56); x.textAlign = 'center'; x.fillText(yr + '年', X, 640); } x.restore(); } },
  { k: 'box', f: .18, x: 420, y: 380, w: 560, h: 190, str: '長篠で敗れる\n山県昌景・馬場信春ら戦死', fill: 'rice', size: 54, sub: 36 },
  { k: 'box', f: .52, x: 1500, y: 380, w: 560, h: 190, str: '武田家 滅亡\n長篠から七年後', fill: 'grey', size: 54, sub: 40 },
  { k: 'arrow', f: .40, d: 1.0, from: [700, 560], to: [1210, 560], col: PAL.beni, w: 12 },
  { k: 'text', f: .72, d: .6, x: 960, y: 800, size: 44, str: '武田家は力を落とし、織田の勢いが増していく' },
] });
