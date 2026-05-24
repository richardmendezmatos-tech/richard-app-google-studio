// Utilidades Matemáticas de F&I (Finanzas y Seguros)
// Capa: Features - Slice: deal-desker
// Creado: 2026-05-24
// Autor: Richard Automotive Antigravity

import { CreditTier, DealCalculationResult, BankName, BankRate, BankComparisonOption } from '@/entities/deal/model/types';

// Matriz de tasas baseline offline de Puerto Rico (Banco Popular, FirstBank, Oriental)
// Para usar como fallback instantáneo u offline
export const OFFLINE_BANK_RATES: Omit<BankRate, 'id'>[] = [
  // BANCO POPULAR
  // Nuevos
  { bankName: 'popular', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 36, buyRate: 5.75, maxSellRate: 7.75 },
  { bankName: 'popular', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 48, buyRate: 5.95, maxSellRate: 7.95 },
  { bankName: 'popular', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 60, buyRate: 6.25, maxSellRate: 8.25 },
  { bankName: 'popular', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 72, buyRate: 6.45, maxSellRate: 8.45 },
  { bankName: 'popular', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 84, buyRate: 6.95, maxSellRate: 8.95 },
  // Usados
  { bankName: 'popular', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 36, buyRate: 6.25, maxSellRate: 8.25 },
  { bankName: 'popular', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 48, buyRate: 6.45, maxSellRate: 8.45 },
  { bankName: 'popular', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 60, buyRate: 6.75, maxSellRate: 8.75 },
  { bankName: 'popular', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 72, buyRate: 6.95, maxSellRate: 8.95 },
  { bankName: 'popular', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 84, buyRate: 7.45, maxSellRate: 9.45 },
  
  // FIRSTBANK
  // Nuevos
  { bankName: 'firstbank', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 36, buyRate: 5.45, maxSellRate: 7.45 },
  { bankName: 'firstbank', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 48, buyRate: 5.75, maxSellRate: 7.75 },
  { bankName: 'firstbank', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 60, buyRate: 5.95, maxSellRate: 7.95 },
  { bankName: 'firstbank', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 72, buyRate: 6.25, maxSellRate: 8.25 },
  { bankName: 'firstbank', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 84, buyRate: 6.75, maxSellRate: 8.75 },
  // Usados
  { bankName: 'firstbank', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 36, buyRate: 5.95, maxSellRate: 7.95 },
  { bankName: 'firstbank', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 48, buyRate: 6.25, maxSellRate: 8.25 },
  { bankName: 'firstbank', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 60, buyRate: 6.45, maxSellRate: 8.45 },
  { bankName: 'firstbank', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 72, buyRate: 6.75, maxSellRate: 8.75 },
  { bankName: 'firstbank', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 84, buyRate: 7.25, maxSellRate: 9.25 },

  // ORIENTAL
  // Nuevos
  { bankName: 'oriental', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 36, buyRate: 5.95, maxSellRate: 7.95 },
  { bankName: 'oriental', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 48, buyRate: 6.15, maxSellRate: 8.15 },
  { bankName: 'oriental', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 60, buyRate: 6.45, maxSellRate: 8.45 },
  { bankName: 'oriental', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 72, buyRate: 6.75, maxSellRate: 8.75 },
  { bankName: 'oriental', vehicleCondition: 'new', minYear: 2025, maxYear: 2027, creditTier: 'tier_1', term: 84, buyRate: 7.25, maxSellRate: 9.25 },
  // Usados
  { bankName: 'oriental', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 36, buyRate: 6.15, maxSellRate: 8.15 },
  { bankName: 'oriental', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 48, buyRate: 6.35, maxSellRate: 8.35 },
  { bankName: 'oriental', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 60, buyRate: 6.65, maxSellRate: 8.65 },
  { bankName: 'oriental', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 72, buyRate: 6.95, maxSellRate: 8.95 },
  { bankName: 'oriental', vehicleCondition: 'used', minYear: 2018, maxYear: 2024, creditTier: 'tier_1', term: 84, buyRate: 7.45, maxSellRate: 9.45 }
];

/**
 * Retorna las tasas APR de interés sugeridas para bancos de Puerto Rico según el Tier de crédito y plazo
 */
export function getSuggestedAPR(tier: CreditTier, term: number): number {
  const rates: Record<CreditTier, Record<number, number>> = {
    tier_1: { 36: 4.95, 48: 5.25, 60: 5.95, 72: 6.25, 84: 6.95 },
    tier_2: { 36: 6.45, 48: 6.95, 60: 7.45, 72: 7.95, 84: 8.45 },
    tier_3: { 36: 8.95, 48: 9.45, 60: 9.95, 72: 10.45, 84: 11.25 },
    tier_4: { 36: 12.95, 48: 13.45, 60: 13.95, 72: 14.95, 84: 15.95 },
  };

  const termRates = rates[tier];
  if (termRates[term]) return termRates[term];
  
  const availableTerms = Object.keys(termRates).map(Number).sort((a, b) => a - b);
  const closestTerm = availableTerms.find(t => t >= term) || availableTerms[availableTerms.length - 1];
  return termRates[closestTerm];
}

/**
 * Busca una tasa de interés específica en la base de datos de tasas proveida o el fallback offline
 */
export function findBankRate(
  bankName: BankName,
  tier: CreditTier,
  term: number,
  condition: 'new' | 'used',
  year: number,
  customRates?: BankRate[]
): { buyRate: number; maxSellRate: number } {
  const sourceRates = customRates && customRates.length > 0 ? customRates : (OFFLINE_BANK_RATES as BankRate[]);
  
  // Buscar coincidencia exacta
  const rateMatch = sourceRates.find(r => 
    r.bankName === bankName &&
    r.vehicleCondition === condition &&
    r.creditTier === tier &&
    r.term === term &&
    year >= r.minYear &&
    year <= r.maxYear
  );

  if (rateMatch) {
    return { buyRate: Number(rateMatch.buyRate), maxSellRate: Number(rateMatch.maxSellRate) };
  }

  // Fallback si no hay año exacto, intentar buscar solo por banco, tier, plazo y condición
  const generalMatch = sourceRates.find(r => 
    r.bankName === bankName &&
    r.vehicleCondition === condition &&
    r.creditTier === tier &&
    r.term === term
  );

  if (generalMatch) {
    return { buyRate: Number(generalMatch.buyRate), maxSellRate: Number(generalMatch.maxSellRate) };
  }

  // Fallback general basado en sugerencias estándar
  const baseSuggested = getSuggestedAPR(tier, term);
  return { buyRate: baseSuggested, maxSellRate: baseSuggested + 2.00 };
}

interface CalculateDealParams {
  vehiclePrice: number;
  vehicleCost?: number;
  downPayment: number;
  tradeInValue?: number;
  tradeInPayoff?: number;
  term: number;
  apr: number; // Tasa de venta configurada para el cliente (Sell Rate)
  gapInsuranceEnabled?: boolean;
  extendedWarrantyEnabled?: boolean;
  powerPackEnabled?: boolean;
  diamondCeramicEnabled?: boolean;
  bookValue?: number;
  structureType?: 'conventional' | 'leasing'; // Convencional o Arrendamiento
  vehicleYear?: number;
  vehicleCondition?: 'new' | 'used';
  creditTier?: CreditTier;
  bankRates?: BankRate[];
  selectedBank?: BankName;
}

/**
 * Retorna el porciento de valor residual de Oriental para autos Americanos (como Ford) según el plazo.
 * REGLA COMERCIAL: Solo vehículos de $35,000.00 o más pueden tener valor residual.
 */
export function getResidualPercentage(term: number, vehiclePrice: number = 35000): number {
  if (vehiclePrice < 35000) return 0;

  // Matriz Oficial de Oriental: 24m: 40%, 36m: 35%, 48m-66m: 30%
  const residuals: Record<number, number> = {
    24: 40,
    36: 35,
    48: 30,
    54: 30,
    60: 30,
    66: 30
  };
  
  if (residuals[term]) return residuals[term];
  if (term > 66) return 20; // Capped/fallback
  return 30; // Default
}

/**
 * Realiza los cálculos financieros precisos del Deal (financiamiento, cuotas, LTV y márgenes de ganancia F&I)
 * de acuerdo con las especificaciones de Puerto Rico.
 */
export function calculateFIDeal(params: CalculateDealParams): DealCalculationResult {
  const {
    vehiclePrice,
    vehicleCost = vehiclePrice * 0.85,
    downPayment,
    tradeInValue = 0,
    tradeInPayoff = 0,
    term,
    apr,
    gapInsuranceEnabled = false,
    extendedWarrantyEnabled = false,
    powerPackEnabled = false,
    diamondCeramicEnabled = false,
    bookValue = vehiclePrice,
    structureType = 'conventional',
    vehicleYear = new Date().getFullYear(),
    vehicleCondition = 'used',
    creditTier = 'tier_1',
    bankRates = [],
    selectedBank = 'popular'
  } = params;

  // REGLA COMERCIAL: El plazo máximo a financiar en leasing es de 66 meses
  let calculatedTerm = term;
  if (structureType === 'leasing' && term > 66) {
    calculatedTerm = 66;
  }

  // 1. Calcular equidad del trade-in (puede ser negativa si se debe más de lo que vale)
  const tradeInEquity = tradeInValue - tradeInPayoff;

  // 2. Calcular costos adicionales de F&I (Back-End)
  let gapCost = 0;
  let gapProfit = 0;
  if (gapInsuranceEnabled) {
    if (calculatedTerm === 84) {
      gapCost = 898;
    } else if (calculatedTerm === 72) {
      gapCost = 798;
    } else {
      gapCost = 998;
    }
    gapProfit = 320;
  }

  const warrantyCost = extendedWarrantyEnabled ? 4216 : 0;
  const warrantyProfit = extendedWarrantyEnabled ? 2000 : 0;

  const powerPackCost = powerPackEnabled ? 895 : 0;
  const powerPackProfit = powerPackEnabled ? 575 : 0;

  const ceramicCost = diamondCeramicEnabled ? 995 : 0;
  const ceramicProfit = diamondCeramicEnabled ? 770 : 0;

  const backEndProfit = gapProfit + warrantyProfit + powerPackProfit + ceramicProfit;
  const totalBackendCost = gapCost + warrantyCost + powerPackCost + ceramicCost;

  // 3. Monto Financiado Base (Loan Principal)
  // Gastos de registro de $244 se pagan aparte en el dealer, no se financian en el préstamo.
  let amountFinanced = Math.max(0, vehiclePrice - downPayment - tradeInEquity + totalBackendCost);

  // Agregar costo de originación de leasing obligatorio financiado si corresponde
  if (structureType === 'leasing') {
    let originationFee = 0;
    if (selectedBank === 'popular') originationFee = 895;
    else if (selectedBank === 'firstbank') originationFee = 995;
    else if (selectedBank === 'oriental') originationFee = 895; // Default / Estándar
    amountFinanced += originationFee;
  }

  // 4. LTV (Loan-to-Value)
  const ltv = bookValue > 0 ? (amountFinanced / bookValue) * 100 : 0;

  // 5. Cálculo del Pago Mensual según la estructura seleccionada
  let monthlyPayment: number;
  let residualValue = 0;

  // Método de Amortización Francesa Convencional
  const calculateFrenchAmortization = (principal: number, annualApr: number, months: number): number => {
    if (principal <= 0) return 0;
    if (annualApr <= 0) return principal / months;
    const r = annualApr / 12 / 100;
    return (r * principal) / (1 - Math.pow(1 + r, -months));
  };

  // Método de Amortización de Leasing (Depreciación + Rent Charge)
  const calculateLeaseAmortization = (principal: number, annualApr: number, months: number, residual: number): number => {
    if (principal <= 0) return 0;
    const monthlyDepreciation = (principal - residual) / months;
    const moneyFactor = annualApr / 2400;
    const monthlyRent = (principal + residual) * moneyFactor;
    return Math.max(0, monthlyDepreciation + monthlyRent);
  };

  if (structureType === 'leasing') {
    const resPercent = getResidualPercentage(calculatedTerm, vehiclePrice);
    residualValue = bookValue * (resPercent / 100);
    monthlyPayment = calculateLeaseAmortization(amountFinanced, apr, calculatedTerm, residualValue);
  } else {
    monthlyPayment = calculateFrenchAmortization(amountFinanced, apr, calculatedTerm);
  }

  // 6. Ganancia Front-End (Diferencia de precio)
  const frontEndProfit = Math.max(0, vehiclePrice - vehicleCost);

  // 7. Comparación de Bancos y Amortizaciones
  const banks: BankName[] = ['popular', 'firstbank', 'oriental'];
  const bankComparisons: BankComparisonOption[] = banks.map(bank => {
    let bankTerm = term;
    if (structureType === 'leasing' && term > 66) {
      bankTerm = 66;
    }

    const rates = findBankRate(bank, creditTier, bankTerm, vehicleCondition, vehicleYear, bankRates);
    
    // Al ser Tasa Fija, la tasa del cliente es exactamente la tasa de compra (buy_rate)
    const buyRate = rates.buyRate;
    const sellRate = buyRate;

    // Calcular el monto financiado específico de este banco (por los costos de originación del leasing)
    let bankAmountFinanced = Math.max(0, vehiclePrice - downPayment - tradeInEquity + totalBackendCost);
    if (structureType === 'leasing') {
      let originationFee = 0;
      if (bank === 'popular') originationFee = 895;
      else if (bank === 'firstbank') originationFee = 995;
      else if (bank === 'oriental') originationFee = 895; // Default
      bankAmountFinanced += originationFee;
    }

    const bankLtv = bookValue > 0 ? (bankAmountFinanced / bookValue) * 100 : 0;

    let bankPayment: number;
    let bankResidual = 0;

    if (structureType === 'leasing') {
      const resPercent = getResidualPercentage(bankTerm, vehiclePrice);
      bankResidual = bookValue * (resPercent / 100);
      bankPayment = calculateLeaseAmortization(bankAmountFinanced, sellRate, bankTerm, bankResidual);
    } else {
      bankPayment = calculateFrenchAmortization(bankAmountFinanced, sellRate, bankTerm);
    }

    return {
      bankName: bank,
      buyRate: Number(buyRate.toFixed(2)),
      sellRate: Number(sellRate.toFixed(2)),
      monthlyPayment: Number(bankPayment.toFixed(2)),
      reserveProfit: 0,
      amountFinanced: Number(bankAmountFinanced.toFixed(2)),
      ltv: Number(bankLtv.toFixed(2)),
      residualValue: structureType === 'leasing' ? Number(bankResidual.toFixed(2)) : undefined
    };
  });

  const totalProfit = frontEndProfit + backEndProfit;

  return {
    amountFinanced: Number(amountFinanced.toFixed(2)),
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    ltv: Number(ltv.toFixed(2)),
    frontEndProfit: Number(frontEndProfit.toFixed(2)),
    backEndProfit: Number(backEndProfit.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    apr,
    term: calculatedTerm,
    structureType,
    residualValue: structureType === 'leasing' ? Number(residualValue.toFixed(2)) : undefined,
    bankComparisons
  };
}
