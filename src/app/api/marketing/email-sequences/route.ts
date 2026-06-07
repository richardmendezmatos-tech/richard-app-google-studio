import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const SEQUENCE_STEPS = [
  { key: 'welcome1SentAt', label: 'Welcome 1', series: 'Bienvenida', timing: 'Inmediato', desc: 'Confirmación de recepción' },
  { key: 'welcome2SentAt', label: 'Welcome 2', series: 'Bienvenida', timing: 'Día 1', desc: 'Presentación + credenciales' },
  { key: 'welcome3SentAt', label: 'Welcome 3', series: 'Bienvenida', timing: 'Día 3', desc: 'Caso de éxito similar' },
  { key: 'welcome4SentAt', label: 'Welcome 4', series: 'Bienvenida', timing: 'Día 5', desc: 'Recordatorio + urgencia' },
  { key: 'reengagement1SentAt', label: 'Re-Engagement 1', series: 'Re-Compromiso', timing: 'Día 30', desc: 'Check-in amigable' },
  { key: 'reengagement2SentAt', label: 'Re-Engagement 2', series: 'Re-Compromiso', timing: '+3 días', desc: 'Incentivo especial' },
  { key: 'reengagement3SentAt', label: 'Re-Engagement 3', series: 'Re-Compromiso', timing: '+7 días', desc: 'Última oportunidad' },
  { key: 'postAppointment1SentAt', label: 'Post-Cita 1', series: 'Post-Cita', timing: 'Inmediato', desc: 'Agradecimiento + próximos pasos' },
  { key: 'postAppointment2SentAt', label: 'Post-Cita 2', series: 'Post-Cita', timing: 'Día 1', desc: 'Recordatorio de documentos' },
  { key: 'postAppointment3SentAt', label: 'Post-Cita 3', series: 'Post-Cita', timing: 'Día 7', desc: 'Follow-up si no cierra' },
];

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ sequences: [], leadSequences: [], totalLeads: 0 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('id, first_name, last_name, email, email_sequence, created_at, status, phone')
      .not('email_sequence', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);

    const allLeads = (leads || []).map((l: any) => ({
      id: l.id,
      name: `${l.first_name || ''} ${l.last_name || ''}`.trim(),
      email: l.email || '',
      phone: l.phone || '',
      status: l.status || 'new',
      createdAt: l.created_at,
      emailSequence: l.email_sequence || {},
    }));

    const sequences = SEQUENCE_STEPS.map((step) => {
      const recipients = allLeads.filter((l: any) => l.emailSequence[step.key]);
      return {
        ...step,
        totalSent: recipients.length,
        lastSent: recipients.length
          ? recipients.reduce((latest: string, l: any) => {
              const d = l.emailSequence[step.key];
              return !latest || d > latest ? d : latest;
            }, '')
          : null,
        recentRecipients: recipients.slice(0, 5).map((l: any) => ({
          id: l.id,
          name: l.name,
          email: l.email,
          sentAt: l.emailSequence[step.key],
        })),
      };
    });

    const totalWithEmail = allLeads.filter((l: any) => l.email).length;
    const totalOptedIn = allLeads.length;

    return NextResponse.json({
      sequences,
      leadSequences: allLeads,
      totalLeads: totalOptedIn,
      totalWithEmail,
      sequenceDefinitions: SEQUENCE_STEPS,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error: any) {
    console.error('[Email Sequences API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
