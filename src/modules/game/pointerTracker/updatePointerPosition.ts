import type { PointerTrackerState } from "./PointerTrackerState";

export function updatePointerPosition(
  state: PointerTrackerState,
  pointerId: number,
  x: number,
  y: number
) {
  const info = state.pointerToCircle.get(pointerId);
  if (!info) return;
  info.x = x;
  info.y = y;
}
