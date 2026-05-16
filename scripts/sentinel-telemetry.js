import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Telemetry skipped: Missing Supabase credentials.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function logDeployment() {
  const [,, status, duration, bqQueries] = process.argv;

  const payload = {
    event_type: 'SENTINEL_DEPLOY',
    status: status || 'UNKNOWN',
    metadata: {
      duration_ms: parseInt(duration) || 0,
      bq_queries_validated: parseInt(bqQueries) || 0,
      platform: 'Vercel Edge',
      timestamp: new Date().toISOString()
    }
  };

  try {
    const { error } = await supabase
      .from('audit_logs') // Reutilizando la tabla de auditoría existente
      .insert([
        {
          severity: status === 'SUCCESS' ? 'info' : 'error',
          action: 'PRODUCTION_DEPLOY',
          module: 'SENTINEL_CI',
          details: payload
        }
      ]);

    if (error) throw error;
    console.log('✅ Telemetry synchronized with Supabase.');
  } catch (err) {
    console.error('❌ Telemetry failed:', err.message);
  }
}

logDeployment();
