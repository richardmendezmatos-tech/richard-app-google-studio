/**
 * Finance Service for Richard Automotive
 * Specialized for Puerto Rico Local Banks (Popular, BPPR, Coops)
 */
import { getMarketInsight } from './marketIntelService';

export interface LoanSimulation {
    bankName: string;
    totalPrice: number;
    downPayment: number;
    loanAmount: number;
    termMonths: number;
    apr: number;
    monthlyPayment: number;
    totalInterest: number;
    estimatedCreditTier: 'excellent' | 'good' | 'fair' | 'poor';
    marketComparison?: {
        averagePrice: number;
        lowestPrice: number;
        savingsVsAverage: number;
    };
}

export const BANK_TERMS = {
    'Popular': { baseApr: 6.95, maxTerm: 84 },
    'BPPR': { baseApr: 7.25, maxTerm: 72 },
    'Oriental': { baseApr: 7.50, maxTerm: 84 },
    'COOP': { baseApr: 5.95, maxTerm: 72 } // Local Credit Unions usually have better rates
};

export async function simulateLoan(
    price: number,
    downPayment: number,
    term: number,
    creditScore: number,
    vehicleInfo?: { make: string, model: string }
): Promise<LoanSimulation[]> {
    const loanAmount = price - downPayment;

    // --- MARKET INTEL INJECTION ---
    let marketData = null;
    if (vehicleInfo) {
        marketData = await getMarketInsight(vehicleInfo.make, vehicleInfo.model);
    }
    const tiers = {
        'excellent': 750,
        'good': 700,
        'fair': 650,
        'poor': 400
    };

    let tier: keyof typeof tiers = 'poor';
    if (creditScore >= tiers.excellent) tier = 'excellent';
    else if (creditScore >= tiers.good) tier = 'good';
    else if (creditScore >= tiers.fair) tier = 'fair';

    const adjustments = {
        'excellent': 0,
        'good': 1.5,
        'fair': 3.5,
        'poor': 8.0
    };

    const simulations = Object.entries(BANK_TERMS).map(([bank, config]) => {
        const finalApr = config.baseApr + adjustments[tier];
        const monthlyRate = finalApr / 100 / 12;
        const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);

        return {
            bankName: bank,
            totalPrice: price,
            downPayment,
            loanAmount,
            termMonths: term,
            apr: finalApr,
            monthlyPayment: Number(payment.toFixed(2)),
            totalInterest: Number((payment * term - loanAmount).toFixed(2)),
            estimatedCreditTier: tier,
            marketComparison: marketData ? {
                averagePrice: marketData.averagePrice,
                lowestPrice: marketData.lowestPrice,
                savingsVsAverage: marketData.averagePrice - price
            } : undefined,
            legalDisclaimer: "Estimado sujeto a aprobación de crédito. Tasas varían por institución."
        };
    });

    // --- HOA Phase 3: Priority Logic ---
    return simulations.sort((a, b) => {
        if (tier === 'excellent' && a.bankName === 'Popular') return -1;
        if ((tier === 'fair' || tier === 'good') && a.bankName === 'COOP') return -1;
        return a.monthlyPayment - b.monthlyPayment;
    });
}
