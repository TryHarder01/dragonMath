# Brief: the layout audit catches content spilling out of the question card

## Goal
`scripts/audit.mjs` flags any visible content that spills outside its screen's main card, or into the answer-egg band, at any window size.

## Why
Retro `docs/retros/2026-09-27-make-ten.md`: the audit reported 0 flags while a phone screenshot clearly showed Make Ten's basket and number bond clipped. The audit measures the card's own box, not what's inside it. Screenshots caught it only because a worker happened to look. It's the runner-up pattern in `docs/retros/README.md`, and it's the kind of bug a child sees.

## Current state (facts to rely on)
- In `scripts/audit.mjs`, `auditScreen()` measures each screen inside one `page.evaluate` (search for `const m = await page.evaluate`). It already computes `clipped` (content outside the window) and `overlap` (an `.egg` covering `.ez-target`). **Extend that measurement.** Don't restructure the job pool, the `?fast` handling or the `SCREENS` table.
- Each entry in `SCREENS` names its main element in `main`. Fact games use `.ez-target`, the question card, which `fitBubble` in `src/games/eggScene.ts` scales with CSS `zoom`. `getBoundingClientRect()` already includes the zoom. Custom scenes use their own `main` (e.g. `.stomp-path`, `.gem-compare`, `.gem-build-hoard`, `.story-stage`). The answer eggs sit in `.ez-eggs` on fact screens.
- A card clips its content where it has `overflow: hidden`, so spilled content can be cut off rather than visibly outside. Measure each element's own box against the card, rather than trusting what's painted.
- The Make Ten version that had the bug isn't available (its branch was deleted when it merged). **To prove the check works, make a known overflow on purpose**, e.g. a temporary rule that makes `.make-ten-bond` twice as wide, or shifts a nest outside its card. Show the audit flag it, then remove the rule.
- Today, `node scripts/audit.mjs` reports 0 of 180 in about 45 s.

## You own
- `scripts/audit.mjs`
- `docs/retros/README.md`: only move this pattern to Fixed once it's done, with your commit
- a game's own section of `src/styles.css`: only for a one-line fix to a real overflow the new check finds (see In scope)
- your `WORKLOG.md` entry, and your retro

## Don't touch
Game code (`src/games/*.ts`), `src/core`, other scripts, the skills, `AGENTS.md`, other sections of `src/styles.css`, and this brief.

## In scope
1. **New flag:** a visible descendant of the screen's `main` element whose box extends more than 2 px outside `main`'s box. "Visible" means it has a size, `visibility` isn't `hidden`, `opacity` is above 0, and it isn't `display: none`. The flag says which element (class names) and by how much, e.g. `spills out of the card: .make-ten-bond (+38px right)`.
2. **New flag:** on screens that have `.ez-eggs`, a visible descendant of `main` that overlaps the band's box by more than 8 px each way. Treat it the same way as the existing egg-covers-card check.
3. **Red then green:** show the audit flagging your deliberate overflow (paste the output), then passing again once the rule is removed.
4. **Run the full audit.** If the new check flags real overflows in today's screens, they're real bugs a child could see:
   - If one is fixed by a one-line change in that game's own CSS section, fix it and say so.
   - Otherwise, list it (screen, size, element) in your worker_done and your worklog, and leave it flagged. Don't hide real problems with exceptions.

   If a flag is a genuine false positive (something meant to sit outside, e.g. a hop arc or the dragon beside a card), exclude it with the narrowest rule in the audit, never in game code. Explain it in a comment and in your worklog.

## Out of scope
- Auditing hint or animation states. Only the first-problem state is audited today. If you think hint states need it, say so in your retro.
- Changing thresholds of the existing checks, or the `SCREENS` list.
- Screenshot diffing, or anything that needs new dependencies.

## Done when
- The deliberate overflow is flagged, with the element and amount.
- `node scripts/audit.mjs` gives 0 flagged, or only real overflows you've listed (with any one-line fixes applied).
- Audit time is still under about a minute.

## Verify
`npm run typecheck`, `just check`, `node scripts/audit.mjs` (twice: red with the deliberate overflow, green without), and `just verify`. Paste the red output and the final summary line into your worklog entry.

## Finish
- Follow the scale and quality bar in `AGENTS.md`: a few focused lines in the existing measurement, like the checks already there, and no options or config.
- Commit on your branch, with "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" at the end of the message. Don't push or merge.
- Write your retro (`docs/retros/2026-09-27-audit-card-overflow.md`, header naming this brief), and pass it as `--report-path`.
- Send `worker_done` once, with the SHA, the diff stat, the red/green outputs, any real overflows found, and "Friction: …".
