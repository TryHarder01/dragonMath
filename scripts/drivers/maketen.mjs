function answerFor(text) {
  const nums = [...text.matchAll(/\d+/g)].map((m) => Number(m[0]));
  if (text.includes('→')) return text.includes('−') ? nums[0] - nums.at(-1) : nums.at(-1) - nums[0];
  if (text.includes('?')) return nums[0] - nums[1];
  return text.includes('−') ? nums[0] - nums[1] : nums[0] + nums[1];
}

export async function step(page, ctx) {
  if (await page.locator('.egg.yes').count()) {
    await page.waitForTimeout(400);
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
  const waitsForSplit = await page.locator('.make-ten-model[data-split-beat="true"]').count();
  const isSplit = expression.includes('?') && !expression.startsWith('10 =');
  const shouldMiss = !ctx.missed && (!waitsForSplit || isSplit);
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
