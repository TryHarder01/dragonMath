import type { Game, GameInfo } from './types';
import { eggCrates } from './eggCrates';
import { eggStairs } from './eggStairs';
import { eggWarmer } from './eggWarmer';
import { nestBuilder } from './nestBuilder';
import { gemBags } from './gemBags';
import { stompPath } from './stompPath';

export const GAMES: Game[] = [eggWarmer, eggStairs, eggCrates, nestBuilder, gemBags, stompPath];

/** Shown greyed-out on the map, and as "Coming soon" in the parent guide, until built. */
export const UPCOMING: GameInfo[] = [
  {
    icon: '📖',
    name: 'Dino Story',
    skill: 'Word problems: adding, taking away, comparing, and equal groups',
    about: 'Short animated stories: "Twelve dinos splash in the pond. Five go home for a nap. How many are still splashing?"',
  },
];
