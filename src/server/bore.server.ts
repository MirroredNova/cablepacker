'use server';

import { TableRowData } from '@/types/table';
import { ApiResponse } from '@/types/algorithm';
import { calculateMinimumEncloseForCircles, handleSingleCircleCase } from '@/utils/algo';
import { assignColorsToCircles, mapCablesToCircles } from '@/utils/circles';
import { getMaxCircles } from '@/config';

export async function generateBoreAction(cables: TableRowData[]): Promise<ApiResponse> {
  try {
    if (!cables || cables.length === 0) {
      throw new RangeError('No cables entered.');
    }

    const circles = mapCablesToCircles(cables);

    const maxCircles = getMaxCircles();
    if (circles.length > maxCircles) {
      throw new RangeError(`Exceeded maximum number of cables (${maxCircles}).`);
    }

    if (circles.length === 1) {
      const bore = handleSingleCircleCase(circles[0]);
      const arrangedCables = assignColorsToCircles([circles[0]]);
      return {
        success: true,
        data: {
          bore,
          cables: arrangedCables,
        },
      };
    }

    const optimalData = calculateMinimumEncloseForCircles(circles);
    const arrangedCables = assignColorsToCircles(optimalData.circles);

    return {
      success: true,
      data: {
        bore: optimalData.enclose,
        cables: arrangedCables,
      },
    };
  } catch (error: unknown) {
    if (error instanceof RangeError) {
      return {
        success: false,
        error: {
          code: 422,
          message: error.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: 500,
        message: 'Internal server error.',
      },
    };
  }
}
