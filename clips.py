"""Clip planner: one clip per sheet (= per screen change). story.json + sheets.json -> clips.json
Each clip has its own video file and audio file, named with a content key. Unchanged clips keep their key, so their files are re-used from the cache
and only the clips whose content changed are rendered again. Clip i covers [sheet.t0, sheet.t1): the boundary is the middle of the scroll slide, so the clips join seamlessly."""
import json, hashlib, math, pathlib
H = pathlib.Path(__file__).resolve().parent
FPS = 24
ST = json.load(open(H / 'story.json', encoding='utf-8')); SP = json.load(open(H / 'sheets.json', encoding='utf-8'))
LN = {l['id']: l for l in json.load(open(H / 'lines.json', encoding='utf-8'))}; DUR = json.load(open(H / 'voices' / 'dur.json'))
sheets = ST['sheets']; spec = {s['id']: s for s in SP['sheets']}; N = len(sheets)
def sig(i):
    if i < 0 or i >= N: return None
    s = sheets[i]; sp = spec[s['id']]
    return {'view': s['view'], 'cart': s['cart'], 'chapter': s['chapter'], 'mood': s['mood'], 'rev': sp.get('rev', 0), 'len': round(s['t1'] - s['t0'], 3),
            'lines': [[LN[k]['text'], LN[k].get('say'), round(DUR[k], 3), round(ST['vo'][k] - s['t0'], 3)] for k in sp['lines']]}
def key(*parts): return hashlib.sha1(json.dumps(parts, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:10]
clips = []; start = 0.0
for i, s in enumerate(sheets):
    last = i == N - 1; c0 = s['t0']; c1 = ST['dur'] if last else s['t1']
    n = math.ceil((c1 - c0) * FPS - 1e-6); L = n / FPS
    tail = [round(ST['wash'][0] - c0, 3), round(ST['wash'][1] - c0, 3), round(ST['seal']['t'] - c0, 3), ST['seal']['char'], round(ST['dur'] - c0, 3)] if last else None
    vk = key('v', SP.get('engine', 0), sig(i - 1), sig(i), sig(i + 1), tail, FPS)
    ak = key('a', SP.get('audio', 0), sig(i), tail)
    cid = f'{i:02d}_{s["id"]}'
    clips.append({'i': i, 'id': s['id'], 'name': cid, 'c0': round(c0, 3), 'c1': round(c1, 3), 'n': n, 'L': L, 'start': round(start, 4), 'last': last, 'mood': s['mood'],
                  'sheet_t0': s['t0'], 'sheet_t1': s['t1'], 'vfile': f'clips/{cid}.{vk}.mp4', 'afile': f'clips/{cid}.{ak}.wav'})
    start += L
json.dump({'fps': FPS, 'clips': clips, 'total': round(start, 4)}, open(H / 'clips.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
(H / 'clips').mkdir(exist_ok=True)
need_v = [c['name'] for c in clips if not (H / c['vfile']).exists()]; need_a = [c['name'] for c in clips if not (H / c['afile']).exists()]
print(f'{len(clips)} clips, total {start:.1f}s; to render: {len(need_v)} video, {len(need_a)} audio')
