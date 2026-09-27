// Quantity pictures: dice-pattern dots and ten-frames.
// Research rule: at this age a numeral always has a picture of its quantity nearby.

import { h } from './dom';

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
function tenFrame(n: number, size: 5 | 10 = 10, cls = ''): HTMLElement {
  const frame = h('div', `frame frame-${size} ${cls}`);
  for (let i = 0; i < size; i++) {
    const cell = h('span', 'cell');
    if (i < n) cell.append(h('i', 'dot'));
    frame.append(cell);
  }
  return frame;
}
