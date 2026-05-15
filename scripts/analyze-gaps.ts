import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function analyzeGaps() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: gaps, error } = await supabase
    .from('search_gaps')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching gaps:', error);
    return;
  }

  console.log('--- SENTINEL SEARCH GAP ANALYSIS ---');
  if (!gaps || gaps.length === 0) {
    console.log('No gaps detected in the last cycle.');
    return;
  }

  const frequency: Record<string, number> = {};
  gaps.forEach(gap => {
    const key = `${gap.query} (${gap.category || 'General'})`;
    frequency[key] = (frequency[key] || 0) + 1;
  });

  const topGaps = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  console.log('TOP 5 SEARCH GAPS (UNITS NOT IN INVENTORY):');
  topGaps.forEach(([query, count]) => {
    console.log(`- ${query}: ${count} búsquedas fallidas`);
  });
}

analyzeGaps();
