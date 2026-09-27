# Research: worklog pattern for agent-driven development

- **Date:** 2026-09-26 (sources checked the same day)
- **Led to:** [docs/decisions/2026-09-26-worklog-format.md](../decisions/2026-09-26-worklog-format.md), implemented in [`.claude/skills/worklog/SKILL.md`](../../.claude/skills/worklog/SKILL.md)

## Question

How should agents working in this repo record their work, so the next session (agent or human) can pick it up without having to reconstruct what happened? Sub-questions: one file or many, how to link entries to commits, how to keep a growing log cheap to read, and where decisions belong.

## Agent handoff and progress files

- **Anthropic's harness** for multi-session agents keeps a single `claude-progress.txt` alongside git commits and a feature list. Each session reads the progress notes and `git log` first, works on one item, then updates the log and commits. It's framed as engineers working in shifts with no memory of the previous shift. Without it, new sessions "spend substantial time trying to get the basic app working again." The post doesn't say whether progress notes reference commit hashes.
- **Osmani** surveys long-running agent setups (Ralph loop, Anthropic, Cursor). The recurring shape is state kept outside the agent's context in a few durable files (`progress.txt`, a spec, `AGENTS.md`). The progress log is append-only, described as "a session-as-event-log," and agents "commit progress every meaningful unit of work."
- **Bustamante** describes `PROGRESS.md` as an append-only lab notebook, with `git log` as the "recovery trail." Durable files on disk, not conversation history, are "the real continuity layer."
- **agentpatterns.ai** is a summary of the above. Its examples likewise append to one `progress.txt`, next to a separate feature list and init script.
- The contents recommended for a handoff note are consistent across sources: what was attempted, what changed, the commands used to verify it, what's still failing, and gotchas.

## Human developer logs

- **Stack Overflow (Pekarsky, 2024):** start each session by writing the goal, record struggles as well as solutions, and park side-ideas in their own section. It keeps the journal as a personal, gitignored file. We differ here, because our log is shared project state.
- **The Pragmatic Engineer (Orosz):** a single-document work log covering code changes, reviews, design docs, planning, helping others and postmortems. It's built for performance reviews and "quantifying impact," like Julia Evans' brag document, so it records impact, not handoff state.

## One file or many

- **Changelogs moved to one file per change because of merge conflicts.** Every entry goes in at the same spot, so any two open branches conflict. GitLab called it a "changelog conflict crisis" and moved to per-change files in `changelogs/unreleased/`, combined into `CHANGELOG.md` by a script. towncrier and changesets do the same, and many projects are making the same switch now. Readers still get one combined file.
- **Architecture decision records (Nygard, 2011) are one file per decision**, numbered in a folder. The collection is the decision log. They're records you look up later, not a running handoff note.
- **Agent progress logs are one file** in every source above, because a new session needs one read to catch up.
- **For us:** conflicts only happen with parallel writers. One person working sequentially on `main` has none, so one file is right. Fragments become the answer once agents work in parallel branches or worktrees.

## Linking entries to commits

- A commit can't contain its own hash, because the hash is computed from the commit's contents, including every file.
- git notes can attach text to an existing commit, but `git push` doesn't send them unless you configure it.
- If the entry lands in the same commit as the work, `git blame WORKLOG.md` already shows the commit for every line, and `git blame -C -C` follows lines moved to other files.

## Where decisions belong (our reasoning, not from a source)

- Nygard's ADRs each record the forces behind one decision. They're for choices that shape a project, not every choice. Most choices an agent makes mid-task are implementation detail, and a log bullet is enough.
- A decision record is only worth having if the reason in it is the real one. The decisions that shape this project have mostly been the user's, so the user should approve decision records rather than agents writing them unprompted.

## Sources

- [Anthropic – Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Addy Osmani – Long-running agents (2026-04-28)](https://addyosmani.com/blog/long-running-agents/)
- [Nicolas Bustamante – Long running agent engineering (2026-05-12)](https://nicolasbustamante.com/blog/long-running-agent-engineering)
- [AgentPatterns.ai – Long-running agents](https://agentpatterns.ai/patterns/agent-design/long-running-agents/): a summary of the above
- [Stack Overflow Blog – You should keep a developer's journal (2024-12-24)](https://stackoverflow.blog/2024/12/24/you-should-keep-a-developer-s-journal/)
- [The Pragmatic Engineer – A work log template for software engineers](https://blog.pragmaticengineer.com/work-log-template-for-software-engineers/)
- [GitLab – Solving GitLab's changelog conflict crisis (2018)](https://about.gitlab.com/blog/solving-gitlabs-changelog-conflict-crisis/)
- [Michael Nygard – Documenting architecture decisions (2011)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [adr.github.io](https://adr.github.io/)

Dropped after checking: two SashiDo posts (vendor marketing that repeats Anthropic's points), claudecodeguides.com (recommends the JSON approach we rejected), dailydevpost.com (doesn't address these questions), and Level Up Coding (403, couldn't be checked).
