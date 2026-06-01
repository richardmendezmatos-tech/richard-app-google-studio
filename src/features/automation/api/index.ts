export * from './NotifyLeadStatusChange';
export * from './NotifyPriceDrop';
export * from './SendNotification';
export * from './SendLeadEmailSequence';
export * from './AutomateEmailSequences';
export * from './TriggerRetargeting';
export * from './EmailRepository';
export * from './SMSRepository';
export * from './WhatsAppRepository';

// Repository interfaces (re-exported from shared to keep feature barrel complete)
export type { EmailRepository, EmailOptions } from '@/shared/api/repositories/IEmailRepository';
export type { SMSRepository } from '@/shared/api/repositories/ISMSRepository';
export type { WhatsAppRepository, WhatsAppSequence, WhatsAppStage } from '@/shared/api/repositories/IWhatsAppRepository';
export * from './emailService';
export * from './whatsappAgentService';

// Repository interfaces (re-exported from other features)
export type { LeadRepository } from '@/shared/api/repositories/ILeadRepository';
