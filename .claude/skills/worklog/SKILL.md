---
name: worklog
description: Record a finished chunk of work in WORKLOG.md at the repo root, and read it first when starting new work. Use at the end of any meaningful chunk of work (a feature, fix, refactor, investigation, or a session that has to stop partway), when the user says "log this" or "update the worklog", or when you pick up work in this repo and need to know where things stand.
---

# Worklog

`WORKLOG.md` at the repo root is the handoff note between sessions. Think of engineers working in shifts: the next agent or human arrives with no memory of this session. They read the log and `git log`, and they should be able to keep going without reverse-engineering what happened.

The log sits alongside git history and doesn't replace it. Commits record *what* changed. The worklog records *why*, what was checked, what's still broken, and what comes next.

## When starting work

1. Read the most recent entries in `WORKLOG.md` (newest are at the top) if the file exists.
2. Skim `git log --oneline -10` if this is a git repo.
3. Before starting anything new, check the latest entry's **Open / broken** and **Next** lines.

## When finishing a chunk

A chunk is one coherent unit, such as a feature, a bug fix, a refactor or an investigation. It also counts as a chunk when a session has to stop partway through, and that is exactly when an entry matters most. Don't log trivial edits.

Add a new entry at the **top** of the file, under the title. If the file doesn't exist, create it with `# Worklog` as the first line.

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

- **Short.** Use bullets rather than prose. Aim for 5–15 lines per entry. It's a log, not a report.
- **Honest.** Never mark something as verified unless you ran it. List failures plainly under Open / broken.
- **Specific.** Give file paths, command lines and error messages, not phrases like "fixed some issues".
- **Write it before you forget.** Write the entry while the details are fresh, and before the final summary to the user.
- **Append only.** Never edit or delete older entries. If an earlier entry turns out to be wrong, say so in the new entry.
- **Drop empty sections.** Leave out any section that has nothing to say, except **Verified** and **Next**, which every entry needs.
- **Commit it with the work.** `WORKLOG.md` is tracked in git. Include the entry in the same commit as the change it describes, so the log and the history never drift apart.
- Use today's absolute date. Never write relative dates like "yesterday".
- Don't put secrets, tokens or credentials in the log.
