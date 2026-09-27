# Game specs: build handoffs

**All four are built** (2026-09-27). The specs stay as the source of truth for each game's levels, hints and parent text. Known rough edges and next steps: [follow-ups.md](follow-ups.md).

One file per mini-game. Each spec is meant to be picked up by an agent (or person) with no memory of earlier sessions and built **without re-planning**. Read this README first. It covers what all four games share.

| Spec | Game | Skill | Build order |
|---|---|---|---|
| [nest-builder.md](nest-builder.md) | 🪺 Nest Builder | Make-ten / bridging through ten, add **and subtract** | 1st: targets his weak spot (subtraction through ten) |
| [gem-bags.md](gem-bags.md) | 💎 Gem Bags | Place value: tens and ones to 100 | 2nd |
| [stomp-path.md](stomp-path.md) | 🦖 Stomp Path | Number line 0–100, hops, skip counting, estimation | 3rd |
| [dino-story.md](dino-story.md) | 📖 Dino Story | Word problems | 4th: needs animation, and benefits from the others' models |
| [make-ten.md](make-ten.md) | 🔟 Make Ten | The make-ten strategy step by step: partners of ten, split the number, the whole chain, on to the tens, down to ten | Added 2026-09-27 |

The order is a recommendation, not a dependency. Every spec is independent and can be built in parallel (see "Working in parallel").

## Before you start

1. Read `AGENTS.md` (rules, commands, layout), the top of `WORKLOG.md`, and `DESIGN.md`.
2. Read the research the games are based on:
   - `docs/research/2026-09-26-early-math-pedagogy.md`
   - `docs/research/2026-09-26-right-sizing-advanced-learner.md`
3. Follow `.claude/skills/worklog/SKILL.md`: orient, build, verify, log. **Commit only when the user says so.**

## The player

He adds within 20 confidently. **Subtraction is weak.** He knows about ¼–½ of the 10×10 times tables. He probably can't read sentences yet, so everything is spoken; numerals and number sentences are fine on screen.

## Rules every game must follow (from `AGENTS.md`)

- **Tone: the hero only helps.** The player and Ember warm, find, count, share, tuck in and walk home. Never zap, blast, shoot, fire or chomp, and no enemies. Subtraction is framed kindly: babies hatch and walk home, a dragon shares gems with a friend, dinos fly home on Ember.
- **No timers, lives, scores or game over.** A wrong answer greys out that choice, plays the hint, and the child tries again.
- **Every problem has a picture model.** Show it from the start on levels that teach a new idea. On practice levels it appears as the hint.
- **Speak every instruction with `prompt()`** (the 🔊 button repeats it). Use `say()` for one-off lines. Kid screens stay wordless apart from numerals and number sentences; explanations go in the parent guide.
- **Rewards only between problems.** The round runner handles the hatch.

## How a game plugs in

- **File:** `src/games/<name>.ts`, exporting a `Game` (`src/games/types.ts`). `GameId` already includes `'nest' | 'bags' | 'stomp' | 'story'`.
- **Register it:** add it to `GAMES` in `src/games/index.ts` and **remove its entry from `UPCOMING`**. The map and the parent guide pick it up automatically.
- **Parent text:** `skill`, `about` and `levels` (8 strings, easiest first). Each spec gives ready-to-paste text.
- **Round:** by default 5 problems, each a `runProblem({ play, level })` that resolves `true` if answered right on the first try. The shared adaptive rule (fast placement, then up after 3 right / down after 2 misses) does the rest. Use `ownsLevel` / `startRound` / `isRoundOver` only if the spec says so.
- **Intro:** a one-sentence `intro`. The round runner shows a big Ember with a ⏭️ Skip button while it plays.

### Reuse before you build

| Need | Use |
|---|---|
| Question card + bobbing answer eggs + warm-glow tap + hint on the first miss | `eggScene(play, q: EggQuestion)` in `src/games/eggScene.ts`. `q` has `text`, `ask`, `answer`, `choices`, `model`, `showModel` and an optional `onSolved`. It auto-fits the card to the screen. |
| Two-beat problems (answer a step, then the total) | Call `eggScene` twice in one `runProblem`, with `play.replaceChildren()` between calls. You can reuse and update the same model element. `firstTry` = both beats right the first time. |
| Tap-a-thing answers that aren't eggs (tap a dragon, tap a spot on a line) | `awaitChoice(choices, isRight, { onTap, onRight, onWrong })` in `src/core/choices.ts`. |
| Picture models with spoken strategy hints | `src/core/models.ts`: `addModel(a, b)` and `subModel(a, b)` (double ten-frame), `missingModel(a, c)`, `arrayModel(rows, cols, { hidden })`, `groupsModel(n, k)`. A `Model` is `{ el, hint(): Promise<void> }`, so write new ones in the same shape. |
| Answer choices | `nearChoices(answer, 4, min, max)` in `src/core/dom.ts`, `productChoices(a, b)` in `eggScene.ts`. Specs list extra distractors (common mistakes) to mix in. |
| Numbers as words | `word(n)` (0–20) in `src/core/voice.ts`. Above 20, pass the numeral string to `say` and the voice reads it. |
| Saving game-specific state | `getGameState` / `setGameState` in `src/core/progress.ts`. |
| DOM, random, sparkles | `h`, `rand`, `pick`, `shuffle`, `burst` in `src/core/dom.ts`. `sfx` in `src/core/sound.ts`. |

If you build a custom scene rather than `eggScene`, keep to the same layout contract:
- a `.fact-scene`-style layout: content fills the sky, and answers sit in a band at the bottom sized in `vh`/`vw`;
- sizes that scale with the window (`vmin`/`vh`), with no small fixed maximums;
- tap targets of at least 72px.

`just audit` enforces this.

## Verify (all required, and record what you ran in the worklog)

1. `npm run typecheck` is clean and `npm run build` succeeds.
2. **Layout:** add at least two entries to `SCREENS` in `scripts/audit.mjs`: an easy level and the most crowded level. Use `open: 'play', game: '<id>', level: { <id>: N }`, and set `ready: '<selector>'` if the first problem doesn't show `.egg .numeral`. Then `just audit` must report 0 flagged.
3. **Play-through:** `just playthrough <id> --level=all` (`scripts/playthrough.mjs`, rounds in parallel and in `?fast` mode) drives a full round in the system Chrome and fails unless it reaches the hatch with no page errors and at least one wrong tap (so the hint ran). Games built on `awaitChoice`/`eggScene` work with the default driver (`scripts/drivers/tap.mjs`). If your game has other interactions (build buttons + ✓, a stomp button, tapping a spot on a line, tuck-in), add `scripts/drivers/<id>.mjs` exporting `step(page, ctx)` that does **one** interaction, including a deliberate wrong answer. Keep per-round state on `ctx`, not in module variables (rounds run in parallel), and don't rely on seeing brief states like a hint mid-animation (fast mode can finish them first). Run it on an easy level and on each level with a different interaction, and look at the screenshots of the hint in `playthrough-screens/`.
4. Check every level's problem generator against its constraints: loop each level 1,000× in a quick script and assert the ranges and that the answer is among the choices.
5. Put screenshots of each level in `just audit` or the play-through, and look at them.

## Finish

- Update `DESIGN.md`: mark the game done in the build order and move any real differences from the spec into its section.
- If an open question in the spec was answered by the user, record it in the spec ("Resolved: …").
- Write the worklog entry and report to the user. Tag decisions that constrain future work with `[promote?]`.

## Working in parallel

The games live in separate files, but a few shared files get touched by every game. Keep your edits to these small and at the end:

- `src/games/index.ts`: one import, one `GAMES` entry, one `UPCOMING` removal.
- `src/styles.css`: **append** one section headed `/* ---------- <Game name> ---------- */`. Don't edit other sections. If a shared rule must change, say so in the worklog instead.
- `scripts/audit.mjs`: add your `SCREENS` entries only.
- `scripts/drivers/<id>.mjs`: your own new file, if you need one. Don't change `scripts/playthrough.mjs`; if it can't express your game, say so in the worklog.
- `DESIGN.md`, `WORKLOG.md`: your own section and entry only.
- **Don't change shared core files** (`eggScene.ts`, `models.ts`, `round.ts`, `types.ts`) unless your spec asks for it. New models go in your game file, or in `src/core/models.ts` as **new** exports only.
- Use a separate git worktree or branch per game when several agents run at once.
