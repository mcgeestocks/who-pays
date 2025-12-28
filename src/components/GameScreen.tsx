import type { JSX, RefCallback } from "preact";
import { useRef } from "preact/hooks";
import { useGameSession } from "../app/gameSession/useGameSession";
import { GameCompleteModal } from "./GameCompleteModal";
import { GameStageCanvas } from "./GameStageCanvas";
import { MarqueeBorderText } from "./MarqueeBorderText";

const setSwitchAttribute: RefCallback<HTMLInputElement> = (el) => {
  el?.setAttribute("switch", "");
};

export function GameScreen(): JSX.Element {
  const { phase } = useGameSession();
  const isResult = phase === "RESULT";
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section class="absolute inset-0">
      <div
        ref={containerRef}
        class="relative flex min-h-full flex-1 items-center justify-center rounded-2xl bg-black"
      >
        <GameStageCanvas />
        <MarqueeBorderText text="TOUCH TO START" />
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
