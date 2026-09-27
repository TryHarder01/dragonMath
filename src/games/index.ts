import type { Game, GameInfo } from './types';
import { eggCrates } from './eggCrates';
import { eggStairs } from './eggStairs';
import { eggWarmer } from './eggWarmer';
import { nestBuilder } from './nestBuilder';
import { gemBags } from './gemBags';
import { stompPath } from './stompPath';
import { dinoStory } from './dinoStory';

export const GAMES: Game[] = [eggWarmer, eggStairs, eggCrates, nestBuilder, gemBags, stompPath, dinoStory];

/** Shown greyed-out on the map, and as "Coming soon" in the parent guide, until built. */
export const UPCOMING: GameInfo[] = [];
