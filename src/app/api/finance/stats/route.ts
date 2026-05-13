import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { CONSTANTES_PR } from '@/entities/finance/lib/fiConstants';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // 1. Fetch Inventory for Yield Analysis
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('price, status')
      .eq('status', 'available');

    if (invError) throw invError;

    // 2. Fetch Leads for Bankability Analysis
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('credit_score, down_payment, vehicle_id');

    if (leadError) throw leadError;

    // 3. Calculate Metrics
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price || 0), 0);
    const avgInventoryPrice = inventory.length > 0 ? totalInventoryValue / inventory.length : 0;
    
    // Assume 12% profit margin for yield estimation if cost is not tracked
    const estimatedYield = avgInventoryPrice * 0.12;

    // Calculate Bankability (Credit Score > 640 as simple proxy)
    const bankableLeads = leads.filter(l => (l.credit_score || 0) >= 640).length;
    const bankabilityRate = leads.length > 0 ? (bankableLeads / leads.length) * 100 : 0;

    return NextResponse.json({
      success: true,
      stats: {
        inventoryYield: Math.round(estimatedYield),
        bankabilityRate: Math.round(bankabilityRate),
        avgInventoryPrice: Math.round(avgInventoryPrice),
        totalUnits: inventory.length,
        maxLtvLimit: CONSTANTES_PR.MAX_LTV_RATIO * 100
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [FinanceStatsAPI] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
