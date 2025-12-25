import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import type { GamePhase } from "./canvas/gameRenderer/GameRendererOptions";
import { addWinHistoryEntry } from "./game/winHistory/addWinHistoryEntry";
import { loadWinHistory } from "./game/winHistory/loadWinHistory";
import { usePwaUpdate } from "./pwa/usePwaUpdate";
import { GameScreen } from "./screens/GameScreen";
import { Home } from "./screens/Home";
import type { AppState } from "./stateMachine/AppState";
import { UpdateNotice } from "./ui/UpdateNotice";

export default function App() {
  const [state, setState] = useState<AppState>("HOME");
  const [gamePhase, setGamePhase] = useState<GamePhase>("COUNTDOWN");
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [winHistory, setWinHistory] = useState(() => loadWinHistory());

  const { needRefresh, updateServiceWorker, dismissUpdate } = usePwaUpdate();

  useEffect(() => {
    if (state !== "GAME_RESULT" || winnerIndex === null || playerCount === null)
      return;
    const next = addWinHistoryEntry({
      winnerIndex,
      playerCount,
      timestamp: Date.now(),
    });
    setWinHistory(next);
  }, [playerCount, state, winnerIndex]);

  const handlePhaseChange = useCallback((phase: GamePhase) => {
    setGamePhase(phase);
    if (phase === "RESULT") {
      setState("GAME_RESULT");
    }
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
    setGamePhase("COUNTDOWN");
    setSecondsLeft(5);
    setResetKey((key) => key + 1);
    setState("GAME");
  }, []);

  const handleBack = useCallback(() => {
    setWinnerIndex(null);
    setPlayerCount(null);
    setGamePhase("COUNTDOWN");
    setSecondsLeft(5);
    setState("HOME");
  }, []);

  const screen = useMemo(() => {
    switch (state) {
      case "HOME":
        return (
          <Home
            onStart={() => {
              setResetKey((key) => key + 1);
              setState("GAME");
            }}
          />
        );
      case "GAME":
      case "GAME_RESULT":
        return (
          <GameScreen
            phase={state === "GAME_RESULT" ? "RESULT" : gamePhase}
            secondsLeft={secondsLeft}
            playerCount={playerCount}
            winnerIndex={winnerIndex}
            resetKey={resetKey}
            onPhaseChange={handlePhaseChange}
            onCountdownTick={handleCountdownTick}
            onWinner={handleWinner}
            onNotEnoughPlayers={handleNotEnoughPlayers}
            onBack={handleBack}
            onPlayAgain={handlePlayAgain}
            onSamePlayers={handlePlayAgain}
            winHistory={winHistory}
          />
        );
      default:
        return null;
    }
  }, [
    state,
    gamePhase,
    secondsLeft,
    playerCount,
    winnerIndex,
    resetKey,
    winHistory,
    handlePhaseChange,
    handleCountdownTick,
    handleWinner,
    handleNotEnoughPlayers,
    handleBack,
    handlePlayAgain,
  ]);

  return (
    <div class="min-h-full bg-amber-50 text-slate-900">
      <div class="mx-auto p-6">
        {needRefresh ? (
          <UpdateNotice
            onRefresh={updateServiceWorker}
            onDismiss={dismissUpdate}
          />
        ) : null}
        <main>{screen}</main>
      </div>
    </div>
  );
}
