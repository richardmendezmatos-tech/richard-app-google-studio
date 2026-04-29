/**
 * @file financing.ts
 * @module shared/lib/utils
 * @description Lógica de cálculo financiero (F&I) para Richard Automotive.
 */

export const CREDIT_TIERS = {
  EXCELLENT: { id: 'excellent', name: 'Excelente (720+)', apr: 0.0599, minProntoPercentage: 0.05 },
  GOOD: { id: 'good', name: 'Bueno (660-719)', apr: 0.085, minProntoPercentage: 0.10 },
  FAIR: { id: 'fair', name: 'Regular (600-659)', apr: 0.1199, minProntoPercentage: 0.15 },
  POOR: { id: 'poor', name: 'Afectado (<600)', apr: 0.1599, minProntoPercentage: 0.20 },
};

export const FINANCING_CONFIG = {
  DEFAULT_APR: 0.085, 
  DEFAULT_TERM_MONTHS: 72, 
  MIN_PRONTO: 2000, 
  PRONTO_PERCENTAGE: 0.10, 
};

/**
 * Calcula el pronto (Down Payment) sugerido para una unidad basado en el Tier de crédito.
 */
export const calculateSuggestedPronto = (price: number, tierId: string = 'good'): number => {
  const tier = Object.values(CREDIT_TIERS).find(t => t.id === tierId) || CREDIT_TIERS.GOOD;
  const percentageBase = price * tier.minProntoPercentage;
  return Math.max(percentageBase, FINANCING_CONFIG.MIN_PRONTO);
};

/**
 * Calcula la mensualidad estimada usando la fórmula de amortización fija y el Tier de crédito.
 */
export const calculateMonthlyPayment = (
  price: number,
  pronto: number | null = null,
  apr: number | null = null,
  term: number = FINANCING_CONFIG.DEFAULT_TERM_MONTHS,
  tierId: string = 'good'
): number => {
  const tier = Object.values(CREDIT_TIERS).find(t => t.id === tierId) || CREDIT_TIERS.GOOD;
  const appliedApr = apr !== null ? apr : tier.apr;
  const downPayment = pronto !== null ? pronto : calculateSuggestedPronto(price, tierId);
  const loanAmount = Math.max(0, price - downPayment);
  
  if (loanAmount === 0) return 0;
  
  const monthlyRate = appliedApr / 12;
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
