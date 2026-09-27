# Retro: lines-bags-story (Claude Sonnet 5)

**Friction** (most costly first; tag each with one category):
- [checks] `check-lines.mjs` strips all non-letter characters before matching banned words, so an unfilled template placeholder like `{total}` collapses to the banned word "total" and fails the check, even though the child never hears the word "total" (the real speech substitutes the number via `word()`). The task brief's note about dino-story templates said the checker "renders the placeholders literally, which is fine for counting words" but didn't mention this banned-word interaction. Cost ~10 min to notice and fix (renamed the placeholder to `{sum}`, aliased the internal `total` variable so the rest of the code didn't need touching).
- [instructions] The brief's OWNERSHIP note said to "replace each 'Spoken lines' table or long quoted line lists" in the specs, but didn't say whether the "Hints" sections (which mix behavior spec with quoted example wording) count. Left those alone since removing them would lose real behavioral spec, not just wording — worked but had to guess the intended scope.

**Time lost:** ~15 min total, mostly the placeholder/banned-word collision.

**Suggested fix:** Have `check-lines.mjs` skip banned-word matching (but keep word-count checking) on tokens that came from an unfilled `{...}` placeholder, so template files don't need placeholder names picked around the banned-word list.
