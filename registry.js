// Views are built from issue.json (one entry per sheet), not hand-drawn per day.
import { buildView } from './newsviews.js';
const issue = await (await fetch('issue.json')).json();
export const VIEW = {};
const seen = new Set();
for (const s of issue.sheets) {       // same rule as news.py: the first story-like sheet of a genre opens it (cartouche + seal at the top right)
  s.opener = !!s.genre && !seen.has(s.genre) && !['cover', 'outro', 'digest'].includes(s.kind); if (s.opener) seen.add(s.genre);
  VIEW[s.id] = buildView(s);
}
