import type { JSX, RefCallback } from "preact";
import { useRef } from "preact/hooks";
import { useGameSession } from "../app/gameSession/useGameSession";
import type { GamePhase } from "../modules/game/canvas/types";
import { GameCompleteModal } from "./GameCompleteModal";
import { GameStageCanvas } from "./GameStageCanvas";
import { MarqueeBorderText } from "./MarqueeBorderText";
import { COLOR_NAMES } from "./styles/colors";

const setSwitchAttribute: RefCallback<HTMLInputElement> = (el) => {
  el?.setAttribute("switch", "");
};

const MARQUEE_TEXT_BY_PHASE: Record<Exclude<GamePhase, "RESULT">, string> = {
  WAITING_FOR_PLAYERS: "TOUCH TO START",
  COUNTDOWN: "DON'T LET GO",
  SUSPENSE: "PICKING WINNER",
};
const WINNER_TEXT_SUFFIX = " PLAYER WINS";

function getWinnerColorName(winnerIndex: number | null): string | null {
  if (winnerIndex === null) return null;
  const name = COLOR_NAMES[winnerIndex % COLOR_NAMES.length];
  return name ?? null;
}

function getMarqueeText({
  phase,
  winnerColorName,
}: {
  phase: GamePhase | "RESULT";
  winnerColorName: string | null;
}): string {
  if (phase === "RESULT") {
    if (winnerColorName) {
      return `${winnerColorName.toUpperCase()}${WINNER_TEXT_SUFFIX}`;
    }
    return `COLOR${WINNER_TEXT_SUFFIX}`;
  }

  return MARQUEE_TEXT_BY_PHASE[phase];
}

export function GameScreen(): JSX.Element {
  const { phase, winnerIndex } = useGameSession();
  const isResult = phase === "RESULT";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const winnerColorName = getWinnerColorName(winnerIndex);
  const marqueeText = getMarqueeText({
    phase,
    winnerColorName,
  });

  return (
    <section class="absolute inset-0">
      <div
        ref={containerRef}
        class="relative flex min-h-full flex-1 items-center justify-center rounded-2xl bg-black"
      >
        <GameStageCanvas />
        <MarqueeBorderText text={marqueeText} />
        {isResult && <GameCompleteModal containerRef={containerRef} />}
      </div>
      <input
        ref={setSwitchAttribute}
        id="ios-haptic-switch"
        type="checkbox"
        class="sr-only"
      />
      <label for="ios-haptic-switch" class="sr-only">
        Haptic
      </label>
    </section>
  );
}
