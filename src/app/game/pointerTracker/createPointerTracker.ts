import type { PointerTrackerState } from "./PointerTrackerState";

export function createPointerTracker(): PointerTrackerState {
  return {
    pointerToCircle: new Map(),
    circleToPointer: new Map(),
  };
}
