export interface Prestamo {
  id: string;
  solicitanteId: string;
  monto: number;
  apr: number;
  terminoMeses: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'desembolsado';
  fechaCreacion: Date;
  metadata?: Record<string, any>;
}

export interface SolicitudPrestamo {
  nombreSolicitante: string;
  ingresosMensuales: number;
  puntuacionCredito: number;
  montoSolicitado: number;
  precioUnidad: number;
}

export interface ResultadoAprobacion {
  esElegible: boolean;
  perfil: 'Power Elite' | 'Power Standard' | 'Power Entry' | 'Revision Requerida';
  razon?: string;
  aprSugerido?: number;
  mensajeVenta: string;
}
