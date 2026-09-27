# Research: worklog pattern for agent-driven development

- **Date:** 2026-09-26
- **Status:** Decided. Implemented in [`.claude/skills/worklog/SKILL.md`](../../.claude/skills/worklog/SKILL.md)
- **Revisit when:** `WORKLOG.md` grows past about 500 lines, entries start getting skipped or padded, or we add multi-agent or parallel work.

## Question

How should agents working in this repo record their work, so the next session (agent or human) can pick it up without having to reconstruct what happened?

## Decision

Use one `WORKLOG.md` at the repo root, newest entry first, committed alongside the code. Every entry follows the same short format:

| Section | Required | Purpose |
|---|---|---|
| Goal | yes | What the chunk set out to do |
| Done | if any | Changes at the level of behavior and files, not the diff |
| Decisions | if any | Each choice made, with why, and the rejected alternative |
| Verified | **always** | Exact commands and checks run, or "not verified" |
| Open / broken | if any | Failures, TODOs and shortcuts taken |
| Next | **always** | A concrete next step that can be started without re-planning |
| Gotchas | optional | Config quirks, flaky tests and env traps |

Rules: 5–15 bullet lines per entry. Append-only: never rewrite history, correct it in a new entry. Absolute dates. No secrets. Read the latest entry and `git log` before starting work.

### Why these specific choices

- **One file rather than one file per session or a folder of entries.** It's one place to look, one read at session start, and simple to grep. Per-session files split the context apart and need an index.
- **Newest first rather than chronological append.** Agents read files from the top. The entry that matters (the latest Next and Open) should come first without paging to the end.
- **Committed to git rather than gitignored.** The log is shared project state, not personal notes. Committing each entry with its change keeps the log and the history in step, and makes it reviewable in PRs.
- **Verified and Next are mandatory.** Across the sources, the most useful parts of a handoff are *how we know it works* and *what to do next*. Those are also the parts most often left out. Everything else can be dropped when empty, to keep entries short.
- **Decisions include the why.** Commits already record *what* changed. The reasoning is what gets lost between sessions and what people end up re-arguing.
- **Append-only.** An agent that quietly "cleans up" old entries destroys the record. Corrections go in new entries.
- **Rejected: a JSON or structured feature list** of the kind used in Anthropic's harness. It's useful for large autonomous builds with a fixed spec, but too much overhead for this project right now. We can revisit if we run long autonomous sessions against a feature spec.
- **Rejected: a brag-doc or impact-log style.** That style (Pragmatic Engineer, Julia Evans) is tuned for performance reviews, not handoffs, so it records impact rather than state.

## What the research said

### Agent handoff and progress files

- Anthropic's harness for multi-session agents uses a `claude-progress.txt` alongside git commits and a feature list. Each session reads the progress notes and `git log` first, works on one item, then updates the log and commits. It's framed as engineers working in shifts with no memory of the previous shift. It prevents new sessions from "spending substantial time trying to get the basic app working again" on undocumented, half-finished work.
- Handoff notes should cover what was attempted, what changed, the commands used to verify it, and what's still failing, plus commands to rerun, fixtures added and gotchas (migrations, config, edge cases).
- A plain-text progress file is a cheap way to keep context: it's cheaper than having each new session re-derive state from the code and history.

### Human developer work logs and journals

- A developer log is a chronological, working record of code written, bugs hit, decisions made and lessons learned. It's an engineering journal, not a polished document.
- For decisions, record the options considered and the final outcome, and write it down right away because the details fade within an hour.
- Don't over-engineer it: bullets are fine. Update it as insights happen.
- The Pragmatic Engineer template tracks code changes, reviews, design docs, planning, helping others and postmortems. It's oriented toward impact and review time rather than handoff.

## Open questions for review

- Should `WORKLOG.md` be archived or rotated (for example into `docs/worklog/YYYY.md`) once it gets long?
- Should the skill be triggered automatically (for example by a Stop hook) rather than relying on the agent to invoke it?
- Once there's a CLAUDE.md, should it point to the worklog so every session reads it?

## Sources

- [Anthropic – Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Addy Osmani – Long-running Agents](https://addyosmani.com/blog/long-running-agents/)
- [SashiDo – AI coding long-running agent harness patterns](https://www.sashido.io/en/blog/ai-for-coding-long-running-agent-harness-patterns)
- [SashiDo – Stop losing context: the AI coding workflow fix](https://www.sashido.io/en/blog/ai-assisted-programming-long-running-agent-harness)
- [Claude Code Guides – Agent handoff for long-running tasks](https://claudecodeguides.com/agent-handoff-strategies-for-long-running-tasks-guide/)
- [AgentPatterns.ai – Long-running agents: durability and resumability](https://agentpatterns.ai/patterns/agent-design/long-running-agents/)
- [Nicolas Bustamante – Long running agent engineering](https://nicolasbustamante.com/blog/long-running-agent-engineering)
- [The Pragmatic Engineer – A work log template for software engineers](https://blog.pragmaticengineer.com/work-log-template-for-software-engineers/)
- [Stack Overflow Blog – You should keep a developer's journal](https://stackoverflow.blog/2024/12/24/you-should-keep-a-developer-s-journal/)
- [Daily Dev Post – What is a developer log?](https://dailydevpost.com/blog/what-is-a-developer-log)
- [Level Up Coding – Why every software engineer should start writing a work log](https://levelup.gitconnected.com/every-software-engineer-should-start-writing-work-log-template-f91197acd630)
