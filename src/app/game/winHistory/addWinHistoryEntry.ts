import type { WinHistoryEntry } from "./WinHistoryEntry";
import { loadWinHistory } from "./loadWinHistory";

const WIN_HISTORY_KEY = "whoPays.winHistory";
const MAX_HISTORY = 20;

export function addWinHistoryEntry(entry: WinHistoryEntry): WinHistoryEntry[] {
  const current = loadWinHistory();
  const next = [entry, ...current].slice(0, MAX_HISTORY);
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(WIN_HISTORY_KEY, JSON.stringify(next));
  } catch (error) {
    // Ignore storage failures (private mode, quota, etc).
  }
  return next;
}
