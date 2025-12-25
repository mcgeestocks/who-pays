import type { WinHistoryEntry } from "./WinHistoryEntry";

const WIN_HISTORY_KEY = "whoPays.winHistory";
const MAX_HISTORY = 20;

export function loadWinHistory(): WinHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WIN_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WinHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry) =>
          Number.isFinite(entry.winnerIndex) &&
          Number.isFinite(entry.playerCount)
      )
      .slice(0, MAX_HISTORY);
  } catch (error) {
    return [];
  }
}
