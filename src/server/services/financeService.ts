/**
 * Finance Service for Richard Automotive
 * Specialized for Puerto Rico Local Banks (Popular, BPPR, Coops)
 */
import { getMarketInsight } from './marketIntelService';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';
import { CONSTANTES_PR } from '@/entities/finance/lib/fiConstants';

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
  isBankable: boolean;
  ltvRatio: number;
  marketComparison?: {
    averagePrice: number;
    lowestPrice: number;
    savingsVsAverage: number;
  };
}

export async function simulateLoan(
  price: number,
  downPayment: number,
  term: number,
  creditScore: number,
  vehicleInfo?: { make: string; model: string },
): Promise<LoanSimulation[]> {
  const loanAmount = price - downPayment;

  // Calculate LTV (Assumed wholesale is 90% of price for risk scoring)
  const estimatedWholesale = price * 0.9;
  const ltvRatio = Number((loanAmount / estimatedWholesale).toFixed(2));

  // --- MARKET INTEL INJECTION ---
  let marketData = null;
  if (vehicleInfo) {
    marketData = await getMarketInsight(vehicleInfo.make, vehicleInfo.model);
  }

  const tiers = {
    excellent_plus: 780,
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

  const simulations = FINANCIAL_ENTITIES_PR.map((entity) => {
    const baseApr = entity.baseRate;
    const adjustment = adjustments[tier];
    const finalApr = Number((baseApr + adjustment).toFixed(2));

    const monthlyRate = finalApr / 100 / 12;
    let payment = 0;

    if (monthlyRate > 0 && term > 0) {
      payment = (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -term));
    } else if (term > 0) {
      payment = loanAmount / term;
    }

    const monthlyPayment = Number(payment.toFixed(2));
    const totalInterest = Number((monthlyPayment * term - loanAmount).toFixed(2));

    // Business Logic: Bankability
    // - LTV must be under MAX_LTV_RATIO
    // - Score must meet entity tier requirements (Simplified)
    const isBankable =
      ltvRatio <= CONSTANTES_PR.MAX_LTV_RATIO && (entity.tier === 1 || creditScore >= 640);

    return {
      bankName: entity.name,
      totalPrice: price,
      downPayment,
      loanAmount,
      termMonths: term,
      apr: finalApr,
      monthlyPayment,
      totalInterest,
      isBankable,
      ltvRatio,
      estimatedCreditTier: tier === 'excellent_plus' ? 'excellent' : (tier as any),
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
    // Priority 1: Bankable deals first
    if (a.isBankable && !b.isBankable) return -1;
    if (!a.isBankable && b.isBankable) return 1;
    // Priority 2: Lowest payment
    return a.monthlyPayment - b.monthlyPayment;
  });
}
