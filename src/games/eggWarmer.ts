// Egg Warmer: addition and (mostly) subtraction facts within 20.
// The eggs got chilly in the storm. Ember reads a number sentence and the child
// warms the egg with the answer. Addition is a warm-up; most levels build
// subtraction step by step, because that's where this player is weak.
// See docs/research/2026-09-26-right-sizing-advanced-learner.md.

import { nearChoices, pick, rand } from '../core/dom';
import { addModel, arrayModel, missingModel, subModel } from '../core/models';
import { lines } from './eggWarmer.lines';
import { eggScene, productChoices, type EggQuestion } from './eggScene';
import type { Game } from './types';

const MINUS = '−';

function add(showModel: boolean): EggQuestion {
  const a = rand(2, 10), b = rand(2, 10);
  return {
    text: `${a} + ${b}`,
    ask: lines.add(a, b),
    answer: a + b,
    choices: nearChoices(a + b, 4, 0, 20),
    model: addModel(a, b),
    showModel,
  };
}

function sub(a: number, b: number, showModel: boolean, takeAway = false): EggQuestion {
  // Include the classic mistake of adding instead, when it fits.
  const choices = nearChoices(a - b, 4, 0, 20);
  if (a + b <= 20 && !choices.includes(a + b)) choices[choices.findIndex((c) => c !== a - b)] = a + b;
  return {
    text: `${a} ${MINUS} ${b}`,
    ask: takeAway ? lines.takeAway(a, b) : lines.sub(a, b),
    answer: a - b,
    choices,
    model: subModel(a, b),
    showModel,
  };
}

/** Take away within 10. */
const subSmall = (show: boolean) => {
  const a = rand(3, 10);
  return sub(a, rand(1, Math.min(5, a - 1)), show, true);
};
/** Teens without crossing ten: 17 − 4. */
const subTeen = (show: boolean) => {
  const a = rand(11, 19);
  return sub(a, rand(1, a - 10), show);
};
/** Crossing ten: 13 − 5. */
const subCross = (show: boolean) => {
  const a = rand(11, 18);
  return sub(a, rand(a - 9, 9), show);
};
const subAny = (show: boolean) => pick([subSmall, subTeen, subCross, subCross])(show);

/** Think addition: 8 + ? = 13. */
function missing(showModel: boolean): EggQuestion {
  const c = rand(11, 18);
  const a = rand(Math.max(3, c - 9), 9);
  return {
    text: `${a} + ? = ${c}`,
    ask: lines.missing(a, c),
    answer: c - a,
    choices: nearChoices(c - a, 4, 1, 12),
    model: missingModel(a, c),
    showModel,
  };
}

function times(): EggQuestion {
  const f = pick([2, 5, 10]), o = rand(1, 10);
  const [r, c] = Math.random() < 0.5 ? [o, f] : [f, o];
  return {
    text: `${r} × ${c}`,
    ask: lines.times(r, c),
    answer: r * c,
    choices: productChoices(r, c),
    model: arrayModel(r, c),
    showModel: false,
  };
}

const LEVELS: (() => EggQuestion)[] = [
  () => add(false),
  () => subSmall(true),
  () => subTeen(true),
  () => missing(true),
  () => subCross(true),
  () => subAny(false),
  () => pick([() => add(false), () => subAny(false), () => missing(false)])(),
  () => pick([() => add(false), () => subAny(false), () => subAny(false), () => missing(false), times])(),
];

export const eggWarmer: Game = {
  id: 'egg',
  name: 'Egg Warmer',
  icon: '🥚',
  skill: 'Adding and subtracting within 20, with extra practice on subtraction',
  about:
    'The eggs got chilly in the storm. Ember says a number sentence (like 13 − 5), and your child warms the egg with the answer so it hatches. Addition is a quick warm-up. Most levels build subtraction step by step. A wrong answer shows the strategy on a double ten-frame: counting on, counting back, or "take away to ten, then the rest".',
  levels: [
    'Addition warm-up within 20',
    'Take away within 10, with a picture',
    'Teens without crossing ten (17 − 4), with a picture',
    'Think addition: 8 + ? = 13, with a picture',
    'Subtract across ten (13 − 5), with a picture',
    'Any subtraction within 20, number sentence only',
    'Mixed + / − / missing numbers within 20',
    'Mixed within 20, plus ×2, ×5 and ×10 facts',
  ],
  intro: lines.intro,

  runProblem({ play, level }) {
    return eggScene(play, LEVELS[level - 1]());
  },
};
