import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export class SupabaseLoanRepository {
    private tableName = 'loan_applications';

    async save(data: any): Promise<void> {
        const supabase = createServerSupabaseClient();
        const { error } = await supabase.from(this.tableName).insert({
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
            created_at: new Date().toISOString()
        });
        if (error) throw error;
    }
}
