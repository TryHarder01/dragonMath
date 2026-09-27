# Retro: brief template and check script (brief: docs/briefs/2026-09-27-brief-template.md)

**Friction** (most costly first; tag each with one category):
- [checks] Running `just brief-check` on this brief itself initially failed: the checker's naive word-boundary scan over the whole "In scope" section flagged the brief's own item 3, which *quotes* the banned vague-scope phrases ("if any", "etc", ...) as literal examples of what the script must flag. Fixed by only scanning unindented top-level bullets/numbers, not the indented sub-bullets that elaborate on an item. Cost about 10 minutes to spot and fix.
- [instructions] The brief doesn't say whether the retro header format (`# Retro: <task> (brief: docs/briefs/<file>)`) keeps the old agent-name parenthetical or replaces it. Took the literal string given in the brief, which drops the agent name from the header. Low cost, but worth confirming since it's a small behavior change to a shared skill.

**Time lost:** ~10-15 min total.

**Suggested fix:** None needed beyond the one already applied above — the checker's own dogfood run caught it before merge, which is what the brief's "run it on this brief" step was for.
