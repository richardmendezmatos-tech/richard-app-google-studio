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
    const memory = lead.customerMemory;

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

    // 2. Continuum Memory System (CMS) - Adaptive Logic
    if (memory) {
        // L1: Reactive (Surpresa de comportamento imediato)
        if (memory.l1_reactive?.activeContext) {
            score += 12;
            factors.push('Foco Activo: Interacción Real-time (+12)');
        }

        // L2: Contextual (Patrones de Intención)
        if (memory.l2_contextual?.intentScore && memory.l2_contextual.intentScore > 70) {
            score += 15;
            factors.push('Contexto L2: Alta Intención Detectada (+15)');
        }

        // L3: Evolutivo (Ciclo de Vida)
        if (memory.l3_evolutivo?.lifecycleStage === 'decision' || memory.l3_evolutivo?.lifecycleStage === 'trade-in') {
            score += 20;
            factors.push('Fase L3: Punto de Decisión/Trade-in (+20)');
        }
    }

    // 3. Lead Type Logic (Legacy/Complementary)
    if (lead.type === 'trade-in' && !memory?.l3_evolutivo) {
        score += 10;
        factors.push('Interés en Trade-In (+10)');
    } else if (lead.type === 'finance') {
        score += 8;
        factors.push('Solicitud de Financiamiento (+8)');
    }

    // 4. Status Weighting
    if (lead.status === 'new') {
        score += 5;
        factors.push('Nuevo Prospecto (+5)');
    }

    // Cap at 100
    score = Math.min(100, Math.max(0, score));

    // Determine Priority Level
    let priority: ScoringResult['priority'] = 'low';

    // Self-Modifying Priority Thresholds
    const isHighPriorityCycle = memory?.l3_evolutivo?.lifecycleStage === 'decision';
    const urgentThreshold = isHighPriorityCycle ? 85 : 90;

    if (score >= urgentThreshold || (health?.overallStatus === 'critical')) priority = 'urgent';
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
