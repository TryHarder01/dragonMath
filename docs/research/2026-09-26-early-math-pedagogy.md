# Research: how kids aged 4–6 learn math, and what that means for the game

- **Date:** 2026-09-26
- **Status:** Decided. This is the basis for the game design in [`DESIGN.md`](../../DESIGN.md).
- **Source note:** Written from the established literature (see Sources), not from a new literature search. Check any specific figures before quoting them outside this project.
- **Revisit when:** we add grade 1+ content (place value, add/sub within 20), or playtesting shows kids stuck or bored at a level.

## Question

What should a math game for 4–6 year olds teach, in what order, and how should it teach it?

## Decision

Build the game around **learning trajectories**. Each mini-game trains one trajectory. Difficulty moves up and down that trajectory based on how the child is doing, not on their age. Every numeral appears next to a picture of the quantity. All instructions are spoken. There are no timers and no way to lose.

## What the research says

### 1. Early math matters a lot
- Math skills at school entry are the strongest predictor of later school achievement. They predict later reading too (Duncan et al., 2007).
- Kindergarten number sense predicts math achievement through 3rd grade and beyond (Jordan et al., 2009).
- Early math can be taught, and it works: the Building Blocks curriculum produced large gains in randomized trials (Clements & Sarama, 2008).

### 2. Learning trajectories (Clements & Sarama)
Children pass through predictable levels of thinking. Teaching works best one step past where the child already is. The trajectories that matter most at 4–6:

| Trajectory | Rough progression at 4–6 |
|---|---|
| **Subitizing** | Seeing 1–3 at a glance → 1–5 → 6–10 in structured patterns (dice, ten-frames) by seeing parts: "4 and 2 make 6" |
| **Counting** | Saying numbers in order to 10 → counting objects one-to-one → knowing the last number is "how many" → counting out a set ("give me 5") → counting on from a number → counting to 20, then 100 |
| **Comparing** | Matching sets to see which is bigger → comparing by counting → comparing numerals ("7 is more than 5") |
| **Number line / magnitude** | Knowing where numbers sit and how far apart they are. 8 is "a lot more" than 2 but only a little more than 7 |
| **Composing numbers** | Part-whole thinking: 5 is 3 and 2. Number bonds, and making 5 and 10 |
| **Adding & subtracting** | Acting out stories within 5, then within 10: join, take away, compare, missing part |
| **Patterns** (bonus) | Copy, extend, and create AB, AAB, and ABC patterns |

### 3. Counting principles (Gelman & Gallistel, 1978)
Five principles, and a child can know some without the others:
1. **One-to-one:** each object gets exactly one count word.
2. **Stable order:** count words always come in the same order.
3. **Cardinality:** the last word said tells how many there are. *This is the big one at 4.*
4. **Abstraction:** anything can be counted.
5. **Order-irrelevance:** counting objects in any order gives the same total.

A child who counts "1, 2, 3, 4" correctly but answers "how many?" by counting again hasn't got cardinality yet. The game should check for that directly.

### 4. Board games build number sense (Siegler & Ramani, 2008)
Four 15-minute sessions of a *linear* number board game (squares numbered 1–10 in a row) improved low-income preschoolers' counting, number identification, magnitude comparison, and number-line estimates. The gains lasted for weeks. A circular board, or one with colors instead of numbers, did not produce these gains. The key parts are:
- saying the numbers aloud while moving ("5, 6, 7")
- a **straight line** where bigger numbers are farther along

### 5. Concrete → Representational → Abstract (CRA)
From Bruner's enactive → iconic → symbolic. Young children need quantities they can see (and ideally touch) before symbols mean anything to them.
- At 4–6, **show a picture of the quantity next to every numeral**: dots, ten-frames, fingers, or objects.
- **Structured** arrangements such as ten-frames and dice patterns help kids think in 5s and 10s, which leads into place value.

### 6. What makes an app actually educational (Hirsh-Pasek et al., 2015)
Four pillars:
- **Active:** the child thinks and decides, rather than just tapping.
- **Engaged:** little distraction. Flashy rewards that interrupt the task hurt learning ("seductive details").
- **Meaningful:** it connects to the child's world (stories, real objects).
- **Socially interactive:** a parent playing along helps.

### 7. Emotion and pressure
- Math anxiety shows up as early as 1st–2nd grade and is linked to lower achievement (Ramirez, Gunderson, Levine & Beilock, 2013). Adults' anxiety spreads to children (Beilock et al., 2010).
- **Timed drills are a poor fit at this age.** Speed pressure is exactly what the original Math Blaster used, so this is the main thing we change from it.
- Praise effort and strategy ("you counted each one!") rather than being "smart."
- Keep success at around 75–85% through adaptive difficulty. Too easy is boring and too hard is discouraging.

### 8. Practice that sticks
- Short, frequent sessions (5–15 minutes) work better than long ones.
- Spaced and mixed review: come back to easier skills now and then.
- Immediate feedback, and make it informative: after a wrong answer, **show the model**, such as counting the dots together. Don't just buzz.

### 9. Official guidance
- **NAEYC/NCTM joint position (2002, updated 2010):** use play, build on kids' interests, and follow developmental progressions.
- **National Research Council (2009):** *Mathematics Learning in Early Childhood*. Number is the core. Too little math is taught in preschool.
- **IES Practice Guide (Frye et al., 2013):** teach number along a developmental progression, use progress monitoring, and do math every day.
- **Common Core Kindergarten targets:**
  - K.CC: count to 100 by 1s and 10s, count on, write numbers 0–20, count to tell how many, compare numbers 1–10.
  - K.OA: add and subtract within 10 using objects and drawings, decompose numbers up to 10, make 10, fluency within 5.

## What this means for the game

1. **One mini-game per trajectory**, each with levels that follow that trajectory.
2. **Adapt levels per skill.** Go up after 3 correct in a row. Go down after 2 misses.
3. **Always pair numerals with dots, frames, or objects.** At the lowest levels, show the picture only.
4. **Speak every prompt.** Pre-readers can play without an adult reading for them.
5. **No timers, lives, or game over.** Keep the arcade feel from movement and the dragon, not from pressure.
6. **Wrong answers turn into a lesson.** Highlight and count the dots aloud, then let the child try again.
7. **Include a linear number path game** (the Siegler & Ramani result), with numbers said aloud on every move.
8. **Make 5 and 10 with ten-frames** throughout.
9. **Give rewards between rounds,** not during problems. Hatch a collectible dino after a set of problems.
10. **Keep sessions short.** Suggest a break after about 5–8 minutes. Design so a parent can play along.

## Sources
- Clements, D. H., & Sarama, J. (2014). *Learning and Teaching Early Math: The Learning Trajectories Approach* (2nd ed.). Routledge.
- Clements, D. H., & Sarama, J. (2008). Experimental evaluation of the effects of a research-based preschool mathematics curriculum. *American Educational Research Journal*, 45(2).
- Clements, D. H. (1999). Subitizing: What is it? Why teach it? *Teaching Children Mathematics*, 5(7).
- Gelman, R., & Gallistel, C. R. (1978). *The Child's Understanding of Number*. Harvard University Press.
- Siegler, R. S., & Ramani, G. B. (2008). Playing linear numerical board games promotes low-income children's numerical development. *Developmental Science*, 11(5).
- Ramani, G. B., & Siegler, R. S. (2008). Promoting broad and stable improvements in low-income children's numerical knowledge through playing number board games. *Child Development*, 79(2).
- Duncan, G. J., et al. (2007). School readiness and later achievement. *Developmental Psychology*, 43(6).
- Jordan, N. C., Kaplan, D., Ramineni, C., & Locuniak, M. N. (2009). Early math matters. *Developmental Psychology*, 45(3).
- Hirsh-Pasek, K., et al. (2015). Putting education in "educational" apps. *Psychological Science in the Public Interest*, 16(1).
- Ramirez, G., Gunderson, E. A., Levine, S. C., & Beilock, S. L. (2013). Math anxiety, working memory, and math achievement in early elementary school. *Journal of Cognition and Development*, 14(2).
- Beilock, S. L., Gunderson, E. A., Ramirez, G., & Levine, S. C. (2010). Female teachers' math anxiety affects girls' math achievement. *PNAS*, 107(5).
- National Research Council (2009). *Mathematics Learning in Early Childhood: Paths Toward Excellence and Equity*.
- NAEYC & NCTM (2002/2010). *Early Childhood Mathematics: Promoting Good Beginnings*.
- Frye, D., et al. (2013). *Teaching Math to Young Children* (NCEE 2014-4005). IES What Works Clearinghouse.
- Common Core State Standards for Mathematics, Kindergarten (K.CC, K.OA).
