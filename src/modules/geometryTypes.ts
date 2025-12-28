export type Point = {
  x: number;
  y: number;
};

export type OrientedPoint = Point & {
  angle: number;
};

export type TouchPoint = Point & {
  frozen: boolean;
};
