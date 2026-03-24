export const CONSTANTES_PR = {
  // Impuestos Estatales y Municipales sobre Venta de Vehículos en Puerto Rico
  IVU_STATE_RATE: 0.105, // 10.5% Estatal
  IVU_MUNICIPAL_RATE: 0.01, // 1% Municipal
  TOTAL_IVU_RATE: 0.115, // 11.5% Total (para autos regulares)

  // Costos Provisionales de Richard Automotive Command Center
  DOC_FEE_STANDARDIZED: 595.0, // El "Doc Fee" o Cargo por Documentación y Processing
  REGISTRATION_FEE_BASE: 295.0, // Tablilla, Marbete, Arbitrios Menores
  TITLE_TRANSFER_FEE: 55.0,     // Traspaso de título oficial
  
  // Benchmark para LTV (Loan-To-Value) y DTI (Debt-To-Income)
  MAX_LTV_RATIO: 1.25, // Los bancos en PR rara vez prestan más del 125% del valor real
  MAX_DTI_RATIO: 0.45,  // 45% DTI máximo para Aprobación Elite
};

export const PRODUCTOS_BACKEND_RANGOS = {
  GAP_INSURANCE: { min: 495, max: 1200, default: 895 },
  WARRANTY_EXT: { min: 1200, max: 3500, default: 1995 },
  PAINT_PROTECTION: { min: 395, max: 800, default: 595 },
  CREDIT_LIFE: { min: 500, max: 1500, default: 800 },
};
