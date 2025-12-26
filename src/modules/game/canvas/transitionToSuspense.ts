import { pickWinnerIndex } from "../../utils/pickWinnerIndex";
import { buildSuspenseSchedule } from "../suspense/buildSuspenseSchedule";
import type { GameRendererOptions, RendererState } from "./types";

type TransitionToSuspenseParams = {
  now: number;
  state: RendererState;
  onPhaseChange: GameRendererOptions["onPhaseChange"];
};

export function transitionToSuspense({
  now,
  state,
  onPhaseChange,
}: TransitionToSuspenseParams): void {
  state.playerCount = state.touches.size;
  state.winnerIndex = pickWinnerIndex(state.playerCount);

  // Create snapshot order - maps index to pointer ID
  state.snapshotOrder = Array.from(state.touches.keys());

  state.suspenseSchedule = buildSuspenseSchedule(
    state.playerCount,
    state.winnerIndex
  );
  state.suspenseStartedAt = now;
  state.suspenseStepIndex = 0;
  state.currentHighlightIndex =
    state.suspenseSchedule[0]?.index ?? state.winnerIndex;

  state.phase = "SUSPENSE";
  onPhaseChange("SUSPENSE");
}
