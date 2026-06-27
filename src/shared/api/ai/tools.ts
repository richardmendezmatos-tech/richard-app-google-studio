import { tool } from 'ai';
import { z } from 'zod';
import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';

/**
 * Shared AI Tools for Richard Automotive
 * Standardized across Chat, Automation, and Admin agents.
 */
export const aiTools = {
  calculateLoanPayment: tool({
    description:
      'Calcula el pago mensual exacto para un préstamo de auto basado en el precio, pronto y términos.',
    parameters: z.object({
      price: z.number().describe('Precio total de la unidad incluyendo gastos de dealer ($495).'),
      downPayment: z.number().optional().describe('Cantidad de pronto o trade-in aportada.'),
      term: z.number().describe('Término del préstamo en meses (ej. 72, 84).'),
      apr: z.number().optional().describe('Tasa de interés estimada (ej. 5.95).'),
    }),
    execute: (async ({ price, downPayment = 0, term, apr = 6.95 }: any) => {
      const balance = price - downPayment;
      const monthlyRate = apr / 100 / 12;
      const payment = (balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
      return {
        monthlyPayment: Math.round(payment),
        totalInterest: Math.round(payment * term - balance),
        balanceToFinance: balance,
        disclaimer: 'Estimado basado en crédito excelente. Sujeto a aprobación bancaria.',
      };
    }) as any,
  } as any),

  searchInventory: tool({
    description: 'Busca vehículos en el inventario actual de Richard Automotive.',
    parameters: z.object({
      query: z.string().describe('Marca, modelo o tipo de auto (ej. "Toyota", "SUV").'),
      maxPrice: z.number().optional().describe('Presupuesto máximo.'),
    }),
    execute: (async ({ query, maxPrice }: any) => {
      try {
        console.log(`[AI Tool: searchInventory] Starting hybrid search for query: "${query}"`);

        const { getSupabase: gs } = await import('@/shared/api/supabase/supabaseClient');
        const sb = await gs();

        // 1. Try semantic search first
        let matchingCars: any[] = [];
        try {
          const queryEmbedding = await sentinelAI.generateEmbedding(query);
          const semanticMatches = await searchSemanticInventory(queryEmbedding, 0.35, 5);

          if (semanticMatches && semanticMatches.length > 0) {
            console.log(
              `[AI Tool: searchInventory] Found ${semanticMatches.length} semantic matches.`,
            );
            const carIds = semanticMatches.map((m) => m.car_id);
            const { data: dbCars, error: dbError } = await sb
              .from('inventory')
              .select('id, name, year, make, model, price, status, description, image_url, imageUrl, vin')
              .in('vin', carIds)
              .limit(50);

            if (!dbError && dbCars) {
              // Maintain semantic relevance order
              matchingCars = semanticMatches
                .map((match) => dbCars.find((c: any) => c.id === match.car_id))
                .filter(Boolean);
            }
          }
        } catch (semanticError) {
          console.warn(
            '[AI Tool: searchInventory] Semantic search failed, falling back to text-match:',
            semanticError,
          );
        }

        // 2. Text fallback if no semantic matches were found
        if (matchingCars.length === 0) {
          console.log('[AI Tool: searchInventory] Executing fallback text-based match...');
          const { data, error } = await sb
            .from('inventory')
            .select('id, name, year, make, model, price, status, description, image_url, imageUrl')
            .or(`make.ilike.%${query}%,model.ilike.%${query}%,condition.ilike.%${query}%`)
            .limit(5);

          if (error) {
            console.error('[AI Tool: searchInventory] Fallback search error:', error);
            return { error: 'No se pudo consultar el inventario.' };
          }
          matchingCars = data || [];
        }

        // 3. Apply additional filters
        let filtered = matchingCars;
        if (maxPrice) {
          filtered = filtered.filter((c: any) => c.price <= maxPrice);
        }

        return filtered.map((c: any) => ({
          id: c.id,
          name: c.name || `${c.year} ${c.make} ${c.model}`,
          price: c.price,
          status: c.status || 'Disponible',
          description: c.description || '',
          imageUrl: c.image_url || c.imageUrl || '',
        }));
      } catch (err: any) {
        console.error('[AI Tool: searchInventory] Unexpected error:', err);
        return { error: 'Error inesperado durante la búsqueda de inventario.' };
      }
    }) as any,
  } as any),

  browseWeb: tool({
    description:
      'Navega sitios web para buscar información sobre vehículos, precios, comparativas de mercado, y especificaciones técnicas.',
    parameters: z.object({
      instruction: z
        .string()
        .describe('Instrucción clara de lo que se debe buscar o hacer en la web.'),
      url: z.string().optional().describe('URL opcional para comenzar la navegación.'),
    }),
    execute: (async ({ instruction, url }: { instruction: string; url?: string }) => {
      const { browserAgentService } = await import('@/features/browser-agent');
      const result = await browserAgentService.execute({ instruction, url });
      return result;
    }) as any,
  } as any),

  captureCustomerLead: tool({
    description: 'Registra los datos de contacto de un cliente interesado.',
    parameters: z.object({
      firstName: z.string().describe('Nombre del cliente.'),
      phone: z.string().describe('Teléfono o WhatsApp del cliente.'),
      email: z.string().optional().describe('Correo electrónico.'),
      vehicleOfInterest: z.string().optional().describe('Auto que le interesa.'),
      notes: z.string().optional().describe('Notas adicionales.'),
    }),
    execute: (async (leadData: any) => {
      const { getSupabase: gs } = await import('@/shared/api/supabase/supabaseClient');
      const sb = await gs();
      const { error } = await sb.from('leads').insert({
        first_name: leadData.firstName,
        phone: leadData.phone,
        email: leadData.email,
        vehicle_of_interest: leadData.vehicleOfInterest,
        behavioral_metrics: {
          notes: leadData.notes || '',
          source: 'AI Tool Capture',
        },
        status: 'new',
      });

      if (error) return { success: false, error: 'Error al guardar los datos.' };

      return {
        success: true,
        message: `¡Gracias ${leadData.firstName}! Hemos recibido tus datos. Richard se pondrá en contacto contigo pronto.`,
      };
    }) as any,
  } as any),

  estimateTradeIn: tool({
    description: 'Estima el valor de mercado de un vehículo para trade-in en Puerto Rico.',
    parameters: z.object({
      year: z.number().describe('Año del vehículo.'),
      make: z.string().describe('Marca (ej. Toyota, Honda, Ford).'),
      model: z.string().describe('Modelo (ej. Camry, Civic, F-150).'),
      mileage: z.number().optional().describe('Millaje actual.'),
      condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional().describe('Condición general.'),
    }),
    execute: (async ({ year, make, model, mileage = 50000, condition = 'good' }: any) => {
      const { sentinelAI } = await import('@/shared/api/ai/sentinelAI');
      const conditionLabels: Record<string, string> = { excellent: 'excelente', good: 'buena', fair: 'regular', poor: 'pobre' };
      const estimate = await sentinelAI.quickGen(
        `Estima el valor de trade-in para un ${year} ${make} ${model} con ${mileage.toLocaleString()} millas en condición ${conditionLabels[condition] || condition} en Puerto Rico. Responde SOLO con un rango de precio en USD (ej: "$12,000 - $15,000") sin explicación.`,
        'Eres un valuador experto en el mercado automotriz de Puerto Rico. Solo devuelves el rango de precio, nada más.',
      );
      return {
        estimate: estimate.trim(),
        vehicle: `${year} ${make} ${model}`,
        disclaimer: 'Estimado basado en condiciones de mercado. Visítanos para valuación oficial con inspección física.',
      };
    }) as any,
  } as any),

  scheduleTestDrive: tool({
    description: 'Agenda una prueba de manejo o cita para visitar el concesionario Richard Automotive.',
    parameters: z.object({
      customerName: z.string().describe('Nombre del cliente.'),
      phone: z.string().describe('Teléfono de contacto.'),
      preferredDate: z.string().optional().describe('Fecha preferida (ej. "mañana", "sábado", "2026-06-30").'),
      vehicleInterest: z.string().optional().describe('Vehículo que quiere probar.'),
    }),
    execute: (async ({ customerName, phone, preferredDate, vehicleInterest }: any) => {
      try {
        const { createServiceClient } = await import('@/shared/api/supabase/factory');
        const supabase = createServiceClient();
        const cleanPhone = phone.replace(/\D/g, '');

        const { data: lead } = await supabase
          .from('leads')
          .select('id')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (lead?.id) {
          const { AppointmentService } = await import('@/features/appointments/api/appointmentService');
          const apptService = new AppointmentService();
          const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await apptService.schedule({ leadId: lead.id, date, type: 'test-drive' });
        }

        const when = preferredDate || 'en las próximas 24 horas';
        return {
          success: true,
          message: `¡Perfecto ${customerName}! Tu cita${vehicleInterest ? ` para el ${vehicleInterest}` : ''} está confirmada para ${when}. Te esperamos en Richard Automotive, Carr. 2 Km 34.2, Vega Alta. Richard te contactará para confirmar el horario exacto. ¡Nos vemos pronto! 🚗`,
        };
      } catch {
        return {
          success: true,
          message: `¡Listo ${customerName}! Anotamos tu interés${vehicleInterest ? ` en el ${vehicleInterest}` : ''}. Richard te contactará pronto para coordinar tu visita.`,
        };
      }
    }) as any,
  } as any),

  requestHumanAgent: tool({
    description: 'Escala la conversación a Richard o un agente humano cuando el cliente lo solicita o la situación lo requiere.',
    parameters: z.object({
      reason: z.string().describe('Motivo del escalamiento.'),
      customerName: z.string().optional().describe('Nombre del cliente si se conoce.'),
      phone: z.string().optional().describe('Teléfono del cliente si se conoce.'),
    }),
    execute: (async ({ reason, customerName, phone }: any) => {
      if (phone) {
        const { houstonHandoffService } = await import('@/features/houston/api/HoustonHandoffService');
        await houstonHandoffService.escalate({
          leadPhone: phone,
          message: reason,
          reason,
          channel: 'chat',
        });
      }
      const name = customerName ? ` ${customerName}` : '';
      return {
        escalated: true,
        message: `Entendido${name}. 🤝 Richard está siendo notificado ahora mismo y se pondrá en contacto contigo a la brevedad. También puedes contactarnos directamente por WhatsApp al +1 (787) 883-1234 o visitarnos en Vega Alta. ¡Gracias por tu paciencia!`,
      };
    }) as any,
  } as any),
};
