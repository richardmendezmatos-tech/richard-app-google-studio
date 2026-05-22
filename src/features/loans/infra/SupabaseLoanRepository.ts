import { supabase } from '@/shared/api/supabase/supabase';

export class SupabaseLoanRepository {
  async save(data: any): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('loan_applications').insert({
      solicitante_id: data.solicitanteId,
      seguro_social: data.seguroSocial,
      telefono: data.telefono,
      monto: data.monto,
      apr: data.apr,
      termino_meses: data.terminoMeses,
      estado: data.estado,
      puntuacion_credito: data.puntuacionCredito,
      ingresos_mensuales: data.ingresosMensuales,
      resultado_aprobacion: data.resultadoAprobacion,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}
