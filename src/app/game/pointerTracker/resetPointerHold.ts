import type { PointerTrackerState } from "./PointerTrackerState";

export function resetPointerHold(
  state: PointerTrackerState,
  pointerId: number,
  now: number
) {
  const info = state.pointerToCircle.get(pointerId);
  if (!info) return;
  info.downAt = now;
}
