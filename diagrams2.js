// Explainer sheets, chapters 6-12. Times are fractions f of the sheet length.
import { clamp, lerp, seg, ss, eio, mulberry, hash, TAU } from '/core/lib.js';
import { W, H, FR, PAL, poly, carve } from './print.js';
import { fig } from './figs.js';
import { castle } from './figs2.js';
import { diagramView, font } from './diagram.js';
const S = PAL.sumi;
const title = (str, sub) => [
  { k: 'text', f: .0, d: .6, x: 130, y: 118, align: 'left', size: 62, str },
  { k: 'pen', f: .04, d: .6, x0: 128, x1: 128 + str.length * 62 + 20, y: 160, col: PAL.beni, w: 9 },
  ...(sub ? [{ k: 'text', f: .06, d: .6, x: 130 + str.length * 62 + 50, y: 122, align: 'left', size: 36, weight: 500, col: PAL.greyD, str: sub }] : []),
];
const note = (f, str, y = 840, col = S, size = 44) => ({ k: 'text', f, d: .6, x: 960, y, size, col, str });
const arrowR = (f, x1, x2, y) => ({ k: 'arrow', f, d: .4, from: [x1, y], to: [x2, y], col: PAL.beni, w: 10 });
const chain = (items, y, w, h, gap0, fills, o = {}) => items.map((str, i) => ({ k: 'box', f: (o.f0 ?? .08) + i * (o.df ?? .14), x: o.x0 + i * (w + gap0), y, w, h, str, fill: fills[i % fills.length], size: o.size || 46, sub: o.sub || 34 }));

// ———— 6 本能寺のあと
export const D_HONNO_AFTER = diagramView('d_honno_after', { items: [
  ...title('本能寺のあと', '旧暦'),
  { k: 'box', f: .10, x: 480, y: 470, w: 600, h: 300, str: '6月2日\n本能寺の変\n光秀が信長を討つ', fill: 'rice', size: 64, sub: 44 },
  { k: 'box', f: .40, x: 1440, y: 470, w: 600, h: 300, str: '6月13日\n山崎の戦い\n光秀、秀吉に敗れる', fill: 'ochre', size: 64, sub: 44 },
  arrowR(.32, 800, 1130, 470),
  { k: 'text', f: .34, d: .4, x: 965, y: 410, size: 40, col: PAL.beni, str: '十日あまり' },
  note(.70, '信長の跡を巡る争いが、始まった'),
] });
// ———— 7 秀吉の台頭
export const D_HIDE_RISE = diagramView('d_hide_rise', { items: [
  ...title('秀吉の台頭'),
  { k: 'line', f: .06, d: .8, pts: [[200, 620], [1720, 620]], w: 10 },
  ...[['1582', '山崎の戦い', '光秀を破る'], ['1583', '賤ヶ岳の戦い', '柴田勝家を破る'], ['1584', '小牧・長久手', '家康と戦い、のち和睦'], ['1586', '家康が従う', '秀吉の下へ']].flatMap(([y, a, b], i) => [
    { k: 'fn', f: .10 + i * .2, fn(x, t, p) { x.save(); x.globalAlpha = p; x.fillStyle = PAL.beni; x.beginPath(); x.arc(270 + i * 420, 620, 24, 0, TAU); x.fill(); x.strokeStyle = S; x.lineWidth = 4; x.stroke(); x.fillStyle = S; x.font = font(52); x.textAlign = 'center'; x.fillText(y + '年', 270 + i * 420, 700); x.restore(); } },
    { k: 'box', f: .12 + i * .2, x: 270 + i * 420, y: 400, w: 390, h: 220, str: `${a}\n${b}`, fill: ['blue', 'green', 'ochre', 'rice'][i], size: 46, sub: 36 },
  ]),
  note(.88, '織田家の重臣たちを退け、家康も従えていった', 830, S, 40),
] });
// ———— 7 太閤検地
export const D_KENCHI = diagramView('d_kenchi', { items: [
  ...title('太閤検地', '1582年〜'),
  { k: 'box', f: .10, x: 330, y: 480, w: 480, h: 300, str: '検地\n田畑の広さと\n収穫量を測る', fill: 'green', size: 60, sub: 40 },
  arrowR(.30, 590, 700, 480),
  { k: 'box', f: .36, x: 960, y: 480, w: 440, h: 300, str: '検地帳\n土地と耕作者を\n記録する', fill: 'ochre', size: 60, sub: 40 },
  arrowR(.56, 1190, 1300, 480),
  { k: 'box', f: .62, x: 1590, y: 480, w: 480, h: 300, str: '年貢\n誰が納めるかが\nはっきりする', fill: 'rice', size: 60, sub: 40 },
  note(.84, '全国の土地を、同じ基準で把握した'),
] });
// ———— 7 刀狩と兵農分離
export const D_BUNRI = diagramView('d_bunri', { items: [
  ...title('刀狩と兵農分離', '1588年'),
  { k: 'box', f: .08, x: 520, y: 470, w: 700, h: 480, str: '武士\n城下に住み、戦い、治める', fill: 'blue', size: 56, sub: 40 },
  { k: 'box', f: .34, x: 1400, y: 470, w: 700, h: 480, str: '百姓\n村に住み、田畑を耕す', fill: 'green', size: 56, sub: 40 },
  { k: 'fn', f: .12, fn(x, t, p) { x.save(); x.globalAlpha = p; fig(x, 520, 690, 120, { still: true, dir: 1, col: PAL.ai, col2: PAL.greyL, sword: true, hat: null }); x.restore(); } },
  { k: 'fn', f: .38, fn(x, t, p) { x.save(); x.globalAlpha = p; fig(x, 1400, 690, 120, { still: true, dir: -1, col: PAL.straw, hat: 'kasa', carry: 'pole' }); x.restore(); } },
  { k: 'text', f: .62, d: .5, x: 960, y: 770, size: 60, col: PAL.beni, str: '刀狩 ＝ 武器は武士だけのもの' },
  note(.80, '身分がはっきり分かれた。これを兵農分離という', 850, S, 38),
] });
// ———— 8 朝鮮出兵と秀吉の死
export const D_KOREA = diagramView('d_korea', { items: [
  ...title('朝鮮出兵と秀吉の死'),
  { k: 'line', f: .06, d: .8, pts: [[300, 600], [1620, 600]], w: 10 },
  ...[['1592', '文禄の役', '朝鮮へ大軍を送る', 'rice'], ['1597', '慶長の役', '再び出兵する', 'ochre'], ['1598', '秀吉、死去', '跡継ぎの秀頼は幼い', 'grey']].flatMap(([y, a, b, c], i) => [
    { k: 'fn', f: .10 + i * .26, fn(x, t, p) { x.save(); x.globalAlpha = p; x.fillStyle = PAL.beni; x.beginPath(); x.arc(420 + i * 540, 600, 24, 0, TAU); x.fill(); x.strokeStyle = S; x.lineWidth = 4; x.stroke(); x.fillStyle = S; x.font = font(52); x.textAlign = 'center'; x.fillText(y + '年', 420 + i * 540, 680); x.restore(); } },
    { k: 'box', f: .12 + i * .26, x: 420 + i * 540, y: 400, w: 440, h: 220, str: `${a}\n${b}`, fill: c, size: 56, sub: 38 },
  ]),
  note(.88, '戦いは長引き、豊臣政権に、大きな重荷を残した', 830, S, 40),
] });
// ———— 9 天下分け目
export const D_SPLIT = diagramView('d_split', { items: [
  ...title('天下分け目'),
  { k: 'box', f: .10, x: 520, y: 470, w: 700, h: 330, str: '東軍\n徳川家康', fill: 'rice', size: 80, sub: 44 },
  { k: 'box', f: .34, x: 1400, y: 470, w: 700, h: 330, str: '西軍\n石田三成・毛利輝元', fill: 'blue', size: 80, sub: 44 },
  { k: 'text', f: .26, d: .4, x: 960, y: 470, size: 70, col: PAL.beni, str: '対' },
  { k: 'text', f: .60, d: .5, x: 1400, y: 690, size: 38, weight: 500, col: PAL.greyD, str: '毛利輝元は西軍の総大将' },
  note(.78, '秀吉の死後、家康に反発する勢力が、挙兵した'),
] });
// ———— 9 関ヶ原の布陣
export const D_SEKI_MAP = diagramView('d_seki_map', { tint: PAL.greenL, items: [
  ...title('関ヶ原の布陣', '旧暦9月15日'),
  { k: 'hill', f: .05, x: 330, y: 390, w: 480, h: 130, col: PAL.greenL }, { k: 'hill', f: .06, x: 1590, y: 390, w: 480, h: 130, col: PAL.greenL },
  { k: 'hill', f: .07, x: 420, y: 880, w: 420, h: 150, col: PAL.greenL },
  { k: 'text', f: .10, x: 420, y: 800, size: 36, col: PAL.greenD, str: '松尾山' },
  { k: 'token', f: .14, x: 540, y: 520, n: 8, rows: 3, s: 46, col: PAL.prus, label: '西軍', dir: 1, move: { t0: 5, d: 5, x: 760, y: 520 } },
  { k: 'token', f: .30, x: 1400, y: 520, n: 8, rows: 3, s: 46, col: PAL.beni, label: '東軍', dir: -1, move: { t0: 5, d: 5, x: 1180, y: 520 } },
  { k: 'text', f: .50, d: .5, x: 960, y: 520, size: 64, col: PAL.beni, str: '関ヶ原' },
  note(.70, '両軍あわせて、およそ十六万', 790, S, 46),
  { k: 'text', f: .78, d: .5, x: 960, y: 855, size: 34, weight: 500, col: PAL.greyD, str: '兵数には諸説があります' },
] });
// ———— 9 小早川の寝返り
export const D_KOBA = diagramView('d_koba', { items: [
  ...title('小早川秀秋の寝返り'),
  { k: 'box', f: .10, x: 480, y: 420, w: 520, h: 220, str: '大谷吉継隊\n西軍', fill: 'blue', size: 60, sub: 40 },
  { k: 'box', f: .26, x: 1440, y: 640, w: 560, h: 220, str: '小早川秀秋\n松尾山・西軍のはず', fill: 'grey', size: 56, sub: 38 },
  { k: 'arrow', f: .50, d: 1.2, pts: [[1180, 640], [800, 640], [640, 540]], col: PAL.beni, w: 16 },
  { k: 'text', f: .60, d: .5, x: 960, y: 740, size: 56, col: PAL.beni, str: '寝返り' },
  note(.80, '味方のはずの軍が、西軍の側面を突いた', 840, S, 44),
] });
// ———— 9 関ヶ原のあと
export const D_SEKI_AFTER = diagramView('d_seki_after', { items: [
  ...title('関ヶ原のあと'),
  { k: 'bar', f: .12, d: 1.2, x: 560, y: 400, w: 820, h: 100, frac: 1, col: PAL.prusL, label: '毛利家(戦前)', num: '約120万石', size: 48 },
  { k: 'bar', f: .34, d: 1.2, x: 560, y: 580, w: 820, h: 100, frac: .3, col: PAL.beni, label: '毛利家(戦後)', num: '約36万石', size: 48 },
  note(.60, '西軍についた大名は、領地を取り上げられたり、減らされたりした', 760, S, 40),
  { k: 'text', f: .74, d: .6, x: 960, y: 840, size: 36, weight: 500, col: PAL.greyD, str: '三成らは処刑された。領地を失った大名は、約90家とされる' },
] });
// ———— 10 二つの権力
export const D_REMAIN = diagramView('d_remain', { items: [
  ...title('二つの権力'),
  { k: 'box', f: .10, x: 520, y: 470, w: 640, h: 330, str: '江戸\n徳川家康・秀忠', fill: 'rice', size: 72, sub: 44 },
  { k: 'box', f: .36, x: 1400, y: 470, w: 640, h: 330, str: '大坂\n豊臣秀頼・淀殿', fill: 'ochre', size: 72, sub: 44 },
  { k: 'text', f: .56, d: .5, x: 960, y: 470, size: 64, col: PAL.beni, str: '対立' },
  note(.76, '家康にとって、豊臣家は、最後の不安材料だった'),
] });
// ———— 10 堀を埋める
export const D_MOAT = diagramView('d_moat', { items: [
  ...title('堀を埋める', '大坂城'),
  { k: 'fn', f: .06, fn(x, t, p, len) {
    const fill1 = ss(seg(t, len * .45, len * .62)), fill2 = ss(seg(t, len * .70, len * .86)); x.save(); x.globalAlpha = Math.min(1, p * 1.5);
    const cx = 960, cy = 480;
    x.fillStyle = PAL.prusL; x.fillRect(cx - 640, cy - 280, 1280, 560); x.fillStyle = PAL.ochreL; x.globalAlpha = Math.min(1, p * 1.5) * fill1; x.fillRect(cx - 640, cy - 280, 1280, 560); x.globalAlpha = Math.min(1, p * 1.5);
    x.fillStyle = PAL.greyL; x.fillRect(cx - 520, cy - 200, 1040, 400);
    x.fillStyle = PAL.prusL; x.fillRect(cx - 380, cy - 130, 760, 260); x.fillStyle = PAL.ochreL; x.globalAlpha = Math.min(1, p * 1.5) * fill2; x.fillRect(cx - 380, cy - 130, 760, 260); x.globalAlpha = Math.min(1, p * 1.5);
    x.fillStyle = PAL.white; x.fillRect(cx - 250, cy - 70, 500, 140); x.strokeStyle = S; x.lineWidth = 4; x.strokeRect(cx - 640, cy - 280, 1280, 560); x.strokeRect(cx - 520, cy - 200, 1040, 400); x.strokeRect(cx - 380, cy - 130, 760, 260); x.strokeRect(cx - 250, cy - 70, 500, 140);
    x.fillStyle = S; x.font = font(44); x.textAlign = 'center'; x.fillText('本丸', cx, cy + 12); x.font = font(34, 500); x.fillText('外堀', cx - 580, cy - 240); x.fillText('内堀', cx - 330, cy - 150); x.restore(); } },
  note(.70, '和議の条件で外堀が、のちに内堀も、埋められた', 850, S, 42),
] });
// ———— 11 一国一城令
function iconCastle(x, X, Y, s, a = 1) { x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.fillStyle = PAL.greyL; x.fillRect(-46, -20, 92, 20); x.fillStyle = PAL.white; x.fillRect(-30, -60, 60, 40); x.fillStyle = PAL.greyD; x.beginPath(); poly(x, [[-44, -58], [-22, -86], [22, -86], [44, -58]]); x.fill(); x.strokeStyle = S; x.lineWidth = 3; x.strokeRect(-30, -60, 60, 40); x.restore(); }
export const D_IKKOKU = diagramView('d_ikkoku', { items: [
  ...title('一国一城令', '1615年'),
  { k: 'box', f: .08, x: 520, y: 470, w: 700, h: 440, str: '', fill: 'rice' }, { k: 'box', f: .08, x: 1400, y: 470, w: 700, h: 440, str: '', fill: 'green' },
  { k: 'text', f: .10, x: 520, y: 300, size: 48, str: '令の前：一国に城がいくつも' }, { k: 'text', f: .36, x: 1400, y: 300, size: 48, str: '令の後：一国に城は一つ' },
  { k: 'fn', f: .12, fn(x, t, p, len) { const kill = ss(seg(t, len * .42, len * .62)); [[360, 470], [520, 400], [680, 470], [440, 580], [600, 580]].forEach(([X, Y], i) => iconCastle(x, X, Y + 40, 1.4, i === 0 ? 1 : 1 - kill * .85)); } },
  { k: 'fn', f: .40, fn(x, t, p) { iconCastle(x, 1400, 560, 1.8, p); } },
  arrowR(.34, 900, 1000, 470),
  note(.76, '大名の城は、領国に一つだけ。多くの城が、取り壊された'),
] });
// ———— 11 武家諸法度
export const D_HATTO = diagramView('d_hatto', { items: [
  ...title('武家諸法度', '1615年'),
  { k: 'box', f: .08, x: 560, y: 360, w: 800, h: 150, str: '城を、無断で修理しない', fill: 'blue', size: 52 },
  { k: 'box', f: .24, x: 560, y: 560, w: 800, h: 150, str: '大名同士で、無断で結婚しない', fill: 'green', size: 52 },
  { k: 'box', f: .40, x: 560, y: 760, w: 800, h: 150, str: '徒党を組まない', fill: 'ochre', size: 52 },
  { k: 'text', f: .56, d: .5, x: 1480, y: 560, size: 44, col: PAL.beni, str: '背けば\n領地を取り上げられる', lh: 1.5 },
] });
// ———— 11 参勤交代
export const D_SANKIN = diagramView('d_sankin', { items: [
  ...title('参勤交代', '1635年'),
  { k: 'box', f: .08, x: 430, y: 440, w: 480, h: 260, str: '領地', fill: 'green', size: 84 },
  { k: 'box', f: .14, x: 1490, y: 440, w: 480, h: 260, str: '江戸', fill: 'rice', size: 84 },
  { k: 'arrow', f: .24, d: .8, pts: [[690, 390], [1230, 390]], col: PAL.beni, w: 12 },
  { k: 'arrow', f: .36, d: .8, pts: [[1230, 490], [690, 490]], col: PAL.prusL, w: 12 },
  { k: 'text', f: .30, d: .5, x: 960, y: 330, size: 42, col: PAL.beni, str: '一年おきに行き来' },
  { k: 'box', f: .56, x: 1490, y: 670, w: 560, h: 120, str: '妻と子は、江戸に住む', fill: 'ochre', size: 44, dbl: false },
  note(.78, '往復の費用は大きく、大名は、軍備に回す余裕を失った', 830, S, 40),
] });
// ———— 11 島原の乱
export const D_SHIMA = diagramView('d_shima', { items: [
  ...title('島原の乱', '1637〜1638年'),
  { k: 'box', f: .08, x: 360, y: 470, w: 520, h: 300, str: '重い年貢\nキリスト教の弾圧', fill: 'rice', size: 52, sub: 40 },
  arrowR(.28, 640, 760, 470),
  { k: 'box', f: .34, x: 960, y: 470, w: 400, h: 300, str: '1637年\n人々が蜂起', fill: 'ochre', size: 54, sub: 40 },
  arrowR(.54, 1170, 1290, 470),
  { k: 'box', f: .60, x: 1560, y: 470, w: 520, h: 300, str: '1638年\n幕府が大軍で鎮圧', fill: 'grey', size: 54, sub: 40 },
  note(.84, '江戸時代で、最後の大きな戦となった'),
] });
// ———— 11 鎖国
export const D_SAKOKU = diagramView('d_sakoku', { items: [
  ...title('鎖国'),
  { k: 'box', f: .08, x: 500, y: 430, w: 720, h: 260, str: '1639年\nポルトガル船の来航を禁止', fill: 'rice', size: 56, sub: 42 },
  { k: 'box', f: .32, x: 1400, y: 430, w: 720, h: 260, str: '1641年\nオランダ商館を長崎の出島へ', fill: 'blue', size: 56, sub: 42 },
  { k: 'text', f: .58, d: .5, x: 960, y: 650, size: 48, str: '貿易を許されたのは、長崎での、オランダと中国だけ' },
  note(.80, '国の内でも外でも、戦のない体制が、整っていった', 820, PAL.beni, 46),
] });
// ———— 12 戦い方の革新
export const D_SUM_TAC = diagramView('d_sum_tac', { items: [
  ...title('戦い方の革新'),
  ...chain(['足軽\n歩兵が主力に', '鉄砲\n弓や槍に代わる', '馬防柵\n突撃を止める', '鉄甲船・大砲\n海と城でも火力', '石垣の城\n守りを固める'].map(s => s), 470, 290, 280, 36, ['rice', 'blue', 'green', 'ochre', 'grey'], { x0: 200, f0: .08, df: .15, size: 44, sub: 32 }),
  ...[0, 1, 2, 3].map(i => ({ k: 'arrow', f: .14 + i * .15, d: .3, from: [200 + i * 326 + 150, 470], to: [200 + i * 326 + 176, 470], col: PAL.beni, w: 8 })),
  note(.88, '戦国の百五十年で、戦のやり方は、大きく変わった', 800, S, 42),
] });
// ———— 12 戦を起こさせない仕組み
export const D_SUM_SYS = diagramView('d_sum_sys', { items: [
  ...title('戦を起こさせない仕組み'),
  ...[['太閤検地', '土地と年貢を把握'], ['刀狩・兵農分離', '武士と百姓を分ける'], ['一国一城令', '大名の城を減らす'], ['武家諸法度', '大名の行動を縛る'], ['参勤交代', '大名の財力を削る'], ['鎖国', '外からの影響を絞る']].map(([a, b], i) => ({ k: 'box', f: .08 + i * .1, x: 340 + (i % 3) * 620, y: 380 + Math.floor(i / 3) * 250, w: 560, h: 200, str: `${a}\n${b}`, fill: ['green', 'rice', 'blue', 'ochre', 'grey', 'rice'][i], size: 54, sub: 38 })),
  note(.76, '秀吉が土台をつくり、徳川の幕府が、仕上げていった', 800, S, 42),
] });
