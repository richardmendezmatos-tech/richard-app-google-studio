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
  Popular: { baseApr: 6.95, maxTerm: 84 },
  BPPR: { baseApr: 7.25, maxTerm: 72 },
  Oriental: { baseApr: 7.5, maxTerm: 84 },
  COOP: { baseApr: 5.95, maxTerm: 72 }, // Local Credit Unions usually have better rates
};

export async function simulateLoan(
  price: number,
  downPayment: number,
  term: number,
  creditScore: number,
  vehicleInfo?: { make: string; model: string },
): Promise<LoanSimulation[]> {
  const loanAmount = price - downPayment;

  // --- MARKET INTEL INJECTION ---
  let marketData = null;
  if (vehicleInfo) {
    marketData = await getMarketInsight(vehicleInfo.make, vehicleInfo.model);
  }
  const tiers = {
    excellent_plus: 780, // Superior Tier for best terms
    excellent: 720,
    good: 680,
    fair: 600,
    poor: 0,
  };

  let tier: keyof typeof tiers = 'poor';
  if (creditScore >= tiers.excellent_plus) tier = 'excellent_plus';
  else if (creditScore >= tiers.excellent) tier = 'excellent';
  else if (creditScore >= tiers.good) tier = 'good';
  else if (creditScore >= tiers.fair) tier = 'fair';

  const adjustments = {
    excellent_plus: 0,
    excellent: 0.5,
    good: 2.0,
    fair: 5.0,
    poor: 10.0,
  };

  const simulations = Object.entries(BANK_TERMS).map(([bank, config]) => {
    const baseApr = config.baseApr;
    const adjustment = adjustments[tier];
    const finalApr = Number((baseApr + adjustment).toFixed(2));

    const monthlyRate = finalApr / 100 / 12;
    let payment = 0;

    if (monthlyRate > 0 && term > 0) {
      // Standard Amortization Formula: P = [r*PV] / [1 - (1 + r)^-n]
      payment =
        (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -term));
    } else if (term > 0) {
      payment = loanAmount / term;
    }

    const monthlyPayment = Number(payment.toFixed(2));
    const totalInterest = Number(
      (monthlyPayment * term - loanAmount).toFixed(2),
    );

    return {
      bankName: bank,
      totalPrice: price,
      downPayment,
      loanAmount,
      termMonths: term,
      apr: finalApr,
      monthlyPayment,
      totalInterest,
      estimatedCreditTier:
        tier === 'excellent_plus' ? 'excellent' : (tier as any),
      marketComparison: marketData
        ? {
            averagePrice: marketData.averagePrice,
            lowestPrice: marketData.lowestPrice,
            savingsVsAverage: marketData.averagePrice - price,
          }
        : undefined,
      legalDisclaimer:
        'Sujeto a aprobación. Tasas y términos pueden variar según el perfil crediticio y políticas de la institución bancaria.',
    };
  });

  return simulations.sort((a, b) => {
    // Preference logic: Popular for high tier, COOP for mid-tiers
    if (tier === 'excellent_plus' && a.bankName === 'Popular') return -1;
    if ((tier === 'fair' || tier === 'good') && a.bankName === 'COOP')
      return -1;
    return a.monthlyPayment - b.monthlyPayment;
  });
}
