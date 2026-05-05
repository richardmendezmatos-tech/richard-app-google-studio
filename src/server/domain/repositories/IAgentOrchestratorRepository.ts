export interface AgentOrchestrator {
  orchestrate(input: {
    message: string;
    history: any[];
    leadContext: any;
    vehicleContext?: any;
    leadId?: string;
    metadata?: any;
    isWhatsApp?: boolean;
  }): Promise<{ response: string; metadata: any }>;
}
