import './styles.css';
import { h } from './core/dom';
import { showGuide } from './core/guide';
import { showHatch, showMap, showNest, startGame } from './core/screens';
import { GAMES } from './games';
import { unlockAudio } from './core/sound';

const app = document.querySelector<HTMLElement>('#app')!;

// Browsers only allow sound after a tap, so the game opens on a big start button.
function showStart() {
  const go = h('button', 'start-btn', ['▶']);
  go.setAttribute('aria-label', 'Play');
  const grownups = h('button', 'grownups-link', ['For grown-ups: how this game works']);
  grownups.addEventListener('click', () => showGuide(app, showStart));
  app.replaceChildren(
    h('div', 'screen start-screen', [
      h('div', 'start-ember', ['🐉']),
      h('h1', 'logo big', ["Ember's ", h('span', '', ['Egg Rescue'])]),
      go,
      grownups,
    ]),
  );
  go.addEventListener('click', () => {
    unlockAudio();
    showMap(app, "Hi rider! I'm Ember. A big storm scattered the dino eggs. Let's help them get home! Tap a picture to play.");
  });
}

// Parents can bookmark the guide directly: /#parents
if (location.hash === '#parents') showGuide(app, showStart);
else showStart();
window.addEventListener('hashchange', () => {
  if (location.hash === '#parents') showGuide(app, showStart);
});

// `?audit` exposes screen shortcuts for scripts/audit.mjs (the layout check),
// so it can open any screen without playing through to it.
if (new URLSearchParams(location.search).has('audit')) {
  const game = (id: string) => GAMES.find((g) => g.id === id) ?? GAMES[0];
  Object.assign(window, {
    __audit: {
      start: showStart,
      map: () => showMap(app),
      nest: () => showNest(app),
      hatch: () => showHatch(app, GAMES[0]),
      guide: () => showGuide(app, showStart),
      play: (id: string) => startGame(app, game(id)),
    },
  });
}
