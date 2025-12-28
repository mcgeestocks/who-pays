import type { Point } from "../../geometryTypes";

export function getCanvasPoint(
  canvas: HTMLCanvasElement,
  event: PointerEvent
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
