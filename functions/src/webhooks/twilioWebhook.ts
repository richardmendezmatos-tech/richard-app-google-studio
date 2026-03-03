import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { twilioBackendService } from '../services/twilioService';

const ALLOWED_ORIGINS = [
  'https://richard-automotive.vercel.app',
  'https://richard-automotive-dev.web.app',
  'http://localhost:5173',
];

interface SmsLeadPayload {
  toParams: {
    phone: string;
    clientName: string;
    vehicleDesc: string;
  };
}

export const sendSmsLead = onCall(
  {
    cors: ALLOWED_ORIGINS,
    // secrets: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'], // Si están en Google Cloud Secrets Management
  },
  async (request) => {
    // Si queremos restringir a usuarios autenticados:
    // if (!request.auth) {
    //   throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    // }

    const { toParams } = request.data as SmsLeadPayload;

    if (!toParams || !toParams.phone || !toParams.clientName) {
      throw new HttpsError('invalid-argument', 'Faltan parámetros requeridos (phone, clientName).');
    }

    // Limpiar el teléfono (Twilio usualmente requiere formato E.164, ej: +17871234567)
    // Asumimos PR/US code +1 si no viene con +
    let formattedPhone = toParams.phone.replace(/[^0-9+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) formattedPhone = `+1${formattedPhone}`;
      else formattedPhone = `+${formattedPhone}`;
    }

    const vehicleStr = toParams.vehicleDesc || 'un vehículo de nuestro inventario';

    // Plantilla del mensaje a enviar al *cliente* o al *vendedor*,
    // pero según el plan, es para notificar al equipo o dar seguimiento al cliente.
    // "Plantilla SMS: ¡Lead Caliente! Richard Automotive: {cliente} pre-aprobado para el {vehiculo}. Llama ahora: {telefono}."
    // En este caso el SMS usualmente se envía _al vendedor_, pero si "toParams.phone" es del seller se envía allí.
    // O si es un SMS de confirmación al cliente: "¡Felicidades {cliente}, tu pre-cualificación fue exitosa..."
    // Basado en el requerimiento, lo enviaremos al teléfono indicado en la llamada con esta plantilla:

    // OJO: Cambia este número de destino si quieres que siempre vaya al vendedor
    // const sellerPhone = process.env.SELLER_PHONE || '+17870000000';
    // body = `¡Lead Caliente! Richard Automotive: ${toParams.clientName} pre-aprobado para el ${vehicleStr}. Llama al: ${formattedPhone}`;

    const body = `¡Lead Caliente! Richard Automotive: ${toParams.clientName} pre-aprobado para el ${vehicleStr}. Llama ahora: ${formattedPhone}`;

    // Enviaremos la alerta al 'fromPhone' del vendedor o a un numero de la agencia.
    // Por simplicidad, y porque enviamos la config "to" en la llamada:

    // Asumimos que `to` es el destinatorio.
    // Si deseamos notificar al equipo, entonces el frontend nos enviará el TO (ejemplo: un número de gerente).
    const TO = process.env.ADMIN_PHONE_NUMBER || '+17875550000'; // Puedes cambiarlo. Aquí usaremos un default si no nos lo pasa el cliente para el vendedor.

    // Por ahora, asumiremos que se envía alerta interna SMS al número configurado como administrador, o si prefieres, al mismo `formattedPhone` temporalmente.
    // Enviaremos la alerta interna al ADMIN
    const success = await twilioBackendService.sendSMS(TO, body);

    if (!success) {
      throw new HttpsError('internal', 'Error al enviar el SMS.');
    }

    return { success: true };
  },
);
