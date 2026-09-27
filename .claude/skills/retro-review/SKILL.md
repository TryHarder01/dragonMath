---
name: retro-review
description: Process the agents' friction reports in docs/retros/, find the patterns, pick ONE solvable improvement, and close the loop (outcomes on each retro, the pattern ledger, a decision note, a spec to hand out). Use after a delegated run finishes, when the user asks to "review the retros", "process retros" or "find something to fix from the retros", or when docs/retros/ has several unreviewed reports. Work in progress: improve the procedure after each use (see "Improve this skill").
---

# Retro review: from friction reports to one fix

Retros (`.claude/skills/retro/SKILL.md`) are cheap to write and useless unless someone acts on them. This skill turns a pile of them into **one** well-chosen improvement, and leaves a record so the next review starts where this one stopped. The rules for how retros are handled live in `docs/decisions/2026-09-27-retro-handling.md`; this is the procedure.

## 1. Gather what's new

- `just retros` lists them. **Unreviewed** = no `## Outcome` section yet. Also check `docs/retros/README.md` ("Last review") for anything left open.
- Include retros still sitting in worktrees (`~/orca/workspaces/<repo>/*/docs/retros/`) if their runs are finished.

## 2. Extract items

One row per friction bullet, in a scratch table (not committed):

| # | Retro | Category | What happened (short) | Time lost | Suggested fix |

Split a bullet that mixes two problems. Take the category from the tag, and fix it if it's wrong (e.g. a "tooling" item that's really an unclear brief).

## 3. Cluster into patterns

Group rows by **root cause**, not by symptom or file: "brief didn't say which spec sections count" and "brief said *if any* about a file that doesn't exist" are one pattern (briefs leave scope implicit). Look at the ledger's Open patterns first, since a new row may belong to one.

## 4. Score and pick ONE

For each pattern, fill in:
- **Recurrence:** how many retros raised it (and how many runs).
- **Cost:** the total time lost it reported, plus whether it lets a child-visible bug through (a check that passes something broken counts double).
- **Solvable here:** a concrete change in this repo (a script, a check, a template, a line in AGENTS.md or a skill) that we can verify. "Codex has usage limits" is not solvable here; "run fewer Codex workers" is a policy line, not a project.
- **Size:** the fix should fit in one worker's task.

Pick the **one** with the best recurrence × cost among the solvable ones. Tie-break: prefer what prevents mistakes (a check, a template) over what documents them. Write down the runner-up, so the next review can start there.

## 5. Close the loop on every item

1. **Each retro file gets an `## Outcome` section** (the coordinator adds it; don't edit the agent's text): one line per friction bullet, with one of:
   - `Fixed: <what>, <commit>`
   - `Pattern: <ledger name>` (open, tracked there)
   - `Chosen: <ledger name>` (this review's pick; a spec is going out)
   - `Declined: <why>` (a real reason: not solvable here, too rare, cost exceeds benefit)
   - `Noted: <why no action>` (no change needed, e.g. resolved by reading the guide)
2. **Update the ledger** in `docs/retros/README.md`: Open / Chosen / Fixed / Declined, each pattern listing the retros that raised it. Update "Last review" (date, retros reviewed, pick, runner-up).
3. **Write the pick up as a brief** (`docs/briefs/YYYY-MM-DD-<slug>.md`, same headings as the existing briefs), with **Worked if** in the ledger (which retro complaint should stop appearing). **If the fix is a check, the brief requires red then green:** show the check failing on a deliberately broken case (paste the output), then passing. A check that has never failed isn't proven. Hand it out with the delegate skill.
4. **When the fix merges,** move the pattern to Fixed with the commit. **If later retros raise it again, reopen it** with a note: the fix didn't work.

## More than one fix

If the user asks for another fix before new retros arrive, **don't re-score**: take the ledger's runner-up, move it to Chosen, and name the next runner-up (or "none: next review"). Run it in parallel with the current pick only if the two briefs' **You own** lists don't overlap.

## 6. Report

Tell the user: how many retros and items, the patterns (one line each, with recurrence and cost), the pick and why, the runner-up, and what was declined. Keep it short.

## Improve this skill

This skill is new, so improve it after each use. When a step was awkward or wrong, **change the procedure itself**, and don't append notes. The commit message says what went wrong and why the step changed (`git log -p` on this file is the history). Keep this file to what's needed on every run.
