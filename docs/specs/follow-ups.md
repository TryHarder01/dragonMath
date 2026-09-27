# Follow-ups after the first build of the four games

All four games (Nest Builder, Gem Bags, Stomp Path, Dino Story) are built and merged, and `just verify` checks them. This is a **rough cut**: each game plays end to end on every level, but it hasn't all been reviewed to the same depth. This list is what's known to be rough, ordered by what a child would notice first. Each item is small and independent, so hand them out one at a time.

## What was and wasn't reviewed

| Game | Built by | Line-by-line review of the game file | Play-through (all 8 levels) | Screenshots looked at |
|---|---|---|---|---|
| Stomp Path | Codex, finished its self-review | Yes (coordinator), fixes applied | Yes; L6–L7 also at phone size | L1, L5 phone, L6–L7 hints (phone + iPad), L8 hint |
| Gem Bags | Codex, self-review mostly done | No, only spot checks | Yes; L2 also at phone size | L2 build + hint, L7 hint |
| Nest Builder | Codex, stopped mid self-review | No | Yes | L1 tuck-in, L6 hint |
| Dino Story | Codex, stopped mid self-review | No | Yes | L2 hint, L8 stage |

The Codex workers ran out of usage partway through their self-review pass, so the coordinator finished, verified and committed three of the games.

**1. Review Nest Builder, Gem Bags and Dino Story line by line** against their specs and the "Scale" note in `AGENTS.md`: code that reads like `eggCrates.ts`, no dead code, spoken lines and hints as the spec says. Nest Builder matters most, because it targets his weak spot (subtracting through ten).

**2. Generator checks.** The specs ask for each level's generator to be looped 1,000× to check ranges and that the answer is always one of the choices. Stomp Path and Gem Bags did this in throwaway scripts. Nest Builder and Dino Story didn't record it. A small shared `scripts/check-generators.mjs` would cover all games.

## Things a child would notice

- **Nest Builder:** the eggs drawn inside the nest frames are faint (pale yellow on tan). Make them read as eggs at a glance, especially in the hint.
- **Dino Story:** during the hint, the ten-frame model card covers the "11 − 5 = ?" number-sentence card under the stage (see a `story-L2` hint screenshot). Keep both visible, or hide the sentence during the hint on purpose.
- **Gem Bags L2 (build 47):** the single-gem source button's icon is tiny next to the bag, and the empty hoard is just a thin white strip until something is added. Make the gem button's icon as big as the bag's, and give the empty hoard some size.
- **Gem Bags L7–L8:** the friend dragon is the 🐲 emoji face, which looks fierce at big sizes. The tone rule says every creature is a friend, so pick a friendlier look.
- ~~**Stomp Path L6–L7 on a phone:** the open-line labels are small (about 11px). They're readable, but could be bigger now that the line has room.~~ Done: bumped to .85rem/.8rem for the open-line labels and hop labels on phone; checked for overlaps at both phone and iPad sizes on L6 and L7.
- ~~**Stomp Path L8:** the target number shows twice, in the question card and again in the answer band. One is enough.~~ Done: the question card is no longer shown on L8; the answer-band reminder is the only display.

## Small code tidy-ups

- ~~`stompPath.ts` exports `generateStompProblem` for a checker script that was later removed. Either add the shared generator check (item 2) or un-export it.~~ Done: un-exported.
- The Stomp Path and Gem Bags eggs and scenes carry `data-answer` / `data-target` attributes that exist only for the play-through drivers. They're harmless, but a driver could read the question instead. Stomp Path done: `data-target` removed from the L8 line-hit; `scripts/drivers/stomp.mjs` now reads the target from the on-screen `.stomp-estimate-reminder` text. `data-answer` on the answer eggs is left in place — the correct answer isn't shown as text anywhere before the child answers, so there's no text for a driver to read instead. Gem Bags' attributes are unchanged (out of scope here).
- ~~Stomp Path's praise says "Big hops first. Great thinking!", while the spec says "Big hops first. Smart!".~~ Done: now says "Big hops first. Smart!".

## Running it on a phone

This is for one child, possibly on a phone:
- `npm run build` produces a static `dist/` that any static host can serve (GitHub Pages, Netlify, Cloudflare Pages). A `just deploy` recipe could wrap whichever one is chosen.
- A web app manifest and icon would let "Add to Home Screen" open it full screen like an app.
- Progress is saved in the browser's local storage, per device. Clearing site data resets it.
- Speech uses the device's own voices, so check it sounds right on the phone that will run it.

## Process notes for the next multi-agent build

- Put the quality bar and the project's scale in the first task spec. Sent mid-run, they reached the workers late.
- Four Codex workers at high effort use up a 5-hour Codex usage window in about 35 minutes. Run two at a time, or plan for a coordinator finish.
- Orca won't accept a nudge to a worker stalled at the usage limit. Use `worker-stop`, then `worker-start --retry-of … --worktree <same>` and tell the new session the old work is on disk. See the coordinator's memory notes for the Codex startup prompts (hooks review, update).
