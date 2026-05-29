import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/client';

export interface AppointmentInput {
  name: string;
  email: string;
  phone: string;
  type: 'test-drive' | 'service';
  date: string;
  time: string;
  vehicleId?: string;
  vehicleInfo?: string;
  message?: string;
}

export async function submitAppointment(data: AppointmentInput) {
  const supabase = createClient();

  // 1. Create or find lead
  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .eq('phone', data.phone)
    .maybeSingle();

  let leadId: string;

  if (existing) {
    leadId = existing.id;
  } else {
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.type === 'test-drive' ? 'web_test_drive' : 'web_service',
        status: 'new',
      })
      .select('id')
      .single();

    if (leadError) throw new Error(leadError.message);
    leadId = lead.id;
  }

  // 2. Create appointment
  const appointmentDate = new Date(`${data.date}T${data.time}:00`);

  const { error: appointmentError } = await supabase.from('appointments').insert({
    lead_id: leadId,
    appointment_date: appointmentDate.toISOString(),
    type: data.type,
    vehicle_id: data.vehicleId || null,
    status: 'scheduled',
    dealer_id: 'richard-automotive',
  });

  if (appointmentError) throw new Error(appointmentError.message);

  // 3. Log message if provided
  if (data.message || data.vehicleInfo) {
    await supabase.from('conversations').insert({
      lead_id: leadId,
      message: data.message || data.vehicleInfo || '',
      direction: 'inbound',
      source: data.type === 'test-drive' ? 'test_drive_form' : 'service_form',
    }).maybeSingle();
  }

  return { leadId };
}
