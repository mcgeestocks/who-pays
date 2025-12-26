import { triggerHaptic } from "./triggerHaptic";
import type { RendererState } from "./types";

type UpdateSuspensePhaseParams = {
  now: number;
  state: RendererState;
};

const SUSPENSE_END_BUFFER_MS = 420;

export function updateSuspensePhase({
  now,
  state,
}: UpdateSuspensePhaseParams): boolean {
  const elapsed = now - state.suspenseStartedAt;
  const schedule = state.suspenseSchedule;

  // Advance through schedule steps
  while (
    state.suspenseStepIndex + 1 < schedule.length &&
    elapsed >= schedule[state.suspenseStepIndex + 1].atMs
  ) {
    state.suspenseStepIndex += 1;
    state.currentHighlightIndex = schedule[state.suspenseStepIndex].index;
    // Haptic feedback on each hop
    triggerHaptic();
  }

  // Check if animation complete
  const lastStep = schedule[schedule.length - 1];
  const endAtMs = (lastStep?.atMs ?? 0) + SUSPENSE_END_BUFFER_MS;
  return elapsed >= endAtMs;
}
