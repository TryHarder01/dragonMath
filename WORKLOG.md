# Worklog

## 2026-09-26 — Build specs for the four unbuilt games

**Goal:** Write handoff documents that let other agents build Nest Builder, Gem Bags, Stomp Path and Dino Story without re-planning.

**Done:**
- `docs/specs/README.md`, the shared contract:
  - the player and the rules;
  - how a `Game` plugs in and the reuse table (`eggScene`, `awaitChoice`, `models.ts`, `nearChoices`…);
  - verification (typecheck, `just audit` entries, Playwright play-through, 1,000× generator checks);
  - finishing steps and rules for parallel work.
- One spec per game (`nest-builder.md`, `gem-bags.md`, `stomp-path.md`, `dino-story.md`). Each has:
  - why the game exists, with research;
  - story and tone, and the screen and interaction;
  - an 8-level table with generators, spoken lines and hint scripts;
  - answer distractors (common mistakes);
  - ready-to-paste parent text, a build checklist and audit entries;
  - open questions with defaults, and what's out of scope.
- `DESIGN.md` §3–6 replaced by a table linking to the specs (the specs are the source of truth). `CLAUDE.md` points to `docs/specs/`.
- `scripts/audit.mjs`: per-screen `ready` selectors for game screens without numbered eggs, and all game ids marked as placed.

**Decisions:**
- Specs live in `docs/specs/`, one file per game plus a shared README. The user asked me to decide where they go: I chose separate files so parallel agents can each take one, and I kept `DESIGN.md` as a summary. `[promote?]`
- Recommended build order: Nest Builder (subtraction through ten, his weak spot), Gem Bags, Stomp Path, Dino Story.
- Nest Builder now includes subtraction levels (13 − 5 → 10 → 8, and 43 − 5), which the old `DESIGN.md` ladder didn't have. Stomp Path adds the open number line and estimation. Dino Story follows the CGI situation-type order.
- Each spec lists its open questions for the user with a default, so building isn't blocked on answers.

**Verified:** `node --check scripts/audit.mjs` OK. I didn't re-run the audit, since no screens changed. The specs aren't validated by a build yet: the first agent to build from one will find any gaps.

**Next:**
- Hand `docs/specs/nest-builder.md` (with `docs/specs/README.md`) to an agent. The others can run in parallel in separate worktrees.
- The user could skim each spec's "Open questions" and override any defaults.

## 2026-09-26 — Fill the screen at any size; skip-intro button; layout audit

**Goal:** Per the user's screenshots (a big monitor at 70% zoom), the question card and hatch screen sat small in empty space. Make every screen use the window, and add a way to skip the intro speech.

**Done:**
- `fitBubble` in `src/games/eggScene.ts` zooms the question card (CSS `zoom`, up to 10×) to fill the sky. It reruns on resize, on the hint and on solve, and leaves a bob gap sized to the eggs.
- `.fact-scene` layout: the egg band is 27vh and eggs are `min(21vw, 19vh)`. On portrait phones Ember moves to the corner.
- `src/styles.css` "scale with the screen" block: start, map, hatch, nest, HUD and guide use `vmin`/`vh` sizes without small caps. The map is a 4-column grid (2 in portrait) with rows filling the space. The guide scales its type but keeps a 46em line length.
- `src/core/round.ts`: during a game's intro, a big Ember and a pulsing ⏭️ Skip button. A tap cancels the speech.
- `scripts/audit.mjs` + `just audit`: 10 screens × 6 sizes. Measures coverage, card fill, clipping and egg/card overlap, and writes screenshots to `audit-screens/` (git-ignored). `?audit` exposes `window.__audit` shortcuts in `src/main.ts`, and `startGame` is exported from `screens.ts`.
- `playwright@1.57` added as a devDependency. It uses the system Chrome, so there's no browser download.

**Decisions:**
- Scale with `vmin`/`vh` and a JS fit for the card, rather than fixed pixel sizes with caps. The user asked to use the available space.
- The audit counts the card as filling its space if it fills the height **or** the width. A 7×2 array can't do both.

**Verified:**
- `npx tsc --noEmit` clean and `vite build` OK.
- `just audit`: 0 of 60 flagged, down from 19 on the first run. The first run found map spots clipped below the fold at phone/iPad/laptop sizes, a small hatch and start screen, and eggs overlapping the card and each other on big screens.
- Checked screenshots by eye: hatch at 2600×2450, the iPad map, the big-screen intro and a phone stairs card.
- Replayed Egg Warmer and Egg Crates rounds (drive script, `?mute`) with no errors.
- Not checked on a real iPad or phone. The skip button was only tested through the audit (it's clicked on every game screen).

**Open / broken:**
- Emoji art pixelates at very large sizes (visible on the 2600px hatch). Proper SVG art would fix it.
- Stairs cards change size from step to step as rows are added, because each is fitted on its own.

**Next:**
- Have the user reload on the big monitor and confirm. Then build Gem Bags (`DESIGN.md` §3).

## 2026-09-26 — Egg Stairs: the times table as a staircase

**Goal:** A game that teaches how the multiplication tables are built (walking up and down a table), separate from Egg Crates' mixed recall practice.

**Done:**
- `src/games/eggStairs.ts`: one level per table (×2, ×10, ×5, ×3, ×4, ×6–×9).
- Each table runs four 5-question phases: walk up 1–5, walk up 6–10, walk down from 10, and ⭐ landmark jumps (5→6, 10→9…).
- A crate picture with a running total beside each row. The hint counts on or back across the changing rows.
- Plumbing:
  - `Game.ownsLevel`: the round runner skips the shared adaptive rule.
  - `getGameState` / `setGameState` in `progress.ts` save the phase.
  - `EggQuestion.onSolved` in `eggScene.ts`.
- Registered on the map between Egg Warmer and Egg Crates. `DESIGN.md` §2b added and the build order renumbered.

**Decisions:**
- Its own map game rather than levels inside Egg Crates. The user chose this from three options (reason not given). `[promote?]`
- Walking in order teaches the structure, and shuffled practice (Crates) builds recall. Jumping from landmarks trains derived facts instead of reciting from 1×. This was discussed with the user.
- Stairs manages its own level: a table is never left mid-walk. A clean phase skips to the jumps, and passing the jumps with ≤1 miss unlocks the next table.

**Verified:**
- `npx tsc --noEmit` clean and `vite build` OK.
- Playwright (system Chrome, `?mute`, fresh storage) played 3 rounds:
  - Round 1 had one miss and went to `up-high`.
  - Round 2 was clean and skipped to `jumps`.
  - Round 3 passed and moved to level 2 (×10, `up-low`).
- Screenshots checked for the walk-up hint (3 × 2), the full 10-row staircase, a landmark jump (6 × 2 from ⭐5) and the ×9 walk-down layout. No page errors.
- Not tested with the child. Speech not checked by ear.

**Open / broken:**
- Stairs has no placement beyond "clean phase skips to jumps". A child who knows ×2 still does two rounds before ×10. It could skip whole tables he passes.
- The earlier Open items (outdated `docs/pages`, unused `visuals` helpers) still stand.

**Next:**
- Have him play Stairs on a table he half-knows (×3 or ×4, set it in the parent corner) and watch whether the landmark jumps land.
- Build Gem Bags (place value), per `DESIGN.md` §3.

## 2026-09-26 — Right-size levels: subtraction within 20 and multiplication

**Goal:** Fit the lessons to the actual player. He adds within 20, knows about ¼–½ of the 10×10 tables, and (per the user) is weak at subtraction.

**Done:**
- Research: `docs/research/2026-09-26-right-sizing-advanced-learner.md` (strategies over drill, arrays, fact order, interleaving, acceleration).
- **Egg Warmer**, rewritten: 8 levels, mostly subtraction (take away → teens → think addition → crossing ten → mixed, then ×2/5/10 at the top).
- **Egg Crates**, new (`src/games/eggCrates.ts`): multiplication in 8 levels (groups → ×2/10 → ×5 → ×3/4 → ×6–9 → missing factor).
- `src/core/models.ts`: picture models with spoken strategy hints (double ten-frame for + − and missing part, egg arrays, nests). `src/games/eggScene.ts` is the shared egg scene.
- Placement: `adaptive.ts` goes up a level after every first-try correct answer until the first miss. `progress.ts` adds a `placed` flag and per-game max levels, with the key bumped to `embers-egg-rescue:v2` (old progress is dropped).
- Removed Dino Count. Upcoming games are now Gem Bags, Stomp Path, Nest Builder and Dino Story. Updated `DESIGN.md`, the guide copy and `CLAUDE.md` (target player, the picture-model rule, the code layout).

**Decisions:**
- Aim the game at this child, not at ages 4–6. The user's reason: "right size the lessons for him". `[promote?]`
- Pictures are shown from the start on levels that teach a new idea, and are hint-only on fact-practice levels. This relaxes the old "numeral always has a picture" rule for an older child. `[promote?]`
- Fast placement on a fresh game, because an advanced child shouldn't grind easy levels (research: acceleration). `[promote?]`

**Verified:**
- `npx tsc --noEmit` clean and `vite build` OK.
- Playwright (system Chrome, `?mute`, fresh storage) played a full round of each game with one deliberate miss. Placement climbed 1→3 and stopped at the miss. No page errors.
- Screenshots checked for the hints at Egg Warmer level 5 (16 − 8, crossing ten), Crates level 6 (7 × 7, split at 5) and Crates level 7 (? × 3 = 27). The guide renders both 8-level ladders.
- Not tested with the child or on an iPad. Speech not checked by ear.

**Open / broken:**
- `docs/pages/game-design.html` and `edu-foundations.html` still describe the ages 4–6 design.
- `countAlong` and `numeralWithDots` in `visuals.ts` are no longer used by any game.
- The missing-factor bubble reserves blank space for rows that haven't appeared yet.

**Next:**
- Have him play both games, then read the levels in the parent corner (hold ⚙️) and adjust the ladders.
- Build Gem Bags (place value), per `DESIGN.md` §3.

## 2026-09-26 — Worklog skill review; add docs/decisions/

**Goal:** Review the worklog skill against its research, and give standing decisions a home of their own.

**Done:**
- `.claude/skills/worklog/SKILL.md`:
  - Added a session flow, reading only the top 80 lines plus a `grep '^## '` table of contents, and a check for a dirty tree at start.
  - Entries go in with an Edit below the title, never a Write that rewrites the file.
  - Monthly rotation into `docs/worklog/`, entry title = commit subject, no hashes.
  - Decisions: capture them, tag `[promote?]`, never invent a reason.
- `docs/decisions/`: a README with the template and rules, plus five decisions: hero-only-helps, no-timers, visual-docs-as-local-html, vanilla-ts-no-engine and worklog-format.
- `docs/research/2026-09-26-worklog-pattern.md`: now evidence only, linking to the decision. Sources checked, and the Anthropic quote corrected. Dropped the SashiDo posts (×2), claudecodeguides, dailydevpost and Level Up (403). Added sections on one file vs. fragments, commit links, and where decisions belong.
- `CLAUDE.md`: "why" links to each decision, the historical-wording exception added to the tone rule, and a pointer to `docs/decisions/`.
- `docs/research/2026-09-26-central-agent-workflow-notes.md`: an idea, not a decision, for keeping agent workflow and team-repo handoffs in a personal notes repo. Not about this game. Move it once a notes repo exists.

**Decisions:**
- Decisions get their own folder, separate from research. Research holds the evidence and decisions hold the choice. The user approved this in the session.

**Verified:** Checked every source link with WebFetch (Level Up returned 403). Not tested in a fresh session.

**Open / broken:**
- The reason for vanilla-ts-no-engine was never recorded, and the visual-docs one was "user request" with no further reason. Both files say so. The user may want to fill them in.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — "For grown-ups" guide page

**Goal:** Give parents an in-game page explaining how the game works, since the kid menus are deliberately wordless.

**Done:**
- `src/core/guide.ts`, a scrolling page with these sections:
  - At a glance
  - Getting started
  - What happens with a wrong answer
  - Adaptive levels
  - Each game with the child's current level highlighted
  - Coming-soon games
  - How to play along
  - Screen time
  - Parent corner
  - Research basis
  - Privacy and devices
- Entry points: the "For grown-ups" link under ▶ on the start screen, "📖 How the game works" in the parent corner (hold ⚙️), and `/#parents` (including a hashchange listener).
- The `GameInfo` type (`skill`, `about`) and `Game.levels` (5 parent-facing level descriptions) in `src/games/types.ts`. Filled in for Egg Warmer and the 5 upcoming games.

**Decisions:**
- The guide reads game info from the game modules, so it stays accurate as games are built. No separate copy to drift.

**Verified:** `npx tsc --noEmit` clean. Playwright (system Chrome) opened the guide from all three entry points, and Back works each time. Screenshots at 1024×768 and 390×844 look right. No page errors.

**Open / broken:**
- New games need `skill`, `about` and `levels` filled in, and must be removed from `UPCOMING`.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — justfile

**Goal:** One-command start with `just run`.

**Done:**
- `justfile` at the root with these recipes:
  - `run`: runs `npm install` if `node_modules` is missing, then `npm run dev`.
  - `install`, `typecheck`, `build`, `preview`.
  - `default`: lists the recipes.
- Added `just run` to the Commands section of `CLAUDE.md`.

**Verified:** `just --list` shows all recipes. `just typecheck` passes. `just run` started Vite at http://localhost:5173 (I then stopped it).

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — Re-theme: the hero only helps (Ember's Egg Rescue)

**Goal:** Per user request, remove violent or mean verbs. The main character must be kind and helpful to the eggs, dinos and dragons.

**Done:**
- New story: a storm scattered the Dino Nest's eggs, and the rider and Ember find them, warm them, and bring the babies home. The game is renamed to **Ember's Egg Rescue** (title, logo, `package.json`, localStorage key `embers-egg-rescue:v1`).
- Egg Zapper → **Egg Warmer** (`src/games/eggZapper.ts` → `src/games/eggWarmer.ts`): "Warm the egg with four!", a soft glow beam and egg halo instead of a zap beam, and `sfx.zap` → `sfx.glow` (a gentle sine shimmer).
- Renamed the creature "Chompers" to "Giggles".
- Added a tone rule to `CLAUDE.md` and `DESIGN.md`, and updated `docs/pages/*.html`.

**Decisions:**
- The verb is "warm" because dragons keeping eggs warm is a natural, kind fit, and hatching stays the reward. Rejected "rescue from a villain" because it brings in an enemy.

**Verified:** `npx tsc --noEmit` clean. Playwright full round (`?mute`), including a wrong-answer hint, got to the hatch with no console errors. The map screenshot shows the new title and "Egg Warmer". A grep for zap/blast/chomp finds them only in the tone rules.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`) with helper framing ("count the babies so nobody's left behind"). Then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — Scaffold + Egg Zapper MVP; docs pages moved local

**Goal:** Get a playable game running, starting with the core Egg Zapper loop.

**Done:**
- Vite + TS scaffold (`package.json`, `tsconfig.json`, `index.html`, `src/main.ts`, `src/styles.css`).
- `src/core/`: voice (Web Speech, `?mute`), sound (WebAudio), progress (localStorage), adaptive levels, visuals (dice dots, ten-frames, `countAlong` hint), `awaitChoice`, round runner, screens (start, map, hatch, nest), parent corner (hold ⚙️ for 1s).
- `src/games/eggZapper.ts`: 5 levels from DESIGN.md, drifting eggs, zap beam. A wrong tap counts that egg's dots aloud.
- The other 5 games show greyed-out on the map (`UPCOMING` in `src/games/index.ts`).
- Per user request, visual docs are now local HTML: moved `docs/artifacts/` → `docs/pages/` and changed the cross-link to a relative path. The pattern is recorded in the new `CLAUDE.md`. The claude.ai artifact links in the entries below are superseded. Those artifacts still exist online and weren't deleted.

**Decisions:**
- Eggs bob up and down in place rather than floating away, so there's no time pressure.
- A start screen with a big ▶ button is needed because browsers block audio and speech until a tap.

**Verified:** `npx tsc --noEmit` clean, and `vite build` succeeds. Drove a full round with Playwright in headless Chrome (`?mute`): start → map → 5 problems, including a deliberate wrong tap (dots lit up while counting, egg greyed out, retry worked) → egg hatched into "Blue Bolt". No console errors. Real speech output not checked by ear.

**Open / broken:**
- Speech voice quality depends on the browser. Not tested on an iPad.
- If you leave a game mid-hint, the hint's remaining speech can still play.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), register it in `GAMES`, and remove it from `UPCOMING`. Then Gem Trade, Nest Builder, Stomp Path, and Dino Story.

**Gotchas:** Playwright clicks need `{ force: true }` because the buttons animate constantly. Use the system Chrome (`channel: 'chrome'`).

## 2026-09-26 — Game design: Dino Egg Blaster

**Goal:** Turn the research into a concrete game design with a dragon/dino theme.

**Done:**
- `DESIGN.md`: premise (Ember the dragon guards the Dino Nest), core loop, adaptive rules, and 6 mini-games with level tables. The mini-games are Egg Zapper, Dino Count, Gem Trade, Stomp Path, Nest Builder and Dino Story. Also covers the Hatchery rewards and build order.
- Published the game design artifact: https://claude.ai/artifact/3off7AhPXjmVxA7i4XuZn9 (copy in `docs/artifacts/game-design.html`).

**Decisions:**
- A round is 5 problems, and a baby hatches after every round. Rewards come only between problems (the "seductive details" research).
- Stomp Path uses a straight path with each number spoken, per Siegler & Ramani. A circular board didn't produce the gains.
- Level-down is silent. It isn't shown to the child.

**Verified:** Artifact publish succeeded (version 1). No code yet.

**Next:**
- Scaffold Vite + vanilla TS in the repo root and build `src/core/*` plus the island map and Egg Zapper (build steps 1–2 in DESIGN.md).

## 2026-09-26 — Education foundations for ages 4–6

**Goal:** Ground the game in early-math research before designing anything.

**Done:**
- `docs/research/2026-09-26-early-math-pedagogy.md`: learning trajectories, counting principles, Siegler & Ramani number-path games, CRA, app-design pillars, math anxiety, K standards, and 10 design rules for the game.
- Published the Education Foundations artifact: https://claude.ai/artifact/GNKCnZfsWwHg7CSjHJX4gr (source copy in `docs/artifacts/edu-foundations.html`).
- `git init` and `.gitignore`.

**Decisions:**
- No timers, lives, or game over. This is the main break from the original Math Blaster, because of math-anxiety research.
- One mini-game per learning trajectory. Adapt level per skill (up after 3 correct in a row, down after 2 misses).

**Verified:** Artifact publish succeeded (version 1). The research is from established literature, not a fresh web search. Citations not re-checked.

**Next:**
- Write `DESIGN.md` (game design theory) and publish it as an artifact, then scaffold Vite + TS and build Egg Zapper.
