"""Mix the audio of every clip whose file is missing: python mix_clips.py [--only name1,name2]"""
import json, sys, runpy, pathlib
H = pathlib.Path(__file__).resolve().parent
CL = json.load(open(H / 'clips.json', encoding='utf-8'))
only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
todo = [c for c in CL['clips'] if not (H / c['afile']).exists() and (not only or c['name'] in only or c['id'] in only)]
print(len(todo), 'audio clips to mix')
for c in todo:
    clip = dict(c, out=str(H / c['afile']))
    runpy.run_path(str(H / 'mix_one.py'), init_globals={'CLIP': clip, '__file__': str(H / 'mix_one.py')})
    print('mixed', c['name'], flush=True)
