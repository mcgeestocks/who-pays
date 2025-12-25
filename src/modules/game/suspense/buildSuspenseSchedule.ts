import type { JumpStep } from "./JumpStep";

export function buildSuspenseSchedule(
  playerCount: number,
  winnerIndex: number,
  hops = 16
): JumpStep[] {
  const steps: JumpStep[] = [];
  if (playerCount <= 0) return steps;
  const total = Math.max(hops, playerCount * 3);
  const startIndex =
    (winnerIndex - ((total - 1) % playerCount) + playerCount) % playerCount;
  let atMs = 0;
  for (let i = 0; i < total; i += 1) {
    const interval = 70 + i * 18;
    atMs += interval;
    steps.push({
      index: (startIndex + i) % playerCount,
      atMs,
    });
  }
  steps.push({ index: winnerIndex, atMs: atMs + 360 });
  return steps;
}
