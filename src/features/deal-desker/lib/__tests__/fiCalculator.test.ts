// Pruebas Unitarias para la calculadora F&I de DealDesker
// Slice: deal-desker - Lib
// Creado: 2026-05-24

import { describe, it, expect } from 'vitest';
import { getSuggestedAPR, calculateFIDeal } from '../fiCalculator';

describe('fiCalculator - getSuggestedAPR', () => {
  it('debe retornar el APR correcto para Tier 1 a 60 meses', () => {
    const apr = getSuggestedAPR('tier_1', 60);
    expect(apr).toBe(5.95);
  });

  it('debe retornar el APR correcto para Tier 3 a 72 meses', () => {
    const apr = getSuggestedAPR('tier_3', 72);
    expect(apr).toBe(10.45);
  });

  it('debe hacer fallback al plazo más cercano si no es estándar', () => {
    const apr = getSuggestedAPR('tier_2', 65);
    expect(apr).toBe(7.95); // 72 meses es el más cercano hacia arriba
  });
});

describe('fiCalculator - calculateFIDeal', () => {
  it('debe calcular amortización automotriz simple con cero trade-in y cero extras', () => {
    const result = calculateFIDeal({
      vehiclePrice: 30000,
      downPayment: 5000,
      term: 60,
      apr: 6.0, // 6% APR
    });

    // Préstamo = 30000 - 5000 = 25000 (Marbete de $244.00 se paga aparte en el dealer, no se financia)
    expect(result.amountFinanced).toBe(25000);
    // LTV = 25000 / 30000 = 83.33%
    expect(result.ltv).toBe(83.33);
    // Pago mensual amortizado para $25,000 al 6% a 60 meses es aprox $483.32
    expect(result.monthlyPayment).toBeCloseTo(483.32, 1);
  });

  it('debe calcular correctamente incorporando coberturas de F&I (Back-End)', () => {
    const result = calculateFIDeal({
      vehiclePrice: 40000,
      downPayment: 5000,
      term: 72,
      apr: 8.0,
      gapInsuranceEnabled: true, // +$798 (GAP para 72m)
      extendedWarrantyEnabled: true, // +$4,216 (Garantía)
    });

    // Préstamo = 40000 - 5000 + 798 + 4216 = 40014
    expect(result.amountFinanced).toBe(40014);
    // LTV = 40014 / 40000 = 100.035% -> redondeado a 100.04% por precisión decimal
    expect(result.ltv).toBe(100.04);
    // Ganancia de Back-End: GAP ($320 profit) + Garantía ($2,000 profit) = $2,320
    expect(result.backEndProfit).toBe(2320);
  });

  it('debe calcular trade-in con equidad negativa (deuda mayor al valor)', () => {
    const result = calculateFIDeal({
      vehiclePrice: 35000,
      downPayment: 2000,
      tradeInValue: 8000,
      tradeInPayoff: 10000, // Deuda de $10,000 > Valor de $8,000 -> +$2,000 equidad negativa
      term: 60,
      apr: 5.0,
    });

    // Préstamo = 35000 - 2000 - (8000 - 10000) = 35000 - 2000 - (-2000) = 35000
    expect(result.amountFinanced).toBe(35000);
    expect(result.ltv).toBe(100.0);
  });

  it('debe calcular montos de leasing incluyendo cargos de originacion de Banco Popular y FirstBank', () => {
    // Banco Popular Leasing: cargo de $895.00
    const resultPopular = calculateFIDeal({
      vehiclePrice: 30000,
      downPayment: 5000,
      term: 36,
      apr: 5.75,
      structureType: 'leasing',
      selectedBank: 'popular'
    });
    // Financiado = 30000 - 5000 + 895 (Originación de Popular) = 25895
    expect(resultPopular.amountFinanced).toBe(25895);

    // FirstBank Leasing: cargo de $995.00
    const resultFirst = calculateFIDeal({
      vehiclePrice: 30000,
      downPayment: 5000,
      term: 36,
      apr: 5.45,
      structureType: 'leasing',
      selectedBank: 'firstbank'
    });
    // Financiado = 30000 - 5000 + 995 (Originación de FirstBank) = 25995
    expect(resultFirst.amountFinanced).toBe(25995);
  });

  it('debe calcular las comparaciones multi-banco y confirmar la tasa fija (sin reserve spread)', () => {
    const result = calculateFIDeal({
      vehiclePrice: 30000,
      downPayment: 5000,
      term: 60,
      apr: 7.95, 
      vehicleYear: 2026,
      vehicleCondition: 'new',
      creditTier: 'tier_1',
    });

    expect(result.bankComparisons).toBeDefined();
    expect(result.bankComparisons?.length).toBe(3);

    // Banco Popular: buyRate 6.25%, sellRate debe ser igual a buyRate en Tasa Fija (6.25%)
    const popular = result.bankComparisons?.find(b => b.bankName === 'popular');
    expect(popular).toBeDefined();
    expect(popular?.buyRate).toBe(6.25);
    expect(popular?.sellRate).toBe(6.25);
    // En tasa fija, la ganancia por spread (F&I Reserve) debe ser estrictamente 0
    expect(popular?.reserveProfit).toBe(0);

    // FirstBank: buyRate 5.95%, sellRate 5.95%, reserveProfit 0
    const firstbank = result.bankComparisons?.find(b => b.bankName === 'firstbank');
    expect(firstbank?.buyRate).toBe(5.95);
    expect(firstbank?.sellRate).toBe(5.95);
    expect(firstbank?.reserveProfit).toBe(0);
  });

  it('debe retornar residual cero en leasing si el precio del vehiculo es menor de $35,000', () => {
    const result = calculateFIDeal({
      vehiclePrice: 34999, // Menor de $35k
      downPayment: 5000,
      term: 36,
      apr: 6.0,
      structureType: 'leasing',
      selectedBank: 'popular'
    });

    expect(result.residualValue).toBe(0);
  });

  it('debe limitar el plazo de leasing a un maximo de 66 meses', () => {
    const result = calculateFIDeal({
      vehiclePrice: 40000,
      downPayment: 5000,
      term: 72, // Mayor de 66 meses
      apr: 6.0,
      structureType: 'leasing',
      selectedBank: 'popular'
    });

    expect(result.term).toBe(66);
  });
});
