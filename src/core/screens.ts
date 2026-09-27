// Island map, hatch reward, and the Nest gallery.

import { GAMES, UPCOMING } from '../games';
import type { Game } from '../games/types';
import { CREATURES, creatureEl, type Creature } from './creatures';
import { burst, h, pick } from './dom';
import { addHatched, hatched } from './progress';
import { playRound } from './round';
import { sfx } from './sound';
import { prompt, say, wait } from './voice';
import { parentButton } from './parent';

const sessionStart = Date.now();
const BREAK_AFTER_MS = 6 * 60 * 1000;
let breakSuggested = false;

export function showMap(app: HTMLElement, greeting?: string) {
  const spots = h('div', 'spots');
  for (const g of GAMES) {
    const b = h('button', `spot spot-${g.id}`, [h('span', 'spot-icon', [g.icon]), h('span', 'spot-name', [g.name])]);
    b.addEventListener('click', () => {
      sfx.tap();
      startGame(app, g);
    });
    spots.append(b);
  }
  for (const u of UPCOMING) {
    const b = h('button', 'spot soon', [h('span', 'spot-icon', [u.icon]), h('span', 'spot-name', [u.name])]);
    b.disabled = true;
    spots.append(b);
  }

  const nest = h('button', 'nest-btn', ['🪺', h('span', 'badge', [String(hatched().length)])]);
  nest.setAttribute('aria-label', 'My nest');
  nest.addEventListener('click', () => {
    sfx.tap();
    showNest(app);
  });

  const sleepy = Date.now() - sessionStart > BREAK_AFTER_MS;
  const ember = h('div', `map-ember${sleepy ? ' sleepy' : ''}`, [sleepy ? '😴' : '🐉']);

  app.replaceChildren(
    h('div', 'screen map-screen', [
      h('div', 'map-top', [parentButton(app, () => showMap(app)), h('h1', 'logo', ["Ember's ", h('span', '', ['Egg Rescue'])]), nest]),
      ember,
      spots,
    ]),
  );

  if (sleepy && !breakSuggested) {
    breakSuggested = true;
    void prompt('Ember is getting sleepy. Great work today, rider! Maybe time for a break?');
  } else {
    void prompt(greeting ?? 'Where should we fly, rider? Tap a picture!');
  }
}

export function startGame(app: HTMLElement, g: Game) {
  void playRound(app, g, (exit) => {
    if (exit === 'map') showMap(app);
    else showHatch(app, g);
  });
}

function nextCreature(): Creature {
  const have = hatched();
  const fresh = CREATURES.filter((c) => !have.includes(c.id));
  return pick(fresh.length ? fresh : CREATURES);
}

export async function showHatch(app: HTMLElement, from: Game) {
  const c = nextCreature();
  const isNew = !hatched().includes(c.id);
  const egg = h('button', 'big-egg', ['🥚']);
  egg.setAttribute('aria-label', 'Tap the egg');
  const stage = h('div', 'hatch-stage', [egg]);
  const actions = h('div', 'hatch-actions');
  app.replaceChildren(h('div', 'screen hatch-screen', [h('div', 'hatch-sun'), stage, actions]));
  void prompt('You did it! Tap the egg to hatch it!');

  let taps = 0;
  egg.addEventListener('pointerdown', async () => {
    if (taps >= 3) return;
    taps++;
    sfx.tap();
    egg.classList.remove('shake');
    void egg.offsetWidth;
    egg.classList.add('shake', `crack${taps}`);
    if (taps < 3) return;
    await wait(300);
    sfx.hatch();
    burst(egg, '✨', 14);
    const baby = creatureEl(c, 'creature hatched-baby');
    stage.replaceChildren(baby, h('div', 'baby-name', [c.name]));
    addHatched(c.id);
    await say(isNew ? `It's ${c.name}! Welcome to your nest!` : `Another ${c.name}! They love you!`);

    const again = h('button', 'act act-again', ['🔁', h('span', '', ['Again'])]);
    const map = h('button', 'act', ['🏝️', h('span', '', ['Island'])]);
    const nest = h('button', 'act', ['🪺', h('span', '', ['Nest'])]);
    again.onclick = () => startGame(app, from);
    map.onclick = () => showMap(app);
    nest.onclick = () => showNest(app);
    actions.replaceChildren(again, map, nest);
  });
}

export function showNest(app: HTMLElement) {
  const have = hatched();
  const grid = h('div', 'nest-grid');
  for (const c of CREATURES) {
    const got = have.includes(c.id);
    const cell = h('button', `nest-cell${got ? '' : ' missing'}`, [creatureEl(c)]);
    if (got) cell.addEventListener('click', () => void say(c.name));
    grid.append(cell);
  }
  const back = h('button', 'hud-btn', ['🏝️']);
  back.setAttribute('aria-label', 'Back to the island');
  back.onclick = () => showMap(app);
  app.replaceChildren(
    h('div', 'screen nest-screen', [
      h('div', 'hud', [back, h('h2', 'nest-title', [`My Nest · ${have.length} of ${CREATURES.length}`]), h('span', '')]),
      grid,
    ]),
  );
  void prompt(
    have.length ? `You have ${have.length} friends in your nest! Tap one to hear their name.` : 'Your nest is empty. Play a game to hatch a friend!',
  );
}
