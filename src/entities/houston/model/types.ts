export interface HoustonMetric {
  label: string;
  value: number | string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export interface PurchaseOrder {
  id: string;
  query: string;
  recommendation: string;
  estimated_roi: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  status: 'draft' | 'confirmed' | 'archived';
  unit_type?: string;
  created_at: string;
  updated_at: string;
}

export interface HoustonTelemetry {
  systemHealth: 'online' | 'degraded' | 'offline';
  businessHealthScore: number;
  lastUpdate: number;
  latency: number;
  quality: number;
  metrics: {
    // Phase 1: AI & Performance (Legacy/Evolution)
    inferenceLatency: HoustonMetric;
    tokenUsage: HoustonMetric;
    autonomyRate: HoustonMetric;
    apiStability: HoustonMetric;
    
    structuralHealth: HoustonMetric;
    dbLatency: HoustonMetric;
    activeBreakers: HoustonMetric;
    resilienceIndex: HoustonMetric;

    // Nivel 14: Predictive Portfolio & Business Health
    leadVelocity: HoustonMetric;
    inventoryTurnover: HoustonMetric;
    closureProbability: HoustonMetric;

    // Nivel 15: Zero-Gravity Performance (RUM Sentinel)
    lcp: HoustonMetric;
    fid: HoustonMetric;
    cls: HoustonMetric;
  };

  // Nivel 15 Strategic Business Intelligence
  businessMetrics?: {
    hotLeads: Array<{
      id: string;
      name: string;
      score: number;
      priority: string;
      interest: string;
      factors: string[];
      timestamp: any;
    }>;
    searchGaps: Array<{
      query: string;
      count: number;
      last_searched: string;
    }>;
    whatsappStats: {
      sent: number;
      scheduled: number;
      failed: number;
    };
    summary: {
      leads_last_24h: number;
      avg_score: number;
      inventory_coverage: number;
    };
    purchaseOrders: PurchaseOrder[];
  };

  recentEvents: Array<{
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source: string;
  }>;
}
