// Enterprise System Health Service (Native fetch implementation)

// Enterprise Backend Endpoint (Java Spring/HttpServer)
const API_URL = 'http://localhost:8100';

export interface SystemHealth {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  checks: {
    database: string;
    [key: string]: string;
  };
}

export const enterpriseService = {
  /**
   * Checks the health of the Enterprise Java Backend.
   */
  getSystemHealth: async (): Promise<SystemHealth> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Enterprise Core Unreachable:', error);
      return {
        status: 'DOWN',
        checks: {
          database: 'UNKNOWN',
          error: 'Connection Refused',
        },
      };
    }
  },
};
