import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";

const DEFAULT_TEXT = "TOUCH TO START";
const TEXT_SEPARATOR = " • ";
const FONT_SIZE = 14;
const LETTER_SPACING = 1;
const PATH_INSET = FONT_SIZE + 4;
const TEXT_COLOR = "#94a3b8";
const ANIMATION_SPEED_PX_PER_SECOND = 30;
const FONT_FAMILY = "system-ui, -apple-system, sans-serif";

type MarqueeBorderTextProps = {
  text?: string;
};

type PathPoint = {
  x: number;
  y: number;
  angle: number;
};

type PathGeometry = {
  topLength: number;
  rightLength: number;
  bottomLength: number;
  leftLength: number;
  perimeter: number;
};

type CharacterMetrics = {
  charWidths: Map<string, number>;
  totalWidth: number;
};

function calculatePathGeometry(
  width: number,
  height: number,
  inset: number
): PathGeometry {
  const topLength = width - inset * 2;
  const rightLength = height - inset * 2;
  const bottomLength = width - inset * 2;
  const leftLength = height - inset * 2;
  const perimeter = topLength + rightLength + bottomLength + leftLength;

  return { topLength, rightLength, bottomLength, leftLength, perimeter };
}

function getPointOnPath(
  distance: number,
  width: number,
  height: number,
  inset: number,
  geometry: PathGeometry
): PathPoint {
  const { topLength, rightLength, bottomLength, perimeter } = geometry;

  // Wrap distance to stay within perimeter
  const wrappedDistance = ((distance % perimeter) + perimeter) % perimeter;

  // Top edge: left to right (angle = 0)
  if (wrappedDistance < topLength) {
    return {
      x: inset + wrappedDistance,
      y: inset,
      angle: 0,
    };
  }

  // Right edge: top to bottom (angle = 90°)
  const afterTop = wrappedDistance - topLength;
  if (afterTop < rightLength) {
    return {
      x: width - inset,
      y: inset + afterTop,
      angle: Math.PI / 2,
    };
  }

  // Bottom edge: right to left (angle = 180°)
  const afterRight = afterTop - rightLength;
  if (afterRight < bottomLength) {
    return {
      x: width - inset - afterRight,
      y: height - inset,
      angle: Math.PI,
    };
  }

  // Left edge: bottom to top (angle = 270°)
  const afterBottom = afterRight - bottomLength;
  return {
    x: inset,
    y: height - inset - afterBottom,
    angle: (3 * Math.PI) / 2,
  };
}

function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(dpr, dpr);
  return ctx;
}

function measureCharacterWidths(
  ctx: CanvasRenderingContext2D,
  text: string
): CharacterMetrics {
  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.letterSpacing = `${LETTER_SPACING}px`;

  const charWidths = new Map<string, number>();
  let totalWidth = 0;

  for (const char of text) {
    if (!charWidths.has(char)) {
      const width = ctx.measureText(char).width;
      charWidths.set(char, width);
    }
    totalWidth += charWidths.get(char) ?? 0;
  }

  return { charWidths, totalWidth };
}

function drawCharactersAlongPath(
  ctx: CanvasRenderingContext2D,
  text: string,
  metrics: CharacterMetrics,
  offset: number,
  width: number,
  height: number,
  inset: number,
  geometry: PathGeometry
): void {
  const { perimeter } = geometry;
  const { charWidths, totalWidth } = metrics;

  ctx.clearRect(0, 0, width, height);
  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.letterSpacing = `${LETTER_SPACING}px`;
  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  // Start position based on current offset (negative to create forward motion)
  const startOffset = -(offset % totalWidth);

  // Draw characters one by one along the entire perimeter
  let currentDistance = startOffset;
  let charIndex = 0;

  // Continue drawing until we've covered the entire perimeter plus some buffer
  while (currentDistance < perimeter + totalWidth) {
    const char = text[charIndex % text.length];
    const charWidth = charWidths.get(char) ?? 0;

    // Position character at center of its space
    const charCenterDistance = currentDistance + charWidth / 2;

    // Only draw if the character center is within visible range
    if (
      charCenterDistance >= -charWidth &&
      charCenterDistance <= perimeter + charWidth
    ) {
      const point = getPointOnPath(
        charCenterDistance,
        width,
        height,
        inset,
        geometry
      );

      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate(point.angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    currentDistance += charWidth;
    charIndex++;
  }
}

export function MarqueeBorderText({
  text = DEFAULT_TEXT,
}: MarqueeBorderTextProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const metricsRef = useRef<CharacterMetrics | null>(null);
  const geometryRef = useRef<PathGeometry | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = 0;
    let height = 0;
    let ctx: CanvasRenderingContext2D | null = null;

    const baseText = `${text}${TEXT_SEPARATOR}`;

    const updateSize = (): void => {
      const rect = container.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);

      if (width <= 0 || height <= 0) return;

      ctx = setupCanvas(canvas, width, height);
      if (!ctx) return;

      geometryRef.current = calculatePathGeometry(width, height, PATH_INSET);

      // Measure character widths
      metricsRef.current = measureCharacterWidths(ctx, baseText);
    };

    const tick = (currentTime: number): void => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaSeconds = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      offsetRef.current += deltaSeconds * ANIMATION_SPEED_PX_PER_SECOND;

      // Wrap offset to prevent number growing infinitely
      if (
        metricsRef.current &&
        offsetRef.current > metricsRef.current.totalWidth * 100
      ) {
        offsetRef.current = offsetRef.current % metricsRef.current.totalWidth;
      }

      if (ctx && geometryRef.current && metricsRef.current) {
        drawCharactersAlongPath(
          ctx,
          baseText,
          metricsRef.current,
          offsetRef.current,
          width,
          height,
          PATH_INSET,
          geometryRef.current
        );
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(container);

    // Start animation
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
