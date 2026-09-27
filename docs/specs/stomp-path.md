# Spec: 🦖 Stomp Path (number line to 100)

- **Status:** Ready to build. Read [README.md](README.md) first.
- **Game id:** `'stomp'`. **File:** `src/games/stompPath.ts`
- **Build order:** 3rd.
- **Standards:**
  - 1.NBT.1: count to 120.
  - 1.NBT.5: 10 more or 10 less.
  - 2.NBT.2: skip count by 5s, 10s and 100s.
  - 2.MD.6: represent sums and differences on a number line.
  - 2.NBT.5: add and subtract within 100.

## Why this game exists

- **Linear board games** build number sense: saying each number while moving along a *straight* numbered path improved counting, comparison and number-line estimates, and a circular board did not (Siegler & Ramani 2008).
- For an older child the same idea extends to:
  - hops of ten,
  - **skip counting**, which feeds Egg Stairs and Egg Crates,
  - the **open number line** as an adding and subtracting strategy (38 + 25 = 38 → 58 → 63),
  - **number-line estimation** ("where does 63 go?"). Estimation accuracy is closely tied to maths achievement (Siegler & Booth 2004).

The path must stay a **straight line**. No snaking 10×10 hundred board.

## Story and tone

A friendly T-rex is walking home to the nest at the end of the path. Big stomps (hops of ten) and little stomps (hops of one). Walking back means going back to the pond for a drink. There's nothing to chase and nothing to escape.

## Screen

A custom scene following the README's layout contract:
- **The path fills the sky:** a straight horizontal line, full width, with the 🦖 marker above it.
- **Hops** are drawn as arcs above the line, labelled "+10" or "+1".
- **Answer eggs** sit in the bottom band. Copy `eggScene`'s egg band and glow-tap, or refactor the band out of `eggScene` into an exported helper, but don't change `eggScene`'s behaviour.

Two path views:

- **Window view (levels 1–2, 0–20):** 11 numbered squares centred on the action (e.g. 9–19), each big enough to tap (≥ 72px on an iPad). "…" at the ends shows the path continues.
- **Ruler view (levels 3–8, 0–100):**
  - one line from 0 to 100, with small ticks at every 1 and labelled ticks at every 10;
  - at level 8, only 0, 50 and 100 are labelled;
  - the T-rex sits at its number, with the number shown in a bubble above it.

**Stomp button (L1–L2):** a big 🦶 in the answer band. Each tap moves the T-rex one square, plays `sfx.stomp` and says the new number. This is the hands-on bit that the research says matters.

## Levels

"Predict, then stomp" means: the child answers "where will you land?" with an egg first, then stomps the hops themselves to see it happen (the stomps aren't scored).

| Lvl | Problem | View | Answer | Generator |
|---|---|---|---|---|
| 1 | Hop forward by ones: "Start at 12, hop 3" | window | predict (egg), then stomp | a 0–17, b 2–4 |
| 2 | **Hop back by ones**: "Start at 15, hop back 4" | window | predict, then stomp back | a 4–20, b 2–4 |
| 3 | Hops of ten: 23 + 10, 23 + 20, 57 − 10, 57 − 20 | ruler | egg | a 1–89, one or two ten-hops, direction random, result 0–100 |
| 4 | Skip count: three hops shown (5, 10, 15), "where next?" | ruler | egg | step 2 / 5 / 10; start at 0 or a multiple of the step; forward, plus back for 10s |
| 5 | Tens in one jump: 37 + 20, 52 − 30 (hops drawn only in the hint) | ruler | egg | a 1–99, ±10 to ±50, result 0–100 |
| 6 | **Open number line, add**: 38 + 25 → hop 20 → 58, hop 5 → 63 | ruler | egg | a 11–74, b 11–25, result ≤ 99; 50% cross a ten on the ones hop |
| 7 | **Open number line, subtract**: 62 − 25 → back 20 → 42, back 5 → 37 | ruler | egg | a 30–99, b 11–25, result ≥ 1; 50% cross a ten |
| 8 | Estimation: "Where does 63 live?" | ruler, only 0/50/100 labelled | **tap the line** | target 1–99, avoiding 0/50/100 ±3 |

**L8 scoring:**
- A tap within **±5** of the target is right. Show the true spot with a flag and say "Close! It's right here."
- A wrong tap starts the hint. The hint ends with the true spot glowing as a big tap target, so the retry always succeeds.
- `firstTry` = the first tap was within ±5.

## Spoken lines

Short, one-idea-per-sentence lines, paced by `say()`'s per-sentence beat (see "How Ember talks" in `AGENTS.md`).

| Moment | Line |
|---|---|
| L1 | "The T-rex is on twelve. Hop three. Where will it land?" then "Now you stomp! Tap the foot for every hop." |
| L2 | "The T-rex is on fifteen. Hop back four to the pond. Where will it land?" |
| L3 | "Twenty-three. One big ten-hop! Where does it land?" / "…two big ten-hops back?" |
| L4 | "Hopping by fives. Five. Ten. Fifteen. Where next?" |
| L5 | "Thirty-seven plus twenty. Where does the T-rex land?" |
| L6 | "Thirty-eight plus twenty-five. Tens first, then ones!" |
| L7 | "Sixty-two minus twenty-five. Tens first, then ones!" |
| L8 | "Where does sixty-three live? Tap the path!" |
| Praise | "Big hops first. Smart!", "You counted every stomp!" |

## Hints

Every hint opens with "Watch!", then shows and counts.

- **L1–L2:** "Watch!", then animate the hops one at a time, saying each number ("thirteen, fourteen, fifteen"). Point out the classic mistake: "Don't count the start. Count each new square."
- **L3/L5:** "Watch!", then ten-hop arcs one at a time: "twenty-three… thirty-three… forty-three". Note that the ones digit stays the same.
- **L4:** "Watch!", then replay the three hops, then the fourth, saying the count ("five, ten, fifteen, **twenty**").
- **L6/L7:** "Watch! Tens first, then ones!", then open-line arcs: the tens as ten-hops ("38, 48, 58"), then the ones one at a time ("59, 60, 61, 62, 63"). For crossing cases, say "Go to sixty. Three more."
- **L8:** "Let's count. Find the nearest big number.", then flag the true spot and count from the nearest labelled ten: "Start at fifty. Count the tens. Sixty. Three more. Sixty-three!"

## Answer choices

- `nearChoices(answer, 4, 0, 100)`, then swap in the **classic mistakes** when valid:
  - **L1/L2:** counting the start square: `a + b − 1` / `a − b + 1`.
  - **L3/L5:** ±1 instead of ±10 (`a + 1`), and the wrong direction.
  - **L4:** `next ± step`.
  - **L6/L7:** only the tens applied (`a ± tens(b)`), or ±10.

## Parent text

```ts
name: 'Stomp Path',
icon: '🦖',
skill: 'The number line to 100: counting on and back, hops of ten, skip counting, and estimating',
about:
  'A friendly T-rex walks home along a straight numbered path. Your child predicts where it will land, then stomps the hops themselves while each number is said out loud. Board games like this are proven to build number sense. Later levels use big hops of ten, skip counting by 2s, 5s and 10s (which leads into the times tables), adding and subtracting with hops ("38 + 25: hop 20, then 5"), and guessing where a number sits on the line.',
levels: [
  'Hop forward by ones (to 20), then stomp it',
  'Hop back by ones (to 20), then stomp it',
  'Big hops of ten, forward and back, to 100',
  'Skip counting by 2s, 5s and 10s',
  'Adding and subtracting tens in one jump (37 + 20)',
  'Adding with hops: tens first, then ones (38 + 25)',
  'Subtracting with hops: tens first, then ones (62 − 25)',
  'Where does 63 live? Tap the path',
],
intro: 'Stomp Path! Help the T-rex hop home!',
```

## Build checklist

1. `src/games/stompPath.ts`:
   - the window and ruler path views, with a `hop(from, to, step)` animation (arcs plus spoken numbers);
   - the stomp button;
   - the L8 tap-to-estimate;
   - the generators.
2. Register in `index.ts` and remove it from `UPCOMING`.
3. Append a `/* ---------- Stomp Path ---------- */` section to `styles.css`. Size the path to the window width, keep the ticks legible on a phone, and use `vmin` for the T-rex.
4. Add to `scripts/audit.mjs`:
   - `'stomp-L1-window'`
   - `'stomp-L6-ruler'`
   - `'stomp-L8-estimate'` (`ready: '.stomp-line'`, or whatever the path uses)
5. Verify per README. The play-through must cover:
   - L1 predict + stomp;
   - L7 with a miss, so the arcs run;
   - L8 with a far tap then a correct one.
   Check on a phone-width screenshot that the ruler's labelled ticks don't collide.

## Open questions for the user (defaults in bold, so build with the default)

- Should a round be 5 problems, or one "trip home" as in the original kindergarten design? **5 problems.** It keeps the shared adaptive rule and hatch rhythm. The T-rex moving closer to the nest with each correct answer can be purely decorative.
  - Resolved: default accepted by user.
- How precise does estimation need to be? **±5.** Tighten to ±3 if he finds it easy.
  - Resolved: default accepted by user.

## Out of scope

Numbers above 100, negative numbers, and fractions on the line.
