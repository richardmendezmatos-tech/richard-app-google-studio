
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead } from '../types';

export const generateLeadPDF = (lead: Lead) => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFillColor(0, 174, 217); // #00aed9
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('RICHARD AUTOMOTIVE', 20, 25);

    doc.setFontSize(10);
    doc.text('Automated CRM & Sales System', 20, 32);

    // -- Lead Information --
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(16);
    doc.text('HOJA DE PROSPECTO', 20, 60);

    const leadData = [
        ['ID', lead.id],
        ['Nombre', `${lead.firstName} ${lead.lastName}`],
        ['Email', lead.email || 'N/A'],
        ['Teléfono', lead.phone || 'N/A'],
        ['Vehículo de Interés', lead.vehicleOfInterest || 'No especificado'],
        ['Estado', lead.status?.toUpperCase() || 'NEW'],
        ['Fecha', lead.timestamp ? new Date((lead.timestamp.seconds || 0) * 1000).toLocaleDateString() : 'N/A']
    ];

    autoTable(doc, {
        startY: 70,
        head: [['Campo', 'Detalle']],
        body: leadData,
        theme: 'striped',
        headStyles: { fillColor: [0, 174, 217] },
        styles: { fontSize: 12 }
    });

    // -- AI Insights Section --
    if (lead.aiSummary) {
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

        doc.setFontSize(14);
        doc.setTextColor(0, 174, 217);
        doc.text('ANÁLISIS DE INTELIGENCIA ARTIFICIAL', 20, finalY);

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        // Split text to fit width
        const splitText = doc.splitTextToSize(lead.aiSummary, 170);
        doc.text(splitText, 20, finalY + 10);

        if (lead.aiScore !== undefined) {
            doc.setFontSize(12);
            doc.text(`AI Score: ${lead.aiScore}%`, 20, finalY + 10 + (splitText.length * 5) + 5);
        }
    }

    // -- Footer --
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado por: Richard AI - ${new Date().toLocaleString()}`, 20, 280);

    // Save
    doc.save(`Lead_${lead.firstName}_${lead.lastName}.pdf`);
};
