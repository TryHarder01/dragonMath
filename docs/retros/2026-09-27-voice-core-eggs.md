# Retro: voice-core-eggs (Claude Sonnet 5)

**Friction** (most costly first; tag each with one category):
- [instructions] The brief's "~7 words" and "no comma/and joins" rules leave real judgment calls at the boundary (e.g. a 7-word "How many rows of {c} make {p}?" or whether `subModel`'s crossing-ten strategy should borrow `makeTen.ts`'s "Down to ten, then the rest!" catchphrase). Resolved by treating the catchphrase list as owned by the file that defines it and not importing it into shared `models.ts`, and by tolerating exactly-7-word sentences as compliant. Low cost (a few minutes of reasoning), but a worked example or an explicit "≤7 is fine, catchphrases are per-file" note in `AGENTS.md` would remove the ambiguity for the next agent.
- [instructions] Most of `src/core/screens.ts` (map greeting, break nudge, hatch/nest lines) was already fully compliant with the new voice guide before this task started, despite the brief calling out "the map greeting and the break nudge live in screens.ts" as important. Not wasted time, just worth the coordinator knowing that file needed no changes so a diff-less file isn't mistaken for missed work.

**Time lost:** ~5 min total, both minor.

**Suggested fix:** None needed — the ambiguity was resolvable from the guide's own worked examples (e.g. `AGENTS.md`'s literal "Egg Warmer! Let's warm the eggs!" answered the eggWarmer.ts intro question directly).
