/**
 * Finance Service for Richard Automotive
 * Specialized for Puerto Rico Local Banks (Popular, BPPR, Coops)
 */

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
}

export const BANK_TERMS = {
    'Popular': { baseApr: 6.95, maxTerm: 84 },
    'BPPR': { baseApr: 7.25, maxTerm: 72 },
    'Oriental': { baseApr: 7.50, maxTerm: 84 },
    'COOP': { baseApr: 5.95, maxTerm: 72 } // Local Credit Unions usually have better rates
};

export function simulateLoan(
    price: number,
    downPayment: number,
    term: number,
    creditScore: number
): LoanSimulation[] {
    const loanAmount = price - downPayment;
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

    return Object.entries(BANK_TERMS).map(([bank, config]) => {
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
            estimatedCreditTier: tier
        };
    });
}
