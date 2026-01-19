
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { Car, BlogPost } from "../types";

// Helper to get a fresh client instance (important for API key updates)
// Helper to get a fresh client instance (important for API key updates)
// Uses Vite's import.meta.env for frontend access
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Local Fallback Database
const FALLBACK_RESPONSES: Record<string, string> = {
  'suv': 'Tenemos excelentes SUVs como la Hyundai Tucson y Santa Fe. ¿Te gustaría ver detalles de alguna?',
  'precio': 'Nuestros precios son muy competitivos y transparentes. ¿Buscas algo en un rango específico?',
  'oferta': 'Sí, tenemos ofertas especiales de 0% APR en modelos seleccionados. ¡Pregúntame por la Santa Fe!',
  'financiamiento': 'Trabajamos con todos los bancos locales. ¿Te gustaría pre-cualificar ahora mismo?',
  'horario': 'Estamos abiertos de Lunes a Sábado de 9am a 6pm. ¡Te esperamos!',
  'telefono': 'Puedes llamarnos al 787-368-2880 para atención inmediata.',
  'test drive': '¡Claro! Podemos agendar tu prueba de manejo hoy mismo. ¿Qué modelo te interesa?',
  'default': 'Lo siento, mi conexión con el cerebro central está un poco lenta. Pero estoy aquí para ayudarte. ¿Puedes intentar preguntar de otra forma o llamar al 787-368-2880?'
};

const getFallbackResponse = (query: string): string => {
  const lower = query.toLowerCase();
  for (const key in FALLBACK_RESPONSES) {
    if (lower.includes(key)) return FALLBACK_RESPONSES[key];
  }
  return FALLBACK_RESPONSES['default'];
};

/**
 * Expert sales consultant response generator for Richard Automotive.
 * Now supports Multi-Turn Conversation History.
 */
export const getAIResponse = async (userPrompt: string, inventory: Car[], history: { role: 'user' | 'bot', text: string }[] = []): Promise<string> => {
  const inventoryContext = inventory.map(c =>
    `- ${c.name}: $${c.price} (${c.type})${c.badge ? `, Promo: ${c.badge}` : ''}`
  ).join('\n');

  // Format history for the prompt
  const conversationHistory = history.map(msg =>
    `${msg.role === 'user' ? 'CLIENTE' : 'RICHARD_IA'}: ${msg.text}`
  ).join('\n');

  const systemInstruction = `
    Eres "Richard IA", el consultor experto de ventas de Richard Automotive en Puerto Rico.
    
    TUS OBJETIVOS:
    1. Ayudar a los clientes a encontrar el auto ideal.
    2. Mantener una conversación fluida y recordar el contexto anterior.
    3. Agendar una prueba de manejo (787-368-2880).

    INVENTARIO ACTUAL:
    ${inventoryContext}
    
    HISTORIAL DE CONVERSACIÓN:
    ${conversationHistory}
    
    REGLAS DE RESPUESTA:
    1. Responde SOLO al último mensaje del CLIENTE, usando el contexto del historial.
    2. Sé breve (máximo 2-3 oraciones).
    3. Si el cliente pregunta "¿Cuál es mejor?", compara opciones del inventario basándote en lo que ya hablaron.
    4. Tono: Amigable, Profesional, Boricua sutil.
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        temperature: 0.7,
      }
    });
    return response.text || "Lo siento, tuve un pequeño problema técnico. ¿Puedes repetirme eso?";
    return response.text || "Lo siento, tuve un pequeño problema técnico. ¿Puedes repetirme eso?";
  } catch (error) {
    console.warn("Gemini Error (Falling back to local):", error);
    // Silent Fallback
    return getFallbackResponse(userPrompt);
  }
};

/**
 * Analyzes the user's garage selection to provide financial and lifestyle advice.
 */
export const analyzeGarageSelection = async (cars: Car[]): Promise<string> => {
  const carList = cars.map(c => `${c.name} ($${c.price})`).join(', ');
  const prompt = `
        El usuario ha guardado estos autos en su "Garaje Digital": ${carList}.
        
        Actúa como un asesor financiero y experto automotriz. Analiza esta selección.
        1. ¿Qué dicen estos autos sobre el usuario? (Breve perfil).
        2. ¿Cuál es la "Mejor Compra Inteligente" de la lista basándote en depreciación estimada y valor?
        3. Da un consejo final de compra.
        
        Responde en formato HTML simple (usa <h3> para títulos, <p> para texto, <strong> para énfasis). Sé conciso y persuasivo.
    `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: prompt }] }]
    });
    return response.text || "<p>No pudimos analizar tu garaje en este momento.</p>";
  } catch (error) {
    console.error("Garage Analysis Error:", error);
    return "<p>Error de conexión con el asesor IA.</p>";
  }
};

/**
 * Calculates a compatibility score and generates a user persona.
 */
export const calculateNeuralMatch = async (userProfile: string, inventory: Car[]): Promise<{ persona: string, matches: { carId: string, score: number, reason: string }[] }> => {
  if (!inventory || inventory.length === 0) return { persona: "Analista de Datos", matches: [] };

  // Simplify context to save tokens but keep relevant info
  const inventoryContext = inventory.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    price: c.price,
    features: c.features?.join(', ') || c.badge || "Standard Config",
    description: c.description ? c.description.substring(0, 100) : undefined // Include snippet of description
  }));

  const prompt = `
    Rol: Eres un experto consultor de ventas de autos "Richard AI". Tu misión es conectar al usuario con su auto ideal.
    Perfil del Usuario: "${userProfile}"
    
    Inventario Disponible: 
    ${JSON.stringify(inventoryContext)}
    
    Tarea 1: Crea un "Persona" (Arquetipo de Conductor) corto y cool en Español (ej. "Padre Aventurero", "Ejecutivo Urbano").
    Tarea 2: Evalúa cada auto del 0-100 basándote en qué tan bien encaja con el perfil.
    Tarea 3: Genera una razón CONVINCENTE y PERSONALIZADA en Español (max 15 palabras) de por qué ese auto específica es el match.
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING, description: "The calculated driver archetype/persona in Spanish." },
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  carId: { type: Type.STRING, description: "The ID of the car from the inventory provided." },
                  score: { type: Type.INTEGER, description: "Compatibility score from 0 to 100." },
                  reason: { type: Type.STRING, description: "A brief explanation in Spanish." }
                },
                required: ["carId", "score", "reason"]
              }
            }
          },
          required: ["persona", "matches"]
        }
      }
    });

    const text = response.text;
    if (!text) return { persona: "Conductor", matches: [] };

    const data = JSON.parse(text);

    // Sort by score descending client-side
    if (data.matches && Array.isArray(data.matches)) {
      data.matches.sort((a: any, b: any) => b.score - a.score);
    }

    return data;

  } catch (error) {
    console.error("Neural Match Error:", error);
    return { persona: "Error de Análisis", matches: [] };
  }
};

/**
 * Compares two cars head-to-head.
 */
export const compareCars = async (car1: Car, car2: Car): Promise<{
  winnerId: string | null;
  verdict: string;
  categories: { name: string; winnerId: string | null; reason: string }[];
}> => {
  const prompt = `
        Compare these two cars:
        1. ${car1.name} ($${car1.price}, ${car1.type})
        2. ${car2.name} ($${car2.price}, ${car2.type})

        Act as an automotive expert. Compare them in 3 categories: "Valor por Dinero", "Uso Diario/Confort", and "Performance/Tecnología".
        
        Return a JSON object with:
        - "winnerId": The ID of the overall better car (or null if it's a tie/subjective).
        - "verdict": A short paragraph (max 30 words) in Spanish summarizing the final decision.
        - "categories": An array of objects, each with:
            - "name": Category name (use the 3 above).
            - "winnerId": The ID of the winner in this category (or null).
            - "reason": Very short reason (max 5 words) in Spanish.
        
        Use the IDs: "${car1.id}" and "${car2.id}".
    `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) throw new Error("No comparison data");
    return JSON.parse(text);
  } catch (error) {
    console.error("Compare Error:", error);
    throw error;
  }
};

/**
 * General purpose text generation for Chat (Basic Task).
 */
export const generateText = async (prompt: string, instruction?: string): Promise<string> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: instruction ? { systemInstruction: { parts: [{ text: instruction }] } } : undefined
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating text:", error);
    return "Ocurrió un error al procesar tu solicitud.";
  }
};

/**
 * Text generation for Coding/Complex tasks (Using Pro model).
 */
export const generateCode = async (prompt: string, instruction?: string): Promise<string> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-pro', // Pro model for coding tasks
      contents: [{ parts: [{ text: prompt }] }],
      config: instruction ? { systemInstruction: { parts: [{ text: instruction }] } } : undefined
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating code:", error);
    return "Ocurrió un error al procesar tu código.";
  }
};

/**
 * Visual Search Analysis
 * Analyzes an image of a car and returns search keywords/metadata.
 */
export const analyzeCarImage = async (base64Image: string): Promise<{ keywords: string[], type: string, description: string }> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash', // Flash supports image input (multimodal)
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analiza esta imagen de un vehículo. Identifica la marca, el modelo aproximado, y el tipo de carrocería (suv, sedan, pickup, luxury). Devuelve SOLO un JSON con este formato: { \"keywords\": [\"marca\", \"modelo\", \"color\"], \"type\": \"suv|sedan|pickup|luxury\", \"description\": \"breve descripción visual\" }." }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error analysing car image:", error);
    throw new Error("No pudimos identificar el vehículo.");
  }
};

/**
 * Generates a specific sales pitch for a car based on its data.
 */
export const generateCarPitch = async (car: Car): Promise<string> => {
  const prompt = `
    Genera una breve "Opinión del Experto" (máximo 100 palabras) para vender este auto: ${car.name}, Precio: $${car.price}, Tipo: ${car.type}, Badge: ${car.badge || 'N/A'}.
    Resalta por qué es una buena compra. Usa formato Markdown simple (negritas). Tono persuasivo y premium.
  `;
  return generateText(prompt);
};

/**
 * Image generation using the flash image model.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        // @ts-ignore - Experimental Feature
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No se pudo generar la imagen.");

  } catch (error) {
    console.error("Error calling Gemini API for image generation:", error);
    throw error;
  }
};

/**
 * Generates a blog post using AI.
 */
export const generateBlogPost = async (topic: string): Promise<BlogPost> => {
  // 1. Generate Content
  const contentPrompt = `
      Escribe un artículo de blog corto y atractivo (aprox 200-300 palabras) sobre: "${topic}".
      
      Formato de salida (JSON):
      {
        "title": "Un título pegadizo",
        "excerpt": "Un resumen corto de 1 o 2 oraciones.",
        "content": "El contenido completo en formato Markdown (usa negritas, subtítulos).",
        "tags": ["tag1", "tag2"]
      }

      Rol: Eres un periodista automotriz experto y entusiasta de "Richard Automotive News".
      Audiencia: Conductores de Puerto Rico.
    `;

  try {
    const textResponse = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: contentPrompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(textResponse.text || "{}");

    // 2. Generate Image for the blog
    const imagePrompt = `Fotografía automotriz profesional, cinemática, alta calidad, relacionada con: ${data.title || topic}, sin texto, estilo realista.`;
    let imageUrl = '';
    try {
      imageUrl = await generateImage(imagePrompt);
    } catch (e) {
      console.warn("Failed to generate blog image", e);
      // Fallback image
      imageUrl = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000';
    }

    return {
      id: Date.now().toString(),
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      author: "Richard AI Editor",
      date: new Date().toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' }),
      imageUrl: imageUrl,
      tags: data.tags || ['Automotriz']
    };

  } catch (error) {
    console.error("Blog Gen Error:", error);
    throw new Error("No se pudo redactar el artículo.");
  }
};

/**
 * Generates a video using the Veo model.
 */
export const generateVideo = async (
  prompt: string,
  image: string,
  mimeType: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
  const videoAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  try {
    // @ts-ignore - Veo is experimental
    let operation = await videoAI.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        // @ts-ignore
        aspectRatio: aspectRatio,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      // @ts-ignore
      operation = await videoAI.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("La operación finalizó pero no se encontró la URI del video.");
    }

    return videoUri;

  } catch (error) {
    console.error("Error generating video with Veo:", error);
    if (error instanceof Error) {
      throw new Error(`Error de Veo: ${error.message}`);
    }
    throw new Error("Ocurrió un error desconocido al generar el video.");
  }
};

/**
 * Connects to a Gemini Live voice session.
 */
export const connectToVoiceSession = (callbacks: {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror: (event: Event) => void;
  onclose: (event: CloseEvent) => void;
}): Promise<any> => {
  return getAI().live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: { parts: [{ text: 'Eres "Richard IA", un amigable y útil consultor de ventas de Richard Automotive. Mantén tus respuestas conversacionales y concisas.' }] },
    },
  }) as any;
};

/**
 * Analyzes multiple trade-in images to determine condition.
 */
export const analyzeTradeInImages = async (images: string[]): Promise<{
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  defects: string[];
  estimatedValueAdjustment: number;
  reasoning: string;
}> => {
  try {
    const imageParts = images.map(base64 => ({
      inlineData: { mimeType: 'image/jpeg', data: base64 }
    }));

    const prompt = `
            Actúa como un tasador de autos profesional. Analiza estas imágenes del vehículo de un cliente.
            
            Tu tarea es identificar:
            1. Condición exterior (rayazos, abolladuras, pintura descolorida).
            2. Limpieza interior (si hay fotos del interior).
            3. Signos generales de desgaste.

            Devuelve UNICAMENTE un objeto JSON estrictamente con este schema:
            {
                "condition": "Excellent" | "Good" | "Fair" | "Poor",
                "defects": ["lista", "de", "defectos", "en", "español"],
                "estimatedValueAdjustment": number (0.8 para malo, 1.0 normal, 1.2 excelente),
                "reasoning": "Breve explicación en español de la condición."
            }
        `;

    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-pro', // Using Pro for better visual reasoning
      contents: [
        {
          parts: [
            ...imageParts,
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI Appraiser");

    return JSON.parse(text);

  } catch (error) {
    console.error("Trade-In Analysis Error:", error);
    // Fallback for demo stability
    return {
      condition: 'Good',
      defects: ['No se pudo completar el análisis visual detallado.'],
      estimatedValueAdjustment: 1.0,
      reasoning: 'Análisis estándar aplicado debido a error de conexión.'
    };
  }
};
