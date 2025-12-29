import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import type { OrientedPoint } from "../modules/geometryTypes";

const DEFAULT_TEXT = "TOUCH TO START";
const TEXT_SEPARATOR = " • ";
const FONT_SIZE = 14;
const LETTER_SPACING = 1;
const PATH_INSET = FONT_SIZE + 4;
const TEXT_COLOR = "#94a3b8";
const ANIMATION_SPEED_PX_PER_SECOND = 30;
const FONT_FAMILY = "system-ui, -apple-system, sans-serif";
const FADE_DURATION_MS = 600;

type MarqueeBorderTextProps = {
  text?: string;
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

type TextTransitionState = {
  activeText: string;
  pendingText: string | null;
  fadeStartTime: number | null;
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
): OrientedPoint {
  const { topLength, rightLength, bottomLength, perimeter } = geometry;

  const wrappedDistance = ((distance % perimeter) + perimeter) % perimeter;

  if (wrappedDistance < topLength) {
    return {
      x: inset + wrappedDistance,
      y: inset,
      angle: 0,
    };
  }

  const afterTop = wrappedDistance - topLength;
  if (afterTop < rightLength) {
    return {
      x: width - inset,
      y: inset + afterTop,
      angle: Math.PI / 2,
    };
  }

  const afterRight = afterTop - rightLength;
  if (afterRight < bottomLength) {
    return {
      x: width - inset - afterRight,
      y: height - inset,
      angle: Math.PI,
    };
  }

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

function getBaseText(text: string): string {
  return `${text}${TEXT_SEPARATOR}`;
}

function drawCharactersAlongPath({
  ctx,
  text,
  metrics,
  offset,
  width,
  height,
  inset,
  geometry,
  opacity,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  metrics: CharacterMetrics;
  offset: number;
  width: number;
  height: number;
  inset: number;
  geometry: PathGeometry;
  opacity: number;
}): void {
  const { perimeter } = geometry;
  const { charWidths, totalWidth } = metrics;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.letterSpacing = `${LETTER_SPACING}px`;
  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const startOffset = -(offset % totalWidth);
  let currentDistance = startOffset;
  let charIndex = 0;

  while (currentDistance < perimeter + totalWidth) {
    const char = text[charIndex % text.length];
    const charWidth = charWidths.get(char) ?? 0;
    const charCenterDistance = currentDistance + charWidth / 2;

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

  ctx.restore();
}

function getFadeProgress(fadeStartTime: number, currentTime: number): number {
  const elapsed = currentTime - fadeStartTime;
  return Math.min(1, Math.max(0, elapsed / FADE_DURATION_MS));
}

export function MarqueeBorderText({
  text = DEFAULT_TEXT,
}: MarqueeBorderTextProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const transitionRef = useRef<TextTransitionState>({
    activeText: text,
    pendingText: null,
    fadeStartTime: null,
  });
  const geometryRef = useRef<PathGeometry | null>(null);
  const metricsRef = useRef<{
    active: CharacterMetrics | null;
    pending: CharacterMetrics | null;
  }>({
    active: null,
    pending: null,
  });
  const requestedTextRef = useRef<string>(text);

  useEffect(() => {
    requestedTextRef.current = text;
  }, [text]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = 0;
    let height = 0;
    let ctx: CanvasRenderingContext2D | null = null;

    const updateMetrics = (): void => {
      if (!ctx) return;
      const { activeText, pendingText } = transitionRef.current;
      metricsRef.current.active = measureCharacterWidths(
        ctx,
        getBaseText(activeText)
      );
      metricsRef.current.pending = pendingText
        ? measureCharacterWidths(ctx, getBaseText(pendingText))
        : null;
    };

    const updateSize = (): void => {
      const rect = container.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);

      if (width <= 0 || height <= 0) return;

      ctx = setupCanvas(canvas, width, height);
      if (!ctx) return;

      geometryRef.current = calculatePathGeometry(width, height, PATH_INSET);
      updateMetrics();
    };

    const tick = (currentTime: number): void => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaSeconds = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      offsetRef.current += deltaSeconds * ANIMATION_SPEED_PX_PER_SECOND;

      const { activeText, pendingText, fadeStartTime } = transitionRef.current;

      const requestedText = requestedTextRef.current;
      if (requestedText !== activeText && requestedText !== pendingText) {
        transitionRef.current.pendingText = requestedText;
        transitionRef.current.fadeStartTime = currentTime;
        if (ctx) {
          metricsRef.current.pending = measureCharacterWidths(
            ctx,
            getBaseText(requestedText)
          );
        }
      }

      const activeMetrics = metricsRef.current.active;
      const pendingMetrics = metricsRef.current.pending;

      if (ctx && geometryRef.current && activeMetrics) {
        ctx.clearRect(0, 0, width, height);

        if (pendingText && pendingMetrics && fadeStartTime !== null) {
          const progress = getFadeProgress(fadeStartTime, currentTime);
          const activeOpacity = 1 - progress;
          const pendingOpacity = progress;

          drawCharactersAlongPath({
            ctx,
            text: getBaseText(activeText),
            metrics: activeMetrics,
            offset: offsetRef.current,
            width,
            height,
            inset: PATH_INSET,
            geometry: geometryRef.current,
            opacity: activeOpacity,
          });

          drawCharactersAlongPath({
            ctx,
            text: getBaseText(pendingText),
            metrics: pendingMetrics,
            offset: offsetRef.current,
            width,
            height,
            inset: PATH_INSET,
            geometry: geometryRef.current,
            opacity: pendingOpacity,
          });

          if (progress >= 1) {
            transitionRef.current.activeText = pendingText;
            transitionRef.current.pendingText = null;
            transitionRef.current.fadeStartTime = null;
            metricsRef.current.active = pendingMetrics;
            metricsRef.current.pending = null;
          }
        } else {
          drawCharactersAlongPath({
            ctx,
            text: getBaseText(activeText),
            metrics: activeMetrics,
            offset: offsetRef.current,
            width,
            height,
            inset: PATH_INSET,
            geometry: geometryRef.current,
            opacity: 1,
          });
        }
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(container);

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

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
