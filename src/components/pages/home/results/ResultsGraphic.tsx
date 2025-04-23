'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { Circle } from '@/types/algorithm.types';

const strokeWidth = 0.01;
const padding = 0.01;

type Props = {
  data: Circle[];
  bore: Circle;
};

export default function ResultsGraphic({ data, bore }: Props) {
  // Calculate the bounding box to fit all circles dynamically
  const xMin = Math.min(
    bore.coordinates.x - (bore.radius + strokeWidth / 2),
    ...data.map((circle) => circle.coordinates.x - circle.radius),
  ) - padding;
  const xMax = Math.max(
    bore.coordinates.x + (bore.radius + strokeWidth / 2),
    ...data.map((circle) => circle.coordinates.x + circle.radius),
  ) + padding;
  const yMin = Math.min(
    bore.coordinates.y - (bore.radius + strokeWidth / 2),
    ...data.map((circle) => circle.coordinates.y - circle.radius),
  ) - padding;
  const yMax = Math.max(
    bore.coordinates.y + (bore.radius + strokeWidth / 2),
    ...data.map((circle) => circle.coordinates.y + circle.radius),
  ) + padding;

  const width = xMax - xMin;
  const height = yMax - yMin;

  return (
    <Box flex={1} minWidth="300px" className="ResultsGraphic">
      <svg
        viewBox={`${xMin} ${-yMax} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
        }}
      >
        <circle
          cx={bore.coordinates.x}
          cy={-bore.coordinates.y}
          r={bore.radius + strokeWidth / 2}
          fill="none"
          stroke={bore.color || 'black'}
          strokeWidth={strokeWidth}
        />

        {data.map((circle, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <g key={index}>
            <circle cx={circle.coordinates.x} cy={-circle.coordinates.y} r={circle.radius} fill={circle.color} />
          </g>
        ))}
      </svg>
    </Box>
  );
}
