// Nest Builder has a hands-on tuck-in between answer beats. Answer the bridge
// step correctly, deliberately miss the total step so its hint runs, and tap
// pile eggs one at a time when the tuck-in scene is showing.

function answerFor(text) {
  const nums = [...text.matchAll(/\d+/g)].map((m) => Number(m[0]));
  if (text.includes('→')) return text.includes('−') ? nums[0] - nums.at(-1) : nums.at(-1) - nums[0];
  if (text.includes('?')) return nums.at(-1) - nums[0];
  return text.includes('−') ? nums[0] - nums[1] : nums[0] + nums[1];
}

export async function step(page, ctx) {
  if (await page.locator('.egg.yes').count()) {
    await page.waitForTimeout(400); // right-answer narration or the next beat is still settling
    return;
  }

  const pile = page.locator('.nest-pile-egg.tappable');
  if (await pile.count()) {
    if (!ctx.shotTuck) {
      await ctx.shot(`p${ctx.problem + 1}-tuck`);
      ctx.shotTuck = true;
    }
    const egg = await pile.first().elementHandle();
    await egg.dispatchEvent('pointerdown');
    await page.waitForFunction((el) => !el.isConnected, egg, { timeout: 30000 });
    await page.waitForTimeout(200);
    return;
  }

  const open = page.locator('.egg.tappable:not(.nope):not(.yes)');
  if (!(await open.count())) {
    await page.waitForTimeout(300);
    return;
  }

  const expression = await page.locator('.expr').innerText();
  const answer = answerFor(expression);
  const choices = await open.locator('.numeral').allTextContents();
  const isBridgeBeat = expression.includes('→');
  const shouldMiss = !isBridgeBeat && !ctx.missed;
  const wanted = shouldMiss ? choices.find((value) => Number(value) !== answer) : String(answer);
  if (shouldMiss) ctx.missed = true;
  const choice = open.filter({ hasText: new RegExp(`^${wanted}$`) }).first();
  const el = await choice.elementHandle();
  await el.dispatchEvent('pointerdown');
  await page.waitForFunction(
    (node) => !node.isConnected || node.classList.contains('yes') || node.classList.contains('nope'),
    el,
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);
}
