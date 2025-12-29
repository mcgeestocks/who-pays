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
  const gameFontFamily = "system-ui";

  const countdownTextPaddingRatio = 1.35;
  const countdownSizeScale = 0.5;
  const countdownFontWeight = "800";
  const minimumCountdownFontSize = 16;
  const countdownFontSearchSteps = 12;
  const countdownBasePulseScale = 0.05;
  const countdownBaseWhite = 0.65;
  const countdownInstructionText = `Who's Paying?`;
  const countdownInstructionWeight = "600";
  const countdownInstructionMinFontSize = 14;
  const countdownInstructionMaxWidthRatio = 0.8;
  const countdownInstructionMaxHeightRatio = 0.16;
  const countdownInstructionWhite = 0.6;

  // Draw countdown number or waiting instructions first so circles render above it.
  const isWaitingForPlayers = state.phase === "WAITING_FOR_PLAYERS";

  if (isWaitingForPlayers) {
    const instructionMaxWidth = size.width * countdownInstructionMaxWidthRatio;
    const instructionMaxHeight =
      size.height * countdownInstructionMaxHeightRatio;
    const instructionFontSize = getFittingFontSize({
      ctx,
      text: countdownInstructionText,
      maxWidth: instructionMaxWidth,
      maxHeight: instructionMaxHeight,
      minimumFontSize: countdownInstructionMinFontSize,
      fontFamily: gameFontFamily,
      fontWeight: countdownInstructionWeight,
      searchSteps: countdownFontSearchSteps,
    });
    const instructionWhiteChannel = Math.round(255 * countdownInstructionWhite);

    ctx.fillStyle = `rgb(${instructionWhiteChannel}, ${instructionWhiteChannel}, ${instructionWhiteChannel})`;
    ctx.font = `${countdownInstructionWeight} ${instructionFontSize}px ${gameFontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(countdownInstructionText, size.width / 2, size.height / 2);
  } else {
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
      fontWeight: countdownFontWeight,
      searchSteps: countdownFontSearchSteps,
    });

    const countdownVerticalOffset = 0;
    const pulseProgress = (elapsed % 1000) / 1000;
    const basePulse = 0.5 - 0.5 * Math.cos(pulseProgress * Math.PI * 2);
    const pulseScale = 1 + basePulse * countdownBasePulseScale;
    const displayFontSize = countdownFontSize * countdownSizeScale * pulseScale;
    const whiteIntensity = lerp(countdownBaseWhite, 1, basePulse);
    const whiteChannel = Math.round(255 * whiteIntensity);

    ctx.fillStyle = `rgb(${whiteChannel}, ${whiteChannel}, ${whiteChannel})`;
    ctx.font = `${countdownFontWeight} ${displayFontSize}px ${gameFontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      countdownText,
      size.width / 2,
      size.height / 2 - countdownVerticalOffset
    );
  }

  // Draw touch circles above countdown text.
  const touchEntries = Array.from(state.touches.entries());
  const circleRadius = Math.min(size.width, size.height) * touchCircleScale;

  touchEntries.forEach(([, touch], index) => {
    const color = COLORS[index % COLORS.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(touch.x, touch.y, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(touch.x, touch.y, circleRadius + activeRingOffset, 0, Math.PI * 2);
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

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
