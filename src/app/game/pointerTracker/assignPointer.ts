import type { PointerTrackerState } from "./PointerTrackerState";

export function assignPointer(
  state: PointerTrackerState,
  pointerId: number,
  circleId: number,
  x: number,
  y: number,
  now: number
): boolean {
  if (state.pointerToCircle.has(pointerId)) return false;
  if (state.circleToPointer.has(circleId)) return false;
  state.pointerToCircle.set(pointerId, { circleId, x, y, downAt: now });
  state.circleToPointer.set(circleId, pointerId);
  return true;
}
