import { useState } from 'react';
import { calculateOTD, calculateLoan, CreditTier, FinancingStructure } from '@/entities/finance';
import {
  PREMIER_WARRANTY,
  calculateProductAmortization,
} from '@/entities/finance';

export function useDealCalculations() {
  const [vehiclePrice, setVehiclePrice] = useState(35000);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [tradeInPayoff, setTradeInPayoff] = useState(0);
  const [downPayment, setDownPayment] = useState(2500);
  const [gapInsurance, setGapInsurance] = useState(0);
  const [extendedWarranty, setExtendedWarranty] = useState(0);
  const [paintProtection, setPaintProtection] = useState(0);
  const [powerPack, setPowerPack] = useState(0);
  const [showPrices, setShowPrices] = useState(false);
  const [termMonths, setTermMonths] = useState(72);
  const [creditTier, setCreditTier] = useState<CreditTier>('good');

  const currentStructure: FinancingStructure = {
    vehiclePrice,
    tradeInValue,
    tradeInPayoff,
    downPayment,
    gapInsurance,
    extendedWarranty,
    paintProtection,
    powerPack,
    creditLife: 0,
    termMonths,
    creditTier,
  };

  const otdCalculation = calculateOTD(
    vehiclePrice,
    tradeInValue,
    tradeInPayoff,
    gapInsurance,
    extendedWarranty,
    paintProtection,
    0,
    powerPack,
  );

  const loanCalculation = calculateLoan(currentStructure);

  const loanPlatinum = calculateLoan({
    ...currentStructure,
    extendedWarranty: PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    gapInsurance: PREMIER_WARRANTY.PRECIOS.GAP,
    paintProtection: PREMIER_WARRANTY.PRECIOS.CERAMICA,
    powerPack: PREMIER_WARRANTY.PRECIOS.POWER_PACK,
  });

  const loanGold = calculateLoan({
    ...currentStructure,
    extendedWarranty: PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    gapInsurance: PREMIER_WARRANTY.PRECIOS.GAP,
    paintProtection: PREMIER_WARRANTY.PRECIOS.CERAMICA,
    powerPack: 0,
  });

  const loanSilver = calculateLoan({
    ...currentStructure,
    extendedWarranty: PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    gapInsurance: PREMIER_WARRANTY.PRECIOS.GAP,
    paintProtection: 0,
    powerPack: 0,
  });

  const loanBase = calculateLoan({
    ...currentStructure,
    extendedWarranty: 0,
    gapInsurance: 0,
    paintProtection: 0,
    powerPack: 0,
  });

  const gapAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.GAP,
    termMonths,
    creditTier,
  );
  const warrantyAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    termMonths,
    creditTier,
  );
  const ceramicAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.CERAMICA,
    termMonths,
    creditTier,
  );
  const powerPackAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.POWER_PACK,
    termMonths,
    creditTier,
  );

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;

  const applyPlatinum = () => {
    setExtendedWarranty(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
    setGapInsurance(PREMIER_WARRANTY.PRECIOS.GAP);
    setPaintProtection(PREMIER_WARRANTY.PRECIOS.CERAMICA);
    setPowerPack(PREMIER_WARRANTY.PRECIOS.POWER_PACK);
  };

  const applyGold = () => {
    setExtendedWarranty(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
    setGapInsurance(PREMIER_WARRANTY.PRECIOS.GAP);
    setPaintProtection(PREMIER_WARRANTY.PRECIOS.CERAMICA);
    setPowerPack(0);
  };

  const applySilver = () => {
    setExtendedWarranty(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
    setGapInsurance(PREMIER_WARRANTY.PRECIOS.GAP);
    setPaintProtection(0);
    setPowerPack(0);
  };

  const applyBase = () => {
    setExtendedWarranty(0);
    setGapInsurance(0);
    setPaintProtection(0);
    setPowerPack(0);
  };

  return {
    vehiclePrice, setVehiclePrice,
    tradeInValue, setTradeInValue,
    tradeInPayoff, setTradeInPayoff,
    downPayment, setDownPayment,
    gapInsurance, setGapInsurance,
    extendedWarranty, setExtendedWarranty,
    paintProtection, setPaintProtection,
    powerPack, setPowerPack,
    showPrices, setShowPrices,
    termMonths, setTermMonths,
    creditTier, setCreditTier,
    currentStructure,
    otdCalculation,
    loanCalculation,
    loanPlatinum, loanGold, loanSilver, loanBase,
    gapAmortized, warrantyAmortized, ceramicAmortized, powerPackAmortized,
    formatCurrency,
    applyPlatinum, applyGold, applySilver, applyBase,
  };
}
