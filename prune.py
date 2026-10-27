"""Delete files in clips/ that clips.json no longer refers to (keeps the cache small)."""
import json, pathlib
H = pathlib.Path(__file__).resolve().parent
keep = {pathlib.Path(c[k]).name for c in json.load(open(H / 'clips.json', encoding='utf-8'))['clips'] for k in ('vfile', 'afile')}
n = 0
for f in (H / 'clips').iterdir():
    if f.name not in keep: f.unlink(); n += 1
print('pruned', n, 'stale clip files;', len(keep), 'kept')
