# Decisions

One short file per decision that shapes future work: what we chose, why, and what we rejected. Run `ls docs/decisions/` to see everything that has been decided.

- **Research** (`docs/research/`) holds the evidence. **Decisions** (here) hold the choice. A decision links to its research. It doesn't copy it.
- `CLAUDE.md` states each rule in a line and links here for the reasons.
- Small, local choices stay as bullets in `WORKLOG.md`. A decision gets a file here when it constrains future work, is costly to undo, or is likely to be re-argued.
- Agents don't create these on their own. They tag the worklog bullet `[promote?]` and ask. See `.claude/skills/worklog/SKILL.md`.
- Never edit a decision's substance after the fact. To change one, write a new file and set the old one's status to `Superseded by <file>`. Fixing typos and adding links is fine.

## Template

File name: `YYYY-MM-DD-<short-slug>.md`, using the date of the decision.

```markdown
# <Decision as a short statement>

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Decided | Superseded by <file>
- **Decided by:** user | agent (with user approval)
- **Revisit when:** <a concrete trigger>

## Decision
One or two sentences.

## Why
The actual reason. For a decision the user made, their reason in their words, or "reason not given". Never an invented one. Link to research if any.

## Rejected
- <alternative>: <why not>

## Links
- Research, worklog entries, commits (`git log --grep "<title>"`).
```
