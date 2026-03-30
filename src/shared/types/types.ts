export type CarType = 'suv' | 'sedan' | 'luxury' | 'pickup';

export type UserRole = 'admin' | 'user';

export interface PrivacySettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  aiData: boolean;
  partnerSharing: boolean;
  lastUpdated: number;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: UserRole;
  privacySettings?: PrivacySettings;
  [key: string]: unknown;
}

export interface Car {
  id: string;
  name: string;
  price: number;
  type: CarType;
  badge?: string;
  img: string;
  webpSrc?: string;
  blurPlaceholder?: string;
  images?: string[];
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  featured?: boolean;
  description?: string;
  features?: string[];
  // Analytics
  views?: number;
  leads_count?: number;
  dealerId?: string;
  createdAt?: FirestoreTimestamp | Date | number;
  seoFaqs?: { question: string; answer: string }[];
}

export enum ViewMode {
  STOREFRONT = 'storefront',
  ADMIN = 'admin',
  AI_CONSULTANT = 'ai_consultant',
  AI_LAB = 'ai_lab',
  BLOG = 'blog',
  DIGITAL_GARAGE = 'digital_garage',
  PRE_QUALIFY = 'pre_qualify',
  TRADE_IN = 'trade_in',

  // AI Lab views
  CHAT = 'chat',
  CODE_ANALYZER = 'code_analyzer',
  IMAGES = 'images',
  VIDEO_STUDIO = 'video_studio',
  VOICE_ASSISTANT = 'voice_assistant',
  DEVOPS = 'devops',
  SETTINGS = 'settings',
  DIGITAL_TWIN = 'digital_twin',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface FinancingParams {
  credit: number;
  term: number;
  downPayment: number;
  tradeIn: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  tags: string[];
  slug?: string;
  metaDescription?: string;
}

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
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

  // Nivel 14: Predictive Scaling
  predictiveScore?: number;
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

export interface Subscriber {
  id?: string;
  email: string;
  timestamp?: FirestoreTimestamp | { seconds: number };
}

export interface MarketProjection {
  month: number;
  estimatedValue: number;
  depreciationPercent: number;
}

export interface ActuarialReportData {
  reportId: string;
  issueDate: string;
  lead: Lead;
  marketProjections: MarketProjection[];
  riskAnalysis: {
    score: number;
    rating: 'A+' | 'A' | 'B' | 'C' | 'D';
    observations: string;
  };
  legalDisclaimers: string[];
}

export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'engine' | 'battery' | 'fuel' | 'tire' | 'service';
  message: string;
  timestamp: number;
}

export interface VehicleHealthStatus {
  overallStatus: 'healthy' | 'warning' | 'critical';
  alerts: HealthAlert[];
  lastCheck: number;
}

export interface VehicleTelemetry {
  vehicleId: string;
  speed: number;
  rpm: number;
  fuelLevel: number;
  batteryVoltage: number;
  temp: number;
  location: {
    lat: number;
    lng: number;
  };
  lastUpdate: number;
  status: 'active' | 'idle' | 'warning';
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
  }
}


export interface CommandIntent {
  action: {
    type: 'NAVIGATE' | 'SEARCH' | 'UPDATE_FILTER';
    payload: any;
  };
  confidence: number;
  originalText: string;
}
