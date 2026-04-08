export interface HoustonMetric {
  label: string;
  value: number | string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export interface HoustonTelemetry {
  systemHealth: 'online' | 'degraded' | 'offline';
  lastUpdate: number;
  metrics: {
    // Phase 1: AI & Performance (Legacy/Evolution)
    inferenceLatency: HoustonMetric;
    tokenUsage: HoustonMetric;
    autonomyRate: HoustonMetric;
    apiStability: HoustonMetric;
    
    // Nivel 13: Structural Purity & Resilience
    structuralHealth: HoustonMetric;
    dbLatency: HoustonMetric;
    activeBreakers: HoustonMetric;
    resilienceIndex: HoustonMetric;
  };
  recentEvents: Array<{
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source: string;
  }>;
}
