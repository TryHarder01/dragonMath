// Nest Builder: make-ten and bridge-through-ten practice for addition and
// subtraction. Each nest holds ten eggs, so the child performs the bridge as
// a visible step instead of only seeing it in a hint.

import { h, nearChoices, pick, rand } from '../core/dom';
import type { Model } from '../core/models';
import { sfx } from '../core/sound';
import { prompt, say, wait, word } from '../core/voice';
import { eggScene, type EggQuestion } from './eggScene';
import type { Game } from './types';

const MINUS = '−';

type NestKind = 'fill' | 'add-small' | 'next-ten' | 'add-big' | 'sub-small' | 'sub-big';

export interface NestAnswer {
  answer: number;
  choices: number[];
}

interface NestProblem {
  kind: NestKind;
  a: number;
  b?: number;
  beats: NestAnswer[];
  oneBeat: boolean;
}

export function choicesWithMistake(answer: number, min: number, max: number, mistake?: number): number[] {
  const choices = nearChoices(answer, 4, min, max);
  if (mistake !== undefined && mistake >= min && mistake <= max && mistake !== answer && !choices.includes(mistake)) {
    choices[choices.findIndex((n) => n !== answer)] = mistake;
  }
  return choices;
}

function fillProblem(): NestProblem {
  const a = rand(1, 9);
  const answer = 10 - a;
  return {
    kind: 'fill', a, oneBeat: true,
    beats: [{ answer, choices: choicesWithMistake(answer, 1, 10, a) }],
  };
}

export function addProblem(kind: 'add-small' | 'add-big', a: number, b: number, oneBeat: boolean, max: number): NestProblem {
  const bridge = Math.ceil(a / 10) * 10 - a;
  const rest = b - bridge;
  return {
    kind, a, b, oneBeat,
    beats: oneBeat
      ? [{ answer: a + b, choices: choicesWithMistake(a + b, 0, max, rest) }]
      : [
          { answer: bridge, choices: choicesWithMistake(bridge, 1, 9, b) },
          { answer: a + b, choices: choicesWithMistake(a + b, 0, max, rest) },
        ],
  };
}

function addSmall(oneBeat: boolean): NestProblem {
  const a = rand(6, 9);
  const b = rand(11 - a, 9);
  return addProblem('add-small', a, b, oneBeat, 20);
}

function nextTenProblem(): NestProblem {
  const a = rand(1, 8) * 10 + rand(1, 9);
  const answer = Math.ceil(a / 10) * 10 - a;
  return {
    kind: 'next-ten', a, oneBeat: true,
    beats: [{ answer, choices: choicesWithMistake(answer, 1, 10, a % 10) }],
  };
}

function addBig(oneBeat: boolean): NestProblem {
  const a = rand(1, 8) * 10 + rand(2, 9);
  const bridge = Math.ceil(a / 10) * 10 - a;
  const b = rand(bridge + 1, 9);
  return addProblem('add-big', a, b, oneBeat, 99);
}

function subSmall(oneBeat: boolean): NestProblem {
  const a = rand(11, 18);
  const b = rand(a - 9, 9);
  return subProblem('sub-small', a, b, oneBeat, 20);
}

function subBig(oneBeat: boolean): NestProblem {
  const a = rand(2, 9) * 10 + rand(1, 8);
  const b = rand(a % 10 + 1, 9);
  return subProblem('sub-big', a, b, oneBeat, 99);
}

function subProblem(kind: 'sub-small' | 'sub-big', a: number, b: number, oneBeat: boolean, max: number): NestProblem {
  const ones = a % 10;
  const final = a - b;
  const commonMistake = Math.floor(a / 10) * 10 + (b - ones);
  return {
    kind, a, b, oneBeat,
    beats: oneBeat
      ? [{ answer: final, choices: choicesWithMistake(final, 0, max, commonMistake) }]
      : [
          { answer: ones, choices: choicesWithMistake(ones, 1, 9, commonMistake) },
          { answer: final, choices: choicesWithMistake(final, 0, max, commonMistake) },
        ],
  };
}

function mixedProblem(): NestProblem {
  return pick([
    () => addSmall(true),
    () => addBig(true),
    () => subSmall(true),
    () => subSmall(true),
    () => subBig(true),
    () => subBig(true),
  ])();
}

const LEVELS = [
  fillProblem,
  () => addSmall(false),
  () => addSmall(true),
  nextTenProblem,
  () => addBig(false),
  () => subSmall(false),
  () => subBig(false),
  mixedProblem,
];

function tenFrame(cls = ''): { el: HTMLElement; cells: HTMLElement[] } {
  const cells: HTMLElement[] = [];
  const el = h('div', `nest-frame ${cls}`.trim());
  for (let i = 0; i < 10; i++) {
    const cell = h('span', 'nest-frame-cell');
    cells.push(cell);
    el.append(cell);
  }
  return { el, cells };
}

function eggDot(cls = ''): HTMLElement {
  return h('i', `dot egg-dot ${cls}`.trim());
}

export interface NestModel {
  el: HTMLElement;
  fillTo10(): Promise<void>;
  spill(n: number): Promise<void>;
  hatchTo(target: number): Promise<void>;
  prepareOpenTuck(ones: number): void;
  tuckTarget(where: 'open' | 'spill'): HTMLElement;
  tuckOne(where: 'open' | 'spill'): Promise<number>;
}

/** Full-nest tiles plus the active ten-frame and one spill-over frame. */
export function nestModel({ tens, ones }: { tens: number; ones: number }): NestModel {
  const tiles = h('div', 'nest-full-tiles');
  const tileEls: HTMLElement[] = [];
  for (let t = 0; t < tens; t++) {
    const mini = tenFrame('mini');
    mini.cells.forEach((cell) => cell.append(eggDot()));
    const tile = h('div', 'nest-full-tile', [mini.el, h('span', 'nest-ten-badge', ['10'])]);
    tileEls.push(tile);
    tiles.append(tile);
  }

  const open = tenFrame('nest-open-frame');
  const overflow = tenFrame('nest-spill-frame');
  let fullTens = tens;
  let openCount = ones;
  let spillCount = 0;
  for (let i = 0; i < ones; i++) open.cells[i].append(eggDot());

  const el = h('div', 'nest-model', [tiles, h('div', 'nest-working', [open.el, overflow.el])]);

  const total = () => fullTens * 10 + openCount + spillCount;

  async function countAt(cell: HTMLElement, n: number) {
    cell.querySelector('.dot')!.classList.add('lit');
    sfx.count(n);
    await say(word(n), { rate: 1 });
    await wait(60);
  }

  async function fillTo10() {
    while (openCount < 10) {
      const cell = open.cells[openCount];
      cell.replaceChildren(eggDot('two'));
      openCount++;
      await countAt(cell, total());
    }
  }

  async function spill(n: number) {
    while (spillCount < n) {
      const cell = overflow.cells[spillCount];
      cell.replaceChildren(eggDot('two'));
      spillCount++;
      await countAt(cell, total());
    }
  }

  async function openFullNest() {
    if (openCount > 0 || fullTens === 0) return;
    const tile = tileEls[fullTens - 1];
    tile.classList.add('opening');
    await wait(220);
    tile.classList.add('used');
    fullTens--;
    for (const cell of open.cells) cell.replaceChildren(eggDot());
    openCount = 10;
    open.el.classList.add('opened');
  }

  async function hatchTo(target: number) {
    while (total() > target) {
      await openFullNest();
      const cell = open.cells[openCount - 1];
      const chick = h('span', 'nest-chick walk-home', ['🐣']);
      cell.replaceChildren(chick);
      openCount--;
      const n = total();
      sfx.count(n);
      await say(word(n), { rate: 1 });
      await wait(220);
      cell.replaceChildren();
    }
  }

  function prepareOpenTuck(startingOnes: number) {
    openCount = startingOnes;
    for (let i = startingOnes; i < 10; i++) open.cells[i].replaceChildren();
  }

  function tuckTarget(where: 'open' | 'spill') {
    return where === 'open' ? open.cells[openCount] : overflow.cells[spillCount];
  }

  async function tuckOne(where: 'open' | 'spill') {
    const cell = tuckTarget(where);
    cell.replaceChildren(eggDot('two'));
    if (where === 'open') openCount++;
    else spillCount++;
    const n = total();
    await countAt(cell, n);
    return n;
  }

  return { el, fillTo10, spill, hatchTo, prepareOpenTuck, tuckTarget, tuckOne };
}

function withHint(nest: NestModel, hint: () => Promise<void>): Model {
  return { el: nest.el, hint };
}

export function question(
  text: string,
  ask: string,
  beat: NestAnswer,
  nest: NestModel,
  hint: () => Promise<void>,
  showModel: boolean,
  onSolved?: () => Promise<void>,
): EggQuestion {
  return { text, ask, answer: beat.answer, choices: beat.choices, model: withHint(nest, hint), showModel, onSolved };
}

async function tuckIn(play: HTMLElement, nest: NestModel, count: number, where: 'open' | 'spill') {
  const pile = h('div', 'nest-pile');
  const buttons = Array.from({ length: count }, () => {
    const egg = h('button', 'nest-pile-egg tappable', ['🥚']);
    egg.setAttribute('aria-label', 'Tuck in an egg');
    pile.append(egg);
    return egg;
  });
  const scene = h('div', 'nest-tuck-scene', [h('div', 'nest-tuck-ember', ['🐉']), nest.el, pile]);
  play.replaceChildren(scene);
  void prompt('Tuck them in!');

  await new Promise<void>((resolve) => {
    let tucked = 0;
    let busy = false;
    for (const egg of buttons) {
      egg.addEventListener('pointerdown', async (event) => {
        event.preventDefault();
        if (busy) return;
        busy = true;
        sfx.tap();
        const from = egg.getBoundingClientRect();
        const to = nest.tuckTarget(where).getBoundingClientRect();
        egg.style.setProperty('--tuck-x', `${to.left + to.width / 2 - from.left - from.width / 2}px`);
        egg.style.setProperty('--tuck-y', `${to.top + to.height / 2 - from.top - from.height / 2}px`);
        egg.classList.add('moving');
        await wait(320);
        await nest.tuckOne(where);
        egg.remove();
        tucked++;
        busy = false;
        if (tucked === buttons.length) resolve();
      });
    }
  });
}

async function runFill(play: HTMLElement, plan: NestProblem): Promise<boolean> {
  const nest = nestModel({ tens: 0, ones: plan.a });
  const bridge = plan.beats[0].answer;
  const firstTry = await eggScene(play, question(
    `${plan.a} + ? = 10`,
    `${word(plan.a)} in the nest. How many fill the nest?`,
    plan.beats[0], nest,
    async () => {
      await say("Let's count.");
      await nest.fillTo10();
      await say(`That's ${word(bridge)} more.`);
    }, true,
  ));
  nest.prepareOpenTuck(plan.a);
  await tuckIn(play, nest, bridge, 'open');
  await say('You filled the nest first!');
  return firstTry;
}

async function runAdd(play: HTMLElement, plan: NestProblem, showModel: boolean): Promise<boolean> {
  const b = plan.b!;
  const nextTen = Math.ceil(plan.a / 10) * 10;
  const bridge = nextTen - plan.a;
  const rest = b - bridge;
  const nest = nestModel({ tens: Math.floor(plan.a / 10), ones: plan.a % 10 });
  const explain = async () => {
    await say("Let's count.");
    await nest.fillTo10();
    await nest.spill(rest);
    await say(`${word(plan.a)} and ${word(bridge)}. ${word(nextTen)}! ${word(nextTen)} and ${word(rest)}. ${word(plan.a + b)}!`);
  };

  if (plan.oneBeat) {
    return eggScene(play, question(
      `${plan.a} + ${b}`,
      `${word(plan.a)} plus ${word(b)}. Warm the egg with the answer!`,
      plan.beats[0], nest, explain, showModel,
      async () => {
        if (nest.el.isConnected) {
          await nest.fillTo10();
          await nest.spill(rest);
        }
        await say('You filled the nest first!');
      },
    ));
  }

  const isSmall = plan.kind === 'add-small';
  const first = await eggScene(play, question(
    `${plan.a} + ${b} → ${nextTen}`,
    isSmall
      ? `${word(plan.a)} plus ${word(b)}. How many fill the nest?`
      : `${word(plan.a)} plus ${word(b)}. How many more to make ${word(nextTen)}?`,
    plan.beats[0], nest,
    async () => {
      await say("Let's count.");
      await nest.fillTo10();
      await say(`That's ${word(bridge)} more.`);
    }, true,
    () => nest.fillTo10(),
  ));

  if (isSmall) await tuckIn(play, nest, rest, 'spill');
  play.replaceChildren();
  const second = await eggScene(play, question(
    `${nextTen} + ${rest}`,
    isSmall
      ? `The nest is full! Ten and ${word(rest)} more. How many?`
      : `${word(nextTen)} and ${word(rest)} more?`,
    plan.beats[1], nest, explain, true,
    async () => {
      await nest.spill(rest);
      await say('You filled the nest first!');
    },
  ));
  return first && second;
}

async function runNextTen(play: HTMLElement, plan: NestProblem): Promise<boolean> {
  const target = Math.ceil(plan.a / 10) * 10;
  const answer = plan.beats[0].answer;
  const nest = nestModel({ tens: Math.floor(plan.a / 10), ones: plan.a % 10 });
  return eggScene(play, question(
    `${plan.a} + ? = ${target}`,
    `${word(plan.a)}. How many more to make ${word(target)}?`,
    plan.beats[0], nest,
    async () => {
      await say("Let's count.");
      await nest.fillTo10();
      await say(`That's ${word(answer)} more.`);
    }, true,
    async () => {
      await nest.fillTo10();
      await say('You filled the nest first!');
    },
  ));
}

async function runSub(play: HTMLElement, plan: NestProblem, showModel: boolean): Promise<boolean> {
  const b = plan.b!;
  const ones = plan.a % 10;
  const target = plan.a - ones;
  const rest = b - ones;
  const final = plan.a - b;
  const nest = nestModel({ tens: Math.floor(plan.a / 10), ones });
  const explain = async () => {
    await say("Let's count.");
    await nest.hatchTo(target);
    await nest.hatchTo(final);
    await say(`${word(plan.a)} minus ${word(ones)}. ${word(target)}! ${word(target)} minus ${word(rest)}. ${word(final)}!`);
  };

  if (plan.oneBeat) {
    return eggScene(play, question(
      `${plan.a} ${MINUS} ${b}`,
      `${word(plan.a)} minus ${word(b)}. Warm the egg with the answer!`,
      plan.beats[0], nest, explain, showModel,
      async () => {
        if (nest.el.isConnected) await nest.hatchTo(final);
        await say(`Down to ${word(target)}, then the rest!`);
      },
    ));
  }

  const first = await eggScene(play, question(
    `${plan.a} ${MINUS} ${b} → ${target}`,
    `${word(plan.a)} in the nest. Some babies hatch and walk home. How many get down to ${word(target)}?`,
    plan.beats[0], nest,
    async () => {
      await say("Let's count.");
      await nest.hatchTo(target);
      await say(`${word(ones)} walked home. Now we're at ${word(target)}.`);
    }, true,
    () => nest.hatchTo(target),
  ));

  play.replaceChildren();
  const second = await eggScene(play, question(
    `${target} ${MINUS} ${rest}`,
    `Now ${word(rest)} more from ${word(target)}. How many are left?`,
    plan.beats[1], nest, explain, true,
    async () => {
      await nest.hatchTo(final);
      await say(`Down to ${word(target)}, then the rest!`);
    },
  ));
  return first && second;
}

export const nestBuilder: Game = {
  id: 'nest',
  name: 'Nest Builder',
  icon: '🪺',
  skill: 'Make-ten strategies for adding and subtracting, including with bigger numbers',
  about:
    'Every nest holds ten eggs. Your child solves problems like 8 + 5 in two steps: first fill the nest (8 + 2 = 10), then add the rest (10 + 3 = 13). Subtraction works the same way in reverse: 13 − 5 is "down to ten" (13 − 3), then the rest (10 − 2). The same steps work for 38 + 5 and 43 − 5. This is the strategy behind fast mental maths, and it gives extra practice with subtraction.',
  levels: [
    'Fill the nest: how many more to make 10',
    'Add across ten in two steps (8 + 5 → 10 → 13)',
    'Add across ten in one step, with the nests shown',
    'Bigger numbers: how many more to the next ten (38 → 40)',
    'Add across a ten with bigger numbers (38 + 5 → 40 → 43)',
    'Subtract across ten in two steps (13 − 5 → 10 → 8)',
    'Subtract across a ten with bigger numbers (43 − 5 → 40 → 38)',
    'Mixed adding and subtracting across ten',
  ],
  intro: "Nest Builder! Let's fill the nests!",

  runProblem({ play, level }) {
    const plan = LEVELS[level - 1]();
    switch (plan.kind) {
      case 'fill': return runFill(play, plan);
      case 'add-small': return runAdd(play, plan, level !== 8);
      case 'next-ten': return runNextTen(play, plan);
      case 'add-big': return runAdd(play, plan, level !== 8);
      case 'sub-small': return runSub(play, plan, level !== 8);
      case 'sub-big': return runSub(play, plan, level !== 8);
    }
  },
};
