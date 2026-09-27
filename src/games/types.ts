import type { GameId } from '../core/progress';

export interface ProblemCtx {
  /** Area the game draws into; cleared before each problem. */
  play: HTMLElement;
  level: number;
}

export interface Game {
  id: GameId;
  name: string;
  icon: string;
  /** One-line spoken intro when the game starts. */
  intro: string;
  /** Run one problem; resolve true if answered right on the first try. */
  runProblem(ctx: ProblemCtx): Promise<boolean>;
  /** Games with their own round shape (Stomp Path) end the round themselves. */
  startRound?(level: number): void;
  isRoundOver?(): boolean;
}
