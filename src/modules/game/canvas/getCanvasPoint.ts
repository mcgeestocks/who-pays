type CanvasPoint = {
  x: number;
  y: number;
};

export function getCanvasPoint(
  canvas: HTMLCanvasElement,
  event: PointerEvent
): CanvasPoint {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
