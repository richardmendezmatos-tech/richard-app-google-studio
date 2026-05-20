import fs from 'node:fs';
import path from 'node:path';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

const WORKSPACE_DIR = path.join(__dirname, '../../../workspace');

export interface CheckpointData {
  id: string;
  fecha: string;
  categoria: string;
  titulo: string;
  resumen: string;
  estatus: string;
  datos?: any;
  eficiencia_estimada_Ew?: number;
}

/**
 * Automates the "Workspace Manager" protocol by saving a checkpoint to the local filesystem.
 */
export async function saveCheckpoint(data: CheckpointData): Promise<string> {
  try {
    if (!fs.existsSync(WORKSPACE_DIR)) {
      fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
    }

    const fileName = `${data.fecha}_${data.categoria}_${data.id}.json`;
    const filePath = path.join(WORKSPACE_DIR, fileName);

    const structuredData = {
      ...data,
      autor: 'Antigravity (Workspace Manager)',
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(structuredData, null, 4));
    console.log(`✅ Checkpoint saved: ${fileName}`);

    // Sync to Supabase for cloud redundancy
    try {
      const supabase = createServerSupabaseClient();
      await supabase.from('checkpoints').upsert([structuredData]);
    } catch (dbError) {
      console.error('⚠️ Failed to sync checkpoint to Supabase:', dbError);
    }

    return filePath;
  } catch (error) {
    console.error('❌ Failed to save checkpoint:', error);
    throw error;
  }
}

/**
 * Convenience wrapper for AI flows to log their execution state.
 */
export async function logFlowExecution(
  flowName: string,
  input: any,
  output: any,
  status: string = 'COMPLETED',
) {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const fecha = new Date().toISOString().split('T')[0];

  await saveCheckpoint({
    id,
    fecha,
    categoria: 'AI_FLOW_EXECUTION',
    titulo: `Execution of ${flowName}`,
    resumen: `Automated checkpoint for flow ${flowName} execution.`,
    estatus: status,
    datos: {
      flowName,
      input,
      output,
    },
    eficiencia_estimada_Ew: 0.98,
  });
}
