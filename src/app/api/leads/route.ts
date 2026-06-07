import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/client';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { turnstileToken, ...leadData } = body;

    if (!turnstileToken) {
      return NextResponse.json({ error: 'Missing Turnstile token' }, { status: 400 });
    }

    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY || '',
          response: turnstileToken,
          remoteip: req.headers.get('x-forwarded-for')?.split(',')[0] || '',
        }),
      },
    );

    const turnstileData = await turnstileRes.json();

    if (!turnstileData.success) {
      console.warn('[Leads API] Turnstile verification failed:', turnstileData['error-codes']);
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 });
    }

    let firstName = leadData.first_name || leadData.firstName || '';
    let lastName = leadData.last_name || leadData.lastName || '';
    if (!firstName && leadData.name) {
      const parts = (leadData.name as string).trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone: leadData.phone || '',
        email: leadData.email || '',
        vehicle_id: leadData.vehicle_id || leadData.vehicleId || null,
        vehicle_of_interest: leadData.vehicle_of_interest || leadData.vehicleOfInterest || null,
        status: 'new',
        location: leadData.location || 'richard-automotive',
        category: leadData.category || null,
        behavioral_metrics: {
          source: leadData.type || leadData.source || 'web',
          notes: leadData.notes || '',
          ...(leadData.behavioral_metrics || {}),
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Leads API] Error saving lead:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, message: 'Lead saved successfully' });
  } catch (error: any) {
    console.error('[Leads API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
