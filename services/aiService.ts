import { GoogleGenerativeAI } from '@google/generative-ai';
import { Car } from '../types';

// Initialize the API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export interface VisualSearchResult {
    type: 'suv' | 'sedan' | 'pickup' | 'luxury' | null;
    brand: string | null;
    color: string | null;
    confidence: number;
    key_features: string[];
}

/**
 * Converts a File object to a Base64 string for the API
 */
const fileToGenerativePart = async (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Content,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Analyzes a car image to extract metadata for search
 */
export const analyzeCarImage = async (file: File): Promise<VisualSearchResult> => {
    if (!API_KEY) throw new Error("API Key not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this image of a vehicle for a car dealership search engine.
    Return a JSON object with the following fields:
    - type: one of ['suv', 'sedan', 'pickup', 'luxury'] (choose the best fit)
    - brand: the likely brand (e.g. Toyota, Ford, BMW)
    - color: the main color
    - confidence: a number between 0 and 1 indicating how sure you are
    - key_features: an array of 3 distinct visual features (e.g. "sunroof", "alloy wheels", "sport package")

    Output strictly valid JSON.
    `;

    try {
        const imagePart = await fileToGenerativePart(file);
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse AI response");
        }

        const data = JSON.parse(jsonMatch[0]);
        return {
            type: data.type?.toLowerCase() || null,
            brand: data.brand || null,
            color: data.color || null,
            confidence: data.confidence || 0,
            key_features: data.key_features || []
        };
    } catch (error) {
        console.error("Visual Analysis Error:", error);
        throw error;
    }
};

/**
 * Filters inventory based on AI analysis
 */
export const findMatches = (analysis: VisualSearchResult, inventory: Car[]): Car[] => {
    return inventory.filter(car => {
        let score = 0;

        // Type Match (High Weight)
        if (analysis.type && car.type.toLowerCase() === analysis.type) {
            score += 10;
        }

        // Brand Match (High Weight)
        if (analysis.brand && (car.name.toLowerCase().includes(analysis.brand.toLowerCase()) || car.badge?.toLowerCase().includes(analysis.brand.toLowerCase()))) {
            score += 10;
        }

        // Color Match (Medium Weight) - Heuristic check in description or name
        if (analysis.color) {
            const color = analysis.color.toLowerCase();
            const text = (car.description + car.name).toLowerCase();
            if (text.includes(color)) {
                score += 5;
            }
        }

        return score >= 10; // Return cars that have at least a type or brand match
    });
};
