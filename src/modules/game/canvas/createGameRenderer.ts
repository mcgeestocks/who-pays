import { COLORS } from "../../../components/styles/colors";
import { pickWinnerIndex } from "../../utils/pickWinnerIndex";
import { buildSuspenseSchedule } from "../suspense/buildSuspenseSchedule";
import type { JumpStep } from "../suspense/JumpStep";
import type {
  GamePhase,
  GameRendererHandle,
  GameRendererOptions,
} from "./types";

const DEFAULT_COUNTDOWN_MS = 5000;
const DEFAULT_MIN_PLAYERS = 2;

const TOUCH_CIRCLE_SCALE = 0.12;
const ACTIVE_RING_OFFSET = 8;
const HIGHLIGHT_RING_OFFSET = 12;

type TouchState = {
  x: number;
  y: number;
  frozen: boolean;
};

type RendererState = {
  phase: GamePhase;
  touches: Map<number, TouchState>;
  countdownStartedAt: number;
  lastTickSecond: number;
  suspenseStartedAt: number;
  suspenseSchedule: JumpStep[];
  suspenseStepIndex: number;
  currentHighlightIndex: number;
  winnerIndex: number;
  playerCount: number;
  snapshotOrder: number[]; // Maps player index to pointer ID order at snapshot
};

export function createGameRenderer(
  canvas: HTMLCanvasElement,
  options: GameRendererOptions
): GameRendererHandle {
  const ctx = canvas.getContext("2d");
  const countdownMs = options.countdownMs ?? DEFAULT_COUNTDOWN_MS;
  const minPlayers = options.minPlayers ?? DEFAULT_MIN_PLAYERS;

  const state: RendererState = {
    phase: "COUNTDOWN",
    touches: new Map(),
    countdownStartedAt: 0,
    lastTickSecond: -1,
    suspenseStartedAt: 0,
    suspenseSchedule: [],
    suspenseStepIndex: 0,
    currentHighlightIndex: 0,
    winnerIndex: 0,
    playerCount: 0,
    snapshotOrder: [],
  };

  let rafId = 0;
  let running = false;

  const fullCountdownSeconds = (): number => Math.ceil(countdownMs / 1000);

  const loop = () => {
    if (!running) return;
    const now = performance.now();
    update(now);
    draw(canvas, ctx);
    rafId = requestAnimationFrame(loop);
  };

  const update = (now: number) => {
    if (state.phase === "COUNTDOWN") {
      updateCountdown(now);
    } else if (state.phase === "SUSPENSE") {
      updateSuspense(now);
    }
  };

  const updateCountdown = (now: number) => {
    const touchCount = state.touches.size;
    if (touchCount < minPlayers) {
      if (state.countdownStartedAt) {
        state.countdownStartedAt = 0;
        state.lastTickSecond = -1;
        options.onCountdownTick(fullCountdownSeconds());
      }
      return;
    }

    if (!state.countdownStartedAt) {
      state.countdownStartedAt = now;
    }

    const elapsed = now - state.countdownStartedAt;
    const remaining = Math.max(0, countdownMs - elapsed);
    const secondsLeft = Math.ceil(remaining / 1000);

    // Fire tick callback when second changes
    if (secondsLeft !== state.lastTickSecond) {
      state.lastTickSecond = secondsLeft;
      options.onCountdownTick(secondsLeft);
    }

    // Countdown finished
    if (elapsed >= countdownMs) {
      // Transition to suspense
      transitionToSuspense(now);
    }
  };

  const transitionToSuspense = (now: number) => {
    state.playerCount = state.touches.size;
    state.winnerIndex = pickWinnerIndex(state.playerCount);

    // Create snapshot order - maps index to pointer ID
    state.snapshotOrder = Array.from(state.touches.keys());

    state.suspenseSchedule = buildSuspenseSchedule(
      state.playerCount,
      state.winnerIndex
    );
    state.suspenseStartedAt = now;
    state.suspenseStepIndex = 0;
    state.currentHighlightIndex =
      state.suspenseSchedule[0]?.index ?? state.winnerIndex;

    state.phase = "SUSPENSE";
    options.onPhaseChange("SUSPENSE");
  };

  const updateSuspense = (now: number) => {
    const elapsed = now - state.suspenseStartedAt;
    const schedule = state.suspenseSchedule;

    // Advance through schedule steps
    while (
      state.suspenseStepIndex + 1 < schedule.length &&
      elapsed >= schedule[state.suspenseStepIndex + 1].atMs
    ) {
      state.suspenseStepIndex += 1;
      state.currentHighlightIndex = schedule[state.suspenseStepIndex].index;
      // Haptic feedback on each hop
      triggerHaptic();
    }

    // Check if animation complete
    const lastStep = schedule[schedule.length - 1];
    const endAtMs = (lastStep?.atMs ?? 0) + 420;
    if (elapsed >= endAtMs && state.phase === "SUSPENSE") {
      state.phase = "RESULT";
      options.onPhaseChange("RESULT");
      options.onWinner(state.winnerIndex, state.playerCount);
    }
  };

  const draw = (
    target: HTMLCanvasElement,
    context: CanvasRenderingContext2D | null
  ) => {
    if (!context) return;
    const size = resizeCanvas(target, context);

    // Background
    context.clearRect(0, 0, size.width, size.height);
    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, size.width, size.height);

    if (state.phase === "COUNTDOWN") {
      drawCountdown(context, size);
    } else {
      drawSuspenseOrResult(context, size);
    }
  };

  const drawCountdown = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => {
    // Draw touch circles
    const touchEntries = Array.from(state.touches.entries());
    const circleRadius = Math.min(size.width, size.height) * TOUCH_CIRCLE_SCALE;

    touchEntries.forEach(([, touch], index) => {
      const color = COLORS[index % COLORS.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(touch.x, touch.y, circleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Active indicator ring
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        touch.x,
        touch.y,
        circleRadius + ACTIVE_RING_OFFSET,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });

    // Draw countdown number in center
    const hasCountdownStarted = state.countdownStartedAt > 0;
    const elapsed = hasCountdownStarted
      ? performance.now() - state.countdownStartedAt
      : 0;
    const remaining = Math.max(0, countdownMs - elapsed);
    const secondsLeft = hasCountdownStarted
      ? Math.ceil(remaining / 1000)
      : fullCountdownSeconds();

    ctx.fillStyle = "#0f172a";
    ctx.font = `bold ${Math.min(size.width, size.height) * 0.3}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(secondsLeft), size.width / 2, size.height / 2);

    // Touch count indicator
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`${state.touches.size} players`, 16, 16);
  };

  const drawSuspenseOrResult = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => {
    const circleRadius = Math.min(size.width, size.height) * TOUCH_CIRCLE_SCALE;
    const touchEntries = Array.from(state.touches.entries());

    // Draw all player circles at their positions
    touchEntries.forEach(([pointerId], index) => {
      const touch = state.touches.get(pointerId);
      if (!touch) return;

      const color = COLORS[index % COLORS.length];
      const isFrozen = touch.frozen;

      // Frozen circles are slightly dimmer
      ctx.fillStyle = isFrozen ? withAlpha(color, 0.7) : color;
      ctx.beginPath();
      ctx.arc(touch.x, touch.y, circleRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw highlight ring on current selection
    const highlightPointerId = state.snapshotOrder[state.currentHighlightIndex];
    const highlightTouch =
      highlightPointerId !== undefined
        ? state.touches.get(highlightPointerId)
        : null;

    if (highlightTouch) {
      const isWinner =
        state.phase === "RESULT" &&
        state.currentHighlightIndex === state.winnerIndex;
      ctx.strokeStyle = isWinner ? "#16a34a" : "#0f172a";
      ctx.lineWidth = isWinner ? 8 : 6;
      ctx.beginPath();
      ctx.arc(
        highlightTouch.x,
        highlightTouch.y,
        circleRadius + HIGHLIGHT_RING_OFFSET,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Status text
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const statusText =
      state.phase === "RESULT"
        ? `Player ${state.winnerIndex + 1} wins!`
        : "Selecting...";
    ctx.fillText(statusText, 16, 16);
  };

  // Pointer event handlers
  const handlePointerDown = (event: PointerEvent) => {
    if (state.phase !== "COUNTDOWN") return;

    const point = getCanvasPoint(canvas, event);
    state.touches.set(event.pointerId, {
      x: point.x,
      y: point.y,
      frozen: false,
    });
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent) => {
    const touch = state.touches.get(event.pointerId);
    if (!touch || touch.frozen) return;

    const point = getCanvasPoint(canvas, event);
    touch.x = point.x;
    touch.y = point.y;
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (state.phase === "COUNTDOWN") {
      // During countdown, remove the touch entirely
      state.touches.delete(event.pointerId);
    } else if (state.phase === "SUSPENSE") {
      // During suspense, freeze the position
      const touch = state.touches.get(event.pointerId);
      if (touch) {
        touch.frozen = true;
      }
    }
    // In RESULT phase, do nothing
  };

  const handlePointerCancel = (event: PointerEvent) => {
    handlePointerUp(event);
  };

  // Prevent iOS browser gestures
  const preventTouchDefault = (event: TouchEvent) => {
    event.preventDefault();
  };

  const reset = () => {
    state.phase = "COUNTDOWN";
    state.touches.clear();
    state.countdownStartedAt = 0;
    state.lastTickSecond = -1;
    state.suspenseStartedAt = 0;
    state.suspenseSchedule = [];
    state.suspenseStepIndex = 0;
    state.currentHighlightIndex = 0;
    state.winnerIndex = 0;
    state.playerCount = 0;
    state.snapshotOrder = [];
    options.onPhaseChange("COUNTDOWN");
  };

  return {
    start: () => {
      if (running) return;
      if (!ctx) return;

      // Pointer events
      canvas.addEventListener("pointerdown", handlePointerDown);
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerup", handlePointerUp);
      canvas.addEventListener("pointercancel", handlePointerCancel);

      // Touch events with passive: false to block iOS gestures
      canvas.addEventListener("touchstart", preventTouchDefault, {
        passive: false,
      });
      canvas.addEventListener("touchmove", preventTouchDefault, {
        passive: false,
      });
      canvas.addEventListener("touchend", preventTouchDefault, {
        passive: false,
      });

      running = true;
      state.countdownStartedAt = 0;
      state.lastTickSecond = -1;
      options.onCountdownTick(fullCountdownSeconds());
      options.onPhaseChange("COUNTDOWN");
      rafId = requestAnimationFrame(loop);
    },
    stop: () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);

      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      canvas.removeEventListener("touchstart", preventTouchDefault);
      canvas.removeEventListener("touchmove", preventTouchDefault);
      canvas.removeEventListener("touchend", preventTouchDefault);
    },
    reset: () => {
      reset();
      if (running) {
        state.countdownStartedAt = 0;
        state.lastTickSecond = -1;
        options.onCountdownTick(fullCountdownSeconds());
      }
    },
  };
}

function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const size = getCanvasSize(canvas);
  const dpr = window.devicePixelRatio || 1;
  const width = size.width;
  const height = size.height;

  if (
    canvas.width !== Math.floor(width * dpr) ||
    canvas.height !== Math.floor(height * dpr)
  ) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height };
}

function getCanvasSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  return {
    width: Math.max(1, Math.floor(rect.width)),
    height: Math.max(1, Math.floor(rect.height)),
  };
}

function getCanvasPoint(canvas: HTMLCanvasElement, event: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function triggerHaptic() {
  console.log("triggerHaptic");
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
}
