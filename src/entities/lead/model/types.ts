import { z } from 'zod';
import { FirestoreTimestamp } from '@/shared/types/firestore';

export interface BehavioralFingerprint {
  scrollVelocity: number;
  imageDwellTime: Record<string, number>;
  featureInteractions: string[];
  lastMicroInteraction: number;
  interactionIntensity: number;
}

export interface Lead {
  id: string;
  type: 'whatsapp' | 'form' | 'trade-in' | 'visual_ai' | 'chat' | 'finance' | 'general';
  status: 'new' | 'contacted' | 'negotiation' | 'sold' | 'lost' | 'negotiating';
  name?: string; // Legacy 'name' instead of firstName/lastName
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  ssn?: string;
  ssn_encrypted?: string;
  carId?: string;
  notes?: string;
  hasCreditApplication?: boolean;
  hasPronto?: boolean;
  dealerId?: string;
  category?: string;
  monthlyIncome?: number;
  createdAt?: FirestoreTimestamp;
  timestamp?: FirestoreTimestamp; // Support both for backward compatibility

  // Context
  vehicleOfInterest?: string; // Car Name
  vehicleId?: string;
  tradeInDetails?: string; // "2018 Toyota Camry"
  tradeInPhotos?: string[]; // Array of photo URLs
  message?: string; // Chat summary or initial message

  // AI Metrics
  aiScore?: number; // 0-100
  aiSummary?: string; // "High intent, good credit"
  aiAnalysis?: {
    score: number;
    category: string;
    insights: string[];
    nextAction: string;
    reasoning: string;
    unidad_interes: string;
  };

  // Automation Status
  emailSent?: boolean;
  nudgeSent?: boolean;
  lastContacted?: FirestoreTimestamp;
  chatInteractions?: number;
  responded?: boolean;
  documentsSent?: boolean;
  dealClosed?: boolean;
  appointmentCompleted?: boolean;

  // Phase 21: Marketing Intelligence
  acquisitionCost?: number; // In USD
  source?: 'facebook' | 'google' | 'direct' | 'referral' | 'instagram' | string;
  sourceCampaign?: string;

  // Phase 22: Ad Predictive Capture
  marketingData?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    fbclid?: string;
    gclid?: string;
    fbp?: string;
    fbc?: string;
    sessionEntryTimestamp?: number;
    landingPage?: string;
  };

  // Nivel 14: Predictive Scaling (Orquestación Predictiva)
  closureProbability?: number; // 0-100 (Probability of closing sale)
  intentTrajectory?: 'improving' | 'stable' | 'declining';
  behavioralFingerprint?: {
    scrollVelocity: number; // Pixels per second
    imageDwellTime: Record<string, number>; // imageId -> milliseconds
    featureInteractions: string[]; // ['compare', 'share', 'specs']
    lastMicroInteraction: number;
    interactionIntensity: number; // 0-10 (Weighted activity)
  };

  behavioralMetrics?: {
    timeOnSite?: number;
    inventoryViews?: number;
    highValueInteractions?: number;
    lastActive?: number;
    intentTrajectory?: 'improving' | 'stable' | 'declining';
  };

  // Continuum Memory System (CMS) - Nested Learning
  customerMemory?: {
    l1_reactive?: {
      lastClick?: string;
      currentTopic?: string;
      activeContext: boolean;
    };
    l2_contextual?: {
      interestPatterns: string[];
      intentScore: number;
      detectedPreferences: Record<string, string>;
    };
    l3_evolutivo?: {
      lifecycleStage: 'discovery' | 'consideration' | 'decision' | 'trade-in' | 'loyal';
      historicalInsights: string[];
      nextMilestone?: string;
      predictedIntent: string; // New for Nivel 14
    };
    // Legacy support
    preferences?: {
      models?: string[];
      colors?: string[];
      features?: string[];
      budgetRange?: string;
    };
    objections?: string[];
    lifestyle?: string;
    lastInteractionSummary?: string;
    historicalContext?: string[];
  };
}

// Predictive & Intelligence Types migrated from entities/shared
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
