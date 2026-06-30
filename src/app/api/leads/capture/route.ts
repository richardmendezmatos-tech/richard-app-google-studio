import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

async function notifyRichardHotLead(
  vehicleName: string,
  vehiclePrice: number,
  monthlyPayment?: number,
  source?: string,
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return;

  const priceStr = vehiclePrice ? `$${vehiclePrice.toLocaleString()}` : 'N/A';
  const paymentStr = monthlyPayment ? `$${monthlyPayment}/mes` : 'N/A';
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#06b6d4;margin:0 0 16px">🔥 Nuevo Lead WhatsApp</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px;color:#6b7280">Vehículo</td><td style="padding:8px;font-weight:bold">${vehicleName}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Precio</td><td style="padding:8px;font-weight:bold">${priceStr}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Pago estimado</td><td style="padding:8px;font-weight:bold">${paymentStr}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Fuente</td><td style="padding:8px">${source || 'web'}</td></tr>
      </table>
      <p style="margin:16px 0 0;color:#6b7280;font-size:12px">Este lead llegó por WhatsApp — prioridad máxima en la cola de CRM.</p>
    </div>
  `;

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: 'richardmendezmatos@gmail.com' }] }],
      from: { email: 'noreply@richardautomotive.com', name: 'Richard Automotive Web' },
      subject: `🔥 Lead WhatsApp — ${vehicleName}`,
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

    const { error } = await supabase.from('hot_leads').insert({
      vehicle_id: body.vehicleId,
      vehicle_name: body.vehicleName,
      vehicle_price: body.vehiclePrice,
      monthly_payment: body.monthlyPayment,
      down_payment: body.downPayment,
      trade_in: body.tradeIn,
      term: body.term,
      credit_tier: body.creditTier,
      source: body.source,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('[Leads Capture] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    notifyRichardHotLead(
      body.vehicleName,
      body.vehiclePrice,
      body.monthlyPayment,
      body.source,
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Leads Capture] Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
