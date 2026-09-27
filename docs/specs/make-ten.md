# 🔟 Make Ten: a practice module on the map

- **Status:** Ready to build. Read [README.md](README.md) first (the shared contract), then [nest-builder.md](nest-builder.md) for the nest model this reuses.
- **What it is:** a new game on the home map, next to the others, dedicated to the make-ten strategy, so it can be picked on its own. **Nest Builder is not changed.**

## Why (research)

"Make ten, then keep going" is the **make-ten** (bridging-through-ten) strategy. It's well supported:
- Common Core grade 1 names it: *"making ten (8 + 6 = 8 + 2 + 4 = 10 + 4 = 14)"* and *"decomposing a number leading to a ten (13 − 4 = 13 − 3 − 1 = 10 − 1 = 9)"* (1.OA.C.6).
- It's the core addition method in Japanese and Chinese first-grade curricula (Murata & Fuson; Cheng 2012 found it beats counting on), and Van de Walle calls it "up over ten". The same move one step up bridges a decade: 38 + 5 → 38 + 2 + 3 → 40 + 3 → 43.

It needs three sub-skills, and children fail mostly at the middle one:
1. **Partners of ten:** 8 needs 2.
2. **Split the second number:** 5 is 2 and 3. *This is the bottleneck.*
3. **Ten and some more:** 10 + 3 = 13, 40 + 3 = 43.

The mental model is **part-whole with ten as a landmark**: any number can be split, and you split it so one part lands exactly on a ten. The standard picture for a split is a **number bond** (a whole with two parts). The standard way to say the strategy is the **chain**: 8 + 5 = 8 + 2 + 3 = 10 + 3 = 13.

The module drills each sub-skill on its own first, then the whole chain, then the same chain on to the tens and for subtraction (his weak spot).

## Story and tone

Same world as Nest Builder: a nest holds exactly ten eggs. Ember **fills the nest first, then starts the next one**. New eggs arrive in a **basket**, and the child decides how to split the basket so the nest fills up. For subtraction, babies hatch and **walk home**, down to ten first, then the rest. The hero only helps.

## Screen

- **Nest model** (reuse Nest Builder's): the ten-frame nest(s) holding `a`. Two-digit numbers show full mini-nests for the tens.
- **Basket:** the `b` new eggs, in a different tint from the nest eggs.
- **Number bond:** the whole `b` in a top circle, with lines to two part circles: the **bridge** (tinted like the nest) and the **rest** (tinted like the basket). Unknown parts show `?`.
- **Chain card** (the question card): grows as the child answers, e.g. `8 + 5` → `8 + 2 + 3` → `10 + 3` → `= 13`.
- Answer eggs in the bottom band via `eggScene`, as in the other fact games. Sizes scale with the screen (`vmin`/`vh`), and it must read on a phone.

## Levels

"Shown" means the picture (nest, basket, bond, chain) is there from the start. On "hint" levels only the nest shows, and the bond and chain appear on the first miss.

| Lvl | Skill | Problem and beats | Picture | Generator |
|---|---|---|---|---|
| 1 | Partners of ten | Bond with **10** on top: "Ten is eight and how many more?" (2). The nest shows 8, and the empty slots glow on the hint. | shown | `a` 1–9, answer `10 − a` |
| 2 | Fill from the basket | Nest has 8, basket has 5: "How many of the five fill the nest?" (2). On right, those eggs hop in, and the rest stay in the basket. | shown | teen pair (below) |
| 3 | **Split the number** | Same scene, but the bridge is already done: the bond shows `5 → 2, ?`. "Five is two and how many more?" (3). | shown | teen pair |
| 4 | **The whole chain, teens** | Three beats: partner (2) → split (3) → "ten and three?" (13). The chain grows with each beat. | shown | teen pair |
| 5 | **On to the tens** | The same three beats with two-digit numbers: 38 + 5 → "how many make forty?" (2) → "five is two and?" (3) → "forty and three?" (43). | shown | two-digit pair |
| 6 | Chain in one step | "Eight plus five" / "thirty-eight plus five": answer the total. The hint plays the whole chain with the bond. | hint | 50/50 teen / two-digit |
| 7 | **Down to ten (subtract)** | 13 − 5, three beats: "how many walk home to get down to ten?" (3) → "five is three and?" (2) → "ten take away two?" (8). The chain is `13 − 5 → 13 − 3 − 2 → 10 − 2 = 8`. | shown | `a` 11–18, `b` from `a − 9` to 9 |
| 8 | Mixed, one step | Any of L6 or L7 as a one-step total; the hint plays the chain. | hint | 50/50 add / subtract, add split 50/50 teen / two-digit |

**Pairs.** Every pair has a non-trivial split: `bridge = ceil10(a) − a ≥ 1` and `rest = b − bridge ≥ 1`.
- **Teen pair:** `a` 6–9, `b` from `11 − a` to 9 (sum 11–18).
- **Two-digit pair:** `a` 11–89 with ones 2–9, `b` from `ceil10(a) − a + 1` to 9, sum ≤ 99.

Use the shared adaptive rule (5 problems a round, fast placement). No `ownsLevel`.

## Spoken lines (use `prompt()` for questions)

| Moment | Line |
|---|---|
| L1 | "Ten is eight and how many more?" |
| L2 | "Eight in the nest, five in the basket. How many of the five fill the nest?" |
| L3 | "Two eggs filled the nest. Five is two and how many more?" |
| L4/L5 beats | "Eight plus five. How many of the five fill the nest?" → "Five is two and how many more?" → "Ten and three more. How many?" (two-digit: "…make forty?", "Forty and three more?") |
| L6/L8 | the number sentence, then "Warm the egg with the answer!" |
| L7 beats | "Thirteen minus five. How many walk home to get down to ten?" → "Five is three and how many more?" → "Ten, and two more walk home. How many are left?" |
| After a chain | say it whole: "Eight plus five. Eight and two make ten, and three more is thirteen!" |
| Praise | name the strategy: "You split the five to make ten!", "Fill the nest, then the rest!", "Down to ten, then the rest!" |

## Hints (on the first miss of a beat)

- **Partner:** count on from `a` to ten, lighting each empty slot ("nine, ten: two more").
- **Split:** the bridge eggs flash ("two went in the nest"), then the basket eggs left are counted one by one: "one, two, three. Five is two and three."
- **Ten and more:** "Ten…" then count on the rest: "eleven, twelve, thirteen."
- **One-step levels (6, 8):** show the bond and play the three steps above in order, saying the chain.
- **Subtract (L7):** mirror image: count back to ten ("twelve, eleven, ten: three walked home"), split, then count back the rest.

## Answer choices

`nearChoices` plus these common mistakes, when valid:
- Partner: `b` (the whole basket), `bridge ± 1`.
- Split: `b` (didn't split), `bridge` (repeated the first part), `rest ± 1`.
- Ten and more / total: `a + b ± 1`, `ceil10(a) + b` (forgot to split); for subtraction `a − b ± 1` and `10 − b`.

## Parent text

```ts
id: 'maketen',
name: 'Make Ten',
icon: '🔟',
skill: 'The make-ten strategy: split a number to fill a ten, then add or take away the rest',
about:
  'Focused practice on the strategy children use to add and subtract across ten without counting. To do 8 + 5, split the 5 into the 2 that fills the ten and the 3 left over, so 8 + 5 = 10 + 3. Your child practises each step on its own (partners of ten, splitting a number, ten and some more), then the whole chain, then the same idea with bigger numbers (38 + 5 = 40 + 3) and for taking away (13 − 5 = 10 − 2). The split is the step children most often miss, so it is shown as a number bond.',
levels: [
  'Partners of ten: 10 is 8 and ?',
  'How many from the basket fill the nest?',
  'Split the number: 5 is 2 and ?',
  'The whole chain: 8 + 5 = 8 + 2 + 3 = 10 + 3',
  'On to the tens: 38 + 5 = 38 + 2 + 3 = 40 + 3',
  'Add across ten in one step (hint shows the chain)',
  'Down to ten: 13 − 5 = 13 − 3 − 2 = 10 − 2',
  'Mixed adding and taking away across ten',
],
intro: 'Make Ten! Fill the nest to ten first, then the rest. Let\'s split the eggs!',
```

## Build checklist

1. **`src/games/makeTen.ts`**, exporting `makeTen: Game`. Reuse Nest Builder's nest model by **exporting what you need from `src/games/nestBuilder.ts`** (e.g. `nestModel`, `eggDot`, `tenFrame`), exports only, with no behaviour change there. The number bond and the basket live in `makeTen.ts`. Build each beat with `eggScene` (two- and three-beat problems work like Nest Builder's `runAdd`: `play.replaceChildren()` between beats, same model element).
2. **Register it:** add `'maketen'` to `GameId` in `src/core/progress.ts`, and to `GAMES` in `src/games/index.ts` after `nestBuilder`.
3. **CSS:** append a `/* ---------- Make Ten ---------- */` section to `src/styles.css` with `{ }` balanced, including any trailing `@media` block.
4. **Audit:** add `'maketen-L1'`, `'maketen-L4'`, `'maketen-L5'` and `'maketen-L7'` to `SCREENS` in `scripts/audit.mjs`, and add `maketen: true` to the `placed` objects in `scripts/audit.mjs` and `scripts/playthrough.mjs`.
5. **Driver:** `scripts/drivers/maketen.mjs` if the default tap driver can't answer it. Keep per-round state on `ctx` (rounds run in parallel), and make the deliberate miss on the split beat where there is one, so its hint runs.
6. **Docs:** add a row to the table in `docs/specs/README.md`, add Make Ten to `DESIGN.md`'s game list, set this spec's status to "Built", and add a `WORKLOG.md` entry.

## Verify

1. `npm run typecheck && npm run build`.
2. `node scripts/audit.mjs --only=map,maketen-L1,maketen-L4,maketen-L5,maketen-L7`: 0 flagged (the map now has 8 spots).
3. `node scripts/playthrough.mjs maketen --level=all` passes, plus `--level=4 --size=phone --real` and `--level=7 --real`. Look at those screenshots at both sizes: the bond, the chain, the basket and the nest must be readable and not overlap on a phone.
4. A throwaway 1,000× check of each level's generator (the ranges above, `bridge ≥ 1`, `rest ≥ 1`, every beat's answer among its choices). Don't commit it.
5. `just verify` before handing back.

## Out of scope

- Changing Nest Builder's levels.
- Two-digit subtraction chains (43 − 5 → 40 − 2). This could be a level 9 later.

## Scale and quality

A personal game for one child (see "Scale" in `AGENTS.md`). Clean, idiomatic code that reads like `nestBuilder.ts` and `eggCrates.ts`, the smallest diff that does this, no speculative options, and plain prose in docs and commit messages. Only claim checks you actually ran.
