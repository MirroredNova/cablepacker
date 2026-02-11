export type Circle = {
  name: string;
  diameter: number;
  radius: number;
  coordinates: Point;
  color?: string;
};

export type Point = {
  x: number;
  y: number;
};

export type BoreResult = {
  bore: Circle;
  cables: Circle[];
};
