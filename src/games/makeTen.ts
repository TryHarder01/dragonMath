import { h, rand } from '../core/dom';
import { sfx } from '../core/sound';
import { say, wait, word } from '../core/voice';
import { eggScene } from './eggScene';
import {
  addProblem,
  choicesWithMistake,
  nestModel,
  question,
  type NestAnswer,
  type NestModel,
} from './nestBuilder';
import type { Game } from './types';

const MINUS = '−';

type MakeTenKind = 'partner' | 'fill' | 'split' | 'add-chain' | 'add-total' | 'sub-chain' | 'sub-total';

export interface MakeTenProblem {
  kind: MakeTenKind;
  a: number;
  b: number;
  bridge: number;
  rest: number;
  target: number;
  beats: NestAnswer[];
}

function choicesWithMistakes(answer: number, min: number, max: number, mistakes: number[]): number[] {
  const valid = mistakes.filter((n, i) => n >= min && n <= max && n !== answer && mistakes.indexOf(n) === i);
  const choices = choicesWithMistake(answer, min, max, valid[0]);
  for (const mistake of valid.slice(1)) {
    if (choices.includes(mistake)) continue;
    const replace = choices.findIndex((n) => n !== answer && !valid.includes(n));
    if (replace >= 0) choices[replace] = mistake;
  }
  return choices;
}

function partnerProblem(a = rand(1, 9)): MakeTenProblem {
  const bridge = 10 - a;
  return {
    kind: 'partner', a, b: 10, bridge, rest: bridge, target: 10,
    beats: [{ answer: bridge, choices: choicesWithMistakes(bridge, 1, 9, [a, bridge - 1, bridge + 1]) }],
  };
}

function teenPair(): [number, number] {
  const a = rand(6, 9);
  return [a, rand(11 - a, 9)];
}

function bigPair(): [number, number] {
  const a = rand(1, 8) * 10 + rand(2, 9);
  const bridge = Math.ceil(a / 10) * 10 - a;
  return [a, rand(bridge + 1, 9)];
}

function addPlan(kind: 'fill' | 'split' | 'add-chain' | 'add-total', a: number, b: number): MakeTenProblem {
  const max = a < 10 ? 20 : 99;
  const base = addProblem(a < 10 ? 'add-small' : 'add-big', a, b, false, max);
  const bridge = base.beats[0].answer;
  const rest = b - bridge;
  const target = a + bridge;
  const bridgeBeat = { answer: bridge, choices: choicesWithMistakes(bridge, 1, 9, [b, bridge - 1, bridge + 1]) };
  const restBeat = { answer: rest, choices: choicesWithMistakes(rest, 1, 9, [b, bridge, rest - 1, rest + 1]) };
  const total = a + b;
  const totalBeat = { answer: total, choices: choicesWithMistakes(total, 0, max, [total - 1, total + 1, target + b]) };
  const beats = kind === 'fill' ? [bridgeBeat] : kind === 'split' ? [restBeat] : kind === 'add-chain'
    ? [bridgeBeat, restBeat, totalBeat]
    : [totalBeat];
  return { kind, a, b, bridge, rest, target, beats };
}

function subPlan(kind: 'sub-chain' | 'sub-total', a = rand(11, 18), b = rand(a - 9, 9)): MakeTenProblem {
  const bridge = a - 10;
  const rest = b - bridge;
  const final = a - b;
  const bridgeBeat = { answer: bridge, choices: choicesWithMistakes(bridge, 1, 9, [b, bridge - 1, bridge + 1]) };
  const restBeat = { answer: rest, choices: choicesWithMistakes(rest, 1, 9, [b, bridge, rest - 1, rest + 1]) };
  const totalBeat = { answer: final, choices: choicesWithMistakes(final, 0, 20, [final - 1, final + 1, 10 - b]) };
  return { kind, a, b, bridge, rest, target: 10, beats: kind === 'sub-chain' ? [bridgeBeat, restBeat, totalBeat] : [totalBeat] };
}

function levelProblem(level: number): MakeTenProblem {
  switch (level) {
    case 1: return partnerProblem();
    case 2: {
      const [a, b] = teenPair();
      return addPlan('fill', a, b);
    }
    case 3: {
      const [a, b] = teenPair();
      return addPlan('split', a, b);
    }
    case 4: {
      const [a, b] = teenPair();
      return addPlan('add-chain', a, b);
    }
    case 5: {
      const [a, b] = bigPair();
      return addPlan('add-chain', a, b);
    }
    case 6: {
      const [a, b] = Math.random() < 0.5 ? teenPair() : bigPair();
      return addPlan('add-total', a, b);
    }
    case 7: return subPlan('sub-chain');
    default: {
      if (Math.random() < 0.5) return subPlan('sub-total');
      const [a, b] = Math.random() < 0.5 ? teenPair() : bigPair();
      return addPlan('add-total', a, b);
    }
  }
}

/** Exported so every level's ranges and choices can be stress-tested. */
export function generateMakeTenProblem(level: number): MakeTenProblem {
  return levelProblem(level);
}

interface MakeTenModel extends NestModel {
  partnerHint(): Promise<void>;
  moveBridge(): Promise<void>;
  highlightBridge(): Promise<void>;
  countRest(): Promise<void>;
  revealSplit(): void;
  finishAdd(): Promise<void>;
  finishSubtract(): Promise<void>;
}

function makeTenModel(plan: MakeTenProblem, detailInitially: boolean, hasSplitBeat: boolean): MakeTenModel {
  const subtract = plan.kind.startsWith('sub');
  const bridgeDone = plan.kind === 'split';
  const nest = bridgeDone
    ? nestModel({ tens: 0, ones: 10 })
    : nestModel({ tens: Math.floor(plan.a / 10), ones: plan.a % 10 });
  const basketEggs = Array.from({ length: plan.kind === 'partner' ? 0 : plan.b }, (_, i) => {
    const egg = h('i', `dot egg-dot make-ten-basket-egg${i < plan.bridge ? ' bridge' : ' rest'}`);
    if (bridgeDone && i < plan.bridge) egg.classList.add('moved');
    return egg;
  });
  const basket = h('div', 'make-ten-basket', basketEggs);
  const bridgePart = h('span', 'make-ten-bond-circle bridge', [plan.kind === 'partner' ? String(plan.a) : bridgeDone ? String(plan.bridge) : '?']);
  const restPart = h('span', 'make-ten-bond-circle rest', ['?']);
  const whole = h('span', 'make-ten-bond-circle whole', [String(plan.kind === 'partner' ? 10 : plan.b)]);
  const bond = h('div', 'make-ten-bond', [whole, h('span', 'make-ten-bond-lines'), h('div', 'make-ten-bond-parts', [bridgePart, restPart])]);
  const chain = h('div', 'make-ten-chain');
  const detail = h('div', `make-ten-detail${detailInitially ? '' : ' hidden'}`, [basket, bond, chain]);
  if (!basketEggs.length) {
    basket.remove();
    detail.classList.add('no-basket');
  }
  const el = h('div', 'make-ten-model', [h('div', 'make-ten-picture', [nest.el, detail])]);
  el.dataset.splitBeat = hasSplitBeat ? 'true' : 'false';

  let bridgeMoved = bridgeDone;
  let splitShown = false;
  let finished = false;

  function renderChain(stage: number) {
    let steps: string[];
    if (plan.kind === 'partner') {
      steps = [`10 = ${plan.a} + ${stage ? plan.bridge : '?'}`];
    } else if (subtract) {
      steps = [`${plan.a} ${MINUS} ${plan.b}`];
      if (stage >= 1) steps.push(`${plan.a} ${MINUS} ${plan.bridge} ${MINUS} ${stage >= 2 ? plan.rest : '?'}`);
      if (stage >= 2) steps.push(`10 ${MINUS} ${plan.rest}`);
      if (stage >= 3) steps.push(String(plan.a - plan.b));
    } else {
      steps = [`${plan.a} + ${plan.b}`];
      if (stage >= 1) steps.push(`${plan.a} + ${plan.bridge} + ${stage >= 2 ? plan.rest : '?'}`);
      if (stage >= 2) steps.push(`${plan.target} + ${plan.rest}`);
      if (stage >= 3) steps.push(String(plan.a + plan.b));
    }
    chain.replaceChildren();
    steps.forEach((step, i) => {
      if (i) chain.append(h('span', 'make-ten-chain-arrow', ['→']));
      chain.append(h('span', 'make-ten-chain-step', [step]));
    });
  }

  function revealDetails() {
    detail.classList.remove('hidden');
  }

  function showBridge() {
    bridgePart.textContent = String(plan.kind === 'partner' ? plan.a : plan.bridge);
    renderChain(1);
  }

  function revealSplit() {
    splitShown = true;
    restPart.textContent = String(plan.rest);
    renderChain(2);
  }

  async function partnerHint() {
    if (finished) return;
    await nest.fillTo10();
    restPart.textContent = String(plan.bridge);
    renderChain(1);
    finished = true;
    await say(`That's ${word(plan.bridge)} more.`);
  }

  async function moveBridge() {
    if (bridgeMoved) return;
    revealDetails();
    const eggs = basketEggs.slice(0, plan.bridge);
    eggs.forEach((egg) => egg.classList.add('hopping'));
    await wait(180);
    if (subtract) await nest.hatchTo(plan.target);
    else await nest.fillTo10();
    eggs.forEach((egg) => egg.classList.remove('hopping'));
    eggs.forEach((egg) => egg.classList.add('moved'));
    bridgeMoved = true;
    showBridge();
  }

  async function highlightBridge() {
    revealDetails();
    bridgePart.classList.add('flash');
    basketEggs.slice(0, plan.bridge).forEach((egg) => egg.classList.add('flash'));
    await say(subtract ? `${word(plan.bridge)} walked home.` : `${word(plan.bridge)} went in the nest.`);
    await wait(220);
    bridgePart.classList.remove('flash');
    basketEggs.slice(0, plan.bridge).forEach((egg) => egg.classList.remove('flash'));
  }

  async function countRest() {
    if (splitShown) return;
    revealDetails();
    const eggs = basketEggs.slice(plan.bridge);
    for (let i = 0; i < eggs.length; i++) {
      eggs[i].classList.add('lit');
      sfx.count(i + 1);
      await say(word(i + 1), { rate: 1 });
      await wait(60);
    }
    revealSplit();
    await say(`${word(plan.b)} is ${word(plan.bridge)} and ${word(plan.rest)}.`);
  }

  async function finishAdd() {
    if (finished) return;
    revealDetails();
    if (!bridgeMoved) await moveBridge();
    if (!splitShown) revealSplit();
    const eggs = basketEggs.slice(plan.bridge);
    eggs.forEach((egg) => egg.classList.add('hopping'));
    await say(word(plan.target));
    await nest.spill(plan.rest);
    eggs.forEach((egg) => egg.classList.remove('hopping'));
    eggs.forEach((egg) => egg.classList.add('moved'));
    finished = true;
    renderChain(3);
  }

  async function finishSubtract() {
    if (finished) return;
    revealDetails();
    if (!bridgeMoved) await moveBridge();
    if (!splitShown) revealSplit();
    const eggs = basketEggs.slice(plan.bridge);
    eggs.forEach((egg) => egg.classList.add('hopping'));
    await nest.hatchTo(plan.a - plan.b);
    eggs.forEach((egg) => egg.classList.remove('hopping'));
    eggs.forEach((egg) => egg.classList.add('moved'));
    finished = true;
    renderChain(3);
  }

  renderChain(bridgeDone ? 1 : 0);
  return {
    el,
    fillTo10: nest.fillTo10,
    spill: nest.spill,
    hatchTo: nest.hatchTo,
    prepareOpenTuck: nest.prepareOpenTuck,
    tuckTarget: nest.tuckTarget,
    tuckOne: nest.tuckOne,
    partnerHint,
    moveBridge,
    highlightBridge,
    countRest,
    revealSplit,
    finishAdd,
    finishSubtract,
  };
}

async function runPartner(play: HTMLElement, plan: MakeTenProblem): Promise<boolean> {
  const model = makeTenModel(plan, true, false);
  return eggScene(play, question(
    `10 = ${plan.a} + ?`,
    `Ten is ${word(plan.a)} and how many more?`,
    plan.beats[0], model, model.partnerHint, true,
    async () => {
      await model.partnerHint();
      await say('You made ten!');
    },
  ));
}

async function runFill(play: HTMLElement, plan: MakeTenProblem): Promise<boolean> {
  const model = makeTenModel(plan, true, false);
  return eggScene(play, question(
    `${plan.a} + ${plan.b} → ${plan.target}`,
    `${word(plan.a)} in the nest, ${word(plan.b)} in the basket. How many of the ${word(plan.b)} fill the nest?`,
    plan.beats[0], model,
    async () => {
      await model.moveBridge();
      await say(`That's ${word(plan.bridge)} eggs.`);
    }, true,
    async () => {
      await model.moveBridge();
      await say('Fill the nest, then the rest!');
    },
  ));
}

async function runSplit(play: HTMLElement, plan: MakeTenProblem): Promise<boolean> {
  const model = makeTenModel(plan, true, true);
  return eggScene(play, question(
    `${plan.b} = ${plan.bridge} + ?`,
    `${word(plan.bridge)} eggs filled the nest. ${word(plan.b)} is ${word(plan.bridge)} and how many more?`,
    plan.beats[0], model,
    async () => {
      await model.highlightBridge();
      await model.countRest();
    }, true,
    async () => {
      model.revealSplit();
      await say(`You split the ${word(plan.b)} to make ten!`);
    },
  ));
}

async function runAddChain(play: HTMLElement, plan: MakeTenProblem): Promise<boolean> {
  const model = makeTenModel(plan, true, true);
  const first = await eggScene(play, question(
    `${plan.a} + ${plan.b} → ${plan.target}`,
    plan.a < 10
      ? `${word(plan.a)} plus ${word(plan.b)}. How many of the ${word(plan.b)} fill the nest?`
      : `${word(plan.a)} plus ${word(plan.b)}. How many make ${word(plan.target)}?`,
    plan.beats[0], model,
    async () => {
      await model.moveBridge();
      await say(`That's ${word(plan.bridge)}.`);
    }, true,
    model.moveBridge,
  ));

  play.replaceChildren();
  const second = await eggScene(play, question(
    `${plan.b} = ${plan.bridge} + ?`,
    `${word(plan.b)} is ${word(plan.bridge)} and how many more?`,
    plan.beats[1], model,
    async () => {
      await model.highlightBridge();
      await model.countRest();
    }, true,
    async () => model.revealSplit(),
  ));

  play.replaceChildren();
  const third = await eggScene(play, question(
    `${plan.target} + ${plan.rest}`,
    `${word(plan.target)} and ${word(plan.rest)} more. How many?`,
    plan.beats[2], model,
    async () => {
      await model.finishAdd();
      await say(`${word(plan.target)} and ${word(plan.rest)} is ${word(plan.a + plan.b)}.`);
    }, true,
    async () => {
      await model.finishAdd();
      await say(`${word(plan.a)} plus ${word(plan.b)}. ${word(plan.a)} and ${word(plan.bridge)} make ${word(plan.target)}, and ${word(plan.rest)} more is ${word(plan.a + plan.b)}!`);
      await say('Fill the nest, then the rest!');
    },
  ));
  return first && second && third;
}

async function runAddTotal(play: HTMLElement, plan: MakeTenProblem): Promise<boolean> {
  const model = makeTenModel(plan, false, false);
  return eggScene(play, question(
    `${plan.a} + ${plan.b}`,
    `${word(plan.a)} plus ${word(plan.b)}. Warm the egg with the answer!`,
    plan.beats[0], model,
    async () => {
      await model.moveBridge();
      await model.highlightBridge();
      await model.countRest();
      await model.finishAdd();
      await say(`${word(plan.a)} plus ${word(plan.b)}. ${word(plan.a)} and ${word(plan.bridge)} make ${word(plan.target)}, and ${word(plan.rest)} more is ${word(plan.a + plan.b)}!`);
    }, true,
    () => say('Fill the nest, then the rest!'),
  ));
}

async function runSubChain(play: HTMLElement, plan: MakeTenProblem): Promise<boolean> {
  const model = makeTenModel(plan, true, true);
  const first = await eggScene(play, question(
    `${plan.a} ${MINUS} ${plan.b} → 10`,
    `${word(plan.a)} minus ${word(plan.b)}. How many walk home to get down to ten?`,
    plan.beats[0], model,
    async () => {
      await model.moveBridge();
      await say(`${word(plan.bridge)} walked home. Now we're at ten.`);
    }, true,
    model.moveBridge,
  ));

  play.replaceChildren();
  const second = await eggScene(play, question(
    `${plan.b} = ${plan.bridge} + ?`,
    `${word(plan.b)} is ${word(plan.bridge)} and how many more?`,
    plan.beats[1], model,
    async () => {
      await model.highlightBridge();
      await model.countRest();
    }, true,
    async () => model.revealSplit(),
  ));

  play.replaceChildren();
  const third = await eggScene(play, question(
    `10 ${MINUS} ${plan.rest}`,
    `Ten, and ${word(plan.rest)} more walk home. How many are left?`,
    plan.beats[2], model,
    async () => {
      await model.finishSubtract();
      await say(`Ten minus ${word(plan.rest)} is ${word(plan.a - plan.b)}.`);
    }, true,
    async () => {
      await model.finishSubtract();
      await say(`${word(plan.a)} minus ${word(plan.b)}. ${word(plan.bridge)} to ten, then ${word(plan.rest)} more. ${word(plan.a - plan.b)} are left!`);
      await say('Down to ten, then the rest!');
    },
  ));
  return first && second && third;
}

async function runSubTotal(play: HTMLElement, plan: MakeTenProblem): Promise<boolean> {
  const model = makeTenModel(plan, false, false);
  return eggScene(play, question(
    `${plan.a} ${MINUS} ${plan.b}`,
    `${word(plan.a)} minus ${word(plan.b)}. Warm the egg with the answer!`,
    plan.beats[0], model,
    async () => {
      await model.moveBridge();
      await model.highlightBridge();
      await model.countRest();
      await model.finishSubtract();
      await say(`${word(plan.a)} minus ${word(plan.b)}. ${word(plan.bridge)} to ten, then ${word(plan.rest)} more. ${word(plan.a - plan.b)} are left!`);
    }, true,
    () => say('Down to ten, then the rest!'),
  ));
}

export const makeTen: Game = {
  id: 'maketen',
  name: 'Make Ten',
  icon: '🔟',
  skill: 'The make-ten strategy: split a number to fill a ten, then add or take away the rest',
  about:
    'Focused practice on the strategy children use to add and subtract across ten without counting. To do 8 + 5, split the 5 into the 2 that fills the ten and the 3 left over, so 8 + 5 = 10 + 3. Your child practises each step on its own (partners of ten, splitting a number, ten and some more), then the whole chain, then the same idea with bigger numbers (38 + 5 = 40 + 3) and for taking away (13 − 5 = 10 − 2). The split is the step children most often miss, so it is shown as a number bond.',
  levels: [
    'Partners of ten: 10 is 8 and ?',
    'How many from the basket fill the nest?',
    'Split the number: 5 is 2 and ?',
    'The whole chain: 8 + 5 = 8 + 2 + 3 = 10 + 3',
    'On to the tens: 38 + 5 = 38 + 2 + 3 = 40 + 3',
    'Add across ten in one step (hint shows the chain)',
    'Down to ten: 13 − 5 = 13 − 3 − 2 = 10 − 2',
    'Mixed adding and taking away across ten',
  ],
  intro: 'Make Ten! Fill the nest to ten first, then the rest. Let\'s split the eggs!',

  runProblem({ play, level }) {
    const audit = new URLSearchParams(location.search).has('audit');
    const plan = audit && level === 1 ? partnerProblem(8)
      : audit && level === 4 ? addPlan('add-chain', 8, 5)
      : audit && level === 5 ? addPlan('add-chain', 89, 9)
      : audit && level === 7 ? subPlan('sub-chain', 18, 9)
      : generateMakeTenProblem(level);
    switch (plan.kind) {
      case 'partner': return runPartner(play, plan);
      case 'fill': return runFill(play, plan);
      case 'split': return runSplit(play, plan);
      case 'add-chain': return runAddChain(play, plan);
      case 'add-total': return runAddTotal(play, plan);
      case 'sub-chain': return runSubChain(play, plan);
      case 'sub-total': return runSubTotal(play, plan);
    }
  },
};
