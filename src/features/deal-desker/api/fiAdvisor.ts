// Sentinel F&I Advisor AI Engine (Gemini 2.0-flash)
// Capa: Features - Slice: deal-desker
// Creado: 2026-05-24

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { CreditTier } from '@/entities/deal/model/types';

// Definición del Schema de respuesta con Zod
const fiAdvisorResponseSchema = z.object({
  approvalProbability: z.enum(['high', 'medium', 'low']),
  bankRecommendations: z.array(z.string()),
  reasoning: z.string(),
  tacticalSuggestions: z.array(z.string()),
  fiStrategies: z.array(z.string()),
});

export type FIAdvisorAnalysis = z.infer<typeof fiAdvisorResponseSchema>;
interface AnalyzeDealParams {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  creditTier: CreditTier;
  downPayment: number;
  tradeInValue: number;
  tradeInPayoff: number;
  term: number;
  apr: number;
  ltv: number;
  estimatedMonthlyPayment: number;
  gapInsuranceEnabled: boolean;
  extendedWarrantyEnabled: boolean;
  powerPackEnabled?: boolean;
  diamondCeramicEnabled?: boolean;
  monthlyIncome?: number;
  structureType?: 'conventional' | 'leasing';
  residualValue?: number;
  
  // Parámetros comparativos multi-banco opcionales
  bankComparisons?: any[];
}

export class FIAdvisor {
  /**
   * Realiza un análisis inteligente de estructuración del Deal (F&I) usando Gemini 2.0
   */
  static async analyzeDeal(params: AnalyzeDealParams): Promise<FIAdvisorAnalysis> {
    try {
      let bankSection = '';
      if (params.bankComparisons && params.bankComparisons.length > 0) {
        bankSection = '\nDESGLOSE MULTI-BANCO DEL CALCULADOR DE TASAS (Buy vs. Sell Spread):\n' + 
          params.bankComparisons.map(b => 
            `- ${b.bankName.toUpperCase()}: Tasa Base (Buy): ${b.buyRate}%, Tasa Cliente (Sell): ${b.sellRate}%, Pago Mensual: $${b.monthlyPayment}, Comisión Dealer Reserve (Spread): $${b.reserveProfit}${b.residualValue ? `, Valor Residual: $${b.residualValue}` : ''}`
          ).join('\n') + '\n';
      }

      const prompt = `
      Analiza la siguiente propuesta de financiamiento automotriz (Deal) en Puerto Rico:
      
      DATOS DE LA UNIDAD:
      - Vehículo: ${params.year} ${params.make} ${params.model}
      - Precio de Venta Negociado: $${params.price.toLocaleString()}
      - Millaje: ${params.mileage.toLocaleString()} millas
      
      DATOS FINANCIEROS DEL CLIENTE:
      - Credit Tier Estimado: ${params.creditTier.toUpperCase()}
      - Ingresos Mensuales Estimados: ${params.monthlyIncome ? `$${params.monthlyIncome.toLocaleString()}` : 'No provistos'}
      
      ESTRUCTURACIÓN DEL DEAL:
      - Estructura: ${params.structureType === 'leasing' ? 'LEASING (Arrendamiento Especial Ford)' : 'PRÉSTAMO CONVENCIONAL'}
      - Pronto Pago (Down Payment): $${params.downPayment.toLocaleString()}
      - Valor del Trade-in: $${params.tradeInValue.toLocaleString()}
      - Deuda del Trade-in (Payoff): $${params.tradeInPayoff.toLocaleString()}
      - Equidad del Trade-in: $${(params.tradeInValue - params.tradeInPayoff).toLocaleString()}
      - Plazo: ${params.term} meses
      - Tasa (APR): ${params.apr}%
      - LTV (Loan-to-Value) Calculado: ${params.ltv}%
      - Cuota Mensual Estimada: $${params.estimatedMonthlyPayment.toLocaleString()}/mes
      ${params.residualValue ? `- Valor Residual del Leasing: $${params.residualValue.toLocaleString()}` : ''}
      ${bankSection}
      COBERTURAS F&I SELECCIONADAS:
      - Seguro GAP: ${params.gapInsuranceEnabled ? 'SÍ' : 'NO'}
      - Contrato de Servicio Premium (Garantía Extendida): ${params.extendedWarrantyEnabled ? 'SÍ' : 'NO'}
      
      INSTRUCCIONES DE ANÁLISIS:
      1. EVALUACIÓN DE CRÉDITO Y LTV: 
         - Aprobaciones generales: Se aprueba a la mayoría de los clientes si demuestran capacidad de pago.
         - Clientes con score < 650 (Dificultad Alta): Son los más difíciles de aprobar porque la tasa de interés alta dispara la cuota mensual sacando el deal fuera de los parámetros viables (DTI > 60%).
         - Clientes con score < 627 (Regla de Pronto Obligatorio): Si la empírica es menor de 627, los bancos aprueban ESTRICTAMENTE hasta un **100% de LTV máximo**. Si el LTV actual supera el 100%, exige proactivamente un aumento de pronto pago para bajar el LTV al 100%. Para empíricas mayores, se permite hasta 129% LTV.
      2. ESTRUCTURA DE LEASING (ATRACTIVOS CLAVE EN PUERTO RICO):
         - Recuerda que en Puerto Rico el leasing es súper atractivo y fácil de vender porque **NO hay penalidad por millaje** y **NO se requiere el primer pago por adelantado** (se paga cómodamente dentro de los primeros 30 días laborables). Utiliza esto para armar discursos de venta contundentes.
         - Banco Popular es el preferido. Oriental Bank es **muy estricto** en sus políticas de riesgo y NO es el líder de Ford Leasing, así que trátalo con cautela.
      3. QUIEBRAS (REGLA DE 2 AÑOS):
         - Si el cliente tiene historial de quiebra, los bancos locales le darán la oportunidad de un nuevo financiamiento únicamente si han transcurrido **2 años o más desde el discharge (descargo) de la quiebra**.
      4. SEGUROS (FULL COVER VS SEGURO DOBLE):
         - En Ford, la mayoría de los clientes compran su póliza anual de Full Cover por su cuenta **fuera del préstamo**. Cotizamos estas pólizas directamente con **Universal** o **Premier Insurance**.
         - La opción de Seguro Doble financiado está disponible, pero advierte que meterlo en el préstamo infla el LTV y la cuota mensual. Recomienda comprarla aparte con Universal o Premier Insurance para rescatar negocios con LTVs o cuotas al límite.
      5. RECOMENDACIÓN DE BANCOS:
         - Banco Popular es el socio principal y más flexible en excepciones comerciales. Sugiere Popular para casos retantes apelando a sus excepciones de crédito.
      6. PRODUCTOS BACK-END:
         - Respeta el tope de un máximo de 3 productos financiados simultáneamente (Power Pack, Garantía VIP, Diamond Ceramic) y aconseja meter siempre el Seguro GAP que se aprueba al 100% con $320 de ganancia neta.
      7. Responde con un tono profesional, estratégico y usando modismos puertorriqueños de forma técnica (pronto, marbete, trade-in, guagua, millaje, empírica, discharge).
      `;

      const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        system: `
          Eres el 'Sentinel F&I Advisor', el consultor experto en financiamiento de autos de Richard Automotive en Vega Alta, Puerto Rico.
          Tu rol es analizar estructuraciones de préstamos (deals) y dar recomendaciones de crédito automotriz hiper-precisas y realistas para asegurar la aprobación bancaria y maximizar las ganancias de F&I.
        `,
        prompt,
        schema: fiAdvisorResponseSchema,
      });

      return object;
    } catch (error) {
      console.error('[FIAdvisor] Error analyzing deal with Gemini:', error);
      
      // Fallback robusto en caso de fallo de red/API
      const isLtvHigh = params.ltv > 129;
      return {
        approvalProbability: isLtvHigh ? 'medium' : 'high',
        bankRecommendations: params.ltv > 125 ? ['Banco Popular de Puerto Rico', 'Cooperativas Locales'] : ['Banco Popular de Puerto Rico', 'FirstBank PR'],
        reasoning: `Análisis preliminar automatizado (Fallback). El LTV calculado es de ${params.ltv}%. ${
          isLtvHigh 
            ? 'El LTV se encuentra por encima del umbral de aprobación automática del 129%. Podría requerir una excepción con Banco Popular.' 
            : 'Estructuración sólida con excelente probabilidad de aprobación dentro del estándar del 129% de LTV de Richard.'
        }`,
        tacticalSuggestions: isLtvHigh 
          ? [`Solicitar pronto adicional para reducir el LTV por debajo del 129%`, 'Verificar tasación oficial del trade-in']
          : ['Proceder con el envío formal de documentos a Banco Popular', 'Asegurar firma de pre-cualificación'],
        fiStrategies: [
          'Presentar la cuota con el Contrato de Servicio Premium en la modalidad de Pago Todo Incluido',
          params.ltv > 110 ? 'Recomendar proactivamente Seguro GAP para mitigar el LTV de la unidad' : 'Ofrecer cobertura de protección de crédito'
        ]
      };
    }
  }
}
