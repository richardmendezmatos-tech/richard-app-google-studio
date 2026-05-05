import { z } from 'zod';
import { ai } from '../../../services/aiManager';
import { AnalyzeLead, AnalyzeLeadOutputSchema } from '../../use-cases';
import { FirestoreLeadRepository } from '../../../infrastructure/persistence/firestore/FirestoreLeadRepository';
import { FirestoreInventoryRepository } from '../../../infrastructure/persistence/firestore/FirestoreInventoryRepository';
import { GenkitAgentOrchestrator } from '../../../infrastructure/ai/GenkitAgentOrchestrator';
import { logFlowExecution } from '../../../services/persistenceService';

const leadRepository = new FirestoreLeadRepository();
const inventoryRepository = new FirestoreInventoryRepository();
const aiOrchestrator = new GenkitAgentOrchestrator();

export const analyzeLeadFlow = async (input: {
  monthlyIncome: string;
  timeAtJob: string;
  jobTitle: string;
  employer: string;
  vehicleId?: string;
  hasPronto?: boolean;
  chatInteractions?: number;
  viewedInventoryMultipleTimes?: boolean;
  location?: string;
}) => {
  const useCase = new AnalyzeLead(inventoryRepository);
  const result = await useCase.execute(input);

  if (result.isFailure()) {
    throw new Error(result.error.message);
  }

  return result.value;
};

export const chatWithLeadFlow = async (input: {
  leadId?: string;
  message: string;
  vehicleId?: string;
  history?: any[];
}) => {
  let leadContext = {};
  if (input.leadId) {
    const leadData = await leadRepository.getById(input.leadId);
    leadContext = leadData || {};
  }
  let vehicleContext = null;
  if (input.vehicleId) {
    vehicleContext = await inventoryRepository.getById(input.vehicleId);
  }
  const result = await aiOrchestrator.orchestrate({
    message: input.message,
    history: input.history || [],
    leadContext,
    vehicleContext,
    leadId: input.leadId,
  });
  await logFlowExecution('chatWithLead', input, result.response);
  return result.response;
};
