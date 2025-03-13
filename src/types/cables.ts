// Cable type for individual cables
type Cable = {
  id: string; // Unique identifier for the cable
  name: string; // Cable name
  diameter: number; // Cable diameter in mm
};

// Preset type for groups of cables
type Preset = {
  id: string;
  name: string; // Preset name
  cables: Cable[]; // List of cables in the preset
};

export type { Cable, Preset };
