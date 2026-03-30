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
    inferenceLatency: HoustonMetric;
    tokenUsage: HoustonMetric;
    autonomyRate: HoustonMetric;
    apiStability: HoustonMetric;
  };
  recentEvents: Array<{
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error';
    message: string;
    source: string;
  }>;
}
