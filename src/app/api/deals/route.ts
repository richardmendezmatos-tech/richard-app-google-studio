import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

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

    return NextResponse.json({ id: lead.id, message: 'Deal created successfully' });
  } catch (error: any) {
    console.error('[Deals API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
