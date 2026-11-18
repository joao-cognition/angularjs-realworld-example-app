// Builds parity/report/README.md and side-by-side images (legacy left, Angular right).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const here = path.dirname(new URL(import.meta.url).pathname);
const report = path.join(here, 'report');
const screens = path.join(report, 'screens');
const sbsDir = path.join(report, 'side-by-side');
fs.mkdirSync(sbsDir, { recursive: true });

const results = fs.existsSync(path.join(report, 'results.json'))
  ? JSON.parse(fs.readFileSync(path.join(report, 'results.json'), 'utf8'))
  : { suites: [] };

const rows = new Map();
function walk(suite, file) {
  const f = suite.file || file;
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const key = `${f} › ${spec.title}`;
      const row = rows.get(key) || { file: f, title: spec.title };
      const last = t.results?.[t.results.length - 1];
      row[t.projectName] = t.status === 'skipped' ? 'skipped' : last?.status === 'passed' ? 'pass' : last ? 'FAIL' : '—';
      rows.set(key, row);
    }
  }
  for (const s of suite.suites || []) walk(s, f);
}
for (const s of results.suites || []) walk(s, s.file);

// Keep previously recorded results for a project that was not part of this run.
const prevPath = path.join(report, 'results-merged.json');
const prev = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, 'utf8')) : {};
for (const [key, row] of Object.entries(prev)) {
  const cur = rows.get(key) || { ...row };
  for (const p of ['legacy', 'angular']) if (!cur[p] && row[p]) cur[p] = row[p];
  rows.set(key, cur);
}
fs.writeFileSync(prevPath, JSON.stringify(Object.fromEntries(rows), null, 2));

const names = new Set();
for (const p of ['legacy', 'angular']) {
  const d = path.join(screens, p);
  if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith('.png')) names.add(f);
}

async function panel(file, width) {
  if (fs.existsSync(file)) {
    const img = sharp(file);
    const meta = await img.metadata();
    return { buf: await img.png().toBuffer(), w: meta.width, h: meta.height };
  }
  const h = 400;
  const svg = `<svg width="${width}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" font-size="28" text-anchor="middle" fill="#888" font-family="sans-serif">not migrated yet</text></svg>`;
  return { buf: await sharp(Buffer.from(svg)).png().toBuffer(), w: width, h };
}

const gap = 24;
for (const name of [...names].sort()) {
  const l = await panel(path.join(screens, 'legacy', name), 1280);
  const a = await panel(path.join(screens, 'angular', name), l.w);
  const w = l.w + gap + a.w;
  const h = Math.max(l.h, a.h);
  await sharp({ create: { width: w, height: h, channels: 3, background: '#ffffff' } })
    .composite([{ input: l.buf, left: 0, top: 0 }, { input: a.buf, left: l.w + gap, top: 0 }])
    .png()
    .toFile(path.join(sbsDir, name));
}

const all = [...rows.values()].sort((x, y) => (x.file + x.title).localeCompare(y.file + y.title));
const count = (p) => all.filter((r) => r[p] === 'pass').length;
let md = `# Parity report\n\nSame specs, two apps: \`legacy\` (AngularJS 1.5, http://localhost:4000, hash routes) and \`angular\` (Angular 21, http://localhost:4200).\n\n`;
md += `Legacy: ${count('legacy')}/${all.length} pass · Angular: ${count('angular')}/${all.length} pass\n\n`;
md += `| Spec | Flow | Legacy | Angular |\n|---|---|---|---|\n`;
for (const r of all) md += `| ${r.file} | ${r.title} | ${r.legacy || '—'} | ${r.angular || '—'} |\n`;
md += `\n## Side by side (legacy left, Angular right)\n\n`;
for (const name of [...names].sort()) md += `### ${name.replace('.png', '')}\n\n![${name}](side-by-side/${name})\n\n`;
md += `## Run\n\n\`\`\`bash\ncd parity && npm ci && npx playwright install chromium\nnpx playwright test            # both projects (both apps must be running)\nnpx playwright test --project=legacy\nnpm run report                 # rebuilds this README and side-by-side images\n\`\`\`\n`;
fs.writeFileSync(path.join(report, 'README.md'), md);
console.log(`rows=${all.length} legacy=${count('legacy')} angular=${count('angular')} images=${names.size}`);
