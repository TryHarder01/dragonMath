// Dino Story's spoken lines: story templates, questions, hints and praise.
// See "How Ember talks" in AGENTS.md; `just check` checks them.
// Templates keep their {a}/{b} placeholders as plain text, filled by `fill()` in dinoStory.ts.

import type { LeaveAction, StoryKind } from './dinoStory';
import { word } from '../core/words';

export interface StoryTemplate {
  lines: string[];
  partUnknownLines?: string[];
  icon: string;
  secondIcon?: string;
  containerIcon?: string;
  backdrop: 'pond' | 'meadow' | 'nest' | 'cave' | 'beach';
  action?: LeaveAction;
}

export const lines = {
  intro: 'Dino Story! Help Ember answer the question!',
  praise: ['You acted it out in your head!', 'That was a tricky one!', 'You found the missing part!'],

  // Story templates, rotated so repeats are rare. At least four per type.
  templates: {
    join: [
      { lines: ['{a} dinos splash in the pond.', '{b} more come to play.'], icon: '🦕', backdrop: 'pond' },
      { lines: ['{a} eggs are in the nest.', 'Ember brings {b} more.'], icon: '🥚', backdrop: 'nest' },
      { lines: ['{a} baby dinos are napping.', '{b} more curl up with them.'], icon: '🦖', backdrop: 'meadow' },
      { lines: ['A dragon has {a} gems.', 'A friend gives her {b} more.'], icon: '💎', backdrop: 'cave' },
    ],
    separate: [
      { lines: ['{a} dinos splash in the pond.', '{b} fly home on Ember.'], icon: '🦕', backdrop: 'pond', action: 'fly' },
      { lines: ['{a} eggs are in the nest.', '{b} hatch and walk home.'], icon: '🥚', backdrop: 'nest', action: 'hatch' },
      { lines: ['{a} dinos are playing.', '{b} go for a nap.'], icon: '🦖', backdrop: 'meadow', action: 'nap' },
      { lines: ['A dragon has {a} gems.', 'She shares {b} with a friend.'], icon: '💎', backdrop: 'cave', action: 'share' },
    ],
    'part-whole': [
      { lines: ['{a} green dinos are at the pond.', '{b} blue dinos are there too.'], partUnknownLines: ['{whole} dinos are at the pond.', '{a} are green. The rest are blue.'], icon: '🦕', backdrop: 'pond' },
      { lines: ['The nest has {a} white eggs.', '{b} more eggs are speckled.'], partUnknownLines: ['The nest has {whole} eggs.', '{a} are white. The rest are speckled.'], icon: '🥚', backdrop: 'nest' },
      { lines: ['{a} dinos are in the pond.', '{b} more are on the sand.'], partUnknownLines: ['{whole} dinos are at the beach.', '{a} are in the pond. The rest are on the sand.'], icon: '🦖', backdrop: 'beach' },
      { lines: ['Ember found {a} red gems.', '{b} more are blue.'], partUnknownLines: ['Ember found {whole} gems.', '{a} are red. The rest are blue.'], icon: '💎', backdrop: 'cave' },
    ],
    'change-unknown': [
      { lines: ['{a} dinos are at the pond.', 'Some more come to play.', 'Now there are {sum}.'], icon: '🦕', backdrop: 'pond' },
      { lines: ['{a} eggs are in the nest.', 'Ember brings some more.', 'Now there are {sum}.'], icon: '🥚', backdrop: 'nest' },
      { lines: ['{a} baby dinos are napping.', 'Some more curl up.', 'Now there are {sum}.'], icon: '🦖', backdrop: 'meadow' },
      { lines: ['A dragon has {a} gems.', 'A friend gives her some more.', 'Now she has {sum}.'], icon: '💎', backdrop: 'cave' },
    ],
    compare: [
      { lines: ['{a} dinos are in the pond.', '{b} dinos are on the hill.'], icon: '🦕', backdrop: 'pond' },
      { lines: ['Ember has {a} gems.', 'Her friend has {b} gems.'], icon: '💎', backdrop: 'cave' },
      { lines: ['The big nest has {a} eggs.', 'The little nest has {b} eggs.'], icon: '🥚', backdrop: 'nest' },
      { lines: ['{a} turtles are at the beach.', '{b} dinos are there too.'], icon: '🐢', secondIcon: '🦖', backdrop: 'beach' },
    ],
    'start-unknown': [
      { lines: ['Some dinos were splashing.', '{b} flew home on Ember.', '{result} are still splashing.'], icon: '🦕', backdrop: 'pond', action: 'fly' },
      { lines: ['Some eggs were in the nest.', '{b} hatched and walked home.', '{result} are still in the nest.'], icon: '🥚', backdrop: 'nest', action: 'hatch' },
      { lines: ['Some dinos were playing.', '{b} went for a nap.', '{result} are still playing.'], icon: '🦖', backdrop: 'meadow', action: 'nap' },
      { lines: ['A dragon had some gems.', 'She shared {b} with a friend.', 'She has {result} left.'], icon: '💎', backdrop: 'cave', action: 'share' },
    ],
    groups: [
      { lines: ['{a} nests have {b} eggs in each.'], icon: '🥚', containerIcon: '🪺', backdrop: 'nest' },
      { lines: ['{a} dragons each have {b} gems.'], icon: '💎', containerIcon: '🐉', backdrop: 'cave' },
    ],
    sharing: [
      { lines: ['{sum} eggs for {a} nests.', 'The same in each nest!'], icon: '🥚', containerIcon: '🪺', backdrop: 'nest' },
      { lines: ['{sum} gems for {a} dragons.', 'The same for each dragon!'], icon: '💎', containerIcon: '🐉', backdrop: 'cave' },
    ],
    'two-step': [
      { lines: ['{a} dinos play at the pond.', '{b} fly home on Ember.', '{c} more come to play.'], icon: '🦕', backdrop: 'pond', action: 'fly' },
      { lines: ['{a} eggs rest in the nest.', '{b} hatch and walk home.', 'Ember brings {c} more eggs.'], icon: '🥚', backdrop: 'nest', action: 'hatch' },
      { lines: ['A dragon has {a} gems.', 'She shares {b} with a friend.', 'Then she finds {c} more.'], icon: '💎', backdrop: 'cave', action: 'share' },
      { lines: ['{a} dinos play in the meadow.', '{b} curl up for a nap.', '{c} more come to play.'], icon: '🦖', backdrop: 'meadow', action: 'nap' },
    ],
  } as Record<StoryKind, StoryTemplate[]>,

  // The `ask` for 🔊: a compact retelling plus the question.
  joinAsk: (a: number, b: number) => `${word(a)} and ${word(b)} more. How many now?`,
  separateAsk: (a: number, b: number) => `${word(a)} were playing. ${word(b)} went home. How many are left?`,
  partWholeWholeAsk: (a: number, b: number) => `${word(a)} in one group. ${word(b)} in the other. How many altogether?`,
  partWholePartAsk: (whole: number, a: number) => `${word(whole)} altogether. ${word(a)} are in one group. How many are in the other group?`,
  changeUnknownAsk: (a: number, sum: number) => `${word(a)} were there. Then there were ${word(sum)}. How many came?`,
  compareMoreAsk: (bigger: number, smaller: number) => `${word(bigger)} on top. ${word(smaller)} below. How many more on top?`,
  compareFewerAsk: (smaller: number, bigger: number) => `${word(smaller)} below. ${word(bigger)} on top. How many fewer below?`,
  startUnknownAsk: (b: number, result: number) => `Some were playing. ${word(b)} went home. ${word(result)} stayed. How many were playing at the start?`,
  sharingAsk: (sum: number, groups: number) => `${word(sum)} shared by ${word(groups)}. The same in each. How many in each?`,
  groupsAsk: (groups: number, size: number) => `${word(groups)} groups with ${word(size)} in each. How many altogether?`,
  twoStepAsk: (a: number, b: number, c: number) => `${word(a)} were playing. ${word(b)} went home. Then ${word(c)} more came. How many now?`,

  // Sentence-card beat (L6, L8): which number puzzle matches the story?
  sentencePrompt: 'Which number puzzle matches the story?',
  sentenceRight: "That's the story's number puzzle.",
  sentenceHint: "Let's act it out once more.",
  sentenceAgain: 'Think about the story. Try again.',

  // Answer beat.
  wrongHint: "Watch! Let's act it out.",
  wrongAgain: 'Look at the picture. Try another egg.',

  // Hint lead-ins before the picture model runs.
  compareLeadIn: 'Watch! Match them up. Extra ones are the answer.',
  startUnknownLeadIn: 'Watch! Put the ones who left back!',
  twoStepFirst: 'First, act out who went home.',
  twoStepThen: 'Then, count on the friends who came.',

  // sharingModel: deal eggs into nests one at a time.
  shareStart: (sum: number) => `Share ${word(sum)}. One for each group.`,
  shareOne: 'One for you.',
  shareResult: (groups: number, each: number) => `${word(groups)} groups. ${word(each)} in each.`,
};
