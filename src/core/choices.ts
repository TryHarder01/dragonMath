// Shared "tap the right answer" interaction. Wrong taps never punish: the choice
// greys out, the game shows a hint model, and the child tries again.

import { sfx } from './sound';

export interface Choice<T> {
  el: HTMLElement;
  value: T;
}

/**
 * Wire up tappable choices. Resolves with `true` if the first tap was right.
 * `onWrong` runs the hint (e.g. counting the dots aloud) before tapping resumes.
 */
export function awaitChoice<T>(
  choices: Choice<T>[],
  isRight: (v: T) => boolean,
  handlers: {
    onTap?: (c: Choice<T>) => void | Promise<void>;
    onRight?: (c: Choice<T>) => void | Promise<void>;
    onWrong?: (c: Choice<T>) => void | Promise<void>;
  } = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    let firstTry = true;
    let busy = false;
    for (const c of choices) {
      c.el.classList.add('tappable');
      c.el.addEventListener('pointerdown', async (e) => {
        e.preventDefault();
        if (busy || c.el.classList.contains('nope')) return;
        busy = true;
        await handlers.onTap?.(c);
        if (isRight(c.value)) {
          c.el.classList.add('yes');
          sfx.right();
          await handlers.onRight?.(c);
          choices.forEach((x) => x.el.classList.remove('tappable'));
          resolve(firstTry);
          return;
        }
        firstTry = false;
        sfx.hmm();
        c.el.classList.add('wobble');
        await handlers.onWrong?.(c);
        c.el.classList.remove('wobble');
        c.el.classList.add('nope');
        busy = false;
      });
    }
  });
}
