// Stomp Path has three interactions: answer eggs, a foot pressed once per
// one-hop, and an estimation line. Make one deliberate miss so every run
// exercises a hint, then choose exact answers for the remaining problems.

export async function step(page, ctx) {
  const retry = page.locator('.stomp-true-spot.tappable');
  if (await retry.count()) {
    await retry.dispatchEvent('pointerdown');
    await page.waitForTimeout(500);
    return;
  }

  const line = page.locator('.stomp-line-hit.tappable');
  if (await line.count()) {
    const target = Number(await line.getAttribute('data-target'));
    const box = await line.boundingBox();
    if (!box) throw new Error('estimation line is not visible');
    const wrong = ctx.wrong === 0;
    const pct = wrong ? (target > 50 ? .05 : .95) : target / 100;
    await page.mouse.click(box.x + box.width * pct, box.y + box.height / 2);
    if (wrong) ctx.wrong++;
    if (wrong) await page.waitForSelector('.stomp-true-spot.tappable', { timeout: 30000 });
    else await page.waitForTimeout(800);
    if (wrong) await ctx.shot(`p${ctx.problem + 1}-after-hint`);
    return;
  }

  const foot = page.locator('.stomp-foot.tappable');
  if (await foot.count()) {
    await foot.dispatchEvent('pointerdown');
    await page.waitForTimeout(900);
    return;
  }

  const eggs = page.locator('.stomp-egg.tappable:not(.nope):not(.yes)');
  if (await eggs.count()) {
    const answer = await eggs.first().getAttribute('data-answer');
    let picked = page.locator(`.stomp-egg.tappable[data-value="${answer}"]`);
    if (ctx.wrong === 0) {
      for (let i = 0; i < await eggs.count(); i++) {
        const candidate = eggs.nth(i);
        if (await candidate.getAttribute('data-value') !== answer) { picked = candidate; break; }
      }
    }
    const handle = await picked.elementHandle();
    if (!handle) throw new Error('answer egg disappeared before the tap');
    await handle.dispatchEvent('pointerdown');
    await page.waitForFunction(
      (el) => !el.isConnected || el.classList.contains('yes') || el.classList.contains('nope'),
      handle,
      { timeout: 30000 },
    );
    await page.waitForTimeout(500);
    return;
  }

  await page.waitForTimeout(300);
}
