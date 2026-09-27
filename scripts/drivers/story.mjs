// Dino Story has two awaitChoice surfaces: number-sentence cards and answer
// eggs. Miss once on the first surface, then use the data marker to finish
// each beat without making the long narrated hints repeat unnecessarily.

export async function step(page, ctx) {
  const open = page.locator('.tappable:not(.nope):not(.yes)');
  if (!(await open.count())) {
    await page.waitForTimeout(300);
    return;
  }

  const choice = ctx.problem === 0 && ctx.wrong === 0
    ? page.locator('.tappable[data-correct="false"]:not(.nope):not(.yes)').first()
    : page.locator('.tappable[data-correct="true"]:not(.nope):not(.yes)').first();
  const target = await (await choice.count() ? choice : open.first()).elementHandle();
  await target.dispatchEvent('pointerdown');
  await page
    .waitForFunction((el) => !el.isConnected || el.classList.contains('yes') || el.classList.contains('nope'), target, { timeout: 45000 })
    .catch(() => {});
  await page.waitForTimeout(350);
}
