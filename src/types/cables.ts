export type Cable = {
  id: string;
  name: string;
  diameter: number;
};

export type Preset = {
  id: string;
  name: string;
  cables: Cable[];
};
