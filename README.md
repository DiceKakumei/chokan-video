# 朝刊(ニュース番組パッケージ版)
動画編集wの `news-package-modular` をもとに、毎朝の朝刊を約15〜18分の動画にする。
- `issue.json`(調査+台本、日替わり) → `news.py` → lines.json/sheets.json → 音声 → plan → clips → 結合 → Release
- 画面は `newsviews.js` がデータだけで描く。見た目は `theme.js` / `package.js`(ニュース番組の包装: ロワーサード、ティッカー、帯ワイプ)。
- ナレーションは画面下のストラップに出る(焼き込み字幕なし)。長い文は `news.py` が約46字で自動分割する。
- issue.json: {date, no, reads:{漢字:よみ}, sheets:[{id, kind, genre, title, lines:[...], ...kind別の項目, source}]}
- kind: cover(date,no,tops[3]) / story(points[≤3,各22字×3行まで],key[≤6字],keysub) / number(num,unit,label,bars[{label,v,text}]) / flow(steps[{t,s}]≤4) / compare(left{t,pts},right{t,pts}) / digest(rows[{g,t}]≤6) / outro(title,note)
- 各章(ジャンル)の最初のstory/number/flow/compareシートには、左上に章タイトル(ジャンル名)が出る。
- 見本は `issue.json`。ビルド: `.github/workflows/build.yml`(GitHub Actions)。
