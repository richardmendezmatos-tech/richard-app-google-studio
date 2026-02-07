import { Lead, ActuarialReportData } from '@/types/types';

export const generateLeadPDF = async (lead: Lead) => {
    // Dynamic imports to reduce initial bundle size
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]);

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
        const finalY = (doc as any).lastAutoTable.finalY + 20;

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

export const generateActuarialReport = async (data: ActuarialReportData) => {
    const { lead, marketProjections, riskAnalysis, legalDisclaimers, reportId, issueDate } = data;

    // Dynamic imports
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]);

    const doc = new jsPDF();
    const primaryColor = [15, 23, 42]; // Slate 900
    const accentColor = [0, 174, 217]; // Cyan 500

    // -- Header --
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 50, 'F');

    // Logo / Brand
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('RICHARD AUTOMOTIVE', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('INFORME ACTUARIAL DE TASACIÓN INTELIGENTE', 20, 32);
    doc.text(`ID: ${reportId}`, 150, 25);
    doc.text(`Emisión: ${issueDate}`, 150, 32);

    // -- Customer & Vehicle Section --
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. RESUMEN EJECUTIVO', 20, 70);

    const summaryData = [
        ['Cliente', `${lead.firstName} ${lead.lastName}`],
        ['Vehículo', lead.vehicleOfInterest || 'No especificado'],
        ['Estado Actual', lead.status?.toUpperCase() || 'NEW'],
        ['Rating de Riesgo', riskAnalysis.rating]
    ];

    autoTable(doc, {
        startY: 75,
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // -- Market Projections --
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ANÁLISIS DE MERCADO Y DEPRECIACIÓN', 20, currentY);

    const projectionBody = marketProjections.map(p => [
        `Mes ${p.month}`,
        `$${p.estimatedValue.toLocaleString()}`,
        `${p.depreciationPercent}%`
    ]);

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Horizonte Temporal', 'Valor Estimado', 'Depreciación Acum.']],
        body: projectionBody,
        theme: 'striped',
        headStyles: { fillColor: accentColor as [number, number, number] },
        styles: { fontSize: 10 }
    });

    // -- Risk Analysis --
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. EVALUACIÓN DE RIESGO AI', 20, currentY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const observations = doc.splitTextToSize(riskAnalysis.observations, 170);
    doc.text(observations, 20, currentY + 8);

    // -- Legal Disclaimers --
    currentY = currentY + 15 + (observations.length * 5);
    doc.setFillColor(245, 245, 245);
    doc.rect(15, currentY, 180, 50, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('DESLINDE DE RESPONSABILIDAD LEGAL:', 20, currentY + 8);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const disclaimersText = legalDisclaimers.join('. ');
    const splitDisclaimers = doc.splitTextToSize(disclaimersText, 170);
    doc.text(splitDisclaimers, 20, currentY + 15);

    // -- Seal (Verification) --
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.5);
    doc.line(140, 260, 190, 260);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('VERIFIED BY RICHARD AI', 145, 265);
    doc.setFontSize(8);
    doc.text('Secure Digital Certification', 145, 270);

    // -- Footer --
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Richard Automotive Systems - Reporte de Uso Interno Protegido', 105, 285, { align: 'center' });

    // Save
    doc.save(`Actuarial_Report_${reportId}.pdf`);
};
