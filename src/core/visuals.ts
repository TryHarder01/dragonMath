// Quantity pictures: dice-pattern dots, ten-frames, and numerals with dots.
// Research rule: at this age a numeral always has a picture of its quantity nearby.

import { h } from './dom';
import { say, wait, word } from './voice';
import { sfx } from './sound';

const DICE: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Dots in a dice layout (1–6), or a ten-frame for bigger numbers. */
export function dots(n: number, cls = ''): HTMLElement {
  if (n > 6) return tenFrame(n, 10, cls);
  const grid = h('div', `dice ${cls}`);
  const on = DICE[n] ?? [];
  for (let i = 0; i < 9; i++) grid.append(h('i', on.includes(i) ? 'dot' : 'dot empty'));
  return grid;
}

/** A 5- or 10-slot frame with `n` counters filled in reading order. */
export function tenFrame(n: number, size: 5 | 10 = 10, cls = ''): HTMLElement {
  const frame = h('div', `frame frame-${size} ${cls}`);
  for (let i = 0; i < size; i++) {
    const cell = h('span', 'cell');
    if (i < n) cell.append(h('i', 'dot'));
    frame.append(cell);
  }
  return frame;
}

/** Big numeral with a small dot picture underneath. */
export function numeralWithDots(n: number, showDots = true): HTMLElement {
  const box = h('div', 'numeral-box', [h('span', 'numeral', [String(n)])]);
  if (showDots) box.append(dots(n, 'mini'));
  return box;
}

/** Light up each dot inside `root` one at a time while counting aloud. */
export async function countAlong(root: HTMLElement, selector = '.dot:not(.empty)', finalLine = true) {
  const items = [...root.querySelectorAll<HTMLElement>(selector)];
  for (let i = 0; i < items.length; i++) {
    items[i].classList.add('lit');
    sfx.count(i + 1);
    await say(word(i + 1), { rate: 1 });
    await wait(80);
  }
  if (finalLine) await say(`${word(items.length)}!`);
  await wait(250);
  items.forEach((el) => el.classList.remove('lit'));
  return items.length;
}
