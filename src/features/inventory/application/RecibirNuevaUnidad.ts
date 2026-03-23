import { Unidad, EstadoUnidad } from '../domain/Unidad';
import { raSentinel } from '@/shared/lib/monitoring/raSentinelService';

export interface RecibirUnidadParams {
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  millaje: number;
  costoAdquisicion: number;
}

/**
 * Caso de Uso: Recibir Nueva Unidad (In-Take)
 * Encargado de registrar una unidad en el sistema con un estado inicial.
 */
export class RecibirNuevaUnidad {
  async execute(params: RecibirUnidadParams): Promise<Unidad> {
    // 1. Validaciones básicas (Simuladas por ahora)
    if (!params.vin || params.vin.length < 11) {
      throw new Error('VIN inválido para la unidad.');
    }

    // Lógica Experta Nivel 13 para Recondicionamiento Estimado
    const aniosAntiguedad = new Date().getFullYear() - params.anio;
    const factorEdad = Math.max(0, aniosAntiguedad * 150);
    const factorMillaje = Math.max(0, (params.millaje / 1000) * 15);
    const recondEstimado = factorEdad + factorMillaje + 350; // Base de limpieza y detalle

    const nuevaUnidad: Unidad = {
      id: crypto.randomUUID(),
      ...params,
      precioVenta: (params.costoAdquisicion + recondEstimado) * 1.15, // Margen experto del 15% sobre inversión total
      costoRecondicionamiento: recondEstimado,
      estado: EstadoUnidad.EN_RECONDICIONAMIENTO,
      fechaIngreso: new Date(),
    };

    // 2. Reportar a Sentinel (Proactividad)
    raSentinel.reportActivity({
      type: 'inventory_in_take',
      data: {
        vin: nuevaUnidad.vin,
        costo: nuevaUnidad.costoAdquisicion,
        recondEstimado: nuevaUnidad.costoRecondicionamiento,
        roiProyectado:
          (nuevaUnidad.precioVenta -
            (nuevaUnidad.costoAdquisicion + nuevaUnidad.costoRecondicionamiento)) /
          (nuevaUnidad.costoAdquisicion + nuevaUnidad.costoRecondicionamiento),
      },
      operationalScore: raSentinel.calculateOperationalScore('inventory_in_take', nuevaUnidad),
    });

    console.log(
      `[Inventory] Unidad ${nuevaUnidad.vin} recibida. Recondicionamiento estimado: $${recondEstimado.toFixed(2)}`,
    );

    return nuevaUnidad;
  }
}

export const recibirNuevaUnidad = new RecibirNuevaUnidad();
