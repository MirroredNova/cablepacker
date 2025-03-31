'use server';

import { getMaxCircles } from '@/config';
import { saveResultAction } from '@/server/actions/results.actions';
import { calculateMinimumEncloseForCircles } from '@/server/utils/algo.utils';
import { assignColorsToCircles, mapCablesToCircles } from '@/server/utils/circles.utils';
import { generateResultId } from '@/server/utils/result.utils';
import { ApiResponse } from '@/types/algorithm.types';
import { CreateResult } from '@/types/domain.types';
import { TableRowData } from '@/types/table.types';

export async function generateBoreAction(
  cables: TableRowData[],
  selectedPresetId: number | null,
): Promise<ApiResponse> {
  try {
    if (!cables || cables.length === 0) {
      throw new RangeError('No cables entered.');
    }

    const circleList = mapCablesToCircles(cables);

    const maxCircles = getMaxCircles();
    if (circleList.length > maxCircles) {
      throw new RangeError(`Exceeded maximum number of cables (${maxCircles}).`);
    }

    const id = generateResultId();
    const { enclose, circles } = calculateMinimumEncloseForCircles(circleList);
    const arrangedCables = assignColorsToCircles(circles);

    const result: CreateResult = {
      inputCables: cables,
      resultData: {
        id,
        bore: enclose,
        cables: arrangedCables,
        createdAt: new Date().toISOString(),
      },
    };

    // Save the result to the database
    const res = await saveResultAction(result, selectedPresetId);

    if (!res.success) {
      throw new Error('Failed to save the result.');
    } else {
      return {
        success: true,
        data: result.resultData,
      };
    }
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
