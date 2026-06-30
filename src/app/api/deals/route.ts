import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return;
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@richardautomotive.com', name: 'Richard Automotive' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  }).catch(() => {});
}

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (body.leadId) {
      const token = req.headers.get('x-antigravity-token');
      if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN && token !== 'client-internal') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { error: dealError } = await supabase
        .from('deals')
        .insert({
          lead_id: body.leadId,
          inventory_id: body.inventoryId || null,
          credit_tier: body.creditTier,
          down_payment: body.downPayment,
          trade_in_value: body.tradeInValue || 0,
          trade_in_payoff: body.tradeInPayoff || 0,
          term: body.term,
          apr: body.apr,
          ltv: body.ltv,
          estimated_monthly_payment: body.estimatedMonthlyPayment,
          front_end_profit: body.frontEndProfit || 0,
          back_end_profit: body.backEndProfit || 0,
          bank_selected: body.bankSelected || null,
          status: body.status || 'structured',
          structure_type: body.structureType || 'conventional',
          residual_value: body.residualValue || 0.00,
        });

      if (dealError) throw dealError;
      return NextResponse.json({ message: 'Deal saved successfully' });
    }

    const { leadName, leadPhone, leadEmail, carVin, downPayment, targetMonthlyPayment, creditTier, term, apr, message } = body;

    if (!leadName || !leadPhone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const nameParts = (leadName as string).trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone: leadPhone,
        email: leadEmail || null,
        status: 'new',
        source: 'web',
        message: message || `Precualificación automática - $${targetMonthlyPayment}/mes, Pronto: $${downPayment}.`,
        inventory_id: carVin || null,
      })
      .select('id')
      .single();

    if (leadError) throw leadError;

    const { error: dealError } = await supabase
      .from('deals')
      .insert({
        lead_id: lead.id,
        inventory_id: carVin || null,
        credit_tier: creditTier || 'tier_2',
        down_payment: downPayment || 0,
        term: term || 72,
        apr: apr || 7.45,
        ltv: body.carPrice ? Math.round(((body.carPrice - downPayment) / body.carPrice) * 100) : 80,
        estimated_monthly_payment: targetMonthlyPayment || 0,
        status: 'structured',
      });

    if (dealError) throw dealError;

    const carLabel = body.carVin ? ` — ${body.carVin}` : '';
    const richardHtml = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#10b981;margin:0 0 16px">🎯 Precualificación Express</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px;color:#6b7280">Nombre</td><td style="padding:8px;font-weight:bold">${leadName}</td></tr>
          <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Teléfono</td><td style="padding:8px;font-weight:bold">${leadPhone}</td></tr>
          ${leadEmail ? `<tr><td style="padding:8px;color:#6b7280">Email</td><td style="padding:8px">${leadEmail}</td></tr>` : ''}
          <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Vehículo</td><td style="padding:8px">${carLabel || 'Sin especificar'}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Pago mensual</td><td style="padding:8px;font-weight:bold;color:#10b981">$${targetMonthlyPayment}/mes</td></tr>
          <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Pronto pago</td><td style="padding:8px">$${(downPayment || 0).toLocaleString()}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Plazo</td><td style="padding:8px">${term} meses</td></tr>
          <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">APR estimado</td><td style="padding:8px">${apr}%</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Crédito</td><td style="padding:8px">${creditTier}</td></tr>
        </table>
        <p style="margin:16px 0 0;color:#6b7280;font-size:12px">Lead ID: ${lead.id}</p>
      </div>
    `;
    sendEmail('richardmendezmatos@gmail.com', `🎯 Precualificación — ${leadName} — $${targetMonthlyPayment}/mes`, richardHtml).catch(() => {});

    if (leadEmail) {
      const confirmHtml = `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#10b981;margin:0 0 16px">¡Tu precualificación fue recibida!</h2>
          <p style="color:#374151">Hola ${firstName}, Richard se comunicará contigo por WhatsApp en los próximos minutos.</p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;font-size:14px">
            <div><b>Pago estimado:</b> $${targetMonthlyPayment}/mes</div>
            <div><b>Pronto pago:</b> $${(downPayment || 0).toLocaleString()}</div>
            <div><b>Plazo:</b> ${term} meses</div>
          </div>
          <p style="color:#374151">Recuerda mencionar tu <b>Bono Web de $300</b> al hablar con Richard.</p>
          <a href="https://wa.me/17873682880" style="display:inline-block;background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Escribir por WhatsApp</a>
        </div>
      `;
      sendEmail(leadEmail, '¡Precualificación recibida! — Richard Automotive', confirmHtml).catch(() => {});
    }

    return NextResponse.json({ id: lead.id, message: 'Deal created successfully' });
  } catch (error: any) {
    console.error('[Deals API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
