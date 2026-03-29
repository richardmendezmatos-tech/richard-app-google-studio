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
        `Optimización de Capital: Su unidad actual genera un beneficio líquido de $${netoEquidad.toLocaleString()} aplicable a su nueva inversión.`,
      );
    } else {
      points.push(
        `Eficiencia de Deuda: Hemos estructurado una consolidación estratégica para eliminar su balance anterior y facilitar el estreno hoy.`,
      );
    }

    points.push(
      `Protección de Flujo: Su pago de $${cotizacion.pagoMensualEstimado.toLocaleString()} con una tasa preferencial del ${cotizacion.apr}% asegura su estabilidad financiera a largo plazo.`,
    );
    points.push(
      `En Richard Automotive, maximizamos su ROI operativo. Este negocio está diseñado bajo los más altos estándares de eficiencia del Command Center.`,
    );

    return {
      headline: `Propuesta Estratégica de Inversión - ${nombreCliente}`,
      points,
      callToAction: `Ejecutar Cierre y Entrega de Unidad`,
    };
  }
}

export const generarPersuasionVenta = new GenerarPersuasionVenta();
