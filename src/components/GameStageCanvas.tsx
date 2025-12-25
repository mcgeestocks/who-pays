import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { createGameRenderer } from "../modules/game/canvas/createGameRenderer";
import type {
  GamePhase,
  GameRendererHandle,
} from "../modules/game/canvas/types";

type GameStageCanvasProps = {
  onPhaseChange: (phase: GamePhase) => void;
  onCountdownTick: (secondsLeft: number) => void;
  onWinner: (winnerIndex: number, playerCount: number) => void;
  onNotEnoughPlayers: (touchCount: number, required: number) => void;
  resetKey?: number; // Increment to trigger reset
};

export function GameStageCanvas({
  onPhaseChange,
  onCountdownTick,
  onWinner,
  onNotEnoughPlayers,
  resetKey,
}: GameStageCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRendererHandle | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = createGameRenderer(canvasRef.current, {
      countdownMs: 5000,
      minPlayers: 2,
      onPhaseChange,
      onCountdownTick,
      onWinner,
      onNotEnoughPlayers,
    });

    rendererRef.current = renderer;
    renderer.start();

    return () => {
      renderer.stop();
      rendererRef.current = null;
    };
  }, [onPhaseChange, onCountdownTick, onWinner, onNotEnoughPlayers]);

  // Handle reset when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined && resetKey > 0 && rendererRef.current) {
      rendererRef.current.reset();
    }
  }, [resetKey]);

  return (
    <canvas
      ref={canvasRef}
      class="h-full w-full touch-none"
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}
