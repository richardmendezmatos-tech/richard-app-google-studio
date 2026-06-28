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
    const { name, phone } = await req.json();
    if (!phone || String(phone).trim().length < 7) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const nameParts = String(name || 'Exit Intent').trim().split(' ');
    const firstName = nameParts[0] || 'Web';
    const lastName = nameParts.slice(1).join(' ') || 'Lead';

    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from('leads').upsert(
      {
        phone: cleanPhone,
        email: `${cleanPhone}@exitintent.web`,
        first_name: firstName,
        last_name: lastName,
        status: 'new',
        source: 'web',
        customer_memory: {
          source_detail: 'exit_intent_modal',
          bono_web_claimed: true,
          captured_at: new Date().toISOString(),
        },
      },
      { onConflict: 'phone', ignoreDuplicates: false },
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[ExitIntent Lead] Error:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
