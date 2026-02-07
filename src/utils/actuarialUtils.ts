import { Lead, ActuarialReportData, MarketProjection } from '@/types/types';

export const generateMockActuarialData = (lead: Lead): ActuarialReportData => {
    const basePrice = 25000; // Mock base price if not available
    const reportId = `ACT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const issueDate = new Date().toLocaleDateString();

    const marketProjections: MarketProjection[] = [
        { month: 12, estimatedValue: basePrice * 0.85, depreciationPercent: 15 },
        { month: 24, estimatedValue: basePrice * 0.72, depreciationPercent: 28 },
        { month: 36, estimatedValue: basePrice * 0.60, depreciationPercent: 40 },
    ];

    const riskAnalysis = {
        score: lead.aiScore || 75,
        rating: ((lead.aiScore || 75) > 90 ? 'A+' : (lead.aiScore || 75) > 80 ? 'A' : 'B') as 'A+' | 'A' | 'B' | 'C' | 'D',
        observations: lead.aiSummary || "El perfil del cliente muestra una intención de compra sólida con estabilidad financiera proyectada. Se recomienda seguimiento prioritario para cierre en el trimestre actual."
    };

    const legalDisclaimers = [
        "Este informe es una proyección estadística basada en datos históricos de mercado y algoritmos de IA.",
        "Richard Automotive no garantiza el valor futuro exacto del vehículo.",
        "La tasación técnica está sujeta a inspección física presencial obligatoria.",
        "Las proyecciones financieras no constituyen asesoramiento de inversión legalmente vinculante."
    ];

    return {
        reportId,
        issueDate,
        lead,
        marketProjections,
        riskAnalysis,
        legalDisclaimers
    };
};
