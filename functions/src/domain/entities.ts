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
    responded?: boolean;
    documentsSent?: boolean;
    dealClosed?: boolean;
    appointmentCompleted?: boolean;
    timestamp?: any;
    vehicleOfInterest?: string;
    aiAnalysis?: {
        score: number;
        insights: string[];
        nudgeSent?: boolean;
        requestedConsultation?: boolean;
        preferredType?: string;
        budget?: number;
    };
    emailSequence?: {
        welcome1SentAt?: any;
        welcome2SentAt?: any;
        welcome3SentAt?: any;
        welcome4SentAt?: any;
        reengagement1SentAt?: any;
        reengagement2SentAt?: any;
        reengagement3SentAt?: any;
        postAppointment1SentAt?: any;
        postAppointment2SentAt?: any;
        postAppointment3SentAt?: any;
        emailsSent?: number;
        lastEmailSentAt?: any;
        lastError?: {
            message: string;
            timestamp: any;
            emailType: string;
        };
    };
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
