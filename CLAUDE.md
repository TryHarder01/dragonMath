# Ember's Egg Rescue

A Math Blaster–style math game for ages 4–6 with a dragon and dinosaur theme. Vite + vanilla TypeScript, DOM + CSS, with no game engine.

## Start here
- Read the top entry of `WORKLOG.md` before starting work. Add an entry after each chunk of work, following `.claude/skills/worklog/SKILL.md`.
- `DESIGN.md` is the game design. `docs/research/` holds the research behind it.

## Commands
- `just run`: install dependencies if needed and start the game. Run `just` to list all recipes (`typecheck`, `build`, `preview`, `install`).
- `npm run dev`: play at http://localhost:5173. Uses `--host`, so an iPad on the same wifi can connect.
- `npm run typecheck`: run `tsc --noEmit`.
- `npm run build`: typecheck plus a production build into `dist/`.
- Add `?mute` to the URL to turn off speech, which is useful for automated checks.

## Docs and visual write-ups: local HTML files, not hosted artifacts
- Any designed, visual page (research summaries, design explainers, plans meant to be viewed) goes in `docs/pages/<name>.html` as a **self-contained local HTML file**. Open it directly in a browser.
- Don't publish these as claude.ai Artifacts unless asked for one explicitly.
- Link between pages with relative paths (e.g. `edu-foundations.html`), never claude.ai URLs.
- Plain written notes stay as Markdown (`docs/research/*.md`, `DESIGN.md`).
- Current pages: `docs/pages/edu-foundations.html` (early-math research) and `docs/pages/game-design.html` (game design).

## Code layout
- `src/core/`: shared pieces.
  - `voice` (speech prompts)
  - `sound` (WebAudio effects)
  - `progress` (localStorage)
  - `adaptive` (levels)
  - `visuals` (dots, ten-frames, `countAlong`)
  - `choices` (`awaitChoice`: the tap-an-answer pattern with a hint on wrong answers)
  - `round` (runs 5 problems, then the hatch)
  - `screens` (map, hatch, nest)
  - `parent` (the parent corner)
  - `guide` (the "For grown-ups" page, also at `/#parents`)
- `src/games/`: one file per mini-game, each exporting a `Game` (see `types.ts`), registered in `games/index.ts`. Every game carries parent-facing `skill`, `about` and `levels` text, which the guide page shows. Keep that text in sync when you change a game's levels.
- Kid-facing screens stay wordless (icons and voice). Anything explanatory goes in the parent guide.

## Tone: the hero only helps
- The player and Ember are always kind and helpful to the eggs, dinos and dragons. Use verbs like warm, find, count, share, tuck in and walk home.
- Never use zap, blast, shoot, fire or chomp, and never cast any creature as an enemy. This applies to code names, sounds, spoken lines and docs too.

## Teaching rules (from the research, don't break them)
- No timers, lives or game over. Wrong answers show a hint model (count the dots aloud), then the child retries.
- Every numeral appears with a picture of its quantity, except at the top levels, where the picture is still used in hints.
- Say every instruction aloud with `prompt()`, because players can't read yet.
- Rewards come only between problems, never during one.
