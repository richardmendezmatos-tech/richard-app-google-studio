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
