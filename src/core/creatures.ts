// The Hatchery collection. Colour variants come from hue-rotating the emoji.

export interface Creature {
  id: string;
  emoji: string;
  name: string;
  hue: number;
}

export const CREATURES: Creature[] = [
  { id: 'rex-green', emoji: '🦖', name: 'Rory the Rex', hue: 0 },
  { id: 'rex-blue', emoji: '🦖', name: 'Blue Bolt', hue: 110 },
  { id: 'rex-purple', emoji: '🦖', name: 'Pip the Purple Raptor', hue: 170 },
  { id: 'rex-pink', emoji: '🦖', name: 'Rosie Roar', hue: 230 },
  { id: 'rex-gold', emoji: '🦖', name: 'Sunny Stomper', hue: 300 },
  { id: 'saur-green', emoji: '🦕', name: 'Long-Neck Lulu', hue: 0 },
  { id: 'saur-blue', emoji: '🦕', name: 'Splashy', hue: 90 },
  { id: 'saur-purple', emoji: '🦕', name: 'Plum', hue: 150 },
  { id: 'saur-red', emoji: '🦕', name: 'Cherry', hue: 220 },
  { id: 'dragon-green', emoji: '🐉', name: 'Ember Junior', hue: 0 },
  { id: 'dragon-blue', emoji: '🐉', name: 'Frost', hue: 100 },
  { id: 'dragon-purple', emoji: '🐉', name: 'Midnight', hue: 160 },
  { id: 'dragon-red', emoji: '🐉', name: 'Blaze', hue: 230 },
  { id: 'face-red', emoji: '🐲', name: 'Captain Snort', hue: 0 },
  { id: 'face-blue', emoji: '🐲', name: 'Puff', hue: 100 },
  { id: 'lizard', emoji: '🦎', name: 'Zippy the Lizard', hue: 0 },
  { id: 'lizard-blue', emoji: '🦎', name: 'Twinkle Tail', hue: 120 },
  { id: 'turtle', emoji: '🐢', name: 'Shelly', hue: 0 },
  { id: 'croc', emoji: '🐊', name: 'Chompers', hue: 0 },
  { id: 'croc-gold', emoji: '🐊', name: 'Goldie Grin', hue: 290 },
];

export function creatureEl(c: Creature, cls = 'creature'): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = cls;
  s.textContent = c.emoji;
  if (c.hue) s.style.filter = `hue-rotate(${c.hue}deg)`;
  return s;
}
