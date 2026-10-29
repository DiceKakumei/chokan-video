"""issue.json (the day's research + script) -> lines.json + sheets.json.   Run: python news.py
issue.json: {date, no, reads:{漢字:よみ}, sheets:[{id, kind, genre, title, lines:[narration...], ...kind fields, source}]}
Each sheet = one screen; its lines are spoken while it is shown (and shown in the lower-third strap). Years such as 2026年 are spoken as kanji numerals."""
import json, re, pathlib
HERE = pathlib.Path(__file__).resolve().parent
def kan(n):
    s = ''
    for v, k in [(1000, '千'), (100, '百'), (10, '十')]:
        d = n // v; n %= v
        if d: s += ('' if d == 1 else '〇一二三四五六七八九'[d]) + k
    if n: s += '〇一二三四五六七八九'[n]
    return s
issue = json.loads((HERE / 'issue.json').read_text(encoding='utf-8'))
READS = issue.get('reads', {})
def say(t):
    t = re.sub(r'(\d{3,4})年', lambda m: kan(int(m.group(1))) + '年', t)
    for k in sorted(READS, key=len, reverse=True): t = t.replace(k, READS[k])
    return t
MOOD = {'政治': 'think', '経済': 'think', '国際': 'sea', '社会': 'tense', '科学': 'calm', 'IT': 'calm', 'AI': 'calm', 'ビジネス': 'think', 'スポーツ': 'march', '文化': 'calm', '健康': 'calm', '暮らし': 'calm', '環境': 'sea'}
def split(t, mx=46):
    out = []
    for sent in re.findall(r'[^。！？]+[。！？]?', t):
        sent = sent.strip()
        while len(sent) > mx:
            cuts = [m.end() for m in re.finditer('、', sent) if 12 <= m.end() <= len(sent) - 8]
            if not cuts: break
            c = min(cuts, key=lambda k: abs(k - len(sent) / 2)); out.append(sent[:c]); sent = sent[c:]
        if sent: out.append(sent)
    merged = []
    for u in out:
        if merged and len(merged[-1]) + len(u) <= mx: merged[-1] += u
        else: merged.append(u)
    return merged
lines, sheets, n, seen = [], [], 0, set()
for s in issue['sheets']:
    ids = []
    for t in [u for L in s['lines'] for u in split(L)]:
        n += 1; i = f'n{n:03d}'; ids.append(i)
        o = {'id': i, 'text': t, 'voice': 'ja-JP-KeitaNeural', 'rate': '+5%', 'sheet': s['id']}
        s2 = say(t)
        if s2 != t: o['say'] = s2
        lines.append(o)
    g = s.get('genre'); first = bool(g) and g not in seen and s['kind'] not in ('cover', 'outro', 'digest')
    if first: seen.add(g)
    sheets.append({'id': s['id'], 'view': s['id'], 'cart': g if first else None, 'chapter': first, 'mood': s.get('mood') or MOOD.get(g, 'calm'), 'lines': ids, 'rev': 0})
(HERE / 'lines.json').write_text(json.dumps(lines, ensure_ascii=False, indent=1), encoding='utf-8')
(HERE / 'sheets.json').write_text(json.dumps({'sheets': sheets, 'final': {'end': '朝刊 ' + issue.get('date', '')}, 'engine': 1, 'audio': 1}, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(sheets), 'sheets', len(lines), 'lines', sum(len(l['text']) for l in lines), 'chars')
