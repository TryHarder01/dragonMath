// Gem Bags: place value as visible bags of ten and loose gems.
// Children count, build, compare, add, and share hoards up to 99. The picture
// stays concrete: every pouch is exactly ten and loose gems sit five-and-five.

import { awaitChoice, type Choice } from '../core/choices';
import { burst, h, nearChoices, pick, rand, shuffle } from '../core/dom';
import type { Model } from '../core/models';
import { sfx } from '../core/sound';
import { prompt, say, wait } from '../core/voice';
import { eggScene, type EggQuestion } from './eggScene';
import { lines } from './gemBags.lines';
import type { Game } from './types';

const MINUS = '−';

type Kind = 'count' | 'build' | 'compare' | 'add-tens' | 'sub-tens' | 'add' | 'sub' | 'regroup';

interface GemProblem {
  level: number;
  kind: Kind;
  a: number;
  b?: number;
  answer: number;
  choices: number[];
}

interface Hoard {
  el: HTMLElement;
  bags: HTMLElement[];
  gems: HTMLElement[];
}

interface GemModel extends Model {
  countUp(): Promise<void>;
}

function split(n: number): [number, number] {
  return [Math.floor(n / 10), n % 10];
}

function bag(): HTMLElement {
  return h('span', 'gem-bag', [h('b', '', ['10'])]);
}

function gem(): HTMLElement {
  return h('span', 'gem-loose', ['💎']);
}

function hoard(tens: number, ones: number, extraClass = ''): Hoard {
  const bags = Array.from({ length: tens }, bag);
  const gems = Array.from({ length: ones }, gem);
  return {
    el: h('div', `gem-hoard ${extraClass}`.trim(), [
      h('div', 'gem-bags', bags),
      h('div', 'gem-loose-grid', gems),
    ]),
    bags,
    gems,
  };
}

async function light(el: HTMLElement, n: number, line = String(n)) {
  el.classList.add('lit');
  sfx.count(n);
  await say(line, { rate: 1 });
  await wait(60);
}

async function countHoard(view: Hoard, tens: number, ones: number) {
  for (let i = 0; i < tens; i++) await light(view.bags[i], i + 1, String((i + 1) * 10));
  for (let i = 0; i < ones; i++) await light(view.gems[i], tens * 10 + i + 1);
}

/** Bags of ten plus loose gems, with a count-by-tens strategy hint. */
function gemsModel(tens: number, ones: number): GemModel {
  const view = hoard(tens, ones);
  return {
    el: view.el,
    countUp: () => countHoard(view, tens, ones),
    async hint() {
      await say(lines.countBagsFirst);
      await countHoard(view, tens, ones);
      await say(lines.countResult(tens, ones));
    },
  };
}

function operationModel(a: number, b: number, operation: 'add' | 'sub'): Model {
  const [aTens, aOnes] = split(a);
  const [bTens, bOnes] = split(b);
  const left = hoard(aTens, aOnes);
  const change = hoard(bTens, bOnes, 'gem-change-hoard');
  const symbol = h('div', 'gem-operation', [operation === 'add' ? '+' : MINUS]);
  const friend = h('div', 'gem-friend', ['🐉']);
  const el = h('div', 'gem-equation-model', [left.el, symbol, change.el, friend]);
  const answer = operation === 'add' ? a + b : a - b;

  return {
    el,
    async hint() {
      if (bOnes === 0) {
        await say(operation === 'add' ? lines.bagsArrive : lines.bagsShare);
        for (let i = 0; i < bTens; i++) {
          change.bags[i].classList.add(operation === 'add' ? 'arriving' : 'sharing');
          const total = operation === 'add' ? a + (i + 1) * 10 : a - (i + 1) * 10;
          await light(change.bags[i], i + 1, String(total));
        }
        await say(lines.bagsResult(a, b, answer, operation === 'add'));
        return;
      }

      await say(lines.tensFirst);
      left.bags.forEach((item) => item.classList.add('lit'));
      change.bags.forEach((item) => item.classList.add(operation === 'add' ? 'combining' : 'sharing'));
      const tensAnswer = operation === 'add' ? (aTens + bTens) * 10 : (aTens - bTens) * 10;
      await say(lines.tensResult(aTens * 10, bTens * 10, tensAnswer, operation === 'add'));
      left.gems.forEach((item) => item.classList.add('lit'));
      change.gems.forEach((item) => item.classList.add(operation === 'add' ? 'combining' : 'sharing'));
      const onesAnswer = operation === 'add' ? aOnes + bOnes : aOnes - bOnes;
      await say(lines.onesResult(aOnes, bOnes, onesAnswer, operation === 'add'));
      await say(lines.makesTotal(answer));
    },
  };
}

function regroupModel(a: number, b: number): Model {
  const [aTens, aOnes] = split(a);
  const left = hoard(aTens, aOnes);
  const added = hoard(0, b, 'gem-change-hoard');
  const combined = hoard(aTens, aOnes + b);
  const result = h('div', 'gem-trade-result', [combined.el]);
  const equation = h('div', 'gem-equation-model', [left.el, h('div', 'gem-operation', ['+']), added.el]);
  const el = h('div', 'gem-regroup-model', [equation, result]);

  return {
    el,
    async hint() {
      await say(lines.regroupStart(a, b));
      equation.remove();
      result.classList.add('show');
      for (let i = 0; i < combined.gems.length; i++) await light(combined.gems[i], i + 1, String(aTens * 10 + i + 1));
      combined.gems.slice(0, 10).forEach((item) => item.classList.add('trading'));
      await say(lines.newBag);
      await wait(350);
      combined.gems.slice(0, 10).forEach((item) => item.remove());
      const newBag = bag();
      newBag.classList.add('new-bag');
      combined.el.querySelector('.gem-bags')!.append(newBag);
      await say(lines.regroupResult(a, b));
    },
  };
}

function placeChoices(answer: number, extras: number[] = []): number[] {
  const swapped = Number(String(answer).padStart(2, '0').split('').reverse().join(''));
  const placeMistakes = shuffle([
    ...extras,
    swapped,
    answer - 10,
    answer + 10,
  ]).filter((n, i, all) => n >= 1 && n <= 99 && n !== answer && all.indexOf(n) === i);
  const preferred = [...placeMistakes, ...nearChoices(answer, 4, 1, 99)]
    .filter((n, i, all) => n !== answer && all.indexOf(n) === i);
  return shuffle([answer, ...preferred.slice(0, 3)]);
}

function compareProblem(): GemProblem {
  let a: number;
  let b: number;
  const tricky = Math.random() < 0.4;
  if (tricky && Math.random() < 0.5) {
    const tens = rand(1, 9);
    let ones = rand(1, 9);
    while (ones === tens) ones = rand(1, 9);
    a = tens * 10 + ones;
    b = ones * 10 + tens;
  } else if (tricky) {
    const lowTens = rand(1, 8);
    const highTens = rand(lowTens + 1, 9);
    a = lowTens * 10 + rand(5, 9);
    b = highTens * 10 + rand(0, 4);
    if (Math.random() < 0.5) [a, b] = [b, a];
  } else {
    a = rand(10, 99);
    b = rand(10, 99);
    while (a === b) b = rand(10, 99);
  }
  return {
    level: 3,
    kind: 'compare',
    a,
    b,
    answer: Math.max(a, b),
    choices: [a, b],
  };
}

function addTens(level: number, oneBag = false): GemProblem {
  const tens = oneBag ? 1 : rand(2, 5);
  const b = tens * 10;
  const a = rand(11, 99 - b);
  const answer = a + b;
  return { level, kind: 'add-tens', a, b, answer, choices: placeChoices(answer) };
}

function subTens(level: number, oneBag = false): GemProblem {
  const tens = oneBag ? 1 : rand(2, 5);
  const b = tens * 10;
  const a = rand(oneBag ? 20 : b + 1, 99);
  const answer = a - b;
  return { level, kind: 'sub-tens', a, b, answer, choices: placeChoices(answer) };
}

function addNoRegroup(level: number): GemProblem {
  let a: number;
  let b: number;
  do {
    a = rand(10, 89);
    b = rand(10, 89);
  } while ((a % 10) + (b % 10) > 9 || a + b > 99);
  const answer = a + b;
  return { level, kind: 'add', a, b, answer, choices: placeChoices(answer) };
}

function subNoRegroup(level: number): GemProblem {
  const bTens = rand(1, 8);
  const aTens = rand(bTens + 1, 9);
  const bOnes = rand(0, 9);
  const aOnes = rand(bOnes, 9);
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  const answer = a - b;
  return { level, kind: 'sub', a, b, answer, choices: placeChoices(answer) };
}

function regroup(level: number): GemProblem {
  let a: number;
  let b: number;
  do {
    a = rand(1, 9) * 10 + rand(1, 9);
    const min = Math.max(1, 10 - (a % 10));
    const max = Math.min(9, 17 - (a % 10));
    b = rand(min, max);
  } while (a + b > 99);
  const answer = a + b;
  const droppedTen = Math.floor(a / 10) * 10 + ((a % 10) + b - 10);
  return { level, kind: 'regroup', a, b, answer, choices: placeChoices(answer, [droppedTen]) };
}

function generateGemProblem(level: number): GemProblem {
  switch (level) {
    case 1: {
      const tens = rand(1, 9), ones = rand(0, 9), answer = tens * 10 + ones;
      return { level, kind: 'count', a: answer, answer, choices: placeChoices(answer) };
    }
    case 2: {
      const highOnes = Math.random() < 0.5;
      const tens = rand(1, 9);
      const ones = highOnes ? rand(5, 9) : rand(tens === 1 ? 1 : 0, 4);
      const answer = tens * 10 + ones;
      return { level, kind: 'build', a: answer, answer, choices: [answer] };
    }
    case 3:
      return compareProblem();
    case 4:
      return Math.random() < 0.5 ? addTens(level, true) : subTens(level, true);
    case 5:
      return Math.random() < 0.5 ? addTens(level) : subTens(level);
    case 6:
      return addNoRegroup(level);
    case 7:
      return subNoRegroup(level);
    case 8:
      if (Math.random() < 0.3) return regroup(level);
      return pick([() => addTens(level, true), () => subTens(level, true), () => addTens(level), () => subTens(level), () => addNoRegroup(level), () => subNoRegroup(level)])();
    default:
      throw new Error(`Unknown Gem Bags level: ${level}`);
  }
}

function question(p: GemProblem): EggQuestion {
  const b = p.b ?? 0;
  const [tens, ones] = split(p.a);
  switch (p.kind) {
    case 'count':
      return {
        text: '?',
        ask: lines.countAsk,
        answer: p.answer,
        choices: p.choices,
        model: gemsModel(tens, ones),
        showModel: true,
      };
    case 'add-tens':
      return {
        text: `${p.a} + ${b}`,
        ask: lines.addTensAsk(p.a, b, p.level),
        answer: p.answer,
        choices: p.choices,
        model: operationModel(p.a, b, 'add'),
        showModel: p.level < 8,
      };
    case 'sub-tens':
      return {
        text: `${p.a} ${MINUS} ${b}`,
        ask: lines.subTensAsk(p.a, b, p.level),
        answer: p.answer,
        choices: p.choices,
        model: operationModel(p.a, b, 'sub'),
        showModel: p.level < 8,
      };
    case 'add':
      return {
        text: `${p.a} + ${b}`,
        ask: lines.addAsk(p.a, b, p.level),
        answer: p.answer,
        choices: p.choices,
        model: operationModel(p.a, b, 'add'),
        showModel: p.level < 8,
      };
    case 'sub':
      return {
        text: `${p.a} ${MINUS} ${b}`,
        ask: lines.subAsk(p.a, b, p.level),
        answer: p.answer,
        choices: p.choices,
        model: operationModel(p.a, b, 'sub'),
        showModel: p.level < 8,
      };
    case 'regroup':
      return {
        text: `${p.a} + ${b}`,
        ask: lines.regroupAsk(p.a, b),
        answer: p.answer,
        choices: p.choices,
        model: regroupModel(p.a, b),
        showModel: false,
      };
    default:
      throw new Error(`Gem problem ${p.kind} does not use answer eggs.`);
  }
}

function buildScene(play: HTMLElement, target: number): Promise<boolean> {
  let tens = 0;
  let ones = 0;
  let firstTry = true;
  let busy = false;

  const hoardEl = h('div', 'gem-build-hoard ez-target');
  const bagSource = h('button', 'gem-source gem-bag-source act', [bag()]);
  const gemSource = h('button', 'gem-source gem-one-source act', [gem()]);
  const check = h('button', 'gem-check act', ['✓']);
  bagSource.setAttribute('aria-label', 'Add a bag of ten gems');
  gemSource.setAttribute('aria-label', 'Add one gem');
  check.setAttribute('aria-label', 'Check the hoard');
  const sources = h('div', 'gem-sources', [bagSource, gemSource, check]);
  const scene = h('div', 'gem-build-scene', [h('div', 'gem-build-top', [h('div', 'gem-build-dragon ez-ember', ['🐉']), h('div', 'gem-build-target', [String(target)])]), hoardEl, sources]);
  scene.dataset.target = String(target);
  play.append(scene);

  const total = () => tens * 10 + ones;
  const updateData = () => {
    scene.dataset.total = String(total());
    scene.dataset.tens = String(tens);
    scene.dataset.ones = String(ones);
  };
  const render = () => {
    hoardEl.replaceChildren();
    for (let i = 0; i < tens; i++) {
      const item = h('button', 'gem-build-item', [bag()]);
      item.setAttribute('aria-label', 'Put back a bag of ten gems');
      item.addEventListener('click', async () => {
        if (busy) return;
        tens--;
        render();
        sfx.tap();
        await say(String(total()));
      });
      hoardEl.append(item);
    }
    for (let i = 0; i < ones; i++) {
      const item = h('button', 'gem-build-item gem-build-gem', [gem()]);
      item.setAttribute('aria-label', 'Put back one gem');
      item.addEventListener('click', async () => {
        if (busy) return;
        ones--;
        render();
        sfx.tap();
        await say(String(total()));
      });
      hoardEl.append(item);
    }
    updateData();
  };

  bagSource.addEventListener('click', async () => {
    if (busy || total() + 10 > 99) return;
    tens++;
    render();
    sfx.tap();
    await say(String(total()));
  });
  gemSource.addEventListener('click', async () => {
    if (busy || total() >= 99) return;
    ones++;
    sfx.tap();
    if (ones === 10) {
      busy = true;
      render();
      hoardEl.classList.add('trading');
      await say(lines.bagFormed);
      await wait(350);
      ones = 0;
      tens++;
      hoardEl.classList.remove('trading');
      render();
      busy = false;
    } else {
      render();
      await say(String(total()));
    }
  });

  render();
  void prompt(lines.buildPrompt(target));

  return new Promise((resolve) => {
    check.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      if (total() === target) {
        check.classList.add('yes');
        sfx.right();
        burst(check, '💎');
        await say(lines.praise);
        resolve(firstTry);
        return;
      }

      firstTry = false;
      sfx.hmm();
      scene.classList.add('hinting');
      const [targetTens, targetOnes] = split(target);
      await say(lines.buildHint(total(), tens, ones, target, targetTens, targetOnes));
      if (target - total() >= 10) bagSource.classList.add('need');
      else if (target > total()) gemSource.classList.add('need');
      else hoardEl.classList.add('need');
      await wait(500);
      bagSource.classList.remove('need');
      gemSource.classList.remove('need');
      hoardEl.classList.remove('need');
      scene.classList.remove('hinting');
      busy = false;
      void prompt(lines.buildPrompt(target));
    });
  });
}

function compareScene(play: HTMLElement, p: GemProblem): Promise<boolean> {
  const values = [p.a, p.b ?? 0];
  // Hue alone gives pastel pink and teal, so saturate and darken to read as plain red and blue.
  const colours = shuffle([
    { name: 'red', filter: 'hue-rotate(270deg) saturate(4) brightness(.8)' },
    { name: 'blue', filter: 'hue-rotate(140deg) saturate(3) brightness(.75)' },
  ]);
  const models = values.map((n, i) => {
    const [tens, ones] = split(n);
    return { n, tens, ones, model: gemsModel(tens, ones), colour: colours[i] };
  });
  const contents: HTMLElement[] = [];
  const choices: Choice<number>[] = models.map(({ n, model, colour }) => {
    const dragon = h('div', 'gem-dragon ez-ember', ['🐉']);
    dragon.style.filter = colour.filter;
    const content = h('div', 'gem-dragon-content', [dragon, model.el]);
    const el = h('button', 'gem-dragon-choice ez-target', [content]);
    el.dataset.value = String(n);
    el.setAttribute('aria-label', `${colour.name} dragon`);
    contents.push(content);
    return { el, value: n };
  });
  const compare = h('div', 'gem-compare', choices.map((choice) => choice.el));
  play.append(h('div', 'gem-compare-scene', [h('div', 'gem-compare-ask', [lines.compareCard]), compare]));

  const fit = () => {
    choices.forEach((choice, i) => {
      const content = contents[i];
      content.style.zoom = '1';
      const box = choice.el.getBoundingClientRect();
      const inner = content.getBoundingClientRect();
      const style = getComputedStyle(choice.el);
      const availableWidth = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const availableHeight = box.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      if (inner.width === 0 || inner.height === 0) return;
      const scale = Math.min(availableWidth / inner.width, availableHeight / inner.height, 10) * .9;
      content.style.zoom = scale.toFixed(3);
    });
  };
  requestAnimationFrame(fit);
  const resize = new ResizeObserver(() => (compare.isConnected ? fit() : resize.disconnect()));
  resize.observe(compare);

  const ask = lines.compareAsk;
  void prompt(ask);
  let hinted = false;
  const answer = models.find((model) => model.n === p.answer)!;

  return awaitChoice(choices, (value) => value === p.answer, {
    onRight: async (choice) => {
      burst(choice.el, '💎');
      await say(lines.compareRight(answer.colour.name));
    },
    onWrong: async () => {
      if (!hinted) {
        hinted = true;
        await say(lines.countBagsFirst);
        await models[0].model.countUp();
        await models[1].model.countUp();
        const [first, second] = models;
        if (first.tens !== second.tens) {
          const high = first.tens > second.tens ? first : second;
          const low = high === first ? second : first;
          await say(lines.compareTensCount(high.tens, low.tens));
        } else {
          await say(lines.compareOnesMatch(first.ones, second.ones));
        }
        await say(lines.compareAnswer(answer.colour.name));
      } else {
        await say(lines.compareAgain);
      }
      void prompt(ask);
    },
  });
}

export const gemBags: Game = {
  id: 'bags',
  name: 'Gem Bags',
  icon: '💎',
  skill: 'Place value: tens and ones, comparing, and adding or subtracting tens to 100',
  about:
    'Dragons keep their gems in bags of ten, with a few loose ones. Your child counts them (4 bags and 7 gems is 47), builds numbers by tapping bags and gems, and decides which dragon has more. Then they add and share bags, and add and subtract 2-digit numbers. When ten loose gems pile up, they turn into a new bag. That is the idea behind "carrying" in adding.',
  levels: [
    'How many gems? Bags of ten and loose gems',
    'Build a number: tap bags and gems to make 47',
    'Which dragon has more gems?',
    'Add or share one bag: 47 + 10, 47 − 10',
    'Add or share several bags: 34 + 20, 56 − 30',
    'Add 2-digit numbers: 34 + 25',
    'Share 2-digit numbers: 58 − 23',
    'Mixed, plus ten loose gems making a new bag (36 + 7)',
  ],
  intro: lines.intro,

  runProblem({ play, level }) {
    const p = generateGemProblem(level);
    if (p.kind === 'build') return buildScene(play, p.answer);
    if (p.kind === 'compare') return compareScene(play, p);
    return eggScene(play, question(p));
  },
};
