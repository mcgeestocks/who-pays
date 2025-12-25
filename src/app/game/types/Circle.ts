import type { CircleState } from "./CircleState";

export type Circle = {
  id: number;
  x: number;
  y: number;
  radius: number;
  state: CircleState;
  holdProgress: number; // 0-1, progress toward lock
};
