import { NextResponse } from 'next/server';
import { twilioBackendService } from '@/shared/services/twilioService';

interface SmsLeadPayload {
  toParams: {
    phone: string;
    clientName: string;
    vehicleDesc: string;
  };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { toParams } = data as SmsLeadPayload;

    if (!toParams || !toParams.phone || !toParams.clientName) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (phone, clientName).' },
        { status: 400 },
      );
    }

    let formattedPhone = toParams.phone.replace(/[^0-9+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) formattedPhone = `+1${formattedPhone}`;
      else formattedPhone = `+${formattedPhone}`;
    }

    const vehicleStr = toParams.vehicleDesc || 'un vehículo de nuestro inventario';
    const body = `¡Lead Caliente! Richard Automotive: ${toParams.clientName} pre-aprobado para el ${vehicleStr}. Llama ahora: ${formattedPhone}`;

    const TO = process.env.ADMIN_PHONE_NUMBER || '+17875550000';

    const success = await twilioBackendService.sendSMS(TO, body);

    if (!success) {
      return NextResponse.json({ error: 'Error al enviar el SMS.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in Twilio API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
