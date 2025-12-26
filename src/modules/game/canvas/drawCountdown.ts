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
  // Draw touch circles
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

  // Draw countdown number in center
  const hasCountdownStarted = state.countdownStartedAt > 0;
  const elapsed = hasCountdownStarted
    ? performance.now() - state.countdownStartedAt
    : 0;
  const remaining = Math.max(0, countdownMs - elapsed);
  const secondsLeft = hasCountdownStarted
    ? Math.ceil(remaining / 1000)
    : fullCountdownSeconds;

  ctx.fillStyle = "#0f172a";
  ctx.font = `bold ${Math.min(size.width, size.height) * 0.3}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(secondsLeft), size.width / 2, size.height / 2);

  // Touch count indicator
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`${state.touches.size} players`, 16, 16);
}
