import React, { useState } from 'react';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import useResult from '@/hooks/useResult';

function ResultsEmailButton() {
  const [error, setError] = useState<string | null>(null);
  const { result } = useResult();

  const handleSendEmail = () => {
    try {
      if (!result) {
        setError('Result data is not available');
        return;
      }

      const resultUrl = typeof window !== 'undefined' ? `${window.location.origin}/${result.id}` : '';

      // Create the email subject
      const subject = `Cable Bore Configuration - ${result.id}`;

      // Create the email body
      const body = `
Hello,

I'd like to share this Cable Bore Configuration with you:

Result ID: ${result.id}
Bore Diameter: ${result.boreDiameter.toFixed(2)} in
Number of Cables: ${result.resultData?.cables?.length || 0}

You can view the full configuration at:
${resultUrl}

Thank you!
      `.trim();

      // Create the mailto URL with encoded subject and body
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Open the user's email client
      window.open(mailtoUrl, '_blank');
    } catch (err) {
      console.error('Error opening email client:', err);
      setError('Failed to open email client');
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AttachEmailIcon />} onClick={handleSendEmail}>
        Send Email
      </Button>

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

export default ResultsEmailButton;
