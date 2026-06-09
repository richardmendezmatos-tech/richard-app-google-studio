import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/shared/api/supabase/client';
import { triggerSentinelNurture } from '@/shared/api/communications/whatsappService';

export const runtime = 'edge';

/**
 * Sentinel N25: Agentic Nurture Workflow
 * A durable, resilient sales follow-up engine.
 */
export async function POST(req: Request) {
  const { leadId, phone, name, unitOfInterest, context } = await req.json();

  // 1. Logic of the sales follow-up engine

  // Step 1: Initial AI Ingestion & Response Generation
  const firstContact = await (async () => {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: `Eres Sentinel N25, el estratega de ventas de Richard Automotive. 
               Tu misión es convertir a ${name} en un cliente feliz. 
               Le interesa: ${unitOfInterest}. Contexto: ${context}.
               Genera un mensaje de WhatsApp persuasivo, profesional y local (Boricua).`,
      prompt: `Genera el primer contacto para ${name}.`,
    });
    return text;
  })();

  // Step 2: Dispatch via WhatsApp
  await (async () => {
    await triggerSentinelNurture({ id: leadId, phone, name } as any, firstContact);
  })();

  // Step 3: Engagement Analysis
  const engagement = await (async () => {
    const supabase = createClient();
    if (!supabase) return { clicked: false, responded: false };

    const { data } = await supabase
      .from('behavioral_events')
      .select('*')
      .eq('metadata->leadId', leadId)
      .eq('event_type', 'link_click')
      .limit(1);

    return { clicked: (data && data.length > 0) || false };
  })();

  // Step 5: Adaptive Follow-up
  if (!engagement.clicked) {
    const nudge = await (async () => {
      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: `El cliente no ha hecho clic en el catálogo. 
                 Richard te autoriza a proponer un 'Special Sentinel Nudge' con un 5% de descuento 
                 o una garantía extendida de 12 meses.
                 Propón el mensaje para que Richard lo apruebe en el Command Center.`,
        prompt: `Genera una propuesta de incentivo para ${name}.`,
      });
      return text;
    })();

    // Step 6: Request Human-in-the-loop Approval
    await (async () => {
      const supabase = createClient();
      if (!supabase) return;

      await supabase.from('agent_approvals').insert({
        workflow_id: `nurture-${leadId}`,
        step_id: 'nudge_incentive',
        message: `Propuesta de incentivo para ${name}: "${nudge}"`,
        metadata: { leadId, nudge, phone },
        status: 'pending',
      });
    })();
  }

  return Response.json({ status: 'workflow_initiated', leadId });
}
