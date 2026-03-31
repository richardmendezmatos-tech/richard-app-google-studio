import { useState, useEffect } from 'react';

export interface HoustonTelemetry {
  // Technical Metrics (Nivel 13)
  latency: number;
  quality: number;
  packetLoss: number;
  securityScore: number;

  // Business Health Metrics (Nivel 14: Orquestación Predictiva)
  leadVelocity: number; // Leads per hour
  inventoryTurnover: number; // Days to sell (predictive)
  closureProbability: number; // 0-100 (Aggregate)
  businessHealthScore: number; // 0-100 (Synthetic)

  status: 'optimal' | 'warning' | 'critical';
}

/**
 * Advanced Telemetry Hook for Houston Command Center.
 * Evolution to Nivel 14: Predictive Business Intelligence.
 */
export function useTelemetry(connectionState: string): HoustonTelemetry {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry>({
    latency: 0,
    quality: 100,
    packetLoss: 0,
    securityScore: 100,
    leadVelocity: 0,
    inventoryTurnover: 45,
    closureProbability: 0,
    businessHealthScore: 100,
    status: 'optimal',
  });

  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => {
        // Technical
        const latency = Math.floor(Math.random() * 10) + 30; // 30-40ms (Ultra-Premium)
        const quality = 100;
        const packetLoss = 0;
        const securityScore = 100;

        // Business (Nivel 14 Mocks - to be connected to Firestore aggregation)
        const leadVelocity = parseFloat((Math.random() * 2 + 1.5).toFixed(1)); // 1.5 - 3.5 LPH
        const inventoryTurnover = Math.floor(Math.random() * 5) + 32; // 32-37 days
        const closureProbability = Math.floor(Math.random() * 10) + 75; // 75-85%
        const businessHealthScore = Math.floor((leadVelocity / 4) * 50 + (closureProbability / 100) * 50);

        const status = businessHealthScore < 60 ? 'warning' : 'optimal';

        setTelemetry({
          latency,
          quality,
          packetLoss,
          securityScore,
          leadVelocity,
          inventoryTurnover,
          closureProbability,
          businessHealthScore,
          status,
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  return telemetry;
}
