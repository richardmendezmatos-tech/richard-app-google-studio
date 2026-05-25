import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuditRepository } from '@/shared/api/houston/AuditRepository';
import { whatsappAgentService } from '@/server/services/whatsappAgentService';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'sentinel_richard_2024';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';
const WA_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

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

/**
 * Sends a reply back to WhatsApp via the Meta Cloud API.
 */
async function sendWhatsAppReply(phoneNumberId: string, to: string, text: string): Promise<void> {
  if (!WA_ACCESS_TOKEN) {
    console.warn('[WhatsApp Webhook] WHATSAPP_ACCESS_TOKEN no configurado. No se puede enviar respuesta.');
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[WhatsApp Webhook] Error enviando respuesta a ${to}:`, err);
  } else {
    console.log(`[WhatsApp Webhook] Respuesta enviada a ${to} via ${phoneNumberId}`);
  }
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
            }
          }

          // 🤖 Procesamiento de Mensajes Entrantes → Houston AI
          if (value.messages && Array.isArray(value.messages)) {
            for (const message of value.messages) {
              const sender = message.from;
              const textContent = message.text?.body || '';

              console.log(
                `[WhatsApp Webhook] Nuevo mensaje de ${sender} (Cuenta ID: ${phoneNumberId}): ${textContent}`,
              );

              await audit.log('info', `Mensaje Entrante WhatsApp de ${sender}`, {
                messageId: message.id,
                type: message.type,
                text: textContent,
                phoneNumberId,
              });

              // Solo procesamos mensajes de texto con Houston AI
              if (message.type === 'text' && textContent) {
                try {
                  // Usamos el número de teléfono del remitente como leadId temporal
                  const reply = await whatsappAgentService.processInboundMessage(sender, textContent);

                  // Enviamos la respuesta de vuelta al cliente
                  if (reply && phoneNumberId) {
                    await sendWhatsAppReply(phoneNumberId, sender, reply);
                  }
                } catch (agentError) {
                  console.error('[WhatsApp Webhook] Error en Houston AI:', agentError);
                  await audit.log('error', 'Houston AI falló al procesar mensaje', {
                    sender,
                    error: agentError instanceof Error ? agentError.message : String(agentError),
                  });
                }
              }
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

