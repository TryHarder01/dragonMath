# Spec: 🪺 Nest Builder (make ten, bridge through ten)

- **Status:** Ready to build. Read [README.md](README.md) first.
- **Game id:** `'nest'`. **File:** `src/games/nestBuilder.ts`
- **Build order:** 1st. It works on his weak spot, subtraction through ten, from a new angle.
- **Standards:** 1.OA.6 (making ten, decomposing to ten), 2.NBT.5 (add/subtract within 100 using strategies), 2.NBT.9 (explain why strategies work).

## Why this game exists (and how it differs from Egg Warmer)

Egg Warmer *shows* make-ten in its hints. Nest Builder makes the child **do each step of the strategy**:

| Problem | Step 1 | Step 2 |
|---|---|---|
| 8 + 5 | how many fill the nest? (2) | ten and the rest (13) |
| 13 − 5 | how many to get down to ten? (3) | then take the rest from ten (8) |

Each problem is split into two beats, and each beat is its own answer. Doing the steps separately is what turns the strategy into the child's own (Baroody 2006; see the right-sizing research). The same move then carries to 2-digit numbers: 38 + 5 → 40 → 43, and 43 − 5 → 40 → 38.

## Story and tone

Chilly eggs need tucking into nests. A nest holds exactly ten eggs, and a full nest keeps them warm. For subtraction, babies **hatch and walk home** to their parents, so eggs leave the nest. Nobody takes or loses anything.

## Screen

Use `eggScene` for each beat. The question card holds the number sentence plus the **nest model** (below), and the answer eggs bob underneath. For two-beat problems call `eggScene` twice in one `runProblem`, clearing `play` between beats and reusing the same model element so the nests carry over between beats.

### Nest model (new: write it in `nestBuilder.ts`, shaped like `Model` in `src/core/models.ts`)

```
[🪺10] [🪺10] [🪺10]   ← full nests, drawn as small filled ten-frames with a "10" badge
[● ● ● ● ●]   [● ● ○ ○ ○]
[● ● ● ○ ○]   [○ ○ ○ ○ ○]   ← the open nest (ten-frame) with the ones, then a second
                               frame where extra eggs spill over
```

- `nestModel({ tens, ones })`: renders the full-nest tiles, the open nest with `ones` eggs, and an empty second frame (hidden until used).
- **Methods used by the hints and by `onSolved`** (each animates, with `sfx.count` and a spoken count):
  - `fillTo10()`: incoming eggs (yellow, like `.dot.two`) fill the open nest; say the running number ("39, 40!").
  - `spill(n)`: the next `n` eggs go into the second frame.
  - `hatchAway(n)`: `n` eggs in the open nest turn to 🐣 and walk off (translate and fade). When the open nest empties, one full nest opens into the ten-frame.
- **Sizes:** up to 9 full-nest tiles plus two frames. It must fit when `fitBubble` scales the card, so lay the tiles out in a row that wraps at 5.

## Levels

"Picture" means the nest model shows from the start. On "hint" levels it appears on the first miss.

| Lvl | Problem | Beats | Picture | Generator |
|---|---|---|---|---|
| 1 | Fill the nest: 7 → 10 | 1: "how many more to fill the nest?" (3), then **tuck-in** (below) | shown | ones `a` 1–9; answer `10 − a` |
| 2 | Bridge add: 8 + 5 | 1: "how many of the 5 fill the nest?" (2), then tuck-in. 2: "ten and 3 more?" (13) | shown | `a` 6–9, `b` from `11 − a` to 9 (sum 11–18) |
| 3 | Bridge add: 8 + 5 | one beat: the total | shown | same as L2 |
| 4 | To the next ten: 38 → 40 | "38. How many more to make 40?" (2) | shown | `a` 11–89, not a multiple of 10; answer `ceil10(a) − a` |
| 5 | Bridge add, 2-digit: 38 + 5 | 1: to the next ten (2). 2: "40 and 3?" (43) | shown | `a` 11–89 with ones ≥ 2; `b` from `ceil10(a) − a + 1` to 9; sum ≤ 99 |
| 6 | **Bridge subtract: 13 − 5** | 1: "how many hatch and walk home to get down to 10?" (3). 2: "now 2 more from 10. How many are left?" (8) | shown | `a` 11–18; `b` from `a − 9` to 9 (crosses ten) |
| 7 | **Bridge subtract, 2-digit: 43 − 5** | 1: down to 40 (3). 2: 40 − 2 (38) | shown | `a` 21–98 with ones 1–8; `b` from `ones + 1` to 9 |
| 8 | Mixed: any of L3, L5 (one beat), L6, L7 (one beat) | one beat | hint | pick uniformly, weighting subtraction ×2 |

**Tuck-in (L1–L2 only, not scored).** After the right answer, the leftover eggs sit in a small pile beside the nest and Ember says "Tuck them in!". Each tap on a pile egg moves it into the next empty slot while the voice counts on. When the pile is empty, go on. This is the hands-on part. It can't be failed, and it doesn't count toward `firstTry`.

**Scoring:** `firstTry` is `true` only if every beat in the problem was right on the first tap.

## Spoken lines (use `prompt()` for questions)

Short, one-idea-per-sentence lines, paced by `say()`'s per-sentence beat (see "How Ember talks" in `AGENTS.md`). Every spoken line lives in `src/games/nestBuilder.lines.ts`; `nestBuilder.ts` holds no wording.

## Hints (the model's `hint()`, run on the first miss of a beat)

Every hint opens with "Let's count.", then shows and counts.

- **To ten / next ten:** "Let's count.", then `fillTo10()` counting on ("eight… nine, ten"), then say "That's two more."
- **Bridge add beat 2 (or one-beat add):** "Let's count.", then `fillTo10()`, then `spill(rest)`, then the chant "Eight and two. Ten! Ten and three. Thirteen!"
- **Bridge subtract beat 1:** "Let's count.", then `hatchAway(ones)`, counting back ("twelve, eleven, ten"), then "Three walked home. Now we're at ten."
- **Bridge subtract beat 2 (or one-beat subtract):** "Let's count.", then run beat 1's animation if it hasn't happened, then `hatchAway(rest)`, counting back from ten, then the chant "Thirteen minus three. Ten! Ten minus two. Eight!"

## Answer choices

- Use `nearChoices(answer, 4, min, max)`, then swap one distractor for the **common mistake** when it's valid and different:
  - **Beat 1 add:** `b` itself (the whole second number instead of the part that fills the nest).
  - **Beat 2 add:** `a + b − 10` (forgot the ten).
  - **Subtract:** the "smaller from larger" error. For 13 − 5 that's 12 (5 − 3 = 2 → 12); for 43 − 5 it's 42. Formula: `tens*10 + (b − ones)`.
  - **To next ten:** `10 − ones` is right, so use `ones` as the distractor.

## Parent text (paste into the `Game`)

```ts
name: 'Nest Builder',
icon: '🪺',
skill: 'Make-ten strategies for adding and subtracting, including with bigger numbers',
about:
  'Every nest holds ten eggs. Your child solves problems like 8 + 5 in two steps: first fill the nest (8 + 2 = 10), then add the rest (10 + 3 = 13). Subtraction works the same way in reverse: 13 − 5 is "down to ten" (13 − 3), then the rest (10 − 2). The same steps work for 38 + 5 and 43 − 5. This is the strategy behind fast mental maths, and it gives extra practice with subtraction.',
levels: [
  'Fill the nest: how many more to make 10',
  'Add across ten in two steps (8 + 5 → 10 → 13)',
  'Add across ten in one step, with the nests shown',
  'Bigger numbers: how many more to the next ten (38 → 40)',
  'Add across a ten with bigger numbers (38 + 5 → 40 → 43)',
  'Subtract across ten in two steps (13 − 5 → 10 → 8)',
  'Subtract across a ten with bigger numbers (43 − 5 → 40 → 38)',
  'Mixed adding and subtracting across ten',
],
intro: "Nest Builder! Let's fill the nests!",
```

## Build checklist

1. `src/games/nestBuilder.ts`: the nest model, level generators, `runProblem` with beats and tuck-in.
2. Register in `src/games/index.ts` and remove the `UPCOMING` entry.
3. Append a `/* ---------- Nest Builder ---------- */` section to `src/styles.css`: nest tiles, the pile, and the hatch-away animation. Use `vmin` sizes.
4. Add to `scripts/audit.mjs`: `'nest-L2'` (two frames) and `'nest-L7'` (9 full nests, the most crowded). Both show `.egg .numeral`.
5. Verify per README. The play-through must cover a two-beat problem with a miss on beat 2, and the tuck-in on L1/L2.

## Open questions for the user (defaults in bold, so build with the default)

- Tuck-in could slow a quick child down. **Keep it on L1–L2 only.** Alternative: only after a miss.
  - Resolved: default accepted by user.
- Subtraction is his weak spot, so should L6–L7 come before the 2-digit addition levels? **No, keep the order.** Fast placement will move him quickly through L1–L5 if he's got them.
  - Resolved: default accepted by user.

## Out of scope

Regrouping more than once, 3-digit numbers, and written column methods.
