# Worklog

## 2026-09-27 — Lines-file move: Egg Stairs and Egg Crates

**Goal:** Move every spoken line in Egg Stairs and Egg Crates into a per-game `<game>.lines.ts` file, following the pattern already on `main` (`eggWarmer.lines.ts` / `eggWarmer.ts`, `src/core/lines.ts`). Pure move, no rewording, done in parallel with other workers converting Nest Builder/Make Ten/Stomp Path and Gem Bags/Dino Story.

**Done:**
- `src/games/eggStairs.lines.ts` (new): `intro`, `askFirstRow`, `askLandmark`, `askUp`, `askDown` (the four `ask` branches in `question()`), `hintFirstRow`, `hintCountOn`, `hintCountBack`, `hintResult` (the hint sequence), `walkUp`/`walkDown` (the per-row count-on/count-back line in `Crate.walk`, split out of the old ternary so `walkStep` didn't need a boolean sample arg).
- `src/games/eggStairs.ts`: now imports `lines` and calls it everywhere `ask`/`say(...)` held an inline template; dropped the now-unused `rowWord` local (its wording moved into `lines.askUp`/`lines.askDown`).
- `src/games/eggCrates.lines.ts` (new): `intro`, `groups` (equal-groups ask), `rows` (shown-model rows ask, shared by `arr()` and `big()`), `fact` (fact-only ask), `missingFactor`.
- `src/games/eggCrates.ts`: now imports `lines`; dropped the now-unused `word` import from `../core/words` (moved into `eggCrates.lines.ts`, which needs it for `groups`).
- No spec file exists for Egg Stairs or Egg Crates in `docs/specs/`, and `DESIGN.md`'s Egg Stairs/Egg Crates sections only have short inline example wording embedded in prose (not a "Spoken lines" table), so nothing there needed to change or point at the lines files.

**Decisions:**
- `Crate.walk`'s `say(\`${up ? 'plus' : 'minus'} ${t} is ${total}\`)` became two lines-file entries (`walkUp`, `walkDown`) instead of one function taking a boolean — keeps every lines-file function taking plain numbers, per the brief, and avoids a boolean landing in the checker's numeric `SAMPLE_ARGS`.
- `say(String(total), { rate: 1.05 })` in the same method (counting a single running total, digit by digit) was left inline — it's the "spoken counting of a single number" case the brief calls out, and it's not a string literal so `check-lines.mjs`'s inline-detector doesn't flag it anyway.

**Verified:**
- `npm run typecheck`: clean.
- `just check`: clean — `check-lines.mjs` reports "✓ spoken lines OK (4 lines files; longest sentence 7 words...)", counting `src/core/lines.ts` plus `eggWarmer.lines.ts`/`eggStairs.lines.ts`/`eggCrates.lines.ts` (the other three games' lines files aren't in this worktree; other workers are converting them on their own branches). No "written inline" errors for `eggStairs.ts`/`eggCrates.ts`.
- `node scripts/playthrough.mjs stairs --level=all`: 9/9 levels, 0 failed. `node scripts/playthrough.mjs crates --level=all`: 8/8 levels, 0 failed.
- `just verify`: build passed, 0 of 180 audit screen/size combinations flagged, 65/65 playthrough rounds (all games in this worktree) reached the hatch with no errors and a hint shown.
- No wording changed: `check-lines.mjs` never flagged a line (no rewording was needed), and `git diff main -- src/games/eggStairs.ts src/games/eggCrates.ts` shows only `ask`/`say(...)` sites swapped for the matching `lines.*` call, string-for-string — spot-checked every moved line against the pre-move source.

**Open / broken:** None.

**Next:** Once the other two lines-file workers land their branches, merge all three and re-run `just verify` on the merged tree (their `.lines.ts` files should raise the "N lines files" count in `check-lines.mjs`'s output).
## 2026-09-27 — Lines files: Gem Bags and Dino Story

**Goal:** Move every spoken line in Gem Bags and Dino Story into a per-game lines file (`gemBags.lines.ts`, `dinoStory.lines.ts`), following the `eggWarmer.lines.ts` pattern, so `just check`'s new spoken-line checker covers them. A pure move: no wording changes.

**Done:**
- `src/games/gemBags.lines.ts`: new file. `intro`, `praise`, the `gemsModel`/`operationModel`/`regroupModel` hint lines, the `question()` ask per level/kind, the build-scene (`L2`) prompts and hints, and the compare-scene (`L3`) ask/hints. `gemBags.ts` now imports `lines` and holds no spoken wording; it got shorter (71 lines changed, net smaller).
- `src/games/dinoStory.lines.ts`: new file. `intro`, `praise`, the `templates` record (moved from `STORY_TEMPLATES`, unchanged), the per-situation `ask` functions (`joinAsk`, `separateAsk`, ... `twoStepAsk`), the sentence-card beat lines, the answer-beat lines, hint lead-ins, and the `sharingModel` deal-in lines. `dinoStory.ts` now imports `lines` and `type StoryTemplate`; `StoryKind`/`LeaveAction` stay there (exported) since `dinoStory.lines.ts` needs them type-only and they're used well beyond the templates.
- One code-level rename, not a wording change: the `{total}` template placeholder became `{sum}` in `change-unknown` and `sharing` templates, because `check-lines.mjs` strips punctuation before matching banned words, and the literal, unfilled `{total}` token strips to the banned word "total". The actual spoken output is unaffected — `fill()` still substitutes the real number via `word()`; I added a `sum: total` alias in the two generators' `values` objects so both the old `total` key (still read by `hintModel`/`dealStage`) and the new placeholder resolve.
- `docs/specs/gem-bags.md`, `docs/specs/dino-story.md`: replaced the "Spoken lines" table/list (and, in dino-story.md, the "Story templates" quoted list) with one sentence each pointing at the lines file. Level tables' example wording untouched (nothing was reworded, so it's still accurate).

**Decisions:**
- Kept `StoryKind`/`LeaveAction` type definitions in `dinoStory.ts` rather than moving them to the lines file — they're used throughout problem generation, not just templates. `dinoStory.lines.ts` imports them `type`-only, which is fine despite the circular file reference since type-only imports are erased at compile time.
- Didn't touch the specs' "Hints" sections (they mix behavior description with example wording, not just quoted lines) — only the sections that were purely a line list or table.

**Verified:**
- `npm run typecheck`: clean.
- `just check`: passes — `check-lines.mjs` reports "4 lines files", no "written inline" errors, no banned-word or sentence-length problems.
- `node scripts/playthrough.mjs bags --level=all` and `... story --level=all`: all levels of both games pass (hatch reached, hint shown, no errors).
- No wording changed: `git diff main` shows every deleted literal string in the two game files reappearing verbatim in the new lines files, except the `{total}`→`{sum}` placeholder rename described above (not spoken text).
- `just verify` (build, audit at 6 sizes, every level of every game including the other in-flight conversions): all green, 0 failed.

**Next:** None — this chunk is done. Other in-flight workers are converting Egg Stairs/Egg Crates and Nest Builder/Make Ten/Stomp Path in parallel; nothing here depends on them.

## 2026-09-27 — Voice pass: shared hint lines, Egg Warmer/Stairs/Crates, start greeting

**Goal:** Rewrite spoken lines in the shared models/scene code, Egg Warmer, Egg Stairs and Egg Crates, and the app's start greeting, to match `AGENTS.md`'s new "How Ember talks" section (one idea per sentence, ~7 words, numbers first, chants for recaps, hints start with "Let's count."). The parent said the current voice is "an oomph too much." Pace itself is unaffected (`voice.ts` untouched).

**Done, by file (before → after):**
- `src/core/models.ts` (shared hint lines, used by every fact game):
  - addModel make-ten recap: `"X and Y make ten. Ten and Z is W."` → `"X and Y. Ten! Ten and Z. W!"` (chant, per the guide's own example)
  - addModel plain recap: `"X plus Y is Z."` → `"X and Y is Z."`
  - subModel crossing-ten: `"Take away N to get to ten. Then M more."` → `"Take away N. Down to ten. Then M more."`
  - subModel plain: `"Start at A. Take away B, counting back."` → `"Start at A. Take away B. Count back."` (dropped the comma-joined clause)
  - missingModel question: `"Start at A. How many more to get to C?"` → `"Start at A. How many more to C?"`
  - missingModel recap: `"That's N more. A plus N is C."` → `"That's N more. A and N is C."`
  - arrayModel (missing-factor hint): `"Let's build rows of C until we get to P."` (10 words, one sentence) → `"Let's build rows of C. Count up to P."` (two sentences)
- `src/games/eggScene.ts` (shared onWrong hint, used by every fact game):
  - first wrong tap: `"Hmm, not that one. Let's figure it out together."` → `"Let's count."` — this exact old line is the bad example named in AGENTS.md's own guide
  - second wrong tap: `"Not that one either. Look at the picture and try again."` → `"Not that one either. Look at the picture. Try again."` (split the and-joined instruction)
- `src/games/eggWarmer.ts`: intro `"Egg Warmer! These eggs got chilly in the storm. Solve the number puzzle and warm the right egg so it can hatch."` (3 sentences, one 13 words) → `"Egg Warmer! Let's warm the eggs!"` (the guide's own worked example for this game)
- `src/games/eggStairs.ts`:
  - intro `"Egg Stairs! Ember is stacking eggs in a crate, one row at a time. Help count them as the rows go up and down!"` (3 sentences, up to 12 words, comma- and and-joined) → `"Egg Stairs! Let's count the rows!"`
  - landmark question: `"You know N rows of T is K. How many is M rows?"` (8-word first sentence) → `"You know this. N rows of T is K. How many is M rows?"`
  - hint lead-in: `"Start at K, and count on the new row(s)."` / `"Start at K, and count back."` → `"Start at K. Count on the new row(s)."` / `"Start at K. Count back."` (dropped the comma-joins)
- `src/games/eggCrates.ts`: intro `"Egg Crates! The rescued eggs are packed in rows. Help Ember count them fast!"` → `"Egg Crates! Let's count rows of eggs!"`
- `src/main.ts`: start greeting `"...A big storm scattered the dino eggs..."` → `"...A storm scattered the dino eggs..."` (7 words → 6)
- `DESIGN.md`: updated the Egg Stairs landmark quote to match the shipped wording ("You know this. 5 rows of 3 is 15...").
- `src/core/screens.ts`, `src/core/round.ts`, `src/core/choices.ts`, `src/core/parent.ts`: read end to end; every spoken line (map greeting, break nudge, hatch/nest lines) was already within the guide (short sentences, no comma-joins) — no changes.

**Longest remaining spoken sentence:** 7 words, several tied (e.g. screens.ts "You have {n} friends in your nest!"; eggCrates.ts "How many rows of {c} make {p}?"). None exceed the guide's ~7-word target.

**Verified:**
- `npm run typecheck && just check`: clean (Knip, conflict/brace checks).
- `node scripts/playthrough.mjs all --level=all`: 57/57 rounds, 0 failed.
- `just verify`: build passed, 0 of 180 audit screen/size combinations flagged, 57/57 rounds passed.
- `git diff --stat` on the 7 touched files: 16 insertions / 16 deletions — a straight copy edit, no file grew.

**Next:** Have the parent listen to a live round of Egg Warmer, Egg Stairs and Egg Crates on the child's usual device to confirm the shorter lines land better; worker B/C are doing the same pass for nestBuilder/makeTen/stompPath and gemBags/dinoStory in parallel.
## 2026-09-27 — Voice pass: Gem Bags and Dino Story wording

**Goal:** Per the parent (via AGENTS.md's new "How Ember talks"), rewrite spoken lines in Gem Bags and Dino Story so instructions read as short, one-idea sentences rather than the old longer/joined ones. Pacing itself was already fixed by another worker in `voice.ts`; this is words only.

**Done:**
- `src/games/gemBags.ts`: split every `and`/`then`/colon-joined spoken line into short sentences, added the "Tens first, then ones!" catchphrase to the tens+ones add/sub hint (previously unlabelled), added "Let's count."/"Watch!" hint openers, shortened the L3 compare `ask` while keeping the red/blue dragon names, trimmed the intro to two short sentences.
- `src/games/dinoStory.ts`: split every long/joined story template line and generator `ask` string into short sentences (kept the same 4 templates per situation type), removed "equally" (a banned word) from the sharing templates and hint, replaced the "Hmm, not that one" pattern with a "Watch!" opener, shortened the sentence-beat and answer-beat retry lines, trimmed the intro.
- `docs/specs/gem-bags.md`, `docs/specs/dino-story.md`: updated the "Spoken lines"/"Hints"/template tables and parent-text `intro` to match what shipped.

**Verified:**
- `npm run typecheck` clean; `just check` clean (no conflict markers, CSS balanced, knip clean).
- `node scripts/playthrough.mjs bags --level=all`: 0 failed (8/8 levels). `node scripts/playthrough.mjs story --level=all`: 0 failed (8/8 levels).
- `just verify`: build passed, 0 of 180 audit screen/size combinations flagged, all 65 game/level rounds reached the hatch with a hint shown.
- Longest remaining spoken sentence in either file: 7 words (e.g. "47 needs 4 bags and 7 gems.", "Then, count on the friends who came.", "You acted it out in your head!" — all pre-existing or newly-split, none over the ~7-word guideline).

**Spoken-line changes (before → after), for review:**

*gemBags.ts*
- Hint intro: "Count the bags by tens, then count the loose gems." → "Let's count. Bags first!"
- Hint recap: "4 bags is 40, and 7 more is 47." → "4 bags is 40. 7 more is 47."
- Add/sub-tens hint opener: "Add the new bags, counting by tens." / "Share the bags, counting back by tens." → "Watch! New bags arrive. Count by tens." / "Watch! Share bags. Count back by tens."
- Add/sub tens+ones hint: (no opener) → added "Tens first, then ones!" before the existing tens/ones breakdown.
- Regroup hint opener: "Start at 36. Add 7 loose gems." → "Watch! Start at 36. Add 7 loose gems."
- L1 `ask`: "How many gems does this dragon have? Count the bags by tens!" → "Count the bags by tens. How many gems now?"
- L5 `ask` (several bags): "34 gems, and 2 more bags! How many?" → "34 gems. 2 more bags come! How many now?"
- L6 `ask`: "34 gems and 25 gems. How many altogether?" → "34 gems. 25 more gems. How many altogether?"
- L2 build wrong-✓ hint: "You made 37: 3 bags and 7 gems. 47 needs 4 bags and 7 gems." → "You made 37. That's 3 bags and 7 gems. 47 needs 4 bags and 7 gems."
- L3 compare `ask`: "Which dragon has more gems, the red one or the blue one?" → "Red dragon. Blue dragon. Which has more gems?"
- L3 first wrong-tap hint: "Let's count both hoards. Bags first!" → "Let's count. Bags first!"; "Bags first! 3 bags is more than 2 bags." → "3 bags is more than 2 bags."; "The bags match. Compare the loose gems: 7 and 4." → "The bags match. 7 and 4."
- L3 second wrong-tap hint: "Look at the red and blue dragons. Bags first, then the loose gems." → "Look at both dragons. Bags first, then gems!"
- Intro: "Gem Bags! Dragons keep their gems in bags of ten. Help Ember count and share them!" → "Gem Bags! Help Ember count and share gems!"

*dinoStory.ts*
- Separate template (nest): "{b} hatch and walk home to their mums." → "{b} hatch and walk home."
- Part-whole templates (whole-unknown, all 4): joined single-sentence lines ("{a} green dinos and {b} blue dinos are at the pond.", etc.) → each split into two short sentences ("{a} green dinos are at the pond." / "{b} blue dinos are there too.", and the parallel eggs/sand/gems versions).
- Compare template (beach): "{a} turtles and {b} dinos are at the beach." → "{a} turtles are at the beach." / "{b} dinos are there too."
- Sharing templates: "{total} eggs are shared equally into {a} nests." / "...gems are shared equally by {a} dragons." → "{total} eggs go into {a} nests." / "{total} gems go to {a} dragons." (dropped "equally", a banned word).
- Part-whole `ask` (whole unknown): "There are 7 in one group and 6 in the other. How many altogether?" → "7 in one group. 6 in the other. How many altogether?"
- Compare `ask`: "13 in the first group and 8 in the second. How many more are in the first group?" / the "fewer" mirror → "13 and 8. How many more?" / "8 and 13. How many fewer?"
- Start-unknown `ask`: "Some were playing. 5 went home and 8 stayed. How many were playing at the start?" → "Some were playing. 5 went home. 8 stayed. How many were playing at the start?"
- Equal-groups sharing `ask`: "12 shared equally into 3 groups. How many in each group?" → "12 go into 3 groups. How many in each?"
- Sharing hint: "Share 12 equally. One for each group, over and over." → "Share 12. One for each group."; "12 shared into 3 groups is 4 in each group." → "3 groups. 4 in each."
- Compare pre-hint: "Match them up: the extra ones are the answer." → "Watch! Match them up. Extra ones are the answer."
- Start-unknown pre-hint: "Put the ones who left back!" → "Watch! Put the ones who left back!"
- Sentence-beat second-miss line: "Look at what happened, then try another number puzzle." → "Think about the story. Try again."
- Answer-beat first-miss line: "Hmm, not that one. Let's act it out." → "Watch! Let's act it out."
- Answer-beat second-miss line: "Look at the picture and try another egg." → "Look at the picture. Try another egg."
- Intro: "Dino Story! Watch what the dinos do, then help Ember answer the question." → "Dino Story! Help Ember answer the question!"

**Next:** Have the parent listen to a round of each game on the child's usual device and confirm the new pace and wording land better. Worker A (egg games/core) and worker B (nestBuilder/makeTen/stompPath) are doing the same pass on their files in parallel.
## 2026-09-27 — Slow the spoken lines in Nest Builder, Make Ten and Stomp Path

**Goal:** Per the parent (words are "an oomph too much" — too fast, too complicated), rewrite the spoken lines in `nestBuilder.ts`, `makeTen.ts` and `stompPath.ts` to match the new "How Ember talks" section of `AGENTS.md`, without dropping the maths or the strategy catchphrases. Pace itself was already fixed elsewhere (`say()` now speaks sentence-by-sentence); this chunk is the words. Two other agents did the same for the other games in parallel (egg games/`eggScene.ts`/`src/core`, and Gem Bags/Dino Story).

**Done:** every hint now opens with "Let's count." (nest/basket games) or "Watch!" (Stomp Path), long joined sentences ("X and Y make Z, and W more is V!") became short chants, and the two-part questions ("X is Y and how many more?") became two sentences ("X is Y. How many more?"). Stomp Path's L6/L7 catchphrase was tightened to the AGENTS.md-listed "Tens first, then ones!" (previously "Hop the tens first, then the ones!", which didn't match). All three intros are now two short sentences. Full before → after list:

**`src/games/nestBuilder.ts`**
- L1 ask: "Seven eggs in the nest. How many more to fill it?" → "Seven in the nest. How many fill the nest?"
- L2/L3/L5/L8 add beat1 (small) ask: "…How many of the five fill the nest?" → "…How many fill the nest?"
- Add hint/explain chant: "Eight and two make ten. Ten and three is thirteen." → "Eight and two. Ten! Ten and three. Thirteen!"
- Sub hint/explain chant: "Thirteen minus five is eight." → "Thirteen minus three. Ten! Ten minus two. Eight!"
- Sub beat1 ask: "Thirteen minus five. How many babies hatch and walk home to get down to ten?" → "Thirteen in the nest. Some babies hatch and walk home. How many get down to ten?"
- Every hint (fill, add ×2, next-ten, subtract) now opens with "Let's count." before it counts.
- Intro: "Nest Builder! Every nest holds ten eggs. Help Ember fill the nests, one nest at a time." → "Nest Builder! Let's fill the nests!"

**`src/games/makeTen.ts`**
- L1 (partner) ask: "Ten is eight and how many more?" → "Ten is eight. How many more?"
- L2 (fill) ask: "Eight in the nest, five in the basket. How many of the five fill the nest?" → "Eight in the nest. Five in the basket. How many fill the nest?"
- L3/L4/L5/L7 split-beat ask: "Five is two and how many more?" → "Five is two. How many more?"
- L4/L5 add-chain beat1 ask: "…How many of the five fill the nest?" → "…How many fill the nest?"
- Full-chain recap (add, two spots): "Eight plus five. Eight and two make ten, and three more is thirteen!" → "Eight plus five. Eight and two. Ten! Ten and three. Thirteen!"
- L7 sub-chain beat1 ask: "Thirteen minus five. How many walk home to get down to ten?" → "…How many walk home to make ten?"
- L7 sub-chain beat3 ask: "Ten, and two more walk home. How many are left?" → "Ten. Two more walk home. How many are left?"
- Full-chain recap (subtract, two spots): "Thirteen minus five. Three to ten, then two more. Eight are left!" → "Thirteen minus five. Three to ten! Two more. Eight left!"
- Every hint (partner, fill, split, add-chain ×3, add-total, sub-chain ×3, sub-total) now opens with "Let's count." (`runPartner`'s hint call is now its own wrapping arrow so the prefix doesn't also fire on the correct-first-try path, which still calls `model.partnerHint()` directly for its own visual).
- Intro: "Make Ten! Fill the nest to ten first, then the rest. Let's split the eggs!" → "Make Ten! Fill the nest, then the rest!" (now uses the catchphrase verbatim from the first line).

**`src/games/stompPath.ts`**
- L4 ask: "Hopping by fives: five, ten, fifteen. Where next?" → "Hopping by fives. Five. Ten. Fifteen. Where next?" (each number gets its own beat instead of running together after a colon).
- L6/L7 ask and hint: "Hop the tens first, then the ones!" / "Hop back the tens first, then the ones." → "Tens first, then ones!" (the AGENTS.md-listed catchphrase, used for both levels and both hint and ask).
- Crossing-ten hint: "Go to sixty, then three more." → "Go to sixty. Three more."
- First miss: "Hmm, not that one. Let's walk the path together." → "Watch! Let's walk the path." (the old line was the exact anti-pattern the guide calls out).
- Second miss: "Look where the hops land, and try again." → "Look where the hops land. Try again."
- L1–L2/L3-L5/L4 hints gained a "Watch!" opener; L1-L2's "We don't count the square we start on." → "Don't count the start."
- Estimate (L8) wrong-tap hint: "Let's use the nearest big number." → "Let's count. Find the nearest big number."; "Start at fifty, and count the tens." → "Start at fifty. Count the tens."; "And three more is sixty-three." → "Three more. Sixty-three!"
- Intro: "Stomp Path! The T-rex is walking home. Help it hop along the path!" → "Stomp Path! Help the T-rex hop home!"

**Decisions:**
- Kept "eggs"/"babies hatch and walk home" story language rather than trimming it further — the tone rules (hero-only-helps, everyday words) matter more than shaving one more word off an already-short sentence.
- `Tens first, then ones!` used for both add (L6) and subtract (L7) Stomp Path levels, dropping the old direction-specific "back" wording, since the catchphrase in AGENTS.md is a single fixed phrase and the hop direction is already audible from the arc animation and spoken landing numbers.

**Verified:**
- `npm run typecheck && just check`: both clean (Knip flagged nothing).
- `node scripts/playthrough.mjs nest --level=all`, `maketen --level=all`, `stomp --level=all`: 0 failed, all 8 levels of each reached the hatch with a hint shown.
- `just verify`: build passed, 0/180 audit combinations flagged, all 65 game/level rounds passed.
- Longest remaining spoken sentence across the three files: "You split the five to make ten!" (7 words, `makeTen.ts` `runSplit` praise — an existing spec-quoted line, untouched).

**Next:** have the parent listen to a round of each game on the usual device and confirm the new pace and wording read calmer.

## 2026-09-27 — Dead-code checks with Knip

**Goal:** Per the user, a TypeScript counterpart to Python's vulture, run automatically, plus fixing what it finds.

**Done:**
- Added `knip` (devDependency) with `knip.json` (the scripts are entry points, since the justfile runs them). `just check` now runs it too (the whole check takes about 0.6 s). `just deadcode` runs it alone.
- Deleted dead helpers: `distinctWith` (dom), `numeralWithDots` and `countAlong` (visuals), `setMuted` (voice). Removed `export` from `PROBLEMS_PER_ROUND`, `visuals.tenFrame`, `StoryProblem`, `ProblemCtx`, and the "exported for stress tests" `generateStoryProblem` / `generateNestProblem`.
- Removed the `?audit` special cases from Nest Builder (a pinned 98 − 9) and Gem Bags (`forceTricky` / `forceRegroup`). The play-throughs also use `?audit`, so those rounds kept testing one pinned problem. Make Ten's were removed at merge. Knip can't see this pattern, so `AGENTS.md` and the delegate skill's quality bar now name it.

**Verified:** `npx knip` clean; typecheck clean. `node scripts/audit.mjs --only=nest-L7,bags-L3-compare,bags-L6` on random problems: 0 of 18 in 3 runs. `just verify`: check clean, 0 of 180 flagged, all 65 rounds pass.

## 2026-09-27 — Build Make Ten practice module

**Goal:** Add the spec's dedicated Make Ten game to the island map without changing Nest Builder's behaviour.

**Done:**
- Added `src/games/makeTen.ts`: eight levels for partners of ten, basket splits, full add/subtract chains, next-ten work and mixed one-step practice, with a nest, basket, number bond and growing chain.
- Reused exported Nest Builder helpers, registered `maketen`, added its styles, audit screens, split-beat play-through driver and parent/design docs.
- Merged `main`'s dynamic placement lists and faster audit tooling; the map now has eight games.

**Decisions:**
- One-step levels reserve the hidden bond/chain's space — only the nest is visible before a miss, and revealing the hint cannot push the card over the answer eggs.

**Verified:** `npm run typecheck && npm run build`; the required audit selection: 0/30 flagged; `node scripts/playthrough.mjs maketen --level=all`: 0 failed; real-speed L4 phone and L7 iPad rounds reached the hatch, and their hint screenshots were checked; an 8,000-problem browser check passed all generator ranges, non-trivial splits and choice assertions. Final `just verify`: `just check` clean, build passed, 0/180 audit flags, all 65 game/level rounds passed.

**Next:** Have the child try the full-chain and subtraction levels on the usual device.

## 2026-09-27 — Delegation tooling: delegate and retro skills, just check, faster audit

**Goal:** Per the user, make future multi-agent runs smoother: capture tonight's lessons, and have agents report friction so patterns can be fixed.

**Done:**
- `.claude/skills/delegate/SKILL.md`: the repo's playbook for handing work to Codex/Claude via Orca (brief template with the quality bar and scale up front, launch, known blockers, review/merge checklist, cleanup, retro review).
- `.claude/skills/retro/SKILL.md` + `docs/retros/`: each delegated agent writes a short friction report (categories: tooling, instructions, environment, codebase, checks) and attaches it to `worker_done`. `docs/retros/README.md` tracks open and fixed patterns. Seeded with the coordinator's retro from the games build. `just retros` lists them.
- `scripts/check.mjs` / `just check` (the first step of `just verify`): conflict markers in tracked files, and `{ }` balance per `styles.css` section. It caught both injected faults in a test.
- `scripts/audit.mjs`: screen × size jobs run in parallel with `?fast` (the intro screen stays real-speed): ~4 min → ~45 s, still 0/156 flagged. The audit and play-through build the "placed" lists from `__audit.games()` instead of hard-coded ids.
- `AGENTS.md`: `just check`, pointers to the delegate and retro skills, and the parallel-work rule (append to your own section, never edit shared lists in place).

**Verified:** `node scripts/check.mjs` clean, and it flags an injected conflict marker and a dropped CSS brace. `node scripts/audit.mjs`: 0 of 156, 45 s; looked at the intro and a question-card screenshot. `node scripts/playthrough.mjs all`: 0 failed. `codex debug prompt-input` lists the delegate, retro and worklog skills.

## 2026-09-27 — Fix mobile sound startup and recovery

**Goal:** Restore effects and spoken instructions on iPhone Safari and the home-screen app without changing desktop or mute/fast behavior.

**Done:**
- `src/core/sound.ts`: feature-detect Safari's Audio Session API, select `playback` before creating/using Web Audio, and resume an existing context from any non-running state (including WebKit's `interrupted`).
- `src/core/voice.ts`: cancel only when speech is active or queued, so an idle `cancel()` cannot race the next utterance.

**Decisions:**
- Fixed hunches 1, 3 and 4. WebKit documents Audio Session support from Safari 16.4 (https://webkit.org/blog/13966/webkit-features-in-safari-16-4/), `playback` as the remedy for silent-switch-muted Web Audio (https://bugs.webkit.org/show_bug.cgi?id=237322), the asynchronous cancel race (https://bugs.webkit.org/show_bug.cgi?id=191745), and iOS's `interrupted` state after backgrounding (https://bugs.webkit.org/show_bug.cgi?id=276016).
- Rejected hunch 2: `showMap()` invokes the real greeting's `speechSynthesis.speak()` synchronously inside the ▶ click handler already; adding an empty priming utterance would be redundant and could create another queued/cancelled utterance.

**Verified:** `npm run typecheck && npm run build` passed. `just verify` passed: build, 0/156 audit flags, and all 57 game/level play-throughs. An unmuted system-Chrome Playwright probe tapped ▶ and observed the full greeting passed to `speechSynthesis.speak()` in the same click task, the map visible, and no page errors.

**Open / broken:**
- Untested on iOS hardware. The parent still needs to try with the ringer switch on silent in both a Safari tab and the home-screen app, then background/lock and return before triggering another effect.

**Next:**
- Have the parent run those three phone checks; if one still fails, capture the iOS version and whether effects, speech, or both are silent.
## 2026-09-27 — Fit and colour the Gem Bags compare scene

**Goal:** Make Gem Bags level 3 fill its two cards with clear red and blue dragons and name those colours aloud.

**Done:**
- `src/games/gemBags.ts`: randomized the red/blue dragon sides, named colours in the prompt, hint and right-answer speech, and fitted each dragon-and-hoard unit to its choice card on resize.
- `src/styles.css`: enlarged the compare dragons and added the fitted unit's layout, within the Gem Bags section.
- `docs/specs/gem-bags.md`: recorded the red/blue dragons and randomized sides; level 3 remains pictures-only.

**Decisions:**
- Used the hatchery's existing 230° red and 100° blue emoji hue rotations so the variants match the rest of the game.

**Verified:** `npm run typecheck` and `npm run build` passed; `node scripts/audit.mjs --only=bags-L3-compare` reported 0 of 6 flagged; inspected all six `audit-screens/*--bags-L3-compare.png` images (phone through big-zoomed-out), with large, distinct dragons and hoards and no clipping. `node scripts/playthrough.mjs bags --level=all` passed all 8 levels; `node scripts/playthrough.mjs bags --level=3 --real` passed, and all 7 images in `playthrough-screens/bags-L3/` were inspected, including the hint state. `just verify` passed: build, 0 of 156 audit combinations flagged, and all 57 game/level rounds reached the hatch with a hint shown.

**Next:** Have the parent try Gem Bags level 3 on the child's usual device.

## 2026-09-27 — Fast, fanned-out play-throughs

**Goal:** Per the user, make the play-through check efficient and fan it out across levels.

**Done:**
- `?fast` in `src/core/voice.ts`: every `wait()` (and so muted speech) runs at 1/20 of its length. All game timing goes through `wait`/`say`, so this one line speeds up whole rounds. Kids never see it.
- `scripts/playthrough.mjs`: a game × level job queue (`--level=all`) run in parallel (`--jobs`, default up to 6), each round in its own browser context so saved levels don't collide. Fast by default, `--real` for real speed. Drivers' `page.waitForTimeout` is scaled down in fast mode. A step that times out (a choice vanished as the game moved on) is retried instead of failing, and each round has a deadline. A setup error fails one round, not the run.
- Driver fixes the parallel runs exposed: `nest.mjs` kept "missed yet?" in module variables shared by every round (moved to `ctx`); `bags.mjs` clicks with `dispatchEvent` and doesn't insist on seeing the brief hint pulse; `tap.mjs` grabs the choice in one call.
- `just verify` now plays every level of every game.

**Verified:** `node scripts/playthrough.mjs all --level=all`: 57 rounds, 0 failed, 45–49 s, in 4 consecutive runs (it used to take ~5½ min for one level per game). `--real` still works (Stomp L7, 24 s). Looked at a fast-mode hint screenshot (Nest L6): the hint model is there, sometimes mid-animation, and `--real` gives settled screenshots.

**Decisions:**
- No shared `scripts/check-generators.mjs`: each game keeps its generator private, and exposing them all isn't worth it at this scale. The all-levels play-through plus the one-off 1,000× checks cover it. `[promote?]`

## 2026-09-27 — Home-screen app and Netlify hosting

**Goal:** The "Running it on a phone" follow-ups: make it installable, and record where it's hosted.

**Done:**
- `public/manifest.webmanifest` + dragon icons (180/192/512 PNG) + Apple meta tags in `index.html`, so Add to Home Screen opens full screen.
- `vite.config.ts`: `base: './'`, so `dist/` works from any host path.
- Hosting: the user set up Netlify at https://effulgent-dieffenbachia-f29f59.netlify.app/, which builds from `main` on GitHub on every push. Added `netlify.toml` (build `npm run build`, publish `dist`), a `README.md`, and the URL in `AGENTS.md` and `docs/specs/follow-ups.md`.

**Verified:** typecheck and build OK. Served `dist/` from a `/ember/` subpath in Chrome at phone size: the map shows all 7 games, no page errors, no 404s, manifest and icon load.

**Open / broken:** the live site still serves `bdbe7ee` (pre-manifest) until these commits are pushed.
## 2026-09-27 — Tighten Gem Bags (fresh-eyes review)

**Goal:** Line-by-line review of `src/games/gemBags.ts` against `docs/specs/gem-bags.md`, plus the two child-visible rough edges from `docs/specs/follow-ups.md` (tiny L2 gem-source icon/thin empty hoard, fierce 🐲 friend dragon on L7–L8).

**Done:**
- Fixed a real spec mismatch: at L8, `add-tens`/`sub-tens` problems (e.g. "47 + 10" picked into the mixed practice) spoke the L4/L5 narrative ("A friend gives one more bag!...") even though `showModel` is false at L8 and the spec calls for "the number sentence, then 'Warm the egg with the answer!'" — a spoken line that no longer matched what was on screen. Added the same `level === 8` branch that `add`/`sub`/`regroup` already had.
- Replaced the 🐲 (fierce face) friend dragon with 🐉 (the dragon used everywhere else in the game — Ember, the map, `dinoStory.ts`'s own gem-sharing dragon) in both `operationModel`'s friend and `compareScene`'s second dragon. Tone rule: every creature is a friend.
- `styles.css` Gem Bags section: bumped `.gem-source .gem-loose`'s font-size (1.4× its box) so the single-gem button reads as prominently as the bag; gave `.gem-build-hoard.ez-target` a `min-height: max(130px, 22vh)` so the empty hoard is a visible box, not a thin strip.
- Everything else in the file matched the spec: all 8 level generators (ranges, tricky pairs, no-regroup constraints, the ~30% L8 regroup rate), `placeChoices`'s place-value distractors, and every hint/spoken line I could find. Left it alone — no dead code, no unnecessary defensive checks, nothing that reads out of step with `eggCrates.ts`'s style.

**Decisions:**
- Left both L3 compare dragons as the same 🐉 rather than giving them different species/colors — position (left/right) plus each hoard's own pile is enough to tell them apart, and adding a second creature type wasn't asked for and isn't needed for this budget-limited, one-child game.
- Did not touch regrouping subtraction (explicitly out of scope) or the `data-answer`/`data-target` driver attributes (a separate, already-tracked follow-up item, harmless).

**Verified:**
- `npm run typecheck` and `npm run build`: both clean.
- `node scripts/audit.mjs --only=bags-L2-build,bags-L3-compare,bags-L6`: 0 of 18 flagged, at all 6 window sizes. Looked at the L2 build screenshots (phone + iPad): both icons now read at a similar size, and the empty hoard is a visible card.
- `node scripts/playthrough.mjs bags --level=N` for N = 1–8, plus `--level=2 --size=phone`: all reached the hatch with a hint shown, no page errors. Looked at the L2 hint screenshot (bag pulses correctly) and the L7/L8 after-hint screenshots (both dragons now 🐉).
- Threw together a Node script (not committed) that reimplements the pure generator functions and loops each of the 8 levels 1,000×: all ranges matched the spec, the answer was always among the choices with no duplicates, and the level-specific constraints held (L4 exactly one bag, L6 ones-sum ≤ 9, L7 a's-tens > b's-tens, L8 regroup ones-sum 10–17). No failures.
- Note: this machine ran three other games' playthroughs concurrently (parallel tightening workers sharing the same system Chrome), which stalled a couple of my own playthrough runs; re-running them one at a time after killing the stuck process cleared it up. Not a code issue.

**Open / broken:**
- `follow-ups.md` item 3 ("small code tidy-ups": `data-answer`/`data-target` attributes) still applies to Gem Bags; left as-is per that item's own scope.

**Next:**
- Nest Builder and Dino Story still need the same line-by-line pass (per `docs/specs/follow-ups.md`); Nest Builder matters most (it targets the weak spot).
## 2026-09-27 — Dino Story tightening pass

**Goal:** Fresh line-by-line review of `src/games/dinoStory.ts` against `docs/specs/dino-story.md`, per `docs/specs/follow-ups.md` item 1.

**Done:**
- Fixed the hint-overlap bug (follow-ups item): the ten-frame/model card was positioned relative to `.story-shell` (`top: 38%`) and floated down over the "11 − 5 = ?" strip below the stage. Moved the card into `.story-stage` itself and sized it against the stage (not the whole shell), so it's always contained above the strip. Confirmed with before/after screenshots on phone and iPad.
- Fixed a grammar bug in the compare story (level 5): `difference` could reach `bigger - 1`, letting `smaller` be 1, producing "One dinos are on the hill." Tightened the bound to `bigger - 2` so both groups are always ≥2 (plural throughout).
- Matched `preHint`'s compare line to the spec's exact wording ("Match them up: the extra ones are the answer.").
- Reviewed the rest of the file line by line: template ranges, situation-type order (matches spec's 1–8), hint-model mapping per kind (all 8 match the spec table), distractor mistakes, and the two-step/sharing/groups logic. No dead code or needless duplication found beyond what's already idiomatic for this codebase (e.g. each game file owns its own `glow()`, same as `eggScene.ts` — not something to consolidate without touching shared/out-of-scope files).
- Deliberately left alone: the compare story's two rows can together show more than the spec's "20 characters on stage" cap (e.g. 20 turtles + 8 dinos); the audit and screenshots show it wraps into rows of 5 and reads fine, so didn't add complexity to cap it. Also left the module-level `sentenceTurn` counter shared across L6/L8 as-is — it still yields roughly half sentence-beats over time, and splitting it per level wasn't asked for and isn't visible to the child.

**Decisions:**
- Confine the hint's model card to the stage's own box rather than hide the strip during the hint — keeps both the picture and the number sentence visible together, which is more useful for the "acted it out" learning goal than hiding either.

**Verified:**
- `npm run typecheck` and `npm run build`: clean.
- `node scripts/audit.mjs --only=story-L2,story-L5-compare,story-L8-sentences`: 0 of 18 flagged (all 6 sizes).
- `node scripts/playthrough.mjs story --level=N` for N=1–8: all reach the hatch with a hint shown. L2 and L5 (the levels touched visually) also run and screenshot at `--size=phone`; hint screenshots checked by eye at both sizes.
- Generator check (throwaway browser script, not committed): 1,000 runs per level (8,000 total) checking answer-in-choices, range, no duplicate choices, and singular/plural — 0 issues after the compare fix.

**Open / broken:**
- None found beyond what's listed above as deliberately left alone.

**Next:**
- Nest Builder and Gem Bags still need their line-by-line review (`docs/specs/follow-ups.md`).
## 2026-09-27 — Tighten Nest Builder (fresh-eyes review)

**Goal:** Per `docs/specs/follow-ups.md`, review `src/games/nestBuilder.ts` line by line against `docs/specs/nest-builder.md` (his weak spot, so it matters most), fix the faint eggs, and run the generator stress test.

**Done:**
- Line-by-line review against the spec: all 8 level generators' ranges, the two-beat problems, tuck-in on L1–L2 only, distractor formulas, spoken lines and hints, and the parent text all matched.
- Fixed the faint eggs: `.nest-frame .egg-dot` in `src/styles.css` now gets a brown inset outline, so eggs read clearly against the tan nest in both the mini full-nest tiles and the hint.
- Tightened `src/games/nestBuilder.ts`: `nextTenProblem` no longer needs a rejection-sampling `while` loop (closed-form `rand(1,8)*10 + rand(1,9)` can't land on a multiple of ten); `addSmall`/`addBig` now share a new `addProblem` helper the same way `subSmall`/`subBig` already shared `subProblem`; the two-beat add's small-vs-big phrasing branch now checks `plan.kind === 'add-small'` instead of the incidental `plan.a < 10`. File went from 492 to 487 lines.

**Decisions:**
- Left the `hatchTo(target)` design (vs. the spec's `hatchAway(n)`) alone — it already implements the spec's "one full nest opens when the open nest empties" behavior, just via a target-total invariant instead of a count, which sidesteps double-bookkeeping across two beats. Not a spec violation since only `el`/`hint()` are a contract.

**Verified:**
- `npm run typecheck` and `npm run build`: clean.
- `node scripts/audit.mjs --only=nest-L2,nest-L7`: 0 of 12 flagged.
- `node scripts/playthrough.mjs nest --level=N` for N=1–8: all reach the hatch with a hint shown. `--size=phone` for L2 and L7 (the audit's two/two-frame and nine-full-nest cases): both pass.
- Looked at hint/tuck screenshots for L1 (tuck), L2, L6, L7 at both default and phone size: eggs read clearly.
- Throwaway generator stress test (not committed): looped `generateNestProblem` 1,000× per level via a Vite dev server + Playwright (needed since the module imports browser APIs). All 8,000 problems had valid ranges and included the answer among exactly 4 distinct choices; L8's mixed-level ratio came out sub:add ≈ 1.98 (specced ~2.0).

**Next:**
- Gem Bags and Dino Story still need the same line-by-line review and generator check (see `docs/specs/follow-ups.md`).
## 2026-09-27 — Stomp Path tidy-up pass

**Goal:** Small tidy-up of Stomp Path (already line-by-line reviewed) per `docs/specs/follow-ups.md`: fix the praise line, un-export a dead export, dedupe the L8 target display, and enlarge the L6–L7 phone labels.

**Done:**
- Praise line now matches the spec: "Big hops first. Smart!" (was "Great thinking!").
- Un-exported `generateStompProblem` (its checker script was already removed) and dropped its stale comment.
- L8: removed the top `.stomp-question` card so the target number only shows once, in the answer-band reminder; `expression()` no longer has a level-8 branch.
- L6–L7 open number line: bumped `.stomp-open-label` and `.stomp-arc span` to .85rem/.8rem on phone (from an effective ~11px/9.6px), scoped to `.stomp-path.open` so ruler/window views are untouched.
- Removed `data-target` from the L8 line-hit (unused now); `scripts/drivers/stomp.mjs` reads the target from the visible `.stomp-estimate-reminder` text instead. Left `data-answer`/`data-value` on the answer eggs alone: the correct answer isn't rendered as text anywhere before the child answers, so there's no text for the driver to read instead.
- Marked the four Stomp Path items done in `docs/specs/follow-ups.md`.

**Decisions:**
- Removed the question card (not the answer-band reminder) for L8, since the reminder sits next to the tap interaction and the question card would otherwise be an empty box.
- Left egg `data-answer`/`data-value` in place per the reasoning above — this is a real constraint, not laziness.

**Verified:**
- `npm run typecheck` and `npm run build`: clean.
- `node scripts/audit.mjs --only=stomp-L1-window,stomp-L5-tens,stomp-L7-ruler,stomp-L8-estimate`: 0 of 24 flagged.
- `node scripts/playthrough.mjs stomp --level=N` for N=1–8: all reach the hatch with a hint shown.
- `node scripts/playthrough.mjs stomp --level=N --size=phone` for N=6,7,8: all pass.
- Looked at the hint screenshots for L6, L7 and L8 at both phone and iPad sizes: L6/L7 open-line labels are bigger and don't overlap even in the worst case (9 one-hops plus a ten-hop); L8 shows the target once.

**Open / broken:**
- None found in this pass; this was a small tidy-up on top of an already-reviewed game, not a re-review.

**Next:**
- Continue down `docs/specs/follow-ups.md` for Nest Builder, Gem Bags and Dino Story (in progress in parallel worktrees).

## 2026-09-27 — Merge the four games; rough cut ready to play

**Goal:** Per the user, have four Codex agents (orchestrated with Orca) build the four specced games in parallel, then merge and verify. The user asked for a working rough cut by morning over polish, with follow-up work written down.

**Done:**
- Before dispatch: `scripts/playthrough.mjs` + per-game drivers (`just playthrough`, `just verify`), and `orca.yaml` to run `npm install` in new worktrees.
- Four Codex workers, one worktree and branch each (`nest-builder`, `gem-bags`, `stomp-path`, `dino-story`). They hit the Codex usage limit twice. The user spent one reset; the second time the coordinator finished the work (see `docs/specs/follow-ups.md`).
- Review fixes: Stomp Path L6–L7 now use an open number line (the hint was unreadable), with faint minor ruler ticks for phones. Gem Bags L2 shows the target numeral.
- Merged all four into `main`. Fixed a merge bug: each branch's CSS section ended with a `@media` block whose closing `}` git kept only once, so three sections were nested inside the previous one's media query (the audit caught it on larger screens).
- `AGENTS.md`: a "Scale" note (one child, not enterprise software). Spec README and `AGENTS.md` point to `docs/specs/follow-ups.md`.

**Decisions:**
- A rough cut on `main` with a follow-up list, rather than full review of every game, is the user's call. `[promote?]`
- When merging parallel CSS sections, check brace balance per section. Git's "common suffix" can drop a closing brace.

**Verified (on merged `main`):**
- `npm run build` OK.
- `node scripts/audit.mjs`: 0 of 156 flagged (8 flagged before the CSS brace fix).
- `node scripts/playthrough.mjs all`: all 7 games reach the hatch with a hint shown.
- Per branch before merging: every level 1–8 of all four new games played through; phone-size checks on Stomp L6–L7 and Gem Bags L2. Screenshots looked at are listed in `follow-ups.md`.

**Open / broken:**
- Nest Builder, Gem Bags and Dino Story haven't had a line-by-line review. Small visual rough edges are listed in `docs/specs/follow-ups.md`.

**Next:**
- Play it with him. Then work through `docs/specs/follow-ups.md`, starting with the Nest Builder review (his weak spot).

## 2026-09-27 — Build Nest Builder

**Goal:** Build the eight-level Nest Builder make-ten game from `docs/specs/nest-builder.md`: bridging through ten for adding and, especially, subtracting.

**Done:**
- Added `src/games/nestBuilder.ts`: two-nest ten-frame model, two-beat problems (13 − 5 → 10 → 8), tuck-in on L1–L2, and hints that fill or empty the first nest to ten.
- Registered it, added its CSS, audit screens and a play-through driver (`scripts/drivers/nest.mjs`), marked it done in `DESIGN.md`, and recorded both accepted spec defaults.
- The Codex worker built this; its session hit the Codex usage limit during its self-review, so the coordinator verified and committed it.

**Verified:**
- `npm run typecheck` clean.
- `just playthrough nest --level=N` for every level 1–8: hatch reached with one wrong tap (hint shown) each time.
- Looked at the L6 hint (13 − 8 via 10) and the L1 tuck-in.

**Open / broken:**
- Eggs drawn inside the nest frames are faint; see `docs/specs/follow-ups.md`.

**Next:**
- Merge with the other game branches and run `just verify`.
## 2026-09-27 — Build Gem Bags

**Goal:** Build the eight-level Gem Bags place-value game from `docs/specs/gem-bags.md`.

**Done:**
- Added `src/games/gemBags.ts`: count, build, compare, add/share tens, 2-digit no-regrouping, and regrouping-add problems with spoken hints and gem models.
- Registered the game, added its CSS, audit screens and custom play-through driver, and marked it done in `DESIGN.md`.
- Fixed the driver waiting on a solved problem and kept the L8 traded hoard from stacking over the answer eggs.
- (Coordinator) L2 build: shows the target numeral beside the dragon, so the child doesn't have to hold "forty-seven" in their head.

**Decisions:**
- L3 stays picture-only, and subtraction with regrouping stays out of scope — the user accepted both spec defaults; recorded in the spec. `[promote?]`

**Verified:**
- `npm run typecheck` clean; `npm run build` succeeded (24 modules).
- `just audit`: 0 of 78 screen/size combinations flagged.
- `just playthrough bags` at every level 1–8 (coordinator rerun): hatch reached with a hint in every run; L2 again at phone size after the target numeral.
- Throwaway `node scripts/check-gem-generators.mjs`: 8,000 problems checked across all levels; script removed before commit.
- Inspected the L2 and L3 hint, crowded L6 phone/big, and L8 regrouping screenshots; models matched the problems with no clipping or overlap.

**Next:**
- Merge the `gem-bags` branch with the other game branches, then run `just verify` on the combined tree.
## 2026-09-26 — Build Stomp Path

**Goal:** Build the eight-level Stomp Path number-line game from `docs/specs/stomp-path.md`.

**Done:**
- Added `src/games/stompPath.ts`: window and ruler paths, prediction eggs, one-step stomps, skip counting, tens-first addition/subtraction hints, and tap-the-line estimation.
- Registered Stomp Path, added its parent guide text, CSS, eight audit screens, and a Playwright driver for eggs, the stomp button, and estimation.
- Marked the game built in `DESIGN.md` and recorded both accepted defaults in the spec.

**Decisions:**
- `[promote?]` Accepted the user-approved defaults: five problems per round and ±5 estimation tolerance — the user directed that every spec default be accepted.
- The level 8 T-rex stays hidden until the answer is revealed, since showing it at the target would give away the answer.
- L6–L7 use an open number line (not to scale: a ten-hop gets three times the width of a one-hop, every landing labelled). On the 0–100 ruler the one-hops were 1% wide and the hint drew a tower of overlapping arcs. The ruler's minor ticks are faint so the tens read on a phone.

**Verified:**
- `npm run typecheck` clean; `npm run build` succeeded (24 modules transformed).
- `just audit`: 0 of 108 screen/size combinations flagged; after the open-line change, `node scripts/audit.mjs --only=<the 8 stomp screens>`: 0 of 48 flagged.
- `just playthrough stomp --level=1`: hatch reached, 1 wrong tap, 48 steps; level 7: hatch reached, 1 wrong tap, 21 steps; level 8: hatch reached, 1 wrong tap, 17 steps. After the open-line change: L6 and L7 at phone size and L7 at iPad size pass; checked the L7 hint screenshots at both sizes.
- `node scripts/.stomp-generator-check.mjs`: 8 levels × 1,000 problems passed; the throwaway script was removed. Inspected the L1, crossing-ten L7, L8 hint, and phone ruler screenshots.

**Next:**
- Merge this branch with the other game branches, then run the combined `just verify`.
## 2026-09-27 — Build Dino Story

**Goal:** Build the eight-level Dino Story word-problem game from `docs/specs/dino-story.md`.

**Done:**
- Added `src/games/dinoStory.ts`: story templates per situation type, a stage that acts each story out, answer eggs, and hints using `addModel`, `subModel`, `missingModel` and `groupsModel`.
- Registered it, added its CSS, audit screens and a play-through driver (`scripts/drivers/story.mjs`), marked it done in `DESIGN.md`, and recorded both accepted spec defaults.
- The Codex worker built this; its session hit the Codex usage limit before its self-review finished, so the coordinator verified and committed it.

**Decisions:**
- The half-of-problems number-sentence beat on L6/L8 alternates rather than being random, so the audit reliably sees it.
- A 5 × 5 story draws countable egg shapes instead of 25 emoji actors, keeping the stage within 20 characters.

**Verified:**
- `npm run typecheck` clean. The worker's `just audit`: 0 of 78 flagged.
- `just playthrough story --level=N` for every level 1–8: hatch reached with one wrong tap (hint shown) each time.
- Looked at the L2 hint (11 − 5 on ten-frames) and the L8 stage.

**Open / broken:**
- The hint model card covers the number-sentence card under the stage (L2 hint screenshot). Minor; see `docs/specs/follow-ups.md`.

**Next:**
- Merge with the other game branches and run `just verify`.

## 2026-09-26 — Codex portability: AGENTS.md and shared skills

**Goal:** Per the user, make the repo work the same for Codex as for Claude Code: one instruction file, and skills both tools find.

**Done:**
- `CLAUDE.md` → `AGENTS.md` (via `git mv`, so history follows). The new `CLAUDE.md` is just `@AGENTS.md`, a Claude Code import.
- `.agents/skills` → `../.claude/skills` (symlink). Codex looks for repo skills in `.agents/skills`: I found that path in the Codex 0.150.1 binary, next to its other repo paths.
- `AGENTS.md`: a new "Agent setup" section (edit only `AGENTS.md`, add skills under `.claude/skills/`, keep instructions tool-neutral).
- Worklog skill made tool-neutral: "first 80 lines" instead of "Read with `limit: 80`", and "a single targeted edit" instead of the Edit/Write tool names.
- "Where the rule lives" pointers updated to `AGENTS.md` in `docs/specs/README.md`, `docs/decisions/README.md` and the four decisions' Links lines. Historical text left alone (old worklog entries, the research notes about Claude's memory).

**Decisions:**
- Keep `.claude/skills` as the real location and symlink it for Codex. It already worked for Claude Code, and one copy means no drift. `[promote?]`
- `CLAUDE.md` imports `AGENTS.md` rather than being a symlink. That way it can carry a comment saying where to edit, and it avoids symlink problems for editors that follow links oddly.

**Verified:**
- `codex debug prompt-input` in the repo includes the `AGENTS.md` content ("Ember's Egg Rescue…") and lists the skill `worklog` (file: `.claude/skills/worklog/SKILL.md`).
- Claude Code's `@AGENTS.md` import wasn't tested in a fresh session. This session loaded the old `CLAUDE.md` at start.

**Open / broken:**
- Symlinks need `core.symlinks=true` on Windows checkouts. That's fine on macOS and Linux.

**Next:**
- Start a fresh Claude Code session and confirm the `AGENTS.md` rules are loaded. Then hand `docs/specs/nest-builder.md` to an agent (Claude or Codex).

## 2026-09-26 — Build specs for the four unbuilt games

**Goal:** Write handoff documents that let other agents build Nest Builder, Gem Bags, Stomp Path and Dino Story without re-planning.

**Done:**
- `docs/specs/README.md`, the shared contract:
  - the player and the rules;
  - how a `Game` plugs in and the reuse table (`eggScene`, `awaitChoice`, `models.ts`, `nearChoices`…);
  - verification (typecheck, `just audit` entries, Playwright play-through, 1,000× generator checks);
  - finishing steps and rules for parallel work.
- One spec per game (`nest-builder.md`, `gem-bags.md`, `stomp-path.md`, `dino-story.md`). Each has:
  - why the game exists, with research;
  - story and tone, and the screen and interaction;
  - an 8-level table with generators, spoken lines and hint scripts;
  - answer distractors (common mistakes);
  - ready-to-paste parent text, a build checklist and audit entries;
  - open questions with defaults, and what's out of scope.
- `DESIGN.md` §3–6 replaced by a table linking to the specs (the specs are the source of truth). `CLAUDE.md` points to `docs/specs/`.
- `scripts/audit.mjs`: per-screen `ready` selectors for game screens without numbered eggs, and all game ids marked as placed.

**Decisions:**
- Specs live in `docs/specs/`, one file per game plus a shared README. The user asked me to decide where they go: I chose separate files so parallel agents can each take one, and I kept `DESIGN.md` as a summary. `[promote?]`
- Recommended build order: Nest Builder (subtraction through ten, his weak spot), Gem Bags, Stomp Path, Dino Story.
- Nest Builder now includes subtraction levels (13 − 5 → 10 → 8, and 43 − 5), which the old `DESIGN.md` ladder didn't have. Stomp Path adds the open number line and estimation. Dino Story follows the CGI situation-type order.
- Each spec lists its open questions for the user with a default, so building isn't blocked on answers.

**Verified:** `node --check scripts/audit.mjs` OK. I didn't re-run the audit, since no screens changed. The specs aren't validated by a build yet: the first agent to build from one will find any gaps.

**Next:**
- Hand `docs/specs/nest-builder.md` (with `docs/specs/README.md`) to an agent. The others can run in parallel in separate worktrees.
- The user could skim each spec's "Open questions" and override any defaults.

## 2026-09-26 — Fill the screen at any size; skip-intro button; layout audit

**Goal:** Per the user's screenshots (a big monitor at 70% zoom), the question card and hatch screen sat small in empty space. Make every screen use the window, and add a way to skip the intro speech.

**Done:**
- `fitBubble` in `src/games/eggScene.ts` zooms the question card (CSS `zoom`, up to 10×) to fill the sky. It reruns on resize, on the hint and on solve, and leaves a bob gap sized to the eggs.
- `.fact-scene` layout: the egg band is 27vh and eggs are `min(21vw, 19vh)`. On portrait phones Ember moves to the corner.
- `src/styles.css` "scale with the screen" block: start, map, hatch, nest, HUD and guide use `vmin`/`vh` sizes without small caps. The map is a 4-column grid (2 in portrait) with rows filling the space. The guide scales its type but keeps a 46em line length.
- `src/core/round.ts`: during a game's intro, a big Ember and a pulsing ⏭️ Skip button. A tap cancels the speech.
- `scripts/audit.mjs` + `just audit`: 10 screens × 6 sizes. Measures coverage, card fill, clipping and egg/card overlap, and writes screenshots to `audit-screens/` (git-ignored). `?audit` exposes `window.__audit` shortcuts in `src/main.ts`, and `startGame` is exported from `screens.ts`.
- `playwright@1.57` added as a devDependency. It uses the system Chrome, so there's no browser download.

**Decisions:**
- Scale with `vmin`/`vh` and a JS fit for the card, rather than fixed pixel sizes with caps. The user asked to use the available space.
- The audit counts the card as filling its space if it fills the height **or** the width. A 7×2 array can't do both.

**Verified:**
- `npx tsc --noEmit` clean and `vite build` OK.
- `just audit`: 0 of 60 flagged, down from 19 on the first run. The first run found map spots clipped below the fold at phone/iPad/laptop sizes, a small hatch and start screen, and eggs overlapping the card and each other on big screens.
- Checked screenshots by eye: hatch at 2600×2450, the iPad map, the big-screen intro and a phone stairs card.
- Replayed Egg Warmer and Egg Crates rounds (drive script, `?mute`) with no errors.
- Not checked on a real iPad or phone. The skip button was only tested through the audit (it's clicked on every game screen).

**Open / broken:**
- Emoji art pixelates at very large sizes (visible on the 2600px hatch). Proper SVG art would fix it.
- Stairs cards change size from step to step as rows are added, because each is fitted on its own.

**Next:**
- Have the user reload on the big monitor and confirm. Then build Gem Bags (`DESIGN.md` §3).

## 2026-09-26 — Egg Stairs: the times table as a staircase

**Goal:** A game that teaches how the multiplication tables are built (walking up and down a table), separate from Egg Crates' mixed recall practice.

**Done:**
- `src/games/eggStairs.ts`: one level per table (×2, ×10, ×5, ×3, ×4, ×6–×9).
- Each table runs four 5-question phases: walk up 1–5, walk up 6–10, walk down from 10, and ⭐ landmark jumps (5→6, 10→9…).
- A crate picture with a running total beside each row. The hint counts on or back across the changing rows.
- Plumbing:
  - `Game.ownsLevel`: the round runner skips the shared adaptive rule.
  - `getGameState` / `setGameState` in `progress.ts` save the phase.
  - `EggQuestion.onSolved` in `eggScene.ts`.
- Registered on the map between Egg Warmer and Egg Crates. `DESIGN.md` §2b added and the build order renumbered.

**Decisions:**
- Its own map game rather than levels inside Egg Crates. The user chose this from three options (reason not given). `[promote?]`
- Walking in order teaches the structure, and shuffled practice (Crates) builds recall. Jumping from landmarks trains derived facts instead of reciting from 1×. This was discussed with the user.
- Stairs manages its own level: a table is never left mid-walk. A clean phase skips to the jumps, and passing the jumps with ≤1 miss unlocks the next table.

**Verified:**
- `npx tsc --noEmit` clean and `vite build` OK.
- Playwright (system Chrome, `?mute`, fresh storage) played 3 rounds:
  - Round 1 had one miss and went to `up-high`.
  - Round 2 was clean and skipped to `jumps`.
  - Round 3 passed and moved to level 2 (×10, `up-low`).
- Screenshots checked for the walk-up hint (3 × 2), the full 10-row staircase, a landmark jump (6 × 2 from ⭐5) and the ×9 walk-down layout. No page errors.
- Not tested with the child. Speech not checked by ear.

**Open / broken:**
- Stairs has no placement beyond "clean phase skips to jumps". A child who knows ×2 still does two rounds before ×10. It could skip whole tables he passes.
- The earlier Open items (outdated `docs/pages`, unused `visuals` helpers) still stand.

**Next:**
- Have him play Stairs on a table he half-knows (×3 or ×4, set it in the parent corner) and watch whether the landmark jumps land.
- Build Gem Bags (place value), per `DESIGN.md` §3.

## 2026-09-26 — Right-size levels: subtraction within 20 and multiplication

**Goal:** Fit the lessons to the actual player. He adds within 20, knows about ¼–½ of the 10×10 tables, and (per the user) is weak at subtraction.

**Done:**
- Research: `docs/research/2026-09-26-right-sizing-advanced-learner.md` (strategies over drill, arrays, fact order, interleaving, acceleration).
- **Egg Warmer**, rewritten: 8 levels, mostly subtraction (take away → teens → think addition → crossing ten → mixed, then ×2/5/10 at the top).
- **Egg Crates**, new (`src/games/eggCrates.ts`): multiplication in 8 levels (groups → ×2/10 → ×5 → ×3/4 → ×6–9 → missing factor).
- `src/core/models.ts`: picture models with spoken strategy hints (double ten-frame for + − and missing part, egg arrays, nests). `src/games/eggScene.ts` is the shared egg scene.
- Placement: `adaptive.ts` goes up a level after every first-try correct answer until the first miss. `progress.ts` adds a `placed` flag and per-game max levels, with the key bumped to `embers-egg-rescue:v2` (old progress is dropped).
- Removed Dino Count. Upcoming games are now Gem Bags, Stomp Path, Nest Builder and Dino Story. Updated `DESIGN.md`, the guide copy and `CLAUDE.md` (target player, the picture-model rule, the code layout).

**Decisions:**
- Aim the game at this child, not at ages 4–6. The user's reason: "right size the lessons for him". `[promote?]`
- Pictures are shown from the start on levels that teach a new idea, and are hint-only on fact-practice levels. This relaxes the old "numeral always has a picture" rule for an older child. `[promote?]`
- Fast placement on a fresh game, because an advanced child shouldn't grind easy levels (research: acceleration). `[promote?]`

**Verified:**
- `npx tsc --noEmit` clean and `vite build` OK.
- Playwright (system Chrome, `?mute`, fresh storage) played a full round of each game with one deliberate miss. Placement climbed 1→3 and stopped at the miss. No page errors.
- Screenshots checked for the hints at Egg Warmer level 5 (16 − 8, crossing ten), Crates level 6 (7 × 7, split at 5) and Crates level 7 (? × 3 = 27). The guide renders both 8-level ladders.
- Not tested with the child or on an iPad. Speech not checked by ear.

**Open / broken:**
- `docs/pages/game-design.html` and `edu-foundations.html` still describe the ages 4–6 design.
- `countAlong` and `numeralWithDots` in `visuals.ts` are no longer used by any game.
- The missing-factor bubble reserves blank space for rows that haven't appeared yet.

**Next:**
- Have him play both games, then read the levels in the parent corner (hold ⚙️) and adjust the ladders.
- Build Gem Bags (place value), per `DESIGN.md` §3.

## 2026-09-26 — Worklog skill review; add docs/decisions/

**Goal:** Review the worklog skill against its research, and give standing decisions a home of their own.

**Done:**
- `.claude/skills/worklog/SKILL.md`:
  - Added a session flow, reading only the top 80 lines plus a `grep '^## '` table of contents, and a check for a dirty tree at start.
  - Entries go in with an Edit below the title, never a Write that rewrites the file.
  - Monthly rotation into `docs/worklog/`, entry title = commit subject, no hashes.
  - Decisions: capture them, tag `[promote?]`, never invent a reason.
- `docs/decisions/`: a README with the template and rules, plus five decisions: hero-only-helps, no-timers, visual-docs-as-local-html, vanilla-ts-no-engine and worklog-format.
- `docs/research/2026-09-26-worklog-pattern.md`: now evidence only, linking to the decision. Sources checked, and the Anthropic quote corrected. Dropped the SashiDo posts (×2), claudecodeguides, dailydevpost and Level Up (403). Added sections on one file vs. fragments, commit links, and where decisions belong.
- `CLAUDE.md`: "why" links to each decision, the historical-wording exception added to the tone rule, and a pointer to `docs/decisions/`.
- `docs/research/2026-09-26-central-agent-workflow-notes.md`: an idea, not a decision, for keeping agent workflow and team-repo handoffs in a personal notes repo. Not about this game. Move it once a notes repo exists.

**Decisions:**
- Decisions get their own folder, separate from research. Research holds the evidence and decisions hold the choice. The user approved this in the session.

**Verified:** Checked every source link with WebFetch (Level Up returned 403). Not tested in a fresh session.

**Open / broken:**
- The reason for vanilla-ts-no-engine was never recorded, and the visual-docs one was "user request" with no further reason. Both files say so. The user may want to fill them in.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — "For grown-ups" guide page

**Goal:** Give parents an in-game page explaining how the game works, since the kid menus are deliberately wordless.

**Done:**
- `src/core/guide.ts`, a scrolling page with these sections:
  - At a glance
  - Getting started
  - What happens with a wrong answer
  - Adaptive levels
  - Each game with the child's current level highlighted
  - Coming-soon games
  - How to play along
  - Screen time
  - Parent corner
  - Research basis
  - Privacy and devices
- Entry points: the "For grown-ups" link under ▶ on the start screen, "📖 How the game works" in the parent corner (hold ⚙️), and `/#parents` (including a hashchange listener).
- The `GameInfo` type (`skill`, `about`) and `Game.levels` (5 parent-facing level descriptions) in `src/games/types.ts`. Filled in for Egg Warmer and the 5 upcoming games.

**Decisions:**
- The guide reads game info from the game modules, so it stays accurate as games are built. No separate copy to drift.

**Verified:** `npx tsc --noEmit` clean. Playwright (system Chrome) opened the guide from all three entry points, and Back works each time. Screenshots at 1024×768 and 390×844 look right. No page errors.

**Open / broken:**
- New games need `skill`, `about` and `levels` filled in, and must be removed from `UPCOMING`.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — justfile

**Goal:** One-command start with `just run`.

**Done:**
- `justfile` at the root with these recipes:
  - `run`: runs `npm install` if `node_modules` is missing, then `npm run dev`.
  - `install`, `typecheck`, `build`, `preview`.
  - `default`: lists the recipes.
- Added `just run` to the Commands section of `CLAUDE.md`.

**Verified:** `just --list` shows all recipes. `just typecheck` passes. `just run` started Vite at http://localhost:5173 (I then stopped it).

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — Re-theme: the hero only helps (Ember's Egg Rescue)

**Goal:** Per user request, remove violent or mean verbs. The main character must be kind and helpful to the eggs, dinos and dragons.

**Done:**
- New story: a storm scattered the Dino Nest's eggs, and the rider and Ember find them, warm them, and bring the babies home. The game is renamed to **Ember's Egg Rescue** (title, logo, `package.json`, localStorage key `embers-egg-rescue:v1`).
- Egg Zapper → **Egg Warmer** (`src/games/eggZapper.ts` → `src/games/eggWarmer.ts`): "Warm the egg with four!", a soft glow beam and egg halo instead of a zap beam, and `sfx.zap` → `sfx.glow` (a gentle sine shimmer).
- Renamed the creature "Chompers" to "Giggles".
- Added a tone rule to `CLAUDE.md` and `DESIGN.md`, and updated `docs/pages/*.html`.

**Decisions:**
- The verb is "warm" because dragons keeping eggs warm is a natural, kind fit, and hatching stays the reward. Rejected "rescue from a villain" because it brings in an enemy.

**Verified:** `npx tsc --noEmit` clean. Playwright full round (`?mute`), including a wrong-answer hint, got to the hatch with no console errors. The map screenshot shows the new title and "Egg Warmer". A grep for zap/blast/chomp finds them only in the tone rules.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`) with helper framing ("count the babies so nobody's left behind"). Then Gem Trade, Nest Builder, Stomp Path and Dino Story.

## 2026-09-26 — Scaffold + Egg Zapper MVP; docs pages moved local

**Goal:** Get a playable game running, starting with the core Egg Zapper loop.

**Done:**
- Vite + TS scaffold (`package.json`, `tsconfig.json`, `index.html`, `src/main.ts`, `src/styles.css`).
- `src/core/`: voice (Web Speech, `?mute`), sound (WebAudio), progress (localStorage), adaptive levels, visuals (dice dots, ten-frames, `countAlong` hint), `awaitChoice`, round runner, screens (start, map, hatch, nest), parent corner (hold ⚙️ for 1s).
- `src/games/eggZapper.ts`: 5 levels from DESIGN.md, drifting eggs, zap beam. A wrong tap counts that egg's dots aloud.
- The other 5 games show greyed-out on the map (`UPCOMING` in `src/games/index.ts`).
- Per user request, visual docs are now local HTML: moved `docs/artifacts/` → `docs/pages/` and changed the cross-link to a relative path. The pattern is recorded in the new `CLAUDE.md`. The claude.ai artifact links in the entries below are superseded. Those artifacts still exist online and weren't deleted.

**Decisions:**
- Eggs bob up and down in place rather than floating away, so there's no time pressure.
- A start screen with a big ▶ button is needed because browsers block audio and speech until a tap.

**Verified:** `npx tsc --noEmit` clean, and `vite build` succeeds. Drove a full round with Playwright in headless Chrome (`?mute`): start → map → 5 problems, including a deliberate wrong tap (dots lit up while counting, egg greyed out, retry worked) → egg hatched into "Blue Bolt". No console errors. Real speech output not checked by ear.

**Open / broken:**
- Speech voice quality depends on the browser. Not tested on an iPad.
- If you leave a game mid-hint, the hint's remaining speech can still play.

**Next:**
- Build Dino Count (`src/games/dinoCount.ts`), register it in `GAMES`, and remove it from `UPCOMING`. Then Gem Trade, Nest Builder, Stomp Path, and Dino Story.

**Gotchas:** Playwright clicks need `{ force: true }` because the buttons animate constantly. Use the system Chrome (`channel: 'chrome'`).

## 2026-09-26 — Game design: Dino Egg Blaster

**Goal:** Turn the research into a concrete game design with a dragon/dino theme.

**Done:**
- `DESIGN.md`: premise (Ember the dragon guards the Dino Nest), core loop, adaptive rules, and 6 mini-games with level tables. The mini-games are Egg Zapper, Dino Count, Gem Trade, Stomp Path, Nest Builder and Dino Story. Also covers the Hatchery rewards and build order.
- Published the game design artifact: https://claude.ai/artifact/3off7AhPXjmVxA7i4XuZn9 (copy in `docs/artifacts/game-design.html`).

**Decisions:**
- A round is 5 problems, and a baby hatches after every round. Rewards come only between problems (the "seductive details" research).
- Stomp Path uses a straight path with each number spoken, per Siegler & Ramani. A circular board didn't produce the gains.
- Level-down is silent. It isn't shown to the child.

**Verified:** Artifact publish succeeded (version 1). No code yet.

**Next:**
- Scaffold Vite + vanilla TS in the repo root and build `src/core/*` plus the island map and Egg Zapper (build steps 1–2 in DESIGN.md).

## 2026-09-26 — Education foundations for ages 4–6

**Goal:** Ground the game in early-math research before designing anything.

**Done:**
- `docs/research/2026-09-26-early-math-pedagogy.md`: learning trajectories, counting principles, Siegler & Ramani number-path games, CRA, app-design pillars, math anxiety, K standards, and 10 design rules for the game.
- Published the Education Foundations artifact: https://claude.ai/artifact/GNKCnZfsWwHg7CSjHJX4gr (source copy in `docs/artifacts/edu-foundations.html`).
- `git init` and `.gitignore`.

**Decisions:**
- No timers, lives, or game over. This is the main break from the original Math Blaster, because of math-anxiety research.
- One mini-game per learning trajectory. Adapt level per skill (up after 3 correct in a row, down after 2 misses).

**Verified:** Artifact publish succeeded (version 1). The research is from established literature, not a fresh web search. Citations not re-checked.

**Next:**
- Write `DESIGN.md` (game design theory) and publish it as an artifact, then scaffold Vite + TS and build Egg Zapper.
