// Layout audit: does every screen use the space it has?
//
// Starts the dev server, opens each screen at several window sizes in the
// system Chrome (via Playwright), measures how much of the window the content
// covers, checks for clipping and overlaps, and saves a screenshot of each.
//
//   just audit            (or: node scripts/audit.mjs)
//   node scripts/audit.mjs --only=stairs,hatch --sizes=big,phone
//
// Screenshots land in audit-screens/ (git-ignored). Exit code 1 if anything
// is flagged.

import { mkdirSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const SIZES = {
  phone: [390, 844],
  'ipad-portrait': [820, 1180],
  ipad: [1024, 768],
  laptop: [1440, 900],
  big: [2560, 1440],
  'big-zoomed-out': [2600, 2450], // a large monitor at 70% browser zoom
};

// Each screen: how to open it, and the element that carries the content.
// For game screens, `ready` is the selector that means "the first problem is
// showing" (default: numbered answer eggs). New games add their screens here.
const KEY = 'embers-egg-rescue:v2';
const SCREENS = {
  // spread: content should span the width too (not just a centred column).
  start: { open: 'start', main: '.start-screen' },
  map: { open: 'map', main: '.spots', spread: true },
  intro: { open: 'play', game: 'egg', level: { egg: 5 }, main: '.skip-btn', skip: false },
  'egg-L5': { open: 'play', game: 'egg', level: { egg: 5 }, main: '.ez-target' },
  'stairs-L1-first': { open: 'play', game: 'stairs', level: { stairs: 1 }, state: { stairs: { table: 2, phase: 'up-low' } }, main: '.ez-target' },
  'stairs-L7-tall': { open: 'play', game: 'stairs', level: { stairs: 7 }, state: { stairs: { table: 7, phase: 'up-high' } }, main: '.ez-target' },
  'crates-L6': { open: 'play', game: 'crates', level: { crates: 6 }, main: '.ez-target' },
  hatch: { open: 'hatch', hatchIt: true, main: '.hatch-stage' },
  nest: { open: 'nest', main: '.nest-grid', spread: true },
  guide: { open: 'guide', main: '.guide' },
};

// Visible content we measure (not full-size layout containers).
const CONTENT = [
  '.logo', '.intro-ember', '.start-ember', '.start-btn', '.grownups-link', '.map-ember', '.spot', '.nest-btn',
  '.ez-target', '.ez-ember', '.egg', '.skip-btn', '.big-egg', '.hatched-baby', '.baby-name', '.act',
  '.nest-cell', '.nest-title', '.hud-btn', '.pips', '.guide',
].join(',');

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const only = args.only?.split(',');
const sizes = args.sizes?.split(',') ?? Object.keys(SIZES);
const outDir = 'audit-screens';
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const server = await createServer({ server: { port: 5198, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: 'chrome' });

const rows = [];
let flagged = 0;

for (const size of sizes) {
  const [w, h] = SIZES[size];
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [name, s] of Object.entries(SCREENS)) {
    if (only && !only.includes(name)) continue;
    await page.goto(`${url}?mute&audit`);
    await page.evaluate(
      ({ key, s }) =>
        localStorage.setItem(key, JSON.stringify({
          levels: s.level ?? {},
          placed: { egg: true, crates: true, stairs: true, bags: true, stomp: true, nest: true, story: true },
          hatched: ['rex-green', 'saur-blue', 'dragon-red'],
          games: s.state ?? {},
        })),
      { key: KEY, s },
    );
    await page.reload();
    await page.evaluate(({ open, game }) => window.__audit[open](game), s);
    if (s.open === 'play') {
      await page.waitForSelector('.skip-btn');
      if (s.skip !== false) {
        await page.click('.skip-btn', { force: true });
        await page.waitForSelector(s.ready ?? '.egg .numeral');
      }
    }
    if (s.hatchIt) {
      for (let i = 0; i < 3; i++) await page.dispatchEvent('.big-egg', 'pointerdown');
      await page.waitForSelector('.hatch-actions .act');
    }
    await page.waitForTimeout(700); // fonts, fit, pop-in animations

    const m = await page.evaluate(({ CONTENT, main }) => {
      const vw = innerWidth, vh = innerHeight;
      const rects = [...document.querySelectorAll(CONTENT)]
        .filter((el) => getComputedStyle(el).visibility !== 'hidden')
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0);
      const u = rects.reduce(
        (a, { r }) => ({ l: Math.min(a.l, r.left), t: Math.min(a.t, r.top), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom) }),
        { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity },
      );
      const mainEl = document.querySelector(main);
      const mr = mainEl?.getBoundingClientRect();
      // The question card is scaled to fit the sky; it's using the space if it
      // fills the sky's height or its width (a 7×2 array can only do one).
      const sky = document.querySelector('.ez-sky')?.getBoundingClientRect();
      const cardFill = sky && mr ? Math.max(mr.height / sky.height, mr.width / sky.width) : 1;
      // Clipped: content outside the window (the guide scrolls, so skip it).
      const clipped = rects
        .filter(({ el }) => !el.closest('.guide-screen, .nest-grid'))
        .filter(({ r }) => r.left < -2 || r.top < -2 || r.right > vw + 2 || r.bottom > vh + 2)
        .map(({ el }) => el.className);
      // Eggs covering the question card.
      const card = document.querySelector('.ez-target')?.getBoundingClientRect();
      const overlap = card
        ? [...document.querySelectorAll('.egg')].some((e) => {
            const r = e.getBoundingClientRect();
            const ix = Math.min(r.right, card.right) - Math.max(r.left, card.left);
            const iy = Math.min(r.bottom, card.bottom) - Math.max(r.top, card.top);
            return ix > 8 && iy > 8;
          })
        : false;
      return {
        useW: (u.r - u.l) / vw,
        useH: (u.b - u.t) / vh,
        mainShare: mr ? (mr.width * mr.height) / (vw * vh) : 0,
        cardFill,
        clipped: [...new Set(clipped)],
        overlap,
      };
    }, { CONTENT, main: s.main });

    // What "using the space" means per screen. The question card should be a
    // big share of the window; the other screens should span most of it.
    const flags = [];
    if (m.useH < 0.6) flags.push(`content spans only ${pct(m.useH)} of the height`);
    if (s.spread && m.useW < 0.6) flags.push(`content spans only ${pct(m.useW)} of the width`);
    if (s.main === '.ez-target' && m.cardFill < 0.7) flags.push(`question card fills only ${pct(m.cardFill)} of its space`);
    if (m.clipped.length) flags.push(`clipped: ${m.clipped.join(' | ')}`);
    if (m.overlap) flags.push('an egg covers the question card');
    if (errors.length) flags.push(`page errors: ${errors.splice(0).join('; ')}`);
    flagged += flags.length ? 1 : 0;

    const file = `${outDir}/${size}--${name}.png`;
    await page.screenshot({ path: file });
    rows.push({ size, screen: name, width: pct(m.useW), height: pct(m.useH), card: s.main === '.ez-target' ? pct(m.cardFill) : '', flags: flags.join('; ') || 'ok' });
  }
  await page.close();
}

await browser.close();
await server.close();

console.table(rows);
console.log(`\n${flagged} of ${rows.length} screen/size combinations flagged. Screenshots: ${outDir}/`);
process.exit(flagged ? 1 : 0);

function pct(x) {
  return `${Math.round(x * 100)}%`;
}
