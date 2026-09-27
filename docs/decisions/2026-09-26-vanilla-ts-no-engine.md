# Vite + vanilla TypeScript, DOM + CSS, no game engine

- **Date:** 2026-09-26
- **Status:** Decided
- **Decided by:** unclear. It was in the plan from the design step and wasn't discussed.
- **Revisit when:** A mini-game needs physics, many moving sprites, or frame-level animation that DOM + CSS can't handle smoothly on an iPad.

## Decision
Build with Vite and plain TypeScript. Screens are DOM elements styled with CSS. No game engine (Phaser, Pixi, and so on) and no UI framework.

## Why
Reason not recorded. The choice shows up first in the "Game design" worklog entry's Next line, without discussion. So far it has held up: every mini-game is tap-an-answer with simple animation.

## Rejected
Not recorded.

## Links
- `CLAUDE.md` intro line.
- Worklog: "Game design: Dino Egg Blaster" (Next) and "Scaffold + Egg Zapper MVP".
