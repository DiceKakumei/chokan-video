import re, sys, urllib.request, urllib.parse, pathlib
H = pathlib.Path(sys.argv[1])
txt = ''
for f in ['main.js','newsviews.js','diagram.js','issue.json','lines.json','sheets.json']:
    txt += (H / f).read_text(encoding='utf-8')
chars = sorted(set(c for c in txt if ord(c) > 127) | set('0123456789。、') | set('朝刊第号出典以上今朝ほかの主なニュースキーワード'))
print(len(chars), 'chars')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'}
(H / 'fonts').mkdir(exist_ok=True)
CH = 220; css = ''
for fam, w, name, fam_css in [('Shippori+Mincho', 500, 'shippori-500', 'Shippori'), ('Shippori+Mincho', 700, 'shippori-700', 'Shippori'), ('Yuji+Syuku', 400, 'yuji-400', 'Yuji')]:
    for ci in range(0, len(chars), CH):
        part = ''.join(chars[ci:ci + CH])
        u = f'https://fonts.googleapis.com/css2?family={fam}:wght@{w}&text=' + urllib.parse.quote(part)
        c = urllib.request.urlopen(urllib.request.Request(u, headers=UA)).read().decode()
        url = re.search(r'url\((https://[^)]+)\)', c).group(1)
        data = urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()
        fn = f'{name}-{ci // CH}.woff2'; (H / 'fonts' / fn).write_bytes(data)
        rng = ','.join('U+%X' % ord(ch) for ch in part)
        css += f"@font-face {{ font-family: '{fam_css}'; font-weight: {w}; font-display: block; src: url(fonts/{fn}) format('woff2'); unicode-range: {rng}; }}\n"
    print(name, 'ok')
(H / 'fonts.css').write_text(css, encoding='utf-8')
