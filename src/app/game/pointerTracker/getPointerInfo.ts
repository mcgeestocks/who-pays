import type { PointerTrackerState } from "./PointerTrackerState";
import type { PointerInfo } from "./PointerInfo";

export function getPointerInfo(
  state: PointerTrackerState,
  pointerId: number
): PointerInfo | undefined {
  return state.pointerToCircle.get(pointerId);
}
