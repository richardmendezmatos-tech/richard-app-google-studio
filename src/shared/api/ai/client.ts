import type { Car, BlogPost } from '@/shared/types/types';
import type { VisualSearchResult } from './aiService';
import type { CommandIntent } from '@/shared/types/types';

export { analyzeCarVisuals, findMatches, generateNeuralMatch } from './aiService';
export type { VisualSearchResult } from './aiService';

async function callGemini(contents: any[], system?: string, model = 'gemini-2.0-flash') {
  const res = await fetch('/api/ai/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, system, model }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'AI request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const { data } = await res.json();
  return data as string;
}

export async function compareCars(car1: Car, car2: Car): Promise<Record<string, unknown>> {
  const text = await callGemini(
    [JSON.stringify({ car1, car2 })],
    'Compara estos dos vehículos en precio, rendimiento, equipamiento, seguridad y valor. Devuelve JSON con winnerId, reasoning, categories.',
  );
  return JSON.parse(text);
}

export async function generateCarPitch(car: Car): Promise<string> {
  return callGemini(
    [JSON.stringify(car, null, 2)],
    `Eres Richard IA Pro, estratega de ventas de Richard Automotive en Puerto Rico.
Usa terminología local (guagua, pronto, marbete, unidad).
Genera un reporte persuasivo en HTML con 3 secciones: ANÁLISIS DE UNIDAD, PERSPECTIVA DE MERCADO (PR), VERDICTO RICHARD.
Usa <strong class="text-cyan-400"> para puntos clave.`,
  );
}

export async function generateText(prompt: string, instruction?: string): Promise<string> {
  return callGemini([prompt], instruction || 'Eres un asistente administrativo para Richard Automotive.');
}

export async function generateCode(prompt: string, instruction?: string): Promise<string> {
  return callGemini(
    [instruction ? `${instruction}\n\n${prompt}` : prompt],
    'Eres un experto en programación. Genera código limpio y bien documentado.',
  );
}

export async function getAIResponse(
  userPrompt: string,
  _inventory?: Car[],
  _history?: { role: 'user' | 'bot'; text: string }[],
  customSystemPrompt?: string,
): Promise<string> {
  return callGemini(
    [userPrompt],
    customSystemPrompt || 'Eres Richard AI, asistente automotriz de Richard Automotive. Responde de forma breve, natural y en español. Usa terminología local de Puerto Rico.',
  );
}

export async function analyzeCarImage(base64Image: string): Promise<Record<string, unknown>> {
  const text = await fetch('/api/ai/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        inlineData: { data: base64Image.replace(/^data:image\/\w+;base64,/, ''), mimeType: 'image/jpeg' },
      }],
      system: 'Analyze this car image. Return JSON: { type, keywords: [], description, search_query }',
    }),
  }).then(r => r.json()).then(d => d.data);
  return JSON.parse(text);
}

export async function generateBlogPost(
  topic: string,
  tone: 'professional' | 'casual' | 'hype' = 'professional',
  type: 'news' | 'review' | 'guide' = 'news',
): Promise<BlogPost> {
  const text = await callGemini(
    [`Write ${type} about "${topic}". Tone: ${tone}. Return JSON: { "title": "...", "excerpt": "...", "content": "HTML...", "tags": [], "imagePrompt": "..." }`],
    'Eres un periodista automotriz experto. Escribe en español.',
  );
  const data = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  return {
    id: Date.now().toString(),
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    author: 'Richard AI Editor',
    date: new Date().toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' }),
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1600',
    tags: data.tags,
  };
}

export async function generateCoverImage(prompt: string): Promise<string> {
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `A highly realistic, cinematic, professional automotive photography thumbnail for: ${prompt}. Minimalist, elegant, 8k, volumetric lighting. No text.`,
        n: 1,
        size: '1024x1024',
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json();
    return data.data[0].url;
  } catch {
    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1600';
  }
}

export async function analyzeGarageSelection(cars: Car[]): Promise<string> {
  const carList = cars.map(c => `${c.name} ($${c.price})`).join(', ');
  return callGemini(
    [`Analiza este garaje: ${carList}. Identifica poder de gasto/lifestyle. Sugiere 1 trade-in. OUTPUT: HTML simple (<p>, <ul>).`],
    'Eres un asesor automotriz experto.',
  );
}

export async function parseVoiceIntent(text: string): Promise<CommandIntent | null> {
  const prompt = `Analyze this voice command: "${text}". Return JSON: {"action":{"type":"NAVIGATE"|"SEARCH"|"UPDATE_FILTER","payload":{}},"confidence":0.0-1.0,"originalText":"${text}"}`;
  try {
    const responseText = await callGemini([prompt], 'Eres un analista de comandos de voz.');
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) as CommandIntent : null;
  } catch {
    return null;
  }
}

export async function generateImage(_prompt: string, _referenceImageBase64?: string): Promise<string> {
  return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000';
}

export async function generateVideo(_prompt: string, _base64Image?: string, _mimeType?: string, _aspectRatio?: string): Promise<string> {
  throw new Error('Video generation unavailable');
}

export async function generateVehicleDeepAnalysis(car: any): Promise<any> {
  const res = await fetch('/api/ai/deep-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ car }),
  });
  if (!res.ok) throw new Error('Deep analysis failed');
  return res.json();
}

export async function connectToVoiceSession(options: {
  onopen?: () => void;
  onmessage?: (message: any) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}): Promise<{ close: () => void; sendRealtimeInput: (payload: any) => void }> {
  console.log('Voice session options:', options);
  return {
    close: () => { options.onclose?.(); },
    sendRealtimeInput: (data: unknown) => { console.log('Voice data:', data); },
  };
}
