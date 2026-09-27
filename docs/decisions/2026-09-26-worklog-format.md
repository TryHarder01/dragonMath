# One newest-first WORKLOG.md as the session handoff

- **Date:** 2026-09-26
- **Status:** Decided
- **Decided by:** agent (with user approval), from the research
- **Revisit when:** More than one agent or branch writes entries at the same time (switch to fragments), or entries start getting skipped or padded.

## Decision
- **One `WORKLOG.md`** at the repo root, newest entry first, committed with the work it describes.
- **Fixed sections.** Every entry has Goal, Done, Decisions, Verified, Open / broken, Next and optional Gotchas. Verified and Next are always required.
- **Append-only.** Corrections go in new entries.
- **Cheap reads.** Agents read only the top of the file. At about 500 lines, older months rotate into `docs/worklog/YYYY-MM.md`.
- **No commit hashes in entries.** The entry title matches the commit subject.
- **Agents record decisions but don't promote them.** They tag candidates `[promote?]`, and the user decides whether one gets a file here.

The details are in `.claude/skills/worklog/SKILL.md`.

## Why
- **One file:** one read at session start, easy to grep. Anthropic's harness and Osmani's and Bustamante's patterns all use a single appended progress file.
- **Newest first:** agents read from the top, so the entry that matters costs the fewest lines, however long the file gets.
- **Committed:** the log is shared project state, and landing in the same commit keeps it in step with history.
- **Verified and Next required:** they are the most useful parts of a handoff and the most often left out.
- **Append-only:** an agent that "cleans up" old entries destroys the record.
- **No hashes:** a commit can't contain its own hash, and `git blame WORKLOG.md` already links every entry to its commit.
- **No self-promoted decisions:** most agent choices are implementation-level, and the decisions that matter are usually the user's. An agent writing them up risks recording an invented reason.

## Rejected
- **One file per entry (fragments):** that is what changelog tools like towncrier, changesets and GitLab do, to avoid merge conflicts between parallel branches. With one person working sequentially on `main`, there are no conflicts, and fragments would cost an extra step to read. This is the planned switch if work goes parallel.
- **A JSON feature list or progress file:** suited to large autonomous builds against a fixed spec. Too much overhead here.
- **Brag-doc or impact-log style:** built for performance reviews, so it records impact rather than state.
- **Appending at the bottom:** writing is about as easy either way, but reading the latest entry becomes harder.
- **Hashes by other means:** a second commit per entry doubles the commits. Recording the previous commit's hash breaks when work is left uncommitted. git notes aren't pushed by default.

## Links
- [Worklog research](../research/2026-09-26-worklog-pattern.md).
- `.claude/skills/worklog/SKILL.md`.
