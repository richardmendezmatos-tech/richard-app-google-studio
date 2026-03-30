import { Lead } from '@/entities/lead';
import { Car, CarType } from '@/entities/inventory';
import { Appraisal } from '@/entities/appraisal';
import { FirestoreTimestamp } from './firestore';

export type { Lead, Car, CarType, Appraisal, FirestoreTimestamp };

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

// Lead types moved to @/entities/lead

export interface Subscriber {
  id?: string;
  email: string;
  timestamp?: FirestoreTimestamp | { seconds: number };
}

export interface FinancialApplication {
  id: string;
  date: string;
  status: 'pending' | 'approved' | 'reviewing' | 'expired';
  type: 'pre-qualification' | 'full-app';
  vehicle?: {
    name: string;
    price: number;
  };
  referenceId: string;
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
