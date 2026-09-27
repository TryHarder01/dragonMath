// Adaptive difficulty per mini-game: up after 3 first-try correct answers in a
// row, down after 2 missed problems in a row. Level changes are silent.

import { getLevel, setLevel, type GameId } from './progress';

export class Adaptive {
  level: number;
  private streak = 0;
  private misses = 0;

  constructor(private id: GameId) {
    this.level = getLevel(id);
  }

  record(firstTry: boolean) {
    if (firstTry) {
      this.misses = 0;
      if (++this.streak >= 3 && this.level < 5) {
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
    setLevel(this.id, this.level);
  }
}
