import type { Settings } from "./Settings";

export function getDefaultSettings(): Settings {
  return {
    reducedMotion: false,
    soundEnabled: true,
    hapticsEnabled: true,
  };
}
