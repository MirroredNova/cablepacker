import { TableRowData } from '@/types/table';

export const generateBore = async (cables: TableRowData[]) => {
  const res = await fetch('/api/generate-bore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cables }),
  });
  return res;
};
