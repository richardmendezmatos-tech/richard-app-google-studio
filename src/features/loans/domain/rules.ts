/**
 * Reglas de Negocio Puras para Préstamos
 * Estas reglas no dependen de Firebase, APIs o UI.
 */

export const LOAN_RULES = {
  MIN_CREDIT_SCORE: 600,
  MAX_APR: 25.0,
  MIN_APR: 4.95,
  MAX_DTI_RATIO: 0.45, // Debt to Income
};

export const calculateMinMonthlyIncome = (loanAmount: number, termMonths: number): number => {
  // Lógica simplificada: La mensualidad no debe exceder el 30% del ingreso
  const estimatedMonthlyPayment = loanAmount / termMonths;
  return estimatedMonthlyPayment / 0.3;
};
