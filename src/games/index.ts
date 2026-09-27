import type { Game } from './types';
import { eggWarmer } from './eggWarmer';

export const GAMES: Game[] = [eggWarmer];

/** Shown greyed-out on the map until built. */
export const UPCOMING: { icon: string; name: string }[] = [
  { icon: '🦕', name: 'Dino Count' },
  { icon: '💎', name: 'Gem Trade' },
  { icon: '🪺', name: 'Nest Builder' },
  { icon: '🦖', name: 'Stomp Path' },
  { icon: '📖', name: 'Dino Story' },
];
