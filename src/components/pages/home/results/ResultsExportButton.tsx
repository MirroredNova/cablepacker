import React, { useState } from 'react';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import useResult from '@/hooks/useResult';
import { exportResultToPdf } from '@/client/utils/pdfExport.utils';

type Props = {
  contentRef: React.RefObject<HTMLDivElement>;
};

function ResultsExportButton({ contentRef }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const { result } = useResult();

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      if (!result) {
        setError('No result available to export.');
        return;
      }
      await exportResultToPdf(result, contentRef);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExportPdf}
          disabled={exporting}
        >
          {exporting ? 'Generating...' : 'Export PDF'}
        </Button>
      </Stack>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ResultsExportButton;
