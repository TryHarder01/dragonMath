// Parent corner: long-press the gear to see and change levels, or reset.

import { GAMES } from '../games';
import { h } from './dom';
import { showGuide } from './guide';
import { getLevel, resetProgress, setLevel, setPlaced } from './progress';

export function parentButton(app: HTMLElement, onClose: () => void): HTMLElement {
  const gear = h('button', 'gear', ['⚙️']);
  gear.setAttribute('aria-label', 'Parent settings (hold)');
  let timer = 0;
  const start = () => {
    gear.classList.add('holding');
    timer = window.setTimeout(() => openPanel(app, onClose), 1000);
  };
  const stop = () => {
    gear.classList.remove('holding');
    clearTimeout(timer);
  };
  gear.addEventListener('pointerdown', start);
  gear.addEventListener('pointerup', stop);
  gear.addEventListener('pointerleave', stop);
  return gear;
}

function openPanel(app: HTMLElement, onClose: () => void) {
  const rows = GAMES.map((g) => {
    const val = h('b', '', [String(getLevel(g.id))]);
    const minus = h('button', 'lvl-btn', ['–']);
    const plus = h('button', 'lvl-btn', ['+']);
    const bump = (d: number) => {
      setLevel(g.id, getLevel(g.id) + d, g.levels.length);
      setPlaced(g.id); // a parent's choice ends fast placement
      val.textContent = String(getLevel(g.id));
    };
    minus.onclick = () => bump(-1);
    plus.onclick = () => bump(1);
    return h('div', 'parent-row', [h('span', '', [`${g.icon} ${g.name} (1–${g.levels.length})`]), minus, val, plus]);
  });
  const reset = h('button', 'parent-reset', ['Reset all progress']);
  let armed = false;
  reset.onclick = () => {
    if (!armed) {
      armed = true;
      reset.textContent = 'Tap again to erase levels and the nest';
      return;
    }
    resetProgress();
    close();
  };
  const closeBtn = h('button', 'parent-close', ['Done']);
  const guideBtn = h('button', 'parent-guide', ['📖 How the game works']);
  guideBtn.onclick = () => {
    overlay.remove();
    showGuide(app, onClose);
  };
  const panel = h('div', 'parent-panel', [
    h('h2', '', ['Parent corner']),
    h('p', '', ['Levels adjust automatically. A new game climbs one level per right answer until the first miss. After that it goes up after 3 right in a row and down after 2 misses. Changing a level here ends that quick climb.']),
    guideBtn,
    ...rows,
    h('div', 'parent-foot', [reset, closeBtn]),
  ]);
  const overlay = h('div', 'overlay', [panel]);
  const close = () => {
    overlay.remove();
    onClose();
  };
  closeBtn.onclick = close;
  app.append(overlay);
}
