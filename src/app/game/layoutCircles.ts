import type { Circle } from "./types/Circle";

type LayoutOptions = {
  width: number;
  height: number;
  count: number;
};

export function layoutCircles({
  width,
  height,
  count,
}: LayoutOptions): Circle[] {
  if (count <= 6) {
    return layoutRing(width, height, count);
  }

  return layoutGrid(width, height, count);
}

function layoutRing(width: number, height: number, count: number): Circle[] {
  const circles: Circle[] = [];
  const radius = Math.min(width, height) * 0.12;
  const centerX = width / 2;
  const centerY = height / 2;
  const ringRadius = Math.min(width, height) * 0.3;

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    circles.push({
      id: i,
      x: centerX + Math.cos(angle) * ringRadius,
      y: centerY + Math.sin(angle) * ringRadius,
      radius,
      state: "idle",
      holdProgress: 0,
    });
  }

  return circles;
}

function layoutGrid(width: number, height: number, count: number): Circle[] {
  const circles: Circle[] = [];
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const padding = 24;
  const cellWidth = (width - padding * 2) / columns;
  const cellHeight = (height - padding * 2) / rows;
  const radius = Math.min(cellWidth, cellHeight) * 0.32;

  for (let i = 0; i < count; i += 1) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    circles.push({
      id: i,
      x: padding + col * cellWidth + cellWidth / 2,
      y: padding + row * cellHeight + cellHeight / 2,
      radius,
      state: "idle",
      holdProgress: 0,
    });
  }

  return circles;
}
