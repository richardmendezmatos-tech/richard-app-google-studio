/**
 * Richard Automotive Sentinel: Circuit Breaker Pattern (Level 13 Resilience)
 * Propósito: Prevenir fallos en cascada y habilitar el auto-healing proactivo.
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number; // ms
  monitorInterval?: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastError: Error | null = null;
  private nextAttempt: number = 0;
  private name: string;

  constructor(
    private config: CircuitBreakerConfig = { failureThreshold: 5, resetTimeout: 30000 },
    name: string = 'Anonymous'
  ) {
    this.name = name;
  }

  private onStateChange?: (state: CircuitState, name: string) => void;

  public setObserver(callback: (state: CircuitState, name: string) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Ejecuta una función protegida por el breaker.
   */
  async fire<T>(action: () => Promise<T>, fallback?: (error: any) => T | Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttempt) {
        console.log(`[Sentinel:Resilience:${this.name}] Intentando transición a HALF_OPEN...`);
        this.updateState(CircuitState.HALF_OPEN);
      } else {
        if (fallback) return fallback(this.lastError || new Error('Circuit is OPEN'));
        throw new Error(`Circuit is OPEN (${this.name}). Next attempt in ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`);
      }
    }

    try {
      const result = await action();
      this.success();
      return result;
    } catch (error: any) {
      this.failure(error);
      if (fallback) return fallback(error);
      throw error;
    }
  }

  private updateState(newState: CircuitState): void {
    if (this.state !== newState) {
      this.state = newState;
      if (this.onStateChange) this.onStateChange(newState, this.name);
    }
  }

  private success(): void {
    this.failureCount = 0;
    this.lastError = null;
    this.updateState(CircuitState.CLOSED);
  }

  private failure(error: Error): void {
    this.failureCount++;
    this.lastError = error;

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.config.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    console.warn(`[Sentinel:Resilience:${this.name}] Circuit OPENED after ${this.failureCount} failures.`);
    this.updateState(CircuitState.OPEN);
    this.nextAttempt = Date.now() + this.config.resetTimeout;
  }

  public getState(): CircuitState {
    return this.state;
  }
}
