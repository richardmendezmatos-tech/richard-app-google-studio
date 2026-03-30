import { Car } from '@/entities/inventory';
import { Lead } from '@/entities/lead';
import { generateStructuredJSON } from '@/shared/api/ai/geminiService';

export interface DealSheetData {
  executiveSummary: string;
  psychologicalProfile: {
    buyerType: string;
    keyMotivators: string[];
    dealBreakers: string[];
  };
  recommendedPitch: string;
  financialStrategy: {
    suggestedDownPayment: number;
    targetMonthly: number;
    talkingPoints: string[];
  };
  vehicleAlternatives: {
    carId: string;
    name: string;
    reason: string;
  }[];
}

export const generateSmartDealSheet = async (
  lead: Lead,
  inventory: Car[],
): Promise<DealSheetData> => {
  const systemInstruction = `
    Eres un Senior F&I Manager estratégico. 
    Tu objetivo es analizar los datos del Lead (cliente) y el inventario disponible para generar una hoja de tácticas (Deal Sheet) para el vendedor.
    Usa técnicas de neuroventas, persuasión y análisis financiero para maximizar la probabilidad de cierre.
  `;

  // Simplificamos el inventario para no exceder los tokens
  const simplifiedInventory = inventory.map((c) => ({
    id: c.id,
    name: c.name,
    price: c.price,
    type: c.type,
  }));

  const prompt = `
    Analiza este prospecto:
    Nombre: ${lead.firstName} ${lead.lastName}
    Vehículo de Interés: ${lead.vehicleOfInterest || 'No especificado'}
    Mensaje/Notas: ${lead.message || 'Sin notas'}
    Historial/IA Analysis previo: ${JSON.stringify(lead.aiAnalysis || {})}
    
    Inventario disponible: ${JSON.stringify(simplifiedInventory)}
    
    Genera un DEAL SHEET en el siguiente formato JSON estricto:
    {
      "executiveSummary": "Resumen rápido del caso en 2 líneas.",
      "psychologicalProfile": {
        "buyerType": "Ej. Buscador de Status, Pragmático, Familiar",
        "keyMotivators": ["Motivador 1", "Motivador 2"],
        "dealBreakers": ["Objeción 1", "Objeción 2"]
      },
      "recommendedPitch": "El pitch de ventas exacto (qué decirle al cliente en 1 párrafo persuasivo).",
      "financialStrategy": {
        "suggestedDownPayment": 2000,
        "targetMonthly": 350,
        "talkingPoints": ["Punto financiero 1", "Punto financiero 2"]
      },
      "vehicleAlternatives": [
        { "carId": "...", "name": "...", "reason": "..." }
      ]
    }
  `;

  try {
    const data = await generateStructuredJSON(prompt, systemInstruction, 'gemini-2.5-flash');
    return data as DealSheetData;
  } catch (error) {
    console.error('Error generando Smart Deal Sheet:', error);
    // Fallback data
    return {
      executiveSummary: 'Error al generar Deal Sheet Dinámico. Proceda con precaución.',
      psychologicalProfile: {
        buyerType: 'Desconocido',
        keyMotivators: ['Valor por dinero'],
        dealBreakers: ['Precio muy alto'],
      },
      recommendedPitch: 'Ofrezca un trato transparente basado en las necesidades del cliente.',
      financialStrategy: {
        suggestedDownPayment: 0,
        targetMonthly: 0,
        talkingPoints: ['Pregunte por el presupuesto mensual primero'],
      },
      vehicleAlternatives: [],
    };
  }
};
