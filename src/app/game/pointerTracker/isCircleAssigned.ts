import type { PointerTrackerState } from "./PointerTrackerState";

export function isCircleAssigned(
  state: PointerTrackerState,
  circleId: number
): boolean {
  return state.circleToPointer.has(circleId);
}
