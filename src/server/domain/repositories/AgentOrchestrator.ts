export interface AgentOrchestrator {
    orchestrate(input: {
        message: string;
        history: any[];
        leadContext: any;
        vehicleContext?: any;
        leadId?: string;
    }): Promise<{ response: string; metadata: any }>;
}
