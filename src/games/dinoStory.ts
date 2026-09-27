// Dino Story: word problems acted out before the child chooses an answer.
// The stage is the always-visible picture model; a wrong answer replays the
// action and then connects it to the shared fact models.

import { awaitChoice, type Choice } from '../core/choices';
import { h, nearChoices, pick, rand, shuffle } from '../core/dom';
import { addModel, groupsModel, missingModel, subModel, type Model } from '../core/models';
import { sfx } from '../core/sound';
import { prompt, say, wait, word } from '../core/voice';
import type { Game } from './types';

const MINUS = '−';
const TIMES = '×';
const DIVIDE = '÷';

type StoryKind =
  | 'join'
  | 'separate'
  | 'part-whole'
  | 'change-unknown'
  | 'compare'
  | 'start-unknown'
  | 'groups'
  | 'sharing'
  | 'two-step';

type LeaveAction = 'fly' | 'hatch' | 'nap' | 'share';

interface StoryTemplate {
  lines: string[];
  partUnknownLines?: string[];
  icon: string;
  secondIcon?: string;
  containerIcon?: string;
  backdrop: 'pond' | 'meadow' | 'nest' | 'cave' | 'beach';
  action?: LeaveAction;
}

/** Templates stay as data so new settings can be added without changing the scene. */
const STORY_TEMPLATES: Record<StoryKind, StoryTemplate[]> = {
  join: [
    { lines: ['{a} dinos splash in the pond.', '{b} more come to play.'], icon: '🦕', backdrop: 'pond' },
    { lines: ['{a} eggs are in the nest.', 'Ember brings {b} more.'], icon: '🥚', backdrop: 'nest' },
    { lines: ['{a} baby dinos are napping.', '{b} more curl up with them.'], icon: '🦖', backdrop: 'meadow' },
    { lines: ['A dragon has {a} gems.', 'A friend gives her {b} more.'], icon: '💎', backdrop: 'cave' },
  ],
  separate: [
    { lines: ['{a} dinos splash in the pond.', '{b} fly home on Ember.'], icon: '🦕', backdrop: 'pond', action: 'fly' },
    { lines: ['{a} eggs are in the nest.', '{b} hatch and walk home to their mums.'], icon: '🥚', backdrop: 'nest', action: 'hatch' },
    { lines: ['{a} dinos are playing.', '{b} go for a nap.'], icon: '🦖', backdrop: 'meadow', action: 'nap' },
    { lines: ['A dragon has {a} gems.', 'She shares {b} with a friend.'], icon: '💎', backdrop: 'cave', action: 'share' },
  ],
  'part-whole': [
    { lines: ['{a} green dinos and {b} blue dinos are at the pond.'], partUnknownLines: ['{whole} dinos are at the pond.', '{a} are green. The rest are blue.'], icon: '🦕', backdrop: 'pond' },
    { lines: ['The nest has {a} white eggs and {b} speckled eggs.'], partUnknownLines: ['The nest has {whole} eggs.', '{a} are white. The rest are speckled.'], icon: '🥚', backdrop: 'nest' },
    { lines: ['{a} dinos are in the pond and {b} are on the sand.'], partUnknownLines: ['{whole} dinos are at the beach.', '{a} are in the pond. The rest are on the sand.'], icon: '🦖', backdrop: 'beach' },
    { lines: ['Ember found {a} red gems and {b} blue gems.'], partUnknownLines: ['Ember found {whole} gems.', '{a} are red. The rest are blue.'], icon: '💎', backdrop: 'cave' },
  ],
  'change-unknown': [
    { lines: ['{a} dinos are at the pond.', 'Some more come to play.', 'Now there are {total}.'], icon: '🦕', backdrop: 'pond' },
    { lines: ['{a} eggs are in the nest.', 'Ember brings some more.', 'Now there are {total}.'], icon: '🥚', backdrop: 'nest' },
    { lines: ['{a} baby dinos are napping.', 'Some more curl up.', 'Now there are {total}.'], icon: '🦖', backdrop: 'meadow' },
    { lines: ['A dragon has {a} gems.', 'A friend gives her some more.', 'Now she has {total}.'], icon: '💎', backdrop: 'cave' },
  ],
  compare: [
    { lines: ['{a} dinos are in the pond.', '{b} dinos are on the hill.'], icon: '🦕', backdrop: 'pond' },
    { lines: ['Ember has {a} gems.', 'Her friend has {b} gems.'], icon: '💎', backdrop: 'cave' },
    { lines: ['The big nest has {a} eggs.', 'The little nest has {b} eggs.'], icon: '🥚', backdrop: 'nest' },
    { lines: ['{a} turtles and {b} dinos are at the beach.'], icon: '🐢', secondIcon: '🦖', backdrop: 'beach' },
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
    { lines: ['{total} eggs are shared equally into {a} nests.'], icon: '🥚', containerIcon: '🪺', backdrop: 'nest' },
    { lines: ['{total} gems are shared equally by {a} dragons.'], icon: '💎', containerIcon: '🐉', backdrop: 'cave' },
  ],
  'two-step': [
    { lines: ['{a} dinos play at the pond.', '{b} fly home on Ember.', '{c} more come to play.'], icon: '🦕', backdrop: 'pond', action: 'fly' },
    { lines: ['{a} eggs rest in the nest.', '{b} hatch and walk home.', 'Ember brings {c} more eggs.'], icon: '🥚', backdrop: 'nest', action: 'hatch' },
    { lines: ['A dragon has {a} gems.', 'She shares {b} with a friend.', 'Then she finds {c} more.'], icon: '💎', backdrop: 'cave', action: 'share' },
    { lines: ['{a} dinos play in the meadow.', '{b} curl up for a nap.', '{c} more come to play.'], icon: '🦖', backdrop: 'meadow', action: 'nap' },
  ],
};

const templateBags: Partial<Record<StoryKind, StoryTemplate[]>> = {};

function nextTemplate(kind: StoryKind): StoryTemplate {
  const bag = templateBags[kind] ?? [];
  if (!bag.length) bag.push(...shuffle(STORY_TEMPLATES[kind]));
  templateBags[kind] = bag;
  return bag.pop()!;
}

export interface StoryProblem {
  level: number;
  kind: StoryKind;
  answer: number;
  choices: number[];
  /** Generator values are exported for the 1,000-run constraint check. */
  values: Record<string, number | boolean>;
  lines: string[];
  icon: string;
  secondIcon?: string;
  containerIcon?: string;
  backdrop: StoryTemplate['backdrop'];
  action?: LeaveAction;
  ask: string;
  strip: string[];
  equation: string;
  sentenceChoices: string[];
  choiceMax: number;
}

function fill(line: string, values: Record<string, number>): string {
  return line.replace(/\{(\w+)\}/g, (_, key: string) => word(values[key]));
}

function withChoices(answer: number, max: number, mistake?: number): number[] {
  const choices = nearChoices(answer, 4, 0, max);
  if (mistake !== undefined && mistake >= 0 && mistake <= max && mistake !== answer && !choices.includes(mistake)) {
    const replace = choices.findIndex((n) => n !== answer);
    choices[replace] = mistake;
  }
  return shuffle(choices);
}

function base(
  level: number,
  kind: StoryKind,
  values: Record<string, number | boolean>,
  answer: number,
  ask: string,
  strip: string[],
  equation: string,
  sentenceChoices: string[],
  mistake?: number,
  choiceMax = 20,
): StoryProblem {
  const template = nextTemplate(kind);
  const numeric = Object.fromEntries(Object.entries(values).filter((entry): entry is [string, number] => typeof entry[1] === 'number'));
  const lines = kind === 'part-whole' && values.wholeUnknown === false ? template.partUnknownLines! : template.lines;
  return {
    level,
    kind,
    values,
    answer,
    choices: withChoices(answer, choiceMax, mistake),
    lines: lines.map((line) => fill(line, numeric)),
    icon: template.icon,
    secondIcon: template.secondIcon,
    containerIcon: template.containerIcon,
    backdrop: template.backdrop,
    action: template.action,
    ask,
    strip,
    equation,
    sentenceChoices: shuffle(sentenceChoices),
    choiceMax,
  };
}

function join(level = 1): StoryProblem {
  const a = rand(3, 12);
  const b = rand(2, Math.min(8, 20 - a));
  const total = a + b;
  return base(
    level, 'join', { a, b, total }, total,
    `${word(a)} and ${word(b)} more. How many now?`,
    [`${a}`, `+ ${b}`, '= ?'], `${a} + ${b} = ?`,
    [`${a} + ${b} = ?`, `${total} ${MINUS} ${a} = ?`, `${a} ${MINUS} ${b} = ?`],
  );
}

function separate(level = 2): StoryProblem {
  const crossesTen = Math.random() < 0.6;
  let a: number;
  let b: number;
  if (crossesTen) {
    a = rand(11, 18);
    b = rand(a - 9, Math.min(9, a - 1));
  } else if (Math.random() < 0.5) {
    a = rand(6, 10);
    b = rand(2, Math.min(9, a - 1));
  } else {
    a = rand(12, 20);
    b = rand(2, Math.min(9, a - 10));
  }
  const result = a - b;
  return base(
    level, 'separate', { a, b, result, crossesTen }, result,
    `${word(a)} were playing. ${word(b)} went home. How many are left?`,
    [`${a}`, `${MINUS} ${b}`, '= ?'], `${a} ${MINUS} ${b} = ?`,
    [`${a} ${MINUS} ${b} = ?`, `${result} ${MINUS} ${b} = ?`, `${a} + ${b} = ?`],
    a + b,
  );
}

function partWhole(level = 3): StoryProblem {
  const whole = rand(8, 20);
  const a = rand(2, whole - 2);
  const b = whole - a;
  const wholeUnknown = Math.random() < 0.5;
  if (wholeUnknown) {
    return base(
      level, 'part-whole', { a, b, whole, wholeUnknown }, whole,
      `There are ${word(a)} in one group and ${word(b)} in the other. How many altogether?`,
      [`${a}`, `+ ${b}`, '= ?'], `${a} + ${b} = ?`,
      [`${a} + ${b} = ?`, `${whole} ${MINUS} ${a} = ?`, `${a} ${MINUS} ${b} = ?`],
    );
  }
  return base(
    level, 'part-whole', { a, b, whole, wholeUnknown }, b,
    `${word(whole)} altogether. ${word(a)} are in one group. How many are in the other group?`,
    [`${whole}`, `${MINUS} ${a}`, '= ?'], `${whole} ${MINUS} ${a} = ?`,
    [`${whole} ${MINUS} ${a} = ?`, `${a} + ${b} = ?`, `${a} ${MINUS} ${b} = ?`],
    whole + a,
  );
}

function changeUnknown(level = 4): StoryProblem {
  const a = rand(3, 12);
  const b = rand(2, 8);
  const total = a + b;
  return base(
    level, 'change-unknown', { a, b, total }, b,
    `${word(a)} were there. Then there were ${word(total)}. How many came?`,
    [`${a}`, '+ ?', `= ${total}`], `${a} + ? = ${total}`,
    [`${a} + ? = ${total}`, `${total} ${MINUS} ${a} = ?`, `${a} + ${total} = ?`],
    a + total,
  );
}

function compare(level = 5): StoryProblem {
  const bigger = rand(6, 20);
  const difference = rand(2, Math.min(9, bigger - 2));
  const smaller = bigger - difference;
  const askMore = Math.random() < 0.5;
  return base(
    level, 'compare', { a: bigger, b: smaller, bigger, smaller, difference, askMore }, difference,
    askMore
      ? `${word(bigger)} in the first group and ${word(smaller)} in the second. How many more are in the first group?`
      : `${word(smaller)} in the second group and ${word(bigger)} in the first. How many fewer are in the second group?`,
    [`${bigger}`, `${MINUS} ${smaller}`, '= ?'], `${bigger} ${MINUS} ${smaller} = ?`,
    [`${bigger} ${MINUS} ${smaller} = ?`, `${bigger} + ${smaller} = ?`, `${smaller} ${MINUS} ${difference} = ?`],
    bigger + smaller,
  );
}

function startUnknown(level = 6): StoryProblem {
  const b = rand(2, 9);
  const result = rand(2, 11);
  const start = b + result;
  return base(
    level, 'start-unknown', { a: start, b, result, start }, start,
    `Some were playing. ${word(b)} went home and ${word(result)} stayed. How many were playing at the start?`,
    ['?', `${MINUS} ${b}`, `= ${result}`], `? ${MINUS} ${b} = ${result}`,
    [`? ${MINUS} ${b} = ${result}`, `${result} ${MINUS} ${b} = ?`, `${result} + ${b} = ?`],
    result,
  );
}

function equalGroups(level = 7): StoryProblem {
  const groups = rand(2, 5);
  const size = rand(2, 5);
  const total = groups * size;
  const sharing = Math.random() < 0.5;
  if (sharing) {
    return base(
      level, 'sharing', { a: groups, b: size, groups, size, total, sharing }, size,
      `${word(total)} shared equally into ${word(groups)} groups. How many in each group?`,
      [`${total}`, `${DIVIDE} ${groups}`, '= ?'], `${total} ${DIVIDE} ${groups} = ?`,
      [`${total} ${DIVIDE} ${groups} = ?`, `${groups} ${TIMES} ${size} = ?`, `${total} ${MINUS} ${groups} = ?`],
      undefined, 25,
    );
  }
  return base(
    level, 'groups', { a: groups, b: size, groups, size, total, sharing }, total,
    `${word(groups)} groups with ${word(size)} in each. How many altogether?`,
    [`${groups} ${TIMES} ${size}`, '= ?'], `${groups} ${TIMES} ${size} = ?`,
    [`${groups} ${TIMES} ${size} = ?`, `${groups} + ${size} = ?`, `${total} ${DIVIDE} ${groups} = ?`],
    undefined, 25,
  );
}

function twoStep(level = 8): StoryProblem {
  const a = rand(5, 14);
  const b = rand(2, Math.min(8, a));
  const afterLeaving = a - b;
  const c = rand(2, Math.min(8, 20 - afterLeaving));
  const answer = afterLeaving + c;
  return base(
    level, 'two-step', { a, b, c, afterLeaving, answer }, answer,
    `${word(a)} were playing. ${word(b)} went home. Then ${word(c)} more came. How many now?`,
    [`${a}`, `${MINUS} ${b}`, `+ ${c}`, '= ?'], `${a} ${MINUS} ${b} + ${c} = ?`,
    [`${a} ${MINUS} ${b} + ${c} = ?`, `${a} ${MINUS} ${b} = ?`, `${a} + ${b} + ${c} = ?`],
    a + b <= 20 ? a + b : undefined,
  );
}

/** Exported so every level's ranges can be stress-tested. */
export function generateStoryProblem(level: number): StoryProblem {
  switch (level) {
    case 1: return join();
    case 2: return separate();
    case 3: return partWhole();
    case 4: return changeUnknown();
    case 5: return compare();
    case 6: return startUnknown();
    case 7: return equalGroups();
    case 8:
      if (Math.random() < 0.3) return twoStep();
      return [join, separate, partWhole, changeUnknown, compare, startUnknown, equalGroups][rand(0, 6)](8);
    default: return join(level);
  }
}

function actor(icon: string, hue = 0): HTMLElement {
  const el = h('span', `story-actor${icon ? '' : ' story-count-token'}`, icon ? [icon] : []);
  if (hue) el.style.filter = `hue-rotate(${hue}deg)`;
  return el;
}

function actorGroup(icon: string, count: number, cls = '', hue = 0): { el: HTMLElement; actors: HTMLElement[] } {
  const actors = Array.from({ length: count }, () => actor(icon, hue));
  return { el: h('div', `story-actor-group ${cls}`, actors), actors };
}

function line(stage: HTMLElement, ...groups: HTMLElement[]): HTMLElement {
  const row = h('div', 'story-line', groups);
  stage.append(row);
  return row;
}

async function speakLine(text: string, fast: boolean): Promise<void> {
  await say(text, fast ? { rate: 1.25 } : undefined);
}

async function dealStage(stage: HTMLElement, p: StoryProblem, fast: boolean): Promise<void> {
  const groups = Number(p.values.groups);
  const total = Number(p.values.total);
  const pool = actorGroup(total > 20 ? '' : p.icon, total, 'story-pool');
  const nests = Array.from({ length: groups }, () => h('div', 'story-share-nest', [p.containerIcon ?? '🪺']));
  line(stage, pool.el);
  stage.append(h('div', 'story-share-row', nests));
  const speaking = speakLine(p.lines[0], fast);
  for (let i = 0; i < pool.actors.length; i++) {
    nests[i % groups].append(pool.actors[i]);
    await wait(fast ? 18 : 55);
  }
  pool.el.remove();
  await speaking;
}

async function playStory(stage: HTMLElement, p: StoryProblem, fast = false): Promise<void> {
  stage.className = `story-stage story-${p.backdrop}${fast ? ' fast' : ''}`;
  stage.replaceChildren(h('div', 'story-sun', ['☀️']));
  const a = Number(p.values.a ?? 0);
  const b = Number(p.values.b ?? 0);

  if (p.kind === 'sharing') {
    await dealStage(stage, p, fast);
    return;
  }
  if (p.kind === 'groups') {
    const groups = Number(p.values.groups);
    const size = Number(p.values.size);
    const stageIcon = groups * size > 20 ? '' : p.icon;
    const row = h('div', 'story-group-row');
    for (let i = 0; i < groups; i++) row.append(h('div', 'story-stage-nest', [p.containerIcon ?? '🪺', actorGroup(stageIcon, size, 'story-nest-items').el]));
    stage.append(row);
    await speakLine(p.lines[0], fast);
    return;
  }
  if (p.kind === 'compare') {
    line(stage, actorGroup(p.icon, a, 'story-compare-row', 0).el);
    await speakLine(p.lines[0], fast);
    line(stage, actorGroup(p.secondIcon ?? p.icon, b, 'story-compare-row', 145).el);
    if (p.lines[1]) await speakLine(p.lines[1], fast);
    return;
  }
  if (p.kind === 'part-whole') {
    const row = line(stage);
    row.append(actorGroup(p.icon, a, 'story-part', 0).el, actorGroup(p.icon, b, 'story-part', 145).el);
    for (const storyLine of p.lines) await speakLine(storyLine, fast);
    return;
  }

  const initialCount = p.kind === 'join' || p.kind === 'change-unknown' ? a : Number(p.values.start ?? a);
  const initial = actorGroup(p.icon, initialCount, 'story-initial');
  line(stage, initial.el);
  await speakLine(p.lines[0], fast);

  if (p.kind === 'join' || p.kind === 'change-unknown') {
    const incoming = actorGroup(p.icon, b, 'story-incoming');
    initial.el.append(...incoming.actors);
    await speakLine(p.lines[1], fast);
    if (p.lines[2]) await speakLine(p.lines[2], fast);
    return;
  }

  const leaving = initial.actors.slice(-b);
  if (p.action === 'hatch') leaving.forEach((el) => el.replaceChildren('🐣'));
  if (p.action === 'nap') leaving.forEach((el) => el.replaceChildren('😴'));
  if (p.action === 'share') stage.append(h('span', 'story-friend', ['🐉']));
  if (p.action === 'fly') stage.append(h('span', 'story-ember', ['🐉']));
  leaving.forEach((el) => el.classList.add(`story-leave-${p.action ?? 'fly'}`));
  await speakLine(p.lines[1], fast);
  leaving.forEach((el) => el.remove());

  if (p.kind === 'two-step') {
    const c = Number(p.values.c);
    const incoming = actorGroup(p.icon, c, 'story-incoming');
    initial.el.append(...incoming.actors);
    await speakLine(p.lines[2], fast);
  } else if (p.lines[2]) {
    await speakLine(p.lines[2], fast);
  }
}

function sharingModel(groups: number, total: number, icon: string, containerIcon: string): Model {
  const nests = Array.from({ length: groups }, () => h('div', 'story-deal-nest', [containerIcon]));
  return {
    el: h('div', 'story-deal-model', nests),
    async hint() {
      await say(`Share ${word(total)} equally. One for each group, over and over.`);
      for (let i = 0; i < total; i++) {
        const egg = actor(icon);
        nests[i % groups].append(egg);
        sfx.count(i + 1);
        await say('One for you.', { rate: 1.1 });
      }
      await say(`${word(total)} shared into ${word(groups)} groups is ${word(total / groups)} in each group.`);
    },
  };
}

function hintModel(p: StoryProblem): Model {
  const a = Number(p.values.a ?? 0);
  const b = Number(p.values.b ?? 0);
  switch (p.kind) {
    case 'join': return addModel(a, b);
    case 'separate': return subModel(a, b);
    case 'part-whole':
      return p.values.wholeUnknown ? addModel(a, b) : missingModel(a, Number(p.values.whole));
    case 'change-unknown': return missingModel(a, Number(p.values.total));
    case 'compare': return missingModel(Number(p.values.smaller), Number(p.values.bigger));
    case 'start-unknown': return addModel(Number(p.values.result), b);
    case 'groups': return groupsModel(Number(p.values.groups), Number(p.values.size));
    case 'sharing': return sharingModel(Number(p.values.groups), Number(p.values.total), p.icon, p.containerIcon ?? '🪺');
    case 'two-step': {
      const first = subModel(a, b);
      const second = addModel(Number(p.values.afterLeaving), Number(p.values.c));
      return {
        el: h('div', 'story-two-model', [first.el, second.el]),
        async hint() {
          await say('First, act out who went home.');
          await first.hint();
          await say('Then, count on the friends who came.');
          await second.hint();
        },
      };
    }
  }
}

function preHint(p: StoryProblem): Promise<void> {
  if (p.kind === 'compare') return say('Match them up: the extra ones are the answer.');
  if (p.kind === 'start-unknown') return say('Put the ones who left back!');
  return Promise.resolve();
}

function fitModel(card: HTMLElement, stage: HTMLElement) {
  card.style.zoom = '1';
  const rect = card.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const scale = Math.max(0.55, Math.min((stage.clientWidth * 0.82) / rect.width, (stage.clientHeight * 0.78) / rect.height, 4));
  card.style.zoom = scale.toFixed(3);
}

function glow(from: HTMLElement, to: HTMLElement) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const x1 = a.left + a.width / 2;
  const y1 = a.top + a.height / 2;
  const x2 = b.left + b.width / 2;
  const y2 = b.top + b.height / 2;
  const beam = h('div', 'glow-beam');
  beam.style.left = `${x1}px`;
  beam.style.top = `${y1}px`;
  beam.style.width = `${Math.hypot(x2 - x1, y2 - y1)}px`;
  beam.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
  document.body.append(beam);
  setTimeout(() => beam.remove(), 600);
}

function stripEl(p: StoryProblem): HTMLElement {
  return h('div', 'story-strip', p.strip.map((part, i) => {
    let icon = p.icon;
    if (p.kind === 'compare' && i === 1) icon = p.secondIcon ?? p.icon;
    if (p.kind === 'sharing' && i === 1) icon = p.containerIcon ?? '🪺';
    return h('span', 'story-strip-part', [part, ...(i < p.strip.length - 1 ? [icon] : [])]);
  }));
}

async function sentenceBeat(stage: HTMLElement, p: StoryProblem): Promise<boolean> {
  const box = h('div', 'story-sentence-choices');
  const choices: Choice<string>[] = p.sentenceChoices.map((value) => {
    const card = h('button', 'story-sentence-card', [value]);
    card.dataset.correct = String(value === p.equation);
    box.append(card);
    return { el: card, value };
  });
  stage.after(box);
  void prompt('Which number puzzle matches the story?');
  let hinted = false;
  const firstTry = await awaitChoice(choices, (value) => value === p.equation, {
    onRight: async () => {
      await say("That's the story's number puzzle.");
      box.remove();
    },
    onWrong: async () => {
      if (!hinted) {
        hinted = true;
        await say("Let's act it out once more.");
        await playStory(stage, p, true);
      } else await say('Look at what happened, then try another number puzzle.');
      void prompt('Which number puzzle matches the story?');
    },
  });
  return firstTry;
}

async function answerBeat(shell: HTMLElement, stage: HTMLElement, p: StoryProblem): Promise<boolean> {
  const answers = h('div', 'story-answers');
  const ember = h('span', 'story-answer-ember', ['🐉']);
  shell.append(ember, answers);
  const choices: Choice<number>[] = p.choices.map((value, i) => {
    const egg = h('div', 'egg story-answer', [h('span', 'numeral', [String(value)])]);
    egg.style.left = `${((i + 0.5) / p.choices.length) * 100}%`;
    egg.style.setProperty('--dur', `${rand(45, 70) / 10}s`);
    egg.style.setProperty('--delay', `-${rand(0, 60) / 10}s`);
    egg.dataset.correct = String(value === p.answer);
    answers.append(egg);
    return { el: egg, value };
  });
  void prompt(p.ask);
  let hinted = false;
  const model = hintModel(p);
  return awaitChoice(choices, (value) => value === p.answer, {
    onTap: async (choice) => {
      sfx.glow();
      glow(ember, choice.el);
      choice.el.classList.add('warming');
      await wait(350);
      choice.el.classList.remove('warming');
    },
    onRight: async () => {
      await say(pick(['You acted it out in your head!', 'That was a tricky one!', 'You found the missing part!']));
    },
    onWrong: async () => {
      shell.classList.add('paused');
      if (!hinted) {
        hinted = true;
        await say("Hmm, not that one. Let's act it out.");
        await playStory(stage, p, true);
        const card = h('div', 'story-model-card', [model.el]);
        stage.append(card);
        requestAnimationFrame(() => fitModel(card, stage));
        await preHint(p);
        await model.hint();
        await say(p.equation.replace('?', word(p.answer)).replace(MINUS, ' minus ').replace(TIMES, ' times ').replace(DIVIDE, ' divided by '));
      } else {
        await say('Look at the picture and try another egg.');
      }
      shell.classList.remove('paused');
      void prompt(p.ask);
    },
  });
}

async function storyScene(play: HTMLElement, p: StoryProblem, showSentenceBeat: boolean): Promise<boolean> {
  play.classList.add('story-scene');
  const stage = h('div', 'story-stage');
  const shell = h('div', 'story-shell', [stage]);
  play.append(shell);
  await playStory(stage, p);
  shell.append(stripEl(p));
  let firstTry = true;
  if (showSentenceBeat) firstTry = await sentenceBeat(stage, p);
  const answerFirstTry = await answerBeat(shell, stage, p);
  return firstTry && answerFirstTry;
}

let sentenceTurn = 0;

export const dinoStory: Game = {
  id: 'story',
  name: 'Dino Story',
  icon: '📖',
  skill: 'Word problems: adding, taking away, comparing, missing numbers and equal groups',
  about:
    'Short stories acted out by dinos: some come to play, some fly home on Ember, eggs hatch, gems are shared. Your child works out the answer, and if it\'s tricky, the game acts the story out again and shows it as a picture. The levels follow the story types children find easier and harder, ending with "how many more?", "how many at the start?" and choosing the number sentence that matches the story.',
  levels: [
    'Some come to play: how many now?',
    'Some fly home: how many are left?',
    'Two kinds together (green and blue dinos)',
    'Some more came: how many came?',
    'How many more (or fewer)?',
    'How many at the start? Plus matching the number sentence',
    'Equal groups and sharing (4 nests of 3 eggs, 12 shared by 3)',
    'Mixed stories, including two-step stories',
  ],
  intro: 'Dino Story! Watch what the dinos do, then help Ember answer the question.',

  runProblem({ play, level }) {
    const hasSentenceBeat = level === 6 || level === 8;
    const showSentenceBeat = hasSentenceBeat && sentenceTurn++ % 2 === 0;
    return storyScene(play, generateStoryProblem(level), showSentenceBeat);
  },
};
