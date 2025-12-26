import { useContext } from "preact/hooks";
import { getGameSessionContext } from "./getGameSessionContext";
import type { GameSessionValue } from "./getGameSessionContext";

export function useGameSession(): GameSessionValue {
  const GameSessionContext = getGameSessionContext();
  const session = useContext(GameSessionContext);

  if (!session) {
    throw new Error("useGameSession must be used within GameSessionProvider");
  }

  return session;
}
