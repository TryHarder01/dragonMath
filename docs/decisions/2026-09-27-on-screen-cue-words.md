# Kid screens may show a few simple words, always with a picture and the voice

- **Date:** 2026-09-27
- **Status:** Decided
- **Decided by:** user
- **Revisit when:** his reading moves on (longer words become fine), or a word on screen confuses him.

## Decision
Kid screens are no longer strictly wordless. Short, simple words may appear **alongside** a picture and the spoken prompt, never instead of them:
- **Every instruction is still spoken** with `prompt()`. Words on screen back up the voice; the game never depends on reading.
- **Favour small, phonics-friendly words:** short regular words (*more, big, hop, ten*) and common sight words. Avoid contractions (*let's, don't*), silent letters and tricky spellings where a plainer word exists, and keep it to one to three words: a cue, not a sentence.
- **Pair each word with a picture** a pre-reader can read (e.g. 💎💎💎 for "more").

The first use is Gem Bags L3, where the same screen asks "which has **more**?" or "which has **fewer**?": a cue card shows "💎💎💎 more?" or "💎 fewer?".

## Why
User's words: Gem Bags "sometimes … is asking for which has more and which has less; there should be text on the screen to help aid that communication, esp. in case the kid or the adult didn't catch the speak()". Then: "kid is starting to pick up simple reading, let's not make [wordless] a hard rule; he has some early phonics lessons already and is learning more … stay away from complex/edge-case reading stuff: contractions, tricky sounds … favour smaller words."

## Rejected
- **Strictly wordless screens (the old rule):** a missed prompt left no way to tell which question was asked, and it ignores that he's starting to read.
- **Sentences on screen:** too hard to read yet, and they'd compete with the voice.
- **Maths symbols (> / <):** not taught at this age.

## Links
- `AGENTS.md` → "Code layout" (the rule) and "How Ember talks" (spoken wording).
- `docs/specs/gem-bags.md` → L3. Follow-up work: `docs/specs/follow-ups.md` → "Early reading".
