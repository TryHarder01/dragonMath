# Brief: briefs as files, with a template and a check

## Goal
Every task handed to an agent gets a written brief in `docs/briefs/`, built from one template that makes scope explicit, and checked by a small script before launch.

## Why
The first retro review (`docs/decisions/2026-09-27-retro-handling.md`) found that the most common friction, in 5 of 8 retros, was **briefs leaving scope implicit**:
- which spec sections counted;
- "if any" about files that had nothing to change;
- a catchphrase the guide listed that the code didn't have yet;
- "a new level" meaning a new module.

Each cost agents time or sent one down the wrong path. Briefs are currently written freehand in the coordinator's scratch space and never kept.

## Current state (facts to rely on)
- `docs/briefs/` exists and holds only this file. It's the first brief and doubles as the example. **Keep its section headings as the template's.**
- The delegate skill (`.claude/skills/delegate/SKILL.md`, "1. The brief") lists what a brief must contain, as prose. Nothing checks it.
- Workers receive the brief as the `--spec` text of `orca orchestration worker-start`.
- `just check` runs `scripts/check.mjs`, Knip and `scripts/check-lines.mjs`. Follow `scripts/check-lines.mjs` for style (a header comment, `✗`/`✓` output, and exit code 1 on problems).

## You own
- `docs/briefs/TEMPLATE.md` (new)
- `docs/briefs/README.md` (new)
- `scripts/check-brief.mjs` (new)
- `justfile`: one new recipe, `brief-check`
- `.claude/skills/delegate/SKILL.md`: sections "1. The brief" and "2. Launch" only
- `.claude/skills/retro/SKILL.md`: one line (below)
- your `WORKLOG.md` entry, and your retro

## Don't touch
Game code (`src/`), `AGENTS.md`, the other `scripts/`, `docs/specs/`, `docs/decisions/`, `docs/retros/README.md`, and this brief's content.

## In scope
1. **`docs/briefs/TEMPLATE.md`:** the section headings of this brief, each with one or two lines saying what goes there. **Current state** is where the coordinator writes facts that aren't obvious from the repo: what exists, what doesn't, and "the guide says X, but the code doesn't have it yet". **You own** lists paths, one per line; files that don't exist yet are marked `(new)`.
2. **`docs/briefs/README.md`:** a few lines. One brief per delegated task, named `YYYY-MM-DD-<slug>.md`, committed before launch. The worker's `--spec` is just "Your brief is `docs/briefs/<file>`. Read it and do it." Retros name their brief.
3. **`scripts/check-brief.mjs <file>`** (and `just brief-check <file>`) flags:
   - a missing required section (the headings of this brief);
   - a path in **You own** that doesn't exist and isn't marked `(new)`;
   - vague scope words in **You own**, **In scope** and **Out of scope**: "if any", "etc", "as needed", "where appropriate", "and so on".

   Print `✓ brief OK` or one `✗` line per problem, exiting 1 on problems. Run it on this brief (it must pass, apart from its own `(new)` files once you create them) and on a deliberately broken copy in your scratch space (it must fail).
4. **Delegate skill:**
   - "1. The brief": replace the numbered prose with: write the brief from `docs/briefs/TEMPLATE.md`, run `just brief-check`, commit it with any spec.
   - "2. Launch": the `--spec` points at the brief file.

   Keep what the prose says that the template doesn't cover (e.g. the quality bar and ownership reminders), folded into the template's guidance.
5. **Retro skill:** in its format, the header line names the brief (`# Retro: <task> (brief: docs/briefs/<file>)`).

## Out of scope
- Converting past briefs (they were never saved).
- Adding `brief-check` to `just check`, since briefs only matter at launch.
- Any change to `orca` usage beyond the `--spec` text.

## Done when
- `just brief-check docs/briefs/2026-09-27-brief-template.md` passes, and it fails on a broken copy with a clear message per problem.
- `docs/briefs/TEMPLATE.md` and `docs/briefs/README.md` exist, and the delegate and retro skills point at them.
- `just check` still passes.

## Verify
`npm run typecheck`, `just check`, `just brief-check docs/briefs/2026-09-27-brief-template.md`, plus the failing broken copy (paste its output into your worklog entry). No game code changes, so the play-throughs aren't needed.

## Finish
- Follow the scale and quality bar in `AGENTS.md`: a small script like `check-lines.mjs`, no config options, plain prose.
- Commit on your branch, with "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" at the end of the message. Don't push or merge.
- Write your retro (`docs/retros/2026-09-27-brief-template.md`, naming this brief), and pass it as `--report-path`.
- Send `worker_done` once, with the SHA, the diff stat, the check outputs, and "Friction: …".
