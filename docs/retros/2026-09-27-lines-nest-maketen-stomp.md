# Retro: lines-nest-maketen-stomp (Claude Sonnet 5)

**Friction** (most costly first; tag each with one category):
- [checks] Two chant-style lines (`addChant`/`subChant` in both nestBuilder and makeTen) naturally take 5–6 numeric params. `check-lines.mjs`'s header says to export `samples` for lines it can't render with the default 4-arg tuples, but doing that makes Knip flag `samples` as an unused export — it's only read dynamically via `server.ssrLoadModule`, so static analysis can't see the usage, and I couldn't touch `scripts/` or a Knip config to fix the checker itself. Worked around it by redesigning the functions to derive redundant params internally (e.g. `nextTen = a + bridge`), dropping them to 3 args so no `samples` export was needed. Cost ~15 min figuring out; the fix is fine, but the `samples` pattern the header documents doesn't actually work cleanly under Knip yet.
- [environment] `WORKLOG.md` is past the 500-line rotation threshold, and two other workers were appending to it in parallel worktrees for the sibling game conversions. Rotating now would touch the whole file and collide with their concurrent inserts, so I skipped it and noted the decision in my entry instead.

**Time lost:** ~15–20 min, almost all on the Knip/`samples` issue.

**Suggested fix:** Either add `scripts/check-lines.mjs` (or its dynamically-loaded lines files) to Knip's ignore config so a `samples` export doesn't get flagged, or update the script's header comment to steer authors toward reducible-arity functions instead of `samples` when possible.
