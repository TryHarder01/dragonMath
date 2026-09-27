# Retros become one fix at a time, with every item closed out

- **Date:** 2026-09-27
- **Status:** Decided
- **Decided by:** agent (with user approval: "decide on ONE thing … and make a decision about how we handle retro notes")
- **Revisit when:** a review finds that a "Fixed" pattern came back, or retros pile up unreviewed across two runs.

## Decision

Agents' friction reports (`docs/retros/`, written with the `retro` skill) are processed with the `retro-review` skill after each delegated run:

1. **One project per review.** Score the patterns (recurrence × time lost, counting double for anything that lets a child-visible bug through), and pick **one** solvable improvement. It gets a brief or spec and goes to a worker. The runner-up is written down, so the next review can start there.
2. **Tiny fixes don't wait.** A fix that takes the coordinator under about 10 minutes (one config line, one rule in a skill) is done immediately and doesn't count as the pick.
3. **Every item is closed out, not just the pick.** The coordinator appends an `## Outcome` section to each retro, one line per friction bullet: `Fixed` (with commit), `Pattern` (open in the ledger), `Chosen`, `Declined` (with a real reason) or `Noted`. The agent's own text is never edited.
4. **`docs/retros/README.md` is the ledger:** Open / Chosen / Fixed / Declined patterns, each listing the retros that raised it, plus a "Last review" line. A pattern is only Fixed with a commit, and Declined only with a reason, so nothing gets re-argued from scratch.
5. **A fix has to prove itself.** If a later retro raises a Fixed pattern again, it's reopened with a note that the fix didn't work.

## Why

The user wants retros to lead to changes that actually help ("hunt for something we can actually solve"), without ending up with many half-done fixes. One pick per review keeps focus and fits a single worker. Closing every item (Outcome + ledger) stops the same friction being rediscovered, and records why things were declined. Retros stay append-only in the agent's voice, so they remain trustworthy evidence.

## Rejected

- **Fix everything a review finds:** too many changes at once, most of them one-off and low value, and no way to tell which change helped.
- **Only track patterns in the README, and leave the retros as they are:** it's then unclear which retro items were considered, so the next review re-reads everything.
- **Delete or archive retros once they're handled:** loses the evidence behind "Declined" and "Fixed", which is what reopening depends on.

## First review (2026-09-27): 8 retros, 21 friction items

| Pattern | Retros | Cost | Solvable here? | Outcome |
|---|---|---|---|---|
| **Briefs leave scope implicit:** which files or sections count, "if any" for files that don't exist, catchphrases that weren't in the code yet, "a new level" meaning a new module | 5 | ~30 min, plus one worker briefed for the wrong task | Yes: a brief template, a brief check, briefs saved as files | **Chosen** → `docs/briefs/2026-09-27-brief-template.md` |
| **`WORKLOG.md` is a merge hotspot:** a conflict on nearly every parallel merge (~10 today), one commit with conflict markers, rotation blocked | 2 (+ coordinator) | ~40 min in total, one broken commit | Yes, in one line | **Fixed now** (tiny): `.gitattributes` `merge=union`; only the coordinator rotates |
| Audit misses content overflowing inside the question card | 1 | 15 min, **child-visible** | Yes | **Runner-up** (next review starts here) |
| `check-lines` rough edges: `{placeholders}`, boolean arguments, `samples` flagged by Knip | 3 | ~35 min | Yes | Fixed today (placeholders ignored; booleans also rendered false; lines files are Knip entry points) |
| No automatic check of spoken lines; specs duplicate spoken lines | 2 | ~15 min | Yes | Fixed today: lines files and `check-lines` |
| Voice guide edge cases | 2 | ~10 min | Yes | Fixed today (AGENTS.md) |
| Codex usage limits and startup prompts | 1 (coordinator) | ~2 h | No: outside the repo | **Declined** as a project; handled by policy in the delegate skill (fewer Codex workers; Claude pauses and resumes) |
| Game code couples model and scene (`eggScene`'s single `showModel`; hint methods reused in `onSolved`) | 2 | ~25 min | Partly, as a refactor | **Declined** for now: the refactor risk outweighs the benefit at this scale. Revisit if a third game hits it. |

## Links
- Skills: `.claude/skills/retro/SKILL.md` (write), `.claude/skills/retro-review/SKILL.md` (process), `.claude/skills/delegate/SKILL.md` (run).
- Ledger: `docs/retros/README.md`.
