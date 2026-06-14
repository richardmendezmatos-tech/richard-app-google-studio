import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

/**
 * POST /api/leads/blog-inquiry
 * Captures leads from the blog calculator and comment sections.
 * Does NOT require Turnstile (low-friction conversion path).
 * Saves to `leads` table with source=blog_calculator and triggers
 * background Sentinel Nurture notification.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      source = 'blog_calculator',
      message,
      vehicle_of_interest,
      monthly_payment_estimated,
      vehicle_price,
      down_payment,
      term_months,
      apr,
    } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Nombre y teléfono son requeridos.' }, { status: 400 });
    }

    const nameParts = (name as string).trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || 'N/A';

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone: phone.trim(),
        email: email?.trim() || '',
        vehicle_of_interest: vehicle_of_interest || 'Blog Inquiry',
        status: 'new',
        source: source,
        behavioral_metrics: {
          source,
          notes: message || '',
          monthly_payment_estimated: monthly_payment_estimated || null,
          vehicle_price: vehicle_price || null,
          down_payment: down_payment || null,
          term_months: term_months || null,
          apr: apr || null,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Blog Inquiry API] Supabase error:', error);
      return NextResponse.json({ error: 'Error al guardar el lead.' }, { status: 500 });
    }

    // Background: trigger Sentinel Nurture (fire & forget, no await blocking response)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/command-center/nurture/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: { name, phone, email, vehicleOfInterest: vehicle_of_interest },
        context: message || `Nuevo lead del blog — pago calculado: $${monthly_payment_estimated}/mes`,
      }),
    }).catch((err) => console.error('[Blog Inquiry API] Nurture trigger failed (non-blocking):', err));

    return NextResponse.json({ id: data.id, success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[Blog Inquiry API] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
