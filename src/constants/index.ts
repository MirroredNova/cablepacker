import { Preset } from '@/types/cables';

export const EXAMPLE_PRESETS: Preset[] = [
  {
    id: '1',
    name: 'Display Cables',
    cables: [
      {
        name: 'HDMI',
        diameter: 1.5,
        id: '1',
      },
      {
        name: 'USB',
        diameter: 0.5,
        id: '2',
      },
    ],
  },
  {
    id: '2',
    name: 'Data Cables',
    cables: [
      {
        name: 'Ethernet',
        diameter: 0.8,
        id: '3',
      },
      {
        name: 'Power',
        diameter: 1.2,
        id: '4',
      },
    ],
  },
  {
    id: '3',
    name: 'Audio Cables',
    cables: [
      {
        name: 'VGA',
        diameter: 1.0,
        id: '5',
      },
      {
        name: 'Audio',
        diameter: 0.3,
        id: '6',
      },
    ],
  },
];
