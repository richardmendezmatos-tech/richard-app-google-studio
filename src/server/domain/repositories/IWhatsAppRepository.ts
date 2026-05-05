export type WhatsAppStage = 'welcome' | 'qualification' | 'nurturing' | 'appointment_suggested' | 'closed';

export interface WhatsAppInteraction {
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

export interface WhatsAppSequence {
    leadId: string;
    currentStage: WhatsAppStage;
    lastInteraction: Date;
    isAutopilotEnabled: boolean;
    history: WhatsAppInteraction[];
    notes?: string;
}

export interface WhatsAppRepository {
    getSequence(leadId: string): Promise<WhatsAppSequence | null>;
    saveSequence(sequence: WhatsAppSequence): Promise<void>;
    updateStage(leadId: string, stage: WhatsAppStage): Promise<void>;
    sendMessage(to: string, message: string): Promise<boolean>;
}
