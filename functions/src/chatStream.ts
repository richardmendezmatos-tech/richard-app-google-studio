
import { onRequest } from 'firebase-functions/v2/https';
import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import * as logger from 'firebase-functions/logger';
import { db } from './services/firebaseAdmin';

const SYSTEM_PROMPT = `
ROL: Eres el Asistente Virtual de "Richard Automotive", experto en F&I (Finanzas y Seguros) en Puerto Rico.
OBJETIVO: Asesorar, calificar clientes y agendar citas.

PROTOCOLOS:
1. NO inventes inventario. Usa la herramienta 'checkInventory'.
2. NO inventes pagos. Usa la herramienta 'calculatePayment'.
3. SIEMPRE que obtengas Nombre y Teléfono, usa la herramienta 'saveLead'.
`;

export const chatStream = onRequest({ cors: true, region: 'us-central1' }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { messages } = req.body;

    try {
        const result = await streamText({
            model: google('gemini-1.5-flash'),
            system: SYSTEM_PROMPT,
            messages,
            tools: {
                checkInventory: tool({
                    description: 'Busca autos en el inventario por marca, modelo o tipo.',
                    inputSchema: z.object({
                        query: z.string().describe('Término de búsqueda, ej: "Toyota"'),
                    }),
                    execute: async ({ query }: { query: string }) => {
                        const snapshot = await db.collection('cars').where('dealerId', '==', 'richard-automotive').limit(10).get();
                        const allCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        const filtered = allCars.filter((car: any) =>
                            car.name?.toLowerCase().includes(query.toLowerCase()) ||
                            car.type?.toLowerCase().includes(query.toLowerCase())
                        );
                        return filtered.length > 0 ? filtered.slice(0, 5) : allCars.slice(0, 3);
                    },
                }),
                calculatePayment: tool({
                    description: 'Calcula el pago mensual estimado de un auto.',
                    inputSchema: z.object({
                        price: z.number(),
                        downPayment: z.number(),
                        months: z.number().default(72),
                        creditScore: z.enum(['excellent', 'good', 'fair', 'poor']).default('good'),
                    }),
                    execute: async ({ price, downPayment, months, creditScore }: { price: number, downPayment: number, months: number, creditScore: string }) => {
                        const rates: Record<string, number> = { excellent: 4.9, good: 7.5, fair: 11.9, poor: 18.9 };
                        const rate = rates[creditScore] || 7.5;
                        const monthlyRate = rate / 100 / 12;
                        const principal = price + 495 - downPayment;
                        if (principal <= 0) return { monthlyPayment: 0 };
                        const x = Math.pow(1 + monthlyRate, months);
                        const payment = (principal * x * monthlyRate) / (x - 1);
                        return { monthlyPayment: Math.round(payment), details: `Interés: ${rate}%` };
                    },
                }),
                saveLead: tool({
                    description: 'Guarda el lead en la base de datos.',
                    inputSchema: z.object({
                        name: z.string(),
                        phone: z.string(),
                        interest: z.string().optional(),
                        summary: z.string().optional(),
                    }),
                    execute: async (data: { name: string, phone: string, interest?: string, summary?: string }) => {
                        const [firstName, ...last] = data.name.split(' ');
                        await db.collection('applications').add({
                            firstName,
                            lastName: last.join(' ') || 'Lead',
                            phone: data.phone,
                            vehicleOfInterest: data.interest || 'General',
                            aiSummary: data.summary || '',
                            timestamp: new Date(),
                            dealerId: 'richard-automotive',
                            status: 'new'
                        });
                        return { success: true };
                    },
                }),
            },
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        result.pipeTextStreamToResponse(res as any);

    } catch (error) {
        logger.error('Chat Error:', error);
        res.status(500).json({ error: 'Internal AI Error' });
    }
});
