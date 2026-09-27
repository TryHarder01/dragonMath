# Ember's Egg Rescue

A Math Blaster–style math game for young kids with a dragon and dinosaur theme. It's currently sized for a player who adds within 20, is weak at subtraction, and knows some of the times tables ([research](docs/research/2026-09-26-right-sizing-advanced-learner.md)). Vite + vanilla TypeScript, DOM + CSS, with no game engine ([why](docs/decisions/2026-09-26-vanilla-ts-no-engine.md)).

**Scale:** a personal project for one child, played on a phone, an iPad or a computer, with no wider user base. Write clean, correct, verified code that reads like the code around it, but not enterprise software: no robustness, configurability, edge-case handling or tooling beyond what the spec and one child need.

## Start here
- Read the top entry of `WORKLOG.md` before starting work. Add an entry after each chunk of work, following `.claude/skills/worklog/SKILL.md`.
- `DESIGN.md` is the game design. `docs/research/` holds the research behind it.
- `docs/specs/` holds one self-contained spec per game (all four built). `docs/specs/README.md` covers the shared contract, verification and parallel-work rules. `docs/specs/follow-ups.md` lists known rough edges and next steps.
- `docs/decisions/` holds one file per standing decision, with the reason and the rejected options. Check it before questioning a rule below.

## Agent setup (Claude Code and Codex)
- **This file (`AGENTS.md`) is the single set of instructions.** Codex reads it directly. Claude Code reads `CLAUDE.md`, which just imports this file (`@AGENTS.md`). Edit here, never in `CLAUDE.md`.
- **Skills live in `.claude/skills/`** (where Claude Code looks). `.agents/skills` is a symlink to it (where Codex looks). Add new skills under `.claude/skills/<name>/SKILL.md` and both tools pick them up.
- Keep instructions tool-neutral: say "read the top 80 lines" rather than naming one tool's Read or Edit command.

## Commands
- `just run`: install dependencies if needed and start the game. Run `just` to list all recipes (`typecheck`, `build`, `preview`, `install`).
- **Hosted on Netlify:** https://effulgent-dieffenbachia-f29f59.netlify.app/, built from `main` on every push (`netlify.toml`). Pushing to `main` deploys, so run `just verify` first.
- `npm run dev`: play at http://localhost:5173. Uses `--host`, so an iPad on the same wifi can connect.
- `npm run typecheck`: run `tsc --noEmit`.
- `npm run build`: typecheck plus a production build into `dist/`.
- Add `?mute` to the URL to turn off speech, which is useful for automated checks.
- `just audit` checks every screen's layout at 6 window sizes, from a phone to a big monitor at 70% zoom, using `scripts/audit.mjs` (Playwright on the system Chrome). It flags content that doesn't fill the window, is clipped, or where eggs cover the question card, and saves screenshots to `audit-screens/`. Run it after any layout or CSS change. `?audit` in the URL exposes `window.__audit` shortcuts for opening screens directly.
- `just playthrough <game|all> [--level=N|all]` drives full rounds in Chrome (`scripts/playthrough.mjs`, per-game drivers in `scripts/drivers/`) and checks each reaches the hatch with no errors and a hint shown. Rounds run in parallel with the game in `?fast` mode (pauses ~20× quicker), so every level of every game takes about a minute. `--real` plays at real speed. `just verify` runs build, audit and every level of every game.
- `orca.yaml` runs `npm install` when Orca creates a worktree.
- Sizing: screens scale with the window (`vmin`/`vh` in the "scale with the screen" block of `styles.css`), and fact-game cards are zoomed to fit by `fitBubble` in `games/eggScene.ts`. Don't add fixed pixel maximums that stop big screens from filling up.

## Docs and visual write-ups: local HTML files, not hosted artifacts
[Why](docs/decisions/2026-09-26-visual-docs-as-local-html.md).
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
  - `models` (fact picture models, each with an animated strategy hint: `addModel`, `subModel`, `missingModel`, `arrayModel`, `groupsModel`)
  - `choices` (`awaitChoice`: the tap-an-answer pattern with a hint on wrong answers)
  - `round` (runs 5 problems, then the hatch)
  - `screens` (map, hatch, nest)
  - `parent` (the parent corner)
  - `guide` (the "For grown-ups" page, also at `/#parents`)
- `src/games/`: one file per mini-game, each exporting a `Game` (see `types.ts`), registered in `games/index.ts`. Fact games build an `EggQuestion` and hand it to `eggScene` (`games/eggScene.ts`). Every game carries parent-facing `skill`, `about` and `levels` text, which the guide page shows. Keep that text in sync when you change a game's levels.
- Kid-facing screens stay wordless (icons and voice). Anything explanatory goes in the parent guide.

## Tone: the hero only helps
- The player and Ember are always kind and helpful to the eggs, dinos and dragons. Use verbs like warm, find, count, share, tuck in and walk home.
- Never use zap, blast, shoot, fire or chomp, and never cast any creature as an enemy. This applies to code names, sounds, spoken lines and docs too. Older `WORKLOG.md` entries and dated research files keep their original wording.
- [Why](docs/decisions/2026-09-26-hero-only-helps.md).

## Teaching rules (from the research, don't break them)
The reasons are in [the research's design rules](docs/research/2026-09-26-early-math-pedagogy.md).
- No timers, lives or game over. Wrong answers show a hint model (count the dots aloud), then the child retries ([why](docs/decisions/2026-09-26-no-timers-lives-or-game-over.md)).
- Every problem has a picture model (ten-frames, egg arrays, nests). It's shown from the start on levels that teach a new idea, and appears as the hint on fact-practice levels. It's never missing entirely.
- Say every instruction aloud with `prompt()`, because players can't read yet.
- Rewards come only between problems, never during one.
