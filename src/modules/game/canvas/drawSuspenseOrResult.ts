import { COLORS } from "../../../components/styles/colors";
import type { RendererState } from "./types";
import { withAlpha } from "./withAlpha";

type DrawSuspenseOrResultParams = {
  ctx: CanvasRenderingContext2D;
  size: { width: number; height: number };
  state: RendererState;
  touchCircleScale: number;
  highlightRingOffset: number;
};

export function drawSuspenseOrResult({
  ctx,
  size,
  state,
  touchCircleScale,
  highlightRingOffset,
}: DrawSuspenseOrResultParams): void {
  const gameFontFamily = "system-ui";
  const circleRadius = Math.min(size.width, size.height) * touchCircleScale;
  const touchEntries = Array.from(state.touches.entries());

  // Draw all player circles at their positions
  touchEntries.forEach(([pointerId], index) => {
    const touch = state.touches.get(pointerId);
    if (!touch) return;

    const color = COLORS[index % COLORS.length];
    const isFrozen = touch.frozen;

    // Frozen circles are slightly dimmer
    ctx.fillStyle = isFrozen ? withAlpha(color, 0.7) : color;
    ctx.beginPath();
    ctx.arc(touch.x, touch.y, circleRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw highlight ring on current selection
  const highlightPointerId = state.snapshotOrder[state.currentHighlightIndex];
  const highlightTouch =
    highlightPointerId !== undefined
      ? state.touches.get(highlightPointerId)
      : null;

  if (highlightTouch) {
    const isWinner =
      state.phase === "RESULT" &&
      state.currentHighlightIndex === state.winnerIndex;
    ctx.strokeStyle = isWinner ? "#16a34a" : "#0f172a";
    ctx.lineWidth = isWinner ? 8 : 6;
    ctx.beginPath();
    ctx.arc(
      highlightTouch.x,
      highlightTouch.y,
      circleRadius + highlightRingOffset,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Status text
  ctx.fillStyle = "#0f172a";
  ctx.font = `400 16px ${gameFontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const statusText =
    state.phase === "RESULT"
      ? `Player ${state.winnerIndex + 1} wins!`
      : "Selecting...";
  ctx.fillText(statusText, 16, 16);
}
