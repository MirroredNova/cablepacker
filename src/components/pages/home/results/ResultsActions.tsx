import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import html2canvas from 'html2canvas';
import Jspdf from 'jspdf';
import { Result } from '@/types/domain.types';

type Props = {
  result: Result;
  contentRef: React.RefObject<HTMLDivElement>;
};

function ResultsActions({ result, contentRef }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleCopyLink = () => {
    const resultUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/${result.id}`
      : '';

    try {
      navigator.clipboard.writeText(resultUrl);
      setCopied(true);
    } catch (err) {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleExportPdf = async () => {
    if (!contentRef.current) return;

    setExporting(true);

    try {
      // Create a temporary container to manipulate for PDF export
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '800px'; // Fixed width for consistent rendering
      tempContainer.style.maxWidth = '100%';
      tempContainer.style.padding = '20px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.display = 'flex';
      tempContainer.style.flexDirection = 'column';

      // Find the original elements
      const graphicElement = contentRef.current.querySelector('[class*="ResultsGraphic"]');
      const cablesElement = contentRef.current.querySelector('[class*="ResultsCables"]');

      if (!graphicElement || !cablesElement) {
        throw new Error('Could not find all required elements');
      }

      // Create a title for the PDF
      const titleElement = document.createElement('h1');
      titleElement.style.textAlign = 'center';
      titleElement.style.marginBottom = '5px';
      titleElement.style.fontSize = '24px';
      titleElement.innerText = 'Cable Bore Configuration';

      // Create result ID text
      const resultIdElement = document.createElement('h2');
      resultIdElement.style.textAlign = 'center';
      resultIdElement.style.marginBottom = '4px';
      resultIdElement.style.fontSize = '18px';
      resultIdElement.style.fontWeight = 'normal';
      resultIdElement.innerText = `ID: ${result.id}`;

      // Create bore info text if available
      const boreInfoElement = document.createElement('p');
      boreInfoElement.style.textAlign = 'center';
      boreInfoElement.style.marginBottom = '4px';
      boreInfoElement.style.fontSize = '14px';
      boreInfoElement.innerText = `Bore Diameter: ${result.boreDiameter.toFixed(2)} in`;

      // Create date text
      const dateElement = document.createElement('p');
      dateElement.style.textAlign = 'center';
      dateElement.style.marginBottom = '20px';
      dateElement.style.fontSize = '14px';
      dateElement.style.color = '#666';
      dateElement.innerText = `Generated: ${new Date(result.createdAt).toLocaleDateString()}`;

      // Clone the elements to avoid modifying the originals
      const graphicClone = graphicElement.cloneNode(true) as HTMLElement;
      const cablesClone = cablesElement.cloneNode(true) as HTMLElement;

      // Create column layout container
      const columnContainer = document.createElement('div');
      columnContainer.style.display = 'flex';
      columnContainer.style.flexDirection = 'column';
      columnContainer.style.width = '100%';
      columnContainer.style.gap = '20px';

      // Style the cloned elements
      graphicClone.style.width = '100%';
      graphicClone.style.maxWidth = '650px';
      graphicClone.style.margin = '0 auto';
      graphicClone.style.marginBottom = '20px';

      cablesClone.style.width = '100%';
      cablesClone.style.maxWidth = '650px';
      cablesClone.style.margin = '0 auto';

      // Add elements to container in the desired order:
      // 1. Graphic
      // 2. Cables
      columnContainer.appendChild(graphicClone);
      columnContainer.appendChild(cablesClone);

      // Add all elements to the temp container
      tempContainer.appendChild(titleElement);
      tempContainer.appendChild(resultIdElement);
      tempContainer.appendChild(boreInfoElement);
      tempContainer.appendChild(dateElement);
      tempContainer.appendChild(columnContainer);

      // Add temporary container to document (invisible)
      document.body.appendChild(tempContainer);
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.classList.add('generating-pdf');

      // Render to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF in portrait orientation
      const pdf = new Jspdf({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Get PDF dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate content dimensions to fit the page while maintaining aspect ratio
      const contentWidth = pageWidth - 20; // 10mm margin on each side
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      // If content is too tall, scale it to fit one page
      const maxHeight = pageHeight - 20; // 10mm margin on top and bottom

      let finalWidth = contentWidth;
      let finalHeight = contentHeight;

      // Scale down if necessary to fit on one page
      if (contentHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (canvas.width * maxHeight) / canvas.height;

        // Center horizontally if width is reduced
        const xOffset = (contentWidth - finalWidth) / 2 + 10; // Adding the 10mm left margin back

        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          xOffset, // centered x position
          10, // y position (10mm from top)
          finalWidth,
          finalHeight,
        );
      } else {
        // Center vertically if there's extra space
        const yOffset = (pageHeight - contentHeight) / 2;

        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          10, // x position (10mm from left)
          yOffset, // centered y position
          contentWidth,
          contentHeight,
        );
      }

      pdf.save(`cable-bore-${result.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyLink}
        >
          Copy Link
        </Button>
      </Stack>

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

export default ResultsActions;
