# Ember's Egg Rescue: game design

A Math Blaster–style game for ages 4–6, built on the research in [docs/research/2026-09-26-early-math-pedagogy.md](docs/research/2026-09-26-early-math-pedagogy.md).

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

- Each mini-game has levels 1–5 that follow its learning trajectory.
- The level is stored per mini-game in `localStorage`.
- **Up** after 3 correct in a row. **Down** after 2 misses on separate problems in a row. A miss followed by a correct retry counts as a miss.
- The level changes quietly between problems, so there's no "level down" message.

## Mini-games

### 1. Egg Warmer: subitizing and matching numerals to quantities
*The Math Blaster heart, made kind.* The eggs got chilly in the storm and bob gently on the meadow. Ember hovers at the top. The voice says "Warm the egg with **four**!" Tap an egg and Ember breathes a soft warm glow on it. The right egg hatches.

| Lvl | Target shown | Eggs show | Range |
|---|---|---|---|
| 1 | dots | dots (dice layout) | 1–3, 3 eggs |
| 2 | numeral + dots | dots | 1–5, 3 eggs |
| 3 | numeral only (spoken) | dots | 1–5, 4 eggs |
| 4 | numeral only | ten-frame | 1–10, 4 eggs |
| 5 | ten-frame | numerals | 1–10, 4 eggs |

The eggs drift slowly and loop back if they float off the top, so there's no time pressure.

### 2. Dino Count: one-to-one counting and cardinality
Baby dinos wander in the meadow. The voice says "How many dinos?" Tapping a dino marks it and the voice counts ("one… two…"). After every dino is tapped, the child picks the total from 3 choices. That final choice checks cardinality.

| Lvl | Count | Layout |
|---|---|---|
| 1 | 1–3 | a row |
| 2 | 1–5 | a row |
| 3 | 3–7 | scattered |
| 4 | 5–10 | scattered |
| 5 | "Give me N": tap N dinos into the nest (N from 3–10) | scattered |

### 3. Gem Trade: comparing
Two dragons each hold a pile of gems. The voice asks "Who has **more** gems?" (or "fewer" at level 3 and up). The child taps a dragon.

| Lvl | Sizes | Difference | Display |
|---|---|---|---|
| 1 | 1–5 | 3 or more | gems in lined-up rows |
| 2 | 1–6 | 2 or more | rows |
| 3 | 1–8 | 1 or more, and asks "more" or "fewer" | rows |
| 4 | 1–10 | 1 or more | scattered piles |
| 5 | 1–10 | 1 or more | numerals only, with dots shown in the hint |

### 4. Stomp Path: the number line (Siegler & Ramani)
A T-rex stands on a **straight** numbered path. Spin the stone spinner (1–3). The child taps each next square, and the voice says each number as the T-rex stomps forward: "four, five, six!" Reaching the end hatches the egg.

| Lvl | Path | Spinner | Extra |
|---|---|---|---|
| 1 | 1–10 | 1–2 | the next square glows |
| 2 | 1–10 | 1–3 | no glow |
| 3 | 1–10 | 1–3 | after landing: "What number are you on?" |
| 4 | 1–20 | 1–3 | landing question |
| 5 | 1–20 | 1–4 | "Where will you land?" before moving (counting on) |

A round is one trip down the path, not 5 problems.

### 5. Nest Builder: making 5 and 10
The nest is a **ten-frame** (a five-frame at level 1). Some eggs are already in it. The voice asks "How many more eggs to fill the nest?" The child taps eggs into the nest, or at higher levels picks the answer.

| Lvl | Frame | Answer by |
|---|---|---|
| 1 | 5 | tapping eggs in |
| 2 | 5 | choosing a number |
| 3 | 10, with 5 or more already in | tapping eggs in |
| 4 | 10, any starting amount | choosing a number |
| 5 | "Make 7": the start is a ten-frame with some filled, and the target is any number up to 10 | choosing a number |

### 6. Dino Story: adding and subtracting
Short animated stories. "**Three** dinos splash in the pond. **Two** more stomp over! How many dinos now?" The dinos actually walk in or out. The child picks from 3 answers, each shown as a numeral with dots.

| Lvl | Type | Range |
|---|---|---|
| 1 | join | within 5 |
| 2 | take away (dinos fly off on a dragon) | within 5 |
| 3 | join or take away | within 10 |
| 4 | missing part: "3 dinos are here. Some more came. Now there are 5." | within 10 |
| 5 | mixed, with the pictures fading out (just numbers, with dots as a hint) | within 10 |

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

1. Scaffold, voice, sound, progress, island map
2. **Egg Warmer** (the MVP loop) and the hatch reward
3. Dino Count
4. Gem Trade
5. Nest Builder
6. Stomp Path
7. Dino Story
8. Break nudge and parent corner
