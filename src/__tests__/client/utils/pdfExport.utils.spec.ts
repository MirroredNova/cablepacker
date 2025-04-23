import { describe, it, expect, vi, beforeEach } from 'vitest';
import html2canvas from 'html2canvas';
import Jspdf from 'jspdf';
import { exportResultToPdf } from '@/client/utils/pdfExport.utils';
import { Result } from '@/types/domain.types';

// Mock external dependencies
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    width: 800,
    height: 1000,
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockedData'),
  }),
}));

// Create spy functions for jspdf methods
const addImageMock = vi.fn();
const saveMock = vi.fn();

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297),
      },
    },
    // Use the spy functions directly
    addImage: addImageMock,
    save: saveMock,
  })),
}));

describe('exportResultToPdf', () => {
  let mockResult: Result;
  let mockContentRef: { current: HTMLDivElement };
  let mockGraphicElement: HTMLDivElement;
  let mockCablesElement: HTMLDivElement;
  let mockAppendChildSpy: any;
  let mockRemoveChildSpy: any;

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();

    // Setup mock DOM elements
    mockGraphicElement = document.createElement('div');
    mockGraphicElement.className = 'ResultsGraphic';
    mockGraphicElement.style.width = '400px';

    mockCablesElement = document.createElement('div');
    mockCablesElement.className = 'ResultsCables';
    mockCablesElement.style.width = '400px';

    // Setup content ref with our mock elements
    const mockDiv = document.createElement('div');
    mockDiv.appendChild(mockGraphicElement);
    mockDiv.appendChild(mockCablesElement);

    mockContentRef = { current: mockDiv };

    // Setup sample result data
    mockResult = {
      id: 'test-123',
      boreDiameter: 4.75,
      createdAt: new Date('2023-01-01'),
      resultData: {
        cables: [],
        bore: {
          name: 'test-bore',
          diameter: 4.75,
          radius: 2.375,
          coordinates: { x: 0, y: 0 },
          color: 'black',
        },
      },
      inputCables: [],
      selectedPresetId: null,
      cableCount: 0,
    };

    // Mock document.body methods
    mockAppendChildSpy = vi.spyOn(document.body, 'appendChild');
    mockRemoveChildSpy = vi.spyOn(document.body, 'removeChild');

    // Mock element.cloneNode
    mockGraphicElement.cloneNode = vi.fn().mockReturnValue(document.createElement('div'));
    mockCablesElement.cloneNode = vi.fn().mockReturnValue(document.createElement('div'));

    // Silence console errors for testing error cases
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should throw an error if required elements are not found', async () => {
    // Create a div without the required elements
    mockContentRef.current = document.createElement('div');

    await expect(exportResultToPdf(mockResult, mockContentRef))
      .rejects
      .toThrow('Could not find all required elements');
  });

  it('should create a temporary container with proper structure', async () => {
    await exportResultToPdf(mockResult, mockContentRef);

    // Verify a temp container was added to the document body
    expect(mockAppendChildSpy).toHaveBeenCalled();

    // Get the container that was added
    const container = mockAppendChildSpy.mock.calls[0][0];

    // Check container styling
    expect(container.style.width).toBe('800px');
    expect(container.style.backgroundColor).toBe('white');
    expect(container.style.display).toBe('flex');

    // Check container children
    const { children } = container;

    // Title element
    expect(children[0].tagName).toBe('H1');
    expect(children[0].innerText).toBe('Cable Bore Configuration');

    // Result ID element
    expect(children[1].tagName).toBe('H2');
    expect(children[1].innerText).toBe(`ID: ${mockResult.id}`);

    // Bore info element
    expect(children[2].tagName).toBe('P');
    expect(children[2].innerText).toBe(`Bore Diameter: ${mockResult.boreDiameter.toFixed(2)} in`);

    // Date element
    expect(children[3].tagName).toBe('P');
    expect(children[3].innerText).toContain('Generated:');
  });

  it('should call html2canvas with correct parameters', async () => {
    await exportResultToPdf(mockResult, mockContentRef);

    expect(html2canvas).toHaveBeenCalled();
    const options = (html2canvas as any).mock.calls[0][1];
    expect(options.scale).toBe(2);
    expect(options.useCORS).toBe(true);
    expect(options.backgroundColor).toBe('#ffffff');
  });

  it('should remove the temporary container after capturing', async () => {
    await exportResultToPdf(mockResult, mockContentRef);

    expect(mockRemoveChildSpy).toHaveBeenCalled();
  });

  it('should create PDF with correct orientation and format', async () => {
    await exportResultToPdf(mockResult, mockContentRef);

    expect(Jspdf).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  });

  it('should add image to PDF for normal height content', async () => {
    // Mock a canvas with normal height (less than page height)
    (html2canvas as any).mockResolvedValue({
      width: 800,
      height: 800, // Smaller than max height of page
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockedData'),
    });

    await exportResultToPdf(mockResult, mockContentRef);

    // Use the direct spy instead of accessing via the mock instance
    expect(addImageMock).toHaveBeenCalledWith(
      'data:image/png;base64,mockedData',
      'PNG',
      10,
      expect.any(Number), // yOffset calculation
      expect.any(Number), // contentWidth
      expect.any(Number), // contentHeight
    );
  });

  it('should add image to PDF for tall content with adjusted dimensions', async () => {
    // Mock a canvas with height that exceeds page height
    (html2canvas as any).mockResolvedValue({
      width: 800,
      height: 2000, // Taller than page height
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockedData'),
    });

    await exportResultToPdf(mockResult, mockContentRef);

    // Use the direct spy instead of accessing via the mock instance
    expect(addImageMock).toHaveBeenCalledWith(
      'data:image/png;base64,mockedData',
      'PNG',
      expect.any(Number), // xOffset calculation
      10,
      expect.any(Number), // finalWidth
      expect.any(Number), // finalHeight (maxHeight)
    );
  });

  it('should save PDF with correct filename', async () => {
    await exportResultToPdf(mockResult, mockContentRef);

    // Use the direct spy instead of accessing via the mock instance
    expect(saveMock).toHaveBeenCalledWith(`cable-bore-${mockResult.id}.pdf`);
  });

  it('should handle elements with different dimensions', async () => {
    // Create elements with different dimensions
    mockGraphicElement.style.width = '300px';
    mockGraphicElement.style.height = '200px';

    mockCablesElement.style.width = '500px';
    mockCablesElement.style.height = '600px';

    await exportResultToPdf(mockResult, mockContentRef);

    // Still creates PDF successfully
    expect(saveMock).toHaveBeenCalled();
  });
});
