import type { ComponentChildren, JSX } from "preact";
import { getGameSessionContext } from "./getGameSessionContext";
import type { GameSessionValue } from "./getGameSessionContext";

type GameSessionProviderProps = {
  value: GameSessionValue;
  children: ComponentChildren;
};

export function GameSessionProvider({
  value,
  children,
}: GameSessionProviderProps): JSX.Element {
  const GameSessionContext = getGameSessionContext();

  return (
    <GameSessionContext.Provider value={value}>
      {children}
    </GameSessionContext.Provider>
  );
}
