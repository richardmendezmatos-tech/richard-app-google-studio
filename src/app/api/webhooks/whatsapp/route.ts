import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuditRepository } from '@/shared/api/houston/AuditRepository';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'sentinel_richard_2024';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Handshake de suscripción exitoso con Meta.');
    return new Response(challenge, { status: 200 });
  }

  console.warn('[WhatsApp Webhook] Intento de suscripción fallido. Token incorrecto.');
  return new Response('Verification failed', { status: 403 });
}

export async function POST(req: Request) {
  try {
    // Leemos el cuerpo en crudo para la validación de firma criptográfica
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hub-signature-256');
    const audit = await getAuditRepository();

    // 1. Verificación Estricta de Firma HMAC-SHA256
    if (APP_SECRET && signatureHeader) {
      const signatureParts = signatureHeader.split('=');
      const expectedSignature = crypto
        .createHmac('sha256', APP_SECRET)
        .update(rawBody, 'utf8')
        .digest('hex');

      if (signatureParts[1] !== expectedSignature) {
        await audit.log('warning', 'Firma de Webhook de WhatsApp Inválida', { signatureHeader });
        return new Response('Firma no válida', { status: 401 });
      }
    } else if (!APP_SECRET) {
      console.warn(
        '[WhatsApp Webhook] WHATSAPP_APP_SECRET no está configurado. Omitiendo validación de firma en modo desarrollo.',
      );
    }

    const body = JSON.parse(rawBody);

    // Registramos la traza en auditoría de alto rendimiento
    await audit.log('info', 'Carga de Webhook de WhatsApp Recibida', {
      object: body.object,
      entriesCount: body.entry?.length,
    });

    // 2. Desacoplamiento y Procesamiento Estructurado del Payload
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          const phoneNumberId = value.metadata?.phone_number_id;

          // Procesamiento de Acuses de Recibo (Statuses)
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              await audit.log('info', `Estado de entrega WhatsApp: ${status.status}`, {
                messageId: status.id,
                recipientId: status.recipient_id,
                phoneNumberId,
                timestamp: status.timestamp,
              });
              // Aquí enlazaremos con la actualización de base de datos de leads en el futuro
            }
          }

          // Procesamiento de Mensajes Entrantes Crudos (Messages)
          if (value.messages && Array.isArray(value.messages)) {
            for (const message of value.messages) {
              const sender = message.from;
              const textContent = message.text?.body || '[Contenido Multimedia/Interactivo]';

              console.log(
                `[WhatsApp Webhook] Nuevo mensaje de ${sender} (Cuenta ID: ${phoneNumberId}): ${textContent}`,
              );

              await audit.log('info', `Mensaje Entrante WhatsApp de ${sender}`, {
                messageId: message.id,
                type: message.type,
                text: textContent,
                phoneNumberId,
              });
            }
          }
        }
      }
    }

    // 3. Retorno Inmediato Sincrónico exigido por Meta
    return new Response('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error interno procesando evento:', error);
    return NextResponse.json({ error: 'Fallo en procesamiento de Webhook' }, { status: 500 });
  }
}
