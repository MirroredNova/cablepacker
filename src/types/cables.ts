export type Cable = {
  name: string;
  diameter: number;
  quantity: number
};

export type Preset = {
  name: string;
  cables: Cable[];
};
