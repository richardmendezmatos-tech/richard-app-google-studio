import { CotizacionFinanciera } from '../domain/TradeIn';

export interface ArgumentoVentaUnidad {
  headline: string;
  points: string[];
  callToAction: string;
}

/**
 * Caso de Uso: Generar Persuasión de Venta
 * Utiliza IA (Simulado con lógica experta) para transformar datos técnicos
 * en beneficios de paz mental y plenitud para la familia.
 */
export class GenerarPersuasionVenta {
  execute(params: {
    cotizacion: CotizacionFinanciera;
    nombreCliente: string;
  }): ArgumentoVentaUnidad {
    const { cotizacion, nombreCliente } = params;
    const esEquidadPositiva = cotizacion.valorTradeIn - cotizacion.pagoDeudaTradeIn > 0;

    const points: string[] = [];

    if (esEquidadPositiva) {
      points.push(
        `Su unidad actual le está regalando un beneficio neto de $${(cotizacion.valorTradeIn - cotizacion.pagoDeudaTradeIn).toLocaleString()} para su nueva inversión.`,
      );
    } else {
      points.push(
        `Hemos logrado consolidar su deuda anterior para que pueda estrenar hoy mismo con un pago cómodo.`,
      );
    }

    points.push(
      `Su pago mensual de $${cotizacion.pagoMensualEstimado.toLocaleString()} está protegido con una tasa del ${cotizacion.apr}%, asegurando su estabilidad familiar.`,
    );
    points.push(
      `En Richard Automotive, su autonomía es nuestra prioridad. Esta estructura está diseñada para su tranquilidad financiera.`,
    );

    return {
      headline: `Propuesta de Plenitud para ${nombreCliente}`,
      points,
      callToAction: `Firmar Compromiso de Venta y Estrenar`,
    };
  }
}

export const generarPersuasionVenta = new GenerarPersuasionVenta();
