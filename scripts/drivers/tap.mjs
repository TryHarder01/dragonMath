// Default play-through driver: tap the first open choice. A wrong one greys
// out (`.nope`) after its hint, so tapping in order always ends on the right
// answer and usually hits a wrong one on the way. Fits any game built on
// awaitChoice / eggScene, including two-beat problems.

export async function step(page) {
  const [el] = await page.locator('.tappable:not(.nope):not(.yes)').elementHandles();
  if (!el) {
    await page.waitForTimeout(300); // between problems, or a hint still playing
    return;
  }
  await el.dispatchEvent('pointerdown');
  // Settled: right (.yes) or wrong after its hint (.nope), or the problem moved on.
  await page
    .waitForFunction((e) => !e.isConnected || e.classList.contains('yes') || e.classList.contains('nope'), el, { timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(400);
}
