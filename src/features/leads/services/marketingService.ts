import { Car } from '@/types/types';
import { blobToBase64 } from '@/services/imageOptimizationService';

export interface MarketingContent {
  instagram: string;
  facebook: string;
  tiktokScript: string;
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
    return 'LUJO Y ESTATUS: Enfócate en la exclusividad, el éxito, la admiración que genera y el placer de conducción superior. Usa un tono sofisticado y seguro.';
  }
  if (
    type.includes('suv') ||
    type.includes('van') ||
    name.includes('sienna') ||
    name.includes('odyssey')
  ) {
    return 'FAMILIA Y SEGURIDAD: Enfócate en la protección de los hijos, la comodidad en viajes largos, el espacio para todo y la paz mental. Usa un tono cálido y protector.';
  }
  if (
    price < 15000 ||
    name.includes('spark') ||
    name.includes('mirage') ||
    name.includes('march')
  ) {
    return "INTELIGENCIA FINANCIERA: Enfócate en el ahorro de combustible, bajo costo de mantenimiento, oportunidad única y 'ser listo con el dinero'. Usa un tono empático y entusiasta.";
  }
  if (
    type.includes('pickup') ||
    name.includes('hilux') ||
    name.includes('tacoma') ||
    name.includes('ranger')
  ) {
    return 'TRABAJO Y PODER: Enfócate en la capacidad de carga, durabilidad, respeto en el camino y ser una herramienta para hacer dinero. Usa un tono robusto y directo.';
  }
  // Default
  return 'OPORTUNIDAD Y ESTILO: Enfócate en renovarse, mejorar el estilo de vida y aprovechar una gran oferta antes de que se vaya.';
};

export const generateCarMarketingContent = async (
  car: Car,
  locale: 'es' | 'en' = 'es',
): Promise<MarketingContent> => {
  const psychology = determineSalesAngle(car);

  const prompt = `
        ACTÚA COMO UN COPYWRITER EXPERTO DE CLASE MUNDIAL (Nivel Ogilvy/Gary Halbert).
        Tu objetivo es vender este auto usando psicología de ventas avanzada.
        
        CONTEXTO DEL PRODUCTO:
        - Vehículo: ${car.name}
        - Precio: $${car.price}
        - Tipo: ${car.type}
        - Badge: ${car.badge || 'N/A'}
        
        ÁNGULO PSICOLÓGICO OBLIGATORIO:
        "${psychology}"
        
        INSTRUCCIONES VISUALES (Si se incluye imagen):
        Analiza visualmente la foto. Menciona detalles que veas (estado de los rines, color especial, diseño de rines, estado impecable, extras como spoilers o barras de techo) para que el copy se sienta real y no genérico.
        
        Genera 3 piezas de contenido distintas en ${locale === 'es' ? 'Español Latino Neutro' : 'Inglés Nativo'}:

        1. FACEBOOK (Estructura PAS: Problema - Agitación - Solución):
           - Inicia con una pregunta o afirmación que toque una fibra emocional relacionada al ángulo psicológico.
           - Desarrolla una mini-historia sobre cómo este auto mejora la vida del dueño.
           - Elimina objeciones (ej. financiamiento fácil).
           - Cierra con un llamado a la acción suave pero claro.

        2. INSTAGRAM (Estilo "Lifestyle" & Aspirational):
           - Texto corto, punchy y visual.
           - Vende la "sensación" de tenerlo.
           - Usa emojis estratégicamente (no satures).
           - Hashtags: Mezcla 3 de alto volumen y 3 de nicho específico.

        3. TIKTOK SCRIPT (Estructura Viral):
           - [0-3s] EL GANCHO: Algo visualmente impactante o una frase controversial/curiosa sobre el auto.
           - [3-10s] EL VALOR: 3 cortes rápidos mostrando lo mejor del auto (interior, rines, tecnología).
           - [10-15s] EL CIERRE: "Si quieres manejarlo, comenta 'YO' ahora mismo".
        
        4. POSTER PROMPT (Instrucciones para Generador de Imágenes AI):
           - Describe una escena cinematográfica de alta gama donde el auto luzca espectacular.
           - Especifica iluminación (ej. 'golden hour', 'cyberpunk neon', 'studio lighting').
           - Incluye instrucciones para que el auto se vea reluciente y deseable.
           - NO incluyas texto en la imagen, solo la descripción visual.
           - Estilo: Fotografía publicitaria profesional de automotriz.
        
        FORMATO DE SALIDA (JSON PURO):
        {
            "instagram": "texto...",
            "facebook": "texto...",
            "tiktokScript": "texto...",
            "posterPrompt": "descripción visual para IA..."
        }
    `;

  // VISION UPGRADE: Prepare multimodal contents
  let contents: any[] = [prompt];

  if (car.img) {
    try {
      // Fetch the image and convert to base64 for Gemini
      const imgResponse = await fetch(car.img);
      const blob = await imgResponse.blob();
      const base64Data = await blobToBase64(blob);

      // Remove data:image/jpeg;base64, prefix
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
      console.log('Marketing Vision: Imagen enviada exitosamente para análisis.');
    } catch (imgError) {
      console.error('Error preparing marketing vision data:', imgError);
    }
  }

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        model: 'gemini-1.5-flash',
        config: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) throw new Error('API Error');

    const data = await response.json();

    // Robust cleaning of the response if needed
    let cleanText = data.text;
    if (cleanText.includes('```json')) {
      cleanText = cleanText.split('```json')[1].split('```')[0].trim();
    } else if (cleanText.includes('```')) {
      cleanText = cleanText.split('```')[1].split('```')[0].trim();
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Marketing Gen Error:', error);
    return {
      instagram: `¡${car.name} disponible! 🚗💨 Contáctanos hoy.`,
      facebook: `Oportunidad increíble: ${car.name} por solo $${car.price}. ¡Escríbenos!`,
      tiktokScript: '¡Mira esta nave! Disponible en Richard Automotive.',
    };
  }
};
