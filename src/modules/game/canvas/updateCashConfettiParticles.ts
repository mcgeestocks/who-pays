import type { CashConfettiParticle } from "./types";

type UpdateCashConfettiParticlesParams = {
  now: number;
  particles: CashConfettiParticle[];
  lastUpdatedAtMs: number;
};

type UpdateCashConfettiParticlesResult = {
  particles: CashConfettiParticle[];
  lastUpdatedAtMs: number;
};

const MAX_DELTA_SECONDS = 0.05;

export function updateCashConfettiParticles({
  now,
  particles,
  lastUpdatedAtMs,
}: UpdateCashConfettiParticlesParams): UpdateCashConfettiParticlesResult {
  if (particles.length === 0) {
    return { particles, lastUpdatedAtMs: 0 };
  }

  const resolvedLastUpdatedAtMs =
    lastUpdatedAtMs > 0 ? lastUpdatedAtMs : now;
  const deltaSeconds = getDeltaSeconds(now, resolvedLastUpdatedAtMs);
  const updatedParticles: CashConfettiParticle[] = [];

  particles.forEach((particle) => {
    const ageMs = now - particle.bornAtMs;
    if (!shouldKeepCashConfettiParticle(ageMs, particle.lifetimeMs)) {
      return;
    }

    applyCashConfettiMotion(particle, deltaSeconds);
    updatedParticles.push(particle);
  });

  return { particles: updatedParticles, lastUpdatedAtMs: now };
}

function getDeltaSeconds(now: number, lastUpdatedAtMs: number): number {
  const deltaSeconds = (now - lastUpdatedAtMs) / 1000;
  if (deltaSeconds <= 0) return 0;
  return Math.min(deltaSeconds, MAX_DELTA_SECONDS);
}

function shouldKeepCashConfettiParticle(
  ageMs: number,
  lifetimeMs: number
): boolean {
  return ageMs < lifetimeMs;
}

function applyCashConfettiMotion(
  particle: CashConfettiParticle,
  deltaSeconds: number
): void {
  if (deltaSeconds <= 0) return;

  particle.velocityY += particle.gravity * deltaSeconds;

  const dragAmount = particle.drag * deltaSeconds;
  const dragMultiplier = Math.max(0, 1 - dragAmount);
  particle.velocityX *= dragMultiplier;
  particle.velocityY *= dragMultiplier;

  particle.x += particle.velocityX * deltaSeconds;
  particle.y += particle.velocityY * deltaSeconds;
  particle.rotation += particle.rotationVelocity * deltaSeconds;
}
