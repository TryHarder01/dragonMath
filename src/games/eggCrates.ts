// Egg Crates: multiplication as equal groups, then arrays, then facts.
// Farmer dinos packed the rescued eggs into crates, row by row. Ember helps
// count them fast by rows, and the child warms the egg with the total.
// Order of facts: ×2 ×10 ×5, then ×3 ×4, then ×6–×9 derived from ×5.
// See docs/research/2026-09-26-right-sizing-advanced-learner.md.

import { nearChoices, pick, rand } from '../core/dom';
import { arrayModel, groupsModel } from '../core/models';
import { word } from '../core/voice';
import { eggScene, productChoices, type EggQuestion } from './eggScene';
import type { Game } from './types';

function groups(): EggQuestion {
  const n = rand(2, 4), k = rand(2, 5);
  return {
    text: `${n} × ${k}`,
    ask: `${word(n)} nests with ${word(k)} eggs each. How many eggs?`,
    answer: n * k,
    choices: productChoices(n, k),
    model: groupsModel(n, k),
    showModel: true,
  };
}

/** One factor from `facts`, the other 1–10; rows × columns, either way round. */
function arr(facts: number[], showModel: boolean, other: [number, number] = [1, 10]): EggQuestion {
  const f = pick(facts), o = rand(...other);
  const [r, c] = Math.random() < 0.5 ? [o, f] : [f, o];
  return {
    text: `${r} × ${c}`,
    ask: showModel ? `${r} rows of ${c} eggs. How many eggs?` : `${r} times ${c}. Warm the egg with the answer!`,
    answer: r * c,
    choices: productChoices(r, c),
    model: arrayModel(r, c),
    showModel,
  };
}

/** ×6–×9 as rows, so the hint can split off 5 rows. */
function big(): EggQuestion {
  const r = rand(6, 9), c = rand(2, 9);
  return {
    text: `${r} × ${c}`,
    ask: `${r} rows of ${c} eggs. How many eggs?`,
    answer: r * c,
    choices: productChoices(r, c),
    model: arrayModel(r, c),
    showModel: true,
  };
}

/** Division as a missing factor: ? × 4 = 20. */
function missingFactor(): EggQuestion {
  const c = pick([2, 3, 4, 5, 10]), r = rand(2, 10);
  return {
    text: `? × ${c} = ${r * c}`,
    ask: `How many rows of ${c} make ${r * c}?`,
    answer: r,
    choices: nearChoices(r, 4, 1, 10),
    model: arrayModel(r, c, { hidden: true }),
    showModel: false,
  };
}

const LEVELS: (() => EggQuestion)[] = [
  groups,
  () => arr([2, 10], true),
  () => arr([5, 5, 2, 10], true),
  () => arr([3, 4], true),
  () => arr([1, 2, 3, 4, 5, 10], false),
  big,
  missingFactor,
  () => (Math.random() < 0.2 ? missingFactor() : arr([2, 3, 4, 5, 6, 7, 8, 9, 10], false, [2, 10])),
];

export const eggCrates: Game = {
  id: 'crates',
  name: 'Egg Crates',
  icon: '🧺',
  skill: 'Multiplication: equal groups, arrays, and the times tables to 10 × 10',
  about:
    'The rescued eggs are packed in crates, row by row. Your child works out how many eggs there are and warms the egg with the answer. Early levels show the eggs so they can skip count ("4, 8, 12"). Later levels are just the fact, with the picture as a hint. Harder facts like 7 × 6 are hinted as "5 rows of 6, plus 2 more rows".',
  levels: [
    'Equal groups: 3 nests of 4 eggs',
    '×2 and ×10, with the egg rows shown',
    '×5 (mixed with ×2 and ×10), with rows shown',
    '×3 and ×4, with rows shown',
    '×1–×5 and ×10, fact only',
    '×6 to ×9, with rows shown (split at 5 rows)',
    'Missing factor: ? × 4 = 20 (first division)',
    'All facts to 10 × 10, mixed',
  ],
  intro: 'Egg Crates! The rescued eggs are packed in rows. Help Ember count them fast!',

  runProblem({ play, level }) {
    return eggScene(play, LEVELS[level - 1]());
  },
};
