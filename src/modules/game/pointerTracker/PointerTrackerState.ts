import type { PointerInfo } from "./PointerInfo";

export type PointerTrackerState = {
  pointerToCircle: Map<number, PointerInfo>;
  circleToPointer: Map<number, number>;
};
