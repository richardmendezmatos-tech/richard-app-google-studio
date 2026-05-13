import { tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';

/**
 * Shared AI Tools for Richard Automotive
 * Standardized across Chat, Automation, and Admin agents.
 */
export const aiTools = {
  calculateLoanPayment: tool({
    description: 'Calcula el pago mensual exacto para un préstamo de auto basado en el precio, pronto y términos.',
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
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .or(`make.ilike.%${query}%,model.ilike.%${query}%,condition.ilike.%${query}%`)
        .limit(5);

      if (error) return { error: 'No se pudo consultar el inventario.' };

      let filtered = data || [];
      if (maxPrice) filtered = filtered.filter((c: any) => c.price <= maxPrice);

      return filtered.map((c: any) => ({
        id: c.id,
        name: `${c.year} ${c.make} ${c.model}`,
        price: c.price,
        status: c.status || 'Disponible',
      }));
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
      const { error } = await supabase.from('leads').insert({
        first_name: leadData.firstName,
        phone: leadData.phone,
        email: leadData.email,
        vehicle_of_interest: leadData.vehicleOfInterest,
        notes: leadData.notes,
        source: 'AI Tool Capture',
        status: 'new'
      });

      if (error) return { success: false, error: 'Error al guardar los datos.' };

      return {
        success: true,
        message: `¡Gracias ${leadData.firstName}! Hemos recibido tus datos. Richard se pondrá en contacto contigo pronto.`,
      };
    }) as any,
  } as any),
};
