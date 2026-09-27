# Worklog

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
