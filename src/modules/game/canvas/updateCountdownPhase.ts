import type { GameRendererOptions, RendererState } from "./types";

type UpdateCountdownPhaseParams = {
  now: number;
  state: RendererState;
  countdownMs: number;
  minPlayers: number;
  fullCountdownSeconds: number;
  onPhaseChange: GameRendererOptions["onPhaseChange"];
  onCountdownTick: GameRendererOptions["onCountdownTick"];
};

export function updateCountdownPhase({
  now,
  state,
  countdownMs,
  minPlayers,
  fullCountdownSeconds,
  onPhaseChange,
  onCountdownTick,
}: UpdateCountdownPhaseParams): boolean {
  const touchCount = state.touches.size;
  if (touchCount < minPlayers) {
    const shouldResetCountdown =
      state.phase !== "WAITING_FOR_PLAYERS" ||
      state.countdownStartedAt > 0 ||
      state.lastTickSecond !== -1;
    if (state.phase !== "WAITING_FOR_PLAYERS") {
      state.phase = "WAITING_FOR_PLAYERS";
      onPhaseChange("WAITING_FOR_PLAYERS");
    }
    if (shouldResetCountdown) {
      state.countdownStartedAt = 0;
      state.lastTickSecond = -1;
      onCountdownTick(fullCountdownSeconds);
    }
    return false;
  }

  if (state.phase === "WAITING_FOR_PLAYERS") {
    state.phase = "COUNTDOWN";
    onPhaseChange("COUNTDOWN");
    state.countdownStartedAt = now;
    state.lastTickSecond = -1;
  } else if (state.countdownStartedAt === 0) {
    state.countdownStartedAt = now;
    state.lastTickSecond = -1;
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
