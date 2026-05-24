// API CRUD Client para Deals
// Capa: Entities - Slice: Deal
// Creado: 2026-05-24

import { supabase } from '@/shared/api/supabase/supabase';
import { Deal, DealStatus } from '../model/types';

export class DealApi {
  /**
   * Registra o guarda una estructuración de Deal en Supabase
   */
  static async createDeal(deal: Deal): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .insert({
        lead_id: deal.leadId,
        inventory_id: deal.inventoryId,
        credit_tier: deal.creditTier,
        down_payment: deal.downPayment,
        trade_in_value: deal.tradeInValue,
        trade_in_payoff: deal.tradeInPayoff,
        term: deal.term,
        apr: deal.apr,
        ltv: deal.ltv,
        estimated_monthly_payment: deal.estimatedMonthlyPayment,
        front_end_profit: deal.frontEndProfit,
        back_end_profit: deal.backEndProfit,
        bank_selected: deal.bankSelected,
        status: deal.status,
        structure_type: deal.structureType || 'conventional',
        residual_value: deal.residualValue || 0.00,
      })
      .select()
      .single();

    if (error) {
      console.error('[DealApi:createDeal] Error saving deal:', error);
      throw new Error(`Failed to save deal: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  /**
   * Obtiene todos los Deals asociados a un lead
   */
  static async getDealsByLeadId(leadId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[DealApi:getDealsByLeadId] Error fetching deals:', error);
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    return (data || []).map(d => this.mapToDomain(d));
  }

  /**
   * Obtiene un Deal por su ID único
   */
  static async getDealById(dealId: string): Promise<Deal | null> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .maybeSingle();

    if (error) {
      console.error('[DealApi:getDealById] Error fetching deal:', error);
      throw new Error(`Failed to fetch deal: ${error.message}`);
    }

    return data ? this.mapToDomain(data) : null;
  }

  /**
   * Actualiza el estado de un Deal (ej. 'structured' -> 'pending_approval')
   */
  static async updateDealStatus(dealId: string, status: DealStatus): Promise<void> {
    const { error } = await supabase
      .from('deals')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId);

    if (error) {
      console.error('[DealApi:updateDealStatus] Error updating status:', error);
      throw new Error(`Failed to update deal status: ${error.message}`);
    }
  }

  /**
   * Mapea los campos snake_case de la base de datos a camelCase del modelo de dominio
   */
  private static mapToDomain(db: any): Deal {
    return {
      id: db.id,
      leadId: db.lead_id,
      inventoryId: db.inventory_id,
      creditTier: db.credit_tier,
      downPayment: Number(db.down_payment),
      tradeInValue: Number(db.trade_in_value),
      tradeInPayoff: Number(db.trade_in_payoff),
      term: db.term as any,
      apr: Number(db.apr),
      ltv: Number(db.ltv),
      estimatedMonthlyPayment: Number(db.estimated_monthly_payment),
      frontEndProfit: Number(db.front_end_profit),
      backEndProfit: Number(db.back_end_profit),
      bankSelected: db.bank_selected,
      status: db.status,
      structureType: db.structure_type,
      residualValue: db.residual_value ? Number(db.residual_value) : undefined,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }
}
