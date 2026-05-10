import { WorkflowAgent } from '@ai-sdk/workflow';
import { google } from '@ai-sdk/google';
import { createClient } from '@/shared/api/supabase/client';
import { triggerSentinelNurture } from '@/shared/api/communications/whatsappService';



/**
 * Sentinel N25: Agentic Nurture Workflow

 * A durable, resilient sales follow-up engine.
 */
export async function POST(req: Request) {
  const { leadId, phone, name, unitOfInterest, context } = await req.json();

  // 1. Define the Durable Workflow
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  "use workflow";

  // Step 1: Initial AI Ingestion & Response Generation
  const firstContact = await "use step" (async () => {
    const agent = new WorkflowAgent({
      model: google('gemini-2.0-flash'),
      system: `Eres Sentinel N25, el estratega de ventas de Richard Automotive. 
               Tu misión es convertir a ${name} en un cliente feliz. 
               Le interesa: ${unitOfInterest}. Contexto: ${context}.
               Genera un mensaje de WhatsApp persuasivo, profesional y local (Boricua).`,
    });

    const response = await agent.run(`Genera el primer contacto para ${name}.`);
    return response.text;
  });

  // Step 2: Dispatch via WhatsApp
  await "use step" (async () => {
    await triggerSentinelNurture({ id: leadId, phone, name } as any, firstContact);
  });


  // Step 3: Strategic Wait (24 hours)
  // We use the durable wait which allows the function to suspend and resume efficiently.
  await "use wait" (24 * 60 * 60 * 1000); 

  // Step 4: Engagement Analysis
  const engagement = await "use step" (async () => {
    const supabase = createClient();
    if (!supabase) return { clicked: false, responded: false };

    const { data } = await supabase
      .from('behavioral_events')
      .select('*')
      .eq('metadata->leadId', leadId)
      .eq('event_type', 'link_click')
      .limit(1);

    return { clicked: (data && data.length > 0) || false };
  });

  // Step 5: Adaptive Follow-up
  if (!engagement.clicked) {
    const nudge = await "use step" (async () => {
      const agent = new WorkflowAgent({
        model: google('gemini-2.0-flash'),
        system: `El cliente no ha hecho clic en el catálogo. 
                 Richard te autoriza a proponer un 'Special Sentinel Nudge' con un 5% de descuento 
                 o una garantía extendida de 12 meses.
                 Propón el mensaje para que Richard lo apruebe en el Command Center.`,
      });

      const proposal = await agent.run(`Genera una propuesta de incentivo para ${name}.`);
      return proposal.text;
    });

    // Step 6: Request Human-in-the-loop Approval
    await "use step" (async () => {
      const supabase = createClient();
      if (!supabase) return;

      await supabase.from('agent_approvals').insert({
        workflow_id: `nurture-${leadId}`,
        step_id: 'nudge_incentive',
        message: `Propuesta de incentivo para ${name}: "${nudge}"`,
        metadata: { leadId, nudge, phone },
        status: 'pending'
      });
    });

    // Step 7: Wait for Richard to Approve (Polling logic within durable step)
    // In a production Vercel Workflow, this could be a 'wait_for_event'.
    // Here we use a durable wait-and-check loop.
    let isApproved = false;
    while (!isApproved) {
      await "use wait" (10 * 60 * 1000); // Wait 10 minutes between checks

      isApproved = await "use step" (async () => {
        const supabase = createClient();
        if (!supabase) return false;

        const { data } = await supabase
          .from('agent_approvals')
          .select('status')
          .eq('workflow_id', `nurture-${leadId}`)
          .eq('status', 'approved')
          .limit(1);
        
        return data && data.length > 0;
      });

      // Simple safety break: if rejected, stop
      const isRejected = await "use step" (async () => {
        const supabase = createClient();
        if (!supabase) return false;
        const { data } = await supabase.from('agent_approvals').select('status').eq('workflow_id', `nurture-${leadId}`).eq('status', 'rejected').limit(1);
        return data && data.length > 0;
      });
      if (isRejected) break;
    }

    if (isApproved) {
      await "use step" (async () => {
        await triggerSentinelNurture({ id: leadId, phone, name } as any, nudge);
      });
    }

  }

  return Response.json({ status: 'workflow_initiated', leadId });
}
