import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, vehicle } = body;

    if (!phone && !email) {
      return NextResponse.json({ error: 'Se requiere teléfono o email' }, { status: 400 });
    }
    if (!vehicle) {
      return NextResponse.json({ error: 'Se requiere el vehículo de interés' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const nameParts = (name || 'Alerta Inventario').trim().split(' ');
    await supabase.from('leads').insert({
      first_name: nameParts[0] || 'Alerta',
      last_name: nameParts.slice(1).join(' ') || 'Inventario',
      phone: phone || '',
      email: email || '',
      vehicle_of_interest: vehicle,
      status: 'new',
      location: 'richard-automotive',
      behavioral_metrics: {
        source: 'inventory_alert',
        notes: `Alerta de inventario solicitada: ${vehicle}`,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('[inventory-alert] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
