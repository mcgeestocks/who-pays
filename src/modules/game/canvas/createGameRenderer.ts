import type { TouchPoint } from "../../geometryTypes";
import { createCashConfettiParticles } from "./createCashConfettiParticles";
import { drawCountdown } from "./drawCountdown";
import { drawSuspenseOrResult } from "./drawSuspenseOrResult";
import { getCanvasPoint } from "./getCanvasPoint";
import { resizeCanvas } from "./resizeCanvas";
import { transitionToSuspense } from "./transitionToSuspense";
import type {
  GameRendererHandle,
  GameRendererOptions,
  RendererState,
} from "./types";
import { updateCashConfettiParticles } from "./updateCashConfettiParticles";
import { updateCountdownPhase } from "./updateCountdownPhase";
import { updateSuspensePhase } from "./updateSuspensePhase";

const DEFAULT_COUNTDOWN_MS = 5000;
const DEFAULT_MIN_PLAYERS = 2;

const TOUCH_CIRCLE_SCALE = 0.12;
const ACTIVE_RING_OFFSET = 8;
const HIGHLIGHT_RING_OFFSET = 12;

export function createGameRenderer(
  canvas: HTMLCanvasElement,
  options: GameRendererOptions
): GameRendererHandle {
  const ctx = canvas.getContext("2d");
  const countdownMs = options.countdownMs ?? DEFAULT_COUNTDOWN_MS;
  const minPlayers = options.minPlayers ?? DEFAULT_MIN_PLAYERS;

  const state: RendererState = {
    phase: "WAITING_FOR_PLAYERS",
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
    cashConfettiParticles: [],
    cashConfettiUpdatedAtMs: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  };

  let rafId = 0;
  let running = false;
  const fullCountdownSeconds = Math.ceil(countdownMs / 1000);

  const loop = () => {
    if (!running) return;
    const now = performance.now();
    update(now);
    draw(canvas, ctx, now);
    rafId = requestAnimationFrame(loop);
  };

  const advanceCashConfetti = (now: number) => {
    if (!shouldAdvanceCashConfetti(state)) {
      state.cashConfettiUpdatedAtMs = 0;
      return;
    }

    const updatedConfetti = updateCashConfettiParticles({
      now,
      particles: state.cashConfettiParticles,
      lastUpdatedAtMs: state.cashConfettiUpdatedAtMs,
    });

    state.cashConfettiParticles = updatedConfetti.particles;
    state.cashConfettiUpdatedAtMs = updatedConfetti.lastUpdatedAtMs;
  };

  const update = (now: number) => {
    if (state.phase === "WAITING_FOR_PLAYERS" || state.phase === "COUNTDOWN") {
      const shouldTransition = updateCountdownPhase({
        now,
        state,
        countdownMs,
        minPlayers,
        fullCountdownSeconds,
        onPhaseChange: options.onPhaseChange,
        onCountdownTick: options.onCountdownTick,
      });
      if (shouldTransition) {
        transitionToSuspense({
          now,
          state,
          onPhaseChange: options.onPhaseChange,
        });
      }
    } else if (state.phase === "SUSPENSE") {
      const suspenseComplete = updateSuspensePhase({ now, state });
      if (suspenseComplete && state.phase === "SUSPENSE") {
        state.phase = "RESULT";
        options.onPhaseChange("RESULT");
        options.onWinner(state.winnerIndex, state.playerCount);
        const origin = getWinnerOrigin(state);
        const circleRadius = getWinnerCircleRadius(state, TOUCH_CIRCLE_SCALE);
        state.cashConfettiParticles = createCashConfettiParticles({
          now,
          origin,
          circleRadius,
        });
        state.cashConfettiUpdatedAtMs = now;
      }
    }

    advanceCashConfetti(now);
  };

  const draw = (
    target: HTMLCanvasElement,
    context: CanvasRenderingContext2D | null,
    now: number
  ) => {
    if (!context) return;
    const size = resizeCanvas(target, context);
    state.canvasWidth = size.width;
    state.canvasHeight = size.height;

    // Background
    context.clearRect(0, 0, size.width, size.height);
    context.fillStyle = "#000"; //TODO: Change to named export
    context.fillRect(0, 0, size.width, size.height);

    if (state.phase === "WAITING_FOR_PLAYERS" || state.phase === "COUNTDOWN") {
      drawCountdown({
        ctx: context,
        size,
        state,
        countdownMs,
        fullCountdownSeconds,
        touchCircleScale: TOUCH_CIRCLE_SCALE,
        activeRingOffset: ACTIVE_RING_OFFSET,
      });
    } else {
      drawSuspenseOrResult({
        ctx: context,
        size,
        state,
        touchCircleScale: TOUCH_CIRCLE_SCALE,
        highlightRingOffset: HIGHLIGHT_RING_OFFSET,
        now,
      });
    }
  };

  // Pointer event handlers
  const handlePointerDown = (event: PointerEvent) => {
    if (state.phase === "SUSPENSE" || state.phase === "RESULT") return;

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
    if (state.phase === "WAITING_FOR_PLAYERS" || state.phase === "COUNTDOWN") {
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
    state.phase = "WAITING_FOR_PLAYERS";
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
    state.cashConfettiParticles = [];
    state.cashConfettiUpdatedAtMs = 0;
    options.onPhaseChange("WAITING_FOR_PLAYERS");
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
      options.onCountdownTick(fullCountdownSeconds);
      options.onPhaseChange("WAITING_FOR_PLAYERS");
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
        options.onCountdownTick(fullCountdownSeconds);
      }
    },
  };
}

type WinnerOrigin = {
  x: number;
  y: number;
};

function shouldAdvanceCashConfetti(state: RendererState): boolean {
  return state.cashConfettiParticles.length > 0;
}

function getWinnerOrigin(state: RendererState): WinnerOrigin {
  const winnerTouch = getWinnerTouch(state);
  if (winnerTouch) {
    return { x: winnerTouch.x, y: winnerTouch.y };
  }

  return getFallbackOrigin(state);
}

function getWinnerTouch(state: RendererState): TouchPoint | null {
  const winnerPointerId = state.snapshotOrder[state.winnerIndex];
  if (winnerPointerId === undefined) return null;
  return state.touches.get(winnerPointerId) ?? null;
}

function getFallbackOrigin(state: RendererState): WinnerOrigin {
  const safeWidth = Math.max(1, state.canvasWidth);
  const safeHeight = Math.max(1, state.canvasHeight);
  return { x: safeWidth / 2, y: safeHeight / 2 };
}

function getWinnerCircleRadius(
  state: RendererState,
  touchCircleScale: number
): number {
  const canvasMinimum = Math.min(state.canvasWidth, state.canvasHeight);
  return canvasMinimum * touchCircleScale;
}
