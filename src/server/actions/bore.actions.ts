'use server';

import { getMaxCircles } from '@/config';
import { saveResultAction } from '@/server/actions/results.actions';
import { calculateMinimumEncloseForCircles } from '@/server/utils/algo.utils';
import { assignColorsToCircles, mapCablesToCircles } from '@/server/utils/circles.utils';
import { generateResultId } from '@/server/utils/result.utils';
import { ApiResponse, CreateResult, Result } from '@/types/domain.types';
import { TableRowData } from '@/types/table.types';

export async function generateBoreAction(
  cables: TableRowData[],
  selectedPresetId: number | null,
): Promise<ApiResponse<Result>> {
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
      id,
      inputCables: cables,
      resultData: {
        bore: enclose,
        cables: arrangedCables,
      },
      selectedPresetId,
      cableCount: circleList.length,
      boreDiameter: enclose.diameter,
      createdAt: new Date(),
    };

    const res = await saveResultAction(result);

    if (!res.success) {
      throw new Error('Failed to save the result.');
    } else {
      return {
        success: true,
        data: result,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
