// Play-through: drive one full round of a game in the system Chrome and check
// it reaches the hatch with no page errors.
//
//   just playthrough egg                 (or: node scripts/playthrough.mjs egg)
//   node scripts/playthrough.mjs nest --level=6 --size=phone
//   node scripts/playthrough.mjs all     (every registered game with a driver)
//
// Each game is driven by scripts/drivers/<id>.mjs if it exists, otherwise by
// scripts/drivers/tap.mjs (tap the choices in order until one is right, which
// fits any game built on awaitChoice / eggScene). A driver exports
//
//   export async function step(page, ctx) { ... }   // do ONE interaction
//
// The harness calls step() until the hatch appears. ctx has { problem, wrong,
// shot(label) }. Taps that leave a choice greyed out (`.nope`) count as wrong;
// a driver can also add to ctx.wrong itself. The run fails if the round
// doesn't finish, a page error happens, or no wrong answer (so no hint) was
// seen. Screenshots land in playthrough-screens/<game>-L<level>/ (git-ignored).

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const KEY = 'embers-egg-rescue:v2';
const SIZES = { phone: [390, 844], ipad: [1024, 768], laptop: [1440, 900], big: [2560, 1440] };
const MAX_STEPS = 300;

const argv = process.argv.slice(2);
const args = Object.fromEntries(argv.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')));
const target = argv.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('usage: node scripts/playthrough.mjs <game-id|all> [--level=N] [--size=ipad]');
  process.exit(2);
}
const [w, h] = SIZES[args.size ?? 'ipad'];

const server = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: 'chrome' });

// Registered game ids and level counts come from the running app.
const probe = await browser.newPage();
await probe.goto(`${url}?mute&audit`);
const games = await probe.evaluate(() => window.__audit.games());
await probe.close();

const ids = target === 'all' ? games.map((g) => g.id) : [target];
let failed = 0;
for (const id of ids) {
  const g = games.find((x) => x.id === id);
  if (!g) {
    console.error(`✗ ${id}: not a registered game (have: ${games.map((x) => x.id).join(', ')})`);
    failed++;
    continue;
  }
  const level = Number(args.level ?? 1);
  const ok = await playRound(id, level);
  if (!ok) failed++;
}

await browser.close();
await server.close();
process.exit(failed ? 1 : 0);

async function playRound(id, level) {
  const driverPath = new URL(`./drivers/${id}.mjs`, import.meta.url);
  const driver = await import(existsSync(driverPath) ? driverPath : new URL('./drivers/tap.mjs', import.meta.url));
  const outDir = `playthrough-screens/${id}-L${level}`;
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(`${url}?mute&audit`);
  await page.evaluate(
    ({ KEY, id, level }) =>
      localStorage.setItem(KEY, JSON.stringify({
        levels: { [id]: level },
        placed: { egg: true, crates: true, stairs: true, bags: true, stomp: true, nest: true, story: true },
        hatched: [],
        games: {},
      })),
    { KEY, id, level },
  );
  await page.reload();
  await page.evaluate((id) => window.__audit.play(id), id);
  await page.waitForSelector('.skip-btn');
  await page.click('.skip-btn', { force: true });

  let n = 0;
  const ctx = {
    problem: 0,
    wrong: 0,
    shot: (label) => page.screenshot({ path: `${outDir}/${String(++n).padStart(2, '0')}-${label}.png` }),
  };
  const done = () => page.locator('.hatch-stage').count();
  const pipsDone = () => page.locator('.pip.done').count();

  const t0 = Date.now();
  let steps = 0;
  let shotProblem = -1;
  while (!(await done()) && steps < MAX_STEPS && !errors.length) {
    ctx.problem = await pipsDone();
    if (shotProblem !== ctx.problem) {
      await page.waitForTimeout(500);
      await ctx.shot(`p${ctx.problem + 1}`);
      shotProblem = ctx.problem;
    }
    const nopeBefore = await page.locator('.nope').count();
    await driver.step(page, ctx);
    steps++;
    const nopeAfter = await page.locator('.nope').count();
    if (nopeAfter > nopeBefore) {
      ctx.wrong += nopeAfter - nopeBefore;
      await ctx.shot(`p${ctx.problem + 1}-after-hint`);
    }
  }
  if (await done()) await ctx.shot('hatch');
  await page.close();

  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  const problems = [];
  if (steps >= MAX_STEPS) problems.push(`gave up after ${MAX_STEPS} steps`);
  if (errors.length) problems.push(`page errors: ${errors.join(' | ')}`);
  if (!ctx.wrong) problems.push('no wrong answer was tapped, so the hint never ran');
  const reached = n > 0 && existsSync(`${outDir}/${String(n).padStart(2, '0')}-hatch.png`);
  if (!reached) problems.push('did not reach the hatch');

  if (problems.length) {
    console.log(`✗ ${id} L${level}: ${problems.join('; ')} (${steps} steps, ${secs}s) → ${outDir}/`);
    return false;
  }
  console.log(`✓ ${id} L${level}: hatch reached, ${ctx.wrong} wrong tap(s), ${steps} steps, ${secs}s → ${outDir}/`);
  return true;
}
