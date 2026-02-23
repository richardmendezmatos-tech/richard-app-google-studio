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
