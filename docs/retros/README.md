# Retros: friction reports and the pattern ledger

One short file per agent per delegated task (`YYYY-MM-DD-<task>.md`), written with `.claude/skills/retro/SKILL.md`. After each run the coordinator processes them with `.claude/skills/retro-review/SKILL.md`: it appends an `## Outcome` to each retro and updates this ledger. The rules are in `docs/decisions/2026-09-27-retro-handling.md`. `just retros` lists the newest.

**Last review:** 2026-09-27, covering 8 retros (21 items). **Pick:** Briefs leave scope implicit. **Runner-up:** Audit misses overflow inside the question card.

## Chosen (being fixed)

- **[instructions] Briefs leave scope implicit.** Which files or sections count, "if any" for files that don't exist, catchphrases the guide listed but the code didn't have yet, "a new level" meaning a new module. Raised by: coordinator-games-build, voice-core-eggs, voice-nest-maketen-stomp, lines-stairs-crates, lines-bags-story. Fix: `docs/briefs/2026-09-27-brief-template.md`. **Worked if** no retro in the next two runs raises an [instructions] item about scope or ownership.

## Open

- **[checks] The audit misses overflow inside the question card.** It measures the `.ez-target` box, not descendants spilling out of it or into the answer band (make-ten, ~15 min, child-visible). Proposed: flag visible descendants of `.ez-target` whose box leaves the card or overlaps the egg band. *Runner-up; the next review starts here.*

## Fixed

- **[codebase] `WORKLOG.md` is a merge hotspot** (conflicts on nearly every parallel merge; one commit with conflict markers; rotation blocked): `merge=union` in `.gitattributes`, and only the coordinator rotates (retro review 2026-09-27). Raised by: coordinator-games-build, lines-nest-maketen-stomp.
- **[checks] `check-lines` rough edges:** `{placeholders}` counted as banned words, boolean arguments, `samples` flagged by Knip (2f1de3a, bf72153). Raised by: lines-bags-story, lines-stairs-crates, lines-nest-maketen-stomp.
- **[checks] No automatic check of spoken lines**, and **[codebase] specs repeat spoken lines:** per-game `*.lines.ts` and `scripts/check-lines.mjs` in `just check` (4e32c81, bf72153). Raised by: voice-bags-story.
- **[instructions] Voice guide edge cases:** `AGENTS.md` "How Ember talks". Raised by: voice-bags-story, voice-core-eggs.
- **[codebase] Test-only exports and `?audit` branches:** Knip in `just check`, plus rules in `AGENTS.md` and the delegate skill (412062f).
- **[checks] Merges silently broke CSS; conflict markers committed:** `just check` (fa25c4e).
- **[tooling] Slow play-throughs (~5½ min for one level per game) and a slow audit (~4 min):** `?fast` and parallel jobs (b02b56d, fa25c4e).
- **[codebase] Hard-coded game-id lists:** read from `__audit.games()` (fa25c4e).
- **[instructions] Quality bar and scale reached workers mid-run:** `AGENTS.md` "Scale" and the delegate skill's brief.

## Declined

- **[environment] Usage limits and Codex startup prompts:** outside the repo. Handled by policy and workarounds in the delegate skill (fewer Codex workers at once; Claude workers pause and resume).
- **[codebase] Game code couples the model to the scene** (`eggScene`'s single `showModel`; hint methods reused in `onSolved`): the refactor risk outweighs the benefit at this scale. Revisit if a third game hits it. Raised by: make-ten, voice-nest-maketen-stomp.
