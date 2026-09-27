// Stomp Path: a straight number-line game from 0 to 100.
// Levels 1–2 predict a landing, then let the child make every stomp. Later
// levels use ten-hops, skip counting, open-number-line strategies, and finally
// estimation by tapping the line itself.

import { awaitChoice, type Choice } from '../core/choices';
import { burst, h, nearChoices, pick, rand, shuffle } from '../core/dom';
import { sfx } from '../core/sound';
import { prompt, say, wait } from '../core/voice';
import type { Game } from './types';

type Direction = 1 | -1;

interface StompProblem {
  level: number;
  start: number;
  answer: number;
  choices: number[];
  direction: Direction;
  hops: number[];
  sequence?: number[];
  target?: number;
}

function choices(answer: number, preferred: number[] = []): number[] {
  const values = [answer, ...preferred.filter((n, i) => n >= 0 && n <= 100 && n !== answer && preferred.indexOf(n) === i)];
  for (const n of nearChoices(answer, 4, 0, 100)) if (!values.includes(n) && values.length < 4) values.push(n);
  return shuffle(values.slice(0, 4));
}

function generateStompProblem(level: number): StompProblem {
  if (level === 1) {
    const count = rand(2, 4);
    const start = rand(0, Math.min(17, 20 - count));
    const answer = start + count;
    return { level, start, answer, direction: 1, hops: Array(count).fill(1), choices: choices(answer, [answer - 1]) };
  }
  if (level === 2) {
    const start = rand(4, 20);
    const count = rand(2, 4);
    const answer = start - count;
    return { level, start, answer, direction: -1, hops: Array(count).fill(1), choices: choices(answer, [answer + 1]) };
  }
  if (level === 3) {
    while (true) {
      const start = rand(1, 89);
      const direction: Direction = Math.random() < .5 ? 1 : -1;
      const count = rand(1, 2);
      const answer = start + direction * count * 10;
      if (answer < 0 || answer > 100) continue;
      return {
        level, start, answer, direction, hops: Array(count).fill(10),
        choices: choices(answer, [start + direction, start - direction * count * 10]),
      };
    }
  }
  if (level === 4) {
    const step = pick([2, 5, 10]);
    const direction: Direction = step === 10 && Math.random() < .35 ? -1 : 1;
    const maxOrigin = 100 - step * 4;
    const origin = direction === 1
      ? rand(0, Math.floor(maxOrigin / step)) * step
      : rand(4, 10) * 10;
    const sequence = [1, 2, 3].map((n) => origin + direction * step * n);
    const answer = origin + direction * step * 4;
    return {
      level, start: sequence[2], answer, direction, hops: [step], sequence,
      choices: choices(answer, [answer - direction * step, answer + direction * step]),
    };
  }
  if (level === 5) {
    while (true) {
      const start = rand(1, 99);
      const direction: Direction = Math.random() < .5 ? 1 : -1;
      const count = rand(1, 5);
      const answer = start + direction * count * 10;
      if (answer < 0 || answer > 100) continue;
      return {
        level, start, answer, direction, hops: Array(count).fill(10),
        choices: choices(answer, [start + direction, start - direction * count * 10]),
      };
    }
  }
  if (level === 6 || level === 7) {
    const direction: Direction = level === 6 ? 1 : -1;
    const wantCross = Math.random() < .5;
    while (true) {
      const start = level === 6 ? rand(11, 74) : rand(30, 99);
      const amount = rand(11, 25);
      const answer = start + direction * amount;
      if (answer < 1 || answer > 99) continue;
      const ones = amount % 10;
      const crosses = level === 6 ? start % 10 + ones >= 10 : start % 10 < ones;
      if (crosses !== wantCross) continue;
      const tens = amount - ones;
      const hops = [...Array(tens / 10).fill(10), ...Array(ones).fill(1)];
      return {
        level, start, answer, direction, hops,
        choices: choices(answer, [start + direction * tens, answer - direction * 10]),
      };
    }
  }

  const firstHalf = Math.random() < .5;
  const target = firstHalf ? rand(4, 46) : rand(54, 96);
  return { level: 8, start: target, answer: target, direction: 1, hops: [], choices: [], target };
}

class PathView {
  el: HTMLElement;
  private marker: HTMLElement;
  private arcs: HTMLElement;
  private labels?: HTMLElement;
  private positions = new Map<number, number>();
  private min = 0;
  private max = 100;

  constructor(problem: StompProblem, estimate = false) {
    const layout = problem.level <= 2 ? 'window' : problem.level <= 5 || estimate ? 'ruler' : 'open';
    this.el = h('div', `stomp-path ${layout}`);
    this.arcs = h('div', 'stomp-arcs');
    this.marker = h('div', 'stomp-marker', [h('span', 'stomp-number', [String(problem.start)]), h('span', 'stomp-rex', ['🦖'])]);

    if (problem.level <= 2) this.buildWindow(problem);
    else if (layout === 'ruler') this.buildRuler(estimate);
    else this.buildOpen(problem);
    this.setMarker(problem.start);
    if (estimate) this.marker.hidden = true;
  }

  private buildWindow(problem: StompProblem) {
    this.min = Math.max(0, Math.min(10, Math.min(problem.start, problem.answer) - 3));
    this.max = this.min + 10;
    const cells = h('div', 'stomp-window-cells');
    if (this.min > 0) cells.append(h('span', 'stomp-more before', ['…']));
    for (let n = this.min; n <= this.max; n++) cells.append(h('div', 'stomp-cell', [String(n)]));
    if (this.max < 20) cells.append(h('span', 'stomp-more after', ['…']));
    this.el.append(this.arcs, this.marker, cells);
  }

  private buildRuler(estimate: boolean) {
    const ticks = h('div', 'stomp-ticks');
    for (let n = 0; n <= 100; n++) {
      const major = n % 10 === 0;
      const labelled = estimate ? n === 0 || n === 50 || n === 100 : major;
      const tick = h('i', `stomp-tick${major ? ' major' : ''}`);
      tick.style.left = `${n}%`;
      if (labelled) tick.append(h('span', '', [String(n)]));
      ticks.append(tick);
    }
    this.el.append(this.arcs, this.marker, h('div', 'stomp-line'), ticks);
  }

  private buildOpen(problem: StompProblem) {
    const total = problem.hops.reduce((sum, size) => sum + (size === 10 ? 3 : 1), 0);
    let at = problem.start;
    let distance = 0;
    this.positions.set(at, problem.direction === 1 ? 5 : 95);
    for (const size of problem.hops) {
      distance += size === 10 ? 3 : 1;
      at += problem.direction * size;
      const percent = 5 + distance / total * 90;
      this.positions.set(at, problem.direction === 1 ? percent : 100 - percent);
    }
    this.labels = h('div', 'stomp-open-labels');
    this.el.append(this.arcs, this.marker, h('div', 'stomp-line'), this.labels);
    this.addLanding(problem.start);
  }

  private percent(n: number): number {
    if (this.positions.size) return this.positions.get(n)!;
    if (this.max - this.min === 10) return ((n - this.min + .5) / 11) * 100;
    return ((n - this.min) / (this.max - this.min)) * 100;
  }

  private addLanding(n: number) {
    if (!this.labels) return;
    const label = h('span', 'stomp-open-label', [String(n)]);
    label.style.left = `${this.percent(n)}%`;
    this.labels.append(label);
  }

  setMarker(n: number) {
    this.marker.style.left = `${this.percent(n)}%`;
    this.marker.querySelector<HTMLElement>('.stomp-number')!.textContent = String(n);
  }

  revealMarker(n: number) {
    this.marker.hidden = false;
    this.setMarker(n);
  }

  clearHops() {
    this.arcs.replaceChildren();
  }

  addHop(from: number, to: number, label: string, shown = false) {
    const left = Math.min(this.percent(from), this.percent(to));
    const width = Math.abs(this.percent(to) - this.percent(from));
    const arc = h('div', `stomp-arc${shown ? ' shown' : ''}`, [h('span', '', [label])]);
    arc.style.left = `${left}%`;
    arc.style.width = `${Math.max(width, 1.8)}%`;
    this.arcs.append(arc);
  }

  async hop(from: number, to: number, label: string) {
    this.addHop(from, to, label);
    this.setMarker(to);
    this.addLanding(to);
    sfx.stomp();
    await say(String(to), { rate: 1.05 });
    await wait(100);
  }

  flag(n: number, retry = false): HTMLElement {
    const flag = h('button', `stomp-flag${retry ? ' stomp-true-spot tappable' : ''}`, ['🚩']);
    flag.style.left = `${this.percent(n)}%`;
    flag.setAttribute('aria-label', `The number ${n} is here`);
    this.el.append(flag);
    return flag;
  }
}

function expression(p: StompProblem): string {
  if (p.level === 4) return `${p.sequence!.join(', ')}, ?`;
  const amount = p.hops.reduce((sum, n) => sum + n, 0);
  return `${p.start} ${p.direction === 1 ? '+' : '−'} ${amount}`;
}

function ask(p: StompProblem): string {
  const amount = p.hops.reduce((sum, n) => sum + n, 0);
  if (p.level === 1) return `The T-rex is on ${p.start}. Hop ${amount}. Where will it land?`;
  if (p.level === 2) return `The T-rex is on ${p.start}. Hop back ${amount} to the pond. Where will it land?`;
  if (p.level === 3) return `${p.start}. ${p.hops.length === 1 ? 'One' : 'Two'} big ten-${p.hops.length === 1 ? 'hop' : 'hops'}${p.direction === -1 ? ' back' : ''}! Where does it land?`;
  if (p.level === 4) {
    const step = p.hops[0] === 2 ? 'twos' : p.hops[0] === 5 ? 'fives' : 'tens';
    return `Hopping by ${step}${p.direction === -1 ? ', going back' : ''}. ${p.sequence!.join('. ')}. Where next?`;
  }
  if (p.level === 5) return `${p.start} ${p.direction === 1 ? 'plus' : 'minus'} ${amount}. Where does the T-rex land?`;
  if (p.level === 6) return `${p.start} plus ${amount}. Tens first, then ones!`;
  if (p.level === 7) return `${p.start} minus ${amount}. Tens first, then ones!`;
  return `Where does ${p.target} live? Tap the path!`;
}

async function playHint(p: StompProblem, path: PathView) {
  path.clearHops();
  let at = p.level === 4 ? p.sequence![0] - p.direction * p.hops[0] : p.start;

  if (p.level <= 2) await say("Watch! Don't count the start. Count each new square.");
  else if (p.level === 3 || p.level === 5) await say('Watch! Make each big ten-hop. The ones digit stays the same.');
  else if (p.level === 4) await say(`Watch! Keep the same ${p.hops[0]}-hop each time.`);
  else await say('Watch! Tens first, then ones!');

  const hops = p.level === 4 ? Array(4).fill(p.hops[0]) : p.hops;
  const ones = hops.filter((size) => size === 1).length;
  const afterTens = p.start + p.direction * (hops.length - ones) * 10;
  const boundary = p.direction === 1 ? Math.ceil(afterTens / 10) * 10 : Math.floor(afterTens / 10) * 10;
  const toBoundary = Math.abs(boundary - afterTens);
  const crossesTen = (p.level === 6 || p.level === 7) && toBoundary > 0 && ones > toBoundary;
  let crossingExplained = false;
  for (const size of hops) {
    if (size === 1 && crossesTen && !crossingExplained) {
      crossingExplained = true;
      await say(`Go to ${boundary}. ${Math.abs(p.answer - boundary)} more${p.direction === -1 ? ' back' : ''}.`);
    }
    const next = at + p.direction * size;
    await path.hop(at, next, `${p.direction === 1 ? '+' : '−'}${size}`);
    at = next;
  }
}

function answerEggs(box: HTMLElement, p: StompProblem, path: PathView): Promise<boolean> {
  const promptText = ask(p);
  const options: Choice<number>[] = p.choices.map((value, i) => {
    const egg = h('button', 'egg stomp-egg', [h('span', 'numeral', [String(value)])]);
    egg.style.left = `${((i + .5) / p.choices.length) * 100}%`;
    egg.style.setProperty('--dur', `${rand(45, 70) / 10}s`);
    egg.style.setProperty('--delay', `-${rand(0, 60) / 10}s`);
    egg.dataset.value = String(value);
    egg.dataset.answer = String(p.answer);
    box.append(egg);
    return { el: egg, value };
  });
  void prompt(promptText);
  let hinted = false;
  return awaitChoice(options, (value) => value === p.answer, {
    onTap: async (choice) => {
      sfx.glow();
      choice.el.classList.add('warming');
      await wait(450);
      choice.el.classList.remove('warming');
    },
    onRight: async (choice) => {
      choice.el.replaceChildren(h('span', 'hatchling', ['🐣']));
      burst(choice.el);
      await say(p.level >= 5 ? 'Big hops first. Smart!' : 'You counted every stomp!');
    },
    onWrong: async () => {
      if (!hinted) {
        hinted = true;
        await say("Watch! Let's walk the path.");
        await playHint(p, path);
      } else {
        await say('Look where the hops land. Try again.');
      }
      void prompt(promptText);
    },
  });
}

async function stompIt(box: HTMLElement, p: StompProblem, path: PathView) {
  path.clearHops();
  path.setMarker(p.start);
  box.replaceChildren();
  const foot = h('button', 'stomp-foot tappable', ['🦶']);
  foot.setAttribute('aria-label', p.direction === 1 ? 'Stomp forward' : 'Stomp back');
  box.append(foot);
  void prompt('Now you stomp! Tap the foot for every hop.');
  let at = p.start;
  for (const size of p.hops) {
    await new Promise<void>((resolve) => {
      foot.addEventListener('pointerdown', async () => {
        foot.classList.add('pressed');
        const next = at + p.direction * size;
        await path.hop(at, next, `${p.direction === 1 ? '+' : '−'}${size}`);
        at = next;
        foot.classList.remove('pressed');
        resolve();
      }, { once: true });
    });
  }
  foot.classList.remove('tappable');
  foot.classList.add('yes');
  await say('You counted every stomp!');
}

async function estimate(box: HTMLElement, p: StompProblem, path: PathView): Promise<boolean> {
  const target = p.target!;
  const hit = h('button', 'stomp-line-hit tappable');
  hit.setAttribute('aria-label', `Tap where ${target} belongs`);
  path.el.append(hit);
  box.replaceChildren(h('div', 'stomp-estimate-reminder', [String(target)]));
  void prompt(ask(p));

  return new Promise((resolve) => {
    let firstTry = true;
    let busy = false;
    const finish = async (flagged = false) => {
      if (!flagged) path.flag(target);
      path.revealMarker(target);
      hit.classList.remove('tappable');
      sfx.right();
      await say("Close! It's right here.");
      resolve(firstTry);
    };
    hit.addEventListener('pointerdown', async (event) => {
      if (busy) return;
      busy = true;
      const rect = hit.getBoundingClientRect();
      const guess = Math.round(((event.clientX - rect.left) / rect.width) * 100);
      if (Math.abs(guess - target) <= 5) {
        await finish();
        return;
      }
      firstTry = false;
      sfx.hmm();
      hit.classList.add('stomp-missed');
      await say("Let's count. Find the nearest big number.");
      const anchor = [0, 50, 100].reduce((nearest, n) => Math.abs(target - n) < Math.abs(target - nearest) ? n : nearest);
      const forward = anchor < target;
      const decade = forward ? Math.floor(target / 10) * 10 : Math.ceil(target / 10) * 10;
      await say(`Start at ${anchor}. Count the tens.`);
      for (let n = anchor + (forward ? 10 : -10); forward ? n <= decade : n >= decade; n += forward ? 10 : -10) await say(String(n));
      const ones = Math.abs(target - decade);
      if (ones) await say(`${ones} more${forward ? '' : ' back'}. ${target}!`);
      const retry = path.flag(target, true);
      retry.addEventListener('pointerdown', async () => {
        retry.classList.add('yes');
        await finish(true);
      }, { once: true });
      hit.classList.remove('tappable');
      void prompt(`Tap the glowing flag for ${target}.`);
    });
  });
}

export const stompPath: Game = {
  id: 'stomp',
  name: 'Stomp Path',
  icon: '🦖',
  skill: 'The number line to 100: counting on and back, hops of ten, skip counting, and estimating',
  about:
    'A friendly T-rex walks home along a straight numbered path. Your child predicts where it will land, then stomps the hops themselves while each number is said out loud. Board games like this are proven to build number sense. Later levels use big hops of ten, skip counting by 2s, 5s and 10s (which leads into the times tables), adding and subtracting with hops ("38 + 25: hop 20, then 5"), and guessing where a number sits on the line.',
  levels: [
    'Hop forward by ones (to 20), then stomp it',
    'Hop back by ones (to 20), then stomp it',
    'Big hops of ten, forward and back, to 100',
    'Skip counting by 2s, 5s and 10s',
    'Adding and subtracting tens in one jump (37 + 20)',
    'Adding with hops: tens first, then ones (38 + 25)',
    'Subtracting with hops: tens first, then ones (62 − 25)',
    'Where does 63 live? Tap the path',
  ],
  intro: 'Stomp Path! Help the T-rex hop home!',

  async runProblem({ play, level }) {
    const p = generateStompProblem(level);
    play.classList.add('stomp-scene');
    const path = new PathView(p, level === 8);
    const answers = h('div', 'stomp-answers');
    if (level === 8) play.append(path.el, answers);
    else play.append(h('div', 'stomp-question', [expression(p)]), path.el, answers);

    if (level === 4) {
      const step = p.hops[0];
      let at = p.sequence![0] - p.direction * step;
      for (const n of p.sequence!) {
        path.addHop(at, n, `${p.direction === 1 ? '+' : '−'}${step}`, true);
        at = n;
      }
    }
    if (level === 8) return estimate(answers, p, path);
    const firstTry = await answerEggs(answers, p, path);
    if (level <= 2) await stompIt(answers, p, path);
    return firstTry;
  },
};
