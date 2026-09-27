// The shared Egg Warmer scene: a question in Ember's bubble, eggs bobbing below
// with answer numbers. Tapping an egg sends Ember's warm glow; the right egg
// hatches. A wrong egg greys out and the picture model plays its hint.

import { awaitChoice, type Choice } from '../core/choices';
import { burst, h, pick, rand } from '../core/dom';
import type { Model } from '../core/models';
import { sfx } from '../core/sound';
import { prompt, say, wait } from '../core/voice';

const PRAISE = ['Nice and warm! It hatched!', 'You helped it hatch!', 'You got it, rider!', 'Great thinking!'];

function glow(from: HTMLElement, to: HTMLElement) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const x1 = a.left + a.width / 2, y1 = a.top + a.height * 0.7;
  const x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
  const el = h('div', 'glow-beam');
  el.style.left = `${x1}px`;
  el.style.top = `${y1}px`;
  el.style.width = `${Math.hypot(x2 - x1, y2 - y1)}px`;
  el.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
  document.body.append(el);
  setTimeout(() => el.remove(), 600);
}

export interface EggQuestion {
  /** What's written in the bubble, e.g. "13 − 5". */
  text: string;
  /** What Ember says. */
  ask: string;
  answer: number;
  choices: number[];
  model: Model;
  /** Show the picture from the start (lower levels) or only as a hint. */
  showModel: boolean;
  /** Runs when the right egg hatches (e.g. reveal the row total). */
  onSolved?: () => void | Promise<void>;
}

/**
 * Scale the question card to fill the sky above the eggs. The pictures are
 * built in fixed pixel sizes, so on a big screen they'd otherwise sit small in
 * a lot of empty space. CSS `zoom` (unlike transform) also resizes the layout box.
 */
function fitBubble(sky: HTMLElement, bubble: HTMLElement, ember: HTMLElement, eggs: HTMLElement) {
  if (!sky.isConnected) return;
  bubble.style.zoom = '1';
  const b = bubble.getBoundingClientRect();
  // On phones Ember sits in the corner (position: absolute) and takes no width.
  const cornered = getComputedStyle(ember).position === 'absolute';
  const e = ember.getBoundingClientRect();
  const availW = sky.clientWidth - (cornered ? 0 : e.width + 48);
  // Leave room for the eggs' bob (they rise ~12% of their height) plus a gap.
  const bob = (eggs.querySelector<HTMLElement>('.egg')?.offsetHeight ?? 200) * 0.14 + 16;
  const availH = sky.clientHeight - bob - (cornered ? e.height : 0);
  if (b.width === 0 || b.height === 0) return;
  const s = Math.max(0.6, Math.min(availW / b.width, availH / b.height, 10));
  bubble.style.zoom = s.toFixed(3);
}

export function eggScene(play: HTMLElement, q: EggQuestion): Promise<boolean> {
  const ember = h('div', 'ez-ember', ['🐉']);
  const bubble = h('div', 'ez-target', [h('div', 'expr', [q.text])]);
  if (q.showModel) bubble.append(q.model.el);
  const eggsBox = h('div', 'ez-eggs');
  const sky = h('div', 'ez-sky', [bubble, ember]);
  play.classList.add('fact-scene');
  play.append(sky, eggsBox);

  const fit = () => fitBubble(sky, bubble, ember, eggsBox);
  requestAnimationFrame(fit);
  const resize = new ResizeObserver(() => (sky.isConnected ? fit() : resize.disconnect()));
  resize.observe(sky);

  const choices: Choice<number>[] = q.choices.map((v, i) => {
    const egg = h('div', 'egg', [h('span', 'numeral', [String(v)])]);
    egg.style.left = `${((i + 0.5) / q.choices.length) * 100}%`;
    egg.style.setProperty('--dur', `${rand(45, 70) / 10}s`);
    egg.style.setProperty('--delay', `-${rand(0, 60) / 10}s`);
    eggsBox.append(egg);
    return { el: egg, value: v };
  });

  void prompt(q.ask);
  let hinted = false;

  return awaitChoice(choices, (v) => v === q.answer, {
    onTap: async (c) => {
      sfx.glow();
      glow(ember, c.el);
      c.el.classList.add('warming');
      await wait(450);
      c.el.classList.remove('warming');
    },
    onRight: async (c) => {
      c.el.replaceChildren(h('span', 'hatchling', ['🐣']));
      burst(c.el);
      await q.onSolved?.();
      fit();
      await say(pick(PRAISE));
      await wait(200);
    },
    onWrong: async () => {
      play.classList.add('paused');
      if (!hinted) {
        hinted = true;
        if (!q.showModel) {
          bubble.append(q.model.el);
          fit();
        }
        await say("Let's count.");
        await q.model.hint();
      } else {
        await say('Not that one either. Look at the picture. Try again.');
      }
      play.classList.remove('paused');
      void prompt(q.ask);
    },
  });
}

/** Four answer choices for a × b: neighbouring facts (±a, ±b) and ±1. */
export function productChoices(a: number, b: number, count = 4): number[] {
  const p = a * b;
  const near = [p - b, p + b, p - a, p + a, p + 1, p - 1].filter((n, i, arr) => n > 0 && n !== p && arr.indexOf(n) === i);
  const picked: number[] = [];
  for (const n of near.sort(() => Math.random() - 0.5)) if (picked.length < count - 1) picked.push(n);
  return [p, ...picked].sort(() => Math.random() - 0.5);
}
