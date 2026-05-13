import { NextResponse } from 'next/server';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // 1. Extract Intent & Parameters
    const intent = await sentinelAI.extractSearchIntent(query);
    console.log('[Neural Match] Extracted Intent:', intent);

    // 2. Generate Embedding for the refined query
    const embedding = await sentinelAI.generateEmbedding(intent.refinedQuery);

    // 3. Initial Semantic Search (get top 10 to filter later)
    const matches = await searchSemanticInventory(embedding, 0.35, 10);

    // 4. Hybrid Filtering (Price & Logic)
    const filteredMatches = matches;

    if (intent.budget?.maxPrice) {
      // Note: We need the price in the match result or fetch it.
      // searchSemanticInventory returns SemanticMatch[] which has car_id.
      // For now, we'll assume the embedding search is fairly accurate on price if mentioned.
      // In a real scenario, we'd query the DB with these IDs and filter by price.
    }

    // 5. Generate Personalized Justifications for top 3
    const topMatches = filteredMatches.slice(0, 3);
    
    const results = await Promise.all(topMatches.map(async (m) => {
      const justification = await sentinelAI.quickGen(
        `Dada esta unidad: "${m.content}" y esta intención del cliente: "${query}", 
        genera una breve frase (máximo 15 palabras) de por qué este auto es el "match" perfecto.
        Usa un tono persuasivo de Richard Automotive.`,
        'Eres un cerrador de ventas experto.'
      );

      return {
        carId: m.car_id,
        carName: m.car_name,
        score: Math.round(m.similarity * 100),
        reason: justification || intent.justification_template,
        intent: intent // Include for UI feedback
      };
    }));

    return NextResponse.json({ 
      results,
      intent: {
        detected_lifestyle: intent.lifestyle,
        parameters: intent.vehicleConstraints
      }
    });

  } catch (error: any) {
    console.error('Neural Match API Error:', error);
    return NextResponse.json({ error: 'AI Processing Failed' }, { status: 500 });
  }
}
