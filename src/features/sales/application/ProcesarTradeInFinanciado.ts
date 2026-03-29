import { UnidadTradeIn, CotizacionFinanciera } from '../domain/TradeIn';
import { REGLAS_FINANCIAMIENTO } from '../../loans/domain/rules';
import { raSentinel } from '@/shared/lib/monitoring/raSentinelService';

/**
 * Caso de Uso: Procesar Trade-In Financiado
 * Este es un flujo complejo que involucra:
 * 1. Cálculo de Equidad (Valor Tasación - Deuda)
 * 2. Aplicación del pronto (Cash + Equidad)
 * 3. Estructuración del financiamiento e integración con Sentinel
 */
export class ProcesarTradeInFinanciado {
  execute(params: {
    precioUnidadNueva: number;
    tradeIn?: UnidadTradeIn;
    prontoCash: number;
    terminoMeses: number;
    creditScore: number;
  }): CotizacionFinanciera {
    const { precioUnidadNueva, tradeIn, prontoCash, terminoMeses, creditScore } = params;

    // Guard Clause: Validación de término
    if (terminoMeses <= 0) {
      throw new Error('El término en meses debe ser mayor a cero.');
    }

    // 1. Calcular Equidad del Trade-In
    let equidadTradeIn = 0;
    let valorTradeInTotal = 0;
    let deudaTradeIn = 0;

    if (tradeIn) {
      valorTradeInTotal = tradeIn.valorTasacion;
      deudaTradeIn = tradeIn.deudaPendiente;
      equidadTradeIn = valorTradeInTotal - deudaTradeIn;
    }

    // 2. Determinar Monto a Financiar
    const montoAFinanciar = precioUnidadNueva - equidadTradeIn - prontoCash;

    // 3. Determinar APR sugerido (Alineado con Elegibilidad de Plenitud)
    let apr = REGLAS_FINANCIAMIENTO.TASA_INTERES_MINIMA;
    if (creditScore < REGLAS_FINANCIAMIENTO.PUNTUACION_CREDITO_ELITE) apr = 8.95;
    if (creditScore < 680) apr = 12.5;

    // 4. Calcular Pago Mensual (Respetando promoción 0% APR)
    let pagoMensualEstimado: number;
    if (apr === 0) {
      pagoMensualEstimado = montoAFinanciar / terminoMeses;
    } else {
      const tasaMensual = apr / 100 / 12;
      pagoMensualEstimado =
        (montoAFinanciar * (tasaMensual * Math.pow(1 + tasaMensual, terminoMeses))) /
        (Math.pow(1 + tasaMensual, terminoMeses) - 1);
    }

    // Integración con raSentinel para Operational Score e IFF (Fire & Forget para latencia cero)
    const operationalScore = raSentinel.calculateBusinessHealthScore('trade_in_calculation', {
      montoAFinanciar,
      creditScore,
    });
    raSentinel.reportActivity({
      type: 'trade_in_calculation',
      data: { montoAFinanciar, creditScore, apr },
      operationalScore,
    });

    return {
      precioUnidadDestino: precioUnidadNueva,
      valorTradeIn: valorTradeInTotal,
      pagoDeudaTradeIn: deudaTradeIn,
      prontoCash,
      montoAFinanciar,
      apr,
      terminoMeses,
      pagoMensualEstimado: Math.round(pagoMensualEstimado * 100) / 100,
    };
  }
}

export const procesarTradeInFinanciado = new ProcesarTradeInFinanciado();
