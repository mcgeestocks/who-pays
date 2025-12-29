import type { TouchPoint } from "../../geometryTypes";
import type { JumpStep } from "../suspense/JumpStep";

export type GamePhase =
  | "WAITING_FOR_PLAYERS"
  | "COUNTDOWN"
  | "SUSPENSE"
  | "RESULT";

export type GameRendererOptions = {
  /** Countdown duration in milliseconds. Default: 5000 */
  countdownMs?: number;
  /** Minimum players required to start selection. Default: 2 */
  minPlayers?: number;
  /** Called when the game phase changes */
  onPhaseChange: (phase: GamePhase) => void;
  /** Called each second during countdown with seconds remaining */
  onCountdownTick: (secondsLeft: number) => void;
  /** Called when a winner is selected */
  onWinner: (winnerIndex: number, playerCount: number) => void;
  /** Called when countdown ends without enough players */
  onNotEnoughPlayers: (touchCount: number, required: number) => void;
};

export type GameRendererHandle = {
  /** Start the game (begins countdown) */
  start: () => void;
  /** Stop the renderer and clean up */
  stop: () => void;
  /** Reset to countdown phase (for "same players again") */
  reset: () => void;
};

export type RendererState = {
  phase: GamePhase;
  touches: Map<number, TouchPoint>;
  countdownStartedAt: number;
  lastTickSecond: number;
  suspenseStartedAt: number;
  suspenseSchedule: JumpStep[];
  suspenseStepIndex: number;
  currentHighlightIndex: number;
  winnerIndex: number;
  playerCount: number;
  snapshotOrder: number[]; // Maps player index to pointer ID order at snapshot
};
