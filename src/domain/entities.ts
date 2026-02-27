import { CarType } from '../types/types';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  category?: 'COLD' | 'WARM' | 'HOT';
  type: 'whatsapp' | 'form' | 'trade-in' | 'visual_ai' | 'chat' | 'finance' | 'general';
  vehicleOfInterest?: string;
  message?: string;
  monthlyIncome?: string;
  hasPronto?: boolean;
  vehicleId?: string;
  chatInteractions?: number;
  dealerId: string;
  timestamp?: any;
  status: 'new' | 'contacted' | 'negotiation' | 'sold' | 'lost' | 'negotiating';
  responded?: boolean;
  documentsSent?: boolean;
  dealClosed?: boolean;
  appointmentCompleted?: boolean;
  aiScore?: number;
  aiSummary?: string;
  aiAnalysis?: {
    score: number;
    category: string;
    insights: string[];
    nextAction: string;
    reasoning: string;
    unidad_interes: string;
    nudgeSent?: boolean;
    requestedConsultation?: boolean;
    preferredType?: string;
    budget?: number;
  };
  predictiveScore?: number;
  behavioralMetrics?: {
    timeOnSite?: number;
    inventoryViews?: number;
    highValueInteractions?: number;
    lastActive?: number;
    intentTrajectory?: 'improving' | 'stable' | 'declining';
  };
}

export interface Car {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  type: CarType;
  img: string;
  dealerId?: string;
  transmission?: string;
  fuelType?: string;
  images?: string[];
  description?: string;
  createdAt?: number; // Timestamp for inventory age calculation
}

export type UserRole = 'admin' | 'user' | 'agent' | 'ghost';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  dealerId?: string;
  dealerName?: string;
  isGhost?: boolean;
  isBlocked?: boolean;
  passkeyEnabled?: boolean;
  passkeyId?: string;
  createdAt?: Date;
}

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

export interface PredictiveInsight {
  leadId: string;
  score: number;
  confidence: number;
  factors: string[];
  predictedAction: string;
  timestamp: number;
}

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
