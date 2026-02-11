import { Lead, VehicleHealthStatus } from '@/types/types';

/**
 * Dynamic Lead Scoring System
 * Prioritizes leads based on a combine of AI analysis, engagement, and IoT vehicle health.
 */

export interface ScoringResult {
    score: number;
    factors: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const calculateLeadScore = (lead: Lead, health?: VehicleHealthStatus | null): ScoringResult => {
    let score = lead.aiScore || 50;
    const factors: string[] = [];

    // 1. Vehicle Health Urgency (The Core IoT Insight)
    if (health) {
        if (health.overallStatus === 'critical') {
            score += 35;
            factors.push('Urgencia Mecánica Crítica (+35)');
        } else if (health.overallStatus === 'warning') {
            score += 15;
            factors.push('Aviso Preventivo de Salud (+15)');
        }
    }

    // 2. Lead Type Logic
    if (lead.type === 'trade-in') {
        score += 10;
        factors.push('Interés en Trade-In (+10)');
    } else if (lead.type === 'finance') {
        score += 8;
        factors.push('Solicitud de Financiamiento (+8)');
    }

    // 3. Status Weighting
    if (lead.status === 'new') {
        score += 5;
        factors.push('Nuevo Prospecto (+5)');
    }

    // Cap at 100
    score = Math.min(100, Math.max(0, score));

    // Determine Priority Level
    let priority: ScoringResult['priority'] = 'low';
    if (score >= 90 || (health?.overallStatus === 'critical')) priority = 'urgent';
    else if (score >= 70) priority = 'high';
    else if (score >= 40) priority = 'medium';

    return {
        score,
        factors,
        priority
    };
};

/**
 * Hook-friendly utility to sort leads by priority
 */
export const sortLeadsByPriority = (leads: Lead[], healthMap: Record<string, VehicleHealthStatus>) => {
    return [...leads].sort((a, b) => {
        const scoreA = calculateLeadScore(a, healthMap[a.vehicleId || '']).score;
        const scoreB = calculateLeadScore(b, healthMap[b.vehicleId || '']).score;
        return scoreB - scoreA;
    });
};
