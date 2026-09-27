import type { Game } from './types';
import { eggZapper } from './eggZapper';

export const GAMES: Game[] = [eggZapper];

/** Shown greyed-out on the map until built. */
export const UPCOMING: { icon: string; name: string }[] = [
  { icon: '🦕', name: 'Dino Count' },
  { icon: '💎', name: 'Gem Trade' },
  { icon: '🪺', name: 'Nest Builder' },
  { icon: '🦖', name: 'Stomp Path' },
  { icon: '📖', name: 'Dino Story' },
];
