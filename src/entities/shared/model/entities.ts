import { z } from 'zod';

export type { Lead, Car, CarType, UserRole, AppUser } from '@/shared/types/types';

export interface HoustonMetric {
  label: string;
  value: number | string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export interface HoustonTelemetry {
  systemHealth: 'online' | 'degraded' | 'offline';
  lastUpdate: number;
  metrics: {
    inferenceLatency: HoustonMetric;
    tokenUsage: HoustonMetric;
    autonomyRate: HoustonMetric;
    apiStability: HoustonMetric;
  };
  recentEvents: Array<{
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error';
    message: string;
    source: string;
  }>;
}

export const PredictiveInsightSchema = z.object({
  leadId: z.string(),
  score: z.number(),
  confidence: z.number(),
  factors: z.array(z.string()),
  predictedAction: z.string(),
  timestamp: z.any().transform((val) => {
    if (typeof val === 'number') return val;
    if (val && typeof val.toMillis === 'function') return val.toMillis();
    return Date.now();
  }),
});

export type PredictiveInsight = z.infer<typeof PredictiveInsightSchema>;

export interface OutreachOpportunity {
  leadId: string;
  opportunityScale: number; // 0-100
  reason: string;
  suggestedAction: string;
  potentialRoi: number;
  expiresAt: number;
  actionType: 'whatsapp' | 'strategy';
  whatsappPayload?: {
    phone: string;
    message: string;
  };
}

export interface MarginAdjustment {
  leadId: string;
  inventoryId: string;
  basePrice: number;
  adjustedPrice: number;
  allowedDiscount: number;
  reason: string;
  confidenceScore: number;
}
