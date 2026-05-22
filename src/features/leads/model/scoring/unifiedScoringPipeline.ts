import { Lead } from '@/shared/types/types';
import { VehicleHealthStatus } from '@/shared/types/types';
import { CognitiveProfile } from '@/shared/lib/persuasion/customerMemory';
import { calculateLeadScore } from '@/entities/lead/api/leadScoringService';
import { PredictiveScoringEngine } from './PredictiveScoringEngine';
import { NeuroScoringService } from '@/features/houston/lib/NeuroScoringService';
import { IntentAnalysisService, IntentMatrix } from './IntentAnalysisService';

export interface UnifiedScore {
  total: number;
  cms: number;
  behavioral: number;
  neuroCalibrated: number;
  intentUrgency: number;
  confidence: number;
  factors: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Weight configuration for the unified scoring pipeline
const WEIGHTS = {
  cms: 0.4,
  behavioral: 0.3,
  neuro: 0.15,
  intent: 0.15,
} as const;

const predictiveEngine = new PredictiveScoringEngine();
const intentAnalyzer = new IntentAnalysisService();

function detectCognitiveProfile(lead: Lead): CognitiveProfile {
  const memory = (lead as any).customerMemory;
  return memory?.l2_contextual?.detectedPreferences?.cognitiveProfile || 'neutral';
}

function extractLastInteraction(lead: Lead): string {
  return (lead as any).lastInteractionSummary || lead.notes || lead.message || '';
}

/**
 * Unified Scoring Pipeline (Nivel 18)
 * Combines 4 scoring dimensions into a single calibrated score:
 * - CMS (calculateLeadScore): Continuum Memory System — reactive, contextual, evolutionary
 * - Behavioral (PredictiveScoringEngine): micro-interactions, dwell time, scroll velocity
 * - Neuro (NeuroScoringService): cognitive profile multiplier
 * - Intent (IntentAnalysisService): text-derived urgency and decision maturity
 */
export async function computeUnifiedScore(
  lead: Lead,
  health?: VehicleHealthStatus | null,
): Promise<UnifiedScore> {
  const factors: string[] = [];

  // 1. CMS Score
  const cmsResult = calculateLeadScore(lead, health);
  const cmsScore = cmsResult.score;
  factors.push(...cmsResult.factors);

  // 2. Behavioral Score
  let behavioralScore: number;
  try {
    const insight = await predictiveEngine.compute(lead);
    behavioralScore = insight.score;
    factors.push(...insight.factors.map((f: string) => `[Behavioral] ${f}`));
  } catch {
    behavioralScore = cmsScore;
  }

  // 3. Neuro-Calibrated Score
  const profile = detectCognitiveProfile(lead);
  const neuroCalibrated = NeuroScoringService.calculateCalibratedProbability(cmsScore, profile);
  factors.push(`[Neuro] Perfil ${profile}: multiplicador ${(neuroCalibrated / cmsScore).toFixed(2)}`);

  // 4. Intent Analysis
  let intentUrgency = 0.5;
  const lastMessage = extractLastInteraction(lead);
  if (lastMessage.length > 3) {
    try {
      const matrix: IntentMatrix = await intentAnalyzer.extractIntent(lastMessage);
      intentUrgency = matrix.urgency;
      factors.push(`[Intent] Urgencia: ${(matrix.urgency * 100).toFixed(0)}%, Decisión: ${(matrix.decisionMaturity * 100).toFixed(0)}%`);
    } catch {
      intentUrgency = 0.5;
    }
  }

  // Composite: weighted sum
  const total = Math.round(
    cmsScore * WEIGHTS.cms +
    behavioralScore * WEIGHTS.behavioral +
    neuroCalibrated * WEIGHTS.neuro +
    intentUrgency * 100 * WEIGHTS.intent,
  );

  const clamped = Math.min(Math.max(total, 0), 100);

  let priority: UnifiedScore['priority'] = 'low';
  if (clamped >= 90 || health?.overallStatus === 'critical') priority = 'urgent';
  else if (clamped >= 70) priority = 'high';
  else if (clamped >= 40) priority = 'medium';

  return {
    total: clamped,
    cms: cmsScore,
    behavioral: behavioralScore,
    neuroCalibrated,
    intentUrgency,
    confidence: 0.92,
    factors,
    priority,
  };
}
