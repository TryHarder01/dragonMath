// Runs one round of a mini-game (5 problems by default), then goes to the hatch.

import type { Game } from '../games/types';
import { Adaptive } from './adaptive';
import { h } from './dom';
import { repeatPrompt, say, wait } from './voice';
import { sfx } from './sound';

export const PROBLEMS_PER_ROUND = 5;

export type Exit = 'map' | 'hatch';

export async function playRound(app: HTMLElement, game: Game, onExit: (e: Exit) => void) {
  const adaptive = new Adaptive(game.id, game.levels.length);
  let quit = false;

  const home = h('button', 'hud-btn', ['🏝️']);
  home.setAttribute('aria-label', 'Back to the island');
  const speak = h('button', 'hud-btn', ['🔊']);
  speak.setAttribute('aria-label', 'Say it again');
  const pips = h('div', 'pips');
  if (!game.isRoundOver) for (let i = 0; i < PROBLEMS_PER_ROUND; i++) pips.append(h('span', 'pip', ['🥚']));
  const hud = h('div', 'hud', [home, pips, speak]);
  const play = h('div', 'play');
  app.replaceChildren(h('div', `screen game-screen game-${game.id}`, [hud, play]));

  home.addEventListener('click', () => {
    quit = true;
    speechSynthesis?.cancel();
    sfx.tap();
    onExit('map');
  });
  speak.addEventListener('click', () => {
    sfx.tap();
    void repeatPrompt();
  });

  // The intro can be long; a big ⏭️ lets an impatient player (or parent) skip it.
  const skip = h('button', 'skip-btn', ['⏭️', h('span', '', ['Skip'])]);
  skip.setAttribute('aria-label', 'Skip the intro');
  play.append(h('div', 'intro-ember', ['🐉']), skip);
  await Promise.race([
    say(game.intro),
    new Promise<void>((resolve) =>
      skip.addEventListener('click', () => {
        sfx.tap();
        speechSynthesis?.cancel();
        resolve();
      }),
    ),
  ]);
  play.replaceChildren();
  game.startRound?.(adaptive.level);

  let done = 0;
  while (!quit) {
    if (game.isRoundOver ? game.isRoundOver() : done >= PROBLEMS_PER_ROUND) break;
    play.replaceChildren();
    const firstTry = await game.runProblem({ play, level: adaptive.level });
    if (quit || !play.isConnected) return;
    if (!game.ownsLevel) adaptive.record(firstTry);
    pips.children[done]?.replaceChildren('🐣');
    pips.children[done]?.classList.add('done');
    done++;
    await wait(600);
  }
  if (!quit) onExit('hatch');
}
