// Gem Bags' spoken lines. See "How Ember talks" in AGENTS.md; `just check` checks them.

const PRAISE = 'Bags first, then gems. Smart!';

export const lines = {
  intro: 'Gem Bags! Help Ember count and share gems!',
  praise: PRAISE,

  // gemsModel: bags of ten and loose gems.
  countBagsFirst: "Let's count. Bags first!",
  countResult: (tens: number, ones: number) => `${tens} bags is ${tens * 10}. ${ones} more is ${tens * 10 + ones}.`,

  // operationModel: add/share whole bags, or two-digit add/sub.
  bagsArrive: 'Watch! New bags arrive. Count by tens.',
  bagsShare: 'Watch! Share bags. Count back by tens.',
  bagsResult: (a: number, b: number, answer: number, add: boolean) => `${a} ${add ? 'plus' : 'take away'} ${b} is ${answer}.`,
  tensFirst: 'Tens first, then ones!',
  tensResult: (aTens: number, bTens: number, answer: number, add: boolean) => `${aTens} ${add ? 'and' : 'take away'} ${bTens} is ${answer}.`,
  onesResult: (aOnes: number, bOnes: number, answer: number, add: boolean) => `${aOnes} ${add ? 'and' : 'take away'} ${bOnes} is ${answer}.`,
  makesTotal: (answer: number) => `That makes ${answer}.`,

  // regroupModel: ten loose gems make a new bag.
  regroupStart: (a: number, b: number) => `Watch! Start at ${a}. Add ${b} loose gems.`,
  newBag: 'Ten gems make a new bag!',
  regroupResult: (a: number, b: number) => `${a} plus ${b} is ${a + b}.`,

  // question(): the ask per level and kind.
  countAsk: 'Count the bags by tens. How many gems now?',
  addTensAsk: (a: number, b: number, level: number) =>
    level === 8
      ? `${a} plus ${b}. Warm the egg with the answer!`
      : b === 10
        ? `${a} gems. A friend gives one more bag! How many now?`
        : `${a} gems. ${b / 10} more bags come! How many now?`,
  subTensAsk: (a: number, b: number, level: number) =>
    level === 8
      ? `${a} minus ${b}. Warm the egg with the answer!`
      : b === 10
        ? `${a} gems. Share one bag with a friend. How many are left?`
        : `${a} gems. Share ${b / 10} bags. How many are left?`,
  addAsk: (a: number, b: number, level: number) =>
    level === 8 ? `${a} plus ${b}. Warm the egg with the answer!` : `${a} gems. ${b} more gems. How many altogether?`,
  subAsk: (a: number, b: number, level: number) =>
    level === 8 ? `${a} minus ${b}. Warm the egg with the answer!` : `${a} gems. Share ${b} with a friend. How many are left?`,
  regroupAsk: (a: number, b: number) => `${a} plus ${b}. Warm the egg with the answer!`,

  // buildScene: L2, tap bags and gems to make a target.
  bagFormed: 'Ten gems make a bag!',
  buildPrompt: (target: number) => `Make ${target}. Tap the bags and the gems!`,
  buildHint: (total: number, tens: number, ones: number, target: number, targetTens: number, targetOnes: number) =>
    `You made ${total}. That's ${tens} bags and ${ones} gems. ${target} needs ${targetTens} bags and ${targetOnes} gems.`,

  // compareScene: L3, which dragon has more.
  compareAsk: 'Red dragon. Blue dragon. Who has more gems?',
  // Shown on screen above the dragons (simple words, see AGENTS.md).
  compareCard: 'Who has more?',
  compareRight: (colour: string) => `The ${colour} dragon has more! ${PRAISE}`,
  compareTensCount: (highTens: number, lowTens: number) => `${highTens} bags is more than ${lowTens} bags.`,
  compareOnesMatch: (onesA: number, onesB: number) => `The bags match. ${onesA} and ${onesB}.`,
  compareAnswer: (colour: string) => `The ${colour} dragon has more!`,
  compareAgain: 'Look at both dragons. Bags first, then gems!',
};
