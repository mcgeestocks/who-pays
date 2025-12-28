import type { JSX, RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

type Point = {
  x: number;
  y: number;
};

type Velocity = {
  x: number;
  y: number;
};

type Bounds = {
  maxX: number;
  maxY: number;
};

type AxisUpdate = {
  position: number;
  velocity: number;
};

type PositionUpdate = {
  position: Point;
  velocity: Velocity;
};

type BouncingPlayAgainButtonProps = {
  containerRef: RefObject<HTMLElement>;
  onPlayAgain: () => void;
};

const SPEED_PX_PER_SECOND = 40;
const FRAME_TIME_CAP_MS = 50;
const INITIAL_OFFSET_RATIO = 0.15;

export function BouncingPlayAgainButton(
  props: BouncingPlayAgainButtonProps
): JSX.Element {
  const { containerRef, onPlayAgain } = props;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const positionRef = useRef<Point>({ x: 0, y: 0 });
  const velocityRef = useRef<Velocity>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const button = buttonRef.current;
    if (!container || !button) return;

    let rafId = 0;
    let lastTimestamp = performance.now();

    const initialize = () => {
      const bounds = getBounds(container, button);
      positionRef.current = createInitialPosition(bounds);
      velocityRef.current = createInitialVelocity(SPEED_PX_PER_SECOND);
      applyTransform(button, positionRef.current);
    };

    initialize();

    const tick = (now: number) => {
      const deltaSeconds = getDeltaSeconds(now, lastTimestamp);
      lastTimestamp = now;

      const bounds = getBounds(container, button);
      const update = updatePosition(
        positionRef.current,
        velocityRef.current,
        bounds,
        deltaSeconds
      );

      positionRef.current = update.position;
      velocityRef.current = update.velocity;
      applyTransform(button, update.position);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    const resizeObserver = new ResizeObserver(() => {
      initialize();
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return (
    <button
      ref={buttonRef}
      class="absolute rounded-xl bg-black px-4 py-3 text-white text-lg font-semibold border"
      onClick={onPlayAgain}
    >
      PLAY AGAIN
    </button>
  );
}

function getBounds(container: HTMLElement, button: HTMLButtonElement): Bounds {
  const containerRect = container.getBoundingClientRect();
  const buttonWidth = button.offsetWidth;
  const buttonHeight = button.offsetHeight;
  const maxX = Math.max(containerRect.width - buttonWidth, 0);
  const maxY = Math.max(containerRect.height - buttonHeight, 0);

  return { maxX, maxY };
}

function createInitialPosition(bounds: Bounds): Point {
  return {
    x: bounds.maxX * INITIAL_OFFSET_RATIO,
    y: bounds.maxY * INITIAL_OFFSET_RATIO,
  };
}

function createInitialVelocity(speed: number): Velocity {
  const xDirection = Math.random() >= 0.5 ? 1 : -1;
  const yDirection = Math.random() >= 0.5 ? 1 : -1;

  return {
    x: speed * xDirection,
    y: speed * yDirection,
  };
}

function updatePosition(
  position: Point,
  velocity: Velocity,
  bounds: Bounds,
  deltaSeconds: number
): PositionUpdate {
  const nextX = position.x + velocity.x * deltaSeconds;
  const nextY = position.y + velocity.y * deltaSeconds;

  const resolvedX = resolveAxis(nextX, velocity.x, bounds.maxX);
  const resolvedY = resolveAxis(nextY, velocity.y, bounds.maxY);

  return {
    position: {
      x: resolvedX.position,
      y: resolvedY.position,
    },
    velocity: {
      x: resolvedX.velocity,
      y: resolvedY.velocity,
    },
  };
}

function resolveAxis(
  position: number,
  velocity: number,
  max: number
): AxisUpdate {
  const shouldBounceMin = position < 0;
  const shouldBounceMax = position > max;
  const shouldBounce = shouldBounceMin || shouldBounceMax;

  if (!shouldBounce) {
    return { position, velocity };
  }

  const nextPosition = shouldBounceMin ? 0 : max;
  const nextVelocity = velocity * -1;

  return {
    position: nextPosition,
    velocity: nextVelocity,
  };
}

function applyTransform(button: HTMLButtonElement, position: Point): void {
  button.style.transform = `translate(${position.x}px, ${position.y}px)`;
}

function getDeltaSeconds(now: number, lastTimestamp: number): number {
  const deltaMs = Math.min(now - lastTimestamp, FRAME_TIME_CAP_MS);
  return deltaMs / 1000;
}
