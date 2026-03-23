import { Car } from '@/entities/shared';
import { CommandIntent } from '@/shared/api/voice/VoiceCommandService';

export interface VisualSearchResult {
  type: string | null;
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
      const base64Data = reader.result;
      if (typeof base64Data !== 'string') {
        reject(new Error('Failed to read file as data URL'));
        return;
      }
      const parts = base64Data.split(',');
      if (parts.length < 2) {
        reject(new Error('Malformed file data URL'));
        return;
      }
      const base64Content = parts[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes a car image to extract metadata for search
 */
export const analyzeCarVisuals = async (file: File): Promise<VisualSearchResult> => {
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

    // Secure Proxy Call instead of direct SDK usage
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [prompt, imagePart],
        model: 'gemini-1.5-flash',
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `Proxy error: ${response.status}`);
    }

    const { text } = await response.json();

    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      type: data.type?.toLowerCase() || null,
      brand: data.brand || null,
      color: data.color || null,
      confidence: data.confidence || 0,
      key_features: data.key_features || [],
    };
  } catch (error) {
    console.error('Visual Analysis Error:', error);
    throw error;
  }
};

/**
 * Filters inventory based on AI analysis
 */
export const findMatches = (analysis: VisualSearchResult, inventory: Car[]): Car[] => {
  return inventory.filter((car) => {
    let score = 0;

    // Type Match (High Weight)
    if (analysis.type && car.type.toLowerCase() === analysis.type) {
      score += 10;
    }

    // Brand Match (High Weight)
    if (
      analysis.brand &&
      (car.name.toLowerCase().includes(analysis.brand.toLowerCase()) ||
        car.badge?.toLowerCase().includes(analysis.brand.toLowerCase()))
    ) {
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

/**
 * Uses Gemini to parse natural language into a structured UI intent.
 * Used for complex voice commands that basic regex cannot handle.
 */
export const parseVoiceIntent = async (text: string): Promise<CommandIntent | null> => {
  const prompt = `
    You are the "Command Center" Intelligence for Richard Automotive. 
    Your goal is to extract technical and navigational intents from voice commands with precision and a professional yet warm tone.

    User Command: "${text}"

    VALID ACTIONS:
    - NAVIGATE: {path: string, tab?: string} 
      - Routes: /admin (Strategic tabs: pipeline, inventory, analytics, dashboard), /admin/houston (Sentinel / Mission Control), /storefront, /appraisal.
    - SEARCH: {query: string} (Used for looking up a specific 'unidad' or 'guagua')
    - UPDATE_FILTER: {filter: 'offers' | 'aged' | 'luxury'}

    DIRECTIONS:
    1. If the user wants to see "ventas", "crm", or "pipeline", use NAVIGATE to /admin with tab "pipeline".
    2. If the user mentions "Houston", "Sentinel", "Telemetría", "Control" or "Mission Control", use NAVIGATE to /admin/houston.
    3. If the user asks for "unidades", "guaguas", "inventario" or "autos", use NAVIGATE to /admin with tab "inventory".
    4. If the user wants to search for a specific unit (e.g. "busca una guagua rav4 roja" or "trépate en esa unidad"), use SEARCH.
    5. Use terminology like "pronto", "unidad", and "guagua" when interpreting intent.
    6. Be decisive. If confidence is low, return null.

    Output strictly valid JSON:
    {"action": {"type": "NAVIGATE" | "SEARCH" | "UPDATE_FILTER", "payload": {...}}, "confidence": 0.0-1.0, "originalText": "${text}"}
  `;

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [prompt],
        model: 'gemini-1.5-flash',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse intent via Gemini');
    }

    const { text: responseText } = await response.json();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    return JSON.parse(jsonMatch[0]) as CommandIntent;
  } catch (error) {
    console.error('Intent Parsing Error:', error);
    return null;
  }
};
