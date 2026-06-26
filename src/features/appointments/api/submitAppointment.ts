import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

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
  const supabase = createServerSupabaseClient();
  if (!supabase) throw new Error('No database client available');

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
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        behavioral_metrics: {
          source: data.type === 'test-drive' ? 'web_test_drive' : 'web_service',
        },
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

  return { leadId };
}
