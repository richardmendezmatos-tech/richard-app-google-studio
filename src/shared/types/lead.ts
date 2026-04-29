import { z } from 'zod';
import { FirestoreTimestamp } from './firestore';

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
  name?: string;
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
  creditTier?: 'excellent' | 'good' | 'fair' | 'poor';
  dealerId?: string;
  category?: string;
  monthlyIncome?: number;
  createdAt?: FirestoreTimestamp;
  timestamp?: FirestoreTimestamp;

  // Context
  vehicleOfInterest?: string;
  vehicleId?: string;
  tradeInDetails?: string;
  tradeInPhotos?: string[];
  message?: string;

  // AI Metrics
  aiScore?: number;
  predictiveScore?: number;
  aiSummary?: string;
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

  // Marketing Intelligence
  acquisitionCost?: number;
  source?: 'facebook' | 'google' | 'direct' | 'referral' | 'instagram' | string;
  sourceCampaign?: string;

  // Ad Predictive Capture
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

  // Predictive Scaling
  closureProbability?: number;
  intentTrajectory?: 'improving' | 'stable' | 'declining';
  behavioralFingerprint?: BehavioralFingerprint;

  behavioralMetrics?: {
    timeOnSite?: number;
    inventoryViews?: number;
    highValueInteractions?: number;
    lastActive?: number;
    intentTrajectory?: 'improving' | 'stable' | 'declining';
  };

  // Continuum Memory System
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
      predictedIntent: string;
    };
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
  opportunityScale: number;
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
