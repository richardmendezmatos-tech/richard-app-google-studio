// Definición de tipos de datos para DealDesker F&I
// Capa: Entities - Slice: Deal
// Creado: 2026-05-24

export type CreditTier = 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';

export type DealStatus = 'structured' | 'pending_approval' | 'approved' | 'closed';

export type BankName = 'popular' | 'firstbank' | 'oriental';

export interface BankRate {
  id?: string;
  bankName: BankName;
  vehicleCondition: 'new' | 'used';
  minYear: number;
  maxYear: number;
  creditTier: CreditTier;
  term: number;
  buyRate: number;
  maxSellRate: number;
}

export interface BankComparisonOption {
  bankName: BankName;
  buyRate: number;
  sellRate: number;
  monthlyPayment: number;
  reserveProfit: number; // Ganancia para el dealer por el spread
  amountFinanced: number;
  ltv: number;
  residualValue?: number; // Para estructuras de Leasing
}

export interface Deal {
  id?: string;
  leadId: string;
  inventoryId: string | null;
  creditTier: CreditTier;
  downPayment: number;
  tradeInValue: number;
  tradeInPayoff: number;
  term: 36 | 48 | 60 | 72 | 84;
  apr: number;
  ltv: number;
  estimatedMonthlyPayment: number;
  frontEndProfit: number;
  backEndProfit: number;
  bankSelected: string | null;
  status: DealStatus;
  structureType?: 'conventional' | 'leasing'; // Convencional o Arrendamiento
  residualValue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealCalculationResult {
  amountFinanced: number;
  monthlyPayment: number;
  ltv: number;
  frontEndProfit: number;
  backEndProfit: number;
  totalProfit: number;
  apr: number;
  term: number;
  structureType?: 'conventional' | 'leasing';
  residualValue?: number;
  bankComparisons?: BankComparisonOption[];
}
