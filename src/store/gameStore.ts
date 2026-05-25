import { create } from "zustand";

export type GamePhase = "menu" | "playing" | "gameover";

export interface PlayerState {
  level: number;
  volume: number;
  threshold: number;
  x: number;
  z: number;
}

export interface GameStore extends PlayerState {
  phase: GamePhase;
  startTime: number;
  elapsed: number;
  result: "win" | null;
  start: () => void;
  reset: () => void;
  toMenu: () => void;
  setPlayer: (patch: Partial<PlayerState>) => void;
  addVolume: (v: number) => void;
  levelUp: () => void;
  setElapsed: (t: number) => void;
  win: () => void;
}

export const MAX_LEVEL = 7;

const BASE_THRESHOLD = 20;

function thresholdFor(level: number) {
  return Math.round(BASE_THRESHOLD * Math.pow(1.75, level - 1));
}

export const LEVEL_THRESHOLDS = Array.from({ length: MAX_LEVEL }, (_, i) =>
  thresholdFor(i + 1)
);

export function tornadoRadius(level: number) {
  return 0.9 + (level - 1) * 0.45;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "menu",
  level: 1,
  volume: 0,
  threshold: LEVEL_THRESHOLDS[0],
  x: 0,
  z: 0,
  startTime: 0,
  elapsed: 0,
  result: null,
  start: () =>
    set({
      phase: "playing",
      level: 1,
      volume: 0,
      threshold: LEVEL_THRESHOLDS[0],
      x: 0,
      z: 0,
      startTime: performance.now(),
      elapsed: 0,
      result: null,
    }),
  reset: () => get().start(),
  toMenu: () =>
    set({
      phase: "menu",
      level: 1,
      volume: 0,
      threshold: LEVEL_THRESHOLDS[0],
      x: 0,
      z: 0,
      result: null,
    }),
  setPlayer: (patch) => set((s) => ({ ...s, ...patch })),
  addVolume: (v) => {
    const s = get();
    if (s.phase !== "playing") return;
    const nextVolume = s.volume + v;
    if (nextVolume >= s.threshold && s.level < MAX_LEVEL) {
      const nextLevel = s.level + 1;
      set({
        level: nextLevel,
        volume: 0,
        threshold: LEVEL_THRESHOLDS[nextLevel - 1],
      });
      if (nextLevel >= MAX_LEVEL) {
        set({ phase: "gameover", result: "win" });
      }
    } else {
      set({ volume: nextVolume });
    }
  },
  levelUp: () => {
    const s = get();
    const nextLevel = Math.min(s.level + 1, MAX_LEVEL);
    set({
      level: nextLevel,
      volume: 0,
      threshold: LEVEL_THRESHOLDS[nextLevel - 1],
    });
    if (nextLevel >= MAX_LEVEL) {
      set({ phase: "gameover", result: "win" });
    }
  },
  setElapsed: (t) => set({ elapsed: t }),
  win: () => set({ phase: "gameover", result: "win" }),
}));
