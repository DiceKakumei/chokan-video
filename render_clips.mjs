// Render the missing video clips: node core/render/../../<project>/render_clips.mjs   (run with cwd = the Lemo-Opuscar library)
//   node <project>/render_clips.mjs <project> [--workers 4] [--only name1,name2]
// Each clip = one sheet. Frame k of a clip is drawn at story time c0 + k / fps, so a clip looks the same wherever it sits in the film.
import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
const LIB = process.cwd();
const { openDemo, closeServer, requireDemo } = await import(new URL('file:///' + path.join(LIB, 'core/render/page.mjs').replace(/\\/g, '/')));
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const dir = path.resolve(args[0]); requireDemo(dir);
const WK = +opt('--workers', 4), ONLY = opt('--only', '') ? opt('--only', '').split(',') : null;
const CL = JSON.parse(fs.readFileSync(path.join(dir, 'clips.json'), 'utf8')), FPS = CL.fps;
const todo = CL.clips.filter(c => (!ONLY || ONLY.includes(c.name) || ONLY.includes(c.id)) && !fs.existsSync(path.join(dir, c.vfile)));
console.log(`${todo.length} clips to render (${todo.reduce((a, c) => a + c.n, 0)} frames), ${WK} workers`);
let next = 0; const t0 = Date.now();
await Promise.all([...Array(Math.min(WK, todo.length))].map(async (_, w) => {
  const { browser, page } = await openDemo(dir, { w: 1920, h: 1080, q: '' });
  while (true) {
    const c = todo[next++]; if (!c) break;
    const out = path.join(dir, c.vfile), part = out + '.part.mp4';
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
    let dead = false; const closed = new Promise(r => ff.on('close', code => r(code))); ff.stdin.on('error', () => { dead = true; });
    for (let k = 0; k < c.n && !dead; k++) {
      await page.evaluate(t => window.render(t), c.c0 + k / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await Promise.race([new Promise(r => ff.stdin.once('drain', r)), closed]);
    }
    ff.stdin.end(); const code = await closed;
    if (dead || code !== 0) { console.error('ffmpeg failed for', c.name); process.exit(1); }
    fs.renameSync(part, out);
    console.log(`w${w} ${c.name} ${c.n} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
}));
closeServer();
console.log('done', ((Date.now() - t0) / 1000).toFixed(0) + 's');
process.exit(0);
