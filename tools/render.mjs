// Render frames of an episode.
//   node tools/render.mjs episodes/<slug> <outdir> <frames: "a-b" or "1,2,3"> [step=1] [jpegQuality=0.95]
// Serves engine/ as the site root and episodes/<slug>/web/ as /episode/. RESUME=1 skips frames already on disk.
// CHROME=/path/to/chrome uses an installed browser instead of Playwright's Chromium.
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..', 'engine');
const [,, epDir, outdir, spec, step = '1', qual = '0.95'] = process.argv;
if (!epDir || !outdir || !spec) { console.log('usage: node tools/render.mjs episodes/<slug> <outdir> <frames> [step] [quality]'); process.exit(1); }
const ep = path.resolve(epDir, 'web');
fs.mkdirSync(outdir, { recursive: true });
const frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part); }
const TYPES = { '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.html': 'text/html', '.ttf': 'font/ttf' };
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const p = u.startsWith('/episode/') ? path.join(ep, u.slice(9)) : path.join(root, u);
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s);
}).listen(0);
await new Promise((r) => srv.on('listening', r));
const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const [VW, VH] = (process.env.SIZE || '1080x1920').split('x').map(Number);  // SIZE=2560x1440 for a banner still
const pg = await b.newPage({ viewport: { width: VW, height: VH } });
pg.on('console', (m) => { const t = m.text(); if (!/GPU stall|GL Driver|Automatic fallback/.test(t)) console.log('PAGE', t); });
pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html?w=${VW}&h=${VH}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 240000 });
if (await pg.evaluate(() => window.err)) { console.log('page error:', await pg.evaluate(() => window.err)); process.exit(1); }
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const file = path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`);
  if (process.env.RESUME && fs.existsSync(file)) continue;
  const d = await pg.evaluate(([f, q]) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', q); }, [f, +qual]);
  fs.writeFileSync(file, Buffer.from(d.split(',')[1], 'base64')); n++;
  if (n % 50 === 0) console.log(`${n}/${frames.length} frames, ${((Date.now() - t0) / n / 1000).toFixed(2)} s/frame`);
}
console.log(`done ${n} frames, ${n ? ((Date.now() - t0) / n / 1000).toFixed(2) : 0} s/frame`);
await b.close(); srv.close();
