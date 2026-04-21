import { NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/shared/api/ai/geminiService';



/**
 * POST /api/command-center/outreach/generate
 * 
 * Genera un mensaje de cierre de venta optimizado para Richard Automotive.
 */
export async function POST(req: Request) {
  try {
    const { leadName, vehicleOfInterest, creditProfile, currentOffer } = await req.json();

    const systemInstruction = `
      Eres Jules, el AI Sales Specialist de Richard Automotive. 
      Tu objetivo es redactar un mensaje de cierre de venta (WhatsApp) para Richard Mendez (Gerente de F&I).
      
      TONO:
      - Profesional pero agresivo en el cierre.
      - Enfocado en la oportunidad y el beneficio financiero.
      - Estética Richard Automotive: "Premium", "Sin vueltas", "Listo para firmar".

      REGLAS:
      1. Usa el nombre del cliente: ${leadName}.
      2. Menciona el vehículo: ${vehicleOfInterest}.
      3. Adapta el mensaje al perfil crediticio: ${creditProfile}.
      4. Incluye un CTA (Call to Action) claro.
      5. No uses hashtags.
    `;

    const prompt = `
      Redacta un mensaje de WhatsApp para cerrar la venta.
      Datos:
      - Cliente: ${leadName}
      - Unidad: ${vehicleOfInterest}
      - Crédito: ${creditProfile}
      - Oferta actual: ${currentOffer || 'Pre-aprobación FlexDrive'}

      Devuelve solo el mensaje en este formato JSON:
      {
        "message": "string"
      }
    `;

    const result = await generateStructuredJSON(prompt, systemInstruction, 'gemini-2.0-flash');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Outreach API] Failure:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
