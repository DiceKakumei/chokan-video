"""Narration script -> lines.json + sheets.json.   Run: python script.py
Each sheet = one screen (a scene or an explainer diagram); its lines are spoken while the sheet is on screen. chapter=True starts a chapter (title card, longer lead-in).
Years written as 1560年 are spoken as kanji (千五百六十年) automatically. NAMES = reading overrides (voice only; the subtitle keeps the original)."""
import json, re, pathlib
HERE = pathlib.Path(__file__).resolve().parent
def kan(n):
    s = ''
    for v, k in [(1000, '千'), (100, '百'), (10, '十')]:
        d = n // v; n %= v
        if d: s += ('' if d == 1 else '〇一二三四五六七八九'[d]) + k
    if n: s += '〇一二三四五六七八九'[n]
    return s
NAMES = {'58.0%': '五十八パーセント', '52.8%': '五十二点八パーセント', '5.2ポイント': '五点二ポイント', '82.7%': '八十二点七パーセント', '10.2%': '十点二パーセント',
         '3%台': '三パーセント台', '42.8%': '四十二点八パーセント', '46.3%': '四十六点三パーセント', '65%': '六十五パーセント', '80%': '八十パーセント', '4割': '四割', '1年': '一年',
         '162.7兆円': '百六十二点七兆円', '経済産業省': 'けいざいさんぎょうしょう'}
def say(t):
    t = re.sub(r'(\d{3,4})年', lambda m: kan(int(m.group(1))) + '年', t)
    for k in sorted(NAMES, key=len, reverse=True): t = t.replace(k, NAMES[k])
    return t

# (sheet id, view, chapter title or None, chapter start?, mood, [lines])      moods: calm / think / march / tense / fire / sea / rain (theme_audio.py decides what they sound like)
S = [
 ('s1_open', 'open', 'キャッシュレス決済 いま', True, 'march', ['経済産業省が、キャッシュレス決済の最新の数字を発表しました。', '2025年は58.0%。支払いの半分以上が、現金以外です。']),
 ('s2_share', 'share', None, False, 'think', ['前の年は52.8%。1年で5.2ポイント上がりました。']),
 ('s3_types', 'types', None, False, 'calm', ['決済は、大きく四つあります。', 'クレジットは後払い、デビットは即時払いです。', '電子マネーは前払い。コード決済は、スマホで読み取ります。']),
 ('s4_mix', 'mix', None, False, 'think', ['いちばん多いのは、クレジットカード。82.7%を占めます。', '次がコード決済の10.2%。電子マネーとデビットは3%台です。']),
 ('s5_line', 'line', None, False, 'tense', ['国の目標は、2025年までに4割でした。', '比率は毎年伸びて、2024年に42.8%。目標を1年早く超えました。', '2025年は、国際比較の指標で46.3%です。']),
 ('s6_goal', 'goal', None, False, 'fire', ['目標は2030年に65%、将来は80%です。', 'どちらも国内指標での数字です。']),
]
FINAL = {'end': 'キャッシュレス決済 いま'}
# Content keys: bump REV[sheet id] when you change that sheet's picture or sound; bump ENGINE / AUDIO when shared drawing code / the sound generator changes (everything is rendered again).
REV = {}
ENGINE, AUDIO = 1, 2
VOICE, RATE = 'ja-JP-KeitaNeural', '+5%'

lines, sheets, n = [], [], 0
for sid, view, cart, chapter, mood, ls in S:
    ids = []
    for t in ls:
        n += 1; i = f'n{n:02d}'; ids.append(i)
        o = {'id': i, 'text': t, 'voice': VOICE, 'rate': RATE, 'sheet': sid}
        s2 = say(t)
        if s2 != t: o['say'] = s2
        lines.append(o)
    sheets.append({'id': sid, 'view': view, 'cart': cart, 'chapter': chapter, 'mood': mood, 'lines': ids, 'rev': REV.get(sid, 0)})
(HERE / 'lines.json').write_text(json.dumps(lines, ensure_ascii=False, indent=1), encoding='utf-8')
(HERE / 'sheets.json').write_text(json.dumps({'sheets': sheets, 'final': FINAL, 'engine': ENGINE, 'audio': AUDIO}, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(sheets), 'sheets', len(lines), 'lines', sum(len(l['text']) for l in lines), 'chars')
