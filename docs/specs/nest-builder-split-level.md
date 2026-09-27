# Nest Builder: new level "Split to make ten"

- **Status:** Ready to build. Read [README.md](README.md) and [nest-builder.md](nest-builder.md) first; this adds one level to that game.
- **Goal:** make the hidden middle step of the make-ten strategy visible and practised: **splitting the second number** so part of it fills the ten.

## Why this level (research)

"Make ten, then keep going" is the **make-ten** (bridging-through-ten) strategy. It's well supported:
- Common Core grade 1 names it: *"making ten (8 + 6 = 8 + 2 + 4 = 10 + 4 = 14)"* and *"decomposing a number leading to a ten (13 − 4 = 13 − 3 − 1 = 10 − 1 = 9)"* (1.OA.C.6).
- It's the core addition method in Japanese and Chinese first-grade curricula (Murata & Fuson; Cheng 2012 found it beats counting on), and Van de Walle calls it "up over ten". The same move one level up is bridging a decade: 38 + 5 → 38 + 2 + 3 → 40 + 3 → 43.

The strategy needs three sub-skills, and children fail mostly at the middle one:
1. **Partners of ten:** 8 needs 2. (Nest Builder L1 drills this.)
2. **Split the second number:** 5 is 2 and 3. **Nothing in the game drills this yet.** L2 and L5 ask "how many of the 5 fill the nest?" (2), then jump to "ten and 3 more": the 3 appears without the child ever seeing that 5 became 2 + 3.
3. **Ten and some more:** 10 + 3 = 13, 40 + 3 = 43. (L2 and L5 beat 2.)

The mental model to build is **part-whole with ten as a landmark**: any number can be split, and you split it so one part lands exactly on a ten. The standard picture for a split is a **number bond** (a whole with two parts). The standard way to say the strategy is the **chain**: 8 + 5 = 8 + 2 + 3 = 10 + 3 = 13.

## Where it goes

Insert it as **new L6**, after "Add across a ten with bigger numbers" (current L5) and before the subtraction levels. By L6 the child has met teen bridging (L2–L3) and decade bridging (L4–L5). This level consolidates both by naming the split. Current L6–L8 become L7–L9. The shared adaptive rule reads `levels.length`, so nothing else changes. (A saved Nest Builder level of 6 or above now lands one level earlier. That's fine.)

L9 (mixed) stays as it is: it doesn't need to include the new kind.

## The level

**Problem mix:** in each round, the first two problems are teen bridges, then 50/50 teen or two-digit:
- **Teen:** `a` 6–9, `b` from `11 − a` to 9 (sum 11–18). Same as `addSmall`.
- **Two-digit:** `a` 11–89 with ones 2–9, `b` from `ceil10(a) − a + 1` to 9, sum ≤ 99. Same as `addBig`.
- The split is always non-trivial: `bridge = ceil10(a) − a` and `rest = b − bridge ≥ 1`.

**Screen:** the nest model as in L2/L5, showing `a` (full mini-nests for the tens on two-digit problems), with the `b` new eggs in a small **basket** beside it, in a different tint from the nest eggs. Above them, the **chain card** (the question card) grows as the child goes: `8 + 5` → `8 + 2 + 3` → `10 + 3` → `= 13`. A **number bond** appears after beat 1: `b` in a top circle, with lines to two part circles, **bridge** (tinted like the nest) and **?** (tinted like the basket).

**Three beats, all shown from the start** (a new-idea level):

| Beat | Spoken (use `prompt()`) | Answer | On right |
|---|---|---|---|
| 1. Partner | "Eight plus five. How many of the five fill the nest?" / "Thirty-eight plus five. How many make forty?" | `bridge` (2) | those eggs hop from basket to nest (automatic, no tuck-in); the bond appears with `5 → 2, ?`; the chain becomes `8 + 2 + ?` |
| 2. **Split** | "Five is two and how many more?" | `rest` (3) | the `?` becomes 3; chain `8 + 2 + 3` then `10 + 3` |
| 3. Ten and more | "Ten and three more. How many?" / "Forty and three more?" | `a + b` (13) | chain `= 13`; then say the whole chain: "Eight plus five. Eight and two make ten, and three more is thirteen!" |

**Distractors** (on top of `nearChoices`):
- Beat 1: `b` (the whole second number), `bridge ± 1`.
- Beat 2: `b` (didn't split), `bridge` (repeated the first part), `rest ± 1`.
- Beat 3: `a + b ± 1`, and `10 + b` or `ceil10(a) + b` (forgot the split).

**Hints** (on the first miss of each beat; the model is already showing):
- Beat 1: the existing fill-the-nest hint (`fillTo10`): count on from `a` to ten.
- Beat 2: the basket eggs light up. The `bridge` eggs that went to the nest flash while the voice says "two went in the nest", then the rest are counted one by one: "one, two, three. Five is two and three."
- Beat 3: the existing "ten and three more" count.

**Praise** (names the strategy, as in the other levels): "You split the five to make ten!", "Split, fill, and on to the tens!"

**Scoring:** `firstTry` only if all three beats are right on the first tap.

## Code

- All in `src/games/nestBuilder.ts`. Add a `'split'` kind, a generator using the mix above (reusing `addProblem`'s bridge/rest maths), and a `runSplit` next to `runAdd`, reusing `nestModel`, `question`, `eggScene` and `choicesWithMistake`. The number bond is a small `Model`-shaped element local to this file (not in `src/core`).
- The level after `runAdd` in `runProblem`'s level switch. Shift L6–L8 to L7–L9.
- **Parent text:** insert at index 5 of `levels`: `'Split the second number to make ten, then say the whole chain (8 + 5 = 8 + 2 + 3 = 10 + 3)'`. Add to `about`: `The "split" level shows the step children most often miss: breaking the 5 into the 2 that fills the ten and the 3 left over.`
- **CSS:** inside the Nest Builder section only: basket, bond circles and lines, chain card. Sizes scale with the screen (`vmin`/`vh`). Keep `{ }` balanced within the section, including any trailing `@media` block.
- **Audit:** add `'nest-L6-split'` to `SCREENS` in `scripts/audit.mjs`, and renumber the existing `nest-L7` entry to `nest-L8` so it still points at the two-digit subtraction level.
- **Driver:** `scripts/drivers/nest.mjs` must answer the new beats. Keep per-round state on `ctx`, not in module variables (rounds run in parallel), and make the deliberate miss on beat 2 (the split) so its hint runs.
- **Docs:** add the level to the table in `docs/specs/nest-builder.md` (renumbering), mark this spec "Built", and add a `WORKLOG.md` entry.

## Verify

1. `npm run typecheck && npm run build`.
2. `node scripts/audit.mjs --only=nest-L2,nest-L6-split,nest-L8`: 0 flagged.
3. `node scripts/playthrough.mjs nest --level=all` passes, plus `--level=6 --size=phone` and `--level=6 --real`. Look at the L6 screenshots from `--real` at both sizes: the bond, the chain and the basket must be readable and not overlap on a phone.
4. A throwaway 1,000× check of the new generator: the ranges above, `rest ≥ 1`, each beat's answer among its choices, and the first two problems of a round are teen. Don't commit it.
5. `just verify` before handing back.

## Out of scope (next, if this works)

- **The subtraction mirror**, given his weak spot: "Thirteen minus five: split the five into 3 and 2. 13 − 3 = 10, 10 − 2 = 8." Same bond, same chain. This could be a follow-on level once the addition split lands.
- Adding the bond to the hints of L2/L5/L7/L8.

## Scale and quality

A personal game for one child (see "Scale" in `AGENTS.md`). Clean, idiomatic code that reads like the rest of `nestBuilder.ts`, the smallest diff that does this, no speculative options, and plain prose in docs and commit messages. Only claim checks you actually ran.
