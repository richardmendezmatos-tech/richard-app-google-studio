import { Unidad } from '../domain/Unidad';

export interface ReporteFinancieroUnidad {
  id: string;
  vin: string;
  margenBruto: number;
  roi: number;
  esOperacionSaludable: boolean;
}

/**
 * Caso de Uso: Evaluar Margen Operativo
 * Proporciona un análisis financiero de la unidad para asegurar la rentabilidad.
 */
export class EvaluarMargenOperativo {
  execute(unidad: Unidad): ReporteFinancieroUnidad {
    const costoTotal = unidad.costoAdquisicion + unidad.costoRecondicionamiento;
    const margenBruto = unidad.precioVenta - costoTotal;
    const roi = costoTotal > 0 ? (margenBruto / costoTotal) * 100 : 0;

    // Un margen saludable en Richard Automotive debe ser superior al 15%
    const esOperacionSaludable = roi >= 15;

    return {
      id: unidad.id,
      vin: unidad.vin,
      margenBruto,
      roi,
      esOperacionSaludable,
    };
  }
}

export const evaluarMargenOperativo = new EvaluarMargenOperativo();
