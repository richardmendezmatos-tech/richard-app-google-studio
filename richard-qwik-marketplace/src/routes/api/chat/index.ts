import { routeAction$ } from '@builder.io/qwik-city';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../../../env';

export const useChatAction = routeAction$(async (data, requestEvent) => {
    const query = data.query as string;

    if (!query || query.length < 3) {
        return {
            success: false,
            response: "Por favor, escribe una consulta más larga.",
            recommended_cars: []
        };
    }

    try {
        // 1. Initialize Clients
        const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || '');
        const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const chatModel = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 2. Generate Embedding for User Query
        console.log(`🧠 Generating embedding for: "${query}"`);
        const embeddingResult = await model.embedContent(query);
        const embedding = embeddingResult.embedding.values;

        // 3. Search Similar Cars (RAG via Supabase RPC)
        // Note: 'search_cars' was created in schema.sql
        console.log(`🔍 Searching in Supabase Vector Store...`);
        const { data: similarCars, error: searchError } = await supabase.rpc('search_cars', {
            query_embedding: embedding,
            match_threshold: 0.7, // Only relevant matches
            match_count: 3
        });

        if (searchError) {
            console.error("Supabase RPC Error:", searchError);
            throw new Error("Failed to search cars.");
        }

        // 4. Construct Context for LLM
        const context = similarCars?.map((c: any) => c.content).join("\n---\n") || "No relevant cars found.";

        // 5. Generate Answer with Context
        const prompt = `
      You are an expert automotive sales assistant for "Richard Automotive".
      Use the following car inventory context to answer the user request.
      
      User Query: "${query}"
      
      Inventory Context:
      ${context}
      
      Rules:
      - Only recommend cars from the Context.
      - If no cars match, say "Sorry, I don't see any cars matching that description currently."
      - Be enthusiastic and professional.
      - Answer in Spanish (Español).
      - Include the price and Year.
    `;

        const chatCompletion = await chatModel.generateContent(prompt);
        const textResponse = chatCompletion.response.text();

        return {
            success: true,
            response: textResponse,
            recommended_cars: similarCars?.map((c: any) => c.car_id) || []
        };

    } catch (error: any) {
        console.error("AI Action Error:", error);
        return {
            success: false,
            response: "Lo siento, hubo un error procesando tu solicitud. Intenta de nuevo.",
            recommended_cars: []
        };
    }
});
