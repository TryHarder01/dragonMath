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
  'nest-L2': { open: 'play', game: 'nest', level: { nest: 2 }, main: '.ez-target' },
  'nest-L7': { open: 'play', game: 'nest', level: { nest: 7 }, main: '.ez-target' },
  'maketen-L1': { open: 'play', game: 'maketen', level: { maketen: 1 }, main: '.ez-target' },
  'maketen-L4': { open: 'play', game: 'maketen', level: { maketen: 4 }, main: '.ez-target' },
  'maketen-L5': { open: 'play', game: 'maketen', level: { maketen: 5 }, main: '.ez-target' },
  'maketen-L7': { open: 'play', game: 'maketen', level: { maketen: 7 }, main: '.ez-target' },
  'bags-L2-build': { open: 'play', game: 'bags', level: { bags: 2 }, main: '.gem-build-hoard', ready: '.gem-sources' },
  'bags-L3-compare': { open: 'play', game: 'bags', level: { bags: 3 }, main: '.gem-compare', ready: '.gem-dragon' },
  'bags-L6': { open: 'play', game: 'bags', level: { bags: 6 }, main: '.ez-target' },
  'stomp-L1-window': { open: 'play', game: 'stomp', level: { stomp: 1 }, main: '.stomp-path', ready: '.stomp-path.window' },
  'stomp-L2-window': { open: 'play', game: 'stomp', level: { stomp: 2 }, main: '.stomp-path', ready: '.stomp-path.window' },
  'stomp-L3-tens': { open: 'play', game: 'stomp', level: { stomp: 3 }, main: '.stomp-path', ready: '.stomp-path.ruler' },
  'stomp-L4-skip': { open: 'play', game: 'stomp', level: { stomp: 4 }, main: '.stomp-path', ready: '.stomp-path.ruler' },
  'stomp-L5-tens': { open: 'play', game: 'stomp', level: { stomp: 5 }, main: '.stomp-path', ready: '.stomp-path.ruler' },
  'stomp-L6-ruler': { open: 'play', game: 'stomp', level: { stomp: 6 }, main: '.stomp-path', ready: '.stomp-path.open' },
  'stomp-L7-ruler': { open: 'play', game: 'stomp', level: { stomp: 7 }, main: '.stomp-path', ready: '.stomp-path.open' },
  'stomp-L8-estimate': { open: 'play', game: 'stomp', level: { stomp: 8 }, main: '.stomp-path', ready: '.stomp-line-hit' },
  'story-L2': { open: 'play', game: 'story', level: { story: 2 }, main: '.story-stage', ready: '.story-answer .numeral' },
  'story-L5-compare': { open: 'play', game: 'story', level: { story: 5 }, main: '.story-stage', ready: '.story-answer .numeral' },
  'story-L8-sentences': { open: 'play', game: 'story', level: { story: 8 }, main: '.story-sentence-choices', ready: '.story-sentence-card' },
  hatch: { open: 'hatch', hatchIt: true, main: '.hatch-stage' },
  nest: { open: 'nest', main: '.nest-grid', spread: true },
  guide: { open: 'guide', main: '.guide' },
};

// Visible content we measure (not full-size layout containers).
const CONTENT = [
  '.logo', '.intro-ember', '.start-ember', '.start-btn', '.grownups-link', '.map-ember', '.spot', '.nest-btn',
  '.ez-target', '.ez-ember', '.egg', '.skip-btn', '.big-egg', '.hatched-baby', '.baby-name', '.act',
  '.nest-cell', '.nest-title', '.hud-btn', '.pips', '.guide',
  '.stomp-question', '.stomp-path', '.stomp-egg', '.stomp-estimate-reminder',
  '.story-stage', '.story-sentence-card', '.story-answer-ember',
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

// Every registered game counts as placed, so screens open at the level asked for.
const probe = await browser.newPage();
await probe.goto(`${url}?mute&audit`);
const placed = Object.fromEntries((await probe.evaluate(() => window.__audit.games())).map((g) => [g.id, true]));
await probe.close();

// Every screen × size is a job; a pool of pages (each its own storage) works through
// them in parallel. Screens run with ?fast (game pauses ~20× quicker); CSS animations
// still get their real time below. The intro screen stays real-speed so it's still playing.
const queue = sizes.flatMap((size) => Object.entries(SCREENS).filter(([name]) => !only || only.includes(name)).map(([name, s]) => [size, name, s]));
const rows = [];
await Promise.all(Array.from({ length: Math.min(8, queue.length) }, async () => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (let job = queue.shift(); job; job = queue.shift()) rows.push(await auditScreen(page, errors, ...job));
  await page.close();
}));
rows.sort((a, b) => sizes.indexOf(a.size) - sizes.indexOf(b.size) || Object.keys(SCREENS).indexOf(a.screen) - Object.keys(SCREENS).indexOf(b.screen));
const flagged = rows.filter((r) => r.flags !== 'ok').length;

await browser.close();
await server.close();

console.table(rows);
console.log(`\n${flagged} of ${rows.length} screen/size combinations flagged. Screenshots: ${outDir}/`);
process.exit(flagged ? 1 : 0);

async function auditScreen(page, errors, size, name, s) {
  const [w, h] = SIZES[size];
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`${url}?mute&audit${s.skip === false ? '' : '&fast'}`);
  await page.evaluate(
    ({ key, s, placed }) =>
      localStorage.setItem(key, JSON.stringify({
        levels: s.level ?? {},
        placed,
        hatched: ['rex-green', 'saur-blue', 'dragon-red'],
        games: s.state ?? {},
      })),
    { key: KEY, s, placed },
  );
  await page.reload();
  await page.evaluate(({ open, game }) => window.__audit[open](game), s);
  if (s.open === 'play') {
    if (s.skip === false) await page.waitForSelector('.skip-btn');
    else {
      // In fast mode the intro may already be over.
      await page.click('.skip-btn', { force: true, timeout: 2000 }).catch(() => {});
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

    // Content spilling out of (or into the egg band from) its own card: a card
    // can have overflow: hidden, so spilled content is cut off rather than
    // visibly outside it, and the painted egg/clip checks above miss that.
    // Measure every visible descendant's own box instead of trusting what's
    // painted. `.nest-grid` *is* main and scrolls on purpose, so it's exempt,
    // same as it is from the clipped check above.
    const isVisible = (el) => {
      const cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0;
    };
    // Only the outermost offending element per branch is reported: an
    // overflowing child pulls its auto-sized ancestors past the card too, and
    // that's one bug, not several.
    const outermost = (hits) => {
      const set = new Set(hits.map((h) => h.el));
      return hits.filter(({ el }) => {
        for (let p = el.parentElement; p && p !== mainEl; p = p.parentElement) if (set.has(p)) return false;
        return true;
      });
    };
    // Stomp Path centres ticks and the T-rex marker on a point of the path, so
    // at the ends they (and their labels) overhang it by about half their own
    // width. They may overhang by up to their own width; more is a real spill.
    // The "…" (.stomp-more) sits just outside the path by design ("it goes on").
    const STRADDLES = '.stomp-tick, .stomp-marker';
    const OUTSIDE_BY_DESIGN = '.stomp-more';
    const mainKids = mainEl && !mainEl.matches('.nest-grid')
      ? [...mainEl.querySelectorAll('*')].map((el) => ({ el, r: el.getBoundingClientRect() })).filter(({ el, r }) => r.width > 0 && r.height > 0 && isVisible(el) && !el.closest(OUTSIDE_BY_DESIGN))
      : [];
    const spill = mr
      ? outermost(
          mainKids
            .map(({ el, r }) => ({ el, slack: el.closest(STRADDLES) ? r.width : 2, left: mr.left - r.left, top: mr.top - r.top, right: r.right - mr.right, bottom: r.bottom - mr.bottom }))
            .filter(({ slack, left, top, right, bottom }) => Math.max(left, top, right, bottom) > slack)
            .map(({ slack, ...rest }) => rest),
        ).map(({ el, ...d }) => {
          const [side, amt] = Object.entries(d).reduce((a, b) => (b[1] > a[1] ? b : a));
          return `${el.className} (+${Math.round(amt)}px ${side})`;
        })
      : [];
    const eggsBand = document.querySelector('.ez-eggs')?.getBoundingClientRect();
    const bandOverlap = eggsBand
      ? outermost(
          mainKids.filter(({ r }) => {
            const ix = Math.min(r.right, eggsBand.right) - Math.max(r.left, eggsBand.left);
            const iy = Math.min(r.bottom, eggsBand.bottom) - Math.max(r.top, eggsBand.top);
            return ix > 8 && iy > 8;
          }),
        ).map(({ el }) => el.className)
      : [];

    return {
      useW: (u.r - u.l) / vw,
      useH: (u.b - u.t) / vh,
      mainShare: mr ? (mr.width * mr.height) / (vw * vh) : 0,
      cardFill,
      clipped: [...new Set(clipped)],
      overlap,
      spill,
      bandOverlap,
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
  if (m.spill.length) flags.push(`spills out of the card: ${m.spill.join(' | ')}`);
  if (m.bandOverlap.length) flags.push(`spills into the egg band: ${m.bandOverlap.join(' | ')}`);
  if (errors.length) flags.push(`page errors: ${errors.splice(0).join('; ')}`);

  const file = `${outDir}/${size}--${name}.png`;
  await page.screenshot({ path: file });
  return { size, screen: name, width: pct(m.useW), height: pct(m.useH), card: s.main === '.ez-target' ? pct(m.cardFill) : '', flags: flags.join('; ') || 'ok' };
}

function pct(x) {
  return `${Math.round(x * 100)}%`;
}
