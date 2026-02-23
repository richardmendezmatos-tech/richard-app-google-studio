/**
 * Richard Automotive - Domain Entities
 * Agnostic to infrastructure (Firebase, Supabase, Genkit)
 */

export interface Lead {
    id?: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    monthlyIncome?: string;
    timeAtJob?: string;
    jobTitle?: string;
    employer?: string;
    vehicleId?: string;
    hasPronto?: boolean;
    chatInteractions?: number;
    viewedInventoryMultipleTimes?: boolean;
    location?: string;
    category?: 'HOT' | 'WARM' | 'COLD';
    status?: string;
    aiAnalysis?: any;
    timestamp?: Date;
}

export interface Car {
    id: string;
    year: number;
    make: string;
    model: string;
    name: string;
    price: number;
    mileage: number;
    type: string;
    features?: string[];
    description?: string;
    embedding?: number[];
}

export interface MatchResult {
    leadId: string;
    leadName: string;
    matchScore: number;
    reason: string;
}

export interface LeadScore {
    score: number;
    category: 'HOT' | 'WARM' | 'COLD';
    insights: string[];
    nextAction: string;
    reasoning: string;
}

export interface OperationalScoreResult {
    status: string;
    insights: string[];
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    operational_score: number;
}
