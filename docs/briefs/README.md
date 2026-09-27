# Briefs

One brief per delegated task, at `docs/briefs/YYYY-MM-DD-<slug>.md`, written from `docs/briefs/TEMPLATE.md`. Commit it to `main` before launching the worker, so the worktree branches from it.

A worker's `--spec` is just the pointer: "Your brief is `docs/briefs/<file>`. Read it and do it." — the brief carries the rest.

Run `just brief-check docs/briefs/<file>` before launch. It's not part of `just check`, since a brief only matters at launch time.

A retro (`.claude/skills/retro/SKILL.md`) names its brief in its header line.
