import type { Game, GameInfo } from './types';
import { eggWarmer } from './eggWarmer';

export const GAMES: Game[] = [eggWarmer];

/** Shown greyed-out on the map until built. */
export const UPCOMING: GameInfo[] = [
  {
    icon: '🦕',
    name: 'Dino Count',
    skill: 'Counting each thing once, and knowing the last number is "how many"',
    about: "Count the baby dinos so nobody gets left behind. Each tap counts one dino, then your child picks the total.",
  },
  {
    icon: '💎',
    name: 'Gem Trade',
    skill: 'Comparing: more, fewer, the same',
    about: 'Two dragons share their gems. Which one has more? The piles get closer in size as your child improves.',
  },
  {
    icon: '🪺',
    name: 'Nest Builder',
    skill: 'Making 5 and 10',
    about: 'Tuck eggs into a nest shaped like a ten-frame. "How many more to fill it?" builds the number facts behind adding.',
  },
  {
    icon: '🦖',
    name: 'Stomp Path',
    skill: 'The number line and counting on',
    about: 'Walk a friendly T-rex home along a straight numbered path, saying each number out loud. Board games like this are proven to build number sense.',
  },
  {
    icon: '📖',
    name: 'Dino Story',
    skill: 'Adding and taking away within 10',
    about: 'Short animated stories: "Three dinos splash in the pond. Two more come to play! How many now?"',
  },
];
