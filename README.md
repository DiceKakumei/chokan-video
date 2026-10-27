# ukiyoe-modular — 画面ごとのクリップ方式のテンプレート

実績: 「戦国から泰平へ」(浮世絵+図解、15分、53シート)。

使い方
1. このフォルダを `<name>/` にコピーする(`views*.js` `diagrams*.js` は絵の例。題材に合わせて書き換える)。
2. `script.py` を新しい題材の台本とシートに書き換え、`python script.py` で `lines.json` / `sheets.json` を作る。
3. 絵を `views*.js` / `diagrams*.js` に書き、`registry.js` に登録する。
4. `python make_fonts.py <name>` でフォントを用意する。
5. ローカル: `tts_zh.py lines.json voices` → `python plan.py` → `node core/render/events.mjs <name>` → `python clips.py` → `still.mjs` で静止画確認。
6. プライベートリポジトリを作って push し、`gh workflow run build.yml -R <repo>`。成果物はReleaseに付く。
7. 直し: `script.py` の `REV[シートid]` を上げて push → 同じコマンド(そのシートと前後だけ作り直し)。

データの流れ: script.py → lines.json, sheets.json → (TTS) voices/ → plan.py → story.json → events.mjs → events.json → clips.py → clips.json → render_clips.mjs(映像クリップ) / mix_clips.py(音声クリップ) → assemble.py(結合) → mux.sh(音量-14 LUFS)。

注意: `mix_one.py` は元の一発ミックスを1クリップ用に書き換えたもの。音の生成コードを変えたら `AUDIO` を上げる。描画の共通コード(`print.js` `figs*.js` `diagram.js` `main.js`)を変えたら `ENGINE` を上げる。

## 朝刊(このプロジェクト)
毎朝の朝刊を約15分の解説動画にする。issue.json(調査+台本、日替わり) -> news.py -> ... -> Release。
- issue.json: {date, no, reads:{漢字:よみ}, sheets:[{id, kind, genre, title, lines:[ナレーション], ...}]}
- kind: cover / story(points,key,keysub) / number(num,unit,label,bars) / flow(steps) / compare(left,right) / digest(rows) / outro。sourceは各シートに。
- 画は newsviews.js がデータだけで描く(日ごとの手描き不要)。
