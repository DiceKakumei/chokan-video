"""Download only the characters this film uses from Google Fonts (split into unicode-range chunks) -> fonts/ + fonts.css.
   python make_fonts.py <project dir>      Fonts to use: fonts.json = [{"gf": "Zen+Maru+Gothic", "weight": 500, "css": "Main"}, ...]  (css = the font-family name used in theme.js)
Run script.py first (lines.json / sheets.json), and run this again when you add new characters."""
import re, sys, json, urllib.request, urllib.parse, pathlib
H = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
txt = ''.join(f.read_text(encoding='utf-8') for f in H.glob('*.js')) + ''.join((H / f).read_text(encoding='utf-8') for f in ['issue.json', 'lines.json', 'sheets.json'] if (H / f).exists())
ALL = chars = sorted(set(c for c in txt if ord(c) > 127) | set('0123456789。、.,:;!?()%+-=/×÷→←↑↓·') | set(chr(i) for i in range(33, 127)))   # engraving: also all printable ASCII (Latin lettering in Bodoni / Pinyon Script)
print(len(chars), 'chars')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'}
(H / 'fonts').mkdir(exist_ok=True)
CH = 220; css = ''
for f in json.load(open(H / 'fonts.json', encoding='utf-8')):
    fam, w, fam_css = f['gf'], f['weight'], f['css']; chars = [c for c in ALL if ord(c) < 128 or c == '·'] if f.get('latin') else ALL; name = f"{fam.lower().replace('+', '-')}-{w}"
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
