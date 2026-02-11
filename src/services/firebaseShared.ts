import { optimizeWithAntigravity } from '@/services/antigravityService';

export const optimizeImage = (url: string, width: number = 800): string => {
  return optimizeWithAntigravity(url, width);
};

export const AI_LEGAL_DISCLAIMER = "Aviso: Los precios, pagos y disponibilidad generados por IA son estimaciones para fines informativos y no constituyen una oferta formal. Sujeto a cambios sin previo aviso.";
