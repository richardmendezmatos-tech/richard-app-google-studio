import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDealCalculations } from '../useDealCalculations';
import { PREMIER_WARRANTY } from '@/entities/finance';

describe('useDealCalculations', () => {
  it('should have correct default values', () => {
    const { result } = renderHook(() => useDealCalculations());

    expect(result.current.vehiclePrice).toBe(35000);
    expect(result.current.tradeInValue).toBe(0);
    expect(result.current.tradeInPayoff).toBe(0);
    expect(result.current.downPayment).toBe(2500);
    expect(result.current.gapInsurance).toBe(0);
    expect(result.current.extendedWarranty).toBe(0);
    expect(result.current.paintProtection).toBe(0);
    expect(result.current.powerPack).toBe(0);
    expect(result.current.showPrices).toBe(false);
    expect(result.current.termMonths).toBe(72);
    expect(result.current.creditTier).toBe('good');
  });

  it('formatCurrency should format numbers correctly', () => {
    const { result } = renderHook(() => useDealCalculations());

    expect(result.current.formatCurrency(0)).toBe('$0');
    expect(result.current.formatCurrency(12345)).toBe('$12,345');
    expect(result.current.formatCurrency(9999999)).toBe('$9,999,999');
    expect(result.current.formatCurrency(1234.56)).toBe('$1,235');
    expect(result.current.formatCurrency(1000)).toBe('$1,000');
  });

  it('applyPlatinum should set all products to PREMIER_WARRANTY values', () => {
    const { result } = renderHook(() => useDealCalculations());

    act(() => {
      result.current.applyPlatinum();
    });

    expect(result.current.extendedWarranty).toBe(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
    expect(result.current.gapInsurance).toBe(PREMIER_WARRANTY.PRECIOS.GAP);
    expect(result.current.paintProtection).toBe(PREMIER_WARRANTY.PRECIOS.CERAMICA);
    expect(result.current.powerPack).toBe(PREMIER_WARRANTY.PRECIOS.POWER_PACK);
  });

  it('applyBase should clear all products', () => {
    const { result } = renderHook(() => useDealCalculations());

    act(() => {
      result.current.applyPlatinum();
    });

    expect(result.current.extendedWarranty).toBeGreaterThan(0);

    act(() => {
      result.current.applyBase();
    });

    expect(result.current.extendedWarranty).toBe(0);
    expect(result.current.gapInsurance).toBe(0);
    expect(result.current.paintProtection).toBe(0);
    expect(result.current.powerPack).toBe(0);
  });

  it('otdCalculation should return correct structure for default inputs', () => {
    const { result } = renderHook(() => useDealCalculations());

    const otd = result.current.otdCalculation;

    expect(otd).toHaveProperty('vehiclePrice', 35000);
    expect(otd).toHaveProperty('tradeInValue', 0);
    expect(otd).toHaveProperty('tradeInPayoff', 0);
    expect(otd).toHaveProperty('netTradeIn', 0);
    expect(otd).toHaveProperty('taxableAmount');
    expect(otd).toHaveProperty('stateTax');
    expect(otd).toHaveProperty('municipalTax');
    expect(otd).toHaveProperty('totalTaxes');
    expect(otd).toHaveProperty('dealerFees');
    expect(otd).toHaveProperty('totalBackendProducts', 0);
    expect(otd).toHaveProperty('outTheDoorPrice');

    expect(otd.taxableAmount).toBe(35000);
    expect(otd.stateTax).toBe(35000 * 0.105);
    expect(otd.municipalTax).toBe(35000 * 0.01);
    expect(otd.dealerFees).toBe(595 + 295 + 55);
  });

  it('loanPlatinum monthlyPayment should be greater than loanBase monthlyPayment', () => {
    const { result } = renderHook(() => useDealCalculations());

    expect(result.current.loanPlatinum.monthlyPayment).toBeGreaterThan(
      result.current.loanBase.monthlyPayment,
    );
  });

  it('applyGold should set warranty, GAP, ceramic but not powerPack', () => {
    const { result } = renderHook(() => useDealCalculations());

    act(() => {
      result.current.applyGold();
    });

    expect(result.current.extendedWarranty).toBe(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
    expect(result.current.gapInsurance).toBe(PREMIER_WARRANTY.PRECIOS.GAP);
    expect(result.current.paintProtection).toBe(PREMIER_WARRANTY.PRECIOS.CERAMICA);
    expect(result.current.powerPack).toBe(0);
  });

  it('applySilver should set warranty and GAP but not ceramic or powerPack', () => {
    const { result } = renderHook(() => useDealCalculations());

    act(() => {
      result.current.applySilver();
    });

    expect(result.current.extendedWarranty).toBe(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
    expect(result.current.gapInsurance).toBe(PREMIER_WARRANTY.PRECIOS.GAP);
    expect(result.current.paintProtection).toBe(0);
    expect(result.current.powerPack).toBe(0);
  });
});
