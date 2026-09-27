# Retro: lines-stairs-crates (Claude Sonnet 5)

**Friction** (most costly first; tag each with one category):
- [tooling] `scripts/check-lines.mjs`'s `SAMPLE_ARGS` are plain number tuples, so a lines-file function that took a `boolean` (my first draft of `Crate.walk`'s count-on/count-back line, `walkStep(up: boolean, t, total)`) would've been called with a number in the boolean slot. It happens to still render a valid string (truthy/falsy), so the checker wouldn't have caught a mismatch — I split it into `walkUp`/`walkDown` instead of relying on that. Worth a line in the script's header noting boolean params silently get a truthy number.
- [instructions] The brief said to update `docs/specs/` and `DESIGN.md`'s "Spoken lines" tables for my games "if any." Neither Egg Stairs nor Egg Crates has a `docs/specs/*.md` file, and `DESIGN.md`'s sections for them only have short inline example wording in prose, not an actual table — so there was nothing to point at a lines file. Took a moment to confirm this by grepping rather than assuming, but the ambiguity ("if any") was resolved correctly by the brief itself.

**Time lost:** ~5 min total, mostly confirming the DESIGN.md non-issue.

**Suggested fix:** Note in `check-lines.mjs`'s header that a lines-file function's non-numeric params (booleans, etc.) get silently passed a number from `SAMPLE_ARGS`, so prefer splitting such a function into named variants instead.
