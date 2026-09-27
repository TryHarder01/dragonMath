// Egg Stairs: the mental model behind the times tables.
// A table is a staircase: each step adds one more row of the same size, so the
// total grows by the same jump every time. The crate shows each row with its
// running total beside it (3, 6, 9, 12…). One table per level, in four phases:
//   up-low   walk up rows 1–5      "3 rows is 9. One more row of 3?"
//   up-high  walk up rows 6–10     (starts from the 5-row landmark)
//   down     walk down from 10     "10 rows is 30. Take one row away?"
//   jumps    reach a fact from a landmark (5 or 10 rows) without walking
// A clean phase (no misses) skips straight to jumps. Passing jumps with at most
// one miss unlocks the next table. See DESIGN.md §3.

import { h, shuffle } from '../core/dom';
import type { Model } from '../core/models';
import { getGameState, getLevel, setGameState, setLevel, setPlaced } from '../core/progress';
import { sfx } from '../core/sound';
import { say, wait } from '../core/voice';
import { eggScene, type EggQuestion } from './eggScene';
import type { Game } from './types';

const TABLES = [2, 10, 5, 3, 4, 6, 7, 8, 9];
const PHASES = ['up-low', 'up-high', 'down', 'jumps'] as const;
type Phase = (typeof PHASES)[number];

interface Saved {
  table: number;
  phase: Phase;
}

type RowState = 'filled' | 'ghost' | 'leaving';

/** The crate: rows 1..n of `t` eggs, each with an optional running-total label. */
class Crate {
  el = h('div', 'stairs');
  rows: HTMLElement[] = [];
  labels: HTMLElement[] = [];

  constructor(
    private t: number,
    count: number,
  ) {
    this.el.style.setProperty('--cols', String(t));
    this.el.style.setProperty('--size', `${t > 6 ? 18 : 22}px`);
    for (let r = 1; r <= count; r++) {
      const eggs = h('div', 'stairs-eggs');
      for (let c = 0; c < t; c++) eggs.append(h('i', 'dot egg-dot'));
      const label = h('span', 'stairs-label');
      const row = h('div', 'stairs-row', [h('span', 'stairs-num', [String(r)]), eggs, label]);
      this.rows.push(row);
      this.labels.push(label);
      this.el.append(row);
    }
  }

  set(row: number, state: RowState) {
    this.rows[row - 1].classList.remove('filled', 'ghost', 'leaving');
    this.rows[row - 1].classList.add(state);
  }

  label(row: number, text: string, landmark = false) {
    const l = this.labels[row - 1];
    l.textContent = text;
    l.classList.toggle('landmark', landmark);
  }

  hide(row: number) {
    this.rows[row - 1].classList.add('gone-row');
  }

  /** Count on (or back) across the changing rows, dot by dot for small tables. */
  async walk(from: number, to: number) {
    const t = this.t;
    const up = to > from;
    let total = from * t;
    for (let r = up ? from + 1 : from; up ? r <= to : r > to; r += up ? 1 : -1) {
      const row = this.rows[r - 1];
      row.classList.add('lit');
      if (t <= 5) {
        const dots = [...row.querySelectorAll<HTMLElement>('.egg-dot')];
        for (const d of up ? dots : dots.reverse()) {
          total += up ? 1 : -1;
          d.classList.add('lit');
          sfx.count(total % 12);
          await say(String(total), { rate: 1.05 });
        }
      } else {
        total += up ? t : -t;
        sfx.count(r);
        await say(`${up ? 'plus' : 'minus'} ${t} is ${total}`);
      }
      await wait(100);
    }
  }
}

interface Step {
  /** Rows filled and known before the question. */
  from: number;
  /** Row being asked about. */
  to: number;
  /** Which earlier rows show their totals. */
  labelled: number[];
  landmark?: boolean;
}

function question(t: number, s: Step): EggQuestion {
  const size = Math.max(s.from, s.to);
  const crate = new Crate(t, size);
  const up = s.to > s.from;
  for (let r = 1; r <= size; r++) {
    if (r <= Math.min(s.from, s.to)) crate.set(r, 'filled');
    else crate.set(r, up ? 'ghost' : 'leaving');
  }
  for (const r of s.labelled) crate.label(r, String(r * t), s.landmark && r === s.from);
  crate.label(s.to, '?');

  const answer = s.to * t;
  const known = s.from * t;
  const step = Math.abs(s.to - s.from);
  const rowWord = step === 1 ? 'one more row' : `${step} more rows`;
  let ask: string;
  if (s.from === 0) ask = `One row of ${t}. How many eggs?`;
  else if (s.landmark) ask = `You know this. ${s.from} rows of ${t} is ${known}. How many is ${s.to} rows?`;
  else if (up) ask = `${s.from} rows is ${known}. Add ${rowWord} of ${t}. How many now?`;
  else ask = `${s.from} rows is ${known}. Take away ${step === 1 ? 'one row' : `${step} rows`}. How many now?`;

  const model: Model = {
    el: crate.el,
    async hint() {
      if (s.from === 0) await say(`Count the eggs in one row.`);
      else await say(up ? `Start at ${known}. Count on the new ${step === 1 ? 'row' : 'rows'}.` : `Start at ${known}. Count back.`);
      await crate.walk(s.from, s.to);
      await say(`${s.to} rows of ${t} is ${answer}.`);
    },
  };

  const choices = shuffle([answer, ...shuffle([answer - t, answer + t, answer + 1, answer - 1].filter((n) => n > 0)).slice(0, 3)]);
  return {
    text: `${s.to} × ${t}`,
    ask,
    answer,
    choices,
    model,
    showModel: true,
    onSolved() {
      for (let r = 1; r <= size; r++) (r <= s.to ? crate.set(r, 'filled') : crate.hide(r));
      crate.label(s.to, String(answer));
      crate.labels[s.to - 1].classList.add('pop');
    },
  };
}

function steps(phase: Phase): Step[] {
  switch (phase) {
    case 'up-low':
      return [1, 2, 3, 4, 5].map((k) => ({ from: k - 1, to: k, labelled: range(1, k - 1) }));
    case 'up-high':
      return [6, 7, 8, 9, 10].map((k) => ({ from: k - 1, to: k, labelled: range(1, k - 1) }));
    case 'down':
      return [9, 8, 7, 6, 5].map((k) => ({ from: k + 1, to: k, labelled: [k + 1] }));
    case 'jumps':
      return shuffle<[number, number]>([[5, 6], [5, 4], [10, 9], [5, 7], [10, 8], [2, 4], [5, 3]])
        .slice(0, 5)
        .map(([from, to]) => ({ from, to, labelled: [from], landmark: true }));
  }
}

function range(a: number, b: number): number[] {
  return Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
}

// Round state (one table, one phase, five steps).
let table = 2;
let phase: Phase = 'up-low';
let plan: Step[] = [];
let index = 0;
let misses = 0;

function current(): Saved {
  const t = TABLES[getLevel('stairs') - 1];
  const saved = getGameState<Saved>('stairs');
  // A level changed in the parent corner means a new table: start its walk.
  return saved && saved.table === t ? saved : { table: t, phase: 'up-low' };
}

function finishPhase() {
  let next: Saved;
  if (phase === 'jumps') {
    if (misses <= 1) {
      const level = Math.min(getLevel('stairs') + 1, TABLES.length);
      setLevel('stairs', level, TABLES.length);
      setPlaced('stairs');
      next = { table: TABLES[level - 1], phase: 'up-low' };
    } else next = { table, phase: 'jumps' };
  } else if (misses === 0) {
    next = { table, phase: 'jumps' }; // he's got this walk: test it from landmarks
  } else {
    next = { table, phase: PHASES[PHASES.indexOf(phase) + 1] };
  }
  setGameState('stairs', next);
}

export const eggStairs: Game = {
  id: 'stairs',
  name: 'Egg Stairs',
  icon: '🪜',
  ownsLevel: true,
  skill: 'How the times tables work: each step is one more row',
  about:
    'One times table at a time. The crate fills row by row with a running total beside each row (3, 6, 9, 12…), so the table looks like a staircase. Your child walks up it, walks back down, then jumps from a landmark they know ("5 rows of 3 is 15, so 6 rows is…") instead of counting from the start. It builds the understanding that Egg Crates then practises.',
  levels: TABLES.map((t) => `The ×${t} table: walk up, walk down, then jump from 5 and 10`),
  intro: "Egg Stairs! Let's count the rows!",

  startRound() {
    ({ table, phase } = current());
    plan = steps(phase);
    index = 0;
    misses = 0;
  },

  async runProblem({ play }) {
    const s = plan[index];
    const firstTry = await eggScene(play, question(table, s));
    if (!firstTry) misses++;
    if (++index === plan.length) finishPhase();
    return firstTry;
  },
};
