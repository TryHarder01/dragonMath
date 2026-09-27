# Retros: friction reports

One short file per agent per delegated task (`YYYY-MM-DD-<task>.md`), written with `.claude/skills/retro/SKILL.md`. The coordinator reads them after each run and looks for patterns (`.claude/skills/delegate/SKILL.md`, "After a run"). `just retros` lists the newest.

## Open patterns

- **[environment] Usage limits stop parallel runs.** Four Codex workers at high effort used a 5-hour window in about 35 minutes, twice. Proposed: run at most two Codex workers at once, or use Claude workers (they pause and resume themselves).
- **[environment] Codex startup prompts (hooks review, update) block Orca's `worker-start`.** Workaround in the delegate skill. Proposed: check `codex` starts clean in a scratch worktree before a batch.

- **[checks] The audit misses overflow inside the question card.** It measures the `.ez-target` box, not descendants that spill outside it or into the answer band; a phone screenshot caught what it passed (Make Ten, ~15 min). Proposed: flag visible descendants of `.ez-target` whose rect leaves the card or overlaps the egg band.

- **[checks] No automatic check of spoken lines** (length, banned words): 1 voice worker + the coordinator caught "digit" by hand. Planned: per-module `*.lines.ts` files and a checker in `just check` (user-approved, next).
- **[codebase] Specs repeat spoken lines in several tables** that drift: planned to point specs at the `*.lines.ts` files.

## Fixed

- **[instructions] Voice guide edge cases** (7 words, comma pairs, when hints open with "Let's count.", catchphrases per game), from 2 voice retros: clarified in `AGENTS.md` "How Ember talks".

- **[codebase] Test-only exports and `?audit` branches kept reappearing** (Stomp, Nest, Dino Story, Make Ten, Gem Bags): Knip in `just check` catches the exports; `AGENTS.md` and the delegate skill's quality bar name the `?audit` pattern.

- **[checks] Merges silently broke CSS** (a shared closing brace kept only once): `just check`, first step of `just verify`.
- **[checks] Conflict markers committed** after a scripted resolution: `just check`.
- **[tooling] Play-throughs took ~5½ min for one level per game:** `?fast` + parallel rounds, all levels in ~47 s.
- **[tooling] The audit took ~4 min:** parallel screen × size jobs in `?fast`, ~45 s.
- **[codebase] Every new game had to edit hard-coded game-id lists** in `audit.mjs` and `playthrough.mjs`: both now ask the app (`__audit.games()`).
- **[instructions] The quality bar and the project's scale reached workers mid-run:** both are now in `AGENTS.md` ("Scale") and in the delegate skill's brief template.
