// Saved progress: a level per mini-game plus the hatched collection.

export type GameId = 'egg' | 'count' | 'gems' | 'stomp' | 'nest' | 'story';

interface Progress {
  levels: Partial<Record<GameId, number>>;
  hatched: string[];
}

const KEY = 'embers-egg-rescue:v1';

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { levels: {}, hatched: [], ...JSON.parse(raw) };
  } catch {
    /* storage unavailable: play without saving */
  }
  return { levels: {}, hatched: [] };
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

export function setLevel(id: GameId, level: number) {
  state.levels[id] = Math.max(1, Math.min(5, level));
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
  state.hatched = [];
  save();
}
