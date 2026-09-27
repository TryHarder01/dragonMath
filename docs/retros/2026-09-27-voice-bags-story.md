# Retro: voice pass on Gem Bags and Dino Story (Claude Sonnet 5)

**Friction** (most costly first; tag each with one category):
- [tooling] No repo check verifies spoken-line length or word-per-sentence style, so confirming "≤7 words, one idea per sentence" meant manually counting words per sentence across two files. Wrote a throwaway word-count script in the scratchpad to spot-check the longest survivors. A `just check` rule that flags long sentences inside `say(`/`prompt(`/`ask:` strings (or at least a grep for banned words like "equally") would make this reviewable without a subagent or script.
- [instructions] AGENTS.md's "How Ember talks" section is clear on the target style, but a few cases needed judgment calls it doesn't cover explicitly: whether a short comma-joined phrase counts as "joining two ideas" (e.g. "Red dragon, blue dragon" vs. "Red dragon. Blue dragon."), and whether the "start with Let's count/Watch" rule applies to every hint or just the count-the-dots ones. Not blocking, just noted in case another worker interprets differently on their files.
- [codebase] `docs/specs/*.md` repeats example sentences in several places (the Levels table, Spoken lines, Story templates) that don't cross-reference each other, so keeping the doc in sync with a wording change meant grepping the whole file for stray copies of the old text rather than editing one section.

**Time lost:** ~10 min total, mostly the manual word-count spot check.

**Suggested fix:** A lint step (even a simple regex-based script) that flags `say()`/`prompt()`/`ask:` string literals with sentences over ~7 words or containing banned words ("equally", "compare", "digit", "situation", "total") would catch this class of review mechanically instead of by eye.

## Outcome (retro review 2026-09-27)

- No spoken-line check: Fixed: lines files + `scripts/check-lines.mjs` (4e32c81).
- Voice guide edge cases: Fixed: `AGENTS.md` "How Ember talks" edge cases.
- Specs repeat spoken lines: Fixed: specs point at the lines files (bf72153).
