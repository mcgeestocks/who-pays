import type { PointerTrackerState } from "./PointerTrackerState";

export function resetTracker(state: PointerTrackerState) {
  state.pointerToCircle.clear();
  state.circleToPointer.clear();
}
