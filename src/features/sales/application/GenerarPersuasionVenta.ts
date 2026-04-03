import { CotizacionFinanciera } from '../domain/TradeIn';

export interface ArgumentoVentaUnidad {
  headline: string;
  points: string[];
  callToAction: string;
}

/**
 * Caso de Uso: Generar Estrategia de Cierre (Sales Copilot AI)
 * Transforma datos financieros en argumentos de optimización de inversión
 * y eficiencia operativa para el cliente de Richard Automotive.
 */
export class GenerarPersuasionVenta {
  execute(params: {
    cotizacion: CotizacionFinanciera;
    nombreCliente: string;
  }): ArgumentoVentaUnidad {
    const { cotizacion, nombreCliente } = params;
    const netoEquidad = cotizacion.valorTradeIn - cotizacion.pagoDeudaTradeIn;
    const esEquidadPositiva = netoEquidad > 0;

    const points: string[] = [];

    if (esEquidadPositiva) {
      points.push(
        `Optimización de Capital: Su unidad actual genera un beneficio líquido de $${netoEquidad.toLocaleString()} que acelera su camino hacia la plenitud con esta nueva inversión.`,
      );
    } else {
      points.push(
        `Paz Mental Financiera: Hemos diseñado una estructura de consolidación para eliminar balances anteriores, garantizando su autonomía desde el primer día.`,
      );
    }

    points.push(
      `Protección de Flujo: Su pago de $${cotizacion.pagoMensualEstimado.toLocaleString()} asegura la tranquilidad de su familia mediante una tasa preferencial estratégica del ${cotizacion.apr}%.`,
    );
    points.push(
      `Esta propuesta ha sido diseñada bajo los estándares Sentinel para asegurar una conexión total con su nuevo estilo de vida.`,
    );

    return {
      headline: `Diseño de Inversión Inteligente - ${nombreCliente}`,
      points,
      callToAction: `Ejecutar Cierre Estratégico`,
    };
  }
}

export const generarPersuasionVenta = new GenerarPersuasionVenta();
