/* eslint-disable @typescript-eslint/no-unused-vars */
import { CircleStruct } from '@/types/algorithm';
import { TableRowData } from '@/types/table';
import { calculateMinimumEncloseForCircles, handleSingleCircleCase } from '@/utils/Algo';
import { mapCablesToCircles } from '@/utils/circles';

export async function POST(req: Request) {
  try {
    const cables = (await req.json()).cables as TableRowData[];

    if (!cables || cables.length === 0) {
      throw new RangeError('No data provided.');
    }

    const circles = mapCablesToCircles(cables);

    // Handle single circle case
    let bore: CircleStruct | null = null;
    if (circles.length === 1) {
      bore = handleSingleCircleCase(circles[0]);
    } else {
      const optimalData = calculateMinimumEncloseForCircles(circles);
      bore = optimalData.enclose;
      console.log('result circles', optimalData.circles);
    }

    return Response.json({ message: 'Hello World' });
  } catch (error: Error | unknown) {
    if (error instanceof RangeError) {
      return Response.json({ message: error.message }, { status: 422 });
    }
    return Response.json({ message: 'An unknown error occurred.' }, { status: 500 });
  }
}
