import { COLORS } from "../../../components/styles/colors";
import type { RendererState } from "./types";

type DrawCountdownParams = {
  ctx: CanvasRenderingContext2D;
  size: { width: number; height: number };
  state: RendererState;
  countdownMs: number;
  fullCountdownSeconds: number;
  touchCircleScale: number;
  activeRingOffset: number;
};

export function drawCountdown({
  ctx,
  size,
  state,
  countdownMs,
  fullCountdownSeconds,
  touchCircleScale,
  activeRingOffset,
}: DrawCountdownParams): void {
  const gameFontFamily = "Badeen Display, system-ui";

  const countdownTextPaddingRatio = 1.35;
  const minimumCountdownFontSize = 16;
  const countdownFontSearchSteps = 12;

  // Draw countdown number first so circles render above it.
  const hasCountdownStarted = state.countdownStartedAt > 0;
  const elapsed = hasCountdownStarted
    ? performance.now() - state.countdownStartedAt
    : 0;
  const remaining = Math.max(0, countdownMs - elapsed);
  const secondsLeft = hasCountdownStarted
    ? Math.ceil(remaining / 1000)
    : fullCountdownSeconds;
  const countdownText = String(secondsLeft);
  const availableWidth = size.width * countdownTextPaddingRatio;
  const availableHeight = size.height * countdownTextPaddingRatio;
  const countdownFontSize = getFittingFontSize({
    ctx,
    text: countdownText,
    maxWidth: availableWidth,
    maxHeight: availableHeight,
    minimumFontSize: minimumCountdownFontSize,
    fontFamily: gameFontFamily,
    fontWeight: "400",
    searchSteps: countdownFontSearchSteps,
  });

  const countdownVerticalOffset = size.height * 0.05;

  ctx.fillStyle = "#0f172a";
  ctx.font = `regular ${countdownFontSize}px ${gameFontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    countdownText,
    size.width / 2,
    size.height / 2 - countdownVerticalOffset
  );

  // Draw touch circles above countdown text.
  const touchEntries = Array.from(state.touches.entries());
  const circleRadius = Math.min(size.width, size.height) * touchCircleScale;

  touchEntries.forEach(([, touch], index) => {
    const color = COLORS[index % COLORS.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(touch.x, touch.y, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Active indicator ring
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(touch.x, touch.y, circleRadius + activeRingOffset, 0, Math.PI * 2);
    ctx.stroke();
  });
}

type FittingFontSizeParams = {
  ctx: CanvasRenderingContext2D;
  text: string;
  maxWidth: number;
  maxHeight: number;
  minimumFontSize: number;
  fontFamily: string;
  fontWeight: string;
  searchSteps: number;
};

function getFittingFontSize({
  ctx,
  text,
  maxWidth,
  maxHeight,
  minimumFontSize,
  fontFamily,
  fontWeight,
  searchSteps,
}: FittingFontSizeParams): number {
  const maxDimension = Math.max(minimumFontSize, Math.min(maxWidth, maxHeight));
  let low = minimumFontSize;
  let high = maxDimension;
  let bestFit = minimumFontSize;

  for (let step = 0; step < searchSteps; step += 1) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `${fontWeight} ${mid}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const textHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || mid;

    if (metrics.width <= maxWidth && textHeight <= maxHeight) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
}
