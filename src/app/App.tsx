import { useCallback, useMemo, useState } from "preact/hooks";
import { GameScreen } from "../components/GameScreen";
import { UpdateNotice } from "../components/UpdateNotice";
import type { GamePhase } from "../modules/game/canvas/types";
import { usePwaUpdate } from "../modules/progressiveWebApp/usePwaUpdate";
import { GameSessionProvider } from "./gameSession/GameSessionProvider";

export default function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("WAITING_FOR_PLAYERS");
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const { needRefresh, updateServiceWorker, dismissUpdate } = usePwaUpdate();

  const handlePhaseChange = useCallback((phase: GamePhase) => {
    setGamePhase(phase);
  }, []);

  const handleCountdownTick = useCallback((seconds: number) => {
    setSecondsLeft(seconds);
  }, []);

  const handleWinner = useCallback((winner: number, players: number) => {
    setWinnerIndex(winner);
    setPlayerCount(players);
  }, []);

  const handleNotEnoughPlayers = useCallback(
    (touchCount: number, required: number) => {
      // Could show a toast here in the future
      console.log(`Not enough players: ${touchCount} of ${required} required`);
    },
    []
  );

  const handlePlayAgain = useCallback(() => {
    setWinnerIndex(null);
    setPlayerCount(null);
    setGamePhase("WAITING_FOR_PLAYERS");
    setSecondsLeft(5);
    setResetKey((key) => key + 1);
  }, []);

  const sessionValue = useMemo(
    () => ({
      phase: gamePhase,
      secondsLeft,
      playerCount,
      winnerIndex,
      resetKey,
      onPhaseChange: handlePhaseChange,
      onCountdownTick: handleCountdownTick,
      onWinner: handleWinner,
      onNotEnoughPlayers: handleNotEnoughPlayers,
      onPlayAgain: handlePlayAgain,
    }),
    [
      gamePhase,
      secondsLeft,
      playerCount,
      winnerIndex,
      resetKey,
      handlePhaseChange,
      handleCountdownTick,
      handleWinner,
      handleNotEnoughPlayers,
      handlePlayAgain,
    ]
  );

  return (
    <div class="min-h-full bg-amber-50 text-slate-900">
      <div class="mx-auto p-6">
        {needRefresh ? (
          <div class="fixed left-6 right-6 top-6 z-20">
            <UpdateNotice
              onRefresh={updateServiceWorker}
              onDismiss={dismissUpdate}
            />
          </div>
        ) : null}
        <main>
          <GameSessionProvider value={sessionValue}>
            <GameScreen />
          </GameSessionProvider>
        </main>
      </div>
    </div>
  );
}
