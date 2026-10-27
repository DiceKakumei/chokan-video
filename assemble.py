"""Join the clips into one film: out/video.mp4 (lossless join), out/mix.wav, out/subs.json (times in the joined film). Then build.sh runs mux.sh on them."""
import json, subprocess, pathlib, numpy as np, soundfile as sf
H = pathlib.Path(__file__).resolve().parent
CL = json.load(open(H / 'clips.json', encoding='utf-8')); ST = json.load(open(H / 'story.json', encoding='utf-8'))
LN = {l['id']: l['text'] for l in json.load(open(H / 'lines.json', encoding='utf-8'))}; DUR = json.load(open(H / 'voices' / 'dur.json'))
(H / 'out').mkdir(exist_ok=True)
clips = CL['clips']
for c in clips:
    for k in ('vfile', 'afile'):
        assert (H / c[k]).exists(), ('missing', c[k])
# video: concat demuxer, stream copy (every clip is encoded with the same settings)
(H / 'out' / 'clips.txt').write_text('\n'.join(f"file '{(H / c['vfile']).as_posix()}'" for c in clips), encoding='utf-8')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(H / 'out' / 'clips.txt'), '-c', 'copy', str(H / 'out' / 'video.mp4')], check=True)
# audio: each clip's wav is exactly as long as its video (frames / fps), so they simply follow one another
parts = []; sr0 = None
for c in clips:
    y, sr = sf.read(H / c['afile'], dtype='float32'); sr0 = sr0 or sr; assert sr == sr0
    n = int(round(c['L'] * sr)); y = y[:n] if len(y) >= n else np.concatenate([y, np.zeros((n - len(y), y.shape[1]), np.float32)])
    parts.append(y)
sf.write(H / 'out' / 'mix.wav', np.concatenate(parts), sr0)
# subtitle cues in the joined timeline
cues = []; lines_by_sheet = {}
sheets = {s['id']: s for s in json.load(open(H / 'sheets.json', encoding='utf-8'))['sheets']}
for c in clips:
    ids = sheets[c['id']]['lines']
    for j, k in enumerate(ids):
        t0 = c['start'] + ST['vo'][k] - c['c0']; t1 = t0 + max(1.8, DUR[k] + .75)
        if j + 1 < len(ids): t1 = min(t1, c['start'] + ST['vo'][ids[j + 1]] - c['c0'] - .1)
        cues.append({'t0': round(t0, 2), 't1': round(t1, 2), 'text': LN[k]})
json.dump(cues, open(H / 'out' / 'subs.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('joined', len(clips), 'clips,', round(CL['total'], 1), 's,', len(cues), 'subtitle cues')
