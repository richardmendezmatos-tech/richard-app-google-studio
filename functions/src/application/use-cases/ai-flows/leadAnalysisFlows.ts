import { z } from 'genkit';
import { ai } from '../../../services/aiManager';
import { AnalyzeLead, AnalyzeLeadOutputSchema } from '../../use-cases';
import { FirestoreLeadRepository } from '../../../infrastructure/persistence/firestore/FirestoreLeadRepository';
import { FirestoreInventoryRepository } from '../../../infrastructure/persistence/firestore/FirestoreInventoryRepository';
import { GenkitAgentOrchestrator } from '../../../infrastructure/ai/GenkitAgentOrchestrator';
import { logFlowExecution } from '../../../services/persistenceService';

const leadRepository = new FirestoreLeadRepository();
const inventoryRepository = new FirestoreInventoryRepository();
const aiOrchestrator = new GenkitAgentOrchestrator();

export const analyzeLeadFlow = ai.defineFlow(
  {
    name: 'analyzeLead',
    inputSchema: z.object({
      monthlyIncome: z.string(),
      timeAtJob: z.string(),
      jobTitle: z.string(),
      employer: z.string(),
      vehicleId: z.string().optional(),
      hasPronto: z.boolean().optional(),
      chatInteractions: z.number().optional(),
      viewedInventoryMultipleTimes: z.boolean().optional(),
      location: z.string().optional(),
    }),
    outputSchema: AnalyzeLeadOutputSchema,
  },
  async (input) => {
    const useCase = new AnalyzeLead(inventoryRepository);
    const result = await useCase.execute(input);

    if (result.isFailure()) {
      throw new Error(result.error.message);
    }

    return result.value;
  },
);

export const chatWithLeadFlow = ai.defineFlow(
  {
    name: 'chatWithLead',
    inputSchema: z.object({
      leadId: z.string().optional(),
      message: z.string(),
      vehicleId: z.string().optional(),
      history: z.array(z.any()).optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
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
  },
);
