import { useState, useEffect } from 'react';

export function useTelemetry(connectionState: string) {
  const [telemetry, setTelemetry] = useState({ latency: 0, quality: 100, packetLoss: 0 });

  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => {
        setTelemetry({
          latency: Math.floor(Math.random() * 20) + 40, // 40-60ms
          quality: Math.floor(Math.random() * 5) + 95, // 95-100%
          packetLoss: Math.random() > 0.9 ? 1 : 0,
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  return telemetry;
}
