import type { CashConfettiLayer, CashConfettiParticle } from "./types";

type DrawCashConfettiParticlesParams = {
  ctx: CanvasRenderingContext2D;
  particles: CashConfettiParticle[];
  now: number;
  layer: CashConfettiLayer;
};

const CASH_EMOJI = "\u{1F4B8}";
const CASH_CONFETTI_FONT_STACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", "EmojiOne Color", system-ui';
const CASH_CONFETTI_FONT_WEIGHT = "600";
const FADE_IN_PORTION = 0.12;
const FADE_OUT_START = 0.72;

export function drawCashConfettiParticles({
  ctx,
  particles,
  now,
  layer,
}: DrawCashConfettiParticlesParams): void {
  if (particles.length === 0) return;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  particles.forEach((particle) => {
    if (particle.layer !== layer) return;

    const ageMs = now - particle.bornAtMs;
    if (ageMs <= 0 || ageMs >= particle.lifetimeMs) return;

    const lifeProgress = clamp(ageMs / particle.lifetimeMs, 0, 1);
    const opacity = getCashConfettiOpacity(lifeProgress);
    if (opacity <= 0) return;

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.globalAlpha = opacity;
    ctx.font = `${CASH_CONFETTI_FONT_WEIGHT} ${particle.size}px ${CASH_CONFETTI_FONT_STACK}`;
    ctx.fillText(CASH_EMOJI, 0, 0);
    ctx.restore();
  });

  ctx.restore();
}

function getCashConfettiOpacity(lifeProgress: number): number {
  if (lifeProgress < FADE_IN_PORTION) {
    return lifeProgress / FADE_IN_PORTION;
  }
  if (lifeProgress > FADE_OUT_START) {
    return (1 - lifeProgress) / (1 - FADE_OUT_START);
  }
  return 1;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
