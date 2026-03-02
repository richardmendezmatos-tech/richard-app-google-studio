/**
 * Reglas de Negocio Puras para Financiamiento (Puerto Rico)
 * Estas reglas no dependen de Firebase, APIs o UI.
 */

export const REGLAS_FINANCIAMIENTO = {
  PUNTUACION_CREDITO_MINIMA: 620,
  PUNTUACION_CREDITO_ELITE: 740,
  TASA_INTERES_MAXIMA: 25.0,
  TASA_INTERES_MINIMA: 5.95, // Ajustado a mercado PR actual
  RELACION_DEUDA_INGRESO_MAXIMA: 0.45, // DTI
};

export const calcularIngresoMensualMinimo = (
  montoPrestamo: number,
  terminoMeses: number,
): number => {
  // Poder de compra basado en 35% del ingreso bruto para asegurar el cierre.
  const pagoMensualEstimado = montoPrestamo / terminoMeses;
  return pagoMensualEstimado / 0.35;
};
