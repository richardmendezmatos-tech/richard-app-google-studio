
import { Car } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGenAI = () => new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface MarketingContent {
    instagram: string;
    facebook: string;
    tiktokScript: string;
}

export const generateCarMarketingContent = async (car: Car): Promise<MarketingContent> => {
    const prompt = `
        Genera contenido de marketing para este vehículo:
        Nombre: ${car.name}
        Precio: $${car.price}
        Tipo: ${car.type}
        Badge: ${car.badge || 'N/A'}
        
        REQUERIMIENTOS:
        1. Instagram: Un caption con emojis, hashtags y enfoque visual.
        2. Facebook: Un post más detallado enfocado en familia/valor.
        3. TikTok Script: Un guión de 15-30 segundos para un video rápido.
        
        RETORNA JSON ÚNICAMENTE:
        {
            "instagram": "string",
            "facebook": "string",
            "tiktokScript": "string"
        }
    `;

    try {
        const model = getGenAI().getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Marketing Gen Error:", error);
        return {
            instagram: "¡Gran oportunidad! Ven a ver este " + car.name,
            facebook: "Tenemos disponible el " + car.name + ". ¡Pregunta por financiamiento!",
            tiktokScript: "¡Mira este auto que acaba de llegar! 🔥 #RichardAutomotive"
        };
    }
};
