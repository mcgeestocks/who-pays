import type { JSX, RefObject } from "preact";
import { useGameSession } from "../app/gameSession/useGameSession";
import { BouncingPlayAgainButton } from "./BouncingPlayAgainButton";

type GameCompleteModalProps = {
  containerRef: RefObject<HTMLElement>;
};

export function GameCompleteModal(props: GameCompleteModalProps): JSX.Element {
  const { onPlayAgain } = useGameSession();
  const { containerRef } = props;

  return (
    <div class="absolute inset-0">
      <BouncingPlayAgainButton
        containerRef={containerRef}
        onPlayAgain={onPlayAgain}
      />
    </div>
  );
}
