
export type CarType = 'suv' | 'sedan' | 'luxury' | 'pickup';

export type UserRole = 'admin' | 'user';

export interface Car {
  id: string;
  name: string;
  price: number;
  type: CarType;
  badge?: string;
  img: string;
  year?: number;
  featured?: boolean;
  description?: string;
  features?: string[];
  // Analytics
  views?: number;
  leads_count?: number;
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
  SETTINGS = 'settings'
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
}


export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Lead {
  id: string;
  type: 'finance' | 'trade-in' | 'chat' | 'general';
  status: 'new' | 'contacted' | 'negotiating' | 'sold' | 'lost';
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  timestamp: FirestoreTimestamp;

  // Context
  vehicleOfInterest?: string; // Car Name
  vehicleId?: string;
  tradeInDetails?: string; // "2018 Toyota Camry"
  tradeInPhotos?: string[]; // Array of photo URLs
  message?: string; // Chat summary or initial message

  // AI Metrics
  aiScore?: number; // 0-100
  aiSummary?: string; // "High intent, good credit"

  // Automation Status
  emailSent?: boolean;
  nudgeSent?: boolean;
  lastContacted?: FirestoreTimestamp;
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
