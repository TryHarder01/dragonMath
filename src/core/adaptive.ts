// Adaptive difficulty per mini-game. Level changes are silent.
//
// Placement: on a fresh game, every first-try correct answer moves up a level,
// until the first miss (or the top level). That gets an advanced child to the
// right level within a few problems instead of grinding through easy ones.
// After placement: up after 3 first-try correct answers in a row, down after
// 2 missed problems in a row.

import { getLevel, isPlaced, setLevel, setPlaced, type GameId } from './progress';

export class Adaptive {
  level: number;
  private streak = 0;
  private misses = 0;

  constructor(
    private id: GameId,
    private max: number,
  ) {
    this.level = Math.min(getLevel(id), max);
  }

  record(firstTry: boolean) {
    if (!isPlaced(this.id)) {
      if (firstTry && this.level < this.max) this.level++;
      else setPlaced(this.id);
    } else if (firstTry) {
      this.misses = 0;
      if (++this.streak >= 3 && this.level < this.max) {
        this.level++;
        this.streak = 0;
      }
    } else {
      this.streak = 0;
      if (++this.misses >= 2 && this.level > 1) {
        this.level--;
        this.misses = 0;
      }
    }
    setLevel(this.id, this.level, this.max);
  }
}
