// Gem Bags play-through driver. It handles the custom build and compare scenes,
// then falls back to solving the number sentence on answer-egg levels.

async function tapAndSettle(page, locator) {
  const el = await locator.elementHandle();
  await el.dispatchEvent('pointerdown');
  await page.waitForFunction((node) => !node.isConnected || node.classList.contains('nope'), el, { timeout: 30000 });
  await page.waitForTimeout(300);
}

export async function step(page, ctx) {
  const build = page.locator('.gem-build-scene');
  if (await build.count()) {
    const target = Number(await build.getAttribute('data-target'));
    const total = Number(await build.getAttribute('data-total'));
    if (!ctx.buildWrong) {
      ctx.buildWrong = true;
      await page.click('.gem-check');
      ctx.wrong++;
      await page.waitForSelector('.gem-build-scene.hinting');
      await page.waitForSelector('.need');
      await ctx.shot(`p${ctx.problem + 1}-hint`);
      await page.waitForSelector('.gem-build-scene:not(.hinting)');
      return;
    }
    if (total < target) {
      const tens = Number(await build.getAttribute('data-tens'));
      const targetTens = Math.floor(target / 10);
      await page.click(tens < targetTens ? '.gem-bag-source' : '.gem-one-source');
      await page.waitForTimeout(100);
      return;
    }
    await page.click('.gem-check');
    await page.waitForTimeout(500);
    return;
  }

  const compare = page.locator('.gem-compare');
  if (await compare.count()) {
    const choices = page.locator('.gem-dragon-choice:not(.nope):not(.yes)');
    if (!(await choices.count())) {
      await page.waitForTimeout(300);
      return;
    }
    const values = await choices.evaluateAll((els) => els.map((el) => Number(el.dataset.value)));
    const wantWrong = ctx.wrong === 0;
    const desired = wantWrong ? Math.min(...values) : Math.max(...values);
    await tapAndSettle(page, page.locator(`.gem-dragon-choice[data-value="${desired}"]:not(.nope):not(.yes)`).first());
    return;
  }

  const eggs = page.locator('.egg.tappable:not(.nope):not(.yes)');
  if (!(await eggs.count())) {
    await page.waitForTimeout(300);
    return;
  }
  const expression = (await page.locator('.expr').textContent())?.trim() ?? '';
  const match = expression.match(/(\d+)\s*([+−])\s*(\d+)/);
  let answer = match ? (match[2] === '+' ? Number(match[1]) + Number(match[3]) : Number(match[1]) - Number(match[3])) : NaN;
  if (expression === '?') {
    answer = (await page.locator('.ez-target > .gem-hoard .gem-bag').count()) * 10
      + (await page.locator('.ez-target > .gem-hoard .gem-loose').count());
  }
  const values = await eggs.evaluateAll((els) => els.map((el) => Number(el.textContent?.trim())));
  const wantWrong = ctx.wrong === 0;
  const index = wantWrong ? values.findIndex((value) => value !== answer) : values.findIndex((value) => value === answer);
  if (index < 0) throw new Error(`No ${wantWrong ? 'wrong' : 'right'} egg for ${expression}`);
  await tapAndSettle(page, eggs.nth(index));
}
