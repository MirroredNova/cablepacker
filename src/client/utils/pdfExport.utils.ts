import html2canvas from 'html2canvas';
import Jspdf from 'jspdf';
import { Result } from '@/types/domain.types';

export async function exportResultToPdf(result: Result, contentRef: React.RefObject<HTMLDivElement>) {
  if (!contentRef.current) throw new Error('Content reference is null.');

  const tempContainer = document.createElement('div');
  tempContainer.style.width = '800px';
  tempContainer.style.maxWidth = '100%';
  tempContainer.style.padding = '20px';
  tempContainer.style.backgroundColor = 'white';
  tempContainer.style.display = 'flex';
  tempContainer.style.flexDirection = 'column';

  const graphicElement = contentRef.current.querySelector('[class*="ResultsGraphic"]');
  const cablesElement = contentRef.current.querySelector('[class*="ResultsCables"]');

  if (!graphicElement || !cablesElement) {
    throw new Error('Could not find all required elements');
  }

  // Construct elements as done in the original function
  const titleElement = document.createElement('h1');
  titleElement.style.textAlign = 'center';
  titleElement.style.marginBottom = '5px';
  titleElement.style.fontSize = '24px';
  titleElement.innerText = 'Cable Bore Configuration';

  const resultIdElement = document.createElement('h2');
  resultIdElement.style.textAlign = 'center';
  resultIdElement.style.marginBottom = '4px';
  resultIdElement.style.fontSize = '18px';
  resultIdElement.style.fontWeight = 'normal';
  resultIdElement.innerText = `ID: ${result.id}`;

  const boreInfoElement = document.createElement('p');
  boreInfoElement.style.textAlign = 'center';
  boreInfoElement.style.marginBottom = '4px';
  boreInfoElement.style.fontSize = '14px';
  boreInfoElement.innerText = `Bore Diameter: ${result.boreDiameter.toFixed(3)} in`;

  const dateElement = document.createElement('p');
  dateElement.style.textAlign = 'center';
  dateElement.style.marginBottom = '20px';
  dateElement.style.fontSize = '14px';
  dateElement.style.color = '#666';
  dateElement.innerText = `Generated: ${new Date(result.createdAt).toLocaleDateString()}`;

  const graphicClone = graphicElement.cloneNode(true) as HTMLElement;
  const cablesClone = cablesElement.cloneNode(true) as HTMLElement;

  const columnContainer = document.createElement('div');
  columnContainer.style.display = 'flex';
  columnContainer.style.flexDirection = 'column';
  columnContainer.style.width = '100%';
  columnContainer.style.gap = '20px';

  graphicClone.style.width = '100%';
  graphicClone.style.maxWidth = '650px';
  graphicClone.style.margin = '0 auto';
  graphicClone.style.marginBottom = '20px';

  cablesClone.style.width = '100%';
  cablesClone.style.maxWidth = '650px';
  cablesClone.style.margin = '0 auto';

  columnContainer.appendChild(graphicClone);
  columnContainer.appendChild(cablesClone);

  tempContainer.appendChild(titleElement);
  tempContainer.appendChild(resultIdElement);
  tempContainer.appendChild(boreInfoElement);
  tempContainer.appendChild(dateElement);
  tempContainer.appendChild(columnContainer);

  document.body.appendChild(tempContainer);
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';

  const canvas = await html2canvas(tempContainer, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  document.body.removeChild(tempContainer);

  const pdf = new Jspdf({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 20;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;
  const maxHeight = pageHeight - 20;

  let finalWidth = contentWidth;
  let finalHeight = contentHeight;

  if (contentHeight > maxHeight) {
    finalHeight = maxHeight;
    finalWidth = (canvas.width * maxHeight) / canvas.height;
    const xOffset = (contentWidth - finalWidth) / 2 + 10;

    pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', xOffset, 10, finalWidth, finalHeight);
  } else {
    const yOffset = (pageHeight - contentHeight) / 2;
    pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 10, yOffset, contentWidth, contentHeight);
  }

  pdf.save(`cable-bore-${result.id}.pdf`);
}
