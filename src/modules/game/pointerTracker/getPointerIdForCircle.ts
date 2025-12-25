import type { PointerTrackerState } from "./PointerTrackerState";

export function getPointerIdForCircle(
  state: PointerTrackerState,
  circleId: number
): number | undefined {
  return state.circleToPointer.get(circleId);
}
