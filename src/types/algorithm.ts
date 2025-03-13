// Types
export type CircleStruct = {
  name: string;
  diameter: number;
  radius: number;
  coordinates: PointStruct;
  colour?: string;
};

export type PointStruct = {
  x: number;
  y: number;
};

export type BoreStruct = {
  boreIncrement: number;
  minBore: number;
};

export type QueueStruct = {
  queue: number[];
};
