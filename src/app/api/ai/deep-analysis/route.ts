import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const DeepAnalysisSchema = z.object({
  technicalProfile: z.string(),
  keyFeatures: z.array(z.object({
    label: z.string(),
    value: z.string(),
    icon: z.string().optional(),
  })).max(6),
  marketPosition: z.string(),
  psychologicalHook: z.string(),
  advantageScore: z.number().min(0).max(100),
});

export async function POST(req: Request) {
  let car: Record<string, any> | undefined;
  try {
    car = (await req.json()).car;
    if (!car) return NextResponse.json({ error: 'Missing car data' }, { status: 400 });

    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: DeepAnalysisSchema,
      output: 'object',
      system: `Eres el Director de Inteligencia de Ventas en Richard Automotive, un concesionario boutique de alta gama en Puerto Rico.
Tu tono es de absoluto prestigio, lujo e innovación tecnológica.
Debes expresarte con total fluidez y sofisticación, utilizando de manera natural los términos locales del mercado automotriz en Puerto Rico.
Destaca por qué esta unidad es un negocio inigualable en la isla. Evita sonar genérico o barato.`,
      prompt: `Analiza detalladamente esta unidad de nuestro inventario:
- Nombre: ${car.year} ${car.name} (${car.make} ${car.model})
- Precio: $${car.price?.toLocaleString()}
- Millaje: ${car.mileage?.toLocaleString() || 'Bajo millaje'} millas
- Specs: ${JSON.stringify(car.specs || [])}
- Features: ${JSON.stringify(car.features || [])}

Genera un informe estratégico de alto valor de conversión.`,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error('[DeepAnalysis] Error:', error);
    return NextResponse.json({
      technicalProfile: car?.description || 'Unidad de prestigio seleccionada rigurosamente por Richard Automotive.',
      keyFeatures: [{ label: 'Condición', value: 'Excelente estado de conservación', icon: 'ShieldCheck' }],
      marketPosition: 'Posicionamiento privilegiado con excelente retención de valor en Puerto Rico.',
      psychologicalHook: 'La sofisticación que mereces con la confianza del respaldo de Richard.',
      advantageScore: 88,
    });
  }
}
