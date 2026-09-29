// Nest Builder's spoken lines. See "How Ember talks" in AGENTS.md; `just check` checks them.

import { word } from '../core/words';

export const lines = {
  intro: "Nest Builder! Let's fill the nests!",

  hintStart: "Let's count.",
  moreBy: (n: number) => `That's ${word(n)} more.`,
  filledFirst: 'You filled the nest first!',
  downToTen: (target: number) => `Down to ${word(target)}, then the rest!`,
  tuckIn: 'Tuck them in!',

  // Fill the nest (L1).
  fillAsk: (a: number) => `${word(a)} in the nest. How many more to fill it?`,

  // Bridge add (L2/L3/L5).
  addAsk: (a: number, b: number) => `${word(a)} plus ${word(b)}. Warm the egg with the answer!`,
  addFirstAskSmall: (a: number, b: number) => `${word(a)} plus ${word(b)}. How many fill the nest?`,
  addFirstAskBig: (a: number, b: number, nextTen: number) => `${word(a)} plus ${word(b)}. How many more to make ${word(nextTen)}?`,
  addSecondAskSmall: (rest: number) => `The nest is full! Ten and ${word(rest)} more. How many?`,
  addSecondAskBig: (nextTen: number, rest: number) => `${word(nextTen)} and ${word(rest)} more. How many?`,
  addChant: (a: number, bridge: number, rest: number) => {
    const nextTen = a + bridge;
    return `${word(a)} and ${word(bridge)}. ${word(nextTen)}! ${word(nextTen)} and ${word(rest)}. ${word(nextTen + rest)}!`;
  },

  // To the next ten (L4).
  nextTenAsk: (a: number, target: number) => `${word(a)}. How many more to make ${word(target)}?`,

  // Bridge subtract (L6/L7).
  subAsk: (a: number, b: number) => `${word(a)} minus ${word(b)}. Warm the egg with the answer!`,
  subFirstAsk: (a: number, b: number, target: number) => `${word(a)} minus ${word(b)}. How many walk home to reach ${word(target)}?`,
  subFirstHint: (ones: number, target: number) => `${word(ones)} walked home. Now we're at ${word(target)}.`,
  subSecondAsk: (rest: number, target: number) => `${word(target)}. ${word(rest)} more walk home. How many are left?`,
  subChant: (a: number, ones: number, rest: number) => {
    const target = a - ones;
    return `${word(a)} minus ${word(ones)}. ${word(target)}! ${word(target)} minus ${word(rest)}. ${word(target - rest)}!`;
  },
};
