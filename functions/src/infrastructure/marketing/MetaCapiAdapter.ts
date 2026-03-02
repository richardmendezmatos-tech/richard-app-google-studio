import * as crypto from 'crypto';
import * as logger from 'firebase-functions/logger';

// Obtenemos los secretos desde process.env (inyectados por Secret Manager)
const getMetaAccessConfig = () => {
    return {
        pixelId: process.env.VITE_META_PIXEL_ID,
        accessToken: process.env.META_ACCESS_TOKEN,
    };
};

/**
 * Función helper para hashear PII según los estándares de Meta.
 * Meta requiere SHA256, en minúsculas, sin espacios al inicio o final.
 */
const hashData = (data: string | undefined): string | undefined => {
    if (!data) return undefined;

    // Normalizar: minúsculas y sin espacios
    const normalized = data.trim().toLowerCase();

    // Si el string está vacío después de limpiar, no lo enviamos
    if (!normalized) return undefined;

    return crypto.createHash('sha256').update(normalized).digest('hex');
};

/**
 * Envía un evento 'Lead' estructurado a Meta Conversions API
 */
export const sendMetaLeadEvent = async (userEmail: string | undefined, userPhone: string | undefined, originalData: any) => {
    const { pixelId, accessToken } = getMetaAccessConfig();

    if (!pixelId || !accessToken) {
        logger.warn('Meta CAPI: Credentials missing. Skipping lead event.', {
            hasPixel: !!pixelId,
            hasToken: !!accessToken
        });
        return;
    }

    try {
        // Enviar solo si tenemos teléfono o email como mínimo indispensable
        if (!userEmail && !userPhone) {
            logger.warn('Meta CAPI: Missing email and phone for matching. Skipping event.');
            return;
        }

        // Estructura de teléfono para Meta: necesita incluir código de país, solo números
        // Trataremos de mantener (+1) si es de PR/US, o limpiarlo para dejar solo dígitos
        let phoneNorm = userPhone ? userPhone.replace(/\D/g, '') : undefined;
        // Si tiene 10 dígitos (típicamente PR), agregamos el '1'
        if (phoneNorm && phoneNorm.length === 10) {
            phoneNorm = '1' + phoneNorm;
        }

        const hashedEmail = hashData(userEmail);
        const hashedPhone = hashData(phoneNorm);

        // Nombres (Opcional pero altamente recomendado para Advanced Matching)
        const hashedFirstName = hashData(originalData?.firstName);
        const hashedLastName = hashData(originalData?.lastName);

        const eventData = {
            data: [
                {
                    event_name: 'Lead',
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    user_data: {
                        em: hashedEmail ? [hashedEmail] : undefined,
                        ph: hashedPhone ? [hashedPhone] : undefined,
                        fn: hashedFirstName ? [hashedFirstName] : undefined,
                        ln: hashedLastName ? [hashedLastName] : undefined,
                        // Añadir metadata extra como ciudad o código postal si lo tienes
                        zp: originalData?.zipCode ? [hashData(originalData.zipCode)] : undefined,
                        country: [hashData('pr')] // Forzamos PR asumiendo la mayor demográfica
                    },
                    custom_data: {
                        lead_type: originalData?.type || 'Trade-In',
                    }
                }
            ]
        };

        const API_VERSION = 'v19.0';
        const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            logger.error('Meta CAPI Error Response:', responseData);
            throw new Error(`Meta CAPI API Error: ${response.statusText}`);
        }

        logger.info(`✅ Meta CAPI event 'Lead' successfully sent. Response:`, responseData);

    } catch (error) {
        logger.error(`❌ Meta CAPI Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};
