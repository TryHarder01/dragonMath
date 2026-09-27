# Spec: 💎 Gem Bags (place value: tens and ones to 100)

- **Status:** Ready to build. Read [README.md](README.md) first.
- **Game id:** `'bags'`. **File:** `src/games/gemBags.ts`
- **Build order:** 2nd.
- **Standards:**
  - 1.NBT.2: tens and ones.
  - 1.NBT.3: compare 2-digit numbers.
  - 1.NBT.4–6: add within 100, and add or subtract tens.
  - 2.NBT.1: place value.
  - 2.NBT.5: add and subtract within 100.

## Why this game exists

He can add within 20, and the times tables are coming, so 2-digit numbers are next. Research on place value says children need a **grouping model they can see**, with ten ones becoming one ten, before 47 means "4 tens and 7 ones" rather than "four, seven". Bags of ten gems are that model. They carry into adding and subtracting tens (47 + 10, 58 − 23 without regrouping) and into the first taste of regrouping: ten loose gems make a new bag.

## Story and tone

Dragons love gems and keep them tidy: **a bag always holds exactly ten**, and extra gems sit loose. Ember's friends **share** gems. Subtraction is giving a bag or some gems to a friend dragon, and addition is a friend giving some to us. Nobody steals or loses anything.

## Screens

Levels 1 and 4–8 use `eggScene`: the question card shows the gem model and the number sentence, and the answers are eggs. Two levels need custom scenes. Both follow the README's layout contract: content fills the sky, answers sit in a bottom band, sizes in `vmin`/`vh`, and tap targets of at least 72px.

- **L2 "Make 47" (hands-on build):** the dragon's hoard fills the sky. The bottom band has two big source buttons: **a bag of ten** and **one gem**, plus a big ✓.
  - Tapping a source adds that item to the hoard, and the voice says the new total ("thirty… thirty-one").
  - Tapping an item in the hoard puts it back.
  - At **ten loose gems**, they swirl into a new bag automatically: "Ten gems make a bag!" This is regrouping, discovered by doing.
  - Tapping ✓ checks the answer. Right: sparkle, and the round goes on. Wrong: hint, and the child fixes it (the hoard stays), then taps ✓ again.
  - `firstTry` = right on the first ✓.
- **L3 "Who has more?":** two dragons, each above its own pile of bags and gems. Tap a dragon (use `awaitChoice` with the dragon elements).

### Gem model (new: write it in `gemBags.ts`, shaped like `Model`)

- `gemsModel(tens, ones)` draws **bags** and **loose gems**:
  - Each bag is a drawn pouch (CSS), not 💰, which has a $ on it. It carries a big "10" label.
  - Loose gems are 💎 laid out five-and-five like a ten-frame, so 7 loose reads as 5 + 2.
- **Hint helpers:**
  - `countUp()`: light each bag while saying "10, 20, 30", then each gem, "31, 32…".
  - `addBags(n)` / `giveBags(n)`: a bag flies in from, or out to, a friend dragon, saying "47… 57".
  - `addGems(n)` / `giveGems(n)`.
  - `trade()`: 10 loose gems swirl into a new bag.
- **Sizes:** up to 9 bags + 9 gems per hoard, and two hoards on compare/add levels. It must stay readable after `fitBubble` scales it down on a phone.

## Levels

| Lvl | Problem | Screen | Generator |
|---|---|---|---|
| 1 | How many gems? (4 bags + 7 → 47) | eggScene, picture shown | tens 1–9, ones 0–9 |
| 2 | **Make 47**: build it | build scene | target 11–99; half the targets have ones ≥ 5 |
| 3 | Who has more gems? (then "fewer" on half the problems after the first round) | two dragons, pictures only | both 10–99, different. 40% are **tricky pairs**: more loose gems but fewer bags (29 vs 31), or swapped digits (52 vs 25) |
| 4 | Add or give **one bag**: 47 + 10 / 47 − 10 | eggScene, picture shown | a 11–89 (for −10: 20–99) |
| 5 | Add or give **tens**: 34 + 20, 56 − 30 | eggScene, picture shown | add 2–5 tens; result ≤ 99 / ≥ 1 |
| 6 | Add 2-digit, **no regrouping**: 34 + 25 | eggScene, picture shown (two hoards merge) | ones sum ≤ 9, total ≤ 99 |
| 7 | Subtract 2-digit, **no regrouping**: 58 − 23 (share with a friend) | eggScene, picture shown | a's ones ≥ b's ones, a's tens > b's tens |
| 8 | Mixed L4–L7 **number sentence only**, plus **regrouping add** 36 + 7 on ~30% | eggScene, hint only | regrouping: ones sum 10–17, total ≤ 99 |

## Spoken lines

| Moment | Line |
|---|---|
| L1 | "How many gems does this dragon have? Count the bags by tens!" |
| L2 | "Make forty-seven. Tap the bags and the gems!" After a wrong ✓: see Hints. |
| L3 | "Which dragon has more gems?" / "…fewer gems?" |
| L4 | "Forty-seven gems. A friend gives one more bag! How many now?" / "Forty-seven gems. Share one bag with a friend. How many are left?" |
| L5 | "Thirty-four gems, and two more bags! How many?" / "Fifty-six gems. Share three bags. How many are left?" |
| L6 | "Thirty-four gems and twenty-five gems. How many altogether?" |
| L7 | "Fifty-eight gems. Share twenty-three with a friend. How many are left?" |
| L8 | the number sentence, then "Warm the egg with the answer!" |
| Praise | "Bags first, then gems. Smart!", "Four tens and seven ones!" |

## Hints

- **L1:** `countUp()`, then "Four bags is forty, and seven more is forty-seven."
- **L2 (wrong ✓):** "You made thirty-seven: three bags and seven gems. Forty-seven needs **four** bags and seven gems." Then pulse the source button that needs tapping, and leave the hoard as it was.
- **L3:** count both hoards with `countUp()`. Then say "Bags first! Three bags is more than two bags" (or compare the gems when the bags are equal).
- **L4–L5:** `addBags` / `giveBags`, counting by tens from the start ("47… 57").
- **L6–L7:** tens first, then ones: move the bags together ("30 and 20 is 50"), then the gems ("4 and 5 is 9"), then "59".
- **L8 regrouping:** add the gems, then `trade()` when they reach ten: "Ten gems make a new bag!", then the total.

## Answer choices

- `nearChoices(answer, 4, 1, 99)`, then swap in **place-value mistakes** when they're valid:
  - swapped digits (74 for 47),
  - answer ± 10 (miscounted bags),
  - for L6–L8, the total without regrouping or with the ones' ten dropped (36 + 7 → 33).

## Parent text

```ts
name: 'Gem Bags',
icon: '💎',
skill: 'Place value: tens and ones, comparing, and adding or subtracting tens to 100',
about:
  'Dragons keep their gems in bags of ten, with a few loose ones. Your child counts them (4 bags and 7 gems is 47), builds numbers by tapping bags and gems, and decides which dragon has more. Then they add and share bags, and add and subtract 2-digit numbers. When ten loose gems pile up, they turn into a new bag. That is the idea behind "carrying" in adding.',
levels: [
  'How many gems? Bags of ten and loose gems',
  'Build a number: tap bags and gems to make 47',
  'Which dragon has more (or fewer) gems?',
  'Add or share one bag: 47 + 10, 47 − 10',
  'Add or share several bags: 34 + 20, 56 − 30',
  'Add 2-digit numbers: 34 + 25',
  'Share 2-digit numbers: 58 − 23',
  'Mixed, plus ten loose gems making a new bag (36 + 7)',
],
intro: 'Gem Bags! Dragons keep their gems in bags of ten. Help Ember count and share them!',
```

## Build checklist

1. `src/games/gemBags.ts`: the gem model, generators, and the L2 build scene and L3 compare scene. Use `eggScene` for the rest.
2. Register in `index.ts` and remove it from `UPCOMING`.
3. Append a `/* ---------- Gem Bags ---------- */` section to `styles.css`: bag pouches, gem layout, source buttons, the two-dragon compare, and the trade swirl.
4. Add to `scripts/audit.mjs`:
   - `'bags-L2-build'` (`ready: '.gem-sources'`, or whatever the build scene uses)
   - `'bags-L3-compare'` (`ready: '.gem-dragon'`)
   - `'bags-L6'` (two hoards, the most crowded)
5. Verify per README. The play-through must cover:
   - a wrong ✓ on L2 followed by a fix,
   - a tricky pair on L3,
   - a regrouping problem on L8.

## Open questions for the user (defaults in bold, so build with the default)

- Should numerals show under the dragons on L3? **No.** Pictures only, so he compares by bags and gems rather than reading digits.
- Is regrouping with subtraction (52 − 7, opening a bag) in scope? **No, leave it out.** Nest Builder L7 covers subtracting across a ten with the make-ten method. Add a level 9 here later if needed.

## Out of scope

3-digit numbers (bags of bags), subtraction with regrouping, and written column methods.
