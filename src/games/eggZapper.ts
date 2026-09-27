// Egg Zapper: subitizing and matching numerals to quantities.
// Eggs drift gently (they never escape, so there's no time pressure) and Ember
// zaps the one that matches the target.

import { awaitChoice, type Choice } from '../core/choices';
import { burst, distinctWith, h, pick, rand } from '../core/dom';
import { sfx } from '../core/sound';
import { countAlong, dots, numeralWithDots, tenFrame } from '../core/visuals';
import { prompt, say, wait, word } from '../core/voice';
import type { Game } from './types';

type Show = 'dots' | 'frame' | 'numeral' | 'both';

const LEVELS: Record<number, { min: number; max: number; eggs: number; target: Show; egg: Show }> = {
  1: { min: 1, max: 3, eggs: 3, target: 'dots', egg: 'dots' },
  2: { min: 1, max: 5, eggs: 3, target: 'both', egg: 'dots' },
  3: { min: 1, max: 5, eggs: 4, target: 'numeral', egg: 'dots' },
  4: { min: 1, max: 10, eggs: 4, target: 'numeral', egg: 'frame' },
  5: { min: 1, max: 10, eggs: 4, target: 'frame', egg: 'numeral' },
};

function picture(n: number, show: Show): HTMLElement {
  switch (show) {
    case 'dots':
      return dots(n);
    case 'frame':
      return tenFrame(n);
    case 'numeral':
      return h('span', 'numeral', [String(n)]);
    case 'both':
      return numeralWithDots(n);
  }
}

function beam(from: HTMLElement, to: HTMLElement) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const x1 = a.left + a.width / 2, y1 = a.top + a.height * 0.7;
  const x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const el = h('div', 'beam');
  el.style.left = `${x1}px`;
  el.style.top = `${y1}px`;
  el.style.width = `${len}px`;
  el.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
  document.body.append(el);
  setTimeout(() => el.remove(), 350);
}

const PRAISE = ['Zap! You found it!', 'Great looking!', 'Yes! Sparkle zap!', 'You got it, rider!'];

export const eggZapper: Game = {
  id: 'egg',
  name: 'Egg Zapper',
  icon: '🥚',
  intro: "Egg Zapper! Help Ember zap the right egg.",

  async runProblem({ play, level }) {
    const L = LEVELS[level];
    const target = rand(L.min, L.max);
    const values = distinctWith(target, L.eggs, L.min, L.max);

    const targetPic = picture(target, L.target);
    const ember = h('div', 'ez-ember', ['🐉']);
    const bubble = h('div', 'ez-target', [targetPic]);
    const eggsBox = h('div', 'ez-eggs');
    play.append(h('div', 'ez-sky', [bubble, ember]), eggsBox);

    const choices: Choice<number>[] = values.map((v, i) => {
      const egg = h('div', 'egg', [picture(v, L.egg)]);
      egg.style.left = `${((i + 0.5) / values.length) * 100}%`;
      egg.style.setProperty('--dur', `${rand(45, 70) / 10}s`);
      egg.style.setProperty('--delay', `-${rand(0, 60) / 10}s`);
      eggsBox.append(egg);
      return { el: egg, value: v };
    });

    const ask =
      L.target === 'frame'
        ? 'How many eggs are in the nest? Zap that number!'
        : `Zap the egg with ${word(target)}!`;
    void prompt(ask);

    return awaitChoice(choices, (v) => v === target, {
      onTap: async (c) => {
        sfx.zap();
        beam(ember, c.el);
        await wait(250);
      },
      onRight: async (c) => {
        c.el.replaceChildren(h('span', 'hatchling', ['🐣']));
        burst(c.el);
        await say(pick(PRAISE));
        await wait(200);
      },
      onWrong: async (c) => {
        play.classList.add('paused');
        if (L.egg === 'numeral') {
          await say(`That egg says ${word(c.value)}. Let's count the nest together.`);
          await countAlong(bubble);
        } else {
          await say("Hmm, let's count that egg.");
          await countAlong(c.el);
          await say(`That one has ${word(c.value)}. We need ${word(target)}.`);
        }
        play.classList.remove('paused');
        void prompt(ask);
      },
    });
  },
};
