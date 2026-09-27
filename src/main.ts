import './styles.css';
import { h } from './core/dom';
import { showMap } from './core/screens';
import { unlockAudio } from './core/sound';

const app = document.querySelector<HTMLElement>('#app')!;

// Browsers only allow sound after a tap, so the game opens on a big start button.
function showStart() {
  const go = h('button', 'start-btn', ['▶']);
  go.setAttribute('aria-label', 'Play');
  app.replaceChildren(
    h('div', 'screen start-screen', [
      h('div', 'start-ember', ['🐉']),
      h('h1', 'logo big', ["Ember's ", h('span', '', ['Egg Rescue'])]),
      go,
    ]),
  );
  go.addEventListener('click', () => {
    unlockAudio();
    showMap(app, "Hi rider! I'm Ember. A big storm scattered the dino eggs. Let's help them get home! Tap a picture to play.");
  });
}

showStart();
