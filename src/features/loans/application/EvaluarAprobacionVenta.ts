import { SolicitudPrestamo, ResultadoAprobacion } from '../domain/Loan';
import { REGLAS_FINANCIAMIENTO } from '../domain/rules';

/**
 * Caso de Uso: Evaluar Aprobacion de Venta
 * Enfocado en generar 'Power' y cierre para Richard Automotive.
 */
export class EvaluarAprobacionVenta {
  execute(solicitud: SolicitudPrestamo): ResultadoAprobacion {
    // 1. Validar Puntuación de Crédito
    if (solicitud.puntuacionCredito < REGLAS_FINANCIAMIENTO.PUNTUACION_CREDITO_MINIMA) {
      return {
        esElegible: false,
        perfil: 'Revision Requerida',
        razon: `Crédito por debajo del umbral estándar.`,
        mensajeVenta:
          'Tu unidad está cerca. Hablemos de cómo estructurar tu pronto para asegurar la aprobación.',
      };
    }

    // 2. Poder de Compra (DTI)
    const pagoBase = solicitud.montoSolicitado / 60;
    const dti = pagoBase / solicitud.ingresosMensuales;

    if (dti > REGLAS_FINANCIAMIENTO.RELACION_DEUDA_INGRESO_MAXIMA) {
      return {
        esElegible: false,
        perfil: 'Revision Requerida',
        razon: 'DTI excede los límites sugeridos para el cierre.',
        mensajeVenta:
          'Sugiero ajustar el pronto para bajar tu mensualidad y asegurar la entrega inmediata de tu unidad.',
      };
    }

    // 3. Determinar Perfil de Aprobación
    let perfil: ResultadoAprobacion['perfil'] = 'Power Standard';
    let aprSugerido = 8.95;
    let mensajeVenta =
      '¡Felicidades! Tienes una aprobación sólida para llevarte tu unidad hoy mismo.';

    if (solicitud.puntuacionCredito >= REGLAS_FINANCIAMIENTO.PUNTUACION_CREDITO_ELITE) {
      perfil = 'Power Elite';
      aprSugerido = REGLAS_FINANCIAMIENTO.TASA_INTERES_MINIMA;
      mensajeVenta =
        '¡Aprobación Elite Confirmada! Calificas para los términos más agresivos del mercado.';
    } else if (solicitud.puntuacionCredito < 680) {
      perfil = 'Power Entry';
      aprSugerido = 12.5;
      mensajeVenta =
        '¡Aprobación Lista! Estás a un paso de estrenar. Finalicemos los detalles del contrato.';
    }

    return {
      esElegible: true,
      perfil,
      aprSugerido,
      mensajeVenta,
    };
  }
}

export const evaluarAprobacionVenta = new EvaluarAprobacionVenta();
