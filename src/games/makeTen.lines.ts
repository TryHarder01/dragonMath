// Make Ten's spoken lines. See "How Ember talks" in AGENTS.md; `just check` checks them.

import { word } from '../core/words';

export const lines = {
  intro: 'Make Ten! Fill the nest, then the rest!',

  hintStart: "Let's count.",
  fillNestThenRest: 'Fill the nest, then the rest!',
  downToTenThenRest: 'Down to ten, then the rest!',
  madeTen: 'You made ten!',
  splitMade: (b: number) => `You split the ${word(b)} to make ten!`,
  moreBy: (n: number) => `That's ${word(n)} more.`,

  // Model recaps, shared by several beats.
  bridgeAdded: (bridge: number) => `${word(bridge)} went in the nest.`,
  bridgeWalkedHome: (bridge: number) => `${word(bridge)} walked home.`,
  basketSplit: (b: number, bridge: number, rest: number) => `${word(bridge)} and ${word(rest)} make ${word(b)}.`,
  splitAsk: (b: number, bridge: number) => `${word(bridge)} and how many make ${word(b)}?`,

  // Partners of ten (L1).
  partnerAsk: (a: number) => `${word(a)} eggs. How many more make ten?`,

  // Fill from the basket (L2).
  fillAsk: (a: number, b: number) => `${word(a)} in the nest. ${word(b)} in the basket. How many fill the nest?`,
  thatsEggs: (bridge: number) => `That's ${word(bridge)} eggs.`,

  // Split the number (L3).
  splitFilledAsk: (bridge: number, b: number) => `${word(bridge)} eggs filled the nest. ${word(bridge)} and how many make ${word(b)}?`,

  // The whole chain (L4/L5).
  chainFirstAskSmall: (a: number, b: number) => `${word(a)} plus ${word(b)}. How many fill the nest?`,
  chainFirstAskBig: (a: number, b: number, target: number) => `${word(a)} plus ${word(b)}. How many make ${word(target)}?`,
  thatsBridge: (bridge: number) => `That's ${word(bridge)}.`,
  totalAddAsk: (target: number, rest: number) => `${word(target)} and ${word(rest)} more. How many?`,
  addTotalRecap: (target: number, rest: number, sum: number) => `${word(target)} and ${word(rest)} is ${word(sum)}.`,
  addChant: (a: number, bridge: number, rest: number) => {
    const b = bridge + rest, target = a + bridge;
    return `${word(a)} plus ${word(b)}. ${word(a)} and ${word(bridge)}. ${word(target)}! ${word(target)} and ${word(rest)}. ${word(target + rest)}!`;
  },

  // Add in one step (L6/L8).
  addTotalAsk: (a: number, b: number) => `${word(a)} plus ${word(b)}. Warm the egg with the answer!`,

  // Down to ten, subtract (L7).
  subChainFirstAsk: (a: number, b: number) => `${word(a)} minus ${word(b)}. How many walk home to make ten?`,
  subFirstHint: (bridge: number) => `${word(bridge)} walked home. Now we're at ten.`,
  tenMinusAsk: (rest: number) => `Ten. ${word(rest)} more walk home. How many are left?`,
  tenMinusRecap: (rest: number, final: number) => `Ten minus ${word(rest)} is ${word(final)}.`,
  subChant: (a: number, bridge: number, rest: number) => {
    const b = bridge + rest;
    return `${word(a)} minus ${word(b)}. ${word(a)} minus ${word(bridge)}. Ten! Ten minus ${word(rest)}. ${word(a - b)}!`;
  },

  // Subtract in one step (L8).
  subTotalAsk: (a: number, b: number) => `${word(a)} minus ${word(b)}. Warm the egg with the answer!`,
};
