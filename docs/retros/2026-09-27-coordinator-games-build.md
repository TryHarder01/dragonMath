# Retro: building and merging the four games (coordinator, Claude Opus 5.5)

**Friction** (most costly first):
- [environment] All four Codex workers hit the usage limit mid-self-review, twice (~35 min into each window). Spent a reset; the second time the coordinator finished the work by hand.
- [environment] Codex blocked Orca's `worker-start` on a hooks-review prompt (new bundled-plugin hooks), then on an update prompt. Digit+Enter typed into the TUI didn't register; needed `--screen` reads, bare Enter and `t`.
- [checks] Merging four branches' `styles.css` sections dropped the closing braces of three trailing `@media` blocks; the audit caught it only on large screens. Later, a scripted conflict resolution left `<<<<<<<` markers in `WORKLOG.md` (trailing space in a file name).
- [tooling] Play-throughs ran in real time (muted speech still waits), one game at a time: ~5½ min for one level per game, so workers ran only a few levels.
- [instructions] The quality bar and "one child, not enterprise" scale were sent mid-run; the first workers had already written much of their code.
- [codebase] Adding a game touched hard-coded id lists in `audit.mjs`, `playthrough.mjs` and `index.ts`'s `UPCOMING`, which conflicted on every merge.
- [instructions] "A new level" meant a new module on the map; a worker was briefed for a level inside Nest Builder first.

**Time lost:** ~2 h, mostly usage limits and merge repair.

**Suggested fix:** Done: `just check`, fast parallel checks, id lists from the app, the delegate and retro skills. Open: fewer concurrent Codex workers.
