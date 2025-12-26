import type { JSX } from "preact";
import { useGameSession } from "../app/gameSession/useGameSession";
import { GameStageCanvas } from "./GameStageCanvas";

export function GameScreen(): JSX.Element {
  const { phase } = useGameSession();
  const isResult = phase === "RESULT";

  return (
    <section class="absolute inset-0">
      <div class="relative flex min-h-full flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <GameStageCanvas />
      </div>
      {isResult && <GameCompleteModal />}
    </section>
  );
}

function GameCompleteModal(): JSX.Element {
  const { onBack, onPlayAgain } = useGameSession();

  return (
    <div class="absolute inset-0 justify-center items-center  bg-black/50 m-5">
      <div class="flex flex-col gap-2">
        <button onClick={onBack}>Back</button>
        <button onClick={onPlayAgain}>Play Again</button>
      </div>
    </div>
  );
}
