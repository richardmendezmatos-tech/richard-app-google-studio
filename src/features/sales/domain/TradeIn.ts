export interface UnidadTradeIn {
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  millaje: number;
  valorTasacion: number;
  deudaPendiente: number; // Lo que el cliente aún debe al banco por esta unidad
}

export interface CotizacionFinanciera {
  precioUnidadDestino: number;
  valorTradeIn: number;
  pagoDeudaTradeIn: number;
  prontoCash: number;
  montoAFinanciar: number;
  apr: number;
  terminoMeses: number;
  pagoMensualEstimado: number;
}
