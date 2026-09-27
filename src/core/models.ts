// Picture models for facts, each with a spoken, animated hint that shows a
// strategy rather than just the answer:
// - addModel / subModel / missingModel: a double ten-frame, so make-ten and
//   "take from ten" are visible.
// - arrayModel: rows × columns of eggs, with a skip-count or split-at-5 hint.
// - groupsModel: equal groups (nests) for first multiplication.

import { h } from './dom';
import { sfx } from './sound';
import { dots } from './visuals';
import { say, wait } from './voice';
import { lines } from './lines';
import { word } from './words';

export interface Model {
  el: HTMLElement;
  /** Animate and narrate the strategy. */
  hint(): Promise<void>;
}

const light = async (el: Element | undefined, n: number, line: string) => {
  el?.classList.add('lit');
  sfx.count(n);
  await say(line, { rate: 1 });
  await wait(60);
};

function frames20(): { el: HTMLElement; cells: HTMLElement[] } {
  const cells: HTMLElement[] = [];
  const frame = () => {
    const f = h('div', 'frame');
    for (let i = 0; i < 10; i++) {
      const c = h('span', 'cell');
      cells.push(c);
      f.append(c);
    }
    return f;
  };
  return { el: h('div', 'frames20', [frame(), frame()]), cells };
}

function put(cell: HTMLElement, cls: string): HTMLElement {
  const d = h('i', `dot ${cls}`);
  cell.replaceChildren(d);
  return d;
}

/** a + b: red a, then yellow b filling the first frame to ten and spilling over. */
export function addModel(a: number, b: number): Model {
  const { el, cells } = frames20();
  for (let i = 0; i < a; i++) put(cells[i], '');
  const second = Array.from({ length: b }, (_, i) => put(cells[a + i], 'two'));
  return {
    el,
    async hint() {
      await say(lines.addStart(a, b));
      for (let i = 0; i < b; i++) await light(second[i], a + i + 1, word(a + i + 1));
      await say(a < 10 && a + b > 10 ? lines.addBridge(a, b) : lines.addSum(a, b));
    },
  };
}

/** a − b: a dots; the hint crosses out b from the end, counting back. */
export function subModel(a: number, b: number): Model {
  const { el, cells } = frames20();
  const ds = Array.from({ length: a }, (_, i) => put(cells[i], ''));
  return {
    el,
    async hint() {
      await say(a > 10 && b > a - 10 ? lines.subBridge(a, b) : lines.subCountBack(a, b));
      for (let i = 0; i < b; i++) {
        const d = ds[a - 1 - i];
        d.classList.add('gone');
        sfx.count(a - i);
        await say(word(a - 1 - i), { rate: 1 });
        await wait(60);
      }
      await say(lines.subResult(a, b));
    },
  };
}

/** a + ? = c: a dots and (c − a) empty rings; the hint fills them, counting on. */
export function missingModel(a: number, c: number): Model {
  const { el, cells } = frames20();
  for (let i = 0; i < a; i++) put(cells[i], '');
  const gaps = Array.from({ length: c - a }, (_, i) => put(cells[a + i], 'ghost'));
  return {
    el,
    async hint() {
      await say(lines.missingStart(a, c));
      for (let i = 0; i < gaps.length; i++) {
        gaps[i].classList.replace('ghost', 'two');
        await light(gaps[i], a + i + 1, word(a + i + 1));
      }
      await say(lines.missingResult(a, c));
    },
  };
}

/** rows × cols eggs. `hidden` rows appear during the hint (missing-factor problems). */
export function arrayModel(rows: number, cols: number, opts: { hidden?: boolean } = {}): Model {
  const grid = h('div', 'egg-array');
  grid.style.setProperty('--cols', String(cols));
  grid.style.setProperty('--size', `${Math.max(12, Math.min(34, Math.floor(260 / Math.max(rows, cols))))}px`);
  const rowEls: HTMLElement[] = [];
  for (let r = 0; r < rows; r++) {
    const row = h('div', `egg-row${opts.hidden ? ' hidden-row' : ''}`);
    for (let c = 0; c < cols; c++) row.append(h('i', 'dot egg-dot'));
    rowEls.push(row);
    grid.append(row);
  }
  const product = rows * cols;
  return {
    el: grid,
    async hint() {
      if (opts.hidden) {
        await say(lines.arrayBuild(cols, product));
        for (let r = 0; r < rows; r++) {
          rowEls[r].classList.remove('hidden-row');
          await light(rowEls[r], r + 1, String((r + 1) * cols));
        }
        await say(lines.arrayBuilt(rows, cols));
        return;
      }
      if (rows >= 6 && rows <= 9) {
        rowEls.slice(0, 5).forEach((r) => r.classList.add('lit'));
        sfx.count(5);
        await say(lines.arrayFive(cols));
        for (let r = 5; r < rows; r++) await light(rowEls[r], r + 1, `${(r + 1) * cols}`);
      } else {
        await say(lines.arrayCountBy(cols));
        for (let r = 0; r < rows; r++) await light(rowEls[r], r + 1, String((r + 1) * cols));
      }
      await say(lines.arrayResult(rows, cols));
    },
  };
}

/** n nests with k eggs each. */
export function groupsModel(n: number, k: number): Model {
  const nests = Array.from({ length: n }, () => h('div', 'nest-group', [dots(k)]));
  return {
    el: h('div', 'groups', nests),
    async hint() {
      await say(lines.groupsCountBy(k));
      for (let i = 0; i < n; i++) await light(nests[i], i + 1, String((i + 1) * k));
      await say(lines.groupsResult(n, k));
    },
  };
}
