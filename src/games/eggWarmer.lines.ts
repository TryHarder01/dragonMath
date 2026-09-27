// Egg Warmer's spoken lines. See "How Ember talks" in AGENTS.md; `just check` checks them.

import { word } from '../core/words';

export const lines = {
  intro: "Egg Warmer! Let's warm the eggs!",
  add: (a: number, b: number) => `${word(a)} plus ${word(b)}. Warm the egg with the answer!`,
  takeAway: (a: number, b: number) => `${word(a)} eggs. Take away ${word(b)}. How many are left?`,
  sub: (a: number, b: number) => `${word(a)} minus ${word(b)}. Warm the egg with the answer!`,
  missing: (a: number, c: number) => `${word(a)} plus what makes ${word(c)}? Warm that egg!`,
  times: (r: number, c: number) => `${r} times ${c}. Warm the egg with the answer!`,
};
