import { CONSTANTES_PR } from './fiConstants';

export type CreditTier = 'excellent' | 'good' | 'fair' | 'poor';

export interface PaymentResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  aprUsed: number;
  principalFinanced: number;
  ltvRatio: number;
}

export interface OTDResult {
  vehiclePrice: number;
  tradeInValue: number;
  tradeInPayoff: number;
  netTradeIn: number; // Positive means equity, Negative means deficiency (rolled into loan)
  taxableAmount: number;
  stateTax: number;
  municipalTax: number;
  totalTaxes: number;
  dealerFees: number;
  totalBackendProducts: number;
  outTheDoorPrice: number; // The final grand total
}

export interface FinancingStructure {
  vehiclePrice: number;
  tradeInValue?: number;
  tradeInPayoff?: number;
  downPayment?: number;
  termMonths: number;
  creditTier: CreditTier;
  // Backend Products
  gapInsurance?: number;
  extendedWarranty?: number;
  paintProtection?: number;
  creditLife?: number;
}

/**
 * Calcula el Precio Out The Door (OTD) según las reglas de Puerto Rico
 */
export const calculateOTD = (
  vehiclePrice: number,
  tradeInValue: number = 0,
  tradeInPayoff: number = 0,
  gapInsurance: number = 0,
  extendedWarranty: number = 0,
  paintProtection: number = 0,
  creditLife: number = 0,
): OTDResult => {
  // 1. Net Trade-In (Equidad)
  const netTradeIn = tradeInValue - tradeInPayoff;

  // 2. Taxable Amount (El IVU en PR suele aplicar al valor del auto descontando Trade-In, 
  // pero asumamos un escenario conservador donde el Tax se calcula sobre la diferencia)
  // Nota legal: Según el Dept Hacienda de PR, el "Trade In" reduce la base tributable.
  const baseForTax = Math.max(0, vehiclePrice - tradeInValue);
  
  const stateTax = baseForTax * CONSTANTES_PR.IVU_STATE_RATE;
  const municipalTax = baseForTax * CONSTANTES_PR.IVU_MUNICIPAL_RATE;
  const totalTaxes = stateTax + municipalTax;

  // 3. Dealer Fees (Fixed / Hard Costs)
  const dealerFees = 
    CONSTANTES_PR.DOC_FEE_STANDARDIZED + 
    CONSTANTES_PR.REGISTRATION_FEE_BASE + 
    CONSTANTES_PR.TITLE_TRANSFER_FEE;

  // 4. Backend Products
  const totalBackendProducts = gapInsurance + extendedWarranty + paintProtection + creditLife;

  // 5. Out The Door (OTD) Computation
  // OTD = Auto + Taxes + Fees + Products - NetTradeIn
  // Note: Down payment is applied against the OTD later when calculating the loan.
  const outTheDoorPrice = vehiclePrice + totalTaxes + dealerFees + totalBackendProducts - netTradeIn;

  return {
    vehiclePrice,
    tradeInValue,
    tradeInPayoff,
    netTradeIn,
    taxableAmount: baseForTax,
    stateTax,
    municipalTax,
    totalTaxes,
    dealerFees,
    totalBackendProducts,
    outTheDoorPrice
  };
};

/**
 * Calculates auto loan amortization and LTV.
 */
export const calculateLoan = (
  structure: FinancingStructure
): PaymentResult => {
  const {
    vehiclePrice,
    tradeInValue = 0,
    tradeInPayoff = 0,
    downPayment = 0,
    termMonths,
    creditTier,
    gapInsurance = 0,
    extendedWarranty = 0,
    paintProtection = 0,
    creditLife = 0
  } = structure;

  // Calculate strict OTD first
  const otdResult = calculateOTD(
    vehiclePrice, tradeInValue, tradeInPayoff, 
    gapInsurance, extendedWarranty, paintProtection, creditLife
  );

  // Apply down payment to OTD to formulate the True Principal
  const principalFinanced = Math.max(0, otdResult.outTheDoorPrice - downPayment);

  // APR Mapping based on market conditions in PR (Simulated logic)
  const rates: Record<CreditTier, number> = {
    excellent: 4.9,
    good: 7.5,
    fair: 11.9,
    poor: 18.9,
  };

  const annualRate = rates[creditTier];
  const monthlyRate = annualRate / 100 / 12;

  // Evaluate Loan-To-Value (LTV) -> Principal / Vehicle_Wholesale_Value
  // For simplicity, assumed Vehicle_Wholesale is ~ 90% of Retail Price
  const ltvRatio = principalFinanced / (vehiclePrice * 0.9);

  if (principalFinanced === 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalCost: 0, aprUsed: annualRate, principalFinanced: 0, ltvRatio: 0 };
  }

  // Amortization Formula: P * (r(1+r)^n) / ((1+r)^n - 1)
  const x = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = (principalFinanced * x * monthlyRate) / (x - 1);

  const totalCost = monthlyPayment * termMonths;
  const totalInterest = totalCost - principalFinanced;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    aprUsed: annualRate,
    principalFinanced: Math.round(principalFinanced),
    ltvRatio: Number(ltvRatio.toFixed(2))
  };
};

export const getCreditTierLabel = (tier: CreditTier): string => {
  switch (tier) {
    case 'excellent':
      return 'Excelente (720+)';
    case 'good':
      return 'Bueno (660-719)';
    case 'fair':
      return 'Regular (600-659)';
    case 'poor':
      return 'En Construcción (<600)';
  }
};
