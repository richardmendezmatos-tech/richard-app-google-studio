import { NextResponse } from 'next/server';
import { submitAppointment, AppointmentInput } from '@/features/appointments/api/submitAppointment';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body: AppointmentInput = await request.json();

    if (!body.name || !body.email || !body.phone || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, email, phone, date, time' },
        { status: 400 },
      );
    }

    if (!['test-drive', 'service'].includes(body.type)) {
      return NextResponse.json({ error: 'Tipo de cita inválido' }, { status: 400 });
    }

    const result = await submitAppointment(body);

    return NextResponse.json({ success: true, leadId: result.leadId }, { status: 201 });
  } catch (error: any) {
    console.error('[Appointments API] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
