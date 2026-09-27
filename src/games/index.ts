import type { Game, GameInfo } from './types';
import { eggCrates } from './eggCrates';
import { eggStairs } from './eggStairs';
import { eggWarmer } from './eggWarmer';
import { gemBags } from './gemBags';

export const GAMES: Game[] = [eggWarmer, eggStairs, eggCrates, gemBags];

/** Shown greyed-out on the map, and as "Coming soon" in the parent guide, until built. */
export const UPCOMING: GameInfo[] = [
  {
    icon: '🦖',
    name: 'Stomp Path',
    skill: 'The number line to 100, and skip counting by 2, 5 and 10',
    about: 'Walk a friendly T-rex home along a numbered path in hops of ten and one, saying each number out loud. Skip-counting hops feed straight into the times tables.',
  },
  {
    icon: '🪺',
    name: 'Nest Builder',
    skill: 'Make-ten strategies, including with bigger numbers (38 + 5)',
    about: 'Tuck eggs into nests of ten. Filling a nest first and then starting the next one is the "make ten" strategy behind fast mental maths.',
  },
  {
    icon: '📖',
    name: 'Dino Story',
    skill: 'Word problems: adding, taking away, comparing, and equal groups',
    about: 'Short animated stories: "Twelve dinos splash in the pond. Five go home for a nap. How many are still splashing?"',
  },
];
