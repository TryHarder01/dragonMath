// Play-through: drive one full round of a game in the system Chrome and check
// it reaches the hatch with no page errors.
//
//   just playthrough egg                 (or: node scripts/playthrough.mjs egg)
//   node scripts/playthrough.mjs nest --level=6 --size=phone
//   node scripts/playthrough.mjs all --level=all   (every game × every level)
//
// Rounds run in parallel (--jobs=N, default 6), each in its own browser
// context so saved levels don't collide. By default the game runs with ?fast
// (speech and waits sped up ~20×); pass --real to play at real speed, e.g. for
// screenshots that show the end of every animation.
//
// Each game is driven by scripts/drivers/<id>.mjs if it exists, otherwise by
// scripts/drivers/tap.mjs (tap the choices in order until one is right, which
// fits any game built on awaitChoice / eggScene). A driver exports
//
//   export async function step(page, ctx) { ... }   // do ONE interaction
//
// The harness calls step() until the hatch appears. ctx has { problem, wrong,
// shot(label) }. Keep any per-round state on ctx, not in module variables:
// rounds run in parallel and share one copy of the driver module. Taps that leave a choice greyed out (`.nope`) count as wrong;
// a driver can also add to ctx.wrong itself. The run fails if the round
// doesn't finish, a page error happens, or no wrong answer (so no hint) was
// seen. Screenshots land in playthrough-screens/<game>-L<level>/ (git-ignored).

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const KEY = 'embers-egg-rescue:v2';
const SIZES = { phone: [390, 844], ipad: [1024, 768], laptop: [1440, 900], big: [2560, 1440] };
const MAX_STEPS = 300;

const argv = process.argv.slice(2);
const args = Object.fromEntries(argv.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')));
const target = argv.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('usage: node scripts/playthrough.mjs <game-id|all> [--level=N|all] [--size=ipad] [--jobs=6] [--real]');
  process.exit(2);
}
const [w, h] = SIZES[args.size ?? 'ipad'];
const fast = !('real' in args);
const jobs = Number(args.jobs ?? Math.max(2, Math.min(6, availableParallelism() - 2)));

const server = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const query = `?mute&audit${fast ? '&fast' : ''}`;
const browser = await chromium.launch({ channel: 'chrome' });

// Registered game ids and level counts come from the running app.
const probe = await browser.newPage();
await probe.goto(`${url}${query}`);
const games = await probe.evaluate(() => window.__audit.games());
await probe.close();

const queue = [];
let failed = 0;
for (const id of target === 'all' ? games.map((g) => g.id) : [target]) {
  const g = games.find((x) => x.id === id);
  if (!g) {
    console.error(`✗ ${id}: not a registered game (have: ${games.map((x) => x.id).join(', ')})`);
    failed++;
    continue;
  }
  const levels = args.level === 'all' ? Array.from({ length: g.levels }, (_, i) => i + 1) : [Number(args.level ?? 1)];
  for (const level of levels) queue.push([id, level]);
}

const t0 = Date.now();
await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
  for (let job = queue.shift(); job; job = queue.shift()) {
    const ok = await playRound(...job).catch((e) => {
      console.log(`✗ ${job[0]} L${job[1]}: ${e.message.split('\n')[0]}`);
      return false;
    });
    if (!ok) failed++;
  }
}));
console.log(`${failed ? '✗' : '✓'} ${failed} failed · ${((Date.now() - t0) / 1000).toFixed(0)}s${fast ? '' : ' (real speed)'}`);

await browser.close();
await server.close();
process.exit(failed ? 1 : 0);

async function playRound(id, level) {
  const driverPath = new URL(`./drivers/${id}.mjs`, import.meta.url);
  const driver = await import(existsSync(driverPath) ? driverPath : new URL('./drivers/tap.mjs', import.meta.url));
  const outDir = `playthrough-screens/${id}-L${level}`;
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const context = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await context.newPage();
  page.setDefaultTimeout(fast ? 5000 : 30000);
  // Drivers pause with page.waitForTimeout; in fast mode the game is ~20× quicker, so they can be too.
  if (fast) {
    const pause = page.waitForTimeout.bind(page);
    page.waitForTimeout = (ms) => pause(Math.ceil(ms / 10));
  }
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(`${url}${query}`);
  await page.evaluate(
    ({ KEY, id, level }) =>
      localStorage.setItem(KEY, JSON.stringify({
        levels: { [id]: level },
        placed: { egg: true, crates: true, stairs: true, bags: true, stomp: true, nest: true, maketen: true, story: true },
        hatched: [],
        games: {},
      })),
    { KEY, id, level },
  );
  await page.reload();
  await page.evaluate((id) => window.__audit.play(id), id);
  // Skip the intro if it's still playing (in fast mode it may already be over).
  await page.click('.skip-btn', { force: true, timeout: 2000 }).catch(() => {});

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
  const deadline = t0 + (fast ? 90_000 : 600_000);
  while (!(await done()) && steps < MAX_STEPS && !errors.length && Date.now() < deadline) {
    ctx.problem = await pipsDone();
    if (shotProblem !== ctx.problem) {
      await page.waitForTimeout(500);
      await ctx.shot(`p${ctx.problem + 1}`);
      shotProblem = ctx.problem;
    }
    const nopeBefore = await page.locator('.nope').count();
    try {
      await driver.step(page, ctx);
    } catch (e) {
      // A choice can vanish between a driver finding it and tapping it (the game moved on):
      // that's a timeout, so just take the next step. Real hangs hit the deadline below.
      if (e.name !== 'TimeoutError') errors.push(`driver: ${e.message.split('\n')[0]}`);
    }
    steps++;
    const nopeAfter = await page.locator('.nope').count();
    if (nopeAfter > nopeBefore) {
      ctx.wrong += nopeAfter - nopeBefore;
      await ctx.shot(`p${ctx.problem + 1}-after-hint`);
    }
  }
  if (await done()) await ctx.shot('hatch');
  await context.close();

  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  const problems = [];
  if (steps >= MAX_STEPS || Date.now() >= deadline) problems.push(`gave up after ${steps} steps`);
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
