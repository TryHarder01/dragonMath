# Retro: audit card-overflow check (Claude Sonnet 5)

Brief: `docs/briefs/2026-09-27-audit-card-overflow.md`.

**Friction** (most costly first; tag each with one category):
- [checks] Proving "green" is inherently noisy: Dino Story's compare screen picks a random count (up to 20) each run, so a genuine bug there (see below) only showed up on some runs and not others. Had to run the full audit several times in a row to be confident, and separately probe with a raw Playwright script to force enough draws to see the worst case. A brief note that any screen with per-run randomness needs multiple runs to trust green would have saved a bit of back-and-forth.
- [codebase] The real overflow the new check found (Dino Story's `.story-compare-row`) wasn't obvious from the CSS alone: `.story-compare-row` overrides `grid-template-columns`/`justify-content` but silently inherits `max-width: 100%` from the base `.story-actor-group` rule two lines up. The grid's intrinsic content width then exceeds that cap, and because `.story-stage` has `overflow: hidden`, the excess is invisible rather than visibly broken — exactly the "clips instead of showing" case the brief called out, so this one was expected in kind, just not in location.
- [tooling] No built-in way to force a specific random draw (e.g. "always compare 20 vs 11") to test a layout fix deterministically. Worked around it with a disposable Playwright script outside `scripts/` that reloaded the screen ~20 times and filtered for high counts, then deleted it before committing. A `?seed=` or similar audit hook would make this kind of layout fix easier to verify next time.

**Time lost:** ~15 min tracking down and confirming the fix for the compare-row overflow (mostly the disposable probe script), on top of the core measurement work which was straightforward.

**Suggested fix:** Consider a debug hook to pin RNG output for one audit run, so layout fixes for randomized content can be verified without a scratch script.
