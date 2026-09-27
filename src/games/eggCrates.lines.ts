// Egg Crates's spoken lines. See "How Ember talks" in AGENTS.md; `just check` checks them.

import { word } from '../core/words';

export const lines = {
  intro: "Egg Crates! Let's count rows of eggs!",
  groups: (n: number, k: number) => `${word(n)} nests with ${word(k)} eggs each. How many eggs?`,
  rows: (r: number, c: number) => `${r} rows of ${c} eggs. How many eggs?`,
  fact: (r: number, c: number) => `${r} times ${c}. Warm the egg with the answer!`,
  missingFactor: (c: number, product: number) => `How many rows of ${c} make ${product}?`,
};
