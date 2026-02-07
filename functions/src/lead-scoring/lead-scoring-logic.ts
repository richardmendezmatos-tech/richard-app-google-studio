import { z } from 'genkit';

export const LeadScoreSchema = z.object({
  score: z.number().min(0).max(100),
  category: z.enum(['HOT', 'WARM', 'COLD']),
  insights: z.array(z.string()),
  nextAction: z.string(),
  reasoning: z.string()
});

export type LeadScore = z.infer<typeof LeadScoreSchema>;

/**
 * Lógica de Lead Scoring automatizada.
 * Implementa las 4 dimensiones: Intent, Behavioral, Financial, Demographic.
 */
export const calculateLeadScore = (data: any): LeadScore => {
  let score = 0;
  const insights: string[] = [];

  // 1. Intent Signals (40%)
  if (data.vehicleId) { score += 20; insights.push("Interés específico en unidad"); }
  if (data.requestedConsultation) { score += 20; insights.push("Solicitó consulta"); }

  // 2. Financial Fit (20%)
  const income = parseFloat(data.monthlyIncome || "0");
  if (income > 3000) { score += 10; insights.push("Ingreso sólido (>3k)"); }
  if (data.hasPronto) { score += 10; insights.push("Cuenta con pronto"); }

  // 3. Behavioral Engagement (25%)
  if (data.chatInteractions > 5) { score += 15; insights.push("Alta interacción en chat"); }
  if (data.viewedInventoryMultipleTimes) { score += 10; insights.push("Vuelve al inventario"); }

  // 4. Demographic/Stability (15%)
  if (data.timeAtJob === '2+ years') { score += 10; insights.push("Estabilidad laboral"); }
  if (data.location === 'Puerto Rico') { score += 5; insights.push("Local (PR)"); }

  let category: 'HOT' | 'WARM' | 'COLD' = 'COLD';
  if (score >= 70) category = 'HOT';
  else if (score >= 40) category = 'WARM';

  const nextAction = category === 'HOT' ? "Llamar INMEDIATAMENTE (<5 min)" : "Email sequence + Seguimiento 24h";

  return {
    score,
    category,
    insights,
    nextAction,
    reasoning: `Score basado en ${insights.length} señales de compra identificadas.`
  };
};
