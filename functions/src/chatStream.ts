
import { onRequest } from 'firebase-functions/v2/https';
import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import * as logger from 'firebase-functions/logger';
import { db } from './services/firebaseAdmin';
import { customerMemoryService } from './services/customerMemoryService';
import { simulateLoan } from './services/financeService';

interface Car {
    id: string;
    name?: string;
    type?: string;
    [key: string]: any;
}

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

    const { messages, leadId } = req.body;

    // --- Phase 6: Memory Retrieval ---
    const customerMemory = leadId ? await customerMemoryService.getMemory(leadId) : null;

    try {
        const result = await streamText({
            model: google('gemini-1.5-flash'),
            system: `${SYSTEM_PROMPT}
            MEMORIA DEL CLIENTE: ${JSON.stringify(customerMemory || 'Nuevo Cliente')}
            Si el cliente ya ha visto ciertos autos, menciónalos para crear cercanía.`,
            messages,
            tools: {
                checkInventory: tool({
                    description: 'Busca autos en el inventario por marca, modelo o tipo.',
                    inputSchema: z.object({
                        query: z.string().describe('Término de búsqueda, ej: "Toyota"'),
                    }),
                    execute: async ({ query }: { query: string }) => {
                        const snapshot = await db.collection('cars').where('dealerId', '==', 'richard-automotive').limit(10).get();
                        const allCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Car[];
                        const filtered = allCars.filter((car: Car) =>
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
                        // Use the new localized finance service logic
                        const creditScoreMap: Record<string, number> = { excellent: 750, good: 700, fair: 640, poor: 580 };
                        const score = creditScoreMap[creditScore] || 700;
                        const simulations = simulateLoan(price, downPayment, months, score);

                        return {
                            simulations,
                            bestOption: simulations[0],
                            disclaimer: "Sujeto a aprobación de crédito por instituciones locales (Popular/BPPR/Coop)."
                        };
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
                updateMemory: tool({
                    description: 'Actualiza la memoria del cliente con nuevas preferencias o notas.',
                    inputSchema: z.object({
                        leadId: z.string(),
                        vehicleId: z.string().optional(),
                        note: z.string(),
                    }),
                    execute: async ({ leadId, vehicleId, note }) => {
                        await customerMemoryService.updateMemory(leadId, vehicleId, note);
                        return { success: true };
                    },
                }),
                requestLeadInfo: tool({
                    description: 'Solicita información específica al cliente (ingreso, trade-in, crédito) usando un formulario interactivo.',
                    inputSchema: z.object({
                        type: z.enum(['income', 'trade-in', 'credit']),
                    }),
                    execute: async ({ type }) => {
                        return {
                            status: 'form_requested',
                            type,
                            instruction: `Por favor completa el formulario de ${type} para continuar.`
                        };
                    },
                }),
            },
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        result.pipeTextStreamToResponse(res);

    } catch (error) {
        logger.error('Chat Error:', error);
        res.status(500).json({ error: 'Internal AI Error' });
    }
});
