import type { Circle } from "./Circle";

export type GameState = {
  playerCount: number;
  lockedCount: number;
  circles?: Circle[];
  layoutWidth?: number;
  layoutHeight?: number;
  hasSignaled?: boolean;
};
