/**
 * Genera un archivo PDF a partir de una referencia HTML (DOM Element).
 * Diseñado para crear los "Bill of Sale" inmutables a partir de renderizados del Command Center.
 */
export const generatePDFFromDOM = async (
  elementId: string,
  filename: string = 'Documento_RichardAutomotive.pdf',
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PDF Generator] No se encontró el elemento HTML con ID: ${elementId}`);
    return;
  }

  try {
    const [html2canvasModule, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const html2canvas = html2canvasModule.default || html2canvasModule;

    // 1. Convertir el DOM a Canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // 2. Calcular dimensiones (A4 vertical standard)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // 3. Insertar la imagen en el PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 4. Descargar
    pdf.save(filename);
    console.log(`[PDF Generator] Documento descargado exitosamente: ${filename}`);
  } catch (error) {
    console.error('[PDF Generator] Fallo al generar el documento:', error);
    throw error;
  }
};
