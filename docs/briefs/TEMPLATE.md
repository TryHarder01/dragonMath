# Brief: <short title>

## Goal
One or two sentences: what "done" looks like, stated as a fact about the repo, not a to-do list.

## Why
The problem this fixes and where it came from (a retro, a decision, a request). Link the source.

## Current state (facts to rely on)
Facts the worker can't get by skimming the repo: what exists, what doesn't, and places where a guide or spec describes something the code doesn't have yet.

## You own
Every file this worker may create or edit, one path per line, each in backticks. Mark a path that doesn't exist yet with `(new)` right after it. Note here what other work runs in parallel, and how to touch a shared file (e.g. append to your own section only; keep `{ }` balanced in your section of `styles.css`, including a trailing `@media` block).

## Don't touch
Files and directories that are off-limits, so the worker doesn't wander into someone else's area or an unrelated one.

## In scope
A numbered list of the concrete changes to make. Be specific: which sections, which behavior, exact wording if it matters — this is where "leaves scope implicit" bites.

## Out of scope
What might look related but isn't part of this task, so the worker doesn't do it "while they're in there".

## Done when
The observable end state: a check passes, a file exists, a command's output matches.

## Verify
The exact commands to run before reporting done, in order, plus `just verify` when game code changed.

## Finish
How to commit (with the right `Co-Authored-By` line, on the worker's branch, not pushed or merged), what to write in `WORKLOG.md` and the retro (`.claude/skills/retro/SKILL.md`), and what `worker_done` must include: SHA, diff stat, check output, deviations, `Friction: …`. Follow the scale and quality bar in `AGENTS.md`: read like the surrounding code, no speculative options or defensive checks for impossible states, reuse existing helpers, the smallest diff, only claim checks actually run.
