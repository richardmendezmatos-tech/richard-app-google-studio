export interface Prestamo {
  id: string;
  solicitanteId: string;
  monto: number;
  apr: number;
  terminoMeses: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'desembolsado';
  puntuacionCredito?: number;
  ingresosMensuales?: number;
  seguroSocial?: string;
  telefono?: string;
  resultadoAprobacion?: ResultadoAprobacion;
  valorTradeIn?: number;
  fechaCreacion: Date;
  metadata?: Record<string, any>;
}

export interface SolicitudPrestamo {
  nombreSolicitante: string;
  ingresosMensuales: number;
  puntuacionCredito: number;
  montoSolicitado: number;
  precioUnidad: number;
  valorTradeIn?: number;
  seguroSocial: string;
  telefono: string;
}

export interface ResultadoAprobacion {
  esElegible: boolean;
  perfil: 'Power Elite' | 'Power Standard' | 'Power Entry' | 'Revision Requerida';
  razon?: string;
  aprSugerido?: number;
  mensajeVenta: string;
}
