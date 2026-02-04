
export type CreditTier = 'excellent' | 'good' | 'fair' | 'poor';

interface PaymentResult {
    monthlyPayment: number;
    totalInterest: number; // Internal measure, maybe not shown directly
    totalCost: number;
    aprUsed: number; // KEPT PRIVATE IN UI, used for debug/internal logic
}

/**
 * Calculates auto loan payment.
 * RULE: APR is determined internally and should NEVER be displayed to the user.
 */
export const calculateLoan = (
    vehiclePrice: number,
    downPayment: number,
    termMonths: number,
    creditTier: CreditTier,
    tradeInValue: number = 0
): PaymentResult => {
    // 1. Determine APR based on credit tier (Hidden from user)
    // These rates are illustrative. In a real app, fetch from backend.
    const rates: Record<CreditTier, number> = {
        excellent: 4.9,
        good: 7.5,
        fair: 11.9,
        poor: 18.9
    };

    const annualRate = rates[creditTier];
    const monthlyRate = annualRate / 100 / 12;

    // 2. Calculate Principal
    // Add Fees? (Simulated $500 dealer fee)
    const dealerFee = 495;
    const principal = Math.max(0, vehiclePrice + dealerFee - downPayment - tradeInValue);

    if (principal === 0) {
        return { monthlyPayment: 0, totalInterest: 0, totalCost: 0, aprUsed: annualRate };
    }

    // 3. Amortization Formula: P * (r(1+r)^n) / ((1+r)^n - 1)
    const x = Math.pow(1 + monthlyRate, termMonths);
    const monthlyPayment = (principal * x * monthlyRate) / (x - 1);

    const totalCost = monthlyPayment * termMonths;
    const totalInterest = totalCost - principal;

    return {
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(totalCost),
        aprUsed: annualRate
    };
};

export const getCreditTierLabel = (tier: CreditTier): string => {
    switch (tier) {
        case 'excellent': return 'Excelente (720+)';
        case 'good': return 'Bueno (660-719)';
        case 'fair': return 'Regular (600-659)';
        case 'poor': return 'En Construcción (<600)';
    }
};
