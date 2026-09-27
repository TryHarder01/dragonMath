import type { Game, GameInfo } from './types';
import { eggCrates } from './eggCrates';
import { eggStairs } from './eggStairs';
import { eggWarmer } from './eggWarmer';
import { stompPath } from './stompPath';

export const GAMES: Game[] = [eggWarmer, eggStairs, eggCrates, stompPath];

/** Shown greyed-out on the map, and as "Coming soon" in the parent guide, until built. */
export const UPCOMING: GameInfo[] = [
  {
    icon: '💎',
    name: 'Gem Bags',
    skill: 'Place value: tens and ones to 100',
    about: 'Dragons keep their gems in bags of ten plus a few loose ones. How many gems is that? Who has more? Adding a bag at a time builds adding and subtracting tens.',
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
