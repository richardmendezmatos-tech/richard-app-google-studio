export interface Venta {
  id: string;
  unidadId: string; // ID del auto (Unidad)
  clienteId: string;
  vendedorId: string;
  precioFinal: number;
  pronto: number; // Down payment
  metodoPago: 'cash' | 'finance';
  status: 'completada' | 'pendiente_deposito' | 'cancelada';
  fechaVenta: Date;
}

export interface DetalleVenta {
  nombreCliente: string;
  telefono: string;
  unidadNombre: string;
  precioVenta: number;
}
