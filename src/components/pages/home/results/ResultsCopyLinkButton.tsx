import React, { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import useResult from '@/hooks/useResult';

function ResultsCopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { result } = useResult();

  const handleCopyLink = () => {
    const resultUrl = typeof window !== 'undefined' && result ? `${window.location.origin}/${result.id}` : '';

    try {
      navigator.clipboard.writeText(resultUrl);
      setCopied(true);
    } catch (err) {
      setError('Failed to copy link to clipboard');
    }
  };
  return (
    <>
      <Button variant="contained" color="primary" startIcon={<ContentCopyIcon />} onClick={handleCopyLink}>
        Copy Link
      </Button>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopied(false)} severity="success">
          Link copied to clipboard
        </Alert>
      </Snackbar>

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

export default ResultsCopyLinkButton;
