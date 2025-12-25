import type { JSX } from "preact";
import { GameStageCanvas } from "../canvas/GameStageCanvas";
import type { GamePhase } from "../canvas/gameRenderer/GameRendererOptions";
import type { WinHistoryEntry } from "../game/winHistory/WinHistoryEntry";

type GameScreenProps = {
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
  winHistory: WinHistoryEntry[];
};

export function GameScreen({
  phase,
  resetKey,
  onPhaseChange,
  onCountdownTick,
  onWinner,
  onNotEnoughPlayers,
  onBack,
  onPlayAgain,
  onSamePlayers,
  winHistory,
}: GameScreenProps): JSX.Element {
  const isResult = phase === "RESULT";

  return (
    <section class="absolute inset-0">
      <div class="relative flex min-h-full flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <GameStageCanvas
          onPhaseChange={onPhaseChange}
          onCountdownTick={onCountdownTick}
          onWinner={onWinner}
          onNotEnoughPlayers={onNotEnoughPlayers}
          resetKey={resetKey}
        />
      </div>
      {isResult && (
        <GameCompleteModal
          onBack={onBack}
          onPlayAgain={onPlayAgain}
          onSamePlayers={onSamePlayers}
          winHistory={winHistory}
        />
      )}
    </section>
  );
}

function GameCompleteModal({
  onBack,
  onPlayAgain,
  winHistory,
}: {
  onBack: () => void;
  onPlayAgain: () => void;
  onSamePlayers: () => void;
  winHistory: WinHistoryEntry[];
}): JSX.Element {
  return (
    <div class="absolute inset-0 justify-center items-center  bg-black/50 m-5">
      <div class="flex flex-col gap-2">
        <button onClick={onBack}>Back</button>
        <button onClick={onPlayAgain}>Play Again</button>
      </div>
      <div>
        <h2>Recent Wins</h2>
        <ul>
          {winHistory.map((win) => (
            <li key={win.timestamp}>{win.winnerIndex + 1} wins!</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
