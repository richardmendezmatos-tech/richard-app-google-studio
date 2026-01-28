import axios from 'axios';

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
            const response = await axios.get<SystemHealth>(`${API_URL}/health`, {
                timeout: 2000 // Quick timeout to avoid blocking UI
            });
            return response.data;
        } catch (error) {
            console.error('Enterprise Core Unreachable:', error);
            return {
                status: 'DOWN',
                checks: {
                    database: 'UNKNOWN',
                    error: 'Connection Refused'
                }
            };
        }
    }
};
