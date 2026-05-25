import { getSupabase } from '@/shared/api/supabase/supabaseClient';

/**
 * SEOService (Sentinel N24)
 * Handles automatic discovery of inventory patterns to feed programmatic SEO.
 */
export const seoService = {
  /**
   * Discovers unique brands (makes) present in the inventory.
   */
  async getUniqueBrands(): Promise<string[]> {
    const sb = await getSupabase();
    if (!sb) return [];

    const { data, error } = await sb
      .from('inventory')
      .select('make')
      .not('make', 'is', null);

    if (error) {
      console.error('[SEOService] Error discovering brands:', error);
      return [];
    }

    // Filter unique values and normalize to lowercase for slugs
    const brands = Array.from(new Set(data.map((item: any) => item.make.toLowerCase()))) as string[];
    return brands.filter(Boolean);
  },

  /**
   * Discovers unique models for a specific brand.
   */
  async getUniqueModels(brandSlug: string): Promise<string[]> {
    const sb = await getSupabase();
    if (!sb) return [];

    const { data, error } = await sb
      .from('inventory')
      .select('model')
      .ilike('make', brandSlug)
      .not('model', 'is', null);

    if (error) {
      console.error(`[SEOService] Error discovering models for ${brandSlug}:`, error);
      return [];
    }

    const models = Array.from(new Set(data.map((item: any) => item.model.toLowerCase()))) as string[];
    return models.filter(Boolean);
  },

  /**
   * Discovers all brand-model combinations present in stock.
   */
  async getInventoryCombinations(): Promise<{ brand: string; model: string }[]> {
    const sb = await getSupabase();
    if (!sb) return [];

    const { data, error } = await sb
      .from('inventory')
      .select('make, model')
      .not('make', 'is', null)
      .not('model', 'is', null);

    if (error) {
      console.error('[SEOService] Error discovering combinations:', error);
      return [];
    }

    const combinations = new Map<string, { brand: string; model: string }>();
    
    data.forEach((item: any) => {
      const brand = item.make.toLowerCase();
      const model = item.model.toLowerCase();
      const key = `${brand}|${model}`;
      if (!combinations.has(key)) {
        combinations.set(key, { brand, model });
      }
    });

    return Array.from(combinations.values());
  }
};
