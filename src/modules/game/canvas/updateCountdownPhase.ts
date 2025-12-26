import type { GameRendererOptions, RendererState } from "./types";

type UpdateCountdownPhaseParams = {
  now: number;
  state: RendererState;
  countdownMs: number;
  minPlayers: number;
  fullCountdownSeconds: number;
  onCountdownTick: GameRendererOptions["onCountdownTick"];
};

export function updateCountdownPhase({
  now,
  state,
  countdownMs,
  minPlayers,
  fullCountdownSeconds,
  onCountdownTick,
}: UpdateCountdownPhaseParams): boolean {
  const touchCount = state.touches.size;
  if (touchCount < minPlayers) {
    if (state.countdownStartedAt) {
      state.countdownStartedAt = 0;
      state.lastTickSecond = -1;
      onCountdownTick(fullCountdownSeconds);
    }
    return false;
  }

  if (!state.countdownStartedAt) {
    state.countdownStartedAt = now;
  }

  const elapsed = now - state.countdownStartedAt;
  const remaining = Math.max(0, countdownMs - elapsed);
  const secondsLeft = Math.ceil(remaining / 1000);

  // Fire tick callback when second changes
  if (secondsLeft !== state.lastTickSecond) {
    state.lastTickSecond = secondsLeft;
    onCountdownTick(secondsLeft);
  }

  // Countdown finished
  return elapsed >= countdownMs;
}
