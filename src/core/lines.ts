// Shared spoken lines: picture-model hints, the egg scene, and the island screens.
// Each game keeps its own in src/games/<game>.lines.ts. `just check` runs
// scripts/check-lines.mjs over every lines file (sentence length, banned words),
// so follow "How Ember talks" in AGENTS.md.

import { word } from './words';

export const lines = {
  // addModel: a + b on a double ten-frame.
  addStart: (a: number, b: number) => `Start at ${word(a)}. Count on ${word(b)}.`,
  addBridge: (a: number, b: number) => `${word(a)} and ${word(10 - a)}. Ten! Ten and ${word(a + b - 10)}. ${word(a + b)}!`,
  addSum: (a: number, b: number) => `${word(a)} and ${word(b)} is ${word(a + b)}.`,
  // subModel: a − b, counting back (down to ten first when it crosses).
  subBridge: (a: number, b: number) => `Take away ${word(a - 10)}. Down to ten. Take away ${word(b - (a - 10))} more.`,
  subCountBack: (a: number, b: number) => `Start at ${word(a)}. Take away ${word(b)}. Count back.`,
  subResult: (a: number, b: number) => `${word(a)} take away ${word(b)} is ${word(a - b)}.`,
  // missingModel: a + ? = c.
  missingStart: (a: number, c: number) => `Start at ${word(a)}. How many more to ${word(c)}?`,
  missingResult: (a: number, c: number) => `That's ${word(c - a)} more. ${word(a)} and ${word(c - a)} is ${word(c)}.`,
  // arrayModel: rows × cols.
  arrayBuild: (cols: number, product: number) => `Let's build rows of ${cols}. Count up to ${product}.`,
  arrayBuilt: (rows: number, cols: number) => `That's ${rows} rows. ${rows} times ${cols} is ${rows * cols}.`,
  arrayFive: (cols: number) => `Five rows of ${cols} is ${5 * cols}.`,
  arrayCountBy: (cols: number) => `Count by ${cols}s.`,
  arrayResult: (rows: number, cols: number) => `${rows} times ${cols} is ${rows * cols}.`,
  // groupsModel: n nests of k.
  groupsCountBy: (k: number) => `Count the nests by ${word(k)}s.`,
  groupsResult: (n: number, k: number) => `${word(n)} nests of ${word(k)} is ${n * k} eggs.`,

  // eggScene: after a tap.
  praise: ['Nice and warm! It hatched!', 'You helped it hatch!', 'You got it, rider!', 'Great thinking!'],
  hintStart: "Let's count.",
  missAgain: 'Not that one either. Look at the picture. Try again.',

  // Island screens.
  greeting: "Hi rider! I'm Ember. A storm scattered the dino eggs. Let's help them get home! Tap a picture to play.",
  map: 'Where should we fly, rider? Tap a picture!',
  breakNudge: 'Ember is getting sleepy. Great work today, rider! Maybe time for a break?',
  hatch: 'You did it! Tap the egg to hatch it!',
  newFriend: (name: string) => `It's ${name}! Welcome to your nest!`,
  againFriend: (name: string) => `Another ${name}! They love you!`,
  nest: (count: number) => `You have ${count} friends in your nest! Tap one to hear their name.`,
  nestEmpty: 'Your nest is empty. Play a game to hatch a friend!',
};
