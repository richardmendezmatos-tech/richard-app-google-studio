// import { GoogleGenAI, Modality } from "@google/genai"; // Causes Crash on Vite
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Car, BlogPost } from "../types";
import { searchSemanticInventory, logSearchGap } from "./supabaseClient";

// Stable SDK Client (Text/Vision) - Gemini 2.0 Flash
// Use VITE_GEMINI_API_KEY for standard requests
const getGenAI = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!key) console.error("CRITICAL: VITE_GEMINI_API_KEY is missing in environment.");
  return new GoogleGenerativeAI(key);
};

// Experimental SDK Client (Realtime/Video) - DISABLED TO PREVENT CRASH
// const getExpAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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
  const lower = (query || '').toLowerCase();
  for (const key in FALLBACK_RESPONSES) {
    if (lower.includes(key)) return FALLBACK_RESPONSES[key];
  }
  return FALLBACK_RESPONSES['default'];
};

/**
 * Expert sales consultant response generator for Richard Automotive.
 * Uses Advanced RAG context injection.
 */
export const getAIResponse = async (userPrompt: string, inventory: Car[], history: { role: 'user' | 'bot', text: string }[] = []): Promise<string> => {
  // Advanced RAG: Group inventory by Category for better context
  const categories = inventory.reduce((acc, car) => {
    const type = car.type || 'Otros';
    if (!acc[type]) acc[type] = [];
    acc[type].push(`- ${car.name}: $${(car.price || 0).toLocaleString()} ${car.badge ? `[${car.badge}]` : ''}`);
    return acc;
  }, {} as Record<string, string[]>);

  // 1. Semantic Search (Advanced RAG) & Intent Detection
  let semanticContext = "";
  let intent: 'buying' | 'financing' | 'browsing' | 'general_inquiry' = 'general_inquiry';

  // Basic Intent Detection
  const lowerPrompt = userPrompt.toLowerCase();
  if (lowerPrompt.includes('comprar') || lowerPrompt.includes('precio') || lowerPrompt.includes('cuanto cuesta')) intent = 'buying';
  if (lowerPrompt.includes('financiar') || lowerPrompt.includes('credito') || lowerPrompt.includes('banco') || lowerPrompt.includes('pagos')) intent = 'financing';
  if (lowerPrompt.includes('ver') || lowerPrompt.includes('mostrar') || lowerPrompt.includes('fotos') || lowerPrompt.includes('inventario')) intent = 'browsing';

  try {
    const genAI = getGenAI();
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(userPrompt);
    const matches = await searchSemanticInventory(embeddingResult.embedding.values);

    if (matches.length > 0) {
      semanticContext = "\n💡 COINCIDENCIAS RELEVANTES ENCONTRADAS:\n" +
        matches.map(m => `- ${m.car_name}: ${m.content}`).join("\n");
    } else if (userPrompt.length > 5) {
      // 4. Market Gap Analytics: Log missed opportunities
      await logSearchGap(userPrompt, intent);
    }
  } catch (e) {
    console.warn("Semantic Search failed, falling back to basic inventory:", e);
  }

  const inventoryContext = Object.entries(categories).map(([type, cars]) =>
    `📂 ${type.toUpperCase()}:\n${cars.join('\n')}`
  ).join('\n\n') + semanticContext;

  const conversationHistory = history.map(msg =>
    `${msg.role === 'user' ? 'CLIENTE' : 'RICHARD_IA'}: ${msg.text}`
  ).join('\n');

  // 1. AI Proactive Salesman: System Instruction with Intent & CTA
  const systemInstruction = `
    Eres "Richard IA", el consultor experto de ventas de Richard Automotive en Puerto Rico.
    Tu objetivo es agendar una prueba de manejo o venta.
    
    INVENTARIO ORGANIZADO:
    ${inventoryContext || "No hay inventario disponible."}
    
    HISTORIAL:
    ${conversationHistory}
    
    INSTRUCCIONES DE MARKETING PROACTIVO:
    1. Sé empático y profesional. Usa emojis con moderación.
    2. Responde SIEMPRE en español.
    3. DETECCIÓN DE INTENCIÓN: Si el cliente parece interesado en un auto específico o tipo (ahorro, lujo, familia), actúa como un cerrador.
    4. CTA DINÁMICO: Si detectas una intención clara de compra o interés serio, termina con un link de WhatsApp. REEMPLAZA EXACTAMENTE el nombre del auto en el link: https://wa.me/17873682880?text=Hola,%20estoy%20interesado%20en%20[CAMBIA_POR_MODELO_DEL_AUTO]
    5. Si no tenemos lo que busca, sé honesto pero ofrece la opción más cercana del inventario RAG.
  `;

  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn("Gemini Error:", error);
    return getFallbackResponse(userPrompt);
  }
};

/**
 * Analyzes garage with Chain of Thought reasoning.
 */
export const analyzeGarageSelection = async (cars: Car[]): Promise<string> => {
  const carList = cars.map(c => `${c.name} ($${c.price})`).join(', ');
  const prompt = `
    Analiza este garaje: ${carList}.
    
    TASK:
    1. Identify the user's spending power and lifestyle based on cars.
    2. Suggest 1 actionable improvement or trade-in.
    
    OUTPUT FORMAT:
    HTML simple (sin markdown block), use <p>, <strong>, <ul>.
  `;

  try {
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "<p>Error de conexión con el asesor IA.</p>";
  }
};

/**
 * Calculates Neural Match using Rigid JSON Schema + Reasoning.
 */
export const calculateNeuralMatch = async (userProfile: string, inventory: Car[]): Promise<{ persona: string, matches: { carId: string, score: number, reason: string }[] }> => {
  if (!inventory || inventory.length === 0) return { persona: "Analista de Datos", matches: [] };

  const simplifiedInventory = inventory.map(c => ({ id: c.id, name: c.name, price: c.price, type: c.type }));

  const prompt = `
    User Profile: "${userProfile}". 
    Inventory: ${JSON.stringify(simplifiedInventory)}.
    
    TASK:
    1. Analyze user needs (Reasoning).
    2. Match top 3 cars.
    3. Assign 0-100 score.
    
    RETURN JSON ONLY:
    {
      "reasoning": "string analyzing the user",
      "persona": "Creative Persona Name (e.g. 'Fanático de la Velocidad')",
      "matches": [
         { "carId": "id", "score": 95, "reason": "Why this matches" }
      ]
    }
  `;

  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    return { persona: "Error de Análisis", matches: [] };
  }
};

export const compareCars = async (car1: Car, car2: Car): Promise<any> => {
  const prompt = `
    Compare ${car1.name} vs ${car2.name}.
    
    RETURN JSON ONLY:
    {
        "winnerId": "string (id of winner)",
        "reasoning": "Chain of thought explanation",
        "verdict": "Short final verdict",
        "categories": [
            { "name": "Potencia", "winner": "${car1.name} or ${car2.name}", "detail": "explanation" },
            { "name": "Economía", "winner": "...", "detail": "..." },
            { "name": "Confort", "winner": "...", "detail": "..." },
            { "name": "Tecnología", "winner": "...", "detail": "..." }
        ]
    }
  `;
  const model = getGenAI().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const generateText = async (prompt: string, instruction?: string): Promise<string> => {
  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: instruction
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating text:", error);
    if (error instanceof Error) return `Error: ${error.message}`;
    return "Ocurrió un error al procesar tu solicitud.";
  }
};

export const generateCode = async (prompt: string, instruction?: string): Promise<string> => {
  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: instruction
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Ocurrió un error al procesar tu código.";
  }
};

export const analyzeCarImage = async (base64Image: string): Promise<{ keywords: string[], type: string, description: string, search_query: string }> => {
  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Remove data:image/jpeg;base64, prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: "image/jpeg",
      },
    };

    const prompt = `
        Analiza esta imagen de un vehículo.
        RETURN JSON ONLY:
        {
            "type": "SUV | Sedan | Truck | Coupe",
            "keywords": ["tag1", "tag2", "tag3"],
            "description": "Professional automated description.",
            "search_query": "Marca y modelo probable o descripción física para búsqueda en inventario"
        }
    `;
    const result = await model.generateContent([prompt, imagePart]);
    return JSON.parse(result.response.text());
  } catch (error) {
    throw new Error("No pudimos identificar el vehículo.");
  }
};

export const generateCarPitch = async (car: Car): Promise<string> => {
  const prompt = `
    Role: Senior Sales Executive.
    Product: ${car.name}, Price: $${car.price}, Type: ${car.type}.
    Task: Write a short, punchy, persuasive 1-paragraph pitch (HTML <p>) to sell this specific car.
    Focus on value and emotion. Spanish.
    
    RETURN JSON ONLY:
    {
       "reasoning": "Internal thought process",
       "pitch": "Final sales pitch text"
    }
  `;
  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());
    return data.pitch || `¡Este ${car.name} es una oportunidad única!`;
  } catch (e) {
    return `¡Este ${car.name} es increíble! Ven a verlo hoy mismo.`;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000";
};

export const generateBlogPost = async (topic: string): Promise<BlogPost> => {
  const model = getGenAI().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const prompt = `Write blog post about ${topic}. JSON: { title, excerpt, content, tags }.`;

  try {
    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());
    return {
      id: Date.now().toString(),
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      author: "Richard AI",
      date: new Date().toLocaleDateString(),
      imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
      tags: data.tags
    };
  } catch (e) {
    throw new Error("Blog Gen Error");
  }
};

export const generateVideo = async (prompt: string, image: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  throw new Error("Video generation unavailable.");
};

export const connectToVoiceSession = (callbacks: any): Promise<any> => {
  // throw new Error("Voice session disabled in stable mode.");
  return Promise.resolve(null);
};

export const analyzeTradeInImages = async (images: string[]): Promise<any> => {
  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const imageParts = images.map(b64 => ({
      inlineData: { data: b64.replace(/^data:image\/\w+;base64,/, ""), mimeType: "image/jpeg" }
    }));

    const prompt = `
            Analyze these vehicle images for trade-in valuation.
            RETURN JSON ONLY:
            {
                "condition": "Excellent | Good | Fair | Poor",
                "defects": ["scratch on bumper", "dent on door"],
                "estimatedValueAdjustment": 0.95 (multiplier),
                "reasoning": "Chain of thought analysis of visible condition"
            }
        `;
    const result = await model.generateContent([prompt, ...imageParts]);
    return JSON.parse(result.response.text());
  } catch (e) {
    return { condition: 'Good', defects: [], estimatedValueAdjustment: 1.0, reasoning: 'Error' };
  }
};

/**
 * Unified helper for semantic search from text.
 */
export const searchSemanticInventoryByText = async (query: string): Promise<any[]> => {
  try {
    const embeddingModel = getGenAI().getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(query);
    return await searchSemanticInventory(embeddingResult.embedding.values);
  } catch (e) {
    console.error("Unified semantic search failed:", e);
    return [];
  }
};
