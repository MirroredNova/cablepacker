/* eslint-disable @typescript-eslint/no-unused-vars */
import { Circle } from '@/types/algorithm';
import { TableRowData } from '@/types/table';
import { calculateMinimumEncloseForCircles, handleSingleCircleCase } from '@/utils/algo';
import { assignColorsToCircles, mapCablesToCircles } from '@/utils/circles';

export async function POST(req: Request) {
  try {
    const cables = (await req.json()).cables as TableRowData[];

    if (!cables || cables.length === 0) {
      throw new RangeError('No data provided.');
    }

    const circles = mapCablesToCircles(cables);

    // Handle single circle case
    let bore: Circle;
    let arrangedCables: Circle[] = [];

    if (circles.length === 1) {
      bore = handleSingleCircleCase(circles[0]);
      arrangedCables = assignColorsToCircles([circles[0]]);
    } else {
      const optimalData = calculateMinimumEncloseForCircles(circles);
      bore = optimalData.enclose;
      arrangedCables = assignColorsToCircles(optimalData.circles);
    }

    const response = {
      bore,
      cables: arrangedCables,
    };

    return Response.json(response, { status: 200 });
  } catch (error: Error | unknown) {
    if (error instanceof RangeError) {
      return Response.json({ message: error.message }, { status: 422 });
    }
    return Response.json({ message: 'An unknown error occurred.' }, { status: 500 });
  }
}
