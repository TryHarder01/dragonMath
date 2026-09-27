# Ember's Egg Rescue: game design

A Math Blaster–style game for young kids, built on the research in [docs/research/2026-09-26-early-math-pedagogy.md](docs/research/2026-09-26-early-math-pedagogy.md).

**Target player (2026-09-26):** adds within 20 confidently, subtraction is weak, and knows about a quarter to a half of the 10×10 times tables. The levels are sized for him, per [docs/research/2026-09-26-right-sizing-advanced-learner.md](docs/research/2026-09-26-right-sizing-advanced-learner.md). The original kindergarten ladders (counting and subitizing 1–10) are in git history, in the commit "Add Dino Egg Blaster game design".

## Premise

A big storm blew across Dino Island and scattered the eggs from the **Dino Nest**. You're **Ember's rider**. Ember is a kind young dragon, and together you find the lost eggs, warm them, count the babies, and bring everyone safely home. Every time you finish a round, a baby hatches into your nest.

**Tone rule:** the hero only ever *helps*. The verbs are warm, find, count, share, tuck in, and walk home. Never zap, blast, shoot, or chomp, and nothing is an enemy.

What we keep from Math Blaster: a hero with a mission, the arcade loop of "tap the right answer fast and see something happen," a map of mini-games, and collectibles that make you want one more round.

What we leave out: timers, lives, game over, and pure speed drills.

## Core loop

```
Island map → pick a mini-game → round of 5 problems → hatch a baby → back to map
```

- **Round** = 5 problems. There's no time limit.
- **Problem:** the voice says the prompt and the child answers.
  - Right answer: sparkle burst, praise that names the strategy, next problem.
  - Wrong answer: a gentle "hmm," then the **hint model**: highlight and count the dots aloud, grey out that choice, and try again.
- **After the round:** an egg wobbles and hatches, and the new creature joins the Nest gallery.
- **Break:** after about 6 minutes of play, Ember yawns and says it's nap time, and suggests a break. The child can keep going; this is a nudge, not a lock.

## Adaptive levels (per skill)

- Each mini-game has **8 levels** that follow its learning trajectory. `Game.levels` in code holds a parent-facing description of each one.
- The level is stored per mini-game in `localStorage`.
- **Placement:** the first time a game is played, every first-try correct answer moves up a level, until the first miss (or the top level).
- **After placement:** up after 3 correct in a row, down after 2 misses on separate problems in a row. A miss followed by a correct retry counts as a miss.
- The level changes quietly between problems, so there's no "level down" message.

## Mini-games

Egg Warmer and Egg Crates share one scene (`src/games/eggScene.ts`):
- The number sentence sits in Ember's bubble, with its picture model at the lower levels.
- The chilly eggs bob below, each showing an answer.
- Tapping an egg sends Ember's warm glow. The right one hatches.
- On the first wrong tap the picture model appears (if it wasn't already shown) and plays its **strategy hint** aloud (`src/core/models.ts`).

### 1. Egg Warmer: + and − within 20, weighted toward subtraction
Addition is a warm-up. Most levels build subtraction step by step. The model is a **double ten-frame**:
- **Addition:** the second addend fills the first frame to ten and spills over, so make-ten is visible, and the hint counts on.
- **Subtraction:** the hint crosses dots out from the end while counting back. When the problem crosses ten, it says "take away the ones to get to ten, then the rest".
- **Missing part:** empty rings fill in while counting on ("think addition").

| Lvl | Problems | Picture |
|---|---|---|
| 1 | add within 20 (warm-up) | hint only |
| 2 | take away within 10 | shown |
| 3 | teens without crossing ten (17 − 4) | shown |
| 4 | think addition: 8 + ? = 13 | shown |
| 5 | subtract crossing ten (13 − 5) | shown |
| 6 | any subtraction within 20 | hint only |
| 7 | mixed + / − / missing part | hint only |
| 8 | mixed, plus ×2 / ×5 / ×10 facts (interleaving) | hint only |

Distractors are the neighbouring numbers, plus "added instead of subtracted" when it fits.

### 2. Egg Crates: multiplication
The rescued eggs are packed in crates, row by row. "a × b" always means **a rows of b**. The models are nests (equal groups) and egg arrays:
- **Skip-count hint:** lights one row at a time ("4, 8, 12").
- **×6–×9 hint:** lights 5 rows at once ("5 rows of 7 is 35"), then adds the remaining rows one at a time.
- **Missing factor:** the rows appear one at a time until the product is reached.

| Lvl | Facts | Picture |
|---|---|---|
| 1 | equal groups: 2–4 nests of 2–5 | shown |
| 2 | ×2, ×10 | shown |
| 3 | ×5 (with ×2, ×10) | shown |
| 4 | ×3, ×4 | shown |
| 5 | ×1–×5, ×10 | hint only |
| 6 | ×6–×9 (as rows) | shown |
| 7 | missing factor: ? × 4 = 20 | hint only |
| 8 | all facts 2–10 × 2–10, some missing-factor problems mixed in | hint only |

Distractors are the neighbouring facts (product ± a factor) and ±1.

### 2b. Egg Stairs: how the times tables work (`src/games/eggStairs.ts`)
Egg Crates practises facts in mixed order. Egg Stairs teaches the **mental model** first: a table is a staircase, each step adds one more row of the same size, and you can reach any step from a landmark you know. The crate shows each row with its running total beside it (3, 6, 9, 12…).

- **One level per table**, in this order: ×2, ×10, ×5, ×3, ×4, ×6, ×7, ×8, ×9.
- **Each table has four 5-question phases:**
  1. Walk up rows 1–5: "3 rows is 9. Add one more row of 3?"
  2. Walk up rows 6–10, starting from the 5-row landmark.
  3. Walk down from 10: "10 rows is 30. Take one row away?"
  4. Jumps from a ⭐ landmark with no walking: "You know 5 rows of 3 is 15. How many is 6 rows?" (5→6, 5→4, 10→9, 5→7, 10→8, 2→4, 5→3).
- **The game moves its own level** (`ownsLevel`), not the shared adaptive rule, so a table isn't left halfway through:
  - A clean walk phase (no misses) skips straight to the jumps.
  - Passing the jumps with at most 1 miss unlocks the next table. Otherwise the jumps repeat.
- **Hint:** count on or back across the changing rows, dot by dot for ×2–×5 and "plus 7 is 42" for bigger tables.
- **Why:** walking in order shows the structure (one more group), but only unpredictable problems make him recall the fact. So Stairs teaches the structure and Crates does the mixed practice. Jumping from landmarks trains derived facts (6×7 = 5×7 + 7) instead of reciting from 1×.

### 3–7. The five newer games (built)

Each has a full build spec in [`docs/specs/`](docs/specs/README.md). The spec is the source of truth: levels, generators, hints, spoken lines and parent text. Known rough edges and next steps are in [`docs/specs/follow-ups.md`](docs/specs/follow-ups.md).

| Game | Skill | Spec |
|---|---|---|
| 🪺 Nest Builder | Make-ten / bridging ten, add **and subtract** (13 − 5 → 10 → 8; 43 − 5 → 40 → 38) | [nest-builder.md](docs/specs/nest-builder.md) |
| 🔟 Make Ten | The make-ten chain step by step: partners, splitting, bridging to ten or the next ten, and subtraction | [make-ten.md](docs/specs/make-ten.md) |
| 💎 Gem Bags | Place value to 100: bags of ten, build and compare numbers, ± tens, 2-digit ± without regrouping | [gem-bags.md](docs/specs/gem-bags.md) |
| 🦖 Stomp Path | Number line 0–100: hops of 1 and 10, skip counting, open-number-line ±, estimation | [stomp-path.md](docs/specs/stomp-path.md) |
| 📖 Dino Story | Word problems by situation type (join, separate, compare, start unknown, equal groups), acted out by dinos | [dino-story.md](docs/specs/dino-story.md) |

Differences from the specs:
- **Gem Bags L2** shows the target numeral ("47") beside the dragon while the child builds it.
- **Stomp Path L6–L7** draw an open number line (not to scale, every landing labelled), so the one-hops in the tens-then-ones hint stay readable. On L8 (estimation) the T-rex stays hidden until the child taps, since it would give the answer away.
- **Dino Story:** the number-sentence beat on L6/L8 alternates instead of being random, and a 5 × 5 story draws countable eggs instead of 25 emoji actors.

## Rewards: the Hatchery

- About 20 collectible babies. Each is an emoji base (🦖🦕🐉🐲🦎🐢🐊) with a color variant and a name, e.g. "Pip the Purple Raptor."
- One egg hatches per finished round, so the child always wins something.
- The Nest gallery shows everything collected, with empty silhouettes for the rest.

## Presentation

- **Voice:** Web Speech API (`speechSynthesis`). Prompts use a slightly slow rate and high pitch. Tapping the 🔊 button repeats the prompt.
- **Art:** emoji and CSS for now, big and bright. Swap in illustrations later.
- **Sound:** WebAudio chimes. No asset files.
- **Controls:** tap and click only, with tap targets of at least 80px. Works on iPad and on a laptop.
- **Parent corner:** a tiny ⚙️ button with a long press shows the level per skill and resets progress.

## Build order

1. ~~Scaffold, voice, sound, progress, island map~~ (done)
2. ~~Egg Warmer and the hatch reward~~ (done, retargeted to facts within 20)
3. ~~Egg Crates~~ (done)
4. ~~Egg Stairs~~ (done)
5. ~~Break nudge and parent corner~~ (done)
6. ~~Gem Bags~~ (done)
7. ~~Nest Builder~~ (done)
8. ~~Stomp Path~~ (done)
9. ~~Dino Story~~ (done)
10. ~~Make Ten~~ (done)
