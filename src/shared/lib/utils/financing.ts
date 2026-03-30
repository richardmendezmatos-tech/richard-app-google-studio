/**
 * @file financing.ts
 * @module shared/lib/utils
 * @description Lógica de cálculo financiero (F&I) para Richard Automotive.
 */

export const FINANCING_CONFIG = {
  DEFAULT_APR: 0.085, // 8.5% APR (Estándar para Richard Certified)
  DEFAULT_TERM_MONTHS: 72, // 6 años (Estándar en PR)
  MIN_PRONTO: 2000, // Mínimo absoluto de pronto para que el pago sea atractivo
  PRONTO_PERCENTAGE: 0.10, // 10% del valor de la unidad
};

/**
 * Calcula el pronto (Down Payment) sugerido para una unidad.
 * Prioriza el 10% o un mínimo absoluto si la unidad es de bajo costo.
 */
export const calculateSuggestedPronto = (price: number): number => {
  const percentageBase = price * FINANCING_CONFIG.PRONTO_PERCENTAGE;
  return Math.max(percentageBase, FINANCING_CONFIG.MIN_PRONTO);
};

/**
 * Calcula la mensualidad estimada usando la fórmula de amortización fija.
 * P = [r * PV] / [1 - (1 + r)^-n]
 */
export const calculateMonthlyPayment = (
  price: number,
  pronto: number | null = null,
  apr: number = FINANCING_CONFIG.DEFAULT_APR,
  term: number = FINANCING_CONFIG.DEFAULT_TERM_MONTHS
): number => {
  const downPayment = pronto !== null ? pronto : calculateSuggestedPronto(price);
  const loanAmount = Math.max(0, price - downPayment);
  
  if (loanAmount === 0) return 0;
  
  const monthlyRate = apr / 12;
  const payment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
  
  return Math.round(payment);
};

/**
 * Genera el mensaje estratégico para WhatsApp de alta conversión.
 */
export const generateWhatsAppQuoteUrl = (
  carName: string,
  price: number,
  monthly: number,
  pronto: number,
  phone: string = '17873682880'
): string => {
  const message = `Hola Richard! 👋 Vi esta unidad en el Command Center y me interesa cotizarla comercialmente:\n\n🚗 *${carName}*\n💰 Precio: $${price.toLocaleString()}\n📉 Pago Est.: *$${monthly}/mes*\n🤝 Pronto: $${pronto.toLocaleString()}\n\n¿Cuándo puedo pasar para una prueba de manejo?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
