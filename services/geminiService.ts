
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { Car, BlogPost } from "../types";

// Helper to get a fresh client instance (important for API key updates)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Expert sales consultant response generator for Richard Automotive.
 */
export const getAIResponse = async (userPrompt: string, inventory: Car[]): Promise<string> => {
  const inventoryContext = inventory.map(c => 
    `- ${c.name}: $${c.price} (${c.type})${c.badge ? `, Promo: ${c.badge}` : ''}`
  ).join('\n');

  const systemInstruction = `
    Eres "Richard IA", el consultor experto de ventas de Richard Automotive en Puerto Rico.
    Tu objetivo es ayudar a los clientes a encontrar el auto ideal de nuestro inventario.
    
    INVENTARIO ACTUAL:
    ${inventoryContext}
    
    REGLAS:
    1. Sé amable, profesional y entusiasta.
    2. Si preguntan por un tipo de auto (ej. SUV), recomienda los que tenemos en el inventario.
    3. Si preguntan por financiamiento, menciona que ofrecemos planes flexibles y aprobación rápida.
    4. Usa un tono cercano (español de Puerto Rico sutilmente, ej. "unidades", "brutal").
    5. Si no tenemos algo, ofrece la alternativa más cercana.
    6. Siempre invita a llamar al 787-368-2880 para una prueba de manejo.
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "Lo siento, tuve un pequeño problema técnico. ¿Puedes repetirme eso?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Estoy teniendo problemas para conectar. ¡Llámanos directamente al 787-368-2880!";
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
            model: 'gemini-3-flash-preview',
            contents: prompt
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
    features: c.badge 
  }));
  
  const prompt = `
    Role: You are an expert car sales consultant matching customers to inventory.
    User Profile: "${userProfile}"
    
    Inventory: 
    ${JSON.stringify(inventoryContext)}
    
    Task 1: Create a cool, short "Driver Persona" or Archetype for this user in Spanish (e.g. "Padre Aventurero", "Ejecutivo Urbano").
    Task 2: Score each car from 0-100 based on how well it fits the user profile.
    Generate a concise reason in Spanish (max 15 words).
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
            model: 'gemini-3-flash-preview',
            contents: prompt,
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: instruction ? { systemInstruction: instruction } : undefined
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
      model: 'gemini-3-pro-preview', // Pro model for coding tasks
      contents: prompt,
      config: instruction ? { systemInstruction: instruction } : undefined
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
      model: 'gemini-3-flash-preview', // Flash supports image input (multimodal)
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
            model: 'gemini-3-flash-preview',
            contents: contentPrompt,
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
  const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await videoAI.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
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
            systemInstruction: 'Eres "Richard IA", un amigable y útil consultor de ventas de Richard Automotive. Mantén tus respuestas conversacionales y concisas.',
            outputAudioTranscription: {},
            inputAudioTranscription: {},
        },
    });
};
