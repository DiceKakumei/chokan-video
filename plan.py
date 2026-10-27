"""Timeline planner: sheets.json + voices/dur.json -> story.json (sheet spans, narration start times, final wash + seal)."""
import json, pathlib
H = pathlib.Path(__file__).resolve().parent
SH = json.load(open(H / 'sheets.json', encoding='utf-8')); dur = json.load(open(H / 'voices' / 'dur.json'))
GAP, TAIL = .95, 1.1
t = 0.0; vo = {}; sheets = []
for i, s in enumerate(SH['sheets']):
    t0 = t; lead = 3.0 if s['print'] else .75
    tl = t0 + lead; last = tl
    for lid in s['lines']:
        vo[lid] = round(tl, 3); last = tl + dur[lid]; tl = last + GAP
    t1 = max(t0 + lead + 2.0, last + TAIL)
    sheets.append({'id': s['id'], 'view': s['view'], 'cart': s['cart'], 'print': s['print'], 'mood': s['mood'], 't0': round(t0, 3), 't1': round(t1, 3)})
    t = t1
wash = [round(t + .2, 3), round(t + 1.6, 3)]; seal = round(t + 2.4, 3)
out = {'dur': round(seal + 2.6, 3), 'sheets': sheets, 'vo': vo, 'wash': wash, 'seal': {'t': seal, 'char': SH['final']['seal']}}
json.dump(out, open(H / 'story.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(sheets), 'sheets, total', out['dur'], 's')
