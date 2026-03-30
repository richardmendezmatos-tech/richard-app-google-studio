import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
    // 1. Convertir el DOM a Canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Mejora la resolución del texto
      useCORS: true, // Para imágenes externas
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
    // Proporción original: height = (imgHeight * pdfWidth) / imgWidth
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
