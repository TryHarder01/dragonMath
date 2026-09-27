# Visual docs are local HTML files, not hosted artifacts

- **Date:** 2026-09-26
- **Status:** Decided
- **Decided by:** user
- **Revisit when:** The pages need to be shared with people outside the repo.

## Decision
Designed, visual pages go in `docs/pages/<name>.html` as self-contained files, opened directly in a browser and linked to each other with relative paths. Don't publish them as claude.ai Artifacts unless explicitly asked. Plain notes stay as Markdown.

## Why
User request. No further reason was given.

## Rejected
- **Hosted claude.ai Artifacts:** the original approach, used for the first two pages. Those artifacts still exist online but are superseded, and the worklog entries that link to them are left as they were.

## Links
- `CLAUDE.md` → "Docs and visual write-ups".
- Worklog: "Scaffold + Egg Zapper MVP; docs pages moved local".
