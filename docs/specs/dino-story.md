# Spec: 📖 Dino Story (word problems)

- **Status:** Built. Read [README.md](README.md) first.
- **Game id:** `'story'`. **File:** `src/games/dinoStory.ts`
- **Build order:** 4th. It reuses the models from `src/core/models.ts`, and benefits from Nest Builder's hatch-and-walk-home animation if that already exists.
- **Standards:**
  - 1.OA.1: add/subtract word problems within 20, all situation types.
  - 1.OA.2: three addends.
  - 2.OA.1: one- and two-step problems.
  - 3.OA.2: sharing division.
  - 3.OA.3: multiplication and division word problems.

## Why this game exists

Knowing that 13 − 5 = 8 isn't the same as recognising that a story *is* 13 − 5. Research on children's word problems sorts them into **situation types** that differ a lot in difficulty, even when the numbers are the same (Carpenter et al., *Children's Mathematics: Cognitively Guided Instruction*, 1999; Riley, Greeno & Heller 1983).
- **Easiest:** join and separate with the result unknown.
- **Harder:** part-part-whole and "change unknown".
- **Hardest:** comparison ("how many more?") and "start unknown".

Children solve them best by **acting out or drawing the story**, and only later writing a number sentence. The ladder follows that order, the dinos act each story out, and the hint maps the story onto the ten-frame models he already knows.

## Story and tone

Scenes at Dino Island: the pond, the meadow, the nest, the gem cave. Dinos come to play, **fly home on Ember**, hatch, share gems and take naps. Subtraction is always leaving happily: going home, going for a nap, sharing. Nobody is eaten, lost or taken.

## Screen

A custom scene following the README's layout contract:
- **The stage fills the sky:** a simple backdrop (CSS gradient pond or meadow) with groups of emoji characters, laid out in rows of five so the quantities stay countable.
- **The story plays out:** each sentence is spoken with `say()` while its action animates.
  - A group appears.
  - More walk in from the side.
  - Some hop onto 🐉 Ember and fly off (translate up and fade).
  - Eggs hatch into 🐣.
- **Story strip:** after the action, a strip of numerals and icons appears under the stage, e.g. `[8 🦕] [+ 5 🦕] [= ?]`. It's the bridge from the story to the number sentence, and it uses no words.
- **Answers:** eggs in the bottom band. Copy `eggScene`'s band and glow-tap, or use a shared helper if another spec has already extracted one.
- **🔊 repeats a compact one-sentence retelling** with the question (`prompt()` it after the animation), not the whole animated story.
- **Characters:** 🦕 🦖 🥚 🐣 💎 🐢. Two dino "colours" for part-part-whole: use `hue-rotate` like `creatureEl` in `src/core/creatures.ts`.
- **At most 20 characters** on stage.

## Levels

| Lvl | Situation type | Example | Generator |
|---|---|---|---|
| 1 | Join, result unknown | "Eight dinos splash in the pond. Five more come to play. How many dinos now?" | a 3–12, b 2–8, sum ≤ 20 |
| 2 | **Separate, result unknown** | "Thirteen dinos splash in the pond. Five fly home on Ember. How many are still splashing?" | a 6–20, b 2–9, result ≥ 1; 60% cross ten |
| 3 | Part-part-whole | "Seven in one group. Six in the other. How many altogether?" / "Thirteen altogether. Seven are in one group. How many are in the other group?" | whole 8–20; 50% whole unknown / 50% part unknown |
| 4 | Join, change unknown | "Eight dinos at the pond. Some more came. Now there are thirteen. How many came?" | start 3–12, change 2–8, total ≤ 20 |
| 5 | **Compare**: how many more / fewer | "Thirteen on top. Eight below. How many more on top?" | bigger 6–20, difference 2–9; ask "more" or "fewer" |
| 6 | **Separate, start unknown** | "Some dinos were playing. Five flew home. Eight are still playing. How many were playing at the start?" | change 2–9, result 2–11, start ≤ 20 |
| 7 | Equal groups and sharing | "Four nests with three eggs each. How many altogether?" / "Twelve shared by three. The same in each. How many in each?" | groups 2–5, size 2–5; 50% product unknown / 50% sharing (size unknown) |
| 8 | Mixed L1–L7, plus **two-step** within 20 on ~30% | "Nine dinos play. Four go home. Six more come. How many now?" | two-step: all intermediate values 0–20 |

**Number-sentence beat (L6 and L8):** on half the problems, add a first beat: "Which number puzzle matches the story?" The choices are 3 sentence cards (e.g. `? − 5 = 8`, `8 − 5 = ?`, `8 + 5 = ?`), and the right one is the story's structure. Then comes beat 2: solve it. Build the cards as big tappable elements with `awaitChoice`. `firstTry` = both beats right the first time.

## Story templates

Build each level's stories from templates. Keep them in a data array in `dinoStory.ts` so more can be added easily. **Word numbers:** `word(n)` covers 0–20, which is all this game needs. At least four templates per type, rotated so repeats are rare:

| Type | Templates (`{a}` `{b}` are numbers) |
|---|---|
| Join | "{a} dinos splash in the pond. {b} more come to play." · "{a} eggs are in the nest. Ember brings {b} more." · "{a} baby dinos are napping. {b} more curl up with them." · "A dragon has {a} gems. A friend gives her {b} more." |
| Separate | "{a} dinos splash in the pond. {b} fly home on Ember." · "{a} eggs are in the nest. {b} hatch and walk home." · "{a} dinos are playing. {b} go for a nap." · "A dragon has {a} gems. She shares {b} with a friend." |
| Part-part-whole | "{a} green dinos are at the pond. {b} blue dinos are there too." · "The nest has {a} white eggs. {b} more eggs are speckled." · "{a} dinos are in the pond. {b} more are on the sand." · "Ember found {a} red gems. {b} more are blue." |
| Compare | "{a} dinos are in the pond. {b} dinos are on the hill." · "Ember has {a} gems. Her friend has {b} gems." · "The big nest has {a} eggs. The little nest has {b} eggs." · "{a} turtles are at the beach. {b} dinos are there too." |
| Equal groups / sharing | "{a} nests with {b} eggs in each." · "{a} dragons each have {b} gems." · "{total} eggs for {a} nests. The same in each nest!" · "{total} gems for {a} dragons. The same for each dragon!" |

Every template is two short sentences, one idea each, per "How Ember talks" in AGENTS.md.

**Compare staging:** line the two groups up in two rows, one above the other, so the extra ones stick out. That's the matching picture the research recommends for "how many more".

## Spoken lines

Short sentences, one idea each, per "How Ember talks" in AGENTS.md.

- **The story:** the template sentences, one `say()` each, synced to the animation.
- **The question:** "How many now?" / "How many are still splashing?" / "How many came?" / "How many more on top?" / "How many were playing at the start?" / "How many in each?"
- **The `ask` for 🔊:** a compact retelling plus the question, e.g. "Thirteen were playing. Five went home. How many are left?"
- **Praise:** "You acted it out in your head!", "That was a tricky one!", "You found the missing part!"
- **Intro:** "Dino Story! Help Ember answer the question!"

## Hints: "Watch! Let's act it out."

1. Replay the story animation at double speed.
2. Show the matching **model** in the card area, then run its `hint()`:

| Type | Model |
|---|---|
| Join / part-part-whole (whole unknown) | `addModel(a, b)` |
| Separate (result unknown) | `subModel(a, b)` |
| Join change unknown, part unknown, compare | `missingModel(small, big)`. For compare, first say "Watch! Match them up. Extra ones are the answer." |
| Start unknown | Say "Watch! Put the ones who left back!", then `addModel(result, change)` |
| Equal groups | `groupsModel(n, k)` |
| Sharing | Deal the eggs one at a time into the nests while counting ("one for you, one for you…"). This is new: write it in `dinoStory.ts`. |

3. Finish with the number sentence spoken aloud: "Thirteen minus five is eight."

## Answer choices

- `nearChoices(answer, 4, 0, 20)` (for L7 products, `0, 25`), then swap in the **wrong-operation mistake** when it's valid:
  - `a + b` for separate and compare stories;
  - `a + c` for change-unknown stories (adding the numbers it shows);
  - the result for start-unknown stories (answering "how many are left").
- These are the classic word-problem errors, and they're the most useful distractors.

## Parent text

```ts
name: 'Dino Story',
icon: '📖',
skill: 'Word problems: adding, taking away, comparing, missing numbers and equal groups',
about:
  'Short stories acted out by dinos: some come to play, some fly home on Ember, eggs hatch, gems are shared. Your child works out the answer, and if it\'s tricky, the game acts the story out again and shows it as a picture. The levels follow the story types children find easier and harder, ending with "how many more?", "how many at the start?" and choosing the number sentence that matches the story.',
levels: [
  'Some come to play: how many now?',
  'Some fly home: how many are left?',
  'Two kinds together (green and blue dinos)',
  'Some more came: how many came?',
  'How many more (or fewer)?',
  'How many at the start? Plus matching the number sentence',
  'Equal groups and sharing (4 nests of 3 eggs, 12 shared by 3)',
  'Mixed stories, including two-step stories',
],
intro: 'Dino Story! Help Ember answer the question!',
```

## Build checklist

1. `src/games/dinoStory.ts`:
   - templates, generators and the stage;
   - animations: appear, walk in, fly home, hatch, deal into nests;
   - the story strip;
   - the sentence-card beat;
   - the hints using `src/core/models.ts`.
2. Register in `index.ts` and remove it from `UPCOMING`.
3. Append a `/* ---------- Dino Story ---------- */` section to `styles.css`. Size the stage and characters with `vmin` so 20 characters fit on a phone.
4. Add to `scripts/audit.mjs`:
   - `'story-L2'`
   - `'story-L5-compare'`
   - `'story-L8-sentences'` (`ready` = the sentence-card selector; set up so the first problem has the sentence beat, e.g. via a query flag or a seeded choice)
5. Verify per README. The play-through must cover:
   - a separate story with a miss (hint shows `subModel`),
   - a compare story,
   - a sentence-card beat.
   Every template must pass a generator test: 1,000 random problems per level, with numbers in range, a valid answer, and the answer among the choices.

## Open questions for the user (defaults accepted)

- Should the story text also appear on screen for a parent reading along? **No.** Kid screens stay wordless. The parent guide explains the levels. **Resolved: default accepted by user.**
- Keep sharing (division) in L7, or leave it to Egg Crates' missing factor? **Keep it.** Sharing stories are the most natural way into division. **Resolved: default accepted by user.**

## Out of scope

Numbers above 20 (apart from L7 products up to 25), money, time, measurement stories, and reading.
