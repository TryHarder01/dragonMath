// Saved progress: a level per mini-game, whether placement is done, and the
// hatched collection.

export type GameId = 'egg' | 'crates' | 'stairs' | 'bags' | 'stomp' | 'nest' | 'maketen' | 'story';

interface Progress {
  levels: Partial<Record<GameId, number>>;
  /** True once a game's fast placement has ended (first miss or top level). */
  placed: Partial<Record<GameId, boolean>>;
  hatched: string[];
  /** Free-form per-game state (e.g. Egg Stairs' current phase). */
  games: Partial<Record<GameId, unknown>>;
}

// v2: level ladders were re-targeted (facts within 20 and multiplication), so
// old v1 levels no longer mean the same thing.
const KEY = 'embers-egg-rescue:v2';

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { levels: {}, placed: {}, hatched: [], games: {}, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable: play without saving */
  }
  return { levels: {}, placed: {}, hatched: [], games: {} };
}

const state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getLevel(id: GameId): number {
  return state.levels[id] ?? 1;
}

export function setLevel(id: GameId, level: number, max: number) {
  state.levels[id] = Math.max(1, Math.min(max, level));
  save();
}

export function isPlaced(id: GameId): boolean {
  return state.placed[id] ?? false;
}

export function setPlaced(id: GameId, placed = true) {
  state.placed[id] = placed;
  save();
}

export function getGameState<T>(id: GameId): T | undefined {
  return state.games[id] as T | undefined;
}

export function setGameState(id: GameId, value: unknown) {
  state.games[id] = value;
  save();
}

export function hatched(): string[] {
  return state.hatched;
}

export function addHatched(creatureId: string) {
  if (!state.hatched.includes(creatureId)) state.hatched.push(creatureId);
  save();
}

export function resetProgress() {
  state.levels = {};
  state.placed = {};
  state.games = {};
  state.hatched = [];
  save();
}
