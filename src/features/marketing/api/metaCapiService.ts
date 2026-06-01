import * as crypto from 'crypto';

// Obtenemos los secretos desde process.env
const getMetaAccessConfig = () => {
  return {
    pixelId: process.env.VITE_META_PIXEL_ID,
    accessToken: process.env.META_ACCESS_TOKEN,
  };
};

/**
 * Función helper para hashear PII según los estándares de Meta.
 */
const hashData = (data: string | undefined): string | undefined => {
  if (!data) return undefined;
  const normalized = data.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

/**
 * Envía un evento 'Lead' estructurado a Meta Conversions API
 */
export const sendMetaLeadEvent = async (
  userEmail: string | undefined,
  userPhone: string | undefined,
  originalData: any,
) => {
  const { pixelId, accessToken } = getMetaAccessConfig();

  if (!pixelId || !accessToken) {
    console.warn('Meta CAPI: Credentials missing. Skipping lead event.');
    return;
  }

  try {
    if (!userEmail && !userPhone) {
      console.warn('Meta CAPI: Missing email and phone for matching. Skipping event.');
      return;
    }

    let phoneNorm = userPhone ? userPhone.replace(/\D/g, '') : undefined;
    if (phoneNorm && phoneNorm.length === 10) {
      phoneNorm = '1' + phoneNorm;
    }

    const hashedEmail = hashData(userEmail);
    const hashedPhone = hashData(phoneNorm);
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
            zp: originalData?.zipCode ? [hashData(originalData.zipCode)] : undefined,
            country: [hashData('pr')],
          },
          custom_data: {
            lead_type: originalData?.type || 'Trade-In',
          },
        },
      ],
    };

    const API_VERSION = 'v19.0';
    const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI Error Response:', responseData);
      throw new Error(`Meta CAPI API Error: ${response.statusText}`);
    }

    console.log(`✅ Meta CAPI event 'Lead' successfully sent. Response:`, responseData);
  } catch (error) {
    console.error(`❌ Meta CAPI Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
