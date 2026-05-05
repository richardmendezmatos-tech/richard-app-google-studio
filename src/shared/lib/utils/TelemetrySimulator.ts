import { updateVehicleTelemetry } from '@/shared/api/metrics/telemetryService';
import { VehicleTelemetry } from '@/shared/types/types';

export class TelemetrySimulator {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private vehicleId: string;
  private currentData: VehicleTelemetry;

  constructor(vehicleId: string) {
    this.vehicleId = vehicleId;
    this.currentData = {
      vehicleId,
      speed: 0,
      rpm: 800,
      fuelLevel: 85,
      batteryVoltage: 14.1,
      temp: 92,
      location: { lat: 18.4861, lng: -69.9312 }, // Santo Domingo (Richard Automotive HQ)
      lastUpdate: Date.now(),
      status: 'active',
    };
  }

  start() {
    if (this.intervalId) return;

    const startTime = Date.now();
    const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutos de simulación máxima

    this.intervalId = setInterval(() => {
      // Auto-shutdown para evitar costos en la nube
      if (Date.now() - startTime > MAX_DURATION_MS) {
        console.warn('Telemetry Simulator auto-shutdown reached to prevent cloud cost leaks.');
        this.stop();
        return;
      }

      // Logic for realistic variation
      const acceleration = Math.random() * 4 - 2; // -2 to +2
      this.currentData.speed = Math.max(0, Math.min(120, this.currentData.speed + acceleration));

      // RPM follows speed roughly
      this.currentData.rpm = 800 + this.currentData.speed * 45 + (Math.random() * 50 - 25);

      // Slow fuel consumption
      this.currentData.fuelLevel = Math.max(0, this.currentData.fuelLevel - 0.001);

      // Temperature stability
      this.currentData.temp = 92 + (Math.random() * 0.4 - 0.2);

      // Moving GPS coordinate
      this.currentData.location.lat += Math.random() * 0.00004 - 0.00002;
      this.currentData.location.lng += Math.random() * 0.00004 - 0.00002;

      this.currentData.lastUpdate = Date.now();

      updateVehicleTelemetry(this.currentData).catch((err) => {
        console.warn('Simulator push failed:', err);
      });
    }, 5000); // Incrementado de 1000ms a 5000ms para reducir escrituras en Firebase
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getCurrentData() {
    return this.currentData;
  }
}
