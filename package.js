// News package parts: reusable broadcast graphics drawn in code (Lemo-Opuscar "Broadcast News Package" grammar).
// Every function draws into ctx at the given place and is a pure function of its arguments (time in, picture out): no Math.random, no hidden state.
//   plate      the brand plate (sting / channel bug / end card)            stamp   verdict stamp that lands
//   strap      lower-third strap (tab + headline + one changing line)      telop   caption card with an accent top edge (the "box" of the diagram)
//   ticker     crawling data strip (label block + items)                   flapTile / flapText   split-flap tiles (old -> new)
//   bandWipe   the vertical wipe band (accent + ink + gold)                 cornerTag, sourceLine, ring, glint, ground, eyebrow
//   TL         narration timeline helpers (cue(sheetId, k) = local seconds of the k-th line)
import { clamp, lerp, seg, ss, eio, eo, back, hash } from '/core/lib.js';

export const P = { ink: '#121417', ink2: '#1B1E23', ink3: '#22262C', lem: '#F2CF1D', lemL: '#F8DE4A', lemD: '#D8B30C', gold: '#D4B064', paper: '#F4F1E8', olive: '#6E5A1E', alarm: '#FE6B3D', dim: '#8E9AA6' };
export const F = (s, w = 900) => `${w} ${s}px Main, sans-serif`;
export const FC = (s, w = 800) => `${w} ${s}px Cond, Main, sans-serif`;
export const FM = (s, w = 500) => `${w} ${s}px Mono, Main, monospace`;
export const W = 1920, H = 1080;

// ---- narration timeline (so that graphics land on the words) ----
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
export const ST = (await J('story.json')) || { sheets: [], vo: {}, wash: [0, 0], seal: { t: 0 } };
const SP = (await J('sheets.json')) || { sheets: [] };
export const DURS = (await J('voices/dur.json')) || {};
export const LINES = (await J('lines.json')) || [];
const SHEET = Object.fromEntries(ST.sheets.map(s => [s.id, s])), SPEC = Object.fromEntries(SP.sheets.map(s => [s.id, s]));
export const TL = {
  len: id => SHEET[id] ? SHEET[id].t1 - SHEET[id].t0 : 10,
  cue: (id, k = 0, off = 0) => { const s = SHEET[id], sp = SPEC[id]; if (!s || !sp) return 1 + off; return ST.vo[sp.lines[k]] - s.t0 + off; },       // local time at which line k starts
  dur: (id, k = 0) => { const sp = SPEC[id]; return sp ? (DURS[sp.lines[k]] ?? 3) : 3; },
  f: (id, k = 0, off = 0) => TL.cue(id, k, off) / TL.len(id),                                                                                   // the same as a fraction of the sheet (for diagram items)
};
// spoken lines per sheet as screen cues (same timing rule as main.js SUBS)
const CUES = {};
{
  const all = Object.entries(ST.vo).map(([id, t0]) => { const l = LINES.find(x => x.id === id); const d = DURS[id] ?? (l?.text.length || 20) * .22; return { id, t0, t1: t0 + Math.max(1.8, d + .75), text: l?.text || '', sheet: l?.sheet }; });
  all.forEach((s, i) => { if (all[i + 1] && s.t1 > all[i + 1].t0 - .1) s.t1 = all[i + 1].t0 - .1; });
  for (const c of all) (CUES[c.sheet] ||= []).push(c);
}
export const cueAt = (sheetId, abs) => (CUES[sheetId] || []).find(c => abs >= c.t0 - .05 && abs < c.t1);

// ---- ground: ink with light fins and a faint grid; made once ----
let GROUND = null;
export function buildGround() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#171a1f'); g.addColorStop(.55, '#121417'); g.addColorStop(1, '#0d0f11'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(244,241,232,.035)'; x.lineWidth = 1;                                                // grid
  for (let i = 96; i < W; i += 96) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let j = 56; j < H; j += 96) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
  for (let k = 0; k < 9; k++) {                                                                               // light fins (slanted, fading)
    const x0 = -200 + k * 260 + hash(k + 3) * 80, w = 40 + hash(k + 9) * 150, a = .012 + hash(k + 21) * .028;
    const lg = x.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, `rgba(244,241,232,${a})`); lg.addColorStop(1, 'rgba(244,241,232,0)');
    x.fillStyle = lg; x.beginPath(); x.moveTo(x0 + 520, 0); x.lineTo(x0 + 520 + w, 0); x.lineTo(x0 + w, H); x.lineTo(x0, H); x.closePath(); x.fill();
  }
  const v = x.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = v; x.fillRect(0, 0, W, H);   // vignette
  GROUND = c;
}
export function ground(ctx, lt, seed = 0) {
  if (GROUND) ctx.drawImage(GROUND, 0, 0); else { ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H); }
  const u = ((lt * 60 + seed * 400) % 2600) - 400;                                                           // one slow light sweep
  const g = ctx.createLinearGradient(u, 0, u + 300, 0); g.addColorStop(0, 'rgba(248,222,74,0)'); g.addColorStop(.5, 'rgba(248,222,74,.035)'); g.addColorStop(1, 'rgba(248,222,74,0)');
  ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(u + 140, 0); ctx.lineTo(u + 440, 0); ctx.lineTo(u + 300, H); ctx.lineTo(u, H); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---- brand plate ----
export function plate(ctx, cx, cy, s, o = {}) {
  const w = 520 * s, h = 180 * s, sk = h * .13, a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const pth = (l, r, t, b, k = sk) => { ctx.beginPath(); ctx.moveTo(l + k, t); ctx.lineTo(r + k, t); ctx.lineTo(r - k, b); ctx.lineTo(l - k, b); ctx.closePath(); };
  const L = cx - w / 2, R = cx + w / 2, T = cy - h / 2, B = cy + h / 2;
  const g = ctx.createLinearGradient(0, T, 0, B); g.addColorStop(0, P.lemL); g.addColorStop(1, P.lemD); ctx.fillStyle = g; pth(L, R, T, B); ctx.fill();
  ctx.fillStyle = P.ink; pth(L, L + 22 * s, T, B); ctx.fill(); ctx.fillStyle = P.gold; pth(L + 28 * s, L + 36 * s, T, B); ctx.fill();   // ink and gold bars at the left
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(L + 60 * s, T + 4 * s, w - 90 * s, 3 * s);                                         // top highlight
  const txt = o.text ?? 'NEWS LINE', n = [...txt].length, tx = cx + 22 * s, fs = (o.size ?? 104) * s;
  ctx.font = FC(fs, 800); ctx.letterSpacing = `${4 * s}px`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = P.ink;
  const full = ctx.measureText(txt).width, x0 = tx - full / 2;
  if (o.letters == null) ctx.fillText(txt, x0, cy - (o.sub ? 14 : 0) * s + 4 * s);
  else { let acc = 0; [...txt].forEach((ch, k) => { const p = clamp((o.letters * (n + 3) - k) / 3), cw = ctx.measureText(ch).width; if (p > 0) { ctx.globalAlpha = a * p; ctx.fillText(ch, x0 + acc, cy - (o.sub ? 14 : 0) * s + 4 * s - (1 - p) * 60 * s); } acc += cw; }); ctx.globalAlpha = a; }
  ctx.letterSpacing = '0px';
  if (o.sub && (o.subP ?? 1) > 0) {                                                                                      // wordmark line opens from the centre
    const p = o.subP ?? 1; ctx.save(); ctx.beginPath(); ctx.rect(tx - full / 2 * p - 4, T, full * p + 8, h); ctx.clip();
    ctx.font = FM(19 * s, 500); ctx.letterSpacing = `${3 * s}px`; ctx.textAlign = 'center'; ctx.fillStyle = P.ink; ctx.fillText(o.sub, tx, cy + 52 * s); ctx.letterSpacing = '0px'; ctx.restore();
  }
  if (o.glint != null && o.glint > 0 && o.glint < 1) {                                                                  // glint across the plate
    const gx = lerp(L - 60 * s, R + 60 * s, o.glint); ctx.save(); pth(L, R, T, B); ctx.clip();
    const gg = ctx.createLinearGradient(gx - 50 * s, 0, gx + 50 * s, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.75)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gg; ctx.fillRect(L - 80 * s, T, w + 160 * s, h); ctx.restore();
  }
  ctx.restore();
}
export function ring(ctx, cx, cy, r0, r1, p, col = P.lem, w = 6) {
  if (p <= 0 || p >= 1) return; ctx.save(); ctx.globalAlpha *= 1 - p; ctx.strokeStyle = col; ctx.lineWidth = w * (1 - p * .6); ctx.beginPath(); ctx.ellipse(cx, cy, lerp(r0, r1, eo(p)), lerp(r0, r1, eo(p)) * .55, 0, 0, 7); ctx.stroke(); ctx.restore();
}
export function shake(t, amp = 8, dur = .35) { const u = clamp(t / dur); if (u <= 0 || u >= 1) return [0, 0]; const k = (1 - u) * amp; return [(hash(Math.floor(t * 40)) - .5) * 2 * k, (hash(Math.floor(t * 40) + 99) - .5) * 2 * k]; }
export function glint(ctx, x, y, w, h, p, sk = 30) {
  if (p <= 0 || p >= 1) return; const gx = lerp(x - sk * 2, x + w + sk * 2, p); ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.42)'; ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + 36, y); ctx.lineTo(gx + 36 - sk, y + h); ctx.lineTo(gx - sk, y + h); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---- stamp: lands from 1.9x, double frame, tilt ----
export function stamp(ctx, cx, cy, text, sub, p, o = {}) {
  if (p <= 0) return; const sc = lerp(1.9, 1, eo(clamp(p / .35))), rot = (o.rot ?? -7) * Math.PI / 180, a = clamp(p / .15), fs = o.size ?? 64;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= a;
  ctx.font = F(fs, 900); const w = ctx.measureText(text).width + 80, h = fs * 1.15 + (sub ? 40 : 0) + 30;
  ctx.fillStyle = o.fill ?? P.ink; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeStyle = P.lem; ctx.lineWidth = 6; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24);
  ctx.fillStyle = P.lem; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, sub ? -18 : 2);
  if (sub) { ctx.font = FM(20, 500); ctx.letterSpacing = '4px'; ctx.fillStyle = P.gold; ctx.fillText(sub, 0, fs * .55 + 4); ctx.letterSpacing = '0px'; }
  ctx.restore();
  if (p > .3 && p < .8) ring(ctx, cx, cy, 20, w * .8, (p - .3) / .5, P.lem, 5);
}

// ---- caption card (telop): ink card with accent top edge, or accent / gold / paper solid ----
export function telop(ctx, x, y, w, h, o = {}) {
  const p = o.p ?? 1, fill = o.fill ?? 'ink', bg = { ink: P.ink2, lem: P.lem, gold: P.gold, paper: P.paper, ink3: P.ink3 }[fill] ?? fill, dark = ['lem', 'gold', 'paper'].includes(fill);
  ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 16);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + 6, y + 8, w, h);                                              // drop
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); if (!dark) { ctx.fillStyle = P.lem; ctx.fillRect(x, y, w, 7); ctx.fillStyle = 'rgba(244,241,232,.06)'; ctx.fillRect(x, y + 7, w, 2); }
  if (o.text != null) {
    const col = dark ? P.ink : P.paper, lines = String(o.text).split('\n'), sz = o.size ?? 40, lh = sz * 1.28; ctx.fillStyle = col; ctx.textAlign = o.align === 'l' ? 'left' : 'center'; ctx.textBaseline = 'middle';
    const tx = o.align === 'l' ? x + 30 : x + w / 2, top = y + (dark ? 0 : 7) + (h - (dark ? 0 : 7)) / 2 - (lines.length - 1) * lh / 2 - (o.sub ? 14 : 0);
    lines.forEach((ln, i) => { ctx.font = o.num ? FC(sz, 800) : F(sz, 900); ctx.fillText(ln, tx, top + i * lh); });
    if (o.sub) { ctx.font = FM(Math.max(15, sz * .38), 500); ctx.letterSpacing = '2px'; ctx.fillStyle = dark ? P.olive : P.gold; ctx.fillText(o.sub, tx, y + h - 26); ctx.letterSpacing = '0px'; }
  }
  ctx.restore();
}
export function eyebrow(ctx, x, y, str, p = 1, col = P.gold) { if (p <= 0) return; ctx.save(); ctx.globalAlpha *= p; ctx.font = FM(20, 500); ctx.letterSpacing = '3px'; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore(); }
export function cornerTag(ctx, str, str2, p = 1) {                 // top-left 330 x 64: flips in and out
  if (p <= 0) return; ctx.save(); ctx.translate(96, 56 + 32); ctx.scale(1, clamp(p)); ctx.translate(0, -32);
  ctx.fillStyle = P.ink2; ctx.fillRect(0, 0, 330, 64); ctx.strokeStyle = P.gold; ctx.lineWidth = 2; ctx.strokeRect(1, 1, 328, 62); ctx.fillStyle = P.lem; ctx.fillRect(0, 0, 8, 64);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = P.gold; ctx.font = FM(15, 500); ctx.letterSpacing = '2px'; ctx.fillText(str, 24, 21); ctx.letterSpacing = '0px'; ctx.fillStyle = P.paper; ctx.font = F(20, 700); ctx.fillText(str2, 24, 44); ctx.restore();
}

// ---- lower-third strap ----
// o = { tab:'経済 ECONOMY', head:'...', line:'spoken line' | null, lineP: 0..1 (appear progress of the line), src:'SOURCE: ...', p: strap enter 0..1, tabFlash: 0..1 }
export function strap(ctx, o) {
  const p = o.p ?? 1; if (p <= 0) return; const X = 96, SH = 124, SY = 880, SW = 1380, EB = 120, dy = (1 - eo(p)) * 160;
  ctx.save(); ctx.translate(0, dy);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(X + 6, SY + 8, SW + EB, SH);
  ctx.fillStyle = P.paper; ctx.fillRect(X, SY, SW, SH);                                                              // paper strap
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(X + SW, SY); ctx.lineTo(X + SW + EB, SY); ctx.lineTo(X + SW + EB, SY + SH); ctx.lineTo(X + SW - 28, SY + SH); ctx.closePath(); ctx.fill();   // ink end block
  ctx.fillStyle = P.lem; ctx.beginPath(); ctx.moveTo(X + SW - 8, SY); ctx.lineTo(X + SW + 14, SY); ctx.lineTo(X + SW - 14, SY + SH); ctx.lineTo(X + SW - 36, SY + SH); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.paper; ctx.font = FC(46, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.mark ?? '', X + SW + 62, SY + SH / 2 + 2);
  // tab
  ctx.font = F(26, 900); const tw = ctx.measureText(o.tab.split(' ')[0]).width, tw2 = (() => { ctx.font = FM(16, 500); ctx.letterSpacing = '2px'; const w = ctx.measureText(o.tab.split(' ').slice(1).join(' ')).width; ctx.letterSpacing = '0px'; return w; })();
  const TWd = 56 + tw + 20 + tw2; ctx.fillStyle = o.tabFlash > 0 ? `rgb(${lerp(242, 255, o.tabFlash)},${lerp(207, 255, o.tabFlash)},${lerp(29, 255, o.tabFlash)})` : P.lem; ctx.fillRect(X, SY - 46, TWd, 46);
  ctx.fillStyle = P.ink; ctx.fillRect(X, SY - 46, 10, 46); ctx.textAlign = 'left'; ctx.font = F(26, 900); ctx.fillText(o.tab.split(' ')[0], X + 30, SY - 22);
  ctx.font = FM(16, 500); ctx.letterSpacing = '2px'; ctx.fillText(o.tab.split(' ').slice(1).join(' '), X + 30 + tw + 20, SY - 21); ctx.letterSpacing = '0px';
  // headline (fixed) + changing line
  ctx.fillStyle = P.ink; ctx.font = F(40, 900); ctx.textAlign = 'left'; ctx.fillText(o.head, X + 36, SY + 38);
  ctx.fillStyle = P.lemD; ctx.fillRect(X + 36, SY + 66, 70, 4);
  if (o.line && (o.lineP ?? 1) > 0) {
    const u = o.lineP ?? 1; ctx.save(); ctx.beginPath(); ctx.rect(X, SY + 72, SW - 40, SH - 74); ctx.clip();
    let fs = 33; ctx.font = F(fs, 700); const maxw = SW - 100; const w0 = ctx.measureText(o.line).width; if (w0 > maxw) { fs = Math.max(26, Math.floor(fs * maxw / w0)); }
    ctx.font = F(fs, 700); ctx.fillStyle = '#2b2e34'; ctx.globalAlpha *= clamp(u * 1.6) * (o.lineA ?? 1); ctx.fillText(o.line, X + 36, SY + 98 + (1 - eo(u)) * 34); ctx.restore();
  }
  // source line (right-aligned above the strap end)
  if (o.src) { ctx.font = FM(15, 500); ctx.letterSpacing = '1.5px'; ctx.fillStyle = 'rgba(244,241,232,.78)'; ctx.textAlign = 'right'; ctx.fillText(o.src, X + SW + EB, SY - 22); ctx.letterSpacing = '0px'; }
  ctx.restore();
}

// ---- ticker: crawling strip. items = [{ k:'クレジット', v:'134.6兆円', d: 1 | 0 | -1 }] ----
export function ticker(ctx, x, y, w, h, items, t, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return; ctx.save(); ctx.globalAlpha *= p; ctx.fillStyle = P.ink3; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(244,241,232,.08)'; ctx.fillRect(x, y, w, 2);
  const lab = o.label ?? 'FLASH', lw = 150; ctx.font = FC(34, 800); ctx.letterSpacing = '3px'; ctx.textBaseline = 'middle';
  ctx.save(); ctx.beginPath(); ctx.rect(x + lw, y, w - lw, h); ctx.clip();
  const fs = h * .46, gap = 70; let items2 = items.map(it => { ctx.font = F(fs, 700); const a = ctx.measureText(it.k).width; ctx.font = FC(fs * 1.12, 800); const b = ctx.measureText(it.v).width; return { ...it, w: a + 18 + b + 34 + gap }; });
  const tot = items2.reduce((s, i) => s + i.w, 0), off = (t * (o.speed ?? 110)) % tot; let cx = x + lw + 24 - off;
  for (let rep = 0; rep < 3; rep++) for (const it of items2) {
    if (cx > x + w) break; if (cx + it.w > x + lw) {
      ctx.textAlign = 'left'; ctx.font = F(fs, 700); ctx.fillStyle = P.paper; ctx.fillText(it.k, cx, y + h / 2 + 1); const a = ctx.measureText(it.k).width;
      ctx.font = FC(fs * 1.12, 800); ctx.fillStyle = P.lem; ctx.fillText(it.v, cx + a + 18, y + h / 2 + 1); const b = ctx.measureText(it.v).width;
      if (it.d) { ctx.fillStyle = P.gold; const ax = cx + a + 18 + b + 14, ay = y + h / 2; ctx.beginPath(); if (it.d > 0) { ctx.moveTo(ax, ay - 11); ctx.lineTo(ax + 11, ay + 9); ctx.lineTo(ax - 11, ay + 9); } else { ctx.moveTo(ax, ay + 11); ctx.lineTo(ax + 11, ay - 9); ctx.lineTo(ax - 11, ay - 9); } ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = 'rgba(244,241,232,.25)'; ctx.fillRect(cx + it.w - gap / 2 - 2, y + h * .3, 3, h * .4);
    } cx += it.w;
  }
  ctx.restore(); ctx.letterSpacing = '0px';
  ctx.fillStyle = P.lem; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + lw + 18, y); ctx.lineTo(x + lw - 14, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.ink; ctx.font = FC(34, 800); ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.fillText(lab, x + lw / 2 - 6, y + h / 2 + 2); ctx.letterSpacing = '0px'; ctx.restore();
}

// ---- vertical band wipe (accent 84 + ink 5 + gold 14): cx = band centre, in world coordinates ----
export function bandWipe(ctx, cx, h = H) {
  ctx.fillStyle = P.lem; ctx.fillRect(cx - 42, 0, 84, h); ctx.fillStyle = P.ink; ctx.fillRect(cx + 42, 0, 5, h); ctx.fillStyle = P.gold; ctx.fillRect(cx + 47, 0, 14, h);
  ctx.fillStyle = 'rgba(18,20,23,.28)'; for (let y = -40; y < h + 80; y += 80) { ctx.beginPath(); ctx.moveTo(cx - 14, y); ctx.lineTo(cx + 14, y + 40); ctx.lineTo(cx - 14, y + 80); ctx.lineTo(cx - 28, y + 80); ctx.lineTo(cx, y + 40); ctx.lineTo(cx - 28, y); ctx.closePath(); ctx.fill(); }
}

// ---- split-flap tile: old char -> new char, p 0..1 ----
export function flapTile(ctx, x, y, w, h, oldC, newC, p, fs) {
  ctx.save(); const mid = y + h / 2;
  const half = (c, top) => { ctx.save(); ctx.beginPath(); ctx.rect(x, top ? y : mid, w, h / 2); ctx.clip(); ctx.fillStyle = P.ink3; ctx.fillRect(x, y, w, h); ctx.fillStyle = P.paper; ctx.font = FC(fs, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c, x + w / 2, mid + fs * .04); const g = ctx.createLinearGradient(0, top ? y : mid, 0, top ? mid : y + h); g.addColorStop(0, top ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,.3)'); g.addColorStop(1, top ? 'rgba(0,0,0,.4)' : 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, top ? y : mid, w, h / 2); ctx.restore(); };
  half(newC, true); half(p < .5 ? oldC : newC, false);
  if (p > 0 && p < 1) {
    ctx.save(); ctx.translate(0, mid);
    if (p < .5) { const k = Math.cos(p * Math.PI); ctx.scale(1, Math.max(.001, k)); ctx.translate(0, -mid); half(oldC, true); } else { const k = Math.sin((p - .5) * Math.PI); ctx.scale(1, Math.max(.001, k)); ctx.translate(0, -mid); half(newC, false); }
    ctx.restore();
  }
  ctx.fillStyle = P.ink; ctx.fillRect(x, mid - 2, w, 4); ctx.strokeStyle = 'rgba(244,241,232,.12)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();
}
