import { createContext } from "preact";
import type { GamePhase } from "../../modules/game/canvas/types";

export type GameSessionValue = {
  phase: GamePhase | "RESULT";
  secondsLeft: number;
  playerCount: number | null;
  winnerIndex: number | null;
  resetKey: number;
  onPhaseChange: (phase: GamePhase) => void;
  onCountdownTick: (secondsLeft: number) => void;
  onWinner: (winnerIndex: number, playerCount: number) => void;
  onNotEnoughPlayers: (touchCount: number, required: number) => void;
  onBack: () => void;
  onPlayAgain: () => void;
  onSamePlayers: () => void;
};

const gameSessionContext = createContext<GameSessionValue | null>(null);

export function getGameSessionContext() {
  return gameSessionContext;
}
