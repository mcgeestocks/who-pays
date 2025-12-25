import type { PointerTrackerState } from "./PointerTrackerState";

export function releasePointer(
  state: PointerTrackerState,
  pointerId: number
): number | null {
  const info = state.pointerToCircle.get(pointerId);
  if (!info) return null;
  state.pointerToCircle.delete(pointerId);
  state.circleToPointer.delete(info.circleId);
  return info.circleId;
}
