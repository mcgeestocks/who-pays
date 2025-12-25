export type GameRendererHandle = {
  /** Start the game (begins countdown) */
  start: () => void;
  /** Stop the renderer and clean up */
  stop: () => void;
  /** Reset to countdown phase (for "same players again") */
  reset: () => void;
};
