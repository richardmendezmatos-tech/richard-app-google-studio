export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'engine' | 'battery' | 'fuel' | 'tire' | 'service';
  message: string;
  timestamp: number;
}

export interface VehicleHealthStatus {
  overallStatus: 'healthy' | 'warning' | 'critical';
  alerts: HealthAlert[];
  lastCheck: number;
}

export interface VehicleTelemetry {
  vehicleId: string;
  speed: number;
  rpm: number;
  fuelLevel: number;
  batteryVoltage: number;
  temp: number;
  location: {
    lat: number;
    lng: number;
  };
  lastUpdate: number;
  status: 'active' | 'idle' | 'warning';
}

export const analyzeVehicleHealth = (telemetry: VehicleTelemetry): VehicleHealthStatus => {
  const alerts: HealthAlert[] = [];
  let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (telemetry.temp > 105) {
    alerts.push({
      id: `temp-crit-${Date.now()}`,
      type: 'critical',
      category: 'engine',
      message: `Temperatura Crítica: ${telemetry.temp}°C. Detenga el vehículo inmediatamente.`,
      timestamp: Date.now(),
    });
    overallStatus = 'critical';
  } else if (telemetry.temp > 95) {
    alerts.push({
      id: `temp-warn-${Date.now()}`,
      type: 'warning',
      category: 'engine',
      message: `Temperatura Elevada: ${telemetry.temp}°C. Revise el sistema de enfriamiento.`,
      timestamp: Date.now(),
    });
    overallStatus = 'warning';
  }

  if (telemetry.batteryVoltage < 11.5) {
    alerts.push({
      id: `batt-crit-${Date.now()}`,
      type: 'critical',
      category: 'battery',
      message: `Voltaje de Batería Crítico: ${telemetry.batteryVoltage}V. Riesgo de fallo de arranque.`,
      timestamp: Date.now(),
    });
    overallStatus = 'critical';
  } else if (telemetry.batteryVoltage < 12.1) {
    alerts.push({
      id: `batt-warn-${Date.now()}`,
      type: 'warning',
      category: 'battery',
      message: `Batería Baja: ${telemetry.batteryVoltage}V. Se recomienda revisión.`,
      timestamp: Date.now(),
    });
    if (overallStatus !== 'critical') overallStatus = 'warning';
  }

  if (telemetry.fuelLevel < 10) {
    alerts.push({
      id: `fuel-crit-${Date.now()}`,
      type: 'critical',
      category: 'fuel',
      message: `Nivel de Combustible Crítico: ${telemetry.fuelLevel}%. Reposte inmediatamente.`,
      timestamp: Date.now(),
    });
    overallStatus = 'critical';
  } else if (telemetry.fuelLevel < 20) {
    alerts.push({
      id: `fuel-warn-${Date.now()}`,
      type: 'warning',
      category: 'fuel',
      message: `Nivel de Combustible Bajo: ${telemetry.fuelLevel}%.`,
      timestamp: Date.now(),
    });
    if (overallStatus !== 'critical') overallStatus = 'warning';
  }

  if (telemetry.rpm > 1200 && telemetry.speed === 0) {
    alerts.push({
      id: `rpm-warn-${Date.now()}`,
      type: 'warning',
      category: 'engine',
      message: `Ralentí Inestable detectado (${telemetry.rpm} RPM en parado).`,
      timestamp: Date.now(),
    });
    if (overallStatus !== 'critical') overallStatus = 'warning';
  }

  return {
    overallStatus,
    alerts,
    lastCheck: Date.now(),
  };
};
