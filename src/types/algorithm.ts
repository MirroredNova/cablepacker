// BACKEND TYPES
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

export type ApiError = {
  code: number;
  message: string;
};

export type ApiResponse = {
  success: boolean;
  data?: BoreResult;
  error?: ApiError
};
