import type { CashConfettiLayer, CashConfettiParticle } from "./types";

type CreateCashConfettiParticlesParams = {
  now: number;
  origin: { x: number; y: number };
  circleRadius: number;
};

const MIN_PARTICLE_COUNT = 20;
const MAX_PARTICLE_COUNT = 40;
const MIN_SPEED = 260;
const MAX_SPEED = 780;
const MIN_GRAVITY = 700;
const MAX_GRAVITY = 1200;
const MIN_LIFETIME_MS = 1000;
const MAX_LIFETIME_MS = 1800;
const MIN_DRAG = 0.08;
const MAX_DRAG = 0.22;
const MIN_SPIN = 1.6;
const MAX_SPIN = 5.5;
const MIN_SIZE_RATIO = 0.35;
const MAX_SIZE_RATIO = 0.6;
const SPAWN_RADIUS_RATIO = 0.45;
const MIN_SPAWN_RADIUS = 6;
const MIN_SIZE_PX = 18;
const FRONT_LAYER_PROBABILITY = 0.5;

export function createCashConfettiParticles({
  now,
  origin,
  circleRadius,
}: CreateCashConfettiParticlesParams): CashConfettiParticle[] {
  const particleCount = pickRandomInteger(
    MIN_PARTICLE_COUNT,
    MAX_PARTICLE_COUNT
  );
  const effectiveCircleRadius = Math.max(circleRadius, MIN_SPAWN_RADIUS);
  const spawnRadius = Math.max(
    MIN_SPAWN_RADIUS,
    effectiveCircleRadius * SPAWN_RADIUS_RATIO
  );
  const minSize = Math.max(MIN_SIZE_PX, effectiveCircleRadius * MIN_SIZE_RATIO);
  const maxSize = Math.max(minSize, effectiveCircleRadius * MAX_SIZE_RATIO);

  const particles: CashConfettiParticle[] = [];

  for (let i = 0; i < particleCount; i += 1) {
    const angle = pickRandomBetween(0, Math.PI * 2);
    const speed = pickRandomBetween(MIN_SPEED, MAX_SPEED);
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    const offsetAngle = pickRandomBetween(0, Math.PI * 2);
    const offsetRadius = pickRandomBetween(0, spawnRadius);
    const x = origin.x + Math.cos(offsetAngle) * offsetRadius;
    const y = origin.y + Math.sin(offsetAngle) * offsetRadius;

    const rotationVelocity =
      pickRandomBetween(MIN_SPIN, MAX_SPIN) * pickRandomSign();
    const rotation = pickRandomBetween(0, Math.PI * 2);
    const lifetimeMs = pickRandomBetween(MIN_LIFETIME_MS, MAX_LIFETIME_MS);
    const size = pickRandomBetween(minSize, maxSize);
    const gravity = pickRandomBetween(MIN_GRAVITY, MAX_GRAVITY);
    const drag = pickRandomBetween(MIN_DRAG, MAX_DRAG);
    const layer: CashConfettiLayer =
      Math.random() < FRONT_LAYER_PROBABILITY ? "front" : "back";

    particles.push({
      x,
      y,
      velocityX,
      velocityY,
      gravity,
      drag,
      rotation,
      rotationVelocity,
      size,
      bornAtMs: now,
      lifetimeMs,
      layer,
    });
  }

  return particles;
}

function pickRandomBetween(minimum: number, maximum: number): number {
  return minimum + Math.random() * (maximum - minimum);
}

function pickRandomInteger(minimum: number, maximum: number): number {
  const minValue = Math.ceil(minimum);
  const maxValue = Math.floor(maximum);
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function pickRandomSign(): number {
  return Math.random() < 0.5 ? -1 : 1;
}
