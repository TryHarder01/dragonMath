// "For grown-ups": how the game works, what each mini-game teaches, where the
// child is now, and how to play along. The kid-facing menus stay wordless; this
// page carries the explanation. Reachable from the start screen, the parent
// corner, and the #parents URL.

import { GAMES, UPCOMING } from '../games';
import type { Game } from '../games/types';
import { h } from './dom';
import { getLevel, hatched } from './progress';
import { CREATURES } from './creatures';

function p(text: string, cls = ''): HTMLParagraphElement {
  return h('p', cls, [text]);
}

function list(items: (string | Node)[], ordered = false): HTMLElement {
  const el = h(ordered ? 'ol' : 'ul');
  for (const it of items) el.append(h('li', '', [it]));
  return el;
}

function rich(html: string): HTMLElement {
  // Only used for our own static copy below (for <b> emphasis).
  const s = h('span');
  s.innerHTML = html;
  return s;
}

function section(title: string, ...body: Node[]): HTMLElement {
  return h('section', 'guide-section', [h('h2', '', [title]), ...body]);
}

function levelMeter(level: number): HTMLElement {
  const m = h('span', 'guide-meter');
  m.setAttribute('aria-label', `Level ${level} of 5`);
  for (let i = 1; i <= 5; i++) m.append(h('i', i <= level ? 'on' : ''));
  return m;
}

function gameCard(g: Game): HTMLElement {
  const level = getLevel(g.id);
  const steps = h('ol', 'guide-levels');
  g.levels.forEach((text, i) => steps.append(h('li', i + 1 === level ? 'current' : '', [text])));
  return h('article', 'guide-game', [
    h('div', 'guide-game-head', [
      h('span', 'guide-game-icon', [g.icon]),
      h('div', '', [h('h3', '', [g.name]), h('span', 'guide-skill', [g.skill])]),
    ]),
    p(g.about),
    h('div', 'guide-now', [h('b', '', [`Your child is on level ${level} of 5`]), levelMeter(level)]),
    steps,
  ]);
}

export function showGuide(app: HTMLElement, onBack: () => void) {
  const back = h('button', 'guide-back', ['← Back to the game']);
  back.onclick = onBack;

  const upcoming = h('div', 'guide-upcoming');
  for (const u of UPCOMING) {
    upcoming.append(
      h('article', 'guide-game soon', [
        h('div', 'guide-game-head', [
          h('span', 'guide-game-icon', [u.icon]),
          h('div', '', [h('h3', '', [u.name, h('span', 'guide-tag', ['Coming soon'])]), h('span', 'guide-skill', [u.skill])]),
        ]),
        p(u.about),
      ]),
    );
  }

  const page = h('article', 'guide', [
    back,
    h('header', 'guide-header', [
      h('span', 'guide-eyebrow', ['For grown-ups']),
      h('h1', '', ["How Ember's Egg Rescue works"]),
      p(
        'A math game for 4 to 6 year olds. Your child rides Ember, a kind young dragon, helping lost dino eggs get home after a storm. Along the way they practise the number skills that matter most before and during kindergarten.',
        'guide-lede',
      ),
      h('ul', 'guide-facts', [
        h('li', '', ['🕐 5–10 minutes a day']),
        h('li', '', ['🔊 No reading needed']),
        h('li', '', ['💛 No timers, no losing']),
        h('li', '', ['🔒 Nothing leaves this device']),
      ]),
    ]),

    section(
      'Getting started',
      list(
        [
          'Turn the sound up. Ember speaks every instruction, because most players this age can’t read yet.',
          'Tap the big ▶ button.',
          'Your child picks a picture on the island map to choose a game.',
          'Each round is 5 questions. After the fifth, an egg appears. Tap it three times and a baby dino or dragon hatches into the nest.',
          'The 🔊 button repeats the question. The 🏝️ button goes back to the map at any time.',
        ],
        true,
      ),
    ),

    section(
      'What happens with a wrong answer',
      p(
        'Nothing bad. There are no lives, scores or buzzers. The game turns the mistake into a small lesson: it counts the dots out loud one at a time, greys out that choice, and lets your child try again. Every round ends with a hatched egg, whatever happened along the way.',
      ),
      p(
        'This is deliberate. Math anxiety shows up as early as first grade, and time pressure makes it worse. That is why this game keeps the fun of Math Blaster but drops its countdowns.',
        'guide-note',
      ),
    ),

    section(
      'Difficulty adjusts itself',
      p(
        'Each game has five levels that follow the order in which children normally learn that skill. After 3 correct first tries in a row the game moves up a level. After 2 misses in a row it quietly moves down. Your child never sees a “level down” message. The aim is for them to get about 4 out of 5 right: hard enough to learn, easy enough to enjoy.',
      ),
    ),

    section('The games and where your child is', ...GAMES.map(gameCard), upcoming),

    section(
      'How to play along',
      p('Playing together makes the biggest difference. A few easy things to try:'),
      list([
        rich('<b>Count out loud together</b>, and touch each dot as you go.'),
        rich('<b>Ask “How did you know?”</b> “I saw three and one more” is exactly the kind of thinking we want.'),
        rich('<b>Praise the strategy, not the speed:</b> “You counted every single egg!” rather than “You’re so smart.”'),
        rich('<b>Let them tap.</b> Point and talk, but let your child choose, even if they get it wrong.'),
        rich('<b>Take it off the screen:</b> count stairs, snack crackers or cars. Ask “Who has more?” at the table. Five fingers on each hand make a ten-frame.'),
      ]),
    ),

    section(
      'Screen time',
      p(
        'Short and often beats long and rare. After about 6 minutes Ember gets sleepy on the map and suggests a break. Your child can keep playing, but it’s a good moment to stop while it’s still fun.',
      ),
    ),

    section(
      'Parent corner',
      p(
        'On the island map, press and hold the ⚙️ in the top-left corner for one second. You can see and change each game’s level, reopen this guide, or erase all progress. Holding the button keeps little fingers out.',
      ),
    ),

    section(
      'Why it’s designed this way',
      list([
        rich('<b>Learning trajectories</b> (Clements &amp; Sarama): children learn number in predictable steps, so each game follows those steps rather than an age or grade.'),
        rich('<b>Pictures before symbols:</b> every written number appears next to dots or a ten-frame until your child no longer needs them.'),
        rich('<b>Straight number-path games</b> (Siegler &amp; Ramani) measurably improve young children’s number sense, which is where Stomp Path comes from.'),
        rich('<b>Rewards between questions, never during them,</b> so the fun doesn’t distract from the thinking.'),
      ]),
    ),

    section(
      'Privacy and devices',
      list([
        'No accounts, ads or tracking. Progress is saved only in this browser on this device.',
        'Works best in Safari or Chrome, on an iPad or laptop. The voice comes from your device, so it can sound different on different devices.',
        'On an iPad, use Share → Add to Home Screen to get a full-screen app icon.',
      ]),
    ),

    h('footer', 'guide-footer', [
      p(`Nest so far: ${hatched().length} of ${CREATURES.length} friends hatched.`),
      (() => {
        const b = h('button', 'guide-back', ['← Back to the game']);
        b.onclick = onBack;
        return b;
      })(),
    ]),
  ]);

  app.replaceChildren(h('div', 'screen guide-screen', [page]));
}
