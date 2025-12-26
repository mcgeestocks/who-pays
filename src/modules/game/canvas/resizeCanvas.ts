type CanvasSize = {
  width: number;
  height: number;
};

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): CanvasSize {
  const size = getCanvasSize(canvas);
  const dpr = window.devicePixelRatio || 1;
  const width = size.width;
  const height = size.height;

  if (
    canvas.width !== Math.floor(width * dpr) ||
    canvas.height !== Math.floor(height * dpr)
  ) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height };
}

function getCanvasSize(canvas: HTMLCanvasElement): CanvasSize {
  const rect = canvas.getBoundingClientRect();
  return {
    width: Math.max(1, Math.floor(rect.width)),
    height: Math.max(1, Math.floor(rect.height)),
  };
}
