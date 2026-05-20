import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export interface Appointment {
  id: string;
  leadId: string;
  vehicleId?: string;
  date: Date;
  status: 'scheduled' | 'cancelled' | 'completed';
  dealerId: string;
  type: 'test-drive' | 'closing' | 'service';
}

export class AppointmentService {
  private tableName = 'appointments';

  async schedule(data: {
    leadId: string;
    date: Date;
    type: Appointment['type'];
    vehicleId?: string;
  }): Promise<string> {
    const supabase = createServerSupabaseClient();
    const { data: record, error } = await supabase
      .from(this.tableName)
      .insert({
        lead_id: data.leadId,
        appointment_date: data.date.toISOString(),
        type: data.type,
        vehicle_id: data.vehicleId,
        status: 'scheduled',
        dealer_id: 'richard-automotive',
      })
      .select('id')
      .single();

    if (error) throw error;
    return record.id;
  }

  async getLeadAppointments(leadId: string): Promise<Appointment[]> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('lead_id', leadId)
      .order('appointment_date', { ascending: false });

    if (error) return [];
    return (data || []).map((doc: any) => ({
      id: doc.id,
      leadId: doc.lead_id,
      vehicleId: doc.vehicle_id,
      date: new Date(doc.appointment_date),
      status: doc.status,
      dealerId: doc.dealer_id,
      type: doc.type,
    }));
  }
}

export const appointmentService = new AppointmentService();
