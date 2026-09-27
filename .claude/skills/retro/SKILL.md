---
name: retro
description: Write a short friction report about the environment (tooling, instructions, prompts, flaky checks) at the end of a delegated task, so the coordinator can spot patterns and fix them. Use before sending worker_done on any orchestrated or handed-off task, when the user says "retro", or at the end of a long session that hit friction. Reading retros and looking for patterns is covered in the delegate skill.
---

# Retro: report friction back

Every agent that finishes a delegated task writes one short **friction report**. It covers the **environment**, not the task: whatever slowed you down, confused you or made you work around something. The coordinator reads them together and fixes what repeats (see `.claude/skills/delegate/SKILL.md`, "After a run").

A retro is not a worklog entry. The worklog says what you built and verified. The retro says what got in the way.

## When

- Right before `worker_done` on an orchestrated task. Attach it with `--report-path docs/retros/<file>.md`, and put one line in the done summary: `Friction: <the single biggest item>` (or `Friction: none`).
- At the end of any long session that hit friction, even without orchestration.

## Where

One file per agent per task: `docs/retros/YYYY-MM-DD-<task-slug>.md` (e.g. `2026-09-27-make-ten.md`). Parallel agents never share a file, so retros never conflict. Commit it with your work.

## Format

Keep it short: 5–20 lines. **Only real friction you hit this time.** No praise, no general advice, no restating the task. If nothing got in the way, write the header and `No friction.`

```markdown
# Retro: <task> (<agent, e.g. Codex / Claude Sonnet 5>)

**Friction** (most costly first; tag each with one category):
- [tooling] `just playthrough` hung for 30 s when the intro ended before Skip was clicked. Worked around it by re-running.
- [instructions] The spec said "renumber nest-L7", but the audit key was already `nest-L2`/`nest-L7` and the levels had moved. Unclear which was meant.
- [environment] Chrome from parallel play-throughs contended; two runs stalled.

**Time lost:** ~20 min, mostly the first item.

**Suggested fix:** Make the Skip click best-effort in `scripts/playthrough.mjs`.
```

Categories (use exactly these, so the coordinator can group them):
- **tooling:** repo scripts and recipes (`just`, audit, play-through, drivers, build).
- **instructions:** `AGENTS.md`, specs, skills or the task brief were missing, wrong, ambiguous or contradictory.
- **environment:** machine or agent runtime: permission or trust prompts, usage limits, Orca, Chrome, network.
- **codebase:** the code made a sensible change hard (hidden coupling, surprising behaviour, duplicated logic).
- **checks:** a check was flaky, slow, or passed something broken (or failed something fine).

Be specific enough that someone can reproduce it: the command, the error text, the file.
