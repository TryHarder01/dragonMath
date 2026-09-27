import type { GameId } from '../core/progress';

export interface ProblemCtx {
  /** Area the game draws into; cleared before each problem. */
  play: HTMLElement;
  level: number;
}

/** What the parent guide shows about a mini-game (built or upcoming). */
export interface GameInfo {
  name: string;
  icon: string;
  /** The math skill, in parent-friendly words. */
  skill: string;
  /** What the child does, one or two sentences for a parent. */
  about: string;
}

export interface Game extends GameInfo {
  id: GameId;
  /** Parent-facing description of each level, easiest first. */
  levels: string[];
  /** One-line spoken intro when the game starts. */
  intro: string;
  /** Run one problem; resolve true if answered right on the first try. */
  runProblem(ctx: ProblemCtx): Promise<boolean>;
  /**
   * The game moves its own level (Egg Stairs advances a table only after all
   * its phases), so the round runner skips the shared adaptive rule.
   */
  ownsLevel?: boolean;
  /** Games with their own round shape (Stomp Path) end the round themselves. */
  startRound?(level: number): void;
  isRoundOver?(): boolean;
}
