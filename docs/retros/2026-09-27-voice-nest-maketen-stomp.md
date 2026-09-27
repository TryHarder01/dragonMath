# Retro: voice rewrite for Nest Builder, Make Ten, Stomp Path (Claude Sonnet 5)

**Friction** (most costly first; tag each with one category):
- [codebase] In `makeTen.ts`, `model.partnerHint` (and, in other games, `model.moveBridge`) is passed directly as a question's `hint`, and the *same* method is called again inside `onSolved` for the correct-first-try visual. Adding the required "Let's count." hint-opener meant it couldn't go inside the shared method (it would then also fire on a correct first try), so I had to wrap the call site (`runPartner`'s hint argument) in a small arrow instead. Easy once spotted, but took a full read of both call sites to be sure the prefix wouldn't leak into the praise path.
- [instructions] `AGENTS.md`'s "How Ember talks" lists the catchphrase "Tens first, then ones!" verbatim, but the shipped Stomp Path code actually said "Hop the tens first, then the ones!" / "Hop back the tens first, then the ones." — no exact match existed anywhere in the repo. Took a moment to confirm this was intentional (the guide anticipating my rewrite) rather than a stale doc, by grepping for the phrase across `src/` and `docs/`.

**Time lost:** ~10 min total, mostly the first item.

**Suggested fix:** None needed — both were resolved by reading the surrounding code/grep before editing, not a repeated pattern worth fixing in tooling.

## Outcome (retro review 2026-09-27)

- Hint method reused in `onSolved`: Declined for now (same as `eggScene` coupling; revisit on a third occurrence).
- Catchphrase listed in the guide but absent from code: Chosen: *Briefs leave scope implicit* (briefs must state current vs intended wording).
