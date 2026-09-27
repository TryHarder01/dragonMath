---
name: worklog
description: Record a finished chunk of work in WORKLOG.md at the repo root, and read it first when starting new work. Use at the end of any meaningful chunk of work (a feature, fix, refactor, investigation, or a session that has to stop partway), when the user says "log this" or "update the worklog", or when you pick up work in this repo and need to know where things stand.
---

# Worklog

`WORKLOG.md` at the repo root is the handoff note between sessions. Think of engineers working in shifts: the next agent or human arrives with no memory of this session. They read the log and `git log`, and they should be able to keep going without reverse-engineering what happened.

The log sits alongside git history and doesn't replace it. Commits record *what* changed. The worklog records *why*, what was checked, what's still broken, and what comes next.

## Session flow

1. **Orient.** Read the latest entry, `git status` and `git log`, as described below.
2. **Scope.** Pick one chunk, usually the latest entry's **Next**. Agree on a plan with the user first if the chunk is big or unclear.
3. **Build.** Work in small steps. Stop and ask when a choice belongs to the user, such as tone, design or scope.
4. **Verify.** Run the real checks and note exactly what you ran and what you didn't.
5. **Log.** Write the entry.
6. **Commit.** Code and entry together, when the user says to commit.
7. **Report.** Tell the user what changed, what wasn't verified, and any `[promote?]` decisions.

## When starting work

1. Read only the top of `WORKLOG.md` (Read with `limit: 80`). Newest entries come first, so this covers the latest one or two. Don't read the whole file.
2. For an older entry, run `grep -n '^## ' WORKLOG.md` to list every entry's date and title with line numbers, then read just that entry with `offset`. Older months are in `docs/worklog/`.
3. Run `git status` and `git log --oneline -10`. A dirty working tree with no matching entry means work was left unlogged. Tell the user and sort it out before starting anything new.
4. Check the latest entry's **Open / broken** and **Next** before picking up new work.

## When finishing a chunk

A chunk is one coherent unit, such as a feature, a bug fix, a refactor or an investigation. It also counts as a chunk when a session has to stop partway through, and that is exactly when an entry matters most. Don't log trivial edits.

Add the new entry at the **top**, with a single Edit that inserts it directly below the `# Worklog` title line. Never rewrite `WORKLOG.md` with Write: that can silently drop or alter old entries. If the file doesn't exist, create it with `# Worklog` as the first line.

### Entry format

```markdown
## YYYY-MM-DD — <short title of the chunk>

**Goal:** One line: what this chunk set out to do.

**Done:**
- What changed, at the level of behavior and files. Skip line-by-line detail; the diff has it.

**Decisions:**
- <choice made> — <why>, and the rejected alternative if it wasn't obvious.

**Verified:** How you know it works: the exact commands run, tests passed, and what you checked manually. Write "not verified" if it wasn't.

**Open / broken:**
- Known failures, TODOs, shortcuts taken, and anything left half-done.

**Next:**
- The concrete next step or steps, specific enough to start without re-planning.

**Gotchas:** (optional) Non-obvious traps such as config quirks, flaky tests, env setup, or commands that must be run first.
```

### Rules

- **Short.** Use bullets rather than prose. Aim for about 15 lines. If a chunk needs much more, it was probably several chunks, so give each its own entry.
- **Honest.** Never mark something as verified unless you ran it. List failures plainly under Open / broken.
- **Specific.** Give file paths, command lines and error messages, not phrases like "fixed some issues".
- **Write it before you forget.** Write the entry while the details are fresh, and before the final summary to the user.
- **Append only.** Never edit or delete older entries. If an earlier entry turns out to be wrong, say so in the new entry. Old entries keep their original wording, even names or terms that a later rule retires (for example "Egg Zapper").
- **Drop empty sections.** Leave out any section that has nothing to say, except **Verified** and **Next**, which every entry needs.
- **Decisions: capture, don't promote.** Give the reason for each decision. For decisions the user made, record the reason they gave, or write "reason not given". Never invent one. If a decision will constrain future work (naming, tone, teaching rules, architecture), tag it `[promote?]` and ask the user whether it deserves its own file in `docs/decisions/` (template in `docs/decisions/README.md`). Don't create decision files unless asked. When a decision changes, supersede its file rather than editing it.
- Use today's absolute date. Never write relative dates like "yesterday".
- Don't put secrets, tokens or credentials in the log.

### Commits

- `WORKLOG.md` is tracked in git. When the work is committed, the entry goes in the same commit, so the log and the history never drift apart. Commit only when the user says to.
- Use the entry title as the commit subject, so `git log --grep "<title>"` finds it.
- Don't put commit hashes in entries. A commit can't contain its own hash. `git blame WORKLOG.md` already shows the commit behind every entry.

## Rotation

When `WORKLOG.md` passes about 500 lines, move all entries from before the current month into `docs/worklog/YYYY-MM.md`, one file per month, newest first, with their wording unchanged. End `WORKLOG.md` with the line `Older entries: docs/worklog/`. Do this in a commit of its own titled "Rotate worklog". Moving entries this way doesn't break the append-only rule. `git blame -C -C` follows the moved lines, so their commits can still be found.
