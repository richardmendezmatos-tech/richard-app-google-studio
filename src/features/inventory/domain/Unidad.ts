export enum EstadoUnidad {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADA = 'RESERVADA',
  VENDIDA = 'VENDIDA',
  EN_RECONDICIONAMIENTO = 'EN_RECONDICIONAMIENTO',
}

export interface Unidad {
  id: string;
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  millaje: number;
  precioVenta: number;
  costoAdquisicion: number;
  costoRecondicionamiento: number;
  estado: EstadoUnidad;
  fechaIngreso: Date;
}

export interface HistorialMantenimiento {
  id: string;
  unidadId: string;
  descripcion: string;
  costo: number;
  fecha: Date;
  taller: string;
}
