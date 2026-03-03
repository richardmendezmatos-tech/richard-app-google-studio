import { SolicitudPrestamo, ResultadoAprobacion } from '../domain/Loan';
import { REGLAS_FINANCIAMIENTO } from '../domain/rules';
import { FirestoreLoanRepository } from '../infra/FirestoreLoanRepository';
import { getFunctionsService } from '@/services/firebaseService';
import { httpsCallable } from 'firebase/functions';

/**
 * Caso de Uso: Evaluar Aprobacion de Venta
 * Enfocado en generar 'Power' y cierre para Richard Automotive.
 */
export class EvaluarAprobacionVenta {
  constructor(private readonly loanRepository?: FirestoreLoanRepository) {}

  async execute(solicitud: SolicitudPrestamo): Promise<ResultadoAprobacion> {
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

    const resultado: ResultadoAprobacion = {
      esElegible: true,
      perfil,
      aprSugerido,
      mensajeVenta,
    };

    // Persistir el intento de forma asíncrona (fire-and-forget seguro delegando al repo)
    if (this.loanRepository && resultado.esElegible) {
      this.loanRepository
        .save({
          solicitanteId: solicitud.nombreSolicitante,
          seguroSocial: solicitud.seguroSocial,
          telefono: solicitud.telefono,
          monto: solicitud.montoSolicitado,
          apr: aprSugerido,
          terminoMeses: 60,
          estado: 'aprobado',
          puntuacionCredito: solicitud.puntuacionCredito,
          ingresosMensuales: solicitud.ingresosMensuales,
          resultadoAprobacion: resultado,
          metadata: {
            valorTradeIn: solicitud.valorTradeIn,
            precioUnidad: solicitud.precioUnidad,
          },
        })
        .then(async () => {
          // Enviar Notificación SMS a través de Firebase Functions de forma Asíncrona
          try {
            const functionsService = await getFunctionsService();
            if (functionsService) {
              const sendSmsLead = httpsCallable(functionsService, 'sendSmsLead');
              sendSmsLead({
                toParams: {
                  phone: solicitud.telefono,
                  clientName: solicitud.nombreSolicitante,
                  vehicleDesc: `vehículo (${solicitud.precioUnidad})`,
                },
              }).catch((e) => console.error('Error enviando SMS de Lead [Twilio]:', e));
            }
          } catch (error) {
            console.error('Error invocando Twilio:', error);
          }
        })
        .catch(() => {
          // Silently fail to keep use case pure and separate from IO failures
        });
    }

    return resultado;
  }
}
