import { Car } from '@/shared/types/types';
import { blobToBase64 } from '@/shared/api/media/imageOptimizationService';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

export interface MarketingContent {
  instagram: string;
  facebook: string;
  tiktokScript: string;
  whatsapp: string; // Nuevo canal de cierre directo
  posterPrompt?: string;
}

const determineSalesAngle = (car: Car): string => {
  const price = Number(car.price);
  const name = car.name.toLowerCase();
  const type = car.type.toLowerCase();

  if (
    price > 45000 ||
    type.includes('luxury') ||
    name.includes('mercedes') ||
    name.includes('bmw') ||
    name.includes('audi')
  ) {
    return 'LUJO Y ESTATUS: Enfócate en la exclusividad, el éxito en PR, y la presencia que impone en el expreso. Usa un tono sofisticado de "High-End Dealer".';
  }
  if (
    type.includes('suv') ||
    type.includes('van') ||
    name.includes('sienna') ||
    name.includes('odyssey')
  ) {
    return 'FAMILIA Y SEGURIDAD: Enfócate en el chinchorreo familiar, la comodidad para los nenes y la seguridad en las carreteras de la isla. Tono protector y confiable.';
  }
  if (
    price < 18000 ||
    name.includes('spark') ||
    name.includes('mirage') ||
    name.includes('march') ||
    name.includes('accent')
  ) {
    return "MOVILIDAD INTELIGENTE: Enfócate en el ahorro de gasolina, financiamiento con $0 pronto (si aplica) y ser la solución perfecta para el 'daily' en PR. Tono entusiasta y accesible.";
  }
  if (
    type.includes('pickup') ||
    name.includes('hilux') ||
    name.includes('tacoma') ||
    name.includes('ranger') ||
    name.includes('f-150')
  ) {
    return 'TRABAJO Y FUERZA: Enfócate en que es una máquina de guerra para el trabajo o para la finca. Resalta la durabilidad en el clima de PR. Tono robusto y de "negocio".';
  }
  // Default
  return 'OPORTUNIDAD ÚNICA: Enfócate en que esta unidad no dura 24 horas en el lote de Central Ford. Crea urgencia real.';
};

export const generateCarMarketingContent = async (
  car: Car,
  locale: 'es' | 'en' = 'es',
): Promise<MarketingContent> => {
  const psychology = determineSalesAngle(car);
  const dealerInfo = BUSINESS_CONTACT.dealer;

  const prompt = `
        ACTÚA COMO UN CONTENT STRATEGIST SENIOR EXPERTO EN EL MERCADO AUTOMOTRIZ DE PUERTO RICO.
        Tu misión es generar contenido que detenga el scroll y genere leads inmediatos para Richard Automotive en ${dealerInfo.location.city}.

        PERFIL DEL NEGOCIO:
        - Dealer: ${dealerInfo.name} (Central Ford)
        - Ubicación: ${dealerInfo.location.address}, Vega Alta, PR.
        - Teléfono de cierre: ${BUSINESS_CONTACT.primaryPhone}
        - Personalidad: Richard es Finance Manager Experto. Si el cliente tiene crédito afectado o busca el mejor negocio, Richard lo resuelve.

        DATOS DE LA UNIDAD:
        - Vehículo: ${car.name}
        - Precio: $${Number(car.price).toLocaleString()}
        - Categoría: ${car.type}
        - Estado: Certified Pre-Owned / Impecable
        
        ÁNGULO PSICOLÓGICO PARA PR:
        "${psychology}"
        
        INSTRUCCIONES DE TONO (PUERTO RICO):
        - Usa jerga local sutil pero efectiva: "Esa guagua", "Llegó el pronto", "Pa' monta'o", "El negocio de tu vida".
        - Enfatiza la transparencia y la rapidez: "Sal hoy mismo guiando".
        
        GENERA 4 PIEZAS DE CONTENIDO (JSON):

        1. FACEBOOK (Estructura de Retención):
           - Un hook fuerte que mencione a Vega Alta o el beneficio principal.
           - Bullet points con 3 specs clave.
           - Menciona que Richard te ayuda con el financiamiento.
           - CTA: "Dale click al link de WhatsApp en los comentarios".

        2. INSTAGRAM (Aspirational / Reel Cover Style):
           - Copy corto y visual.
           - Usa palabras como "Impecable", "Clean Carfax", "Showroom Ready".
           - Hashtags: #PuertoRicoCars #VegaAlta #CentralFord #RichardAutomotive #AutosUsadosPR.

        3. TIKTOK SCRIPT (Viral Hook):
           - [0-2s] Gancho: "¿Buscabas esta nena? Mira lo que acaba de llegar a Central Ford."
           - [2-8s] Detalles rápidos: "Aros, interiores, tecnología... está nueva."
           - [8-12s] Cierre: "Richard te la monta. Llama al ${BUSINESS_CONTACT.primaryPhone}."

        4. WHATSAPP (Direct Sales Message):
           - Formato optimizado para reenviar a leads.
           - Usa negritas y bullet points.
           - Incluye "Richard te espera en Central Ford para la prueba de manejo".

        FORMATO DE SALIDA (JSON ÚNICAMENTE):
        {
            "instagram": "...",
            "facebook": "...",
            "tiktokScript": "...",
            "whatsapp": "...",
            "posterPrompt": "..."
        }
    `;

  let contents: any[] = [prompt];

  if (car.img) {
    try {
      const imgResponse = await fetch(car.img);
      const blob = await imgResponse.blob();
      const base64Data = await blobToBase64(blob);
      const base64Content = base64Data.split(',')[1];

      contents = [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: blob.type,
                data: base64Content,
              },
            },
          ],
        },
      ];
    } catch (imgError) {
      console.error('Marketing Vision Error:', imgError);
    }
  }

  try {
    const { functions } = await import('@/shared/api/firebase/client');
    const { httpsCallable } = await import('firebase/functions');
    const askGemini = httpsCallable<any, string>(functions, 'askGemini');

    const response = await askGemini({
      contents,
      model: 'gemini-1.5-flash',
      config: { responseMimeType: 'application/json' },
    });

    let cleanText = response.data;
    if (cleanText.includes('```json')) {
      cleanText = cleanText.split('```json')[1].split('```')[0].trim();
    } else if (cleanText.includes('```')) {
      cleanText = cleanText.split('```')[1].split('```')[0].trim();
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Marketing Gen Error:', error);
    return {
      instagram: `¡${car.name} impecable en Central Ford! 🚗💨 Richard te ayuda con el financiamiento.`,
      facebook: `¿Buscabas una ${car.name}? Acaba de llegar a Vega Alta. ¡Richard resuelve! Llama al ${BUSINESS_CONTACT.primaryPhone}.`,
      tiktokScript: '¡Mira esta nave en Central Ford! Sal hoy guiando con Richard.',
      whatsapp: `*${car.name}* - Disponible en Central Ford.\n\nRichard te espera para cuadrar el mejor negocio. 📞 ${BUSINESS_CONTACT.primaryPhone}`,
    };
  }
};
