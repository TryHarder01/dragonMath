---
name: delegate
description: Hand work in this repo to other agents (Codex or Claude, usually via Orca worktrees) and bring it back safely - writing the brief, launching, supervising, reviewing, merging, verifying, cleaning up, and reviewing their retros for patterns. Use when the user asks to orchestrate, fan out, "send it to codex/claude", run agents in worktrees, or coordinate parallel work in this repo.
---

# Delegate: hand work out and bring it back

This is the repo-specific playbook. For the Orca commands themselves, load the global `orchestration` skill and run `orca skills get orchestration` (it's version-matched). This file covers what that guide can't know: what worked and what went wrong in this repo.

## 0. Before sending anything

- **Ask the guiding questions first**, in one round: spec defaults to override, parallel vs staged, git flow (workers commit on their branch; the coordinator merges), push policy (pushing `main` deploys to Netlify), and which model.
- **Words to check:** "a new level" may mean a **new module on the map**, not a level inside a game. Ask if unsure.
- **Split by file ownership**, not by feature, so parallel workers rarely touch the same lines. One game per worker is the natural unit.

## 1. The brief (every worker, from the start)

Self-contained: the worker has none of your context. Include, in this order:

1. **Task and target:** the spec file to follow, and the exact files it may edit.
2. **Read first:** `AGENTS.md` (especially **Scale**), the top of `WORKLOG.md`, the spec, and a sibling file to copy the style of (e.g. `src/games/eggCrates.ts`).
3. **Ownership:** what it must not touch, and who else is working in parallel on what. Shared files: append to its own section only. In `styles.css`, keep `{ }` balanced **inside its own section, including a trailing `@media` block**.
4. **The quality bar:** read like the surrounding code; no speculative options or defensive checks for impossible states; no exports just for tests and no `?audit` branches in game code (`just check` runs Knip); reuse `src/core` helpers; the smallest diff; plain prose; only claim checks it ran; before reporting, read its own `git diff main` as a strict reviewer and delete what the spec or the child wouldn't miss.
5. **Verify:** typecheck and build, `node scripts/audit.mjs --only=<its screens>`, `node scripts/playthrough.mjs <id> --level=all` (plus `--size=phone` and `--real` for screens it changed, and **look at the screenshots**), then `just verify`.
6. **Finish:** commit on its branch with the right `Co-Authored-By` line; don't push or merge. Write a retro (`.claude/skills/retro/SKILL.md`), then send `worker_done` once, with the SHA, diff stat, verification results, deviations and `Friction: …`.

Add a size budget when the job is review or tightening (e.g. "the file must not grow").

## 2. Launch

- `orca orchestration run-create …` once per batch, then one `worker-start --worktree new-top-level --repo path:<repo> --base-branch main --name <slug> --agent codex|claude [--model … --effort …] --setup run` per worker. `orca.yaml` runs `npm install` in each new worktree.
- **Commit specs to `main` before launching**, so the worktrees branch from them.
- Launch one worker first when the environment is new or updated, since startup prompts block everyone.
- **Models:** Sonnet at high effort for build and review work, with the coordinator (Opus) reading every diff. Keep Opus for fresh reviews of teaching-critical logic. Don't switch a worker's model mid-task: it restarts from scratch.

### Known blockers

- **Codex `agent-hooks-review-prompt`:** new or changed hooks (e.g. updated OpenAI bundled plugins) need trust. Read the real screen with `orca terminal read --terminal <h> --screen --json`, press Enter on "Review hooks", check where they come from, then `t` to trust all. It's saved in `~/.codex/config.toml`.
- **Codex `agent-update-prompt`:** set `dismissed_version` in `~/.codex/version.json`, then retry.
- **Typing into a worker's TUI:** a digit plus Enter doesn't register; a bare `--enter`, arrow keys (`$'\e[B'`) and single letters do. Orca refuses free-text prompts to a dispatched worker (`agent_prompt_blocked`): use `orchestration send`.
- **Usage limits:** four Codex workers at high effort use up a 5-hour Codex window in about 35 minutes. Codex stops on a menu, so `worker-stop` it, then `worker-start --task <id> --retry-of <dispatch> --worktree id:<repo>::<path>`, and send the retry a message saying the old work is on disk. Claude Code workers pause and resume on their own after a reset.
- A failed `worker-start` leaves a terminal: follow its `recovery` line (`worker-release`).

## 3. While they run

- Wait with `orca orchestration check --run <run> --wait --types worker_done,escalation,question` in the background. **Ack every delivery** (`--ack <id>`), or it replays.
- Heartbeats are just "alive". Answer escalations with `orchestration reply --id <msg>`.
- To steer mid-run, `orchestration send --to dispatch:<id>`. It arrives at the worker's next checkpoint, not instantly.
- A worker stuck at 0% CPU with no file changes is usually on a menu (a usage limit or a prompt). Read `--screen`.

## 4. Review and merge (the coordinator's job)

1. Read the whole diff: `git diff main...<branch>`. Check it against the spec and the quality bar, and look at the key screenshots yourself. If something needs another pass, reuse the same terminal for a follow-up task (`worker-start --spec … --terminal <handle> --worktree <same>`). Fix small things yourself.
2. Merge with `git merge --no-ff <branch>`. **Resolve conflicts by hand.** Blindly keeping both sides is only safe for pure appends (worklog entries, new CSS sections, new `SCREENS` entries). It breaks deletions (e.g. `UPCOMING` in `src/games/index.ts`) and edited lines (`DESIGN.md` tables, `follow-ups.md`). Pass conflicted files to scripts one per line: a trailing space in a file name once left conflict markers in a commit.
3. **`just check`** after every merge (conflict markers, and CSS braces per section), then typecheck.
4. After the last merge, run `just verify`, then push if the user approved it. **Pushing `main` deploys the live site.**
5. Release each settled worker (`worker-release --dispatch`). Once every branch is merged and its worktree is clean, remove the worktrees with `orca worktree rm --worktree path:<dir> --force`, which also deletes their branches.

## 5. After a run: the retros

Run the `retro-review` skill (`.claude/skills/retro-review/SKILL.md`). It turns the run's retros into **one** fix, and closes out every item: an `## Outcome` on each retro, and the ledger in `docs/retros/README.md`. The rules are in `docs/decisions/2026-09-27-retro-handling.md`. Tiny fixes (under about 10 minutes) are done straight away. The pick gets a brief and a worker.
