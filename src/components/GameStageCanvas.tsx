import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { useGameSession } from "../app/gameSession/useGameSession";
import { createGameRenderer } from "../modules/game/canvas/createGameRenderer";
import type { GameRendererHandle } from "../modules/game/canvas/types";

export function GameStageCanvas(): JSX.Element {
  const {
    onPhaseChange,
    onCountdownTick,
    onWinner,
    onNotEnoughPlayers,
    resetKey,
  } = useGameSession();
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
  }, [
    onPhaseChange,
    onCountdownTick,
    onWinner,
    onNotEnoughPlayers,
  ]);

  useEffect(() => {
    if (resetKey > 0 && rendererRef.current) {
      rendererRef.current.reset();
    }
  }, [resetKey]);

  return (
    <canvas
      ref={canvasRef}
      class="h-full w-full touch-none bg-black"
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}
