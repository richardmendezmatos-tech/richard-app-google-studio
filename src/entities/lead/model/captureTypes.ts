import { Lead } from './types';

/**
 * Data structures for various capture mechanisms in the Richard Automotive ecosystem.
 * Part of the Nivel 13 Structural Purity initiative.
 */

export interface ApplicationData extends Partial<Lead> {
  // Specific fields for credit applications if they differ from Lead
  ssn?: string;
  monthlyIncome?: number;
  employmentStatus?: string;
  residenceType?: string;
  rentOrMortgage?: number;
}

export interface SubscriberData {
  email: string;
  firstName?: string;
  source?: string;
}

export interface SurveyData {
  leadId?: string;
  rating: number;
  feedback?: string;
  category: 'service' | 'inventory' | 'pricing' | 'other';
  responses: Record<string, any>;
}
