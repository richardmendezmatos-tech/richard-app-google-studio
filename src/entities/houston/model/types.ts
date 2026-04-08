export interface HoustonMetric {
  label: string;
  value: number | string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
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
  recentEvents: Array<{
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source: string;
  }>;
}
