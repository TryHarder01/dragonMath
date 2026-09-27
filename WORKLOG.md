# Worklog

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
